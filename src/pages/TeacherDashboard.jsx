import ProfileLink from '../components/ProfileLink';
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

import useSubscription
  from "../hooks/useSubscription";

import "./TeacherDashboard.css";

import { hebrewText } from "../data/hebrewText";


function TeacherDashboard() {
  const navigate =
    useNavigate();

  const {
    language,
    changeLanguage,
  } = useLanguage();


  /* =====================================================
     TRANSLATION
  ===================================================== */

  const text = (
    english,
    arabic,
    hebrew
  ) => {
    if (
      language === "ar"
    ) {
      return arabic;
    }

    if (
      language === "he"
    ) {
      return hebrew || hebrewText(english);
    }

    return english;
  };


  const isRTL =
    language === "ar" ||
    language === "he";


  /* =====================================================
     TEACHER
  ===================================================== */

  const [
    teacher,
    setTeacher,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    activePage,
    setActivePage,
  ] = useState(
    "dashboard"
  );


  /* =====================================================
     REAL FIRESTORE DATA
  ===================================================== */

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    totalStudents,
    setTotalStudents,
  ] = useState(0);


  /* =====================================================
     SUBSCRIPTION
  ===================================================== */

  const {
    loading:
      subscriptionLoading,

    planId,

    isActive,

    isTeacherPro,

    isTeacherBasic,
  } = useSubscription();


  /* =====================================================
     LEARNING TRACKS
  ===================================================== */

  const learningTracks = {
    firstGradeCompanion: {
      icon: "🎒",

      en:
        "First Grade Companion",

      ar:
        "رفيق الصف الأول",

      he:
        "מלווה לכיתה א׳",
    },

    techExplorer: {
      icon: "🚀",

      en:
        "Tech Explorer",

      ar:
        "مستكشف التكنولوجيا",

      he:
        "חוקר טכנולוגיה",
    },

    giftedChallenge: {
      icon: "🧠",

      en:
        "Gifted Challenge",

      ar:
        "تحديات الموهوبين",

      he:
        "אתגר למחוננים",
    },

    aiExplorer: {
      icon: "🤖",

      en:
        "AI Explorer",

      ar:
        "مستكشف الذكاء الاصطناعي",

      he:
        "חוקר בינה מלאכותית",
    },

    codeCreator: {
      icon: "💻",

      en:
        "Code Creator",

      ar:
        "صانع البرمجيات",

      he:
        "יוצר קוד",
    },

    digitalCreator: {
      icon: "🎨",

      en:
        "Digital Creator",

      ar:
        "المبدع الرقمي",

      he:
        "יוצר דיגיטלי",
    },
  };


  /* =====================================================
     LOAD TEACHER
  ===================================================== */

  useEffect(() => {
    const loadTeacher =
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
            "teacher"
          ) {
            navigate(
              data.role ===
                "owner"
                ? "/owner"
                : "/student"
            );

            return;
          }

          if (
            data.accountStatus ===
            "blocked"
          ) {
            await signOut(
              auth
            );

            navigate(
              "/login"
            );

            return;
          }

          setTeacher(
            data
          );
        } catch (
          error
        ) {
          console.error(
            "Teacher load error:",
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadTeacher();

  }, [navigate]);


  /* =====================================================
     REAL-TIME CLASSES
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;

    if (!user) {
      return undefined;
    }

    const classesQuery =
      query(
        collection(
          db,
          "classes"
        ),

        where(
          "teacherId",
          "==",
          user.uid
        )
      );

    const unsubscribe =
      onSnapshot(
        classesQuery,

        (
          snapshot
        ) => {
          const classList =
            snapshot.docs.map(
              (
                classDoc
              ) => ({
                id:
                  classDoc.id,

                ...classDoc.data(),
              })
            );

          setClasses(
            classList
          );

          const studentsCount =
            classList.reduce(
              (
                total,
                classItem
              ) =>
                total +
                Number(
                  classItem.studentCount ||
                  0
                ),

              0
            );

          setTotalStudents(
            studentsCount
          );
        },

        (
          error
        ) => {
          console.error(
            "Classes real-time error:",
            error
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout =
    async () => {
      try {
        await signOut(
          auth
        );

        navigate(
          "/login"
        );
      } catch (
        error
      ) {
        console.error(
          "Logout error:",
          error
        );
      }
    };


  /* =====================================================
     CURRENT PLAN
  ===================================================== */

  const currentPlanId =
    planId ||
    teacher?.plan ||
    "free";


  const getPlanName =
    () => {
      switch (
        currentPlanId
      ) {
        case "teacherBasic":
          return text(
            "Teacher Basic",

            "المعلّم الأساسي",

            "מסלול מורה בסיסי"
          );

        case "teacherPro":
          return text(
            "Teacher Pro",

            "المعلّم الاحترافي",

            "מסלול מורה Pro"
          );

        case "school":
          return text(
            "School",

            "المدرسة",

            "בית ספר"
          );

        default:
          return text(
            "Free",

            "مجاني",

            "חינם"
          );
      }
    };


  /* =====================================================
     MENU ITEMS
  ===================================================== */

  const menuItems = [
    {
      id:
        "dashboard",

      icon:
        "🏠",

      en:
        "Dashboard",

      ar:
        "الرئيسية",

      he:
        "ראשי",
    },

    {
      id:
        "classes",

      icon:
        "👥",

      en:
        "My Classes",

      ar:
        "صفوفي",

      he:
        "הכיתות שלי",
    },

    {
      id:
        "students",

      icon:
        "🎓",

      en:
        "Students",

      ar:
        "الطلاب",

      he:
        "תלמידים",
    },

    {
      id:
        "attendance",

      icon:
        "📅",

      en:
        "Attendance",

      ar:
        "الحضور",

      he:
        "נוכחות",
    },

    {
      id:
        "lessons",

      icon:
        "📚",

      en:
        "Lessons",

      ar:
        "الدروس",

      he:
        "שיעורים",
    },

    {
      id:
        "marketplace",

      icon:
        "🛍️",

      en:
        "Programs",

      ar:
        "البرامج",

      he:
        "תוכניות",
    },

    {
      id:
        "payments",

      icon:
        "💳",

      en:
        "Services & Contact",

      ar:
        "الخدمات والتواصل",

      he:
        "שירותים ויצירת קשר",
    },

    {
      id:
        "settings",

      icon:
        "⚙️",

      en:
        "Settings",

      ar:
        "الإعدادات",

      he:
        "הגדרות",
    },
  ];


  /* =====================================================
     MENU CLICK
  ===================================================== */

  const handleMenuClick =
    (
      itemId
    ) => {
      if (
        itemId ===
        "dashboard"
      ) {
        setActivePage(
          "dashboard"
        );

        return;
      }

      if (
        itemId ===
        "classes"
      ) {
        navigate(
          "/teacher/classes"
        );

        return;
      }

      if (
        itemId ===
        "students"
      ) {
        navigate(
          "/teacher/students"
        );

        return;
      }

      if (
        itemId ===
        "attendance"
      ) {
        navigate(
          "/teacher/attendance"
        );

        return;
      }

      if (
        itemId ===
        "lessons"
      ) {
        navigate(
          "/teacher/lessons"
        );

        return;
      }

      if (
        itemId ===
        "marketplace"
      ) {
        navigate(
          "/teacher/programs"
        );

        return;
      }

      if (
        itemId ===
        "payments"
      ) {
        navigate(
          "/plans"
        );

        return;
      }

      if (
        itemId ===
        "settings"
      ) {
        navigate(
          "/teacher/settings"
        );

        return;
      }

      setActivePage(
        itemId
      );
    };


  const currentMenuItem =
    menuItems.find(
      (
        item
      ) =>
        item.id ===
        activePage
    );


  /* =====================================================
     TRACK INFO
  ===================================================== */

  const getTrack =
    (
      trackId
    ) =>
      learningTracks[
        trackId
      ] || {
        icon:
          "📚",

        en:
          "Learning Program",

        ar:
          "برنامج تعليمي",

        he:
          "תוכנית לימודים",
      };


  /* =====================================================
     COPY CLASS CODE
  ===================================================== */

  const copyClassCode =
    async (
      code
    ) => {
      if (!code) {
        return;
      }

      try {
        await navigator
          .clipboard
          .writeText(
            code
          );
      } catch (
        error
      ) {
        console.error(
          "Copy code error:",
          error
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className="teacher-loading"
        dir={
          isRTL
            ? "rtl"
            : "ltr"
        }
      >
        <div>
          🚀
        </div>

        <p>
          {text(
            "Loading your dashboard...",

            "جارٍ تحميل لوحة التحكم...",

            "טוען את לוח הבקרה..."
          )}
        </p>
      </div>
    );
  }


  if (!teacher) {
    return null;
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      className="teacher-dashboard"
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="teacher-sidebar">

        {/* LOGO */}

        <div className="teacher-logo">

          <div className="teacher-logo-icon">
            🚀
          </div>

          <div>
            <h2>
              TechMinds
            </h2>

            <span>
              {text(
                "Teacher",

                "المعلّم",

                "מורה"
              )}
            </span>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="teacher-navigation">

          {menuItems.map(
            (
              item
            ) => (
              <button
                key={
                  item.id
                }

                type="button"

                className={
                  activePage ===
                  item.id
                    ? "teacher-nav-item active"
                    : "teacher-nav-item"
                }

                onClick={() =>
                  handleMenuClick(
                    item.id
                  )
                }
              >
                <span className="teacher-nav-icon">
                  {item.icon}
                </span>

                <span>
                  {text(
                    item.en,
                    item.ar,
                    item.he
                  )}
                </span>
              </button>
            )
          )}

        </nav>


        {/* BOTTOM */}

        <div className="teacher-sidebar-bottom">

          <div className="teacher-sidebar-plan">

            <span>
              {isTeacherPro
                ? "⭐"
                : isTeacherBasic
                ? "👩‍🏫"
                : "🆓"}
            </span>

            <div>

              <small>
                {text(
                  "Your Plan",

                  "خطتك",

                  "התוכנית שלך"
                )}
              </small>

              <strong>
                {subscriptionLoading
                  ? text(
                      "Loading...",

                      "جارٍ التحميل...",

                      "טוען..."
                    )
                  : getPlanName()}
              </strong>

            </div>

          </div>


          <ProfileLink />
          <button
            type="button"
            className="teacher-logout"
            onClick={
              handleLogout
            }
          >
            🚪{" "}

            {text(
              "Logout",

              "تسجيل الخروج",

              "התנתקות"
            )}
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="teacher-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="teacher-topbar">

          <div>

            <h1>
              {text(
                `Welcome, ${
                  teacher.name ||
                  "Teacher"
                } 👋`,

                `أهلًا ${
                  teacher.name ||
                  "بك"
                } 👋`,

                `שלום ${
                  teacher.name ||
                  "מורה"
                } 👋`
              )}
            </h1>

            <p>
              {text(
                "Ready to inspire your students today?",

                "جاهز لبدء تجربة تعليمية مميزة اليوم؟",

                "מוכנים ליצור חוויית למידה מצוינת היום?"
              )}
            </p>

          </div>


          <div className="teacher-top-actions">

            {/* LANGUAGE */}

            <div className="dashboard-language">

              <button
                type="button"

                className={
                  language ===
                  "en"
                    ? "active"
                    : ""
                }

                onClick={() =>
                  changeLanguage(
                    "en"
                  )
                }
              >
                EN
              </button>


              <button
                type="button"

                className={
                  language ===
                  "ar"
                    ? "active"
                    : ""
                }

                onClick={() =>
                  changeLanguage(
                    "ar"
                  )
                }
              >
                عربي
              </button>


              <button
                type="button"

                className={
                  language ===
                  "he"
                    ? "active"
                    : ""
                }

                onClick={() =>
                  changeLanguage(
                    "he"
                  )
                }
              >
                עברית
              </button>

            </div>


            {/* PROFILE */}

            <div className="teacher-profile">

              <div className="teacher-avatar">
                👩‍🏫
              </div>

              <div>

                <strong>
                  {teacher.name ||
                    text(
                      "Teacher",

                      "المعلّم",

                      "מורה"
                    )}
                </strong>

                <span>
                  {subscriptionLoading
                    ? text(
                        "Loading...",

                        "جارٍ التحميل...",

                        "טוען..."
                      )
                    : getPlanName()}
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activePage ===
          "dashboard" && (
          <>

            {/* =================================================
                CURRENT SUBSCRIPTION
            ================================================= */}

            <div className="teacher-plan-card">

              <div className="teacher-plan-icon">

                {isTeacherPro
                  ? "⭐"
                  : isTeacherBasic
                  ? "👩‍🏫"
                  : "🆓"}

              </div>


              <div>

                <small>
                  {text(
                    "CURRENT PLAN",

                    "الباقة الحالية",

                    "התוכנית הנוכחית"
                  )}
                </small>


                <h3>
                  {subscriptionLoading
                    ? text(
                        "Loading...",

                        "جارٍ التحميل...",

                        "טוען..."
                      )
                    : getPlanName()}
                </h3>


                <p>
                  {subscriptionLoading
                    ? text(
                        "Checking your subscription...",

                        "جارٍ التحقق من اشتراكك...",

                        "בודק את המנוי שלך..."
                      )

                    : isActive
                    ? text(
                        "Your subscription is active.",

                        "اشتراكك فعّال.",

                        "המנוי שלך פעיל."
                      )

                    : text(
                        "Upgrade to unlock more TechMinds features.",

                        "قم بترقية الباقة للحصول على ميزات إضافية في TechMinds.",

                        "שדרגו את התוכנית כדי לפתוח תכונות נוספות ב-TechMinds."
                      )}
                </p>

              </div>


              
            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <section className="teacher-stats">

              {/* CLASSES */}

              <div className="teacher-stat-card purple-stat">

                <div className="stat-icon">
                  👥
                </div>

                <div>

                  <span>
                    {text(
                      "Classes",

                      "الصفوف",

                      "כיתות"
                    )}
                  </span>

                  <strong>
                    {classes.length}
                  </strong>

                  <small>
                    {classes.length ===
                    0
                      ? text(
                          "Create your first class",

                          "أنشئ صفك الأول",

                          "צרו את הכיתה הראשונה"
                        )
                      : text(
                          "Active classes",

                          "صفوف فعّالة",

                          "כיתות פעילות"
                        )}
                  </small>

                </div>

              </div>


              {/* STUDENTS */}

              <div className="teacher-stat-card blue-stat">

                <div className="stat-icon">
                  🎓
                </div>

                <div>

                  <span>
                    {text(
                      "Students",

                      "الطلاب",

                      "תלמידים"
                    )}
                  </span>

                  <strong>
                    {totalStudents}
                  </strong>

                  <small>
                    {totalStudents ===
                    0
                      ? text(
                          "No students yet",

                          "لا يوجد طلاب بعد",

                          "אין עדיין תלמידים"
                        )
                      : text(
                          "Across all classes",

                          "في جميع الصفوف",

                          "בכל הכיתות"
                        )}
                  </small>

                </div>

              </div>


              {/* PLAN */}

              <div className="teacher-stat-card">

                <div className="stat-icon">

                  {isTeacherPro
                    ? "⭐"
                    : isTeacherBasic
                    ? "👩‍🏫"
                    : "💎"}

                </div>

                <div>

                  <span>
                    {text(
                      "Plan",

                      "الباقة",

                      "תוכנית"
                    )}
                  </span>

                  <strong className="teacher-plan-stat-name">
                    {subscriptionLoading
                      ? "..."
                      : getPlanName()}
                  </strong>

                  <small>
                    {isActive
                      ? text(
                          "Subscription active",

                          "الاشتراك فعّال",

                          "המנוי פעיל"
                        )
                      : text(
                          "Free account",

                          "حساب مجاني",

                          "חשבון חינמי"
                        )}
                  </small>

                </div>

              </div>

            </section>


            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="teacher-dashboard-grid">

              {/* =================================================
                  MY CLASSES
              ================================================= */}

              <div className="dashboard-panel classes-panel">

                <div className="panel-header">

                  <div>

                    <h2>
                      👥{" "}

                      {text(
                        "My Classes",

                        "صفوفي",

                        "הכיתות שלי"
                      )}
                    </h2>

                    <p>
                      {text(
                        "Manage your classes and students.",

                        "أدر الصفوف والطلاب من هنا.",

                        "נהלו את הכיתות והתלמידים שלכם מכאן."
                      )}
                    </p>

                  </div>


                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/teacher/classes"
                      )
                    }
                  >
                    +{" "}

                    {text(
                      "Create Class",

                      "إنشاء صف",

                      "יצירת כיתה"
                    )}
                  </button>

                </div>


                {/* NO CLASSES */}

                {classes.length ===
                0 ? (

                  <div className="empty-class-state">

                    <div>
                      🏫
                    </div>

                    <h3>
                      {text(
                        "No classes yet",

                        "لا توجد صفوف بعد",

                        "אין עדיין כיתות"
                      )}
                    </h3>

                    <p>
                      {text(
                        "Create your first class and start building an amazing learning experience.",

                        "أنشئ صفك الأول وابدأ ببناء تجربة تعليمية مميزة.",

                        "צרו את הכיתה הראשונה והתחילו לבנות חוויית למידה מצוינת."
                      )}
                    </p>

                    <button
                      type="button"

                      onClick={() =>
                        navigate(
                          "/teacher/classes"
                        )
                      }
                    >
                      +{" "}

                      {text(
                        "Create Your First Class",

                        "إنشاء الصف الأول",

                        "יצירת הכיתה הראשונה"
                      )}
                    </button>

                  </div>

                ) : (

                  /* REAL CLASSES */

                  <div className="dashboard-classes-list">

                    {classes
                      .slice(
                        0,
                        3
                      )
                      .map(
                        (
                          classItem
                        ) => {
                          const track =
                            getTrack(
                              classItem
                                .learningTrack
                            );

                          return (
                            <div
                              className="dashboard-class-item"

                              key={
                                classItem.id
                              }
                            >

                              {/* ICON */}

                              <div className="dashboard-class-icon">
                                {track.icon}
                              </div>


                              {/* INFO */}

                              <div className="dashboard-class-info">

                                <h3>
                                  {classItem.name}
                                </h3>

                                <p>
                                  {text(
                                    track.en,
                                    track.ar,
                                    track.he
                                  )}
                                </p>

                                <div className="dashboard-class-meta">

                                  <span>
                                    🎓{" "}

                                    {text(
                                      "Grade",

                                      "الصف",

                                      "כיתה"
                                    )}

                                    :{" "}

                                    {classItem.grade}
                                  </span>

                                  <span>
                                    👥{" "}

                                    {classItem
                                      .studentCount ||
                                      0}
                                  </span>

                                </div>

                              </div>


                              {/* CODE */}

                              <div className="dashboard-class-code">

                                <small>
                                  {text(
                                    "Class Code",

                                    "رمز الصف",

                                    "קוד כיתה"
                                  )}
                                </small>

                                <strong>
                                  {classItem
                                    .classCode}
                                </strong>

                                <button
                                  type="button"

                                  title={text(
                                    "Copy class code",

                                    "نسخ رمز الصف",

                                    "העתקת קוד הכיתה"
                                  )}

                                  onClick={() =>
                                    copyClassCode(
                                      classItem
                                        .classCode
                                    )
                                  }
                                >
                                  📋
                                </button>

                              </div>

                            </div>
                          );
                        }
                      )}


                    <button
                      type="button"

                      className="dashboard-view-all"

                      onClick={() =>
                        navigate(
                          "/teacher/classes"
                        )
                      }
                    >
                      {text(
                        "View All Classes",

                        "عرض كل الصفوف",

                        "הצגת כל הכיתות"
                      )}

                      {" "}

                      {isRTL
                        ? "←"
                        : "→"}
                    </button>

                  </div>

                )}

              </div>


              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <div className="dashboard-side-column">

                {/* PLAN */}

                <div className="dashboard-panel plan-panel">

                  <div className="plan-panel-icon">

                    {isTeacherPro
                      ? "⭐"
                      : isTeacherBasic
                      ? "👩‍🏫"
                      : "💎"}

                  </div>

                  <span>
                    {text(
                      "Current Plan",

                      "الخطة الحالية",

                      "התוכנית הנוכחית"
                    )}
                  </span>

                  <h3>
                    {subscriptionLoading
                      ? text(
                          "Loading...",

                          "جارٍ التحميل...",

                          "טוען..."
                        )
                      : getPlanName()}
                  </h3>

                  <div
                    className={`subscription-status ${
                      isActive
                        ? "active"
                        : ""
                    }`}
                  >
                    ●{" "}

                    {subscriptionLoading
                      ? text(
                          "Checking...",

                          "جارٍ التحقق...",

                          "בודק..."
                        )

                      : isActive
                      ? text(
                          "Active",

                          "فعّال",

                          "פעיל"
                        )

                      : text(
                          "Free / Inactive",

                          "مجاني / غير فعّال",

                          "חינם / לא פעיל"
                        )}
                  </div>

                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/plans"
                      )
                    }
                  >
                    {text(
                      "Manage Subscription",

                      "إدارة الاشتراك",

                      "ניהול המנוי"
                    )}
                  </button>

                </div>


                {/* QUICK ACTIONS */}

                <div className="dashboard-panel quick-panel">

                  <h3>
                    ⚡{" "}

                    {text(
                      "Quick Actions",

                      "إجراءات سريعة",

                      "פעולות מהירות"
                    )}
                  </h3>


                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/teacher/classes"
                      )
                    }
                  >
                    👥{" "}

                    {text(
                      "Create Class",

                      "إنشاء صف",

                      "יצירת כיתה"
                    )}
                  </button>


                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/teacher/students"
                      )
                    }
                  >
                    🎓{" "}

                    {text(
                      "Add Student",

                      "إضافة طالب",

                      "הוספת תלמיד"
                    )}
                  </button>


                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/teacher/lessons"
                      )
                    }
                  >
                    📚{" "}

                    {text(
                      "Create Lesson",

                      "إنشاء درس",

                      "יצירת שיעור"
                    )}
                  </button>


                  <button
                    type="button"

                    onClick={() =>
                      navigate(
                        "/teacher/programs"
                      )
                    }
                  >
                    🛍️{" "}

                    {text(
                      "Browse Programs",

                      "تصفح البرامج",

                      "עיון בתוכניות"
                    )}
                  </button>

                </div>

              </div>

            </section>

          </>
        )}


        {/* =================================================
            OTHER SECTIONS
        ================================================= */}

        {activePage !==
          "dashboard" && (

          <section className="teacher-content-page">

            <div className="content-page-icon">
              {currentMenuItem?.icon}
            </div>

            <h2>
              {text(
                currentMenuItem?.en ||
                  "",

                currentMenuItem?.ar ||
                  "",

                currentMenuItem?.he ||
                  ""
              )}
            </h2>

            <p>
              {text(
                "We will build this section next.",

                "سنقوم ببناء هذا القسم في الخطوة القادمة.",

                "נבנה את החלק הזה בשלב הבא."
              )}
            </p>


            {activePage ===
              "students" && (

              <button
                type="button"

                className="primary-content-button"

                onClick={() =>
                  navigate(
                    "/teacher/students"
                  )
                }
              >
                +{" "}

                {text(
                  "Add Student",

                  "إضافة طالب",

                  "הוספת תלמיד"
                )}
              </button>

            )}


            {activePage ===
              "attendance" && (

              <button
                type="button"

                className="primary-content-button"

                onClick={() =>
                  navigate(
                    "/teacher/attendance"
                  )
                }
              >
                📅{" "}

                {text(
                  "Open Attendance",

                  "فتح سجل الحضور",

                  "פתיחת נוכחות"
                )}
              </button>

            )}


            {activePage ===
              "lessons" && (

              <button
                type="button"

                className="primary-content-button"

                onClick={() =>
                  navigate(
                    "/teacher/lessons"
                  )
                }
              >
                +{" "}

                {text(
                  "Create Lesson",

                  "إنشاء درس",

                  "יצירת שיעור"
                )}
              </button>

            )}


            {activePage ===
              "marketplace" && (

              <button
                type="button"

                className="primary-content-button"

                onClick={() =>
                  navigate(
                    "/teacher/programs"
                  )
                }
              >
                🛍️{" "}

                {text(
                  "Browse Programs",

                  "تصفح البرامج",

                  "עיון בתוכניות"
                )}
              </button>

            )}


            {activePage ===
              "payments" && (

              <button
                type="button"

                className="primary-content-button"

                onClick={() =>
                  navigate(
                    "/plans"
                  )
                }
              >
                💳{" "}

                {text(
                  "Manage Subscription",

                  "إدارة الاشتراك",

                  "ניהול המנוי"
                )}
              </button>

            )}

          </section>

        )}

      </main>

    </div>
  );
}


export default TeacherDashboard;
