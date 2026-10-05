import { useContentProgress } from '../../progress/useContentProgress';



import ProgressNotice from '../../progress/ProgressNotice';



import { useEffect, useMemo, useRef, useState } from 'react';



import { db } from '../../firebase/firebase';



import { useLanguage } from '../../context/LanguageContext';



import {



  checkAnswer,



  DIRECTIONS,



  mergeProgress,



  missionReady,



  newProgress,



  runRobot,



  updateScreen,



  validateMission,



} from './missionEngine';



import * as missionRepository from './missionRepository';



import './MissionPlayer.css';







const skillNames = {



  algorithmicThinking: {



    en: 'Algorithmic thinking',



    ar: 'التفكير الخوارزمي',



    he: 'חשיבה אלגוריתמית',



  },



  binaryThinking: {



    en: 'Binary thinking',



    ar: 'التفكير بالنظام الثنائي',



    he: 'חשיבה בבסיס בינארי',



  },



  cipher: {



    en: 'Ciphers',



    ar: 'الشفرات',



    he: 'צפנים',



  },



  cpu: {



    en: 'Central processing unit (CPU)',



    ar: 'وحدة المعالجة المركزية (CPU)',



    he: 'יחידת העיבוד המרכזית (CPU)',



  },



  cyberAwareness: {



    en: 'Cybersecurity awareness',



    ar: 'الوعي بالأمن السيبراني',



    he: 'מודעות לאבטחת סייבר',



  },



  dataRepresentation: {



    en: 'Data representation',



    ar: 'تمثيل البيانات',



    he: 'ייצוג נתונים',



  },



  decoding: {



    en: 'Decoding',



    ar: 'فك الترميز',



    he: 'פענוח קידוד',



  },



  diagnosis: {



    en: 'Diagnosing problems',



    ar: 'تشخيص المشكلات',



    he: 'אבחון תקלות',



  },



  encoding: {



    en: 'Encoding',



    ar: 'الترميز',



    he: 'קידוד',



  },



  inputOutput: {



    en: 'Input and output',



    ar: 'الإدخال والإخراج',



    he: 'קלט ופלט',



  },



  internetWeb: {



    en: 'The Internet and the Web',



    ar: 'الإنترنت والويب',



    he: 'האינטרנט והווב',



  },



  networkThinking: {



    en: 'Understanding networks',



    ar: 'فهم الشبكات',



    he: 'הבנת רשתות',



  },



  packets: {



    en: 'Data packets',



    ar: 'حزم البيانات',



    he: 'חבילות נתונים',



  },



  passwordSafety: {



    en: 'Password safety',



    ar: 'أمان كلمات المرور',



    he: 'אבטחת סיסמאות',



  },



  patternRecognition: {



    en: 'Pattern recognition',



    ar: 'التعرف على الأنماط',



    he: 'זיהוי דפוסים',



  },



  phishingAwareness: {



    en: 'Phishing awareness',



    ar: 'الوعي بالتصيد الاحتيالي',



    he: 'מודעות לדיוג',



  },



  privacy: {



    en: 'Privacy',



    ar: 'الخصوصية',



    he: 'פרטיות',



  },



  problemSolving: {



    en: 'Problem solving',



    ar: 'حل المشكلات',



    he: 'פתרון בעיות',



  },



  ram: {



    en: 'Random access memory (RAM)',



    ar: 'ذاكرة الوصول العشوائي (RAM)',



    he: 'זיכרון גישה אקראית (RAM)',



  },



  routers: {



    en: 'Routers',



    ar: 'أجهزة التوجيه',



    he: 'נתבים',



  },



  routing: {



    en: 'Routing',



    ar: 'توجيه البيانات',



    he: 'ניתוב נתונים',



  },



  safeBrowsing: {



    en: 'Safe browsing',



    ar: 'التصفح الآمن',



    he: 'גלישה בטוחה',



  },



  storage: {



    en: 'Data storage',



    ar: 'تخزين البيانات',



    he: 'אחסון נתונים',



  },



  logicalThinking: {



    en: 'Logical thinking',



    ar: 'التفكير المنطقي',



    he: 'חשיבה לוגית',



  },



  sequencing: {



    en: 'Sequencing',



    ar: 'ترتيب الخطوات',



    he: 'סידור שלבים',



  },



  planning: {



    en: 'Planning',



    ar: 'التخطيط',



    he: 'תכנון',



  },



  debugging: {



    en: 'Debugging',



    ar: 'تصحيح الأخطاء',



    he: 'איתור ותיקון שגיאות',



  },



};







