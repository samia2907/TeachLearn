import {

  useEffect,

  useState,

} from "react";



import {

  collection,

  doc,

  getDoc,

  getDocs,

  query,

  serverTimestamp,

  where,

  writeBatch,

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



import "./TeacherClasses.css";





function TeacherClasses() {

  const navigate =

    useNavigate();



  const {

    language,

    setLanguage,

  } = useLanguage();





  /* ==================================

     STATE

  ================================== */



  const [

    teacher,

    setTeacher,

  ] = useState(null);



  const [

    classes,

    setClasses,

  ] = useState([]);



  const [

    loading,

    setLoading,

  ] = useState(true);



  const [

    saving,

    setSaving,

  ] = useState(false);



  const [

    showModal,

    setShowModal,

  ] = useState(false);



  const [

    className,

    setClassName,

  ] = useState("");



  const [

    grade,

    setGrade,

  ] = useState([]);



  const [

    learningTrack,

    setLearningTrack,

  ] = useState("");



  const [

    error,

    setError,

  ] = useState("");



  const [

    success,

    setSuccess,

  ] = useState("");





  /* ==================================

     TRANSLATION

  ================================== */



  const hebrewLabels = {

    "Loading your classes...": "הכיתות שלך נטענות...",

    "Back to Dashboard": "חזרה ללוח הבקרה",

    "My Classes": "הכיתות שלי",

    "Create and manage your learning classes.": "יצירה וניהול של כיתות הלמידה שלך.",

    "Create Class": "יצירת כיתה",

    "Class code copied!": "קוד הכיתה הועתק!",

    "Active": "פעילה",

    "Grade": "כיתה",

    "Students": "תלמידים",

    "Class Code": "קוד כיתה",

    "Copy code": "העתקת קוד",

    "Open Class": "פתיחת כיתה",

    "No classes yet": "עדיין אין כיתות",

    "Create your first class and start your TechMinds learning journey.": "צרו את הכיתה הראשונה שלכם והתחילו את מסע הלמידה שלכם ב-TechMinds.",

    "Create Your First Class": "יצירת הכיתה הראשונה",

    "Create New Class": "יצירת כיתה חדשה",

    "Choose the class details and learning program.": "בחרו את פרטי הכיתה ותוכנית הלמידה.",

    "Class Name": "שם הכיתה",

    "Example: Future Makers": "לדוגמה: יוצרי העתיד",

    "Grade level": "שכבת גיל",

    "Choose grade": "בחירת כיתה",

    Kindergarten: "גן ילדים",

    "Grade 1": "כיתה א׳",

    "Grade 2": "כיתה ב׳",

    "Grade 3": "כיתה ג׳",

    "Grade 4": "כיתה ד׳",

    "Grade 5": "כיתה ה׳",

    "Grade 6": "כיתה ו׳",

    "Grade 7": "כיתה ז׳",

    "Grade 8": "כיתה ח׳",

    "Grade 9": "כיתה ט׳",

    "Learning Program": "תוכנית למידה",

    "Cancel": "ביטול",

    "Creating Class...": "הכיתה נוצרת...",

    "Create Class ✨": "יצירת כיתה ✨",

    "Please complete all fields.": "יש למלא את כל השדות.",

    "Class name already exists.": "שם הכיתה כבר קיים.",

    "Could not create the class.": "לא ניתן ליצור את הכיתה.",

    "First Grade Companion": "מלווה לכיתה א׳",

    "Reading, writing, math and progress tracking.": "קריאה, כתיבה, חשבון ומעקב אחר התקדמות.",

    "Tech Explorer": "חוקר טכנולוגיה",

    "AI, coding, cyber and digital skills.": "בינה מלאכותית, תכנות, סייבר ומיומנויות דיגיטליות.",

    "Gifted Challenge": "אתגר למצטיינים",

    "Logic, puzzles and advanced problem solving.": "לוגיקה, חידות ופתרון בעיות מתקדם.",

    "AI Explorer": "חוקר בינה מלאכותית",

  };



  const text = (

    english,

    arabic,

    hebrew = hebrewLabels[english] || english

  ) =>

    language === "ar"

      ? arabic

      : language === "he"

        ? hebrew

        : english;





  /* ==================================

     LEARNING TRACKS

  ================================== */



  const learningTracks = [

    {

      id:

        "firstGradeCompanion",



      icon:

        "🎒",



      en:

        "First Grade Companion",



      ar:

        "رفيق الصف الأول",



      descriptionEn:

        "Reading, writing, math and progress tracking.",



      descriptionAr:

        "قراءة، كتابة، حساب ومتابعة تقدم الطالب.",

      he:
        "מלווה לכיתה א׳",

      descriptionHe:
        "קריאה, כתיבה, חשבון ומעקב אחר התקדמות.",

    },



    {

      id:

        "techExplorer",



      icon:

        "✨",



      en:

        "Tech Explorer",



      ar:

        "مستكشف التكنولوجيا",



      descriptionEn:

        "AI, coding, cyber and digital skills.",



      descriptionAr:

        "ذكاء اصطناعي، برمجة، سايبر ومهارات رقمية.",

      he:
        "חוקר טכנולוגיה",

      descriptionHe:
        "בינה מלאכותית, תכנות, סייבר ומיומנויות דיגיטליות.",

    },



    {

      id:

        "giftedChallenge",



      icon:

        "🧠",



      en:

        "Gifted Challenge",



      ar:

        "تحديات الموهوبين",



      descriptionEn:

        "Logic, puzzles and advanced problem solving.",



      descriptionAr:

        "منطق، ألغاز وحل مشكلات متقدمة.",

      he:
        "אתגרי מצטיינים",

      descriptionHe:
        "לוגיקה, חידות ופתרון בעיות מתקדם.",

    },



    {

      id:

        "aiExplorer",



      icon:

        "🤖",



      en:

        "AI Explorer",



      ar:

        "مستكشف الذكاء الاصطناعي",



      descriptionEn:

        "AI tools, prompting and creative projects.",



      descriptionAr:

        "أدوات الذكاء الاصطناعي، كتابة الأوامر ومشاريع إبداعية.",

      he:
        "חוקר בינה מלאכותית",

      descriptionHe:
        "כלי בינה מלאכותית, כתיבת הנחיות ופרויקטים יצירתיים.",

    },



    {

      id:

        "codeCreator",



      icon:

        "💻",



      en:

        "Code Creator",



      ar:

        "صانع البرمجيات",



      descriptionEn:

        "Blockly, Scratch, algorithms and Python.",



      descriptionAr:

        "Blockly وScratch والخوارزميات وPython.",

      he:
        "יוצר קוד",

      descriptionHe:
        "Blockly, Scratch, אלגוריתמים ו-Python.",

    },



    {

      id:

        "digitalCreator",



      icon:

        "🎨",



      en:

        "Digital Creator",



      ar:

        "المبدع الرقمي",



      descriptionEn:

        "Design, images, presentations and digital projects.",



      descriptionAr:

        "تصميم، صور، عروض ومشاريع رقمية.",

      he:
        "יוצר דיגיטלי",

      descriptionHe:
        "עיצוב, תמונות, מצגות ופרויקטים דיגיטליים.",

    },

  ];





  const gradeOptions = [

    { value: "Kindergarten", en: "Kindergarten", ar: "بستان / روضة", he: "גן ילדים" },

    ...Array.from({ length: 12 }, (_, index) => {

      const value = String(index + 1);



      return {

        value,

        en: `Grade ${value}`,

        ar: `الصف ${value}`,

        he: `כיתה ${value}`,

      };

    }),

  ];



  const toggleGrade = (value) => {

    setGrade((current) =>

      current.includes(value)

        ? current.filter((item) => item !== value)

        : [...current, value]

    );

  };





  /* ==================================

     LOAD TEACHER + CLASSES

  ================================== */



  const loadClasses =

    async () => {

      try {

        setLoading(true);



        const currentUser =

          auth.currentUser;





        if (!currentUser) {

          navigate(

            "/login"

          );



          return;

        }





        /*

          Load teacher profile

        */



        const teacherSnapshot =

          await getDoc(

            doc(

              db,

              "users",

              currentUser.uid

            )

          );





        if (

          !teacherSnapshot.exists()

        ) {

          navigate(

            "/login"

          );



          return;

        }





        const teacherData =

          teacherSnapshot.data();





        if (

          teacherData.role !==

          "teacher"

        ) {

          navigate(

            "/student"

          );



          return;

        }





        setTeacher(

          teacherData

        );





        /*

          Load teacher classes

        */



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





        const snapshot =

          await getDocs(

            classesQuery

          );





        const classList =

          snapshot.docs.map(

            (classDocument) => ({

              id:

                classDocument.id,



              ...classDocument.data(),

            })

          );





        setClasses(

          classList

        );



      } catch (err) {

        console.error(

          "Load classes error:",

          err

        );



        setError(

          text("Could not load your classes.", "تعذر تحميل الصفوف.", "לא ניתן לטעון את הכיתות שלך.")

        );



      } finally {

        setLoading(false);

      }

    };





  useEffect(() => {

    loadClasses();

  }, []);





  /* ==================================

     CLASS CODE

  ================================== */



  const generateClassCode =

    () => {

      const characters =

        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";



      let code = "";





      for (

        let i = 0;

        i < 5;

        i++

      ) {

        code +=

          characters[

            Math.floor(

              Math.random() *

                characters.length

            )

          ];

      }





      return `TM-${code}`;

    };





  const createUniqueClassCode =

    async () => {

      for (

        let attempt = 0;

        attempt < 10;

        attempt++

      ) {

        const newCode =

          generateClassCode();





        const normalizedCode =

          newCode

            .trim()

            .toLowerCase();





        const codeSnapshot =

          await getDoc(

            doc(

              db,

              "classCodes",

              normalizedCode

            )

          );





        if (

          !codeSnapshot.exists()

        ) {

          return newCode;

        }

      }





      throw new Error(

        "class-code-generation-failed"

      );

    };





  /* ==================================

     CREATE CLASS

  ================================== */



  const handleCreateClass =

    async (event) => {

      event.preventDefault();



      setError("");

      setSuccess("");





      if (

        !className.trim() ||

        grade.length === 0 ||

        !learningTrack

      ) {

        setError(

          text("Please complete all fields.", "يرجى تعبئة جميع الحقول.", "יש למלא את כל השדות.")

        );



        return;

      }





      try {

        setSaving(true);





        const currentUser =

          auth.currentUser;





        if (!currentUser) {

          navigate(

            "/login"

          );



          return;

        }





        /*

          Generate unique class code

        */



        const classCode =

          await createUniqueClassCode();





        /*

          Generate Firestore class ID

        */



        const classRef =

          doc(

            collection(

              db,

              "classes"

            )

          );





        /*

          Batch lets us create:

          1. class

          2. classCode index



          together.

        */



        const batch =

          writeBatch(db);





        /* ============================

           CLASS DOCUMENT

        ============================ */



        batch.set(

          classRef,

          {

            id:

              classRef.id,



            teacherId:

              currentUser.uid,



            teacherName:

              teacher?.name ||

              "",



            teacherEmail:

              teacher?.email ||

              currentUser.email ||

              "",



            name:

              className.trim(),



            grade:

              grade.join(", "),



            learningTrack,



            classCode,



            studentCount:

              0,



            status:

              "active",



            createdAt:

              serverTimestamp(),



            updatedAt:

              serverTimestamp(),

          }

        );





        /* ============================

           CLASS CODE INDEX

           Only store the four fields permitted by classCodes rules.

           Display details belong to the class document above.

        ============================ */



        batch.set(

          doc(

            db,

            "classCodes",

            classCode.toLowerCase()

          ),

          {

            classId:

              classRef.id,



            classCode,



            teacherId:

              currentUser.uid,



            createdAt:

              serverTimestamp(),

          }

        );





        await batch.commit();





        /*

          Reset form

        */



        setClassName("");



        setGrade([]);



        setLearningTrack("");



        setShowModal(false);





        /*

          Success

        */



        setSuccess(

          text(
              `Class created successfully 🎉 Class code: ${classCode}`,
              `تم إنشاء الصف بنجاح 🎉 رمز الصف: ${classCode}`,
              `הכיתה נוצרה בהצלחה 🎉 קוד הכיתה: ${classCode}`
            )

        );





        /*

          Reload cards

        */



        await loadClasses();



      } catch (err) {

        console.error(

          "Create class error:",

          err

        );





        if (

          err.message ===

          "class-code-generation-failed"

        ) {

          setError(

            text("Could not generate a class code. Please try again.", "تعذر إنشاء رمز للصف. حاول مرة أخرى.", "לא ניתן ליצור קוד לכיתה. נסו שוב.")

          );



        } else if (

          err.code ===

          "permission-denied"

        ) {

          setError(

            text("You do not have permission to create a class.", "لا يوجد لديك صلاحية لإنشاء صف.", "אין לך הרשאה ליצור כיתה.")

          );



        } else {

          setError(

            text("Could not create the class.", "تعذر إنشاء الصف.", "לא ניתן ליצור את הכיתה.")

          );

        }



      } finally {

        setSaving(false);

      }

    };





  /* ==================================

     GET TRACK

  ================================== */



  const getTrack =

    (trackId) => {

      return learningTracks.find(

        (track) =>

          track.id ===

          trackId

      );

    };





  /* ==================================

     COPY CLASS CODE

  ================================== */



  const copyClassCode =

    async (code) => {

      try {

        await navigator.clipboard.writeText(

          code

        );



        setSuccess(

          text("Class code copied!", "تم نسخ رمز الصف!", "קוד הכיתה הועתק!")

        );



      } catch (err) {

        console.error(

          "Copy error:",

          err

        );

      }

    };





  /* ==================================

     LOADING

  ================================== */



  if (loading) {

    return (

      <div className="classes-loading" dir={language === "en" ? "ltr" : "rtl"}>



        <div>

          ✨

        </div>



        <p>

          {text("Loading your classes...", "جارٍ تحميل الصفوف...", "הכיתות שלך נטענות...")}

        </p>



      </div>

    );

  }





  /* ==================================

     PAGE

  ================================== */



  return (

    <div className="teacher-classes-page" dir={language === "en" ? "ltr" : "rtl"}>



      {/* ==================================

          HEADER

      ================================== */}



      <header className="classes-topbar">



        <div>



          <button

            type="button"

            className="classes-back"

            onClick={() =>

              navigate(

                "/teacher"

              )

            }

          >

            {language === "ar"

              ? "↩ رجوع للرئيسية"

              : language === "he"

                ? "→ חזרה ללוח הבקרה"

                : "← Back to Dashboard"}

          </button>





          <h1>

            👥{" "}

            {text("My Classes", "صفوفي", "הכיתות שלי")}

          </h1>





          <p>

            {text("Create and manage your learning classes.", "أنشئ صفوفك التعليمية وأدرها من هنا.", "צרו ונהלו את כיתות הלמידה שלכם.")}

          </p>



        </div>





        <div className="classes-actions">



          {/* LANGUAGE */}



          <div className="classes-language">



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





          {/* CREATE */}



          <button

            type="button"

            className="new-class-button"

            onClick={() => {

              setError("");

              setSuccess("");



              setShowModal(

                true

              );

            }}

          >

            +{" "}

            {text("Create Class", "إنشاء صف", "יצירת כיתה")}

          </button>



        </div>



      </header>





      {/* ==================================

          SUCCESS / ERROR

      ================================== */}



      {success && (

        <div className="classes-success">

          ✅ {success}

        </div>

      )}





      {error && !showModal && (

        <div className="classes-error">

          ⚠️ {error}

        </div>

      )}





      {/* ==================================

          EMPTY STATE

      ================================== */}



      {classes.length === 0 ? (



        <section className="classes-empty">



          <div className="empty-school">

            🏫

          </div>





          <h2>

            {text("No classes yet", "لا توجد صفوف بعد", "עדיין אין כיתות")}

          </h2>





          <p>

            {text("Create your first class and start your TechMinds learning journey.", "أنشئ صفك الأول وابدأ رحلتك التعليمية في TechMinds.", "צרו את הכיתה הראשונה שלכם והתחילו את מסע הלמידה שלכם ב-TechMinds.")}

          </p>





          <button

            type="button"

            onClick={() => {

              setError("");

              setSuccess("");



              setShowModal(

                true

              );

            }}

          >

            +{" "}

            {text("Create Your First Class", "إنشاء الصف الأول", "יצירת הכיתה הראשונה")}

          </button>



        </section>



      ) : (



        /* ==================================

           CLASS CARDS

        ================================== */



        <section className="classes-grid">



          {classes.map(

            (classItem) => {

              const track =

                getTrack(

                  classItem.learningTrack

                );





              return (

                <article

                  className="class-card"

                  key={

                    classItem.id

                  }

                >



                  {/* TOP */}



                  <div className="class-card-top">



                    <div className="class-card-icon">

                      {track?.icon ||

                        "🏫"}

                    </div>





                    <div className="class-status">

                      ●{" "}

                      {text("Active", "فعّال", "פעילה")}

                    </div>



                  </div>





                  {/* NAME */}



                  <h2>

                    {classItem.name}

                  </h2>





                  {/* TRACK */}



                  <p className="class-track">

                    {track

                      ? `${track.icon} ${text(
                            track.en,
                            track.ar,
                            track.he
                          )}`

                      : classItem.learningTrack}

                  </p>





                  {/* DETAILS */}



                  <div className="class-details">



                    <div>



                      <span>

                        🎓{" "}

                        {text("Grade", "الصف", "כיתה")}

                      </span>



                      <strong>

                        {String(classItem.grade || "")

                          .split(",")

                          .map((item) => item.trim())

                          .filter(Boolean)

                          .join(language === "en" ? ", " : "، ")}

                      </strong>



                    </div>





                    <div>



                      <span>

                        👥{" "}

                        {text("Students", "الطلاب", "תלמידים")}

                      </span>



                      <strong>

                        {classItem.studentCount ||

                          0}

                      </strong>



                    </div>



                  </div>





                  {/* CLASS CODE */}



                  <div className="class-code-box">



                    <div>



                      <span>

                        {text("Class Code", "رمز الصف", "קוד כיתה")}

                      </span>



                      <strong>

                        {classItem.classCode}

                      </strong>



                    </div>





                    <button

                      type="button"

                      title={

                        text("Copy code", "نسخ الرمز", "העתקת קוד")

                      }

                      onClick={() =>

                        copyClassCode(

                          classItem.classCode

                        )

                      }

                    >

                      📋

                    </button>



                  </div>





                  {/* OPEN CLASS */}



                  <button

                    type="button"

                    className="open-class-button"

                    onClick={() =>

                      navigate(

                        `/teacher/classes/${classItem.id}`

                      )

                    }

                  >

                    {text("Open Class", "فتح الصف", "פתיחת כיתה")}



                    <span>

                      {language === "ar" || language === "he"

                        ? "←"

                        : "→"}

                    </span>



                  </button>



                </article>

              );

            }

          )}



        </section>

      )}





      {/* ==================================

          CREATE CLASS MODAL

      ================================== */}



      {showModal && (



        <div

          className="class-modal-overlay"

          onClick={() =>

            setShowModal(false)

          }

        >



          <div

            className="class-modal"
            dir={language === "en" ? "ltr" : "rtl"}

            onClick={(event) =>

              event.stopPropagation()

            }

          >



            {/* MODAL HEADER */}



            <div className="class-modal-header">



              <div>



                <div className="modal-icon">

                  🏫

                </div>





                <h2>

                  {text("Create New Class", "إنشاء صف جديد", "יצירת כיתה חדשה")}

                </h2>





                <p>

                  {text("Choose the class details and learning program.", "حدد معلومات الصف والمسار التعليمي.", "בחרו את פרטי הכיתה ואת תוכנית הלמידה.")}

                </p>



              </div>





              <button

                type="button"

                className="modal-close"

                onClick={() =>

                  setShowModal(

                    false

                  )

                }

              >

                ×

              </button>



            </div>





            {/* FORM */}



            <form

              className="class-form"

              onSubmit={

                handleCreateClass

              }

            >



              {/* CLASS NAME */}



              <label>

                {text("Class Name", "اسم الصف", "שם הכיתה")}

              </label>





              <input

                type="text"

                placeholder={

                  text("Example: Future Makers", "مثال: صنّاع المستقبل", "לדוגמה: יוצרי העתיד")

                }

                value={

                  className

                }

                onChange={(event) =>

                  setClassName(

                    event.target.value

                  )

                }

                required

              />





              {/* GRADE */}



              <label>

                {text(

                  "Grade",

                  "الصف الدراسي"

                )}

              </label>





              <div

                role="group"

                aria-label={text("Choose one or more grades", "اختر صفًا واحدًا أو أكثر", "בחרו כיתה אחת או יותר")}

                style={{

                  display: "grid",

                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",

                  gap: "8px",

                  marginTop: "6px",

                }}

              >

                {gradeOptions.map((option) => {

                  const selected =

                    grade.includes(option.value);



                  return (

                    <button

                      key={option.value}

                      type="button"

                      aria-pressed={selected}

                      onClick={() =>

                        toggleGrade(option.value)

                      }

                      style={{

                        minHeight: "42px",

                        padding: "9px 8px",

                        borderRadius: "11px",

                        border: selected

                          ? "2px solid #7c3aed"

                          : "1px solid #ddd6e8",

                        background: selected

                          ? "linear-gradient(135deg, #ede9fe, #dbeafe)"

                          : "#fff",

                        color: selected

                          ? "#5b21b6"

                          : "#4b5563",

                        fontWeight: selected

                          ? 850

                          : 700,

                        cursor: "pointer",

                        boxShadow: selected

                          ? "0 6px 16px rgba(124, 58, 237, 0.12)"

                          : "none",

                      }}

                    >

                      {text(

                        option.en,

                        option.ar,

                        option.he

                      )}



                      {selected && (

                        <span

                          aria-hidden="true"

                          style={{

                            marginInlineStart: "5px",

                          }}

                        >

                          ✓

                        </span>

                      )}

                    </button>

                  );

                })}

              </div>



              <small

                style={{

                  display: "block",

                  marginTop: "8px",

                  color: "#7c8598",

                  lineHeight: 1.6,

                }}

              >

                {grade.length > 0

                  ? text(

                      `Selected: ${grade.join(", ")}`,

                      `المختار: ${grade.join("، ")}`,

                      `נבחרו: ${grade.join(", ")}`

                    )

                  : text(

                      "You can choose more than one grade.",

                      "يمكنك اختيار أكثر من صف.",

                      "אפשר לבחור יותר מכיתה אחת."

                    )}

              </small>





              {/* LEARNING TRACK */}



              <label>

                {text("Learning Program", "المسار التعليمي", "תוכנית למידה")}

              </label>





              <div className="modal-tracks">



                {learningTracks.map(

                  (track) => (



                    <button

                      key={

                        track.id

                      }

                      type="button"

                      className={

                        learningTrack ===

                        track.id

                          ? "modal-track selected"

                          : "modal-track"

                      }

                      onClick={() =>

                        setLearningTrack(

                          track.id

                        )

                      }

                    >



                      <span>

                        {track.icon}

                      </span>





                      <div>



                        <strong>

                          {text(
                            track.en,
                            track.ar,
                            track.he
                          )}

                        </strong>





                        <small>

                          {text(
                            track.descriptionEn,
                            track.descriptionAr,
                            track.descriptionHe
                          )}

                        </small>



                      </div>



                    </button>



                  )

                )}



              </div>





              {/* ERROR */}



              {error && (

                <div className="modal-error">

                  ⚠️ {error}

                </div>

              )}





              {/* ACTIONS */}



              <div className="modal-buttons">



                <button

                  type="button"

                  className="cancel-class"

                  onClick={() => {

                    setShowModal(

                      false

                    );



                    setError("");

                  }}

                >

                  {text("Cancel", "إلغاء", "ביטול")}

                </button>





                <button

                  type="submit"

                  className="save-class"

                  disabled={

                    saving

                  }

                >

                  {saving

                    ? text("Creating Class...", "جارٍ إنشاء الصف...", "הכיתה נוצרת...")

                    : text("Create Class ✨", "إنشاء الصف ✨", "יצירת כיתה ✨")}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}



    </div>

  );

}





export default TeacherClasses;
