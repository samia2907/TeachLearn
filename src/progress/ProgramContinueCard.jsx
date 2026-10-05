import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './progress.css';

export default function ProgramContinueCard({ programId, record, title }) {
  const { language, t } = useLanguage();
  return <section className="program-continue-card" dir={language === 'en' ? 'ltr' : 'rtl'} aria-labelledby="continue-learning-title">
    <div>
      <h2 id="continue-learning-title">{t.progress.continueTitle}</h2>
      <p>{t.progress.lastPlace}: <strong>{title}</strong></p>
      <p>{t.progress[record.status]} · {t.progress.section} {record.lastSectionIndex + 1} · {record.progressPercent}%</p>
      <progress value={record.progressPercent} max="100" aria-label={t.progress[record.status]} />
    </div>
    <Link to={`/programs/${encodeURIComponent(programId)}/lessons/${encodeURIComponent(record.contentId)}`}>
      {t.progress.continueAction}
    </Link>
  </section>;
}
