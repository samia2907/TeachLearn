import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../firebase/firebase";
import "./TeacherNavigation.css";

const translations = {
  en: {
    openMenu: "Open teacher menu",
    closeMenu: "Close menu",
    navigation: "Teacher navigation",
    home: "Dashboard",
    classes: "My Classes",
    students: "Students",
    attendance: "Attendance",
    lessons: "Lessons",
    settings: "Settings",
    language: "Language",
    logout: "Log out",
    logoutError: "Could not log out. Please try again.",
  },
  ar: {
    openMenu: "افتح قائمة المعلّم",
    closeMenu: "أغلق القائمة",
    navigation: "تنقل المعلّم",
    home: "الرئيسية",
    classes: "صفوفي",
    students: "الطلاب",
    attendance: "الحضور",
    lessons: "الدروس",
    settings: "الإعدادات",
    language: "اللغة",
    logout: "تسجيل الخروج",
    logoutError: "تعذر تسجيل الخروج. حاول مرة أخرى.",
  },
  he: {
    openMenu: "פתיחת תפריט המורה",
    closeMenu: "סגירת התפריט",
    navigation: "ניווט מורים",
    home: "ראשי",
    classes: "הכיתות שלי",
    students: "תלמידים",
    attendance: "נוכחות",
    lessons: "שיעורים",
    settings: "הגדרות",
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

export default function TeacherNavigation() {
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
      console.error("Teacher logout error:", error);
      setLogoutError(text.logoutError);
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="teacher-navigation" dir={direction}>
      <header className="teacher-navigation-header">
        <button
          type="button"
          className="teacher-navigation-trigger"
          aria-label={text.openMenu}
          aria-expanded={isOpen}
          aria-controls="teacher-navigation-drawer"
          onClick={() => setIsOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <span className="teacher-navigation-brand">
          <span aria-hidden="true">✨</span>
          TechMinds
        </span>
      </header>

      {isOpen && (
        <>
          <button
            type="button"
            className="teacher-navigation-overlay"
            aria-label={text.closeMenu}
            tabIndex={-1}
            onClick={closeMenu}
          />
          <aside
            id="teacher-navigation-drawer"
            className="teacher-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={text.navigation}
          >
            <div className="teacher-navigation-drawer-header">
              <strong>{text.navigation}</strong>
              <button
                type="button"
                className="teacher-navigation-close"
                aria-label={text.closeMenu}
                onClick={closeMenu}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav className="teacher-navigation-links" aria-label={text.navigation}>
              <NavLink to="/teacher" end onClick={closeMenu}>
                <span aria-hidden="true">🏠</span>
                {text.home}
              </NavLink>
              <NavLink to="/teacher/classes" end onClick={closeMenu}>
                <span aria-hidden="true">👥</span>
                {text.classes}
              </NavLink>
              <NavLink to="/teacher/students" end onClick={closeMenu}>
                <span aria-hidden="true">🎓</span>
                {text.students}
              </NavLink>
              <NavLink to="/teacher/attendance" end onClick={closeMenu}>
                <span aria-hidden="true">📅</span>
                {text.attendance}
              </NavLink>
              <NavLink to="/teacher/lessons" end onClick={closeMenu}>
                <span aria-hidden="true">📚</span>
                {text.lessons}
              </NavLink>
              <NavLink to="/teacher/settings" end onClick={closeMenu}>
                <span aria-hidden="true">⚙️</span>
                {text.settings}
              </NavLink>
            </nav>

            <section className="teacher-navigation-languages" aria-label={text.language}>
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
              <p className="teacher-navigation-error" role="alert">
                {logoutError}
              </p>
            )}
            <button
              type="button"
              className="teacher-navigation-logout"
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
