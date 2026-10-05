import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
  functions,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./StudentLessons.css";

import { hebrewText } from "../data/hebrewText";

import { normalizeProgram } from "../../functions/programAccessPolicy.mjs";
import { studentHasProgramAccess } from "../firebase/studentProgramAccess";
import { httpsCallable } from "firebase/functions";

const checkProgramAccess = httpsCallable(
  functions,
  "checkProgramAccess"
);


function StudentLessons() {
  const navigate =
    useNavigate();
const [
  completedLessons,
  setCompletedLessons,
] = useState({});
  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    lessons,
    setLessons,
  ] = useState([]);

  const [
    programLessons,
    setProgramLessons,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const text = (
    english,
    arabic,
    hebrew
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? (hebrew || hebrewText(english))
        : english;


  const localized = (value) => {
    if (!value) {
      return "";
    }

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
  };


  /* ============================
     ACTIVITY TYPES
  ============================ */

  const activityTypes = {
    mission: {
      icon: "🤖",
      en: "Mission",
      ar: "مهمة",
    },
    lesson: {
      icon: "📚",
      en: "Lesson",
      ar: "درس",
    },

    quiz: {
      icon: "🧩",
      en: "Quiz",
      ar: "اختبار",
    },

    coding: {
      icon: "💻",
      en: "Coding",
      ar: "برمجة",
    },

    ai: {
      icon: "🤖",
      en: "AI Activity",
      ar: "نشاط ذكاء اصطناعي",
    },

    cyber: {
      icon: "🔐",
      en: "Cyber Activity",
      ar: "نشاط سايبر",
    },

    external: {
      icon: "🌐",
      en: "External Activity",
      ar: "نشاط خارجي",
    },
  };


  /* ============================
     LOAD STUDENT
  ============================ */

  useEffect(() => {
    let unsubscribeLessons =
      null;


    const loadStudentAndLessons =
      async () => {
        try {
          setLoading(true);
          setError("");


          const currentUser =
            auth.currentUser;


          if (!currentUser) {
            navigate("/login");
            return;
          }


          const studentSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                currentUser.uid
              )
            );


          if (
            !studentSnapshot.exists()
          ) {
            navigate("/login");
            return;
          }


          const studentData =
            studentSnapshot.data();


          if (
            studentData.role !==
            "student"
          ) {
            navigate("/teacher");
            return;
          }


          setStudent(
            studentData
          );

          const membershipSnapshot =
            await getDocs(
              query(
                collection(
                  db,
                  "classMembers"
                ),
                where(
                  "studentId",
                  "==",
                  currentUser.uid
                ),
                where(
                  "status",
                  "==",
                  "active"
                )
              )
            );

          const classIds =
            membershipSnapshot.docs
              .map(
                (membership) =>
                  membership.data().classId
              )
              .filter(
                (classId) =>
                  typeof classId ===
                  "string" &&
                  classId
              );

          /*
            Student has no class yet.
          */

          if (
            classIds.length ===
            0
          ) {
            setLessons([]);
            setLoading(false);

            return;
          }


          /* ======================
             REAL-TIME LESSONS
          ====================== */

          const lessonsQuery =
            query(
              collection(
                db,
                "lessons"
              ),

              where(
                "classId",
                "in",
                classIds
              ),

              where(
                "status",
                "==",
                "published"
              )
            );


           unsubscribeLessons =
  onSnapshot(
    lessonsQuery,

    async (snapshot) => {
      const list =
        snapshot.docs.map(
          (lessonDocument) => ({
            id: lessonDocument.id,
            ...lessonDocument.data(),
          })
        );


      list.sort((a, b) => {
        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;
      });


      setLessons(list);


      /* =========================
         CHECK COMPLETED LESSONS
      ========================= */

      try {
        const completionResults =
          await Promise.all(
            list.map(
              async (lesson) => {
                const completionId =
                  `${currentUser.uid}_${lesson.id}`;


                const completionSnapshot =
                  await getDoc(
                    doc(
                      db,
                      "lessonCompletions",
                      completionId
                    )
                  );


                return {
                  lessonId:
                    lesson.id,

                  completed:
                    completionSnapshot.exists(),
                };
              }
            )
          );


        const completionMap = {};


        completionResults.forEach(
          (result) => {
            completionMap[
              result.lessonId
            ] =
              result.completed;
          }
        );


        setCompletedLessons(
          completionMap
        );

      } catch (
        completionError
      ) {
        console.error(
          "Load lesson completions error:",
          completionError
        );
      }


      setLoading(false);
    },
            

              (listenerError) => {
                console.error(
                  "Student lessons listener error:",
                  listenerError
                );


                setError(
                  text(
                    "Could not load your lessons.",
                    "تعذر تحميل الدروس."
                  )
                );


                setLoading(
                  false
                );
              }
            );

        } catch (loadError) {
          console.error(
            "Load student lessons error:",
            loadError
          );


          setError(
            text(
              "Could not load your lessons.",
              "تعذر تحميل الدروس."
            )
          );


          setLoading(
            false
          );
        }
      };


    loadStudentAndLessons();


    return () => {
      if (
        unsubscribeLessons
      ) {
        unsubscribeLessons();
      }
    };

  }, [navigate]);



  /* ============================
     MY PROGRAMS -> PROGRAM LESSONS
     Important:
     Students are NOT allowed to list programAccess directly in Firestore.
     So we:
     1. Load published programs.
     2. Ask the secure checkProgramAccess callable which programs belong to the student.
     3. Read the published lessons of only those programs.
  ============================ */

  useEffect(() => {
    if (!student) {
      return undefined;
    }

    let active = true;
    let lessonStops = [];

    const clearLessonStops = () => {
      lessonStops.forEach((stop) => stop());
      lessonStops = [];
    };

    const loadProgramLessons = async () => {
      try {
        await auth.authStateReady();

        const currentUser = auth.currentUser;

        if (!currentUser || !active) {
          return;
        }

        const programsSnapshot = await getDocs(
          query(
            collection(db, "programs"),
            where("status", "==", "published")
          )
        );

        const publishedPrograms =
          programsSnapshot.docs.map((programDoc) => ({
            id: programDoc.id,
            ...programDoc.data(),
          }));

        const accessResults = await Promise.all(
          publishedPrograms.map(async (program) => {
            try {
              const hasAccess =
                await studentHasProgramAccess(
                  checkProgramAccess,
                  program.id
                );

              return {
                program,
                hasAccess,
              };
            } catch (accessError) {
              console.error(
                "Program access check failed:",
                program.id,
                accessError
              );

              return {
                program,
                hasAccess: false,
              };
            }
          })
        );

        if (!active) {
          return;
        }

        const myPrograms = accessResults
          .filter((item) => item.hasAccess)
          .map((item) => item.program);

        clearLessonStops();

        if (myPrograms.length === 0) {
          setProgramLessons([]);
          return;
        }

        const lessonsByProgram = new Map();

        const publishMergedLessons = () => {
          if (!active) {
            return;
          }

          const merged = Array.from(
            lessonsByProgram.values()
          ).flat();

          merged.sort((a, b) => {
            const aOrder =
              Number(
                a.order ??
                a.lessonOrder ??
                a.position ??
                999999
              );

            const bOrder =
              Number(
                b.order ??
                b.lessonOrder ??
                b.position ??
                999999
              );

            if (aOrder !== bOrder) {
              return aOrder - bOrder;
            }

            return String(
              a.title || ""
            ).localeCompare(
              String(b.title || "")
            );
          });

          setProgramLessons(merged);
        };

        myPrograms.forEach((program) => {
          const lessonsQuery = query(
            collection(db, "lessons"),
            where("programId", "==", program.id),
            where("lessonType", "==", "commercial"),
            where("status", "==", "published")
          );

          const stop = onSnapshot(
            lessonsQuery,
            (snapshot) => {
              const programTitle =
                localized(
                  program.titleI18n ||
                  program.title
                );

              const programItems =
                snapshot.docs.map((lessonDoc) => ({
                  id: lessonDoc.id,
                  ...lessonDoc.data(),
                  _programId: program.id,
                  _programTitle: programTitle,
                  _programAccessLesson: true,
                }));

              lessonsByProgram.set(
                program.id,
                programItems
              );

              publishMergedLessons();
            },
            (lessonError) => {
              console.error(
                "Program lessons query failed:",
                program.id,
                lessonError
              );

              lessonsByProgram.set(
                program.id,
                []
              );

              publishMergedLessons();

              if (active) {
                setError(
                  text(
                    "Could not load one of your program lessons.",
                    "تعذر تحميل بعض دروس برنامجك."
                  )
                );
              }
            }
          );

          lessonStops.push(stop);
        });
      } catch (loadError) {
        console.error(
          "Load My Programs lessons failed:",
          loadError
        );

        if (active) {
          setError(
            text(
              "Could not load your program lessons.",
              "تعذر تحميل دروس برامجك."
            )
          );
        }
      }
    };

    loadProgramLessons();

    const refreshOnFocus = () => {
      clearLessonStops();
      loadProgramLessons();
    };

    window.addEventListener(
      "focus",
      refreshOnFocus
    );

    return () => {
      active = false;
      clearLessonStops();

      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
    };
  }, [language, student]);

  const visibleLessons = Array.from(
    new Map(
      [...programLessons, ...lessons].map((lesson) => [
        lesson._programAccessLesson
          ? `program:${lesson._programId}:${lesson.id}`
          : `class:${lesson.id}`,
        lesson,
      ])
    ).values()
  );


  /* ============================
     COMPLETION STATUS
     Includes both class lessons and program lessons.
  ============================ */

  useEffect(() => {
    let active = true;

    const loadCompletionStatus = async () => {
      await auth.authStateReady();

      const currentUser = auth.currentUser;

      if (!currentUser) {
        return;
      }

      const allVisibleLessons = [
        ...programLessons,
        ...lessons,
      ];

      const uniqueLessons = Array.from(
        new Map(
          allVisibleLessons.map((lesson) => [
            lesson.id,
            lesson,
          ])
        ).values()
      );

      if (uniqueLessons.length === 0) {
        if (active) {
          setCompletedLessons({});
        }
        return;
      }

      try {
        const completionResults = await Promise.all(
          uniqueLessons.map(async (lesson) => {
            const completionId =
              `${currentUser.uid}_${lesson.id}`;

            const completionSnapshot =
              await getDoc(
                doc(
                  db,
                  "lessonCompletions",
                  completionId
                )
              );

            return {
              lessonId: lesson.id,
              completed: completionSnapshot.exists(),
            };
          })
        );

        if (!active) {
          return;
        }

        const completionMap = {};

        completionResults.forEach((result) => {
          completionMap[result.lessonId] =
            result.completed;
        });

        setCompletedLessons(completionMap);
      } catch (completionError) {
        console.error(
          "Load all lesson completions error:",
          completionError
        );
      }
    };

    loadCompletionStatus();

    return () => {
      active = false;
    };
  }, [lessons, programLessons]);

  /* ============================
     ACTIVITY
  ============================ */

  const getActivity =
    (activityType) => {
      return (
        activityTypes[
          activityType
        ] ||
        activityTypes.lesson
      );
    };



  const renderLessonCard = (lesson) => {
    const activity =
      getActivity(
        lesson.activityType
      );

    const isCompleted =
      completedLessons[
        lesson.id
      ] === true;

    return (
      <article
        className="student-lesson-card"
        key={
          lesson._programAccessLesson
            ? `program:${lesson._programId}:${lesson.id}`
            : `class:${lesson.id}`
        }
      >

        <div className="student-lesson-card-top">

          <div className="student-lesson-icon">
            {activity.icon}
          </div>

          <div className="student-lesson-type">
            {text(
              activity.en,
              activity.ar
            )}
          </div>

          {isCompleted && (
            <div className="student-lesson-completed-badge">
              ✅{" "}
              {lesson.activityType === "mission"
                ? text(
                    "Mission completed",
                    "تمت المهمة",
                    "המשימה הושלמה"
                  )
                : text(
                    "Lesson completed",
                    "تم إنهاء الدرس",
                    "השיעור הושלם"
                  )}
            </div>
          )}

        </div>

        <div className="student-lesson-program-name">
          {lesson._programAccessLesson
            ? (
                <>
                  🚀{" "}
                  {text(
                    "Program:",
                    "البرنامج:",
                    "תוכנית:"
                  )}{" "}
                  {lesson._programTitle ||
                    text(
                      "Program",
                      "برنامج",
                      "תוכנית"
                    )}
                </>
              )
            : (
                <>
                  🏫{" "}
                  {text(
                    "Class:",
                    "الصف:",
                    "כיתה:"
                  )}{" "}
                  {lesson.className ||
                    student?.className ||
                    text(
                      "Class lesson",
                      "درس صف",
                      "שיעור כיתה"
                    )}
                </>
              )}
        </div>

        <h2>
          {localized(
            lesson.titleI18n ||
            lesson.title
          )}
        </h2>

        <p className="student-lesson-description">
          {localized(
            lesson.descriptionI18n ||
            lesson.description
          ) ||
            text(
              "A new learning adventure is waiting for you.",
              "مغامرة تعليمية جديدة بانتظارك."
            )}
        </p>

        <div className="student-lesson-meta">

          <span>
            ⏱{" "}
            {lesson.estimatedMinutes || 0}{" "}
            {text(
              "min",
              "دقيقة"
            )}
          </span>

          <span className="lesson-xp-pill">
            ⭐ +{lesson.xpReward || 0} XP
          </span>

        </div>

        <button
          type="button"
          className={
            isCompleted
              ? "start-student-lesson completed"
              : "start-student-lesson"
          }
          onClick={() =>
            navigate(
              lesson._programAccessLesson
                ? `/programs/${lesson._programId}/lessons/${lesson.id}`
                : `/student/lessons/${lesson.id}`
            )
          }
        >
          {isCompleted
            ? text(
                lesson.activityType === "mission"
                  ? "Review Mission"
                  : "Review Lesson",
                lesson.activityType === "mission"
                  ? "مراجعة المهمة"
                  : "مراجعة الدرس",
                lesson.activityType === "mission"
                  ? "צפייה חוזרת במשימה"
                  : "חזרה על השיעור"
              )
            : text(
                lesson.activityType === "mission"
                  ? "Start Mission"
                  : "Start Lesson",
                lesson.activityType === "mission"
                  ? "ابدأ المهمة"
                  : "ابدأ الدرس",
                lesson.activityType === "mission"
                  ? "התחל משימה"
                  : "התחל שיעור"
              )}

          {" "}
          {isCompleted ? "🔄" : "🚀"}
        </button>

      </article>
    );
  };


  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="student-lessons-loading">

        <div>
          📚
        </div>


        <p>
          {text(
            "Loading your lessons...",
            "جارٍ تحميل دروسك..."
          )}
        </p>

      </div>
    );
  }


  /* ============================
     PAGE
  ============================ */

  return (
    <div
      className="student-lessons-page"
      dir={
        language === "ar" || language === "he"
          ? "rtl"
          : "ltr"
      }
    >

      {/* =====================
          TOPBAR
      ====================== */}

      <header className="student-lessons-topbar">

        <div>

          <button
            type="button"
            className="student-lessons-back"
            onClick={() =>
              navigate(
                "/student"
              )
            }
          >
            {language === "ar"
              ? "↩ رجوع للرئيسية"
              : language === "he"
                ? "→ חזרה ללוח הבקרה"
                : "← Back to Dashboard"}
          </button>


          <h1>
            📚{" "}
            {text(
              "My Lessons",
              "دروسي",
              "השיעורים שלי"
            )}
          </h1>


          <p>
            {student?.className
              ? text(
                  `Lessons for ${student.className}`,
                  `دروس صف ${student.className}`
                )
              : text(
                  "Your learning lessons.",
                  "دروسك التعليمية.",
                  "השיעורים שלך."
                )}
          </p>

        </div>


        <div className="student-lessons-language">

          <button
            type="button"
            className={
              language === "en"
                ? "active"
                : ""
            }
            onClick={() =>
              setLanguage("en")
            }
          >
            EN
          </button>


          <button
            type="button"
            className={
              language === "ar"
                ? "active"
                : ""
            }
            onClick={() =>
              setLanguage("ar")
            }
          >
            عربي
          </button>

          <button
            type="button"
            className={
              language === "he"
                ? "active"
                : ""
            }
            onClick={() =>
              setLanguage("he")
            }
          >
            עברית
          </button>

        </div>

      </header>


      {/* =====================
          CLASS INFORMATION
      ====================== */}

      {student?.classId && (
        <section className="student-lessons-class">

          <div className="student-lessons-class-icon">
            🏫
          </div>


          <div>

            <small>
              {text(
                "My Class",
                "صفي",
                "הכיתה שלי"
              )}
            </small>


            <h2>
              {student.className ||
                text(
                  "My Class",
                  "صفي"
                )}
            </h2>


            <p>
              {student.classCode}
            </p>

          </div>


          <div className="student-lessons-count">

            <strong>
              {visibleLessons.length}
            </strong>


            <span>
              {text(
                "Lessons",
                "دروس"
              )}
            </span>

          </div>

        </section>
      )}


      {/* ERROR */}

      {error && (
        <div className="student-lessons-error">
          ⚠️ {error}
        </div>
      )}


      {/* =====================
          NO CLASS
      ====================== */}

      {programLessons.length === 0 && lessons.length === 0 ? (

        <section className="student-lessons-empty">

          <div>
            📚
          </div>

          <h2>
            {text(
              "No lessons yet",
              "لا توجد دروس بعد",
              "אין שיעורים עדיין"
            )}
          </h2>

          <p>
            {text(
              "Lessons from My Programs or your class will appear here.",
              "دروس «برامجي» أو دروس الصف ستظهر هنا.",
              "השיעורים מהתוכניות שלי או מהכיתה יופיעו כאן."
            )}
          </p>

        </section>

      ) : (

        <div className="student-lessons-sections">

          {programLessons.length > 0 && (
            <section className="student-lessons-section">

              <div className="student-lessons-section-header">
                <div>
                  <small>
                    {text(
                      "MY PROGRAMS",
                      "برامجي"
                    )}
                  </small>

                  <h2>
                    📘{" "}
                    {text(
                      "Program Lessons",
                      "دروس برامجي",
                      "שיעורי התוכניות שלי"
                    )}
                  </h2>

                  <p>
                    {text(
                      "All lessons available to you from your selected programs.",
                      "كل الدروس المتاحة لك من البرامج الموجودة في «برامجي»."
                    )}
                  </p>
                </div>

                <strong>
                  {programLessons.length}
                </strong>
              </div>

              <div className="student-lessons-grid">
                {programLessons.map(
                  renderLessonCard
                )}
              </div>

            </section>
          )}

          {lessons.length > 0 && (
            <section className="student-lessons-section">

              <div className="student-lessons-section-header">
                <div>
                  <small>
                    {text(
                      "CLASS",
                      "الصف"
                    )}
                  </small>

                  <h2>
                    🏫{" "}
                    {text(
                      "Class Lessons",
                      "دروس الصف",
                      "שיעורי הכיתה"
                    )}
                  </h2>

                  <p>
                    {text(
                      "Lessons published by your teacher.",
                      "الدروس التي نشرها لك المعلّم."
                    )}
                  </p>
                </div>

                <strong>
                  {lessons.length}
                </strong>
              </div>

              <div className="student-lessons-grid">
                {lessons.map(
                  renderLessonCard
                )}
              </div>

            </section>
          )}

        </div>

      )}

    </div>
  );
}


export default StudentLessons;
