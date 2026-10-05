import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import {
  loadUserProfile,
  savePersonalProfile,
  saveContactPhone,
} from "../firebase/userProfile";
import {
  linkEmailPassword,
  resendEmailVerification,
} from "../firebase/accountLinking";
import { authMessage } from "../firebase/authMessages";
import { useLanguage } from "../context/LanguageContext";
import "./Profile.css";

const profileServices = {
  watchUser: (callback) =>
    onAuthStateChanged(auth, callback),

  load: loadUserProfile,
  save: savePersonalProfile,
  savePhone: saveContactPhone,
  linkEmail: linkEmailPassword,
  verifyEmail: resendEmailVerification,
};

export default function Profile({
  services = profileServices,
}) {
  const {
    language,
    changeLanguage,
  } = useLanguage();

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [name, setName] =
    useState("");

  const [
    preferredLanguage,
    setPreferredLanguage,
  ] = useState(language);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [success, setSuccess] =
    useState("");

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [age, setAge] =
    useState("");

  const [grade, setGrade] =
    useState("");

  const [city, setCity] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const mounted = useRef(false);
  const lock = useRef(false);

  const text = (
    en,
    ar,
    he
  ) =>
    language === "ar"
      ? ar
      : language === "he"
        ? he
        : en;

  const direction =
    language === "en"
      ? "ltr"
      : "rtl";

  useEffect(() => {
    mounted.current = true;

    let version = 0;

    const unsubscribe =
      services.watchUser(
        async (current) => {
          const request =
            ++version;

          setUser(current);
          setProfile(null);
          setLoading(true);
          setError(null);

          if (!current) {
            setLoading(false);
            return;
          }

          try {
            const data =
              await services.load(
                current
              );

            if (
              !mounted.current ||
              request !== version
            ) {
              return;
            }

            if (!data) {
              throw new Error(
                "profile-not-found"
              );
            }

            setProfile(data);

            setName(
              data.name ||
              current.displayName ||
              ""
            );

            if (
              [
                "en",
                "ar",
                "he",
              ].includes(
                data.preferredLanguage
              )
            ) {
              setPreferredLanguage(
                data.preferredLanguage
              );
            }

            setEmail(
              current.email || ""
            );

            setPhoneNumber(
              Object.hasOwn(
                data,
                "phoneNumber"
              )
                ? data.phoneNumber || ""
                : current.phoneNumber || ""
            );


            setAge(
              data.age != null
                ? String(data.age)
                : ""
            );

            setGrade(
              data.grade || ""
            );

            setCity(
              data.city ||
              data.town ||
              data.locality ||
              ""
            );
          } catch (failure) {
            if (
              mounted.current &&
              request === version
            ) {
              setError(failure);
            }
          } finally {
            if (
              mounted.current &&
              request === version
            ) {
              setLoading(false);
            }
          }
        }
      );

    return () => {
      mounted.current = false;
      version++;
      unsubscribe();
    };
  }, [services]);

  async function action(
    work,
    message
  ) {
    if (lock.current) {
      return;
    }

    lock.current = true;
    setBusy(true);
    setError(null);
    setSuccess("");

    try {
      await work();

      if (mounted.current) {
        setSuccess(message);
      }
    } catch (failure) {
      if (mounted.current) {
        setError(failure);
      }
    } finally {
      lock.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  }

  const save = (event) => {
    event.preventDefault();

    return action(
      async () => {
        const saved =
          await services.save(
            user,
            {
              name,
              preferredLanguage,
            }
          );

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            age:
              age === ""
                ? null
                : Number(age),
            grade:
              grade.trim() || null,
            city:
              city.trim() || null,
            updatedAt:
              serverTimestamp(),
          }
        );

        if (mounted.current) {
          setProfile(
            (current) => ({
              ...current,
              ...saved,
            })
          );

          changeLanguage(
            preferredLanguage
          );
        }
      },
      "saved"
    );
  };

  const linkEmail = (
    event
  ) => {
    event.preventDefault();

    return action(
      async () => {
        try {
          await services.linkEmail(
            user,
            email,
            password,
            language
          );
        } finally {
          if (mounted.current) {
            setPassword("");
          }
        }
      },
      "linked"
    );
  };

  const savePhone = (
    event
  ) => {
    event.preventDefault();

    return action(
      async () => {
        const saved =
          await services.savePhone(
            user,
            phoneNumber
          );

        if (mounted.current) {
          setProfile(
            (previous) => ({
              ...previous,
              phoneNumber: saved,
            })
          );

          setPhoneNumber(
            saved || ""
          );
        }
      },
      "phone-saved"
    );
  };

  const dashboard = {
    student: "/student",
    teacher: "/teacher",
    owner: "/owner",
  }[profile?.role] || "/login";

  const hasPassword =
    user?.providerData?.some(
      (provider) =>
        provider.providerId ===
        "password"
    );

  const roleLabel =
    {
      student: text(
        "Student",
        "طالب",
        "תלמיד"
      ),
      teacher: text(
        "Teacher",
        "معلّم",
        "מורה"
      ),
      owner: text(
        "Owner",
        "مالك",
        "בעלים"
      ),
    }[profile?.role] ||
    profile?.role;

  const successMessage = {
    saved: text(
      "Profile saved.",
      "تم حفظ الملف.",
      "הפרופיל נשמר."
    ),

    "phone-saved": text(
      "Contact phone saved.",
      "تم حفظ رقم التواصل.",
      "מספר הטלפון נשמר."
    ),

    linked: text(
      "Email/password sign-in was added successfully.",
      "تمت إضافة تسجيل الدخول بالبريد وكلمة المرور بنجاح.",
      "כניסה באמצעות אימייל וסיסמה נוספה בהצלחה."
    ),

    "verification-sent": text(
      "Verification email sent. Check your inbox.",
      "تم إرسال رسالة التحقق. افحص بريدك.",
      "הודעת אימות נשלחה. בדקו את תיבת הדואר."
    ),
  }[success];

  return (
    <main
      className="profile-page"
      dir={direction}
      lang={language}
    >
      <section className="profile-card">

        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">
              TechMinds
            </p>

            <h1>
              {text(
                "My Profile",
                "ملفي الشخصي",
                "הפרופיל שלי"
              )}
            </h1>
          </div>

          <Link
            className="profile-dashboard-link"
            to={dashboard}
          >
            {text(
              "Dashboard",
              "لوحة التحكم",
              "לוח הבקרה"
            )}
          </Link>
        </header>

        <nav
          className="profile-languages"
          aria-label={text(
            "Language",
            "اللغة",
            "שפה"
          )}
        >
          {[
            ["en", "English"],
            ["ar", "العربية"],
            ["he", "עברית"],
          ].map(
            ([
              value,
              label,
            ]) => (
              <button
                key={value}
                type="button"
                aria-pressed={
                  language === value
                }
                onClick={() =>
                  changeLanguage(
                    value
                  )
                }
              >
                {label}
              </button>
            )
          )}
        </nav>

        {loading && (
          <p
            className="profile-message"
            role="status"
          >
            {text(
              "Loading profile…",
              "جارٍ تحميل الملف…",
              "טוען את הפרופיל…"
            )}
          </p>
        )}

        {!loading &&
          !user && (
            <Link
              to="/login"
              className="profile-login-link"
            >
              {text(
                "Sign in",
                "تسجيل الدخول",
                "כניסה"
              )}
            </Link>
          )}

        {error && (
          <p
            className="profile-message profile-error"
            role="alert"
          >
            {authMessage(
              error,
              language
            )}
          </p>
        )}

        {successMessage && (
          <p
            className="profile-message profile-success"
            role="status"
          >
            {successMessage}
          </p>
        )}

        {user && profile && (
          <>
            <section className="profile-section">
              <h2>
                {text(
                  "Account details",
                  "تفاصيل الحساب",
                  "פרטי החשבון"
                )}
              </h2>

              <dl className="profile-details">
                <div>
                  <dt>
                    {text(
                      "Email",
                      "البريد الإلكتروني",
                      "אימייל"
                    )}
                  </dt>

                  <dd dir="ltr">
                    {user.email ||
                      "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    {text(
                      "Phone number",
                      "رقم الهاتف",
                      "מספר טלפון"
                    )}
                  </dt>

                  <dd dir="ltr">
                    {(
                      Object.hasOwn(
                        profile,
                        "phoneNumber"
                      )
                        ? profile.phoneNumber
                        : user.phoneNumber
                    ) || "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    {text(
                      "Role",
                      "الدور",
                      "תפקיד"
                    )}
                  </dt>

                  <dd>
                    {roleLabel}
                  </dd>
                </div>


                <div>
                  <dt>
                    {text(
                      "Age",
                      "العمر",
                      "גיל"
                    )}
                  </dt>

                  <dd>
                    {age || "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    {text(
                      "Grade",
                      "الصف",
                      "כיתה"
                    )}
                  </dt>

                  <dd>
                    {grade || "—"}
                  </dd>
                </div>

                <div>
                  <dt>
                    {text(
                      "Town / city",
                      "البلد",
                      "יישוב"
                    )}
                  </dt>

                  <dd>
                    {city || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="profile-section">
              <h2>
                {text(
                  "Personal preferences",
                  "التفضيلات الشخصية",
                  "העדפות אישיות"
                )}
              </h2>

              <form
                onSubmit={save}
                className="profile-form"
              >
                <label htmlFor="profile-name">
                  {text(
                    "Display name",
                    "الاسم المعروض",
                    "שם תצוגה"
                  )}
                </label>

                <input
                  id="profile-name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={name}
                  disabled={busy}
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                />

                <label htmlFor="profile-age">
                  {text(
                    "Age",
                    "العمر",
                    "גיל"
                  )}
                </label>

                <input
                  id="profile-age"
                  type="number"
                  min="5"
                  max="120"
                  inputMode="numeric"
                  value={age}
                  disabled={busy}
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                />

                <label htmlFor="profile-grade">
                  {text(
                    "Grade",
                    "الصف",
                    "כיתה"
                  )}
                </label>

                <input
                  id="profile-grade"
                  type="text"
                  maxLength={40}
                  value={grade}
                  disabled={busy}
                  placeholder={text(
                    "Example: Grade 6",
                    "مثال: الصف السادس",
                    "לדוגמה: כיתה ו׳"
                  )}
                  onChange={(event) =>
                    setGrade(event.target.value)
                  }
                />

                <label htmlFor="profile-city">
                  {text(
                    "Town / city",
                    "البلد",
                    "יישוב"
                  )}
                </label>

                <input
                  id="profile-city"
                  type="text"
                  maxLength={120}
                  value={city}
                  disabled={busy}
                  placeholder={text(
                    "Your town or city",
                    "اكتب اسم البلد",
                    "היישוב שלך"
                  )}
                  onChange={(event) =>
                    setCity(event.target.value)
                  }
                />

                <label htmlFor="profile-language">
                  {text(
                    "Preferred language",
                    "اللغة المفضلة",
                    "שפה מועדפת"
                  )}
                </label>

                <select
                  id="profile-language"
                  value={
                    preferredLanguage
                  }
                  disabled={busy}
                  onChange={(
                    event
                  ) =>
                    setPreferredLanguage(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="en">
                    English
                  </option>

                  <option value="ar">
                    العربية
                  </option>

                  <option value="he">
                    עברית
                  </option>
                </select>

                <button
                  type="submit"
                  disabled={busy}
                >
                  {text(
                    "Save profile",
                    "حفظ الملف",
                    "שמירת פרופיל"
                  )}
                </button>
              </form>
            </section>

            <section className="profile-linking">
              <h2>
                {text(
                  "Contact phone",
                  "رقم التواصل",
                  "טלפון ליצירת קשר"
                )}
              </h2>

              <p>
                {text(
                  "Optional contact details. No SMS verification is required.",
                  "بيانات تواصل اختيارية. لا يلزم التحقق برسالة SMS.",
                  "פרטי קשר לא חובה. אין צורך באימות באמצעות SMS."
                )}
              </p>

              <form
                className="profile-form"
                onSubmit={
                  savePhone
                }
              >
                <label htmlFor="profile-phone">
                  {text(
                    "Phone number (optional)",
                    "رقم الهاتف (اختياري)",
                    "מספר טלפון (לא חובה)"
                  )}
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  maxLength={40}
                  value={
                    phoneNumber
                  }
                  disabled={busy}
                  onChange={(
                    event
                  ) =>
                    setPhoneNumber(
                      event.target
                        .value
                    )
                  }
                />

                <button
                  type="submit"
                  disabled={busy}
                >
                  {text(
                    "Save contact phone",
                    "حفظ رقم التواصل",
                    "שמירת מספר טלפון"
                  )}
                </button>
              </form>
            </section>

            {!hasPassword && (
              <section className="profile-linking">
                <h2>
                  {text(
                    "Add email/password sign-in",
                    "إضافة الدخول بالبريد وكلمة المرور",
                    "הוספת כניסה באמצעות אימייל וסיסמה"
                  )}
                </h2>

                <p>
                  {text(
                    "Link a new sign-in method to this account. An email already used by another account cannot be merged here.",
                    "اربط طريقة دخول جديدة بهذا الحساب. لا يمكن دمج بريد مستخدم بحساب آخر هنا.",
                    "אפשר לקשר שיטת כניסה נוספת לחשבון זה. לא ניתן למזג כאן אימייל שכבר משויך לחשבון אחר."
                  )}
                </p>

                <form
                  onSubmit={
                    linkEmail
                  }
                  className="profile-form"
                >
                  <label htmlFor="link-email">
                    {text(
                      "Email",
                      "البريد الإلكتروني",
                      "אימייל"
                    )}
                  </label>

                  <input
                    id="link-email"
                    dir="ltr"
                    type="email"
                    autoComplete="email"
                    required
                    value={
                      user.email ||
                      email
                    }
                    readOnly={Boolean(
                      user.email
                    )}
                    disabled={busy}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                  />

                  <label htmlFor="link-password">
                    {text(
                      "New password",
                      "كلمة مرور جديدة",
                      "סיסמה חדשה"
                    )}
                  </label>

                  <input
                    id="link-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={
                      password
                    }
                    disabled={busy}
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event.target
                          .value
                      )
                    }
                  />

                  <p className="profile-help">
                    {text(
                      "At least 8 characters, including uppercase, lowercase, a number and a symbol.",
                      "8 أحرف على الأقل، مع أحرف كبيرة وصغيرة ورقم ورمز.",
                      "לפחות 8 תווים, כולל אות גדולה, אות קטנה, מספר וסימן."
                    )}
                  </p>

                  <button
                    disabled={busy}
                    type="submit"
                  >
                    {text(
                      "Link email",
                      "ربط البريد",
                      "קישור אימייל"
                    )}
                  </button>
                </form>
              </section>
            )}

          </>
        )}
      </section>
    </main>
  );
}
