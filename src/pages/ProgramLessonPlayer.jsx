import { useContentProgress } from '../progress/useContentProgress';



import ProgressNotice from '../progress/ProgressNotice';



import { subscribeProgramContent } from '../access/programAccessClient';



import { createPracticeRepository } from '../components/mission/missionRepository';



import '../pages/ProgramAccess.css';



import {



  lazy,



  Suspense,



  useEffect,



  useMemo,



  useRef,



  useState,



} from "react";















import {



  useNavigate,



  useParams,



  Navigate,



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



import { auth, functions } from "../firebase/firebase";

import { httpsCallable } from "firebase/functions";



















function ProgramLessonPlayer() {



  const [locked, setLocked] = useState(false);



  const [learnerRole, setLearnerRole] = useState('');



  const practiceRepository = useMemo(() => createPracticeRepository(), []);



  const { text: codeText } = useCodeText();



  const [codingResults, setCodingResults] = useState({});



  const [codingAnswers, setCodingAnswers] = useState({});



  const [studentId, setStudentId] = useState(null);



  const missionStudent = useMemo(() => ({ id: studentId }), [studentId]);



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

  const [interactionAnswers, setInteractionAnswers] = useState({});
  const [interactionChecked, setInteractionChecked] = useState({});







  const [



    completed,



    setCompleted,



  ] = useState(false);



  const [completing, setCompleting] = useState(false);

  const [completionError, setCompletionError] = useState('');

  const [completionResult, setCompletionResult] = useState(null);











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











  const errorText = useRef(text);



  errorText.current = text;







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



    setLoading(true); setError(''); setLocked(false); setLesson(null);



    setCurrentSlide(0); setCompleted(false); setCompleting(false); setCompletionError(''); setCompletionResult(null); setAnswers({}); setCheckedAnswers({}); setInteractionAnswers({}); setInteractionChecked({}); setCodingResults({}); setCodingAnswers({});



    return subscribeProgramContent(programId, data => {



      const found = data.lessons?.find(item => item.id === lessonId);



      setProgram(data.program); setLearnerRole(data.role); setStudentId(auth.currentUser?.uid);



      setLocked(Boolean(found?.locked)); setLesson(current => JSON.stringify(current) === JSON.stringify(found || null) ? current : found || null); setLoading(false);



      setError(found ? '' : errorText.current('Lesson could not be found.', 'لم يتم العثور على الدرس.'));



    }, failure => {



      console.error('Lesson access load failed', failure.code, failure.message);



      setLesson(null); setLoading(false);



      setError(errorText.current('Could not open the lesson.', 'تعذر فتح الدرس.'));



    }, { lessonId });



  }, [programId, lessonId]);











  /* =====================================================



     SECTIONS



  ===================================================== */







  const sections = useMemo(() => getLessonSections(lesson), [lesson]);



  const resume = useContentProgress({



    enabled: !loading && !locked && learnerRole === 'student' && Boolean(lesson) && !lesson.previewOnly && lesson.activityType !== 'mission' && sections.length > 0,



    programId, contentId: lessonId,



    snapshot: useMemo(() => ({ lastSectionIndex: currentSlide, status: completed ? 'completed' : 'in_progress',



      state: { answers, checkedAnswers, interactionAnswers, interactionChecked, codingAnswers, codingResults } }), [currentSlide, completed, answers, checkedAnswers, interactionAnswers, interactionChecked, codingAnswers, codingResults]),



    onRestore: saved => {



      if (!saved) return;



      setCurrentSlide(Math.min(saved.lastSectionIndex, sections.length - 1));



      setAnswers(saved.state?.answers || {}); setCheckedAnswers(saved.state?.checkedAnswers || {}); setInteractionAnswers(saved.state?.interactionAnswers || {}); setInteractionChecked(saved.state?.interactionChecked || {});



      setCodingAnswers(saved.state?.codingAnswers || {}); setCodingResults(saved.state?.codingResults || {});



      setCompleted(saved.status === 'completed');

      // Open the saved slide even when revisiting completed content.



    },



  });



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

    classification: {
      themeColor: "#7c3aed",
      accentColor: "#06b6d4",
      surfaceColor: "#f5f3ff",
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







  const selectAnswer = (index) => {
    const alreadyCorrect =
      checkedAnswers[currentSlide] &&
      Number(answers[currentSlide]) === Number(section?.correctAnswer);

    if (alreadyCorrect) return;

    setAnswers((current) => ({ ...current, [currentSlide]: index }));

    if (checkedAnswers[currentSlide]) {
      setCheckedAnswers((current) => ({ ...current, [currentSlide]: false }));
    }
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











  const classificationAnswer = interactionAnswers[currentSlide] || {};

  const classificationCorrect =
    section?.type === "classification" &&
    Array.isArray(section?.items) &&
    section.items.length > 0 &&
    section.items.every(
      (item) => classificationAnswer[item.id] === item.correctCategory
    );

  const chooseClassification = (itemId, categoryId) => {
    if (interactionChecked[currentSlide] && classificationCorrect) return;

    setInteractionChecked((current) => ({
      ...current,
      [currentSlide]: false,
    }));

    setInteractionAnswers((current) => ({
      ...current,
      [currentSlide]: {
        ...(current[currentSlide] || {}),
        [itemId]: categoryId,
      },
    }));
  };

  const checkClassification = () => {
    if (!section?.items?.length) return;

    const allAnswered = section.items.every(
      (item) => classificationAnswer[item.id]
    );
    if (!allAnswered) return;

    setInteractionChecked((current) => ({
      ...current,
      [currentSlide]: true,
    }));
  };

  const requiresCorrectAnswer =
    section?.type === "multipleChoice" && options.length > 0;

  const requiresClassification =
    section?.type === "classification";

  const canAdvance =
    (!requiresCorrectAnswer || Boolean(isCorrect)) &&
    (!requiresClassification ||
      (interactionChecked[currentSlide] && classificationCorrect));

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

    async () => {

      if (completing) return;
      if (!canAdvance) return;

      if (isCodingConfig(section?.codingConfig) && !codingResults[codingKey(section)]) return;

      if (currentSlide === sections.length - 1 && !codingReady) return;



      if (currentSlide < sections.length - 1) {

        setCurrentSlide(currentSlide + 1);

        return;

      }



      // Preview, teacher and owner practice never awards student XP.

      if (lesson.previewOnly || learnerRole !== 'student') {

        setCompleted(true);

        return;

      }



      const selectedAnswers = {};

      const answerResults = {};

      const taskAnswers = {};



      sections.forEach((item, index) => {

        if (!item.id) return;



        if (item.type === 'multipleChoice') {

          selectedAnswers[item.id] = answers[index];

          answerResults[item.id] =

            checkedAnswers[index] &&

            Number(answers[index]) === Number(item.correctAnswer ?? item.correctOptionId ?? item.answer)

              ? 'correct'

              : 'pending';

        } else if (isCodingConfig(item.codingConfig)) {

          answerResults[item.id] = codingResults[codingKey(item)] ? 'correct' : 'pending';

        }

      });



      try {

        setCompleting(true);

        setCompletionError('');



        const response = await httpsCallable(functions, 'completeLesson')({

          lessonId: lesson.id,

          progress: {

            currentSlide: sections.length - 1,

            maxUnlockedSlide: sections.length - 1,

            selectedAnswers,

            answerResults,

            taskAnswers,

          },

        });



        const result = response?.data;

        if (!result || !Number.isFinite(result.xp) || typeof result.alreadyCompleted !== 'boolean') {

          throw new Error('invalid-completion-response');

        }



        setCompletionResult(result);

        setCompleted(true);

      } catch (error) {

        console.error('Complete program lesson:', error);

        setCompletionError(

          language === 'ar'

            ? 'تعذر إنهاء الدرس. تحقق من الاتصال وحاول مجددًا.'

            : language === 'he'

              ? 'לא ניתן להשלים את השיעור. בדקו את החיבור ונסו שוב.'

              : 'Could not complete the lesson. Check your connection and try again.'

        );

      } finally {

        setCompleting(false);

      }

    };





  const restartLesson =



    () => {



      setCurrentSlide(0);



      setAnswers({});



      setCheckedAnswers({});

      setInteractionAnswers({});
      setInteractionChecked({});
      setCompletionResult(null);
      setCompletionError('');




      setCompleted(false);
      setCompletionResult(null);
      setCompletionError("");



    };











  /* =====================================================



     LOADING



  ===================================================== */







  if (locked) return <Navigate to={`/programs/${programId}/access`} replace />;







  if (!resume.ready) return <ProgressNotice progress={resume} />;







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



      <>{lesson.previewOnly && <p className="access-preview-notice" dir={language === 'en' ? 'ltr' : 'rtl'}>{language === 'ar' ? 'معاينة مجانية · جرّب المهمة. يُحفظ التقدم في هذه الجلسة فقط.' : language === 'he' ? 'התנסות חינם · נסו את המשימה. ההתקדמות נשמרת במפגש זה בלבד.' : 'Free preview · Try the mission. Progress is kept for this session only.'}</p>}<Suspense fallback={<div className="program-player-loading">🤖</div>}>



        <MissionPlayer



          key={`${studentId}:${lesson.id}:${lesson.previewOnly}`}



          lesson={lesson}



          student={missionStudent}



          repository={lesson.previewOnly || learnerRole !== "student" ? practiceRepository : undefined}



          onExit={() => navigate(`/programs/${programId}`)}



        />



      </Suspense></>



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



            TechMinds



          </small>











          <h1>



            {completionResult?.programCompleted

              ? (language === 'ar' ? 'أكملت البرنامج!' : language === 'he' ? 'התוכנית הושלמה!' : 'Program Completed!')

              : text("Lesson Completed!", "أكملت الدرس!")}



          </h1>











          <p>



            {completionResult?.programCompleted

              ? (language === 'ar'

                  ? 'عمل رائع! أكملت جميع الدروس المطلوبة في هذا البرنامج.'

                  : language === 'he'

                    ? 'עבודה מצוינת! השלמת את כל השיעורים הנדרשים בתוכנית.'

                    : 'Excellent work! You completed every required lesson in this program.')

              : text("Great work! You reached the end of this lesson.", "عمل رائع! وصلت إلى نهاية هذا الدرس.")}



          </p>











          {Number.isFinite(completionResult?.totalXp) && (

            <p>⭐ +{completionResult.xp} XP · {language === 'ar' ? 'المجموع' : language === 'he' ? 'סה״כ' : 'Total'} {completionResult.totalXp} XP · {language === 'ar' ? 'المستوى' : language === 'he' ? 'רמה' : 'Level'} {completionResult.level}</p>

          )}



          {completionError && <p role="alert">{completionError}</p>}



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











            {!completionResult?.programCompleted && completionResult?.nextLessonId && (

              <button

                type="button"

                className="complete-primary"

                onClick={() => navigate(`/programs/${programId}/lessons/${completionResult.nextLessonId}`)}

              >

                {language === 'ar' ? 'الدرس التالي' : language === 'he' ? 'השיעור הבא' : 'Next Lesson'}

              </button>

            )}



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







      {lesson.previewOnly && <p className="access-preview-notice">{language === 'ar' ? 'معاينة مجانية' : language === 'he' ? 'התנסות חינם' : 'Free preview'}</p>}







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







        
          <button
            type="button"
            className={language === "he" ? "active" : ""}
            onClick={() => setLanguage("he")}
          >
            עברית
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



                decoding="async"
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











      <ProgressNotice progress={resume} />



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
                  "classification"
                ? "🎯"
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



                    decoding="async"
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











            {section.type === "classification" && (
              <div className="player-classification">
                <div className="classification-items">
                  {section.items?.map((item) => (
                    <div className="classification-item" key={item.id}>
                      <strong>{localized(item.label)}</strong>

                      <div className="classification-category-buttons">
                        {section.categories?.map((category) => {
                          const selected =
                            classificationAnswer[item.id] === category.id;
                          const checked = interactionChecked[currentSlide];
                          const correct = item.correctCategory === category.id;

                          let className = "classification-category";
                          if (selected) className += " selected";
                          if (checked && selected && correct) className += " correct";
                          if (checked && selected && !correct) className += " wrong";

                          return (
                            <button
                              key={category.id}
                              type="button"
                              className={className}
                              onClick={() =>
                                chooseClassification(item.id, category.id)
                              }
                            >
                              {category.emoji && <span>{category.emoji}</span>}
                              {localized(category.label)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!(
                  interactionChecked[currentSlide] &&
                  classificationCorrect
                ) && (
                  <button
                    type="button"
                    className="player-check-answer"
                    disabled={
                      !section.items?.every(
                        (item) => classificationAnswer[item.id]
                      )
                    }
                    onClick={checkClassification}
                  >
                    {language === "ar"
                      ? "تحقق من التصنيف"
                      : language === "he"
                      ? "בדקו את המיון"
                      : "Check Classification"}
                  </button>
                )}

                {interactionChecked[currentSlide] && (
                  <div
                    className={
                      classificationCorrect
                        ? "player-feedback correct-feedback"
                        : "player-feedback wrong-feedback"
                    }
                  >
                    {classificationCorrect
                      ? language === "ar"
                        ? "✅ ممتاز! صنّفت جميع العناصر بشكل صحيح."
                        : language === "he"
                        ? "✅ מצוין! מיינתם את כל הפריטים נכון."
                        : "✅ Excellent! Everything is classified correctly."
                      : language === "ar"
                      ? "❌ في تصنيف غير صحيح. غيّره وحاول مرة أخرى."
                      : language === "he"
                      ? "❌ יש מיון שגוי. שנו אותו ונסו שוב."
                      : "❌ Something is misplaced. Change it and try again."}
                  </div>
                )}
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



                {language === "ar" ? "تحقق من الإجابة" : language === "he" ? "בדיקת תשובה" : "Check Answer"}



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



                      "Not quite yet. Choose another answer and try again.",



                      "ليست صحيحة بعد. اختر إجابة أخرى وحاول مجددًا."



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



                disabled={index > currentSlide}
                onClick={() => { if (index <= currentSlide) setCurrentSlide(index); }}



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



          disabled={completing || !canAdvance || (isCodingConfig(section?.codingConfig) && !codingResults[codingKey(section)]) || (currentSlide === sections.length - 1 && !codingReady)}



          onClick={



            nextSlide



          }



        >



          {currentSlide ===



          sections.length -



            1



            ? (completing

                ? (language === 'ar' ? 'جارٍ الحفظ...' : language === 'he' ? 'שומר...' : 'Saving...')

                : text(

                    "Complete Lesson",

                    "إنهاء الدرس"

                  ))



            : text(



                "Next",



                "التالي"



              )}







          {" "}







          {language === "ar"



            ? "←"



            : "→"}







        </button>



        {completionError && (

          <p role="alert" className="program-player-error-message">{completionError}</p>

        )}







      </footer>







    </div>



  );



}











export default ProgramLessonPlayer;
