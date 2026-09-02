import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  studentCreatorAuth,
} from "../firebase/studentAuth";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./TeacherClassDetails.css";


function TeacherClassDetails() {
  const navigate =
    useNavigate();

  const {
    classId,
  } = useParams();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    classData,
    setClassData,
  ] = useState(null);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    showAddStudent,
    setShowAddStudent,
  ] = useState(false);

  const [
    studentName,
    setStudentName,
  ] = useState("");

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const text = (
    en,
    ar
  ) =>
    language === "ar"
      ? ar
      : en;


  /* ========================
     HELPERS
  ======================== */

  const normalizeUsername = (
    value
  ) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");


  const normalizeCode = (
    value
  ) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");


  const generateStudentCode = () => {
    const characters =
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let value = "";

    for (
      let i = 0;
      i < 6;
      i++
    ) {
      value +=
        characters[
          Math.floor(
            Math.random() *
              characters.length
          )
        ];
    }

    return `TM-${value}`;
  };


  const getUniqueStudentCode =
    async () => {
      for (
        let attempt = 0;
        attempt < 10;
        attempt++
      ) {
        const code =
          generateStudentCode();

        const normalized =
          normalizeCode(code);

        const snapshot =
          await getDoc(
            doc(
              db,
              "studentLoginIndex",
              `c_${normalized}`
            )
          );

        if (
          !snapshot.exists()
        ) {
          return code;
        }
      }

      throw new Error(
        "student-code-failed"
      );
    };


  /* ========================
     LOAD CLASS
  ======================== */

  const loadClass =
    async () => {
      try {
        setLoading(true);

        const user =
          auth.currentUser;

        if (!user) {
          navigate("/login");
          return;
        }

        const classSnapshot =
          await getDoc(
            doc(
              db,
              "classes",
              classId
            )
          );

        if (
          !classSnapshot.exists()
        ) {
          navigate(
            "/teacher/classes"
          );

          return;
        }

        const data =
          classSnapshot.data();

        if (
          data.teacherId !==
          user.uid
        ) {
          navigate(
            "/teacher"
          );

          return;
        }

        setClassData({
          id:
            classSnapshot.id,

          ...data,
        });


        /* STUDENTS */

        const studentQuery =
          query(
            collection(
              db,
              "users"
            ),

            where(
              "role",
              "==",
              "student"
            ),

            where(
              "classId",
              "==",
              classId
            )
          );

        const studentSnapshot =
          await getDocs(
            studentQuery
          );

        const studentList =
          studentSnapshot.docs.map(
            (studentDoc) => ({
              id:
                studentDoc.id,

              ...studentDoc.data(),
            })
          );

        setStudents(
          studentList
        );

      } catch (err) {
        console.error(
          "Load class error:",
          err
        );

        setError(
          text(
            "Could not load this class.",
            "تعذر تحميل الصف."
          )
        );

      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadClass();
  }, [classId]);


  /* ========================
     ADD STUDENT
  ======================== */

  const addStudent =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");


      if (
        !studentName.trim() ||
        !username.trim() ||
        !password
      ) {
        setError(
          text(
            "Please complete all fields.",
            "يرجى تعبئة جميع الحقول."
          )
        );

        return;
      }


      if (
        password.length < 6
      ) {
        setError(
          text(
            "Password must contain at least 6 characters.",
            "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل."
          )
        );

        return;
      }


      const normalizedUsername =
        normalizeUsername(
          username
        );


      const usernameRegex =
        /^[\p{L}\p{N}._-]{3,24}$/u;


      if (
        !usernameRegex.test(
          normalizedUsername
        )
      ) {
        setError(
          text(
            "Username must contain 3–24 letters or numbers.",
            "اسم المستخدم يجب أن يحتوي على 3 إلى 24 حرفًا أو رقمًا."
          )
        );

        return;
      }


      try {
        setSaving(true);

        const teacher =
          auth.currentUser;

        if (!teacher) {
          navigate("/login");
          return;
        }


        /* CHECK USERNAME */

        const usernameRef =
          doc(
            db,
            "studentLoginIndex",
            `u_${normalizedUsername}`
          );

        const usernameSnapshot =
          await getDoc(
            usernameRef
          );


        if (
          usernameSnapshot.exists()
        ) {
          throw new Error(
            "username-taken"
          );
        }


        /* CREATE CODE */

        const studentCode =
          await getUniqueStudentCode();

        const normalizedCode =
          normalizeCode(
            studentCode
          );


        /*
          INTERNAL FIREBASE EMAIL.
          Student never types this.
        */

        const internalEmail =
          `${normalizedCode.replace(
            "-",
            ""
          )}.${Date.now()}@student.techminds.app`;


        /* CREATE AUTH ACCOUNT */

        const authResult =
          await createUserWithEmailAndPassword(
            studentCreatorAuth,
            internalEmail,
            password
          );


        const studentUid =
          authResult.user.uid;


        /*
          Immediately sign out the
          secondary auth instance.
        */

        await signOut(
          studentCreatorAuth
        );


        /* FIRESTORE BATCH */

        const batch =
          writeBatch(db);


        /* STUDENT PROFILE */

        batch.set(
          doc(
            db,
            "users",
            studentUid
          ),
          {
            uid:
              studentUid,

            name:
              studentName.trim(),

            role:
              "student",

            username:
              username.trim(),

            usernameNormalized:
              normalizedUsername,

            studentCode,

            authEmail:
              internalEmail,

            teacherId:
              teacher.uid,

            classId,

            classCode:
              classData.classCode,

            grade:
              classData.grade,

            learningTrack:
              classData.learningTrack,

            xp: 0,

            level: 1,

            badges: [],

            plan:
              "classAccess",

            subscriptionStatus:
              "teacher_managed",

            accountStatus:
              "active",

            createdBy:
              "teacher",

            createdAt:
              serverTimestamp(),
          }
        );


        /* USERNAME INDEX */

        batch.set(
          usernameRef,
          {
            uid:
              studentUid,

            authEmail:
              internalEmail,

            teacherId:
              teacher.uid,

            classId,

            type:
              "username",

            createdAt:
              serverTimestamp(),
          }
        );


        /* CODE INDEX */

        batch.set(
          doc(
            db,
            "studentLoginIndex",
            `c_${normalizedCode}`
          ),
          {
            uid:
              studentUid,

            authEmail:
              internalEmail,

            teacherId:
              teacher.uid,

            classId,

            type:
              "studentCode",

            createdAt:
              serverTimestamp(),
          }
        );


        /* UPDATE CLASS COUNT */

        batch.update(
          doc(
            db,
            "classes",
            classId
          ),
          {
            studentCount:
              students.length + 1,
          }
        );


        await batch.commit();


        setStudentName("");
        setUsername("");
        setPassword("");

        setShowAddStudent(
          false
        );


        setSuccess(
          text(
            `Student created successfully. Student code: ${studentCode}`,
            `تم إنشاء الطالب بنجاح. رمز الطالب: ${studentCode}`
          )
        );


        await loadClass();

      } catch (err) {
        console.error(
          "Add student error:",
          err
        );


        if (
          err.message ===
          "username-taken"
        ) {
          setError(
            text(
              "This username is already taken.",
              "اسم المستخدم مستخدم بالفعل."
            )
          );

        } else if (
          err.code ===
          "auth/email-already-in-use"
        ) {
          setError(
            text(
              "Could not generate student account. Try again.",
              "تعذر إنشاء حساب الطالب. حاول مرة أخرى."
            )
          );

        } else {
          setError(
            text(
              "Could not add the student.",
              "تعذر إضافة الطالب."
            )
          );
        }

      } finally {
        setSaving(false);
      }
    };


  /* ========================
     LOADING
  ======================== */

  if (loading) {
    return (
      <div className="class-details-loading">

        <div>
          🚀
        </div>

        <p>
          {text(
            "Loading class...",
            "جارٍ تحميل الصف..."
          )}
        </p>

      </div>
    );
  }


  if (!classData) {
    return null;
  }


  return (
    <div className="teacher-class-details">

      {/* TOP */}

      <header className="class-details-header">

        <div>

          <button
            className="details-back"
            onClick={() =>
              navigate(
                "/teacher/classes"
              )
            }
          >
            {language === "ar"
              ? "↩ رجوع للصفوف"
              : "← Back to Classes"}
          </button>


          <h1>
            🏫{" "}
            {classData.name}
          </h1>


          <p>
            {text(
              "Manage students, attendance and learning.",
              "إدارة الطلاب والحضور والتعلّم."
            )}
          </p>

        </div>


        <div className="details-actions">

          <div className="details-language">

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
              EN
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
              عربي
            </button>

          </div>


          <button
            className="add-student-button"
            onClick={() => {
              setError("");
              setSuccess("");

              setShowAddStudent(
                true
              );
            }}
          >
            +{" "}
            {text(
              "Add Student",
              "إضافة طالب"
            )}
          </button>

        </div>

      </header>


      {/* INFO CARDS */}

      <section className="class-info-grid">

        <div>
          <span>
            🎓{" "}
            {text(
              "Grade",
              "الصف"
            )}
          </span>

          <strong>
            {classData.grade}
          </strong>
        </div>


        <div>
          <span>
            👥{" "}
            {text(
              "Students",
              "الطلاب"
            )}
          </span>

          <strong>
            {students.length}
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
            {classData.classCode}
          </strong>
        </div>


        <div>
          <span>
            📚{" "}
            {text(
              "Program",
              "المسار"
            )}
          </span>

          <strong>
            {classData.learningTrack}
          </strong>
        </div>

      </section>


      {success && (
        <div className="details-success">
          ✅ {success}
        </div>
      )}


      {error && (
        <div className="details-error">
          ⚠️ {error}
        </div>
      )}


      {/* STUDENTS */}

      <section className="students-panel">

        <div className="students-panel-header">

          <div>
            <h2>
              🎓{" "}
              {text(
                "Students",
                "الطلاب"
              )}
            </h2>

            <p>
              {text(
                "Students enrolled in this class.",
                "الطلاب المسجلون في هذا الصف."
              )}
            </p>
          </div>


          <button
            onClick={() =>
              setShowAddStudent(
                true
              )
            }
          >
            +{" "}
            {text(
              "Add Student",
              "إضافة طالب"
            )}
          </button>

        </div>


        {students.length === 0 ? (

          <div className="no-students">

            <div>
              🎓
            </div>

            <h3>
              {text(
                "No students yet",
                "لا يوجد طلاب بعد"
              )}
            </h3>

            <p>
              {text(
                "Add your first student to this class.",
                "أضف أول طالب لهذا الصف."
              )}
            </p>

          </div>

        ) : (

          <div className="students-table">

            <div className="students-table-head">

              <span>
                {text(
                  "Student",
                  "الطالب"
                )}
              </span>

              <span>
                {text(
                  "Username",
                  "اسم المستخدم"
                )}
              </span>

              <span>
                {text(
                  "Student Code",
                  "رمز الطالب"
                )}
              </span>

              <span>
                {text(
                  "Level",
                  "المستوى"
                )}
              </span>

            </div>


            {students.map(
              (student) => (

                <div
                  className="student-row"
                  key={student.id}
                >

                  <div className="student-name">

                    <div>
                      🎓
                    </div>

                    <strong>
                      {student.name}
                    </strong>

                  </div>


                  <span>
                    {student.username}
                  </span>


                  <strong className="student-code">
                    {student.studentCode}
                  </strong>


                  <span>
                    ⭐{" "}
                    {student.level || 1}
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </section>


      {/* ADD STUDENT MODAL */}

      {showAddStudent && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            <div className="student-modal-header">

              <div>
                <div className="student-modal-icon">
                  🎓
                </div>

                <h2>
                  {text(
                    "Add Student",
                    "إضافة طالب"
                  )}
                </h2>

                <p>
                  {text(
                    "Create a login account for this student.",
                    "أنشئ حساب دخول للطالب."
                  )}
                </p>
              </div>


              <button
                onClick={() =>
                  setShowAddStudent(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                addStudent
              }
              className="student-form"
            >

              <label>
                {text(
                  "Student Name",
                  "اسم الطالب"
                )}
              </label>

              <input
                type="text"
                value={
                  studentName
                }
                onChange={(e) =>
                  setStudentName(
                    e.target.value
                  )
                }
                placeholder={
                  text(
                    "Full name",
                    "الاسم الكامل"
                  )
                }
                required
              />


              <label>
                {text(
                  "Username",
                  "اسم المستخدم"
                )}
              </label>

              <input
                type="text"
                value={
                  username
                }
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="adam23"
                required
              />


              <label>
                {text(
                  "Password",
                  "كلمة المرور"
                )}
              </label>

              <input
                type="password"
                value={
                  password
                }
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder={
                  text(
                    "At least 6 characters",
                    "6 أحرف على الأقل"
                  )
                }
                required
              />


              <div className="student-login-note">
                🔑{" "}
                {text(
                  "TechMinds will automatically generate a student code. The student can log in with either the username or the code.",
                  "سيقوم TechMinds بإنشاء رمز طالب تلقائيًا، ويمكن للطالب تسجيل الدخول باسم المستخدم أو رمز الطالب."
                )}
              </div>


              {error && (
                <div className="student-modal-error">
                  {error}
                </div>
              )}


              <div className="student-modal-actions">

                <button
                  type="button"
                  className="student-cancel"
                  onClick={() =>
                    setShowAddStudent(
                      false
                    )
                  }
                >
                  {text(
                    "Cancel",
                    "إلغاء"
                  )}
                </button>


                <button
                  type="submit"
                  className="student-save"
                  disabled={saving}
                >
                  {saving
                    ? text(
                        "Creating...",
                        "جارٍ الإنشاء..."
                      )
                    : text(
                        "Create Student 🚀",
                        "إنشاء الطالب 🚀"
                      )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


export default TeacherClassDetails;