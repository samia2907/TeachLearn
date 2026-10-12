
import { useEffect, useState, useSyncExternalStore } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { authEntry } from "../auth/returnTo.mjs";
import { auth, db } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";

const manualAccessMode =
  String(import.meta.env.VITE_MANUAL_ACCESS_MODE ?? "true")
    .toLowerCase() !== "false";

/*
 * One shared account observer for protected routes.
 * Unlike a getDoc per route, the same profile listener
 * is reused when navigating across protected pages.
 */

let accountState = {
  loading: true,
  user: null,
  profile: null,
  blocked: false,
  error: null,
};

const subscribers = new Set();
let authObserverStarted = false;
let stopProfileObserver = null;
let currentUid = null;

function notifyAccountSubscribers() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

function updateAccountState(changes) {
  accountState = { ...accountState, ...changes };
  notifyAccountSubscribers();
}

function getAccountSnapshot() {
  return accountState;
}

function subscribeToAccount(callback) {
  subscribers.add(callback);

  if (!authObserverStarted) {
    authObserverStarted = true;

    onAuthStateChanged(
      auth,
      user => {
        if (stopProfileObserver) {
          stopProfileObserver();
          stopProfileObserver = null;
        }

        if (!user) {
          currentUid = null;

          updateAccountState({
            loading: false,
            user: null,
            profile: null,
            error: null,
            // Keep the blocked message after an automatic sign-out.
            blocked: accountState.blocked,
          });
          return;
        }

        currentUid = user.uid;

        updateAccountState({
          loading: true,
          user,
          profile: null,
          blocked: false,
          error: null,
        });

        const uid = user.uid;

        stopProfileObserver = onSnapshot(
          doc(db, "users", uid),
          async snapshot => {
            if (currentUid !== uid) return;

            if (!snapshot.exists()) {
              updateAccountState({
                loading: false,
                profile: null,
                error: "profile-not-found",
              });

              await signOut(auth).catch(console.error);
              return;
            }

            const profile = snapshot.data();

            const blocked =
              profile.role === "student" &&
              ["inactive", "blocked", "suspended"].includes(
                profile.accountStatus
              );

            if (blocked) {
              updateAccountState({
                loading: false,
                user,
                profile,
                blocked: true,
                error: null,
              });

              await signOut(auth).catch(console.error);
              return;
            }

            updateAccountState({
              loading: false,
              user,
              profile,
              blocked: false,
              error: null,
            });
          },
          error => {
            if (currentUid !== uid) return;

            console.error("Account profile listener error:", error);

            updateAccountState({
              loading: false,
              profile: null,
              error: error.code || "profile-error",
            });
          }
        );
      },
      error => {
        console.error("Authentication observer error:", error);

        updateAccountState({
          loading: false,
          user: null,
          profile: null,
          error: error.code || "auth-error",
        });
      }
    );
  }

  return () => {
    subscribers.delete(callback);
  };
}

function translate(language, en, ar, he) {
  if (language === "ar") return ar;
  if (language === "he") return he;
  return en;
}

function LoadingScreen({ language, subscription = false }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "#f7f8fc",
        fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
        direction: language === "en" ? "ltr" : "rtl",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 45, marginBottom: 12 }}>✨</div>
        <p style={{ color: "#64748b", fontWeight: 700 }}>
          {subscription
            ? translate(
                language,
                "Checking your subscription...",
                "جارٍ التحقق من اشتراكك...",
                "בודקים את המנוי שלך..."
              )
            : translate(
                language,
                "Checking your account...",
                "جارٍ التحقق من الحساب...",
                "בודקים את החשבון שלך..."
              )}
        </p>
      </div>
    </div>
  );
}

function MessageScreen({ language, icon, title, message, action, onAction }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: 20,
        display: "grid",
        placeItems: "center",
        direction: language === "en" ? "ltr" : "rtl",
        background: "linear-gradient(135deg, #f8fafc, #f5f3ff)",
        fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: "min(480px, 100%)",
          padding: "32px 24px",
          background: "#ffffff",
          borderRadius: 20,
          textAlign: "center",
          boxShadow: "0 18px 48px rgba(15,23,42,.09)",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 14 }}>{icon}</div>
        <h1 style={{ color: "#172033", fontSize: 24, margin: "0 0 12px" }}>
          {title}
        </h1>
        <p style={{ color: "#64748b", lineHeight: 1.7 }}>
          {message}
        </p>
        <button
          type="button"
          onClick={onAction}
          style={{
            width: "100%",
            minHeight: 48,
            marginTop: 12,
            border: 0,
            borderRadius: 12,
            color: "#ffffff",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          {action}
        </button>
      </div>
    </div>
  );
}

