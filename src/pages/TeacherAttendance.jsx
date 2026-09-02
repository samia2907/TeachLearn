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
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./TeacherAttendance.css";


function TeacherAttendance() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  /* =========================================
     TODAY
  ========================================= */

  const getTodayDate =
    () => {
      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const day =
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        );

      return `${year}-${month}-${day}`;
    };


  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate =
    (value) => {
      if (!value) {
        return "";
      }


      const [
        year,
        month,
        day,
      ] =
        value.split("-");


      if (
        !year ||
        !month ||
        !day
      ) {
        return value;
      }


      return `${day}/${month}/${year}`;
    };


  /* =========================================
     STATE
  ========================================= */

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "record"
  );

  const [
    classes,
    setClasses,
  ] = useState([]);

  const [
    students,
    setStudents,
  ] = useState([]);

  const [
    selectedClassId,
    setSelectedClassId,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getTodayDate()
  );

  const [
    attendance,
    setAttendance,
  ] = useState({});

  const [
    historyRecords,
    setHistoryRecords,
  ] = useState([]);

  const [
    selectedHistoryRecord,
    setSelectedHistoryRecord,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(false);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);

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


  /* =========================================
     OPTIONS
  ========================================= */

  const attendanceOptions = [
    {
      value:
        "present",

      icon:
        "✅",

      en:
        "Present",

      ar:
        "حاضر",
    },

    {
      value:
        "absent",

      icon:
        "❌",

      en:
        "Absent",

      ar:
        "غائب",
    },

    {
      value:
        "late",

      icon:
        "⏰",

      en:
        "Late",

      ar:
        "متأخر",
    },

    {
      value:
        "excused",

      icon:
        "🟡",

      en:
        "Excused",

      ar:
        "بعذر",
    },
  ];


  /* =========================================
     STATUS HELPER
  ========================================= */

  const getStatusInfo =
    (status) =>
      attendanceOptions.find(
        (
          option
        ) =>
          option.value ===
          status
      ) ||
      attendanceOptions[0];


  /* =========================================
     LOAD CLASSES
  ========================================= */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      navigate(
        "/login"
      );

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
          currentUser.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        classesQuery,

        (
          snapshot
        ) => {
          const list =
            snapshot.docs.map(
              (
                classDocument
              ) => ({
                id:
                  classDocument.id,

                ...classDocument.data(),
              })
            );


          setClasses(
            list
          );


          if (
            list.length === 1
          ) {
            setSelectedClassId(
              list[0].id
            );
          }


          setLoading(
            false
          );
        },

        (
          classesError
        ) => {
          console.error(
            "Attendance classes error:",
            classesError
          );


          setError(
            text(
              "Could not load classes.",
              "تعذر تحميل الصفوف."
            )
          );


          setLoading(
            false
          );
        }
      );


    return () =>
      unsubscribe();

  }, [
    navigate,
  ]);


  /* =========================================
     LOAD STUDENTS
  ========================================= */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
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
          currentUser.uid
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

        (
          snapshot
        ) => {
          const list =
            snapshot.docs.map(
              (
                studentDocument
              ) => ({
                id:
                  studentDocument.id,

                ...studentDocument.data(),
              })
            );


          setStudents(
            list
          );
        },

        (
          studentsError
        ) => {
          console.error(
            "Attendance students error:",
            studentsError
          );


          setError(
            text(
              "Could not load students.",
              "تعذر تحميل الطلاب."
            )
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =========================================
     LOAD ALL ATTENDANCE HISTORY
  ========================================= */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      return undefined;
    }


    const historyQuery =
      query(
        collection(
          db,
          "attendance"
        ),

        where(
          "teacherId",
          "==",
          currentUser.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        historyQuery,

        (
          snapshot
        ) => {
          const list =
            snapshot.docs.map(
              (
                attendanceDocument
              ) => ({
                id:
                  attendanceDocument.id,

                ...attendanceDocument.data(),
              })
            );


          list.sort(
            (
              a,
              b
            ) =>
              String(
                b.date ||
                ""
              ).localeCompare(
                String(
                  a.date ||
                  ""
                )
              )
          );


          setHistoryRecords(
            list
          );


          setLoadingHistory(
            false
          );
        },

        (
          historyError
        ) => {
          console.error(
            "Attendance history:",
            historyError
          );


          setError(
            text(
              "Could not load attendance history.",
              "تعذر تحميل سجل الحضور."
            )
          );


          setLoadingHistory(
            false
          );
        }
      );


    return () =>
      unsubscribe();

  }, []);


  /* =========================================
     CLASS STUDENTS
  ========================================= */

  const classStudents =
    useMemo(
      () =>
        students.filter(
          (
            student
          ) =>
            student.classId ===
            selectedClassId
        ),

      [
        students,
        selectedClassId,
      ]
    );


  /* =========================================
     SELECTED CLASS
  ========================================= */

  const selectedClass =
    useMemo(
      () =>
        classes.find(
          (
            classItem
          ) =>
            classItem.id ===
            selectedClassId
        ),

      [
        classes,
        selectedClassId,
      ]
    );


  /* =========================================
     CLASS HISTORY
  ========================================= */

  const classHistory =
    useMemo(
      () =>
        historyRecords.filter(
          (
            record
          ) =>
            record.classId ===
            selectedClassId
        ),

      [
        historyRecords,
        selectedClassId,
      ]
    );


  /* =========================================
     CLEAR DETAIL WHEN CLASS CHANGES
  ========================================= */

  useEffect(() => {
    setSelectedHistoryRecord(
      null
    );
  }, [
    selectedClassId,
  ]);


  /* =========================================
     LOAD CURRENT ATTENDANCE
  ========================================= */

  useEffect(() => {
    const loadAttendance =
      async () => {
        if (
          !selectedClassId ||
          !selectedDate
        ) {
          setAttendance(
            {}
          );

          return;
        }


        try {
          setLoadingAttendance(
            true
          );

          setError("");
          setSuccess("");


          const attendanceId =
            `${selectedClassId}_${selectedDate}`;


          const attendanceSnapshot =
            await getDoc(
              doc(
                db,
                "attendance",
                attendanceId
              )
            );


          if (
            attendanceSnapshot.exists()
          ) {
            const data =
              attendanceSnapshot.data();


            setAttendance(
              data.students ||
              {}
            );

          } else {

            const initialAttendance =
              {};


            classStudents.forEach(
              (
                student
              ) => {
                initialAttendance[
                  student.id
                ] = {
                  studentId:
                    student.id,

                  name:
                    student.name ||
                    "",

                  studentCode:
                    student.studentCode ||
                    "",

                  status:
                    "present",
                };
              }
            );


            setAttendance(
              initialAttendance
            );
          }

        } catch (
          attendanceError
        ) {
          console.error(
            "Load attendance:",
            attendanceError
          );


          setError(
            text(
              "Could not load attendance.",
              "تعذر تحميل الحضور."
            )
          );

        } finally {
          setLoadingAttendance(
            false
          );
        }
      };


    loadAttendance();

  }, [
    selectedClassId,
    selectedDate,
    classStudents.length,
  ]);


  /* =========================================
     CHANGE STATUS
  ========================================= */

  const changeStatus =
    (
      student,
      status
    ) => {

      setAttendance(
        (
          previous
        ) => ({
          ...previous,

          [student.id]: {
            studentId:
              student.id,

            name:
              student.name ||
              "",

            studentCode:
              student.studentCode ||
              "",

            status,
          },
        })
      );


      setSuccess("");
    };


  /* =========================================
     MARK ALL PRESENT
  ========================================= */

  const markAllPresent =
    () => {

      const newAttendance =
        {};


      classStudents.forEach(
        (
          student
        ) => {

          newAttendance[
            student.id
          ] = {
            studentId:
              student.id,

            name:
              student.name ||
              "",

            studentCode:
              student.studentCode ||
              "",

            status:
              "present",
          };
        }
      );


      setAttendance(
        newAttendance
      );

      setSuccess("");
    };


  /* =========================================
     SAVE ATTENDANCE
  ========================================= */

  const saveAttendance =
    async () => {
      try {
        setError("");
        setSuccess("");


        if (
          !selectedClassId
        ) {
          setError(
            text(
              "Please select a class.",
              "اختاري الصف أولًا."
            )
          );

          return;
        }


        if (!selectedDate) {
          setError(
            text(
              "Please select a date.",
              "اختاري التاريخ."
            )
          );

          return;
        }


        const currentUser =
          auth.currentUser;


        if (!currentUser) {
          navigate(
            "/login"
          );

          return;
        }


        if (!selectedClass) {
          setError(
            text(
              "Class not found.",
              "لم يتم العثور على الصف."
            )
          );

          return;
        }


        setSaving(
          true
        );


        const attendanceId =
          `${selectedClassId}_${selectedDate}`;


        const attendanceRef =
          doc(
            db,
            "attendance",
            attendanceId
          );


        const existingSnapshot =
          await getDoc(
            attendanceRef
          );


        const studentsData =
          {};


        classStudents.forEach(
          (
            student
          ) => {

            studentsData[
              student.id
            ] = {
              studentId:
                student.id,

              name:
                student.name ||
                "",

              studentCode:
                student.studentCode ||
                "",

              status:
                attendance[
                  student.id
                ]?.status ||
                "present",
            };
          }
        );


        const dataToSave = {
          attendanceId,

          teacherId:
            currentUser.uid,

          classId:
            selectedClass.id,

          className:
            selectedClass.name ||
            "",

          classCode:
            selectedClass.classCode ||
            "",

          date:
            selectedDate,

          students:
            studentsData,

          studentCount:
            classStudents.length,

          updatedAt:
            serverTimestamp(),
        };


        /*
          Keep the original createdAt
          when editing an old record.
        */

        if (
          !existingSnapshot.exists()
        ) {
          dataToSave.createdAt =
            serverTimestamp();
        }


        await setDoc(
          attendanceRef,

          dataToSave,

          {
            merge:
              true,
          }
        );


        setSuccess(
          text(
            "Attendance saved successfully.",
            "تم حفظ الحضور بنجاح ✅"
          )
        );

      } catch (
        saveError
      ) {
        console.error(
          "Save attendance:",
          saveError
        );


        if (
          saveError.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow saving attendance.",
              "صلاحيات Firestore لا تسمح بحفظ الحضور."
            )
          );

        } else {
          setError(
            text(
              "Could not save attendance.",
              "تعذر حفظ الحضور."
            )
          );
        }

      } finally {
        setSaving(
          false
        );
      }
    };


  /* =========================================
     CURRENT COUNTS
  ========================================= */

  const countStatus =
    (
      status
    ) =>
      classStudents.filter(
        (
          student
        ) =>
          (
            attendance[
              student.id
            ]?.status ||
            "present"
          ) ===
          status
      ).length;


  const presentCount =
    countStatus(
      "present"
    );

  const absentCount =
    countStatus(
      "absent"
    );

  const lateCount =
    countStatus(
      "late"
    );

  const excusedCount =
    countStatus(
      "excused"
    );


  /* =========================================
     HISTORY COUNT HELPER
  ========================================= */

  const getHistoryCount =
    (
      record,
      status
    ) => {

      const recordStudents =
        Object.values(
          record.students ||
          {}
        );


      return recordStudents.filter(
        (
          student
        ) =>
          student.status ===
          status
      ).length;
    };


  /* =========================================
     HISTORY TOTALS
  ========================================= */

  const historyTotals =
    useMemo(
      () => {

        let present = 0;
        let absent = 0;
        let late = 0;
        let excused = 0;


        classHistory.forEach(
          (
            record
          ) => {

            present +=
              getHistoryCount(
                record,
                "present"
              );

            absent +=
              getHistoryCount(
                record,
                "absent"
              );

            late +=
              getHistoryCount(
                record,
                "late"
              );

            excused +=
              getHistoryCount(
                record,
                "excused"
              );
          }
        );


        return {
          present,
          absent,
          late,
          excused,
        };
      },

      [
        classHistory,
      ]
    );


  /* =========================================
     OPEN HISTORY RECORD
  ========================================= */

  const openHistoryRecord =
    (
      record
    ) => {

      setSelectedHistoryRecord(
        record
      );
    };


  /* =========================================
     EDIT HISTORY RECORD
  ========================================= */

  const editHistoryRecord =
    (
      record
    ) => {

      setSelectedDate(
        record.date
      );

      setSelectedHistoryRecord(
        null
      );

      setActiveTab(
        "record"
      );

      setSuccess("");
      setError("");
    };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="attendance-loading">
        📅
      </div>
    );
  }


  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="teacher-attendance-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="attendance-header">

        <div>

          <button
            type="button"
            className="attendance-back"
            onClick={() =>
              navigate(
                "/teacher"
              )
            }
          >

            {language ===
            "ar"
              ? "↩ لوحة التحكم"
              : "← Dashboard"}

          </button>


          <h1>

            📅{" "}

            {text(
              "Attendance",
              "الحضور"
            )}

          </h1>


          <p>

            {text(
              "Record attendance and review previous attendance sessions.",
              "سجّل حضور الطلاب وراجع سجل الحضور السابق."
            )}

          </p>

        </div>


        <div className="attendance-language">

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

      </header>


      {/* =====================================
          TABS
      ===================================== */}

      <div className="attendance-tabs">

        <button
          type="button"
          className={
            activeTab ===
            "record"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab(
              "record"
            );

            setSelectedHistoryRecord(
              null
            );

            setError("");
            setSuccess("");
          }}
        >

          📝{" "}

          {text(
            "Record Attendance",
            "تسجيل الحضور"
          )}

        </button>


        <button
          type="button"
          className={
            activeTab ===
            "history"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab(
              "history"
            );

            setSelectedHistoryRecord(
              null
            );

            setError("");
            setSuccess("");
          }}
        >

          📊{" "}

          {text(
            "Attendance History",
            "سجل الحضور"
          )}

        </button>

      </div>


      {/* =====================================
          CONTROLS
      ===================================== */}

      <section
        className={
          activeTab ===
          "record"
            ? "attendance-controls"
            : "attendance-controls attendance-history-controls"
        }
      >

        <label>

          <span>

            🏫{" "}

            {text(
              "Class",
              "الصف"
            )}

          </span>


          <select
            value={
              selectedClassId
            }
            onChange={(
              event
            ) =>
              setSelectedClassId(
                event.target.value
              )
            }
          >

            <option value="">

              {text(
                "Select class",
                "اختاري الصف"
              )}

            </option>


            {classes.map(
              (
                classItem
              ) => (

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

        </label>


        {activeTab ===
          "record" && (

          <>

            <label>

              <span>

                📆{" "}

                {text(
                  "Date",
                  "التاريخ"
                )}

              </span>


              <input
                type="date"
                value={
                  selectedDate
                }
                onChange={(
                  event
                ) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />

            </label>


            <button
              type="button"
              className="mark-all-present-button"
              onClick={
                markAllPresent
              }
              disabled={
                classStudents.length ===
                0
              }
            >

              ✅{" "}

              {text(
                "Mark All Present",
                "تحديد الجميع حاضر"
              )}

            </button>

          </>

        )}

      </section>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (
        <div className="attendance-error">
          ⚠️ {error}
        </div>
      )}


      {success && (
        <div className="attendance-success">
          ✅ {success}
        </div>
      )}


      {/* =====================================
          RECORD TAB
      ===================================== */}

      {activeTab ===
        "record" && (

        <>

          {!selectedClassId ? (

            <section className="attendance-empty">

              <div>
                🏫
              </div>


              <h2>

                {text(
                  "Select a class",
                  "اختاري الصف"
                )}

              </h2>


              <p>

                {text(
                  "Choose a class to start recording attendance.",
                  "اختاري صفًا لبدء تسجيل الحضور."
                )}

              </p>

            </section>

          ) : loadingAttendance ? (

            <section className="attendance-empty">

              <div>
                ⏳
              </div>


              <h2>

                {text(
                  "Loading attendance...",
                  "جارٍ تحميل الحضور..."
                )}

              </h2>

            </section>

          ) : (

            <>

              {/* SUMMARY */}

              <section className="attendance-summary">

                <div className="attendance-summary-card total">

                  <span>
                    👥
                  </span>


                  <div>

                    <small>

                      {text(
                        "Students",
                        "الطلاب"
                      )}

                    </small>


                    <strong>

                      {classStudents.length}

                    </strong>

                  </div>

                </div>


                <div className="attendance-summary-card present">

                  <span>
                    ✅
                  </span>


                  <div>

                    <small>

                      {text(
                        "Present",
                        "حاضر"
                      )}

                    </small>


                    <strong>
                      {presentCount}
                    </strong>

                  </div>

                </div>


                <div className="attendance-summary-card absent">

                  <span>
                    ❌
                  </span>


                  <div>

                    <small>

                      {text(
                        "Absent",
                        "غائب"
                      )}

                    </small>


                    <strong>
                      {absentCount}
                    </strong>

                  </div>

                </div>


                <div className="attendance-summary-card late">

                  <span>
                    ⏰
                  </span>


                  <div>

                    <small>

                      {text(
                        "Late",
                        "متأخر"
                      )}

                    </small>


                    <strong>
                      {lateCount}
                    </strong>

                  </div>

                </div>


                <div className="attendance-summary-card excused">

                  <span>
                    🟡
                  </span>


                  <div>

                    <small>

                      {text(
                        "Excused",
                        "بعذر"
                      )}

                    </small>


                    <strong>
                      {excusedCount}
                    </strong>

                  </div>

                </div>

              </section>


              {/* STUDENT LIST */}

              <section className="attendance-panel">

                <div className="attendance-panel-header">

                  <div>

                    <small>

                      {text(
                        "CLASS ATTENDANCE",
                        "حضور الصف"
                      )}

                    </small>


                    <h2>

                      {selectedClass
                        ?.name ||
                        "-"}

                    </h2>


                    <p>

                      📆{" "}

                      {formatDate(
                        selectedDate
                      )}

                    </p>

                  </div>


                  <span className="attendance-class-code">

                    {selectedClass
                      ?.classCode ||
                      ""}

                  </span>

                </div>


                {classStudents.length ===
                0 ? (

                  <div className="attendance-no-students">

                    🎓{" "}

                    {text(
                      "There are no students in this class.",
                      "لا يوجد طلاب في هذا الصف."
                    )}

                  </div>

                ) : (

                  <div className="attendance-students-list">

                    {classStudents.map(
                      (
                        student,
                        index
                      ) => {

                        const currentStatus =
                          attendance[
                            student.id
                          ]?.status ||
                          "present";


                        return (
                          <div
                            className="attendance-student-row"
                            key={
                              student.id
                            }
                          >

                            <div className="attendance-student-number">

                              {index +
                                1}

                            </div>


                            <div className="attendance-student-avatar">
                              🎓
                            </div>


                            <div className="attendance-student-info">

                              <strong>

                                {student.name}

                              </strong>


                              <span>

                                {student.username ||
                                  ""}

                                {student.studentCode
                                  ? ` • ${student.studentCode}`
                                  : ""}

                              </span>

                            </div>


                            <div className="attendance-status-buttons">

                              {attendanceOptions.map(
                                (
                                  option
                                ) => (

                                  <button
                                    type="button"
                                    key={
                                      option.value
                                    }
                                    className={
                                      currentStatus ===
                                      option.value
                                        ? `attendance-status-button ${option.value} active`
                                        : `attendance-status-button ${option.value}`
                                    }
                                    onClick={() =>
                                      changeStatus(
                                        student,
                                        option.value
                                      )
                                    }
                                  >

                                    <span>

                                      {option.icon}

                                    </span>


                                    {text(
                                      option.en,
                                      option.ar
                                    )}

                                  </button>

                                )
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}


                {classStudents.length >
                  0 && (

                  <div className="attendance-save-area">

                    <button
                      type="button"
                      className="attendance-save-button"
                      onClick={
                        saveAttendance
                      }
                      disabled={
                        saving
                      }
                    >

                      {saving
                        ? text(
                            "Saving...",
                            "جارٍ الحفظ..."
                          )
                        : text(
                            "Save Attendance ✓",
                            "حفظ الحضور ✓"
                          )}

                    </button>

                  </div>

                )}

              </section>

            </>
          )}

        </>

      )}


      {/* =====================================
          HISTORY TAB
      ===================================== */}

      {activeTab ===
        "history" && (

        <>

          {!selectedClassId ? (

            <section className="attendance-empty">

              <div>
                📊
              </div>


              <h2>

                {text(
                  "Select a class",
                  "اختاري الصف"
                )}

              </h2>


              <p>

                {text(
                  "Choose a class to view its attendance history.",
                  "اختاري صفًا لعرض سجل الحضور الخاص به."
                )}

              </p>

            </section>

          ) : loadingHistory ? (

            <section className="attendance-empty">

              <div>
                ⏳
              </div>


              <h2>

                {text(
                  "Loading history...",
                  "جارٍ تحميل السجل..."
                )}

              </h2>

            </section>

          ) : selectedHistoryRecord ? (

            /* =================================
               HISTORY DAY DETAILS
            ================================= */

            <section className="attendance-history-detail">

              <div className="attendance-history-detail-header">

                <div>

                  <button
                    type="button"
                    className="history-back-button"
                    onClick={() =>
                      setSelectedHistoryRecord(
                        null
                      )
                    }
                  >

                    {language ===
                    "ar"
                      ? "→ العودة للسجل"
                      : "← Back to History"}

                  </button>


                  <small>

                    {text(
                      "ATTENDANCE DETAILS",
                      "تفاصيل الحضور"
                    )}

                  </small>


                  <h2>

                    {selectedHistoryRecord
                      .className ||
                      selectedClass
                        ?.name}

                  </h2>


                  <p>

                    📆{" "}

                    {formatDate(
                      selectedHistoryRecord.date
                    )}

                  </p>

                </div>


                <button
                  type="button"
                  className="history-edit-button"
                  onClick={() =>
                    editHistoryRecord(
                      selectedHistoryRecord
                    )
                  }
                >

                  ✏️{" "}

                  {text(
                    "Edit Attendance",
                    "تعديل الحضور"
                  )}

                </button>

              </div>


              <div className="history-detail-summary">

                <div>
                  ✅
                  <strong>
                    {getHistoryCount(
                      selectedHistoryRecord,
                      "present"
                    )}
                  </strong>
                  <span>
                    {text(
                      "Present",
                      "حاضر"
                    )}
                  </span>
                </div>


                <div>
                  ❌
                  <strong>
                    {getHistoryCount(
                      selectedHistoryRecord,
                      "absent"
                    )}
                  </strong>
                  <span>
                    {text(
                      "Absent",
                      "غائب"
                    )}
                  </span>
                </div>


                <div>
                  ⏰
                  <strong>
                    {getHistoryCount(
                      selectedHistoryRecord,
                      "late"
                    )}
                  </strong>
                  <span>
                    {text(
                      "Late",
                      "متأخر"
                    )}
                  </span>
                </div>


                <div>
                  🟡
                  <strong>
                    {getHistoryCount(
                      selectedHistoryRecord,
                      "excused"
                    )}
                  </strong>
                  <span>
                    {text(
                      "Excused",
                      "بعذر"
                    )}
                  </span>
                </div>

              </div>


              <div className="history-students-list">

                {Object.values(
                  selectedHistoryRecord.students ||
                  {}
                ).map(
                  (
                    student,
                    index
                  ) => {

                    const status =
                      getStatusInfo(
                        student.status
                      );


                    return (
                      <div
                        className="history-student-row"
                        key={
                          student.studentId ||
                          index
                        }
                      >

                        <span className="history-student-index">

                          {index +
                            1}

                        </span>


                        <div className="attendance-student-avatar">
                          🎓
                        </div>


                        <div className="history-student-name">

                          <strong>

                            {student.name ||
                              "-"}

                          </strong>


                          <span>

                            {student.studentCode ||
                              ""}

                          </span>

                        </div>


                        <div
                          className={
                            `history-status ${student.status || "present"}`
                          }
                        >

                          {status.icon}{" "}

                          {text(
                            status.en,
                            status.ar
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

          ) : classHistory.length ===
            0 ? (

            <section className="attendance-empty">

              <div>
                📅
              </div>


              <h2>

                {text(
                  "No attendance history yet",
                  "لا يوجد سجل حضور بعد"
                )}

              </h2>


              <p>

                {text(
                  "Saved attendance sessions will appear here.",
                  "جلسات الحضور التي تحفظينها ستظهر هنا."
                )}

              </p>

            </section>

          ) : (

            /* =================================
               HISTORY LIST
            ================================= */

            <>

              <section className="history-overview">

                <div>

                  <span>
                    📅
                  </span>

                  <small>

                    {text(
                      "Sessions",
                      "جلسات الحضور"
                    )}

                  </small>

                  <strong>

                    {classHistory.length}

                  </strong>

                </div>


                <div>

                  <span>
                    ✅
                  </span>

                  <small>

                    {text(
                      "Total Present",
                      "إجمالي الحضور"
                    )}

                  </small>

                  <strong>

                    {historyTotals.present}

                  </strong>

                </div>


                <div>

                  <span>
                    ❌
                  </span>

                  <small>

                    {text(
                      "Total Absent",
                      "إجمالي الغياب"
                    )}

                  </small>

                  <strong>

                    {historyTotals.absent}

                  </strong>

                </div>


                <div>

                  <span>
                    ⏰
                  </span>

                  <small>

                    {text(
                      "Total Late",
                      "إجمالي التأخير"
                    )}

                  </small>

                  <strong>

                    {historyTotals.late}

                  </strong>

                </div>

              </section>


              <section className="attendance-history-panel">

                <div className="attendance-panel-header">

                  <div>

                    <small>

                      {text(
                        "ATTENDANCE HISTORY",
                        "سجل الحضور"
                      )}

                    </small>


                    <h2>

                      {selectedClass
                        ?.name ||
                        "-"}

                    </h2>


                    <p>

                      {text(
                        `${classHistory.length} saved sessions`,
                        `${classHistory.length} جلسات محفوظة`
                      )}

                    </p>

                  </div>


                  <span className="attendance-class-code">

                    {selectedClass
                      ?.classCode ||
                      ""}

                  </span>

                </div>


                <div className="history-table-head">

                  <span>

                    {text(
                      "Date",
                      "التاريخ"
                    )}

                  </span>

                  <span>
                    ✅{" "}
                    {text(
                      "Present",
                      "حاضر"
                    )}
                  </span>

                  <span>
                    ❌{" "}
                    {text(
                      "Absent",
                      "غائب"
                    )}
                  </span>

                  <span>
                    ⏰{" "}
                    {text(
                      "Late",
                      "متأخر"
                    )}
                  </span>

                  <span>
                    🟡{" "}
                    {text(
                      "Excused",
                      "بعذر"
                    )}
                  </span>

                  <span>

                    {text(
                      "Details",
                      "التفاصيل"
                    )}

                  </span>

                </div>


                {classHistory.map(
                  (
                    record
                  ) => (

                    <div
                      className="history-table-row"
                      key={
                        record.id
                      }
                    >

                      <strong>

                        📆{" "}

                        {formatDate(
                          record.date
                        )}

                      </strong>


                      <span className="history-count present">

                        {getHistoryCount(
                          record,
                          "present"
                        )}

                      </span>


                      <span className="history-count absent">

                        {getHistoryCount(
                          record,
                          "absent"
                        )}

                      </span>


                      <span className="history-count late">

                        {getHistoryCount(
                          record,
                          "late"
                        )}

                      </span>


                      <span className="history-count excused">

                        {getHistoryCount(
                          record,
                          "excused"
                        )}

                      </span>


                      <button
                        type="button"
                        className="history-view-button"
                        onClick={() =>
                          openHistoryRecord(
                            record
                          )
                        }
                      >

                        👁{" "}

                        {text(
                          "View",
                          "عرض"
                        )}

                      </button>

                    </div>

                  )
                )}

              </section>

            </>

          )}

        </>

      )}

    </div>
  );
}


export default TeacherAttendance;