import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../firebase/firebase";
import "./StudentNavigation.css";

const translations = {
  en: {
    openMenu: "Open student menu",
    closeMenu: "Close menu",
    navigation: "Student navigation",
    home: "Home",
    learning: "My Programs",
    explore: "Explore Programs",
    portfolio: "My Portfolio",
    joinClass: "Join a Class",
    profile: "My Profile",
    language: "Language",
    logout: "Log out",
    logoutError: "Could not log out. Please try again.",
  },
  ar: {
    openMenu: "افتح قائمة الطالب",
    closeMenu: "أغلق القائمة",
    navigation: "تنقل الطالب",
    home: "الرئيسية",
    learning: "برامجي",
    explore: "استكشف البرامج",
    portfolio: "معرض أعمالي",
    joinClass: "انضم إلى صف",
    profile: "ملفي الشخصي",
    language: "اللغة",
    logout: "تسجيل الخروج",
    logoutError: "تعذر تسجيل الخروج. حاول مرة أخرى.",
  },
  he: {
    openMenu: "פתיחת תפריט התלמיד",
    closeMenu: "סגירת התפריט",
    navigation: "ניווט תלמידים",
    home: "ראשי",
    learning: "התוכניות שלי",
    explore: "גילוי תוכניות",
    portfolio: "תיק העבודות שלי",
    joinClass: "הצטרפות לכיתה",
    profile: "הפרופיל שלי",
    language: "שפה",
    logout: "התנתקות",
    logoutError: "לא ניתן להתנתק. נסו שוב.",
  },
};

const languages = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
  { id: "he", label: "עברית" },
];

export default function StudentNavigation() {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const text = translations[language] || translations.en;
  const direction = language === "en" ? "ltr" : "rtl";

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await signOut(auth);
      setIsOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Student logout error:", error);
      setLogoutError(text.logoutError);
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="student-navigation" dir={direction}>
      <header className="student-navigation-header">
        <button
          type="button"
          className="student-navigation-trigger"
          aria-label={text.openMenu}
          aria-expanded={isOpen}
          aria-controls="student-navigation-drawer"
          onClick={() => setIsOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <span className="student-navigation-brand">
          <span aria-hidden="true">✨</span>
          TechMinds
        </span>
      </header>

      {isOpen && (
        <>
          <button
            type="button"
            className="student-navigation-overlay"
            aria-label={text.closeMenu}
            tabIndex={-1}
            onClick={closeMenu}
          />
          <aside
            id="student-navigation-drawer"
            className="student-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={text.navigation}
          >
            <div className="student-navigation-drawer-header">
              <strong>{text.navigation}</strong>
              <button
                type="button"
                className="student-navigation-close"
                aria-label={text.closeMenu}
                onClick={closeMenu}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav className="student-navigation-links" aria-label={text.navigation}>
              <NavLink to="/student" end onClick={closeMenu}>
                <span aria-hidden="true">🏠</span>
                {text.home}
              </NavLink>
              <NavLink to="/student/lessons" end onClick={closeMenu}>
                <span aria-hidden="true">📚</span>
                {text.learning}
              </NavLink>
              <NavLink to="/student/programs" end onClick={closeMenu}>
                <span aria-hidden="true">🧭</span>
                {text.explore}
              </NavLink>
              <NavLink to="/student/portfolio" end onClick={closeMenu}>
                <span aria-hidden="true">📁</span>
                {text.portfolio}
              </NavLink>
              <NavLink to="/student/join-class" end onClick={closeMenu}>
                <span aria-hidden="true">🏫</span>
                {text.joinClass}
              </NavLink>
              <NavLink to="/profile" end onClick={closeMenu}>
                <span aria-hidden="true">👤</span>
                {text.profile}
              </NavLink>
            </nav>

            <section className="student-navigation-languages" aria-label={text.language}>
              <h2>{text.language}</h2>
              <div>
                {languages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={language === item.id}
                    className={language === item.id ? "active" : ""}
                    onClick={() => changeLanguage(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {logoutError && (
              <p className="student-navigation-error" role="alert">
                {logoutError}
              </p>
            )}
            <button
              type="button"
              className="student-navigation-logout"
              onClick={handleLogout}
            >
              <span aria-hidden="true">🚪</span>
              {text.logout}
            </button>
          </aside>
        </>
      )}
    </div>
  );
}