function PlanGate({ children, userId, requiredPlan, language }) {
  const navigate = useNavigate();
  const [result, setResult] = useState({
    key: null,
    status: "loading",
  });

  const key = `${userId}:${requiredPlan}`;

  useEffect(() => {
    let cancelled = false;

    getDoc(doc(db, "subscriptions", userId))
      .then(snapshot => {
        if (cancelled) return;

        const subscription = snapshot.exists()
          ? snapshot.data()
          : null;

        const valid =
          subscription?.status === "active" &&
          subscription?.planId === requiredPlan;

        setResult({
          key,
          status: valid ? "allowed" : "denied",
        });
      })
      .catch(error => {
        if (cancelled) return;

        console.error("Subscription check error:", error);

        setResult({
          key,
          status: "error",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, requiredPlan, key]);

  if (result.key !== key || result.status === "loading") {
    return <LoadingScreen language={language} subscription />;
  }

  if (result.status === "error") {
    return (
      <MessageScreen
        language={language}
        icon="⚠️"
        title={translate(
          language,
          "Could not check subscription",
          "تعذر التحقق من الاشتراك",
          "לא ניתן לבדוק את המנוי"
        )}
        message={translate(
          language,
          "Please try again.",
          "حاولي مجددًا.",
          "יש לנסות שוב."
        )}
        action={translate(
          language,
          "Retry",
          "إعادة المحاولة",
          "ניסיון חוזר"
        )}
        onAction={() => window.location.reload()}
      />
    );
  }

  if (result.status === "denied") {
    return (
      <MessageScreen
        language={language}
        icon="🔒"
        title={translate(
          language,
          "This feature requires an upgrade",
          "هذه الميزة تتطلب ترقية الخطة",
          "התכונה הזו דורשת שדרוג"
        )}
        message={translate(
          language,
          "Upgrade your subscription to access this feature.",
          "قومي بترقية الاشتراك للوصول إلى هذه الميزة.",
          "שדרגו את המנוי כדי לגשת לתכונה הזו."
        )}
        action={translate(
          language,
          "Upgrade Plan",
          "ترقية الخطة",
          "שדרוג התוכנית"
        )}
        onAction={() => navigate("/plans")}
      />
    );
  }

  return children;
}

function ProtectedRoute({ children, allowedRole, requiredPlan }) {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const account = useSyncExternalStore(
    subscribeToAccount,
    getAccountSnapshot,
    getAccountSnapshot
  );

  const returnPath =
    location.pathname + location.search + location.hash;

  if (account.loading) {
    return <LoadingScreen language={language} />;
  }

  if (account.blocked) {
    return (
      <MessageScreen
        language={language}
        icon="⛔"
        title={translate(
          language,
          "Your account has been deactivated",
          "تم تعطيل حسابك",
          "החשבון שלך הושבת"
        )}
        message={translate(
          language,
          "Please contact your teacher for assistance.",
          "يرجى التواصل مع المعلّم للحصول على المساعدة.",
          "יש לפנות למורה לקבלת עזרה."
        )}
        action={translate(
          language,
          "Return to Login",
          "العودة لتسجيل الدخول",
          "חזרה להתחברות"
        )}
        onAction={() => navigate("/login", { replace: true })}
      />
    );
  }

  if (!account.user) {
    return (
      <Navigate
        to={authEntry(returnPath)}
        replace
      />
    );
  }

  if (account.error) {
    return (
      <MessageScreen
        language={language}
        icon="⚠️"
        title={translate(
          language,
          "Could not verify your account",
          "تعذر التحقق من الحساب",
          "לא ניתן לאמת את החשבון"
        )}
        message={translate(
          language,
          "Please check your connection and try again.",
          "تأكدي من اتصال الإنترنت وحاولي مجددًا.",
          "בדקו את החיבור ונסו שוב."
        )}
        action={translate(
          language,
          "Retry",
          "إعادة المحاولة",
          "ניסיון חוזר"
        )}
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!account.profile) {
    return <LoadingScreen language={language} />;
  }

  if (
    allowedRole &&
    account.profile.role !== allowedRole
  ) {
    return (
      <Navigate
        to={authEntry(returnPath)}
        replace
      />
    );
  }

  if (requiredPlan && !manualAccessMode) {
    return (
      <PlanGate
        userId={account.user.uid}
        requiredPlan={requiredPlan}
        language={language}
      >
        {children}
      </PlanGate>
    );
  }

  return children;
}

export default ProtectedRoute;
