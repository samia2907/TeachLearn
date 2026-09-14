import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";

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

import { hebrewText } from "../data/hebrewText";

import "./TeacherSettings.css";


function TeacherSettings() {
  const navigate =
    useNavigate();


  const {
    language,
    setLanguage,
  } =
    useLanguage();


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrewText(english)
      : english;


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);


  const [
    changingPassword,
    setChangingPassword,
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
    profile,
    setProfile,
  ] = useState(null);


  const [
    name,
    setName,
  ] = useState("");


  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");


  const [
    newPassword,
    setNewPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    const loadProfile =
      async () => {

        const currentUser =
          auth.currentUser;


        if (!currentUser) {
          navigate(
            "/login"
          );

          return;
        }


        try {
          setLoading(
            true
          );


          const profileRef =
            doc(
              db,
              "users",
              currentUser.uid
            );


          const snapshot =
            await getDoc(
              profileRef
            );


          if (
            snapshot.exists()
          ) {

            const data =
              snapshot.data();


            setProfile(
              data
            );


            setName(
              data.name ||
              data.fullName ||
              currentUser.displayName ||
              ""
            );

          } else {

            setName(
              currentUser.displayName ||
              ""
            );
          }

        } catch (
          loadError
        ) {

          console.error(
            "Load settings error:",
            loadError
          );


          setError(
            text(
              "Could not load your settings.",
              "تعذر تحميل الإعدادات."
            )
          );

        } finally {

          setLoading(
            false
          );
        }
      };


    loadProfile();

  }, [
    navigate,
    language,
  ]);


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile =
    async (
      event
    ) => {

      event.preventDefault();


      const currentUser =
        auth.currentUser;


      if (!currentUser) {
        navigate(
          "/login"
        );

        return;
      }


      if (
        !name.trim()
      ) {
        setError(
          text(
            "Please enter your name.",
            "أدخلي الاسم."
          )
        );

        return;
      }


      try {
        setSavingProfile(
          true
        );

        setError("");
        setSuccess("");


        await updateDoc(
          doc(
            db,
            "users",
            currentUser.uid
          ),

          {
            name:
              name.trim(),

            updatedAt:
              serverTimestamp(),
          }
        );


        await updateProfile(
          currentUser,
          {
            displayName:
              name.trim(),
          }
        );


        setProfile(
          (
            previous
          ) => ({
            ...previous,
            name:
              name.trim(),
          })
        );


        setSuccess(
          text(
            "Profile updated successfully.",
            "تم تحديث معلومات الحساب بنجاح ✅"
          )
        );

      } catch (
        saveError
      ) {

        console.error(
          "Save profile error:",
          saveError
        );


        setError(
          text(
            "Could not update your profile.",
            "تعذر تحديث معلومات الحساب."
          )
        );

      } finally {

        setSavingProfile(
          false
        );
      }
    };


  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  const changePassword =
    async (
      event
    ) => {

      event.preventDefault();


      const currentUser =
        auth.currentUser;


      if (
        !currentUser ||
        !currentUser.email
      ) {
        return;
      }


      setError("");
      setSuccess("");


      if (
        !currentPassword
      ) {

        setError(
          text(
            "Enter your current password.",
            "أدخلي كلمة المرور الحالية."
          )
        );

        return;
      }


      if (
        newPassword.length <
        6
      ) {

        setError(
          text(
            "The new password must contain at least 6 characters.",
            "كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل."
          )
        );

        return;
      }


      if (
        newPassword !==
        confirmPassword
      ) {

        setError(
          text(
            "The new passwords do not match.",
            "كلمتا المرور الجديدتان غير متطابقتين."
          )
        );

        return;
      }


      try {
        setChangingPassword(
          true
        );


        const credential =
          EmailAuthProvider
            .credential(
              currentUser.email,
              currentPassword
            );


        await reauthenticateWithCredential(
          currentUser,
          credential
        );


        await updatePassword(
          currentUser,
          newPassword
        );


        setCurrentPassword(
          ""
        );

        setNewPassword(
          ""
        );

        setConfirmPassword(
          ""
        );


        setSuccess(
          text(
            "Password changed successfully.",
            "تم تغيير كلمة المرور بنجاح 🔐"
          )
        );

      } catch (
        passwordError
      ) {

        console.error(
          "Password change error:",
          passwordError
        );


        if (
          passwordError.code ===
            "auth/invalid-credential" ||
          passwordError.code ===
            "auth/wrong-password"
        ) {

          setError(
            text(
              "Your current password is incorrect.",
              "كلمة المرور الحالية غير صحيحة."
            )
          );

        } else {

          setError(
            text(
              "Could not change the password.",
              "تعذر تغيير كلمة المرور."
            )
          );
        }

      } finally {

        setChangingPassword(
          false
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {

    return (
      <div className="teacher-settings-loading">

        ⚙️

      </div>
    );
  }


  const currentUser =
    auth.currentUser;


  const plan =
    profile?.plan ||
    profile?.subscriptionPlan ||
    "Teacher Basic";


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="teacher-settings-page">

      {/* HEADER */}

      <header className="teacher-settings-header">

        <div>

          <button
            type="button"
            className="teacher-settings-back"
            onClick={() =>
              navigate(
                "/teacher"
              )
            }
          >

            {language ===
            "ar"
              ? "↩ لوحة التحكم"
              : language === "he"
                ? "→ לוח הבקרה"
                : "← Dashboard"}

          </button>


          <h1>

            ⚙️{" "}

            {text(
              "Settings",
              "الإعدادات"
            )}

          </h1>


          <p>

            {text(
              "Manage your profile, password and account preferences.",
              "إدارة معلومات حسابك وكلمة المرور وتفضيلاتك."
            )}

          </p>

        </div>


      </header>


      {/* MESSAGES */}

      {error && (

        <div className="settings-message error">

          ⚠️ {error}

        </div>

      )}


      {success && (

        <div className="settings-message success">

          {success}

        </div>

      )}


      {/* ACCOUNT OVERVIEW */}

      <section className="settings-account-overview">

        <div className="settings-avatar">
          👩‍🏫
        </div>


        <div className="settings-account-info">

          <small>

            {text(
              "TEACHER ACCOUNT",
              "حساب المعلّم"
            )}

          </small>


          <h2>

            {name ||
              text(
                "Teacher",
                "المعلّم"
              )}

          </h2>


          <p>

            {currentUser?.email}

          </p>

        </div>


        <div className="settings-plan-badge">

          <span>
            ⭐
          </span>

          <div>

            <small>

              {text(
                "CURRENT PLAN",
                "الخطة الحالية"
              )}

            </small>

            <strong>
              {plan}
            </strong>

          </div>

        </div>

      </section>


      <div className="teacher-settings-grid">

        {/* PROFILE */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon purple">
              👤
            </div>


            <div>

              <small>

                {text(
                  "PROFILE",
                  "الملف الشخصي"
                )}

              </small>


              <h2>

                {text(
                  "Personal Information",
                  "المعلومات الشخصية"
                )}

              </h2>


              <p>

                {text(
                  "Update the name displayed in TeachLearn.",
                  "عدّلي الاسم الذي يظهر في TeachLearn."
                )}

              </p>

            </div>

          </div>


          <form
            onSubmit={
              saveProfile
            }
            className="settings-form"
          >

            <label>

              {text(
                "Teacher Name",
                "اسم المعلّم"
              )}

              <input
                value={
                  name
                }
                onChange={(
                  event
                ) =>
                  setName(
                    event.target.value
                  )
                }
              />

            </label>


            <label>

              {text(
                "Email Address",
                "البريد الإلكتروني"
              )}

              <input
                value={
                  currentUser?.email ||
                  ""
                }
                disabled
              />

              <small className="settings-field-note">

                🔒{" "}

                {text(
                  "Email cannot be changed here.",
                  "لا يمكن تغيير البريد من هذه الصفحة."
                )}

              </small>

            </label>


            <button
              type="submit"
              className="settings-primary-button"
              disabled={
                savingProfile
              }
            >

              {savingProfile
                ? text(
                    "Saving...",
                    "جارٍ الحفظ..."
                  )
                : text(
                    "Save Changes",
                    "حفظ التغييرات"
                  )}

            </button>

          </form>

        </section>


        {/* LANGUAGE */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon blue">
              🌐
            </div>


            <div>

              <small>

                {text(
                  "PREFERENCES",
                  "التفضيلات"
                )}

              </small>


              <h2>

                {text(
                  "Language",
                  "اللغة"
                )}

              </h2>


              <p>

                {text(
                  "Choose the language used across TeachLearn.",
                  "اختاري اللغة المستخدمة في TeachLearn."
                )}

              </p>

            </div>

          </div>


          <div className="settings-language-options">

            <button
              type="button"
              className={
                language ===
                "en"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "en"
                )
              }
            >

              <span className="language-option-icon">
                🇬🇧
              </span>

              <div>

                <strong>
                  English
                </strong>

                <small>
                  English interface
                </small>

              </div>

              <span className="language-check">

                {language ===
                "en"
                  ? "✓"
                  : ""}

              </span>

            </button>


            <button
              type="button"
              className={
                language ===
                "ar"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "ar"
                )
              }
            >

              <span className="language-option-icon">
                🌐
              </span>

              <div>

                <strong>
                  العربية
                </strong>

                <small>
                  واجهة عربية
                </small>

              </div>

              <span className="language-check">

                {language ===
                "ar"
                  ? "✓"
                  : ""}

              </span>

            </button>

            <button
              type="button"
              className={
                language === "he"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setLanguage("he")
              }
            >
              <span className="language-option-icon">
                🇮🇱
              </span>

              <div>
                <strong>
                  עברית
                </strong>

                <small>
                  ממשק בעברית
                </small>
              </div>

              <span className="language-check">
                {language === "he" ? "✓" : ""}
              </span>
            </button>

          </div>

        </section>


        {/* PASSWORD */}

        <section className="settings-card settings-password-card">

          <div className="settings-card-header">

            <div className="settings-card-icon orange">
              🔐
            </div>


            <div>

              <small>

                {text(
                  "SECURITY",
                  "الأمان"
                )}

              </small>


              <h2>

                {text(
                  "Change Password",
                  "تغيير كلمة المرور"
                )}

              </h2>


              <p>

                {text(
                  "Use a strong password to protect your teacher account.",
                  "استخدمي كلمة مرور قوية لحماية حساب المعلّم."
                )}

              </p>

            </div>

          </div>


          <form
            className="settings-form password-form"
            onSubmit={
              changePassword
            }
          >

            <label>

              {text(
                "Current Password",
                "كلمة المرور الحالية"
              )}

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(
                  event
                ) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
              />

            </label>


            <label>

              {text(
                "New Password",
                "كلمة المرور الجديدة"
              )}

              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(
                  event
                ) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </label>


            <label>

              {text(
                "Confirm New Password",
                "تأكيد كلمة المرور الجديدة"
              )}

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </label>


            <button
              type="submit"
              className="settings-security-button"
              disabled={
                changingPassword
              }
            >

              {changingPassword
                ? text(
                    "Changing Password...",
                    "جارٍ تغيير كلمة المرور..."
                  )
                : text(
                    "Change Password 🔐",
                    "تغيير كلمة المرور 🔐"
                  )}

            </button>

          </form>

        </section>


        {/* ACCOUNT INFO */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon green">
              💳
            </div>


            <div>

              <small>

                {text(
                  "ACCOUNT",
                  "الحساب"
                )}

              </small>


              <h2>

                {text(
                  "Plan & Account",
                  "الخطة والحساب"
                )}

              </h2>

            </div>

          </div>


          <div className="settings-account-details">

            <div>

              <span>

                {text(
                  "Account Type",
                  "نوع الحساب"
                )}

              </span>

              <strong>

                👩‍🏫{" "}

                {text(
                  "Teacher",
                  "معلّم"
                )}

              </strong>

            </div>


            <div>

              <span>

                {text(
                  "Current Plan",
                  "الخطة الحالية"
                )}

              </span>

              <strong>
                ⭐ {plan}
              </strong>

            </div>


            <div>

              <span>

                {text(
                  "Account Status",
                  "حالة الحساب"
                )}

              </span>

              <strong className="settings-active-status">

                ●{" "}

                {text(
                  "Active",
                  "فعال"
                )}

              </strong>

            </div>

          </div>


          <button
            type="button"
            className="settings-plan-button"
            onClick={() =>
              navigate(
                "/plans"
              )
            }
          >

            {text(
              "View Plans",
              "عرض الخطط"
            )}

          </button>

        </section>

{/* =====================================================
    TECHNICAL SUPPORT
===================================================== */}

<section className="settings-card settings-support-card">

  <div className="settings-card-header">

    <div className="settings-card-icon blue">
      🛠️
    </div>

    <div>

      <small>
        {text(
          "SUPPORT",
          "الدعم"
        )}
      </small>

      <h2>
        {text(
          "Technical Support",
          "الدعم الفني"
        )}
      </h2>

      <p>
        {text(
          "Having a technical problem? Contact the TeachLearn support team.",
          "هل تواجه مشكلة تقنية؟ تواصل مع فريق دعم TeachLearn."
        )}
      </p>

    </div>

  </div>


  <div className="technical-support-box">

    <div className="technical-support-icon">
      💬
    </div>

    <div className="technical-support-text">

      <strong>
        {text(
          "Need help?",
          "تحتاج مساعدة؟"
        )}
      </strong>

      <p>
        {text(
          "Contact us and describe the problem you are experiencing.",
          "تواصل معنا واشرح المشكلة التي تواجهها."
        )}
      </p>

    </div>

  </div>


  <div className="technical-support-actions">

    <a
      className="support-call-button"
      href="tel:0549308793"
    >
      <span>
        📞
      </span>

      <div>
        <small>
          {text(
            "CALL SUPPORT",
            "اتصال بالدعم"
          )}
        </small>

        <strong>
          {text(
            "Call Us",
            "اتصل بنا"
          )}
        </strong>
      </div>
    </a>


    <a
      className="support-email-button"
      href="mailto:samia.nabil.29.7@gmail.com?subject=TechMinds Technical Support"
    >
      <span>
        ✉️
      </span>

      <div>
        <small>
          {text(
            "EMAIL SUPPORT",
            "البريد الإلكتروني"
          )}
        </small>

        <strong>
          {text(
            "Send Email",
            "إرسال بريد"
          )}
        </strong>
      </div>
    </a>

  </div>

</section>
      </div>

    </div>
  );
}


export default TeacherSettings;