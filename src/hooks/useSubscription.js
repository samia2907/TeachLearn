import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";


function useSubscription() {
  const [
    subscription,
    setSubscription,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      setSubscription(null);
      setLoading(false);

      return undefined;
    }


    const subscriptionRef =
      doc(
        db,
        "subscriptions",
        user.uid
      );


    const unsubscribe =
      onSnapshot(
        subscriptionRef,

        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            setSubscription({
              id:
                snapshot.id,

              ...snapshot.data(),
            });

          } else {
            setSubscription(null);
          }


          setLoading(false);
        },

        (error) => {
          console.error(
            "Subscription listener error:",
            error
          );

          setSubscription(null);
          setLoading(false);
        }
      );


    return () =>
      unsubscribe();

  }, []);


  const planId =
    subscription?.planId ||
    null;


  const isActive =
    subscription?.status ===
    "active";


  const isTeacherPro =
    isActive &&
    planId ===
      "teacherPro";


  const isTeacherBasic =
    isActive &&
    (
      planId ===
        "teacherBasic" ||
      planId ===
        "teacherPro"
    );


  const hasAllAccess =
    isActive &&
    (
      planId ===
        "allAccess" ||
      planId ===
        "family"
    );


  const hasOneProgram =
    isActive &&
    planId ===
      "oneProgram";


  return {
    subscription,

    loading,

    planId,

    isActive,

    isTeacherPro,

    isTeacherBasic,

    hasAllAccess,

    hasOneProgram,
  };
}


export default useSubscription;