import { useLanguage } from '../context/LanguageContext';

export default function ProgressNotice({ progress }) {
  const { language, t } = useLanguage();
  if (!progress.error && progress.ready) return null;
  return <div className="access-preview-notice" dir={language === 'en' ? 'ltr' : 'rtl'} role={progress.error ? 'alert' : 'status'}>
    <p>{progress.error ? t.progress.error : t.progress.loading}</p>
    {progress.error && <button type="button" onClick={progress.retry}>{t.progress.retry}</button>}
  </div>;
}
