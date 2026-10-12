
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";

import { auth, db, functions } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";
import "./StudentLessons.css";

// Server-side access decisions are authoritative.
const getPurchasedProgram = httpsCallable(
  functions,
  "getPurchasedProgram"
);

const getRecentContentProgress = httpsCallable(
  functions,
  "getRecentContentProgress"
);

const ACTIVITY_TYPES = {
  lesson: {
    icon: "📚",
    en: "Lesson",
    ar: "درس",
    he: "שיעור",
  },
  mission: {
    icon: "🎯",
    en: "Mission",
    ar: "مهمة",
    he: "משימה",
  },
  quiz: {
    icon: "🧩",
    en: "Quiz",
    ar: "اختبار",
    he: "בוחן",
  },
  coding: {
    icon: "💻",
    en: "Coding",
    ar: "برمجة",
    he: "תכנות",
  },
  ai: {
    icon: "🧠",
    en: "AI",
    ar: "ذكاء اصطناعي",
    he: "בינה מלאכותית",
  },
  cyber: {
    icon: "🔐",
    en: "Cyber",
    ar: "سايبر",
    he: "סייבר",
  },
  external: {
    icon: "🌐",
    en: "External activity",
    ar: "نشاط خارجي",
    he: "פעילות חיצונית",
  },
};

function timestampOf(value) {
  if (!value) return 0;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    return Date.parse(value) || 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }

  return 0;
}

function lessonOrder(lesson) {
  const value = Number(
    lesson.order ??
      lesson.lessonOrder ??
      lesson.position ??
      999999
  );

  return Number.isFinite(value) ? value : 999999;
}

function sortLessons(lessons) {
  return [...lessons].sort((first, second) => {
    const orderDifference =
      lessonOrder(first) - lessonOrder(second);

    if (orderDifference) return orderDifference;

    const dateDifference =
      timestampOf(first.createdAt) -
      timestampOf(second.createdAt);

    if (dateDifference) return dateDifference;

    return String(first.id).localeCompare(
      String(second.id)
    );
  });
}

function lessonKey(programId, lessonId) {
  return `${programId}::${lessonId}`;
}

