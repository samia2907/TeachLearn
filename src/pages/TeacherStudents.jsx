import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  increment,
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
} from "firebase/auth";

import {
  useNavigate,
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

import "./TeacherStudents.css";


function TeacherStudents() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  /* =====================================================
     MAIN DATA
  ===================================================== */

  const [
    teacher,
    setTeacher,
  ] = useState(null);

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =====================================================
     ADD STUDENT
  ===================================================== */

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

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


  /* =====================================================
     MESSAGES
  ===================================================== */

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    classFilter,
    setClassFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  /* =====================================================
     STUDENT ACTIONS
  ===================================================== */

  const [
    selectedStudent,
    setSelectedStudent,
  ] = useState(null);

  const [
    studentActionLoading,
    setStudentActionLoading,
  ] = useState(false);

  const [
    studentActionError,
    setStudentActionError,
  ] = useState("");


  /* =====================================================
     TRANSLATION
  ===================================================== */

  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  /* =====================================================
     LOAD TEACHER
  ===================================================== */

  useEffect(() => {
    const loadTeacher =
      async () => {
        try {
          const user =
            auth.currentUser;


          if (!user) {
            navigate(
              "/login"
            );

            return;
          }


          const snapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid
              )
            );


          if (!snapshot.exists()) {
            navigate(
              "/login"
            );

            return;
          }


          const data =
            snapshot.data();


          if (
            data.role !==
            "teacher"
          ) {
            navigate(
              "/student"
            );

            return;
          }


          setTeacher(
            data
          );

        } catch (err) {
          console.error(
            "Load teacher error:",
            err
          );

        } finally {
          setLoading(false);
        }
      };


    loadTeacher();

  }, [navigate]);


  /* =====================================================
     LOAD CLASSES REAL TIME
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


    const classesQuery =
      query(
        collection(
          db,
          "classes"
        ),

        where(
          "teacherId",
          "==",
          user.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        classesQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (classDoc) => ({
                id:
                  classDoc.id,

                ...classDoc.data(),
              })
            );


          setClasses(
            list
          );
        },

        (listenerError) => {
          console.error(
            "Classes listener error:",
            listenerError
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     LOAD STUDENTS REAL TIME
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      return undefined;
    }


    const studentsQuery =
      query(
        collection(
          db,
          "users"
        ),

        where(
          "teacherId",
          "==",
          user.uid
        ),

        where(
          "role",
          "==",
          "student"
        )
      );


    const unsubscribe =
      onSnapshot(
        studentsQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (studentDoc) => ({
                id:
                  studentDoc.id,

                ...studentDoc.data(),
              })
            );


          setStudents(
            list
          );
        },

        (listenerError) => {
          console.error(
            "Students listener error:",
            listenerError
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =====================================================
     NORMALIZE
  ===================================================== */

  const normalizeUsername =
    (value) =>
      value
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          ""
        );


  const normalizeCode =
    (value) =>
      value
        .trim()
        .toLowerCase()
        .replace(
          /\s+/g,
          ""
        );


  /* =====================================================
     GENERATE STUDENT CODE
  ===================================================== */

  const generateStudentCode =
    () => {
      const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


      let code = "";


      for (
        let index = 0;
        index < 6;
        index++
      ) {
        code +=
          characters[
            Math.floor(
              Math.random() *
                characters.length
            )
          ];
      }


      return `TM-${code}`;
    };


  const createUniqueStudentCode =
    async () => {
      for (
        let attempt = 0;
        attempt < 10;
        attempt++
      ) {
        const code =
          generateStudentCode();


        const normalized =
          normalizeCode(
            code
          );


        const snapshot =
          await getDoc(
            doc(
              db,
              "studentLoginIndex",
              `c_${normalized}`
            )
          );


        if (!snapshot.exists()) {
          return code;
        }
      }


      throw new Error(
        "student-code-failed"
      );
    };


  /* =====================================================
     ADD STUDENT MODAL
  ===================================================== */

  const openAddStudent =
    () => {
      setError("");
      setSuccess("");

      setStudentName("");
      setUsername("");
      setPassword("");

      setSelectedClassId(
        classes.length === 1
          ? classes[0].id
          : ""
      );

      setShowModal(
        true
      );
    };


  /* =====================================================
     ADD STUDENT
  ===================================================== */

  const handleAddStudent =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !studentName.trim() ||
        !username.trim() ||
        !password ||
        !selectedClassId
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
        password.length <
        6
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


      let createdStudentUser =
        null;

      let firestoreSaved =
        false;


      try {
        setSaving(
          true
        );


        const currentTeacher =
          auth.currentUser;


        if (!currentTeacher) {
          navigate(
            "/login"
          );

          return;
        }


        const selectedClass =
          classes.find(
            (classItem) =>
              classItem.id ===
              selectedClassId
          );


        if (!selectedClass) {
          throw new Error(
            "class-not-found"
          );
        }


        if (
          selectedClass.teacherId !==
          currentTeacher.uid
        ) {
          throw new Error(
            "not-your-class"
          );
        }


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


        const studentCode =
          await createUniqueStudentCode();


        const normalizedStudentCode =
          normalizeCode(
            studentCode
          );


        const internalEmail =
          `${normalizedStudentCode.replace(
            "-",
            ""
          )}.${Date.now()}@student.techminds.app`;


        const authResult =
          await createUserWithEmailAndPassword(
            studentCreatorAuth,
            internalEmail,
            password
          );


        createdStudentUser =
          authResult.user;


        const studentUid =
          createdStudentUser.uid;


        const batch =
          writeBatch(
            db
          );


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
              currentTeacher.uid,

            teacherName:
              teacher?.name ||
              "",

            classId:
              selectedClass.id,

            className:
              selectedClass.name,

            classCode:
              selectedClass.classCode,

            grade:
              selectedClass.grade,

            learningTrack:
              selectedClass.learningTrack,

            xp:
              0,

            level:
              1,

            badges:
              [],

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

            updatedAt:
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
              currentTeacher.uid,

            classId:
              selectedClass.id,

            type:
              "username",

            createdAt:
              serverTimestamp(),
          }
        );


        /* STUDENT CODE INDEX */

        batch.set(
          doc(
            db,
            "studentLoginIndex",
            `c_${normalizedStudentCode}`
          ),

          {
            uid:
              studentUid,

            authEmail:
              internalEmail,

            teacherId:
              currentTeacher.uid,

            classId:
              selectedClass.id,

            type:
              "studentCode",

            createdAt:
              serverTimestamp(),
          }
        );


        /* CLASS COUNT */

        batch.update(
          doc(
            db,
            "classes",
            selectedClass.id
          ),

          {
            studentCount:
              increment(1),

            updatedAt:
              serverTimestamp(),
          }
        );


        await batch.commit();


        firestoreSaved =
          true;


        await signOut(
          studentCreatorAuth
        );


        setStudentName("");
        setUsername("");
        setPassword("");
        setSelectedClassId("");

        setShowModal(
          false
        );


        setSuccess(
          text(
            `Student created successfully. Student code: ${studentCode}`,
            `تم إنشاء الطالب بنجاح. رمز الطالب: ${studentCode}`
          )
        );

      } catch (err) {
        console.error(
          "Add student error:",
          err
        );


        if (
          createdStudentUser &&
          !firestoreSaved
        ) {
          try {
            await deleteUser(
              createdStudentUser
            );

          } catch (
            cleanupError
          ) {
            console.error(
              "Student auth cleanup error:",
              cleanupError
            );
          }
        }


        if (
          err.message ===
          "username-taken"
        ) {
          setError(
            text(
              "This username is already in use.",
              "اسم المستخدم مستخدم بالفعل."
            )
          );

        } else if (
          err.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow adding this student.",
              "صلاحيات Firestore لا تسمح بإضافة الطالب."
            )
          );

        } else if (
          err.code ===
          "auth/weak-password"
        ) {
          setError(
            text(
              "Please choose a stronger password.",
              "اختر كلمة مرور أقوى."
            )
          );

        } else {
          setError(
            text(
              "Could not create the student.",
              "تعذر إنشاء الطالب."
            )
          );
        }

      } finally {
        setSaving(
          false
        );
      }
    };


  /* =====================================================
     CLASS NAME
  ===================================================== */

  const getClassName =
    (classId) => {
      const classItem =
        classes.find(
          (item) =>
            item.id ===
            classId
        );


      return (
        classItem?.name ||
        "—"
      );
    };


  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const filteredStudents =
    useMemo(
      () => {
        const search =
          searchTerm
            .trim()
            .toLowerCase();


        return students.filter(
          (student) => {
            const studentNameValue =
              String(
                student.name ||
                ""
              ).toLowerCase();

            const usernameValue =
              String(
                student.username ||
                ""
              ).toLowerCase();

            const codeValue =
              String(
                student.studentCode ||
                ""
              ).toLowerCase();

            const classNameValue =
              String(
                student.className ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !search ||
              studentNameValue.includes(
                search
              ) ||
              usernameValue.includes(
                search
              ) ||
              codeValue.includes(
                search
              ) ||
              classNameValue.includes(
                search
              );


            const matchesClass =
              classFilter ===
              "all"
                ? true
                : classFilter ===
                  "noClass"
                ? !student.classId
                : student.classId ===
                  classFilter;


            const studentStatus =
              student.accountStatus ||
              "active";


            const matchesStatus =
              statusFilter ===
              "all"
                ? true
                : studentStatus ===
                  statusFilter;


            return (
              matchesSearch &&
              matchesClass &&
              matchesStatus
            );
          }
        );
      },

      [
        students,
        searchTerm,
        classFilter,
        statusFilter,
      ]
    );


  const clearFilters =
    () => {
      setSearchTerm("");
      setClassFilter("all");
      setStatusFilter("all");
    };


  /* =====================================================
     STUDENT ACTIONS
  ===================================================== */

  const openStudentActions =
    (student) => {
      setStudentActionError("");

      setSelectedStudent(
        student
      );
    };


  const closeStudentActions =
    () => {
      if (
        studentActionLoading
      ) {
        return;
      }


      setSelectedStudent(
        null
      );

      setStudentActionError("");
    };


  /* =====================================================
     REMOVE FROM CLASS
  ===================================================== */

  const handleRemoveFromClass =
    async () => {
      if (
        !selectedStudent ||
        !selectedStudent.classId
      ) {
        return;
      }


      const currentTeacher =
        auth.currentUser;


      if (!currentTeacher) {
        navigate(
          "/login"
        );

        return;
      }


      try {
        setStudentActionLoading(
          true
        );

        setStudentActionError("");
        setSuccess("");


        const studentRef =
          doc(
            db,
            "users",
            selectedStudent.id
          );


        const classRef =
          doc(
            db,
            "classes",
            selectedStudent.classId
          );


        await runTransaction(
          db,

          async (
            transaction
          ) => {
            const studentSnapshot =
              await transaction.get(
                studentRef
              );


            if (
              !studentSnapshot.exists()
            ) {
              throw new Error(
                "student-not-found"
              );
            }


            const studentData =
              studentSnapshot.data();


            if (
              studentData.teacherId !==
              currentTeacher.uid
            ) {
              throw new Error(
                "not-your-student"
              );
            }


            const classSnapshot =
              await transaction.get(
                classRef
              );


            transaction.update(
              studentRef,

              {
                classId:
                  "",

                className:
                  "",

                classCode:
                  "",

                grade:
                  "",

                learningTrack:
                  "",

                updatedAt:
                  serverTimestamp(),
              }
            );


            if (
              classSnapshot.exists()
            ) {
              const classData =
                classSnapshot.data();


              if (
                classData.teacherId ===
                currentTeacher.uid
              ) {
                const count =
                  Number(
                    classData.studentCount ||
                    0
                  );


                transaction.update(
                  classRef,

                  {
                    studentCount:
                      Math.max(
                        0,
                        count - 1
                      ),

                    updatedAt:
                      serverTimestamp(),
                  }
                );
              }
            }
          }
        );


        setSuccess(
          text(
            `${selectedStudent.name} was removed from the class. The account and progress were kept.`,
            `تمت إزالة ${selectedStudent.name} من الصف مع الاحتفاظ بالحساب والتقدم.`
          )
        );


        setSelectedStudent(
          null
        );

      } catch (actionError) {
        console.error(
          "Remove from class error:",
          actionError
        );


        setStudentActionError(
          actionError.code ===
          "permission-denied"
            ? text(
                "Firestore permissions do not allow this action.",
                "صلاحيات Firestore لا تسمح بهذه العملية."
              )
            : text(
                "Could not remove this student from the class.",
                "تعذر إزالة الطالب من الصف."
              )
        );

      } finally {
        setStudentActionLoading(
          false
        );
      }
    };


  /* =====================================================
     ACTIVATE / DEACTIVATE
  ===================================================== */

  const handleToggleAccount =
    async () => {
      if (
        !selectedStudent
      ) {
        return;
      }


      const currentTeacher =
        auth.currentUser;


      if (!currentTeacher) {
        navigate(
          "/login"
        );

        return;
      }


      try {
        setStudentActionLoading(
          true
        );

        setStudentActionError("");
        setSuccess("");


        const studentRef =
          doc(
            db,
            "users",
            selectedStudent.id
          );


        const snapshot =
          await getDoc(
            studentRef
          );


        if (!snapshot.exists()) {
          throw new Error(
            "student-not-found"
          );
        }


        const studentData =
          snapshot.data();


        if (
          studentData.teacherId !==
          currentTeacher.uid
        ) {
          throw new Error(
            "not-your-student"
          );
        }


        const currentlyInactive =
          studentData.accountStatus ===
          "inactive";


        const nextStatus =
          currentlyInactive
            ? "active"
            : "inactive";


        await updateDoc(
          studentRef,

          {
            accountStatus:
              nextStatus,

            updatedAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          currentlyInactive
            ? text(
                `${selectedStudent.name}'s account was reactivated.`,
                `تمت إعادة تفعيل حساب ${selectedStudent.name}.`
              )
            : text(
                `${selectedStudent.name}'s account was deactivated.`,
                `تم تعطيل حساب ${selectedStudent.name}.`
              )
        );


        setSelectedStudent(
          null
        );

      } catch (actionError) {
        console.error(
          "Account status error:",
          actionError
        );


        setStudentActionError(
          actionError.code ===
          "permission-denied"
            ? text(
                "Firestore permissions do not allow this action.",
                "صلاحيات Firestore لا تسمح بهذه العملية."
              )
            : text(
                "Could not update this student.",
                "تعذر تحديث حساب الطالب."
              )
        );

      } finally {
        setStudentActionLoading(
          false
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="students-loading">

        <div>
          🎓
        </div>

        <p>
          {text(
            "Loading students...",
            "جارٍ تحميل الطلاب..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="teacher-students-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="students-topbar">

        <div>

          <button
            type="button"
            className="students-back"
            onClick={() =>
              navigate(
                "/teacher"
              )
            }
          >
            {language === "ar"
              ? "↩ رجوع للرئيسية"
              : "← Back to Dashboard"}
          </button>


          <h1>
            🎓{" "}
            {text(
              "Students",
              "الطلاب"
            )}
          </h1>


          <p>
            {text(
              "Manage students, accounts, classes and learning progress.",
              "إدارة الطلاب والحسابات والصفوف والتقدم التعليمي."
            )}
          </p>

        </div>


        <div className="students-header-actions">

          <div className="students-language">

            <button
              type="button"
              className={
                language ===
                "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "en"
                )
              }
            >
              EN
            </button>


            <button
              type="button"
              className={
                language ===
                "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "ar"
                )
              }
            >
              عربي
            </button>

          </div>


          <button
            type="button"
            className="add-student-main-button"
            onClick={
              openAddStudent
            }
            disabled={
              classes.length ===
              0
            }
          >
            +{" "}
            {text(
              "Add Student",
              "إضافة طالب"
            )}
          </button>

        </div>

      </header>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="students-stats">

        <div className="students-stat-card">

          <span>
            🎓
          </span>

          <div>

            <small>
              {text(
                "Total Students",
                "إجمالي الطلاب"
              )}
            </small>

            <strong>
              {students.length}
            </strong>

          </div>

        </div>


        <div className="students-stat-card">

          <span>
            👥
          </span>

          <div>

            <small>
              {text(
                "Classes",
                "الصفوف"
              )}
            </small>

            <strong>
              {classes.length}
            </strong>

          </div>

        </div>


        <div className="students-stat-card">

          <span>
            ✅
          </span>

          <div>

            <small>
              {text(
                "Active",
                "فعّال"
              )}
            </small>

            <strong>
              {
                students.filter(
                  (student) =>
                    student.accountStatus !==
                    "inactive"
                ).length
              }
            </strong>

          </div>

        </div>


        <div className="students-stat-card">

          <span>
            ⛔
          </span>

          <div>

            <small>
              {text(
                "Inactive",
                "غير فعّال"
              )}
            </small>

            <strong>
              {
                students.filter(
                  (student) =>
                    student.accountStatus ===
                    "inactive"
                ).length
              }
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (

        <div className="students-success">

          ✅ {success}

        </div>

      )}


      {classes.length ===
        0 && (

        <div className="students-warning">

          <span>
            🏫
          </span>


          <div>

            <strong>
              {text(
                "No classes yet",
                "لا توجد صفوف بعد"
              )}
            </strong>

            <p>
              {text(
                "Create a class before adding students.",
                "يجب إنشاء صف قبل إضافة الطلاب."
              )}
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/teacher/classes"
              )
            }
          >
            {text(
              "Create Class",
              "إنشاء صف"
            )}
          </button>

        </div>

      )}


      {/* =================================================
          STUDENTS PANEL
      ================================================= */}

      <section className="students-main-panel">

        <div className="students-panel-header">

          <div>

            <small>
              {text(
                "STUDENT MANAGEMENT",
                "إدارة الطلاب"
              )}
            </small>

            <h2>
              {text(
                "My Students",
                "طلابي"
              )}
            </h2>

            <p>
              {text(
                "Search, filter and manage the students connected to your account.",
                "ابحث وصفِّ وأدر الطلاب المرتبطين بحسابك."
              )}
            </p>

          </div>


          {classes.length >
            0 && (

            <button
              type="button"
              onClick={
                openAddStudent
              }
            >
              +{" "}
              {text(
                "Add Student",
                "إضافة طالب"
              )}
            </button>

          )}

        </div>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        {students.length >
          0 && (

          <div className="students-toolbar">

            {/* SEARCH */}

            <div className="students-search-box">

              <span>
                🔎
              </span>

              <input
                type="text"
                value={
                  searchTerm
                }
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder={
                  text(
                    "Search name, username, student code...",
                    "ابحث بالاسم، اسم المستخدم أو رمز الطالب..."
                  )
                }
              />


              {searchTerm && (

                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm(
                      ""
                    )
                  }
                >
                  ×
                </button>

              )}

            </div>


            {/* CLASS */}

            <div className="students-filter">

              <span>
                👥
              </span>

              <select
                value={
                  classFilter
                }
                onChange={(event) =>
                  setClassFilter(
                    event.target.value
                  )
                }
              >

                <option value="all">

                  {text(
                    "All Classes",
                    "كل الصفوف"
                  )}

                </option>


                <option value="noClass">

                  {text(
                    "No Class",
                    "بدون صف"
                  )}

                </option>


                {classes.map(
                  (classItem) => (

                    <option
                      key={
                        classItem.id
                      }
                      value={
                        classItem.id
                      }
                    >
                      {classItem.name}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* STATUS */}

            <div className="students-filter">

              <span>
                ⚡
              </span>

              <select
                value={
                  statusFilter
                }
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="all">

                  {text(
                    "All Statuses",
                    "كل الحالات"
                  )}

                </option>


                <option value="active">

                  {text(
                    "Active",
                    "فعّال"
                  )}

                </option>


                <option value="inactive">

                  {text(
                    "Inactive",
                    "غير فعّال"
                  )}

                </option>

              </select>

            </div>


            {/* RESULT */}

            <div className="students-results-count">

              <small>
                {text(
                  "RESULTS",
                  "النتائج"
                )}
              </small>

              <strong>
                {filteredStudents.length}
              </strong>

            </div>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {students.length ===
        0 ? (

          <div className="students-empty">

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
              {classes.length >
              0
                ? text(
                    "Add your first student to one of your classes.",
                    "أضف أول طالب إلى أحد صفوفك."
                  )
                : text(
                    "Create a class first, then add your students.",
                    "أنشئ صفًا أولًا وبعدها أضف الطلاب."
                  )}
            </p>


            {classes.length >
              0 && (

              <button
                type="button"
                onClick={
                  openAddStudent
                }
              >
                +{" "}
                {text(
                  "Add First Student",
                  "إضافة أول طالب"
                )}
              </button>

            )}

          </div>

        ) : filteredStudents.length ===
          0 ? (

          /* =================================================
             NO SEARCH RESULT
          ================================================= */

          <div className="students-search-empty">

            <div>
              🔎
            </div>


            <h3>
              {text(
                "No students found",
                "لم يتم العثور على طلاب"
              )}
            </h3>


            <p>
              {text(
                "Try another search term or change the filters.",
                "جرّب تغيير البحث أو عوامل التصفية."
              )}
            </p>


            <button
              type="button"
              onClick={
                clearFilters
              }
            >
              {text(
                "Clear Filters",
                "إلغاء الفلاتر"
              )}
            </button>

          </div>

        ) : (

          /* =================================================
             STUDENTS TABLE
          ================================================= */

          <div className="students-list-wrapper">

            <div className="students-list">

              <div className="students-list-head">

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
                    "Class",
                    "الصف"
                  )}
                </span>

                <span>
                  {text(
                    "Level",
                    "المستوى"
                  )}
                </span>

                <span>
                  {text(
                    "Actions",
                    "الإجراءات"
                  )}
                </span>

              </div>


              {filteredStudents.map(
                (student) => {

                  const inactive =
                    student.accountStatus ===
                    "inactive";


                  return (
                    <div
                      className={`student-list-row ${
                        inactive
                          ? "student-row-inactive"
                          : ""
                      }`}
                      key={
                        student.id
                      }
                    >

                      {/* STUDENT */}

                      <div className="student-list-name">

                        <div className="student-table-avatar">
                          🎓
                        </div>


                        <div className="student-name-content">

                          <strong>
                            {student.name}
                          </strong>


                          <small
                            className={
                              inactive
                                ? "student-account-badge inactive"
                                : "student-account-badge active"
                            }
                          >
                            <span />

                            {inactive
                              ? text(
                                  "Inactive",
                                  "غير فعّال"
                                )
                              : text(
                                  "Active",
                                  "فعّال"
                                )}
                          </small>

                        </div>

                      </div>


                      {/* USERNAME */}

                      <span className="student-username">
                        {student.username}
                      </span>


                      {/* CODE */}

                      <strong className="student-list-code">
                        {student.studentCode}
                      </strong>


                      {/* CLASS */}

                      <span className="student-class-value">

                        {student.classId
                          ? (
                              student.className ||
                              getClassName(
                                student.classId
                              )
                            )
                          : text(
                              "No Class",
                              "بدون صف"
                            )}

                      </span>


                      {/* LEVEL */}

                      <span className="student-level-value">
                        ⭐{" "}
                        {student.level ||
                          1}
                      </span>


                      {/* ACTIONS */}

                      <div className="student-row-actions">

                        <button
                          type="button"
                          className="view-student-progress-button"
                          onClick={() =>
                            navigate(
                              `/teacher/students/${student.id}/progress`
                            )
                          }
                        >
                          📊{" "}
                          {text(
                            "Progress",
                            "التقدم"
                          )}
                        </button>


                        <button
                          type="button"
                          className="view-student-portfolio-button"
                          onClick={() =>
                            navigate(
                              `/teacher/students/${student.id}/portfolio`
                            )
                          }
                        >
                          📁{" "}
                          {text(
                            "Portfolio",
                            "الأعمال"
                          )}
                        </button>


                        <button
                          type="button"
                          className="student-more-actions-button"
                          title={
                            text(
                              "More options",
                              "خيارات إضافية"
                            )
                          }
                          onClick={() =>
                            openStudentActions(
                              student
                            )
                          }
                        >
                          ⋯
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        )}

      </section>


      {/* =================================================
          MANAGE STUDENT MODAL
      ================================================= */}

      {selectedStudent && (

        <div
          className="student-add-overlay"
          onClick={
            closeStudentActions
          }
        >

          <div
            className="student-add-modal student-manage-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="student-add-header">

              <div className="student-manage-heading">

                <div className="student-add-icon">
                  👤
                </div>


                <div>

                  <small>
                    {text(
                      "STUDENT MANAGEMENT",
                      "إدارة الطالب"
                    )}
                  </small>


                  <h2>
                    {selectedStudent.name}
                  </h2>


                  <p>
                    {selectedStudent.studentCode}
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  studentActionLoading
                }
                onClick={
                  closeStudentActions
                }
              >
                ×
              </button>

            </div>


            <div className="student-manage-summary">

              <div>

                <small>
                  {text(
                    "Username",
                    "اسم المستخدم"
                  )}
                </small>

                <strong>
                  {selectedStudent.username}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Current Class",
                    "الصف الحالي"
                  )}
                </small>

                <strong>
                  {selectedStudent.classId
                    ? (
                        selectedStudent.className ||
                        getClassName(
                          selectedStudent.classId
                        )
                      )
                    : text(
                        "No Class",
                        "بدون صف"
                      )}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Level",
                    "المستوى"
                  )}
                </small>

                <strong>
                  ⭐{" "}
                  {selectedStudent.level ||
                    1}
                </strong>

              </div>

            </div>


            <div className="student-manage-actions">

              {selectedStudent.classId && (

                <button
                  type="button"
                  className="student-remove-class-button"
                  disabled={
                    studentActionLoading
                  }
                  onClick={
                    handleRemoveFromClass
                  }
                >

                  <span>
                    🚪
                  </span>


                  <div>

                    <strong>
                      {text(
                        "Remove from Class",
                        "إزالة من الصف"
                      )}
                    </strong>


                    <small>
                      {text(
                        "The account, progress and portfolio will remain saved.",
                        "سيبقى الحساب والتقدم والأعمال محفوظة."
                      )}
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

              )}


              <button
                type="button"
                className={
                  selectedStudent.accountStatus ===
                  "inactive"
                    ? "student-reactivate-button"
                    : "student-deactivate-button"
                }
                disabled={
                  studentActionLoading
                }
                onClick={
                  handleToggleAccount
                }
              >

                <span>
                  {selectedStudent.accountStatus ===
                  "inactive"
                    ? "✅"
                    : "⛔"}
                </span>


                <div>

                  <strong>
                    {selectedStudent.accountStatus ===
                    "inactive"
                      ? text(
                          "Reactivate Account",
                          "إعادة تفعيل الحساب"
                        )
                      : text(
                          "Deactivate Account",
                          "تعطيل الحساب"
                        )}
                  </strong>


                  <small>
                    {selectedStudent.accountStatus ===
                    "inactive"
                      ? text(
                          "Return this account to active status.",
                          "إعادة الحساب إلى الحالة الفعّالة."
                        )
                      : text(
                          "Keep all data while marking the account inactive.",
                          "الاحتفاظ بكل البيانات مع تعطيل الحساب."
                        )}
                  </small>

                </div>

                <b>
                  ›
                </b>

              </button>

            </div>


            {studentActionError && (

              <div className="student-add-error">
                ⚠️{" "}
                {studentActionError}
              </div>

            )}


            <div className="student-manage-footer">

              <button
                type="button"
                className="student-add-cancel"
                disabled={
                  studentActionLoading
                }
                onClick={
                  closeStudentActions
                }
              >
                {studentActionLoading
                  ? text(
                      "Please wait...",
                      "يرجى الانتظار..."
                    )
                  : text(
                      "Close",
                      "إغلاق"
                    )}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          ADD STUDENT MODAL
      ================================================= */}

      {showModal && (

        <div
          className="student-add-overlay"
          onClick={() =>
            !saving &&
            setShowModal(
              false
            )
          }
        >

          <div
            className="student-add-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="student-add-header">

              <div className="student-manage-heading">

                <div className="student-add-icon">
                  🎓
                </div>


                <div>

                  <small>
                    TECHMINDS
                  </small>


                  <h2>
                    {text(
                      "Add Student",
                      "إضافة طالب"
                    )}
                  </h2>


                  <p>
                    {text(
                      "Create a TechMinds account for your student.",
                      "أنشئ حساب TechMinds جديد للطالب."
                    )}
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <form
              className="student-add-form"
              onSubmit={
                handleAddStudent
              }
            >

              <label>

                {text(
                  "Class",
                  "الصف"
                )}

                <select
                  value={
                    selectedClassId
                  }
                  onChange={(event) =>
                    setSelectedClassId(
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    {text(
                      "Choose a class",
                      "اختر الصف"
                    )}
                  </option>


                  {classes.map(
                    (classItem) => (

                      <option
                        key={
                          classItem.id
                        }
                        value={
                          classItem.id
                        }
                      >
                        {classItem.name}
                        {" — "}
                        {classItem.classCode}
                      </option>

                    )
                  )}

                </select>

              </label>


              <label>

                {text(
                  "Student Name",
                  "اسم الطالب"
                )}

                <input
                  type="text"
                  value={
                    studentName
                  }
                  onChange={(event) =>
                    setStudentName(
                      event.target.value
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

              </label>


              <label>

                {text(
                  "Username",
                  "اسم المستخدم"
                )}

                <input
                  type="text"
                  value={
                    username
                  }
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  placeholder="adam23"
                  required
                />

              </label>


              <label>

                {text(
                  "Password",
                  "كلمة المرور"
                )}

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(event) =>
                    setPassword(
                      event.target.value
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

              </label>


              <div className="student-code-note">

                <span>
                  🔑
                </span>

                <p>
                  {text(
                    "TechMinds creates a unique student code automatically. The student can log in using either the username or student code.",
                    "سيقوم TechMinds بإنشاء رمز خاص للطالب تلقائيًا، ويمكن للطالب تسجيل الدخول باسم المستخدم أو رمز الطالب."
                  )}
                </p>

              </div>


              {error && (

                <div className="student-add-error">
                  ⚠️ {error}
                </div>

              )}


              <div className="student-add-buttons">

                <button
                  type="button"
                  className="student-add-cancel"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    setShowModal(
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
                  className="student-add-save"
                  disabled={
                    saving
                  }
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


export default TeacherStudents;