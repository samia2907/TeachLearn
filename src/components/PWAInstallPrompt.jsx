import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./PWAInstallPrompt.css";

const STORAGE_KEY = "techminds-pwa-install-dismissed-at";
const DISMISS_DAYS = 14;

const copy = {
  ar: {
    title: "ثبّت TechMinds كتطبيق",
    subtitle: "خلي التعلّم أقرب وأسهل ✨",
    ios: ["اضغط/ي على زر المشاركة ↑", 'اختر/ي "إضافة إلى الشاشة الرئيسية"', 'اضغط/ي "إضافة"'],
    android: ["اضغط/ي على زر تثبيت التطبيق", "وافِق/ي على رسالة التثبيت", "افتح/ي TechMinds من الشاشة الرئيسية"],
    install: "ثبّت التطبيق",
    gotIt: "فهمت 👍",
    close: "إغلاق",
  },
  he: {
    title: "התקינו את TechMinds כאפליקציה",
    subtitle: "למידה זמינה ונוחה יותר ✨",
    ios: ["לחצו על כפתור השיתוף ↑", 'בחרו „הוספה למסך הבית”', 'לחצו „הוספה”'],
    android: ["לחצו על כפתור התקנת האפליקציה", "אשרו את הודעת ההתקנה", "פתחו את TechMinds ממסך הבית"],
    install: "התקנת האפליקציה",
    gotIt: "הבנתי 👍",
    close: "סגירה",
  },
  en: {
    title: "Install TechMinds",
    subtitle: "Make learning easier and always within reach ✨",
    ios: ["Tap the Share button ↑", 'Choose “Add to Home Screen”', 'Tap “Add”'],
    android: ["Tap the install button", "Confirm the installation prompt", "Open TechMinds from your home screen"],
    install: "Install app",
    gotIt: "Got it 👍",
    close: "Close",
  },
};

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function PWAInstallPrompt() {
  const languageContext = useLanguage();
  const language = languageContext?.language || languageContext?.lang || "ar";
  const lang = copy[language] ? language : "ar";
  const t = copy[lang];
  const rtl = lang === "ar" || lang === "he";
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const dialogRef = useRef(null);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;
    const mobile = window.matchMedia?.("(max-width: 1024px)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!mobile) return;

    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

    const timer = window.setTimeout(() => setVisible(true), 3000);
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    const onInstalled = () => {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    dialogRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && dismiss();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result?.outcome === "accepted") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;
  const steps = isIOS ? t.ios : t.android;

  return (
    <div className="pwa-install-overlay" onMouseDown={(e) => e.target === e.currentTarget && dismiss()}>
      <section
        className="pwa-install-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        dir={rtl ? "rtl" : "ltr"}
        tabIndex={-1}
        ref={dialogRef}
      >
        <button className="pwa-install-close" type="button" onClick={dismiss} aria-label={t.close}>×</button>
        <div className="pwa-install-icon" aria-hidden="true">📱</div>
        <h2 id="pwa-install-title">{t.title}</h2>
        <p className="pwa-install-subtitle">{t.subtitle}</p>
        <div className="pwa-install-steps">
          {steps.map((step, index) => (
            <div className="pwa-install-step" key={step}>
              <span className="pwa-install-number">{index + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        {!isIOS && deferredPrompt && (
          <button className="pwa-install-primary" type="button" onClick={install}>{t.install}</button>
        )}
        <button className="pwa-install-secondary" type="button" onClick={dismiss}>{t.gotIt}</button>
      </section>
    </div>
  );
}