export default function StudentLessons() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const [student, setStudent] = useState(null);

  const [classLessons, setClassLessons] = useState([]);
  const [programGroups, setProgramGroups] = useState([]);

  const [completedLessons, setCompletedLessons] =
    useState({});

  const [recentProgress, setRecentProgress] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [classLoading, setClassLoading] = useState(true);
  const [programsLoading, setProgramsLoading] =
    useState(true);
  const [progressLoading, setProgressLoading] =
    useState(true);

  const [error, setError] = useState("");

  // null means: use the automatic open/closed state.
  // Explicit student choices override that state.
  const [expandedPrograms, setExpandedPrograms] =
    useState({});

  const [showClassLessons, setShowClassLessons] =
    useState(true);

  const isRTL = language === "ar" || language === "he";

  function text(en, ar, he) {
    return language === "ar"
      ? ar
      : language === "he"
        ? he
        : en;
  }

  function localized(value) {
    if (!value) return "";

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value[language] ||
        value.ar ||
        value.he ||
        value.en ||
        ""
      );
    }

    return String(value);
  }

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadClassLessons(uid) {
      try {
        const memberships = await getDocs(
          query(
            collection(db, "classMembers"),
            where("studentId", "==", uid),
            where("status", "==", "active")
          )
        );

        if (cancelled) return;

        const classIds = [
          ...new Set(
            memberships.docs
              .map((item) => item.data().classId)
              .filter(
                (id) =>
                  typeof id === "string" &&
                  id.length > 0
              )
          ),
        ];

        if (!classIds.length) {
          setClassLessons([]);
          return;
        }

        const snapshots = await Promise.all(
          classIds.map((classId) =>
            getDocs(
              query(
                collection(db, "lessons"),
                where("classId", "==", classId),
                where("status", "==", "published")
              )
            )
          )
        );

        if (cancelled) return;

        const unique = new Map();

        snapshots.forEach((snapshot) => {
          snapshot.docs.forEach((item) => {
            unique.set(item.id, {
              id: item.id,
              ...item.data(),
            });
          });
        });

        setClassLessons(
          sortLessons([...unique.values()])
        );
      } catch (loadError) {
        console.error(
          "Could not load class lessons:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Some class lessons could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setClassLoading(false);
        }
      }
    }

    async function loadPrograms() {
      try {
        // Catalog metadata only.
        const snapshot = await getDocs(
          query(
            collection(db, "programs"),
            where("status", "==", "published")
          )
        );

        if (cancelled) return;

        const results = await Promise.all(
          snapshot.docs.map(async (programDoc) => {
            const programId = programDoc.id;

            try {
              // Server returns:
              // - locked
              // - previewOnly
              // - allowed lesson metadata
              const response =
                await getPurchasedProgram({
                  programId,
                });

              const data = response.data || {};

              const lessons = Array.isArray(data.lessons)
                ? data.lessons
                : [];

              const hasGrant = Boolean(data.access);

              // A free lesson may be available
              // without a full program purchase.
              const hasAvailableLesson =
                lessons.some(
                  (lesson) =>
                    lesson.locked !== true
                );

              if (
                !hasGrant &&
                !data.fullAccess &&
                !hasAvailableLesson
              ) {
                return null;
              }

              return {
                id: programId,
                program: {
                  id: programId,
                  ...programDoc.data(),
                },
                lessons: sortLessons(lessons),
                fullAccess: Boolean(data.fullAccess),
              };
            } catch (accessError) {
              if (
                accessError.code !==
                  "functions/permission-denied" &&
                accessError.code !==
                  "functions/not-found"
              ) {
                console.error(
                  "Program access error:",
                  programId,
                  accessError
                );
              }

              return null;
            }
          })
        );

        if (cancelled) return;

        setProgramGroups(
          results.filter(Boolean)
        );
      } catch (loadError) {
        console.error(
          "Could not load programs:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Could not load your programs."
          );
        }
      } finally {
        if (!cancelled) {
          setProgramsLoading(false);
        }
      }
    }

    async function loadProgress(uid) {
      // One query for the student's completion receipts.
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "lessonCompletions"),
            where("studentId", "==", uid)
          )
        );

        if (cancelled) return;

        const completed = {};

        snapshot.docs.forEach((item) => {
          const lessonId = item.data().lessonId;

          if (lessonId) {
            completed[lessonId] = true;
          }
        });

        setCompletedLessons(completed);
      } catch (loadError) {
        console.error(
          "Could not load completions:",
          loadError
        );
      }

      // Latest bookmarks from the newer progress system.
      try {
        const response =
          await getRecentContentProgress({});

        if (cancelled) return;

        setRecentProgress(
          Array.isArray(response.data?.progress)
            ? response.data.progress
            : []
        );
      } catch (loadError) {
        // Keep page usable if the callable is not deployed.
        console.warn(
          "Recent bookmarks unavailable:",
          loadError
        );
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    }

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

        const userSnapshot = await getDoc(
          doc(db, "users", user.uid)
        );

        if (cancelled) return;

        if (!userSnapshot.exists()) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        const profile = userSnapshot.data();

        if (profile.role !== "student") {
          navigate(
            profile.role === "owner"
              ? "/owner"
              : "/teacher",
            { replace: true }
          );
          return;
        }

        if (
          (profile.accountStatus || "active") !==
          "active"
        ) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        setStudent(profile);
        setLoading(false);

        void loadClassLessons(user.uid);
        void loadPrograms();
        void loadProgress(user.uid);
      } catch (loadError) {
        console.error(
          "Student lessons initialization:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Could not load the learning page."
          );
          setLoading(false);
          setClassLoading(false);
          setProgramsLoading(false);
          setProgressLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ==========================================
  // RECENT BOOKMARKS
  // ==========================================

  const resumeMap = useMemo(() => {
    const result = new Map();

    const records = [...recentProgress].sort(
      (a, b) =>
        timestampOf(b.updatedAt) -
        timestampOf(a.updatedAt)
    );

    records.forEach((record) => {
      if (
        record.programId &&
        record.contentId &&
        record.status === "in_progress"
      ) {
        const key = lessonKey(
          record.programId,
          record.contentId
        );

        if (!result.has(key)) {
          result.set(key, record);
        }
      }
    });

    return result;
  }, [recentProgress]);

  // ==========================================
  // PROGRAM STATISTICS
  // ==========================================

  const groupsWithStats = useMemo(() => {
    const enriched = programGroups.map((group) => {
      const lessons = group.lessons;
      const total = lessons.length;

      const completed = lessons.filter(
        (lesson) =>
          completedLessons[lesson.id] === true
      ).length;

      const percent = total
        ? Math.round((completed / total) * 100)
        : 0;

      const allCompleted =
        total > 0 && completed === total;

      // Only lessons the server permits.
      const availableUnfinished = lessons.filter(
        (lesson) =>
          lesson.locked !== true &&
          lesson.previewOnly !== true &&
          !completedLessons[lesson.id]
      );

      const current = availableUnfinished
        .filter((lesson) =>
          resumeMap.has(
            lessonKey(group.id, lesson.id)
          )
        )
        .sort((first, second) => {
          const firstBookmark = resumeMap.get(
            lessonKey(group.id, first.id)
          );

          const secondBookmark = resumeMap.get(
            lessonKey(group.id, second.id)
          );

          return (
            timestampOf(secondBookmark?.updatedAt) -
            timestampOf(firstBookmark?.updatedAt)
          );
        })[0];

      const next =
        current ||
        availableUnfinished[0] ||
        null;

      const preview = next
        ? null
        : lessons.find(
            (lesson) =>
              lesson.locked !== true &&
              lesson.previewOnly === true
          ) || null;

      // Find the most recent progress in this program.
      // This is separate from choosing the next lesson.
      const recentAt = lessons.reduce(
        (latest, lesson) => {
          if (lesson.locked === true) {
            return latest;
          }

          const bookmark = resumeMap.get(
            lessonKey(group.id, lesson.id)
          );

          return Math.max(
            latest,
            timestampOf(bookmark?.updatedAt)
          );
        },
        0
      );

      return {
        ...group,
        total,
        completed,
        percent,
        allCompleted,
        current,
        next,
        preview,
        recentAt,
      };
    });

    return enriched.sort((first, second) => {
      if (first.recentAt !== second.recentAt) {
        return second.recentAt - first.recentAt;
      }

      const firstOrder = Number(
        first.program.order ?? 999999
      );

      const secondOrder = Number(
        second.program.order ?? 999999
      );

      return firstOrder - secondOrder;
    });
  }, [programGroups, completedLessons, resumeMap]);

  // Automatically expand only one program:
  // 1. The most recently active unfinished program
  // 2. Otherwise the first unfinished program
  // 3. Otherwise the first completed program
  const automaticOpenId = useMemo(() => {
    if (!groupsWithStats.length) return null;

    const active = groupsWithStats.find(
      (group) =>
        !group.allCompleted &&
        group.current &&
        group.recentAt > 0
    );

    if (active) return active.id;

    const unfinished = groupsWithStats.find(
      (group) => !group.allCompleted
    );

    return unfinished?.id ||
      groupsWithStats[0].id;
  }, [groupsWithStats]);

  const completedCount = useMemo(() => {
    const all = [
      ...classLessons,
      ...programGroups.flatMap(
        (group) => group.lessons
      ),
    ];

    return new Set(
      all
        .filter(
          (lesson) =>
            completedLessons[lesson.id]
        )
        .map((lesson) => lesson.id)
    ).size;
  }, [
    classLessons,
    programGroups,
    completedLessons,
  ]);

  const totalLessons =
    classLessons.length +
    programGroups.reduce(
      (sum, group) =>
        sum + group.lessons.length,
      0
    );

  // ==========================================
  // NAVIGATION AND EXPANSION
  // ==========================================

  function openLesson(lesson, programId = null) {
    if (lesson.locked === true) {
      return;
    }

    if (programId) {
      navigate(
        `/programs/${encodeURIComponent(
          programId
        )}/lessons/${encodeURIComponent(lesson.id)}`
      );
    } else {
      navigate(
        `/student/lessons/${encodeURIComponent(
          lesson.id
        )}`
      );
    }
  }

  function isProgramExpanded(id) {
    if (
      Object.prototype.hasOwnProperty.call(
        expandedPrograms,
        id
      )
    ) {
      return expandedPrograms[id];
    }

    // While bookmarks are loading, don't automatically
    // open the wrong program and switch it later.
    if (progressLoading) return false;

    return id === automaticOpenId;
  }

  function toggleProgram(id) {
    setExpandedPrograms((previous) => ({
      ...previous,
      [id]: !isProgramExpanded(id),
    }));
  }

  // ==========================================
  // RENDER A SINGLE LESSON
  // ==========================================

  function renderLessonRow(
    lesson,
    index,
    programId = null,
    recommendedId = null
  ) {
    const completed =
      completedLessons[lesson.id] === true;

    const locked =
      lesson.locked === true;

    const previewOnly =
      lesson.previewOnly === true;

    const bookmark = programId
      ? resumeMap.get(
          lessonKey(programId, lesson.id)
        )
      : null;

    const inProgress =
      !locked &&
      !completed &&
      !previewOnly &&
      bookmark?.status === "in_progress";

    const recommended =
      !locked &&
      !completed &&
      !previewOnly &&
      recommendedId === lesson.id;

    const activity =
      ACTIVITY_TYPES[
        lesson.activityType ||
          lesson.contentType
      ] || ACTIVITY_TYPES.lesson;

    const description = locked
      ? ""
      : localized(
          lesson.descriptionI18n ||
            lesson.description
        );

    const lessonTitle =
      localized(
        lesson.titleI18n ||
          lesson.title
      ) ||
      text("Lesson", "درس", "שיעור");

    return (
      <article
        key={`${programId || "class"}-${lesson.id}`}
        className={[
          "tm-lesson-row",
          completed ? "is-completed" : "",
          locked ? "is-locked" : "",
          previewOnly ? "is-preview" : "",
          inProgress ? "is-current" : "",
          recommended ? "is-recommended" : "",
        ].join(" ")}
      >
        <div className="tm-lesson-number">
          {locked
            ? "🔒"
            : completed
              ? "✓"
              : index + 1}
        </div>

        <div className="tm-lesson-icon">
          {locked ? "🔐" : activity.icon}
        </div>

        <div className="tm-lesson-info">
          <div className="tm-lesson-status-line">
            <span className="tm-lesson-type">
              {locked
                ? text(
                    "Locked lesson",
                    "درس مقفل",
                    "שיעור נעול"
                  )
                : text(
                    activity.en,
                    activity.ar,
                    activity.he
                  )}
            </span>

            {locked && (
              <span className="tm-status locked">
                🔒{" "}
                {text(
                  "Locked",
                  "مقفل",
                  "נעול"
                )}
              </span>
            )}

            {!locked && previewOnly && (
              <span className="tm-status preview">
                ✨{" "}
                {text(
                  "Free preview",
                  "تجربة مجانية",
                  "תצוגה מקדימה"
                )}
              </span>
            )}

            {!locked &&
              !previewOnly &&
              completed && (
                <span className="tm-status completed">
                  ✓{" "}
                  {text(
                    "Completed",
                    "مكتمل",
                    "הושלם"
                  )}
                </span>
              )}

            {inProgress && (
              <span className="tm-status current">
                {text(
                  "In progress",
                  "قيد التعلّم",
                  "בתהליך"
                )}
              </span>
            )}

            {recommended && (
              <span className="tm-status recommended">
                {text(
                  "Next step",
                  "خطوتك القادمة",
                  "השלב הבא"
                )}
              </span>
            )}
          </div>

          <h3>{lessonTitle}</h3>

          {description && (
            <p className="tm-lesson-description">
              {description}
            </p>
          )}

          {!locked && (
            <div className="tm-lesson-details">
              <span>
                ⏱{" "}
                {lesson.estimatedMinutes ||
                  lesson.minutes ||
                  0}{" "}
                {text(
                  "min",
                  "دقيقة",
                  "דקות"
                )}
              </span>

              {!previewOnly && (
                <span>
                  ⭐ {lesson.xpReward || 0} XP
                </span>
              )}

              {inProgress && (
                <span>
                  {text(
                    "Section",
                    "القسم",
                    "חלק"
                  )}{" "}
                  {Number(
                    bookmark.lastSectionIndex || 0
                  ) + 1}
                </span>
              )}
            </div>
          )}
        </div>

        {locked ? (
          <span className="tm-locked-label">
            🔒{" "}
            {text(
              "Not available",
              "غير متاح",
              "לא זמין"
            )}
          </span>
        ) : (
          <button
            type="button"
            className={[
              "tm-open-lesson",
              completed ? "review" : "",
              inProgress ? "continue" : "",
              recommended ? "recommended" : "",
            ].join(" ")}
            onClick={() =>
              openLesson(lesson, programId)
            }
          >
            {previewOnly
              ? text(
                  "Preview",
                  "جرّب الدرس",
                  "תצוגה מקדימה"
                )
              : completed
                ? text(
                    "Review",
                    "مراجعة",
                    "חזרה"
                  )
                : inProgress
                  ? text(
                      "Continue",
                      "أكمل",
                      "המשך"
                    )
                  : text(
                      "Start",
                      "ابدأ",
                      "התחל"
                    )}
            <span aria-hidden="true"> ↗</span>
          </button>
        )}
      </article>
    );
  }

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="student-lessons-loading"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div>📚</div>

        <p>
          {text(
            "Loading your lessons...",
            "جارٍ تحميل دروسك...",
            "טוען את השיעורים שלך..."
          )}
        </p>
      </div>
    );
  }

  if (!student) return null;

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div
      className="student-lessons-page"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* HEADER */}

      <header className="student-lessons-topbar">
        <div>
          <button
            type="button"
            className="student-lessons-back"
            onClick={() =>
              navigate("/student")
            }
          >
            {text(
              "← Back to Dashboard",
              "↩ رجوع للرئيسية",
              "→ חזרה ללוח הבקרה"
            )}
          </button>

          <h1>
            📚{" "}
            {text(
              "My Learning Journey",
              "رحلتي التعليمية",
              "מסע הלמידה שלי"
            )}
          </h1>

          <p>
            {text(
              "Your programs and lessons, organized in one place.",
              "كل برامجك ودروسك مرتبة بمكان واحد.",
              "כל התוכניות והשיעורים שלך במקום אחד."
            )}
          </p>
        </div>

        <div className="student-lessons-language">
          {[
            ["en", "EN"],
            ["ar", "عربي"],
            ["he", "עברית"],
          ].map(([code, label]) => (
            <button
              key={code}
              type="button"
              className={
                language === code
                  ? "active"
                  : ""
              }
              aria-pressed={
                language === code
              }
              onClick={() =>
                setLanguage(code)
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* SUMMARY */}

      <section className="tm-journey-summary">
        <div>
          <span>🎓</span>

          <div>
            <small>
              {text(
                "My Programs",
                "برامجي",
                "התוכניות שלי"
              )}
            </small>

            <strong>
              {programsLoading
                ? "…"
                : programGroups.length}
            </strong>
          </div>
        </div>

        <div>
          <span>📚</span>

          <div>
            <small>
              {text(
                "Lessons",
                "الدروس",
                "שיעורים"
              )}
            </small>

            <strong>
              {programsLoading ||
              classLoading
                ? "…"
                : totalLessons}
            </strong>
          </div>
        </div>

        <div>
          <span>✅</span>

          <div>
            <small>
              {text(
                "Completed",
                "دروس منجزة",
                "שיעורים שהושלמו"
              )}
            </small>

            <strong>
              {progressLoading
                ? "…"
                : completedCount}
            </strong>
          </div>
        </div>
      </section>

      {/* ERRORS */}

      {error && (
        <div className="student-lessons-error">
          ⚠️ {error}
        </div>
      )}

      <div className="student-lessons-sections">
        {/* PROGRAMS */}

        <section className="student-lessons-section">
          <div className="student-lessons-section-header">
            <div>
              <small>
                {text(
                  "LEARNING PROGRAMS",
                  "البرامج التعليمية",
                  "תוכניות למידה"
                )}
              </small>

              <h2>
                🎯{" "}
                {text(
                  "My Programs",
                  "برامجي التعليمية",
                  "התוכניות שלי"
                )}
              </h2>

              <p>
                {text(
                  "Continue your learning where you stopped.",
                  "تابع رحلتك التعليمية من وين وقفت.",
                  "המשיכו ללמוד מהמקום שבו עצרתם."
                )}
              </p>
            </div>

            <strong>
              {programsLoading
                ? "…"
                : programGroups.length}
            </strong>
          </div>

          {programsLoading ? (
            <div className="tm-program-loading">
              {text(
                "Loading programs...",
                "جارٍ تحميل البرامج...",
                "טוען תוכניות..."
              )}
            </div>
          ) : !groupsWithStats.length ? (
            <div className="tm-program-empty">
              <span>📘</span>

              <h3>
                {text(
                  "No programs yet",
                  "ما في برامج بعد",
                  "אין עדיין תוכניות"
                )}
              </h3>

              <p>
                {text(
                  "Explore new learning programs.",
                  "استكشف البرامج التعليمية المتاحة.",
                  "גלו תוכניות לימוד חדשות."
                )}
              </p>

              <button
                type="button"
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
          ) : (
            <div className="tm-programs-list">
              {groupsWithStats.map(
                (group) => {
                  const expanded =
                    isProgramExpanded(group.id);

                  const recommended =
                    group.next ||
                    group.preview;

                  const isActiveProgram =
                    group.id === automaticOpenId &&
                    !group.allCompleted;

                  const hasUnfinished =
                    group.lessons.some(
                      (lesson) =>
                        !lesson.locked &&
                        !lesson.previewOnly &&
                        !completedLessons[lesson.id]
                    );

                  return (
                    <section
                      key={group.id}
                      className={[
                        "tm-program-card",
                        isActiveProgram
                          ? "tm-program-active"
                          : "",
                        group.allCompleted
                          ? "tm-program-finished"
                          : "",
                      ].join(" ")}
                    >
                      {/* PROGRAM HEADER */}

                      <div className="tm-program-heading">
                        <div className="tm-program-symbol">
                          {group.program.icon || "💻"}
                        </div>

                        <div className="tm-program-heading-info">
                          <div className="tm-program-heading-badges">
                            <span className="tm-program-eyebrow">
                              {text(
                                "LEARNING PROGRAM",
                                "برنامج تعليمي",
                                "תוכנית לימוד"
                              )}
                            </span>

                            {isActiveProgram &&
                              !progressLoading && (
                                <span className="tm-active-program-badge">
                                  ✨{" "}
                                  {text(
                                    "Continue here",
                                    "كمّل من هون",
                                    "ממשיכים מכאן"
                                  )}
                                </span>
                              )}

                            {group.allCompleted &&
                              !progressLoading && (
                                <span className="tm-finished-program-badge">
                                  🏆{" "}
                                  {text(
                                    "Completed",
                                    "مكتمل",
                                    "הושלם"
                                  )}
                                </span>
                              )}
                          </div>

                          <h2>
                            {localized(
                              group.program.titleI18n ||
                                group.program.title
                            )}
                          </h2>

                          <p>
                            {localized(
                              group.program.descriptionI18n ||
                                group.program.description ||
                                group.program.summary
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="tm-program-toggle"
                          aria-expanded={expanded}
                          onClick={() =>
                            toggleProgram(group.id)
                          }
                        >
                          {expanded
                            ? text(
                                "Hide lessons",
                                "إخفاء الدروس",
                                "הסתר שיעורים"
                              )
                            : text(
                                "Show lessons",
                                "عرض الدروس",
                                "הצג שיעורים"
                              )}

                          <span aria-hidden="true">
                            {expanded ? "⌃" : "⌄"}
                          </span>
                        </button>
                      </div>

                      {/* PROGRESS */}

                      <div className="tm-program-progress">
                        <div className="tm-program-progress-text">
                          <strong>
                            {progressLoading
                              ? "…"
                              : `${group.percent}%`}{" "}
                            {text(
                              "completed",
                              "مكتمل",
                              "הושלם"
                            )}
                          </strong>

                          <span>
                            {progressLoading
                              ? "…"
                              : group.completed}
                            {" / "}
                            {group.total}{" "}
                            {text(
                              "lessons",
                              "دروس",
                              "שיעורים"
                            )}
                          </span>
                        </div>

                        <div
                          className="tm-progress-track"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            progressLoading
                              ? 0
                              : group.percent
                          }
                          aria-label={text(
                            "Program progress",
                            "نسبة إنجاز البرنامج",
                            "התקדמות בתוכנית"
                          )}
                        >
                          <div
                            style={{
                              width: progressLoading
                                ? "0%"
                                : `${group.percent}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* CONGRATULATIONS */}

                      {!progressLoading &&
                        group.allCompleted && (
                          <div
                            className="tm-program-congratulations"
                            role="status"
                          >
                            <span className="tm-congrats-icon">
                              🏆
                            </span>

                            <div>
                              <small>
                                {text(
                                  "AMAZING ACHIEVEMENT",
                                  "إنجاز رائع",
                                  "הישג מדהים"
                                )}
                              </small>

                              <strong>
                                {text(
                                  "Congratulations! You completed this program!",
                                  "مبروك! خلّصت البرنامج بنجاح!",
                                  "כל הכבוד! סיימתם את התוכנית בהצלחה!"
                                )}
                              </strong>

                              <p>
                                {text(
                                  "You finished every lesson. Keep learning and exploring!",
                                  "أنهيت كل دروس البرنامج! استمر بالتعلّم واكتشاف مهارات جديدة.",
                                  "סיימתם את כל השיעורים! המשיכו ללמוד ולגלות מיומנויות חדשות."
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* NEXT LESSON */}

                      {!progressLoading &&
                        !group.allCompleted &&
                        recommended && (
                          <div className="tm-program-next">
                            <div>
                              <small>
                                {group.current
                                  ? text(
                                      "PICK UP WHERE YOU LEFT OFF",
                                      "كمّل من وين وقفت",
                                      "המשיכו מהמקום שבו עצרתם"
                                    )
                                  : group.next
                                    ? text(
                                        "YOUR NEXT STEP",
                                        "خطوتك القادمة",
                                        "השלב הבא שלך"
                                      )
                                    : text(
                                        "FREE PREVIEW",
                                        "تجربة مجانية",
                                        "תצוגה מקדימה"
                                      )}
                              </small>

                              <strong>
                                {localized(
                                  recommended.titleI18n ||
                                    recommended.title
                                )}
                              </strong>

                              {group.current && (
                                <span className="tm-next-hint">
                                  {text(
                                    "Your previous progress is saved.",
                                    "تقدّمك السابق محفوظ.",
                                    "ההתקדמות הקודמת שלך נשמרה."
                                  )}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                openLesson(
                                  recommended,
                                  group.id
                                )
                              }
                            >
                              {group.current
                                ? text(
                                    "Continue learning",
                                    "أكمل التعلّم",
                                    "המשך ללמוד"
                                  )
                                : group.next
                                  ? text(
                                      "Start lesson",
                                      "ابدأ الدرس",
                                      "התחל שיעור"
                                    )
                                  : text(
                                      "Try preview",
                                      "جرّب الدرس",
                                      "נסו שיעור לדוגמה"
                                    )}
                              <span aria-hidden="true">
                                {" "}↗
                              </span>
                            </button>
                          </div>
                        )}

                      {!progressLoading &&
                        !group.allCompleted &&
                        !recommended && (
                          <div className="tm-program-no-lessons">
                            🔒{" "}
                            {text(
                              "No additional lessons are available in this program right now.",
                              "ما في دروس إضافية مفتوحة بهذا البرنامج حاليًا.",
                              "אין שיעורים נוספים זמינים כרגע בתוכנית."
                            )}
                          </div>
                        )}

                      {/* PROGRAM LESSONS */}

                      {expanded && (
                        <div className="tm-program-lessons">
                          <div className="tm-program-lessons-heading">
                            <h3>
                              {text(
                                "Program lessons",
                                "دروس البرنامج",
                                "שיעורי התוכנית"
                              )}
                            </h3>

                            <span>
                              {group.total}{" "}
                              {text(
                                "lessons",
                                "دروس",
                                "שיעורים"
                              )}
                            </span>
                          </div>

                          {group.lessons.length ? (
                            <div className="tm-lesson-list">
                              {group.lessons.map(
                                (lesson, index) =>
                                  renderLessonRow(
                                    lesson,
                                    index,
                                    group.id,
                                    group.next?.id
                                  )
                              )}
                            </div>
                          ) : (
                            <p className="tm-program-no-lessons">
                              {text(
                                "No published lessons yet.",
                                "لا توجد دروس منشورة بعد.",
                                "אין עדיין שיעורים שפורסמו."
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* CLASS LESSONS */}

        <section className="student-lessons-section">
          <div className="student-lessons-section-header">
            <div>
              <small>
                {text(
                  "CLASSROOM",
                  "الصف",
                  "כיתה"
                )}
              </small>

              <h2>
                🏫{" "}
                {text(
                  "Class lessons",
                  "دروس الصف",
                  "שיעורי הכיתה"
                )}
              </h2>

              <p>
                {text(
                  "Lessons published by your teachers.",
                  "الدروس اللي نشرها معلموك.",
                  "שיעורים שפורסמו על ידי המורים."
                )}
              </p>
            </div>

            <button
              type="button"
              className="tm-class-toggle"
              aria-expanded={
                showClassLessons
              }
              aria-label={text(
                "Show or hide class lessons",
                "إظهار أو إخفاء دروس الصف",
                "הצגה או הסתרה של שיעורי הכיתה"
              )}
              onClick={() =>
                setShowClassLessons(
                  (value) => !value
                )
              }
            >
              {showClassLessons
                ? "⌃"
                : "⌄"}
            </button>
          </div>

          {showClassLessons && (
            <div className="tm-class-lessons-card">
              {classLoading ? (
                <div className="tm-class-empty">
                  {text(
                    "Loading class lessons...",
                    "جارٍ تحميل دروس الصف...",
                    "טוען שיעורי כיתה..."
                  )}
                </div>
              ) : classLessons.length ? (
                <div className="tm-lesson-list">
                  {classLessons.map(
                    (lesson, index) =>
                      renderLessonRow(
                        lesson,
                        index
                      )
                  )}
                </div>
              ) : (
                <div className="tm-class-empty">
                  {text(
                    "No class lessons have been published yet.",
                    "ما في دروس صف منشورة بعد.",
                    "עדיין לא פורסמו שיעורים לכיתה."
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
