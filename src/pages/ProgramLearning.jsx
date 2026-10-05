import { useProgramProgress } from '../progress/useProgramProgress';
import ProgramContinueCard from '../progress/ProgramContinueCard';
import ProgressNotice from '../progress/ProgressNotice';
import { contentPresentation, programContentType } from '../../functions/programContent.mjs';
import { subscribeProgramContent } from '../access/programAccessClient';
import './ProgramAccess.css';
import {
  useEffect,
  useMemo,
  useState,
} from "react";



import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./ProgramLearning.css";




function ProgramLearning() {
  const navigate =
    useNavigate();


  const {
    programId,
  } = useParams();


  const {
    language,
    setLanguage,
    t: translations,
  } = useLanguage();


  const [
    program,
    setProgram,
  ] = useState(null);


  const [
    lessons,
    setLessons,
  ] = useState([]);


  const [
    access,
    setAccess,
  ] = useState(null);


  const [
    role,
    setRole,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedLessonId,
    setSelectedLessonId,
  ] = useState("");

  const upgradeRequired = false;
  const savedProgress = useProgramProgress(programId, role === 'student');
  const progressById = new Map(savedProgress.records.map(record => [record.contentId, record]));
  const lastProgress = [...savedProgress.records]
    .filter(record => record.status !== 'not_started' && lessons.some(item => item.id === record.contentId))
    .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0))[0];



  /* =====================================================
     TRANSLATION
  ===================================================== */

  const text =
    (
      english,
        arabic,
        hebrew = english
    ) =>
      language ===
      "ar"
        ? arabic
          : language === "he"
            ? hebrew
            : english;


  const localized =
    (
      value
    ) => {
      if (
        !value
      ) {
        return "";
      }


      if (
        typeof value ===
        "string"
      ) {
        return value;
      }


      return (
        value[
          language
        ] ||
        value.en ||
        value.ar ||
        ""
      );
    };


  /* =====================================================
     LOAD SECURE PROGRAM
  ===================================================== */

  useEffect(() => {
    setLoading(true); setError('');
    return subscribeProgramContent(programId, data => {
      setProgram(data.program); setLessons(data.lessons || []); setAccess(data.access);
      setRole(data.role || ''); setLoading(false); setError('');
      setSelectedLessonId(current => data.lessons?.some(lesson => lesson.id === current) ? current : data.lessons?.[0]?.id || '');
    }, failure => {
      console.error('Program access load failed', failure.code, failure.message);
      setProgram(null); setLessons([]); setLoading(false);
      setError(text('Could not load the program. Please try again.', 'تعذر تحميل البرنامج. حاول مجددًا.', 'לא ניתן לטעון את התוכנית. נסו שוב.'));
    });
  }, [programId, language]);


  /* =====================================================
     CURRENT LESSON
  ===================================================== */

  const presentation = contentPresentation(lessons);
  const selectedMission = programContentType(lessons.find(item => item.id === selectedLessonId)) === 'mission';
  const selectedLesson =
    useMemo(
      () =>
        lessons.find(
          (
            lesson
          ) =>
            lesson.id ===
            selectedLessonId
        ) ||
        null,

      [
        lessons,
        selectedLessonId,
      ]
    );


  /* =====================================================
     LESSON HELPERS
  ===================================================== */

  const getLessonTitle =
    (
      lesson
    ) =>
      localized(
        lesson
          ?.titleI18n
      ) ||
      localized(
        lesson
          ?.title
      ) ||
      lesson?.name ||
      text(
        "Lesson",
        "درس",
        "שיעור"
      );


  const getLessonDescription =
    (
      lesson
    ) =>
      localized(
        lesson
          ?.descriptionI18n
      ) ||
      localized(
        lesson
          ?.description
      ) ||
      localized(
        lesson
          ?.summary
      ) ||
      "";


  const getLessonIcon =
    (
      lesson
    ) => {
      if (
        lesson?.icon
      ) {
        return lesson.icon;
      }


      switch (
        lesson
          ?.activityType
      ) {
        case "coding":
          return "💻";

        case "ai":
          return "🤖";

        case "quiz":
          return "🧩";

        case "cyber":
          return "🔐";

        default:
          return "📚";
      }
    };


  const getSectionIcon =
    (
      type
    ) => {
      switch (
        type
      ) {
        case "question":
          return "❓";

        case "multipleChoice":
          return "🧩";

        case "task":
          return "🛠️";

        case "challenge":
          return "🔥";

        case "summary":
          return "📝";

        case "reflection":
          return "💭";

        default:
          return "📚";
      }
    };


  /* =====================================================
     BACK
  ===================================================== */

  const goBack =
    () => {
      if (
        role ===
        "teacher"
      ) {
        navigate(
          "/teacher/programs"
        );

        return;
      }


      if (
        role ===
        "student"
      ) {
        navigate(
          "/student/programs"
        );

        return;
      }


      if (
        role ===
        "owner"
      ) {
        navigate(
          "/owner/programs"
        );

        return;
      }


      navigate(
        "/programs"
      );
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div className="program-learning-loading">

        <div>
          🚀
        </div>


        <p>
          {text(
            "Opening your program...",
            "جارٍ فتح البرنامج...",
            "התוכנית נפתחת..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     ACCESS DENIED
  ===================================================== */

  if (
    error ||
    !program
  ) {
    return (
      <div className="program-learning-denied">

        <div className="program-denied-card">

          <div className="program-denied-icon">
            🔒
          </div>


          <h1>
            {text(
              "Program unavailable",
              "البرنامج غير متاح",
              "התוכנית אינה זמינה"
            )}
          </h1>


          <p>
            {error ||
              text(
                "You do not currently have access to this program.",
                "لا يوجد لديك وصول إلى هذا البرنامج حاليًا.",
                "אין לך כרגע גישה לתוכנית הזו."
              )}
          </p>


          <button
            type="button"
            onClick={
              goBack
            }
          >
            {text(
              "Back to Programs",
              "العودة إلى البرامج",
              "חזרה לתוכניות"
            )}
          </button>

          {(!access || upgradeRequired) && (
            <button
              type="button"
              onClick={() => navigate("/programs")}
            >
              {text(
                "Buy Program",
                "شراء البرنامج",
                "רכישת תוכנית"
              )}
            </button>
          )}

        </div>

      </div>
    );
  }


  /* =====================================================
     PROGRAM DATA
  ===================================================== */

  const programTitle =
    localized(
      program.title
    ) ||
    text(
      "Learning Program",
      "برنامج تعليمي",
      "תוכנית למידה"
    );


  const programDescription =
    localized(
      program.description
    );


  const finalProject =
    localized(
      program.finalProject
    );


  const selectedSections =
    Array.isArray(
      selectedLesson
        ?.sections
    )
      ? selectedLesson.sections
      : [];


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="program-learning-page" dir={language === "en" ? "ltr" : "rtl"}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="program-learning-header">

        <div className="program-learning-header-left">

          <button
            type="button"
            className="program-learning-back"
            onClick={
              goBack
            }
          >
            {language ===
            "ar"
              ? "→"
              : "←"}

            {" "}

            {text(
              "Programs",
              "البرامج",
              "תוכניות"
            )}
          </button>


          <div className="program-learning-brand">

            <div className="program-learning-brand-icon">
              🚀
            </div>


            <div>

              <strong>
                TechMinds
              </strong>


              <span>
                {text(
                  "Learning Program",
                  "برنامج تعليمي",
                  "תוכנית למידה"
                )}
              </span>

            </div>

          </div>

        </div>


        <div className="program-learning-actions">

          <div className="program-learning-language">

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


          <div className="program-access-badge">

            ✅

            <span>

              {!access ? text('Preview access', 'وصول للمعاينة', 'גישת התנסות')
                : role === 'owner' ? text('Owner access', 'وصول المالك', 'גישת בעלים')
                  : access.classId ? text('Class access', 'وصول الصف', 'גישה כיתתית')
                    : access.accessScope === 'selected' ? text('Selected lessons', 'دروس محددة', 'שיעורים נבחרים')
                    : text('Full access', 'وصول كامل', 'גישה מלאה')}

            </span>

          </div>

        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="program-learning-hero">

        <div className="program-learning-hero-icon">

          {program.icon ||
            "🚀"}

        </div>


        <div className="program-learning-hero-content">

          <small>
            TechMinds PROGRAM
          </small>


          <h1>
            {programTitle}
          </h1>


          <p>

            {programDescription ||
              text(
                "An interactive TechMinds learning journey.",
                "رحلة تعليمية تفاعلية من TechMinds.",
                "מסע למידה אינטראקטיבי של TechMinds."
              )}

          </p>


          <div className="program-learning-meta">

            <span>
              📚{" "}
              {presentation.lessonNumbers.size}{" "}

              {text(
                "Lessons",
                "دروس",
                "שיעורים"
              )} • {lessons.filter(item => programContentType(item) === 'mission').length} {text('Missions', 'مهمات', 'משימות')}
            </span>

            {program.level && (
              <span>
                🎯{" "}

                {localized(
                  program.level
                ) ||
                  program.level}
              </span>
            )}


            {program.ageFrom && (
              <span>
                👦{" "}

                {program.ageFrom}
                -
                {program.ageTo ||
                  program.ageFrom}
              </span>
            )}


            {program.category && (
              <span>
                💡{" "}

                {localized(
                  program.category
                ) ||
                  program.category}
              </span>
            )}

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENT
      ================================================= */}

      {!access && program.accessType === 'paid' && <div className="access-preview-notice"><button onClick={() => navigate(`/programs/${programId}/access`)}>{text('Unlock the full program · Request access', 'افتح البرنامج كاملًا · طلب الوصول', 'פתחו את התוכנית המלאה · בקשת גישה')}</button></div>}
      {role === 'student' && <ProgressNotice progress={savedProgress} />}
      {role === 'student' && lastProgress && <ProgramContinueCard programId={programId} record={lastProgress}
        title={getLessonTitle(lessons.find(item => item.id === lastProgress.contentId))} />}
      <section className="program-learning-layout">

        {/* =================================================
            LESSONS SIDEBAR
        ================================================= */}

        <aside className="program-lessons-sidebar">

          <div className="program-lessons-sidebar-header">

            <small>
              {text(
                "PROGRAM CONTENT",
                "محتوى البرنامج",
                "תוכן התוכנית"
              )}
            </small>


            <h2>
              {text(
                "Program content",
                "محتوى البرنامج",
                "תוכן התוכנית"
              )}
            </h2>


            <p>
              {text(
                "Choose a lesson to view its content.",
                "اختر درسًا لعرض محتواه.",
                "בחרו שיעור כדי לצפות בתוכן שלו."
              )}
            </p>

          </div>


          {lessons.length ===
          0 ? (

            <div className="program-no-lessons">

              <div>
                📚
              </div>


              <strong>
                {text(
                  "No published lessons yet",
                  "لا توجد دروس منشورة بعد",
                  "עדיין אין שיעורים שפורסמו"
                )}
              </strong>

            </div>

          ) : (

            <div className="program-lessons-list">

              {lessons.map(
                (
                  lesson,
                  index
                ) => {
                  const active =
                    lesson.id ===
                    selectedLessonId;


                  const sections =
                    Array.isArray(
                      lesson.sections
                    )
                      ? lesson.sections
                      : [];


                  return (
                    <button
                      key={
                        lesson.id
                      }
                      type="button"
                      className={
                        active
                          ? "program-lesson-item active"
                          : "program-lesson-item"
                      }
                      style={{
                        "--lesson-theme":
                          lesson.themeColor ||
                          "#7c3aed",
                        "--lesson-accent":
                          lesson.accentColor ||
                          "#4f46e5",
                        "--lesson-surface":
                          lesson.surfaceColor ||
                          "#f5f3ff",
                      }}
                      onClick={() => lesson.locked ? navigate(`/programs/${programId}/access`) : setSelectedLessonId(lesson.id)}
                    >

                      {lesson.preview && <span className="access-badge">{text('Free preview', 'معاينة مجانية', 'התנסות חינם')}</span>}
                      <div className={`program-lesson-number ${
                        lesson.coverImage
                          ? "has-cover"
                          : ""
                      }`}>
                        {lesson.coverImage && (
                          <img
                            loading="lazy" decoding="async"
                            src={lesson.coverImage}
                            alt={localized(
                              lesson.imageAlt
                            )}
                          />
                        )}

                        <span>
                          {lesson.locked ? '🔒' : presentation.lessonNumbers.get(lesson.id) || '🎯'}
                        </span>
                      </div>


                      <div className="program-lesson-item-info">
                        {role === 'student' && savedProgress.ready && !savedProgress.error && <small className="program-content-status">{translations.progress[progressById.get(lesson.id)?.status || 'not_started']}</small>}

                        <strong>
                          {programContentType(lesson) === 'mission' && <small>{text('Mission', 'مهمة', 'משימה')} · </small>}{getLessonTitle(
                            lesson
                          )}
                        </strong>


                        <span>

                          {getLessonIcon(
                            lesson
                          )}

                          {" "}

                          {sections.length}{" "}

                          {text(
                            "slides",
                            "شرائح",
                            "שקופיות"
                          )}

                        </span>

                      </div>


                      <div className="program-lesson-arrow">

                        {language ===
                        "ar"
                          ? "←"
                          : "→"}

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          )}


          {finalProject && (
            <div className="program-final-project-card">

              <small>
                🏆{" "}

                {text(
                  "FINAL PROJECT",
                  "المشروع النهائي",
                  "פרויקט גמר"
                )}
              </small>


              <p>
                {finalProject}
              </p>

            </div>
          )}

        </aside>


        {/* =================================================
            CURRENT LESSON
        ================================================= */}

        <main className="program-lesson-view">

          {selectedLesson?.locked ? <div className="program-select-lesson"><h2>🔒 {getLessonTitle(selectedLesson)}</h2><button className="program-start-lesson" onClick={() => navigate(`/programs/${programId}/access`)}>{text('Request access', 'طلب الوصول', 'בקשת גישה')}</button></div> : !selectedLesson ? (

            <div className="program-select-lesson">
              <div>
                🚀
              </div>


              <h2>
                {text(
                  "Choose your first lesson",
                  "اختر الدرس الأول",
                  "בחרו את השיעור הראשון"
                )}
              </h2>


              <p>
                {text(
                  "Your program lessons will appear here.",
                  "سيظهر محتوى الدرس هنا.",
                  "שיעורי התוכנית יופיעו כאן."
                )}
              </p>

            </div>

          ) : (

            <>

              <button
                type="button"
                className="program-start-lesson"
                onClick={() => navigate(`/programs/${programId}/lessons/${selectedLesson.id}`)}
              >
                ▶️ {selectedMission ? text('Start Mission', 'ابدأ المهمة', 'התחלת משימה') : text('Start Lesson', 'ابدأ الدرس', 'התחלת שיעור')}
              </button>
              <div
                className="program-current-lesson"
                style={{
                  "--lesson-theme":
                    selectedLesson.themeColor ||
                    "#7c3aed",
                  "--lesson-accent":
                    selectedLesson.accentColor ||
                    "#4f46e5",
                  "--lesson-surface":
                    selectedLesson.surfaceColor ||
                    "#f5f3ff",
                }}
              >

                <div className={`program-current-lesson-icon ${
                  selectedLesson.coverImage
                    ? "has-cover"
                    : ""
                }`}>

                  {selectedLesson.coverImage ? (
                    <img
                      src={selectedLesson.coverImage}
                      alt={localized(
                        selectedLesson.imageAlt
                      )}
                    />
                  ) : getLessonIcon(
                      selectedLesson
                    )}

                </div>


                <div>

                  <small>
                    {selectedMission ? text("MISSION", "مهمة", "משימה") : text(
                      "CURRENT LESSON",
                      "الدرس الحالي",
                      "השיעור הנוכחי"
                    )}
                  </small>


                  <h2>
                    {getLessonTitle(
                      selectedLesson
                    )}
                  </h2>


                  {getLessonDescription(
                    selectedLesson
                  ) && (

                    <p>
                      {getLessonDescription(
                        selectedLesson
                      )}
                    </p>

                  )}


                  <div className="program-current-lesson-meta">

                    <span>
                      📑{" "}

                      {selectedSections.length}{" "}

                      {text(
                        "slides",
                        "شرائح",
                        "שקופיות"
                      )}
                    </span>


                    {selectedLesson
                      .estimatedMinutes && (

                      <span>
                        ⏱{" "}

                        {
                          selectedLesson
                            .estimatedMinutes
                        }{" "}

                        {text(
                          "min",
                          "دقيقة",
                          "דקות"
                        )}
                      </span>

                    )}

                  </div>

                </div>

              </div>


              {/* =============================================
                  SLIDES
              ============================================= */}

              {selectedSections.length ===
              0 ? (

                <div className="program-empty-lesson">

                  <div>
                    📝
                  </div>


                  <h3>
                    {text(
                      "This lesson has no content yet.",
                        "لا يوجد محتوى في هذا الدرس بعد.",
                        "עדיין אין תוכן בשיעור הזה."
                    )}
                  </h3>

                </div>

              ) : (

                <div className="program-sections-preview">

                  {selectedSections.map(
                    (
                      section,
                      index
                    ) => {
                      const sectionTitle =
                        localized(
                          section.title
                        ) ||
                        localized(
                          section.heading
                        ) ||
                        text(
                          `Slide ${
                            index +
                            1
                          }`,
                          `الشريحة ${
                            index +
                            1
                          }`,
                          `שקופית ${
                            index +
                            1
                          }`
                        );


                      const sectionContent =
                        localized(
                          section.content
                        ) ||
                        localized(
                          section.text
                        ) ||
                        localized(
                          section.description
                        ) ||
                        localized(
                          section.question
                        ) ||
                        "";


                      return (
                        <article
                          key={
                            section.id ||
                            `${selectedLesson.id}-${index}`
                          }
                          className="program-section-card"
                        >

                          <span className="program-section-index">

                            {index +
                              1}

                          </span>


                          <div className="program-section-icon">

                            {getSectionIcon(
                              section.type
                            )}

                          </div>


                          <div className="program-section-content">

                            <small>
                              {section.type ||
                                text(
                                  "content",
                                  "محتوى",
                                  "תוכן"
                                )}
                            </small>


                            <h3>
                              {sectionTitle}
                            </h3>


                            {sectionContent && (

                              <p>
                                {sectionContent}
                              </p>

                            )}


                            {Array.isArray(
                              section.options
                            ) &&
                              section.options
                                .length >
                                0 && (

                              <div className="program-preview-options">

                                {section.options.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (

                                    <div
                                      key={
                                        `${section.id || index}-${optionIndex}`
                                      }
                                    >

                                      <span>
                                        {String.fromCharCode(
                                          65 +
                                          optionIndex
                                        )}
                                      </span>


                                      {localized(
                                        option
                                      ) ||
                                        String(
                                          option
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

                </div>

              )}


              {/* =============================================
                  NEXT STEP
              ============================================= */}

              <div className="program-player-coming">

                <div>

                  <small>
                    {text(
                      "INTERACTIVE MODE",
                      "الوضع التفاعلي",
                      "מצב אינטראקטיבי"
                    )}
                  </small>


                  <h3>
                    ▶️{" "}

                    {text(
                      "Lesson Player",
                      "مشغّل الدرس",
                      "נגן השיעור"
                    )}
                  </h3>


                  <p>
                    {text(
                      "The next step is connecting these slides to lesson progress, answers, challenges and completion.",
                      "الخطوة التالية هي ربط هذه الشرائح بالتقدم والإجابات والتحديات وإكمال الدرس.",
                      "השלב הבא הוא לחבר את השקופיות להתקדמות, לתשובות, לאתגרים ולהשלמת השיעור."
                    )}
                  </p>

                </div>

              </div>

            </>

          )}

        </main>

      </section>

    </div>
  );
}


export default ProgramLearning;
