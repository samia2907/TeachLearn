import { manualAccessMode } from '../access/programFlow.mjs';
import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
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

import "./Plans.css";

import { hebrewText } from "../data/hebrewText";
import { whatsappAccessLink } from "../access/accessText";

function Plans() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();

  /* ==============================
     STATE
  ============================== */

  const [
    userData,
    setUserData,
  ] = useState(null);

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
    selectedTrack,
    setSelectedTrack,
  ] = useState(null);

  const [
    billingCycle,
    setBillingCycle,
  ] = useState("monthly");

  const [
    publicSettings,
    setPublicSettings,
  ] = useState({});

  /* ==============================
     TRANSLATION
  ============================== */

  const hebrewLabels = {
    "User profile was not found.": "פרופיל המשתמש לא נמצא.",
    "Could not load your account.": "לא ניתן לטעון את החשבון שלך.",
    "Your school-plan request was saved. We will add the school contact form next.": "הבקשה שלך לתוכנית בית ספר נשמרה. נוסיף את טופס הקשר לבית הספר בשלב הבא.",
    "Could not save the school request.": "לא ניתן לשמור את הבקשה לבית הספר.",
    "Loading your plans...": "התוכניות שלך נטענות...",
    "Choose Your Learning Journey": "בחרו את מסע הלמידה שלכם",
    "Choose Your Teacher Plan": "בחרו את תוכנית המורה שלכם",
    "Choose what you want to learn, then select the plan that fits you.": "בחרו מה תרצו ללמוד ולאחר מכן בחרו את התוכנית המתאימה לכם.",
    "Choose the tools and student capacity that fit your teaching.": "בחרו את הכלים ואת מספר התלמידים המתאימים להוראה שלכם.",
    "Choose a Learning Program": "בחירת תוכנית למידה",
    "You can change or add programs later.": "ניתן לשנות או להוסיף תוכניות בהמשך.",
    "Choose Your Plan": "בחירת התוכנית שלכם",
    "You can upgrade or change your plan later.": "ניתן לשדרג או לשנות את התוכנית בהמשך.",
    Monthly: "חודשי",
    Yearly: "שנתי",
    " Save": " חיסכון",
    Free: "חינם",
    "One Program": "תוכנית אחת",
    "All Programs": "כל התוכניות",
    "Teacher Starter": "תוכנית התחלה למורה",
    "Teacher Pro": "Teacher Pro",
    "School Plan": "תוכנית בית ספר",
    "Choose Plan": "בחירת תוכנית",
    "Continue Free": "המשך בחינם",
    "Continue to Payment": "המשך לתשלום",
    "Request School Plan": "בקשת תוכנית בית ספר",
    "Current Plan": "התוכנית הנוכחית",
    "Level assessment": "הערכת רמה",
    "Starter activities": "פעילויות התחלה",
    "Limited challenges": "אתגרים מוגבלים",
    "Basic student profile": "פרופיל תלמיד בסיסי",
    "Full access to one learning program.": "גישה מלאה לתוכנית למידה אחת.",
    "One full learning track": "מסלול למידה מלא אחד",
    "All track challenges": "כל אתגרי המסלול",
    "Progress tracking": "מעקב אחר התקדמות",
    "Reading, writing, math and weekly progress tracking.": "קריאה, כתיבה, חשבון ומעקב שבועי אחר ההתקדמות.",
    "Kindergarten & Grade 1": "גן ילדים וכיתה א׳",
    "Tech Explorer": "חוקר טכנולוגיה",
    "AI, coding, cyber, computers and digital creativity.": "בינה מלאכותית, תכנות, סייבר, מחשבים ויצירתיות דיגיטלית.",
    "Gifted Challenge": "אתגר למצטיינים",
    "AI Explorer": "חוקר בינה מלאכותית",
    "Code Creator": "יוצר קוד",
    "Digital Creator": "יוצר דיגיטלי",
  };

  const text = (
    english,
    arabic,
    hebrew = hebrewLabels[english] || english
  ) => {
    return language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
        : english;
  };

  /* ==============================
     LOAD USER
  ============================== */

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const user =
            auth.currentUser;

          if (!user) {
            navigate("/login");
            return;
          }

          const userRef =
            doc(
              db,
              "users",
              user.uid
            );

          const snapshot =
            await getDoc(
              userRef
            );

          if (
            !snapshot.exists()
          ) {
            setError(
              text(
                "User profile was not found.",
                "لم يتم العثور على ملف المستخدم."
              )
            );

            return;
          }

          const data =
            snapshot.data();

          setUserData(data);

          if (
            data.selectedTrack
          ) {
            setSelectedTrack(
              data.selectedTrack
            );
          }
        } catch (err) {
          console.error(
            "Plans load error:",
            err
          );

          setError(
            text(
              "Could not load your account.",
              "تعذر تحميل بيانات الحساب."
            )
          );
        } finally {
          setLoading(false);
        }
      };

    loadUser();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getDoc(doc(db, "platformSettings", "public"))
      .then((snapshot) => {
        setPublicSettings(snapshot.exists() ? snapshot.data() : {});
      })
      .catch(() => setPublicSettings({}));
  }, []);

    /* ==============================
     STUDENT LEARNING TRACKS
  ============================== */

  const studentTracks = [
    {
      id:
        "firstGradeCompanion",

      icon:
        "🎒",

      className:
        "track-first-grade",

      titleEn:
        "First Grade Companion",

      titleAr:
        "رفيق الصف الأول",

      descEn:
        "Reading, writing, math and weekly progress tracking.",

      descAr:
        "قراءة، كتابة، حساب ومتابعة أسبوعية لتقدم الطالب.",

      agesEn:
        "Kindergarten & Grade 1",

      agesAr:
        "البستان والصف الأول",
    },

    {
      id:
        "techExplorer",

      icon:
        "🚀",

      className:
        "track-tech",

      titleEn:
        "Tech Explorer",

      titleAr:
        "مستكشف التكنولوجيا",

      descEn:
        "AI, coding, cyber, computers and digital creativity.",

      descAr:
        "ذكاء اصطناعي، برمجة، سايبر، حاسوب وإبداع رقمي.",

      agesEn:
        "Grades 4–6",

      agesAr:
        "الصفوف 4–6",
    },

    {
      id:
        "giftedChallenge",

      icon:
        "🧠",

      className:
        "track-gifted",

      titleEn:
        "Gifted Challenge",

      titleAr:
        "تحديات الموهوبين",

      descEn:
        "Logic, puzzles, problem solving and advanced projects.",

      descAr:
        "منطق، ألغاز، حل مشكلات ومشاريع متقدمة.",

      agesEn:
        "Gifted & advanced learners",

      agesAr:
        "للموهوبين والمتفوقين",
    },

    {
      id:
        "aiExplorer",

      icon:
        "🤖",

      className:
        "track-ai",

      titleEn:
        "AI Explorer",

      titleAr:
        "مستكشف الذكاء الاصطناعي",

      descEn:
        "AI tools, prompting, image creation and creative projects.",

      descAr:
        "أدوات الذكاء الاصطناعي، كتابة الأوامر، إنشاء الصور ومشاريع إبداعية.",

      agesEn:
        "Grades 4+",

      agesAr:
        "من الصف الرابع",
    },

    {
      id:
        "codeCreator",

      icon:
        "💻",

      className:
        "track-code",

      titleEn:
        "Code Creator",

      titleAr:
        "صانع البرمجيات",

      descEn:
        "Blockly, Scratch, algorithms and Python.",

      descAr:
        "Blockly وScratch والخوارزميات وPython.",

      agesEn:
        "Grades 4+",

      agesAr:
        "من الصف الرابع",
    },

    {
      id:
        "digitalCreator",

      icon:
        "🎨",

      className:
        "track-creative",

      titleEn:
        "Digital Creator",

      titleAr:
        "المبدع الرقمي",

      descEn:
        "Design, images, presentations and digital projects.",

      descAr:
        "تصميم، صور، عروض ومشاريع رقمية.",

      agesEn:
        "Grades 3+",

      agesAr:
        "من الصف الثالث",
    },
  ];

  /* ==============================
     STUDENT PLANS
  ============================== */

  const studentPlans = [
    {
      id: "free",

      icon: "🌱",

      nameEn:
        "Free",

      nameAr:
        "مجاني",

      monthlyPrice:
        0,

      yearlyPrice:
        0,

      descriptionEn:
        "Explore TechMinds before choosing a complete program.",

      descriptionAr:
        "جرّب TechMinds قبل الاشتراك بمسار كامل.",

      featuresEn: [
        "Level assessment",
        "Starter activities",
        "Limited challenges",
        "Basic student profile",
      ],

      featuresAr: [
        "تقييم مستوى",
        "أنشطة تجريبية",
        "تحديات محدودة",
        "ملف طالب أساسي",
      ],
    },

    {
      id:
        "oneProgram",

      icon:
        "⭐",

      nameEn:
        "One Program",

      nameAr:
        "مسار واحد",

      monthlyPrice:
        29,

      yearlyPrice:
        290,

      descriptionEn:
        "Full access to one learning program.",

      descriptionAr:
        "وصول كامل لمسار تعليمي واحد.",

      featuresEn: [
        "One full learning track",
        "All track challenges",
        "XP & badges",
        "Projects",
        "Progress tracking",
      ],

      featuresAr: [
        "مسار تعليمي كامل",
        "جميع تحديات المسار",
        "XP وشارات",
        "مشاريع",
        "متابعة التقدم",
      ],
    },

    {
      id:
        "allAccess",

      icon:
        "🚀",

      nameEn:
        "All Access",

      nameAr:
        "الوصول الكامل",

      monthlyPrice:
        49,

      yearlyPrice:
        490,

      recommended:
        true,

      descriptionEn:
        "Unlock all learning programs.",

      descriptionAr:
        "افتح جميع المسارات التعليمية.",

      featuresEn: [
        "All learning tracks",
        "All challenges",
        "AI activities",
        "Advanced projects",
        "XP, levels & badges",
        "Student portfolio",
      ],

      featuresAr: [
        "جميع المسارات",
        "جميع التحديات",
        "أنشطة الذكاء الاصطناعي",
        "مشاريع متقدمة",
        "XP ومستويات وشارات",
        "ملف إنجاز للطالب",
      ],
    },

    {
      id:
        "family",

      icon:
        "👨‍👩‍👧",

      nameEn:
        "Family",

      nameAr:
        "العائلة",

      monthlyPrice:
        69,

      yearlyPrice:
        690,

      descriptionEn:
        "Learning accounts for more than one child.",

      descriptionAr:
        "حسابات تعليمية لأكثر من طفل في العائلة.",

      featuresEn: [
        "Multiple children",
        "Individual progress",
        "Different programs per child",
        "Parent progress overview",
        "All Access programs",
      ],

      featuresAr: [
        "أكثر من طفل",
        "تقدم منفصل لكل طفل",
        "مسار مختلف لكل طفل",
        "متابعة للأهل",
        "جميع المسارات التعليمية",
      ],
    },
  ];

  /* ==============================
     TEACHER PLANS
  ============================== */

  const teacherPlans = [
    {
      id:
        "teacherBasic",

      icon:
        "👩‍🏫",

      nameEn:
        "Teacher Basic",

      nameAr:
        "المعلّم الأساسي",

      monthlyPrice:
        39,

      yearlyPrice:
        390,

      descriptionEn:
        "Perfect for small groups and private teaching.",

      descriptionAr:
        "مناسب للمجموعات الصغيرة والتعليم الخاص.",

      featuresEn: [
        "Up to 15 students",
        "Create classes",
        "Assign activities",
        "Attendance",
        "Student progress",
      ],

      featuresAr: [
        "حتى 15 طالبًا",
        "إنشاء صفوف",
        "إرسال فعاليات",
        "الحضور",
        "متابعة تقدم الطلاب",
      ],
    },

    {
      id:
        "teacherPro",

      icon:
        "⭐",

      nameEn:
        "Teacher Pro",

      nameAr:
        "المعلّم الاحترافي",

      monthlyPrice:
        79,

      yearlyPrice:
        790,

      recommended:
        true,

      descriptionEn:
        "Everything a teacher needs to manage learning.",

      descriptionAr:
        "كل ما يحتاجه المعلّم لإدارة التعلم.",

      featuresEn: [
        "Up to 50 students",
        "Multiple classes",
        "Attendance",
        "Challenges",
        "Messages",
        "Reports",
        "Student projects",
        "Progress analytics",
      ],

      featuresAr: [
        "حتى 50 طالبًا",
        "عدة صفوف",
        "الحضور",
        "التحديات",
        "الرسائل",
        "التقارير",
        "مشاريع الطلاب",
        "تحليل التقدم",
      ],
    },

    {
      id:
        "school",

      icon:
        "🏫",

      nameEn:
        "School",

      nameAr:
        "المدرسة",

      monthlyPrice:
        null,

      yearlyPrice:
        null,

      descriptionEn:
        "For schools, gifted centers and educational organizations.",

      descriptionAr:
        "للمدارس، مراكز الموهوبين والمؤسسات التعليمية.",

      featuresEn: [
        "Multiple teachers",
        "Multiple classes",
        "School administration",
        "Central reports",
        "Custom student limits",
        "Organization dashboard",
      ],

      featuresAr: [
        "عدة معلمين",
        "عدة صفوف",
        "إدارة المدرسة",
        "تقارير مركزية",
        "عدد طلاب مخصص",
        "لوحة إدارة للمؤسسة",
      ],
    },
  ];

  /* ==============================
     ACTIVATE FREE
  ============================== */

  const activateFreePlan =
    async () => {
      try {
        setSaving(true);
        setError("");

        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }

        if (
          userData.role ===
            "student" &&
          !selectedTrack
        ) {
          setError(
            text(
              "Please choose a learning program first.",
              "اختر المسار التعليمي أولًا."
            )
          );

          return;
        }

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            plan:
              "free",

            subscriptionStatus:
              "free",

            paymentStatus:
              "not_required",

            billingCycle:
              null,

            selectedTrack:
              userData.role ===
              "student"
                ? selectedTrack
                : null,

            pendingPlan:
              null,

            pendingBillingCycle:
              null,

            pendingTrack:
              null,

            planUpdatedAt:
              serverTimestamp(),
          }
        );

        if (
          userData.role ===
          "teacher"
        ) {
          navigate(
            "/teacher"
          );
        } else {
          navigate(
            "/student"
          );
        }
      } catch (err) {
        console.error(
          "Free plan error:",
          err
        );

        setError(
          text(
            "Could not activate the free plan.",
            "تعذر تفعيل الخطة المجانية."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==============================
     CHOOSE PAID PLAN
  ============================== */

  const choosePaidPlan =
    async (plan) => {
      try {
        setSaving(true);
        setError("");

        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }

        /*
          One Program requires
          a learning track.
        */

        if (
          userData.role ===
            "student" &&
          plan.id ===
            "oneProgram" &&
          !selectedTrack
        ) {
          setError(
            text(
              "Choose the learning program you want first.",
              "اختر أولًا المسار التعليمي الذي تريد الاشتراك به."
            )
          );

          return;
        }

        /*
          IMPORTANT:
          Do not make the subscription
          active here.

          We only store the plan selected
          for checkout.
        */

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            pendingPlan:
              plan.id,

            pendingBillingCycle:
              billingCycle,

            pendingTrack:
              userData.role ===
              "student"
                ? selectedTrack
                : null,

            paymentStatus:
              "not_started",

            planSelectionUpdatedAt:
              serverTimestamp(),
          }
        );

        /*
          Go to checkout.
        */

        navigate(
          "/checkout"
        );
      } catch (err) {
        console.error(
          "Plan selection error:",
          err
        );

        setError(
          text(
            "Could not save your plan.",
            "تعذر حفظ اختيار الخطة."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==============================
     SCHOOL PLAN
  ============================== */

  const chooseSchoolPlan =
    async (plan) => {
      try {
        setSaving(true);
        setError("");

        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            pendingPlan:
              plan.id,

            paymentStatus:
              "school_request",

            planSelectionUpdatedAt:
              serverTimestamp(),
          }
        );

        setError(
          text(
            "Your school-plan request was saved. We will add the school contact form next.",
            "تم حفظ طلب خطة المدرسة. سنضيف نموذج التواصل مع المدرسة في الخطوة القادمة."
          )
        );
      } catch (err) {
        console.error(
          "School plan error:",
          err
        );

        setError(
          text(
            "Could not save the school request.",
            "تعذر حفظ طلب خطة المدرسة."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==============================
     LOADING
  ============================== */

  if (loading) {
    return (
      <div className="plans-loading">

        <div className="plans-loader">
          🚀
        </div>

        <p>
          {text(
            "Loading your plans...",
            "جارٍ تحميل الخطط..."
          )}
        </p>

      </div>
    );
  }

  if (!userData) {
    return (
      <div className="plans-loading">

        <p>
          {error ||
            text(
              "User profile was not found.",
              "لم يتم العثور على ملف المستخدم."
            )}
        </p>

      </div>
    );
  }

  /* ==============================
     USER TYPE
  ============================== */

  const isStudent =
    userData.role ===
    "student";

  const plans =
    isStudent
      ? studentPlans
      : teacherPlans;

  const plansWhatsAppNumber =
    publicSettings.whatsapp ||
    publicSettings.supportPhone ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    "";

  const plansWhatsApp = whatsappAccessLink(plansWhatsAppNumber, {
    name: userData?.name || userData?.displayName || userData?.username || "",
    email:
      userData?.email ||
      auth.currentUser?.email ||
      text("No email", "بدون بريد إلكتروني"),
    programName: text(
      "TechMinds services and additional options",
      "خدمات TechMinds والخدمات الإضافية"
    ),
    language,
  });

    /* ==============================
     PAGE
  ============================== */

  if (manualAccessMode) {
    return (
      <main className="plans-page" dir={language === "en" ? "ltr" : "rtl"}>
        <div className="plans-language">
          <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button>
          <button type="button" className={language === "ar" ? "active" : ""} onClick={() => setLanguage("ar")}>العربية</button>
          <button type="button" className={language === "he" ? "active" : ""} onClick={() => setLanguage("he")}>עברית</button>
        </div>

        <section className="plans-header" style={{ maxWidth: "760px", margin: "48px auto 24px" }}>
          <div className="plans-logo">💬</div>
          <h1>
            {text(
              "Subscriptions & payments are currently unavailable",
              "الاشتراك والدفع غير متاحين حاليًا"
            )}
          </h1>
          <p>
            {text(
              "We are preparing the in-platform subscription and payment experience. In the meantime, contact us directly for program access, private lessons, courses, custom packages, or any additional service.",
              "نعمل حاليًا على تجهيز الاشتراك والدفع داخل المنصة. في الوقت الحالي يمكنك التواصل معنا مباشرة للاستفسار عن فتح البرامج، الدروس الخاصة، الدورات، الباقات أو أي خدمات إضافية."
            )}
          </p>
        </section>

        <section
          className="plans-section"
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            className="plan-card recommended-plan"
            style={{ maxWidth: "620px", margin: "0 auto" }}
          >
            <div className="plan-icon">✨</div>
            <h3>
              {text(
                "Need help choosing the right option?",
                "بدك تعرف أي خدمة أنسب إلك؟"
              )}
            </h3>
            <p className="plan-description">
              {text(
                "Message us on WhatsApp and ask about available programs, private lessons, group courses, teacher services, or other learning options.",
                "ابعث لنا على واتساب واستفسر عن البرامج المتاحة، الدروس الخاصة، الدورات الجماعية، خدمات المعلمين أو أي خيارات تعليمية إضافية."
              )}
            </p>

            {plansWhatsApp ? (
              <a
                className="plan-button paid-plan-button"
                href={plansWhatsApp}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
              >
                {text(
                  "💬 Contact us on WhatsApp",
                  "💬 تواصل معنا عبر واتساب"
                )}
              </a>
            ) : (
              <p className="plans-message">
                {text(
                  "WhatsApp contact is not configured yet.",
                  "رقم واتساب للتواصل غير مُعدّ بعد."
                )}
              </p>
            )}

            <button
              type="button"
              className="plan-button free-plan-button"
              onClick={() => navigate(userData?.role === "teacher" ? "/teacher" : "/student")}
              style={{ marginTop: "12px" }}
            >
              {text("Back to dashboard", "العودة للصفحة الرئيسية")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="plans-page">

      {/* =====================
          LANGUAGE
      ====================== */}

      <div className="plans-language">

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
          English
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
          العربية
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

      {/* =====================
          HEADER
      ====================== */}

      <header className="plans-header">

        <div className="plans-logo">
          🚀
        </div>

        <h1>
          {isStudent
            ? text(
                "Choose Your Learning Journey",
                "اختر رحلتك التعليمية"
              )
            : text(
                "Choose Your Teacher Plan",
                "اختر خطة المعلّم"
              )}
        </h1>

        <p>
          {isStudent
            ? text(
                "Choose what you want to learn, then select the plan that fits you.",
                "اختر المجال الذي تريد تعلّمه ثم اختر الخطة المناسبة لك."
              )
            : text(
                "Choose the tools and student capacity that fit your teaching.",
                "اختر الأدوات وعدد الطلاب المناسب لطريقة تدريسك."
              )}
        </p>

      </header>

      {/* =====================
          STUDENT TRACKS
      ====================== */}

      {isStudent && (
        <section className="tracks-section">

          <div className="section-title">

            <span>
              1
            </span>

            <div>

              <h2>
                {text(
                  "Choose a Learning Program",
                  "اختر المسار التعليمي"
                )}
              </h2>

              <p>
                {text(
                  "You can change or add programs later.",
                  "يمكنك تغيير أو إضافة مسارات لاحقًا."
                )}
              </p>

            </div>

          </div>

          <div className="tracks-grid">

            {studentTracks.map(
              (track) => (
                <button
                  key={
                    track.id
                  }
                  type="button"
                  className={`track-card ${
                    track.className
                  } ${
                    selectedTrack ===
                    track.id
                      ? "selected-track"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedTrack(
                      track.id
                    )
                  }
                >

                  {selectedTrack ===
                    track.id && (
                    <div className="selected-check">
                      ✓
                    </div>
                  )}

                  <div className="track-icon">
                    {track.icon}
                  </div>

                  <h3>
                    {text(
                      track.titleEn,
                      track.titleAr
                    )}
                  </h3>

                  <span className="track-age">
                    {text(
                      track.agesEn,
                      track.agesAr
                    )}
                  </span>

                  <p>
                    {text(
                      track.descEn,
                      track.descAr
                    )}
                  </p>

                </button>
              )
            )}

          </div>

        </section>
      )}

      {/* =====================
          PLAN SECTION
      ====================== */}

      <section className="plans-section">

        <div className="section-title">

          <span>
            {isStudent
              ? "2"
              : "1"}
          </span>

          <div>

            <h2>
              {text(
                "Choose Your Plan",
                "اختر خطتك"
              )}
            </h2>

            <p>
              {text(
                "You can upgrade or change your plan later.",
                "يمكنك ترقية أو تغيير خطتك لاحقًا."
              )}
            </p>

          </div>

        </div>

        {/* =====================
            BILLING
        ====================== */}

        <div className="billing-switch">

          <button
            type="button"
            className={
              billingCycle ===
              "monthly"
                ? "billing-active"
                : ""
            }
            onClick={() =>
              setBillingCycle(
                "monthly"
              )
            }
          >
            {text(
              "Monthly",
              "شهري"
            )}
          </button>

          <button
            type="button"
            className={
              billingCycle ===
              "yearly"
                ? "billing-active"
                : ""
            }
            onClick={() =>
              setBillingCycle(
                "yearly"
              )
            }
          >
            {text(
              "Yearly",
              "سنوي"
            )}

            <small>
              {text(
                " Save",
                " توفير"
              )}
            </small>
          </button>

        </div>

        {/* =====================
            PLAN CARDS
        ====================== */}

        <div
          className={`plans-grid ${
            !isStudent
              ? "teacher-plans-grid"
              : ""
          }`}
        >

          {plans.map(
            (plan) => {
              const price =
                billingCycle ===
                "monthly"
                  ? plan.monthlyPrice
                  : plan.yearlyPrice;

              const isFree =
                plan.id ===
                "free";

              const isSchool =
                plan.id ===
                "school";

              return (
                <div
                  key={
                    plan.id
                  }
                  className={`plan-card ${
                    plan.recommended
                      ? "recommended-plan"
                      : ""
                  }`}
                >

                  {plan.recommended && (
                    <div className="recommended-badge">
                      {text(
                        "Most Popular",
                        "الأكثر اختيارًا"
                      )}
                    </div>
                  )}

                  <div className="plan-icon">
                    {plan.icon}
                  </div>

                  <h3>
                    {text(
                      plan.nameEn,
                      plan.nameAr
                    )}
                  </h3>

                  <p className="plan-description">
                    {text(
                      plan.descriptionEn,
                      plan.descriptionAr
                    )}
                  </p>

                  {/* PRICE */}

                  <div className="plan-price">

                    {isSchool ? (
                      <strong>
                        {text(
                          "Custom",
                          "حسب المؤسسة"
                        )}
                      </strong>
                    ) : (
                      <>
                        <strong>
                          ₪{price}
                        </strong>

                        {!isFree && (
                          <span>
                            /
                            {billingCycle ===
                            "monthly"
                              ? text(
                                  "month",
                                  "شهر"
                                )
                              : text(
                                  "year",
                                  "سنة"
                                )}
                          </span>
                        )}
                      </>
                    )}

                  </div>

                  {/* FEATURES */}

                  <ul>

                    {(language === "ar"
                      ? plan.featuresAr
                      : language === "he"
                        ? plan.featuresEn.map(hebrewText)
                        : plan.featuresEn
                    ).map(
                      (
                        feature,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          <span>
                            ✓
                          </span>

                          {feature}
                        </li>
                      )
                    )}

                  </ul>

                  {/* =====================
                      BUTTON
                  ====================== */}

                  {isFree ? (
                    <button
                      type="button"
                      className="plan-button free-plan-button"
                      disabled={
                        saving
                      }
                      onClick={
                        activateFreePlan
                      }
                    >
                      {saving
                        ? text(
                            "Activating...",
                            "جارٍ التفعيل..."
                          )
                        : text(
                            "Continue Free",
                            "المتابعة مجانًا"
                          )}
                    </button>
                  ) : isSchool ? (
                    <button
                      type="button"
                      className="plan-button school-plan-button"
                      disabled={
                        saving
                      }
                      onClick={() =>
                        chooseSchoolPlan(
                          plan
                        )
                      }
                    >
                      {text(
                        "Request School Plan",
                        "طلب خطة مدرسة"
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="plan-button paid-plan-button"
                      disabled={
                        saving
                      }
                      onClick={() =>
                        choosePaidPlan(
                          plan
                        )
                      }
                    >
                      {saving
                        ? text(
                            "Please wait...",
                            "يرجى الانتظار..."
                          )
                        : text(
                            "Choose Plan",
                            "اختيار الخطة"
                          )}

                      {!saving && (
                        <span>
                          {language ===
                          "ar"
                            ? "←"
                            : "→"}
                        </span>
                      )}
                    </button>
                  )}

                </div>
              );
            }
          )}

        </div>

        {/* PRICE NOTE */}

        <p className="price-note">
          ℹ️{" "}
          {text(
            "Current prices are sample launch prices and can be changed before publishing.",
            "الأسعار الحالية تجريبية ويمكن تعديلها قبل إطلاق المنصة."
          )}
        </p>

      </section>

      {/* =====================
          ERROR / MESSAGE
      ====================== */}

      {error && (
        <div
          className={
            error.includes(
              "saved"
            ) ||
            error.includes(
              "تم حفظ"
            )
              ? "plans-message success"
              : "plans-message"
          }
        >
          {error}
        </div>
      )}

    </div>
  );
}

export default Plans;