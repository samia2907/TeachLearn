import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
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

import "./OwnerLessonBuilder.css";
import CodingConfigFields from "../components/code/CodingConfigFields";

import { hebrewText } from "../data/hebrewText";


function OwnerLessonBuilder() {
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
    slides,
    setSlides,
  ] = useState([]);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showPreview,
    setShowPreview,
  ] = useState(false);


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
     SLIDE TYPES
  ===================================================== */

  const slideTypes = [
    {
      id: "content",
      icon: "📖",
      en: "Content",
      ar: "محتوى",
      descriptionEn:
        "Explain a concept or idea.",
      descriptionAr:
        "شرح مفهوم أو فكرة.",
    },

    {
      id: "question",
      icon: "💭",
      en: "Question",
      ar: "سؤال",
      descriptionEn:
        "Ask an open question.",
      descriptionAr:
        "أضيفي سؤالًا مفتوحًا.",
    },

    {
      id: "multipleChoice",
      icon: "✅",
      en: "Multiple Choice",
      ar: "اختيار من متعدد",
      descriptionEn:
        "Create an interactive quiz.",
      descriptionAr:
        "أنشئي سؤال اختيار من متعدد.",
    },

    {
      id: "task",
      icon: "🛠️",
      en: "Task",
      ar: "مهمة",
      descriptionEn:
        "Give the learner a practical task.",
      descriptionAr:
        "أضيفي مهمة عملية للطالب.",
    },

    {
      id: "challenge",
      icon: "🏆",
      en: "Challenge",
      ar: "تحدّي",
      descriptionEn:
        "Add a more difficult challenge.",
      descriptionAr:
        "أضيفي تحديًا أكثر صعوبة.",
    },

    {
      id: "summary",
      icon: "📝",
      en: "Summary",
      ar: "تلخيص",
      descriptionEn:
        "Summarize the lesson.",
      descriptionAr:
        "تلخيص أهم ما تعلمه الطالب.",
    },

    {
      id: "reflection",
      icon: "🪞",
      en: "Reflection",
      ar: "تأمل",
      descriptionEn:
        "Let students reflect on learning.",
      descriptionAr:
        "اجعلي الطالب يتأمل فيما تعلمه.",
    },
  ];


  const slideColorPresets = {
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


  const getSlideColors =
    (kind) =>
      slideColorPresets[kind] ||
      slideColorPresets.content;


  /* =====================================================
     LOAD LESSON
  ===================================================== */

  useEffect(() => {
    const loadLesson =
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


          const userSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (
            !userSnapshot.exists()
          ) {
            navigate(
              "/login"
            );

            return;
          }


          const userData =
            userSnapshot.data();


          if (
            userData.role !==
            "owner"
          ) {
            navigate(
              "/"
            );

            return;
          }


          const [
            programSnapshot,
            lessonSnapshot,
          ] =
            await Promise.all([
              getDoc(
                doc(
                  db,
                  "programs",
                  programId
                )
              ),

              getDoc(
                doc(
                  db,
                  "lessons",
                  lessonId
                )
              ),
            ]);


          if (
            !programSnapshot.exists()
          ) {
            throw new Error(
              "program-not-found"
            );
          }


          if (
            !lessonSnapshot.exists()
          ) {
            throw new Error(
              "lesson-not-found"
            );
          }


          const programData =
            programSnapshot.data();

          const lessonData =
            lessonSnapshot.data();


          if (
            programData.createdBy !==
            user.uid
          ) {
            throw new Error(
              "not-owner-program"
            );
          }


          if (
            lessonData.programId !==
            programId
          ) {
            throw new Error(
              "wrong-program"
            );
          }


          if (
            lessonData.lessonType !==
            "commercial"
          ) {
            throw new Error(
              "not-commercial"
            );
          }


          setProgram({
            id:
              programSnapshot.id,

            ...programData,
          });


          setLesson({
            id:
              lessonSnapshot.id,

            ...lessonData,
          });


          const currentSlides =
            Array.isArray(
              lessonData.sections
            )
              ? lessonData.sections
              : [];


          setSlides(
            currentSlides
          );


          setSelectedIndex(
            0
          );

        } catch (
          loadError
        ) {
          console.error(
            "Owner lesson builder load error:",
            loadError
          );


          setError(
            text(
              "Could not load this lesson.",
              "تعذر تحميل هذا الدرس."
            )
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadLesson();

  }, [
    navigate,
    programId,
    lessonId,
  ]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const makeId =
    () => {
      if (
        window.crypto &&
        window.crypto.randomUUID
      ) {
        return window.crypto.randomUUID();
      }


      return `${Date.now()}-${Math.random()}`;
    };


  const getSlideKind =
    (slide) => {
      if (
        slide?.challenge
      ) {
        return "challenge";
      }


      return (
        slide?.type ||
        "content"
      );
    };


  const getTypeInfo =
    (kind) =>
      slideTypes.find(
        (type) =>
          type.id === kind
      ) ||
      slideTypes[0];


  /* =====================================================
     CREATE SLIDE OBJECT
  ===================================================== */

  const createSlide =
    (kind) => {
      const colors =
        getSlideColors(kind);


      const common = {
        id:
          makeId(),

        title: {
          en: "",
          ar: "",
        },

        themeColor:
          colors.themeColor,

        accentColor:
          colors.accentColor,

        surfaceColor:
          colors.surfaceColor,

        emoji:
          "",

        visualImage:
          "",

        visualAlt: {
          en: "",
          ar: "",
        },

        infoBox: {
          en: "",
          ar: "",
        },

        challengeBox: {
          en: "",
          ar: "",
        },
      };


      if (
        kind ===
        "content"
      ) {
        return {
          ...common,

          type:
            "content",

          content: {
            en: "",
            ar: "",
          },
        };
      }


      if (
        kind ===
        "question"
      ) {
        return {
          ...common,

          type:
            "question",

          question: {
            en: "",
            ar: "",
          },

          required:
            true,
        };
      }


      if (
        kind ===
        "multipleChoice"
      ) {
        return {
          ...common,

          type:
            "multipleChoice",

          question: {
            en: "",
            ar: "",
          },

          options: [
            {
              en: "",
              ar: "",
            },
            {
              en: "",
              ar: "",
            },
            {
              en: "",
              ar: "",
            },
            {
              en: "",
              ar: "",
            },
          ],

          correctAnswer:
            0,

          required:
            true,
        };
      }


      if (
        kind ===
        "task"
      ) {
        return {
          ...common,

          type:
            "task",

          task: {
            en: "",
            ar: "",
          },

          required:
            true,
        };
      }


      if (
        kind ===
        "challenge"
      ) {
        return {
          ...common,

          type:
            "task",

          challenge:
            true,

          task: {
            en: "",
            ar: "",
          },

          required:
            true,
        };
      }


      if (
        kind ===
        "summary"
      ) {
        return {
          ...common,

          type:
            "summary",

          content: {
            en: "",
            ar: "",
          },
        };
      }


      return {
        ...common,

        type:
          "reflection",

        question: {
          en: "",
          ar: "",
        },

        required:
          true,
      };
    };


  /* =====================================================
     SELECTED SLIDE
  ===================================================== */

  const selectedSlide =
    slides[
      selectedIndex
    ] ||
    null;


  /* =====================================================
     ADD SLIDE
  ===================================================== */

  const addSlide =
    (kind) => {
      const newSlide =
        createSlide(
          kind
        );


      setSlides(
        (current) => {
          const next = [
            ...current,
            newSlide,
          ];


          setSelectedIndex(
            next.length -
              1
          );


          return next;
        }
      );


      setSuccess("");
      setError("");
    };


  /* =====================================================
     UPDATE SLIDE
  ===================================================== */

  const updateSelectedSlide =
    (updates) => {
      setSlides(
        (current) =>
          current.map(
            (
              slide,
              index
            ) =>
              index ===
              selectedIndex
                ? {
                    ...slide,
                    ...updates,
                  }
                : slide
          )
      );
    };


  const updateLocalizedField =
    (
      field,
      targetLanguage,
      value
    ) => {
      if (!selectedSlide) {
        return;
      }


      updateSelectedSlide({
        [field]: {
          ...(
            selectedSlide[
              field
            ] ||
            {}
          ),

          [targetLanguage]:
            value,
        },
      });
    };


  /* =====================================================
     MCQ OPTION
  ===================================================== */

  const updateOption =
    (
      optionIndex,
      targetLanguage,
      value
    ) => {
      if (!selectedSlide) {
        return;
      }


      const options = [
        ...(
          selectedSlide.options ||
          []
        ),
      ];


      options[
        optionIndex
      ] = {
        ...(
          options[
            optionIndex
          ] ||
          {}
        ),

        [targetLanguage]:
          value,
      };


      updateSelectedSlide({
        options,
      });
    };


  /* =====================================================
     DELETE SLIDE
  ===================================================== */

  const deleteSlide = () => {
  if (!selectedSlide) {
    return;
  }

  const nextSlides =
    slides.filter(
      (slide, index) =>
        index !== selectedIndex
    );

  setSlides(nextSlides);

  if (nextSlides.length === 0) {
    setSelectedIndex(0);
    return;
  }

  setSelectedIndex(
    Math.min(
      selectedIndex,
      nextSlides.length - 1
    )
  );

  setSuccess(
    text(
      "Slide removed.",
      "تم حذف الشريحة."
    )
  );

  setError("");
};

      


  /* =====================================================
     DUPLICATE
  ===================================================== */

  const duplicateSlide =
    () => {
      if (!selectedSlide) {
        return;
      }


      const duplicate =
        JSON.parse(
          JSON.stringify(
            selectedSlide
          )
        );


      duplicate.id =
        makeId();


      const nextSlides = [
        ...slides,
      ];


      nextSlides.splice(
        selectedIndex + 1,
        0,
        duplicate
      );


      setSlides(
        nextSlides
      );


      setSelectedIndex(
        selectedIndex +
          1
      );
    };


  /* =====================================================
     MOVE SLIDE
  ===================================================== */

  const moveSlide =
    (direction) => {
      if (!selectedSlide) {
        return;
      }


      const targetIndex =
        direction === "up"
          ? selectedIndex - 1
          : selectedIndex + 1;


      if (
        targetIndex < 0 ||
        targetIndex >=
          slides.length
      ) {
        return;
      }


      const next = [
        ...slides,
      ];


      [
        next[
          selectedIndex
        ],
        next[
          targetIndex
        ],
      ] = [
        next[
          targetIndex
        ],
        next[
          selectedIndex
        ],
      ];


      setSlides(
        next
      );


      setSelectedIndex(
        targetIndex
      );
    };


  /* =====================================================
     SAVE LESSON
  ===================================================== */

  const saveLesson =
    async () => {
      try {
        setSaving(
          true
        );

        setError("");
        setSuccess("");


        const user =
          auth.currentUser;


        if (!user) {
          navigate(
            "/login"
          );

          return;
        }


        await updateDoc(
          doc(
            db,
            "lessons",
            lessonId
          ),

          {
            sections:
              slides,

            slideCount:
              slides.length,

            updatedAt:
              serverTimestamp(),
          }
        );


        await updateDoc(
          doc(
            db,
            "programs",
            programId
          ),

          {
            updatedAt:
              serverTimestamp(),
          }
        );


        setLesson(
          (current) => ({
            ...current,

            sections:
              slides,

            slideCount:
              slides.length,
          })
        );


        setSuccess(
          text(
            "Lesson saved successfully.",
            "تم حفظ الدرس بنجاح."
          )
        );

      } catch (
        saveError
      ) {
        console.error(
          "Save lesson builder error:",
          saveError
        );


        setError(
          saveError.code ===
          "permission-denied"
            ? text(
                "Firestore permissions do not allow saving this lesson.",
                "صلاحيات Firestore لا تسمح بحفظ هذا الدرس."
              )
            : text(
                "Could not save the lesson.",
                "تعذر حفظ الدرس."
              )
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="owner-builder-loading">

        <div>
          🖥️
        </div>

        <p>
          {text(
            "Opening Lesson Builder...",
            "جارٍ فتح محرر الدرس..."
          )}
        </p>

      </div>
    );
  }


  if (
    !program ||
    !lesson
  ) {
    return (
      <div className="owner-builder-loading">

        <p>
          {error ||
            text(
              "Lesson was not found.",
              "لم يتم العثور على الدرس."
            )}
        </p>

      </div>
    );
  }


  const selectedKind =
    getSlideKind(
      selectedSlide
    );

  const selectedType =
    getTypeInfo(
      selectedKind
    );


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-lesson-builder-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="owner-builder-header">

        <div className="owner-builder-heading">

          <button
            type="button"
            className="owner-builder-back"
            onClick={() =>
              navigate(
                `/owner/programs/${programId}/lessons`
              )
            }
          >
            {language === "ar"
              ? "↩"
              : "←"}
          </button>


          <div className="owner-builder-lesson-icon">
            🖥️
          </div>


          <div>

            <small>
              {localized(
                program.title
              )}
            </small>


            <h1>
              {localized(
                lesson.title
              )}
            </h1>


            <p>
              {text(
                "Commercial Lesson Builder",
                "محرر الدرس التجاري"
              )}
            </p>

          </div>

        </div>


        <div className="owner-builder-header-actions">

          <div className="owner-builder-language">

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

            <button type="button" className={language === "he" ? "active" : ""} onClick={() => setLanguage("he")}>
              עברית
            </button>

          </div>


          <button
            type="button"
            className="owner-builder-preview-button"
            disabled={
              slides.length ===
              0
            }
            onClick={() =>
              setShowPreview(
                true
              )
            }
          >
            👁️{" "}
            {text(
              "Preview",
              "معاينة"
            )}
          </button>


          <button
            type="button"
            className="owner-builder-save-button"
            disabled={
              saving
            }
            onClick={
              saveLesson
            }
          >
            {saving
              ? text(
                  "Saving...",
                  "جارٍ الحفظ..."
                )
              : `💾 ${text(
                  "Save Lesson",
                  "حفظ الدرس"
                )}`}
          </button>

        </div>

      </header>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (
        <div className="owner-builder-success">
          ✅ {success}
        </div>
      )}


      {error && (
        <div className="owner-builder-error">
          ⚠️ {error}
        </div>
      )}


      {/* =================================================
          WORKSPACE
      ================================================= */}

      <main className="owner-builder-workspace">

        {/* =================================================
            LEFT — SLIDES
        ================================================= */}

        <aside className="owner-builder-slides-panel">

          <div className="owner-builder-panel-title">

            <div>

              <small>
                PRESENTATION
              </small>

              <h2>
                {text(
                  "Slides",
                  "الشرائح"
                )}
              </h2>

            </div>


            <strong>
              {slides.length}
            </strong>

          </div>


          <div className="owner-builder-slide-list">

            {slides.length ===
            0 ? (

              <div className="owner-builder-no-slides">

                <span>
                  🖼️
                </span>

                <p>
                  {text(
                    "No slides yet.",
                    "لا توجد شرائح بعد."
                  )}
                </p>

              </div>

            ) : (

              slides.map(
                (
                  slide,
                  index
                ) => {
                  const kind =
                    getSlideKind(
                      slide
                    );

                  const info =
                    getTypeInfo(
                      kind
                    );


                  return (
                    <button
                      key={
                        slide.id ||
                        index
                      }
                      type="button"
                      className={`owner-builder-thumbnail ${
                        selectedIndex ===
                        index
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedIndex(
                          index
                        )
                      }
                    >

                      <div className="owner-builder-thumbnail-number">
                        {index + 1}
                      </div>


                      <div className="owner-builder-thumbnail-preview">

                        <span>
                          {info.icon}
                        </span>


                        <strong>
                          {localized(
                            slide.title
                          ) ||
                            text(
                              "Untitled",
                              "بدون عنوان"
                            )}
                        </strong>


                        <small>
                          {text(
                            info.en,
                            info.ar
                          )}
                        </small>

                      </div>

                    </button>
                  );
                }
              )

            )}

          </div>


          {selectedSlide && (

            <div className="owner-builder-slide-controls">

              <button
                type="button"
                disabled={
                  selectedIndex ===
                  0
                }
                onClick={() =>
                  moveSlide(
                    "up"
                  )
                }
              >
                ↑
              </button>


              <button
                type="button"
                disabled={
                  selectedIndex ===
                  slides.length -
                    1
                }
                onClick={() =>
                  moveSlide(
                    "down"
                  )
                }
              >
                ↓
              </button>


              <button
                type="button"
                onClick={
                  duplicateSlide
                }
              >
                📑
              </button>


              <button
                type="button"
                className="delete"
                onClick={
                  deleteSlide
                }
              >
                🗑️
              </button>

            </div>

          )}

        </aside>


        {/* =================================================
            CENTER — EDITOR
        ================================================= */}

        <section className="owner-builder-editor">

          {!selectedSlide ? (

            <div className="owner-builder-empty-editor">

              <div>
                ✨
              </div>


              <small>
                TechMinds
              </small>


              <h2>
                {text(
                  "Start building your lesson",
                  "ابدئي ببناء الدرس"
                )}
              </h2>


              <p>
                {text(
                  "Choose a slide type from the right panel to create your first slide.",
                  "اختاري نوع الشريحة من القائمة لإضافة أول شريحة."
                )}
              </p>


              <button
                type="button"
                onClick={() =>
                  addSlide(
                    "content"
                  )
                }
              >
                +{" "}
                {text(
                  "Create First Slide",
                  "إنشاء أول شريحة"
                )}
              </button>

            </div>

          ) : (

            <>

              {/* SLIDE HEADER */}

              <div className="owner-builder-editor-header">

                <div>

                  <span>
                    {selectedType.icon}
                  </span>


                  <div>

                    <small>
                      {text(
                        "SLIDE",
                        "شريحة"
                      )}{" "}
                      {selectedIndex +
                        1}
                    </small>


                    <h2>
                      {text(
                        selectedType.en,
                        selectedType.ar
                      )}
                    </h2>

                  </div>

                </div>


                <span className="owner-builder-slide-type-badge">
                  {text(
                    selectedType.en,
                    selectedType.ar
                  )}
                </span>

              </div>


              {/* SLIDE COLORS */}

              <section className="owner-builder-color-panel">

                <div className="owner-builder-color-panel-heading">

                  <div>
                    <small>
                      {text(
                        "SLIDE STYLE",
                        "تصميم الشريحة"
                      )}
                    </small>

                    <h3>
                      🎨{" "}
                      {text(
                        "Slide Colors",
                        "ألوان الشريحة"
                      )}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedSlide(
                        getSlideColors(
                          selectedKind
                        )
                      )
                    }
                  >
                    ↺{" "}
                    {text(
                      "Recommended",
                      "الألوان المقترحة"
                    )}
                  </button>

                </div>


                <div className="owner-builder-color-fields">

                  <label>
                    <span>
                      {text(
                        "Main color",
                        "اللون الأساسي"
                      )}
                    </span>

                    <div>
                      <input
                        type="color"
                        value={
                          selectedSlide.themeColor ||
                          getSlideColors(
                            selectedKind
                          ).themeColor
                        }
                        onChange={(event) =>
                          updateSelectedSlide({
                            themeColor:
                              event.target.value,
                          })
                        }
                      />

                      <code>
                        {selectedSlide.themeColor ||
                          getSlideColors(
                            selectedKind
                          ).themeColor}
                      </code>
                    </div>
                  </label>


                  <label>
                    <span>
                      {text(
                        "Accent color",
                        "اللون المساعد"
                      )}
                    </span>

                    <div>
                      <input
                        type="color"
                        value={
                          selectedSlide.accentColor ||
                          getSlideColors(
                            selectedKind
                          ).accentColor
                        }
                        onChange={(event) =>
                          updateSelectedSlide({
                            accentColor:
                              event.target.value,
                          })
                        }
                      />

                      <code>
                        {selectedSlide.accentColor ||
                          getSlideColors(
                            selectedKind
                          ).accentColor}
                      </code>
                    </div>
                  </label>


                  <label>
                    <span>
                      {text(
                        "Background",
                        "لون الخلفية"
                      )}
                    </span>

                    <div>
                      <input
                        type="color"
                        value={
                          selectedSlide.surfaceColor ||
                          getSlideColors(
                            selectedKind
                          ).surfaceColor
                        }
                        onChange={(event) =>
                          updateSelectedSlide({
                            surfaceColor:
                              event.target.value,
                          })
                        }
                      />

                      <code>
                        {selectedSlide.surfaceColor ||
                          getSlideColors(
                            selectedKind
                          ).surfaceColor}
                      </code>
                    </div>
                  </label>

                </div>

              </section>


              {/* VISUAL ELEMENTS */}

              <section className="owner-builder-visual-panel">

                <div className="owner-builder-visual-panel-heading">

                  <div>
                    <small>
                      {text(
                        "VISUAL ELEMENTS",
                        "العناصر البصرية"
                      )}
                    </small>

                    <h3>
                      ✨{" "}
                      {text(
                        "Make the slide more engaging",
                        "اجعلي الشريحة أكثر تشويقًا"
                      )}
                    </h3>
                  </div>

                </div>


                <div className="owner-builder-visual-grid">

                  <label>
                    <span>
                      {text(
                        "Large emoji / icon",
                        "أيقونة أو إيموجي كبير"
                      )}
                    </span>

                    <input
                      type="text"
                      value={
                        selectedSlide.emoji ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          emoji:
                            event.target.value,
                        })
                      }
                      placeholder="🤖  💡  🚀  🧠"
                      maxLength="6"
                    />
                  </label>


                  <label className="owner-builder-visual-full">
                    <span>
                      {text(
                        "Slide image path or URL",
                        "مسار صورة الشريحة أو الرابط"
                      )}
                    </span>

                    <input
                      type="text"
                      value={
                        selectedSlide.visualImage ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          visualImage:
                            event.target.value,
                        })
                      }
                      placeholder="/lesson-images/computer-parts.png"
                    />

                    <small>
                      {text(
                        "For local images, place the file in public/lesson-images/ and use a path like /lesson-images/example.png",
                        "للصور المحلية، ضعي الصورة داخل public/lesson-images/ واستخدمي مسارًا مثل /lesson-images/example.png"
                      )}
                    </small>
                  </label>


                  <label>
                    <span>
                      {text(
                        "Image description — English",
                        "وصف الصورة — English"
                      )}
                    </span>

                    <input
                      type="text"
                      value={
                        selectedSlide.visualAlt?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          visualAlt: {
                            ...(
                              selectedSlide.visualAlt ||
                              {}
                            ),
                            en:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="Students exploring computer parts"
                    />
                  </label>


                  <label>
                    <span>
                      {text(
                        "Image description — Arabic",
                        "وصف الصورة — عربي"
                      )}
                    </span>

                    <input
                      type="text"
                      dir="rtl"
                      value={
                        selectedSlide.visualAlt?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          visualAlt: {
                            ...(
                              selectedSlide.visualAlt ||
                              {}
                            ),
                            ar:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="طلاب يستكشفون أجزاء الحاسوب"
                    />
                  </label>


                  <label className="owner-builder-visual-full">
                    <span>
                      💡{" "}
                      {text(
                        "Important information box — English",
                        "مربع معلومة مهمة — English"
                      )}
                    </span>

                    <textarea
                      rows="2"
                      value={
                        selectedSlide.infoBox?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          infoBox: {
                            ...(
                              selectedSlide.infoBox ||
                              {}
                            ),
                            en:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="Remember: RAM stores data temporarily while the computer is running."
                    />

                    <textarea
                      rows="2"
                      dir="rtl"
                      value={
                        selectedSlide.infoBox?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          infoBox: {
                            ...(
                              selectedSlide.infoBox ||
                              {}
                            ),
                            ar:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="تذكّر: الذاكرة RAM تحفظ البيانات مؤقتًا أثناء تشغيل الحاسوب."
                    />
                  </label>


                  <label className="owner-builder-visual-full">
                    <span>
                      🔥{" "}
                      {text(
                        "Challenge box — English",
                        "مربع تحدّي — English"
                      )}
                    </span>

                    <textarea
                      rows="2"
                      value={
                        selectedSlide.challengeBox?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          challengeBox: {
                            ...(
                              selectedSlide.challengeBox ||
                              {}
                            ),
                            en:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="Challenge: Can you name three devices that contain a CPU?"
                    />

                    <textarea
                      rows="2"
                      dir="rtl"
                      value={
                        selectedSlide.challengeBox?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateSelectedSlide({
                          challengeBox: {
                            ...(
                              selectedSlide.challengeBox ||
                              {}
                            ),
                            ar:
                              event.target.value,
                          },
                        })
                      }
                      placeholder="تحدّي: هل تستطيع ذكر ثلاثة أجهزة تحتوي على CPU؟"
                    />
                  </label>

                </div>

              </section>


              {/* POWERPOINT CANVAS */}

              <div
                className={`owner-builder-canvas slide-${selectedKind}`}
                style={{
                  "--builder-slide-theme":
                    selectedSlide.themeColor ||
                    getSlideColors(
                      selectedKind
                    ).themeColor,
                  "--builder-slide-accent":
                    selectedSlide.accentColor ||
                    getSlideColors(
                      selectedKind
                    ).accentColor,
                  "--builder-slide-surface":
                    selectedSlide.surfaceColor ||
                    getSlideColors(
                      selectedKind
                    ).surfaceColor,
                }}
              >

                <div className="owner-builder-canvas-top">

                  <span>
                    {selectedType.icon}
                  </span>


                  <small>
                    {localized(
                      program.title
                    )}
                  </small>

                </div>


                {(selectedSlide.emoji ||
                  selectedSlide.visualImage) && (

                  <div className="owner-builder-live-visual">

                    {selectedSlide.emoji && (
                      <div className="owner-builder-live-emoji">
                        {selectedSlide.emoji}
                      </div>
                    )}

                    {selectedSlide.visualImage && (
                      <img
                        src={selectedSlide.visualImage}
                        alt={
                          localized(
                            selectedSlide.visualAlt
                          ) ||
                          localized(
                            selectedSlide.title
                          ) ||
                          text(
                            "Slide visual",
                            "صورة الشريحة"
                          )
                        }
                      />
                    )}

                  </div>

                )}


                {/* TITLE */}

                <div className="owner-builder-form-group">

                  <label>
                    {text(
                      "Slide Title",
                      "عنوان الشريحة"
                    )}
                  </label>


                  <div className="owner-builder-bilingual-fields">

                    <input
                      type="text"
                      value={
                        selectedSlide
                          .title
                          ?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "title",
                          "en",
                          event.target.value
                        )
                      }
                      placeholder="English title"
                    />


                    <input
                      type="text"
                      dir="rtl"
                      value={
                        selectedSlide
                          .title
                          ?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "title",
                          "ar",
                          event.target.value
                        )
                      }
                      placeholder="عنوان الشريحة"
                    />

                  </div>

                </div>


                {/* CONTENT / SUMMARY */}

                {(
                  selectedKind ===
                    "content" ||
                  selectedKind ===
                    "summary"
                ) && (

                  <div className="owner-builder-form-group">

                    <label>
                      {text(
                        "Content",
                        "المحتوى"
                      )}
                    </label>


                    <textarea
                      rows="5"
                      value={
                        selectedSlide
                          .content
                          ?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "content",
                          "en",
                          event.target.value
                        )
                      }
                      placeholder="Write the English content..."
                    />


                    <textarea
                      rows="5"
                      dir="rtl"
                      value={
                        selectedSlide
                          .content
                          ?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "content",
                          "ar",
                          event.target.value
                        )
                      }
                      placeholder="اكتبي المحتوى بالعربية..."
                    />

                  </div>

                )}


                {/* QUESTION / REFLECTION */}

                {(
                  selectedKind ===
                    "question" ||
                  selectedKind ===
                    "reflection"
                ) && (

                  <div className="owner-builder-form-group">

                    <label>
                      {selectedKind ===
                      "reflection"
                        ? text(
                            "Reflection Question",
                            "سؤال التأمل"
                          )
                        : text(
                            "Question",
                            "السؤال"
                          )}
                    </label>


                    <textarea
                      rows="4"
                      value={
                        selectedSlide
                          .question
                          ?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "question",
                          "en",
                          event.target.value
                        )
                      }
                      placeholder="Write the question in English..."
                    />


                    <textarea
                      rows="4"
                      dir="rtl"
                      value={
                        selectedSlide
                          .question
                          ?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "question",
                          "ar",
                          event.target.value
                        )
                      }
                      placeholder="اكتبي السؤال بالعربية..."
                    />

                  </div>

                )}


                {(selectedKind === "task" || selectedKind === "challenge") && (
                  <CodingConfigFields value={selectedSlide.codingConfig} onChange={codingConfig => updateSelectedSlide({ codingConfig })} />
                )}

                {/* TASK / CHALLENGE */}

                {(
                  selectedKind ===
                    "task" ||
                  selectedKind ===
                    "challenge"
                ) && (

                  <div className="owner-builder-form-group">

                    <label>
                      {selectedKind ===
                      "challenge"
                        ? text(
                            "Challenge Instructions",
                            "تعليمات التحدي"
                          )
                        : text(
                            "Task Instructions",
                            "تعليمات المهمة"
                          )}
                    </label>


                    <textarea
                      rows="5"
                      value={
                        selectedSlide
                          .task
                          ?.en ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "task",
                          "en",
                          event.target.value
                        )
                      }
                      placeholder="Explain what the student should do..."
                    />


                    <textarea
                      rows="5"
                      dir="rtl"
                      value={
                        selectedSlide
                          .task
                          ?.ar ||
                        ""
                      }
                      onChange={(event) =>
                        updateLocalizedField(
                          "task",
                          "ar",
                          event.target.value
                        )
                      }
                      placeholder="اشرحي ماذا يجب على الطالب أن يفعل..."
                    />

                  </div>

                )}


                {localized(
                  selectedSlide.infoBox
                ) && (

                  <div className="owner-builder-info-box">
                    <span>💡</span>
                    <div>
                      <strong>
                        {text(
                          "Important",
                          "معلومة مهمة"
                        )}
                      </strong>
                      <p>
                        {localized(
                          selectedSlide.infoBox
                        )}
                      </p>
                    </div>
                  </div>

                )}


                {localized(
                  selectedSlide.challengeBox
                ) && (

                  <div className="owner-builder-challenge-box">
                    <span>🔥</span>
                    <div>
                      <strong>
                        {text(
                          "Challenge",
                          "تحدّي"
                        )}
                      </strong>
                      <p>
                        {localized(
                          selectedSlide.challengeBox
                        )}
                      </p>
                    </div>
                  </div>

                )}


                {/* MULTIPLE CHOICE */}

                {selectedKind ===
                  "multipleChoice" && (

                  <>

                    <div className="owner-builder-form-group">

                      <label>
                        {text(
                          "Question",
                          "السؤال"
                        )}
                      </label>


                      <textarea
                        rows="3"
                        value={
                          selectedSlide
                            .question
                            ?.en ||
                          ""
                        }
                        onChange={(event) =>
                          updateLocalizedField(
                            "question",
                            "en",
                            event.target.value
                          )
                        }
                        placeholder="Question in English..."
                      />


                      <textarea
                        rows="3"
                        dir="rtl"
                        value={
                          selectedSlide
                            .question
                            ?.ar ||
                          ""
                        }
                        onChange={(event) =>
                          updateLocalizedField(
                            "question",
                            "ar",
                            event.target.value
                          )
                        }
                        placeholder="السؤال بالعربية..."
                      />

                    </div>


                    <div className="owner-builder-options">

                      <label>
                        {text(
                          "Answers",
                          "الإجابات"
                        )}
                      </label>


                      {(
                        selectedSlide.options ||
                        []
                      ).map(
                        (
                          option,
                          optionIndex
                        ) => (

                          <div
                            className={`owner-builder-option ${
                              selectedSlide.correctAnswer ===
                              optionIndex
                                ? "correct"
                                : ""
                            }`}
                            key={
                              optionIndex
                            }
                          >

                            <button
                              type="button"
                              className="owner-builder-correct-selector"
                              onClick={() =>
                                updateSelectedSlide({
                                  correctAnswer:
                                    optionIndex,
                                })
                              }
                              title={
                                text(
                                  "Mark as correct answer",
                                  "تحديد كإجابة صحيحة"
                                )
                              }
                            >
                              {selectedSlide.correctAnswer ===
                              optionIndex
                                ? "✓"
                                : optionIndex +
                                  1}
                            </button>


                            <div>

                              <input
                                type="text"
                                value={
                                  option.en ||
                                  ""
                                }
                                onChange={(event) =>
                                  updateOption(
                                    optionIndex,
                                    "en",
                                    event.target.value
                                  )
                                }
                                placeholder={`Answer ${
                                  optionIndex +
                                  1
                                } — English`}
                              />


                              <input
                                type="text"
                                dir="rtl"
                                value={
                                  option.ar ||
                                  ""
                                }
                                onChange={(event) =>
                                  updateOption(
                                    optionIndex,
                                    "ar",
                                    event.target.value
                                  )
                                }
                                placeholder={`الإجابة ${
                                  optionIndex +
                                  1
                                } — عربي`}
                              />

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </>

                )}

              </div>

            </>

          )}

        </section>


        {/* =================================================
            RIGHT — TOOLBOX
        ================================================= */}

        <aside className="owner-builder-toolbox">

          <div className="owner-builder-panel-title">

            <div>

              <small>
                ADD CONTENT
              </small>

              <h2>
                {text(
                  "Add Slide",
                  "إضافة شريحة"
                )}
              </h2>

            </div>

          </div>


          <div className="owner-builder-types">

            {slideTypes.map(
              (type) => (

                <button
                  key={
                    type.id
                  }
                  type="button"
                  onClick={() =>
                    addSlide(
                      type.id
                    )
                  }
                >

                  <span>
                    {type.icon}
                  </span>


                  <div>

                    <strong>
                      {text(
                        type.en,
                        type.ar
                      )}
                    </strong>


                    <small>
                      {text(
                        type.descriptionEn,
                        type.descriptionAr
                      )}
                    </small>

                  </div>


                  <b>
                    +
                  </b>

                </button>

              )
            )}

          </div>


          {/* LESSON INFO */}

          <div className="owner-builder-lesson-summary">

            <small>
              LESSON
            </small>


            <h3>
              {localized(
                lesson.title
              )}
            </h3>


            <div>

              <span>
                🖼️

                <strong>
                  {slides.length}
                </strong>

                <small>
                  {text(
                    "Slides",
                    "شرائح"
                  )}
                </small>
              </span>


              <span>
                ⏱️

                <strong>
                  {lesson.minutes ||
                    90}
                </strong>

                <small>
                  {text(
                    "Minutes",
                    "دقيقة"
                  )}
                </small>
              </span>


              <span>
                ⭐

                <strong>
                  {lesson.xp ||
                    0}
                </strong>

                <small>
                  XP
                </small>
              </span>

            </div>

          </div>

        </aside>

      </main>


      {/* =================================================
          PREVIEW
      ================================================= */}

      {showPreview &&
        selectedSlide && (

        <div
          className="owner-builder-preview-overlay"
          onClick={() =>
            setShowPreview(
              false
            )
          }
        >

          <div
            className={`owner-builder-preview-modal ${
              lesson.coverImage
                ? "has-lesson-cover"
                : ""
            }`}
            style={{
              "--preview-cover":
                lesson.coverImage
                  ? `url("${lesson.coverImage}")`
                  : "none",
              "--preview-theme":
                selectedSlide.themeColor ||
                getSlideColors(
                  selectedKind
                ).themeColor,
              "--preview-accent":
                selectedSlide.accentColor ||
                getSlideColors(
                  selectedKind
                ).accentColor,
              "--preview-surface":
                selectedSlide.surfaceColor ||
                getSlideColors(
                  selectedKind
                ).surfaceColor,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <header>

              <div>

                <small>
                  {text(
                    "STUDENT PREVIEW",
                    "معاينة الطالب"
                  )}
                </small>

                <h2>
                  {localized(
                    lesson.title
                  )}
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowPreview(
                    false
                  )
                }
              >
                ×
              </button>

            </header>


            <section className="owner-builder-preview-hero">

              <div className="owner-builder-preview-hero-overlay" />

              <div className="owner-builder-preview-hero-content">

                <div>

                  <small>
                    {text(
                      "INTERACTIVE LESSON",
                      "درس تفاعلي"
                    )}
                  </small>

                  <h1>
                    {localized(
                      lesson.title
                    )}
                  </h1>

                  {localized(
                    lesson.description
                  ) && (

                    <p>
                      {localized(
                        lesson.description
                      )}
                    </p>

                  )}

                  <div className="owner-builder-preview-hero-meta">

                    <span>
                      ⏱️{" "}
                      {lesson.minutes ||
                        90}{" "}
                      {text(
                        "min",
                        "دقيقة"
                      )}
                    </span>

                    <span>
                      ⭐{" "}
                      {lesson.xp ||
                        0} XP
                    </span>

                    <span>
                      🖼️{" "}
                      {slides.length}{" "}
                      {text(
                        "slides",
                        "شرائح"
                      )}
                    </span>

                  </div>

                </div>


                {lesson.coverImage && (

                  <img
                    src={
                      lesson.coverImage
                    }
                    alt={
                      localized(
                        lesson.imageAlt
                      ) ||
                      localized(
                        lesson.title
                      )
                    }
                  />

                )}

              </div>

            </section>


            <div
              className={`owner-builder-preview-slide preview-${selectedKind}`}
              style={{
                "--preview-theme":
                  selectedSlide.themeColor ||
                  getSlideColors(
                    selectedKind
                  ).themeColor,
                "--preview-accent":
                  selectedSlide.accentColor ||
                  getSlideColors(
                    selectedKind
                  ).accentColor,
                "--preview-surface":
                  selectedSlide.surfaceColor ||
                  getSlideColors(
                    selectedKind
                  ).surfaceColor,
              }}
            >

              <div className="preview-slide-icon">
                {selectedType.icon}
              </div>


              {selectedSlide.emoji && (
                <div className="preview-big-emoji">
                  {selectedSlide.emoji}
                </div>
              )}


              {selectedSlide.visualImage && (
                <img
                  className="preview-slide-image"
                  src={selectedSlide.visualImage}
                  alt={
                    localized(
                      selectedSlide.visualAlt
                    ) ||
                    localized(
                      selectedSlide.title
                    ) ||
                    text(
                      "Slide visual",
                      "صورة الشريحة"
                    )
                  }
                />
              )}


              <small>
                {text(
                  selectedType.en,
                  selectedType.ar
                )}
              </small>


              <h1>
                {localized(
                  selectedSlide.title
                ) ||
                  localized(
                    lesson.title
                  )}
              </h1>


              {(
                selectedKind ===
                  "content" ||
                selectedKind ===
                  "summary"
              ) && (

                <p>
                  {localized(
                    selectedSlide.content
                  )}
                </p>

              )}


              {(
                selectedKind ===
                  "question" ||
                selectedKind ===
                  "reflection"
              ) && (

                <div className="preview-question">
                  {localized(
                    selectedSlide.question
                  )}
                </div>

              )}


              {(
                selectedKind ===
                  "task" ||
                selectedKind ===
                  "challenge"
              ) && (

                <div className="preview-task">
                  {localized(
                    selectedSlide.task
                  )}
                </div>

              )}


              {localized(
                selectedSlide.infoBox
              ) && (

                <div className="preview-info-box">
                  <span>💡</span>
                  <div>
                    <strong>
                      {text(
                        "Important",
                        "معلومة مهمة"
                      )}
                    </strong>
                    <p>
                      {localized(
                        selectedSlide.infoBox
                      )}
                    </p>
                  </div>
                </div>

              )}


              {localized(
                selectedSlide.challengeBox
              ) && (

                <div className="preview-challenge-box">
                  <span>🔥</span>
                  <div>
                    <strong>
                      {text(
                        "Challenge",
                        "تحدّي"
                      )}
                    </strong>
                    <p>
                      {localized(
                        selectedSlide.challengeBox
                      )}
                    </p>
                  </div>
                </div>

              )}


              {selectedKind ===
                "multipleChoice" && (

                <>

                  <div className="preview-question">
                    {localized(
                      selectedSlide.question
                    )}
                  </div>


                  <div className="preview-options">

                    {(
                      selectedSlide.options ||
                      []
                    ).map(
                      (
                        option,
                        optionIndex
                      ) => (

                        <div
                          key={
                            optionIndex
                          }
                          className={
                            selectedSlide.correctAnswer ===
                            optionIndex
                              ? "correct"
                              : ""
                          }
                        >
                          <span>
                            {optionIndex +
                              1}
                          </span>

                          {localized(
                            option
                          )}
                        </div>

                      )
                    )}

                  </div>

                </>

              )}

            </div>


            <footer>

              <button
                type="button"
                disabled={
                  selectedIndex ===
                  0
                }
                onClick={() =>
                  setSelectedIndex(
                    (
                      current
                    ) =>
                      Math.max(
                        0,
                        current -
                          1
                      )
                  )
                }
              >
                {language === "ar" ? "→" : "←"}{" "}
                {text(
                  "Previous",
                  "السابق"
                )}
              </button>


              <span>
                {selectedIndex +
                  1}
                {" / "}
                {slides.length}
              </span>


              <button
                type="button"
                disabled={
                  selectedIndex ===
                  slides.length -
                    1
                }
                onClick={() =>
                  setSelectedIndex(
                    (
                      current
                    ) =>
                      Math.min(
                        slides.length -
                          1,
                        current +
                          1
                      )
                  )
                }
              >
                {text(
                  "Next",
                  "التالي"
                )}{" "}
                {language === "ar" ? "←" : "→"}
              </button>

            </footer>

          </div>

        </div>

      )}

    </div>
  );
}


export default OwnerLessonBuilder;
