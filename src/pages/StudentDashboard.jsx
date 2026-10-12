
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";

import ProfileLink from "../components/ProfileLink";
import { auth, db, functions } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";
import "./StudentDashboard.css";

// Separate callable definitions.
// The third argument of httpsCallable is for options,
// not for another function name.
const getRecentContentProgress = httpsCallable(
  functions,
  "getRecentContentProgress"
);

const getPurchasedProgram = httpsCallable(
  functions,
  "getPurchasedProgram"
);

const leaveClass = httpsCallable(
  functions,
  "leaveClass"
);

const badges = [
  {
    id: "digitalExplorer",
    icon: "✨",
    en: "Digital Explorer",
    ar: "مستكشف رقمي",
    he: "חוקר דיגיטלי",
  },
  {
    id: "bugHunter",
    icon: "🐞",
    en: "Bug Hunter",
    ar: "صياد الأخطاء",
    he: "צייד באגים",
  },
  {
    id: "patternHunter",
    icon: "🧩",
    en: "Pattern Hunter",
    ar: "صياد الأنماط",
    he: "צייד תבניות",
  },
  {
    id: "algorithmExplorer",
    icon: "🧠",
    en: "Algorithm Explorer",
    ar: "مستكشف الخوارزميات",
    he: "חוקר אלגוריתמים",
  },
];

function timestampOf(record = {}) {
  const value =
    record.updatedAt ??
    record.lastUpdatedAt ??
    record.savedAt ??
    record.createdAt ??
    0;

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Date.parse(value) || 0;
  }

  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value?.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}

