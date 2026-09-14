import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./TeacherStudentProgress.css";

import { hebrewText } from "../data/hebrewText";


function TeacherStudentProgress() {
  const navigate =
    useNavigate();

  const {
    studentId,
  } = useParams();

  const {
    language,
    setLanguage,
  } = useLanguage();


  /* =====================================================
     STATE
  ===================================================== */

  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    progressList,
    setProgressList,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /*
    Temporary teacher feedback
    before pressing Save.
  */

  const [
    feedbackDrafts,
    setFeedbackDrafts,
  ] = useState({});


  const [
    savingFeedback,
    setSavingFeedback,
  ] = useState("");


  /* =====================================================
     LANGUAGE
  ===================================================== */

  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrewText(english)
      : english;


  const localized =
    (value) => {
      if (!value) {
        return "";
      }


      if (
        typeof value ===
        "string"
      ) {
        return value;
      }


      return (
        value[language] ||
        value.en ||
        value.ar ||
        ""
      );
    };


  /* =====================================================
     LOAD STUDENT + PROGRESS
  ===================================================== */

  useEffect(() => {
    let unsubscribeProgress =
      null;


    const loadPage =
      async () => {
        try {
          setLoading(true);
          setError("");


          const currentUser =
            auth.currentUser;


          if (!currentUser) {
            navigate("/login");

            return;
          }


          /* =========================================
             STUDENT
          ========================================= */

          const studentSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                studentId
              )
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


          /*
            Teacher can only open
            their own students.
          */

          if (
            studentData.role !==
              "student" ||
            studentData.teacherId !==
              currentUser.uid
          ) {
            throw new Error(
              "not-allowed"
            );
          }


          setStudent({
            id:
              studentSnapshot.id,

            ...studentData,
          });


          /* =========================================
             PROGRESS
          ========================================= */

          const progressQuery =
            query(
              collection(
                db,
                "lessonProgress"
              ),

              where(
                "teacherId",
                "==",
                currentUser.uid
              )
            );


          unsubscribeProgress =
            onSnapshot(
              progressQuery,

              async (
                snapshot
              ) => {
                try {
                  const studentProgressDocs =
                    snapshot.docs
                      .map(
                        (
                          progressDocument
                        ) => ({
                          id:
                            progressDocument.id,

                          ...progressDocument.data(),
                        })
                      )
                      .filter(
                        (
                          progress
                        ) =>
                          progress.studentId ===
                          studentId
                      );


                  /*
                    Load lesson content
                    for each progress record.
                  */

                  const enrichedProgress =
                    await Promise.all(
                      studentProgressDocs.map(
                        async (
                          progress
                        ) => {
                          try {
                            const lessonSnapshot =
                              await getDoc(
                                doc(
                                  db,
                                  "lessons",
                                  progress.lessonId
                                )
                              );


                            if (
                              !lessonSnapshot.exists()
                            ) {
                              return {
                                ...progress,

                                lesson:
                                  null,
                              };
                            }


                            return {
                              ...progress,

                              lesson: {
                                id:
                                  lessonSnapshot.id,

                                ...lessonSnapshot.data(),
                              },
                            };

                          } catch (
                            lessonError
                          ) {
                            console.error(
                              "Load lesson:",
                              lessonError
                            );


                            return {
                              ...progress,

                              lesson:
                                null,
                            };
                          }
                        }
                      )
                    );


                  /*
                    Completed lessons first.
                  */

                  enrichedProgress.sort(
                    (
                      a,
                      b
                    ) => {

                      if (
                        a.status ===
                          "completed" &&
                        b.status !==
                          "completed"
                      ) {
                        return -1;
                      }


                      if (
                        b.status ===
                          "completed" &&
                        a.status !==
                          "completed"
                      ) {
                        return 1;
                      }


                      return (
                        Number(
                          b.currentSlide ||
                          0
                        ) -
                        Number(
                          a.currentSlide ||
                          0
                        )
                      );
                    }
                  );


                  setProgressList(
                    enrichedProgress
                  );


                  setLoading(
                    false
                  );

                } catch (
                  progressLoadError
                ) {
                  console.error(
                    "Progress processing:",
                    progressLoadError
                  );


                  setError(
                    text(
                      "Could not load student progress.",
                      "تعذر تحميل تقدم الطالب."
                    )
                  );


                  setLoading(
                    false
                  );
                }
              },

              (
                progressError
              ) => {
                console.error(
                  "Progress listener:",
                  progressError
                );


                setError(
                  text(
                    "Could not load student progress.",
                    "تعذر تحميل تقدم الطالب."
                  )
                );


                setLoading(
                  false
                );
              }
            );

        } catch (
          pageError
        ) {
          console.error(
            "Teacher student progress:",
            pageError
          );


          setError(
            text(
              "Student could not be loaded.",
              "تعذر تحميل بيانات الطالب."
            )
          );


          setLoading(false);
        }
      };


    loadPage();


    return () => {
      if (
        unsubscribeProgress
      ) {
        unsubscribeProgress();
      }
    };

  }, [
    studentId,
    navigate,
  ]);


  /* =====================================================
     ANSWER HELPERS
  ===================================================== */

  const getOptionText =
    (
      section,
      optionId
    ) => {

      if (
        !section?.options ||
        !optionId
      ) {
        return optionId || "";
      }


      const option =
        section.options.find(
          (
            item
          ) =>
            item.id ===
            optionId
        );


      if (!option) {
        return optionId;
      }


      return localized(
        option.text
      );
    };


  /* =====================================================
     FEEDBACK KEY
  ===================================================== */

  const getFeedbackKey =
    (
      progressId,
      sectionId
    ) =>
      `${progressId}_${sectionId}`;


  /* =====================================================
     GET CURRENT FEEDBACK VALUE
  ===================================================== */

  const getFeedbackValue =
    (
      progress,
      section
    ) => {

      const key =
        getFeedbackKey(
          progress.id,
          section.id
        );


      if (
        feedbackDrafts[
          key
        ] !== undefined
      ) {
        return feedbackDrafts[
          key
        ];
      }


      return {
        comment:
          progress
            .teacherFeedback?.[
            section.id
          ]?.comment ||
          "",

        score:
          Number(
            progress
              .teacherFeedback?.[
              section.id
            ]?.score ||
            0
          ),
      };
    };


  /* =====================================================
     CHANGE FEEDBACK COMMENT
  ===================================================== */

  const changeFeedbackComment =
    (
      progress,
      section,
      value
    ) => {

      const key =
        getFeedbackKey(
          progress.id,
          section.id
        );


      const current =
        getFeedbackValue(
          progress,
          section
        );


      setFeedbackDrafts(
        (
          previous
        ) => ({
          ...previous,

          [key]: {
            ...current,

            comment:
              value,
          },
        })
      );
    };


  /* =====================================================
     CHANGE SCORE
  ===================================================== */

  const changeFeedbackScore =
    (
      progress,
      section,
      score
    ) => {

      const key =
        getFeedbackKey(
          progress.id,
          section.id
        );


      const current =
        getFeedbackValue(
          progress,
          section
        );


      setFeedbackDrafts(
        (
          previous
        ) => ({
          ...previous,

          [key]: {
            ...current,

            score,
          },
        })
      );
    };


  /* =====================================================
     SAVE TEACHER FEEDBACK
  ===================================================== */

  const saveTeacherFeedback =
    async (
      progress,
      section
    ) => {

      try {
        setError("");
        setSuccess("");


        const currentUser =
          auth.currentUser;


        if (!currentUser) {
          navigate("/login");

          return;
        }


        /*
          Extra safety:
          progress must belong
          to current teacher.
        */

        if (
          progress.teacherId !==
          currentUser.uid
        ) {
          throw new Error(
            "not-allowed"
          );
        }


        const key =
          getFeedbackKey(
            progress.id,
            section.id
          );


        const feedback =
          getFeedbackValue(
            progress,
            section
          );


        if (
          !feedback.comment
            .trim() &&
          !feedback.score
        ) {
          setError(
            text(
              "Write feedback or choose a score first.",
              "اكتب ملاحظة أو اختر تقييمًا أولًا."
            )
          );

          return;
        }


        setSavingFeedback(
          key
        );


        await updateDoc(
          doc(
            db,
            "lessonProgress",
            progress.id
          ),

          {
            [`teacherFeedback.${section.id}`]:
              {
                comment:
                  feedback.comment
                    .trim(),

                score:
                  Number(
                    feedback.score ||
                    0
                  ),

                teacherId:
                  currentUser.uid,

                reviewedAt:
                  serverTimestamp(),
              },

            teacherReviewedAt:
              serverTimestamp(),
          }
        );


        setSuccess(
          text(
            "Teacher feedback saved successfully.",
            "تم حفظ ملاحظات المعلم بنجاح."
          )
        );


        /*
          Remove temporary draft.
          Firestore onSnapshot
          will reload saved value.
        */

        setFeedbackDrafts(
          (
            previous
          ) => {
            const copy = {
              ...previous,
            };


            delete copy[
              key
            ];


            return copy;
          }
        );

      } catch (
        feedbackError
      ) {
        console.error(
          "Save teacher feedback:",
          feedbackError
        );


        if (
          feedbackError.code ===
          "permission-denied"
        ) {
          setError(
            text(
              "Firestore permissions do not allow saving teacher feedback.",
              "صلاحيات Firestore لا تسمح بحفظ ملاحظات المعلم."
            )
          );

        } else {
          setError(
            text(
              "Could not save the feedback.",
              "تعذر حفظ الملاحظات."
            )
          );
        }

      } finally {
        setSavingFeedback("");
      }
    };


  /* =====================================================
     FEEDBACK EDITOR
  ===================================================== */

  const renderFeedbackEditor =
    (
      section,
      progress
    ) => {

      const feedback =
        getFeedbackValue(
          progress,
          section
        );


      const existingFeedback =
        progress
          .teacherFeedback?.[
          section.id
        ];


      const key =
        getFeedbackKey(
          progress.id,
          section.id
        );


      return (
        <div className="teacher-feedback-editor">

          <div className="feedback-editor-heading">

            <div>

              <small>
                🧑‍🏫{" "}

                {text(
                  "TEACHER FEEDBACK",
                  "ملاحظات المعلم"
                )}
              </small>


              <h5>

                {text(
                  "Review this answer",
                  "راجع هذه الإجابة"
                )}

              </h5>

            </div>


            {existingFeedback && (
              <span className="feedback-reviewed-badge">

                ✓{" "}

                {text(
                  "Reviewed",
                  "تمت المراجعة"
                )}

              </span>
            )}

          </div>


          {/* =========================================
              SCORE
          ========================================= */}

          <div className="teacher-feedback-score">

            <span>

              {text(
                "Score",
                "التقييم"
              )}

            </span>


            <div className="feedback-stars">

              {[
                1,
                2,
                3,
                4,
                5,
              ].map(
                (
                  score
                ) => (

                  <button
                    type="button"
                    key={
                      score
                    }
                    className={
                      score <=
                      feedback.score
                        ? "feedback-star active"
                        : "feedback-star"
                    }
                    onClick={() =>
                      changeFeedbackScore(
                        progress,
                        section,
                        score
                      )
                    }
                    title={
                      `${score}/5`
                    }
                  >
                    ⭐
                  </button>
                )
              )}

            </div>


            <strong>

              {feedback.score ||
                0}
              /5

            </strong>

          </div>


          {/* =========================================
              COMMENT
          ========================================= */}

          <textarea
            rows="3"
            value={
              feedback.comment
            }
            onChange={(
              event
            ) =>
              changeFeedbackComment(
                progress,
                section,
                event.target.value
              )
            }
            placeholder={text(
              "Write feedback for the student...",
              "اكتب ملاحظتك للطالب..."
            )}
          />


          <button
            type="button"
            className="save-teacher-feedback-button"
            disabled={
              savingFeedback ===
              key
            }
            onClick={() =>
              saveTeacherFeedback(
                progress,
                section
              )
            }
          >

            {savingFeedback ===
            key
              ? text(
                  "Saving...",
                  "جارٍ الحفظ..."
                )
              : text(
                  "Save Feedback",
                  "حفظ الملاحظات"
                )}

            {" "}✓

          </button>

        </div>
      );
    };


  /* =====================================================
     RENDER STUDENT ANSWER
  ===================================================== */

  const renderAnswer =
    (
      section,
      progress
    ) => {

      const taskAnswers =
        progress.taskAnswers ||
        {};


      const selectedAnswers =
        progress.selectedAnswers ||
        {};


      const answerResults =
        progress.answerResults ||
        {};


      /* =================================================
         THINKING QUESTION
      ================================================= */

      if (
        section.type ===
        "question"
      ) {
        const answer =
          taskAnswers[
            section.id
          ];


        if (!answer) {
          return null;
        }


        return (
          <div className="teacher-answer-card">

            <div className="teacher-answer-heading">

              <span>
                {section.icon ||
                  "💭"}
              </span>


              <div>

                <small>

                  {text(
                    "THINKING QUESTION",
                    "سؤال تفكير"
                  )}

                </small>


                <h4>

                  {localized(
                    section.title
                  )}

                </h4>

              </div>

            </div>


            <p className="teacher-question-text">

              {localized(
                section.text
              )}

            </p>


            <div className="student-written-answer">

              <small>

                {text(
                  "Student Answer",
                  "إجابة الطالب"
                )}

              </small>


              <p>
                {answer}
              </p>

            </div>


            {renderFeedbackEditor(
              section,
              progress
            )}

          </div>
        );
      }


      /* =================================================
         MULTIPLE CHOICE
      ================================================= */

      if (
        section.type ===
        "multipleChoice"
      ) {
        const selected =
          selectedAnswers[
            section.id
          ];


        if (!selected) {
          return null;
        }


        const correct =
          answerResults[
            section.id
          ] === "correct";


        return (
          <div className="teacher-answer-card">

            <div className="teacher-answer-heading">

              <span>
                {section.icon ||
                  "🧩"}
              </span>


              <div>

                <small>

                  {text(
                    "QUIZ",
                    "اختبار"
                  )}

                </small>


                <h4>

                  {localized(
                    section.title
                  )}

                </h4>

              </div>

            </div>


            <p className="teacher-question-text">

              {localized(
                section.question
              )}

            </p>


            <div
              className={
                correct
                  ? "student-quiz-answer correct"
                  : "student-quiz-answer wrong"
              }
            >

              <span>

                {correct
                  ? "✅"
                  : "❌"}

              </span>


              <div>

                <small>

                  {text(
                    "Student Answer",
                    "إجابة الطالب"
                  )}

                </small>


                <strong>

                  {getOptionText(
                    section,
                    selected
                  )}

                </strong>

              </div>

            </div>


            {renderFeedbackEditor(
              section,
              progress
            )}

          </div>
        );
      }


      /* =================================================
         TASK
      ================================================= */

      if (
        section.type ===
          "task" &&
        section.answerPrompt
      ) {
        const answer =
          taskAnswers[
            section.id
          ];


        if (!answer) {
          return null;
        }


        return (
          <div className="teacher-answer-card">

            <div className="teacher-answer-heading">

              <span>
                {section.icon ||
                  "🚀"}
              </span>


              <div>

                <small>

                  {text(
                    "ACTIVITY",
                    "نشاط"
                  )}

                </small>


                <h4>

                  {localized(
                    section.title
                  )}

                </h4>

              </div>

            </div>


            <p className="teacher-question-text">

              {localized(
                section.answerPrompt
              )}

            </p>


            <div className="student-written-answer">

              <small>

                {text(
                  "Student Answer",
                  "إجابة الطالب"
                )}

              </small>


              <p>
                {answer}
              </p>

            </div>


            {renderFeedbackEditor(
              section,
              progress
            )}

          </div>
        );
      }


      /* =================================================
         REFLECTION
      ================================================= */

      if (
        section.type ===
        "reflection"
      ) {
        const answer =
          taskAnswers[
            section.id
          ];


        if (!answer) {
          return null;
        }


        return (
          <div className="teacher-answer-card">

            <div className="teacher-answer-heading">

              <span>
                {section.icon ||
                  "💬"}
              </span>


              <div>

                <small>
                  REFLECTION
                </small>


                <h4>

                  {localized(
                    section.title
                  )}

                </h4>

              </div>

            </div>


            <p className="teacher-question-text">

              {localized(
                section.question
              )}

            </p>


            <div className="student-written-answer">

              <small>

                {text(
                  "Student Reflection",
                  "إجابة الطالب"
                )}

              </small>


              <p>
                {answer}
              </p>

            </div>


            {renderFeedbackEditor(
              section,
              progress
            )}

          </div>
        );
      }


      return null;
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="teacher-progress-loading">
        📊
      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="teacher-student-progress-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="teacher-progress-header">

        <div>

          <button
            type="button"
            className="teacher-progress-back"
            onClick={() =>
              navigate(
                "/teacher/students"
              )
            }
          >

            {language === "ar"
              ? "↩ الطلاب"
              : "← Students"}

          </button>


          <h1>

            📊{" "}

            {text(
              "Student Progress",
              "تقدم الطالب"
            )}

          </h1>


          <p>

            {text(
              "Review lesson progress, student answers and give feedback.",
              "راجع تقدم الطالب وإجاباته وأضف ملاحظاتك."
            )}

          </p>

        </div>


        <div className="teacher-progress-language">

          <button
            type="button"
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
            type="button"
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

      </header>


      {/* =================================================
          STUDENT
      ================================================= */}

      {student && (
        <section className="teacher-progress-student">

          <div className="progress-student-avatar">
            🎓
          </div>


          <div className="progress-student-info">

            <small>

              {text(
                "STUDENT",
                "الطالب"
              )}

            </small>


            <h2>
              {student.name}
            </h2>


            <p>

              {student.className ||
                "-"}

              {student.studentCode
                ? ` • ${student.studentCode}`
                : ""}

            </p>

          </div>


          <div className="progress-student-stats">

            <div>

              <strong>
                {student.xp ||
                  0}
              </strong>

              <span>
                XP ⭐
              </span>

            </div>


            <div>

              <strong>

                {student.completedLessons ||
                  0}

              </strong>


              <span>

                {text(
                  "Completed",
                  "دروس مكتملة"
                )}

              </span>

            </div>


            <div>

              <strong>

                {progressList.length}

              </strong>


              <span>

                {text(
                  "Started",
                  "تم البدء بها"
                )}

              </span>

            </div>

          </div>

        </section>
      )}


      {/* =================================================
          MESSAGES
      ================================================= */}

      {error && (
        <div className="teacher-progress-error">

          ⚠️ {error}

        </div>
      )}


      {success && (
        <div className="teacher-progress-success">

          ✅ {success}

        </div>
      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {progressList.length ===
      0 ? (

        <section className="teacher-progress-empty">

          <div>
            📚
          </div>


          <h2>

            {text(
              "No lesson progress yet",
              "لا يوجد تقدم في الدروس بعد"
            )}

          </h2>


          <p>

            {text(
              "Once the student starts a lesson, their progress and answers will appear here.",
              "عندما يبدأ الطالب أحد الدروس سيظهر تقدمه وإجاباته هنا."
            )}

          </p>

        </section>

      ) : (

        /* =================================================
           LESSONS
        ================================================= */

        <section className="teacher-progress-lessons">

          {progressList.map(
            (
              progress
            ) => {

              const lesson =
                progress.lesson;


              const sections =
                Array.isArray(
                  lesson?.sections
                )
                  ? lesson.sections
                  : [];


              const answeredSections =
                sections.filter(
                  (
                    section
                  ) => {

                    if (
                      section.type ===
                      "multipleChoice"
                    ) {
                      return Boolean(
                        progress
                          .selectedAnswers?.[
                          section.id
                        ]
                      );
                    }


                    if (
                      section.type ===
                        "question" ||
                      section.type ===
                        "reflection" ||
                      (
                        section.type ===
                          "task" &&
                        section.answerPrompt
                      )
                    ) {
                      return Boolean(
                        progress
                          .taskAnswers?.[
                          section.id
                        ]
                          ?.trim()
                      );
                    }


                    return false;
                  }
                );


              const reviewedCount =
                answeredSections.filter(
                  (
                    section
                  ) =>
                    Boolean(
                      progress
                        .teacherFeedback?.[
                        section.id
                      ]
                    )
                ).length;


              const totalSlides =
                sections.length;


              const progressPercent =
                totalSlides > 0
                  ? Math.min(
                      100,

                      Math.round(
                        (
                          (
                            Number(
                              progress.currentSlide ||
                              0
                            ) +
                            1
                          ) /
                          totalSlides
                        ) *
                        100
                      )
                    )
                  : progress.status ===
                    "completed"
                  ? 100
                  : 0;


              return (
                <article
                  className="teacher-progress-lesson-card"
                  key={
                    progress.id
                  }
                >

                  {/* =====================================
                      TOP
                  ===================================== */}

                  <div className="progress-lesson-top">

                    <div className="progress-lesson-icon">

                      {lesson
                        ?.activityType ===
                      "ai"
                        ? "🤖"
                        : "📚"}

                    </div>


                    <div className="progress-lesson-title">

                      <small>

                        {progress.status ===
                        "completed"
                          ? text(
                              "COMPLETED LESSON",
                              "درس مكتمل"
                            )
                          : text(
                              "IN PROGRESS",
                              "قيد التقدم"
                            )}

                      </small>


                      <h2>

                        {localized(
                          lesson
                            ?.titleI18n
                        ) ||
                          progress
                            .lessonTitle ||
                          lesson?.title ||
                          text(
                            "Lesson",
                            "درس"
                          )}

                      </h2>


                      <p>

                        🏫{" "}

                        {progress.className ||
                          student
                            ?.className ||
                          "-"}

                      </p>

                    </div>


                    <div
                      className={
                        progress.status ===
                        "completed"
                          ? "progress-status completed"
                          : "progress-status active"
                      }
                    >

                      {progress.status ===
                      "completed"
                        ? text(
                            "✓ Completed",
                            "✓ مكتمل"
                          )
                        : text(
                            "In Progress",
                            "قيد التقدم"
                          )}

                    </div>

                  </div>


                  {/* =====================================
                      PROGRESS
                  ===================================== */}

                  <div className="teacher-progress-bar-info">

                    <span>

                      {text(
                        "Lesson Progress",
                        "تقدم الدرس"
                      )}

                    </span>


                    <strong>

                      {progress.status ===
                      "completed"
                        ? 100
                        : progressPercent}
                      %

                    </strong>

                  </div>


                  <div className="teacher-progress-bar">

                    <div
                      style={{
                        width:
                          `${
                            progress.status ===
                            "completed"
                              ? 100
                              : progressPercent
                          }%`,
                      }}
                    />

                  </div>


                  {/* =====================================
                      STATS
                  ===================================== */}

                  <div className="progress-lesson-stats">

                    <div>

                      <strong>
                        {totalSlides}
                      </strong>


                      <span>

                        {text(
                          "Slides",
                          "شرائح"
                        )}

                      </span>

                    </div>


                    <div>

                      <strong>

                        {answeredSections.length}

                      </strong>


                      <span>

                        {text(
                          "Answers",
                          "إجابات"
                        )}

                      </span>

                    </div>


                    <div>

                      <strong>

                        {reviewedCount}

                      </strong>


                      <span>

                        {text(
                          "Reviewed",
                          "تمت مراجعتها"
                        )}

                      </span>

                    </div>


                    <div>

                      <strong>

                        {lesson?.xpReward ||
                          0}

                      </strong>

                      <span>
                        XP ⭐
                      </span>

                    </div>

                  </div>


                  {/* =====================================
                      ANSWERS
                  ===================================== */}

                  <div className="teacher-answers-section">

                    <div className="teacher-answers-title">

                      <div>

                        <small>

                          {text(
                            "STUDENT WORK",
                            "عمل الطالب"
                          )}

                        </small>


                        <h3>

                          {text(
                            "Answers & Activities",
                            "الإجابات والأنشطة"
                          )}

                        </h3>

                      </div>


                      <span>

                        {answeredSections.length}

                      </span>

                    </div>


                    {answeredSections.length ===
                    0 ? (

                      <div className="teacher-no-answers">

                        📝{" "}

                        {text(
                          "No answers submitted yet.",
                          "لم يرسل الطالب إجابات بعد."
                        )}

                      </div>

                    ) : (

                      <div className="teacher-answer-list">

                        {answeredSections.map(
                          (
                            section
                          ) => (

                            <div
                              key={
                                section.id
                              }
                            >

                              {renderAnswer(
                                section,
                                progress
                              )}

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </article>
              );
            }
          )}

        </section>
      )}

    </div>
  );
}


export default TeacherStudentProgress;