import { manualAccessMode, programDestination } from '../access/programFlow.mjs';
import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  initializePaddle,
} from "@paddle/paddle-js";

import {
  auth,
  db,
  functions,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./Checkout.css";
import { readPaddleConfig, selectPaddlePrice, programLicenseForRole } from "../firebase/paddleConfig";
import { studentHasProgramAccess } from "../firebase/studentProgramAccess";
import { httpsCallable } from "firebase/functions";

import { hebrewText } from "../data/hebrewText";
import { whatsappAccessLink } from "../access/accessText";

const checkProgramAccess = httpsCallable(
  functions,
  "checkProgramAccess"
);

function Checkout() {
  const [programAccessReady, setProgramAccessReady] = useState(false);
  const isSandbox = (import.meta.env.VITE_PADDLE_ENVIRONMENT || "sandbox") === "sandbox";
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();


  const {
    language,
    setLanguage,
  } = useLanguage();


  /* =====================================================
     CHECKOUT TYPE
  ===================================================== */

  const checkoutType =
    searchParams.get("type") ===
    "program"
      ? "program"
      : "plan";


  /* =====================================================
     STATE
  ===================================================== */

  const [
    paddle,
    setPaddle,
  ] = useState(null);

  const [
    paddleInitialized,
    setPaddleInitialized,
  ] = useState(false);

  const [
    paddleInitializationFailed,
    setPaddleInitializationFailed,
  ] = useState(false);

  const [
    userData,
    setUserData,
  ] = useState(null);

  const [
    programData,
    setProgramData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);

  const [
    paymentCompleted,
    setPaymentCompleted,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    publicSettings,
    setPublicSettings,
  ] = useState({});


  /* =====================================================
     LANGUAGE
  ===================================================== */

  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrewText(english)
      : english;


  const localized =
    (value) => {
      if (!value) {
        return "";
      }

      if (
        typeof value ===
        "string"
      ) {
        return value;
      }

      return (
        value[language] ||
        value.en ||
        value.ar ||
        ""
      );
    };


  /* =====================================================
     PLAN INFORMATION
  ===================================================== */

  const planInfo = {
    oneProgram: {
      en:
        "One Program",

      ar:
        "مسار واحد",

      monthly:
        29,

      yearly:
        290,

      icon:
        "⭐",
    },


    allAccess: {
      en:
        "All Access",

      ar:
        "الوصول الكامل",

      monthly:
        49,

      yearly:
        490,

      icon:
        "🚀",
    },


    family: {
      en:
        "Family",

      ar:
        "العائلة",

      monthly:
        69,

      yearly:
        690,

      icon:
        "👨‍👩‍👧",
    },


    teacherBasic: {
      en:
        "Teacher Basic",

      ar:
        "المعلّم الأساسي",

      monthly:
        39,

      yearly:
        390,

      icon:
        "👩‍🏫",
    },


    teacherPro: {
      en:
        "Teacher Pro",

      ar:
        "المعلّم الاحترافي",

      monthly:
        79,

      yearly:
        790,

      icon:
        "⭐",
    },
  };


  /* =====================================================
     TRACK INFORMATION
  ===================================================== */

  const trackInfo = {
    firstGradeCompanion: {
      en:
        "First Grade Companion",

      ar:
        "رفيق الصف الأول",

      icon:
        "🎒",
    },


    techExplorer: {
      en:
        "Tech Explorer",

      ar:
        "مستكشف التكنولوجيا",

      icon:
        "🚀",
    },


    giftedChallenge: {
      en:
        "Gifted Challenge",

      ar:
        "تحديات الموهوبين",

      icon:
        "🧠",
    },


    aiExplorer: {
      en:
        "AI Explorer",

      ar:
        "مستكشف الذكاء الاصطناعي",

      icon:
        "🤖",
    },


    codeCreator: {
      en:
        "Code Creator",

      ar:
        "صانع البرمجيات",

      icon:
        "💻",
    },


    digitalCreator: {
      en:
        "Digital Creator",

      ar:
        "المبدع الرقمي",

      icon:
        "🎨",
    },
  };


  useEffect(() => {
    getDoc(doc(db, "platformSettings", "public"))
      .then((snapshot) => {
        setPublicSettings(snapshot.exists() ? snapshot.data() : {});
      })
      .catch(() => setPublicSettings({}));
  }, []);

    /* =====================================================
     INITIALIZE PADDLE
  ===================================================== */

  useEffect(() => {
    if (manualAccessMode || !userData) return;
    let active =
      true;


    const setupPaddle =
      async () => {
        try {
          const token =
            import.meta.env
              .VITE_PADDLE_CLIENT_TOKEN;


          if (!token) {
            console.error(
              "Missing VITE_PADDLE_CLIENT_TOKEN"
            );

            if (
              active
            ) {
              setPaddleInitializationFailed(
                true
              );
            }

            setMessage(
              text(
                "Paddle client token is missing.",
                "رمز Paddle غير موجود."
              )
            );

            return;
          }


          const paddleInstance =
            await initializePaddle({
              token: readPaddleConfig(import.meta.env).token,

              environment:
                readPaddleConfig(import.meta.env).environment,

              eventCallback:
                (event) => {
                  console.log(
                    "Paddle event:",
                    event
                  );


                  /* =========================
                     PAYMENT COMPLETED
                  ========================= */

                  if (
                    event.name ===
                    "checkout.completed"
                  ) {
                    setPaymentCompleted(
                      true
                    );

                    setPaymentLoading(
                      false
                    );


                    setMessage(
                      language === "ar"
                        ? "تم الدفع. جارٍ التحقق من تفعيل الوصول…"
                        : "Payment completed. Confirming your access…"
                    );
                  }


                  /* =========================
                     CHECKOUT CLOSED
                  ========================= */

                  if (
                    event.name ===
                    "checkout.closed"
                  ) {
                    setPaymentLoading(
                      false
                    );
                  }


                  /* =========================
                     CHECKOUT ERROR
                  ========================= */

                  if (
                    event.name ===
                    "checkout.error"
                  ) {
                    setPaymentLoading(
                      false
                    );


                    console.error(
                      "Paddle checkout error:",
                      event
                    );
                  }
                },
            });

          if (
            !paddleInstance?.Checkout?.open
          ) {
            throw new Error(
                "Paddle did not return a checkout instance."
            );
          }


          if (
            active &&
            paddleInstance
          ) {
            setPaddle(
                paddleInstance
            );

            setPaddleInitialized(
                true
            );

            console.log(
                "[Paddle checkout debug] Paddle initialized:",
                true
            );
          }

        } catch (
          paddleError
        ) {
          console.error(
            "Paddle initialization error:",
            paddleError
          );

          if (
            active
          ) {
            setPaddleInitializationFailed(
              true
            );
          }


          setMessage(
            text(
              "Could not initialize Paddle.",
              "تعذر تشغيل نظام الدفع Paddle."
            )
          );
        }
      };


    setupPaddle();


    return () => {
      active =
        false;
    };

  }, [checkoutType, userData?.role]);


  /* =====================================================
     LOAD CHECKOUT DATA
  ===================================================== */

  useEffect(() => {
    const loadCheckout =
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


          const data =
            userSnapshot.data();

          if (manualAccessMode) {
            setUserData(data);

            const programId =
              searchParams.get("programId") ||
              data.pendingPurchase?.programId;

            if (programId && !programId.includes("/")) {
              const snapshot = await getDoc(doc(db, "programs", programId));
              if (snapshot.exists()) {
                setProgramData({
                  id: snapshot.id,
                  ...snapshot.data(),
                });
              }
            }

            return;
          }


          /* =================================================
             PROGRAM PURCHASE
          ================================================= */

          if (
            checkoutType ===
            "program"
          ) {
            const purchase =
              data.pendingPurchase;


            if (
              !purchase ||
              purchase.type !==
                "program" ||
              !purchase.programId
            ) {
              navigate(
                "/programs"
              );

              return;
            }


            const programSnapshot =
              await getDoc(
                doc(
                  db,
                  "programs",
                  purchase.programId
                )
              );


            if (
              !programSnapshot.exists()
            ) {
              setUserData(
                data
              );


              setMessage(
                text(
                  "The selected program could not be found.",
                  "لم يتم العثور على البرنامج المختار."
                )
              );

              return;
            }


            setProgramData({
              id:
                programSnapshot.id,

              ...programSnapshot.data(),
            });


            setUserData(
              data
            );


            return;
          }


          /* =================================================
             PLAN SUBSCRIPTION
          ================================================= */

          if (
            !data.pendingPlan
          ) {
            navigate(
              "/plans"
            );

            return;
          }


          setUserData(
            data
          );

        } catch (
          error
        ) {
          console.error(
            "Checkout loading error:",
            error
          );


          setMessage(
            text(
              "Could not load checkout.",
              "تعذر تحميل صفحة الدفع."
            )
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadCheckout();

  }, [
    checkoutType,
    navigate,
  ]);


  /* =====================================================
     CURRENT PLAN
  ===================================================== */

  const plan =
    checkoutType === "plan" &&
    userData
      ? planInfo[
          userData.pendingPlan
        ]
      : null;


  const billingCycle =
    userData
      ?.pendingBillingCycle ||
    "monthly";


  const selectedTrack =
    userData?.pendingTrack
      ? trackInfo[
          userData.pendingTrack
        ]
      : null;


  /* =====================================================
     PROGRAM PURCHASE DATA
  ===================================================== */

  const pendingPurchase =
    userData
      ?.pendingPurchase ||
    null;


  const licenseType =
    programLicenseForRole(userData?.role, pendingPurchase?.licenseType);

  // Listen for the server-written entitlement; checkout.completed alone cannot grant access.
  useEffect(() => {
    if (checkoutType !== "program" || !paymentCompleted || !pendingPurchase?.programId || !licenseType) return;
    let cancelled = false;
    let timer;
    let attempts = 0;
    const confirm = async () => {
      try {
        const response = await checkProgramAccess({ programId: pendingPurchase.programId });
        if (cancelled) return;
        if (response.data?.hasAccess === true) {
          setProgramAccessReady(true);
          return;
        }
      } catch { /* The webhook may still be processing. Never grant access from the checkout event. */ }
      if (!cancelled && ++attempts < 30) timer = setTimeout(confirm, 2000);
    };
    confirm();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [checkoutType, paymentCompleted, pendingPurchase?.programId, pendingPurchase?.classId, licenseType]);


  /* =====================================================
     LICENSE LABEL
  ===================================================== */

  const getLicenseLabel =
    () => {
      if (
        licenseType ===
        "teacher"
      ) {
        return text(
          "Teacher Access",
          "وصول المعلّم"
        );
      }


      if (
        licenseType ===
        "class"
      ) {
        return text(
          "Class License",
          "ترخيص صف"
        );
      }


      return text(
        "Student Access",
        "وصول الطالب"
      );
    };


  /* =====================================================
     DISPLAY PRICE
  ===================================================== */

  const getDisplayPrice =
    () => {
      if (
        checkoutType ===
        "program"
      ) {
        if (
          licenseType ===
          "teacher"
        ) {
          return Number(
            programData
              ?.pricing
              ?.teacher ||
            0
          );
        }


        if (
          licenseType ===
          "class"
        ) {
          return Number(
            programData
              ?.pricing
              ?.class ||
            0
          );
        }


        return Number(
          programData
            ?.pricing
            ?.student ||
          0
        );
      }


      if (!plan) {
        return 0;
      }


      return billingCycle ===
        "yearly"
        ? plan.yearly
        : plan.monthly;
    };


  const displayPrice =
    getDisplayPrice();


  /* =====================================================
     PADDLE PRICE ID
  ===================================================== */

  const getPaddlePriceId =
    () => {
      const config = readPaddleConfig(import.meta.env);
      if (checkoutType === "program" && !licenseType) throw new Error("This account cannot purchase programs.");
      return selectPaddlePrice({
        ...config,
        testPriceId: import.meta.env.VITE_PADDLE_TEST_PRICE_ID,
        type: checkoutType,
        programPriceId: programData?.paddlePriceIds?.[licenseType],
        planId: userData?.pendingPlan,
        billingCycle,
      });
    };


  /* =====================================================
     SECURE PAYMENT
  ===================================================== */

  const handleSecurePayment =
    async () => {
      try {
        setMessage("");
        if (manualAccessMode && checkoutType === "program" && userData?.role === "student") {
          const hasAccess = await studentHasProgramAccess(
            httpsCallable(functions, "checkProgramAccess"), pendingPurchase?.programId,
          );
          if (hasAccess) navigate(`/programs/${pendingPurchase.programId}`);
          else setMessage(language === "ar" ? "الدفع قريبًا" : language === "he" ? "התשלום יתווסף בקרוב" : "Payment coming soon");
          return;
        }

        console.log(
          "[Paddle checkout debug] Final payment button clicked:",
          {
            checkoutType,
          }
        );

        console.log(
          "[Paddle checkout debug] programId:",
          pendingPurchase
            ?.programId ||
            ""
        );

        console.log(
          "[Paddle checkout debug] Paddle initialized:",
          paddleInitialized
        );


        /* =========================
           PADDLE READY?
        ========================= */

        if (
          !paddleInitialized ||
          !paddle?.Checkout?.open
        ) {
          setMessage(
            text(
              paddleInitializationFailed
                ? "Could not initialize Paddle. Please refresh the page and try again."
                : "Paddle is still loading. Please try again in a moment.",
              paddleInitializationFailed
                ? "تعذر تشغيل نظام الدفع Paddle. يرجى تحديث الصفحة والمحاولة مرة أخرى."
                : "نظام الدفع ما زال قيد التحميل. حاولي مرة أخرى بعد لحظة."
            )
          );

          return;
        }


        /* =========================
           PRICE ID
        ========================= */

        const priceId =
          getPaddlePriceId();


        console.log(
          "[Paddle checkout debug] priceId:",
          priceId
        );


        if (!priceId) {
          setMessage(
            text(
              "Paddle Price ID is missing.",
              "رقم سعر Paddle غير موجود."
            )
          );

          return;
        }


        if (
          !priceId.startsWith(
            "pri_"
          )
        ) {
          console.error(
            "Invalid Paddle Price ID:",
            priceId
          );


          setMessage(
            text(
              "Invalid Paddle Price ID.",
              "رقم سعر Paddle غير صحيح."
            )
          );

          return;
        }


        /* =========================
           AUTH
        ========================= */

        const user =
          auth.currentUser;


        if (!user) {
          navigate(
            "/login"
          );

          return;
        }


        setPaymentLoading(
          true
        );


        /* =================================================
           CUSTOM DATA
        ================================================= */

        const customData = {
          techminds_user_id:
            user.uid,

          checkout_type:
            checkoutType,


          /* =========================
             PLAN
          ========================= */

          ...(checkoutType ===
          "plan"
            ? {
                plan_id:
                  userData
                    .pendingPlan ||
                  "",

                billing_cycle:
                  billingCycle,

                track_id:
                  userData
                    .pendingTrack ||
                  "",
              }


            /* =========================
               PROGRAM
            ========================= */

            : {
                program_id:
                  pendingPurchase
                    ?.programId ||
                  "",

                license_type:
                  licenseType,

                ...(licenseType === "class" ? { class_id: pendingPurchase?.classId || "" } : {}),
              }),
        };


        console.log(
          "Paddle custom data:",
          customData
        );


        /* =================================================
           OPEN PADDLE CHECKOUT
        ================================================= */

        if (checkoutType === "program" && userData.role === "student" &&
            await studentHasProgramAccess(
              checkProgramAccess, pendingPurchase?.programId,
            )) {
          setPaymentLoading(false);
          navigate(`/programs/${pendingPurchase.programId}`);
          return;
        }

        console.log(
          "[Paddle checkout debug] Opening Paddle.Checkout.open:",
          {
            programId: pendingPurchase
              ?.programId ||
              "",
            priceId,
          }
        );

        paddle.Checkout.open({
          items: [
            {
              priceId:
                priceId,

              quantity:
                1,
            },
          ],


          /* =========================
             CUSTOMER EMAIL
          ========================= */

          customer:
            userData.email
              ? {
                  email:
                    userData.email,
                }
              : undefined,


          /* =========================
             TECHMINDS DATA
          ========================= */

          customData,


          /* =========================
             CHECKOUT SETTINGS
          ========================= */

          settings: {
            displayMode:
              "overlay",

            theme:
              "light",

            locale:
              language === "ar"
                ? "ar"
                : "en",

            allowLogout:
              false,
          },
        });


        /*
          Paddle has now opened.

          Actual access will NOT be granted here.

          The secure webhook will later confirm
          transaction.completed and then create:

          programPurchases
          programAccess
          subscriptions
        */

        setPaymentLoading(
          false
        );

      } catch (
        error
      ) {
        console.error(
          "Paddle payment error:",
          error
        );


        setPaymentLoading(
          false
        );


        setMessage(
          text(
            "Could not open secure payment.",
            "تعذر فتح صفحة الدفع الآمن."
          )
        );
      }
    };


  /* =====================================================
     BACK
  ===================================================== */

  const handleBack =
    () => {
      if (
        checkoutType ===
        "program"
      ) {
        if (
          userData?.role ===
          "teacher"
        ) {
          navigate(
            "/teacher/programs"
          );

          return;
        }


        navigate(
          "/student/programs"
        );

        return;
      }


      navigate(
        "/plans"
      );
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="checkout-loading">

        <div>
          💳
        </div>


        <p>
          {text(
            "Preparing secure checkout...",
            "جارٍ تجهيز الدفع الآمن..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     NO USER
  ===================================================== */

  if (!userData) {
    return null;
  }

  const checkoutWhatsAppNumber =
    publicSettings.whatsapp ||
    publicSettings.supportPhone ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    "";

  const checkoutWhatsApp = whatsappAccessLink(checkoutWhatsAppNumber, {
    name:
      userData?.name ||
      userData?.displayName ||
      userData?.username ||
      "",
    email:
      userData?.email ||
      auth.currentUser?.email ||
      text("No email", "بدون بريد إلكتروني"),
    programName:
      localized(programData?.title) ||
      text(
        "TechMinds services and additional options",
        "خدمات TechMinds والخدمات الإضافية"
      ),
    language,
  });

  if (manualAccessMode) {
    return (
      <main
        className="checkout-page"
        dir={language === "en" ? "ltr" : "rtl"}
      >
        <div className="checkout-language">
          <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button>
          <button type="button" className={language === "ar" ? "active" : ""} onClick={() => setLanguage("ar")}>العربية</button>
          <button type="button" className={language === "he" ? "active" : ""} onClick={() => setLanguage("he")}>עברית</button>
        </div>

        <div className="checkout-header">
          <div className="checkout-logo">💬</div>
          <h1>
            {text(
              "Online payment is currently unavailable",
              "الدفع الإلكتروني غير متاح حاليًا"
            )}
          </h1>
          <p>
            {text(
              "You can contact us directly to ask about program access, registration, private lessons, courses, custom packages, or other services.",
              "يمكنك التواصل معنا مباشرة للاستفسار عن فتح البرامج، التسجيل، الدروس الخاصة، الدورات، الباقات أو أي خدمات إضافية."
            )}
          </p>
        </div>

        <div className="checkout-wrapper">
          <section className="checkout-card">
            <div className="checkout-plan-title">
              <div className="checkout-plan-icon">
                {programData?.icon || "✨"}
              </div>

              <div>
                <span>
                  {text(
                    "Contact TechMinds",
                    "تواصل مع TechMinds"
                  )}
                </span>

                <h2>
                  {localized(programData?.title) ||
                    text(
                      "Ask about our services",
                      "استفسر عن خدماتنا"
                    )}
                </h2>
              </div>
            </div>

            <p>
              {text(
                "Send us a WhatsApp message and we’ll help you choose the right option.",
                "ابعث لنا رسالة على واتساب وسنساعدك باختيار الخيار المناسب."
              )}
            </p>

            {checkoutWhatsApp ? (
              <a
                className="secure-payment-button"
                href={checkoutWhatsApp}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                {text(
                  "💬 Contact us on WhatsApp",
                  "💬 تواصل معنا عبر واتساب"
                )}
              </a>
            ) : (
              <div className="checkout-message">
                {text(
                  "WhatsApp contact is not configured yet.",
                  "رقم واتساب للتواصل غير مُعدّ بعد."
                )}
              </div>
            )}

            <button
              type="button"
              className="checkout-back"
              onClick={() =>
                navigate(
                  userData?.role === "teacher"
                    ? "/teacher"
                    : "/student"
                )
              }
              style={{ marginTop: "14px" }}
            >
              {text(
                "Back to dashboard",
                "العودة للصفحة الرئيسية"
              )}
            </button>
          </section>
        </div>
      </main>
    );
  }

  /* =====================================================
     INVALID PLAN
  ===================================================== */

  if (
    checkoutType ===
      "plan" &&
    !plan
  ) {
    return (
      <div className="checkout-loading">

        <p>
          {text(
            "The selected plan is not available.",
            "الخطة المختارة غير متاحة."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     INVALID PROGRAM
  ===================================================== */

  if (
    checkoutType ===
      "program" &&
    !programData
  ) {
    return (
      <div className="checkout-loading">

        <p>
          {message ||
            text(
              "The selected program is not available.",
              "البرنامج المختار غير متاح."
            )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE VALUES
  ===================================================== */

  const checkoutIcon =
    checkoutType ===
    "program"
      ? programData?.icon ||
        "🚀"
      : plan.icon;


  const checkoutTitle =
    checkoutType ===
    "program"
      ? localized(
          programData?.title
        )
      : language === "he"
      ? hebrewText(plan.en)
      : language === "ar"
      ? plan.ar
      : plan.en;


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="checkout-page">

      {/* =================================================
          LANGUAGE
      ================================================= */}

      <div className="checkout-language">

        <button
          type="button"
          className={
            language ===
            "en"
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
            language ===
            "ar"
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


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="checkout-header">

        <div className="checkout-logo">
          🚀
        </div>


        <h1>

          {checkoutType ===
          "program"
            ? text(
                "Complete Your Purchase",
                "إتمام شراء البرنامج"
              )
            : text(
                "Complete Your Subscription",
                "إتمام الاشتراك"
              )}

        </h1>


        <p>

          {text(
            "Review your order before continuing to secure payment.",
            "راجعي تفاصيل طلبك قبل المتابعة إلى الدفع الآمن."
          )}

        </p>

      </div>


      {/* =================================================
          WRAPPER
      ================================================= */}

      <div className="checkout-wrapper">

        {/* =================================================
            ORDER
        ================================================= */}

        <div className="checkout-card">

          <button
            type="button"
            className="checkout-back"
            onClick={
              handleBack
            }
          >

            {language ===
            "ar"
              ? "↩ رجوع"
              : language === "he"
                ? "→ חזרה"
                : "← Back"}

          </button>


          {/* =================================================
              TITLE
          ================================================= */}

          <div className="checkout-plan-title">

            <div className="checkout-plan-icon">
              {checkoutIcon}
            </div>


            <div>

              <span>

                {checkoutType ===
                "program"
                  ? text(
                      "Selected program",
                      "البرنامج المختار"
                    )
                  : text(
                      "Selected plan",
                      "الخطة المختارة"
                    )}

              </span>


              <h2>
                {checkoutTitle}
              </h2>

            </div>

          </div>


          {/* =================================================
              PROGRAM PURCHASE
          ================================================= */}

          {checkoutType ===
            "program" && (
            <>

              <div className="checkout-row">

                <span>
                  {text(
                    "Access type",
                    "نوع الوصول"
                  )}
                </span>


                <strong>
                  {getLicenseLabel()}
                </strong>

              </div>


              {licenseType ===
                "class" &&
                pendingPurchase
                  ?.classId && (

                <div className="checkout-row">

                  <span>
                    {text(
                      "Class",
                      "الصف"
                    )}
                  </span>


                  <strong>
                    {pendingPurchase.classId}
                  </strong>

                </div>

              )}

            </>
          )}


          {/* =================================================
              PLAN
          ================================================= */}

          {checkoutType ===
            "plan" && (
            <>

              {selectedTrack && (

                <div className="checkout-row">

                  <span>
                    {text(
                      "Learning program",
                      "المسار التعليمي"
                    )}
                  </span>


                  <strong>

                    {selectedTrack.icon}{" "}

                    {language === "ar"
                      ? selectedTrack.ar
                      : language === "he"
                        ? hebrewText(selectedTrack.en)
                        : selectedTrack.en}

                  </strong>

                </div>

              )}


              <div className="checkout-row">

                <span>
                  {text(
                    "Billing",
                    "طريقة الاشتراك"
                  )}
                </span>


                <strong>

                  {billingCycle ===
                  "monthly"
                    ? text(
                        "Monthly",
                        "شهري"
                      )
                    : text(
                        "Yearly",
                        "سنوي"
                      )}

                </strong>

              </div>

            </>
          )}


          {/* =================================================
              ACCOUNT
          ================================================= */}

          <div className="checkout-row">

            <span>
              {text(
                "Account",
                "الحساب"
              )}
            </span>


            <strong>

              {userData.name ||
                userData.username ||
                "TechMinds User"}

            </strong>

          </div>


          {userData.email && (

            <div className="checkout-row">

              <span>
                {text(
                  "Email",
                  "البريد الإلكتروني"
                )}
              </span>


              <strong>
                {userData.email}
              </strong>

            </div>

          )}


          <div className="checkout-divider">
          </div>


          {/* =================================================
              TOTAL
          ================================================= */}

          <div className="checkout-total">

            <div>

              <span>
                {text(
                  "Total",
                  "المجموع"
                )}
              </span>


              <small>

                {checkoutType ===
                "program"
                  ? text(
                      "one-time payment",
                      "دفعة واحدة"
                    )
                  : billingCycle ===
                    "monthly"
                  ? text(
                      "per month",
                      "شهريًا"
                    )
                  : text(
                      "per year",
                      "سنويًا"
                    )}

              </small>

            </div>


            <strong>
              ₪{displayPrice}
            </strong>

          </div>


          {/* =================================================
              SANDBOX NOTICE
          ================================================= */}

          <div
            style={{
              marginTop:
                "14px",

              padding:
                "11px 13px",

              borderRadius:
                "10px",

              background:
                "#fff7ed",

              color:
                "#c2410c",

              fontSize:
                "11px",

              fontWeight:
                "700",

              lineHeight:
                "1.6",
            }}
          >

            {isSandbox ? "🧪 " : "🔒 "}

            {isSandbox ? text(
              "Paddle Sandbox — this payment is for testing only. No real money will be charged.",
              "Paddle Sandbox — عملية الدفع الآن للتجربة فقط ولن يتم خصم أموال حقيقية."
            ) : text("Live payment — you will be charged the amount shown in Paddle checkout.", "دفع حقيقي — سيتم خصم المبلغ الظاهر في نافذة الدفع لدى Paddle.")}

          </div>


          {/* =================================================
              PAYMENT BUTTON
          ================================================= */}

          <button
            type="button"
            className="secure-payment-button"
            onClick={
              handleSecurePayment
            }
            disabled={
              paymentLoading ||
              paymentCompleted
            }
          >

            {paymentCompleted
              ? text(
                  "✅ Payment Completed",
                  "✅ تم الدفع بنجاح"
                )
              : paymentLoading
              ? text(
                  "Preparing Payment...",
                  "جارٍ تجهيز الدفع..."
                )
              : text(
                  "🔒 Continue with Paddle",
                  "🔒 المتابعة للدفع الآمن"
                )}

          </button>


          {/* =================================================
              SECURITY
          ================================================= */}
          {checkoutType === "program" && paymentCompleted && (
            <div aria-live="polite">
              <p>{programAccessReady ? text("Your program is ready.", "برنامجك جاهز.") : text("Waiting for payment confirmation. You can return to My Programs; access updates automatically.", "بانتظار تأكيد الدفع. يمكنك العودة إلى برامجي؛ يتم تحديث الوصول تلقائيًا.")}</p>
              <button type="button" className="secure-payment-button" onClick={() => navigate(programAccessReady ? `/programs/${pendingPurchase.programId}` : "/programs")}>
                {programAccessReady ? text("Open Program", "فتح البرنامج") : text("My Programs", "برامجي")}
              </button>
            </div>
          )}

          <div className="payment-security">

            🔐{" "}

            {text(
                "Payment is processed securely by Paddle. TechMinds never stores card numbers or CVV.",
              "تتم معالجة الدفع بشكل آمن بواسطة Paddle، ولا يقوم TechMinds بحفظ أرقام البطاقات أو CVV."
            )}

          </div>

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="checkout-summary">

          <h3>

            {checkoutType ===
            "program"
              ? text(
                  "Your purchase includes",
                  "عملية الشراء تشمل"
                )
              : text(
                  "Your subscription includes",
                  "اشتراكك يشمل"
                )}

          </h3>


          <div>

            <span>
              ✓
            </span>

            {text(
              "Secure Paddle checkout",
              "دفع آمن عبر Paddle"
            )}

          </div>


          <div>

            <span>
              ✓
            </span>

            {text(
              "Access from any device",
              "الوصول من أي جهاز"
            )}

          </div>


          <div>

            <span>
              ✓
            </span>

            {text(
              "Progress saved automatically",
              "حفظ التقدم تلقائيًا"
            )}

          </div>


          <div>

            <span>
              ✓
            </span>

            {text(
              "Arabic & English",
              "العربية والإنجليزية"
            )}

          </div>


          {checkoutType ===
            "program" && (

            <div>

              <span>
                ✓
              </span>

              {text(
                "Complete learning program",
                "برنامج تعليمي متكامل"
              )}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (

        <div className="checkout-message">
          {message}
        </div>

      )}

    </div>
  );
}


export default Checkout;
