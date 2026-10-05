import { authEntry } from '../auth/returnTo.mjs';
import { manualAccessMode, programDestination } from '../access/programFlow.mjs';
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
  serverTimestamp,
  updateDoc,
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

import "./ProgramsMarketplace.css";
import { normalizeProgram } from "../../functions/programAccessPolicy.mjs";
import { programLicenseForRole } from "../firebase/paddleConfig";
import { httpsCallable } from "firebase/functions";
import { studentHasProgramAccess } from "../firebase/studentProgramAccess";

const checkProgramAccess = httpsCallable(
  functions,
  "checkProgramAccess"
);

function ProgramsMarketplace() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    userProfile,
    setUserProfile,
  ] = useState(null);

  const [
    programs,
    setPrograms,
  ] = useState([]);

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    accessMap,
    setAccessMap,
  ] = useState({});

  const [
    selectedClasses,
    setSelectedClasses,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");


  const text = (
    english,
    arabic,
    hebrew = english
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
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


  const safeId =
    (value) =>
      String(value || "")
        .replace(/\//g, "_")
        .replace(/\s+/g, "_");


  /* =====================================================
     LOAD USER
  ===================================================== */

  useEffect(() => {
    const loadUser =
      async () => {
        await auth.authStateReady();
        const user =
          auth.currentUser;


        if (!user) { setUserProfile({ role: "guest" });
          return;
        }


        try {
          const snapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (!snapshot.exists()) {
            navigate("/login");
            return;
          }


          setUserProfile({
            uid:
              user.uid,

            ...snapshot.data(),
          });

        } catch (error) {
          console.error(
            "Marketplace user error:",
            error
          );

          setMessage(
            text(
              "Could not load your account.",
              "تعذر تحميل حسابك."
            )
          );
        }
      };


    loadUser();

  }, [navigate]);


  /* =====================================================
     LOAD PUBLISHED PROGRAMS
  ===================================================== */

  useEffect(() => {
    const programsQuery =
      query(
        collection(
          db,
          "programs"
        ),

        where(
          "status",
          "==",
          "published"
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


          setPrograms(list);
          setLoading(false);
        },

        (error) => {
          console.error(
            "Marketplace programs error:",
            error
          );

          setLoading(false);

          setMessage(
            text(
              "Could not load programs.",
              "تعذر تحميل البرامج."
            )
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     LOAD TEACHER CLASSES
  ===================================================== */

  useEffect(() => {
    if (
      !userProfile ||
      userProfile.role !==
        "teacher"
    ) {
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
          userProfile.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        classesQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (classDoc) => ({
                id:
                  classDoc.id,

                ...classDoc.data(),
              })
            );


          setClasses(list);



        }
      );


    return () =>
      unsubscribe();

  }, [userProfile?.uid, userProfile?.role]);

  // Catalog changes update defaults without restarting the Firestore listener.
  useEffect(() => {
    if (userProfile?.role !== "teacher" || classes.length === 0) return;
    setSelectedClasses(current => {
      const next = { ...current };
      programs.forEach(program => {
        if (!next[program.id]) next[program.id] = classes[0].id;
      });
      return next;
    });
  }, [classes, programs, userProfile?.role]);

  /* =====================================================
     LOAD PROGRAM ACCESS
  ===================================================== */

  useEffect(() => {
    let active = true;
    let running = false;
    let queued = false;
    const checkAccess =
      async () => {
        if (
          !active || !userProfile?.uid || programs.length === 0
        ) {
          return;
        }
        // Keep one batch in flight; replay invalidations received during it.
        if (running) { queued = true; return; }
        running = true;
        try {


        const result = {};


        await Promise.all(
          programs.map(
            async (
              program
            ) => {
              try {
                result[program.id] = await studentHasProgramAccess(checkProgramAccess, program.id);
              } catch (error) {
                if (active && userProfile.role === "student") {
                  setMessage(text(
                    "Could not verify program access. Please try again.",
                    "تعذر التحقق من الوصول إلى البرنامج. يرجى المحاولة مجددًا.",
                    "לא ניתן לאמת את הגישה לתוכנית. נסו שוב.",
                  ));
                }
                console.error(
                  "Access check error:",
                  program.id,
                  error
                );
              }
            }
          )
        );


        if (active) setAccessMap(result);
        } finally {
          running = false;
          if (queued && active) {
            queued = false;
            void checkAccess();
          }
        }
      };


    // Recheck when returning from Paddle or another tab; checkout also waits for the entitlement.
    window.addEventListener("focus", checkAccess);
    const refresh = window.setInterval(checkAccess, 10000);
    const stopAccess = userProfile?.uid ? onSnapshot(
      query(collection(db, 'programAccess'), where('userId', '==', userProfile.uid)),
      checkAccess,
      failure => {
        console.error('Program access subscription failed', failure.code);
        void checkAccess();
      },
    ) : () => {};
    return () => {
      active = false;
      stopAccess();
      window.clearInterval(refresh);
      window.removeEventListener("focus", checkAccess);
    };

  }, [
    userProfile,
    programs,
  ]);


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredPrograms =
    useMemo(
      () => {
        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {
          return programs;
        }


        return programs.filter(
          (program) =>
            [
              localized(
                program.title
              ),

              localized(
                program.description
              ),

              program.category,
              program.level,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(value)
        );
      },

      [
        programs,
        search,
        language,
      ]
    );




  /* =====================================================
     MY PROGRAMS / OTHER PROGRAMS
  ===================================================== */

  const hasProgramAccess =
    (program) =>
      userProfile?.role === "owner" ||
      Boolean(accessMap[program.id]) ||
      normalizeProgram(program).accessType === "free";


  const myPrograms =
    filteredPrograms.filter(
      (program) => hasProgramAccess(program)
    );


  const otherPrograms =
    filteredPrograms.filter(
      (program) => !hasProgramAccess(program)
    );


  const sectionedPrograms = userProfile?.role === "guest" ? [
    {
      type: "section",
      id: "available-programs",
      section: "available",
      count: filteredPrograms.length,
    },
    ...filteredPrograms.map((program) => ({ type: "program", program })),
  ] : [
    {
      type: "section",
      id: "my-programs",
      section: "mine",
      count: myPrograms.length,
    },

    ...(myPrograms.length > 0
      ? myPrograms.map((program) => ({
          type: "program",
          program,
        }))
      : [
          {
            type: "empty-section",
            id: "my-programs-empty",
            section: "mine",
          },
        ]),

    ...(otherPrograms.length > 0
      ? [
          {
            type: "section",
            id: "other-programs",
            section: "other",
            count: otherPrograms.length,
          },

          ...otherPrograms.map((program) => ({
            type: "program",
            program,
          })),
        ]
      : []),
  ];


  /* =====================================================
     PURCHASE
  ===================================================== */

  const startPurchase =
    async (
      program,
      licenseType,
      classId = null
    ) => {
      const user =
        auth.currentUser;


      if (
        !user ||
        !userProfile
      ) {
        navigate("/login");
        return;
      }


      if (
        userProfile.role ===
        "owner"
      ) {
        setMessage(
          text(
            "Owner accounts can preview programs but cannot purchase them.",
            "حساب المالك مخصص لمعاينة البرامج ولا يقوم بالشراء.",
            "חשבונות בעלים יכולים לצפות בתוכניות אך אינם יכולים לרכוש אותן."
          )
        );

        return;
      }

      if (manualAccessMode && normalizeProgram(program).accessType !== 'class') {
        navigate(programDestination(program, accessMap[program.id]));
        return;
      }
      licenseType = programLicenseForRole(userProfile.role, licenseType);
      if (manualAccessMode && userProfile.role === "student") {
        setMessage(text("Payment coming soon", "الدفع قريبًا", "התשלום יתווסף בקרוב"));
        return;
      }
      if (!licenseType || !/^pri_[a-z0-9]{26}$/.test(program.paddlePriceIds?.[licenseType] || "")) {
        setMessage(text("This program is not available for purchase yet.", "هذا البرنامج غير متاح للشراء بعد.", "התוכנית עדיין אינה זמינה לרכישה."));
        return;
      }


      if (
        accessMap[
          program.id
        ] &&
        licenseType !==
          "class"
      ) {
        setMessage(
          text(
            "You already have access to this program.",
            "لديك وصول لهذا البرنامج بالفعل.",
            "כבר יש לך גישה לתוכנית הזו."
          )
        );

        return;
      }


      if (
        licenseType ===
          "class"
      ) {
        if (!classId) {
          setMessage(
            text(
              "Please select a class first.",
              "اختاري صفًا أولًا.",
              "בחרו כיתה תחילה."
            )
          );

          return;
        }


        /*
          Avoid charging again if this
          class already owns the program.
        */

        const classAccessId =
          `class_${safeId(
            classId
          )}_${safeId(
            program.id
          )}`;


        const classAccessSnapshot =
          await getDoc(
            doc(
              db,
              "programAccess",
              classAccessId
            )
          );


        if (
          classAccessSnapshot.exists() &&
          classAccessSnapshot.data()
            .status ===
            "active"
        ) {
          setMessage(
            text(
              "This class already has access to the program.",
              "هذا الصف لديه وصول للبرنامج بالفعل.",
              "לכיתה הזו כבר יש גישה לתוכנית."
            )
          );

          return;
        }
      }


      try {
        setProcessingId(
          `${program.id}-${licenseType}`
        );

        setMessage("");


        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),

          {
            pendingPurchase: {
              type:
                "program",

              programId:
                program.id,

              licenseType,

              classId:
                licenseType ===
                  "class"
                  ? classId
                  : null,

              createdAt:
                new Date().toISOString(),
            },

            pendingPurchaseUpdatedAt:
              serverTimestamp(),
          }
        );


        navigate(
          "/checkout?type=program"
        );

      } catch (error) {
        console.error(
          "Program purchase error:",
          error
        );


        setMessage(
          text(
            "Could not start the purchase.",
            "تعذر بدء عملية الشراء.",
            "לא ניתן להתחיל את הרכישה."
          )
        );

      } finally {
        setProcessingId("");
      }
    };


  /* =====================================================
     OPEN PROGRAM
  ===================================================== */

  const openProgram =
    (programId) => {
      /*
        We'll build this program-learning
        page after confirming purchase flow.
      */

      const program = programs.find(item => item.id === programId);
      if (!manualAccessMode && program?.accessType === 'paid' && !accessMap[programId] && userProfile.role !== 'owner') {
        startPurchase(program, userProfile.role); return;
      }
      navigate(programDestination(program || { id: programId }, userProfile.role === 'owner' || accessMap[programId]));
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading ||
    !userProfile
  ) {
    return (
      <div className="marketplace-loading">
        🚀

        <p>
          {text(
            "Loading TechMinds programs...",
            "جارٍ تحميل برامج TechMinds...",
            "תוכניות TechMinds נטענות..."
          )}
        </p>
      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="program-marketplace">

      <header className="marketplace-header">

        <div>

          <button
            type="button"
            className="marketplace-back"
            onClick={() => {
              if (
                userProfile.role ===
                "owner"
              ) {
                navigate("/owner");

              } else if (
                userProfile.role ===
                "teacher"
              ) {
                navigate("/teacher");

              } else {
                navigate(userProfile.role === "guest" ? "/" : "/student");
              }
            }}
          >
            {language === "ar"
              ? "↩ رجوع"
              : language === "he"
                ? "→ חזרה"
                : "← Back"}
          </button>


          <small>
            TechMinds MARKETPLACE
          </small>


          <h1>
            🚀{" "}
            {text(
              "Learning Programs",
              "البرامج التعليمية",
              "תוכניות למידה"
            )}
          </h1>


          <p>
            {text(
              "Choose a complete interactive learning program.",
              "اختاري برنامجًا تعليميًا تفاعليًا متكاملًا.",
              "בחרו תוכנית למידה אינטראקטיבית מלאה."
            )}
          </p>

        </div>


        <div className="marketplace-language">

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


      {message && (
        <div className="marketplace-message">
          {message}
        </div>
      )}


      <div className="marketplace-toolbar">

        <span>
          🔎
        </span>


        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder={
            text(
              "Search programs...",
              "ابحثي عن برنامج...",
              "חיפוש תוכניות..."
            )
          }
        />

      </div>


      {filteredPrograms.length ===
      0 ? (

        <div className="marketplace-empty">

          <div>
            📚
          </div>


          <h2>
            {text(
              "No published programs yet",
              "لا توجد برامج منشورة حاليًا",
              "עדיין אין תוכניות שפורסמו"
            )}
          </h2>

        </div>

      ) : (

        <div className="marketplace-program-grid">

          {sectionedPrograms.map(
            (item) => {

              if (item.type === "section") {
                const isMine =
                  item.section === "mine";

                return (
                  <div
                    className={`marketplace-section-header ${isMine ? "mine" : "other"}`}
                    key={item.id}
                  >
                    <div>
                      <span className="marketplace-section-icon">
                        {isMine ? "✨" : "🧭"}
                      </span>

                      <div>
                        <h2>
                          {item.section === "available"
                            ? text(
                                "Available Programs",
                                "البرامج المتاحة",
                                "תוכניות זמינות"
                              )
                            : isMine
                            ? text(
                                "My Programs",
                                "برامجي",
                                "התוכניות שלי"
                              )
                            : text(
                                "Other Programs",
                                "برامج أخرى",
                                "תוכניות נוספות"
                              )}
                        </h2>

                        <p>
                          {item.section === "available"
                            ? text(
                                "Explore TechMinds learning programs.",
                                "استكشف برامج TechMinds التعليمية.",
                                "גלו את תוכניות הלמידה של TechMinds."
                              )
                            : isMine
                            ? text(
                                "Programs you can open and continue now.",
                                "البرامج المتاحة لك للفتح والمتابعة الآن.",
                                "תוכניות שזמינות לך לפתיחה ולהמשך למידה."
                              )
                            : text(
                                "Explore more TechMinds learning programs.",
                                "استكشف برامج تعليمية إضافية من TechMinds.",
                                "גלו תוכניות למידה נוספות של TechMinds."
                              )}
                        </p>
                      </div>
                    </div>

                    <span className="marketplace-section-count">
                      {item.count}
                    </span>
                  </div>
                );
              }


              if (item.type === "empty-section") {
                return (
                  <div
                    className="marketplace-section-empty"
                    key={item.id}
                  >
                    <span>📚</span>

                    <div>
                      <strong>
                        {text(
                          "No programs here yet",
                          "ما عندك برامج بعد",
                          "עדיין אין לך תוכניות"
                        )}
                      </strong>

                      <p>
                        {text(
                          "Programs you receive access to will appear here.",
                          "أي برنامج تحصل على وصول إليه سيظهر هنا تلقائيًا.",
                          "תוכניות שתקבלו אליהן גישה יופיעו כאן אוטומטית."
                        )}
                      </p>
                    </div>
                  </div>
                );
              }


              const program =
                item.program;


              const hasAccess =
                Boolean(
                  accessMap[
                    program.id
                  ]
                );


              const teacherPrice =
                Number(
                  program.pricing
                    ?.teacher ||
                  0
                );


              const classPrice =
                Number(
                  program.pricing
                    ?.class ||
                  0
                );


              return (
                <article
                  className="marketplace-program-card"
                  key={program.id}
                >

                  <div className="marketplace-program-top">

                    <div className="marketplace-program-icon">
                      {program.icon ||
                        "🚀"}
                    </div>


                    <div>

                      <span className="marketplace-program-status">
                        ✓{" "}
                        {text(
                          "Published",
                          "منشور",
                          "פורסם"
                        )}
                      </span>


                      <h2>
                        {localized(
                          program.title
                        )}
                      </h2>

                    </div>

                  </div>


                  <p className="marketplace-description">

                    {localized(
                      program.description
                    ) ||
                      text(
                        "Interactive TechMinds learning program.",
                        "برنامج تعليمي تفاعلي من TechMinds.",
                        "תוכנית למידה אינטראקטיבית של TechMinds."
                      )}

                  </p>


                  <div className="marketplace-meta">

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


                    {program.level && (
                      <span>
                        🎯{" "}
                        {program.level}
                      </span>
                    )}


                    {program.ageFrom && (
                      <span>
                        👦{" "}
                        {program.ageFrom}
                        -
                        {program.ageTo ||
                          program.ageFrom}
                      </span>
                    )}

                  </div>


                  {program.finalProject && (
                    <div className="marketplace-project">

                      <small>
                        🏆{" "}
                        {text(
                          "FINAL PROJECT",
                          "المشروع النهائي",
                          "פרויקט גמר"
                        )}
                      </small>


                      <p>
                        {localized(
                          program.finalProject
                        )}
                      </p>

                    </div>
                  )}


                  <span className="marketplace-access-badge">
                    {normalizeProgram(program).accessType === "free"
                      ? text("Free", "مجاني", "חינם")
                      : normalizeProgram(program).accessType === "paid"
                        ? text("Paid", "مدفوع", "בתשלום")
                        : normalizeProgram(program).accessType === 'class'
                          ? text("Class access", "عبر الصف", "דרך הכיתה")
                          : text("Contact for access", "تواصل لفتح البرنامج", "צרו קשר לקבלת גישה")}
                  </span>
                  {userProfile.role === "guest" && <div className="marketplace-purchase-area">
 <button className="marketplace-open-button" onClick={() => navigate('/programs/' + encodeURIComponent(program.id))}>{text('View program', 'استعرض البرنامج', 'צפייה בתוכנית')}</button>
 <button className="marketplace-buy-button" onClick={() => navigate(authEntry('/programs/' + encodeURIComponent(program.id), '/register'))}>{text('Create an account to start', 'أنشئ حسابًا للبدء', 'צרו חשבון כדי להתחיל')}</button>
 </div>}
 {(userProfile.role === "student" || (userProfile.role === "teacher" && (manualAccessMode || normalizeProgram(program).accessType === "free"))) && (
                    <div className="marketplace-purchase-area">
                      {normalizeProgram(program).accessType === "paid" && Number(program.price) > 0 && (
                        <strong className="marketplace-price">₪{program.price}</strong>
                      )}
                      {hasAccess || normalizeProgram(program).accessType === 'free' ? (
                        <button type="button" className="marketplace-open-button" onClick={() => openProgram(program.id)}>
                          {text("Open / Continue", "فتح / متابعة", "פתיחה / המשך")}
                        </button>
                      ) : (
                        <button type="button" className="marketplace-buy-button" disabled={manualAccessMode ? normalizeProgram(program).accessType === 'class' : !['paid', 'free'].includes(normalizeProgram(program).accessType)} onClick={() => openProgram(program.id)}>
                          {accessMap[program.id] === undefined
                            ? text("Checking access...", "جارٍ التحقق من الوصول...", "בודקים גישה...")
                            : normalizeProgram(program).accessType === "class"
                              ? text("Class access required", "يتطلب وصولًا عبر الصف", "נדרשת גישה דרך הכיתה")
                              : manualAccessMode || normalizeProgram(program).accessType === 'paid'
                                ? text("Request access", "اطلب فتح البرنامج", "בקשת גישה")
                                : text("Access unavailable", "الوصول غير متاح", "הגישה אינה זמינה")}
                        </button>
                      )}
                    </div>
                  )}

                  {/* TEACHER */}

                  {userProfile.role === "teacher" && !manualAccessMode && normalizeProgram(program).accessType !== "free" && (

                    <div className="marketplace-teacher-options">
                      <small>{text("One-time purchase", "شراء لمرة واحدة", "רכישה חד-פעמית")}</small>

                      <div className="marketplace-license-box">

                        <div className="marketplace-price">

                          <small>
                            👩‍🏫{" "}
                            {text(
                              "Teacher Access",
                              "وصول المعلّم",
                              "גישה למורה"
                            )}
                          </small>


                          <strong>
                            ₪{teacherPrice}
                          </strong>

                        </div>


                        {hasAccess ? (

                          <button
                            type="button"
                            className="marketplace-open-button"
                            onClick={() =>
                              openProgram(
                                program.id
                              )
                            }
                          >
                            ✅{" "}
                            {text(
                              "Open Program",
                              "فتح البرنامج",
                              "פתיחת התוכנית"
                            )}
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="marketplace-buy-button"
                            disabled={
                              processingId ===
                              `${program.id}-teacher`
                            }
                            onClick={() =>
                              startPurchase(
                                program,
                                "teacher"
                              )
                            }
                          >
                            🔒{" "}
                            {text(
                              "Buy Program",
                              "شراء البرنامج",
                              "רכישת תוכנית"
                            )}
                          </button>

                        )}

                      </div>


                      {program.paddlePriceIds?.class && <div className="marketplace-license-box class-license">

                        <div className="marketplace-price">

                          <small>
                            👥{" "}
                            {text(
                              "Class License",
                              "ترخيص صف",
                              "רישיון כיתה"
                            )}
                          </small>


                          <strong>
                            ₪{classPrice}
                          </strong>

                        </div>


                        {classes.length ===
                        0 ? (

                          <button
                            type="button"
                            className="marketplace-secondary-button"
                            onClick={() =>
                              navigate(
                                "/teacher/classes"
                              )
                            }
                          >
                            +{" "}
                            {text(
                              "Create Class First",
                              "أنشئ صفًا أولًا",
                              "יצירת כיתה תחילה"
                            )}
                          </button>

                        ) : (

                          <>
                            <select
                              value={
                                selectedClasses[
                                  program.id
                                ] ||
                                classes[0]?.id ||
                                ""
                              }
                              onChange={(event) =>
                                setSelectedClasses({
                                  ...selectedClasses,

                                  [program.id]:
                                    event.target.value,
                                })
                              }
                            >

                              {classes.map(
                                (classItem) => (
                                  <option
                                    key={
                                      classItem.id
                                    }
                                    value={
                                      classItem.id
                                    }
                                  >
                                    {classItem.name}
                                  </option>
                                )
                              )}

                            </select>


                            <button
                              type="button"
                              className="marketplace-class-button"
                              disabled={
                                processingId ===
                                `${program.id}-class`
                              }
                              onClick={() =>
                                startPurchase(
                                  program,
                                  "class",
                                  selectedClasses[
                                    program.id
                                  ] ||
                                    classes[0]?.id
                                )
                              }
                            >
                              👥{" "}
                              {text(
                                "Buy for Class",
                                "شراء للصف",
                                "רכישה עבור הכיתה"
                              )}
                            </button>
                          </>

                        )}

                      </div>}

                    </div>

                  )}


                  {/* OWNER */}

                  {userProfile.role ===
                    "owner" && (

                    <div className="marketplace-owner-preview">
                      <button type="button" className="marketplace-open-button" onClick={() => openProgram(program.id)}>{text("Open Program", "فتح البرنامج", "פתיחת התוכנית")}</button>

                      👑{" "}

                      {text(
                        "Owner Preview",
                        "معاينة المالك",
                        "תצוגה מקדימה לבעלים"
                      )}

                    </div>

                  )}

                </article>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}


export default ProgramsMarketplace;
