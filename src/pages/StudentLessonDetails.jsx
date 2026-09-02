import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./StudentLessonDetails.css";


function StudentLessonDetails() {
  const navigate =
    useNavigate();

  const {
    lessonId,
  } = useParams();

  const {
    language,
    setLanguage,
  } = useLanguage();


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
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      if (
        typeof value ===
        "string"
      ) {
        return value;
      }

      if (
        Array.isArray(value)
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


  const localizedArray =
    (value) => {

      if (!value) {
        return [];
      }


      if (
        Array.isArray(value)
      ) {
        return value.map(
          (item) =>
            typeof item ===
            "string"
              ? item
              : localized(item)
        );
      }


      const translated =
        localized(value);


      if (
        Array.isArray(
          translated
        )
      ) {
        return translated;
      }


      if (translated) {
        return [
          translated,
        ];
      }


      return [];
    };


  /* =====================================================
     STATE
  ===================================================== */

  const [
    lesson,
    setLesson,
  ] = useState(null);

  const [
    studentProfile,
    setStudentProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* SLIDES */

  const [
    currentSlide,
    setCurrentSlide,
  ] = useState(0);

  const [
    maxUnlockedSlide,
    setMaxUnlockedSlide,
  ] = useState(0);


  /* ANSWERS */

  const [
    selectedAnswers,
    setSelectedAnswers,
  ] = useState({});

  const [
    answerResults,
    setAnswerResults,
  ] = useState({});

  const [
    taskAnswers,
    setTaskAnswers,
  ] = useState({});


  /* COMPLETION */

  const [
    lessonCompleted,
    setLessonCompleted,
  ] = useState(false);

  const [
    completingLesson,
    setCompletingLesson,
  ] = useState(false);

  const [
    completionError,
    setCompletionError,
  ] = useState("");

  const [
    xpEarned,
    setXpEarned,
  ] = useState(0);


  /* PORTFOLIO */

  const [
    portfolioSaved,
    setPortfolioSaved,
  ] = useState({});

  const [
    portfolioSavingId,
    setPortfolioSavingId,
  ] = useState("");

  const [
    portfolioError,
    setPortfolioError,
  ] = useState("");


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
      [
        lesson,
      ]
    );


  const currentSection =
    sections[
      currentSlide
    ] || null;


  const totalSlides =
    sections.length;


  /* =====================================================
     LESSON HELPERS
  ===================================================== */

  const getLessonTitle =
    () => {

      if (!lesson) {
        return "";
      }


      return (
        localized(
          lesson.titleI18n
        ) ||
        localized(
          lesson.title
        ) ||
        ""
      );
    };


  const getLessonDescription =
    () => {

      if (!lesson) {
        return "";
      }


      return (
        localized(
          lesson.descriptionI18n
        ) ||
        localized(
          lesson.description
        ) ||
        ""
      );
    };


  const getLessonIcon =
    () => {

      if (
        lesson?.icon
      ) {
        return lesson.icon;
      }


      switch (
        lesson?.activityType
      ) {

        case "ai":
          return "🤖";

        case "coding":
          return "💻";

        case "cyber":
          return "🔐";

        case "quiz":
          return "🧩";

        case "external":
          return "🌐";

        default:
          return "🚀";
      }
    };


  const getSectionIcon =
    (section) => {

      if (
        section?.icon
      ) {
        return section.icon;
      }


      switch (
        section?.type
      ) {

        case "objectives":
          return "🎯";

        case "question":
          return "💭";

        case "content":
          return "📚";

        case "examples":
          return "🌍";

        case "multipleChoice":
          return "🧩";

        case "task":
          return "🚀";

        case "summary":
          return "🌟";

        case "reflection":
          return "💬";

        default:
          return "💡";
      }
    };


  /* =====================================================
     LOAD PAGE
  ===================================================== */

  useEffect(() => {

    const loadPage =
      async () => {

        try {
          setLoading(true);
          setError("");


          const currentUser =
            auth.currentUser;


          if (
            !currentUser
          ) {
            navigate(
              "/login"
            );

            return;
          }


          /* =============================================
             STUDENT
          ============================================= */

          const studentSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                currentUser.uid
              )
            );


          if (
            !studentSnapshot.exists()
          ) {
            throw new Error(
              "student-not-found"
            );
          }


          const studentData =
            studentSnapshot.data();


          if (
            studentData.role !==
            "student"
          ) {
            navigate(
              "/teacher"
            );

            return;
          }


          setStudentProfile(
            {
              id:
                studentSnapshot.id,

              ...studentData,
            }
          );


          /* =============================================
             LESSON
          ============================================= */

          const lessonSnapshot =
            await getDoc(
              doc(
                db,
                "lessons",
                lessonId
              )
            );


          if (
            !lessonSnapshot.exists()
          ) {
            throw new Error(
              "lesson-not-found"
            );
          }


          const lessonData = {
            id:
              lessonSnapshot.id,

            ...lessonSnapshot.data(),
          };


          /*
            Extra safety:
            student can only open
            lessons from their class.
          */

          if (
            lessonData.classId &&
            studentData.classId &&
            lessonData.classId !==
              studentData.classId
          ) {
            throw new Error(
              "wrong-class"
            );
          }


          setLesson(
            lessonData
          );


          const lessonSections =
            Array.isArray(
              lessonData.sections
            )
              ? lessonData.sections
              : [];


          /* =============================================
             PROGRESS
          ============================================= */

          const progressId =
            `${currentUser.uid}_${lessonId}`;


          const progressSnapshot =
            await getDoc(
              doc(
                db,
                "lessonProgress",
                progressId
              )
            );


          if (
            progressSnapshot.exists()
          ) {
            const progressData =
              progressSnapshot.data();


            const savedSlide =
              Math.max(
                0,
                Math.min(
                  Number(
                    progressData.currentSlide ||
                    0
                  ),

                  Math.max(
                    lessonSections.length -
                      1,
                    0
                  )
                )
              );


            const savedUnlocked =
              Math.max(
                savedSlide,

                Math.min(
                  Number(
                    progressData.maxUnlockedSlide ||
                    0
                  ),

                  Math.max(
                    lessonSections.length -
                      1,
                    0
                  )
                )
              );


            setCurrentSlide(
              savedSlide
            );

            setMaxUnlockedSlide(
              savedUnlocked
            );

            setSelectedAnswers(
              progressData.selectedAnswers ||
                {}
            );

            setAnswerResults(
              progressData.answerResults ||
                {}
            );

            setTaskAnswers(
              progressData.taskAnswers ||
                {}
            );


            if (
              progressData.status ===
              "completed"
            ) {
              setLessonCompleted(
                true
              );

              setMaxUnlockedSlide(
                Math.max(
                  lessonSections.length -
                    1,
                  0
                )
              );
            }
          }


          /* =============================================
             COMPLETION
          ============================================= */

          const completionId =
            `${currentUser.uid}_${lessonId}`;


          const completionSnapshot =
            await getDoc(
              doc(
                db,
                "lessonCompletions",
                completionId
              )
            );


          if (
            completionSnapshot.exists()
          ) {
            const completionData =
              completionSnapshot.data();


            setLessonCompleted(
              true
            );


            setXpEarned(
              Number(
                completionData.xpReward ||
                lessonData.xpReward ||
                0
              )
            );


            setMaxUnlockedSlide(
              Math.max(
                lessonSections.length -
                  1,
                0
              )
            );
          }


          /* =============================================
             PORTFOLIO
          ============================================= */

          try {
            const portfolioQuery =
              query(
                collection(
                  db,
                  "portfolio"
                ),

                where(
                  "studentId",
                  "==",
                  currentUser.uid
                )
              );


            const portfolioSnapshot =
              await getDocs(
                portfolioQuery
              );


            const saved = {};


            portfolioSnapshot.docs.forEach(
              (
                portfolioDocument
              ) => {

                const data =
                  portfolioDocument.data();


                if (
                  data.lessonId ===
                    lessonId &&
                  data.sectionId
                ) {
                  saved[
                    data.sectionId
                  ] = true;
                }
              }
            );


            setPortfolioSaved(
              saved
            );

          } catch (
            portfolioLoadError
          ) {

            console.log(
              "Portfolio load:",
              portfolioLoadError
            );

          }


        } catch (
          loadError
        ) {

          console.error(
            "Student lesson details:",
            loadError
          );


          setError(
            text(
              "The lesson could not be loaded.",
              "تعذر تحميل الدرس."
            )
          );

        } finally {

          setLoading(
            false
          );
        }
      };


    loadPage();

  }, [
    lessonId,
    navigate,
  ]);


  /* =====================================================
     SAVE PROGRESS
  ===================================================== */

  const saveProgress =
    async (
      changes = {}
    ) => {

      const currentUser =
        auth.currentUser;


      if (
        !currentUser ||
        !lesson
      ) {
        return;
      }


      try {
        const progressId =
          `${currentUser.uid}_${lesson.id}`;


        const progressRef =
          doc(
            db,
            "lessonProgress",
            progressId
          );


        const data = {
          studentId:
            currentUser.uid,

          studentName:
            studentProfile?.name ||
            "",

          lessonId:
            lesson.id,

          lessonTitle:
            getLessonTitle(),

          teacherId:
            lesson.teacherId ||
            studentProfile?.teacherId ||
            "",

          classId:
            lesson.classId ||
            studentProfile?.classId ||
            "",

          className:
            lesson.className ||
            studentProfile?.className ||
            "",

          currentSlide:
            changes.currentSlide ??
            currentSlide,

          maxUnlockedSlide:
            changes.maxUnlockedSlide ??
            maxUnlockedSlide,

          selectedAnswers:
            changes.selectedAnswers ??
            selectedAnswers,

          answerResults:
            changes.answerResults ??
            answerResults,

          taskAnswers:
            changes.taskAnswers ??
            taskAnswers,

          status:
            lessonCompleted
              ? "completed"
              : "in_progress",

          updatedAt:
            serverTimestamp(),
        };


        const existingSnapshot =
          await getDoc(
            progressRef
          );


        if (
          !existingSnapshot.exists()
        ) {
          data.createdAt =
            serverTimestamp();
        }


        await setDoc(
          progressRef,
          data,
          {
            merge: true,
          }
        );

      } catch (
        progressError
      ) {

        console.error(
          "Save lesson progress:",
          progressError
        );
      }
    };


  /* =====================================================
     WRITTEN ANSWERS
  ===================================================== */

  const changeTaskAnswer =
    (
      sectionId,
      value
    ) => {

      setTaskAnswers(
        (
          previous
        ) => ({
          ...previous,

          [sectionId]:
            value,
        })
      );


      setPortfolioSaved(
        (
          previous
        ) => ({
          ...previous,

          [sectionId]:
            false,
        })
      );
    };


  /* =====================================================
     QUIZ
  ===================================================== */

  const chooseOption =
    (
      sectionId,
      optionId
    ) => {

      if (
        answerResults[
          sectionId
        ] === "correct"
      ) {
        return;
      }


      setSelectedAnswers(
        (
          previous
        ) => ({
          ...previous,

          [sectionId]:
            optionId,
        })
      );


      setAnswerResults(
        (
          previous
        ) => {

          const next = {
            ...previous,
          };


          delete next[
            sectionId
          ];


          return next;
        }
      );
    };


  const getCorrectAnswer =
    (section) =>
      section.correctAnswer ??
      section.correctOptionId ??
      section.answer ??
      "";


  const checkQuizAnswer =
    async (
      section
    ) => {

      const selected =
        selectedAnswers[
          section.id
        ];


      if (!selected) {
        return;
      }


      const correctAnswer =
        getCorrectAnswer(
          section
        );


      const correct =
        String(
          selected
        ) ===
        String(
          correctAnswer
        );


      const newResults = {
        ...answerResults,

        [section.id]:
          correct
            ? "correct"
            : "wrong",
      };


      setAnswerResults(
        newResults
      );


      await saveProgress(
        {
          answerResults:
            newResults,
        }
      );
    };


  const retryQuiz =
    (
      sectionId
    ) => {

      const newAnswers = {
        ...selectedAnswers,
      };


      const newResults = {
        ...answerResults,
      };


      delete newAnswers[
        sectionId
      ];

      delete newResults[
        sectionId
      ];


      setSelectedAnswers(
        newAnswers
      );

      setAnswerResults(
        newResults
      );
    };


  /* =====================================================
     CAN CONTINUE
  ===================================================== */

  const canContinue =
    (section) => {

      if (
        !section ||
        lessonCompleted
      ) {
        return true;
      }


      if (
        section.type ===
        "multipleChoice"
      ) {
        return (
          answerResults[
            section.id
          ] === "correct"
        );
      }


      if (
        section.type ===
        "question"
      ) {
        return Boolean(
          taskAnswers[
            section.id
          ]?.trim()
        );
      }


      if (
        section.type ===
          "task" &&
        section.answerPrompt
      ) {
        return Boolean(
          taskAnswers[
            section.id
          ]?.trim()
        );
      }


      if (
        section.type ===
        "reflection"
      ) {
        return Boolean(
          taskAnswers[
            section.id
          ]?.trim()
        );
      }


      return true;
    };


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goPrevious =
    async () => {

      if (
        currentSlide <= 0
      ) {
        return;
      }


      const nextSlide =
        currentSlide - 1;


      setCurrentSlide(
        nextSlide
      );


      await saveProgress(
        {
          currentSlide:
            nextSlide,
        }
      );
    };


  const goNext =
    async () => {

      if (
        !currentSection ||
        !canContinue(
          currentSection
        )
      ) {
        return;
      }


      if (
        currentSlide >=
        totalSlides - 1
      ) {
        return;
      }


      const nextSlide =
        currentSlide + 1;


      const nextUnlocked =
        Math.max(
          maxUnlockedSlide,
          nextSlide
        );


      setCurrentSlide(
        nextSlide
      );

      setMaxUnlockedSlide(
        nextUnlocked
      );


      await saveProgress(
        {
          currentSlide:
            nextSlide,

          maxUnlockedSlide:
            nextUnlocked,
        }
      );
    };


  const goToSlide =
    async (
      index
    ) => {

      if (
        !lessonCompleted &&
        index >
          maxUnlockedSlide
      ) {
        return;
      }


      setCurrentSlide(
        index
      );


      await saveProgress(
        {
          currentSlide:
            index,
        }
      );
    };


  /* =====================================================
     PORTFOLIO
  ===================================================== */
