import { useAuthNavigation } from '../auth/useAuthNavigation';
import {
  useEffect,
  useState,
} from "react";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { loadUserProfile } from "../firebase/userProfile";
import { requestPasswordReset } from "../firebase/passwordReset";
import { authMessage } from "../firebase/authMessages";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  auth,
} from "../firebase/firebase";

import {
  signInStudentWithCode,
} from "../firebase/studentLoginApi";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./Login.css";
import WelcomeHero from "../components/WelcomeHero";

function Login() {
  const { navigate } = useAuthNavigation();
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#login-section") {
      return;
    }

    const timer = window.setTimeout(() => {
      document
        .getElementById("login-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

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

  const [showPassword, setShowPassword] =
    useState(false);

  // =========================
  // STUDENT LOGIN
  // =========================

  const [
    studentLoginMethod,
    setStudentLoginMethod,
  ] = useState("class");

  const [
    studentCode,
    setStudentCode,
  ] = useState("");

  const [
    studentPassword,
    setStudentPassword,
  ] = useState("");

  const [showStudentPassword, setShowStudentPassword] =
    useState(false);

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

  const whatsappMessage = text(
    "Hello, I would like to ask about TechMinds courses and private lessons.",
    "مرحبًا، أريد الاستفسار عن دورات ودروس TechMinds.",
    "שלום, אשמח לקבל פרטים על הקורסים והשיעורים של TechMinds."
  );

  const whatsappUrl =
    `https://wa.me/972549308793?text=${encodeURIComponent(whatsappMessage)}`;

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };
  const openMode = (
    selectedMode
  ) => {
    setMode(selectedMode);

    clearMessages();

    setEmail("");
    setPassword("");
    setShowPassword(false);

    
    setStudentCode("");
    setStudentPassword("");
    setStudentLoginMethod("class");

  };

  const goBack = () => {
    setMode(null);

    clearMessages();

  };

  // =========================

  const verifyTeacherProfile =
    async (
      firebaseUser
    ) => {
      const userData = await loadUserProfile(firebaseUser);

      if (
        !userData
      ) {
        await signOut(auth);

        throw new Error(
          "teacher-profile-not-found"
        );
      }

      if (
        userData.role !== "teacher" &&
        userData.role !== "owner"
      ) {
        await signOut(auth);

        throw new Error(
          "not-teacher-or-owner"
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
        userData.role === "owner"
          ? "/owner"
          : "/teacher",
        { replace: true }
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
            "No TechMinds teacher profile is linked to this login method. Create your teacher account first.",

            "لا يوجد حساب معلّم في TechMinds مرتبط بطريقة الدخول هذه. أنشئ حساب المعلّم أولًا.",

            "לא קיים חשבון מורה ב-TechMinds המקושר לשיטת ההתחברות הזו. יש ליצור קודם חשבון מורה."
          )
        );

        return;
      }

      if (
        authError.message ===
        "not-teacher-or-owner"
      ) {
        setError(
          text(
            "This account is not a teacher or owner account.",

            "هذا الحساب ليس حساب معلّم أو مالك.",

            "חשבון זה אינו חשבון מורה או בעלים."
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

  const handleResetPassword = async () => {
    if (loading) return;
    clearMessages();
    setLoading(true);
    try {
      await requestPasswordReset(email, language);
      setSuccess(authMessage('reset-sent', language));
    } catch (error) {
      setError(authMessage(error, language, 'reset-failed'));
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
  // STUDENT LOGIN
  // =========================

  const handleStudentLogin =
    async (
      e
    ) => {
      e.preventDefault();

      clearMessages();

      if (
        !studentCode.trim() ||
        !studentPassword.length
      ) {
        setError(
          text(
            "Enter your student code or username and password.",

            "أدخل رمز الطالب وكلمة المرور.",

            "יש להזין קוד תלמיד וסיסמה."
          )
        );

        return;
      }

      setLoading(true);

      try {
        await signInStudentWithCode({
          studentCode,
          password:
            studentPassword,
        });

        navigate("/student", { replace: true });
      } catch (
        authError
      ) {
        console.error(
          "Student auth error:",
          authError.code ||
          authError.message
        );

        if (
          authError.code ===
          "functions/resource-exhausted" ||
          authError.code === "auth/too-many-requests"
        ) {
          setError(
            text(
              "Too many login attempts. Please wait and try again.",

              "محاولات دخول كثيرة. انتظر قليلًا ثم حاول مجددًا.",

              "בוצעו יותר מדי ניסיונות התחברות. יש להמתין ולנסות שוב."
            )
          );
        } else if (
          authError.code ===
          "functions/unavailable" ||
          authError.code === "auth/network-request-failed"
        ) {
          setError(
            text(
              "Student login is temporarily unavailable.",

              "دخول الطلاب غير متاح مؤقتًا.",

              "התחברות תלמידים אינה זמינה כרגע."
            )
          );
        } else if (
          authError.code ===
          "functions/not-found"
        ) {
          setError(
            text(
              "This student code or username was not found. Please check it and try again.",

              "رمز الطالب غير موجود. يرجى التحقق منه والمحاولة مرة أخرى.",

              "קוד התלמיד לא נמצא. יש לבדוק אותו ולנסות שוב."
            )
          );
        } else if (
          ["auth/wrong-password", "auth/invalid-credential", "auth/invalid-login-credentials"].includes(authError.code)
        ) {
          setError(
            text(
              "Incorrect password. Please contact your teacher to reset it.",

              "كلمة المرور غير صحيحة. تواصل مع معلمك لإعادة تعيين كلمة المرور.",

              "הסיסמה שגויה. יש לפנות למורה כדי לאפס את הסיסמה."
            )
          );
        } else if (
          authError.code ===
          "functions/failed-precondition" ||
          authError.code === "auth/user-disabled"
        ) {
          setError(
            text(
              "This account is not available right now. Please contact your teacher.",

              "هذا الحساب غير متاح حاليًا. يرجى التواصل مع معلمك.",

              "החשבון אינו זמין כרגע. יש לפנות למורה."
            )
          );
        } else {
          setError(
            text(
              "Student code, username, or password is incorrect.",

              "رمز الطالب أو كلمة المرور غير صحيحة.",

              "קוד התלמיד או הסיסמה אינם נכונים."
            )
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const verifyIndependentStudentProfile =
    async (firebaseUser) => {
      const userData = await loadUserProfile(firebaseUser);

      if (!userData) {
        await signOut(auth);
        throw new Error("student-profile-not-found");
      }
      const belongsToClass =
        userData.studentAccountType === "class" ||
        (!userData.studentAccountType &&
          Boolean(userData.classId) &&
          Boolean(userData.teacherId));

      if (userData.role !== "student") {
        await signOut(auth);
        throw new Error("not-student");
      }

      if (userData.accountStatus !== "active") {
        await signOut(auth);
        throw new Error("account-inactive");
      }

      if (belongsToClass) {
        await signOut(auth);
        throw new Error("class-student-use-code");
      }

      navigate("/student", { replace: true });
    };

  const handleIndependentStudentLogin =
    async (e) => {
      e.preventDefault();
      clearMessages();

      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail || password.length < 6) {
        setError(
          text(
            "Enter your email and password.",
            "أدخل البريد الإلكتروني وكلمة المرور.",
            "יש להזין אימייל וסיסמה."
          )
        );
        return;
      }

      setLoading(true);

      try {
        const result =
          await signInWithEmailAndPassword(
            auth,
            normalizedEmail,
            password
          );

        await verifyIndependentStudentProfile(
          result.user
        );
      } catch (authError) {
        console.error(
          "Independent student auth error:",
          authError.code || authError.message
        );

        if (authError.message === "class-student-use-code") {
          setError(
            text(
              "This student belongs to a class. Use the class-code login.",
              "هذا الطالب تابع لصف. استخدم الدخول برمز الصف ورمز الطالب.",
              "תלמיד זה שייך לכיתה. יש להתחבר באמצעות קוד הכיתה וקוד התלמיד."
            )
          );
        } else if (authError.message === "account-inactive") {
          setError(
            text(
              "This account is not active.",
              "هذا الحساب غير نشط.",
              "חשבון זה אינו פעיל."
            )
          );
        } else {
          setError(
            text(
              "Email or password is incorrect, or this is not an independent student account.",
              "البريد أو كلمة المرور غير صحيحة، أو أن الحساب ليس حساب طالب مستقل.",
              "האימייל או הסיסמה שגויים, או שזה אינו חשבון תלמיד עצמאי."
            )
          );
        }
      } finally {
        setLoading(false);
      }
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

  

  // =========================
  // JSX
  // =========================

  return (
    <div className="login-page">

      {/* LANGUAGE SWITCHER */}
      <div
        style={{
          position: "fixed",
          top: "18px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          padding: "4px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 6px 20px rgba(50, 35, 70, 0.08)",
          zIndex: 99999,
          direction: "ltr",
          pointerEvents: "auto",
        }}
      >
        {[
          { code: "en", label: "English" },
          { code: "ar", label: "العربية" },
          { code: "he", label: "עברית" },
        ].map((item) => {
          const active = language === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => changeLanguage(item.code)}
              aria-pressed={active}
              style={{
                minWidth: "84px",
                minHeight: "38px",
                padding: "8px 14px",
                borderRadius: "999px",
                border: active
                  ? "2px solid #6d28d9"
                  : "1px solid #ddd6e8",
                background: active
                  ? "#f3e8ff"
                  : "#ffffff",
                color: active
                  ? "#6d28d9"
                  : "#4b5563",
                fontWeight: 800,
                cursor: "pointer",
                position: "relative",
                zIndex: 100000,
                pointerEvents: "auto",
                touchAction: "manipulation",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* BRAND */}

      <div className="login-brand">
        <div className="brand-icon">
          🚀
        </div>

        <h1>
          TechMinds
        </h1>

        <p>
          {text(
            "Teach. Learn. Create. Grow.",

            "علّم. تعلّم. ابتكر. وتطوّر.",

            "ללמד. ללמוד. ליצור. להתפתח."
          )}
        </p>
      </div>

      {!mode && <WelcomeHero language={language} />}

      {/* =====================
          ROLE SELECTION
      ===================== */}

      {!mode && (
        <div className="login-choice" id="login-section" style={{ scrollMarginTop: "90px" }}>

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

          <>
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
              type={showPassword ? "text" : "password"}

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

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? text(
                    "Hide password",
                    "إخفاء كلمة المرور",
                    "הסתרת סיסמה"
                  )
                : text(
                    "Show password",
                    "إظهار كلمة المرور",
                    "הצגת סיסמה"
                  )}
            </button>

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
          </>

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

          <div className="student-login-methods" role="tablist">
            <button
              type="button"
              className={studentLoginMethod === "class" ? "active" : ""}
              onClick={() => {
                clearMessages();
                setStudentLoginMethod("class");
              }}
            >
              {text("Student code or username", "رمز الطالب أو اسم المستخدم", "קוד תלמיד או שם משתמש")}
            </button>
            <button
              type="button"
              className={studentLoginMethod === "independent" ? "active" : ""}
              onClick={() => {
                clearMessages();
                setStudentLoginMethod("independent");
              }}
            >
              {text("Independent student", "طالب مستقل", "תלמיד עצמאי")}
            </button>
          </div>

          <>
          <form
            onSubmit={
              studentLoginMethod === "class"
                ? handleStudentLogin
                : handleIndependentStudentLogin
            }

            className="login-form"
          >
            {studentLoginMethod === "class" && (
              <>
            <label htmlFor="student-code">
              {text(
                "Student Code or Username",

                "رمز الطالب أو اسم المستخدم",

                "קוד תלמיד או שם משתמש"
              )}
            </label>

            <input
              type="text"

              placeholder={text(
                "Example: TM-7K29PQ",

                "مثال: TM-7K29PQ",

                "לדוגמה: TM-7K29PQ"
              )}

              id="student-code"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}

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
              type={
                showStudentPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"

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

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowStudentPassword(
                  !showStudentPassword
                )
              }
            >
              {showStudentPassword
                ? text(
                    "Hide password",
                    "إخفاء كلمة المرور",
                    "הסתרת סיסמה"
                  )
                : text(
                    "Show password",
                    "إظهار كلمة المرور",
                    "הצגת סיסמה"
                  )}
            </button>
              </>
            )}

            {studentLoginMethod === "independent" && (
              <>
                <label>{text("Email", "البريد الإلكتروني", "אימייל")}</label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                <label>{text("Password", "كلمة المرور", "סיסמה")}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={text("Enter password", "أدخل كلمة المرور", "הזינו סיסמה")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? text("Hide password", "إخفاء كلمة المرور", "הסתרת סיסמה")
                    : text("Show password", "إظهار كلمة المرور", "הצגת סיסמה")}
                </button>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  style={forgotPasswordStyle}
                >
                  {text("Forgot password?", "نسيت كلمة المرور؟", "שכחת סיסמה?")}
                </button>
              </>
            )}

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            {success && (
              <p className="login-success">{success}</p>
            )}

            <button
              type="submit"

              className="main-login-button student-login-button"

              disabled={
                loading
              }
            >
              {studentLoginMethod === "class"
                ? text("Enter My Class 🚀", "ادخل إلى صفي 🚀", "כניסה לכיתה שלי 🚀")
                : text("Sign In 🚀", "تسجيل الدخول 🚀", "התחברות 🚀")}
            </button>

            {studentLoginMethod === "independent" && (
              <button
                type="button"
                className="register-button independent-register-button"
                onClick={() => navigate("/register?role=student")}
              >
                {text(
                  "Create an independent student account",
                  "إنشاء حساب طالب مستقل",
                  "יצירת חשבון תלמיד עצמאי"
                )}
              </button>
            )}
          </form>
          </>
        </div>
      )}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={text(
          "Contact us on WhatsApp",
          "تواصل معنا عبر واتساب",
          "יצירת קשר ב-WhatsApp"
        )}
        title={text(
          "Contact us on WhatsApp",
          "تواصل معنا عبر واتساب",
          "יצירת קשר ב-WhatsApp"
        )}
        style={{
          position: "fixed",
          insetInlineEnd: "22px",
          bottom: "22px",
          zIndex: 99990,
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          textDecoration: "none",
          background: "#25D366",
          color: "#ffffff",
          fontSize: "28px",
          boxShadow: "0 14px 34px rgba(37, 211, 102, 0.30)",
          border: "3px solid rgba(255,255,255,0.95)",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.04)";
          e.currentTarget.style.boxShadow =
            "0 18px 38px rgba(37, 211, 102, 0.38)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow =
            "0 14px 34px rgba(37, 211, 102, 0.30)";
        }}
      >
        💬
      </a>

      <footer className="login-about-footer">
        <Link
          className="login-guest-cta"
          to="/programs"
        >
          {text(
            "Browse as Guest",
            "تصفح كضيف",
            "גלישה כאורח"
          )}
        </Link>

        <Link
          className="login-guest-cta"
          to="/courses"
        >
          {text(
            "Courses & Private Lessons",
            "الدورات والدروس الخاصة",
            "קורסים ושיעורים פרטיים"
          )}
        </Link>

        <Link to="/about">
          {text(
            "About Us",
            "من نحن",
            "אודותינו"
          )}
        </Link>
      </footer>
    </div>
  );
}

export default Login;
