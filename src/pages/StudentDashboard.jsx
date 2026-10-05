import ProfileLink from '../components/ProfileLink';
import { normalizeProgram } from '../../functions/programAccessPolicy.mjs';
import { studentHasProgramAccess } from '../firebase/studentProgramAccess';
import { loadContentProgress } from '../progress/contentProgress';

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

  where,

} from "firebase/firestore";



import {

  signOut,

} from "firebase/auth";



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



import "./StudentDashboard.css";





const checkProgramAccess = httpsCallable(functions, "checkProgramAccess");

function StudentDashboard() {

  const navigate =

    useNavigate();



  const {

    language,

    changeLanguage,

  } = useLanguage();





  /* =========================

     TRANSLATION

  ========================= */



  const text = (

    en,

    ar,

    he

  ) => {

    if (

      language === "ar"

    ) {

      return ar;

    }



    if (

      language === "he"

    ) {

      return he;

    }



    return en;

  };





  const isRTL =

    language === "ar" ||

    language === "he";





  /* =========================

     STUDENT

  ========================= */



  const [

    student,

    setStudent,

  ] = useState(null);



  const [

    loading,

    setLoading,

  ] = useState(true);



  const [

    classes,

    setClasses,

  ] = useState([]);



  const [

    missions,

    setMissions,

  ] = useState([]);

  const [programResume, setProgramResume] = useState(null);





  /* =========================

     BADGE CATALOG

  ========================= */



  const badgeCatalog = [

    { id: "digitalExplorer", icon: "🚀", en: "Digital Explorer", ar: "مستكشف رقمي", he: "חוקר דיגיטלי" },

    { id: "bugHunter", icon: "🐞", en: "Bug Hunter", ar: "صياد الأخطاء", he: "צייד באגים" },

    { id: "patternHunter", icon: "🧩", en: "Pattern Hunter", ar: "صياد الأنماط", he: "צייד תבניות" },

    { id: "algorithmExplorer", icon: "🧠", en: "Algorithm Explorer", ar: "مستكشف الخوارزميات", he: "חוקר אלגוריתמים" },

  ];





  /* =========================

     LOAD STUDENT

  ========================= */



  useEffect(() => {

    const loadStudent =

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





          if (

            !snapshot.exists()

          ) {

            navigate(

              "/login"

            );



            return;

          }





          const data =

            snapshot.data();





          if (

            data.role !==

            "student"

          ) {

            navigate(

              data.role ===

                "teacher"

                ? "/teacher"

                : "/login"

            );



            return;

          }





          if (

            data.accountStatus ===

            "blocked"

          ) {

            await signOut(

              auth

            );



            navigate(

              "/login"

            );



            return;

          }





          setStudent(

            data

          );



          const membershipSnapshot = await getDocs(

            query(

              collection(db, "classMembers"),

              where("studentId", "==", user.uid),

              where("status", "==", "active")

            )

          );

          const classIds = membershipSnapshot.docs

            .map((membership) => membership.data().classId)

            .filter((classId) => typeof classId === "string" && classId);



          const classSnapshots = await Promise.all(

            classIds.map((classId) =>

              getDoc(doc(db, "classes", classId))

            )

          );



          setClasses(

            classSnapshots

              .filter((classSnapshot) => classSnapshot.exists())

              .map((classSnapshot) => ({

                id: classSnapshot.id,

                ...classSnapshot.data(),

              }))

          );



          /* =========================

             MISSION PATH

          ========================= */



          if (classIds.length) {

            const missionLessonSnapshots = await Promise.all(

              classIds.map((classId) => getDocs(

                query(

                  collection(db, "lessons"),

                  where("classId", "==", classId),

                  where("status", "==", "published"),

                  where("activityType", "==", "mission")

                )

              ))

            );

            const missionLessons = missionLessonSnapshots

              .flatMap((snapshot) => snapshot.docs)

              .map((lessonSnapshot) => ({ id: lessonSnapshot.id, ...lessonSnapshot.data() }))

              .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));



            const missionStates = await Promise.all(

              missionLessons.map(async (lesson) => {

                const [completionSnapshot, progressSnapshot] = await Promise.all([

                  getDoc(doc(db, "lessonCompletions", `${user.uid}\_${lesson.id}`)),

                  getDoc(doc(db, "lessonProgress", `${user.uid}\_${lesson.id}`)),

                ]);



                const progressDoc = progressSnapshot.exists() ? progressSnapshot.data() : null;

                const totalScreens = Array.isArray(lesson.sections) ? lesson.sections.length : 0;

                const passedScreens = progressDoc?.mission?.screens

                  ? Object.values(progressDoc.mission.screens).filter((screen) => screen?.passed).length

                  : 0;



                return {

                  id: lesson.id,

                  title: lesson.titleI18n || lesson.title || {},

                  summary: lesson.summaryI18n || lesson.summary || {},

                  xpReward: Number(lesson.xpReward || 0),

                  completed: completionSnapshot.exists(),

                  started: Boolean(progressDoc),

                  percent: totalScreens > 0 ? Math.round((passedScreens / totalScreens) * 100) : 0,

                  updatedAt: progressDoc?.updatedAt?.seconds || 0,

                };

              })

            );



            let previousCompleted = true;

            const missionsWithState = missionStates.map((mission) => {

              const status = mission.completed

                ? "completed"

                : previousCompleted

                  ? (mission.started ? "active" : "unlocked")

                  : "locked";

              previousCompleted = mission.completed;

              return { ...mission, status };

            });



            setMissions(missionsWithState);

          }

          /* =========================
             CANONICAL PROGRAM RESUME
             Reuses the same contentProgress system as ProgramLessonPlayer.
          ========================= */
          try {
            const publishedProgramsSnapshot = await getDocs(
              query(collection(db, "programs"), where("status", "==", "published"))
            );

            const publishedPrograms = publishedProgramsSnapshot.docs.map((programDoc) => ({
              id: programDoc.id,
              ...programDoc.data(),
            }));

            const accessResults = await Promise.all(
              publishedPrograms.map(async (program) => {
                if (normalizeProgram(program).accessType === "free") {
                  return { program, hasAccess: true };
                }

                try {
                  const hasAccess = await studentHasProgramAccess(
                    checkProgramAccess,
                    program.id
                  );
                  return { program, hasAccess: Boolean(hasAccess) };
                } catch (accessError) {
                  console.error(
                    "Dashboard program access check failed:",
                    program.id,
                    accessError
                  );
                  return { program, hasAccess: false };
                }
              })
            );

            const accessiblePrograms = accessResults
              .filter((item) => item.hasAccess)
              .map((item) => item.program);

            const progressGroups = await Promise.all(
              accessiblePrograms.map(async (program) => {
                try {
                  const records = await loadContentProgress(program.id);
                  return (Array.isArray(records) ? records : []).map((record) => ({
                    ...record,
                    programId: program.id,
                    programTitle: program.title,
                  }));
                } catch (progressError) {
                  console.error(
                    "Dashboard content progress load failed:",
                    program.id,
                    progressError
                  );
                  return [];
                }
              })
            );

            const timestampOf = (record) => {
              const value =
                record.updatedAt ??
                record.lastUpdatedAt ??
                record.savedAt ??
                record.createdAt ??
                0;

              if (typeof value === "number") return value;
              if (typeof value === "string") {
                const parsed = Date.parse(value);
                return Number.isNaN(parsed) ? 0 : parsed;
              }
              if (value?.seconds) return value.seconds * 1000;
              if (typeof value?.toMillis === "function") return value.toMillis();
              return 0;
            };

            const resumableRecords = progressGroups
              .flat()
              .filter((record) => record?.contentId && record.status !== "completed")
              .sort((a, b) => timestampOf(b) - timestampOf(a));

            setProgramResume(resumableRecords[0] || null);
          } catch (programResumeError) {
            console.error(
              "Dashboard Continue Learning error:",
              programResumeError
            );
            setProgramResume(null);
          }




        } catch (

          error

        ) {

          console.error(

            "Student dashboard error:",

            error

          );



        } finally {

          setLoading(

            false

          );

        }

      };





    loadStudent();



  }, [navigate]);





  /* =========================

     LOGOUT

  ========================= */



  const handleLogout =

    async () => {

      try {

        await signOut(

          auth

        );



        navigate(

          "/login"

        );



      } catch (

        error

      ) {

        console.error(

          "Student logout error:",

          error

        );

      }

    };



    const handleLeaveClass = async (classId) => {

      try {

        await httpsCallable(functions, "leaveClass")({ classId });

        setClasses((currentClasses) => currentClasses.filter((classData) => classData.id !== classId));

      } catch (error) {

        console.error("Leave class error:", error);

      }

    };





  /* =========================

     LOADING

  ========================= */



  if (loading) {

    return (

      <div

        className="student-loading"

        dir={

          isRTL

            ? "rtl"

            : "ltr"

        }

      >



        <div>

          🚀

        </div>



        <p>

          {text(

            "Loading your learning world...",



            "جارٍ تحميل عالمك التعليمي...",



            "טוען את עולם הלמידה שלך..."

          )}

        </p>



      </div>

    );

  }





  if (!student) {

    return null;

  }





  /* =========================

     XP + LEVEL

     Level is derived from xp directly (the stored `level` field is

     never incremented server-side), so the UI stays correct as xp grows.

  ========================= */



  const xp =

    Number(

      student.xp ||

      0

    );



  const level =

    Math.floor(xp / 500) + 1;



  const xpIntoLevel =

    xp % 500;



  const xpNeeded =

    500;





  const progress =

    Math.min(

      100,



      Math.round(

        (xpIntoLevel / xpNeeded) *

          100

      )

    );





  /* =========================

     MISSION / CONTINUE LEARNING

  ========================= */



  const currentMission =

    missions.find((mission) => mission.status === "active") ||

    missions.find((mission) => mission.status === "unlocked");



  const allMissionsCompleted =

    missions.length > 0 && missions.every((mission) => mission.completed);



  const localized = (value) => {

    if (!value) return "";

    if (typeof value === "string") return value;

    return value[language] || value.en || value.ar || "";

  };





  /* =========================

     PAGE

  ========================= */



  return (

    <div

      className="student-dashboard"

      dir={

        isRTL

          ? "rtl"

          : "ltr"

      }

    >



      {/* =====================

          TOPBAR

      ====================== */}



      <header className="student-topbar">



        {/* BRAND */}



        <div className="student-brand">



          <div>

            🚀

          </div>



          <h2>

            TechMinds

          </h2>



        </div>





        {/* ACTIONS */}



        <div className="student-top-actions">



          {/* LANGUAGE */}



          <div className="student-language">



            <button

              type="button"



              className={

                language ===

                "en"

                  ? "active"

                  : ""

              }



              onClick={() =>

                changeLanguage(

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

                changeLanguage(

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

                changeLanguage(

                  "he"

                )

              }

            >

              עברית

            </button>



          </div>





          {/* LOGOUT */}

          <ProfileLink />



          <button

            type="button"

            className="student-logout"

            onClick={

              handleLogout

            }

          >

            🚪{" "}



            {text(

              "Logout",



              "تسجيل الخروج",



              "התנתקות"

            )}

          </button>



        </div>



      </header>





      {/* =====================

          HERO

      ====================== */}



      <section className="student-hero">



        <div className="student-hero-text">



          <span className="student-hello">

            👋{" "}

            {text("Welcome back", "أهلًا بعودتك", "ברוכים השבים")}

          </span>



          <h1>

            {text("Hi", "أهلًا", "שלום")}{" "}

            {student.name || text("Student", "طالب", "תלמיד")} 👋

          </h1>



          <p>

            {text(

              "Every mission you finish makes you a stronger thinker.",

              "كل مهمة تنهيها تجعلك مفكرًا أقوى.",

              "כל משימה שתשלימו הופכת אתכם לחושבים חזקים יותר."

            )}

          </p>



          <div className="hero-meta-row">

            <span className="hero-chip">⭐ {text("Level", "المستوى", "רמה")} {level}</span>

            <span className="hero-chip">⚡ {xp} XP</span>

          </div>



          <div className="student-progress-bar hero-progress-bar">

            <div style={{ width: `${progress}%` }} />

          </div>



          <small className="hero-progress-label">

            {xpIntoLevel} / {xpNeeded} XP {text("to level", "لبلوغ المستوى", "לרמה")} {level + 1}

          </small>



        </div>



        <div className="student-avatar-large">

          🧑‍🚀

        </div>



      </section>





      {/* =====================

          PROGRAMS MARKETPLACE

      ====================== */}



      <section className="marketplace-feature-card">

        <div className="marketplace-feature-content">

          <span className="marketplace-feature-badge">

            ✨ {text("PROGRAMS MARKETPLACE", "سوق البرامج", "שוק התוכניות")}

          </span>



          <h2>

            {text(

              "Discover New Programs",

              "اكتشف برامج جديدة",

              "גלו תוכניות חדשות"

            )}

          </h2>



          <p>

            {text(

              "Explore and purchase interactive programs that make learning more exciting.",

              "استكشف واشترِ برامج تفاعلية تجعل التعلّم أكثر تشويقًا.",

              "גלו ורכשו תוכניות אינטראקטיביות שהופכות את הלמידה למלהיבה יותר."

            )}

          </p>



          <button

            type="button"

            className="marketplace-feature-button"

            onClick={() => navigate("/student/programs")}

          >

            {text(

              "Explore Programs",

              "استكشف البرامج",

              "גלו תוכניות"

            )}

          </button>

        </div>



        <div className="marketplace-feature-visual" aria-hidden="true">

          <span>🚀</span>

        </div>

      </section>





      {/* =====================

          MISSION CTA

      ====================== */}



      <section className="mission-cta-card">



        {currentMission ? (

          <>

            <div className="mission-cta-badge">

              🚀 {text("YOUR CURRENT MISSION", "مهمتك الحالية", "המשימה הנוכחית שלך")}

            </div>



            <h2>{localized(currentMission.title)}</h2>



            {localized(currentMission.summary) && (

              <p className="mission-cta-teaser">{localized(currentMission.summary)}</p>

            )}



            <div className="mission-cta-progress">

              <div className="student-progress-bar">

                <div style={{ width: `${currentMission.percent}%` }} />

              </div>

              <strong>{currentMission.percent}%</strong>

            </div>



            <button

              type="button"

              className="mission-cta-button"

              onClick={() => navigate(`/student/lessons/${currentMission.id}`)}

            >

              {text("Continue Mission 🚀", "تابع المهمة 🚀", "המשך במשימה 🚀")}

            </button>

          </>

        ) : allMissionsCompleted ? (

          <>

            <div className="mission-cta-badge">🏆 {text("ALL MISSIONS COMPLETE", "أكملت جميع المهمات", "כל המשימות הושלמו")}</div>

            <h2>{text("You finished every mission!", "أنجزت كل المهمات!", "השלמתם את כל המשימות!")}</h2>

            <button type="button" className="mission-cta-button" onClick={() => navigate("/student/lessons")}>

              {text("Explore More Lessons 📚", "استكشف دروسًا أخرى 📚", "גלו עוד שיעורים 📚")}

            </button>

          </>

        ) : (

          <>

            <div className="mission-cta-badge">🚀 {text("YOUR FIRST MISSION", "مهمتك الأولى", "המשימה הראשונה שלך")}</div>

            <h2>{text("Start your first mission", "ابدأ مهمتك الأولى", "התחילו את המשימה הראשונה שלכם")}</h2>

            <p className="mission-cta-teaser">

              {text(

                "Missions appear here as soon as your teacher publishes them.",

                "تظهر المهمات هنا فور نشرها من معلمك.",

                "המשימות יופיעו כאן ברגע שהמורה שלכם יפרסם אותן."

              )}

            </p>

            <button type="button" className="mission-cta-button" onClick={() => navigate("/student/lessons")}>

              {text("Open Lessons 📚", "فتح الدروس 📚", "פתיחת שיעורים 📚")}

            </button>

          </>

        )}



      </section>





      {/* =====================

          QUICK PROGRESS CARDS

      ====================== */}



      <section className="quick-cards">



        <div className="quick-card purple">

          <span>⭐</span>

          <small>{text("Level", "المستوى", "רמה")}</small>

          <strong>{level}</strong>

        </div>



        <div className="quick-card blue">

          <span>⚡</span>

          <small>XP</small>

          <strong>{xp}</strong>

        </div>



        <div className="quick-card green">

          <span>🧠</span>

          <small>{text("Missions", "المهمات المنجزة", "משימות")}</small>

          <strong>{missions.filter((mission) => mission.completed).length}/{missions.length || "—"}</strong>

        </div>



      </section>





      {/* =====================

          MAIN GRID

      ====================== */}



      <section className="student-main-grid">



        <div className="student-main-col">



          {/* MISSION PATH */}



          <div className="student-panel mission-path-panel">



            <h3>🗺️ {text("Mission Path", "مسار المهمات", "מסלול המשימות")}</h3>



            {missions.length === 0 ? (

              <p className="mission-path-empty">

                {text(

                  "No missions have been published in your class yet.",

                  "لم تُنشر أي مهمات في صفك بعد.",

                  "טרם פורסמו משימות בכיתה שלכם."

                )}

              </p>

            ) : (

              <div className="mission-path">

                {missions.map((mission, index) => (

                  <div key={mission.id} className="mission-path-item">

                    <div className={`mission-path-step ${mission.status}`}>

                      <span className="mission-path-icon">

                        {mission.status === "completed" && "✅"}

                        {mission.status === "active" && "🚀"}

                        {mission.status === "unlocked" && "🔓"}

                        {mission.status === "locked" && "🔒"}

                      </span>

                      <span className="mission-path-label">

                        <strong>{text(`Mission ${String(index + 1).padStart(2, "0")}`, `المهمة ${index + 1}`, `משימה ${index + 1}`)}</strong>

                        <em>{localized(mission.title)}</em>

                      </span>

                    </div>

                    {index < missions.length - 1 && <div className="mission-path-connector" />}

                  </div>

                ))}

              </div>

            )}



          </div>





          {/* CONTINUE LEARNING — canonical program/content progress */}

          <div className="student-panel continue-learning-panel">
            <div className="continue-learning-badge">
              🔥 {text("CONTINUE WHERE YOU LEFT OFF", "استمر من حيث توقفت", "המשיכו מהמקום שבו הפסקתם")}
            </div>

            {programResume ? (
              <>
                <div className="continue-learning-icon">🚀</div>
                <h2>
                  {localized(programResume.programTitle) ||
                    text("Your program", "برنامجك", "התוכנית שלך")}
                </h2>

                <p>
                  {text("Section", "القسم", "חלק")}{" "}
                  {Number(programResume.lastSectionIndex || 0) + 1}
                  {" · "}
                  {Number(programResume.progressPercent || 0)}%
                </p>

                <div className="student-progress-bar">
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, Number(programResume.progressPercent || 0))
                      )}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() =>
                    navigate(
                      `/programs/${encodeURIComponent(programResume.programId)}/lessons/${encodeURIComponent(programResume.contentId)}`
                    )
                  }
                >
                  {text("Resume 🚀", "استئناف 🚀", "המשך 🚀")}
                </button>
              </>
            ) : currentMission ? (
              <>
                <div className="continue-learning-icon">🧠</div>
                <h2>{localized(currentMission.title)}</h2>
                <p>
                  {currentMission.percent}% {text("complete", "مكتمل", "הושלם")}
                </p>
                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() => navigate(`/student/lessons/${currentMission.id}`)}
                >
                  {text("Continue Mission 🚀", "تابع المهمة 🚀", "המשך במשימה 🚀")}
                </button>
              </>
            ) : (
              <>
                <div className="continue-learning-icon">📚</div>
                <h2>
                  {text("Ready for something new?", "جاهز لشيء جديد؟", "מוכנים למשהו חדש?")}
                </h2>
                <p>
                  {text(
                    "Browse your programs to start learning.",
                    "تصفح برامجك وابدأ التعلّم.",
                    "עיינו בתוכניות שלכם והתחילו ללמוד."
                  )}
                </p>
                <button
                  type="button"
                  className="continue-learning-button"
                  onClick={() => navigate("/student/programs")}
                >
                  {text("Explore Programs 📚", "استكشف البرامج 📚", "גלו תוכניות 📚")}
                </button>
              </>
            )}

            <div className="secondary-links">
              <button type="button" onClick={() => navigate("/student/programs")}>
                🛒 {text("Program Catalog", "كتالوج البرامج", "קטלוג תוכניות")}
              </button>
              <button type="button" onClick={() => navigate("/student/lessons")}>
                📚 {text("Lessons", "الدروس", "שיעורים")}
              </button>
              <button type="button" onClick={() => navigate("/student/portfolio")}>
                📁 {text("My Work", "أعمالي", "העבודות שלי")}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(classes.length > 0 ? "/student/lessons" : "/student/join-class")
                }
              >
                🏫 {text("My Class", "صفي", "הכיתה שלי")}
              </button>
            </div>
          </div>

        </div>


        <div className="student-main-col">



          {/* BADGES */}



          <div className="student-panel badges-panel">



            <h3>🏆 {text("Badges", "الشارات", "תגים")}</h3>



            <div className="badge-cards">

              {badgeCatalog.map((badge) => {

                const unlocked = Array.isArray(student.badges) && student.badges.includes(badge.id);

                return (

                  <div key={badge.id} className={`badge-card ${unlocked ? "unlocked" : "locked"}`}>

                    <span className="badge-card-icon">{badge.icon}</span>

                    <small>{text(badge.en, badge.ar, badge.he)}</small>

                    {!unlocked && <span className="badge-card-lock">🔒</span>}

                  </div>

                );

              })}

            </div>



          </div>





          {/* CLASS */}



          <div className="student-panel class-panel compact">



            <span>

              🏫{" "}

              {text("My Class", "صفي", "הכיתה שלי")}

            </span>



            {classes.length > 0 || student.classCode ? (

              <>

                <h2>

                  {text(

                    `${classes.length || 1} active class${classes.length === 1 ? "" : "es"}`,

                    `${classes.length || 1} صفوف نشطة`,

                    `${classes.length || 1} כיתות פעילות`

                  )}

                </h2>



                <div className="student-class-list">

                  {classes.map((classData) => (

                    <div key={classData.id} className="student-class-list-item">

                      <strong>{classData.name}</strong>

                      <span>{classData.teacherName || text("Teacher", "المعلّم", "מורה")}</span>

                      <button type="button" onClick={() => handleLeaveClass(classData.id)}>

                        {text("Leave", "مغادرة", "עזיבה")}

                      </button>

                    </div>

                  ))}

                  {classes.length === 0 && <span>{student.className || student.classCode}</span>}

                </div>

              </>

            ) : (

              <>

                <h2>{text("No class yet", "لست في صف بعد", "עדיין אינכם בכיתה")}</h2>



                <p>

                  {text(

                    "Join your teacher's class using a class code.",

                    "انضم إلى صف المعلّم باستخدام رمز الصف.",

                    "הצטרפו לכיתה של המורה באמצעות קוד כיתה."

                  )}

                </p>



                <button

                  type="button"

                  className="join-class-dashboard-button"

                  onClick={() => navigate("/student/join-class")}

                >

                  🏫 {text("Join a Class", "الانضمام إلى صف", "הצטרפות לכיתה")}

                </button>

              </>

            )}



          </div>



        </div>



      </section>



    </div>

  );

}





export default StudentDashboard;
