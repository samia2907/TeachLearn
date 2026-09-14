import {
  lazy,
  Suspense,
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
import { getLessonSections, isCodingConfig } from "../components/code/codingConfig";
import { useCodeText } from "../components/code/codeText";
const CodeRunner = lazy(() => import("../components/code/CodeRunner"));
const MissionPlayer = lazy(() => import("../components/mission/MissionPlayer"));

import { hebrewText } from "../data/hebrewText";
import { auth } from "../firebase/firebase";


const functions =
  getFunctions(
    getApp(),
    "europe-west1"
  );


function ProgramLessonPlayer() {
  const { text: codeText } = useCodeText();
  const [codingResults, setCodingResults] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
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
      : language === "he"
        ? hebrewText(english)
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

  const sections = useMemo(() => getLessonSections(lesson), [lesson]);
  const codingKey = section => lessonId + ":" + (section.id || sections.indexOf(section));
  const codingReady = sections.every(item => !isCodingConfig(item.codingConfig) || codingResults[codingKey(item)]);


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


  const taskText =
    localized(
      section?.task
    );


  const infoBox =
    localized(
      section?.infoBox
    );


  const challengeBox =
    localized(
      section?.challengeBox
    );


  const options =
    Array.isArray(
      section?.options
    )
      ? section.options
      : [];


  const slideKind =
    section?.challenge
      ? "challenge"
      : section?.type ||
        "content";


  const slideThemes = {
    content: {
      themeColor: "#6d28d9",
      accentColor: "#2563eb",
      surfaceColor: "#f5f3ff",
    },
    question: {
      themeColor: "#7c3aed",
      accentColor: "#ec4899",
      surfaceColor: "#fdf4ff",
    },
    multipleChoice: {
      themeColor: "#059669",
      accentColor: "#22c55e",
      surfaceColor: "#ecfdf5",
    },
    task: {
      themeColor: "#ea580c",
      accentColor: "#f59e0b",
      surfaceColor: "#fff7ed",
    },
    challenge: {
      themeColor: "#e11d48",
      accentColor: "#f97316",
      surfaceColor: "#fff1f2",
    },
    summary: {
      themeColor: "#0891b2",
      accentColor: "#0ea5e9",
      surfaceColor: "#ecfeff",
    },
    reflection: {
      themeColor: "#9333ea",
      accentColor: "#c026d3",
      surfaceColor: "#faf5ff",
    },
  };


  const currentTheme =
    slideThemes[slideKind] ||
    slideThemes.content;


  const slideThemeColor =
    section?.themeColor ||
    currentTheme.themeColor;


  const slideAccentColor =
    section?.accentColor ||
    currentTheme.accentColor;


  const slideSurfaceColor =
    section?.surfaceColor ||
    currentTheme.surfaceColor;


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
      if (isCodingConfig(section?.codingConfig) && !codingResults[codingKey(section)]) return;
      if (currentSlide === sections.length - 1 && !codingReady) return;
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

  if (lesson.activityType === "mission") {
    return (
      <Suspense fallback={<div className="program-player-loading">🤖</div>}>
        <MissionPlayer
          lesson={lesson}
          student={{ id: auth.currentUser?.uid || "program-student" }}
          onExit={() => navigate(`/programs/${programId}`)}
        />
      </Suspense>
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
            TEACHLEARN
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
    <div
      className={`program-player-page slide-theme-${slideKind}`}
      style={{
        "--lesson-theme":
          lesson.themeColor ||
          "#6d28d9",
        "--lesson-accent":
          lesson.accentColor ||
          "#4f46e5",
        "--lesson-surface":
          lesson.surfaceColor ||
          "#f5f3ff",
        "--lesson-cover-background":
          lesson.coverImage
            ? `url("${lesson.coverImage}")`
            : "none",
        "--type-color":
          slideThemeColor,
        "--type-accent":
          slideAccentColor,
        "--type-soft":
          slideSurfaceColor,
      }}
    >

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


      <section
        className={`player-lesson-hero ${
          lesson.coverImage
            ? "has-cover"
            : "no-cover"
        }`}
        aria-label={localized(lesson.title)}
      >
        <div className="player-lesson-hero-overlay" />

        <div className="player-lesson-hero-content">

          <div className="player-lesson-hero-text">

            <span className="player-lesson-hero-kicker">
              {text(
                "Interactive Lesson",
                "درس تفاعلي"
              )}
            </span>

            <h1>
              {localized(
                lesson.title
              )}
            </h1>

            {localized(lesson.description) && (
              <p>
                {localized(
                  lesson.description
                )}
              </p>
            )}

            <div className="player-lesson-hero-meta">

              <span>
                ⏱️ {lesson.minutes || 0}{" "}
                {text(
                  "min",
                  "دقيقة"
                )}
              </span>

              <span>
                ⭐ {lesson.xp || 0} XP
              </span>

              <span>
                📚 {sections.length}{" "}
                {text(
                  "slides",
                  "شرائح"
                )}
              </span>

            </div>

          </div>


          {lesson.coverImage && (
            <div className="player-lesson-hero-image-wrap">
              <img
                src={lesson.coverImage}
                alt={
                  localized(
                    lesson.imageAlt
                  ) ||
                  localized(
                    lesson.title
                  )
                }
                className="player-lesson-hero-image"
              />
            </div>
          )}

        </div>
      </section>


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

        <section className={`player-slide-card player-slide-${slideKind}`}>

          <div className="player-slide-top">

            <span className="player-slide-number">
              {currentSlide +
                1}
            </span>


            <span className="player-slide-type">

              {section.challenge
                ? "🔥"
                : section.type ===
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


            {(section?.emoji ||
              section?.visualImage) && (

              <div className="player-slide-visual">

                {section?.emoji && (
                  <div className="player-big-emoji">
                    {section.emoji}
                  </div>
                )}

                {section?.visualImage && (
                  <img
                    src={section.visualImage}
                    alt={
                      localized(
                        section.visualAlt
                      ) ||
                      sectionTitle
                    }
                  />
                )}

              </div>

            )}


            {sectionContent && (
              <p className="player-main-text">
                {sectionContent}
              </p>
            )}


            {taskText && (
              <div className={`player-task-card ${
                section?.challenge
                  ? "challenge"
                  : ""
              }`}>
                <span>
                  {section?.challenge
                    ? "🔥"
                    : "🛠️"}
                </span>

                <div>
                  <strong>
                    {section?.challenge
                      ? text(
                          "Challenge",
                          "تحدّي"
                        )
                      : text(
                          "Your Mission",
                          "مهمتك"
                        )}
                  </strong>

                  <p>
                    {taskText}
                  </p>
                </div>
              </div>
            )}


            {infoBox && (
              <div className="player-info-box">
                <span>💡</span>

                <div>
                  <strong>
                    {text(
                      "Important",
                      "معلومة مهمة"
                    )}
                  </strong>

                  <p>
                    {infoBox}
                  </p>
                </div>
              </div>
            )}


            {challengeBox && (
              <div className="player-extra-challenge">
                <span>🔥</span>

                <div>
                  <strong>
                    {text(
                      "Challenge",
                      "تحدّي"
                    )}
                  </strong>

                  <p>
                    {challengeBox}
                  </p>
                </div>
              </div>
            )}


            {isCodingConfig(section.codingConfig) && (
              <Suspense fallback={<p>{codeText("editorLoading")}</p>}>
                <CodeRunner
                  key={codingKey(section)}
                  config={section.codingConfig}
                  initialCode={codingAnswers[codingKey(section)]}
                  onEdit={() => setCodingResults(previous => ({ ...previous, [codingKey(section)]: false }))}
                  onResult={result => {
                    setCodingAnswers(previous => ({ ...previous, [codingKey(section)]: result.code }));
                    setCodingResults(previous => ({ ...previous, [codingKey(section)]: result.passed }));
                  }}
                />
              </Suspense>
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
          disabled={(isCodingConfig(section?.codingConfig) && !codingResults[codingKey(section)]) || (currentSlide === sections.length - 1 && !codingReady)}
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
