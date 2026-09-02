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

import "./ProgramLessonPlayer.css";


const functions =
  getFunctions(
    getApp(),
    "europe-west1"
  );


function ProgramLessonPlayer() {
  const navigate =
    useNavigate();

  const {
    programId,
    lessonId,
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
    lesson,
    setLesson,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentSlide,
    setCurrentSlide,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState({});

  const [
    checkedAnswers,
    setCheckedAnswers,
  ] = useState({});

  const [
    completed,
    setCompleted,
  ] = useState(false);


  /* =====================================================
     TRANSLATION
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
     LOAD LESSON SECURELY
  ===================================================== */

  useEffect(() => {
    let active = true;


    const loadLesson =
      async () => {
        try {
          setLoading(true);
          setError("");


          const getPurchasedProgram =
            httpsCallable(
              functions,
              "getPurchasedProgram"
            );


          const response =
            await getPurchasedProgram({
              programId,
            });


          if (!active) {
            return;
          }


          const data =
            response.data;


          const foundLesson =
            data?.lessons?.find(
              (item) =>
                item.id === lessonId
            );


          if (!foundLesson) {
            setError(
              text(
                "Lesson could not be found.",
                "لم يتم العثور على الدرس."
              )
            );

            return;
          }


          setProgram(
            data.program
          );

          setLesson(
            foundLesson
          );

        } catch (loadError) {
          console.error(
            "Lesson player load error:",
            loadError
          );


          if (
            loadError?.code ===
            "functions/permission-denied"
          ) {
            setError(
              text(
                "You do not have access to this lesson.",
                "لا يوجد لديك صلاحية للوصول إلى هذا الدرس."
              )
            );

          } else {
            setError(
              text(
                "Could not open the lesson.",
                "تعذر فتح الدرس."
              )
            );
          }

        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    loadLesson();


    return () => {
      active = false;
    };

  }, [
    programId,
    lessonId,
    language,
  ]);


  /* =====================================================
     SECTIONS
  ===================================================== */

  const sections =
    useMemo(
      () =>
        Array.isArray(
          lesson?.sections
        )
          ? lesson.sections
          : [],

      [lesson]
    );


  const section =
    sections[
      currentSlide
    ];


  const progress =
    sections.length > 0
      ? Math.round(
          (
            (
              currentSlide + 1
            ) /
            sections.length
          ) *
            100
        )
      : 0;


  /* =====================================================
     SECTION VALUES
  ===================================================== */

  const sectionTitle =
    localized(
      section?.title
    ) ||
    localized(
      section?.heading
    ) ||
    text(
      `Slide ${
        currentSlide + 1
      }`,
      `الشريحة ${
        currentSlide + 1
      }`
    );


  const sectionContent =
    localized(
      section?.content
    ) ||
    localized(
      section?.text
    ) ||
    localized(
      section?.description
    ) ||
    "";


  const question =
    localized(
      section?.question
    );


  const options =
    Array.isArray(
      section?.options
    )
      ? section.options
      : [];


  /* =====================================================
     ANSWERS
  ===================================================== */

  const selectAnswer =
    (index) => {
      if (
        checkedAnswers[
          currentSlide
        ]
      ) {
        return;
      }


      setAnswers(
        (current) => ({
          ...current,

          [currentSlide]:
            index,
        })
      );
    };


  const checkAnswer =
    () => {
      if (
        answers[
          currentSlide
        ] === undefined
      ) {
        return;
      }


      setCheckedAnswers(
        (current) => ({
          ...current,

          [currentSlide]:
            true,
        })
      );
    };


  const isCorrect =
    checkedAnswers[
      currentSlide
    ] &&
    Number(
      answers[
        currentSlide
      ]
    ) ===
      Number(
        section
          ?.correctAnswer
      );


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const previousSlide =
    () => {
      if (
        currentSlide >
        0
      ) {
        setCurrentSlide(
          currentSlide - 1
        );
      }
    };


  const nextSlide =
    () => {
      if (
        currentSlide <
        sections.length - 1
      ) {
        setCurrentSlide(
          currentSlide + 1
        );

        return;
      }


      setCompleted(true);
    };


  const restartLesson =
    () => {
      setCurrentSlide(0);
      setAnswers({});
      setCheckedAnswers({});
      setCompleted(false);
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="program-player-loading">

        <div>
          🚀
        </div>

        <p>
          {text(
            "Loading lesson...",
            "جارٍ تحميل الدرس..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     ERROR
  ===================================================== */

  if (
    error ||
    !lesson
  ) {
    return (
      <div className="program-player-error">

        <div className="program-player-error-card">

          <div>
            🔒
          </div>

          <h2>
            {text(
              "Lesson unavailable",
              "الدرس غير متاح"
            )}
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/programs/${programId}`
              )
            }
          >
            {text(
              "Back to Program",
              "العودة إلى البرنامج"
            )}
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     EMPTY
  ===================================================== */

  if (
    sections.length ===
    0
  ) {
    return (
      <div className="program-player-error">

        <div className="program-player-error-card">

          <div>
            📚
          </div>

          <h2>
            {text(
              "This lesson is empty",
              "هذا الدرس لا يحتوي على محتوى"
            )}
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/programs/${programId}`
              )
            }
          >
            {text(
              "Back",
              "رجوع"
            )}
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     COMPLETED
  ===================================================== */

  if (completed) {
    return (
      <div className="program-player-complete">

        <div className="program-player-complete-card">

          <div className="complete-trophy">
            🏆
          </div>


          <small>
            TECHMINDS
          </small>


          <h1>
            {text(
              "Lesson Completed!",
              "أكملت الدرس!"
            )}
          </h1>


          <p>
            {text(
              "Great work! You reached the end of this lesson.",
              "عمل رائع! وصلت إلى نهاية هذا الدرس."
            )}
          </p>


          <div className="complete-actions">

            <button
              type="button"
              className="complete-secondary"
              onClick={
                restartLesson
              }
            >
              🔄{" "}

              {text(
                "Restart",
                "إعادة الدرس"
              )}
            </button>


            <button
              type="button"
              className="complete-primary"
              onClick={() =>
                navigate(
                  `/programs/${programId}`
                )
              }
            >
              ✅{" "}

              {text(
                "Back to Program",
                "العودة إلى البرنامج"
              )}
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="program-player-page">

      {/* HEADER */}

      <header className="program-player-header">

        <button
          type="button"
          className="player-back"
          onClick={() =>
            navigate(
              `/programs/${programId}`
            )
          }
        >
          {language === "ar"
            ? "→"
            : "←"}

          {" "}

          {text(
            "Program",
            "البرنامج"
          )}
        </button>


        <div className="player-header-center">

          <small>
            {localized(
              program?.title
            )}
          </small>

          <strong>
            {localized(
              lesson?.title
            ) ||
              lesson?.name ||
              text(
                "Lesson",
                "درس"
              )}
          </strong>

        </div>


        <div className="player-language">

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


      {/* PROGRESS */}

      <section className="player-progress-section">

        <div className="player-progress-info">

          <span>
            {text(
              "Lesson Progress",
              "تقدم الدرس"
            )}
          </span>


          <strong>
            {currentSlide +
              1}
            {" / "}
            {sections.length}
          </strong>

        </div>


        <div className="player-progress-track">

          <div
            className="player-progress-fill"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </section>


      {/* SLIDE */}

      <main className="player-content">

        <section className="player-slide-card">

          <div className="player-slide-top">

            <span className="player-slide-number">
              {currentSlide +
                1}
            </span>


            <span className="player-slide-type">

              {section.type ===
              "question"
                ? "❓"
                : section.type ===
                  "multipleChoice"
                ? "🧩"
                : section.type ===
                  "task"
                ? "🛠️"
                : section.type ===
                  "challenge"
                ? "🔥"
                : section.type ===
                  "summary"
                ? "📝"
                : section.type ===
                  "reflection"
                ? "💭"
                : "📚"}

              {" "}

              {section.type ||
                text(
                  "content",
                  "محتوى"
                )}

            </span>

          </div>


          <div className="player-slide-body">

            <h1>
              {sectionTitle}
            </h1>


            {sectionContent && (
              <p className="player-main-text">
                {sectionContent}
              </p>
            )}


            {question && (
              <div className="player-question">

                <small>
                  {text(
                    "QUESTION",
                    "سؤال"
                  )}
                </small>


                <h2>
                  {question}
                </h2>

              </div>
            )}


            {options.length >
              0 && (

              <div className="player-options">

                {options.map(
                  (
                    option,
                    index
                  ) => {
                    const selected =
                      answers[
                        currentSlide
                      ] ===
                      index;


                    const checked =
                      checkedAnswers[
                        currentSlide
                      ];


                    const correct =
                      Number(
                        section
                          .correctAnswer
                      ) ===
                      index;


                    let optionClass =
                      "player-option";


                    if (
                      selected
                    ) {
                      optionClass +=
                        " selected";
                    }


                    if (
                      checked &&
                      correct
                    ) {
                      optionClass +=
                        " correct";
                    }


                    if (
                      checked &&
                      selected &&
                      !correct
                    ) {
                      optionClass +=
                        " wrong";
                    }


                    return (
                      <button
                        key={
                          index
                        }
                        type="button"
                        className={
                          optionClass
                        }
                        onClick={() =>
                          selectAnswer(
                            index
                          )
                        }
                      >

                        <span>
                          {String.fromCharCode(
                            65 +
                              index
                          )}
                        </span>


                        <strong>
                          {localized(
                            option
                          ) ||
                            String(
                              option
                            )}
                        </strong>

                      </button>
                    );
                  }
                )}

              </div>

            )}


            {options.length >
              0 &&
              !checkedAnswers[
                currentSlide
              ] && (

              <button
                type="button"
                className="player-check-answer"
                disabled={
                  answers[
                    currentSlide
                  ] === undefined
                }
                onClick={
                  checkAnswer
                }
              >
                {text(
                  "Check Answer",
                  "تحقق من الإجابة"
                )}
              </button>

            )}


            {checkedAnswers[
              currentSlide
            ] && (

              <div
                className={
                  isCorrect
                    ? "player-feedback correct-feedback"
                    : "player-feedback wrong-feedback"
                }
              >

                {isCorrect
                  ? `✅ ${text(
                      "Correct! Great job.",
                      "إجابة صحيحة! أحسنت."
                    )}`
                  : `❌ ${text(
                      "Not quite. Review the correct answer.",
                      "ليست الإجابة الصحيحة. راجع الإجابة الصحيحة."
                    )}`}

              </div>

            )}

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="player-footer">

        <button
          type="button"
          className="player-prev"
          disabled={
            currentSlide ===
            0
          }
          onClick={
            previousSlide
          }
        >
          {language === "ar"
            ? "→"
            : "←"}

          {" "}

          {text(
            "Previous",
            "السابق"
          )}
        </button>


        <div className="player-dots">

          {sections.map(
            (
              item,
              index
            ) => (

              <button
                key={
                  item.id ||
                  index
                }
                type="button"
                className={
                  index ===
                  currentSlide
                    ? "active"
                    : index <
                      currentSlide
                    ? "visited"
                    : ""
                }
                onClick={() =>
                  setCurrentSlide(
                    index
                  )
                }
                aria-label={
                  `Slide ${
                    index + 1
                  }`
                }
              />

            )
          )}

        </div>


        <button
          type="button"
          className="player-next"
          onClick={
            nextSlide
          }
        >
          {currentSlide ===
          sections.length -
            1
            ? text(
                "Complete Lesson",
                "إنهاء الدرس"
              )
            : text(
                "Next",
                "التالي"
              )}

          {" "}

          {language === "ar"
            ? "←"
            : "→"}

        </button>

      </footer>

    </div>
  );
}


export default ProgramLessonPlayer;