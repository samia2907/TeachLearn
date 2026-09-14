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
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./ProgramsMarketplace.css";
import { programLicenseForRole } from "../firebase/paddleConfig";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebase";


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
        const user =
          auth.currentUser;


        if (!user) {
          navigate("/login");
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


          if (list.length > 0) {
            setSelectedClasses(
              (current) => {
                const next = {
                  ...current,
                };


                programs.forEach(
                  (program) => {
                    if (
                      !next[
                        program.id
                      ]
                    ) {
                      next[
                        program.id
                      ] =
                        list[0].id;
                    }
                  }
                );


                return next;
              }
            );
          }
        }
      );


    return () =>
      unsubscribe();

  }, [
    userProfile,
    programs,
  ]);


  /* =====================================================
     LOAD PROGRAM ACCESS
  ===================================================== */

  useEffect(() => {
    let active = true;
    const checkAccess =
      async () => {
        if (
          !userProfile ||
          programs.length === 0
        ) {
          return;
        }


        const result = {};


        await Promise.all(
          programs.map(
            async (
              program
            ) => {
              try {
                let personalAccessId;

                if (userProfile.role === "owner") {
                  result[program.id] = true;
                  return;
                }


                if (
                  userProfile.role ===
                  "teacher"
                ) {
                  personalAccessId =
                    `teacher_${safeId(
                      userProfile.uid
                    )}_${safeId(
                      program.id
                    )}`;

                } else {
                  personalAccessId =
                    `student_${safeId(
                      userProfile.uid
                    )}_${safeId(
                      program.id
                    )}`;
                }


                const personalSnapshot =
                  await getDoc(
                    doc(
                      db,
                      "programAccess",
                      personalAccessId
                    )
                  ).catch(() => null);


                if (
                  personalSnapshot?.exists() &&
                  personalSnapshot.data()
                    .status ===
                    "active"
                ) {
                  result[
                    program.id
                  ] = true;

                  return;
                }

                if (userProfile.role === "teacher") {
                  const response = await httpsCallable(functions, "getPurchasedProgram")({ programId: program.id, accessOnly: true });
                  result[program.id] = response.data?.access?.status === "active";
                  return;
                }


                /*
                  Student may also have access
                  through a teacher's class license.
                */

                if (
                  userProfile.role ===
                    "student" &&
                  userProfile.classId
                ) {
                  const classAccessId =
                    `class_${safeId(
                      userProfile.classId
                    )}_${safeId(
                      program.id
                    )}`;


                  const classSnapshot =
                    await getDoc(
                      doc(
                        db,
                        "programAccess",
                        classAccessId
                      )
                    );


                  if (
                    classSnapshot.exists() &&
                    classSnapshot.data()
                      .status ===
                      "active"
                  ) {
                    result[
                      program.id
                    ] = true;
                  }
                }

              } catch (error) {
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
      };


    checkAccess();
    // Recheck when returning from Paddle or another tab; checkout also waits for the entitlement.
    window.addEventListener("focus", checkAccess);
    const refresh = window.setInterval(checkAccess, 10000);
    return () => {
      active = false;
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

      licenseType = programLicenseForRole(userProfile.role, licenseType);
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

      navigate(
        `/programs/${programId}`
      );
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
            "Loading TeachLearn programs...",
            "جارٍ تحميل برامج TeachLearn...",
            "תוכניות TeachLearn נטענות..."
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
                navigate("/student");
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
            TEACHLEARN MARKETPLACE
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

          {filteredPrograms.map(
            (program) => {

              const hasAccess =
                Boolean(
                  accessMap[
                    program.id
                  ]
                );


              const studentPrice =
                Number(
                  program.pricing
                    ?.student ||
                  0
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
                        "Interactive TeachLearn learning program.",
                        "برنامج تعليمي تفاعلي من TeachLearn.",
                        "תוכנית למידה אינטראקטיבית של TeachLearn."
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


                  {/* STUDENT */}

                  {userProfile.role ===
                    "student" && (

                    <div className="marketplace-purchase-area">
                      <small>{text("One-time purchase", "شراء لمرة واحدة", "רכישה חד-פעמית")}</small>

                      <div className="marketplace-price">

                        <small>
                          {text(
                            "Student Access",
                            "وصول الطالب",
                            "גישה לתלמיד"
                          )}
                        </small>


                        <strong>
                          ₪{studentPrice}
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
                            `${program.id}-student`
                          }
                          onClick={() =>
                            startPurchase(
                              program,
                              "student"
                            )
                          }
                        >
                          {processingId ===
                          `${program.id}-student`
                            ? text(
                                "Preparing...",
                                "جارٍ التجهيز...",
                                "מתכוננים..."
                              )
                            : `🔒 ${text(
                                "Buy Program",
                                "شراء البرنامج",
                                "רכישת תוכנית"
                              )}`}
                        </button>

                      )}

                    </div>

                  )}


                  {/* TEACHER */}

                  {userProfile.role ===
                    "teacher" && (

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