function validId(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    !value.includes("/")
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState([]);
  const [missions, setMissions] = useState([]);

  const [programResume, setProgramResume] =
    useState(null);

  const [missionsLoading, setMissionsLoading] =
    useState(true);

  const [resumeLoading, setResumeLoading] =
    useState(true);

  const text = (en, ar, he) =>
    language === "ar"
      ? ar
      : language === "he"
        ? he
        : en;

  const isRTL =
    language === "ar" || language === "he";

  const localized = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    return (
      value[language] ||
      value.en ||
      value.ar ||
      value.he ||
      ""
    );
  };

  // =========================================
  // LOAD DASHBOARD
  // =========================================

  useEffect(() => {
    let cancelled = false;

    async function loadClassesAndMissions(studentId) {
      try {
        const membershipSnapshot = await getDocs(
          query(
            collection(db, "classMembers"),
            where("studentId", "==", studentId),
            where("status", "==", "active")
          )
        );

        if (cancelled) return;

        const classIds = [
          ...new Set(
            membershipSnapshot.docs
              .map((item) => item.data().classId)
              .filter(validId)
          ),
        ];

        if (!classIds.length) {
          setClasses([]);
          setMissions([]);
          return;
        }

        // Load classes and missions independently
        // from progress. Progress errors should not
        // hide the student's lessons.
        const [classResults, missionResults] =
          await Promise.all([
            Promise.allSettled(
              classIds.map((id) =>
                getDoc(doc(db, "classes", id))
              )
            ),
            Promise.allSettled(
              classIds.map((id) =>
                getDocs(
                  query(
                    collection(db, "lessons"),
                    where("classId", "==", id),
                    where("status", "==", "published"),
                    where("activityType", "==", "mission")
                  )
                )
              )
            ),
          ]);

        if (cancelled) return;

        const classData = classResults
          .filter(
            (result) =>
              result.status === "fulfilled" &&
              result.value.exists()
          )
          .map((result) => ({
            id: result.value.id,
            ...result.value.data(),
          }));

        setClasses(classData);

        const lessonMap = new Map();

        missionResults.forEach((result) => {
          if (result.status !== "fulfilled") {
            console.error(
              "Mission query failed:",
              result.reason
            );
            return;
          }

          result.value.docs.forEach((item) => {
            lessonMap.set(item.id, {
              id: item.id,
              ...item.data(),
            });
          });
        });

        const lessons = [...lessonMap.values()].sort(
          (a, b) =>
            timestampOf(a) - timestampOf(b) ||
            String(a.id).localeCompare(
              String(b.id)
            )
        );

        if (!lessons.length) {
          setMissions([]);
          return;
        }

        const progressMap = new Map();
        const completedIds = new Set();

        // Use the student's scoped queries first.
        // If the server rejects a list query,
        // fall back to the known mission documents.
        const [progressQuery, completionQuery] =
          await Promise.allSettled([
            getDocs(
              query(
                collection(db, "lessonProgress"),
                where("studentId", "==", studentId)
              )
            ),
            getDocs(
              query(
                collection(db, "lessonCompletions"),
                where("studentId", "==", studentId)
              )
            ),
          ]);

        if (cancelled) return;

        if (progressQuery.status === "fulfilled") {
          progressQuery.value.docs.forEach((item) => {
            const lessonId = item.data().lessonId;

            if (lessonId) {
              progressMap.set(
                lessonId,
                item.data()
              );
            }
          });
        } else {
          console.warn(
            "Student progress list unavailable; using mission IDs:",
            progressQuery.reason
          );

          const results = await Promise.allSettled(
            lessons.map((lesson) =>
              getDoc(
                doc(
                  db,
                  "lessonProgress",
                  `${studentId}_${lesson.id}`
                )
              )
            )
          );

          if (cancelled) return;

          results.forEach((result, index) => {
            if (
              result.status === "fulfilled" &&
              result.value.exists()
            ) {
              progressMap.set(
                lessons[index].id,
                result.value.data()
              );
            }
          });
        }

        if (completionQuery.status === "fulfilled") {
          completionQuery.value.docs.forEach((item) => {
            const lessonId = item.data().lessonId;

            if (lessonId) {
              completedIds.add(lessonId);
            }
          });
        } else {
          console.warn(
            "Student completions list unavailable; using mission IDs:",
            completionQuery.reason
          );

          const results = await Promise.allSettled(
            lessons.map((lesson) =>
              getDoc(
                doc(
                  db,
                  "lessonCompletions",
                  `${studentId}_${lesson.id}`
                )
              )
            )
          );

          if (cancelled) return;

          results.forEach((result, index) => {
            if (
              result.status === "fulfilled" &&
              result.value.exists()
            ) {
              completedIds.add(
                lessons[index].id
              );
            }
          });
        }

        let previousCompleted = true;

        const missionData = lessons.map((lesson) => {
          const savedProgress =
            progressMap.get(lesson.id);

          const screens =
            savedProgress?.mission?.screens;

          const totalScreens =
            Array.isArray(lesson.sections)
              ? lesson.sections.length
              : 0;

          const passedScreens =
            screens && typeof screens === "object"
              ? Object.values(screens).filter(
                  (screen) => screen?.passed
                ).length
              : 0;

          const completed =
            completedIds.has(lesson.id);

          const status = completed
            ? "completed"
            : previousCompleted
              ? savedProgress
                ? "active"
                : "unlocked"
              : "locked";

          previousCompleted = completed;

          return {
            id: lesson.id,
            title:
              lesson.titleI18n ||
              lesson.title ||
              {},
            summary:
              lesson.summaryI18n ||
              lesson.summary ||
              {},
            xpReward: Number(
              lesson.xpReward || 0
            ),
            completed,
            started: Boolean(savedProgress),
            percent: completed
              ? 100
              : totalScreens
                ? Math.min(
                    100,
                    Math.round(
                      (passedScreens / totalScreens) *
                        100
                    )
                  )
                : 0,
            updatedAt:
              timestampOf(savedProgress),
            status,
          };
        });

        if (!cancelled) {
          setMissions(missionData);
        }
      } catch (error) {
        console.error(
          "Student dashboard classes and missions error:",
          error
        );
      } finally {
        if (!cancelled) {
          setMissionsLoading(false);
        }
      }
    }

    // =========================================
    // RESUME PROGRAM CONTENT
    // =========================================

    async function loadProgramResume() {
      try {
        const response =
          await getRecentContentProgress({});

        if (cancelled) return;

        const records = Array.isArray(
          response.data?.progress
        )
          ? response.data.progress
          : [];

        const sorted = [...records].sort(
          (a, b) =>
            timestampOf(b) -
            timestampOf(a)
        );

        // Cache server decisions during this request.
        const checkedPrograms = new Map();

        for (const record of sorted) {
          if (cancelled) return;

          const programId =
            record?.programId;

          const contentId =
            record?.contentId;

          if (
            !validId(programId) ||
            !validId(contentId) ||
            record.status !== "in_progress"
          ) {
            continue;
          }

          let programResult =
            checkedPrograms.get(programId);

          if (!programResult) {
            try {
              // Use server-calculated lesson-level
              // permissions, including selected grants
              // and preview restrictions.
              const result =
                await getPurchasedProgram({
                  programId,
                });

              const data =
                result.data || {};

              programResult = {
                program: data.program || null,
                lessons: Array.isArray(
                  data.lessons
                )
                  ? data.lessons
                  : [],
              };
            } catch (error) {
              console.warn(
                "Resume access check failed:",
                programId,
                error
              );

              programResult = {
                program: null,
                lessons: [],
              };
            }

            checkedPrograms.set(
              programId,
              programResult
            );
          }

          if (cancelled) return;

          // An existing bookmark NEVER grants access.
          // A selected-access lesson must be unlocked.
          const allowedLesson =
            programResult.lessons.find(
              (lesson) =>
                lesson.id === contentId &&
                lesson.locked === false &&
                lesson.previewOnly !== true
            );

          if (!allowedLesson) {
            continue;
          }

          if (cancelled) return;

          setProgramResume({
            ...record,
            programTitle:
              programResult.program?.titleI18n ||
              programResult.program?.title ||
              "",
          });

          return;
        }

        if (!cancelled) {
          setProgramResume(null);
        }
      } catch (error) {
        console.error(
          "Dashboard recent progress error:",
          error
        );

        if (!cancelled) {
          setProgramResume(null);
        }
      } finally {
        if (!cancelled) {
          setResumeLoading(false);
        }
      }
    }

    // =========================================
    // INITIALIZE STUDENT
    // =========================================

    async function initialize() {
      try {
        await auth.authStateReady();

        if (cancelled) return;

        const user = auth.currentUser;

        if (!user) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        const studentId = user.uid;

        const snapshot = await getDoc(
          doc(db, "users", studentId)
        );

        if (cancelled) return;

        if (!snapshot.exists()) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        const data = snapshot.data();

        if (data.role !== "student") {
          navigate(
            data.role === "teacher"
              ? "/teacher"
              : data.role === "owner"
                ? "/owner"
                : "/login",
            { replace: true }
          );
          return;
        }

        if (
          (data.accountStatus || "active") !==
          "active"
        ) {
          await signOut(auth);

          if (!cancelled) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        setStudent(data);
        setLoading(false);

        // Independent loading.
        void loadClassesAndMissions(studentId);
        void loadProgramResume();
      } catch (error) {
        console.error(
          "Student dashboard initialization error:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // =========================================
  // ACTIONS
  // =========================================

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Student logout error:",
        error
      );
    }
  }

  async function handleLeaveClass(classId) {
    try {
      await leaveClass({ classId });

      setClasses((previous) =>
        previous.filter(
          (item) => item.id !== classId
        )
      );

      // Avoid displaying stale assignments.
      // A reload can refresh missions belonging
      // to the student's remaining classes.
      setMissions([]);
    } catch (error) {
      console.error(
        "Leave class error:",
        error
      );
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div
        className="student-loading"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div>✨</div>
        <p>
          {text(
            "Loading your learning world...",
            "جارٍ تحميل عالمك التعليمي...",
            "טוען את עולם הלמידה שלך..."
          )}
        </p>
      </div>
    );
  }

  if (!student) return null;

  // =========================================
  // XP AND PROGRESS
  // =========================================

  const xp = Number(student.xp || 0);
  const level = Math.floor(xp / 500) + 1;
  const xpIntoLevel = xp % 500;
  const xpNeeded = 500;

  const progress = Math.min(
    100,
    Math.round(
      (xpIntoLevel / xpNeeded) * 100
    )
  );

  const currentMission =
    missions.find(
      (mission) =>
        mission.status === "active"
    ) ||
    missions.find(
      (mission) =>
        mission.status === "unlocked"
    );

  const allMissionsCompleted =
    missions.length > 0 &&
    missions.every(
      (mission) => mission.completed
    );

  const completedCount =
    missions.filter(
      (mission) => mission.completed
    ).length;

  // =========================================
  // PAGE
  // =========================================

  return (
    <div
      className="student-dashboard"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* TOPBAR */}
      <header className="student-topbar">
        <div className="student-brand">
          <div>✨</div>
          <h2>TechMinds</h2>
        </div>

        <div className="student-top-actions">
          <div className="student-language">
            {[
              { id: "en", label: "EN" },
              { id: "ar", label: "عربي" },
              { id: "he", label: "עברית" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  language === item.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  changeLanguage(item.id)
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <ProfileLink />

          <button
            type="button"
            className="student-logout"
            onClick={handleLogout}
          >
            🚪{" "}
            {text(
              "Logout",
              "تسجيل الخروج",
              "התנתקות"
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="student-hero">
        <div className="student-hero-text">
          <span className="student-hello">
            👋{" "}
            {text(
              "Welcome back",
              "أهلًا بعودتك",
              "ברוכים השבים"
            )}
          </span>

          <h1>
            {text(
              "Hi",
              "أهلًا",
              "שלום"
            )}{" "}
            {student.name ||
              text(
                "Student",
                "طالب",
                "תלמיד"
              )}{" "}
            👋
          </h1>

          <p>
            {text(
              "Every mission you finish makes you a stronger thinker.",
              "كل مهمة تنهيها تجعلك مفكرًا أقوى.",
              "כל משימה שתשלימו הופכת אתכם לחושבים חזקים יותר."
            )}
          </p>

          <div className="hero-meta-row">
            <span className="hero-chip">
              ⭐{" "}
              {text(
                "Level",
                "المستوى",
                "רמה"
              )}{" "}
              {level}
            </span>

            <span className="hero-chip">
              ⚡ {xp} XP
            </span>
          </div>

          <div className="student-progress-bar hero-progress-bar">
            <div
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <small className="hero-progress-label">
            {xpIntoLevel} / {xpNeeded} XP{" "}
            {text(
              "to level",
              "لبلوغ المستوى",
              "לרמה"
            )}{" "}
            {level + 1}
          </small>
        </div>

        <div className="student-avatar-large">
          🧑‍💻
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="marketplace-feature-card">
        <div className="marketplace-feature-content">
          <span className="marketplace-feature-badge">
            ✨{" "}
            {text(
              "PROGRAMS MARKETPLACE",
              "سوق البرامج",
              "שוק התוכניות"
            )}
          </span>

          <h2>
            {text(
              "Discover New Programs",
              "اكتشف برامج جديدة",
              "גלו תוכניות חדשות"
            )}
          </h2>

          <p>
            {text(
              "Explore interactive learning programs.",
              "استكشف البرامج التعليمية التفاعلية.",
              "גלו תוכניות לימוד אינטראקטיביות."
            )}
          </p>

          <button
            type="button"
            className="marketplace-feature-button"
            onClick={() =>
              navigate("/student/programs")
            }
          >
            {text(
              "Explore Programs",
              "استكشف البرامج",
              "גלו תוכניות"
            )}
          </button>
        </div>

        <div
          className="marketplace-feature-visual"
          aria-hidden="true"
        >
          <span>✨</span>
        </div>
      </section>

      {/* CURRENT MISSION */}
      <section className="mission-cta-card">
        {missionsLoading ? (
          <p className="mission-cta-teaser">
            {text(
              "Loading your missions...",
              "جارٍ تحميل مهماتك...",
              "טוען את המשימות שלך..."
            )}
          </p>
        ) : currentMission ? (
          <>
            <div className="mission-cta-badge">
              ✨{" "}
              {text(
                "YOUR CURRENT MISSION",
                "مهمتك الحالية",
                "המשימה הנוכחית שלך"
              )}
            </div>

            <h2>
              {localized(
                currentMission.title
              )}
            </h2>

            {localized(
              currentMission.summary
            ) && (
              <p className="mission-cta-teaser">
                {localized(
                  currentMission.summary
                )}
              </p>
            )}

            <div className="mission-cta-progress">
              <div className="student-progress-bar">
                <div
                  style={{
                    width: `${currentMission.percent}%`,
                  }}
                />
              </div>

              <strong>
                {currentMission.percent}%
              </strong>
            </div>

            <button
              type="button"
              className="mission-cta-button"
              onClick={() =>
                navigate(
                  `/student/lessons/${currentMission.id}`
                )
              }
            >
              {text(
                "Continue Mission ✨",
                "تابع المهمة ✨",
                "המשך במשימה ✨"
              )}
            </button>
          </>
        ) : allMissionsCompleted ? (
          <>
            <div className="mission-cta-badge">
              🏆{" "}
              {text(
                "ALL MISSIONS COMPLETE",
                "أكملت جميع المهمات",
                "כל המשימות הושלמו"
              )}
            </div>

            <h2>
              {text(
                "You finished every mission!",
                "أنجزت كل المهمات!",
                "השלמתם את כל המשימות!"
              )}
            </h2>

            <button
              type="button"
              className="mission-cta-button"
              onClick={() =>
                navigate("/student/lessons")
              }
            >
              {text(
                "Explore More Lessons 📚",
                "استكشف دروسًا أخرى 📚",
                "גלו עוד שיעורים 📚"
              )}
            </button>
          </>
        ) : (
          <>
            <div className="mission-cta-badge">
              ✨{" "}
              {text(
                "WORLD OF CHALLENGES",
                "عالم التحدّيات",
                "עולם האתגרים"
              )}
            </div>

            <h2>
              {text(
                "Ready for a new adventure?",
                "جاهز لمغامرة جديدة؟",
                "מוכנים להרפתקה חדשה?"
              )}
            </h2>

            <p className="mission-cta-teaser">
              {text(
                "Discover exciting lessons and challenges, test your skills, and learn something new with every step!",
                "اكتشف دروس وتحدّيات ممتعة، اختبر مهاراتك، وتعلّم أشياء جديدة مع كل خطوة!",
                "גלו שיעורים ואתגרים מהנים, בחנו את הכישורים שלכם ולמדו משהו חדש בכל צעד!"
              )}
            </p>

            <button
              type="button"
              className="mission-cta-button"
              onClick={() =>
                navigate("/student/lessons")
              }
            >
              {text(
                "Explore Your Lessons & Challenges 📚",
                "اكتشف دروسك وتحدّياتك 📚",
                "גלו את השיעורים והאתגרים שלכם 📚"
              )}
            </button>
          </>
        )}
      </section>

      {/* QUICK STATS */}
      <section className="quick-cards">
        <div className="quick-card purple">
          <span>⭐</span>
          <small>
            {text(
              "Level",
              "المستوى",
              "רמה"
            )}
          </small>
          <strong>{level}</strong>
        </div>

        <div className="quick-card blue">
          <span>⚡</span>
          <small>XP</small>
          <strong>{xp}</strong>
        </div>

        <div className="quick-card green">
          <span>🧠</span>
          <small>
            {text(
              "Missions",
              "المهمات المنجزة",
              "משימות"
            )}
          </small>
          <strong>
            {missionsLoading
              ? "..."
              : `${completedCount}/${
                  missions.length || "—"
                }`}
          </strong>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="student-main-grid">
        <div className="student-main-col">
          {/* MISSION PATH */}
          <div className="student-panel mission-path-panel">
            <h3>
              🗺️{" "}
              {text(
                "Mission Path",
                "مسار المهمات",
                "מסלול המשימות"
              )}
            </h3>

            {missionsLoading ? (
              <p className="mission-path-empty">
                {text(
                  "Loading missions...",
                  "جارٍ تحميل المهمات...",
                  "טוען משימות..."
                )}
              </p>
            ) : missions.length === 0 ? (
              <p className="mission-path-empty">
                {text(
                  "Your available missions will appear here.",
                  "مهماتك المتاحة رح تظهر هون.",
                  "המשימות הזמינות שלכם יופיעו כאן."
                )}
              </p>
            ) : (
              <div className="mission-path">
                {missions.map(
                  (mission, index) => (
                    <div
                      key={mission.id}
                      className="mission-path-item"
                    >
                      <div
                        className={`mission-path-step ${mission.status}`}
                      >
                        <span className="mission-path-icon">
                          {mission.status ===
                          "completed"
                            ? "✅"
                            : mission.status ===
                                "active"
                              ? "✨"
                              : mission.status ===
                                  "unlocked"
                                ? "🔓"
                                : "🔒"}
                        </span>

                        <span className="mission-path-label">
                          <strong>
                            {text(
                              `Mission ${String(
                                index + 1
                              ).padStart(2, "0")}`,
                              `المهمة ${index + 1}`,
                              `משימה ${index + 1}`
                            )}
                          </strong>

                          <em>
                            {localized(
                              mission.title
                            )}
                          </em>
                        </span>
                      </div>

                      {index <
                        missions.length - 1 && (
                        <div className="mission-path-connector" />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* CONTINUE LEARNING */}
          <div className="student-panel continue-learning-panel">
            <div className="continue-learning-badge">
              🔥{" "}
              {text(
                "CONTINUE WHERE YOU LEFT OFF",
                "استمر من حيث توقفت",
                "המשיכו מהמקום שבו הפסקתם"
              )}
            </div>

            {resumeLoading ? (
              <p>
                {text(
                  "Loading your progress...",
                  "جارٍ تحميل تقدّمك...",
                  "טוען את ההתקדמות שלך..."
                )}
              </p>
            ) : programResume ? (
              <>
                <div className="continue-learning-icon">
                  ✨
                </div>

                <h2>
                  {localized(
                    programResume.programTitle
                  ) ||
                    text(
                      "Your program",
                      "برنامجك",
                      "התוכנית שלך"
                    )}
                </h2>

                <p>
                  {text(
                    "Section",
                    "القسم",
                    "חלק"
                  )}{" "}
                  {Number(
                    programResume.lastSectionIndex ||
                      0
                  ) + 1}
                  {" · "}
                  {Number(
                    programResume.progressPercent ||
                      0
                  )}%
                </p>

                <div className="student-progress-bar">
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            programResume.progressPercent ||
                              0
                          )
                        )
                      )}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() =>
                    navigate(
                      `/programs/${encodeURIComponent(
                        programResume.programId
                      )}/lessons/${encodeURIComponent(
                        programResume.contentId
                      )}`
                    )
                  }
                >
                  {text(
                    "Resume ✨",
                    "استئناف ✨",
                    "המשך ✨"
                  )}
                </button>
              </>
            ) : !missionsLoading &&
              currentMission ? (
              <>
                <div className="continue-learning-icon">
                  🧠
                </div>

                <h2>
                  {localized(
                    currentMission.title
                  )}
                </h2>

                <p>
                  {currentMission.percent}%{" "}
                  {text(
                    "complete",
                    "مكتمل",
                    "הושלם"
                  )}
                </p>

                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() =>
                    navigate(
                      `/student/lessons/${currentMission.id}`
                    )
                  }
                >
                  {text(
                    "Continue Mission ✨",
                    "تابع المهمة ✨",
                    "המשך במשימה ✨"
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="continue-learning-icon">
                  📚
                </div>

                <h2>
                  {text(
                    "Ready for something new?",
                    "جاهز لشيء جديد؟",
                    "מוכנים למשהו חדש?"
                  )}
                </h2>

                <p>
                  {text(
                    "Browse your programs to start learning.",
                    "تصفح برامجك وابدأ التعلّم.",
                    "עיינו בתוכניות שלכם והתחילו ללמוד."
                  )}
                </p>

                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() =>
                    navigate("/student/programs")
                  }
                >
                  {text(
                    "Explore Programs 📚",
                    "استكشف البرامج 📚",
                    "גלו תוכניות 📚"
                  )}
                </button>
              </>
            )}

            <div className="secondary-links">
              <button
                type="button"
                onClick={() =>
                  navigate("/student/programs")
                }
              >
                🛒{" "}
                {text(
                  "Program Catalog",
                  "كتالوج البرامج",
                  "קטלוג תוכניות"
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/lessons")
                }
              >
                📚{" "}
                {text(
                  "Lessons",
                  "الدروس",
                  "שיעורים"
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/student/portfolio")
                }
              >
                📁{" "}
                {text(
                  "My Work",
                  "أعمالي",
                  "העבודות שלי"
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    classes.length > 0
                      ? "/student/lessons"
                      : "/student/join-class"
                  )
                }
              >
                🏫{" "}
                {text(
                  "My Class",
                  "صفي",
                  "הכיתה שלי"
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="student-main-col">
          {/* BADGES */}
          <div className="student-panel badges-panel">
            <h3>
              🏆{" "}
              {text(
                "Badges",
                "الشارات",
                "תגים"
              )}
            </h3>

            <div className="badge-cards">
              {badges.map((badge) => {
                const unlocked =
                  Array.isArray(
                    student.badges
                  ) &&
                  student.badges.includes(
                    badge.id
                  );

                return (
                  <div
                    key={badge.id}
                    className={`badge-card ${
                      unlocked
                        ? "unlocked"
                        : "locked"
                    }`}
                  >
                    <span className="badge-card-icon">
                      {badge.icon}
                    </span>

                    <small>
                      {text(
                        badge.en,
                        badge.ar,
                        badge.he
                      )}
                    </small>

                    {!unlocked && (
                      <span className="badge-card-lock">
                        🔒
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLASSES */}
          <div className="student-panel class-panel compact">
            <span>
              🏫{" "}
              {text(
                "My Class",
                "صفي",
                "הכיתה שלי"
              )}
            </span>

            {missionsLoading ? (
              <p>
                {text(
                  "Loading classes...",
                  "جارٍ تحميل الصفوف...",
                  "טוען כיתות..."
                )}
              </p>
            ) : classes.length > 0 ||
              student.classCode ? (
              <>
                <h2>
                  {text(
                    `${classes.length || 1} active classes`,
                    `${classes.length || 1} صفوف نشطة`,
                    `${classes.length || 1} כיתות פעילות`
                  )}
                </h2>

                <div className="student-class-list">
                  {classes.map((classData) => (
                    <div
                      key={classData.id}
                      className="student-class-list-item"
                    >
                      <strong>
                        {classData.name}
                      </strong>

                      <span>
                        {classData.teacherName ||
                          text(
                            "Teacher",
                            "المعلّم",
                            "מורה"
                          )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleLeaveClass(
                            classData.id
                          )
                        }
                      >
                        {text(
                          "Leave",
                          "مغادرة",
                          "עזיבה"
                        )}
                      </button>
                    </div>
                  ))}

                  {classes.length === 0 && (
                    <span>
                      {student.className ||
                        student.classCode}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2>
                  {text(
                    "No class yet",
                    "لست في صف بعد",
                    "עדיין אינכם בכיתה"
                  )}
                </h2>

                <p>
                  {text(
                    "Join a class using a class code.",
                    "انضم إلى صف باستخدام رمز الصف.",
                    "הצטרפו לכיתה באמצעות קוד כיתה."
                  )}
                </p>

                <button
                  type="button"
                  className="join-class-dashboard-button"
                  onClick={() =>
                    navigate(
                      "/student/join-class"
                    )
                  }
                >
                  🏫{" "}
                  {text(
                    "Join a Class",
                    "الانضمام إلى صف",
                    "הצטרפות לכיתה"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
