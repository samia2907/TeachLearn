import { useLanguage } from "../context/LanguageContext";

export default function PageLoading() {
  const { language } = useLanguage();
  const label = { en: "Loading…", ar: "جارٍ التحميل…", he: "טוען…" };
  return (
    <div
      role="status"
      aria-live="polite"
      dir={language === "ar" || language === "he" ? "rtl" : "ltr"}
      style={{ minHeight: "40vh", display: "grid", placeItems: "center", padding: "24px" }}
    >
      {label[language] || label.en}
    </div>
  );
}
