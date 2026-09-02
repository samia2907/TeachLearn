import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getApp,
} from "firebase/app";

import {
  getFunctions,
  httpsCallable,
} from "firebase/functions";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./ProgramLearning.css";


const functions =
  getFunctions(
    getApp(),
    "europe-west1"
  );


function ProgramLearning() {
  const navigate =
    useNavigate();


  const {
    programId,
  } = useParams();


  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    program,
    setProgram,
  ] = useState(null);


  const [
    lessons,
    setLessons,
  ] = useState([]);


  const [
    access,
    setAccess,
  ] = useState(null);


  const [
    role,
    setRole,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedLessonId,
    setSelectedLessonId,
  ] = useState("");


  /* =====================================================
     TRANSLATION
  ===================================================== */

  const text =
    (
      english,
      arabic
    ) =>
      language ===
      "ar"
        ? arabic
        : english;


  const localized =
    (
      value
    ) => {
      if (
        !value
      ) {
        return "";
      }


      if (
        typeof value ===
        "string"
      ) {
        return value;
      }


      return (
        value[
          language
        ] ||
        value.en ||
        value.ar ||
        ""
      );
    };


  /* =====================================================
     LOAD SECURE PROGRAM
  ===================================================== */

  useEffect(() => {
    let active =
      true;


    const loadProgram =
      async () => {
        if (
          !programId
        ) {
          setError(
            text(
              "Program ID is missing.",
              "معرّف البرنامج غير موجود."
            )
          );

          setLoading(
            false
          );

          return;
        }


        try {
          setLoading(
            true
          );

          setError("");


          const getPurchasedProgram =
            httpsCallable(
              functions,
              "getPurchasedProgram"
            );


          const result =
            await getPurchasedProgram({
              programId,
            });


          if (
            !active
          ) {
            return;
          }


          const data =
            result.data;


          if (
            !data?.success
          ) {
            throw new Error(
              "Program could not be loaded."
            );
          }


          const loadedProgram =
            data.program ||
            null;


          const loadedLessons =
            Array.isArray(
              data.lessons
            )
              ? data.lessons
              : [];


          setProgram(
            loadedProgram
          );


          setLessons(
            loadedLessons
          );


          setAccess(
            data.access ||
            null
          );


          setRole(
            data.role ||
            ""
          );


          if (
            loadedLessons.length >
            0
          ) {
            setSelectedLessonId(
              loadedLessons[0].id
            );
          }

        } catch (
          loadError
        ) {
          console.error(
            "Secure program load error:",
            loadError
          );


          if (
            !active
          ) {
            return;
          }


          const code =
            loadError?.code ||
            "";


          if (
            code ===
            "functions/permission-denied"
          ) {
            setError(
              text(
                "You do not have access to this program.",
                "لا يوجد لديك وصول إلى هذا البرنامج."
              )
            );

          } else if (
            code ===
            "functions/unauthenticated"
          ) {
            setError(
              text(
                "Please sign in again.",
                "يرجى تسجيل الدخول من جديد."
              )
            );

          } else if (
            code ===
            "functions/not-found"
          ) {
            setError(
              text(
                "This program could not be found.",
                "لم يتم العثور على هذا البرنامج."
              )
            );

          } else {
            setError(
              text(
                "Could not load the program. Please try again.",
                "تعذر تحميل البرنامج. حاول مرة أخرى."
              )
            );
          }

        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };


    loadProgram();


    return () => {
      active =
        false;
    };

  }, [
    programId,
    language,
  ]);


  /* =====================================================
     CURRENT LESSON
  ===================================================== */

  const selectedLesson =
    useMemo(
      () =>
        lessons.find(
          (
            lesson
          ) =>
            lesson.id ===
            selectedLessonId
        ) ||
        null,

      [
        lessons,
        selectedLessonId,
      ]
    );


  /* =====================================================
     LESSON HELPERS
  ===================================================== */

  const getLessonTitle =
    (
      lesson
    ) =>
      localized(
        lesson
          ?.titleI18n
      ) ||
      localized(
        lesson
          ?.title
      ) ||
      lesson?.name ||
      text(
        "Lesson",
        "درس"
      );


  const getLessonDescription =
    (
      lesson
    ) =>
      localized(
        lesson
          ?.descriptionI18n
      ) ||
      localized(
        lesson
          ?.description
      ) ||
      localized(
        lesson
          ?.summary
      ) ||
      "";


  const getLessonIcon =
    (
      lesson
    ) => {
      if (
        lesson?.icon
      ) {
        return lesson.icon;
      }


      switch (
        lesson
          ?.activityType
      ) {
        case "coding":
          return "💻";

        case "ai":
          return "🤖";

        case "quiz":
          return "🧩";

        case "cyber":
          return "🔐";

        default:
          return "📚";
      }
    };


  const getSectionIcon =
    (
      type
    ) => {
      switch (
        type
      ) {
        case "question":
          return "❓";

        case "multipleChoice":
          return "🧩";

        case "task":
          return "🛠️";

        case "challenge":
          return "🔥";

        case "summary":
          return "📝";

        case "reflection":
          return "💭";

        default:
          return "📚";
      }
    };


  /* =====================================================
     BACK
  ===================================================== */

  const goBack =
    () => {
      if (
        role ===
        "teacher"
      ) {
        navigate(
          "/teacher/programs"
        );

        return;
      }


      if (
        role ===
        "student"
      ) {
        navigate(
          "/student/programs"
        );

        return;
      }


      if (
        role ===
        "owner"
      ) {
        navigate(
          "/owner/programs"
        );

        return;
      }


      navigate(
        "/programs"
      );
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div className="program-learning-loading">

        <div>
          🚀
        </div>


        <p>
          {text(
            "Opening your program...",
            "جارٍ فتح البرنامج..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     ACCESS DENIED
  ===================================================== */

  if (
    error ||
    !program ||
    !access
  ) {
    return (
      <div className="program-learning-denied">

        <div className="program-denied-card">

          <div className="program-denied-icon">
            🔒
          </div>


          <h1>
            {text(
              "Program unavailable",
              "البرنامج غير متاح"
            )}
          </h1>


          <p>
            {error ||
              text(
                "You do not currently have access to this program.",
                "لا يوجد لديك وصول إلى هذا البرنامج حاليًا."
              )}
          </p>


          <button
            type="button"
            onClick={
              goBack
            }
          >
            {text(
              "Back to Programs",
              "العودة إلى البرامج"
            )}
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     PROGRAM DATA
  ===================================================== */

  const programTitle =
    localized(
      program.title
    ) ||
    text(
      "Learning Program",
      "برنامج تعليمي"
    );


  const programDescription =
    localized(
      program.description
    );


  const finalProject =
    localized(
      program.finalProject
    );


  const selectedSections =
    Array.isArray(
      selectedLesson
        ?.sections
    )
      ? selectedLesson.sections
      : [];


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="program-learning-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="program-learning-header">

        <div className="program-learning-header-left">

          <button
            type="button"
            className="program-learning-back"
            onClick={
              goBack
            }
          >
            {language ===
            "ar"
              ? "→"
              : "←"}

            {" "}

            {text(
              "Programs",
              "البرامج"
            )}
          </button>


          <div className="program-learning-brand">

            <div className="program-learning-brand-icon">
              🚀
            </div>


            <div>

              <strong>
                TechMinds
              </strong>


              <span>
                {text(
                  "Learning Program",
                  "برنامج تعليمي"
                )}
              </span>

            </div>

          </div>

        </div>


        <div className="program-learning-actions">

          <div className="program-learning-language">

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


          <div className="program-access-badge">

            ✅

            <span>

              {access
                .licenseType ===
              "class"
                ? text(
                    "Class Access",
                    "ترخيص صف"
                  )
                : access
                    .licenseType ===
                  "teacher"
                ? text(
                    "Teacher Access",
                    "وصول معلّم"
                  )
                : access
                    .licenseType ===
                  "student"
                ? text(
                    "Student Access",
                    "وصول طالب"
                  )
                : text(
                    "Owner Preview",
                    "معاينة المالك"
                  )}

            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="program-learning-hero">

        <div className="program-learning-hero-icon">

          {program.icon ||
            "🚀"}

        </div>


        <div className="program-learning-hero-content">

          <small>
            TECHMINDS PROGRAM
          </small>


          <h1>
            {programTitle}
          </h1>


          <p>

            {programDescription ||
              text(
                "An interactive TechMinds learning journey.",
                "رحلة تعليمية تفاعلية من TechMinds."
              )}

          </p>


          <div className="program-learning-meta">

            <span>
              📚{" "}
              {lessons.length}{" "}

              {text(
                "Lessons",
                "دروس"
              )}
            </span>


            {program.level && (
              <span>
                🎯{" "}

                {localized(
                  program.level
                ) ||
                  program.level}
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


            {program.category && (
              <span>
                💡{" "}

                {localized(
                  program.category
                ) ||
                  program.category}
              </span>
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="program-learning-layout">

        {/* =================================================
            LESSONS SIDEBAR
        ================================================= */}

        <aside className="program-lessons-sidebar">

          <div className="program-lessons-sidebar-header">

            <small>
              {text(
                "PROGRAM CONTENT",
                "محتوى البرنامج"
              )}
            </small>


            <h2>
              {text(
                "Lessons",
                "الدروس"
              )}
            </h2>


            <p>
              {text(
                "Choose a lesson to view its content.",
                "اختر درسًا لعرض محتواه."
              )}
            </p>

          </div>


          {lessons.length ===
          0 ? (

            <div className="program-no-lessons">

              <div>
                📚
              </div>


              <strong>
                {text(
                  "No published lessons yet",
                  "لا توجد دروس منشورة بعد"
                )}
              </strong>

            </div>

          ) : (

            <div className="program-lessons-list">

              {lessons.map(
                (
                  lesson,
                  index
                ) => {
                  const active =
                    lesson.id ===
                    selectedLessonId;


                  const sections =
                    Array.isArray(
                      lesson.sections
                    )
                      ? lesson.sections
                      : [];


                  return (
                    <button
                      key={
                        lesson.id
                      }
                      type="button"
                      className={
                        active
                          ? "program-lesson-item active"
                          : "program-lesson-item"
                      }
                      onClick={() =>
                        setSelectedLessonId(
                          lesson.id
                        )
                      }
                    >

                      <div className="program-lesson-number">
                        {index +
                          1}
                      </div>


                      <div className="program-lesson-item-info">

                        <strong>
                          {getLessonTitle(
                            lesson
                          )}
                        </strong>


                        <span>

                          {getLessonIcon(
                            lesson
                          )}

                          {" "}

                          {sections.length}{" "}

                          {text(
                            "slides",
                            "شرائح"
                          )}

                        </span>

                      </div>


                      <div className="program-lesson-arrow">

                        {language ===
                        "ar"
                          ? "←"
                          : "→"}

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          )}


          {finalProject && (
            <div className="program-final-project-card">

              <small>
                🏆{" "}

                {text(
                  "FINAL PROJECT",
                  "المشروع النهائي"
                )}
              </small>


              <p>
                {finalProject}
              </p>

            </div>
          )}

        </aside>


        {/* =================================================
            CURRENT LESSON
        ================================================= */}

        <main className="program-lesson-view">

          {!selectedLesson ? (

            <div className="program-select-lesson">
<button
  type="button"
  className="program-start-lesson"
  onClick={() =>
    navigate(
      `/programs/${programId}/lessons/${selectedLesson.id}`
    )
  }
>
  ▶️{" "}

  {text(
    "Start Lesson",
    "ابدأ الدرس"
  )}
</button>
              <div>
                🚀
              </div>


              <h2>
                {text(
                  "Choose your first lesson",
                  "اختر الدرس الأول"
                )}
              </h2>


              <p>
                {text(
                  "Your program lessons will appear here.",
                  "سيظهر محتوى الدرس هنا."
                )}
              </p>

            </div>

          ) : (

            <>

              <div className="program-current-lesson">

                <div className="program-current-lesson-icon">

                  {getLessonIcon(
                    selectedLesson
                  )}

                </div>


                <div>

                  <small>
                    {text(
                      "CURRENT LESSON",
                      "الدرس الحالي"
                    )}
                  </small>


                  <h2>
                    {getLessonTitle(
                      selectedLesson
                    )}
                  </h2>


                  {getLessonDescription(
                    selectedLesson
                  ) && (

                    <p>
                      {getLessonDescription(
                        selectedLesson
                      )}
                    </p>

                  )}


                  <div className="program-current-lesson-meta">

                    <span>
                      📑{" "}

                      {selectedSections.length}{" "}

                      {text(
                        "slides",
                        "شرائح"
                      )}
                    </span>


                    {selectedLesson
                      .estimatedMinutes && (

                      <span>
                        ⏱{" "}

                        {
                          selectedLesson
                            .estimatedMinutes
                        }{" "}

                        {text(
                          "min",
                          "دقيقة"
                        )}
                      </span>

                    )}

                  </div>

                </div>

              </div>


              {/* =============================================
                  SLIDES
              ============================================= */}

              {selectedSections.length ===
              0 ? (

                <div className="program-empty-lesson">

                  <div>
                    📝
                  </div>


                  <h3>
                    {text(
                      "This lesson has no content yet.",
                      "لا يوجد محتوى في هذا الدرس بعد."
                    )}
                  </h3>

                </div>

              ) : (

                <div className="program-sections-preview">

                  {selectedSections.map(
                    (
                      section,
                      index
                    ) => {
                      const sectionTitle =
                        localized(
                          section.title
                        ) ||
                        localized(
                          section.heading
                        ) ||
                        text(
                          `Slide ${
                            index +
                            1
                          }`,
                          `الشريحة ${
                            index +
                            1
                          }`
                        );


                      const sectionContent =
                        localized(
                          section.content
                        ) ||
                        localized(
                          section.text
                        ) ||
                        localized(
                          section.description
                        ) ||
                        localized(
                          section.question
                        ) ||
                        "";


                      return (
                        <article
                          key={
                            section.id ||
                            `${selectedLesson.id}-${index}`
                          }
                          className="program-section-card"
                        >

                          <span className="program-section-index">

                            {index +
                              1}

                          </span>


                          <div className="program-section-icon">

                            {getSectionIcon(
                              section.type
                            )}

                          </div>


                          <div className="program-section-content">

                            <small>
                              {section.type ||
                                text(
                                  "content",
                                  "محتوى"
                                )}
                            </small>


                            <h3>
                              {sectionTitle}
                            </h3>


                            {sectionContent && (

                              <p>
                                {sectionContent}
                              </p>

                            )}


                            {Array.isArray(
                              section.options
                            ) &&
                              section.options
                                .length >
                                0 && (

                              <div className="program-preview-options">

                                {section.options.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (

                                    <div
                                      key={
                                        `${section.id || index}-${optionIndex}`
                                      }
                                    >

                                      <span>
                                        {String.fromCharCode(
                                          65 +
                                          optionIndex
                                        )}
                                      </span>


                                      {localized(
                                        option
                                      ) ||
                                        String(
                                          option
                                        )}

                                    </div>

                                  )
                                )}

                              </div>

                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>

              )}


              {/* =============================================
                  NEXT STEP
              ============================================= */}

              <div className="program-player-coming">

                <div>

                  <small>
                    {text(
                      "INTERACTIVE MODE",
                      "الوضع التفاعلي"
                    )}
                  </small>


                  <h3>
                    ▶️{" "}

                    {text(
                      "Lesson Player",
                      "مشغّل الدرس"
                    )}
                  </h3>


                  <p>
                    {text(
                      "The next step is connecting these slides to lesson progress, answers, challenges and completion.",
                      "الخطوة التالية هي ربط هذه الشرائح بالتقدم والإجابات والتحديات وإكمال الدرس."
                    )}
                  </p>

                </div>

              </div>

            </>

          )}

        </main>

      </section>

    </div>
  );
}


export default ProgramLearning;