import { useAuthNavigation } from '../auth/useAuthNavigation';
import {
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { ensureUserProfile } from "../firebase/userProfile";
import { phoneDashboard } from "../firebase/phoneAuthPolicy";

import {
  useSearchParams,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  isStrongPassword,
} from "../utils/passwordPolicy";

import "./Register.css";

function Register() {
  const { navigate, finishAuth } = useAuthNavigation();

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

  const [phoneNumber, setPhoneNumber] = useState('');

  const [age, setAge] =
    useState("");

  const [grade, setGrade] =
    useState("");

  const [city, setCity] =
    useState("");

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

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const goBack = () => {
    setRole(null);
    clearMessages();
    navigate("/register");
  };

  /* ===========================
     TEACHER PROFILE
  =========================== */

  const createTeacherProfile = async (firebaseUser, { teacherName, authProvider }) => {
    const profile = await ensureUserProfile(firebaseUser, {
      role: 'teacher', name: teacherName, authProvider, preferredLanguage: language, phoneNumber,
    });
    try { phoneDashboard(profile); } catch (error) { await signOut(auth); throw error; }
    if (profile.role !== 'teacher') {
      await signOut(auth);
      throw new Error('account-role-conflict');
    }
    finishAuth('/plans');
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
     REGISTER STUDENT
  =========================== */

  const registerStudent = async () => {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    await ensureUserProfile(result.user, {
      role: "student",
      name,
      authProvider: "password",
      preferredLanguage: language,
      phoneNumber,
    });

    await updateDoc(
      doc(
        db,
        "users",
        result.user.uid
      ),
      {
        age: Number(age),
        grade: grade.trim(),
        city: city.trim(),
        updatedAt: serverTimestamp(),
      }
    );

    finishAuth("/plans");
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

      if (
        role === "student" &&
        (
          age === "" ||
          Number.isNaN(Number(age)) ||
          Number(age) < 5 ||
          Number(age) > 120
        )
      ) {
        setError(
          text(
            "Please enter a valid age between 5 and 120.",
            "أدخل عمرًا صحيحًا بين 5 و120.",
            "יש להזין גיל תקין בין 5 ל-120."
          )
        );

        return;
      }

      if (
        role === "student" &&
        !grade.trim()
      ) {
        setError(
          text(
            "Please enter your grade.",
            "أدخل الصف.",
            "יש להזין כיתה."
          )
        );

        return;
      }

      if (
        role === "student" &&
        !city.trim()
      ) {
        setError(
          text(
            "Please enter your town or city.",
            "أدخل اسم البلد.",
            "יש להזין יישוב."
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
            "This sign-in method is currently unavailable. Please try email or Google.",
            "طريقة الدخول هذه غير متاحة حاليًا. جرّب البريد الإلكتروني أو Google.",
            "שיטת התחברות זו אינה זמינה כרגע. נסו אימייל או Google."
          )
        );
        break;

      case "auth/unauthorized-domain":
      case "auth/app-not-authorized":
        setError(
          text(
            "This website domain is not authorized for authentication.",
            "نطاق هذا الموقع غير مصرح له بتسجيل الدخول.",
            "דומיין האתר אינו מורשה לאימות."
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




      case "account-role-conflict":
        setError(
          text(
            "This login already belongs to a non-teacher TechMinds account.",

            "طريقة الدخول هذه مرتبطة بحساب TechMinds ليس حساب معلّم.",

            "שיטת התחברות זו כבר משויכת לחשבון TechMinds שאינו חשבון מורה."
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

          <>
          <form
            className="register-form"
            onSubmit={
              handleRegister
            }
          >
            <label htmlFor="register-phone">{text('Contact phone (optional)', 'رقم التواصل (اختياري)', 'טלפון ליצירת קשר (לא חובה)')}</label>
            <input id="register-phone" type="tel" dir="ltr" autoComplete="tel" maxLength={40} value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} />
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

                <label htmlFor="register-age">
                  {text(
                    "Age",
                    "العمر",
                    "גיל"
                  )}
                </label>

                <input
                  id="register-age"
                  type="number"
                  min="5"
                  max="120"
                  inputMode="numeric"
                  placeholder={text(
                    "Enter your age",
                    "أدخل عمرك",
                    "הזינו גיל"
                  )}
                  value={age}
                  onChange={(e) =>
                    setAge(
                      e.target.value
                    )
                  }
                  required
                />

                <label htmlFor="register-grade">
                  {text(
                    "Grade",
                    "الصف",
                    "כיתה"
                  )}
                </label>

                <input
                  id="register-grade"
                  type="text"
                  maxLength={40}
                  placeholder={text(
                    "Example: Grade 6",
                    "مثال: الصف السادس",
                    "לדוגמה: כיתה ו׳"
                  )}
                  value={grade}
                  onChange={(e) =>
                    setGrade(
                      e.target.value
                    )
                  }
                  required
                />

                <label htmlFor="register-city">
                  {text(
                    "Town / City",
                    "البلد",
                    "יישוב"
                  )}
                </label>

                <input
                  id="register-city"
                  type="text"
                  maxLength={120}
                  placeholder={text(
                    "Enter your town or city",
                    "أدخل اسم البلد",
                    "הזינו יישוב"
                  )}
                  value={city}
                  onChange={(e) =>
                    setCity(
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
          </>

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
