import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
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

import "./OwnerSettings.css";


function OwnerSettings() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  /* =====================================================
     STATE
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    savingPlatform,
    setSavingPlatform,
  ] = useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    owner,
    setOwner,
  ] = useState(null);


  const [
    profileForm,
    setProfileForm,
  ] = useState({
    name: "",
  });


  const [
    platformForm,
    setPlatformForm,
  ] = useState({
    platformName:
      "TechMinds",

    supportEmail:
      "",

    supportPhone:
      "",

    whatsapp:
      "",
  });


  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword:
      "",

    newPassword:
      "",

    confirmPassword:
      "",
  });


  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     LANGUAGE
  ===================================================== */

  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    const loadSettings =
      async () => {
        try {
          const user =
            auth.currentUser;


          if (!user) {
            navigate(
              "/login"
            );

            return;
          }


          /* =========================
             OWNER PROFILE
          ========================= */

          const userSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (
            !userSnapshot.exists()
          ) {
            navigate(
              "/login"
            );

            return;
          }


          const userData =
            userSnapshot.data();


          if (
            userData.role !==
            "owner"
          ) {
            navigate(
              userData.role ===
              "teacher"
                ? "/teacher"
                : "/student"
            );

            return;
          }


          setOwner({
            uid:
              user.uid,

            email:
              user.email,

            ...userData,
          });


          setProfileForm({
            name:
              userData.name ||
              userData.fullName ||
              user.displayName ||
              "",
          });


          /* =========================
             PLATFORM SETTINGS
          ========================= */

          const settingsSnapshot =
            await getDoc(
              doc(
                db,
                "platformSettings",
                "public"
              )
            );


          if (
            settingsSnapshot.exists()
          ) {
            const settingsData =
              settingsSnapshot.data();


            setPlatformForm({
              platformName:
                settingsData.platformName ||
                "TechMinds",

              supportEmail:
                settingsData.supportEmail ||
                "",

              supportPhone:
                settingsData.supportPhone ||
                "",

              whatsapp:
                settingsData.whatsapp ||
                "",
            });
          }

        } catch (
          loadError
        ) {
          console.error(
            "Owner settings load error:",
            loadError
          );


          setError(
            text(
              "Could not load settings.",
              "تعذر تحميل الإعدادات."
            )
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadSettings();

  }, [navigate]);


  /* =====================================================
     UPDATE PROFILE
  ===================================================== */

  const saveProfile =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !profileForm.name.trim()
      ) {
        setError(
          text(
            "Please enter your name.",
            "يرجى إدخال الاسم."
          )
        );

        return;
      }


      try {
        setSavingProfile(
          true
        );


        const user =
          auth.currentUser;


        if (!user) {
          navigate(
            "/login"
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
            name:
              profileForm.name.trim(),

            updatedAt:
              serverTimestamp(),
          }
        );


        await updateProfile(
          user,
          {
            displayName:
              profileForm.name.trim(),
          }
        );


        setOwner(
          (current) => ({
            ...current,

            name:
              profileForm.name.trim(),
          })
        );


        setSuccess(
          text(
            "Profile updated successfully.",
            "تم تحديث الملف الشخصي بنجاح."
          )
        );

      } catch (
        profileError
      ) {
        console.error(
          "Owner profile update error:",
          profileError
        );


        setError(
          text(
            "Could not update your profile.",
            "تعذر تحديث الملف الشخصي."
          )
        );

      } finally {
        setSavingProfile(
          false
        );
      }
    };


  /* =====================================================
     SAVE PLATFORM SETTINGS
  ===================================================== */

  const savePlatformSettings =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !platformForm.platformName.trim()
      ) {
        setError(
          text(
            "Platform name is required.",
            "اسم المنصة مطلوب."
          )
        );

        return;
      }


      try {
        setSavingPlatform(
          true
        );


        const user =
          auth.currentUser;


        if (!user) {
          navigate(
            "/login"
          );

          return;
        }


        await setDoc(
          doc(
            db,
            "platformSettings",
            "public"
          ),

          {
            platformName:
              platformForm.platformName.trim(),

            supportEmail:
              platformForm.supportEmail.trim(),

            supportPhone:
              platformForm.supportPhone.trim(),

            whatsapp:
              platformForm.whatsapp.trim(),

            updatedBy:
              user.uid,

            updatedAt:
              serverTimestamp(),
          },

          {
            merge:
              true,
          }
        );


        setSuccess(
          text(
            "Platform settings saved successfully.",
            "تم حفظ إعدادات المنصة بنجاح."
          )
        );

      } catch (
        settingsError
      ) {
        console.error(
          "Platform settings save error:",
          settingsError
        );


        if (
          settingsError.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow saving platform settings.",
              "صلاحيات Firestore لا تسمح بحفظ إعدادات المنصة."
            )
          );

        } else {
          setError(
            text(
              "Could not save platform settings.",
              "تعذر حفظ إعدادات المنصة."
            )
          );
        }

      } finally {
        setSavingPlatform(
          false
        );
      }
    };


  /* =====================================================
     PASSWORD
  ===================================================== */

  const changePassword =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !passwordForm.currentPassword
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
        passwordForm.newPassword.length <
        6
      ) {
        setError(
          text(
            "New password must contain at least 6 characters.",
            "يجب أن تحتوي كلمة المرور الجديدة على 6 أحرف على الأقل."
          )
        );

        return;
      }


      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
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


        const user =
          auth.currentUser;


        if (
          !user ||
          !user.email
        ) {
          throw new Error(
            "user-not-found"
          );
        }


        const credential =
          EmailAuthProvider.credential(
            user.email,
            passwordForm.currentPassword
          );


        await reauthenticateWithCredential(
          user,
          credential
        );


        await updatePassword(
          user,
          passwordForm.newPassword
        );


        setPasswordForm({
          currentPassword:
            "",

          newPassword:
            "",

          confirmPassword:
            "",
        });


        setSuccess(
          text(
            "Password changed successfully.",
            "تم تغيير كلمة المرور بنجاح."
          )
        );

      } catch (
        passwordError
      ) {
        console.error(
          "Owner password error:",
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
              "Current password is incorrect.",
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

  if (loading) {
    return (
      <div className="owner-settings-loading">

        <div>
          ⚙️
        </div>


        <p>
          {text(
            "Loading settings...",
            "جارٍ تحميل الإعدادات..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-settings-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="owner-settings-header">

        <div>

          <button
            type="button"
            className="owner-settings-back"
            onClick={() =>
              navigate(
                "/owner"
              )
            }
          >
            {language === "ar"
              ? "↩ العودة للرئيسية"
              : "← Back to Dashboard"}
          </button>


          <small>
            TECHMINDS ADMINISTRATION
          </small>


          <h1>
            ⚙️{" "}
            {text(
              "Settings",
              "الإعدادات"
            )}
          </h1>


          <p>
            {text(
              "Manage your owner account, platform information and technical support details.",
              "أديري حساب المالك ومعلومات المنصة وبيانات الدعم الفني."
            )}
          </p>

        </div>


        <div className="owner-settings-language">

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
              setLanguage(
                "ar"
              )
            }
          >
            العربية
          </button>

        </div>

      </header>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (
        <div className="owner-settings-success">
          ✅ {success}
        </div>
      )}


      {error && (
        <div className="owner-settings-error">
          ⚠️ {error}
        </div>
      )}


      {/* =================================================
          ACCOUNT OVERVIEW
      ================================================= */}

      <section className="owner-settings-overview">

        <div className="owner-settings-avatar">
          👑
        </div>


        <div className="owner-settings-account">

          <small>
            PLATFORM OWNER
          </small>


          <h2>
            {owner?.name ||
              "Owner"}
          </h2>


          <p>
            {owner?.email ||
              auth.currentUser?.email}
          </p>

        </div>


        <div className="owner-settings-role">

          <span>
            👑
          </span>

          <div>

            <small>
              {text(
                "ACCOUNT ROLE",
                "نوع الحساب"
              )}
            </small>

            <strong>
              Owner
            </strong>

          </div>

        </div>


        <div className="owner-settings-status">

          <i>
          </i>

          <div>

            <small>
              {text(
                "STATUS",
                "الحالة"
              )}
            </small>

            <strong>
              {text(
                "Active",
                "فعّال"
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          SETTINGS GRID
      ================================================= */}

      <main className="owner-settings-grid">

        {/* =================================================
            PROFILE
        ================================================= */}

        <section className="owner-settings-card">

          <div className="owner-settings-card-header">

            <span>
              👤
            </span>


            <div>

              <small>
                ACCOUNT
              </small>

              <h2>
                {text(
                  "Owner Profile",
                  "ملف المالك"
                )}
              </h2>

              <p>
                {text(
                  "Your personal account information.",
                  "معلومات حسابك الشخصي."
                )}
              </p>

            </div>

          </div>


          <form
            className="owner-settings-form"
            onSubmit={
              saveProfile
            }
          >

            <label>

              {text(
                "Owner Name",
                "اسم المالك"
              )}

              <input
                type="text"
                value={
                  profileForm.name
                }
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,

                    name:
                      event.target.value,
                  })
                }
              />

            </label>


            <label>

              {text(
                "Email Address",
                "البريد الإلكتروني"
              )}

              <input
                type="email"
                value={
                  owner?.email ||
                  ""
                }
                readOnly
                className="owner-settings-readonly"
              />


              <small className="owner-settings-field-note">

                🔒{" "}

                {text(
                  "Email changes are currently disabled for security.",
                  "تغيير البريد الإلكتروني غير متاح حاليًا لأسباب أمنية."
                )}

              </small>

            </label>


            <button
              type="submit"
              disabled={
                savingProfile
              }
            >
              {savingProfile
                ? text(
                    "Saving...",
                    "جارٍ الحفظ..."
                  )
                : `💾 ${text(
                    "Save Profile",
                    "حفظ الملف"
                  )}`}
            </button>

          </form>

        </section>


        {/* =================================================
            PLATFORM
        ================================================= */}

        <section className="owner-settings-card">

          <div className="owner-settings-card-header">

            <span>
              🚀
            </span>


            <div>

              <small>
                PLATFORM
              </small>

              <h2>
                {text(
                  "Platform Information",
                  "معلومات المنصة"
                )}
              </h2>

              <p>
                {text(
                  "Basic public information used across TechMinds.",
                  "المعلومات الأساسية المستخدمة في منصة TechMinds."
                )}
              </p>

            </div>

          </div>


          <form
            className="owner-settings-form"
            onSubmit={
              savePlatformSettings
            }
          >

            <label>

              {text(
                "Platform Name",
                "اسم المنصة"
              )}

              <input
                type="text"
                value={
                  platformForm.platformName
                }
                onChange={(event) =>
                  setPlatformForm({
                    ...platformForm,

                    platformName:
                      event.target.value,
                  })
                }
                placeholder="TechMinds"
              />

            </label>


            <button
              type="submit"
              disabled={
                savingPlatform
              }
            >
              {savingPlatform
                ? text(
                    "Saving...",
                    "جارٍ الحفظ..."
                  )
                : `💾 ${text(
                    "Save Platform",
                    "حفظ معلومات المنصة"
                  )}`}
            </button>

          </form>

        </section>


        {/* =================================================
            TECHNICAL SUPPORT
        ================================================= */}

        <section className="owner-settings-card owner-settings-support-card">

          <div className="owner-settings-card-header">

            <span>
              🛟
            </span>


            <div>

              <small>
                CUSTOMER SUPPORT
              </small>

              <h2>
                {text(
                  "Technical Support",
                  "الدعم الفني"
                )}
              </h2>

              <p>
                {text(
                  "These contact details can be shown to teachers and students when they need technical help.",
                  "ستظهر بيانات التواصل هذه للمعلمين والطلاب عند الحاجة إلى مساعدة تقنية."
                )}
              </p>

            </div>

          </div>


          <form
            className="owner-settings-form"
            onSubmit={
              savePlatformSettings
            }
          >

            <div className="owner-settings-support-grid">

              <label>

                ✉️{" "}
                {text(
                  "Support Email",
                  "بريد الدعم"
                )}

                <input
                  type="email"
                  value={
                    platformForm.supportEmail
                  }
                  onChange={(event) =>
                    setPlatformForm({
                      ...platformForm,

                      supportEmail:
                        event.target.value,
                    })
                  }
                  placeholder="support@techminds.com"
                />

              </label>


              <label>

                📞{" "}
                {text(
                  "Support Phone",
                  "هاتف الدعم"
                )}

                <input
                  type="tel"
                  value={
                    platformForm.supportPhone
                  }
                  onChange={(event) =>
                    setPlatformForm({
                      ...platformForm,

                      supportPhone:
                        event.target.value,
                    })
                  }
                  placeholder="05X-XXX-XXXX"
                />

              </label>


              <label>

                💬 WhatsApp

                <input
                  type="tel"
                  value={
                    platformForm.whatsapp
                  }
                  onChange={(event) =>
                    setPlatformForm({
                      ...platformForm,

                      whatsapp:
                        event.target.value,
                    })
                  }
                  placeholder="05X-XXX-XXXX"
                />

              </label>

            </div>


            <div className="owner-settings-support-preview">

              <small>
                {text(
                  "CUSTOMER PREVIEW",
                  "معاينة العميل"
                )}
              </small>


              <h3>
                🛟{" "}
                {text(
                  "Need technical help?",
                  "تحتاج مساعدة تقنية؟"
                )}
              </h3>


              <div>

                {platformForm.supportEmail && (
                  <span>
                    ✉️{" "}
                    {platformForm.supportEmail}
                  </span>
                )}


                {platformForm.supportPhone && (
                  <span>
                    📞{" "}
                    {platformForm.supportPhone}
                  </span>
                )}


                {platformForm.whatsapp && (
                  <span>
                    💬 WhatsApp:{" "}
                    {platformForm.whatsapp}
                  </span>
                )}

              </div>

            </div>


            <button
              type="submit"
              disabled={
                savingPlatform
              }
            >
              {savingPlatform
                ? text(
                    "Saving...",
                    "جارٍ الحفظ..."
                  )
                : `💾 ${text(
                    "Save Support Details",
                    "حفظ بيانات الدعم"
                  )}`}
            </button>

          </form>

        </section>


        {/* =================================================
            PASSWORD
        ================================================= */}

        <section className="owner-settings-card owner-settings-password-card">

          <div className="owner-settings-card-header">

            <span>
              🔐
            </span>


            <div>

              <small>
                SECURITY
              </small>

              <h2>
                {text(
                  "Change Password",
                  "تغيير كلمة المرور"
                )}
              </h2>

              <p>
                {text(
                  "Reauthentication is required before changing your password.",
                  "يجب تأكيد كلمة المرور الحالية قبل تغييرها."
                )}
              </p>

            </div>

          </div>


          <form
            className="owner-settings-form"
            onSubmit={
              changePassword
            }
          >

            <div className="owner-settings-password-grid">

              <label>

                {text(
                  "Current Password",
                  "كلمة المرور الحالية"
                )}

                <input
                  type="password"
                  value={
                    passwordForm.currentPassword
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,

                      currentPassword:
                        event.target.value,
                    })
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
                    passwordForm.newPassword
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,

                      newPassword:
                        event.target.value,
                    })
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
                    passwordForm.confirmPassword
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,

                      confirmPassword:
                        event.target.value,
                    })
                  }
                  autoComplete="new-password"
                />

              </label>

            </div>


            <button
              type="submit"
              className="owner-settings-password-button"
              disabled={
                changingPassword
              }
            >
              {changingPassword
                ? text(
                    "Updating Password...",
                    "جارٍ تغيير كلمة المرور..."
                  )
                : `🔐 ${text(
                    "Change Password",
                    "تغيير كلمة المرور"
                  )}`}
            </button>

          </form>

        </section>


        {/* =================================================
            LANGUAGE
        ================================================= */}

        <section className="owner-settings-card">

          <div className="owner-settings-card-header">

            <span>
              🌐
            </span>


            <div>

              <small>
                LANGUAGE
              </small>

              <h2>
                {text(
                  "Interface Language",
                  "لغة الواجهة"
                )}
              </h2>

              <p>
                {text(
                  "Choose your preferred Owner Dashboard language.",
                  "اختاري لغة لوحة الإدارة."
                )}
              </p>

            </div>

          </div>


          <div className="owner-settings-language-options">

            <button
              type="button"
              className={
                language === "en"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "en"
                )
              }
            >

              <span>
                EN
              </span>


              <div>

                <strong>
                  English
                </strong>

                <small>
                  Left to right
                </small>

              </div>


              {language === "en" && (
                <b>
                  ✓
                </b>
              )}

            </button>


            <button
              type="button"
              className={
                language === "ar"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "ar"
                )
              }
            >

              <span>
                ع
              </span>


              <div>

                <strong>
                  العربية
                </strong>

                <small>
                  من اليمين إلى اليسار
                </small>

              </div>


              {language === "ar" && (
                <b>
                  ✓
                </b>
              )}

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}


export default OwnerSettings;