import {
  useLanguage,
} from "../context/LanguageContext";

import "./LanguageSwitcher.css";

function LanguageSwitcher() {
  const {
    language,
    changeLanguage,
  } = useLanguage();

  return (
    <nav
      className="global-language-switcher"
      aria-label="Language"
    >
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        onClick={() => changeLanguage("en")}
        aria-pressed={language === "en"}
      >
        EN
      </button>

      <button
        type="button"
        className={language === "ar" ? "active" : ""}
        onClick={() => changeLanguage("ar")}
        aria-pressed={language === "ar"}
      >
        عربي
      </button>

      <button
        type="button"
        className={language === "he" ? "active" : ""}
        onClick={() => changeLanguage("he")}
        aria-pressed={language === "he"}
      >
        עברית
      </button>
    </nav>
  );
}

export default LanguageSwitcher;
