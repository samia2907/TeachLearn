import ProfileLink from '../components/ProfileLink';
import {
  useEffect,
  useMemo,
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

import "./OwnerDashboard.css";

import { hebrewText } from "../data/hebrewText";


function OwnerDashboard() {
  const navigate =
    useNavigate();

  const {
    language,
    changeLanguage,
  } = useLanguage();


  /* =====================================================
     STATE
  ===================================================== */

  const [
    owner,
    setOwner,
  ] = useState(null);

  const [
    programs,
    setPrograms,
  ] = useState([]);

  const [
    lessons,
    setLessons,
  ] = useState([]);

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     LANGUAGE
  ===================================================== */

  const text = (
    english,
    arabic,
    hebrew = hebrewText(english)
  ) => {
    if (
      language === "ar"
    ) {
      return arabic;
    }

    if (
      language === "he"
    ) {
      return hebrew;
    }

    return english;
  };


  const isRTL =
    language === "ar" ||
    language === "he";


  const localized =
    (value) => {
      if (!value) {
        return "";
      }

      if (
        typeof value ===
        "string"
      ) {
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


  /* =====================================================
     LOAD OWNER
  ===================================================== */

  useEffect(() => {
    const loadOwner =
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
            "owner"
          ) {
            if (
              data.role ===
              "teacher"
            ) {
              navigate(
                "/teacher"
              );
            } else {
              navigate(
                "/student"
              );
            }

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


          setOwner({
            uid:
              user.uid,

            email:
              user.email,

            ...data,
          });

        } catch (loadError) {
          console.error(
            "Owner dashboard load error:",
            loadError
          );

          setError(
            text(
              "Could not load Owner Dashboard.",

              "تعذر تحميل لوحة الإدارة.",

              "לא ניתן לטעון את לוח הניהול."
            )
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadOwner();

  }, [navigate]);


  /* =====================================================
     REAL-TIME PROGRAMS
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


    const programsQuery =
      query(
        collection(
          db,
          "programs"
        ),

        where(
          "createdBy",
          "==",
          user.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        programsQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (programDoc) => ({
                id:
                  programDoc.id,

                ...programDoc.data(),
              })
            );


          list.sort(
            (
              first,
              second
            ) => {
              const firstTime =
                first.updatedAt?.seconds ||
                first.createdAt?.seconds ||
                0;

              const secondTime =
                second.updatedAt?.seconds ||
                second.createdAt?.seconds ||
                0;


              return (
                secondTime -
                firstTime
              );
            }
          );


          setPrograms(
            list
          );
        },

        (programError) => {
          console.error(
            "Owner programs error:",
            programError
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     REAL-TIME COMMERCIAL LESSONS
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


    const lessonsQuery =
      query(
        collection(
          db,
          "lessons"
        ),

        where(
          "createdBy",
          "==",
          user.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        lessonsQuery,

        (snapshot) => {
          const list =
            snapshot.docs
              .map(
                (lessonDoc) => ({
                  id:
                    lessonDoc.id,

                  ...lessonDoc.data(),
                })
              )
              .filter(
                (lesson) =>
                  lesson.lessonType ===
                  "commercial"
              );


          setLessons(
            list
          );
        },

        (lessonError) => {
          console.error(
            "Owner lessons error:",
            lessonError
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     REAL-TIME USERS
  ===================================================== */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "users"
        ),

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (userDoc) => ({
                id:
                  userDoc.id,

                ...userDoc.data(),
              })
            );


          setUsers(
            list
          );
        },

        (usersError) => {
          console.error(
            "Owner users error:",
            usersError
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     STATS
  ===================================================== */

  const statistics =
    useMemo(
      () => {
        const published =
          programs.filter(
            (program) =>
              program.status ===
              "published"
          ).length;


        const drafts =
          programs.filter(
            (program) =>
              program.status !==
                "published" &&
              program.status !==
                "archived"
          ).length;


        const students =
          users.filter(
            (user) =>
              user.role ===
              "student"
          ).length;


        const teachers =
          users.filter(
            (user) =>
              user.role ===
              "teacher"
          ).length;


        const activeStudents =
          users.filter(
            (user) =>
              user.role ===
                "student" &&
              user.accountStatus !==
                "inactive" &&
              user.accountStatus !==
                "blocked"
          ).length;


        return {
          programs:
            programs.length,

          published,

          drafts,

          lessons:
            lessons.length,

          students,

          teachers,

          users:
            students +
            teachers,

          activeStudents,
        };
      },

      [
        programs,
        lessons,
        users,
      ]
    );


  /* =====================================================
     RECENT PROGRAMS
  ===================================================== */

  const recentPrograms =
    programs.slice(
      0,
      4
    );


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

      } catch (logoutError) {
        console.error(
          "Owner logout error:",
          logoutError
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div
        className="owner-loading"
        dir={
          isRTL
            ? "rtl"
            : "ltr"
        }
      >
        <div>
          👑
        </div>

        <p>
          {text(
            "Loading Owner Dashboard...",

            "جارٍ تحميل لوحة الإدارة...",

            "טוען את לוח הניהול..."
          )}
        </p>
      </div>
    );
  }


  if (!owner) {
    return (
      <div
        className="owner-loading"
        dir={
          isRTL
            ? "rtl"
            : "ltr"
        }
      >
        <p>
          {error ||
            text(
              "Owner account was not found.",

              "لم يتم العثور على حساب المالك.",

              "חשבון הבעלים לא נמצא."
            )}
        </p>
      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      className="owner-dashboard"
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="owner-sidebar">

        {/* BRAND */}

        <div className="owner-brand">

          <div className="owner-brand-icon">
            🚀
          </div>

          <div>

            <h2>
              TechMinds
            </h2>

            <span>
              👑{" "}

              {text(
                "Owner",

                "المالك",

                "בעלים"
              )}
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="owner-navigation">
          <button className="owner-nav-item" onClick={() => navigate('/owner/access')}>
            <span>🔑</span><span>{language === 'ar' ? 'إدارة الوصول' : language === 'he' ? 'ניהול גישה' : 'Access Management'}</span>
          </button>

          {/* OVERVIEW */}

          <button
            type="button"
            className="owner-nav-item active"
            onClick={() =>
              navigate(
                "/owner"
              )
            }
          >
            <span>
              🏠
            </span>

            {text(
              "Overview",

              "الرئيسية",

              "ראשי"
            )}
          </button>


          {/* PROGRAMS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/programs"
              )
            }
          >
            <span>
              📦
            </span>

            {text(
              "Programs",

              "البرامج",

              "תוכניות"
            )}

            <b className="owner-nav-count">
              {statistics.programs}
            </b>
          </button>


          {/* MARKETPLACE */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/programs"
              )
            }
          >
            <span>
              🛍️
            </span>

            {text(
              "Marketplace",

              "المتجر",

              "חנות התוכניות"
            )}
          </button>


          {/* CUSTOMERS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/customers"
              )
            }
          >
            <span>
              👥
            </span>

            {text(
              "Customers",

              "العملاء",

              "לקוחות"
            )}

            <b className="owner-nav-count">
              {statistics.users}
            </b>
          </button>


          {/* COURSE REGISTRATIONS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/course-registrations"
              )
            }
          >
            <span>
              🎓
            </span>

            {text(
              "Course Registrations",

              "طلبات الدورات",

              "הרשמות לקורסים"
            )}
          </button>


          {/* SALES */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/sales"
              )
            }
          >
            <span>
              💳
            </span>

            {text(
              "Sales",

              "المبيعات",

              "מכירות"
            )}
          </button>


          {/* MANAGE PLANS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/plans"
              )
            }
          >
            <span>
              💎
            </span>

            {text(
              "Plans Management",

              "إدارة الباقات",

              "ניהול תוכניות"
            )}
          </button>


          {/* ANALYTICS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/analytics"
              )
            }
          >
            <span>
              📊
            </span>

            {text(
              "Analytics",

              "الإحصائيات",

              "ניתוחים"
            )}
          </button>


          {/* SETTINGS */}

          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/owner/settings"
              )
            }
          >
            <span>
              ⚙️
            </span>

            {text(
              "Settings",

              "الإعدادات",

              "הגדרות"
            )}
          </button>

        </nav>


        {/* BOTTOM */}

        <div className="owner-sidebar-bottom">

          <div className="owner-account-mini">

            <div>
              👑
            </div>

            <div>

              <strong>
                {owner.name ||
                  text(
                    "Owner",
                    "المالك",
                    "בעלים"
                  )}
              </strong>

              <small>
                {text(
                  "Platform Owner",

                  "مالكة المنصة",

                  "בעלת הפלטפורמה"
                )}
              </small>

            </div>

          </div>


          <ProfileLink />
          <button
            type="button"
            className="owner-logout"
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

      <main className="owner-main">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="owner-topbar">

          <div>

            <small>
              TechMinds ADMINISTRATION
            </small>


            <h1>
              {text(
                `Welcome, ${
                  owner.name ||
                  "Owner"
                } 👋`,

                `أهلًا ${
                  owner.name ||
                  ""
                } 👋`,

                `שלום ${
                  owner.name ||
                  ""
                } 👋`
              )}
            </h1>


            <p>
              {text(
                "Manage your learning marketplace, content and TechMinds community.",

                "أديري متجر TechMinds والمحتوى والمستخدمين من مكان واحد.",

                "נהלו את החנות, התוכן וקהילת TechMinds ממקום אחד."
              )}
            </p>

          </div>


          <div className="owner-top-actions">

            {/* LANGUAGE */}

            <div className="owner-language">

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


            {/* MARKETPLACE PREVIEW */}

            <button
              type="button"
              className="owner-market-preview"
              onClick={() =>
                navigate(
                  "/programs"
                )
              }
            >
              👁️{" "}

              {text(
                "View Marketplace",

                "معاينة المتجر",

                "צפייה בחנות"
              )}
            </button>


            {/* PROFILE */}

            <div className="owner-profile">

              <div>
                👑
              </div>


              <span>

                <strong>
                  {owner.name ||
                    text(
                      "Owner",
                      "المالك",
                      "בעלים"
                    )}
                </strong>

                <small>
                  {text(
                    "Platform Owner",

                    "مالكة المنصة",

                    "בעלת הפלטפורמה"
                  )}
                </small>

              </span>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label={text(
                "Logout",
                "تسجيل الخروج",
                "התנתקות"
              )}
              title={text(
                "Logout",
                "تسجيل الخروج",
                "התנתקות"
              )}
              style={{
                minHeight: "42px",
                padding: "9px 14px",
                borderRadius: "12px",
                border: "1px solid #eadde8",
                background: "#fff7f7",
                color: "#b42318",
                font: "inherit",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span aria-hidden="true">🚪</span>

              {text(
                "Logout",
                "تسجيل الخروج",
                "התנתקות"
              )}
            </button>

          </div>

        </header>


        {/* ERROR */}

        {error && (
          <div className="owner-dashboard-error">
            ⚠️ {error}
          </div>
        )}


        {/* =================================================
            PRIMARY STATS
        ================================================= */}

        <section className="owner-stats">

          {/* PROGRAMS */}

          <div className="owner-stat-card">

            <div className="owner-stat-icon purple">
              📦
            </div>

            <div>

              <small>
                {text(
                  "Programs",

                  "البرامج",

                  "תוכניות"
                )}
              </small>

              <strong>
                {statistics.programs}
              </strong>

              <span>
                {statistics.published}{" "}

                {text(
                  "published",

                  "منشور",

                  "פורסמו"
                )}
              </span>

            </div>

          </div>


          {/* LESSONS */}

          <div className="owner-stat-card">

            <div className="owner-stat-icon blue">
              📚
            </div>

            <div>

              <small>
                {text(
                  "Commercial Lessons",

                  "الدروس التجارية",

                  "שיעורים מסחריים"
                )}
              </small>

              <strong>
                {statistics.lessons}
              </strong>

              <span>
                {text(
                  "Across all programs",

                  "ضمن جميع البرامج",

                  "בכל התוכניות"
                )}
              </span>

            </div>

          </div>


          {/* STUDENTS */}

          <div className="owner-stat-card">

            <div className="owner-stat-icon green">
              🎓
            </div>

            <div>

              <small>
                {text(
                  "Students",

                  "الطلاب",

                  "תלמידים"
                )}
              </small>

              <strong>
                {statistics.students}
              </strong>

              <span>
                {statistics.activeStudents}{" "}

                {text(
                  "active",

                  "فعّال",

                  "פעילים"
                )}
              </span>

            </div>

          </div>


          {/* TEACHERS */}

          <div className="owner-stat-card">

            <div className="owner-stat-icon orange">
              👩‍🏫
            </div>

            <div>

              <small>
                {text(
                  "Teachers",

                  "المعلمين",

                  "מורים"
                )}
              </small>

              <strong>
                {statistics.teachers}
              </strong>

              <span>
                {text(
                  "Registered teachers",

                  "معلمون مسجلون",

                  "מורים רשומים"
                )}
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            BUSINESS OVERVIEW
        ================================================= */}

        <section className="owner-business-overview">

          {/* SALES */}

          <div className="owner-business-stat revenue">

            <div>
              💳
            </div>

            <span>

              <small>
                {text(
                  "TOTAL SALES",

                  "إجمالي المبيعات",

                  "סה״כ מכירות"
                )}
              </small>

              <strong>
                ₪0
              </strong>

              <p>
                {text(
                  "Revenue will appear after live payment integration.",

                  "ستظهر الإيرادات بعد ربط الدفع الحقيقي.",

                  "ההכנסות יוצגו לאחר חיבור מערכת התשלומים."
                )}
              </p>

            </span>

          </div>


          {/* PUBLISHED */}

          <div className="owner-business-stat">

            <div>
              🌍
            </div>

            <span>

              <small>
                {text(
                  "PUBLISHED",

                  "البرامج المنشورة",

                  "פורסמו"
                )}
              </small>

              <strong>
                {statistics.published}
              </strong>

              <p>
                {text(
                  "Visible in Marketplace",

                  "تظهر في المتجر",

                  "מוצגות בחנות"
                )}
              </p>

            </span>

          </div>


          {/* DRAFTS */}

          <div className="owner-business-stat">

            <div>
              📝
            </div>

            <span>

              <small>
                {text(
                  "DRAFTS",

                  "المسودات",

                  "טיוטות"
                )}
              </small>

              <strong>
                {statistics.drafts}
              </strong>

              <p>
                {text(
                  "Still being prepared",

                  "ما زالت قيد التجهيز",

                  "עדיין בהכנה"
                )}
              </p>

            </span>

          </div>


          {/* COMMUNITY */}

          <div className="owner-business-stat">

            <div>
              👥
            </div>

            <span>

              <small>
                {text(
                  "COMMUNITY",

                  "المستخدمون",

                  "קהילה"
                )}
              </small>

              <strong>
                {statistics.users}
              </strong>

              <p>
                {text(
                  "Students + teachers",

                  "طلاب + معلمون",

                  "תלמידים + מורים"
                )}
              </p>

            </span>

          </div>

        </section>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section className="owner-content-grid">

          {/* =================================================
              PROGRAMS
          ================================================= */}

          <div className="owner-panel owner-program-panel">

            <div className="owner-panel-header">

              <div>

                <small>
                  CONTENT
                </small>

                <h2>
                  📦{" "}

                  {text(
                    "Programs for Sale",

                    "البرامج المعروضة للبيع",

                    "תוכניות למכירה"
                  )}
                </h2>

                <p>
                  {text(
                    "Your latest commercial learning programs.",

                    "أحدث البرامج التعليمية التجارية.",

                    "תוכניות הלמידה המסחריות האחרונות שלך."
                  )}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/owner/programs"
                  )
                }
              >
                {programs.length > 0
                  ? text(
                      "Manage Programs",

                      "إدارة البرامج",

                      "ניהול תוכניות"
                    )
                  : `+ ${text(
                      "Create Program",

                      "إنشاء برنامج",

                      "יצירת תוכנית"
                    )}`}
              </button>

            </div>


            {/* EMPTY PROGRAMS */}

            {recentPrograms.length ===
            0 ? (

              <div className="owner-empty-programs">

                <div className="owner-empty-icon">
                  📦
                </div>

                <h3>
                  {text(
                    "Create your first program",

                    "أنشئي برنامجك الأول",

                    "צרו את התוכנית הראשונה"
                  )}
                </h3>

                <p>
                  {text(
                    "Build a complete course with lessons, challenges and a final project.",

                    "أنشئي برنامجًا متكاملًا يحتوي على دروس وتحديات ومشروع نهائي.",

                    "בנו תוכנית מלאה עם שיעורים, אתגרים ופרויקט מסכם."
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/programs"
                    )
                  }
                >
                  +{" "}

                  {text(
                    "Create First Program",

                    "إنشاء أول برنامج",

                    "יצירת התוכנית הראשונה"
                  )}
                </button>

              </div>

            ) : (

              /* REAL PROGRAMS */

              <div className="owner-dashboard-program-list">

                {recentPrograms.map(
                  (program) => (

                    <button
                      type="button"
                      className="owner-dashboard-program"
                      key={
                        program.id
                      }
                      onClick={() =>
                        navigate(
                          `/owner/programs/${program.id}/lessons`
                        )
                      }
                    >

                      <div className="owner-dashboard-program-icon">
                        {program.icon ||
                          "🚀"}
                      </div>


                      <div className="owner-dashboard-program-info">

                        <div>

                          <small>
                            {program.status ===
                            "published"
                              ? text(
                                  "PUBLISHED",

                                  "منشور",

                                  "פורסם"
                                )
                              : text(
                                  "DRAFT",

                                  "مسودة",

                                  "טיוטה"
                                )}
                          </small>


                          <h3>
                            {localized(
                              program.title
                            )}
                          </h3>

                        </div>


                        <p>
                          {localized(
                            program.description
                          ) ||
                            text(
                              "No description yet.",

                              "لا يوجد وصف بعد.",

                              "עדיין אין תיאור."
                            )}
                        </p>


                        <div className="owner-dashboard-program-meta">

                          <span>
                            📚{" "}

                            {program.lessonCount ||
                              0}{" "}

                            {text(
                              "Lessons",

                              "دروس",

                              "שיעורים"
                            )}
                          </span>


                          <span>
                            🎓 ₪
                            {program.pricing
                              ?.student ??
                              0}
                          </span>


                          <span>
                            👩‍🏫 ₪
                            {program.pricing
                              ?.teacher ??
                              0}
                          </span>


                          <span>
                            👥 ₪
                            {program.pricing
                              ?.class ??
                              0}
                          </span>

                        </div>

                      </div>


                      <div className="owner-dashboard-program-arrow">
                        {isRTL
                          ? "←"
                          : "→"}
                      </div>

                    </button>

                  )
                )}


                {programs.length >
                  4 && (

                  <button
                    type="button"
                    className="owner-view-all-programs"
                    onClick={() =>
                      navigate(
                        "/owner/programs"
                      )
                    }
                  >
                    {text(
                      `View all ${programs.length} programs`,

                      `عرض جميع البرامج (${programs.length})`,

                      `הצגת כל התוכניות (${programs.length})`
                    )}
                  </button>

                )}

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="owner-side-column">

            {/* QUICK ACTIONS */}

            <div className="owner-panel">

              <div className="owner-small-panel-header">

                <span>
                  ⚡
                </span>

                <div>

                  <h3>
                    {text(
                      "Quick Actions",

                      "إجراءات سريعة",

                      "פעולות מהירות"
                    )}
                  </h3>

                  <p>
                    {text(
                      "Manage TechMinds",

                      "إدارة TechMinds",

                      "ניהול TechMinds"
                    )}
                  </p>

                </div>

              </div>


              <div className="owner-quick-actions">

                {/* CREATE PROGRAM */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/programs"
                    )
                  }
                >
                  <span>
                    📦
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Create Program",

                        "إنشاء برنامج",

                        "יצירת תוכנית"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Create a new program for sale",

                        "أنشئي برنامجًا جديدًا للبيع",

                        "צרו תוכנית חדשה למכירה"
                      )}
                    </small>

                  </div>

                  <b>
                    {isRTL
                      ? "‹"
                      : "›"}
                  </b>
                </button>


                {/* MARKETPLACE */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/programs"
                    )
                  }
                >
                  <span>
                    🛍️
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Preview Marketplace",

                        "معاينة المتجر",

                        "תצוגה מקדימה של החנות"
                      )}
                    </strong>

                    <small>
                      {text(
                        "See published programs",

                        "شاهدي البرامج المنشورة",

                        "צפו בתוכניות שפורסמו"
                      )}
                    </small>

                  </div>

                  <b>
                    {isRTL
                      ? "‹"
                      : "›"}
                  </b>
                </button>


                {/* MANAGE PLANS */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/plans"
                    )
                  }
                >
                  <span>
                    💎
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Manage Plans & Pricing",

                        "إدارة الباقات والأسعار",

                        "ניהול תוכניות ומחירים"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Change prices, features and availability",

                        "غيّري الأسعار والمميزات وتوفر الباقات",

                        "שנו מחירים, תכונות וזמינות"
                      )}
                    </small>

                  </div>

                  <b>
                    {isRTL
                      ? "‹"
                      : "›"}
                  </b>
                </button>


                {/* PREVIEW PLANS */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/plans"
                    )
                  }
                >
                  <span>
                    👁️
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Preview Plans",

                        "معاينة الباقات",

                        "תצוגה מקדימה של התוכניות"
                      )}
                    </strong>

                    <small>
                      {text(
                        "See what customers see",

                        "شاهدي ما يراه المستخدمون",

                        "ראו מה הלקוחות רואים"
                      )}
                    </small>

                  </div>

                  <b>
                    {isRTL
                      ? "‹"
                      : "›"}
                  </b>
                </button>

              </div>

            </div>


            {/* PLATFORM STATUS */}

            <div className="owner-panel owner-platform-status">

              <div className="owner-small-panel-header">

                <span>
                  🚀
                </span>

                <div>

                  <h3>
                    {text(
                      "Platform Status",

                      "حالة المنصة",

                      "מצב הפלטפורמה"
                    )}
                  </h3>

                  <p>
                    TechMinds
                  </p>

                </div>

              </div>


              <div className="owner-status-list">

                <div>

                  <span className="owner-status-dot active">
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Owner System",

                        "نظام المالك",

                        "מערכת בעלים"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",

                        "فعّال",

                        "פעיל"
                      )}
                    </small>

                  </div>

                  <b>
                    ✓
                  </b>

                </div>


                <div>

                  <span className="owner-status-dot active">
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Programs",

                        "البرامج",

                        "תוכניות"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",

                        "فعّال",

                        "פעיל"
                      )}
                    </small>

                  </div>

                  <b>
                    ✓
                  </b>

                </div>


                <div>

                  <span className="owner-status-dot active">
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Lesson Builder",

                        "محرر الدروس",

                        "עורך שיעורים"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",

                        "فعّال",

                        "פעיל"
                      )}
                    </small>

                  </div>

                  <b>
                    ✓
                  </b>

                </div>


                <div>

                  <span className="owner-status-dot active">
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Plans Management",

                        "إدارة الباقات",

                        "ניהול תוכניות"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",

                        "فعّال",

                        "פעיל"
                      )}
                    </small>

                  </div>

                  <b>
                    ✓
                  </b>

                </div>


                <div>

                  <span className="owner-status-dot pending">
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Live Payments",

                        "الدفع الحقيقي",

                        "תשלומים חיים"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Setup pending",

                        "بانتظار الربط",

                        "ממתין לחיבור"
                      )}
                    </small>

                  </div>

                  <b>
                    …
                  </b>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            BUSINESS ROADMAP
        ================================================= */}

        <section className="owner-roadmap">

          <div className="owner-roadmap-heading">

            <div>

              <small>
                BUSINESS
              </small>

              <h2>
                {text(
                  "TechMinds Commerce",

                  "تجارة TechMinds",

                  "מסחר TechMinds"
                )}
              </h2>

              <p>
                {text(
                  "The commercial foundation is ready. These features will activate as we connect the payment system.",

                  "الأساس التجاري أصبح جاهزًا. سيتم تفعيل هذه الميزات مع ربط نظام الدفع.",

                  "התשתית המסחרית מוכנה. התכונות הבאות יופעלו עם חיבור מערכת התשלומים."
                )}
              </p>

            </div>

          </div>


          <div className="owner-roadmap-grid">

            {/* PROGRAMS */}

            <div className="owner-roadmap-card ready">

              <span>
                ✓
              </span>

              <div>

                <small>
                  READY
                </small>

                <strong>
                  {text(
                    "Programs",

                    "البرامج",

                    "תוכניות"
                  )}
                </strong>

                <p>
                  {text(
                    "Create, price and publish programs.",

                    "إنشاء البرامج وتسعيرها ونشرها.",

                    "יצירה, תמחור ופרסום תוכניות."
                  )}
                </p>

              </div>

            </div>


            {/* LESSONS */}

            <div className="owner-roadmap-card ready">

              <span>
                ✓
              </span>

              <div>

                <small>
                  READY
                </small>

                <strong>
                  {text(
                    "Commercial Lessons",

                    "الدروس التجارية",

                    "שיעורים מסחריים"
                  )}
                </strong>

                <p>
                  {text(
                    "Build complete interactive lessons.",

                    "بناء دروس تفاعلية متكاملة.",

                    "בניית שיעורים אינטראקטיביים מלאים."
                  )}
                </p>

              </div>

            </div>


            {/* MARKETPLACE */}

            <div className="owner-roadmap-card ready">

              <span>
                ✓
              </span>

              <div>

                <small>
                  READY
                </small>

                <strong>
                  {text(
                    "Marketplace",

                    "المتجر",

                    "חנות"
                  )}
                </strong>

                <p>
                  {text(
                    "Programs can be shown to customers.",

                    "يمكن عرض البرامج للعملاء.",

                    "ניתן להציג תוכניות ללקוחות."
                  )}
                </p>

              </div>

            </div>


            {/* PLANS */}

            <div className="owner-roadmap-card ready">

              <span>
                ✓
              </span>

              <div>

                <small>
                  READY
                </small>

                <strong>
                  {text(
                    "Plans Management",

                    "إدارة الباقات",

                    "ניהול תוכניות"
                  )}
                </strong>

                <p>
                  {text(
                    "Manage prices and subscription plans.",

                    "إدارة الأسعار وباقات الاشتراك.",

                    "ניהול מחירים ותוכניות מנוי."
                  )}
                </p>

              </div>

            </div>


            {/* PAYMENTS */}

            <div className="owner-roadmap-card pending">

              <span>
                5
              </span>

              <div>

                <small>
                  NEXT
                </small>

                <strong>
                  {text(
                    "Payments",

                    "الدفع",

                    "תשלומים"
                  )}
                </strong>

                <p>
                  {text(
                    "Connect real payment processing.",

                    "ربط نظام الدفع الحقيقي.",

                    "חיבור מערכת תשלומים אמיתית."
                  )}
                </p>

              </div>

            </div>


            {/* SALES */}

            <div className="owner-roadmap-card pending">

              <span>
                6
              </span>

              <div>

                <small>
                  NEXT
                </small>

                <strong>
                  {text(
                    "Sales",

                    "المبيعات",

                    "מכירות"
                  )}
                </strong>

                <p>
                  {text(
                    "Orders, revenue and payment history.",

                    "الطلبات والإيرادات وسجل المدفوعات.",

                    "הזמנות, הכנסות והיסטוריית תשלומים."
                  )}
                </p>

              </div>

            </div>


            {/* CUSTOMERS */}

            <div className="owner-roadmap-card pending">

              <span>
                7
              </span>

              <div>

                <small>
                  NEXT
                </small>

                <strong>
                  {text(
                    "Customers",

                    "العملاء",

                    "לקוחות"
                  )}
                </strong>

                <p>
                  {text(
                    "Manage purchased program access.",

                    "إدارة وصول العملاء للبرامج.",

                    "ניהול גישה לתוכניות שנרכשו."
                  )}
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


export default OwnerDashboard;
