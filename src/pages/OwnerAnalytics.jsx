import {

  useEffect,

  useMemo,

  useState,

} from "react";



import {

  collection,

  onSnapshot,

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



import "./OwnerAnalytics.css";



import { hebrewText } from "../data/hebrewText";





function OwnerAnalytics() {

  const navigate =

    useNavigate();



  const {

    language,

    setLanguage,

  } = useLanguage();





  const [

    users,

    setUsers,

  ] = useState([]);



  const [

    programs,

    setPrograms,

  ] = useState([]);



  const [

    lessons,

    setLessons,

  ] = useState([]);



  const [

    purchases,

    setPurchases,

  ] = useState([]);



  const [

    loading,

    setLoading,

  ] = useState(true);



  const [

    error,

    setError,

  ] = useState("");





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
        value.he ||
        ""

      );

    };





  /* =====================================================

     LOAD USERS

  ===================================================== */



  useEffect(() => {

    if (!auth.currentUser) {

      navigate("/login");

      return undefined;

    }





    const unsubscribe =

      onSnapshot(

        collection(

          db,

          "users"

        ),



        (snapshot) => {

          setUsers(

            snapshot.docs.map(

              (userDoc) => ({

                id:

                  userDoc.id,



                ...userDoc.data(),

              })

            )

          );

        },



        (usersError) => {

          console.error(

            "Analytics users error:",

            usersError

          );



          setError(

            text("Could not load user analytics.", "تعذر تحميل إحصائيات المستخدمين.", "לא ניתן לטעון את נתוני המשתמשים.")

          );

        }

      );





    return () =>

      unsubscribe();



  }, [navigate]);





  /* =====================================================

     LOAD PROGRAMS

  ===================================================== */



  useEffect(() => {

    const unsubscribe =

      onSnapshot(

        collection(

          db,

          "programs"

        ),



        (snapshot) => {

          setPrograms(

            snapshot.docs.map(

              (programDoc) => ({

                id:

                  programDoc.id,



                ...programDoc.data(),

              })

            )

          );

        },



        (programError) => {

          console.error(

            "Analytics programs error:",

            programError

          );

        }

      );





    return () =>

      unsubscribe();



  }, []);





  /* =====================================================

     LOAD LESSONS

  ===================================================== */



  useEffect(() => {

    const unsubscribe =

      onSnapshot(

        collection(

          db,

          "lessons"

        ),



        (snapshot) => {

          const commercialLessons =

            snapshot.docs

              .map(

                (lessonDoc) => ({

                  id:

                    lessonDoc.id,



                  ...lessonDoc.data(),

                })

              )

              .filter(

                (lesson) =>

                  lesson.lessonType ===

                  "commercial"

              );





          setLessons(

            commercialLessons

          );

        },



        (lessonError) => {

          console.error(

            "Analytics lessons error:",

            lessonError

          );

        }

      );





    return () =>

      unsubscribe();



  }, []);





  /* =====================================================

     LOAD PURCHASES

  ===================================================== */



  useEffect(() => {

    const unsubscribe =

      onSnapshot(

        collection(

          db,

          "programPurchases"

        ),



        (snapshot) => {

          setPurchases(

            snapshot.docs.map(

              (purchaseDoc) => ({

                id:

                  purchaseDoc.id,



                ...purchaseDoc.data(),

              })

            )

          );



          setLoading(false);

        },



        (purchaseError) => {

          console.error(

            "Analytics purchases error:",

            purchaseError

          );



          /*

            Analytics still works even if

            no purchases exist yet.

          */



          setPurchases([]);

          setLoading(false);

        }

      );





    return () =>

      unsubscribe();



  }, []);





  /* =====================================================

     ANALYTICS

  ===================================================== */



  const analytics =

    useMemo(

      () => {

        const students =

          users.filter(

            (user) =>

              user.role ===

              "student"

          );





        const teachers =

          users.filter(

            (user) =>

              user.role ===

              "teacher"

          );





        const publishedPrograms =

          programs.filter(

            (program) =>

              program.status ===

              "published"

          );





        const draftPrograms =

          programs.filter(

            (program) =>

              program.status ===

              "draft"

          );





        const paidPurchases =

          purchases.filter(

            (purchase) =>

              (

                purchase.paymentStatus ||

                purchase.status

              ) === "paid"

          );





        const pendingPurchases =

          purchases.filter(

            (purchase) =>

              (

                purchase.paymentStatus ||

                purchase.status ||

                "pending"

              ) === "pending"

          );





        const refundedPurchases =

          purchases.filter(

            (purchase) =>

              (

                purchase.paymentStatus ||

                purchase.status

              ) === "refunded"

          );





        const failedPurchases =

          purchases.filter(

            (purchase) =>

              (

                purchase.paymentStatus ||

                purchase.status

              ) === "failed"

          );





        const revenue =

          paidPurchases.reduce(

            (

              total,

              purchase

            ) =>

              total +

              Number(

                purchase.amount ||

                purchase.totalAmount ||

                0

              ),



            0

          );





        const studentLicenses =

          paidPurchases.filter(

            (purchase) =>

              (

                purchase.licenseType ||

                purchase.accessType ||

                "student"

              ) === "student"

          ).length;





        const teacherLicenses =

          paidPurchases.filter(

            (purchase) =>

              (

                purchase.licenseType ||

                purchase.accessType

              ) === "teacher"

          ).length;





        const classLicenses =

          paidPurchases.filter(

            (purchase) =>

              (

                purchase.licenseType ||

                purchase.accessType

              ) === "class"

          ).length;





        const activeStudents =

          students.filter(

            (student) =>

              student.accountStatus !==

                "inactive" &&

              student.accountStatus !==

                "blocked"

          ).length;





        return {

          students:

            students.length,



          teachers:

            teachers.length,



          totalUsers:

            students.length +

            teachers.length,



          activeStudents,



          programs:

            programs.length,



          publishedPrograms:

            publishedPrograms.length,



          draftPrograms:

            draftPrograms.length,



          lessons:

            lessons.length,



          paidPurchases,



          pendingPurchases:

            pendingPurchases.length,



          refundedPurchases:

            refundedPurchases.length,



          failedPurchases:

            failedPurchases.length,



          revenue,



          studentLicenses,



          teacherLicenses,



          classLicenses,

        };

      },



      [

        users,

        programs,

        lessons,

        purchases,

      ]

    );





  /* =====================================================

     TOP PROGRAMS

  ===================================================== */



  const topPrograms =

    useMemo(

      () => {

        const salesMap = {};





        analytics.paidPurchases.forEach(

          (purchase) => {

            const id =

              purchase.programId;





            if (!id) {

              return;

            }





            if (!salesMap[id]) {

              salesMap[id] = {

                programId:

                  id,



                sales:

                  0,



                revenue:

                  0,

              };

            }





            salesMap[id].sales +=

              1;





            salesMap[id].revenue +=

              Number(

                purchase.amount ||

                purchase.totalAmount ||

                0

              );

          }

        );





        return Object.values(

          salesMap

        )

          .map(

            (item) => {

              const program =

                programs.find(

                  (programItem) =>

                    programItem.id ===

                    item.programId

                );





              return {

                ...item,



                title:

                  program?.title,



                icon:

                  program?.icon ||

                  "📦",

              };

            }

          )

          .sort(

            (

              first,

              second

            ) =>

              second.sales -

              first.sales

          )

          .slice(

            0,

            5

          );

      },



      [

        analytics.paidPurchases,

        programs,

      ]

    );





  /* =====================================================

     BAR HELPERS

  ===================================================== */



  const maxUserCount =

    Math.max(

      analytics.students,

      analytics.teachers,

      1

    );





  const maxLicenseCount =

    Math.max(

      analytics.studentLicenses,

      analytics.teacherLicenses,

      analytics.classLicenses,

      1

    );





  const percentage =

    (

      value,

      maximum

    ) =>

      Math.max(

        3,

        Math.round(

          (

            value /

            maximum

          ) *

            100

        )

      );





  /* =====================================================

     LOADING

  ===================================================== */



  if (loading) {

    return (

      <div className="owner-analytics-loading" dir={language === "en" ? "ltr" : "rtl"}>



        <div>

          📊

        </div>





        <p>

          {text("Loading analytics...", "جارٍ تحميل الإحصائيات...", "הנתונים נטענים...")}

        </p>



      </div>

    );

  }





  /* =====================================================

     PAGE

  ===================================================== */



  return (

    <div className="owner-analytics-page" dir={language === "en" ? "ltr" : "rtl"}>



      {/* =================================================

          HEADER

      ================================================= */}



      <header className="owner-analytics-header">



        <div>



          <button

            type="button"

            className="owner-analytics-back"

            onClick={() =>

              navigate(

                "/owner"

              )

            }

          >

            {text(
              "← Back to Dashboard",
              "↩ العودة للرئيسية",
              "→ חזרה ללוח הבקרה"
            )}

          </button>





          <small>

            {text("TechMinds INSIGHTS", "رؤى TechMinds", "תובנות TechMinds")}

          </small>





          <h1>

            📊{" "}

            {text("Analytics", "الإحصائيات", "אנליטיקה")}

          </h1>





          <p>

            {text("Understand your users, content and commercial performance.", "تابعي أداء المستخدمين والمحتوى والمبيعات في TechMinds.", "עקבו אחר המשתמשים, התוכן והביצועים המסחריים ב-TechMinds.")}

          </p>



        </div>





        <div className="owner-analytics-header-actions">



          <div className="owner-analytics-language">



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





          <div className="owner-analytics-live">



            <i>

            </i>



            {text("Live Data", "بيانات مباشرة", "נתונים חיים")}



          </div>



        </div>



      </header>





      {error && (

        <div className="owner-analytics-error">

          ⚠️ {error}

        </div>

      )}





      {/* =================================================

          PRIMARY STATS

      ===================================================== */}



      <section className="owner-analytics-primary">



        <div className="owner-analytics-main-stat revenue">



          <span>

            💰

          </span>





          <div>



            <small>

              {text("TOTAL REVENUE", "إجمالي الإيرادات", "סה״כ הכנסות")}

            </small>





            <strong>

              ₪

              {analytics.revenue.toLocaleString(
                  language === "ar"
                    ? "ar"
                    : language === "he"
                      ? "he-IL"
                      : "en"
                )}

            </strong>





            <p>

              {text("Verified paid transactions", "عمليات الدفع المؤكدة فقط", "עסקאות ששולמו ואומתו")}

            </p>



          </div>



        </div>





        <div className="owner-analytics-main-stat">



          <span>

            👥

          </span>





          <div>



            <small>

              {text("USERS", "المستخدمون", "משתמשים")}

            </small>





            <strong>

              {analytics.totalUsers}

            </strong>





            <p>

              {text("Students + teachers", "طلاب + معلمون", "תלמידים + מורים")}

            </p>



          </div>



        </div>





        <div className="owner-analytics-main-stat">



          <span>

            📦

          </span>





          <div>



            <small>

              {text("PROGRAMS", "البرامج", "תוכניות")}

            </small>





            <strong>

              {analytics.programs}

            </strong>





            <p>

              {analytics.publishedPrograms}{" "}

              {text("published", "منشور", "פורסמו")}

            </p>



          </div>



        </div>





        <div className="owner-analytics-main-stat">



          <span>

            💳

          </span>





          <div>



            <small>

              {text("PAID SALES", "المبيعات المدفوعة", "מכירות בתשלום")}

            </small>





            <strong>

              {analytics.paidPurchases.length}

            </strong>





            <p>

              {text("Confirmed purchases", "عمليات شراء مؤكدة", "רכישות מאושרות")}

            </p>



          </div>



        </div>



      </section>





      {/* =================================================

          SECONDARY STATS

      ===================================================== */}



      <section className="owner-analytics-secondary">



        <div>

          <span>

            🎓

          </span>



          <small>

            {text("Students", "الطلاب", "תלמידים")}

          </small>



          <strong>

            {analytics.students}

          </strong>



          <p>

            {analytics.activeStudents}{" "}

            {text("active", "فعّال", "פעילים")}

          </p>

        </div>





        <div>

          <span>

            👩‍🏫

          </span>



          <small>

            {text("Teachers", "المعلمين", "מורים")}

          </small>



          <strong>

            {analytics.teachers}

          </strong>



          <p>

            {text("Registered accounts", "حسابات مسجلة", "חשבונות רשומים")}

          </p>

        </div>





        <div>

          <span>

            📚

          </span>



          <small>

            {text("Commercial Lessons", "الدروس التجارية", "שיעורים מסחריים")}

          </small>



          <strong>

            {analytics.lessons}

          </strong>



          <p>

            {text("Program content", "محتوى البرامج", "תוכן התוכניות")}

          </p>

        </div>





        <div>

          <span>

            📝

          </span>



          <small>

            {text("Draft Programs", "البرامج المسودة", "טיוטות תוכניות")}

          </small>



          <strong>

            {analytics.draftPrograms}

          </strong>



          <p>

            {text("Not published yet", "غير منشورة بعد", "טרם פורסמו")}

          </p>

        </div>



      </section>





      {/* =================================================

          ANALYTICS GRID

      ===================================================== */}



      <section className="owner-analytics-grid">



        {/* USERS */}



        <div className="owner-analytics-card">



          <div className="owner-analytics-card-header">



            <div>



              <small>

                {text("COMMUNITY", "المجتمع", "קהילה")}

              </small>





              <h2>

                👥{" "}

                {text("User Distribution", "توزيع المستخدمين", "התפלגות משתמשים")}

              </h2>





              <p>

                {text("Students and teachers on the platform.", "الطلاب والمعلمون المسجلون في المنصة.", "תלמידים ומורים הרשומים בפלטפורמה.")}

              </p>



            </div>



          </div>





          <div className="owner-analytics-bars">



            <div>



              <div className="analytics-bar-heading">



                <span>

                  🎓{" "}

                  {text("Students", "الطلاب", "תלמידים")}

                </span>



                <strong>

                  {analytics.students}

                </strong>



              </div>





              <div className="analytics-bar-track">



                <div

                  className="analytics-bar-fill students"

                  style={{

                    width:

                      `${percentage(

                        analytics.students,

                        maxUserCount

                      )}%`,

                  }}

                >

                </div>



              </div>



            </div>





            <div>



              <div className="analytics-bar-heading">



                <span>

                  👩‍🏫{" "}

                  {text("Teachers", "المعلمين", "מורים")}

                </span>



                <strong>

                  {analytics.teachers}

                </strong>



              </div>





              <div className="analytics-bar-track">



                <div

                  className="analytics-bar-fill teachers"

                  style={{

                    width:

                      `${percentage(

                        analytics.teachers,

                        maxUserCount

                      )}%`,

                  }}

                >

                </div>



              </div>



            </div>



          </div>



        </div>





        {/* LICENSE TYPES */}



        <div className="owner-analytics-card">



          <div className="owner-analytics-card-header">



            <div>



              <small>

                SALES

              </small>





              <h2>

                💳{" "}

                {text("Purchase Types", "أنواع المشتريات", "סוגי רכישות")}

              </h2>





              <p>

                {text("Paid program licenses by type.", "توزيع تراخيص البرامج المدفوعة.", "חלוקת רישיונות בתשלום לפי סוג.")}

              </p>



            </div>



          </div>





          {analytics.paidPurchases.length ===

          0 ? (



            <div className="owner-analytics-mini-empty">



              <span>

                💳

              </span>



              <p>

                {text("Purchase analytics will appear after the first paid transaction.", "ستظهر إحصائيات الشراء بعد أول عملية دفع حقيقية.", "נתוני רכישות יופיעו לאחר העסקה הראשונה בתשלום.")}

              </p>



            </div>



          ) : (



            <div className="owner-analytics-bars">



              <div>



                <div className="analytics-bar-heading">



                  <span>

                    🎓{" "}

                    {text("Student", "طالب", "תלמיד")}

                  </span>



                  <strong>

                    {analytics.studentLicenses}

                  </strong>



                </div>





                <div className="analytics-bar-track">



                  <div

                    className="analytics-bar-fill student-license"

                    style={{

                      width:

                        `${percentage(

                          analytics.studentLicenses,

                          maxLicenseCount

                        )}%`,

                    }}

                  >

                  </div>



                </div>



              </div>





              <div>



                <div className="analytics-bar-heading">



                  <span>

                    👩‍🏫{" "}

                    {text("Teacher", "معلّم", "מורה")}

                  </span>



                  <strong>

                    {analytics.teacherLicenses}

                  </strong>



                </div>





                <div className="analytics-bar-track">



                  <div

                    className="analytics-bar-fill teacher-license"

                    style={{

                      width:

                        `${percentage(

                          analytics.teacherLicenses,

                          maxLicenseCount

                        )}%`,

                    }}

                  >

                  </div>



                </div>



              </div>





              <div>



                <div className="analytics-bar-heading">



                  <span>

                    👥{" "}

                    {text("Class", "صف", "כיתה")}

                  </span>



                  <strong>

                    {analytics.classLicenses}

                  </strong>



                </div>





                <div className="analytics-bar-track">



                  <div

                    className="analytics-bar-fill class-license"

                    style={{

                      width:

                        `${percentage(

                          analytics.classLicenses,

                          maxLicenseCount

                        )}%`,

                    }}

                  >

                  </div>



                </div>



              </div>



            </div>



          )}



        </div>





        {/* {text("CONTENT", "المحتوى", "תוכן")} */}



        <div className="owner-analytics-card">



          <div className="owner-analytics-card-header">



            <div>



              <small>

                CONTENT

              </small>





              <h2>

                📦{" "}

                {text("Program Status", "حالة البرامج", "סטטוס תוכניות")}

              </h2>





              <p>

                {text("Published and draft commercial programs.", "البرامج التجارية المنشورة والمسودات.", "תוכניות מסחריות שפורסמו וטיוטות.")}

              </p>



            </div>



          </div>





          <div className="owner-program-status-analytics">



            <div className="published">



              <span>

                🌍

              </span>



              <div>



                <small>

                  {text("Published", "منشور", "פורסם")}

                </small>



                <strong>

                  {analytics.publishedPrograms}

                </strong>



              </div>



            </div>





            <div className="draft">



              <span>

                📝

              </span>



              <div>



                <small>

                  {text("Draft", "مسودة", "טיוטה")}

                </small>



                <strong>

                  {analytics.draftPrograms}

                </strong>



              </div>



            </div>





            <div>



              <span>

                📚

              </span>



              <div>



                <small>

                  {text("Lessons", "الدروس", "שיעורים")}

                </small>



                <strong>

                  {analytics.lessons}

                </strong>



              </div>



            </div>



          </div>



        </div>





        {/* PAYMENT STATUS */}



        <div className="owner-analytics-card">



          <div className="owner-analytics-card-header">



            <div>



              <small>

                {text("PAYMENTS", "المدفوعات", "תשלומים")}

              </small>





              <h2>

                💰{" "}

                {text("Payment Status", "حالة المدفوعات", "סטטוס תשלומים")}

              </h2>





              <p>

                {text("Current payment activity.", "ملخص حالات عمليات الدفع.", "מצב פעילות התשלומים הנוכחי.")}

              </p>



            </div>



          </div>





          <div className="owner-payment-status-grid">



            <div className="paid">

              <span>

                ✅

              </span>



              <strong>

                {analytics.paidPurchases.length}

              </strong>



              <small>

                {text("Paid", "مدفوع", "שולם")}

              </small>

            </div>





            <div className="pending">

              <span>

                ⏳

              </span>



              <strong>

                {analytics.pendingPurchases}

              </strong>



              <small>

                {text("Pending", "انتظار", "ממתין")}

              </small>

            </div>





            <div className="refunded">

              <span>

                ↩️

              </span>



              <strong>

                {analytics.refundedPurchases}

              </strong>



              <small>

                {text("Refunded", "مُسترد", "הוחזר")}

              </small>

            </div>





            <div className="failed">

              <span>

                ❌

              </span>



              <strong>

                {analytics.failedPurchases}

              </strong>



              <small>

                {text("Failed", "فشل", "נכשל")}

              </small>

            </div>



          </div>



        </div>



      </section>





      {/* =================================================

          TOP PROGRAMS

      ===================================================== */}



      <section className="owner-top-programs">



        <div className="owner-analytics-card-header">



          <div>



            <small>

              {text("PERFORMANCE", "الأداء", "ביצועים")}

            </small>





            <h2>

              🏆{" "}

              {text("Top Programs", "أفضل البرامج", "התוכניות המובילות")}

            </h2>





            <p>

              {text("Programs ranked by confirmed paid sales.", "ترتيب البرامج حسب عمليات الشراء المدفوعة المؤكدة.", "דירוג תוכניות לפי מכירות מאושרות בתשלום.")}

            </p>



          </div>





          <button

            type="button"

            onClick={() =>

              navigate(

                "/owner/programs"

              )

            }

          >

            {text("Manage Programs", "إدارة البرامج", "ניהול תוכניות")}

          </button>



        </div>





        {topPrograms.length ===

        0 ? (



          <div className="owner-top-programs-empty">



            <span>

              🏆

            </span>





            <h3>

              {text("No sales data yet", "لا توجد بيانات مبيعات بعد", "עדיין אין נתוני מכירות")}

            </h3>





            <p>

              {text("The best-selling programs will appear here after customers complete real purchases.", "ستظهر البرامج الأكثر مبيعًا هنا بعد إتمام العملاء عمليات شراء حقيقية.", "התוכניות הנמכרות ביותר יופיעו כאן לאחר רכישות אמיתיות של לקוחות.")}

            </p>



          </div>



        ) : (



          <div className="owner-top-program-list">



            {topPrograms.map(

              (

                program,

                index

              ) => (



                <div

                  key={

                    program.programId

                  }

                  className="owner-top-program-row"

                >



                  <div className="owner-top-program-rank">

                    {index + 1}

                  </div>





                  <div className="owner-top-program-icon">

                    {program.icon}

                  </div>





                  <div className="owner-top-program-name">



                    <strong>

                      {localized(

                        program.title

                      ) ||

                        program.programId}

                    </strong>



                    <small>

                      {program.sales}{" "}

                      {text("sales", "مبيعات", "מכירות")}

                    </small>



                  </div>





                  <div className="owner-top-program-revenue">



                    <small>

                      {text("Revenue", "الإيرادات", "הכנסות")}

                    </small>



                    <strong>

                      ₪

                      {program.revenue.toLocaleString(
                        language === "ar"
                          ? "ar"
                          : language === "he"
                            ? "he-IL"
                            : "en"
                      )}

                    </strong>



                  </div>



                </div>



              )

            )}



          </div>



        )}



      </section>



    </div>

  );

}





export default OwnerAnalytics;