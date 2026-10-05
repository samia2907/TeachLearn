import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './ProfileLink.css';

export default function ProfileLink() {
  const { language } = useLanguage();
  return <Link className="profile-nav-link" to="/profile">{language === 'ar' ? 'الملف الشخصي' : language === 'he' ? 'הפרופיל שלי' : 'My profile'}</Link>;
}
