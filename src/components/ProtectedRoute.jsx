import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";


function ProtectedRoute({
  children,
  allowedRole,
  requiredPlan,
}) {
  const navigate =
    useNavigate();

  const {
    language,
  } = useLanguage();


  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    allowed,
    setAllowed,
  ] = useState(false);

  const [
    blockedStudent,
    setBlockedStudent,
  ] = useState(false);

  const [
    planAllowed,
    setPlanAllowed,
  ] = useState(!requiredPlan);

  const [
    checkingPlan,
    setCheckingPlan,
  ] = useState(Boolean(requiredPlan));


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  /* =====================================================
     CHECK USER
  ===================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,

        async (user) => {
          /*
            If the student was blocked and
            signOut triggers auth state again,
            keep showing the blocked message.
          */

          if (!user) {
            setAllowed(false);
            setLoading(false);

            return;
          }


          try {
            setLoading(true);


            const snapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );


            /* USER PROFILE DOES NOT EXIST */

            if (
              !snapshot.exists()
            ) {
              setAllowed(false);

              await signOut(
                auth
              );

              return;
            }


            const data =
              snapshot.data();


            /* =================================================
               BLOCK INACTIVE STUDENT
            ================================================= */

            if (
              data.role ===
                "student" &&
              (
                data.accountStatus ===
                  "inactive" ||
                data.accountStatus ===
                  "blocked"
              )
            ) {
              setBlockedStudent(
                true
              );

              setAllowed(
                false
              );


              /*
                Sign the student out so they
                cannot stay authenticated.
              */

              await signOut(
                auth
              );


              return;
            }


            /* =================================================
               CHECK ROLE
            ================================================= */

            if (
              allowedRole &&
              data.role !==
                allowedRole
            ) {
              setCheckingPlan(false);
              setAllowed(
                false
              );

              return;
            }

            if (requiredPlan) {
              const subscriptionSnapshot =
                await getDoc(
                  doc(
                    db,
                    "subscriptions",
                    user.uid
                  )
                );

              const subscription =
                subscriptionSnapshot.exists()
                  ? subscriptionSnapshot.data()
                  : null;

              setPlanAllowed(
                subscription?.status === "active" &&
                subscription.planId === requiredPlan
              );
              setCheckingPlan(false);
            }


            /* EVERYTHING IS OK */

            setBlockedStudent(
              false
            );

            setAllowed(
              true
            );

          } catch (error) {
            console.error(
              "Protected route error:",
              error
            );


            setAllowed(
              false
            );

          } finally {
            setLoading(
              false
            );
          }
        }
      );


    return () =>
      unsubscribe();

  }, [
    allowedRole,
    requiredPlan,
  ]);


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div
        style={{
          width: "100%",
          minHeight:
            "100vh",

          display:
            "flex",

          flexDirection:
            "column",

          alignItems:
            "center",

          justifyContent:
            "center",

          gap: "12px",

          background:
            "#f7f8fc",

          fontFamily:
            '"Segoe UI", Tahoma, Arial, sans-serif',
        }}
      >

        <div
          style={{
            width:
              "76px",

            height:
              "76px",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              "22px",

            background:
              "linear-gradient(135deg, #ede9fe, #dbeafe)",

            fontSize:
              "38px",

            boxShadow:
              "0 12px 30px rgba(99,102,241,0.13)",
          }}
        >
          🚀
        </div>


        <p
          style={{
            margin: 0,

            color:
              "#64748b",

            fontSize:
              "13px",

            fontWeight:
              "700",
          }}
        >
          {text(
            "Checking your account...",
            "جارٍ التحقق من الحساب..."
          )}
        </p>

      </div>
    );
  }

  if (requiredPlan && checkingPlan) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fc",
          color: "#475569",
          fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
        }}
      >
        {text(
          "Checking your subscription...",
          "جارٍ التحقق من اشتراكك..."
        )}
      </div>
    );
  }

  if (requiredPlan && !planAllowed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg, #f8fafc, #f5f3ff)",
          direction: language === "ar" || language === "he" ? "rtl" : "ltr",
          fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: "min(480px, 100%)",
            padding: "36px 30px",
            borderRadius: "20px",
            background: "#ffffff",
            textAlign: "center",
            boxShadow: "0 20px 55px rgba(15,23,42,0.12)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "14px" }}>🔒</div>
          <h1 style={{ margin: "0 0 10px", color: "#172033", fontSize: "25px" }}>
            {text(
              "This feature requires an upgrade",
              "هذه الميزة تتطلب ترقية الخطة"
            )}
          </h1>
          <p style={{ margin: "0 0 24px", color: "#64748b", lineHeight: "1.7" }}>
            {text(
              "Upgrade your subscription to access this feature.",
              "قم بترقية اشتراكك للوصول إلى هذه الميزة."
            )}
          </p>
          <button
            type="button"
            onClick={() => navigate("/plans")}
            style={{
              width: "100%",
              minHeight: "48px",
              border: "none",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {text(
              "Upgrade Plan",
              "ترقية الخطة"
            )}
          </button>
        </div>
      </div>
    );
  }


  /* =====================================================
     INACTIVE STUDENT
  ===================================================== */

  if (
    blockedStudent
  ) {
    return (
      <div
        style={{
          width: "100%",
          minHeight:
            "100vh",

          padding:
            "20px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "linear-gradient(135deg, #f8fafc, #f5f3ff)",

          fontFamily:
            '"Segoe UI", Tahoma, Arial, sans-serif',

          direction:
            language ===
            "ar"
              ? "rtl"
              : "ltr",
        }}
      >

        <div
          style={{
            width:
              "min(500px, 100%)",

            padding:
              "38px 32px",

            border:
              "1px solid #e7e5e4",

            borderRadius:
              "24px",

            background:
              "#ffffff",

            textAlign:
              "center",

            boxShadow:
              "0 25px 70px rgba(15,23,42,0.12)",
          }}
        >

          {/* ICON */}

          <div
            style={{
              width:
                "78px",

              height:
                "78px",

              margin:
                "0 auto 18px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              borderRadius:
                "22px",

              background:
                "#fef2f2",

              fontSize:
                "38px",
            }}
          >
            ⛔
          </div>


          {/* LABEL */}

          <small
            style={{
              color:
                "#dc2626",

              fontSize:
                "10px",

              fontWeight:
                "900",

              letterSpacing:
                "0.08em",
            }}
          >
            {text(
              "ACCOUNT INACTIVE",
              "الحساب غير فعّال"
            )}
          </small>


          {/* TITLE */}

          <h1
            style={{
              margin:
                "7px 0 10px",

              color:
                "#172033",

              fontSize:
                "25px",

              fontWeight:
                "900",
            }}
          >
            {text(
              "Your account has been deactivated",
              "تم تعطيل حسابك"
            )}
          </h1>


          {/* MESSAGE */}

          <p
            style={{
              maxWidth:
                "390px",

              margin:
                "0 auto 24px",

              color:
                "#64748b",

              fontSize:
                "13px",

              lineHeight:
                "1.75",
            }}
          >
            {text(
              "You currently cannot access TeachLearn. Please contact your teacher if you believe this was a mistake.",
              "لا يمكنك حاليًا الدخول إلى TeachLearn. يرجى التواصل مع المعلّم إذا كنت تعتقد أن الحساب تم تعطيله بالخطأ."
            )}
          </p>


          {/* BUTTON */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/login",
                {
                  replace:
                    true,
                }
              )
            }
            style={{
              width:
                "100%",

              minHeight:
                "48px",

              border:
                "none",

              borderRadius:
                "12px",

              background:
                "linear-gradient(135deg, #7c3aed, #4f46e5)",

              color:
                "#ffffff",

              fontFamily:
                "inherit",

              fontSize:
                "13px",

              fontWeight:
                "850",

              cursor:
                "pointer",

              boxShadow:
                "0 9px 22px rgba(79,70,229,0.18)",
            }}
          >
            {text(
              "Return to Login",
              "العودة لتسجيل الدخول"
            )}
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     NOT AUTHORIZED
  ===================================================== */

  if (
    !allowed
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  /* =====================================================
     ACCESS ALLOWED
  ===================================================== */

  return children;
}


export default ProtectedRoute;