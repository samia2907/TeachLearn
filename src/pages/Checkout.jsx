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
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./Checkout.css";


function Checkout() {
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


  /* =====================================================
     INITIALIZE PADDLE
  ===================================================== */

  useEffect(() => {
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
              token,

              environment:
                "sandbox",

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
                        ? "✅ تمت عملية الدفع التجريبية بنجاح."
                        : "✅ Sandbox payment completed successfully."
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
            active &&
            paddleInstance
          ) {
            setPaddle(
              paddleInstance
            );
          }

        } catch (
          paddleError
        ) {
          console.error(
            "Paddle initialization error:",
            paddleError
          );


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

  }, []);


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
    pendingPurchase
      ?.licenseType ||
    "student";


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
      /*
        PROGRAM PRICES

        Later each program can have:

        paddlePriceIds: {
          student: "pri_xxx",
          teacher: "pri_xxx",
          class: "pri_xxx"
        }
      */

      if (
        checkoutType ===
          "program" &&
        programData
          ?.paddlePriceIds
          ?.[licenseType]
      ) {
        return programData
          .paddlePriceIds[
            licenseType
          ];
      }


      /*
        For the Sandbox test we currently
        use one Paddle Price ID.
      */

      return (
        import.meta.env
          .VITE_PADDLE_TEST_PRICE_ID ||
        ""
      );
    };


  /* =====================================================
     SECURE PAYMENT
  ===================================================== */

  const handleSecurePayment =
    () => {
      try {
        setMessage("");


        /* =========================
           PADDLE READY?
        ========================= */

        if (!paddle) {
          setMessage(
            text(
              "Paddle is still loading. Please try again in a moment.",
              "نظام الدفع ما زال قيد التحميل. حاولي مرة أخرى بعد لحظة."
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
          "Paddle Price ID:",
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

                class_id:
                  licenseType ===
                    "class"
                    ? pendingPurchase
                        ?.classId ||
                      ""
                    : "",
              }),
        };


        console.log(
          "Paddle custom data:",
          customData
        );


        /* =================================================
           OPEN PADDLE CHECKOUT
        ================================================= */

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

                    {language ===
                    "ar"
                      ? selectedTrack.ar
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

            🧪{" "}

            {text(
              "Paddle Sandbox — this payment is for testing only. No real money will be charged.",
              "Paddle Sandbox — عملية الدفع الآن للتجربة فقط ولن يتم خصم أموال حقيقية."
            )}

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