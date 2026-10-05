import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    progress: {
  "continueTitle": "Continue where you left off",
  "lastPlace": "Last place you stopped",
  "in_progress": "In progress",
  "completed": "Completed",
  "not_started": "Not started",
  "continueAction": "Continue learning",
  "start": "Start",
  "loading": "Loading progress…",
  "error": "Could not sync your progress. Please retry.",
  "retry": "Retry",
  "section": "Section"
},
    appName: "TechMinds",
    slogan: "Teach. Learn. Create. Grow.",
    teacher: "Teacher",
    student: "Student",
    teacherDescription:
      "Manage classes, students, lessons and learning activities.",
    studentDescription:
      "Learn, complete challenges, earn XP and create amazing projects.",
    teacherLogin: "Teacher Login",
    studentLogin: "Student Login",
    createTeacherAccount: "Create Teacher Account",
    createStudentAccount: "Create Student Account",
    email: "Email",
    password: "Password",
    welcomeBack: "Welcome back!",
    readyChallenge: "Ready for your next challenge?",
    back: "Back",
    loginAsTeacher: "Login as Teacher",
    loginAsStudent: "Login as Student",
    loggingIn: "Logging in...",
    incorrectLogin: "Email or password is incorrect.",
    notTeacher: "This account is not a teacher account.",
    notStudent: "This account is not a student account.",
    studentIdentifier: "Username or Student Code",
    studentIdentifierPlaceholder: "Example: adam23 or TL-7K29PQ",
    username: "Username",
    usernamePlaceholder: "Choose a username",
    studentCode: "Student Code",
    billingEmail: "Billing / Parent Email",
    teacherDashboard: "Teacher Dashboard",
    studentDashboard: "Student Dashboard",
    myClasses: "My Classes",
    students: "Students",
    attendance: "Attendance",
    lessons: "Lessons",
    challenges: "Challenges",
    messages: "Messages",
    projects: "Projects",
    subscription: "Subscription & Payments",
    settings: "Settings",
    choosePlan: "Choose Your Plan",
    freePlan: "Free",
    premiumPlan: "Premium",
    teacherPro: "Teacher Pro",
    studentPremium: "Student Premium",
    monthly: "Monthly",
    yearly: "Yearly",
    continueFree: "Continue Free",
    continueToPayment: "Continue to Payment",
    welcomeTeacher: "Welcome back",
    welcomeStudent: "Ready for your next challenge?",
    logout: "Logout",
    language: "Language",
    english: "English",
    arabic: "Arabic",
    hebrew: "Hebrew",
  },

  ar: {
    progress: {
  "continueTitle": "أكمل من حيث توقفت",
  "lastPlace": "آخر مكان توقفت عنده",
  "in_progress": "قيد التقدم",
  "completed": "مكتمل",
  "not_started": "لم تبدأ بعد",
  "continueAction": "متابعة التعلم",
  "start": "ابدأ",
  "loading": "جارٍ تحميل التقدم…",
  "error": "تعذرت مزامنة تقدمك. حاول مجددًا.",
  "retry": "إعادة المحاولة",
  "section": "القسم"
},
    appName: "TechMinds",
    slogan: "علّم. تعلّم. ابتكر. وتطوّر.",
    teacher: "المعلّم",
    student: "الطالب",
    teacherDescription:
      "أدِر صفوفك وطلابك ودروسك والفعاليات التعليمية.",
    studentDescription:
      "تعلّم، أنجز التحديات، اجمع النقاط وأنشئ مشاريع رائعة.",
    teacherLogin: "دخول المعلّم",
    studentLogin: "دخول الطالب",
    createTeacherAccount: "إنشاء حساب معلّم",
    createStudentAccount: "إنشاء حساب طالب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    welcomeBack: "أهلًا بعودتك!",
    readyChallenge: "هل أنت مستعد للتحدي القادم؟",
    back: "رجوع",
    loginAsTeacher: "الدخول كمعلّم",
    loginAsStudent: "الدخول كطالب",
    loggingIn: "جارٍ تسجيل الدخول...",
    incorrectLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    notTeacher: "هذا الحساب ليس حساب معلّم.",
    notStudent: "هذا الحساب ليس حساب طالب.",
    studentIdentifier: "اسم المستخدم أو رمز الطالب",
    studentIdentifierPlaceholder: "مثال: adam23 أو TL-7K29PQ",
    username: "اسم المستخدم",
    usernamePlaceholder: "اختر اسم مستخدم",
    studentCode: "رمز الطالب",
    billingEmail: "البريد الإلكتروني للدفع / ولي الأمر",
    teacherDashboard: "لوحة المعلّم",
    studentDashboard: "لوحة الطالب",
    myClasses: "صفوفي",
    students: "الطلاب",
    attendance: "الحضور",
    lessons: "الدروس",
    challenges: "التحديات",
    messages: "الرسائل",
    projects: "المشاريع",
    subscription: "الاشتراك والدفع",
    settings: "الإعدادات",
    choosePlan: "اختر خطتك",
    freePlan: "مجاني",
    premiumPlan: "مميز",
    teacherPro: "خطة المعلّم الاحترافية",
    studentPremium: "الخطة المميزة للطالب",
    monthly: "شهري",
    yearly: "سنوي",
    continueFree: "المتابعة مجانًا",
    continueToPayment: "المتابعة للدفع",
    welcomeTeacher: "أهلًا بعودتك",
    welcomeStudent: "هل أنت مستعد للتحدي القادم؟",
    logout: "تسجيل الخروج",
    language: "اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    hebrew: "العبرية",
  },

  he: {
    progress: {
  "continueTitle": "המשך מהמקום שבו הפסקת",
  "lastPlace": "המקום האחרון שבו עצרת",
  "in_progress": "בתהליך",
  "completed": "הושלם",
  "not_started": "טרם התחלת",
  "continueAction": "המשך ללמוד",
  "start": "התחלה",
  "loading": "טוען התקדמות…",
  "error": "לא ניתן לסנכרן את ההתקדמות. נסו שוב.",
  "retry": "ניסיון נוסף",
  "section": "שלב"
},
    appName: "TechMinds",
    slogan: "ללמד. ללמוד. ליצור. להתפתח.",
    teacher: "מורה",
    student: "תלמיד",
    teacherDescription:
      "נהלו כיתות, תלמידים, שיעורים ופעילויות למידה.",
    studentDescription:
      "למדו, השלימו אתגרים, צברו נקודות וצרו פרויקטים מדהימים.",
    teacherLogin: "כניסת מורה",
    studentLogin: "כניסת תלמיד",
    createTeacherAccount: "יצירת חשבון מורה",
    createStudentAccount: "יצירת חשבון תלמיד",
    email: "דואר אלקטרוני",
    password: "סיסמה",
    welcomeBack: "ברוכים השבים!",
    readyChallenge: "מוכנים לאתגר הבא?",
    back: "חזרה",
    loginAsTeacher: "כניסה כמורה",
    loginAsStudent: "כניסה כתלמיד",
    loggingIn: "מתחבר...",
    incorrectLogin: "כתובת הדואר האלקטרוני או הסיסמה שגויים.",
    notTeacher: "חשבון זה אינו חשבון מורה.",
    notStudent: "חשבון זה אינו חשבון תלמיד.",
    studentIdentifier: "שם משתמש או קוד תלמיד",
    studentIdentifierPlaceholder: "לדוגמה: adam23 או TL-7K29PQ",
    username: "שם משתמש",
    usernamePlaceholder: "בחרו שם משתמש",
    studentCode: "קוד תלמיד",
    billingEmail: "אימייל לתשלום / הורה",
    teacherDashboard: "לוח הבקרה למורה",
    studentDashboard: "לוח הבקרה לתלמיד",
    myClasses: "הכיתות שלי",
    students: "תלמידים",
    attendance: "נוכחות",
    lessons: "שיעורים",
    challenges: "אתגרים",
    messages: "הודעות",
    projects: "פרויקטים",
    subscription: "מנוי ותשלומים",
    settings: "הגדרות",
    choosePlan: "בחרו תוכנית",
    freePlan: "חינם",
    premiumPlan: "פרימיום",
    teacherPro: "Teacher Pro",
    studentPremium: "Student Premium",
    monthly: "חודשי",
    yearly: "שנתי",
    continueFree: "המשך בחינם",
    continueToPayment: "המשך לתשלום",
    welcomeTeacher: "ברוכים השבים",
    welcomeStudent: "מוכנים לאתגר הבא?",
    logout: "התנתקות",
    language: "שפה",
    english: "אנגלית",
    arabic: "ערבית",
    hebrew: "עברית",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("TechMinds-language");

    return ["en", "ar", "he"].includes(saved)
      ? saved
      : "en";
  });

  const setLanguage = (newLanguage) => {
    if (!["en", "ar", "he"].includes(newLanguage)) {
      return;
    }

    setLanguageState(newLanguage);
  };

  // Keep old pages working too.
  const changeLanguage = setLanguage;

  useEffect(() => {
    localStorage.setItem("TechMinds-language", language);

    const direction =
      language === "ar" || language === "he"
        ? "rtl"
        : "ltr";

    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    document.title = "TechMinds";
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        changeLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
