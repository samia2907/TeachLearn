import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
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

import "./OwnerProgramLessons.css";

import { hebrewText } from "../data/hebrewText";


const emptyLessonForm = {
  titleEn: "",
  titleAr: "",

  descriptionEn: "",
  descriptionAr: "",

  coverImage: "",
  imageAltEn: "",
  imageAltAr: "",

  minutes: "90",
  xp: "100",

  status: "draft",
};


function OwnerProgramLessons() {
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
    owner,
    setOwner,
  ] = useState(null);

  const [
    program,
    setProgram,
  ] = useState(null);

  const [
    lessons,
    setLessons,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingLesson,
    setEditingLesson,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    emptyLessonForm
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


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
     LOAD OWNER + PROGRAM
  ===================================================== */

  useEffect(() => {
    const loadPage =
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


          const ownerSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (
            !ownerSnapshot.exists()
          ) {
            navigate(
              "/login"
            );

            return;
          }


          const ownerData =
            ownerSnapshot.data();


          if (
            ownerData.role !==
            "owner"
          ) {
            navigate(
              ownerData.role ===
              "teacher"
                ? "/teacher"
                : "/student"
            );

            return;
          }


          setOwner(
            ownerData
          );


          const programSnapshot =
            await getDoc(
              doc(
                db,
                "programs",
                programId
              )
            );


          if (
            !programSnapshot.exists()
          ) {
            setError(
              text(
                "Program was not found.",
                "لم يتم العثور على البرنامج."
              )
            );

            setLoading(
              false
            );

            return;
          }


          const programData =
            programSnapshot.data();


          if (
            programData.createdBy !==
            user.uid
          ) {
            setError(
              text(
                "You do not have permission to manage this program.",
                "لا تملكين صلاحية إدارة هذا البرنامج."
              )
            );

            setLoading(
              false
            );

            return;
          }


          setProgram({
            id:
              programSnapshot.id,

            ...programData,
          });

        } catch (loadError) {
          console.error(
            "Owner program lessons load error:",
            loadError
          );

          setError(
            text(
              "Could not load this program.",
              "تعذر تحميل البرنامج."
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
    navigate,
    programId,
  ]);


  /* =====================================================
     LOAD LESSONS REAL TIME
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (
      !user ||
      !programId
    ) {
      return undefined;
    }


    const lessonsQuery =
      query(
        collection(
          db,
          "lessons"
        ),

        where(
          "programId",
          "==",
          programId
        ),

        where(
          "lessonType",
          "==",
          "commercial"
        )
      );


    const unsubscribe =
      onSnapshot(
        lessonsQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (lessonDoc) => ({
                id:
                  lessonDoc.id,

                ...lessonDoc.data(),
              })
            );


          list.sort(
            (
              first,
              second
            ) =>
              Number(
                first.order ||
                first.lessonNumber ||
                0
              ) -
              Number(
                second.order ||
                second.lessonNumber ||
                0
              )
          );


          setLessons(
            list
          );
        },

        (listenerError) => {
          console.error(
            "Commercial lessons listener error:",
            listenerError
          );

          setError(
            text(
              "Could not load program lessons.",
              "تعذر تحميل دروس البرنامج."
            )
          );
        }
      );


    return () =>
      unsubscribe();

  }, [
    programId,
  ]);


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredLessons =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return lessons.filter(
          (lesson) => {
            const titleEn =
              String(
                lesson.title?.en ||
                ""
              ).toLowerCase();

            const titleAr =
              String(
                lesson.title?.ar ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !normalizedSearch ||
              titleEn.includes(
                normalizedSearch
              ) ||
              titleAr.includes(
                normalizedSearch
              );


            const matchesStatus =
              statusFilter ===
              "all"
                ? true
                : lesson.status ===
                  statusFilter;


            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },

      [
        lessons,
        search,
        statusFilter,
      ]
    );


  /* =====================================================
     FORM
  ===================================================== */

  const updateField =
    (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,

          [field]:
            value,
        })
      );
    };


  const openCreateLesson =
    () => {
      setEditingLesson(
        null
      );

      setForm(
        emptyLessonForm
      );

      setError("");
      setSuccess("");

      setShowModal(
        true
      );
    };


  const openEditLesson =
    (lesson) => {
      setEditingLesson(
        lesson
      );


      setForm({
        titleEn:
          lesson.title?.en ||
          "",

        titleAr:
          lesson.title?.ar ||
          "",

        descriptionEn:
          lesson.description?.en ||
          "",

        descriptionAr:
          lesson.description?.ar ||
          "",

        coverImage:
          lesson.coverImage ||
          "",

        imageAltEn:
          lesson.imageAlt?.en ||
          "",

        imageAltAr:
          lesson.imageAlt?.ar ||
          "",

        minutes:
          String(
            lesson.minutes ||
            90
          ),

        xp:
          String(
            lesson.xp ||
            100
          ),

        status:
          lesson.status ||
          "draft",
      });


      setError("");
      setSuccess("");

      setShowModal(
        true
      );
    };


  const closeModal =
    () => {
      if (saving) {
        return;
      }


      setShowModal(
        false
      );

      setEditingLesson(
        null
      );

      setError("");
    };


  /* =====================================================
     SAVE LESSON
  ===================================================== */

  const handleSaveLesson =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !form.titleEn.trim() ||
        !form.titleAr.trim()
      ) {
        setError(
          text(
            "Lesson title is required in English and Arabic.",
            "يجب كتابة اسم الدرس بالعربية والإنجليزية."
          )
        );

        return;
      }


      const minutes =
        Number(
          form.minutes
        );

      const xp =
        Number(
          form.xp
        );


      if (
        minutes <= 0
      ) {
        setError(
          text(
            "Lesson duration must be greater than zero.",
            "يجب أن تكون مدة الدرس أكبر من صفر."
          )
        );

        return;
      }


      if (
        xp < 0
      ) {
        setError(
          text(
            "XP cannot be negative.",
            "لا يمكن أن تكون نقاط XP سالبة."
          )
        );

        return;
      }


      try {
        setSaving(
          true
        );


        const user =
          auth.currentUser;


        if (!user) {
          navigate(
            "/login"
          );

          return;
        }


        const baseData = {
          programId,

          lessonType:
            "commercial",

          sellable:
            true,

          createdBy:
            user.uid,

          createdByRole:
            "owner",

          title: {
            en:
              form.titleEn.trim(),

            ar:
              form.titleAr.trim(),
          },

          description: {
            en:
              form.descriptionEn.trim(),

            ar:
              form.descriptionAr.trim(),
          },

          coverImage:
            form.coverImage.trim(),

          imageAlt: {
            en:
              form.imageAltEn.trim(),

            ar:
              form.imageAltAr.trim(),
          },

          minutes,

          xp,

          status:
            form.status,

          updatedAt:
            serverTimestamp(),
        };


        if (
          editingLesson
        ) {
          await updateDoc(
            doc(
              db,
              "lessons",
              editingLesson.id
            ),

            baseData
          );


          setSuccess(
            text(
              "Lesson updated successfully.",
              "تم تحديث الدرس بنجاح."
            )
          );

        } else {
          const nextOrder =
            lessons.length ===
            0
              ? 1
              : Math.max(
                  ...lessons.map(
                    (lesson) =>
                      Number(
                        lesson.order ||
                        lesson.lessonNumber ||
                        0
                      )
                  )
                ) + 1;


          const batch =
            writeBatch(
              db
            );


          const lessonRef =
            doc(
              collection(
                db,
                "lessons"
              )
            );


          batch.set(
            lessonRef,

            {
              ...baseData,

              lessonNumber:
                nextOrder,

              order:
                nextOrder,

              sections:
                [],

              slideCount:
                0,

              createdAt:
                serverTimestamp(),
            }
          );


          batch.update(
            doc(
              db,
              "programs",
              programId
            ),

            {
              lessonCount:
                increment(1),

              updatedAt:
                serverTimestamp(),
            }
          );


          await batch.commit();


          setSuccess(
            text(
              "Lesson created successfully.",
              "تم إنشاء الدرس بنجاح."
            )
          );
        }


        setShowModal(
          false
        );

        setEditingLesson(
          null
        );

        setForm(
          emptyLessonForm
        );

      } catch (saveError) {
        console.error(
          "Save commercial lesson error:",
          saveError
        );


        if (
          saveError.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow saving commercial lessons.",
              "صلاحيات Firestore لا تسمح بحفظ الدروس التجارية."
            )
          );

        } else {
          setError(
            text(
              "Could not save this lesson.",
              "تعذر حفظ الدرس."
            )
          );
        }

      } finally {
        setSaving(
          false
        );
      }
    };


  /* =====================================================
     CHANGE STATUS
  ===================================================== */

  const toggleLessonStatus =
    async (lesson) => {
      try {
        setActionLoading(
          lesson.id
        );

        setError("");
        setSuccess("");


        const nextStatus =
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
              nextStatus,

            publishedAt:
              nextStatus ===
              "published"
                ? serverTimestamp()
                : null,

            updatedAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          nextStatus ===
          "published"
            ? text(
                "Lesson published.",
                "تم نشر الدرس."
              )
            : text(
                "Lesson moved to draft.",
                "تمت إعادة الدرس إلى المسودة."
              )
        );

      } catch (statusError) {
        console.error(
          "Lesson status error:",
          statusError
        );

        setError(
          text(
            "Could not update lesson status.",
            "تعذر تحديث حالة الدرس."
          )
        );

      } finally {
        setActionLoading(
          ""
        );
      }
    };


  /* =====================================================
     ARCHIVE LESSON
  ===================================================== */

  const archiveLesson =
    async (lesson) => {
      const confirmed =
        window.confirm(
          text(
            `Archive "${localized(
              lesson.title
            )}"?`,
            `هل تريدين أرشفة "${localized(
              lesson.title
            )}"؟`
          )
        );


      if (!confirmed) {
        return;
      }


      try {
        setActionLoading(
          lesson.id
        );

        setError("");
        setSuccess("");


        await updateDoc(
          doc(
            db,
            "lessons",
            lesson.id
          ),

          {
            status:
              "archived",

            archivedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          text(
            "Lesson archived.",
            "تمت أرشفة الدرس."
          )
        );

      } catch (archiveError) {
        console.error(
          "Archive lesson error:",
          archiveError
        );

        setError(
          text(
            "Could not archive the lesson.",
            "تعذر أرشفة الدرس."
          )
        );

      } finally {
        setActionLoading(
          ""
        );
      }
    };


  /* =====================================================
     REORDER
  ===================================================== */

  const moveLesson =
    async (
      lesson,
      direction
    ) => {
      const currentIndex =
        lessons.findIndex(
          (item) =>
            item.id ===
            lesson.id
        );


      if (
        currentIndex === -1
      ) {
        return;
      }


      const targetIndex =
        direction === "up"
          ? currentIndex - 1
          : currentIndex + 1;


      if (
        targetIndex < 0 ||
        targetIndex >=
          lessons.length
      ) {
        return;
      }


      const targetLesson =
        lessons[
          targetIndex
        ];


      try {
        setActionLoading(
          lesson.id
        );


        const firstOrder =
          Number(
            lesson.order ||
            lesson.lessonNumber ||
            currentIndex + 1
          );


        const secondOrder =
          Number(
            targetLesson.order ||
            targetLesson.lessonNumber ||
            targetIndex + 1
          );


        const batch =
          writeBatch(
            db
          );


        batch.update(
          doc(
            db,
            "lessons",
            lesson.id
          ),

          {
            order:
              secondOrder,

            lessonNumber:
              secondOrder,

            updatedAt:
              serverTimestamp(),
          }
        );


        batch.update(
          doc(
            db,
            "lessons",
            targetLesson.id
          ),

          {
            order:
              firstOrder,

            lessonNumber:
              firstOrder,

            updatedAt:
              serverTimestamp(),
          }
        );


        await batch.commit();

      } catch (reorderError) {
        console.error(
          "Reorder lesson error:",
          reorderError
        );

        setError(
          text(
            "Could not reorder lessons.",
            "تعذر تغيير ترتيب الدروس."
          )
        );

      } finally {
        setActionLoading(
          ""
        );
      }
    };


  /* =====================================================
     COUNTS
  ===================================================== */

  const publishedCount =
    lessons.filter(
      (lesson) =>
        lesson.status ===
        "published"
    ).length;


  const draftCount =
    lessons.filter(
      (lesson) =>
        lesson.status ===
        "draft"
    ).length;


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="owner-lesson-loading">

        <div>
          📚
        </div>

        <p>
          {text(
            "Loading program lessons...",
            "جارٍ تحميل دروس البرنامج..."
          )}
        </p>

      </div>
    );
  }


  if (!program) {
    return (
      <div className="owner-lesson-loading">

        <p>
          {error ||
            text(
              "Program was not found.",
              "لم يتم العثور على البرنامج."
            )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-program-lessons-page">

      {/* HEADER */}

      <header className="owner-lessons-header">

        <div>

          <button
            type="button"
            className="owner-lessons-back"
            onClick={() =>
              navigate(
                "/owner/programs"
              )
            }
          >
            {language === "ar"
              ? "↩ العودة للبرامج"
              : "← Back to Programs"}
          </button>


          <small>
            PROGRAM CONTENT
          </small>


          <h1>
            {program.icon ||
              "📦"}{" "}
            {localized(
              program.title
            )}
          </h1>


          <p>
            {text(
              "Build and organize the lesson series included in this commercial program.",
              "أنشئي ورتّبي سلسلة الدروس الموجودة داخل هذا البرنامج التجاري."
            )}
          </p>

        </div>


        <div className="owner-lessons-header-actions">

          <div className="owner-lessons-language">

            <button
              type="button"
              className={
                language === "en"
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
                language === "ar"
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
            className="owner-add-lesson-button"
            onClick={
              openCreateLesson
            }
          >
            +{" "}
            {text(
              "Add Lesson",
              "إضافة درس"
            )}
          </button>

        </div>

      </header>


      {/* PROGRAM INFO */}

      <section className="owner-program-mini-summary">

        <div className="owner-program-mini-icon">
          {program.icon ||
            "📦"}
        </div>


        <div className="owner-program-mini-main">

          <small>
            {text(
              "COMMERCIAL PROGRAM",
              "برنامج تجاري"
            )}
          </small>

          <h2>
            {localized(
              program.title
            )}
          </h2>

          <p>
            {localized(
              program.description
            )}
          </p>

        </div>


        <div className="owner-program-mini-price">

          <span>
            🎓
          </span>

          <div>

            <small>
              {text(
                "Student Price",
                "سعر الطالب"
              )}
            </small>

            <strong>
              ₪
              {program.pricing
                ?.student ??
                0}
            </strong>

          </div>

        </div>


        <div className="owner-program-mini-price">

          <span>
            👩‍🏫
          </span>

          <div>

            <small>
              {text(
                "Teacher Price",
                "سعر المعلم"
              )}
            </small>

            <strong>
              ₪
              {program.pricing
                ?.teacher ??
                0}
            </strong>

          </div>

        </div>

      </section>


      {/* STATS */}

      <section className="owner-lessons-stats">

        <div>
          <span>📚</span>

          <small>
            {text(
              "Total Lessons",
              "إجمالي الدروس"
            )}
          </small>

          <strong>
            {lessons.length}
          </strong>
        </div>


        <div>
          <span>🌍</span>

          <small>
            {text(
              "Published",
              "منشور"
            )}
          </small>

          <strong>
            {publishedCount}
          </strong>
        </div>


        <div>
          <span>📝</span>

          <small>
            {text(
              "Drafts",
              "مسودات"
            )}
          </small>

          <strong>
            {draftCount}
          </strong>
        </div>


        <div>
          <span>🏆</span>

          <small>
            {text(
              "Final Project",
              "المشروع النهائي"
            )}
          </small>

          <strong className="final-project-stat">
            {localized(
              program.finalProject
            ) ||
              "—"}
          </strong>
        </div>

      </section>


      {/* MESSAGES */}

      {success && (
        <div className="owner-lessons-success">
          ✅ {success}
        </div>
      )}


      {error && !showModal && (
        <div className="owner-lessons-error">
          ⚠️ {error}
        </div>
      )}


      {/* MAIN */}

      <section className="owner-lessons-panel">

        <div className="owner-lessons-panel-header">

          <div>

            <small>
              CURRICULUM
            </small>

            <h2>
              📚{" "}
              {text(
                "Program Lessons",
                "دروس البرنامج"
              )}
            </h2>

            <p>
              {text(
                "Arrange lessons in the order students should complete them.",
                "رتّبي الدروس حسب التسلسل الذي يجب أن يتبعه الطالب."
              )}
            </p>

          </div>


          <button
            type="button"
            onClick={
              openCreateLesson
            }
          >
            +{" "}
            {text(
              "New Lesson",
              "درس جديد"
            )}
          </button>

        </div>


        {/* TOOLBAR */}

        {lessons.length > 0 && (

          <div className="owner-lessons-toolbar">

            <div className="owner-lessons-search">

              <span>
                🔎
              </span>

              <input
                type="text"
                value={
                  search
                }
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  text(
                    "Search lessons...",
                    "ابحث عن درس..."
                  )
                }
              />


              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>
              )}

            </div>


            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                {text(
                  "All Statuses",
                  "كل الحالات"
                )}
              </option>

              <option value="published">
                {text(
                  "Published",
                  "منشور"
                )}
              </option>

              <option value="draft">
                {text(
                  "Draft",
                  "مسودة"
                )}
              </option>

              <option value="archived">
                {text(
                  "Archived",
                  "مؤرشف"
                )}
              </option>

            </select>


            <div className="owner-lessons-result-count">

              <small>
                {text(
                  "Results",
                  "النتائج"
                )}
              </small>

              <strong>
                {filteredLessons.length}
              </strong>

            </div>

          </div>

        )}


        {/* EMPTY */}

        {lessons.length === 0 ? (

          <div className="owner-lessons-empty">

            <div>
              📚
            </div>

            <h3>
              {text(
                "Add the first lesson",
                "أضيفي الدرس الأول"
              )}
            </h3>

            <p>
              {text(
                "Start building the learning journey. After creating the lesson, you will be able to build its interactive presentation.",
                "ابدئي ببناء الرحلة التعليمية. بعد إنشاء الدرس ستتمكنين من بناء العرض التفاعلي الخاص به."
              )}
            </p>

            <button
              type="button"
              onClick={
                openCreateLesson
              }
            >
              +{" "}
              {text(
                "Create Lesson 1",
                "إنشاء الدرس الأول"
              )}
            </button>

          </div>

        ) : filteredLessons.length === 0 ? (

          <div className="owner-lessons-empty">

            <div>
              🔎
            </div>

            <h3>
              {text(
                "No lessons found",
                "لم يتم العثور على دروس"
              )}
            </h3>

          </div>

        ) : (

          <div className="owner-lessons-list">

            {filteredLessons.map(
              (
                lesson,
                index
              ) => {

                const actualIndex =
                  lessons.findIndex(
                    (item) =>
                      item.id ===
                      lesson.id
                  );


                return (
                  <article
                    className={`owner-lesson-card ${
                      lesson.status ===
                      "archived"
                        ? "archived"
                        : ""
                    }`}
                    key={
                      lesson.id
                    }
                  >

                    {/* NUMBER */}

                    <div className="owner-lesson-number">

                      <small>
                        {text(
                          "LESSON",
                          "درس"
                        )}
                      </small>

                      <strong>
                        {lesson.order ||
                          lesson.lessonNumber ||
                          index + 1}
                      </strong>

                    </div>


                    {/* COVER IMAGE */}

                    {lesson.coverImage && (
                      <div className="owner-lesson-cover-wrap">
                        <img
                          src={lesson.coverImage}
                          alt={
                            localized(lesson.imageAlt) ||
                            localized(lesson.title) ||
                            text(
                              "Lesson cover",
                              "صورة الدرس"
                            )
                          }
                          className="owner-lesson-cover"
                          loading="lazy"
                        />
                      </div>
                    )}


                    {/* INFO */}

                    <div className="owner-lesson-info">

                      <div className="owner-lesson-title-row">

                        <h3>
                          {localized(
                            lesson.title
                          )}
                        </h3>


                        <span
                          className={`owner-lesson-status ${
                            lesson.status ||
                            "draft"
                          }`}
                        >
                          {lesson.status ===
                          "published"
                            ? text(
                                "Published",
                                "منشور"
                              )
                            : lesson.status ===
                              "archived"
                            ? text(
                                "Archived",
                                "مؤرشف"
                              )
                            : text(
                                "Draft",
                                "مسودة"
                              )}
                        </span>

                      </div>


                      <p>
                        {localized(
                          lesson.description
                        ) ||
                          text(
                            "No description yet.",
                            "لا يوجد وصف بعد."
                          )}
                      </p>


                      <div className="owner-lesson-meta">

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
                          {lesson.sections
                            ?.length ||
                            lesson.slideCount ||
                            0}{" "}
                          {text(
                            "slides",
                            "شرائح"
                          )}
                        </span>

                      </div>

                    </div>


                    {/* REORDER */}

                    <div className="owner-lesson-order-actions">

                      <button
                        type="button"
                        disabled={
                          actualIndex ===
                            0 ||
                          actionLoading ===
                            lesson.id
                        }
                        onClick={() =>
                          moveLesson(
                            lesson,
                            "up"
                          )
                        }
                        title={
                          text(
                            "Move up",
                            "تحريك للأعلى"
                          )
                        }
                      >
                        ↑
                      </button>


                      <button
                        type="button"
                        disabled={
                          actualIndex ===
                            lessons.length -
                              1 ||
                          actionLoading ===
                            lesson.id
                        }
                        onClick={() =>
                          moveLesson(
                            lesson,
                            "down"
                          )
                        }
                        title={
                          text(
                            "Move down",
                            "تحريك للأسفل"
                          )
                        }
                      >
                        ↓
                      </button>

                    </div>


                    {/* ACTIONS */}

                    <div className="owner-lesson-actions">

                      <button
                        type="button"
                        className="owner-build-lesson-button"
                        onClick={() =>
                          navigate(
                            `/owner/programs/${programId}/lessons/${lesson.id}/edit`
                          )
                        }
                      >
                        🖥️{" "}
                        {text(
                          "Build Lesson",
                          "بناء الدرس"
                        )}
                      </button>


                      <button
                        type="button"
                        className="owner-edit-lesson-button"
                        onClick={() =>
                          openEditLesson(
                            lesson
                          )
                        }
                      >
                        ✏️{" "}
                        {text(
                          "Edit",
                          "تعديل"
                        )}
                      </button>


                      {lesson.status !==
                        "archived" && (

                        <button
                          type="button"
                          className={
                            lesson.status ===
                            "published"
                              ? "owner-unpublish-lesson-button"
                              : "owner-publish-lesson-button"
                          }
                          disabled={
                            actionLoading ===
                            lesson.id
                          }
                          onClick={() =>
                            toggleLessonStatus(
                              lesson
                            )
                          }
                        >
                          {lesson.status ===
                          "published"
                            ? `📝 ${text(
                                "Draft",
                                "مسودة"
                              )}`
                            : `🌍 ${text(
                                "Publish",
                                "نشر"
                              )}`}
                        </button>

                      )}


                      {lesson.status !==
                        "archived" && (

                        <button
                          type="button"
                          className="owner-archive-lesson-button"
                          disabled={
                            actionLoading ===
                            lesson.id
                          }
                          onClick={() =>
                            archiveLesson(
                              lesson
                            )
                          }
                        >
                          🗃️{" "}
                          {text(
                            "Archive",
                            "أرشفة"
                          )}
                        </button>

                      )}

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>


      {/* =================================================
          CREATE / EDIT LESSON MODAL
      ================================================= */}

      {showModal && (

        <div
          className="owner-lesson-modal-overlay"
          onClick={
            closeModal
          }
        >

          <div
            className="owner-lesson-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <header className="owner-lesson-modal-header">

              <div>

                <span>
                  📚
                </span>


                <div>

                  <small>
                    {localized(
                      program.title
                    )}
                  </small>


                  <h2>
                    {editingLesson
                      ? text(
                          "Edit Lesson",
                          "تعديل الدرس"
                        )
                      : text(
                          "Create Lesson",
                          "إنشاء درس"
                        )}
                  </h2>


                  <p>
                    {text(
                      "Create the lesson first, then build its interactive slides.",
                      "أنشئي الدرس أولًا، وبعدها ابنِ الشرائح التفاعلية الخاصة به."
                    )}
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </header>


            <form
              className="owner-lesson-form"
              onSubmit={
                handleSaveLesson
              }
            >

              <div className="owner-lesson-form-grid">

                <label>

                  {text(
                    "Lesson Title — English",
                    "اسم الدرس — English"
                  )}

                  <input
                    type="text"
                    value={
                      form.titleEn
                    }
                    onChange={(event) =>
                      updateField(
                        "titleEn",
                        event.target.value
                      )
                    }
                    placeholder="What is Artificial Intelligence?"
                    required
                  />

                </label>


                <label>

                  {text(
                    "Lesson Title — Arabic",
                    "اسم الدرس — عربي"
                  )}

                  <input
                    type="text"
                    value={
                      form.titleAr
                    }
                    onChange={(event) =>
                      updateField(
                        "titleAr",
                        event.target.value
                      )
                    }
                    placeholder="ما هو الذكاء الاصطناعي؟"
                    required
                  />

                </label>


                <label className="owner-lesson-form-full">

                  {text(
                    "Description — English",
                    "الوصف — English"
                  )}

                  <textarea
                    rows="3"
                    value={
                      form.descriptionEn
                    }
                    onChange={(event) =>
                      updateField(
                        "descriptionEn",
                        event.target.value
                      )
                    }
                    placeholder="Students discover how AI works through examples and challenges."
                  />

                </label>


                <label className="owner-lesson-form-full">

                  {text(
                    "Description — Arabic",
                    "الوصف — عربي"
                  )}

                  <textarea
                    rows="3"
                    value={
                      form.descriptionAr
                    }
                    onChange={(event) =>
                      updateField(
                        "descriptionAr",
                        event.target.value
                      )
                    }
                    placeholder="يتعرف الطلاب على كيفية عمل الذكاء الاصطناعي من خلال أمثلة وتحديات."
                  />

                </label>


                <label className="owner-lesson-form-full">

                  {text(
                    "Cover Image Path",
                    "مسار صورة الغلاف"
                  )}

                  <input
                    type="text"
                    value={
                      form.coverImage
                    }
                    onChange={(event) =>
                      updateField(
                        "coverImage",
                        event.target.value
                      )
                    }
                    placeholder="/lesson-covers/inside-a-computer.png"
                  />

                  <small className="owner-lesson-form-hint">
                    {text(
                      "Use a file from public/lesson-covers/, for example /lesson-covers/inside-a-computer.png",
                      "استخدمي صورة من public/lesson-covers/، مثل /lesson-covers/inside-a-computer.png"
                    )}
                  </small>

                </label>


                <label>

                  {text(
                    "Image Alt — English",
                    "وصف الصورة — English"
                  )}

                  <input
                    type="text"
                    value={
                      form.imageAltEn
                    }
                    onChange={(event) =>
                      updateField(
                        "imageAltEn",
                        event.target.value
                      )
                    }
                    placeholder="Children exploring computer components"
                  />

                </label>


                <label>

                  {text(
                    "Image Alt — Arabic",
                    "وصف الصورة — عربي"
                  )}

                  <input
                    type="text"
                    value={
                      form.imageAltAr
                    }
                    onChange={(event) =>
                      updateField(
                        "imageAltAr",
                        event.target.value
                      )
                    }
                    placeholder="أطفال يستكشفون مكونات الحاسوب"
                  />

                </label>


                <label>

                  {text(
                    "Duration",
                    "مدة الدرس"
                  )}

                  <div className="owner-lesson-number-field">

                    <input
                      type="number"
                      min="1"
                      value={
                        form.minutes
                      }
                      onChange={(event) =>
                        updateField(
                          "minutes",
                          event.target.value
                        )
                      }
                    />

                    <span>
                      {text(
                        "minutes",
                        "دقيقة"
                      )}
                    </span>

                  </div>

                </label>


                <label>

                  XP

                  <div className="owner-lesson-number-field">

                    <input
                      type="number"
                      min="0"
                      value={
                        form.xp
                      }
                      onChange={(event) =>
                        updateField(
                          "xp",
                          event.target.value
                        )
                      }
                    />

                    <span>
                      ⭐ XP
                    </span>

                  </div>

                </label>

              </div>


              {/* STATUS */}

              <div className="owner-lesson-publish-options">

                <button
                  type="button"
                  className={
                    form.status ===
                    "draft"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateField(
                      "status",
                      "draft"
                    )
                  }
                >
                  📝

                  <div>

                    <strong>
                      {text(
                        "Draft",
                        "مسودة"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Not visible to customers yet.",
                        "لن يظهر للعملاء بعد."
                      )}
                    </small>

                  </div>

                </button>


                <button
                  type="button"
                  className={
                    form.status ===
                    "published"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateField(
                      "status",
                      "published"
                    )
                  }
                >
                  🌍

                  <div>

                    <strong>
                      {text(
                        "Published",
                        "منشور"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Included in the published program.",
                        "سيظهر ضمن البرنامج المنشور."
                      )}
                    </small>

                  </div>

                </button>

              </div>


              {error && (
                <div className="owner-lesson-modal-error">
                  ⚠️ {error}
                </div>
              )}


              <div className="owner-lesson-form-actions">

                <button
                  type="button"
                  className="owner-lesson-cancel"
                  disabled={
                    saving
                  }
                  onClick={
                    closeModal
                  }
                >
                  {text(
                    "Cancel",
                    "إلغاء"
                  )}
                </button>


                <button
                  type="submit"
                  className="owner-lesson-save"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? text(
                        "Saving...",
                        "جارٍ الحفظ..."
                      )
                    : editingLesson
                    ? text(
                        "Save Changes",
                        "حفظ التعديلات"
                      )
                    : text(
                        "Create Lesson 🚀",
                        "إنشاء الدرس 🚀"
                      )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default OwnerProgramLessons;