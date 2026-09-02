import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  signOut,
} from "firebase/auth";

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

import "./StudentDashboard.css";


function StudentDashboard() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  const text = (
    en,
    ar
  ) =>
    language === "ar"
      ? ar
      : en;


  /* =========================
     PROGRAM NAMES
  ========================= */

  const programs = {
    firstGradeCompanion: {
      icon: "🎒",
      en: "First Grade Companion",
      ar: "رفيق الصف الأول",
    },

    techExplorer: {
      icon: "🚀",
      en: "Tech Explorer",
      ar: "مستكشف التكنولوجيا",
    },

    giftedChallenge: {
      icon: "🧠",
      en: "Gifted Challenge",
      ar: "تحديات الموهوبين",
    },

    aiExplorer: {
      icon: "🤖",
      en: "AI Explorer",
      ar: "مستكشف الذكاء الاصطناعي",
    },

    codeCreator: {
      icon: "💻",
      en: "Code Creator",
      ar: "صانع البرمجيات",
    },

    digitalCreator: {
      icon: "🎨",
      en: "Digital Creator",
      ar: "المبدع الرقمي",
    },
  };


  /* =========================
     LOAD STUDENT
  ========================= */

  useEffect(() => {
    const loadStudent =
      async () => {
        try {
          const user =
            auth.currentUser;

          if (!user) {
            navigate(
              "/login"
            );

            return;
          }


          const snapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (
            !snapshot.exists()
          ) {
            navigate(
              "/login"
            );

            return;
          }


          const data =
            snapshot.data();


          if (
            data.role !==
            "student"
          ) {
            navigate(
              "/teacher"
            );

            return;
          }


          setStudent(
            data
          );

        } catch (error) {
          console.error(
            "Student dashboard error:",
            error
          );

        } finally {
          setLoading(false);
        }
      };


    loadStudent();

  }, [navigate]);


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout =
    async () => {
      await signOut(auth);

      navigate(
        "/login"
      );
    };


  if (loading) {
    return (
      <div className="student-loading">

        <div>
          🚀
        </div>

        <p>
          {text(
            "Loading your learning world...",
            "جارٍ تحميل عالمك التعليمي..."
          )}
        </p>

      </div>
    );
  }


  if (!student) {
    return null;
  }


  const program =
    programs[
      student.learningTrack ||
      student.selectedTrack
    ];


  const xp =
    student.xp || 0;

  const level =
    student.level || 1;

  const xpNeeded =
    level * 500;

  const progress =
    Math.min(
      100,
      Math.round(
        (xp / xpNeeded) *
          100
      )
    );


  return (
    <div className="student-dashboard">

      {/* =====================
          TOPBAR
      ====================== */}

      <header className="student-topbar">

        <div className="student-brand">
          <div>
            🚀
          </div>

          <h2>
            TechMinds
          </h2>
        </div>


        <div className="student-top-actions">

          <div className="student-language">

            <button
              className={
                language === "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "en"
                )
              }
            >
              EN
            </button>

            <button
              className={
                language === "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "ar"
                )
              }
            >
              عربي
            </button>

          </div>


          <button
            className="student-logout"
            onClick={
              handleLogout
            }
          >
            🚪{" "}
            {text(
              "Logout",
              "خروج"
            )}
          </button>

        </div>

      </header>


      {/* =====================
          HERO
      ====================== */}

      <section className="student-hero">

        <div>

          <span className="student-hello">
            👋{" "}
            {text(
              "Welcome back",
              "أهلًا بعودتك"
            )}
          </span>


          <h1>
            {student.name}! 🌟
          </h1>


          <p>
            {text(
              "What amazing thing will you discover today?",
              "شو الشيء المميز اللي رح تكتشفه اليوم؟"
            )}
          </p>

        </div>


        <div className="student-avatar-large">
          🧑‍🚀
        </div>

      </section>


      {/* =====================
          STATS
      ====================== */}

      <section className="student-stats">

        <div className="student-stat purple">

          <div>
            ⭐
          </div>

          <span>
            XP
          </span>

          <strong>
            {xp}
          </strong>

        </div>


        <div className="student-stat blue">

          <div>
            🚀
          </div>

          <span>
            {text(
              "Level",
              "المستوى"
            )}
          </span>

          <strong>
            {level}
          </strong>

        </div>


        <div className="student-stat yellow">

          <div>
            🏆
          </div>

          <span>
            {text(
              "Badges",
              "الشارات"
            )}
          </span>

          <strong>
            {student.badges?.length || 0}
          </strong>

        </div>


        <div className="student-stat green">

          <div>
            🎨
          </div>

          <span>
            {text(
              "Projects",
              "المشاريع"
            )}
          </span>

          <strong>
            0
          </strong>

        </div>

      </section>


      {/* =====================
          MAIN
      ====================== */}

      <section className="student-main-grid">

        {/* JOURNEY */}

        <div className="student-panel journey-panel">

          <div className="panel-title">

            <div>
              {program?.icon ||
                "🚀"}
            </div>

            <div>
              <span>
                {text(
                  "My Learning Journey",
                  "رحلتي التعليمية"
                )}
              </span>

              <h2>
                {program
                  ? text(
                      program.en,
                      program.ar
                    )
                  : text(
                      "TechMinds Explorer",
                      "مستكشف TechMinds"
                    )}
              </h2>
            </div>

          </div>


          <div className="student-progress-text">

            <span>
              {text(
                "Level progress",
                "تقدم المستوى"
              )}
            </span>

            <strong>
              {progress}%
            </strong>

          </div>


          <div className="student-progress-bar">

            <div
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>


          <small>
            {xp} / {xpNeeded} XP
          </small>


          <button>
            {text(
              "Continue Learning 🚀",
              "تابع التعلّم 🚀"
            )}
          </button>

        </div>


        {/* TODAY CHALLENGE */}

        <div className="student-panel challenge-panel">

          <div className="challenge-badge">
            🔥{" "}
            {text(
              "TODAY'S CHALLENGE",
              "تحدي اليوم"
            )}
          </div>


          <div className="challenge-big-icon">
            🧩
          </div>


          <h2>
            {text(
              "Your next challenge is waiting!",
              "تحديك القادم بانتظارك!"
            )}
          </h2>


          <p>
            {text(
              "Complete challenges to earn XP and unlock new badges.",
              "أنجز التحديات لتحصل على XP وتفتح شارات جديدة."
            )}
          </p>

