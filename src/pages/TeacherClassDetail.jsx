import { useEffect, useState } from "react";
import { getApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";

const functions = getFunctions(getApp(), "europe-west1");

function TeacherClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();

  const text = (
    english,
    arabic,
    hebrew
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
        : english;

  const learningTrackLabel = (value) => {
    const labels = {
      firstGradeCompanion: text(
        "First Grade Companion",
        "رفيق الصف الأول",
        "מלווה לכיתה א׳"
      ),
      techExplorer: text(
        "Tech Explorer",
        "مستكشف التكنولوجيا",
        "חוקר טכנולוגיה"
      ),
      giftedChallenge: text(
        "Gifted Challenge",
        "تحديات الموهوبين",
        "אתגרי מצטיינים"
      ),
      aiExplorer: text(
        "AI Explorer",
        "مستكشف الذكاء الاصطناعي",
        "חוקר בינה מלאכותית"
      ),
      codeCreator: text(
        "Code Creator",
        "صانع البرمجيات",
        "יוצר קוד"
      ),
      digitalCreator: text(
        "Digital Creator",
        "المبدع الرقمي",
        "יוצר דיגיטלי"
      ),
    };

    return labels[value] || value || "-";
  };

  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [contentType, setContentType] = useState("program");
  const [contentId, setContentId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClass = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      if (!classId) {
        setMessage(
          text(
            "Missing class ID.",
            "معرّف الصف مفقود.",
            "מזהה הכיתה חסר."
          )
        );
        return;
      }

      const classSnapshot = await getDoc(doc(db, "classes", classId));

      if (!classSnapshot.exists()) {
        setMessage(
          text(
            "Class not found.",
            "لم يتم العثور على الصف.",
            "הכיתה לא נמצאה."
          )
        );
        return;
      }

      const loadedClass = {
        id: classSnapshot.id,
        ...classSnapshot.data(),
      };

      if (loadedClass.teacherId !== user.uid) {
        setMessage(
          text(
            "You do not have permission to view this class.",
            "ليس لديك صلاحية لعرض هذا الصف.",
            "אין לך הרשאה לצפות בכיתה הזו."
          )
        );
        return;
      }

      const memberSnapshot = await getDocs(
        query(
          collection(db, "classMembers"),
          where("classId", "==", classId),
          where("teacherId", "==", user.uid),
          where("status", "==", "active")
        )
      );

      const loadedMembers = memberSnapshot.docs.map((memberDoc) => {
        const data = memberDoc.data();

        return {
          membershipId: memberDoc.id,
          id: data.studentId,
          ...data,
        };
      });

      setClassData(loadedClass);
      setMembers(loadedMembers);
    } catch (error) {
      console.error("Failed to load teacher class:", error);

      if (error?.code === "permission-denied") {
        setMessage(
          text(
            "You do not have permission to load this class.",
            "ليس لديك صلاحية لتحميل هذا الصف.",
            "אין לך הרשאה לטעון את הכיתה הזו."
          )
        );
      } else if (error?.code === "failed-precondition") {
        setMessage(
          text(
            "This class query requires a Firestore index. Check the browser console.",
            "استعلام هذا الصف يحتاج إلى فهرس Firestore. افحص وحدة التحكم في المتصفح.",
            "השאילתה של הכיתה דורשת אינדקס ב-Firestore. בדקו את מסוף הדפדפן."
          )
        );
      } else {
        setMessage(
          error?.message ||
            text(
              "Could not load this class.",
              "تعذر تحميل هذا الصف.",
              "לא ניתן לטעון את הכיתה הזו."
            )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClass();
  }, [classId]);

  const assignContent = async (event) => {
    event.preventDefault();
    setMessage("");

    const trimmedContentId = contentId.trim();

    if (!trimmedContentId) {
      setMessage(
        text(
          "Please enter a content ID.",
          "أدخل معرّف المحتوى.",
          "הזינו מזהה תוכן."
        )
      );
      return;
    }

    try {
      await httpsCallable(functions, "assignClassContent")({
        classId,
        contentType,
        contentId: trimmedContentId,
      });

      setContentId("");
      setMessage(
        text(
          "Content assigned to this class.",
          "تم تعيين المحتوى لهذا الصف.",
          "התוכן שויך לכיתה הזו."
        )
      );
    } catch (error) {
      console.error("Failed to assign class content:", error);
      setMessage(
        error?.message ||
          text(
            "Could not assign content.",
            "تعذر تعيين المحتوى.",
            "לא ניתן לשייך את התוכן."
          )
      );
    }
  };

  const removeMember = async (studentId) => {
    setMessage("");

    try {
      await httpsCallable(functions, "removeClassMember")({
        classId,
        studentId,
      });

      setMessage(
        text(
          "Student removed from the class.",
          "تمت إزالة الطالب من الصف.",
          "התלמיד הוסר מהכיתה."
        )
      );

      await loadClass();
    } catch (error) {
      console.error("Failed to remove class member:", error);
      setMessage(
        error?.message ||
          text(
            "Could not remove the student.",
            "تعذر إزالة الطالب.",
            "לא ניתן להסיר את התלמיד."
          )
      );
    }
  };

  if (loading) {
    return (
      <main
        className="page-shell"
        dir={language === "en" ? "ltr" : "rtl"}
      >
        {text(
          "Loading class...",
          "جارٍ تحميل الصف...",
          "הכיתה נטענת..."
        )}
      </main>
    );
  }

  if (!classData) {
    return (
      <main
        className="page-shell"
        dir={language === "en" ? "ltr" : "rtl"}
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/teacher/classes")}
          >
            {text(
              "← Back to classes",
              "↩ العودة إلى الصفوف",
              "↩ חזרה לכיתות"
            )}
          </button>

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => setLanguage("ar")}
              aria-pressed={language === "ar"}
            >
              عربي
            </button>

            <button
              type="button"
              onClick={() => setLanguage("he")}
              aria-pressed={language === "he"}
            >
              עברית
            </button>
          </div>
        </div>

        <h1>
          {text(
            "Could not open class",
            "تعذر فتح الصف",
            "לא ניתן לפתוח את הכיתה"
          )}
        </h1>

        <p role="alert">
          {message ||
            text(
              "The class could not be loaded.",
              "تعذر تحميل الصف.",
              "לא ניתן לטעון את הכיתה."
            )}
        </p>

        <button
          type="button"
          onClick={loadClass}
        >
          {text(
            "Try again",
            "حاول مرة أخرى",
            "נסו שוב"
          )}
        </button>
      </main>
    );
  }

  return (
    <main
      className="page-shell"
      dir={language === "en" ? "ltr" : "rtl"}
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/teacher/classes")}
        >
          {text(
            "← Back to classes",
            "↩ العودة إلى الصفوف",
            "↩ חזרה לכיתות"
          )}
        </button>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
          >
            EN
          </button>

          <button
            type="button"
            onClick={() => setLanguage("ar")}
            aria-pressed={language === "ar"}
          >
            عربي
          </button>

          <button
            type="button"
            onClick={() => setLanguage("he")}
            aria-pressed={language === "he"}
          >
            עברית
          </button>
        </div>
      </div>

      <h1>
        {classData.name ||
          text(
            "Class",
            "صف",
            "כיתה"
          )}
      </h1>

      <p>
        {text(
          "Class code:",
          "رمز الصف:",
          "קוד כיתה:"
        )}{" "}
        <strong>
          {classData.classCode || "-"}
        </strong>
      </p>

      {classData.grade && (
        <p>
          {text(
            "Grade:",
            "الصف:",
            "שכבה:"
          )}{" "}
          <strong>{classData.grade}</strong>
        </p>
      )}

      {classData.learningTrack && (
        <p>
          {text(
            "Learning track:",
            "المسار التعليمي:",
            "מסלול למידה:"
          )}{" "}
          <strong>
            {learningTrackLabel(classData.learningTrack)}
          </strong>
        </p>
      )}

      <section
        className="student-panel"
        style={{ marginTop: 24 }}
      >
        <h2>
          {text(
            "Assign content",
            "تعيين محتوى",
            "שיוך תוכן"
          )}
        </h2>

        <form
          onSubmit={assignContent}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 520,
          }}
        >
          <label>
            {text(
              "Content type",
              "نوع المحتوى",
              "סוג תוכן"
            )}

            <select
              value={contentType}
              onChange={(event) =>
                setContentType(event.target.value)
              }
            >
              <option value="program">
                {text(
                  "Program",
                  "برنامج",
                  "תוכנית"
                )}
              </option>

              <option value="lesson">
                {text(
                  "Lesson",
                  "درس",
                  "שיעור"
                )}
              </option>
            </select>
          </label>

          <label>
            {text(
              "Content ID",
              "معرّف المحتوى",
              "מזהה תוכן"
            )}

            <input
              value={contentId}
              onChange={(event) =>
                setContentId(event.target.value)
              }
              placeholder={text(
                "Program or lesson document ID",
                "معرّف مستند البرنامج أو الدرس",
                "מזהה מסמך של תוכנית או שיעור"
              )}
              required
            />
          </label>

          <button type="submit">
            {text(
              "Assign to class",
              "تعيين للصف",
              "שיוך לכיתה"
            )}
          </button>
        </form>
      </section>

      <section
        className="student-panel"
        style={{ marginTop: 24 }}
      >
        <h2>
          {text(
            `Students (${members.length})`,
            `الطلاب (${members.length})`,
            `תלמידים (${members.length})`
          )}
        </h2>

        {members.length === 0 ? (
          <p>
            {text(
              "No students have joined this class yet.",
              "لم ينضم أي طلاب إلى هذا الصف بعد.",
              "עדיין לא הצטרפו תלמידים לכיתה הזו."
            )}
          </p>
        ) : (
          members.map((member) => (
            <div
              key={
                member.membershipId ||
                member.id
              }
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <div>
                <strong>
                  {member.studentName ||
                    member.name ||
                    member.studentEmail ||
                    member.email ||
                    member.studentId ||
                    member.id}
                </strong>

                {member.studentEmail && (
                  <div
                    style={{
                      fontSize: 14,
                      opacity: 0.7,
                      marginTop: 3,
                    }}
                  >
                    {member.studentEmail}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  removeMember(
                    member.studentId ||
                      member.id
                  )
                }
              >
                {text(
                  "Remove",
                  "إزالة",
                  "הסרה"
                )}
              </button>
            </div>
          ))
        )}
      </section>

      {message && (
        <p
          role="status"
          style={{
            marginTop: 20,
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
}

export default TeacherClassDetail;
