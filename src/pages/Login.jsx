import {
  useEffect,
  useState,
} from "react";

import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
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

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const {
    language,
    changeLanguage,
  } = useLanguage();

  const [mode, setMode] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================
  // TEACHER LOGIN
  // =========================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // =========================
  // PHONE LOGIN
  // =========================

  const [
    showPhoneLogin,
    setShowPhoneLogin,
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

  // =========================
  // STUDENT LOGIN
  // =========================

  const [
    studentCode,
    setStudentCode,
  ] = useState("");

  const [
    classCode,
    setClassCode,
  ] = useState("");

  const [
    studentPassword,
    setStudentPassword,
  ] = useState("");

  // =========================
  // TRANSLATION HELPER
  // =========================

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

  // =========================
  // CLEANUP RECAPTCHA
  // =========================

  useEffect(() => {
    return () => {
      if (
        window.recaptchaVerifier
      ) {
        try {
          window.recaptchaVerifier.clear();
        } catch (
          cleanupError
        ) {
          console.warn(
            "reCAPTCHA cleanup error:",
            cleanupError
          );
        }

        window.recaptchaVerifier =
          null;
      }
    };
  }, []);

  // =========================
  // HELPERS
  // =========================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const resetPhoneLogin = () => {
    setPhoneNumber("");
    setVerificationCode("");
    setConfirmationResult(null);
    setCodeSent(false);

    if (
      window.recaptchaVerifier
    ) {
      try {
        window.recaptchaVerifier.clear();
      } catch (
        cleanupError
      ) {
        console.warn(
          "reCAPTCHA cleanup error:",
          cleanupError
        );
      }

      window.recaptchaVerifier =
        null;
    }
  };

  const openMode = (
    selectedMode
  ) => {
    setMode(selectedMode);

    clearMessages();

    setEmail("");
    setPassword("");

    setClassCode("");
    setStudentCode("");
    setStudentPassword("");

    setShowPhoneLogin(false);

    resetPhoneLogin();
  };

  const goBack = () => {
    setMode(null);

    clearMessages();

    setShowPhoneLogin(false);

    resetPhoneLogin();
  };

  // =========================
  // PHONE NORMALIZATION
  // =========================

  const normalizePhoneNumber = (
    value
  ) => {
    const cleaned = value
      .trim()
      .replace(
        /[\s\-()]/g,
        ""
      );

    // Israeli format:
    // 0501234567
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

    // 972501234567
    if (
      /^9725\d{8}$/.test(
        cleaned
      )
    ) {
      return "+" + cleaned;
    }

    // International format
    if (
      /^\+\d{8,15}$/.test(
        cleaned
      )
    ) {
      return cleaned;
    }

    return null;
  };

  // =========================
  // VERIFY TEACHER PROFILE
  // =========================

  const verifyTeacherProfile =
    async (
      firebaseUser
    ) => {
      const userSnap =
        await getDoc(
          doc(
            db,
            "users",
            firebaseUser.uid
          )
        );

      if (
        !userSnap.exists()
      ) {
        await signOut(auth);

        throw new Error(
          "teacher-profile-not-found"
        );
      }

      const userData =
        userSnap.data();

      if (
        userData.role !==
        "teacher"
      ) {
        await signOut(auth);

        throw new Error(
          "not-teacher"
        );
      }

      if (
        userData.accountStatus ===
        "blocked"
      ) {
        await signOut(auth);

        throw new Error(
          "account-blocked"
        );
      }

      navigate(
        "/teacher"
      );
    };

  // =========================
  // TEACHER AUTH ERRORS
  // =========================

  const handleTeacherAuthError =
    (
      authError
    ) => {
      console.error(
        "Teacher auth error:",
        authError
      );

      if (
        authError.message ===
        "teacher-profile-not-found"
      ) {
        setError(
          text(
            "No TeachLearn teacher profile is linked to this login method. Create your teacher account first.",

            "لا يوجد حساب معلّم في TeachLearn مرتبط بطريقة الدخول هذه. أنشئ حساب المعلّم أولًا.",

            "לא קיים חשבון מורה ב-TeachLearn המקושר לשיטת ההתחברות הזו. יש ליצור קודם חשבון מורה."
          )
        );

        return;
      }

      if (
        authError.message ===
        "not-teacher"
      ) {
        setError(
          text(
            "This account is not a teacher account.",

            "هذا الحساب ليس حساب معلّم.",

            "חשבון זה אינו חשבון מורה."
          )
        );

        return;
      }

      if (
        authError.message ===
        "account-blocked"
      ) {
        setError(
          text(
            "This account has been blocked.",

            "تم حظر هذا الحساب.",

            "חשבון זה נחסם."
          )
        );

        return;
      }

      if (
        authError.code ===
          "auth/invalid-credential" ||
        authError.code ===
          "auth/wrong-password" ||
        authError.code ===
          "auth/user-not-found"
      ) {
        setError(
          text(
            "Email or password is incorrect.",

            "البريد الإلكتروني أو كلمة المرور غير صحيحة.",

            "כתובת האימייל או הסיסמה אינם נכונים."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/invalid-email"
      ) {
        setError(
          text(
            "Please enter a valid email address.",

            "أدخل بريدًا إلكترونيًا صحيحًا.",

            "יש להזין כתובת אימייל תקינה."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          text(
            "Google sign-in was cancelled.",

            "تم إلغاء تسجيل الدخول بواسطة Google.",

            "ההתחברות באמצעות Google בוטלה."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/popup-blocked"
      ) {
        setError(
          text(
            "Your browser blocked the Google sign-in window. Allow popups and try again.",

            "المتصفح منع نافذة تسجيل الدخول بواسطة Google. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.",

            "הדפדפן חסם את חלון ההתחברות של Google. יש לאפשר חלונות קופצים ולנסות שוב."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/account-exists-with-different-credential"
      ) {
        setError(
          text(
            "This email already belongs to an account using another sign-in method.",

            "هذا البريد مرتبط بحساب يستخدم طريقة دخول أخرى.",

            "כתובת אימייל זו כבר משויכת לחשבון המשתמש בשיטת התחברות אחרת."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/invalid-phone-number"
      ) {
        setError(
          text(
            "The phone number is invalid.",

            "رقم الهاتف غير صحيح.",

            "מספר הטלפון אינו תקין."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/too-many-requests"
      ) {
        setError(
          text(
            "Too many attempts. Please try again later.",

            "عدد المحاولات كبير جدًا. حاول مرة أخرى لاحقًا.",

            "בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר."
          )
        );

        return;
      }

      if (
        authError.code ===
          "auth/invalid-verification-code" ||
        authError.code ===
          "auth/code-expired"
      ) {
        setError(
          text(
            "The verification code is incorrect or expired.",

            "رمز التحقق غير صحيح أو انتهت صلاحيته.",

            "קוד האימות שגוי או שפג תוקפו."
          )
        );

        return;
      }

      if (
        authError.code ===
        "auth/captcha-check-failed"
      ) {
        setError(
          text(
            "reCAPTCHA verification failed. Please try again.",

            "فشل التحقق من reCAPTCHA. حاول مرة أخرى.",

            "אימות reCAPTCHA נכשל. נסו שוב."
          )
        );

        return;
      }

      setError(
        text(
          "Could not sign in. Please try again.",

          "تعذر تسجيل الدخول. حاول مرة أخرى.",

          "לא ניתן להתחבר. נסו שוב."
        )
      );
    };

  // =========================
  // EMAIL LOGIN
  // =========================

  const handleTeacherLogin =
    async (
      e
    ) => {
      e.preventDefault();

      clearMessages();

      setLoading(true);

      try {
        const result =
          await signInWithEmailAndPassword(
            auth,
            email
              .trim()
              .toLowerCase(),
            password
          );

        await verifyTeacherProfile(
          result.user
        );
      } catch (
        authError
      ) {
        handleTeacherAuthError(
          authError
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // RESET PASSWORD
  // =========================

  const handleResetPassword =
    async () => {
      clearMessages();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (
        !normalizedEmail
      ) {
        setError(
          text(
            "Enter your email first, then click Forgot password.",

            "أدخل بريدك الإلكتروني أولًا ثم اضغط نسيت كلمة المرور.",

            "יש להזין תחילה את כתובת האימייל ולאחר מכן ללחוץ על שכחתי סיסמה."
          )
        );

        return;
      }

      setLoading(true);

      try {
        auth.languageCode =
          language;

        await sendPasswordResetEmail(
          auth,
          normalizedEmail
        );

        setSuccess(
          text(
            "Password reset email sent. Check your inbox and spam folder.",

            "تم إرسال رابط إعادة تعيين كلمة المرور. افحص البريد الوارد ومجلد الرسائل غير المرغوب فيها.",

            "נשלח קישור לאיפוס הסיסמה. בדקו את תיבת הדואר הנכנס ואת תיקיית הספאם."
          )
        );
      } catch (
        resetError
      ) {
        console.error(
          "Password reset error:",
          resetError
        );

        if (
          resetError.code ===
          "auth/invalid-email"
        ) {
          setError(
            text(
              "Please enter a valid email address.",

              "أدخل بريدًا إلكترونيًا صحيحًا.",

              "יש להזין כתובת אימייל תקינה."
            )
          );
        } else if (
          resetError.code ===
          "auth/too-many-requests"
        ) {
          setError(
            text(
              "Too many attempts. Please try again later.",

              "عدد المحاولات كبير جدًا. حاول مرة أخرى لاحقًا.",

              "בוצעו יותר מדי ניסיונות. נסו שוב מאוחר יותר."
            )
          );
        } else {
          setError(
            text(
              "Could not send the reset email. Please try again.",

              "تعذر إرسال رابط إعادة تعيين كلمة المرور. حاول مرة أخرى.",

              "לא ניתן לשלוח את הודעת איפוס הסיסמה. נסו שוב."
            )
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin =
    async () => {
      clearMessages();

      setLoading(true);

      try {
        const provider =
          new GoogleAuthProvider();

        provider.setCustomParameters(
          {
            prompt:
              "select_account",
          }
        );

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        await verifyTeacherProfile(
          result.user
        );
      } catch (
        authError
      ) {
        handleTeacherAuthError(
          authError
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // RECAPTCHA
  // =========================

  const setupRecaptcha = () => {
    if (
      window.recaptchaVerifier
    ) {
      try {
        window.recaptchaVerifier.clear();
      } catch (
        cleanupError
      ) {
        console.warn(
          "reCAPTCHA cleanup error:",
          cleanupError
        );
      }

      window.recaptchaVerifier =
        null;
    }

    auth.languageCode =
      language;

    window.recaptchaVerifier =
      new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",

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

    return window
      .recaptchaVerifier;
  };

  // =========================
  // SEND PHONE CODE
  // =========================

  const handleSendPhoneCode =
    async () => {
      clearMessages();

      const normalizedPhone =
        normalizePhoneNumber(
          phoneNumber
        );

      if (
        !normalizedPhone
      ) {
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
          setupRecaptcha();

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
            "A verification code was sent by SMS.",

            "تم إرسال رمز التحقق برسالة SMS.",

            "קוד אימות נשלח בהודעת SMS."
          )
        );
      } catch (
        authError
      ) {
        handleTeacherAuthError(
          authError
        );

        if (
          window.recaptchaVerifier
        ) {
          try {
            window.recaptchaVerifier.clear();
          } catch (
            cleanupError
          ) {
            console.warn(
              "reCAPTCHA cleanup error:",
              cleanupError
            );
          }

          window.recaptchaVerifier =
            null;
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // VERIFY PHONE CODE
  // =========================

  const handleVerifyPhoneCode =
    async () => {
      clearMessages();

      if (
        !confirmationResult
      ) {
        setError(
          text(
            "Send the SMS code first.",

            "أرسل رمز SMS أولًا.",

            "יש לשלוח תחילה קוד SMS."
          )
        );

        return;
      }

      if (
        verificationCode.trim()
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

        await verifyTeacherProfile(
          result.user
        );
      } catch (
        authError
      ) {
        handleTeacherAuthError(
          authError
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // STUDENT LOGIN
  // =========================

  const handleStudentLogin =
    async (
      e
    ) => {
      e.preventDefault();

      clearMessages();

      console.log({
        classCode,
        studentCode,
        studentPassword,
      });

      setError(
        text(
          "Student login will be activated after we create the student login system.",

          "سيتم تفعيل دخول الطالب بعد إنشاء نظام دخول الطلاب.",

          "התחברות התלמיד תופעל לאחר שנשלים את מערכת התחברות התלמידים."
        )
      );
    };

  // =========================
  // STYLES
  // =========================

  const isRTL =
    language === "ar" ||
    language === "he";

  const forgotPasswordStyle =
    {
      width:
        "fit-content",

      alignSelf:
        isRTL
          ? "flex-start"
          : "flex-end",

      padding: "0",

      margin:
        "-4px 0 12px",

      border: "none",

      background:
        "transparent",

      color: "#6d28d9",

      fontWeight: "700",

      fontSize: "13px",

      cursor: loading
        ? "not-allowed"
        : "pointer",

      opacity: loading
        ? 0.6
        : 1,
    };

  const dividerStyle = {
    display: "flex",

    alignItems: "center",

    gap: "12px",

    width: "100%",

    margin: "20px 0",

    color: "#9ca3af",

    fontSize: "12px",

    fontWeight: "700",
  };

  const dividerLineStyle =
    {
      flex: 1,

      height: "1px",

      background:
        "#e5e7eb",
    };

  const alternativeButtonStyle =
    {
      width: "100%",

      minHeight: "46px",

      marginBottom:
        "10px",

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

      cursor: loading
        ? "not-allowed"
        : "pointer",

      opacity: loading
        ? 0.6
        : 1,
    };

  const phoneBoxStyle =
    {
      width: "100%",

      boxSizing:
        "border-box",

      marginTop:
        "12px",

      padding: "16px",

      border:
        "1px solid #e8e2ed",

      borderRadius:
        "14px",

      background:
        "#faf9fc",
    };

  const phoneInputStyle =
    {
      width: "100%",

      boxSizing:
        "border-box",

      minHeight:
        "44px",

      margin:
        "7px 0 12px",

      padding:
        "10px 12px",

      border:
        "1px solid #d7d0de",

      borderRadius:
        "10px",

      fontSize:
        "14px",

      outline:
        "none",
    };

  const phoneActionStyle =
    {
      width: "100%",

      minHeight:
        "44px",

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

      cursor: loading
        ? "not-allowed"
        : "pointer",

      opacity: loading
        ? 0.6
        : 1,
    };

  const successStyle =
    {
      width: "100%",

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

  // =========================
  // LANGUAGE BUTTONS
  // =========================

  const languageBarStyle =
    {
      display: "flex",

      justifyContent:
        "center",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap: "8px",

      marginBottom:
        "20px",
    };

  const languageButtonStyle =
    (
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

  // =========================
  // JSX
  // =========================

  return (
    <div className="login-page">

      {/* LANGUAGE SWITCHER */}

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

      <div className="login-brand">
        <div className="brand-icon">
          🚀
        </div>

        <h1>
          TeachLearn
        </h1>

        <p>
          {text(
            "Teach. Learn. Create. Grow.",

            "علّم. تعلّم. ابتكر. وتطوّر.",

            "ללמד. ללמוד. ליצור. להתפתח."
          )}
        </p>
      </div>

      {/* =====================
          ROLE SELECTION
      ===================== */}

      {!mode && (
        <div className="login-choice">

          {/* TEACHER */}

          <div className="login-card teacher-card">
            <div className="login-icon">
              👩‍🏫
            </div>

            <h2>
              {text(
                "Teacher",
                "المعلّم",
                "מורה"
              )}
            </h2>

            <p>
              {text(
                "Manage classes, students, lessons and learning activities.",

                "أدِر الصفوف والطلاب والدروس والفعاليات التعليمية.",

                "נהלו כיתות, תלמידים, שיעורים ופעילויות למידה."
              )}
            </p>

            <button
              onClick={() =>
                openMode(
                  "teacher"
                )
              }
            >
              {text(
                "Teacher Login",
                "دخول المعلّم",
                "כניסת מורה"
              )}
            </button>

            <button
              className="create-secondary teacher-create"

              onClick={(
                e
              ) => {
                e.stopPropagation();

                navigate(
                  "/register?role=teacher"
                );
              }}
            >
              {text(
                "Create Teacher Account",
                "إنشاء حساب معلّم",
                "יצירת חשבון מורה"
              )}
            </button>
          </div>

          {/* STUDENT */}

          <div className="login-card student-card">
            <div className="login-icon">
              🎓
            </div>

            <h2>
              {text(
                "Student",
                "الطالب",
                "תלמיד"
              )}
            </h2>

            <p>
              {text(
                "Learn, complete challenges, earn XP and create amazing projects.",

                "تعلّم، أنجز التحديات، اجمع النقاط وأنشئ مشاريع رائعة.",

                "למדו, השלימו אתגרים, צברו נקודות וצרו פרויקטים מדהימים."
              )}
            </p>

            <button
              onClick={() =>
                openMode(
                  "student"
                )
              }
            >
              {text(
                "Student Login",
                "دخول الطالب",
                "כניסת תלמיד"
              )}
            </button>

            <button
              className="create-secondary student-create"

              onClick={(
                e
              ) => {
                e.stopPropagation();

                navigate(
                  "/register?role=student"
                );
              }}
            >
              {text(
                "Create Student Account",
                "إنشاء حساب طالب",
                "יצירת חשבון תלמיד"
              )}
            </button>
          </div>
        </div>
      )}

      {/* =====================
          TEACHER LOGIN
      ===================== */}

      {mode ===
        "teacher" && (
        <div className="login-form-container">

          <button
            className="back-button"
            onClick={goBack}
          >
            {text(
              "← Back",
              "↩ رجوع",
              "↩ חזרה"
            )}
          </button>

          <div className="form-icon">
            👩‍🏫
          </div>

          <h2>
            {text(
              "Teacher Login",
              "دخول المعلّم",
              "כניסת מורה"
            )}
          </h2>

          <p className="form-subtitle">
            {text(
              "Welcome back!",
              "أهلًا بعودتك!",
              "ברוכים השבים!"
            )}
          </p>

          <form
            onSubmit={
              handleTeacherLogin
            }
            className="login-form"
          >
            <label>
              {text(
                "Email",
                "البريد الإلكتروني",
                "דואר אלקטרוני"
              )}
            </label>

            <input
              type="email"
              placeholder="teacher@example.com"
              value={email}

              onChange={(
                e
              ) =>
                setEmail(
                  e.target
                    .value
                )
              }

              required
            />

            <label>
              {text(
                "Password",
                "كلمة المرور",
                "סיסמה"
              )}
            </label>

            <input
              type="password"

              placeholder={text(
                "Enter password",
                "أدخل كلمة المرور",
                "הזינו סיסמה"
              )}

              value={
                password
              }

              onChange={(
                e
              ) =>
                setPassword(
                  e.target
                    .value
                )
              }

              required
            />

            {/* RESET PASSWORD */}

            <button
              type="button"

              onClick={
                handleResetPassword
              }

              disabled={
                loading
              }

              style={
                forgotPasswordStyle
              }
            >
              {text(
                "Forgot password?",
                "نسيت كلمة المرور؟",
                "שכחת סיסמה?"
              )}
            </button>

            <button
              type="submit"

              className="main-login-button teacher-login-button"

              disabled={
                loading
              }
            >
              {loading
                ? text(
                    "Logging in...",
                    "جارٍ تسجيل الدخول...",
                    "מתחבר..."
                  )
                : text(
                    "Login as Teacher",
                    "الدخول كمعلّم",
                    "כניסה כמורה"
                  )}
            </button>
          </form>

          {/* DIVIDER */}

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
              handleGoogleLogin
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

              setShowPhoneLogin(
                (
                  current
                ) =>
                  !current
              );
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

          {/* PHONE LOGIN BOX */}

          {showPhoneLogin && (
            <div
              style={
                phoneBoxStyle
              }
            >
              {!codeSent ? (
                <>
                  <label>
                    {text(
                      "Phone number",
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

                    onChange={(
                      e
                    ) =>
                      setPhoneNumber(
                        e.target
                          .value
                      )
                    }

                    style={
                      phoneInputStyle
                    }
                  />

                  <div
                    id="recaptcha-container"

                    style={{
                      marginBottom:
                        "12px",
                    }}
                  />

                  <button
                    type="button"

                    onClick={
                      handleSendPhoneCode
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
                </>
              ) : (
                <>
                  <label>
                    {text(
                      "Verification code",

                      "رمز التحقق",

                      "קוד אימות"
                    )}
                  </label>

                  <input
                    type="text"

                    inputMode="numeric"

                    maxLength={
                      6
                    }

                    placeholder="123456"

                    value={
                      verificationCode
                    }

                    onChange={(
                      e
                    ) =>
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
                      handleVerifyPhoneCode
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
                          "Verify and login",

                          "تحقق وسجّل الدخول",

                          "אימות והתחברות"
                        )}
                  </button>

                  <button
                    type="button"

                    onClick={() => {
                      resetPhoneLogin();

                      clearMessages();
                    }}

                    style={{
                      width:
                        "100%",

                      marginTop:
                        "10px",

                      padding:
                        "4px",

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

          {/* ERRORS */}

          {error && (
            <p className="login-error">
              {error}
            </p>
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

          <p className="register-text">
            {text(
              "Don't have an account?",

              "ليس لديك حساب؟",

              "אין לכם חשבון?"
            )}
          </p>

          <button
            className="register-button"

            onClick={() =>
              navigate(
                "/register?role=teacher"
              )
            }
          >
            {text(
              "Create Teacher Account",

              "إنشاء حساب معلّم",

              "יצירת חשבון מורה"
            )}
          </button>
        </div>
      )}

      {/* =====================
          STUDENT LOGIN
      ===================== */}

      {mode ===
        "student" && (
        <div className="login-form-container student-form">

          <button
            className="back-button"
            onClick={goBack}
          >
            {text(
              "← Back",
              "↩ رجوع",
              "↩ חזרה"
            )}
          </button>

          <div className="form-icon">
            🎓
          </div>

          <h2>
            {text(
              "Student Login",
              "دخول الطالب",
              "כניסת תלמיד"
            )}
          </h2>

          <p className="form-subtitle">
            {text(
              "Ready for your next challenge?",

              "هل أنت مستعد للتحدي القادم؟",

              "מוכנים לאתגר הבא?"
            )}
          </p>

          <form
            onSubmit={
              handleStudentLogin
            }

            className="login-form"
          >
            <label>
              {text(
                "Class Code",
                "رمز الصف",
                "קוד כיתה"
              )}
            </label>

            <input
              type="text"

              placeholder={text(
                "Example: 5A2026",
                "مثال: 5A2026",
                "לדוגמה: 5A2026"
              )}

              value={
                classCode
              }

              onChange={(
                e
              ) =>
                setClassCode(
                  e.target
                    .value
                )
              }

              required
            />

            <label>
              {text(
                "Student Code",

                "رمز الطالب",

                "קוד תלמיד"
              )}
            </label>

            <input
              type="text"

              placeholder={text(
                "Example: TL-7K29PQ",

                "مثال: TL-7K29PQ",

                "לדוגמה: TL-7K29PQ"
              )}

              value={
                studentCode
              }

              onChange={(
                e
              ) =>
                setStudentCode(
                  e.target
                    .value
                )
              }

              required
            />

            <label>
              {text(
                "Password",
                "كلمة المرور",
                "סיסמה"
              )}
            </label>

            <input
              type="password"

              placeholder={text(
                "Enter password",

                "أدخل كلمة المرور",

                "הזינו סיסמה"
              )}

              value={
                studentPassword
              }

              onChange={(
                e
              ) =>
                setStudentPassword(
                  e.target
                    .value
                )
              }

              required
            />

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"

              className="main-login-button student-login-button"

              disabled={
                loading
              }
            >
              {text(
                "Enter My Class 🚀",

                "ادخل إلى صفي 🚀",

                "כניסה לכיתה שלי 🚀"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;