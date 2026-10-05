import { Outlet, useLocation } from "react-router-dom";
import { safeReturnTo } from "../auth/returnTo.mjs";
import GuestNavigation from "./GuestNavigation";
import { useLanguage } from "../context/LanguageContext";

export default function PublicLayout() {
  const location = useLocation();
  const { language } = useLanguage();

  const destination = safeReturnTo(new URLSearchParams(location.search).get("next")) ||
    safeReturnTo(location.pathname + location.search + location.hash) || "/programs";
  const isRTL = language === "ar" || language === "he";

  return (
    <>
      <div
        className={isRTL ? "guest-menu-rtl" : "guest-menu-ltr"}
        style={{
          position: "fixed",
          top: 18,
          right: isRTL ? 18 : "auto",
          left: isRTL ? "auto" : 18,
          zIndex: 2500,
        }}
      >
        <GuestNavigation
          key={location.key}
          destination={destination}
        />
      </div>

      <Outlet />
    </>
  );
}
