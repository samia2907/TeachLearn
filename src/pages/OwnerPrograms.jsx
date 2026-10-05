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

import "./OwnerPrograms.css";

import { hebrewText } from "../data/hebrewText";
import { normalizeProgram } from "../../functions/programAccessPolicy.mjs";
import { countProgramContent } from "../../functions/programContent.mjs";


const emptyForm = {
  accessType: "free",
  previewLessonCount: "1",
  outcomesEn: "", outcomesAr: "", outcomesHe: "",
  price: "0",
  paymentProvider: "",
  paymentProductId: "",
  titleEn: "",
  titleAr: "",

  descriptionEn: "",
  descriptionAr: "",

  icon: "🚀",

  category: "technology",

  ageFrom: "8",
  ageTo: "14",

  level: "beginner",

  studentPrice: "",
  teacherPrice: "",
  classPrice: "",
  studentPaddlePriceId: "",
  teacherPaddlePriceId: "",
  classPaddlePriceId: "",

  finalProjectEn: "",
  finalProjectAr: "",

  status: "draft",
};


function OwnerPrograms() {
  const [contentRecords, setContentRecords] = useState(null);
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    owner,
    setOwner,
  ] = useState(null);

  const [
    programs,
    setPrograms,
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
    editingProgram,
    setEditingProgram,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );

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
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const text = (
    english,
    arabic,
    hebrew = hebrewText(english)
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
      : english;

  // Realtime counts must reflect edits rather than the legacy cached total.
  useEffect(() => {
    if (!owner) return undefined;
    return onSnapshot(collection(db, 'lessons'), snapshot => {
      setContentRecords(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, failure => { console.error('Program content counts failed', failure.code); setContentRecords(null); });
  }, [owner]);
  const contentCounts = programId => countProgramContent((contentRecords || []).filter(item => item.programId === programId && item.lessonType === 'commercial'));
  const contentCountLabel = programId => {
    if (!contentRecords) return '…';
    const counts = contentCounts(programId);
    const names = { lesson: text('lessons', 'دروس', 'שיעורים'), mission: text('missions', 'مهمات', 'משימות'),
      quiz: text('quizzes', 'اختبارات', 'בחנים'), activity: text('activities', 'أنشطة', 'פעילויות') };
    return Object.entries(counts).filter(([type, count]) => type === 'lesson' || count > 0).map(([type, count]) => `${count} ${names[type]}`).join(' • ');
  };


  /* =====================================================
     LOAD OWNER
  ===================================================== */

  useEffect(() => {
    const loadOwner =
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


          const snapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (
            !snapshot.exists()
          ) {
            navigate(
              "/login"
            );

            return;
          }


          const data =
            snapshot.data();


          if (
            data.role !==
            "owner"
          ) {
            navigate(
              data.role === "teacher"
                ? "/teacher"
                : "/student"
            );

            return;
          }


          setOwner(
            data
          );

        } catch (loadError) {
          console.error(
            "Owner load error:",
            loadError
          );

          setError(
            text(
              "Could not load owner account.",
              "تعذر تحميل حساب المالك."
            )
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadOwner();

  }, [navigate]);


  /* =====================================================
     LOAD PROGRAMS REAL TIME
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


    const programsQuery =
      query(
        collection(
          db,
          "programs"
        ),

        where(
          "createdBy",
          "==",
          user.uid
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


          list.sort(
            (first, second) => {
              const firstTime =
                first.createdAt
                  ?.seconds ||
                0;

              const secondTime =
                second.createdAt
                  ?.seconds ||
                0;


              return (
                secondTime -
                firstTime
              );
            }
          );


          setPrograms(
            list
          );
        },

        (listenerError) => {
          console.error(
            "Programs listener error:",
            listenerError
          );

          setError(
            text(
              "Could not load programs. Check Firestore permissions.",
              "تعذر تحميل البرامج. تحققي من صلاحيات Firestore."
            )
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     FILTER PROGRAMS
  ===================================================== */

  const filteredPrograms =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return programs.filter(
          (program) => {
            const titleEn =
              String(
                program.title?.en ||
                ""
              ).toLowerCase();

            const titleAr =
              String(
                program.title?.ar ||
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
                : program.status ===
                  statusFilter;


            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },

      [
        programs,
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


  const openCreateProgram =
    () => {
      setEditingProgram(
        null
      );

      setForm(
        emptyForm
      );

      setError("");
      setSuccess("");

      setShowModal(
        true
      );
    };


  const openEditProgram =
    (program) => {
      setEditingProgram(
        program
      );


      setForm({
        accessType: normalizeProgram(program).accessType,
        previewLessonCount: String(program.previewLessonCount ?? 1),
        outcomesEn: (program.learningOutcomes?.en || []).join('\n'),
        outcomesAr: (program.learningOutcomes?.ar || []).join('\n'),
        outcomesHe: (program.learningOutcomes?.he || []).join('\n'),
        price: String(normalizeProgram(program).price),
        paymentProvider: program.paymentProvider || "",
        paymentProductId: program.paymentProductId || "",
        studentPaddlePriceId: program.paddlePriceIds?.student || "",
        teacherPaddlePriceId: program.paddlePriceIds?.teacher || "",
        classPaddlePriceId: program.paddlePriceIds?.class || "",
        titleEn:
          program.title?.en ||
          "",

        titleAr:
          program.title?.ar ||
          "",

        descriptionEn:
          program.description?.en ||
          "",

        descriptionAr:
          program.description?.ar ||
          "",

        icon:
          program.icon ||
          "🚀",

        category:
          program.category ||
          "technology",

        ageFrom:
          String(
            program.ageFrom ??
            8
          ),

        ageTo:
          String(
            program.ageTo ??
            14
          ),

        level:
          program.level ||
          "beginner",

        studentPrice:
          String(
            program.pricing
              ?.student ??
            ""
          ),

        teacherPrice:
          String(
            program.pricing
              ?.teacher ??
            ""
          ),

        classPrice:
          String(
            program.pricing
              ?.class ??
            ""
          ),

        finalProjectEn:
          program.finalProject
            ?.en ||
          "",

        finalProjectAr:
          program.finalProject
            ?.ar ||
          "",

        status:
          program.status ||
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

      setEditingProgram(
        null
      );

      setError("");
    };


  /* =====================================================
     SAVE PROGRAM
  ===================================================== */

  const handleSaveProgram =
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
            "Program name is required in English and Arabic.",
            "يجب كتابة اسم البرنامج بالعربية والإنجليزية."
          )
        );

        return;
      }


      const ageFrom =
        Number(
          form.ageFrom
        );

      const ageTo =
        Number(
          form.ageTo
        );


      if (
        ageFrom < 3 ||
        ageTo < ageFrom
      ) {
        setError(
          text(
            "Please enter a valid age range.",
            "يرجى إدخال فئة عمرية صحيحة."
          )
        );

        return;
      }


      const studentPrice =
        Number(
          form.studentPrice ||
          0
        );

      const price = form.accessType === "free" ? 0 : Number(form.price || 0);
      const previewLessonCount = Number(form.previewLessonCount);
      if (!Number.isInteger(previewLessonCount) || previewLessonCount < 0 || previewLessonCount > 10000) {
        setError(text('Enter a whole preview count from 0 to 10000.', 'أدخل عدد معاينات صحيحًا بين 0 و10000.', 'הזינו מספר שיעורי התנסות שלם בין 0 ל-10000.'));
        return;
      }
      if (!Number.isFinite(price) || price < 0 || price > 1000000) {
        setError(text("Enter a valid price.", "أدخل سعرًا صحيحًا.", "יש להזין מחיר תקין."));
        return;
      }

      const paddlePriceIds = Object.fromEntries(
        ["student", "teacher", "class"].map((license) => [license, form[`${license}PaddlePriceId`].trim()])
      );
      if (Object.values(paddlePriceIds).some((id) => id && !/^pri_[a-z0-9]{26}$/.test(id))) {
        setError(text("Enter valid Paddle Price IDs (pri_ followed by 26 lowercase letters or digits), or leave them blank.", "أدخل معرّفات أسعار Paddle صحيحة أو اترك الحقول فارغة."));
        return;
      }

      const teacherPrice =
        Number(
          form.teacherPrice ||
          0
        );

      const classPrice =
        Number(
          form.classPrice ||
          0
        );


      if (
        ![studentPrice, teacherPrice, classPrice].every(Number.isFinite) ||
        studentPrice < 0 ||
        teacherPrice < 0 ||
        classPrice < 0
      ) {
        setError(
          text(
            "Prices cannot be negative.",
            "لا يمكن أن تكون الأسعار سالبة."
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


        const programData = {
          accessType: form.accessType,
          previewLessonCount,
          learningOutcomes: Object.fromEntries([['en', form.outcomesEn], ['ar', form.outcomesAr], ['he', form.outcomesHe]].map(([key, value]) => [key, value.split('\n').map(item => item.trim()).filter(Boolean).slice(0, 20)])),
          price,
          paymentProvider: form.paymentProvider.trim() || null,
          paymentProductId: form.paymentProductId.trim() || null,
          paddlePriceIds,
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

          icon:
            form.icon.trim() ||
            "🚀",

          category:
            form.category,

          ageFrom,
          ageTo,

          level:
            form.level,

          pricing: {
            student:
              studentPrice,

            teacher:
              teacherPrice,

            class:
              classPrice,
          },

          currency:
            "ILS",

          purchaseOptions: {
            student:
              true,

            teacher:
              true,

            class:
              true,
          },

          finalProject: {
            en:
              form.finalProjectEn.trim(),

            ar:
              form.finalProjectAr.trim(),
          },

          status:
            form.status,

          sellable:
            true,

          programType:
            "commercial",

          createdBy:
            editingProgram?.createdBy || user.uid,

          createdByRole:
            "owner",

          ownerName:
            owner?.name ||
            "",

          updatedAt:
            serverTimestamp(),
        };


        if (
          editingProgram
        ) {
          await updateDoc(
            doc(
              db,
              "programs",
              editingProgram.id
            ),

            programData
          );


          setSuccess(
            text(
              "Program updated successfully.",
              "تم تحديث البرنامج بنجاح."
            )
          );

        } else {
          await addDoc(
            collection(
              db,
              "programs"
            ),

            {
              ...programData,

              lessonCount:
                0,

              salesCount:
                0,

              studentsCount:
                0,

              createdAt:
                serverTimestamp(),
            }
          );


          setSuccess(
            text(
              "Program created successfully.",
              "تم إنشاء البرنامج بنجاح."
            )
          );
        }


        setShowModal(
          false
        );

        setEditingProgram(
          null
        );

        setForm(
          emptyForm
        );

      } catch (saveError) {
        console.error(
          "Save program error:",
          saveError
        );


        if (
          saveError.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow creating programs yet.",
              "صلاحيات Firestore لا تسمح بإنشاء البرامج بعد."
            )
          );

        } else {
          setError(
            text(
              "Could not save the program.",
              "تعذر حفظ البرنامج."
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
     PUBLISH / UNPUBLISH
  ===================================================== */

  const toggleProgramStatus =
    async (program) => {
      try {
        setError("");
        setSuccess("");


        const nextStatus =
          program.status ===
          "published"
            ? "draft"
            : "published";


        await updateDoc(
          doc(
            db,
            "programs",
            program.id
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
                "Program published successfully.",
                "تم نشر البرنامج بنجاح."
              )
            : text(
                "Program moved back to draft.",
                "تمت إعادة البرنامج إلى المسودة."
              )
        );

      } catch (statusError) {
        console.error(
          "Program status error:",
          statusError
        );


        setError(
          text(
            "Could not update program status.",
            "تعذر تحديث حالة البرنامج."
          )
        );
      }
    };


  /* =====================================================
     STATS
  ===================================================== */

  const publishedCount =
    programs.filter(
      (program) =>
        program.status ===
        "published"
    ).length;


  const draftCount =
    programs.filter(
      (program) =>
        program.status !==
        "published"
    ).length;


  const totalLessons =
    programs.reduce(
      (
        total,
        program
      ) =>
        total +
        Number(
          contentCounts(program.id).lesson ||
          0
        ),

      0
    );


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="owner-programs-loading">

        <div>
          📦
        </div>

        <p>
          {text(
            "Loading programs...",
            "جارٍ تحميل البرامج..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-programs-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="owner-programs-header">

        <div>

          <button
            type="button"
            className="owner-programs-back"
            onClick={() =>
              navigate(
                "/owner"
              )
            }
          >
            {language === "ar"
              ? "↩ العودة للرئيسية"
              : language === "he"
                ? "→ חזרה ללוח הבקרה"
                : "← Back to Dashboard"}
          </button>


          <small>
            TechMinds MARKETPLACE
          </small>


          <h1>
            📦{" "}
            {text(
              "Programs",
              "البرامج"
            )}
          </h1>


          <p>
            {text(
              "Create and manage learning programs that can be sold to students, teachers and classes.",
              "أنشئي وأديري البرامج التعليمية التي يمكن بيعها للطلاب والمعلمين والصفوف."
            )}
          </p>

        </div>


        <div className="owner-programs-header-actions">

          <div className="owner-programs-language">

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
            className="create-program-button"
            onClick={
              openCreateProgram
            }
          >
            +{" "}
            {text(
              "Create Program",
              "إنشاء برنامج"
            )}
          </button>

        </div>

      </header>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="owner-programs-stats">

        <div>

          <span>
            📦
          </span>

          <small>
            {text(
              "Total Programs",
              "إجمالي البرامج"
            )}
          </small>

          <strong>
            {programs.length}
          </strong>

        </div>


        <div>

          <span>
            🌍
          </span>

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

          <span>
            📝
          </span>

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

          <span>
            📚
          </span>

          <small>
            {text(
              "Lessons",
              "الدروس"
            )}
          </small>

          <strong>
            {totalLessons}
          </strong>

        </div>

      </section>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (
        <div className="owner-programs-success">
          ✅ {success}
        </div>
      )}


      {error && !showModal && (
        <div className="owner-programs-error">
          ⚠️ {error}
        </div>
      )}


      {/* =================================================
          MAIN PANEL
      ================================================= */}

      <section className="owner-programs-panel">

        <div className="owner-programs-panel-header">

          <div>

            <small>
              CONTENT
            </small>

            <h2>
              {text(
                "Programs for Sale",
                "البرامج المعروضة للبيع"
              )}
            </h2>

            <p>
              {text(
                "Only Owner accounts can create commercial programs.",
                "يمكن لحساب المالك فقط إنشاء برامج تجارية للبيع."
              )}
            </p>

          </div>


          <button
            type="button"
            onClick={
              openCreateProgram
            }
          >
            +{" "}
            {text(
              "New Program",
              "برنامج جديد"
            )}
          </button>

        </div>


        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        {programs.length > 0 && (

          <div className="owner-programs-toolbar">

            <div className="owner-program-search">

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
                    "Search programs...",
                    "ابحث عن برنامج..."
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

            </select>


            <div className="owner-program-results">

              <small>
                {text(
                  "Results",
                  "النتائج"
                )}
              </small>

              <strong>
                {filteredPrograms.length}
              </strong>

            </div>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {programs.length ===
        0 ? (

          <div className="owner-programs-empty">

            <div>
              📦
            </div>

            <h3>
              {text(
                "Create your first program",
                "أنشئي برنامجك الأول"
              )}
            </h3>

            <p>
              {text(
                "Build a complete learning series, add lessons and sell access to students and teachers.",
                "أنشئي سلسلة تعليمية كاملة، أضيفي الدروس وبيعي الوصول للطلاب والمعلمين."
              )}
            </p>

            <button
              type="button"
              onClick={
                openCreateProgram
              }
            >
              +{" "}
              {text(
                "Create First Program",
                "إنشاء أول برنامج"
              )}
            </button>

          </div>

        ) : filteredPrograms.length ===
          0 ? (

          <div className="owner-programs-empty">

            <div>
              🔎
            </div>

            <h3>
              {text(
                "No programs found",
                "لم يتم العثور على برامج"
              )}
            </h3>

            <p>
              {text(
                "Try another search or filter.",
                "جرّبي بحثًا أو فلترًا مختلفًا."
              )}
            </p>

          </div>

        ) : (

          /* =================================================
             PROGRAM CARDS
          ================================================= */

          <div className="owner-programs-grid">

            {filteredPrograms.map(
              (program) => (

                <article
                  className="owner-program-card"
                  key={
                    program.id
                  }
                >

                  <div className="owner-program-card-top">

                    <div className="owner-program-icon">
                      {program.icon ||
                        "🚀"}
                    </div>


                    <span
                      className={
                        program.status ===
                        "published"
                          ? "program-status published"
                          : "program-status draft"
                      }
                    >
                      {program.status ===
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


                  <h3>
                    {language === "ar"
                      ? (
                          program.title?.ar ||
                          program.title?.en
                        )
                      : (
                          program.title?.en ||
                          program.title?.ar
                        )}
                  </h3>


                  <p className="owner-program-description">

                    {language === "ar"
                      ? (
                          program.description?.ar ||
                          program.description?.en ||
                          text(
                            "No description yet.",
                            "لا يوجد وصف بعد."
                          )
                        )
                      : (
                          program.description?.en ||
                          program.description?.ar ||
                          text(
                            "No description yet.",
                            "لا يوجد وصف بعد."
                          )
                        )}

                  </p>


                  <div className="owner-program-info">

                    <span>
                      🎯{" "}
                      {text(
                        program.level ||
                          "beginner",
                        program.level ===
                        "advanced"
                          ? "متقدم"
                          : program.level ===
                            "intermediate"
                          ? "متوسط"
                          : "مبتدئ"
                      )}
                    </span>


                    <span>
                      👦{" "}
                      {program.ageFrom}
                      –
                      {program.ageTo}
                    </span>


                    <span>
                      📚{" "}
                      {contentCountLabel(program.id)}
                    </span>

                  </div>


                  {/* PRICING */}

                  <div className="owner-program-pricing">

                    <div>

                      <small>
                        🎓{" "}
                        {text(
                          "Student",
                          "طالب"
                        )}
                      </small>

                      <strong>
                        ₪
                        {program.pricing
                          ?.student ??
                          0}
                      </strong>

                    </div>


                    <div>

                      <small>
                        👩‍🏫{" "}
                        {text(
                          "Teacher",
                          "معلّم"
                        )}
                      </small>

                      <strong>
                        ₪
                        {program.pricing
                          ?.teacher ??
                          0}
                      </strong>

                    </div>


                    <div>

                      <small>
                        👥{" "}
                        {text(
                          "Class",
                          "صف"
                        )}
                      </small>

                      <strong>
                        ₪
                        {program.pricing
                          ?.class ??
                          0}
                      </strong>

                    </div>

                  </div>


                  <div className="owner-program-card-actions">

                    <button
                      type="button"
                      className="program-edit-button"
                      onClick={() =>
                        openEditProgram(
                          program
                        )
                      }
                    >
                      ✏️{" "}
                      {text(
                        "Edit",
                        "تعديل"
                      )}
                    </button>


                    <button
                      type="button"
                      className={
                        program.status ===
                        "published"
                          ? "program-unpublish-button"
                          : "program-publish-button"
                      }
                      onClick={() =>
                        toggleProgramStatus(
                          program
                        )
                      }
                    >
                      {program.status ===
                      "published"
                        ? `📝 ${text(
                            "Unpublish",
                            "إلغاء النشر"
                          )}`
                        : `🌍 ${text(
                            "Publish",
                            "نشر"
                          )}`}
                    </button>


                    <button
                      type="button"
                      className="program-lessons-button"
                      onClick={() =>
                        navigate(
                          `/owner/programs/${program.id}/lessons`
                        )
                      }
                    >
                      📚{" "}
                      {text(
                        "Lessons",
                        "الدروس"
                      )}
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="owner-program-modal-overlay"
          onClick={
            closeModal
          }
        >

          <div
            className="owner-program-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <header className="owner-program-modal-header">

              <div>

                <span>
                  {editingProgram
                    ? "✏️"
                    : "📦"}
                </span>


                <div>

                  <small>
                    TechMinds
                  </small>

                  <h2>
                    {editingProgram
                      ? text(
                          "Edit Program",
                          "تعديل البرنامج"
                        )
                      : text(
                          "Create Program",
                          "إنشاء برنامج"
                        )}
                  </h2>

                  <p>
                    {text(
                      "Create a commercial learning program for the TechMinds marketplace.",
                      "أنشئي برنامجًا تعليميًا تجاريًا لمتجر TechMinds."
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
              className="owner-program-form"
              onSubmit={
                handleSaveProgram
              }
            >

              {/* PROGRAM NAME */}

              <div className="program-form-section">

                <div className="program-form-section-title">

                  <span>
                    1
                  </span>

                  <div>

                    <h3>
                      {text(
                        "Program Information",
                        "معلومات البرنامج"
                      )}
                    </h3>

                    <p>
                      {text(
                        "Main information visible in the marketplace.",
                        "المعلومات الأساسية التي ستظهر في المتجر."
                      )}
                    </p>

                  </div>

                </div>


                <div className="program-form-grid">

                  <label>

                    {text(
                      "Program Name — English",
                      "اسم البرنامج — English"
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
                      placeholder="AI Explorer"
                      required
                    />

                  </label>


                  <label>

                    {text(
                      "Program Name — Arabic",
                      "اسم البرنامج — عربي"
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
                      placeholder="مستكشف الذكاء الاصطناعي"
                      required
                    />

                  </label>


                  <label className="program-form-full">

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
                      placeholder="Learn AI through interactive lessons, projects and challenges."
                    />

                  </label>


                  <label className="program-form-full">

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
                      placeholder="تعلّم الذكاء الاصطناعي من خلال دروس ومشاريع وتحديات تفاعلية."
                    />

                  </label>

                </div>

              </div>


              {/* DETAILS */}

              <div className="program-form-section">

                <div className="program-form-section-title">

                  <span>
                    2
                  </span>

                  <div>

                    <h3>
                      {text(
                        "Learning Details",
                        "تفاصيل التعلم"
                      )}
                    </h3>

                    <p>
                      {text(
                        "Age, difficulty and category.",
                        "الفئة العمرية والمستوى والتصنيف."
                      )}
                    </p>

                  </div>

                </div>


                <div className="program-form-grid three">

                  <label>

                    {text(
                      "Icon",
                      "الأيقونة"
                    )}

                    <input
                      type="text"
                      value={
                        form.icon
                      }
                      onChange={(event) =>
                        updateField(
                          "icon",
                          event.target.value
                        )
                      }
                      maxLength="6"
                    />

                  </label>


                  <label>

                    {text(
                      "Category",
                      "التصنيف"
                    )}

                    <select
                      value={
                        form.category
                      }
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target.value
                        )
                      }
                    >
                      <option value="technology">
                        {text(
                          "Technology",
                          "تكنولوجيا"
                        )}
                      </option>

                      <option value="coding">
                        {text(
                          "Coding",
                          "برمجة"
                        )}
                      </option>

                      <option value="ai">
                        {text(
                          "Artificial Intelligence",
                          "ذكاء اصطناعي"
                        )}
                      </option>

                      <option value="cyber">
                        {text(
                          "Cyber Safety",
                          "أمن سيبراني"
                        )}
                      </option>

                      <option value="digital">
                        {text(
                          "Digital Skills",
                          "مهارات رقمية"
                        )}
                      </option>

                      <option value="math">
                        {text(
                          "Math & Logic",
                          "رياضيات ومنطق"
                        )}
                      </option>

                    </select>

                  </label>


                  <label>

                    {text(
                      "Level",
                      "المستوى"
                    )}

                    <select
                      value={
                        form.level
                      }
                      onChange={(event) =>
                        updateField(
                          "level",
                          event.target.value
                        )
                      }
                    >
                      <option value="beginner">
                        {text(
                          "Beginner",
                          "مبتدئ"
                        )}
                      </option>

                      <option value="intermediate">
                        {text(
                          "Intermediate",
                          "متوسط"
                        )}
                      </option>

                      <option value="advanced">
                        {text(
                          "Advanced",
                          "متقدم"
                        )}
                      </option>

                    </select>

                  </label>


                  <label>

                    {text(
                      "Age From",
                      "العمر من"
                    )}

                    <input
                      type="number"
                      min="3"
                      max="18"
                      value={
                        form.ageFrom
                      }
                      onChange={(event) =>
                        updateField(
                          "ageFrom",
                          event.target.value
                        )
                      }
                    />

                  </label>


                  <label>

                    {text(
                      "Age To",
                      "العمر حتى"
                    )}

                    <input
                      type="number"
                      min="3"
                      max="18"
                      value={
                        form.ageTo
                      }
                      onChange={(event) =>
                        updateField(
                          "ageTo",
                          event.target.value
                        )
                      }
                    />

                  </label>

                </div>

              </div>


              {/* PRICES */}

              <div className="program-form-section">

                <div className="program-form-section-title">

                  <span>
                    3
                  </span>

                  <div>

                    <h3>
                      {text(
                        "Program Pricing",
                        "أسعار البرنامج"
                      )}
                    </h3>

                    <p>
                      {text(
                        "Set different prices for students, teachers and classes.",
                        "حددي أسعارًا مختلفة للطالب والمعلم والصف."
                      )}
                    </p>

                  </div>

                </div>


                <div className="program-form-grid">
                  <label>
                    {text("Student program access", "وصول الطالب إلى البرنامج", "גישת תלמידים לתוכנית")}
                    <select value={form.accessType} onChange={(event) => setForm((current) => ({
                      ...current, accessType: event.target.value,
                      price: event.target.value === "free" ? "0" : current.price,
                    }))}>
                      <option value="free">{text("Free", "مجاني", "חינם")}</option>
                      <option value="paid">{text("Paid", "مدفوع", "בתשלום")}</option>
                      <option value="class">{text("Class access", "عبر الصف", "דרך הכיתה")}</option>
                    </select>
                  </label>
                  {form.accessType === "paid" && <>
                    <label>{text('Free preview lessons', 'عدد دروس المعاينة المجانية', 'מספר שיעורי התנסות בחינם')}
                      <input type="number" min="0" max="10000" step="1" required value={form.previewLessonCount} onChange={event => setForm(current => ({ ...current, previewLessonCount: event.target.value }))} />
                    </label>
                    {[['outcomesEn', 'English'], ['outcomesAr', 'العربية'], ['outcomesHe', 'עברית']].map(([key, label]) => <label key={key}>
                      {text('Learning outcomes (one per line)', 'مخرجات التعلم (واحد في كل سطر)', 'תוצאות למידה (אחת בכל שורה)')} · {label}
                      <textarea dir={key === 'outcomesEn' ? 'ltr' : 'rtl'} maxLength={4000} value={form[key]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} />
                    </label>)}
                    <label>{text("Price (ILS)", "السعر (شيكل)", "מחיר (ש״ח)")}
                      <input type="number" min="0" max="1000000" step="0.01" value={form.price}
                        onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
                    </label>
                    <label>{text("Payment provider (optional)", "مزود الدفع (اختياري)", "ספק תשלום (לא חובה)")}
                      <input maxLength={128} value={form.paymentProvider}
                        onChange={(event) => setForm((current) => ({ ...current, paymentProvider: event.target.value }))} />
                    </label>
                    <label>{text("Payment product ID (optional)", "معرّف منتج الدفع (اختياري)", "מזהה מוצר לתשלום (לא חובה)")}
                      <input maxLength={256} value={form.paymentProductId}
                        onChange={(event) => setForm((current) => ({ ...current, paymentProductId: event.target.value }))} />
                    </label>
                    <p>{text("Payment coming soon", "الدفع قريبًا", "התשלום יתווסף בקרוב")}</p>
                  </>}
                </div>
                <p>{text("Legacy license pricing (kept for existing teacher workflows)", "أسعار التراخيص السابقة (محفوظة لعمل المعلمين الحالي)", "תמחור רישיונות קודם (נשמר לתהליכי המורים הקיימים)")}</p>
                <div className="program-price-grid">

                  <label>

                    <span>
                      🎓
                    </span>

                    <strong>
                      {text(
                        "Student Access",
                        "وصول الطالب"
                      )}
                    </strong>

                    <small>
                      {text(
                        "One student",
                        "طالب واحد"
                      )}
                    </small>

                    <div>
                      <b>
                        ₪
                      </b>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.studentPrice
                        }
                        onChange={(event) =>
                          updateField(
                            "studentPrice",
                            event.target.value
                          )
                        }
                        placeholder="39"
                      />
                    </div>

                  </label>


                  <label>

                    <span>
                      👩‍🏫
                    </span>

                    <strong>
                      {text(
                        "Teacher Access",
                        "وصول المعلم"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Teacher materials",
                        "مواد المعلم"
                      )}
                    </small>

                    <div>
                      <b>
                        ₪
                      </b>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.teacherPrice
                        }
                        onChange={(event) =>
                          updateField(
                            "teacherPrice",
                            event.target.value
                          )
                        }
                        placeholder="69"
                      />
                    </div>

                  </label>


                  <label>

                    <span>
                      👥
                    </span>

                    <strong>
                      {text(
                        "Class License",
                        "ترخيص صف"
                      )}
                    </strong>

                    <small>
                      {text(
                        "Teacher + class",
                        "معلم + صف"
                      )}
                    </small>

                    <div>
                      <b>
                        ₪
                      </b>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          form.classPrice
                        }
                        onChange={(event) =>
                          updateField(
                            "classPrice",
                            event.target.value
                          )
                        }
                        placeholder="149"
                      />
                    </div>

                  </label>

                </div>

              </div>


              {/* FINAL PROJECT */}
              <section className="program-form-section">
                <h3>{text("Paddle prices · one-time program purchase", "أسعار Paddle · شراء البرنامج لمرة واحدة")}</h3>
                <p>{text("Use one-time prices from the same Paddle environment as checkout. Blank fields disable purchase for that license. Match the display prices above to Paddle amounts and currency.", "استخدم أسعار دفع لمرة واحدة من نفس بيئة Paddle. الحقل الفارغ يعطّل شراء هذا الترخيص. طابق الأسعار المعروضة أعلاه مع المبالغ والعملة في Paddle.")}</p>
                <div className="program-form-grid">
                  {[
                    ["student", "Student Paddle Price ID", "معرّف سعر الطالب في Paddle"],
                    ["teacher", "Teacher Paddle Price ID", "معرّف سعر المعلّم في Paddle"],
                    ["class", "Class Paddle Price ID (optional)", "معرّف سعر الصف في Paddle (اختياري)"],
                  ].map(([license, en, ar]) => (
                    <div className="program-form-group" key={license}>
                      <label htmlFor={`paddle-${license}`}>{text(en, ar)}</label>
                      <input id={`paddle-${license}`} dir="ltr" placeholder="pri_..." autoComplete="off" spellCheck={false}
                        value={form[`${license}PaddlePriceId`]}
                        onChange={(event) => setForm((current) => ({ ...current, [`${license}PaddlePriceId`]: event.target.value }))} />
                    </div>
                  ))}
                </div>
              </section>

              <div className="program-form-section">

                <div className="program-form-section-title">

                  <span>
                    4
                  </span>

                  <div>

                    <h3>
                      🏆{" "}
                      {text(
                        "Final Project",
                        "المشروع النهائي"
                      )}
                    </h3>

                    <p>
                      {text(
                        "Tell students what they will create by the end of the program.",
                        "وضحي للطالب ماذا سينجز في نهاية البرنامج."
                      )}
                    </p>

                  </div>

                </div>


                <div className="program-form-grid">

                  <label>

                    {text(
                      "Final Project — English",
                      "المشروع النهائي — English"
                    )}

                    <input
                      type="text"
                      value={
                        form.finalProjectEn
                      }
                      onChange={(event) =>
                        updateField(
                          "finalProjectEn",
                          event.target.value
                        )
                      }
                      placeholder="Build your own AI project"
                    />

                  </label>


                  <label>

                    {text(
                      "Final Project — Arabic",
                      "المشروع النهائي — عربي"
                    )}

                    <input
                      type="text"
                      value={
                        form.finalProjectAr
                      }
                      onChange={(event) =>
                        updateField(
                          "finalProjectAr",
                          event.target.value
                        )
                      }
                      placeholder="أنشئ مشروع ذكاء اصطناعي خاص بك"
                    />

                  </label>

                </div>

              </div>


              {/* STATUS */}

              <div className="program-form-section">

                <div className="program-form-section-title">

                  <span>
                    5
                  </span>

                  <div>

                    <h3>
                      {text(
                        "Publishing",
                        "النشر"
                      )}
                    </h3>

                  </div>

                </div>


                <div className="program-status-options">

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

                    <span>

                      <strong>
                        {text(
                          "Save as Draft",
                          "حفظ كمسودة"
                        )}
                      </strong>

                      <small>
                        {text(
                          "Not visible in marketplace.",
                          "لن يظهر في المتجر."
                        )}
                      </small>

                    </span>

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

                    <span>

                      <strong>
                        {text(
                          "Publish",
                          "نشر"
                        )}
                      </strong>

                      <small>
                        {text(
                          "Visible to customers.",
                          "سيظهر للعملاء."
                        )}
                      </small>

                    </span>

                  </button>

                </div>

              </div>


              {error && (
                <div className="owner-program-modal-error">
                  ⚠️ {error}
                </div>
              )}


              <div className="owner-program-form-actions">

                <button
                  type="button"
                  className="owner-program-cancel"
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
                  className="owner-program-save"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? text(
                        "Saving...",
                        "جارٍ الحفظ..."
                      )
                    : editingProgram
                    ? text(
                        "Save Changes",
                        "حفظ التعديلات"
                      )
                    : text(
                        "Create Program 🚀",
                        "إنشاء البرنامج 🚀"
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


export default OwnerPrograms;