<button
  type="button"
  onClick={() =>
    navigate(
      "/student/lessons"
    )
  }
>
  📚{" "}
  {text(
    "My Lessons",
    "دروسي"
  )}
</button>
<button
  type="button"
  onClick={() =>
    navigate(
      "/student/portfolio"
    )
  }
>
  📁{" "}
  {text(
    "My Portfolio",
    "معرض أعمالي"
  )}
</button>
<button
  type="button"
  onClick={() =>
    navigate(
      "/student/lessons"
    )
  }
>
  {text(
    "Continue Learning 🚀",
    "تابع التعلّم 🚀"
  )}
</button>
          <button>
            {text(
              "Start Challenge",
              "ابدأ التحدي"
              
            )}

            {" "}🚀
          </button>

        </div>


        {/* CLASS */}

        <div className="student-panel class-panel">

          <span>
            🏫{" "}
            {text(
              "My Class",
              "صفي"
            )}
          </span>


          {student.classCode ? (
            <>

              <h2>
                {student.classCode}
              </h2>

              <p>
                {text(
                  "You are connected to your teacher's class.",
                  "أنت مرتبط بصف المعلّم."
                )}
              </p>

              <div className="connected-badge">
                ✓{" "}
                {text(
                  "Connected",
                  "متصل"
                )}
              </div>

            </>
          ) : (
           <>
  <h2>
    {text(
      "No class yet",
      "لست في صف بعد"
    )}
  </h2>

  <p>
    {text(
      "Join your teacher's class using a class code.",
      "انضم إلى صف المعلّم باستخدام رمز الصف."
    )}
  </p>

  <button
    className="join-class-dashboard-button"
    onClick={() =>
      navigate("/student/join-class")
    }
  >
    🏫{" "}
    {text(
      "Join a Class",
      "الانضمام إلى صف"
    )}
  </button>
</>
          )}

        </div>


        {/* BADGES */}

        <div className="student-panel badges-panel">

          <h3>
            🏆{" "}
            {text(
              "My Badges",
              "شاراتي"
            )}
          </h3>


          <div className="badge-list">

            <div>
              <span>🚀</span>

              <small>
                {text(
                  "Explorer",
                  "مستكشف"
                )}
              </small>
            </div>


            <div className="locked">
              <span>🤖</span>

              <small>
                AI
              </small>
            </div>


            <div className="locked">
              <span>💻</span>

              <small>
                Code
              </small>
            </div>


            <div className="locked">
              <span>🔐</span>

              <small>
                Cyber
              </small>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


export default StudentDashboard;