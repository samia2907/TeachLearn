import {
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  isStrongPassword,
} from "../utils/passwordPolicy";

import "./Register.css";

function Register() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    language,
    changeLanguage,
    t,
  } = useLanguage();

  /* ===========================
     ROLE
  =========================== */

  const roleFromUrl =
    searchParams.get("role");

  const [role, setRole] =
    useState(
      roleFromUrl === "teacher" ||
        roleFromUrl === "student"
        ? roleFromUrl
        : null
    );

  /* ===========================
     COMMON FORM STATE
  =========================== */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ===========================
     PHONE REGISTRATION
  =========================== */

  const [
    showPhoneRegister,
    setShowPhoneRegister,
  ] = useState(false);

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [
    verificationCode,
    setVerificationCode,
  ] = useState("");

  const [
    confirmationResult,
    setConfirmationResult,
  ] = useState(null);

  const [
    codeSent,
    setCodeSent,
  ] = useState(false);

  /* ===========================
     TEXT HELPER
  =========================== */

  const text = (
    en,
    ar,
    he
  ) => {
    if (language === "ar") {
      return ar;
    }

    if (language === "he") {
      return he;
    }

    return en;
  };

  const isRTL =
    language === "ar" ||
    language === "he";

  /* ===========================
     RECAPTCHA CLEANUP
  =========================== */

  useEffect(() => {
    return () => {
      if (
        window.registerRecaptchaVerifier
      ) {
        try {
          window.registerRecaptchaVerifier.clear();
        } catch (cleanupError) {
          console.warn(
            "Register reCAPTCHA cleanup:",
            cleanupError
          );
        }

        window.registerRecaptchaVerifier =
          null;
      }
    };
  }, []);

  /* ===========================
     GENERAL HELPERS
  =========================== */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetPhoneRegister = () => {
    setPhoneNumber("");
    setVerificationCode("");
    setConfirmationResult(null);
    setCodeSent(false);

    if (
      window.registerRecaptchaVerifier
    ) {
      try {
        window.registerRecaptchaVerifier.clear();
      } catch (cleanupError) {
        console.warn(
          "Register reCAPTCHA cleanup:",
          cleanupError
        );
      }

      window.registerRecaptchaVerifier =
        null;
    }
  };

  const normalizePhoneNumber = (
    value
  ) => {
    const cleaned = value
      .trim()
      .replace(
        /[\s\-()]/g,
        ""
      );

    // Israel:
    // 0501234567
    // → +972501234567

    if (
      /^05\d{8}$/.test(
        cleaned
      )
    ) {
      return (
        "+972" +
        cleaned.slice(1)
      );
    }

    if (
      /^9725\d{8}$/.test(
        cleaned
      )
    ) {
      return (
        "+" +
        cleaned
      );
    }

    // International E.164

    if (
      /^\+\d{8,15}$/.test(
        cleaned
      )
    ) {
      return cleaned;
    }

    return null;
  };

  const goBack = () => {
    setRole(null);

    clearMessages();

    setShowPhoneRegister(false);

    resetPhoneRegister();

    navigate("/register");
  };

  /* ===========================
     TEACHER PROFILE
  =========================== */

  const createTeacherProfile =
    async (
      firebaseUser,
      {
        teacherName,
        teacherEmail = null,
        teacherPhone = null,
        authProvider,
      }
    ) => {
      const userRef =
        doc(
          db,
          "users",
          firebaseUser.uid
        );

      const existingSnapshot =
        await getDoc(
          userRef
        );

      /*
        If this Firebase user already
        has a TeachLearn profile,
        do not overwrite it.
      */

      if (
        existingSnapshot.exists()
      ) {
        const existingData =
          existingSnapshot.data();

        if (
          existingData.role !==
          "teacher"
        ) {
          await signOut(auth);

          throw new Error(
            "account-role-conflict"
          );
        }

        navigate("/plans");

        return;
      }

      await setDoc(
        userRef,
        {
          uid:
            firebaseUser.uid,

          name:
            teacherName.trim(),

          email:
            teacherEmail,

          phoneNumber:
            teacherPhone,

          role:
            "teacher",

          authProvider,

          plan:
            "free",

          subscriptionStatus:
            "inactive",

          billingCycle:
            null,

          subscriptionId:
            null,

          accountStatus:
            "active",

          createdAt:
            serverTimestamp(),
        }
      );

      navigate("/plans");
    };

  /* ===========================
     EMAIL TEACHER REGISTRATION
  =========================== */

  const registerTeacher =
    async () => {
      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const result =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      await createTeacherProfile(
        result.user,
        {
          teacherName:
            name.trim(),

          teacherEmail:
            cleanEmail,

          teacherPhone:
            null,

          authProvider:
            "password",
        }
      );
    };

  /* ===========================
     GOOGLE TEACHER REGISTRATION
  =========================== */

  const registerTeacherWithGoogle =
    async () => {
      clearMessages();

      setLoading(true);

      try {
        const provider =
          new GoogleAuthProvider();

        provider.setCustomParameters({
          prompt:
            "select_account",
        });

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        const googleName =
          name.trim() ||
          result.user.displayName ||
          text(
            "Teacher",
            "معلّم",
            "מורה"
          );

        const googleEmail =
          result.user.email
            ? result.user.email
                .trim()
                .toLowerCase()
            : null;

        await createTeacherProfile(
          result.user,
          {
            teacherName:
              googleName,

            teacherEmail:
              googleEmail,

            teacherPhone:
              result.user.phoneNumber ||
              null,

            authProvider:
              "google",
          }
        );
      } catch (err) {
        console.error(
          "Google registration error:",
          err
        );

        handleRegistrationError(
          err
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===========================
     PHONE TEACHER REGISTRATION
  =========================== */

  const setupRegisterRecaptcha =
    () => {
      if (
        window.registerRecaptchaVerifier
      ) {
        try {
          window.registerRecaptchaVerifier.clear();
        } catch (cleanupError) {
          console.warn(
            "Register reCAPTCHA cleanup:",
            cleanupError
          );
        }

        window.registerRecaptchaVerifier =
          null;
      }

      auth.languageCode =
        language;

      window.registerRecaptchaVerifier =
        new RecaptchaVerifier(
          auth,
          "register-recaptcha-container",
          {
            size:
              "normal",

            "expired-callback":
              () => {
                setError(
                  text(
                    "reCAPTCHA expired. Please verify again.",

                    "انتهت صلاحية reCAPTCHA. يرجى التحقق مرة أخرى.",

                    "תוקף אימות reCAPTCHA פג. יש לבצע אימות מחדש."
                  )
                );
              },
          }
        );

      return (
        window.registerRecaptchaVerifier
      );
    };

  const sendTeacherPhoneCode =
    async () => {
      clearMessages();

      if (!name.trim()) {
        setError(
          text(
            "Please enter your full name first.",

            "أدخل الاسم الكامل أولًا.",

            "יש להזין תחילה שם מלא."
          )
        );

        return;
      }

      const normalizedPhone =
        normalizePhoneNumber(
          phoneNumber
        );

      if (!normalizedPhone) {
        setError(
          text(
            "Enter a valid phone number, for example 0501234567.",

            "أدخل رقم هاتف صحيحًا، مثل 0501234567.",

            "יש להזין מספר טלפון תקין, לדוגמה 0501234567."
          )
        );

        return;
      }

      setLoading(true);

      try {
        const appVerifier =
          setupRegisterRecaptcha();

        const result =
          await signInWithPhoneNumber(
            auth,
            normalizedPhone,
            appVerifier
          );

        setConfirmationResult(
          result
        );

        setCodeSent(true);

        setSuccess(
          text(
            "Verification code sent by SMS.",

            "تم إرسال رمز التحقق برسالة SMS.",

            "קוד אימות נשלח בהודעת SMS."
          )
        );
      } catch (err) {
        console.error(
          "Phone code error:",
          err
        );

        handleRegistrationError(
          err
        );

        if (
          window.registerRecaptchaVerifier
        ) {
          try {
            window.registerRecaptchaVerifier.clear();
          } catch (cleanupError) {
            console.warn(
              "Register reCAPTCHA cleanup:",
              cleanupError
            );
          }

          window.registerRecaptchaVerifier =
            null;
        }
      } finally {
        setLoading(false);
      }
    };

  const verifyTeacherPhoneCode =
    async () => {
      clearMessages();

      if (
        !confirmationResult
      ) {
        setError(
          text(
            "Send the verification code first.",

            "أرسل رمز التحقق أولًا.",

            "יש לשלוח תחילה קוד אימות."
          )
        );

        return;
      }

      if (
        verificationCode
          .trim()
          .length !== 6
      ) {
        setError(
          text(
            "Enter the 6-digit verification code.",

            "أدخل رمز التحقق المكوّن من 6 أرقام.",

            "יש להזין קוד אימות בן 6 ספרות."
          )
        );

        return;
      }

      setLoading(true);

      try {
        const result =
          await confirmationResult.confirm(
            verificationCode.trim()
          );

        await createTeacherProfile(
          result.user,
          {
            teacherName:
              name.trim(),

            teacherEmail:
              result.user.email ||
              null,

            teacherPhone:
              result.user.phoneNumber ||
              normalizePhoneNumber(
                phoneNumber
              ),

            authProvider:
              "phone",
          }
        );
      } catch (err) {
        console.error(
          "Phone verification error:",
          err
        );

        handleRegistrationError(
          err
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===========================
     REGISTER STUDENT
  =========================== */

  const registerStudent =
    async () => {
      const cleanEmail =
        email.trim().toLowerCase();

      const result =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      const userRef =
        doc(
          db,
          "users",
          result.user.uid
        );

      await setDoc(
        userRef,
        {
          uid:
            result.user.uid,

          name:
            name.trim(),

          role:
            "student",

          studentAccountType:
            "independent",

          email:
            cleanEmail,

          authEmail:
            cleanEmail,

          classId:
            null,

          classCode:
            null,

          teacherId:
            null,

          xp:
            0,

          level:
            1,

          badges:
            [],

          plan:
            "free",

          subscriptionStatus:
            "inactive",

          billingCycle:
            null,

          subscriptionId:
            null,

          accountStatus:
            "active",

          createdAt:
            serverTimestamp(),
        }
      );

      navigate("/plans");
    };

  /* ===========================
     STANDARD FORM SUBMIT
  =========================== */

  const handleRegister =
    async (e) => {
      e.preventDefault();

      clearMessages();

      if (!role) {
        setError(
          text(
            "Please choose an account type.",

            "اختر نوع الحساب.",

            "יש לבחור סוג חשבון."
          )
        );

        return;
      }

      if (!name.trim()) {
        setError(
          text(
            "Please enter your full name.",

            "أدخل الاسم الكامل.",

            "יש להזין שם מלא."
          )
        );

        return;
      }

      /*
        Phone registration uses
        its own buttons.
      */

      if (
        role === "teacher" &&
        showPhoneRegister
      ) {
        return;
      }

      if (!email.trim()) {
        setError(
          text(
            "Please enter your email address.",
            "أدخل بريدك الإلكتروني.",
            "יש להזין כתובת אימייל."
          )
        );

        return;
      }

      if (!isStrongPassword(password)) {
        setError(
          text(
            "Use at least 8 characters with uppercase, lowercase, a number, and a special symbol.",

            "استخدم 8 أحرف على الأقل، تشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا.",

            "יש להשתמש ב-8 תווים לפחות, כולל אות גדולה, אות קטנה, מספר וסימן מיוחד."
          )
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          text(
            "Passwords do not match.",

            "كلمتا المرور غير متطابقتين.",

            "הסיסמאות אינן תואמות."
          )
        );

        return;
      }

      setLoading(true);

      try {
        if (
          role === "teacher"
        ) {
          await registerTeacher();
        } else {
          await registerStudent();
        }
      } catch (err) {
        console.error(
          "Registration error:",
          err
        );

        handleRegistrationError(
          err
        );
      } finally {
        setLoading(false);
      }
    };

  /* ===========================
     ERROR HANDLING
  =========================== */

  function handleRegistrationError(
    err
  ) {
    const errorKey =
      err.code ||
      err.message;

    const visibleErrorCode =
      typeof errorKey === "string" &&
      /^[a-z0-9/_-]+$/i.test(errorKey)
        ? errorKey
        : "unknown-error";

    switch (errorKey) {
      case "auth/email-already-in-use":
        setError(
          text(
            "An account already exists with this email.",

            "يوجد حساب مسجل بهذا البريد الإلكتروني.",

            "כבר קיים חשבון עם כתובת אימייל זו."
          )
        );
        break;

      case "auth/invalid-email":
        setError(
          text(
            "Please enter a valid email address.",

            "البريد الإلكتروني غير صالح.",

            "יש להזין כתובת אימייל תקינה."
          )
        );
        break;

      case "auth/weak-password":
        setError(
          text(
            "Please choose a stronger password.",

            "كلمة المرور ضعيفة.",

            "יש לבחור סיסמה חזקה יותר."
          )
        );
        break;

      case "auth/popup-closed-by-user":
        setError(
          text(
            "Google registration was cancelled.",

            "تم إلغاء التسجيل بواسطة Google.",

            "ההרשמה באמצעות Google בוטלה."
          )
        );
        break;

      case "auth/popup-blocked":
        setError(
          text(
            "Your browser blocked the Google window. Allow popups and try again.",

            "المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.",

            "הדפדפן חסם את חלון Google. יש לאפשר חלונות קופצים ולנסות שוב."
          )
        );
        break;

      case "auth/account-exists-with-different-credential":
        setError(
          text(
            "This email already uses another sign-in method. Please log in using that method.",

            "هذا البريد يستخدم طريقة دخول أخرى. سجّل الدخول باستخدام الطريقة المرتبطة بالحساب.",

            "כתובת אימייל זו משתמשת בשיטת התחברות אחרת. יש להתחבר באמצעות אותה שיטה."
          )
        );
        break;

      case "auth/invalid-phone-number":
        setError(
          text(
            "The phone number is invalid.",

            "رقم الهاتف غير صحيح.",

            "מספר הטלפון אינו תקין."
          )
        );
        break;

      case "auth/operation-not-allowed":
        setError(
          text(
            "Phone sign-in is not enabled for this Firebase project. Enable the Phone provider in Firebase Authentication, or use email/Google.",
            "تسجيل الدخول بالهاتف غير مفعّل في مشروع Firebase. فعّل مزوّد الهاتف من Firebase Authentication أو استخدم البريد/Google.",
            "התחברות באמצעות טלפון אינה מופעלת בפרויקט Firebase. יש להפעיל את ספק הטלפון או להשתמש באימייל/Google."
          )
        );
        break;

      case "auth/unauthorized-domain":
      case "auth/app-not-authorized":
        setError(
          text(
            "This website domain is not authorized for phone authentication.",
            "نطاق هذا الموقع غير مصرح له باستخدام تسجيل الدخول بالهاتف.",
            "דומיין האתר אינו מורשה לאימות באמצעות טלפון."
          )
        );
        break;

      case "auth/billing-not-enabled":
        setError(
          text(
            "Phone authentication requires billing to be enabled for this Firebase project.",
            "تسجيل الدخول بالهاتف يحتاج إلى تفعيل الفوترة في مشروع Firebase.",
            "אימות באמצעות טלפון מחייב הפעלת חיוב בפרויקט Firebase."
          )
        );
        break;

      case "auth/invalid-app-credential":
      case "auth/missing-app-credential":
        setError(
          text(
            "reCAPTCHA could not verify this request. Refresh the page and try again.",
            "تعذر على reCAPTCHA التحقق من الطلب. حدّث الصفحة وحاول مرة أخرى.",
            "reCAPTCHA לא הצליח לאמת את הבקשה. יש לרענן את הדף ולנסות שוב."
          )
        );
        break;

      case "auth/network-request-failed":
        setError(
          text(
            "Network error while contacting Firebase. Check your connection and try again.",
            "حدث خطأ في الاتصال مع Firebase. تحقق من الإنترنت وحاول مرة أخرى.",
            "אירעה שגיאת רשת מול Firebase. יש לבדוק את החיבור ולנסות שוב."
          )
        );
        break;

      case "auth/too-many-requests":
        setError(
          text(
            "Too many attempts. Please try again later.",

            "عدد المحاولات كبير جدًا. حاول مرة أخرى لاحقًا.",

            "בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר."
          )
        );
        break;

      case "auth/quota-exceeded":
        setError(
          text(
            "SMS quota has been reached. Please try again later.",

            "تم الوصول إلى حد رسائل SMS. حاول مرة أخرى لاحقًا.",

            "הגעתם למכסת הודעות ה-SMS. נסו שוב מאוחר יותר."
          )
        );
        break;

      case "auth/captcha-check-failed":
        setError(
          text(
            "reCAPTCHA verification failed. Please try again.",

            "فشل التحقق من reCAPTCHA. حاول مرة أخرى.",

            "אימות reCAPTCHA נכשל. נסו שוב."
          )
        );
        break;

      case "auth/invalid-verification-code":
      case "auth/code-expired":
        setError(
          text(
            "The verification code is incorrect or expired.",

            "رمز التحقق غير صحيح أو انتهت صلاحيته.",

            "קוד האימות שגוי או שפג תוקפו."
          )
        );
        break;

      case "account-role-conflict":
        setError(
          text(
            "This login already belongs to a non-teacher TeachLearn account.",

            "طريقة الدخول هذه مرتبطة بحساب TeachLearn ليس حساب معلّم.",

            "שיטת התחברות זו כבר משויכת לחשבון TeachLearn שאינו חשבון מורה."
          )
        );
        break;

      case "username-taken":
        setError(
          text(
            "This username is already taken. Please choose another.",

            "اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.",

            "שם המשתמש כבר תפוס. יש לבחור שם אחר."
          )
        );
        break;

      case "invalid-username":
        setError(
          text(
            "Username must contain 3–24 letters or numbers. You may also use _, . or -.",

            "اسم المستخدم يجب أن يحتوي على 3 إلى 24 حرفًا أو رقمًا، ويمكن استخدام _ أو . أو -.",

            "שם המשתמש חייב להכיל 3–24 אותיות או מספרים. ניתן להשתמש גם ב-_, . או -."
          )
        );
        break;

      case "student-code-generation-failed":
        setError(
          text(
            "Could not generate a student code. Please try again.",

            "تعذر إنشاء رمز الطالب. حاول مرة أخرى.",

            "לא ניתן ליצור קוד תלמיד. נסו שוב."
          )
        );
        break;

      default:
        console.error(
          "Unhandled registration error:",
          err
        );

        setError(
          text(
            `Account creation failed (${visibleErrorCode}). Please try again.`,

            `حدث خطأ أثناء إنشاء الحساب (${visibleErrorCode}). حاول مرة أخرى.`,

            `יצירת החשבון נכשלה (${visibleErrorCode}). נסו שוב.`
          )
        );
    }
  }

  /* ===========================
     STYLES
  =========================== */

  const languageBarStyle = {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    flexWrap:
      "wrap",

    gap:
      "8px",

    marginBottom:
      "20px",
  };

  const languageButtonStyle = (
    selectedLanguage
  ) => ({
    padding:
      "7px 12px",

    borderRadius:
      "20px",

    border:
      language ===
      selectedLanguage
        ? "2px solid #6d28d9"
        : "1px solid #ded7e5",

    background:
      language ===
      selectedLanguage
        ? "#f3e8ff"
        : "#ffffff",

    color:
      language ===
      selectedLanguage
        ? "#6d28d9"
        : "#4b5563",

    fontWeight:
      "700",

    cursor:
      "pointer",
  });

  const dividerStyle = {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      "12px",

    width:
      "100%",

    margin:
      "20px 0",

    color:
      "#9ca3af",

    fontSize:
      "12px",

    fontWeight:
      "700",
  };

  const dividerLineStyle = {
    flex:
      1,

    height:
      "1px",

    background:
      "#e5e7eb",
  };

  const alternativeButtonStyle = {
    width:
      "100%",

    minHeight:
      "48px",

    marginBottom:
      "10px",

    padding:
      "10px 14px",

    border:
      "1px solid #ded7e5",

    borderRadius:
      "12px",

    background:
      "#ffffff",

    color:
      "#29252f",

    fontWeight:
      "700",

    fontSize:
      "14px",

    cursor:
      loading
        ? "not-allowed"
        : "pointer",

    opacity:
      loading
        ? 0.6
        : 1,
  };

  const phoneBoxStyle = {
    width:
      "100%",

    boxSizing:
      "border-box",

    margin:
      "12px 0 4px",

    padding:
      "16px",

    border:
      "1px solid #e8e2ed",

    borderRadius:
      "14px",

    background:
      "#faf9fc",
  };

  const phoneInputStyle = {
    width:
      "100%",

    minHeight:
      "45px",

    boxSizing:
      "border-box",

    margin:
      "7px 0 12px",

    padding:
      "10px 12px",

    border:
      "1px solid #d7d0de",

    borderRadius:
      "10px",

    outline:
      "none",

    fontSize:
      "14px",
  };

  const phoneActionStyle = {
    width:
      "100%",

    minHeight:
      "45px",

    border:
      "none",

    borderRadius:
      "10px",

    background:
      "#6d28d9",

    color:
      "#ffffff",

    fontSize:
      "14px",

    fontWeight:
      "800",

    cursor:
      loading
        ? "not-allowed"
        : "pointer",

    opacity:
      loading
        ? 0.6
        : 1,
  };

  const successStyle = {
    width:
      "100%",

    boxSizing:
      "border-box",

    margin:
      "12px 0",

    padding:
      "11px 12px",

    borderRadius:
      "10px",

    background:
      "#ecfdf3",

    color:
      "#067647",

    fontSize:
      "13px",

    lineHeight:
      "1.5",
  };

  /* ===========================
     PAGE
  =========================== */

  return (
    <div
      className="register-page"
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
    >
      {/* LANGUAGE */}

      <div
        style={
          languageBarStyle
        }
      >
        <button
          type="button"
          style={languageButtonStyle(
            "en"
          )}
          onClick={() =>
            changeLanguage(
              "en"
            )
          }
        >
          English
        </button>

        <button
          type="button"
          style={languageButtonStyle(
            "ar"
          )}
          onClick={() =>
            changeLanguage(
              "ar"
            )
          }
        >
          العربية
        </button>

        <button
          type="button"
          style={languageButtonStyle(
            "he"
          )}
          onClick={() =>
            changeLanguage(
              "he"
            )
          }
        >
          עברית
        </button>
      </div>

      {/* BRAND */}

      <div className="register-brand">
        <div className="register-logo">
          🚀
        </div>

        <h1>
          {t.appName}
        </h1>

        <p>
          {t.slogan}
        </p>
      </div>

      {/* ======================
          CHOOSE ROLE
      ====================== */}

      {!role && (
        <div className="role-section">
          <h2>
            {text(
              "How are you joining?",

              "كيف تريد الانضمام؟",

              "איך תרצו להצטרף?"
            )}
          </h2>

          <p className="role-subtitle">
            {text(
              "Choose your account type",

              "اختر نوع الحساب",

              "בחרו את סוג החשבון"
            )}
          </p>

          <div className="role-cards">
            {/* TEACHER */}

            <div className="role-card teacher-role">
              <div className="role-icon">
                👩‍🏫
              </div>

              <h3>
                {t.teacher}
              </h3>

              <p>
                {text(
                  "Create classes, manage students, assign learning activities and follow student progress.",

                  "أنشئ الصفوف، أدر الطلاب، أرسل الفعاليات التعليمية وتابع تقدم طلابك.",

                  "צרו כיתות, נהלו תלמידים, הקצו פעילויות למידה ועקבו אחר התקדמות התלמידים."
                )}
              </p>

              <button
                type="button"
                onClick={() => {
                  setRole(
                    "teacher"
                  );

                  clearMessages();
                }}
              >
                {text(
                  "I'm a Teacher",

                  "أنا معلّم",

                  "אני מורה"
                )}
              </button>
            </div>

            {/* STUDENT */}

            <div className="role-card student-role">
              <div className="role-icon">
                🎓
              </div>

              <h3>
                {t.student}
              </h3>

              <p>
                {text(
                  "Learn, complete challenges, earn XP and create amazing projects.",

                  "تعلّم، أنجز التحديات، اجمع النقاط وأنشئ مشاريع رائعة.",

                  "למדו, השלימו אתגרים, צברו נקודות וצרו פרויקטים מדהימים."
                )}
              </p>

              <button
                type="button"
                onClick={() => {
                  setRole(
                    "student"
                  );

                  clearMessages();
                }}
              >
                {text(
                  "I'm a Student",

                  "أنا طالب",

                  "אני תלמיד"
                )}
              </button>
            </div>
          </div>

          <p className="already-account">
            {text(
              "Already have an account?",

              "لديك حساب بالفعل؟",

              "כבר יש לכם חשבון?"
            )}
          </p>

          <button
            type="button"
            className="login-link-button"
            onClick={() =>
              navigate(
                "/login"
              )
            }
          >
            {text(
              "Login",

              "تسجيل الدخول",

              "התחברות"
            )}
          </button>
        </div>
      )}

      {/* ======================
          REGISTER FORM
      ====================== */}

      {role && (
        <div
          className={`register-box ${
            role === "student"
              ? "student-register-box"
              : ""
          }`}
        >
          <button
            type="button"
            className="register-back"
            onClick={goBack}
          >
            {text(
              "← Back",

              "↩ رجوع",

              "↩ חזרה"
            )}
          </button>

          <div className="register-role-icon">
            {role === "teacher"
              ? "👩‍🏫"
              : "🎓"}
          </div>

          <h2>
            {role === "teacher"
              ? t.createTeacherAccount
              : t.createStudentAccount}
          </h2>

          <p className="register-description">
            {role === "teacher"
              ? text(
                  "Start creating amazing learning experiences.",

                  "ابدأ بإنشاء تجربة تعليمية رائعة لطلابك.",

                  "התחילו ליצור חוויות למידה נהדרות לתלמידים שלכם."
                )
              : text(
                  "Your learning journey starts here!",

                  "رحلتك التعليمية تبدأ من هنا!",

                  "מסע הלמידה שלכם מתחיל כאן!"
                )}
          </p>

          <form
            className="register-form"
            onSubmit={
              handleRegister
            }
          >
            {/* NAME */}

            <label>
              {text(
                "Full Name",

                "الاسم الكامل",

                "שם מלא"
              )}
            </label>

            <input
              type="text"

              placeholder={text(
                "Enter your full name",

                "أدخل اسمك الكامل",

                "הזינו שם מלא"
              )}

              value={name}

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }

              required
            />

            {/* ======================
                TEACHER
            ====================== */}

            {role === "teacher" && (
              <>
                {!showPhoneRegister && (
                  <>
                    {/* EMAIL */}

                    <label>
                      {t.email}
                    </label>

                    <input
                      type="email"

                      placeholder="teacher@example.com"

                      value={email}

                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }

                      required
                    />

                    {/* PASSWORD */}

                    <label>
                      {t.password}
                    </label>

                    <input
                      type="password"

                      placeholder={text(
                        "8+ characters: Aa, 1, !",

                        "8+ أحرف: Aa، 1، !",

                        "8+ תווים: Aa, 1, !"
                      )}

                      value={password}

                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }

                      required
                    />

                    {/* CONFIRM */}

                    <label>
                      {text(
                        "Confirm Password",

                        "تأكيد كلمة المرور",

                        "אימות סיסמה"
                      )}
                    </label>

                    <input
                      type="password"

                      placeholder={text(
                        "Enter your password again",

                        "أدخل كلمة المرور مرة أخرى",

                        "הזינו את הסיסמה שוב"
                      )}

                      value={
                        confirmPassword
                      }

                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }

                      required
                    />

                    {/* CREATE */}

                    <button
                      type="submit"

                      disabled={
                        loading
                      }

                      className="create-account-button"
                    >
                      {loading
                        ? text(
                            "Creating Account...",

                            "جارٍ إنشاء الحساب...",

                            "יוצר חשבון..."
                          )
                        : text(
                            "Create Account 🚀",

                            "إنشاء الحساب 🚀",

                            "יצירת חשבון 🚀"
                          )}
                    </button>

                    {/* OR */}

                    <div
                      style={
                        dividerStyle
                      }
                    >
                      <span
                        style={
                          dividerLineStyle
                        }
                      />

                      <span>
                        {text(
                          "OR",
                          "أو",
                          "או"
                        )}
                      </span>

                      <span
                        style={
                          dividerLineStyle
                        }
                      />
                    </div>

                    {/* GOOGLE */}

                    <button
                      type="button"

                      onClick={
                        registerTeacherWithGoogle
                      }

                      disabled={
                        loading
                      }

                      style={
                        alternativeButtonStyle
                      }
                    >
                      G&nbsp;&nbsp;

                      {text(
                        "Continue with Google",

                        "المتابعة باستخدام Google",

                        "המשך באמצעות Google"
                      )}
                    </button>

                    {/* PHONE */}

                    <button
                      type="button"

                      onClick={() => {
                        clearMessages();

                        setShowPhoneRegister(
                          true
                        );

                        resetPhoneRegister();
                      }}

                      disabled={
                        loading
                      }

                      style={
                        alternativeButtonStyle
                      }
                    >
                      📱&nbsp;&nbsp;

                      {text(
                        "Continue with phone number",

                        "المتابعة باستخدام رقم الهاتف",

                        "המשך באמצעות מספר טלפון"
                      )}
                    </button>
                  </>
                )}

                {/* PHONE REGISTER */}

                {showPhoneRegister && (
                  <div
                    className="phone-register-box"
                    style={
                      phoneBoxStyle
                    }
                  >
                    <button
                      type="button"
                      className="phone-register-back"

                      onClick={() => {
                        clearMessages();

                        setShowPhoneRegister(
                          false
                        );

                        resetPhoneRegister();
                      }}

                      style={{
                        border:
                          "none",

                        background:
                          "transparent",

                        color:
                          "#6d28d9",

                        fontWeight:
                          "700",

                        cursor:
                          "pointer",

                        marginBottom:
                          "10px",

                        padding:
                          "0",
                      }}
                    >
                      {text(
                        "← Use email or Google",

                        "العودة إلى البريد أو Google ↩",

                        "↩ חזרה לאימייל או Google"
                      )}
                    </button>

                    {!codeSent ? (
                      <>
                        <label>
                          {text(
                            "Phone Number",

                            "رقم الهاتف",

                            "מספר טלפון"
                          )}
                        </label>

                        <input
                          type="tel"

                          placeholder="0501234567"

                          value={
                            phoneNumber
                          }

                          onChange={(e) =>
                            setPhoneNumber(
                              e.target.value
                            )
                          }

                          style={
                            phoneInputStyle
                          }
                        />

                        <div
                          id="register-recaptcha-container"

                          style={{
                            marginBottom:
                              "12px",
                          }}
                        />

                        <button
                          type="button"

                          onClick={
                            sendTeacherPhoneCode
                          }

                          disabled={
                            loading
                          }

                          style={
                            phoneActionStyle
                          }
                        >
                          {loading
                            ? text(
                                "Sending...",

                                "جارٍ الإرسال...",

                                "שולח..."
                              )
                            : text(
                                "Send verification code",

                                "إرسال رمز التحقق",

                                "שליחת קוד אימות"
                              )}
                        </button>

                        <p
                          style={{
                            margin:
                              "10px 0 0",

                            color:
                              "#77717d",

                            fontSize:
                              "11px",

                            lineHeight:
                              "1.5",
                          }}
                        >
                          {text(
                            "A verification SMS will be sent to this number. Standard SMS rates may apply.",

                            "سيتم إرسال رسالة SMS للتحقق إلى هذا الرقم، وقد تُطبق رسوم الرسائل المعتادة.",

                            "הודעת SMS עם קוד אימות תישלח למספר זה. ייתכן שיחולו תעריפי SMS רגילים."
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <label>
                          {text(
                            "Verification Code",

                            "رمز التحقق",

                            "קוד אימות"
                          )}
                        </label>

                        <input
                          type="text"

                          inputMode="numeric"

                          maxLength={6}

                          placeholder="123456"

                          value={
                            verificationCode
                          }

                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  6
                                )
                            )
                          }

                          style={
                            phoneInputStyle
                          }
                        />

                        <button
                          type="button"

                          onClick={
                            verifyTeacherPhoneCode
                          }

                          disabled={
                            loading
                          }

                          style={
                            phoneActionStyle
                          }
                        >
                          {loading
                            ? text(
                                "Verifying...",

                                "جارٍ التحقق...",

                                "מאמת..."
                              )
                            : text(
                                "Verify & Create Account 🚀",

                                "تحقق وأنشئ الحساب 🚀",

                                "אימות ויצירת חשבון 🚀"
                              )}
                        </button>

                        <button
                          type="button"

                          onClick={() => {
                            clearMessages();

                            resetPhoneRegister();
                          }}

                          style={{
                            width:
                              "100%",

                            marginTop:
                              "10px",

                            border:
                              "none",

                            background:
                              "transparent",

                            color:
                              "#6d28d9",

                            fontWeight:
                              "700",

                            cursor:
                              "pointer",
                          }}
                        >
                          {text(
                            "Use another phone number",

                            "استخدم رقم هاتف آخر",

                            "השתמשו במספר טלפון אחר"
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ======================
                STUDENT
            ====================== */}

            {role === "student" && (
              <>
                <label>
                  {text(
                    "Email",

                    "البريد الإلكتروني",

                    "אימייל"
                  )}
                </label>

                <input
                  type="email"

                  placeholder={text(
                    "student@example.com",

                    "student@example.com",

                    "student@example.com"
                  )}

                  value={email}

                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }

                  required
                />

                <div className="student-register-info">
                  🎓{" "}

                  {text(
                    "This creates an independent student account. You will sign in with this email and your password.",

                    "هذا ينشئ حساب طالب مستقل. ستسجّل الدخول بهذا البريد الإلكتروني وكلمة المرور.",

                    "זה יוצר חשבון תלמיד עצמאי. ההתחברות תהיה באמצעות האימייל והסיסמה."
                  )}
                </div>

                <label>
                  {t.password}
                </label>

                <input
                  type="password"

                  placeholder={text(
                    "8+ characters: Aa, 1, !",

                    "8+ أحرف: Aa، 1، !",

                    "8+ תווים: Aa, 1, !"
                  )}

                  value={
                    password
                  }

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  required
                />

                <label>
                  {text(
                    "Confirm Password",

                    "تأكيد كلمة المرور",

                    "אימות סיסמה"
                  )}
                </label>

                <input
                  type="password"

                  placeholder={text(
                    "Enter your password again",

                    "أدخل كلمة المرور مرة أخرى",

                    "הזינו את הסיסמה שוב"
                  )}

                  value={
                    confirmPassword
                  }

                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }

                  required
                />

                <button
                  type="submit"

                  disabled={
                    loading
                  }

                  className="create-account-button student-create-button"
                >
                  {loading
                    ? text(
                        "Creating Account...",

                        "جارٍ إنشاء الحساب...",

                        "יוצר חשבון..."
                      )
                    : text(
                        "Create Account 🚀",

                        "إنشاء الحساب 🚀",

                        "יצירת חשבון 🚀"
                      )}
                </button>
              </>
            )}

            {/* ERROR */}

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                style={
                  successStyle
                }
              >
                {success}
              </div>
            )}
          </form>

          {/* NOTE */}

          <div className="registration-note">
            <div>
              🔒{" "}

              {text(
                "Your information is securely protected.",

                "معلوماتك محفوظة بأمان.",

                "המידע שלכם נשמר בצורה מאובטחת."
              )}
            </div>

            <div>
              💳{" "}

              {text(
                "After creating your account, you can choose your subscription plan.",

                "بعد إنشاء الحساب يمكنك اختيار الخطة المناسبة.",

                "לאחר יצירת החשבון תוכלו לבחור את תוכנית המנוי המתאימה לכם."
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
