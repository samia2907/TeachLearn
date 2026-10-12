import { useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { watchInactivity } from "./inactivitySession";

export default function InactivityLogout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const controller = useRef(null);

  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  useEffect(() => {
    const session = watchInactivity({
      getUser: () => auth.currentUser,
      subscribeToAuth: callback => onAuthStateChanged(auth, callback),
      signOut: () => signOut(auth),
      onTimeout: () => navigateRef.current("/login", {
        replace: true,
        state: { inactivityLogout: true },
      }),
    });
    controller.current = session;
    return () => { session.dispose(); controller.current = null; };
  }, []);

  useEffect(() => { controller.current?.activity(); }, [location.key]);
  return null;
}