const arrows = { up: '↑', right: '→', down: '↓', left: '←' };







const directionNames = {



  up: { en: 'Up', ar: 'أعلى', he: 'למעלה' },



  right: { en: 'Right', ar: 'يمين', he: 'ימינה' },



  down: { en: 'Down', ar: 'أسفل', he: 'למטה' },



  left: { en: 'Left', ar: 'يسار', he: 'שמאלה' },



};







export default function MissionPlayer({



  lesson,



  student,



  onExit,



  repository = missionRepository,



}) {



  const { language, setLanguage } = useLanguage();







  const t = (en, ar, he = en) => {



    if (language === 'ar') return ar;



    if (language === 'he') return he;



    return en;



  };







  const loc = value => {



    if (typeof value === 'string') return value;



    return value?.[language] || value?.en || value?.ar || value?.he || '';



  };







  const sections = lesson.sections;



  const valid = validateMission(sections);



  const cacheKey = `techminds:mission:v1:${student.id}:${lesson.id}${repository.practice ? ':practice' : ''}`;







  const [progress, setProgress] = useState(() =>



    newProgress(valid ? sections : []),



  );



  const latest = useRef(progress);



  const [loading, setLoading] = useState(true);



  const [loadError, setLoadError] = useState(false);



  const [loadAttempt, setLoadAttempt] = useState(0);



  const [saveStatus, setSaveStatus] = useState('saved');



  const [localError, setLocalError] = useState(false);



  const [completed, setCompleted] = useState(false);



  const [xp, setXp] = useState(0);

  const [completionResult, setCompletionResult] = useState(null);



  const [finishing, setFinishing] = useState(false);



  const [finishError, setFinishError] = useState(false);



  const [frame, setFrame] = useState(null);



  const [animation, setAnimation] = useState(null);



  const [dragged, setDragged] = useState(null);



  const [syncAttempt, setSyncAttempt] = useState(0);



  const queue = useRef(Promise.resolve());



  const finishingRef = useRef(false);



  const heading = useRef(null);







  const resume = useContentProgress({



    enabled: !repository.practice && Boolean(lesson.programId) && valid,



    canRestore: !loading && !loadError,



    programId: lesson.programId, contentId: lesson.id,



    snapshot: useMemo(() => ({ lastSectionIndex: progress.currentScreen, status: completed ? 'completed' : 'in_progress',



      state: { mission: progress } }), [progress, completed]),



    onRestore: saved => {



      if (!saved) return;



      const restored = mergeProgress(sections, latest.current, saved.state?.mission);



      restored.currentScreen = Math.min(saved.lastSectionIndex, sections.length - 1);



      latest.current = restored;



      setProgress(restored);



    },



  });







  const cache = value => {



    try {



      (repository.practice ? sessionStorage : localStorage).setItem(cacheKey, JSON.stringify(value));



      setLocalError(false);



    } catch {



      setLocalError(true);



    }



  };







  const change = value => {



    if (value.currentScreen !== latest.current.currentScreen) setFrame(null);



    latest.current = value;



    cache(value);



    setProgress(value);



    setSaveStatus('saving');



  };







  useEffect(() => {



    if (!valid) return;



    let active = true;







    repository



      .loadMission(db, lesson, student)



      .then(data => {



        if (!active) return;







        let local;



        try {



          local = JSON.parse((repository.practice ? sessionStorage : localStorage).getItem(cacheKey));



        } catch {



          // Ignore corrupt/unavailable cache.



        }







        const restored = mergeProgress(



          sections,



          data.mission,



          data.completed ? null : local,



        );







        latest.current = restored;



        setProgress(restored);



        setCompleted(data.completed);



        setXp(data.xp);



      })



      .catch(() => {



        if (active) setLoadError(true);



      })



      .finally(() => {



        if (active) setLoading(false);



      });







    return () => {



      active = false;



    };



  }, [



    lesson,



    student,



    cacheKey,



    sections,



    valid,



    loadAttempt,



    repository,



  ]);







  useEffect(() => {



    if (loading || loadError || !valid || completed || !resume.ready) return;







    let active = true;



    const timer = setTimeout(() => {



      setSaveStatus('saving');



      queue.current = queue.current



        .catch(() => {})



        .then(() => repository.saveMission(db, lesson, student, progress));







      queue.current



        .then(() => {



          if (active) setSaveStatus('saved');



        })



        .catch(() => {



          if (active) setSaveStatus('error');



        });



    }, 250);







    return () => {



      active = false;



      clearTimeout(timer);



    };



  }, [



    progress,



    resume.ready,



    loading,



    loadError,



    valid,



    completed,



    lesson,



    student,



    syncAttempt,



    repository,



  ]);







  useEffect(() => {



    const retry = () => setSyncAttempt(n => n + 1);



    window.addEventListener('online', retry);



    return () => window.removeEventListener('online', retry);



  }, []);







  useEffect(() => {



    if (!animation) return;







    const timer = setTimeout(



      () => {



        if (animation.index >= animation.path.length) {



          const { screenId, answer, correct } = animation;



          const current = latest.current;



          const screen = sections[current.currentScreen];







          if (screen.id === screenId) {



            const entry = current.screens[screenId];



            const value = updateScreen(sections, current, {



              answer,



              attempts: entry.attempts + 1,



              checked: true,



              passed: correct,



            });







            latest.current = value;







            try {



              (repository.practice ? sessionStorage : localStorage).setItem(cacheKey, JSON.stringify(value));



            } catch {



              setLocalError(true);



            }







            setProgress(value);



          }







          setAnimation(null);



          return;



        }







        setFrame(animation.path[animation.index]);



        setAnimation({



          ...animation,



          index: animation.index + 1,



        });



      },



      animation.index >= animation.path.length ? 0 : 320,



    );







    return () => clearTimeout(timer);



  }, [animation, sections, cacheKey, repository]);







  useEffect(() => {



    heading.current?.focus();



  }, [progress.currentScreen, loading]);







  if (!valid) {



    return (



      <main className="mission-player">



        <p role="alert">



          {t(



            'This mission has invalid screens. Please contact your teacher.',



            'شاشات هذه المهمة غير صالحة. تواصل مع معلمك.',



            'המסכים במשימה אינם תקינים. פנו למורה.',



          )}



        </p>



        <button onClick={onExit}>



          {t('Back to lessons', 'العودة إلى الدروس', 'חזרה לשיעורים')}



        </button>



      </main>



    );



  }







  const screen = sections[progress.currentScreen];



  const entry = progress.screens[screen.id];



  const busy = Boolean(animation) || finishing;



  const locked = entry.passed || busy || completed;



  const solved = sections.filter(s => progress.screens[s.id].passed).length;







  const update = changes =>



    change(updateScreen(sections, latest.current, changes));







  const edit = answer => {



    if (!locked) {



      update({ answer, checked: false });



      setFrame(null);



    }



  };







  const check = () => {



    if (locked) return;







    if (screen.grid) {



      const result = runRobot(screen.grid, entry.answer);



      setFrame(screen.grid.start);



      setAnimation({



        ...result,



        screenId: screen.id,



        answer: entry.answer,



        index: 0,



      });



    } else {



      update({



        attempts: entry.attempts + 1,



        checked: true,



        passed: checkAnswer(screen, entry.answer),



      });



    }



  };







  const reorder = (from, to) => {



    if (



      locked ||



      from === null ||



      from < 0 ||



      to < 0 ||



      from >= entry.answer.length ||



      to >= entry.answer.length



    ) {



      return;



    }







    const answer = [...entry.answer];



    answer.splice(to, 0, answer.splice(from, 1)[0]);



    edit(answer);



  };







  const next = () => {



    if (busy || (!entry.passed && !['story', 'explain'].includes(screen.type))) {



      return;



    }







    let value = latest.current;







    if (screen.type === 'story' || screen.type === 'explain') {



      value = updateScreen(sections, value, {



        passed: true,



        checked: true,



      });



    }







    change({



      ...value,



      currentScreen: Math.min(



        sections.length - 1,



        value.currentScreen + 1,



      ),



    });



  };







  const finish = async () => {



    if (finishingRef.current || completed || busy) return;







    let value = latest.current;







    if (screen.type === 'story' || screen.type === 'explain') {



      value = updateScreen(sections, value, {



        passed: true,



        checked: true,



      });



    }







    if (!missionReady(sections, value)) return;







    change(value);



    finishingRef.current = true;



    setFinishing(true);



    setFinishError(false);







    try {



      await queue.current.catch(() => {});



      const result = await repository.completeMission(



        db,



        lesson,



        student,



        value,



      );







      setCompleted(true);



      setXp(result.xp);



      setSaveStatus('saved');



      cache(value);



    } catch {



      setFinishError(true);



    } finally {



      finishingRef.current = false;



      setFinishing(false);



    }



  };







  const isInformational = screen.type === 'story' || screen.type === 'explain';







  return (



    <main



      className="mission-player"



      dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}



    >



      <header className="mission-topbar">



        <button onClick={onExit} disabled={busy}>



          {t('Back to lessons', 'العودة إلى الدروس', 'חזרה לשיעורים')}



        </button>







        <div



          className="mission-language"



          aria-label={t('Language', 'اللغة', 'שפה')}



        >



          <button



            aria-pressed={language === 'ar'}



            onClick={() => setLanguage('ar')}



          >



            العربية



          </button>



          <button



            aria-pressed={language === 'he'}



            onClick={() => setLanguage('he')}



          >



            עברית



          </button>



          <button



            aria-pressed={language === 'en'}



            onClick={() => setLanguage('en')}



          >



            English



          </button>



        </div>







        <span className="mission-xp">



          ⭐ {completed ? xp : lesson.xpReward} XP



        </span>



      </header>







      <h1>{loc(lesson.titleI18n || lesson.title)}</h1>







      {loading ? <p role="status">{t('Loading your mission…', 'جارٍ تحميل مهمتك…', 'טוען את המשימה…')}</p>



        : loadError ? (<div>



        <p role="alert">



          {t(



            'Could not load your progress. Check your connection and retry.',



            'تعذر تحميل تقدمك. تحقق من الاتصال وحاول مجددًا.',



            'לא ניתן לטעון את ההתקדמות. בדקו את החיבור ונסו שוב.',



          )}



        </p>



        <button



          onClick={() => {



            setLoading(true);



            setLoadError(false);



            setLoadAttempt(n => n + 1);



          }}



        >



          {t('Retry', 'إعادة المحاولة', 'נסה שוב')}



        </button>



        <button onClick={onExit}>



          {t('Back to lessons', 'العودة إلى الدروس', 'חזרה לשיעורים')}



        </button>



      </div>)



        : !resume.ready ? <ProgressNotice progress={resume} /> : <>



      <ProgressNotice progress={resume} />



      <div className="mission-progress-label">



        <span>



          {t('Mission progress', 'تقدم المهمة', 'התקדמות במשימה')}:{' '}



          {solved}/{sections.length}



        </span>







        <span role="status">



          {completed



            ? t('Completed', 'مكتملة', 'הושלמה')



            : saveStatus === 'saved'



              ? t('Progress saved', 'تم حفظ التقدم', 'ההתקדמות נשמרה')



              : saveStatus === 'saving'



                ? t('Saving…', 'جارٍ الحفظ…', 'שומר…')



                : t(



                    'Sync failed — retry saving',



                    'تعذرت المزامنة — أعد الحفظ',



                    'הסנכרון נכשל — נסו לשמור שוב',



                  )}



        </span>



      </div>







      <progress



        max={sections.length}



        value={solved}



        aria-label={t(



          'Mission progress',



          'تقدم المهمة',



          'התקדמות במשימה',



        )}



      />







      {saveStatus === 'error' && (



        <button onClick={() => setSyncAttempt(n => n + 1)}>



          {t('Retry saving', 'إعادة الحفظ', 'נסה לשמור שוב')}



        </button>



      )}







      {localError && (



        <p role="alert">



          {t(



            'Browser backup is unavailable. Wait for “Progress saved” before leaving.',



            'الحفظ في المتصفح غير متاح. انتظر ظهور «تم حفظ التقدم» قبل المغادرة.',



            'גיבוי בדפדפן אינו זמין. המתינו ל״ההתקדמות נשמרה״ לפני היציאה.',



          )}



        </p>



      )}







      {completed ? (



        <section className="mission-card mission-complete">



          <span className="mission-mascot" aria-hidden="true">



            🏆



          </span>

          <h2>

            {completionResult?.programCompleted

              ? t('Program complete!', 'أكملت البرنامج!', 'התוכנית הושלמה!')

              : t('Mission complete!', 'اكتملت المهمة!', 'המשימה הושלמה!')}

          </h2>

          <p>

            {completionResult?.programCompleted

              ? t(

                  'Excellent work! You completed every required lesson in this program.',

                  'عمل رائع! أكملت جميع الدروس المطلوبة في هذا البرنامج.',

                  'עבודה מצוינת! השלמת את כל השיעורים הנדרשים בתוכנית.',

                )

              : t(

                  'Your reward is recorded. Reopening this mission will not award XP again.',

                  'تم تسجيل مكافأتك. إعادة فتح المهمة لا تمنح XP مرة أخرى.',

                  'הפרס נשמר. פתיחה מחדש של המשימה לא תעניק XP נוסף.',

                )}

          </p>

          <strong>⭐ +{xp} XP</strong>

          {Number.isFinite(completionResult?.totalXp) && (

            <p>

              {t('Total XP', 'مجموع XP', 'סך XP')}: {completionResult.totalXp}

              {' · '}

              {t('Level', 'المستوى', 'רמה')} {completionResult.level}

            </p>

          )}

          {!completionResult?.programCompleted && completionResult?.nextLessonId && (

            <button

              className="mission-primary"

              onClick={() => {

                window.location.href = `/programs/${encodeURIComponent(lesson.programId)}/lessons/${encodeURIComponent(completionResult.nextLessonId)}`;

              }}

            >

              {t('Next lesson', 'الدرس التالي', 'השיעור הבא')}

            </button>

          )}

          <button className="mission-primary" onClick={onExit}>

            {completionResult?.programCompleted

              ? t('Back to program', 'العودة إلى البرنامج', 'חזרה לתוכנית')

              : t('Back to lessons', 'العودة إلى الدروس', 'חזרה לשיעורים')}

          </button>



        </section>



      ) : (



        <section



          className={`mission-card ${



            screen.type === 'explain' ? 'mission-explain' : ''



          }`}



          aria-labelledby="mission-screen-title"



        >



          <div className="mission-screen-count">



            {t('Screen', 'الشاشة', 'מסך')} {progress.currentScreen + 1} /{' '}



            {sections.length}



          </div>







          {screen.type === 'explain' && screen.icon && (



            <div className="mission-explain-icon" aria-hidden="true">



              {screen.icon}



            </div>



          )}







          {screen.type === 'explain' && screen.image && (



            <img



              className="mission-explain-image"



              src={screen.image}



              alt={loc(screen.imageAlt) || loc(screen.title)}



            />



          )}







          <h2 id="mission-screen-title" tabIndex={-1} ref={heading}>



            {loc(screen.title)}



          </h2>







          {screen.type === 'story' && (



            <div className="mission-mascot" aria-hidden="true">



              🤖



            </div>



          )}







          <p className="mission-prompt">



            {loc(screen.body || screen.text)}



          </p>







          {screen.type === 'explain' &&



            screen.visual?.type === 'comparison' && (



              <div className="mission-comparison">



                <article>



                  <strong>{loc(screen.visual.leftTitle)}</strong>



                  <p>{loc(screen.visual.left)}</p>



                </article>







                <article>



                  <strong>{loc(screen.visual.rightTitle)}</strong>



                  <p>{loc(screen.visual.right)}</p>



                </article>



              </div>



            )}







          {screen.type === 'explain' &&



            screen.visual?.type === 'example' && (



              <div className="mission-example">



                {loc(screen.visual.text)}



              </div>



            )}







          {screen.type === 'multipleChoice' && (



            <div



              className="mission-options"



              role="group"



              aria-label={loc(screen.text)}



            >



              {screen.options.map(option => (



                <button



                  key={option.id}



                  disabled={locked}



                  aria-pressed={entry.answer === option.id}



                  onClick={() => edit(option.id)}



                >



                  <span className="mission-option-label">



                    {loc(option.text)}



                  </span>



                </button>



              ))}



            </div>



          )}







          {screen.type === 'sequence' && (



            <>



              <p>



                {t(



                  'Drag the steps or use the up/down buttons.',



                  'اسحب الخطوات أو استخدم زري الأعلى والأسفل.',



                  'גררו את השלבים או השתמשו בכפתורי מעלה/מטה.',



                )}



              </p>







              <ol className="mission-sequence">



                {entry.answer.map((id, index) => (



                  <li



                    key={id}



                    draggable={!locked}



                    onDragStart={event => {



                      setDragged(index);



                      event.dataTransfer.setData(



                        'text/plain',



                        String(index),



                      );



                    }}



                    onDragEnd={() => setDragged(null)}



                    onDragOver={event => event.preventDefault()}



                    onDrop={event => {



                      event.preventDefault();



                      reorder(dragged, index);



                      setDragged(null);



                    }}



                  >



                    <span>



                      {index + 1}.{' '}



                      {loc(



                        screen.items.find(item => item.id === id)?.text,



                      )}



                    </span>







                    <div>



                      <button



                        disabled={locked || index === 0}



                        aria-label={`${t(



                          'Move up',



                          'تحريك لأعلى',



                          'הזז למעלה',



                        )} ${loc(



                          screen.items.find(item => item.id === id)?.text,



                        )}`}



                        onClick={() => reorder(index, index - 1)}



                      >



                        ↑



                      </button>







                      <button



                        disabled={



                          locked || index === entry.answer.length - 1



                        }



                        aria-label={`${t(



                          'Move down',



                          'تحريك لأسفل',



                          'הזז למטה',



                        )} ${loc(



                          screen.items.find(item => item.id === id)?.text,



                        )}`}



                        onClick={() => reorder(index, index + 1)}



                      >



                        ↓



                      </button>



                    </div>



                  </li>



                ))}



              </ol>



            </>



          )}







          {screen.grid && (



            <div className="mission-robot-challenge">



              <div



                className="mission-grid"



                dir="ltr"



                style={{ '--grid-size': screen.grid.size }}



                role="img"



                aria-label={t(



                  'Robot board: robot, key, walls, and empty squares.',



                  'لوحة الروبوت: روبوت ومفتاح وجدران ومربعات فارغة.',



                  'לוח רובוט: רובוט, מפתח, קירות ומשבצות ריקות.',



                )}



              >



                {Array.from(



                  { length: screen.grid.size ** 2 },



                  (_, i) => {



                    const x = i % screen.grid.size;



                    const y = Math.floor(i / screen.grid.size);



                    const position = frame || screen.grid.start;



                    const robot =



                      position[0] === x && position[1] === y;



                    const goal =



                      screen.grid.goal[0] === x &&



                      screen.grid.goal[1] === y;



                    const wall = screen.grid.obstacles?.some(



                      ([ox, oy]) => ox === x && oy === y,



                    );







                    return (



                      <div



                        key={i}



                        className={



                          wall



                            ? 'mission-wall'



                            : goal



                              ? 'mission-goal'



                              : ''



                        }



                      >



                        {robot



                          ? '🤖'



                          : wall



                            ? '▪'



                            : goal



                              ? '🔑'



                              : ''}



                      </div>



                    );



                  },



                )}



              </div>







              <p className="mission-board-description">



                {t(



                  'Coordinates are column, row, starting at 1 from the top left.',



                  'الإحداثيات هي العمود ثم الصف، بدءًا من 1 من أعلى اليسار.',



                  'הקואורדינטות הן עמודה ואז שורה, החל מ־1 בפינה השמאלית העליונה.',



                )}{' '}



                {t('Start', 'البداية', 'התחלה')}:{' '}



                {screen.grid.start.map(n => n + 1).join(', ')}.{' '}



                {t('Key', 'المفتاح', 'מפתח')}:{' '}



                {screen.grid.goal.map(n => n + 1).join(', ')}.{' '}



                {t('Walls', 'الجدران', 'קירות')}:{' '}



                {screen.grid.obstacles



                  .map(p => p.map(n => n + 1).join(', '))



                  .join(' / ')}



                .



              </p>







              {screen.type === 'robot' && (



                <div className="mission-directions" dir="ltr">



                  {Object.keys(DIRECTIONS).map(direction => (



                    <button



                      key={direction}



                      disabled={locked || entry.answer.length >= 32}



                      onClick={() =>



                        edit([...entry.answer, direction])



                      }



                    >



                      {arrows[direction]}{' '}



                      {loc(directionNames[direction])}



                    </button>



                  ))}



                </div>



              )}







              <ol



                className="mission-commands"



                dir="ltr"



                aria-label={t(



                  'Program instructions',



                  'تعليمات البرنامج',



                  'הוראות התוכנית',



                )}



              >



                {entry.answer.map((command, index) => (



                  <li key={index}>



                    {screen.type === 'debugging' ? (



                      <label>



                        {index + 1}.{' '}



                        <select



                          aria-label={`${t(



                            'Instruction',



                            'التعليمة',



                            'הוראה',



                          )} ${index + 1}`}



                          value={command}



                          disabled={locked}



                          onChange={event =>



                            edit(



                              entry.answer.map((c, i) =>



                                i === index



                                  ? event.target.value



                                  : c,



                              ),



                            )



                          }



                        >



                          {Object.keys(DIRECTIONS).map(d => (



                            <option key={d} value={d}>



                              {arrows[d]} {loc(directionNames[d])}



                            </option>



                          ))}



                        </select>



                      </label>



                    ) : (



                      <span>



                        {index + 1}. {arrows[command]}{' '}



                        <span className="mission-sr-only">



                          {loc(directionNames[command])}



                        </span>



                      </span>



                    )}



                  </li>



                ))}



              </ol>







              {screen.type === 'robot' && (



                <div className="mission-controls">



                  <button



                    disabled={locked || !entry.answer.length}



                    onClick={() =>



                      edit(entry.answer.slice(0, -1))



                    }



                  >



                    {t('Undo', 'تراجع', 'בטל')}



                  </button>







                  <button



                    disabled={locked || !entry.answer.length}



                    onClick={() => edit([])}



                  >



                    {t(



                      'Clear commands',



                      'مسح الأوامر',



                      'נקה הוראות',



                    )}



                  </button>



                </div>



              )}



            </div>



          )}







          {!isInformational && (



            <div className="mission-controls">



              <button



                className="mission-primary"



                disabled={locked || !entry.answer?.length}



                onClick={check}



              >



                {animation



                  ? t(



                      'Running…',



                      'جارٍ التشغيل…',



                      'מריץ…',



                    )



                  : screen.grid



                    ? t(



                        'Run program',



                        'تشغيل البرنامج',



                        'הפעל תוכנית',



                      )



                    : t(



                        'Check answer',



                        'تحقق من الإجابة',



                        'בדוק תשובה',



                      )}



              </button>







              {!!screen.hints?.length && (



                <button



                  disabled={



                    busy ||



                    entry.passed ||



                    entry.hintsUsed >= screen.hints.length



                  }



                  onClick={() =>



                    update({



                      hintsUsed: entry.hintsUsed + 1,



                    })



                  }



                >



                  {t('Hint', 'تلميح', 'רמז')} ({entry.hintsUsed}/



                  {screen.hints.length})



                </button>



              )}







              {entry.checked && !entry.passed && (



                <button



                  disabled={busy}



                  onClick={() => {



                    update({ checked: false });



                    setFrame(null);



                  }}



                >



                  {t('Try again', 'حاول مجددًا', 'נסה שוב')}



                </button>



              )}







              <span>



                {t('Attempts', 'المحاولات', 'ניסיונות')}:{' '}



                {entry.attempts}



              </span>



            </div>



          )}







          {screen.hints



            ?.slice(0, entry.hintsUsed)



            .map((hint, i) => (



              <p className="mission-hint" key={i}>



                💡 {loc(hint)}



              </p>



            ))}







          <div role="status" aria-live="polite">



            {entry.checked && !isInformational && (



              <p



                className={



                  entry.passed



                    ? 'mission-success'



                    : 'mission-feedback'



                }



              >



                {entry.passed



                  ? `${t(



                      'Well done!',



                      'أحسنت!',



                      'כל הכבוד!',



                    )} ${loc(screen.explanation)}`



                  : t(



                      'Not quite yet. Review the instructions, use a hint, and try again.',



                      'ليس بعد. راجع التعليمات، واستخدم تلميحًا، وحاول مجددًا.',



                      'עדיין לא. עברו על ההוראות, השתמשו ברמז ונסו שוב.',



                    )}



              </p>



            )}



          </div>







          <nav



            className="mission-navigation"



            aria-label={t(



              'Mission navigation',



              'التنقل في المهمة',



              'ניווט במשימה',



            )}



          >



            <button



              disabled={busy || progress.currentScreen === 0}



              onClick={() =>



                change({



                  ...progress,



                  currentScreen: progress.currentScreen - 1,



                })



              }



            >



              {t('Previous', 'السابق', 'הקודם')}



            </button>







            {progress.currentScreen < sections.length - 1 ? (



              <button



                className="mission-primary"



                disabled={



                  busy ||



                  (!isInformational && !entry.passed)



                }



                onClick={next}



              >



                {screen.type === 'explain'



                  ? loc(screen.cta) ||



                    t(



                      'Got it, continue',



                      'فهمت، أكمل',



                      'הבנתי, המשך',



                    )



                  : t('Continue', 'متابعة', 'המשך')}



              </button>



            ) : (



              <button



                className="mission-primary"



                disabled={



                  busy ||



                  (!isInformational && !entry.passed)



                }



                onClick={finish}



              >



                {finishing



                  ? t(



                      'Saving reward…',



                      'جارٍ حفظ المكافأة…',



                      'שומר פרס…',



                    )



                  : t(



                      'Finish mission',



                      'إنهاء المهمة',



                      'סיים משימה',



                    )}



              </button>



            )}



          </nav>







          {finishError && (



            <p role="alert">



              {t(



                'Your reward could not be saved. Reconnect and press Finish mission again. You will only receive XP once.',



                'تعذر حفظ المكافأة. اتصل بالإنترنت واضغط إنهاء المهمة مجددًا. ستحصل على XP مرة واحدة فقط.',



                'לא ניתן לשמור את הפרס. התחברו מחדש ולחצו שוב על סיום המשימה. תקבלו XP פעם אחת בלבד.',



              )}



            </p>



          )}



        </section>



      )}







      <aside className="mission-skills">



        <h2>



          {t(



            'Skills practiced',



            'المهارات التي تدربت عليها',



            'מיומנויות שתרגלת',



          )}



        </h2>







        <div>



          {Object.entries(progress.skills).map(



            ([skill, value]) => (



              <span key={skill}>



                {loc(skillNames[skill]) || skill}: {value.passed}/



                {value.total}



              </span>



            ),



          )}



        </div>



      </aside>



      </>}



    </main>



  );



}
