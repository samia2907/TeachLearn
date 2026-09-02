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


function OwnerDashboard() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
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
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


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
              "تعذر تحميل لوحة الإدارة."
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
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


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
      <div className="owner-loading">

        <div>
          👑
        </div>


        <p>
          {text(
            "Loading Owner Dashboard...",
            "جارٍ تحميل لوحة الإدارة..."
          )}
        </p>

      </div>
    );
  }


  if (!owner) {
    return (
      <div className="owner-loading">

        <p>
          {error ||
            text(
              "Owner account was not found.",
              "لم يتم العثور على حساب المالك."
            )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="owner-sidebar">

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
                "المالك"
              )}
            </span>

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="owner-navigation">

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
              "الرئيسية"
            )}
          </button>


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
              "البرامج"
            )}


            <b className="owner-nav-count">
              {statistics.programs}
            </b>

          </button>


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
              "المتجر"
            )}
          </button>


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
    "العملاء"
  )}

  <b className="owner-nav-count">
    {statistics.users}
  </b>
</button>


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
    "المبيعات"
  )}
</button>
          <button
            type="button"
            className="owner-nav-item"
            onClick={() =>
              navigate(
                "/plans"
              )
            }
          >
            <span>
              💎
            </span>

            {text(
              "Plans",
              "الباقات"
            )}
          </button>
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
    "الإحصائيات"
  )}
