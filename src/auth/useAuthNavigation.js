import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  authEntry,
  safeReturnTo,
} from "./returnTo.mjs";


export function useAuthNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const rawNext = safeReturnTo(
    new URLSearchParams(
      location.search
    ).get("next")
  );

  /*
    "/" is the public homepage.
    If login was opened from the homepage,
    we do NOT want a successful login to
    send Teacher/Student back there.

    We still keep useful destinations such as:
    /profile
    /programs/.../access
    /student/...
    /teacher/...
  */
  const next =
    rawNext &&
    rawNext !== "/" &&
    rawNext !== "/login" &&
    rawNext !== "/register"
      ? rawNext
      : null;

  return {
    navigate: (
      to,
      options
    ) =>
      navigate(
        typeof to === "string" &&
          /^\/(login|register)(\?|$)/.test(to)
          ? authEntry(
              next,
              to
            )
          : to,
        options
      ),

    finishAuth: (
      fallback
    ) =>
      navigate(
        next || fallback,
        {
          replace: true,
        }
      ),
  };
}
