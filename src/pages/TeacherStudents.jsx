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
  isStudentAliasAvailable,
  resetStudentPassword,
} from "../firebase/studentLoginApi";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  isStrongPassword,
} from "../utils/passwordPolicy";

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
     RESET PASSWORD
  ===================================================== */

  const [
    resetPasswordTarget,
    setResetPasswordTarget,
  ] = useState(null);

  const [
    resetPasswordValue,
    setResetPasswordValue,
  ] = useState("");

  const [
    resetPasswordLoading,
    setResetPasswordLoading,
  ] = useState(false);

  const [
    resetPasswordError,
    setResetPasswordError,
  ] = useState("");

  const [
    resetPasswordSuccess,
    setResetPasswordSuccess,
  ] = useState(false);

  // In-memory only for the current session. Never persisted to Firestore,
  // and cleared automatically on page refresh.
  const [
    sessionTempPasswords,
    setSessionTempPasswords,
  ] = useState({});

  const [
    copiedPasswordId,
    setCopiedPasswordId,
  ] = useState("");


  /* =====================================================
     PRINT
  ===================================================== */

  const [
    printMode,
    setPrintMode,
  ] = useState(null);

  const [
    printClassId,
    setPrintClassId,
  ] = useState("all");


  /* =====================================================
     TRANSLATION
  ===================================================== */

  const hebrewLabels = {
    "Loading students...": "התלמידים נטענים...",
    "Back to Dashboard": "חזרה ללוח הבקרה",
    Students: "תלמידים",
    "Manage students, accounts, classes and learning progress.": "ניהול תלמידים, חשבונות, כיתות והתקדמות לימודית.",
    "Add Student": "הוספת תלמיד",
    "Total Students": "סך התלמידים",
    Classes: "כיתות",
    Active: "פעיל",
    Inactive: "לא פעיל",
    "No classes yet": "עדיין אין כיתות",
    "Create a class before adding students.": "יש ליצור כיתה לפני הוספת תלמידים.",
    "Create Class": "יצירת כיתה",
    "STUDENT MANAGEMENT": "ניהול תלמידים",
    "My Students": "התלמידים שלי",
    "Search, filter and manage the students connected to your account.": "חיפוש, סינון וניהול התלמידים המקושרים לחשבון שלך.",
    "Search name, username, student code...": "חיפוש לפי שם, שם משתמש או קוד תלמיד...",
    "All Classes": "כל הכיתות",
    "No Class": "ללא כיתה",
    "All Statuses": "כל המצבים",
    RESULTS: "תוצאות",
    "No students yet": "עדיין אין תלמידים",
    "Add your first student to one of your classes.": "הוסיפו את התלמיד הראשון לאחת הכיתות שלכם.",
    "Create a class first, then add your students.": "צרו כיתה תחילה ולאחר מכן הוסיפו את התלמידים.",
    "Add First Student": "הוספת תלמיד ראשון",
    "No students found": "לא נמצאו תלמידים",
    "Try another search term or change the filters.": "נסו מונח חיפוש אחר או שנו את המסננים.",
    "Clear Filters": "ניקוי מסננים",
    Student: "תלמיד",
    Username: "שם משתמש",
    "Student Code": "קוד תלמיד",
    Class: "כיתה",
    Level: "רמה",
    Actions: "פעולות",
    Progress: "התקדמות",
    Portfolio: "תיק עבודות",
    "Please complete all fields.": "יש למלא את כל השדות.",
    "Use at least 8 characters with uppercase, lowercase, a number, and a special symbol.": "יש להשתמש ב-8 תווים לפחות, כולל אות גדולה, אות קטנה, מספר וסימן מיוחד.",
    "This username is already in use.": "שם המשתמש הזה כבר נמצא בשימוש.",
    "Could not create the student.": "לא ניתן ליצור את התלמיד.",

    // Reset password
    "Reset Password": "איפוס סיסמה",
    "Generate Temporary Password": "יצירת סיסמה זמנית",
    "Copy Password": "העתקת סיסמה",
    Copy: "העתקה",
    Copied: "הועתק",
    "Temporary Password": "סיסמה זמנית",
    "New Temporary Password": "סיסמה זמנית חדשה",
    "Password changed successfully.": "הסיסמה שונתה בהצלחה.",
    "This password is shown only once during this session and will not be available after refreshing the page.":
      "סיסמה זו מוצגת רק פעם אחת במהלך הפעלה זו ולא תהיה זמינה לאחר רענון הדף.",
    "You are not authorized to manage this student.": "אין לך הרשאה לנהל תלמיד זה.",
    "Please enter a valid password (at least 8 characters).": "יש להזין סיסמה תקינה (לפחות 8 תווים).",
    "Could not reset the password. Please try again.": "לא ניתן היה לאפס את הסיסמה. נסה שוב.",
    "Resetting...": "מאפס...",
    Done: "סיום",
    Cancel: "ביטול",

    // Print
    "Print Students List": "הדפסת רשימת תלמידים",
    "Print Login Details": "הדפסת פרטי כניסה",
    "All Students": "כל התלמידים",
    "Select Class": "בחירת כיתה",
    "Contact teacher": "יש לפנות למורה",
    Grade: "כיתה/שכבה",
    "Login Details": "פרטי כניסה",
  };

  const text = (
    english,
    arabic,
    hebrew = hebrewLabels[english] || english
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
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


        const available =
          await isStudentAliasAvailable(
            "code",
            normalized
          );


        if (available) {
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


      if (!isStrongPassword(password)) {
        setError(
          text(
            "Use at least 8 characters with uppercase, lowercase, a number, and a special symbol.",
            "استخدم 8 أحرف على الأقل، تشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا."
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


        const usernameAvailable =
          await isStudentAliasAvailable(
            "username",
            normalizedUsername
          );


        if (!usernameAvailable) {
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

            studentAccountType:
              "class",

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
              "code",

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
     RESET PASSWORD
  ===================================================== */

  const generateTemporaryPassword =
    () => {
      const letters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

      const lowers =
        "abcdefghjkmnpqrstuvwxyz";

      const digits =
        "23456789";

      const pick =
        (chars) =>
          chars[
            Math.floor(
              Math.random() *
                chars.length
            )
          ];

      let digitsPart =
        "";

      for (
        let index = 0;
        index < 6;
        index++
      ) {
        digitsPart +=
          pick(digits);
      }

      return `${pick(letters)}${pick(lowers)}-${digitsPart}`;
    };


  const openResetPassword =
    (student) => {
      setSelectedStudent(
        null
      );

      setResetPasswordTarget(
        student
      );

      setResetPasswordValue("");
      setResetPasswordError("");
      setResetPasswordSuccess(
        false
      );
    };


  const closeResetPassword =
    () => {
      if (
        resetPasswordLoading
      ) {
        return;
      }

      setResetPasswordTarget(
        null
      );

      setResetPasswordValue("");
      setResetPasswordError("");
      setResetPasswordSuccess(
        false
      );
    };


  const handleResetPassword =
    async () => {
      if (
        !resetPasswordTarget
      ) {
        return;
      }

      const newPassword =
        resetPasswordValue.trim();

      if (
        !isStrongPassword(
          newPassword
        )
      ) {
        setResetPasswordError(
          text(
            "Use at least 8 characters with uppercase, lowercase, a number, and a special symbol.",
            "استخدم 8 أحرف على الأقل، تشمل حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا."
          )
        );

        return;
      }

      try {
        setResetPasswordLoading(
          true
        );

        setResetPasswordError("");

        await resetStudentPassword(
          {
            studentUid:
              resetPasswordTarget.id,

            newPassword,
          }
        );

        setSessionTempPasswords(
          (previous) => ({
            ...previous,

            [resetPasswordTarget.id]:
              newPassword,
          })
        );

        setResetPasswordSuccess(
          true
        );

      } catch (resetError) {
        // Never log the password value, only the error code/message.
        console.error(
          "Reset password error:",
          resetError.code ||
          resetError.message
        );

        if (
          resetError.code ===
          "functions/permission-denied"
        ) {
          setResetPasswordError(
            text(
              "You are not authorized to manage this student.",
              "لا تملك صلاحية إدارة هذا الطالب."
            )
          );
        } else if (
          resetError.code ===
          "functions/invalid-argument"
        ) {
          setResetPasswordError(
            text(
              "Please enter a valid password (at least 8 characters).",
              "يرجى إدخال كلمة مرور صالحة (8 أحرف على الأقل)."
            )
          );
        } else if (
          resetError.code ===
          "functions/not-found"
        ) {
          setResetPasswordError(
            text(
              "Student was not found.",
              "لم يتم العثور على الطالب."
            )
          );
        } else {
          setResetPasswordError(
            text(
              "Could not reset the password. Please try again.",
              "تعذر إعادة تعيين كلمة المرور. حاول مرة أخرى."
            )
          );
        }

      } finally {
        setResetPasswordLoading(
          false
        );
      }
    };


  const handleCopyPassword =
    async (
      studentId,
      value
    ) => {
      if (!value) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          value
        );

        setCopiedPasswordId(
          studentId
        );

        setTimeout(
          () =>
            setCopiedPasswordId(
              ""
            ),
          2000
        );

      } catch (copyError) {
        console.error(
          "Copy password error:",
          copyError
        );
      }
    };


  /* =====================================================
     PRINT
  ===================================================== */

  const printList =
    useMemo(
      () => {
        const base =
          printClassId ===
          "all"
            ? students
            : students.filter(
                (student) =>
                  student.classId ===
                  printClassId
              );

        return [...base].sort(
          (a, b) =>
            String(
              a.name || ""
            ).localeCompare(
              String(
                b.name || ""
              )
            )
        );
      },

      [
        students,
        printClassId,
      ]
    );


  useEffect(
    () => {
      if (!printMode) {
        return undefined;
      }

      const timer =
        setTimeout(
          () =>
            window.print(),
          80
        );

      const handleAfterPrint =
        () =>
          setPrintMode(
            null
          );

      window.addEventListener(
        "afterprint",
        handleAfterPrint
      );

      return () => {
        clearTimeout(
          timer
        );

        window.removeEventListener(
          "afterprint",
          handleAfterPrint
        );
      };
    },

    [printMode]
  );


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
              : language === "he"
                ? "→ חזרה ללוח הבקרה"
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


            <button
              type="button"
              className={
                language ===
                "he"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "he"
                )
              }
            >
              עברית
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


            {/* PRINT */}

            <div className="students-print-toolbar">

              <select
                value={
                  printClassId
                }
                onChange={(event) =>
                  setPrintClassId(
                    event.target.value
                  )
                }
              >

                <option value="all">
                  {text(
                    "All Students",
                    "كل الطلاب"
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


              <button
                type="button"
                className="students-print-button"
                onClick={() =>
                  setPrintMode(
                    "students"
                  )
                }
              >
                🖨{" "}
                {text(
                  "Print Students List",
                  "طباعة قائمة الطلاب",
                  "הדפסת רשימת תלמידים"
                )}
              </button>


              <button
                type="button"
                className="students-print-button"
                onClick={() =>
                  setPrintMode(
                    "logins"
                  )
                }
              >
                🖨{" "}
                {text(
                  "Print Login Details",
                  "طباعة بيانات الدخول",
                  "הדפסת פרטי כניסה"
                )}
              </button>

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

              <button
                type="button"
                className="student-reset-password-button"
                disabled={
                  studentActionLoading
                }
                onClick={() =>
                  openResetPassword(
                    selectedStudent
                  )
                }
              >

                <span>
                  🔑
                </span>


                <div>

                  <strong>
                    {text(
                      "Reset Password",
                      "إعادة تعيين كلمة المرور"
                    )}
                  </strong>


                  <small>
                    {text(
                      "Set a new temporary password for this student.",
                      "تعيين كلمة مرور مؤقتة جديدة لهذا الطالب.",
                      "הגדרת סיסמה זמנית חדשה לתלמיד זה."
                    )}
                  </small>

                </div>

                <b>
                  ›
                </b>

              </button>


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
          RESET PASSWORD MODAL
      ================================================= */}

      {resetPasswordTarget && (

        <div
          className="student-add-overlay"
          onClick={() =>
            !resetPasswordLoading &&
            closeResetPassword()
          }
        >

          <div
            className="student-add-modal student-reset-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="student-add-header">

              <div className="student-manage-heading">

                <div className="student-add-icon">
                  🔑
                </div>


                <div>

                  <small>
                    {text(
                      "STUDENT MANAGEMENT",
                      "إدارة الطالب"
                    )}
                  </small>


                  <h2>
                    {text(
                      "Reset Password",
                      "إعادة تعيين كلمة المرور"
                    )}
                  </h2>


                  <p>
                    {resetPasswordTarget.name}
                  </p>

                </div>

              </div>


              <button
                type="button"
                disabled={
                  resetPasswordLoading
                }
                onClick={
                  closeResetPassword
                }
              >
                ×
              </button>

            </div>


            {!resetPasswordSuccess ? (

              <div className="student-add-form">

                <label>

                  {text(
                    "New Temporary Password",
                    "كلمة مرور مؤقتة جديدة"
                  )}

                  <input
                    type="text"
                    autoComplete="new-password"
                    value={
                      resetPasswordValue
                    }
                    onChange={(event) =>
                      setResetPasswordValue(
                        event.target.value
                      )
                    }
                    placeholder="Tm-483726"
                  />

                </label>


                <button
                  type="button"
                  className="student-generate-password-button"
                  disabled={
                    resetPasswordLoading
                  }
                  onClick={() =>
                    setResetPasswordValue(
                      generateTemporaryPassword()
                    )
                  }
                >
                  🎲{" "}
                  {text(
                    "Generate Temporary Password",
                    "إنشاء كلمة مرور مؤقتة"
                  )}
                </button>


                {resetPasswordError && (

                  <div className="student-add-error">
                    ⚠️{" "}
                    {resetPasswordError}
                  </div>

                )}


                <div className="student-add-buttons">

                  <button
                    type="button"
                    className="student-add-cancel"
                    disabled={
                      resetPasswordLoading
                    }
                    onClick={
                      closeResetPassword
                    }
                  >
                    {text(
                      "Cancel",
                      "إلغاء"
                    )}
                  </button>


                  <button
                    type="button"
                    className="student-add-save"
                    disabled={
                      resetPasswordLoading ||
                      resetPasswordValue.trim()
                        .length < 8
                    }
                    onClick={
                      handleResetPassword
                    }
                  >
                    {resetPasswordLoading
                      ? text(
                          "Resetting...",
                          "جارٍ إعادة التعيين..."
                        )
                      : text(
                          "Reset Password",
                          "إعادة تعيين كلمة المرور"
                        )}
                  </button>

                </div>

              </div>

            ) : (

              <div className="student-add-form">

                <div className="student-reset-success">
                  ✅{" "}
                  {text(
                    "Password changed successfully.",
                    "تم تغيير كلمة المرور بنجاح.",
                    "הסיסמה שונתה בהצלחה."
                  )}
                </div>


                <label>

                  {text(
                    "Temporary Password",
                    "كلمة المرور المؤقتة"
                  )}

                  <div className="student-password-display">

                    <code>
                      {
                        sessionTempPasswords[
                          resetPasswordTarget.id
                        ]
                      }
                    </code>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyPassword(
                          resetPasswordTarget.id,
                          sessionTempPasswords[
                            resetPasswordTarget.id
                          ]
                        )
                      }
                    >
                      {copiedPasswordId ===
                      resetPasswordTarget.id
                        ? text(
                            "Copied",
                            "تم النسخ"
                          )
                        : text(
                            "Copy",
                            "نسخ"
                          )}
                    </button>

                  </div>

                </label>


                <div className="student-code-note">

                  <span>
                    ⚠️
                  </span>

                  <p>
                    {text(
                      "This password is shown only once during this session and will not be available after refreshing the page.",
                      "تُعرض كلمة المرور هذه مرة واحدة فقط خلال هذه الجلسة ولن تكون متاحة بعد تحديث الصفحة."
                    )}
                  </p>

                </div>


                <div className="student-add-buttons">

                  <button
                    type="button"
                    className="student-add-save"
                    onClick={
                      closeResetPassword
                    }
                  >
                    {text(
                      "Done",
                      "تم"
                    )}
                  </button>

                </div>

              </div>

            )}

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
                    TEACHLEARN
                  </small>


                  <h2>
                    {text(
                      "Add Student",
                      "إضافة طالب"
                    )}
                  </h2>


                  <p>
                    {text(
                      "Create a TeachLearn account for your student.",
                      "أنشئ حساب TeachLearn جديد للطالب."
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
                      "8+ characters: Aa, 1, !",
                      "8+ أحرف: Aa، 1، !",
                      "8+ תווים: Aa, 1, !"
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
                    "TeachLearn creates a unique student code automatically. The student can log in using either the username or student code.",
                    "سيقوم TeachLearn بإنشاء رمز خاص للطالب تلقائيًا، ويمكن للطالب تسجيل الدخول باسم المستخدم أو رمز الطالب."
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


      {/* =================================================
          PRINT SHEET (only rendered while printing)
      ================================================= */}

      {printMode && (

        <div
          className="print-sheet"
          dir={
            language === "ar" ||
            language === "he"
              ? "rtl"
              : "ltr"
          }
        >

          <div className="print-sheet-header">

            <h1>TeachLearn</h1>

            {printClassId !==
              "all" && (
              <p>
                {getClassName(
                  printClassId
                )}
              </p>
            )}

            {teacher?.name && (
              <p>
                {teacher.name}
              </p>
            )}

            <p>
              {new Date().toLocaleDateString(
                language === "ar"
                  ? "ar-EG"
                  : language === "he"
                    ? "he-IL"
                    : "en-GB"
              )}
            </p>

            <h2>
              {printMode ===
              "students"
                ? text(
                    "Students List",
                    "قائمة الطلاب",
                    "רשימת תלמידים"
                  )
                : text(
                    "Login Details",
                    "بيانات الدخول",
                    "פרטי כניסה"
                  )}
            </h2>

          </div>


          <table className="print-sheet-table">

            <thead>

              <tr>

                <th>
                  {text(
                    "Student",
                    "الطالب"
                  )}
                </th>

                <th>
                  {text(
                    "Username",
                    "اسم المستخدم"
                  )}
                </th>

                <th>
                  {text(
                    "Student Code",
                    "رمز الطالب"
                  )}
                </th>

                {printMode ===
                  "students" && (

                  <>
                    <th>
                      {text(
                        "Class",
                        "الصف"
                      )}
                    </th>

                    <th>
                      {text(
                        "Grade",
                        "الصف الدراسي"
                      )}
                    </th>
                  </>

                )}

                {printMode ===
                  "logins" && (

                  <th>
                    {text(
                      "Temporary Password",
                      "كلمة المرور المؤقتة"
                    )}
                  </th>

                )}

              </tr>

            </thead>


            <tbody>

              {printList.map(
                (student) => (

                  <tr
                    key={
                      student.id
                    }
                  >

                    <td>
                      {student.name}
                    </td>

                    <td>
                      {student.username}
                    </td>

                    <td>
                      {student.studentCode}
                    </td>

                    {printMode ===
                      "students" && (

                      <>
                        <td>
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
                        </td>

                        <td>
                          {student.grade ||
                            "—"}
                        </td>
                      </>

                    )}

                    {printMode ===
                      "logins" && (

                      <td>
                        {sessionTempPasswords[
                          student.id
                        ] ||
                          text(
                            "Contact teacher",
                            "تواصل مع المعلم",
                            "יש לפנות למורה"
                          )}
                      </td>

                    )}

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}


export default TeacherStudents;
