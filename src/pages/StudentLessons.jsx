import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
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
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./StudentLessons.css";

import { hebrewText } from "../data/hebrewText";


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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrewText(english)
      : english;


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


          /*
            Student has no class yet.
          */

          if (
            !studentData.classId
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
                "==",
                studentData.classId
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
    <div className="student-lessons-page">

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
              "دروسي"
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
                  "دروسك التعليمية."
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
                "صفي"
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
              {lessons.length}
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

      {!student?.classId ? (

        <section className="student-lessons-empty">

          <div>
            🏫
          </div>


          <h2>
            {text(
              "You are not in a class yet",
              "أنت لست في صف بعد"
            )}
          </h2>


          <p>
            {text(
              "Join a class to receive lessons from your teacher.",
              "انضم إلى صف حتى تظهر لك دروس المعلّم."
            )}
          </p>

        </section>

      ) : lessons.length === 0 ? (

        /* =====================
           NO LESSONS
        ====================== */

        <section className="student-lessons-empty">

          <div>
            📚
          </div>


          <h2>
            {text(
              "No lessons yet",
              "لا توجد دروس بعد"
            )}
          </h2>


          <p>
            {text(
              "Your teacher has not published any lessons yet.",
              "لم ينشر المعلّم أي دروس حتى الآن."
            )}
          </p>


          <span>
            🚀{" "}
            {text(
              "Come back soon!",
              "ارجع قريبًا!"
            )}
          </span>

        </section>

      ) : (

        /* =====================
           LESSONS GRID
        ====================== */

        <section className="student-lessons-grid">

          {lessons.map(
            (lesson) => {
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
                    lesson.id
                  }
                >

                  {/* TOP */}

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

    {text(
      "Completed",
      "تم إنهاء الدرس"
    )}

  </div>

)}
                  </div>


                  {/* TITLE */}

                  <h2>
                    {lesson.title}
                  </h2>


                  {/* DESCRIPTION */}

                  <p className="student-lesson-description">

                    {lesson.description ||
                      text(
                        "A new learning adventure is waiting for you.",
                        "مغامرة تعليمية جديدة بانتظارك."
                      )}

                  </p>


                  {/* META */}

                  <div className="student-lesson-meta">

                    <span>
                      ⏱{" "}
                      {lesson.estimatedMinutes ||
                        0}{" "}
                      {text(
                        "min",
                        "دقيقة"
                      )}
                    </span>


                    <span className="lesson-xp-pill">
                      ⭐ +
                      {lesson.xpReward ||
                        0}{" "}
                      XP
                    </span>

                  </div>


                  {/* BUTTON */}

                  <button
  type="button"
  className={
    isCompleted
      ? "start-student-lesson completed"
      : "start-student-lesson"
  }
  onClick={() =>
    navigate(
      `/student/lessons/${lesson.id}`
    )
  }
>

  {isCompleted
    ? text(
        "Review Lesson",
        "مراجعة الدرس"
      )
    : text(
        "Start Lesson",
        "ابدأ الدرس"
      )}

  {" "}

  {isCompleted
    ? "🔄"
    : "🚀"}

</button>

                </article>
              );
            }
          )}

        </section>
      )}

    </div>
  );
}


export default StudentLessons;
