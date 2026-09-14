import {
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  httpsCallable,
} from "firebase/functions";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
  functions,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./StudentJoinClass.css";

import { hebrewText } from "../data/hebrewText";


function StudentJoinClass() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    classCode,
    setClassCode,
  ] = useState("");

  const [
    foundClass,
    setFoundClass,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    joining,
    setJoining,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const text = (
    en,
    ar
  ) =>
    language === "ar"
      ? ar
      : language === "he"
        ? hebrewText(en)
        : en;


  /* ======================
     TRACKS
  ====================== */

  const programs = {
    firstGradeCompanion: {
      icon: "🎒",
      en: "First Grade Companion",
      ar: "رفيق الصف الأول",
    },

    techExplorer: {
      icon: "🚀",
      en: "Tech Explorer",
      ar: "مستكشف التكنولوجيا",
    },

    giftedChallenge: {
      icon: "🧠",
      en: "Gifted Challenge",
      ar: "تحديات الموهوبين",
    },

    aiExplorer: {
      icon: "🤖",
      en: "AI Explorer",
      ar: "مستكشف الذكاء الاصطناعي",
    },

    codeCreator: {
      icon: "💻",
      en: "Code Creator",
      ar: "صانع البرمجيات",
    },

    digitalCreator: {
      icon: "🎨",
      en: "Digital Creator",
      ar: "المبدع الرقمي",
    },
  };


  /* ======================
     NORMALIZE CODE
  ====================== */

  const normalizeCode =
    (value) => {
      return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");
    };


  /* ======================
     FIND CLASS
  ====================== */

  const findClass =
    async (e) => {
      e.preventDefault();

      setError("");
      setFoundClass(null);


      if (
        !classCode.trim()
      ) {
        setError(
          text(
            "Enter your class code.",
            "أدخل رمز الصف."
          )
        );

        return;
      }


      try {
        setLoading(true);

        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }


        /* CHECK STUDENT */

        const studentSnapshot =
          await getDoc(
            doc(
              db,
              "users",
              user.uid
            )
          );


        if (
          !studentSnapshot.exists()
        ) {
          navigate("/login");
          return;
        }


        const student =
          studentSnapshot.data();


        if (
          student.role !==
          "student"
        ) {
          navigate("/teacher");
          return;
        }


        if (
          student.classId
        ) {
          setError(
            text(
              "You are already connected to a class.",
              "أنت منضم إلى صف بالفعل."
            )
          );

          return;
        }


        const normalized =
          normalizeCode(
            classCode
          );


        /*
          Find the class using
          classCodes collection
        */

        const codeSnapshot =
          await getDoc(
            doc(
              db,
              "classCodes",
              normalized
            )
          );


        if (
          !codeSnapshot.exists()
        ) {
          throw new Error(
            "class-not-found"
          );
        }


        const codeData =
          codeSnapshot.data();


        /*
          Load actual class
        */

        const classSnapshot =
          await getDoc(
            doc(
              db,
              "classes",
              codeData.classId
            )
          );


        if (
          !classSnapshot.exists()
        ) {
          throw new Error(
            "class-not-found"
          );
        }


        const data =
          classSnapshot.data();


        if (
          data.status !==
          "active"
        ) {
          throw new Error(
            "class-inactive"
          );
        }


        setFoundClass({
          id:
            classSnapshot.id,

          ...data,
        });

      } catch (err) {
        console.error(
          "Find class error:",
          err
        );


        if (
          err.message ===
          "class-inactive"
        ) {
          setError(
            text(
              "This class is currently inactive.",
              "هذا الصف غير فعّال حاليًا."
            )
          );

        } else {
          setError(
            text(
              "Class code was not found. Check the code and try again.",
              "لم يتم العثور على رمز الصف. تأكد من الرمز وحاول مرة أخرى."
            )
          );
        }

      } finally {
        setLoading(false);
      }
    };


  /* ======================
     JOIN CLASS
  ====================== */

  const joinClass =
    async () => {
      if (!foundClass) {
        return;
      }


      try {
        setJoining(true);
        setError("");


        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }


        const joinClass = httpsCallable(functions, "joinClass");
        await joinClass({ classCode: foundClass.classCode });


        navigate(
          "/student"
        );

      } catch (err) {
        console.error(
          "Join class error:",
          err
        );

        setError(
          text(
            "Could not join this class.",
            "تعذر الانضمام إلى الصف."
          )
        );

      } finally {
        setJoining(false);
      }
    };


  return (
    <div className="join-class-page">

      {/* LANGUAGE */}

      <div className="join-language">

        <button
          className={
            language === "en"
              ? "active"
              : ""
          }
          onClick={() =>
            setLanguage("en")
          }
        >
          English
        </button>

        <button
          className={
            language === "ar"
              ? "active"
              : ""
          }
          onClick={() =>
            setLanguage("ar")
          }
        >
          العربية
        </button>

      </div>


      <div className="join-class-container">

        {/* BACK */}

        <button
          className="join-back"
          onClick={() =>
            navigate("/student")
          }
        >
          {language === "ar"
            ? "↩ رجوع"
            : "← Back"}
        </button>


        <div className="join-icon">
          🏫
        </div>


        <h1>
          {text(
            "Join a Class",
            "الانضمام إلى صف"
          )}
        </h1>


        <p className="join-description">
          {text(
            "Enter the class code your teacher gave you.",
            "أدخل رمز الصف الذي أعطاك إياه المعلّم."
          )}
        </p>


        {/* SEARCH */}

        {!foundClass && (
          <form
            className="join-form"
            onSubmit={findClass}
          >

            <label>
              {text(
                "Class Code",
                "رمز الصف"
              )}
            </label>


            <div className="class-code-input">

              <span>
                🔑
              </span>

              <input
                type="text"
                placeholder="TM-X7K92"
                value={classCode}
                onChange={(e) =>
                  setClassCode(
                    e.target.value
                      .toUpperCase()
                  )
                }
                required
              />

            </div>


            <button
              type="submit"
              disabled={loading}
              className="find-class-button"
            >
              {loading
                ? text(
                    "Searching...",
                    "جارٍ البحث..."
                  )
                : text(
                    "Find My Class 🔍",
                    "ابحث عن صفي 🔍"
                  )}
            </button>

          </form>
        )}


        {/* CLASS FOUND */}

        {foundClass && (
          <div className="found-class-card">

            <div className="found-badge">
              ✓{" "}
              {text(
                "Class Found!",
                "تم العثور على الصف!"
              )}
            </div>


            <div className="found-class-icon">
              {
                programs[
                  foundClass.learningTrack
                ]?.icon || "🏫"
              }
            </div>


            <h2>
              {foundClass.name}
            </h2>


            <p className="found-program">
              {
                programs[
                  foundClass.learningTrack
                ]
                  ? text(
                      programs[
                        foundClass.learningTrack
                      ].en,

                      programs[
                        foundClass.learningTrack
                      ].ar
                    )
                  : foundClass.learningTrack
              }
            </p>


            <div className="found-details">

              <div>
                <span>
                  👩‍🏫{" "}
                  {text(
                    "Teacher",
                    "المعلّم"
                  )}
                </span>

                <strong>
                  {foundClass.teacherName ||
                    "—"}
                </strong>
              </div>


              <div>
                <span>
                  🎓{" "}
                  {text(
                    "Grade",
                    "الصف"
                  )}
                </span>

                <strong>
                  {foundClass.grade}
                </strong>
              </div>


              <div>
                <span>
                  🔑{" "}
                  {text(
                    "Class Code",
                    "رمز الصف"
                  )}
                </span>

                <strong>
                  {foundClass.classCode}
                </strong>
              </div>

            </div>


            <button
              className="confirm-join-button"
              onClick={joinClass}
              disabled={joining}
            >
              {joining
                ? text(
                    "Joining...",
                    "جارٍ الانضمام..."
                  )
                : text(
                    "Join This Class 🚀",
                    "انضم إلى هذا الصف 🚀"
                  )}
            </button>


            <button
              className="different-code-button"
              onClick={() => {
                setFoundClass(null);
                setClassCode("");
                setError("");
              }}
            >
              {text(
                "Use a different code",
                "استخدام رمز آخر"
              )}
            </button>

          </div>
        )}


        {error && (
          <div className="join-error">
            ⚠️ {error}
          </div>
        )}


        <div className="join-help">
          💡{" "}
          {text(
            "Class codes usually look like TM-X7K92.",
            "رمز الصف يكون عادةً مثل TM-X7K92."
          )}
        </div>

      </div>

    </div>
  );
}


export default StudentJoinClass;