import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
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

import "./StudentPortfolio.css";

import { hebrewText } from "../data/hebrewText";


function StudentPortfolio() {
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
      : language === "he"
        ? hebrewText(english)
      : english;


  const [
    projects,
    setProjects,
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
    selectedProject,
    setSelectedProject,
  ] = useState(null);


  /* =============================
     LOAD PORTFOLIO
  ============================= */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      navigate("/login");
      return undefined;
    }


    const portfolioQuery =
      query(
        collection(
          db,
          "portfolio"
        ),

        where(
          "studentId",
          "==",
          currentUser.uid
        )
      );


    const unsubscribe =
      onSnapshot(
        portfolioQuery,

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (projectDocument) => ({
                id:
                  projectDocument.id,

                ...projectDocument.data(),
              })
            );


          list.sort(
            (a, b) => {
              const aTime =
                a.createdAt
                  ?.seconds || 0;

              const bTime =
                b.createdAt
                  ?.seconds || 0;

              return bTime - aTime;
            }
          );


          setProjects(list);
          setLoading(false);
        },

        (portfolioError) => {
          console.error(
            "Portfolio error:",
            portfolioError
          );


          setError(
            text(
              "Could not load your portfolio.",
              "تعذر تحميل معرض أعمالك."
            )
          );


          setLoading(false);
        }
      );


    return () =>
      unsubscribe();

  }, [navigate]);


  /* =============================
     PROJECT ICON
  ============================= */

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


  /* =============================
     DATE
  ============================= */

  const formatDate =
    (timestamp) => {

      if (!timestamp?.toDate) {
        return "";
      }


      return timestamp
        .toDate()
        .toLocaleDateString(
          language === "ar"
            ? "ar"
            : "en"
        );
    };


  if (loading) {
    return (
      <div className="portfolio-loading">
        📁
      </div>
    );
  }


  return (
    <div className="student-portfolio-page">

      {/* HEADER */}

      <header className="portfolio-header">

        <div>

          <button
            type="button"
            className="portfolio-back"
            onClick={() =>
              navigate("/student")
            }
          >
            {language === "ar"
              ? "↩ الرئيسية"
              : language === "he"
                ? "→ לוח הבקרה"
                : "← Dashboard"}
          </button>


          <h1>
            📁{" "}
            {text(
              "My Portfolio",
              "معرض أعمالي"
            )}
          </h1>


          <p>
            {text(
              "A collection of the projects and challenges you completed in TeachLearn.",
              "مجموعة من المشاريع والمهام التي أنجزتها في TeachLearn."
            )}
          </p>

        </div>


        <div className="portfolio-language">

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


      {/* SUMMARY */}

      <section className="portfolio-summary">

        <div>
          <span>📁</span>

          <div>
            <small>
              {text(
                "Projects",
                "المشاريع"
              )}
            </small>

            <strong>
              {projects.length}
            </strong>
          </div>
        </div>


        <div>
          <span>⭐</span>

          <div>
            <small>
              {text(
                "Completed Work",
                "أعمال مكتملة"
              )}
            </small>

            <strong>
              {
                projects.filter(
                  (project) =>
                    project.status ===
                    "completed"
                ).length
              }
            </strong>
          </div>
        </div>

      </section>


      {error && (
        <div className="portfolio-error">
          ⚠️ {error}
        </div>
      )}


      {/* EMPTY */}

      {projects.length === 0 ? (

        <section className="portfolio-empty">

          <div>
            🚀
          </div>


          <h2>
            {text(
              "Your portfolio is waiting for your first project!",
              "معرض أعمالك ينتظر أول مشروع!"
            )}
          </h2>


          <p>
            {text(
              "Complete special activities inside your lessons and add them here.",
              "أكمل المهام المميزة داخل الدروس وأضفها إلى معرض أعمالك."
            )}
          </p>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/lessons"
              )
            }
          >
            📚{" "}
            {text(
              "Go to Lessons",
              "اذهب إلى الدروس"
            )}
          </button>

        </section>

      ) : (

        <section className="portfolio-grid">

          {projects.map(
            (project) => (

              <article
                className="portfolio-card"
                key={project.id}
              >

                <div className="portfolio-card-cover">

                  <span>
                    {getProjectIcon(
                      project.projectType
                    )}
                  </span>

                </div>


                <div className="portfolio-card-body">

                  <div className="portfolio-card-top">

                    <span className="portfolio-status">
                      ✅{" "}
                      {text(
                        "Completed",
                        "مكتمل"
                      )}
                    </span>


                    {project.xpReward > 0 && (
                      <span className="portfolio-xp">
                        ⭐ +
                        {project.xpReward} XP
                      </span>
                    )}

                  </div>


                  <small className="portfolio-source">

                    {project.lessonTitle
                      ? `📚 ${project.lessonTitle}`
                      : "TeachLearn"}

                  </small>


                  <h2>
                    {project.title}
                  </h2>


                  <p>
                    {project.description ||
                      text(
                        "TeachLearn project",
                        "مشروع TeachLearn"
                      )}
                  </p>


                  {project.createdAt && (
                    <small className="portfolio-date">

                      📅{" "}

                      {formatDate(
                        project.createdAt
                      )}

                    </small>
                  )}


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


      {/* PROJECT MODAL */}

      {selectedProject && (

        <div
          className="portfolio-modal-overlay"
          onClick={() =>
            setSelectedProject(null)
          }
        >

          <div
            className="portfolio-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="portfolio-modal-close"
              onClick={() =>
                setSelectedProject(null)
              }
            >
              ×
            </button>


            <div className="portfolio-modal-icon">

              {getProjectIcon(
                selectedProject.projectType
              )}

            </div>


            <small>
              {text(
                "MY TEACHLEARN PROJECT",
                "مشروعي في TeachLearn"
              )}
            </small>


            <h2>
              {selectedProject.title}
            </h2>


            {selectedProject.lessonTitle && (

              <p className="portfolio-modal-lesson">

                📚{" "}

                {selectedProject.lessonTitle}

              </p>

            )}


            {selectedProject.description && (

              <p>
                {selectedProject.description}
              </p>

            )}


            <div className="portfolio-answer">

              <small>

                {text(
                  "My Work",
                  "عملي"
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


            {selectedProject.projectUrl && (

              <a
                href={
                  selectedProject.projectUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                🔗{" "}
                {text(
                  "Open Project",
                  "فتح المشروع"
                )}
              </a>

            )}

          </div>

        </div>
      )}

    </div>
  );
}


export default StudentPortfolio;