const addTaskToPortfolio =
  async (section) => {

    const currentUser =
      auth.currentUser;

    if (
      !currentUser ||
      !lesson ||
      !section
    ) {
      return;
    }


    const answer =
      taskAnswers[
        section.id
      ] || "";


    if (!answer.trim()) {
      return;
    }


    try {

      setPortfolioSavingId(
        section.id
      );

      setPortfolioError("");


      const portfolioId =
        `${currentUser.uid}_${lesson.id}_${section.id}`;


      const portfolioRef =
        doc(
          db,
          "portfolio",
          portfolioId
        );


      const sectionTitle =
        localized(
          section.title
        ) ||
        getLessonTitle();


      const description =
        localized(
          section.introduction
        ) ||
        localized(
          section.description
        ) ||
        localized(
          section.text
        ) ||
        localized(
          section.answerPrompt
        ) ||
        "";


      const portfolioData = {

        studentId:
          currentUser.uid,

        studentName:
          studentProfile?.name ||
          "",

        teacherId:
          lesson.teacherId ||
          studentProfile?.teacherId ||
          "",

        classId:
          lesson.classId ||
          studentProfile?.classId ||
          "",

        className:
          lesson.className ||
          studentProfile?.className ||
          "",


        lessonId:
          lesson.id,

        lessonTitle:
          getLessonTitle(),


        sectionId:
          section.id,

        title:
          sectionTitle,

        description:
          description,

        answer:
          answer.trim(),


        projectType:
          lesson.activityType ||
          lesson.learningTrack ||
          "creative",

        status:
          "completed",


        updatedAt:
          serverTimestamp(),
      };


      /*
        IMPORTANT:
        No getDoc before setDoc.
        Firestore will create the document
        if it does not exist.
      */

      await setDoc(
        portfolioRef,
        portfolioData,
        {
          merge: true,
        }
      );


      setPortfolioSaved(
        (previous) => ({
          ...previous,

          [section.id]:
            true,
        })
      );


    } catch (error) {

      console.error(
        "Portfolio save error:",
        error
      );


      setPortfolioError(
        text(
          "Could not add this work to your portfolio.",
          "تعذر إضافة هذا العمل إلى معرض أعمالك."
        )
      );


    } finally {

      setPortfolioSavingId(
        ""
      );
    }
  };

  /* =====================================================
     COMPLETE LESSON
  ===================================================== */

  const completeLesson =
    async () => {

      const currentUser =
        auth.currentUser;


      if (
        !currentUser ||
        !lesson
      ) {
        return;
      }


      if (
        totalSlides > 0 &&
        (
          currentSlide !==
            totalSlides - 1 ||
          !canContinue(
            currentSection
          )
        )
      ) {
        return;
      }


      try {
        setCompletingLesson(
          true
        );

        setCompletionError(
          ""
        );


        const completionId =
          `${currentUser.uid}_${lesson.id}`;


        const completionRef =
          doc(
            db,
            "lessonCompletions",
            completionId
          );


        const progressRef =
          doc(
            db,
            "lessonProgress",
            completionId
          );


        const studentRef =
          doc(
            db,
            "users",
            currentUser.uid
          );


        const reward =
          Number(
            lesson.xpReward ||
            0
          );


        let alreadyCompleted =
          false;


        await runTransaction(
          db,

          async (
            transaction
          ) => {

            const completionSnapshot =
              await transaction.get(
                completionRef
              );


            if (
              completionSnapshot.exists()
            ) {
              alreadyCompleted =
                true;

              return;
            }


            transaction.set(
              completionRef,

              {
                studentId:
                  currentUser.uid,

                studentName:
                  studentProfile?.name ||
                  "",

                lessonId:
                  lesson.id,

                lessonTitle:
                  getLessonTitle(),

                teacherId:
                  lesson.teacherId ||
                  studentProfile?.teacherId ||
                  "",

                classId:
                  lesson.classId ||
                  studentProfile?.classId ||
                  "",

                className:
                  lesson.className ||
                  studentProfile?.className ||
                  "",

                xpReward:
                  reward,

                completedAt:
                  serverTimestamp(),
              }
            );


            transaction.update(
              studentRef,

              {
                xp:
                  increment(
                    reward
                  ),

                completedLessons:
                  increment(1),

                updatedAt:
                  serverTimestamp(),
              }
            );


            transaction.set(
              progressRef,

              {
                studentId:
                  currentUser.uid,

                studentName:
                  studentProfile?.name ||
                  "",

                lessonId:
                  lesson.id,

                lessonTitle:
                  getLessonTitle(),

                teacherId:
                  lesson.teacherId ||
                  studentProfile?.teacherId ||
                  "",

                classId:
                  lesson.classId ||
                  studentProfile?.classId ||
                  "",

                className:
                  lesson.className ||
                  studentProfile?.className ||
                  "",

                currentSlide:
                  Math.max(
                    totalSlides - 1,
                    0
                  ),

                maxUnlockedSlide:
                  Math.max(
                    totalSlides - 1,
                    0
                  ),

                selectedAnswers,

                answerResults,

                taskAnswers,

                status:
                  "completed",

                completedAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp(),
              },

              {
                merge: true,
              }
            );
          }
        );


        setLessonCompleted(
          true
        );


        setMaxUnlockedSlide(
          Math.max(
            totalSlides - 1,
            0
          )
        );


        setXpEarned(
          reward
        );


        /*
          Refresh displayed XP
          only when reward was new.
        */

        if (
          !alreadyCompleted
        ) {
          setStudentProfile(
            (
              previous
            ) => {

              if (!previous) {
                return previous;
              }


              return {
                ...previous,

                xp:
                  Number(
                    previous.xp ||
                    0
                  ) +
                  reward,

                completedLessons:
                  Number(
                    previous.completedLessons ||
                    0
                  ) +
                  1,
              };
            }
          );
        }


      } catch (
        completeError
      ) {

        console.error(
          "Complete lesson:",
          completeError
        );


        setCompletionError(
          text(
            "Could not complete the lesson.",
            "تعذر إنهاء الدرس."
          )
        );

      } finally {

        setCompletingLesson(
          false
        );
      }
    };


  /* =====================================================
     RENDER LIST
  ===================================================== */

  const renderList =
    (
      items,
      icon = "✓"
    ) => {

      const list =
        localizedArray(
          items
        );


      if (
        list.length === 0
      ) {
        return null;
      }


      return (
        <ul className="lesson-objective-list">

          {list.map(
            (
              item,
              index
            ) => (

              <li
                key={
                  `${item}-${index}`
                }
              >

                <span>
                  {icon}
                </span>

                {typeof item ===
                "string"
                  ? item
                  : localized(
                      item
                    )}

              </li>

            )
          )}

        </ul>
      );
    };


  /* =====================================================
     RENDER SECTION
  ===================================================== */

  const renderSectionContent =
    (section) => {

      if (!section) {
        return null;
      }


      /* =============================================
         OBJECTIVES
      ============================================= */

      if (
        section.type ===
        "objectives"
      ) {
        return renderList(
          section.items ||
          section.objectives ||
          section.points
        );
      }


      /* =============================================
         THINK / QUESTION
      ============================================= */

      if (
        section.type ===
        "question"
      ) {

        return (
          <>

            <div className="thinking-question">

              {localized(
                section.text ||
                section.question
              )}

            </div>


            {section.note && (

              <p className="thinking-note">

                {localized(
                  section.note
                )}

              </p>

            )}


            <div className="task-answer-area">

              <label>

                {localized(
                  section.answerPrompt
                ) ||
                  text(
                    "Write your answer:",
                    "اكتب إجابتك:"
                  )}

              </label>


              <textarea
                rows="5"
                value={
                  taskAnswers[
                    section.id
                  ] || ""
                }
                onChange={(
                  event
                ) =>
                  changeTaskAnswer(
                    section.id,
                    event.target.value
                  )
                }
                onBlur={() =>
                  saveProgress()
                }
                placeholder={text(
                  "Write your idea here...",
                  "اكتب فكرتك هنا..."
                )}
              />

            </div>

          </>
        );
      }


      /* =============================================
         CONTENT
      ============================================= */

      if (
        section.type ===
          "content" ||
        section.type ===
          "concept" ||
        section.type ===
          "learn"
      ) {

        const paragraphs =
          localizedArray(
            section.paragraphs
          );


        return (
          <div className="lesson-paragraphs">

            {paragraphs.length >
            0 ? (

              paragraphs.map(
                (
                  paragraph,
                  index
                ) => (

                  <p
                    key={
                      index
                    }
                  >

                    {typeof paragraph ===
                    "string"
                      ? paragraph
                      : localized(
                          paragraph
                        )}

                  </p>

                )
              )

            ) : (

              <p>

                {localized(
                  section.text ||
                  section.content ||
                  section.description
                )}

              </p>

            )}

          </div>
        );
      }


      /* =============================================
         EXAMPLES
      ============================================= */

      if (
        section.type ===
        "examples"
      ) {

        const examples =
          Array.isArray(
            section.examples
          )
            ? section.examples
            : [];


        return (
          <div className="lesson-examples-grid">

            {examples.map(
              (
                example,
                index
              ) => (

                <div
                  className="lesson-example-card"
                  key={
                    example.id ||
                    index
                  }
                >

                  <span>

                    {example.icon ||
                      "💡"}

                  </span>


                  <h3>

                    {localized(
                      example.title
                    )}

                  </h3>


                  <p>

                    {localized(
                      example.text ||
                      example.description
                    )}

                  </p>

                </div>

              )
            )}

          </div>
        );
      }


      /* =============================================
         MULTIPLE CHOICE
      ============================================= */

      if (
        section.type ===
        "multipleChoice"
      ) {

        const selected =
          selectedAnswers[
            section.id
          ];


        const result =
          answerResults[
            section.id
          ];


        return (
          <>

            <h3 className="lesson-question-title">

              {localized(
                section.question
              )}

            </h3>


            <div className="lesson-options">

              {(
                section.options ||
                []
              ).map(
                (
                  option,
                  index
                ) => {

                  const optionId =
                    option.id ??
                    String(
                      index
                    );


                  const isSelected =
                    String(
                      selected
                    ) ===
                    String(
                      optionId
                    );


                  const isCorrect =
                    result &&
                    String(
                      optionId
                    ) ===
                    String(
                      getCorrectAnswer(
                        section
                      )
                    );


                  const isWrong =
                    result ===
                      "wrong" &&
                    isSelected;


                  let className =
                    "lesson-option";


                  if (
                    isSelected
                  ) {
                    className +=
                      " selected";
                  }


                  if (
                    isCorrect
                  ) {
                    className +=
                      " correct";
                  }


                  if (
                    isWrong
                  ) {
                    className +=
                      " wrong";
                  }


                  return (
                    <button
                      type="button"
                      className={
                        className
                      }
                      key={
                        optionId
                      }
                      onClick={() =>
                        chooseOption(
                          section.id,
                          optionId
                        )
                      }
                    >

                      <span className="option-letter">

                        {
                          String.fromCharCode(
                            65 +
                              index
                          )
                        }

                      </span>


                      <span>

                        {localized(
                          option.text
                        )}

                      </span>

                    </button>
                  );
                }
              )}

            </div>


            {!result && (

              <button
                type="button"
                className="check-answer-button"
                disabled={
                  !selected
                }
                onClick={() =>
                  checkQuizAnswer(
                    section
                  )
                }
              >

                {text(
                  "Check Answer",
                  "تحقق من الإجابة"
                )}

              </button>

            )}


            {result ===
              "correct" && (

              <div className="quiz-result correct-result">

                <strong>

                  ✅{" "}

                  {text(
                    "Correct!",
                    "إجابة صحيحة!"
                  )}

                </strong>


                {section.feedbackCorrect && (

                  <p>

                    {localized(
                      section.feedbackCorrect
                    )}

                  </p>

                )}

              </div>

            )}


            {result ===
              "wrong" && (

              <div className="quiz-result wrong-result">

                <strong>

                  ❌{" "}

                  {text(
                    "Try again",
                    "حاول مرة أخرى"
                  )}

                </strong>


                {section.feedbackWrong && (

                  <p>

                    {localized(
                      section.feedbackWrong
                    )}

                  </p>

                )}


                <button
                  type="button"
                  onClick={() =>
                    retryQuiz(
                      section.id
                    )
                  }
                >

                  🔄{" "}

                  {text(
                    "Retry",
                    "إعادة المحاولة"
                  )}

                </button>

              </div>

            )}

          </>
        );
      }


      /* =============================================
         TASK
      ============================================= */

      if (
        section.type ===
        "task"
      ) {

        const steps =
          localizedArray(
            section.steps
          );


        const answer =
          taskAnswers[
            section.id
          ] || "";


        return (
          <>

            {section.introduction && (

              <p className="task-introduction">

                {localized(
                  section.introduction
                )}

              </p>

            )}


            {steps.length >
              0 && (

              <div className="task-steps">

                {steps.map(
                  (
                    step,
                    index
                  ) => (

                    <div
                      className="task-step"
                      key={
                        index
                      }
                    >

                      <span>

                        {index + 1}

                      </span>


                      <p>

                        {typeof step ===
                        "string"
                          ? step
                          : localized(
                              step
                            )}

                      </p>

                    </div>

                  )
                )}

              </div>

            )}


            {section.answerPrompt && (

              <div className="task-answer-area">

                <label>

                  {localized(
                    section.answerPrompt
                  )}

                </label>


                <textarea
  rows="6"
  value={answer}
  onChange={(event) =>
    changeTaskAnswer(
      section.id,
      event.target.value
    )
  }
  onBlur={() =>
    saveProgress()
  }
  placeholder={text(
    "Write your work here...",
    "اكتب عملك هنا..."
  )}
  style={{
    width: "100%",
    minHeight: "150px",
    padding: "16px 18px",

    backgroundColor: "#ffffff",

    color: "#111827",
    WebkitTextFillColor: "#111827",

    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "1.8",
    fontFamily: "Arial, sans-serif",

    border: "2px solid #cbd5e1",
    borderRadius: "14px",

    outline: "none",

    opacity: 1,
    visibility: "visible",

    position: "relative",
    zIndex: 20,

    caretColor: "#7c3aed",

    direction:
      language === "ar"
        ? "rtl"
        : "ltr",

    textAlign:
      language === "ar"
        ? "right"
        : "left",
  }}
/>

              </div>

            )}


            {/* =====================================
                PORTFOLIO
            ====================================== */}

            {section.answerPrompt &&
              answer.trim() && (

              <div className="lesson-portfolio-action">

                {portfolioSaved[
                  section.id
                ] ? (

                  <div className="lesson-portfolio-saved">

                    ✅{" "}

                    {text(
                      "Added to My Portfolio",
                      "تمت الإضافة إلى معرض أعمالي"
                    )}

                  </div>

                ) : (

                  <button
                    type="button"
                    className="add-to-portfolio-button"
                    disabled={
                      portfolioSavingId ===
                      section.id
                    }
                    onClick={() =>
                      addTaskToPortfolio(
                        section
                      )
                    }
                  >

                    {portfolioSavingId ===
                    section.id
                      ? text(
                          "Saving...",
                          "جارٍ الحفظ..."
                        )
                      : `📁 ${text(
                          "Add to My Portfolio",
                          "أضف إلى معرض أعمالي"
                        )}`
                    }

                  </button>

                )}

              </div>

            )}


            {portfolioError && (

              <div className="lesson-completion-error">

                ⚠️{" "}

                {portfolioError}

              </div>

            )}

          </>
        );
      }


      /* =============================================
         SUMMARY
      ============================================= */

      if (
        section.type ===
        "summary"
      ) {

        return (
          <>

            {section.text && (

              <div className="lesson-paragraphs">

                <p>

                  {localized(
                    section.text
                  )}

                </p>

              </div>

            )}


            {renderList(
              section.items ||
              section.points ||
              section.summary,
              "★"
            )}

          </>
        );
      }


      /* =============================================
         REFLECTION
      ============================================= */

      if (
        section.type ===
        "reflection"
      ) {

        return (
          <>

            <p className="reflection-question">

              {localized(
                section.question ||
                section.text
              )}

            </p>


            <textarea
              rows="6"
              value={
                taskAnswers[
                  section.id
                ] || ""
              }
              onChange={(
                event
              ) =>
                changeTaskAnswer(
                  section.id,
                  event.target.value
                )
              }
              onBlur={() =>
                saveProgress()
              }
              placeholder={text(
                "Share your reflection...",
                "اكتب تأملك هنا..."
              )}
            />

          </>
        );
      }


      /* =============================================
         GENERIC
      ============================================= */

      return (
        <div className="lesson-paragraphs">

          <p>

            {localized(
              section.text ||
              section.content ||
              section.description
            )}

          </p>

        </div>
      );
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div className="lesson-details-loading">

        🚀

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
      <div className="lesson-details-error-page">

        <div>
          📚
        </div>


        <h2>

          {error ||
            text(
              "Lesson not found.",
              "لم يتم العثور على الدرس."
            )}

        </h2>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/lessons"
            )
          }
        >

          {text(
            "Back to Lessons",
            "العودة إلى الدروس"
          )}

        </button>

      </div>
    );
  }


  /* =====================================================
     SIMPLE CUSTOM LESSON
  ===================================================== */

  if (
    totalSlides === 0
  ) {

    return (
      <div className="student-lesson-details-page">

        <div className="lesson-details-top">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/lessons"
              )
            }
          >

            {language === "ar"
              ? "↩ الدروس"
              : "← Lessons"}

          </button>


          <div className="lesson-details-language">

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

        </div>


        <section className="lesson-details-hero">

          <div className="lesson-details-icon">

            {getLessonIcon()}

          </div>


          <div>

            <span>
              TECHMINDS
            </span>


            <h1>

              {getLessonTitle()}

            </h1>


            <p>

              {getLessonDescription()}

            </p>

          </div>

        </section>


        <section className="lesson-details-content">

          <div className="lesson-content-heading">

            <span>
              📚
            </span>


            <div>

              <small>
                LESSON
              </small>

              <h2>

                {getLessonTitle()}

              </h2>

            </div>

          </div>


          {lesson.description && (

            <div className="lesson-description-box">

              <h3>

                {text(
                  "About this lesson",
                  "عن هذا الدرس"
                )}

              </h3>


              <p>

                {getLessonDescription()}

              </p>

            </div>

          )}


          {lesson.instructions && (

            <div className="lesson-instructions-box">

              <h3>

                {text(
                  "Instructions",
                  "التعليمات"
                )}

              </h3>


              <p>

                {localized(
                  lesson.instructions
                )}

              </p>

            </div>

          )}


          {lesson.resourceUrl && (

            <div className="lesson-resource-box">

              <div>

                <span>
                  🌐
                </span>


                <div>

                  <small>
                    RESOURCE
                  </small>

                  <h3>

                    {text(
                      "Lesson Resource",
                      "رابط النشاط"
                    )}

                  </h3>

                </div>

              </div>


              <a
                href={
                  lesson.resourceUrl
                }
                target="_blank"
                rel="noreferrer"
              >

                {text(
                  "Open",
                  "فتح"
                )}

              </a>

            </div>

          )}


          {!lessonCompleted ? (

            <div className="final-lesson-completion">

              <div className="final-trophy">
                🏆
              </div>


              <h2>

                {text(
                  "Finish this lesson",
                  "إنهاء هذا الدرس"
                )}

              </h2>


              <p>

                ⭐ +
                {lesson.xpReward ||
                  0} XP

              </p>


              <button
                type="button"
                className="complete-full-lesson-button"
                disabled={
                  completingLesson
                }
                onClick={
                  completeLesson
                }
              >

                {completingLesson
                  ? text(
                      "Saving...",
                      "جارٍ الحفظ..."
                    )
                  : text(
                      "Complete Lesson ✓",
                      "إنهاء الدرس ✓"
                    )}

              </button>

            </div>

          ) : (

            <div className="final-lesson-completion completed-full-lesson">

              <div>
                🎉
              </div>


              <h2>

                {text(
                  "Lesson Completed!",
                  "تم إكمال الدرس!"
                )}

              </h2>


              <strong>

                +{xpEarned} XP ⭐

              </strong>

            </div>

          )}

        </section>

      </div>
    );
  }


  /* =====================================================
     PROGRESS
  ===================================================== */

  const progressPercent =
    lessonCompleted
      ? 100
      : Math.round(
          (
            (
              currentSlide +
              1
            ) /
            totalSlides
          ) *
          100
        );


  const currentCanContinue =
    canContinue(
      currentSection
    );


  const isLastSlide =
    currentSlide ===
    totalSlides - 1;


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="student-lesson-details-page">

      {/* =================================================
          TOP
      ================================================= */}

      <div className="lesson-details-top">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/student/lessons"
            )
          }
        >

          {language === "ar"
            ? "↩ الدروس"
            : "← Lessons"}

        </button>


        <div className="lesson-details-language">

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

      </div>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="lesson-details-hero">

        <div className="lesson-details-icon">

          {getLessonIcon()}

        </div>


        <div>

          <span>

            {text(
              "TECHMINDS INTERACTIVE LESSON",
              "درس تفاعلي من TechMinds"
            )}

          </span>


          <h1>

            {getLessonTitle()}

          </h1>


          <p>

            {getLessonDescription()}

          </p>

        </div>


        {lessonCompleted && (

          <div className="lesson-completed-hero-badge">

            ✅{" "}

            {text(
              "Completed",
              "مكتمل"
            )}

          </div>

        )}

      </section>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="lesson-details-stats">

        <div>

          ⏱

          <span>

            {text(
              "Duration",
              "المدة"
            )}

          </span>

          <strong>

            {lesson.estimatedMinutes ||
              0}{" "}

            {text(
              "min",
              "دقيقة"
            )}

          </strong>

        </div>


        <div>

          ⭐

          <span>
            XP
          </span>

          <strong>

            +{lesson.xpReward ||
              0}

          </strong>

        </div>


        <div>

          📚

          <span>

            {text(
              "Slides",
              "الشرائح"
            )}

          </span>

          <strong>

            {totalSlides}

          </strong>

        </div>


        <div>

          📊

          <span>

            {text(
              "Progress",
              "التقدم"
            )}

          </span>

          <strong>

            {progressPercent}%

          </strong>

        </div>

      </section>


      {/* =================================================
          POWERPOINT
      ================================================= */}

      <section className="powerpoint-lesson">

        {/* ===============================================
            SIDEBAR
        =============================================== */}

        <aside className="powerpoint-sidebar">

          {sections.map(
            (
              section,
              index
            ) => {

              const unlocked =
                lessonCompleted ||
                index <=
                  maxUnlockedSlide;


              return (
                <button
                  type="button"
                  key={
                    section.id ||
                    index
                  }
                  disabled={
                    !unlocked
                  }
                  className={
                    currentSlide ===
                    index
                      ? "powerpoint-thumbnail active"
                      : unlocked
                      ? "powerpoint-thumbnail"
                      : "powerpoint-thumbnail locked"
                  }
                  onClick={() =>
                    goToSlide(
                      index
                    )
                  }
                >

                  <span className="powerpoint-thumbnail-number">

                    {index + 1}

                  </span>


                  <div>

                    <span>

                      {getSectionIcon(
                        section
                      )}

                    </span>


                    <p>

                      {localized(
                        section.title
                      ) ||
                        text(
                          "Slide",
                          "شريحة"
                        )}

                    </p>

                  </div>

                </button>
              );
            }
          )}

        </aside>


        {/* ===============================================
            MAIN
        =============================================== */}

        <main className="powerpoint-main">

          {/* TOOLBAR */}

          <div className="powerpoint-toolbar">

            <span>

              {getLessonTitle()}

            </span>


            <span className="powerpoint-slide-counter">

              {currentSlide + 1}
              {" / "}
              {totalSlides}

            </span>

          </div>


          {/* PROGRESS */}

          <div className="powerpoint-progress-track">

            <div
              className="powerpoint-progress-fill"
              style={{
                width:
                  `${progressPercent}%`,
              }}
            />

          </div>


          {/* SLIDE */}

          <div className="powerpoint-slide">

            <div className="powerpoint-slide-content">

              <article
                className={
                  `full-lesson-section ${
                    currentSection.type ===
                    "objectives"
                      ? "objectives-section"
                      : currentSection.type ===
                        "question"
                      ? "thinking-section"
                      : currentSection.type ===
                        "multipleChoice"
                      ? "quiz-section"
                      : currentSection.type ===
                        "task"
                      ? "task-section"
                      : currentSection.type ===
                        "summary"
                      ? "summary-section"
                      : currentSection.type ===
                        "reflection"
                      ? "reflection-section"
                      : ""
                  }`
                }
              >

                <div className="lesson-section-number">

                  {currentSlide + 1}

                </div>


                <div className="lesson-section-heading">

                  <div className="lesson-section-icon">

                    {getSectionIcon(
                      currentSection
                    )}

                  </div>


                  <h2>

                    {localized(
                      currentSection.title
                    )}

                  </h2>

                </div>


                {renderSectionContent(
                  currentSection
                )}

              </article>


              {/* =====================================
                  REQUIREMENT MESSAGE
              ====================================== */}

              {!currentCanContinue &&
                !lessonCompleted && (

                <div className="lesson-coming-completion">

                  {currentSection.type ===
                  "multipleChoice"
                    ? text(
                        "🧩 Find the correct answer before continuing.",
                        "🧩 اختر الإجابة الصحيحة قبل المتابعة."
                      )
                    : text(
                        "✍️ Complete your answer before continuing.",
                        "✍️ أكمل إجابتك قبل المتابعة."
                      )}

                </div>

              )}


              {/* =====================================
                  LAST SLIDE
              ====================================== */}

              {isLastSlide &&
                currentCanContinue && (

                <div className="final-lesson-completion">

                  {!lessonCompleted ? (

                    <>

                      <div className="final-trophy">

                        🏆

                      </div>


                      <small>
                        TECHMINDS
                      </small>


                      <h2>

                        {text(
                          "You reached the end!",
                          "وصلت إلى نهاية الدرس!"
                        )}

                      </h2>


                      <p>

                        {text(
                          `Complete the lesson and earn ${lesson.xpReward || 0} XP.`,
                          `أنهِ الدرس واحصل على ${lesson.xpReward || 0} XP.`
                        )}

                      </p>


                      <button
                        type="button"
                        className="complete-full-lesson-button"
                        disabled={
                          completingLesson
                        }
                        onClick={
                          completeLesson
                        }
                      >

                        {completingLesson
                          ? text(
                              "Completing...",
                              "جارٍ إنهاء الدرس..."
                            )
                          : `🏆 ${text(
                              "Complete Lesson",
                              "إنهاء الدرس"
                            )}`
                        }

                      </button>

                    </>

                  ) : (

                    <div className="completed-full-lesson">

                      <div>
                        🎉
                      </div>


                      <h2>

                        {text(
                          "Lesson Completed!",
                          "أحسنت! أكملت الدرس"
                        )}

                      </h2>


                      <strong>

                        +{xpEarned ||
                          lesson.xpReward ||
                          0} XP ⭐

                      </strong>


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
                          "Back to My Lessons",
                          "العودة إلى دروسي"
                        )}

                      </button>

                    </div>

                  )}

                </div>

              )}


              {completionError && (

                <div className="lesson-completion-error">

                  ⚠️{" "}

                  {completionError}

                </div>

              )}

            </div>

          </div>


          {/* ===============================================
              NAVIGATION
          =============================================== */}

          <div className="powerpoint-navigation">

            <button
              type="button"
              className="powerpoint-nav-button"
              disabled={
                currentSlide ===
                0
              }
              onClick={
                goPrevious
              }
            >

              {language === "ar"
                ? "التالي للخلف ←"
                : "← Previous"}

            </button>


            <div className="powerpoint-dots">

              {sections.map(
                (
                  section,
                  index
                ) => (

                  <button
                    type="button"
                    aria-label={
                      `Slide ${index + 1}`
                    }
                    key={
                      section.id ||
                      index
                    }
                    disabled={
                      !lessonCompleted &&
                      index >
                        maxUnlockedSlide
                    }
                    className={
                      currentSlide ===
                      index
                        ? "powerpoint-dot active"
                        : index <=
                            maxUnlockedSlide ||
                          lessonCompleted
                        ? "powerpoint-dot unlocked"
                        : "powerpoint-dot locked"
                    }
                    onClick={() =>
                      goToSlide(
                        index
                      )
                    }
                  />

                )
              )}

            </div>


            <button
              type="button"
              className="powerpoint-nav-button next"
              disabled={
                isLastSlide ||
                !currentCanContinue
              }
              onClick={
                goNext
              }
            >

              {language === "ar"
                ? "التالي ←"
                : "Next →"}

            </button>

          </div>

        </main>

      </section>

    </div>
  );
}


export default StudentLessonDetails;