</button>
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
    "الإعدادات"
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
                  "Owner"}
              </strong>

              <small>
                {text(
                  "Platform Owner",
                  "مالكة المنصة"
                )}
              </small>

            </div>

          </div>


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
              "تسجيل الخروج"
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
              TECHMINDS ADMINISTRATION
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
                } 👋`
              )}
            </h1>


            <p>
              {text(
                "Manage your learning marketplace, content and TechMinds community.",
                "أديري متجر TechMinds والمحتوى والمستخدمين من مكان واحد."
              )}
            </p>

          </div>


          <div className="owner-top-actions">

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
                  setLanguage(
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
                  setLanguage(
                    "ar"
                  )
                }
              >
                عربي
              </button>

            </div>


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
                "معاينة المتجر"
              )}
            </button>


            <div className="owner-profile">

              <div>
                👑
              </div>


              <span>

                <strong>
                  {owner.name ||
                    "Owner"}
                </strong>

                <small>
                  {text(
                    "Platform Owner",
                    "مالكة المنصة"
                  )}
                </small>

              </span>

            </div>

          </div>

        </header>


        {error && (
          <div className="owner-dashboard-error">
            ⚠️ {error}
          </div>
        )}


        {/* =================================================
            PRIMARY STATS
        ================================================= */}

        <section className="owner-stats">

          <div className="owner-stat-card">

            <div className="owner-stat-icon purple">
              📦
            </div>


            <div>

              <small>
                {text(
                  "Programs",
                  "البرامج"
                )}
              </small>

              <strong>
                {statistics.programs}
              </strong>

              <span>
                {statistics.published}{" "}
                {text(
                  "published",
                  "منشور"
                )}
              </span>

            </div>

          </div>


          <div className="owner-stat-card">

            <div className="owner-stat-icon blue">
              📚
            </div>


            <div>

              <small>
                {text(
                  "Commercial Lessons",
                  "الدروس التجارية"
                )}
              </small>

              <strong>
                {statistics.lessons}
              </strong>

              <span>
                {text(
                  "Across all programs",
                  "ضمن جميع البرامج"
                )}
              </span>

            </div>

          </div>


          <div className="owner-stat-card">

            <div className="owner-stat-icon green">
              🎓
            </div>


            <div>

              <small>
                {text(
                  "Students",
                  "الطلاب"
                )}
              </small>

              <strong>
                {statistics.students}
              </strong>

              <span>
                {statistics.activeStudents}{" "}
                {text(
                  "active",
                  "فعّال"
                )}
              </span>

            </div>

          </div>


          <div className="owner-stat-card">

            <div className="owner-stat-icon orange">
              👩‍🏫
            </div>


            <div>

              <small>
                {text(
                  "Teachers",
                  "المعلمين"
                )}
              </small>

              <strong>
                {statistics.teachers}
              </strong>

              <span>
                {text(
                  "Registered teachers",
                  "معلمون مسجلون"
                )}
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            BUSINESS OVERVIEW
        ================================================= */}

        <section className="owner-business-overview">

          <div className="owner-business-stat revenue">

            <div>
              💳
            </div>


            <span>

              <small>
                {text(
                  "TOTAL SALES",
                  "إجمالي المبيعات"
                )}
              </small>

              <strong>
                ₪0
              </strong>

              <p>
                {text(
                  "Revenue will appear after live payment integration.",
                  "ستظهر الإيرادات بعد ربط الدفع الحقيقي."
                )}
              </p>

            </span>

          </div>


          <div className="owner-business-stat">

            <div>
              🌍
            </div>


            <span>

              <small>
                {text(
                  "PUBLISHED",
                  "البرامج المنشورة"
                )}
              </small>

              <strong>
                {statistics.published}
              </strong>

              <p>
                {text(
                  "Visible in Marketplace",
                  "تظهر في المتجر"
                )}
              </p>

            </span>

          </div>


          <div className="owner-business-stat">

            <div>
              📝
            </div>


            <span>

              <small>
                {text(
                  "DRAFTS",
                  "المسودات"
                )}
              </small>

              <strong>
                {statistics.drafts}
              </strong>

              <p>
                {text(
                  "Still being prepared",
                  "ما زالت قيد التجهيز"
                )}
              </p>

            </span>

          </div>


          <div className="owner-business-stat">

            <div>
              👥
            </div>


            <span>

              <small>
                {text(
                  "COMMUNITY",
                  "المستخدمون"
                )}
              </small>

              <strong>
                {statistics.users}
              </strong>

              <p>
                {text(
                  "Students + teachers",
                  "طلاب + معلمون"
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
                    "البرامج المعروضة للبيع"
                  )}
                </h2>


                <p>
                  {text(
                    "Your latest commercial learning programs.",
                    "أحدث البرامج التعليمية التجارية."
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
                {programs.length >
                0
                  ? text(
                      "Manage Programs",
                      "إدارة البرامج"
                    )
                  : `+ ${text(
                      "Create Program",
                      "إنشاء برنامج"
                    )}`}
              </button>

            </div>


            {recentPrograms.length ===
            0 ? (

              <div className="owner-empty-programs">

                <div className="owner-empty-icon">
                  📦
                </div>


                <h3>
                  {text(
                    "Create your first program",
                    "أنشئي برنامجك الأول"
                  )}
                </h3>


                <p>
                  {text(
                    "Build a complete course with lessons, challenges and a final project.",
                    "أنشئي برنامجًا متكاملًا يحتوي على دروس وتحديات ومشروع نهائي."
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
                    "إنشاء أول برنامج"
                  )}
                </button>

              </div>

            ) : (

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
                                  "منشور"
                                )
                              : text(
                                  "DRAFT",
                                  "مسودة"
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
                              "لا يوجد وصف بعد."
                            )}
                        </p>


                        <div className="owner-dashboard-program-meta">

                          <span>
                            📚{" "}
                            {program.lessonCount ||
                              0}{" "}
                            {text(
                              "Lessons",
                              "دروس"
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
                        {language ===
                        "ar"
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
                      `عرض جميع البرامج (${programs.length})`
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
                      "إجراءات سريعة"
                    )}
                  </h3>


                  <p>
                    {text(
                      "Manage TechMinds",
                      "إدارة TechMinds"
                    )}
                  </p>

                </div>

              </div>


              <div className="owner-quick-actions">

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
                        "إنشاء برنامج"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Create a new program for sale",
                        "أنشئي برنامجًا جديدًا للبيع"
                      )}
                    </small>

                  </div>

                  <b>
                    ›
                  </b>
                </button>


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
                        "معاينة المتجر"
                      )}
                    </strong>

                    <small>
                      {text(
                        "See published programs",
                        "شاهدي البرامج المنشورة"
                      )}
                    </small>

                  </div>

                  <b>
                    ›
                  </b>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/plans"
                    )
                  }
                >
                  <span>
                    💎
                  </span>

                  <div>

                    <strong>
                      {text(
                        "Plans & Pricing",
                        "الباقات والأسعار"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Review subscription plans",
                        "راجعي باقات الاشتراك"
                      )}
                    </small>

                  </div>

                  <b>
                    ›
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
                      "حالة المنصة"
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
                        "نظام المالك"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",
                        "فعّال"
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
                        "البرامج"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",
                        "فعّال"
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
                        "محرر الدروس"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Active",
                        "فعّال"
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
                        "الدفع الحقيقي"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Setup pending",
                        "بانتظار الربط"
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
                  "تجارة TechMinds"
                )}
              </h2>


              <p>
                {text(
                  "The commercial foundation is ready. These features will activate as we connect the payment system.",
                  "الأساس التجاري أصبح جاهزًا. سيتم تفعيل هذه الميزات مع ربط نظام الدفع."
                )}
              </p>

            </div>

          </div>


          <div className="owner-roadmap-grid">

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
                    "البرامج"
                  )}
                </strong>

                <p>
                  {text(
                    "Create, price and publish programs.",
                    "إنشاء البرامج وتسعيرها ونشرها."
                  )}
                </p>

              </div>

            </div>


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
                    "الدروس التجارية"
                  )}
                </strong>

                <p>
                  {text(
                    "Build complete interactive lessons.",
                    "بناء دروس تفاعلية متكاملة."
                  )}
                </p>

              </div>

            </div>


            <div className="owner-roadmap-card ready">

              <span>
                ✓
              </span>

              <div>

                <small>
                  READY
                </small>

                <strong>
                  Marketplace
                </strong>

                <p>
                  {text(
                    "Programs can be shown to customers.",
                    "يمكن عرض البرامج للعملاء."
                  )}
                </p>

              </div>

            </div>


            <div className="owner-roadmap-card pending">

              <span>
                4
              </span>

              <div>

                <small>
                  NEXT
                </small>

                <strong>
                  {text(
                    "Payments",
                    "الدفع"
                  )}
                </strong>

                <p>
                  {text(
                    "Connect real payment processing.",
                    "ربط نظام الدفع الحقيقي."
                  )}
                </p>

              </div>

            </div>


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
                    "Sales",
                    "المبيعات"
                  )}
                </strong>

                <p>
                  {text(
                    "Orders, revenue and payment history.",
                    "الطلبات والإيرادات وسجل المدفوعات."
                  )}
                </p>

              </div>

            </div>


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
                    "Customers",
                    "العملاء"
                  )}
                </strong>

                <p>
                  {text(
                    "Manage purchased program access.",
                    "إدارة وصول العملاء للبرامج."
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