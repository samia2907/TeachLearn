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

import "./TeacherStudentPortfolio.css";


function TeacherStudentPortfolio() {
  const navigate =
    useNavigate();

  const {
    studentId,
  } = useParams();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    selectedProject,
    setSelectedProject,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  const formatDate =
    (timestamp) => {

      if (!timestamp) {
        return "";
      }


      try {
        const date =
          timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);


        return date.toLocaleDateString(
          language === "ar"
            ? "ar"
            : "en"
        );

      } catch {
        return "";
      }
    };


  const getProjectIcon =
    (type) => {

      switch (type) {

        case "ai":
          return "🤖";

        case "coding":
          return "💻";

        case "cyber":
          return "🔐";

        case "internet":
          return "🌐";

        case "creative":
          return "🎨";

        default:
          return "🚀";
      }
    };


  /* ==========================================
     LOAD STUDENT + PORTFOLIO
  ========================================== */

  useEffect(() => {

    let unsubscribePortfolio =
      null;


    const loadPage =
      async () => {

        try {

          setLoading(true);
          setError("");


          const currentUser =
            auth.currentUser;


          if (!currentUser) {

            navigate(
              "/login"
            );

            return;
          }


          /* STUDENT PROFILE */

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
            Teacher can only
            open own student.
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


          /*
            Query by teacherId because
            Firestore rules allow teacher
            to read their portfolio docs.

            Then filter student in browser.
          */

          const portfolioQuery =
            query(
              collection(
                db,
                "portfolio"
              ),

              where(
                "teacherId",
                "==",
                currentUser.uid
              )
            );


          unsubscribePortfolio =
            onSnapshot(
              portfolioQuery,

              (snapshot) => {

                const list =
                  snapshot.docs

                    .map(
                      (
                        projectDocument
                      ) => ({
                        id:
                          projectDocument.id,

                        ...projectDocument.data(),
                      })
                    )

                    .filter(
                      (project) =>
                        project.studentId ===
                        studentId
                    );


                list.sort(
                  (
                    a,
                    b
                  ) => {

                    const aTime =
                      a.updatedAt
                        ?.seconds ||
                      a.createdAt
                        ?.seconds ||
                      0;

                    const bTime =
                      b.updatedAt
                        ?.seconds ||
                      b.createdAt
                        ?.seconds ||
                      0;


                    return (
                      bTime -
                      aTime
                    );
                  }
                );


                setProjects(
                  list
                );

                setLoading(
                  false
                );
              },

              (
                portfolioError
              ) => {

                console.error(
                  "Portfolio listener:",
                  portfolioError
                );


                setError(
                  text(
                    "Could not load the student's portfolio.",
                    "تعذر تحميل معرض أعمال الطالب."
                  )
                );


                setLoading(
                  false
                );
              }
            );


        } catch (
          loadError
        ) {

          console.error(
            "Teacher student portfolio:",
            loadError
          );


          setError(
            text(
              "You cannot open this student's portfolio.",
              "تعذر فتح معرض أعمال هذا الطالب."
            )
          );


          setLoading(
            false
          );
        }
      };


    loadPage();


    return () => {

      if (
        unsubscribePortfolio
      ) {

        unsubscribePortfolio();

      }
    };

  }, [
    studentId,
    navigate,
  ]);


  if (loading) {

    return (
      <div className="teacher-portfolio-loading">

        📁

        <p>
          {text(
            "Loading portfolio...",
            "جارٍ تحميل معرض الأعمال..."
          )}
        </p>

      </div>
    );
  }


  return (
    <div className="teacher-student-portfolio-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="teacher-portfolio-header">

        <div>

          <button
            type="button"
            className="teacher-portfolio-back"
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

            📁{" "}

            {text(
              "Student Portfolio",
              "معرض أعمال الطالب"
            )}

          </h1>


          <p>

            {text(
              "View projects and work saved by the student from TechMinds lessons.",
              "شاهد المشاريع والأعمال التي حفظها الطالب من دروس TechMinds."
            )}

          </p>

        </div>


        <div className="teacher-portfolio-language">

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


      {/* ERROR */}

      {error && (

        <div className="teacher-portfolio-error">

          ⚠️ {error}

        </div>

      )}


      {/* =========================================
          STUDENT
      ========================================= */}

      {student && (

        <section className="teacher-portfolio-student">

          <div className="teacher-portfolio-avatar">

            🎓

          </div>


          <div className="teacher-portfolio-student-info">

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


          <div className="teacher-portfolio-stats">

            <div>

              <strong>
                {projects.length}
              </strong>

              <span>

                {text(
                  "Projects",
                  "مشاريع"
                )}

              </span>

            </div>


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

                {student.level ||
                  1}

              </strong>

              <span>

                {text(
                  "Level",
                  "المستوى"
                )}

              </span>

            </div>

          </div>

        </section>

      )}


      {/* =========================================
          EMPTY
      ========================================= */}

      {!error &&
        projects.length ===
          0 && (

        <section className="teacher-portfolio-empty">

          <div>
            📁
          </div>


          <h2>

            {text(
              "No portfolio projects yet",
              "لا توجد أعمال في المعرض بعد"
            )}

          </h2>


          <p>

            {text(
              "When the student adds an activity from a lesson to their portfolio, it will appear here.",
              "عندما يضيف الطالب مهمة من أحد الدروس إلى معرضه ستظهر هنا."
            )}

          </p>

        </section>

      )}


      {/* =========================================
          PROJECTS
      ========================================= */}

      {projects.length >
        0 && (

        <section className="teacher-portfolio-grid">

          {projects.map(
            (project) => (

              <article
                className="teacher-portfolio-card"
                key={
                  project.id
                }
              >

                <div className="teacher-project-cover">

                  <span>

                    {getProjectIcon(
                      project.projectType
                    )}

                  </span>

                </div>


                <div className="teacher-project-body">

                  <div className="teacher-project-badges">

                    <span className="teacher-project-status">

                      ✅{" "}

                      {text(
                        "Completed",
                        "مكتمل"
                      )}

                    </span>


                    {project.lessonTitle && (

                      <span className="teacher-project-lesson">

                        📚{" "}

                        {project.lessonTitle}

                      </span>

                    )}

                  </div>


                  <h2>

                    {project.title ||
                      text(
                        "Student Project",
                        "مشروع الطالب"
                      )}

                  </h2>


                  {project.description && (

                    <p>

                      {project.description}

                    </p>

                  )}


                  <div className="teacher-project-date">

                    📅{" "}

                    {formatDate(
                      project.updatedAt ||
                      project.createdAt
                    )}

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProject(
                        project
                      )
                    }
                  >

                    👁{" "}

                    {text(
                      "View Project",
                      "عرض المشروع"
                    )}

                  </button>

                </div>

              </article>

            )
          )}

        </section>

      )}


      {/* =========================================
          PROJECT DETAILS
      ========================================= */}

      {selectedProject && (

        <div
          className="teacher-project-modal-overlay"
          onClick={() =>
            setSelectedProject(
              null
            )
          }
        >

          <div
            className="teacher-project-modal"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="teacher-project-modal-close"
              onClick={() =>
                setSelectedProject(
                  null
                )
              }
            >
              ×
            </button>


            <div className="teacher-project-modal-icon">

              {getProjectIcon(
                selectedProject.projectType
              )}

            </div>


            <small>

              {text(
                "STUDENT PROJECT",
                "مشروع الطالب"
              )}

            </small>


            <h2>

              {selectedProject.title}

            </h2>


            {selectedProject.lessonTitle && (

              <div className="teacher-project-modal-lesson">

                📚{" "}

                {selectedProject.lessonTitle}

              </div>

            )}


            {selectedProject.description && (

              <p>

                {selectedProject.description}

              </p>

            )}


            <div className="teacher-project-answer">

              <small>

                {text(
                  "Student Work",
                  "عمل الطالب"
                )}

              </small>


              <p>

                {selectedProject.answer ||
                  text(
                    "No written answer.",
                    "لا توجد إجابة مكتوبة."
                  )}

              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default TeacherStudentPortfolio;