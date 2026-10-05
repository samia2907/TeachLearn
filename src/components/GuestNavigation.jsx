import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccessText } from "../access/accessText";
import { authEntry } from "../auth/returnTo.mjs";
import "./GuestNavigation.css";

export default function GuestNavigation({ destination = "/programs" }) {
  const { t } = useAccessText();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <div className="guest-menu-shell">
      <button
        type="button"
        className="guest-menu-toggle"
        aria-label={t(
          "Open navigation menu",
          "فتح قائمة التنقل",
          "פתיחת תפריט ניווט"
        )}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="guest-menu-backdrop"
            aria-label={t(
              "Close navigation menu",
              "إغلاق قائمة التنقل",
              "סגירת תפריט ניווט"
            )}
            onClick={closeMenu}
          />

          <nav
            className="guest-menu-panel"
            aria-label={t(
              "Explore TechMinds",
              "استكشف TechMinds",
              "גלו את TechMinds"
            )}
          >
            <div className="guest-menu-heading">
              <span className="guest-menu-logo">🚀</span>

              <div>
                <strong>TechMinds</strong>
                <small>
                  {t(
                    "Explore the platform",
                    "استكشف المنصة",
                    "גלו את הפלטפורמה"
                  )}
                </small>
              </div>
            </div>

            <div className="guest-menu-links">
              <Link to="/" onClick={closeMenu}>
                <span>🏠</span>
                {t("Home", "الرئيسية", "בית")}
              </Link>

              <Link to="/about" onClick={closeMenu}>
                <span>ℹ️</span>
                {t("About Us", "من نحن", "אודותינו")}
              </Link>

              <Link to="/programs" onClick={closeMenu}>
                <span>🚀</span>
                {t("Programs", "البرامج", "תוכניות")}
              </Link>

              <Link to="/courses" onClick={closeMenu}>
                <span>🎓</span>
                {t(
                  "Courses & Private Lessons",
                  "الدورات والدروس الخاصة",
                  "קורסים ושיעורים פרטיים"
                )}
              </Link>

              <Link
                to={`${authEntry(destination)}#login-section`}
                onClick={closeMenu}
              >
                <span>🔐</span>
                {t(
                  "Log in",
                  "تسجيل الدخول",
                  "התחברות"
                )}
              </Link>
            </div>

            <Link
              className="guest-menu-start"
              to={authEntry(destination, "/register")}
              onClick={closeMenu}
            >
              ✨{" "}
              {t(
                "Create Account",
                "إنشاء حساب",
                "יצירת חשבון"
              )}
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
