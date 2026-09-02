import {
  useEffect,
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
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

import lessonTemplates
  from "../data/lessonTemplates";

import "./TeacherLessons.css";


/* =====================================================
   CUSTOM SLIDE HELPERS
===================================================== */

const createSlideId = () =>
  `slide-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;


const createEmptySlide = (
  type = "content"
) => ({
  id: createSlideId(),

  type,

  title: "",

  text: "",

  note: "",

  paragraphsText: "",

  question: "",

  introduction: "",

  stepsText: "",

  answerPrompt: "",

  itemsText: "",

  explanation: "",

  challengeLevel: "medium",

  options: [
    {
      id: "a",
      text: "",
    },
    {
      id: "b",
      text: "",
    },
    {
      id: "c",
      text: "",
    },
    {
      id: "d",
      text: "",
    },
  ],

  correctAnswer: "a",
});


function TeacherLessons() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


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


  const localizedArray =
    (value) => {
      if (!value) {
        return [];
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
        []
      );
    };


  /* =====================================================
     STATE
  ===================================================== */

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "myLessons"
  );


  const [
    classes,
    setClasses,
  ] = useState([]);


  const [
    lessons,
    setLessons,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =====================================================
     LIBRARY PUBLISH MODAL
  ===================================================== */

  const [
    selectedTemplate,
    setSelectedTemplate,
  ] = useState(null);


  const [
    libraryClassId,
    setLibraryClassId,
  ] = useState("");


  const [
    publishingTemplate,
    setPublishingTemplate,
  ] = useState(false);


  /* =====================================================
     TEACHER PREVIEW
  ===================================================== */

  const [
    previewLesson,
    setPreviewLesson,
  ] = useState(null);


  const [
    previewSlide,
    setPreviewSlide,
  ] = useState(0);


  const [
    previewSource,
    setPreviewSource,
  ] = useState(
    "library"
  );


  /* =====================================================
     CUSTOM LESSON
  ===================================================== */

  const [
    customClassId,
    setCustomClassId,
  ] = useState("");


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    activityType,
    setActivityType,
  ] = useState(
    "lesson"
  );


  const [
    resourceUrl,
    setResourceUrl,
  ] = useState("");


  const [
    xpReward,
    setXpReward,
  ] = useState(50);


  const [
    estimatedMinutes,
    setEstimatedMinutes,
  ] = useState(45);


  const [
    status,
    setStatus,
  ] = useState(
    "published"
  );


  const [
    creating,
    setCreating,
  ] = useState(false);


  /*
    Every custom lesson now has slides.
  */

  const [
    customSlides,
    setCustomSlides,
  ] = useState([
    createEmptySlide(
      "content"
    ),
  ]);


  /* =====================================================
     ACTIVITY TYPES
  ===================================================== */

  const activityTypes = {
    lesson: {
      icon: "📚",
      en: "Lesson",
      ar: "درس",
    },

    quiz: {
      icon: "🧩",
      en: "Quiz",
      ar: "اختبار",
    },

    coding: {
      icon: "💻",
      en: "Coding",
      ar: "برمجة",
    },

    ai: {
      icon: "🤖",
      en: "AI Activity",
      ar: "نشاط ذكاء اصطناعي",
    },

    cyber: {
      icon: "🔐",
      en: "Cyber Activity",
      ar: "نشاط سايبر",
    },

    external: {
      icon: "🌐",
      en: "External Activity",
      ar: "نشاط خارجي",
    },
  };


  /* =====================================================
     SLIDE TYPES
  ===================================================== */

  const slideTypes = {
    content: {
      icon: "📚",
      en: "Explanation",
      ar: "شرح",
    },

    question: {
      icon: "💭",
      en: "Thinking Question",
      ar: "سؤال تفكير",
    },

    multipleChoice: {
      icon: "🧩",
      en: "Multiple Choice",
      ar: "اختيار من متعدد",
    },

    task: {
      icon: "🚀",
      en: "Task",
      ar: "مهمة",
    },

    challenge: {
      icon: "🏆",
      en: "Challenge",
      ar: "تحدي",
    },

    summary: {
      icon: "🌟",
      en: "Summary",
      ar: "ملخص",
    },

    reflection: {
      icon: "💬",
      en: "Reflection",
      ar: "تأمل",
    },
  };


  /* =====================================================
     LOAD CLASSES + LESSONS
  ===================================================== */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      navigate(
        "/login"
      );

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
          currentUser.uid
        )
      );


    const unsubscribeClasses =
      onSnapshot(
        classesQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (
                classDocument
              ) => ({
                id:
                  classDocument.id,

                ...classDocument.data(),
              })
            );


          setClasses(
            list
          );
        },

        (
          snapshotError
        ) => {
          console.error(
            "Load classes error:",
            snapshotError
          );
        }
      );


    const lessonsQuery =
      query(
        collection(
          db,
          "lessons"
        ),

        where(
          "teacherId",
          "==",
          currentUser.uid
        )
      );


    const unsubscribeLessons =
      onSnapshot(
        lessonsQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (
                lessonDocument
              ) => ({
                id:
                  lessonDocument.id,

                ...lessonDocument.data(),
              })
            );


          list.sort(
            (
              a,
              b
            ) => {
              const aTime =
                a.createdAt
                  ?.seconds ||
                0;

              const bTime =
                b.createdAt
                  ?.seconds ||
                0;


              return (
                bTime -
                aTime
              );
            }
          );


          setLessons(
            list
          );

          setLoading(
            false
          );
        },

        (
          snapshotError
        ) => {
          console.error(
            "Load lessons error:",
            snapshotError
          );


          setError(
            text(
              "Could not load lessons.",
              "تعذر تحميل الدروس."
            )
          );


          setLoading(
            false
          );
        }
      );


    return () => {
      unsubscribeClasses();
      unsubscribeLessons();
    };

  }, [
    navigate,
    language,
  ]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const getClass =
    (
      classId
    ) =>
      classes.find(
        (
          classItem
        ) =>
          classItem.id ===
          classId
      );


  const getLessonTitle =
    (
      lesson
    ) => {

      if (
        lesson.titleI18n
      ) {
        return (
          lesson.titleI18n[
            language
          ] ||
          lesson.title
        );
      }


      return localized(
        lesson.title
      );
    };


  const getLessonDescription =
    (
      lesson
    ) => {

      if (
        lesson.descriptionI18n
      ) {
        return (
          lesson
            .descriptionI18n[
            language
          ] ||
          lesson.description
        );
      }


      return localized(
        lesson.description
      );
    };


  const getSlideIcon =
    (type) =>
      slideTypes[type]
        ?.icon ||
      "📚";


  const linesToArray =
    (value) =>
      String(
        value || ""
      )
        .split("\n")
        .map(
          (item) =>
            item.trim()
        )
        .filter(Boolean);


  /* =====================================================
     CUSTOM SLIDE BUILDER
  ===================================================== */

  const updateCustomSlide =
    (
      slideId,
      field,
      value
    ) => {

      setCustomSlides(
        (previous) =>
          previous.map(
            (slide) =>
              slide.id ===
              slideId
                ? {
                    ...slide,

                    [field]:
                      value,
                  }
                : slide
          )
      );
    };


  const updateCustomOption =
    (
      slideId,
      optionId,
      value
    ) => {

      setCustomSlides(
        (previous) =>
          previous.map(
            (slide) => {

              if (
                slide.id !==
                slideId
              ) {
                return slide;
              }


              return {
                ...slide,

                options:
                  slide.options.map(
                    (option) =>
                      option.id ===
                      optionId
                        ? {
                            ...option,

                            text:
                              value,
                          }
                        : option
                  ),
              };
            }
          )
      );
    };


  const changeCustomSlideType =
    (
      slideId,
      newType
    ) => {

      setCustomSlides(
        (previous) =>
          previous.map(
            (slide) =>
              slide.id ===
              slideId
                ? {
                    ...slide,

                    type:
                      newType,
                  }
                : slide
          )
      );
    };


  const addCustomSlide =
    (
      type = "content"
    ) => {

      setCustomSlides(
        (previous) => [
          ...previous,

          createEmptySlide(
            type
          ),
        ]
      );
    };


  const removeCustomSlide =
    (
      slideId
    ) => {

      if (
        customSlides.length <=
        1
      ) {
        setError(
          text(
            "A lesson must contain at least one slide.",
            "يجب أن يحتوي الدرس على شريحة واحدة على الأقل."
          )
        );

        return;
      }


      setCustomSlides(
        (previous) =>
          previous.filter(
            (slide) =>
              slide.id !==
              slideId
          )
      );
    };


  const moveCustomSlide =
    (
      index,
      direction
    ) => {

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;


      if (
        targetIndex < 0 ||
        targetIndex >=
          customSlides.length
      ) {
        return;
      }


      setCustomSlides(
        (previous) => {

          const next = [
            ...previous,
          ];


          const temp =
            next[index];


          next[index] =
            next[targetIndex];


          next[targetIndex] =
            temp;


          return next;
        }
      );
    };


  /*
    Convert the builder state
    to the same sections structure
    used by TechMinds library lessons.
  */

  const buildCustomSections =
    () =>
      customSlides.map(
        (
          slide,
          index
        ) => {

          const common = {
            id:
              slide.id,

            title:
              slide.title.trim() ||
              text(
                `Slide ${index + 1}`,
                `الشريحة ${index + 1}`
              ),
          };


          /* EXPLANATION */

          if (
            slide.type ===
            "content"
          ) {
            return {
              ...common,

              type:
                "content",

              icon:
                "📚",

              paragraphs:
                linesToArray(
                  slide.paragraphsText ||
                  slide.text
                ),
            };
          }


          /* THINKING QUESTION */

          if (
            slide.type ===
            "question"
          ) {
            return {
              ...common,

              type:
                "question",

              icon:
                "💭",

              text:
                slide.question.trim() ||
                slide.text.trim(),

              note:
                slide.note.trim(),

              answerPrompt:
                text(
                  "Write your answer:",
                  "اكتب إجابتك:"
                ),
            };
          }


          /* MULTIPLE CHOICE */

          if (
            slide.type ===
            "multipleChoice"
          ) {
            return {
              ...common,

              type:
                "multipleChoice",

              icon:
                "🧩",

              question:
                slide.question.trim(),

              options:
                slide.options
                  .filter(
                    (option) =>
                      option.text.trim()
                  )
                  .map(
                    (option) => ({
                      id:
                        option.id,

                      text:
                        option.text.trim(),
                    })
                  ),

              correctAnswer:
                slide.correctAnswer,

              explanation:
                slide.explanation.trim(),
            };
          }


          /* TASK */

          if (
            slide.type ===
            "task"
          ) {
            return {
              ...common,

              type:
                "task",

              icon:
                "🚀",

              introduction:
                slide.introduction.trim(),

              steps:
                linesToArray(
                  slide.stepsText
                ),

              answerPrompt:
                slide.answerPrompt.trim() ||
                text(
                  "Write your work here:",
                  "اكتب عملك هنا:"
                ),
            };
          }


          /* CHALLENGE */

          if (
            slide.type ===
            "challenge"
          ) {
            return {
              ...common,

              /*
                We store challenge as task
                so StudentLessonDetails
                already knows how to render it.
              */

              type:
                "task",

              challenge:
                true,

              challengeLevel:
                slide.challengeLevel,

              icon:
                "🏆",

              introduction:
                slide.introduction.trim(),

              steps:
                linesToArray(
                  slide.stepsText
                ),

              answerPrompt:
                slide.answerPrompt.trim() ||
                text(
                  "Write your solution:",
                  "اكتب حلك:"
                ),
            };
          }


          /* SUMMARY */

          if (
            slide.type ===
            "summary"
          ) {
            return {
              ...common,

              type:
                "summary",

              icon:
                "🌟",

              items:
                linesToArray(
                  slide.itemsText
                ),
            };
          }


          /* REFLECTION */

          if (
            slide.type ===
            "reflection"
          ) {
            return {
              ...common,

              type:
                "reflection",

              icon:
                "💬",

              question:
                slide.question.trim() ||
                slide.text.trim(),
            };
          }


          return {
            ...common,

            type:
              "content",

            icon:
              "📚",

            paragraphs: [],
          };
        }
      );


  /* =====================================================
     VALIDATE CUSTOM LESSON
  ===================================================== */

  const validateCustomLesson =
    () => {

      if (
        !customClassId
      ) {
        setError(
          text(
            "Please select a class.",
            "اختاري الصف أولًا."
          )
        );

        return false;
      }


      if (
        !title.trim()
      ) {
        setError(
          text(
            "Lesson title is required.",
            "عنوان الدرس مطلوب."
          )
        );

        return false;
      }


      if (
        customSlides.length ===
        0
      ) {
        setError(
          text(
            "Add at least one slide.",
            "أضيفي شريحة واحدة على الأقل."
          )
        );

        return false;
      }


      for (
        let index = 0;
        index <
        customSlides.length;
        index += 1
      ) {

        const slide =
          customSlides[index];


        if (
          !slide.title.trim()
        ) {
          setError(
            text(
              `Please add a title to slide ${index + 1}.`,
              `أضيفي عنوانًا للشريحة ${index + 1}.`
            )
          );

          return false;
        }


        if (
          slide.type ===
            "content" &&
          !slide.paragraphsText.trim() &&
          !slide.text.trim()
        ) {
          setError(
            text(
              `Add content to slide ${index + 1}.`,
              `أضيفي محتوى للشريحة ${index + 1}.`
            )
          );

          return false;
        }


        if (
          slide.type ===
            "question" &&
          !slide.question.trim() &&
          !slide.text.trim()
        ) {
          setError(
            text(
              `Add a question to slide ${index + 1}.`,
              `أضيفي سؤالًا للشريحة ${index + 1}.`
            )
          );

          return false;
        }


        if (
          slide.type ===
          "multipleChoice"
        ) {

          if (
            !slide.question.trim()
          ) {
            setError(
              text(
                `Add the multiple-choice question on slide ${index + 1}.`,
                `أضيفي سؤال الاختيار من متعدد في الشريحة ${index + 1}.`
              )
            );

            return false;
          }


          const filledOptions =
            slide.options.filter(
              (option) =>
                option.text.trim()
            );


          if (
            filledOptions.length <
            2
          ) {
            setError(
              text(
                `Add at least two choices on slide ${index + 1}.`,
                `أضيفي خيارين على الأقل في الشريحة ${index + 1}.`
              )
            );

            return false;
          }


          const correctExists =
            filledOptions.some(
              (option) =>
                option.id ===
                slide.correctAnswer
            );


          if (
            !correctExists
          ) {
            setError(
              text(
                `Choose a valid correct answer on slide ${index + 1}.`,
                `اختاري إجابة صحيحة موجودة في الشريحة ${index + 1}.`
              )
            );

            return false;
          }
        }


        if (
          (
            slide.type ===
              "task" ||
            slide.type ===
              "challenge"
          ) &&
          !slide.introduction.trim() &&
          !slide.stepsText.trim()
        ) {
          setError(
            text(
              `Add instructions to slide ${index + 1}.`,
              `أضيفي تعليمات للشريحة ${index + 1}.`
            )
          );

          return false;
        }


        if (
          slide.type ===
            "summary" &&
          !slide.itemsText.trim()
        ) {
          setError(
            text(
              `Add summary points to slide ${index + 1}.`,
              `أضيفي نقاط الملخص في الشريحة ${index + 1}.`
            )
          );

          return false;
        }


        if (
          slide.type ===
            "reflection" &&
          !slide.question.trim()
        ) {
          setError(
            text(
              `Add a reflection question to slide ${index + 1}.`,
              `أضيفي سؤال التأمل في الشريحة ${index + 1}.`
            )
          );

          return false;
        }
      }


      return true;
    };


  /* =====================================================
     PREVIEW LIBRARY LESSON
  ===================================================== */

  const openLibraryPreview =
    (
      template
    ) => {

      setPreviewLesson(
        template
      );

      setPreviewSlide(
        0
      );

      setPreviewSource(
        "library"
      );
    };


  /* =====================================================
     PREVIEW ALREADY ADDED LESSON
  ===================================================== */

  const openMyLessonPreview =
    (
      lesson
    ) => {

      if (
        !Array.isArray(
          lesson.sections
        ) ||
        lesson.sections.length ===
          0
      ) {
        setError(
          text(
            "This lesson does not contain presentation slides.",
            "هذا الدرس لا يحتوي على شرائح للمعاينة."
          )
        );

        return;
      }


      const previewObject = {
        id:
          lesson.id,

        icon:
          activityTypes[
            lesson.activityType
          ]?.icon ||
          "📚",

        title:
          lesson.titleI18n ||
          lesson.title,

        summary:
          lesson.descriptionI18n ||
          lesson.description ||
          "",

        sections:
          lesson.sections ||
          [],

        estimatedMinutes:
          lesson.estimatedMinutes ||
          0,

        xpReward:
          lesson.xpReward ||
          0,
      };


      setPreviewLesson(
        previewObject
      );

      setPreviewSlide(
        0
      );

      setPreviewSource(
        "myLesson"
      );
    };


  /* =====================================================
     PREVIEW CUSTOM DRAFT
  ===================================================== */

  const previewCustomLesson =
    () => {

      setError("");
      setSuccess("");


      if (
        customSlides.length ===
        0
      ) {
        setError(
          text(
            "Add a slide first.",
            "أضيفي شريحة أولًا."
          )
        );

        return;
      }


      setPreviewLesson({
        id:
          "custom-preview",

        icon:
          activityTypes[
            activityType
          ]?.icon ||
          "📚",

        title:
          title.trim() ||
          text(
            "Untitled Lesson",
            "درس بدون عنوان"
          ),

        summary:
          description.trim(),

        sections:
          buildCustomSections(),

        estimatedMinutes:
          Number(
            estimatedMinutes ||
            0
          ),

        xpReward:
          Number(
            xpReward ||
            0
          ),
      });


      setPreviewSlide(
        0
      );


      setPreviewSource(
        "customDraft"
      );
    };


  const closePreview =
    () => {

      setPreviewLesson(
        null
      );

      setPreviewSlide(
        0
      );
    };


  /* =====================================================
     OPEN LIBRARY TEMPLATE FOR PUBLISH
  ===================================================== */

  const openTemplate =
    (
      template
    ) => {

      setError("");
      setSuccess("");


      setSelectedTemplate(
        template
      );


      if (
        classes.length ===
        1
      ) {
        setLibraryClassId(
          classes[0].id
        );

      } else {

        setLibraryClassId(
          ""
        );
      }
    };


  const publishFromPreview =
    () => {

      if (
        !previewLesson
      ) {
        return;
      }


      const template =
        previewLesson;


      closePreview();


      openTemplate(
        template
      );
    };


  /* =====================================================
     PUBLISH LIBRARY LESSON
  ===================================================== */

  const publishTemplate =
    async () => {

      if (
        !selectedTemplate
      ) {
        return;
      }


      if (
        !libraryClassId
      ) {
        setError(
          text(
            "Please select a class.",
            "اختاري الصف أولًا."
          )
        );

        return;
      }


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


      const selectedClass =
        getClass(
          libraryClassId
        );


      if (
        !selectedClass
      ) {
        setError(
          text(
            "Class not found.",
            "لم يتم العثور على الصف."
          )
        );

        return;
      }


      const alreadyPublished =
        lessons.some(
          (
            lesson
          ) =>
            lesson.templateId ===
              selectedTemplate.id &&
            lesson.classId ===
              selectedClass.id
        );


      if (
        alreadyPublished
      ) {
        setError(
          text(
            "This lesson is already added to this class.",
            "هذا الدرس مضاف إلى هذا الصف مسبقًا."
          )
        );

        return;
      }


      try {
        setPublishingTemplate(
          true
        );

        setError("");
        setSuccess("");


        await addDoc(
          collection(
            db,
            "lessons"
          ),

          {
            teacherId:
              currentUser.uid,

            classId:
              selectedClass.id,

            className:
              selectedClass.name,

            classCode:
              selectedClass.classCode,

            learningTrack:
              selectedClass.learningTrack,

            grade:
              selectedClass.grade,


            sourceType:
              "library",

            templateId:
              selectedTemplate.id,


            title:
              localized(
                selectedTemplate.title
              ),

            titleI18n:
              selectedTemplate.title,


            description:
              localized(
                selectedTemplate.summary
              ),

            descriptionI18n:
              selectedTemplate.summary,


            sections:
              selectedTemplate.sections,


            activityType:
              selectedTemplate
                .activityType,

            estimatedMinutes:
              Number(
                selectedTemplate
                  .estimatedMinutes ||
                0
              ),

            xpReward:
              Number(
                selectedTemplate
                  .xpReward ||
                0
              ),


            status:
              "published",

            completedCount:
              0,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          text(
            "Lesson published to the class successfully.",
            "تم نشر الدرس للصف بنجاح 🎉"
          )
        );


        setSelectedTemplate(
          null
        );

        setLibraryClassId(
          ""
        );

        setActiveTab(
          "myLessons"
        );

      } catch (
        publishError
      ) {

        console.error(
          "Publish template error:",
          publishError
        );


        setError(
          text(
            "Could not publish the lesson.",
            "تعذر نشر الدرس."
          )
        );

      } finally {

        setPublishingTemplate(
          false
        );
      }
    };


  /* =====================================================
     CREATE CUSTOM POWERPOINT LESSON
  ===================================================== */

  const createCustomLesson =
    async (
      event
    ) => {

      event.preventDefault();


      setError("");
      setSuccess("");


      if (
        !validateCustomLesson()
      ) {
        return;
      }


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


      const selectedClass =
        getClass(
          customClassId
        );


      if (
        !selectedClass
      ) {
        setError(
          text(
            "Class not found.",
            "لم يتم العثور على الصف."
          )
        );

        return;
      }


      try {

        setCreating(
          true
        );


        const sections =
          buildCustomSections();


        await addDoc(
          collection(
            db,
            "lessons"
          ),

          {
            teacherId:
              currentUser.uid,

            classId:
              selectedClass.id,

            className:
              selectedClass.name,

            classCode:
              selectedClass.classCode,

            learningTrack:
              selectedClass.learningTrack,

            grade:
              selectedClass.grade,


            sourceType:
              "custom",

            templateId:
              null,


            title:
              title.trim(),

            description:
              description.trim(),


            /*
              IMPORTANT:
              Custom lessons now use
              the same PowerPoint sections.
            */

            sections,


            activityType,

            resourceUrl:
              resourceUrl.trim(),

            xpReward:
              Number(
                xpReward
              ),

            estimatedMinutes:
              Number(
                estimatedMinutes
              ),

            status,

            completedCount:
              0,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );


        /* RESET */

        setTitle("");

        setDescription("");

        setResourceUrl("");

        setXpReward(
          50
        );

        setEstimatedMinutes(
          45
        );

        setActivityType(
          "lesson"
        );

        setStatus(
          "published"
        );

        setCustomClassId(
          ""
        );


        setCustomSlides([
          createEmptySlide(
            "content"
          ),
        ]);


        setSuccess(
          text(
            "Interactive lesson created successfully.",
            "تم إنشاء الدرس التفاعلي بنجاح 🎉"
          )
        );


        setActiveTab(
          "myLessons"
        );

      } catch (
        createError
      ) {

        console.error(
          "Create lesson error:",
          createError
        );


        setError(
          text(
            "Could not create the lesson.",
            "تعذر إنشاء الدرس."
          )
        );

      } finally {

        setCreating(
          false
        );
      }
    };


  /* =====================================================
     TOGGLE STATUS
  ===================================================== */

  const toggleLessonStatus =
    async (
      lesson
    ) => {

      try {

        const newStatus =
          lesson.status ===
          "published"
            ? "draft"
            : "published";


        await updateDoc(
          doc(
            db,
            "lessons",
            lesson.id
          ),

          {
            status:
              newStatus,

            updatedAt:
              serverTimestamp(),
          }
        );

      } catch (
        updateError
      ) {

        console.error(
          "Update lesson status:",
          updateError
        );


        setError(
          text(
            "Could not update lesson.",
            "تعذر تحديث الدرس."
          )
        );
      }
    };


  /* =====================================================
     RENDER TEACHER PREVIEW SLIDE
  ===================================================== */

  const renderPreviewSection =
    (
      section
    ) => {

      if (
        !section
      ) {
        return null;
      }


      /* OBJECTIVES */

      if (
        section.type ===
        "objectives"
      ) {

        const items =
          localizedArray(
            section.items
          );


        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "🎯"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-objectives-list">

              {items.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={
                      index
                    }
                    className="preview-list-item"
                  >

                    <span>
                      ✓
                    </span>

                    <p>
                      {localized(
                        item
                      ) ||
                        item}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>
        );
      }


      /* CONTENT */

      if (
        section.type ===
        "content"
      ) {

        const paragraphs =
          localizedArray(
            section.paragraphs
          );


        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "📚"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-paragraphs">

              {paragraphs.map(
                (
                  paragraph,
                  index
                ) => (

                  <p
                    key={
                      index
                    }
                  >
                    {localized(
                      paragraph
                    ) ||
                      paragraph}
                  </p>

                )
              )}

            </div>

          </div>
        );
      }


      /* EXAMPLES */

      if (
        section.type ===
        "examples"
      ) {

        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "🌍"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-examples-grid">

              {(
                section.items ||
                []
              ).map(
                (
                  item,
                  index
                ) => (

                  <div
                    className="preview-example-card"
                    key={
                      index
                    }
                  >

                    <span>
                      {item.icon ||
                        "✨"}
                    </span>


                    <strong>
                      {localized(
                        item.title
                      )}
                    </strong>


                    <p>
                      {localized(
                        item.text
                      )}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>
        );
      }


      /* QUESTION */

      if (
        section.type ===
        "question"
      ) {

        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "💭"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-question-box">

              <p>
                {localized(
                  section.text
                )}
              </p>

            </div>


            {section.note && (

              <div className="preview-note">

                💡{" "}

                {localized(
                  section.note
                )}

              </div>

            )}


            <div className="preview-teacher-only-message">

              👁{" "}

              {text(
                "Preview mode — students will write an answer here.",
                "وضع المعاينة — سيكتب الطالب إجابته هنا."
              )}

            </div>

          </div>
        );
      }


      /* MULTIPLE CHOICE */

      if (
        section.type ===
        "multipleChoice"
      ) {

        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "🧩"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-question-box">

              <p>
                {localized(
                  section.question
                )}
              </p>

            </div>


            <div className="preview-options">

              {(
                section.options ||
                []
              ).map(
                (
                  option
                ) => (

                  <div
                    key={
                      option.id
                    }
                    className={
                      option.id ===
                      section.correctAnswer
                        ? "preview-option correct"
                        : "preview-option"
                    }
                  >

                    <span>

                      {option.id ===
                      section.correctAnswer
                        ? "✅"
                        : "○"}

                    </span>


                    <p>

                      {localized(
                        option.text
                      )}

                    </p>

                  </div>

                )
              )}

            </div>


            {section.explanation && (

              <div className="preview-explanation">

                💡{" "}

                {localized(
                  section.explanation
                )}

              </div>

            )}

          </div>
        );
      }


      /* TASK / CHALLENGE */

      if (
        section.type ===
        "task"
      ) {

        const steps =
          localizedArray(
            section.steps
          );


        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">

              {section.icon ||
                "🚀"}

            </div>


            {section.challenge && (

              <div className="custom-challenge-badge">

                🏆{" "}

                {text(
                  "CHALLENGE",
                  "تحدي"
                )}

              </div>

            )}


            <h2>

              {localized(
                section.title
              )}

            </h2>


            {section.introduction && (

              <p className="preview-task-intro">

                {localized(
                  section.introduction
                )}

              </p>

            )}


            <div className="preview-task-steps">

              {steps.map(
                (
                  step,
                  index
                ) => (

                  <div
                    className="preview-task-step"
                    key={
                      index
                    }
                  >

                    <span>
                      {index + 1}
                    </span>


                    <p>
                      {localized(
                        step
                      ) ||
                        step}
                    </p>

                  </div>

                )
              )}

            </div>


            {section.answerPrompt && (

              <div className="preview-answer-prompt">

                ✏️{" "}

                {localized(
                  section.answerPrompt
                )}

              </div>

            )}


            <div className="preview-teacher-only-message">

              👁{" "}

              {text(
                "Students must complete this activity before continuing.",
                "يجب على الطالب إكمال هذا النشاط قبل المتابعة."
              )}

            </div>

          </div>
        );
      }


      /* SUMMARY */

      if (
        section.type ===
        "summary"
      ) {

        const items =
          localizedArray(
            section.items
          );


        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "🌟"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-summary-list">

              {items.map(
                (
                  item,
                  index
                ) => (

                  <div
                    key={
                      index
                    }
                    className="preview-list-item"
                  >

                    <span>
                      ⭐
                    </span>

                    <p>
                      {localized(
                        item
                      ) ||
                        item}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>
        );
      }


      /* REFLECTION */

      if (
        section.type ===
        "reflection"
      ) {

        return (
          <div className="preview-section-content">

            <div className="preview-section-icon">
              {section.icon ||
                "💬"}
            </div>


            <h2>
              {localized(
                section.title
              )}
            </h2>


            <div className="preview-question-box">

              <p>
                {localized(
                  section.question
                )}
              </p>

            </div>


            <div className="preview-teacher-only-message">

              👁{" "}

              {text(
                "Students will write their reflection here.",
                "سيكتب الطالب تأمله هنا."
              )}

            </div>

          </div>
        );
      }


      return (
        <div className="preview-section-content">

          <div className="preview-section-icon">
            {section.icon ||
              "📚"}
          </div>

          <h2>
            {localized(
              section.title
            )}
          </h2>

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
      <div className="teacher-lessons-loading">
        📚
      </div>
    );
  }


  /* =====================================================
     PREVIEW VALUES
  ===================================================== */

  const previewSections =
    previewLesson
      ?.sections ||
    [];


  const currentPreviewSection =
    previewSections[
      previewSlide
    ];


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="teacher-lessons-page">

      {/* HEADER */}

      <header className="teacher-lessons-header">

        <div>

          <button
            type="button"
            className="teacher-lessons-back"
            onClick={() =>
              navigate(
                "/teacher"
              )
            }
          >

            {language ===
            "ar"
              ? "↩ لوحة التحكم"
              : "← Dashboard"}

          </button>


          <h1>

            📚{" "}

            {text(
              "Lessons",
              "الدروس"
            )}

          </h1>


          <p>

            {text(
              "Use ready-made TechMinds lessons or build your own interactive presentation.",
              "استخدمي دروس TechMinds الجاهزة أو ابنِي درسًا تفاعليًا خاصًا بك."
            )}

          </p>

        </div>


        <div className="teacher-lessons-language">

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

      </header>


      {/* TABS */}

      <div className="teacher-lessons-tabs">

        <button
          type="button"
          className={
            activeTab ===
            "myLessons"
              ? "active"
              : ""
          }
          onClick={() => {

            setActiveTab(
              "myLessons"
            );

            setError("");

            setSuccess("");
          }}
        >

          📚{" "}

          {text(
            "My Lessons",
            "دروسي"
          )}

          <span>
            {lessons.length}
          </span>

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "library"
              ? "active"
              : ""
          }
          onClick={() => {

            setActiveTab(
              "library"
            );

            setError("");

            setSuccess("");
          }}
        >

          🚀{" "}

          {text(
            "TechMinds Library",
            "مكتبة TechMinds"
          )}

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "custom"
              ? "active"
              : ""
          }
          onClick={() => {

            setActiveTab(
              "custom"
            );

            setError("");

            setSuccess("");
          }}
        >

          ✏️{" "}

          {text(
            "Create Custom Lesson",
            "إنشاء درس خاص"
          )}

        </button>

      </div>


      {/* MESSAGES */}

      {error && (

        <div className="teacher-lessons-error">

          ⚠️ {error}

        </div>

      )}


      {success && (

        <div className="teacher-lessons-success">

          ✅ {success}

        </div>

      )}


      {/* =================================================
          MY LESSONS
      ================================================= */}

      {activeTab ===
        "myLessons" && (

        <section className="teacher-my-lessons">

          <div className="lessons-section-title">

            <div>

              <small>

                {text(
                  "YOUR CONTENT",
                  "محتواك"
                )}

              </small>


              <h2>

                {text(
                  "Published & Draft Lessons",
                  "الدروس المنشورة والمسودات"
                )}

              </h2>

            </div>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "library"
                )
              }
            >

              +{" "}

              {text(
                "Add Lesson",
                "إضافة درس"
              )}

            </button>

          </div>


          {lessons.length ===
          0 ? (

            <div className="teacher-lessons-empty">

              <div>
                📚
              </div>


              <h3>

                {text(
                  "No lessons yet",
                  "لا توجد دروس بعد"
                )}

              </h3>


              <p>

                {text(
                  "Choose a ready lesson from the library or create your own.",
                  "اختاري درسًا جاهزًا من المكتبة أو أنشئي درسًا خاصًا."
                )}

              </p>

            </div>

          ) : (

            <div className="teacher-lessons-grid">

              {lessons.map(
                (
                  lesson
                ) => {

                  const activity =
                    activityTypes[
                      lesson.activityType
                    ] ||
                    activityTypes.lesson;


                  return (
                    <article
                      className="teacher-lesson-card"
                      key={
                        lesson.id
                      }
                    >

                      <div className="teacher-lesson-card-top">

                        <div className="teacher-lesson-icon">

                          {activity.icon}

                        </div>


                        <span
                          className={
                            lesson.status ===
                            "published"
                              ? "lesson-status published"
                              : "lesson-status draft"
                          }
                        >

                          {lesson.status ===
                          "published"
                            ? text(
                                "Published",
                                "منشور"
                              )
                            : text(
                                "Draft",
                                "مسودة"
                              )}

                        </span>

                      </div>


                      <div className="lesson-source">

                        {lesson.sourceType ===
                        "library"
                          ? "🚀 TechMinds"
                          : text(
                              "✏️ Custom Lesson",
                              "✏️ درس خاص"
                            )}

                      </div>


                      <h3>

                        {getLessonTitle(
                          lesson
                        )}

                      </h3>


                      <p>

                        {getLessonDescription(
                          lesson
                        ) ||
                          text(
                            "No description",
                            "لا يوجد وصف"
                          )}

                      </p>


                      <div className="teacher-lesson-info">

                        <span>

                          🏫{" "}
                          {lesson.className}

                        </span>


                        <span>

                          ⏱{" "}

                          {lesson.estimatedMinutes ||
                            0}{" "}

                          {text(
                            "min",
                            "د"
                          )}

                        </span>


                        <span>

                          ⭐ +
                          {lesson.xpReward ||
                            0} XP

                        </span>


                        {Array.isArray(
                          lesson.sections
                        ) && (

                          <span>

                            🖥{" "}

                            {
                              lesson.sections
                                .length
                            }{" "}

                            {text(
                              "slides",
                              "شرائح"
                            )}

                          </span>

                        )}

                      </div>


                      {Array.isArray(
                        lesson.sections
                      ) &&
                        lesson.sections
                          .length >
                          0 && (

                        <button
                          type="button"
                          className="preview-my-lesson-button"
                          onClick={() =>
                            openMyLessonPreview(
                              lesson
                            )
                          }
                        >

                          👁{" "}

                          {text(
                            "Preview Lesson",
                            "معاينة الدرس"
                          )}

                        </button>

                      )}


                      <button
                        type="button"
                        className="lesson-status-button"
                        onClick={() =>
                          toggleLessonStatus(
                            lesson
                          )
                        }
                      >

                        {lesson.status ===
                        "published"
                          ? text(
                              "Move to Draft",
                              "تحويل إلى مسودة"
                            )
                          : text(
                              "Publish",
                              "نشر"
                            )}

                      </button>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>
      )}


      {/* =================================================
          TECHMINDS LIBRARY
      ================================================= */}

      {activeTab ===
        "library" && (

        <section className="techminds-library">

          <div className="library-intro">

            <div className="library-intro-icon">
              🚀
            </div>


            <div>

              <small>
                TECHMINDS
              </small>


              <h2>

                {text(
                  "Ready-Made Lesson Library",
                  "مكتبة الدروس الجاهزة"
                )}

              </h2>


              <p>

                {text(
                  "Complete interactive lessons prepared for your students.",
                  "دروس كاملة وتفاعلية جاهزة لطلابك."
                )}

              </p>

            </div>

          </div>


          <div className="library-grid">

            {lessonTemplates.map(
              (
                template
              ) => (

                <article
                  className="library-lesson-card"
                  key={
                    template.id
                  }
                >

                  <div className="library-card-cover">

                    <span>
                      {template.icon}
                    </span>

                  </div>


                  <div className="library-card-body">

                    <div className="library-card-tags">

                      <span>
                        🚀 Tech Explorer
                      </span>


                      <span>

                        {text(
                          `Grades ${template.grades.join(
                            ", "
                          )}`,
                          `الصفوف ${template.grades.join(
                            "، "
                          )}`
                        )}

                      </span>

                    </div>


                    <h3>

                      {localized(
                        template.title
                      )}

                    </h3>


                    <p>

                      {localized(
                        template.summary
                      )}

                    </p>


                    <div className="library-card-info">

                      <span>

                        ⏱{" "}

                        {
                          template
                            .estimatedMinutes
                        }{" "}

                        {text(
                          "min",
                          "دقيقة"
                        )}

                      </span>


                      <span>

                        ⭐ +
                        {
                          template
                            .xpReward
                        } XP

                      </span>


                      <span>

                        📚{" "}

                        {
                          template
                            .sections.length
                        }{" "}

                        {text(
                          "sections",
                          "أجزاء"
                        )}

                      </span>

                    </div>


                    <button
                      type="button"
                      className="preview-library-button"
                      onClick={() =>
                        openLibraryPreview(
                          template
                        )
                      }
                    >

                      👁{" "}

                      {text(
                        "Preview Lesson",
                        "معاينة الدرس"
                      )}

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        openTemplate(
                          template
                        )
                      }
                    >

                      🚀{" "}

                      {text(
                        "Add to My Class",
                        "إضافة إلى صفي"
                      )}

                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        </section>
      )}


      {/* =================================================
          CUSTOM POWERPOINT BUILDER
      ================================================= */}

      {activeTab ===
        "custom" && (

        <section className="custom-lesson-builder">

          <div className="custom-builder-header">

            <span>
              🖥️
            </span>


            <div>

              <small>

                {text(
                  "INTERACTIVE LESSON BUILDER",
                  "منشئ الدروس التفاعلية"
                )}

              </small>


              <h2>

                {text(
                  "Build a PowerPoint-Style Lesson",
                  "إنشاء درس بأسلوب PowerPoint"
                )}

              </h2>


              <p>

                {text(
                  "Add explanation, questions, tasks, challenges and interactive slides.",
                  "أضيفي شرائح شرح وأسئلة ومهام وتحديات تفاعلية."
                )}

              </p>

            </div>

          </div>


          <form
            className="custom-lesson-form"
            onSubmit={
              createCustomLesson
            }
          >

            {/* GENERAL SETTINGS */}

            <label>

              {text(
                "Class",
                "الصف"
              )}

              <select
                value={
                  customClassId
                }
                onChange={(
                  event
                ) =>
                  setCustomClassId(
                    event.target.value
                  )
                }
              >

                <option value="">

                  {text(
                    "Select class",
                    "اختاري الصف"
                  )}

                </option>


                {classes.map(
                  (
                    classItem
                  ) => (

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

            </label>


            <label>

              {text(
                "Lesson Title",
                "عنوان الدرس"
              )}

              <input
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder={text(
                  "Example: Internet Safety",
                  "مثال: الأمان على الإنترنت"
                )}
              />

            </label>


            <label className="custom-full-field">

              {text(
                "Short Description",
                "وصف قصير"
              )}

              <textarea
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows="3"
                placeholder={text(
                  "What will students learn?",
                  "ماذا سيتعلم الطلاب؟"
                )}
              />

            </label>


            <label>

              {text(
                "Activity Type",
                "نوع الدرس"
              )}

              <select
                value={
                  activityType
                }
                onChange={(
                  event
                ) =>
                  setActivityType(
                    event.target.value
                  )
                }
              >

                {Object.entries(
                  activityTypes
                ).map(
                  ([
                    key,
                    activity,
                  ]) => (

                    <option
                      value={
                        key
                      }
                      key={
                        key
                      }
                    >

                      {activity.icon}{" "}

                      {text(
                        activity.en,
                        activity.ar
                      )}

                    </option>

                  )
                )}

              </select>

            </label>


            <label>

              {text(
                "Optional Resource Link",
                "رابط إضافي اختياري"
              )}

              <input
                type="url"
                value={
                  resourceUrl
                }
                onChange={(
                  event
                ) =>
                  setResourceUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
              />

            </label>


            <label>

              XP

              <input
                type="number"
                min="0"
                value={
                  xpReward
                }
                onChange={(
                  event
                ) =>
                  setXpReward(
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              {text(
                "Minutes",
                "المدة بالدقائق"
              )}

              <input
                type="number"
                min="1"
                value={
                  estimatedMinutes
                }
                onChange={(
                  event
                ) =>
                  setEstimatedMinutes(
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              {text(
                "Status",
                "الحالة"
              )}

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
              >

                <option value="published">

                  {text(
                    "Publish Now",
                    "نشر الآن"
                  )}

                </option>


                <option value="draft">

                  {text(
                    "Save as Draft",
                    "حفظ كمسودة"
                  )}

                </option>

              </select>

            </label>


            {/* ==========================================
                SLIDE BUILDER
            ========================================== */}

            <div className="custom-slides-builder">

              <div className="custom-slides-heading">

                <div>

                  <small>

                    {text(
                      "PRESENTATION",
                      "العرض"
                    )}

                  </small>


                  <h3>

                    🖥️{" "}

                    {text(
                      "Lesson Slides",
                      "شرائح الدرس"
                    )}

                  </h3>


                  <p>

                    {text(
                      `${customSlides.length} slides`,
                      `${customSlides.length} شرائح`
                    )}

                  </p>

                </div>


                <button
                  type="button"
                  className="custom-add-slide-main"
                  onClick={() =>
                    addCustomSlide(
                      "content"
                    )
                  }
                >

                  +{" "}

                  {text(
                    "Add Slide",
                    "إضافة شريحة"
                  )}

                </button>

              </div>


              {customSlides.map(
                (
                  slide,
                  index
                ) => {

                  const slideInfo =
                    slideTypes[
                      slide.type
                    ] ||
                    slideTypes.content;


                  return (
                    <article
                      key={
                        slide.id
                      }
                      className="custom-slide-editor"
                    >

                      {/* SLIDE TOP */}

                      <div className="custom-slide-editor-top">

                        <div className="custom-slide-number">

                          {index + 1}

                        </div>


                        <div className="custom-slide-type-title">

                          <span>

                            {
                              slideInfo.icon
                            }

                          </span>


                          <div>

                            <small>

                              {text(
                                "SLIDE",
                                "شريحة"
                              )}{" "}

                              {index + 1}

                            </small>


                            <strong>

                              {text(
                                slideInfo.en,
                                slideInfo.ar
                              )}

                            </strong>

                          </div>

                        </div>


                        <div className="custom-slide-actions">

                          <button
                            type="button"
                            title={text(
                              "Move up",
                              "تحريك للأعلى"
                            )}
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveCustomSlide(
                                index,
                                "up"
                              )
                            }
                          >
                            ↑
                          </button>


                          <button
                            type="button"
                            title={text(
                              "Move down",
                              "تحريك للأسفل"
                            )}
                            disabled={
                              index ===
                              customSlides.length -
                                1
                            }
                            onClick={() =>
                              moveCustomSlide(
                                index,
                                "down"
                              )
                            }
                          >
                            ↓
                          </button>


                          <button
                            type="button"
                            className="custom-delete-slide"
                            title={text(
                              "Delete slide",
                              "حذف الشريحة"
                            )}
                            onClick={() =>
                              removeCustomSlide(
                                slide.id
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </div>


                      {/* TYPE */}

                      <div className="custom-slide-fields">

                        <label>

                          {text(
                            "Slide Type",
                            "نوع الشريحة"
                          )}

                          <select
                            value={
                              slide.type
                            }
                            onChange={(
                              event
                            ) =>
                              changeCustomSlideType(
                                slide.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >

                            {Object.entries(
                              slideTypes
                            ).map(
                              ([
                                key,
                                item,
                              ]) => (

                                <option
                                  key={
                                    key
                                  }
                                  value={
                                    key
                                  }
                                >

                                  {
                                    item.icon
                                  }{" "}

                                  {text(
                                    item.en,
                                    item.ar
                                  )}

                                </option>

                              )
                            )}

                          </select>

                        </label>


                        <label>

                          {text(
                            "Slide Title",
                            "عنوان الشريحة"
                          )}

                          <input
                            value={
                              slide.title
                            }
                            onChange={(
                              event
                            ) =>
                              updateCustomSlide(
                                slide.id,
                                "title",
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder={text(
                              "Example: What is AI?",
                              "مثال: ما هو الذكاء الاصطناعي؟"
                            )}
                          />

                        </label>


                        {/* ==================================
                            CONTENT
                        ================================== */}

                        {slide.type ===
                          "content" && (

                          <label className="custom-slide-full">

                            {text(
                              "Explanation",
                              "الشرح"
                            )}

                            <textarea
                              rows="7"
                              value={
                                slide.paragraphsText
                              }
                              onChange={(
                                event
                              ) =>
                                updateCustomSlide(
                                  slide.id,
                                  "paragraphsText",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder={text(
                                "Write the explanation. Start a new line for each paragraph.",
                                "اكتبي الشرح. ابدئي سطرًا جديدًا لكل فقرة."
                              )}
                            />

                          </label>

                        )}


                        {/* ==================================
                            THINKING QUESTION
                        ================================== */}

                        {slide.type ===
                          "question" && (

                          <>

                            <label className="custom-slide-full">

                              {text(
                                "Question",
                                "السؤال"
                              )}

                              <textarea
                                rows="4"
                                value={
                                  slide.question
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "question",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder={text(
                                  "Ask students a thinking question...",
                                  "اكتبي سؤالًا يحتاج إلى التفكير..."
                                )}
                              />

                            </label>


                            <label className="custom-slide-full">

                              {text(
                                "Teacher Hint / Note (optional)",
                                "تلميح أو ملاحظة (اختياري)"
                              )}

                              <input
                                value={
                                  slide.note
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "note",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />

                            </label>

                          </>

                        )}


                        {/* ==================================
                            MULTIPLE CHOICE
                        ================================== */}

                        {slide.type ===
                          "multipleChoice" && (

                          <>

                            <label className="custom-slide-full">

                              {text(
                                "Question",
                                "السؤال"
                              )}

                              <textarea
                                rows="3"
                                value={
                                  slide.question
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "question",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />

                            </label>


                            <div className="custom-options-builder">

                              {slide.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (

                                  <label
                                    key={
                                      option.id
                                    }
                                  >

                                    {text(
                                      `Option ${String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}`,
                                      `الخيار ${String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}`
                                    )}

                                    <input
                                      value={
                                        option.text
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateCustomOption(
                                          slide.id,
                                          option.id,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                    />

                                  </label>

                                )
                              )}

                            </div>


                            <label>

                              ✅{" "}

                              {text(
                                "Correct Answer",
                                "الإجابة الصحيحة"
                              )}

                              <select
                                value={
                                  slide.correctAnswer
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "correctAnswer",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              >

                                {slide.options.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (

                                    <option
                                      key={
                                        option.id
                                      }
                                      value={
                                        option.id
                                      }
                                    >

                                      {String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )}

                                      {option.text
                                        ? ` - ${option.text}`
                                        : ""}

                                    </option>

                                  )
                                )}

                              </select>

                            </label>


                            <label>

                              {text(
                                "Explanation (optional)",
                                "تفسير الإجابة (اختياري)"
                              )}

                              <input
                                value={
                                  slide.explanation
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "explanation",
                                    event
                                      .target
                                      .value
                                  )
                                }
                              />

                            </label>

                          </>

                        )}


                        {/* ==================================
                            TASK / CHALLENGE
                        ================================== */}

                        {(
                          slide.type ===
                            "task" ||
                          slide.type ===
                            "challenge"
                        ) && (

                          <>

                            {slide.type ===
                              "challenge" && (

                              <label>

                                {text(
                                  "Challenge Level",
                                  "مستوى التحدي"
                                )}

                                <select
                                  value={
                                    slide.challengeLevel
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateCustomSlide(
                                      slide.id,
                                      "challengeLevel",
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                >

                                  <option value="easy">

                                    🟢{" "}

                                    {text(
                                      "Easy",
                                      "سهل"
                                    )}

                                  </option>


                                  <option value="medium">

                                    🟡{" "}

                                    {text(
                                      "Medium",
                                      "متوسط"
                                    )}

                                  </option>


                                  <option value="hard">

                                    🔥{" "}

                                    {text(
                                      "Hard",
                                      "متقدم"
                                    )}

                                  </option>

                                </select>

                              </label>

                            )}


                            <label className="custom-slide-full">

                              {text(
                                "Task Introduction",
                                "وصف المهمة"
                              )}

                              <textarea
                                rows="4"
                                value={
                                  slide.introduction
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "introduction",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder={text(
                                  "Explain what students need to do...",
                                  "اشرحي للطلاب ماذا عليهم أن يفعلوا..."
                                )}
                              />

                            </label>


                            <label className="custom-slide-full">

                              {text(
                                "Steps — one step per line",
                                "الخطوات — كل خطوة في سطر"
                              )}

                              <textarea
                                rows="5"
                                value={
                                  slide.stepsText
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "stepsText",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder={text(
                                  "Open the website\nTry the activity\nWrite what you discovered",
                                  "افتح الموقع\nنفّذ النشاط\nاكتب ماذا اكتشفت"
                                )}
                              />

                            </label>


                            <label className="custom-slide-full">

                              {text(
                                "Student Answer Prompt",
                                "طلب الإجابة من الطالب"
                              )}

                              <input
                                value={
                                  slide.answerPrompt
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateCustomSlide(
                                    slide.id,
                                    "answerPrompt",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder={text(
                                  "Write your answer here...",
                                  "اكتب إجابتك هنا..."
                                )}
                              />

                            </label>

                          </>

                        )}


                        {/* ==================================
                            SUMMARY
                        ================================== */}

                        {slide.type ===
                          "summary" && (

                          <label className="custom-slide-full">

                            {text(
                              "Summary Points — one point per line",
                              "نقاط الملخص — كل نقطة في سطر"
                            )}

                            <textarea
                              rows="6"
                              value={
                                slide.itemsText
                              }
                              onChange={(
                                event
                              ) =>
                                updateCustomSlide(
                                  slide.id,
                                  "itemsText",
                                  event
                                    .target
                                    .value
                                )
                              }
                            />

                          </label>

                        )}


                        {/* ==================================
                            REFLECTION
                        ================================== */}

                        {slide.type ===
                          "reflection" && (

                          <label className="custom-slide-full">

                            {text(
                              "Reflection Question",
                              "سؤال التأمل"
                            )}

                            <textarea
                              rows="4"
                              value={
                                slide.question
                              }
                              onChange={(
                                event
                              ) =>
                                updateCustomSlide(
                                  slide.id,
                                  "question",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder={text(
                                "What did you learn today?",
                                "ماذا تعلمت اليوم؟"
                              )}
                            />

                          </label>

                        )}

                      </div>

                    </article>
                  );
                }
              )}


              {/* ADD DIFFERENT TYPE */}

              <div className="custom-add-slide-types">

                <small>

                  {text(
                    "ADD SLIDE",
                    "إضافة شريحة"
                  )}

                </small>


                <div>

                  {Object.entries(
                    slideTypes
                  ).map(
                    ([
                      key,
                      item,
                    ]) => (

                      <button
                        type="button"
                        key={
                          key
                        }
                        onClick={() =>
                          addCustomSlide(
                            key
                          )
                        }
                      >

                        <span>
                          {item.icon}
                        </span>

                        {text(
                          item.en,
                          item.ar
                        )}

                      </button>

                    )
                  )}

                </div>

              </div>

            </div>


            {/* ==========================================
                BOTTOM ACTIONS
            ========================================== */}

            <div className="custom-builder-final-actions">

              <button
                type="button"
                className="custom-preview-created-lesson"
                onClick={
                  previewCustomLesson
                }
              >

                👁{" "}

                {text(
                  "Preview Presentation",
                  "معاينة العرض"
                )}

              </button>


              <button
                type="submit"
                className="custom-create-lesson-final"
                disabled={
                  creating
                }
              >

                {creating
                  ? text(
                      "Creating...",
                      "جارٍ الإنشاء..."
                    )
                  : status ===
                    "published"
                  ? text(
                      "Publish Lesson 🚀",
                      "نشر الدرس 🚀"
                    )
                  : text(
                      "Save Draft",
                      "حفظ المسودة"
                    )}

              </button>

            </div>

          </form>

        </section>
      )}


      {/* =================================================
          TEACHER PREVIEW
      ================================================= */}

      {previewLesson && (

        <div
          className="lesson-library-modal-overlay"
          style={{
            zIndex:
              5000,
          }}
        >

          <div
            style={{
              width:
                "min(1100px, 95vw)",

              height:
                "min(760px, 92vh)",

              display:
                "flex",

              flexDirection:
                "column",

              overflow:
                "hidden",

              borderRadius:
                "24px",

              background:
                "#ffffff",

              boxShadow:
                "0 30px 80px rgba(15,23,42,.25)",
            }}
          >

            {/* PREVIEW HEADER */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "20px",

                padding:
                  "17px 22px",

                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >

              <div>

                <small
                  style={{
                    color:
                      "#7c3aed",

                    fontWeight:
                      900,
                  }}
                >

                  👁{" "}

                  {text(
                    "TEACHER PREVIEW",
                    "معاينة المعلّم"
                  )}

                </small>


                <h3
                  style={{
                    margin:
                      "5px 0 0",
                  }}
                >

                  {localized(
                    previewLesson.title
                  )}

                </h3>

              </div>


              <button
                type="button"
                onClick={
                  closePreview
                }
                style={{
                  width:
                    "40px",

                  height:
                    "40px",

                  border:
                    "none",

                  borderRadius:
                    "12px",

                  cursor:
                    "pointer",

                  fontSize:
                    "20px",

                  background:
                    "#f1f5f9",
                }}
              >
                ×
              </button>

            </div>


            {/* PROGRESS */}

            <div
              style={{
                padding:
                  "11px 22px",

                background:
                  "#f8fafc",

                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  marginBottom:
                    "7px",

                  fontSize:
                    "12px",

                  fontWeight:
                    800,
                }}
              >

                <span>

                  {text(
                    "Slide",
                    "الشريحة"
                  )}{" "}

                  {previewSlide +
                    1}

                  {" / "}

                  {
                    previewSections.length
                  }

                </span>


                <span>

                  ⏱{" "}

                  {
                    previewLesson.estimatedMinutes
                  }{" "}

                  {text(
                    "min",
                    "دقيقة"
                  )}

                  {" • "}

                  ⭐ +

                  {
                    previewLesson.xpReward
                  } XP

                </span>

              </div>


              <div
                style={{
                  height:
                    "5px",

                  overflow:
                    "hidden",

                  borderRadius:
                    "999px",

                  background:
                    "#e2e8f0",
                }}
              >

                <div
                  style={{
                    width:
                      `${
                        (
                          (
                            previewSlide +
                            1
                          ) /
                          Math.max(
                            previewSections.length,
                            1
                          )
                        ) *
                        100
                      }%`,

                    height:
                      "100%",

                    background:
                      "linear-gradient(90deg,#7c3aed,#3b82f6)",
                  }}
                />

              </div>

            </div>


            {/* MAIN SLIDE */}

            <div
              style={{
                flex:
                  1,

                overflowY:
                  "auto",

                padding:
                  "35px",

                background:
                  "linear-gradient(135deg,#f8fafc,#f5f3ff)",
              }}
            >

              <div
                style={{
                  width:
                    "min(820px, 100%)",

                  minHeight:
                    "430px",

                  margin:
                    "0 auto",

                  padding:
                    "40px",

                  border:
                    "1px solid #e2e8f0",

                  borderRadius:
                    "22px",

                  background:
                    "white",

                  boxShadow:
                    "0 15px 40px rgba(15,23,42,.08)",
                }}
              >

                {renderPreviewSection(
                  currentPreviewSection
                )}

              </div>

            </div>


            {/* FOOTER */}

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "12px",

                padding:
                  "15px 22px",

                borderTop:
                  "1px solid #e2e8f0",

                background:
                  "white",
              }}
            >

              <button
                type="button"
                disabled={
                  previewSlide ===
                  0
                }
                onClick={() =>
                  setPreviewSlide(
                    (
                      previous
                    ) =>
                      Math.max(
                        0,
                        previous -
                          1
                      )
                  )
                }
                style={{
                  minWidth:
                    "120px",

                  padding:
                    "11px 18px",

                  border:
                    "1px solid #cbd5e1",

                  borderRadius:
                    "11px",

                  background:
                    "white",

                  cursor:
                    previewSlide ===
                    0
                      ? "not-allowed"
                      : "pointer",

                  opacity:
                    previewSlide ===
                    0
                      ? 0.45
                      : 1,
                }}
              >

                {language ===
                "ar"
                  ? "→ السابق"
                  : "← Previous"}

              </button>


              {previewSource ===
                "library" && (

                <button
                  type="button"
                  onClick={
                    publishFromPreview
                  }
                  style={{
                    padding:
                      "11px 20px",

                    border:
                      "none",

                    borderRadius:
                      "11px",

                    color:
                      "white",

                    background:
                      "linear-gradient(135deg,#7c3aed,#3b82f6)",

                    cursor:
                      "pointer",

                    fontWeight:
                      800,
                  }}
                >

                  🚀{" "}

                  {text(
                    "Add to My Class",
                    "إضافة إلى صفي"
                  )}

                </button>

              )}


              <button
                type="button"
                disabled={
                  previewSlide >=
                  previewSections.length -
                    1
                }
                onClick={() =>
                  setPreviewSlide(
                    (
                      previous
                    ) =>
                      Math.min(
                        previewSections.length -
                          1,

                        previous +
                          1
                      )
                  )
                }
                style={{
                  minWidth:
                    "120px",

                  padding:
                    "11px 18px",

                  border:
                    "none",

                  borderRadius:
                    "11px",

                  color:
                    "white",

                  background:
                    "#4f46e5",

                  cursor:
                    previewSlide >=
                    previewSections.length -
                      1
                      ? "not-allowed"
                      : "pointer",

                  opacity:
                    previewSlide >=
                    previewSections.length -
                      1
                      ? 0.45
                      : 1,
                }}
              >

                {language ===
                "ar"
                  ? "التالي ←"
                  : "Next →"}

              </button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          PUBLISH TEMPLATE MODAL
      ================================================= */}

      {selectedTemplate && (

        <div className="lesson-library-modal-overlay">

          <div className="lesson-library-modal">

            <button
              type="button"
              className="close-library-modal"
              onClick={() =>
                setSelectedTemplate(
                  null
                )
              }
            >
              ×
            </button>


            <div className="library-modal-icon">

              {
                selectedTemplate.icon
              }

            </div>


            <small>
              TECHMINDS LIBRARY
            </small>


            <h2>

              {localized(
                selectedTemplate.title
              )}

            </h2>


            <p>

              {localized(
                selectedTemplate.summary
              )}

            </p>


            <div className="library-modal-stats">

              <span>

                ⏱{" "}

                {
                  selectedTemplate
                    .estimatedMinutes
                }{" "}

                {text(
                  "min",
                  "دقيقة"
                )}

              </span>


              <span>

                ⭐ +

                {
                  selectedTemplate
                    .xpReward
                } XP

              </span>


              <span>

                📚{" "}

                {
                  selectedTemplate
                    .sections.length
                }{" "}

                {text(
                  "sections",
                  "أجزاء"
                )}

              </span>

            </div>


            <button
              type="button"
              className="preview-library-button"
              onClick={() => {

                const template =
                  selectedTemplate;


                setSelectedTemplate(
                  null
                );


                openLibraryPreview(
                  template
                );
              }}
            >

              👁{" "}

              {text(
                "Preview Lesson",
                "معاينة الدرس"
              )}

            </button>


            <label className="library-class-select">

              {text(
                "Which class should receive this lesson?",
                "لأي صف تريدين نشر هذا الدرس؟"
              )}

              <select
                value={
                  libraryClassId
                }
                onChange={(
                  event
                ) =>
                  setLibraryClassId(
                    event.target.value
                  )
                }
              >

                <option value="">

                  {text(
                    "Select class",
                    "اختاري الصف"
                  )}

                </option>


                {classes.map(
                  (
                    classItem
                  ) => (

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

            </label>


            <button
              type="button"
              className="publish-library-button"
              onClick={
                publishTemplate
              }
              disabled={
                publishingTemplate ||
                !libraryClassId
              }
            >

              {publishingTemplate
                ? text(
                    "Publishing...",
                    "جارٍ النشر..."
                  )
                : text(
                    "Publish to Students 🚀",
                    "نشر للطلاب 🚀"
                  )}

            </button>

          </div>

        </div>
      )}

    </div>
  );
}


export default TeacherLessons;