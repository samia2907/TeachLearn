import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import ProtectedRoute from '../components/ProtectedRoute';

import LanguageSwitcher from '../components/LanguageSwitcher';
import PageLoading from '../components/PageLoading';
const ProgramLearning = lazy(() => import('./ProgramLearning'));
import { useAccessText } from '../access/accessText';
import { authEntry } from '../auth/returnTo.mjs';
import './ProgramAccess.css';

export default function PublicProgram() {
  const { programId } = useParams();
  const { t, loc, dir, language } = useAccessText();
  const [user, setUser] = useState(undefined);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => {
    setProgram(null);
    setLoading(true);
    if (user !== null) return;
    // Only the already-public catalog document. Never read lessons or user data.
    return onSnapshot(doc(db, 'programs', programId), snapshot => {
      setProgram(snapshot.exists() && snapshot.data().status === 'published' ? snapshot.data() : null);
      setLoading(false);
    }, () => { setProgram(null); setLoading(false); });
  }, [programId, user]);
  if (user) return <ProtectedRoute><Suspense fallback={<PageLoading />}><ProgramLearning /></Suspense></ProtectedRoute>;
  const destination = `/programs/${encodeURIComponent(programId)}`;
  const outcomes = program?.learningOutcomes?.[language] || program?.learningOutcomes?.en || [];
  return <main className="access-page" dir={dir}>

    <LanguageSwitcher />
    {user === undefined || loading ? <p role="status">{t('Loading…', 'جارٍ التحميل…', 'טוען…')}</p> : !program ?
      <p role="alert">{t('Program unavailable.', 'البرنامج غير متاح.', 'התוכנית אינה זמינה.')}</p> :
      <section className="access-card access-hero">
        <h1>{loc(program.title)}</h1>
        <p>{loc(program.description)}</p>
        {Array.isArray(outcomes) && outcomes.length > 0 && <><h2>{t('What you will learn', 'ماذا ستتعلم', 'מה תלמדו')}</h2><ul>{outcomes.map((item, index) => <li key={index}>{loc(item)}</li>)}</ul></>}
        {program.finalProject && <p>{loc(program.finalProject)}</p>}
        <p>{t('Create an account to open lessons and missions and save your progress.', 'أنشئ حسابًا لفتح الدروس والمهمات وحفظ تقدمك.', 'צרו חשבון כדי לפתוח שיעורים ומשימות ולשמור את ההתקדמות שלכם.')}</p>
        <div className="access-actions">
          <Link className="access-primary" to={authEntry(destination, '/register')}>{t('Create an account to start', 'أنشئ حسابًا للبدء', 'צרו חשבון כדי להתחיל')}</Link>
          <Link to={authEntry(`${destination}/access`)}>{t('Get access', 'طلب الوصول', 'בקשת גישה')}</Link>
        </div>
      </section>}
  </main>;
}
