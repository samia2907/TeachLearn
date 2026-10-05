import { useLanguage } from '../context/LanguageContext';

export function useAccessText() {
  const { language, setLanguage } = useLanguage();
  return { language, setLanguage, dir: language === 'en' ? 'ltr' : 'rtl',
    t: (en, ar, he) => language === 'ar' ? ar : language === 'he' ? he : en,
    loc: value => typeof value === 'string' ? value : value?.[language] || value?.en || value?.ar || value?.he || '',
  };
}

export function whatsappAccessLink(phone, { name, email, programName, language }) {
  const number = String(phone || '').replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{6,14}$/.test(number)) return null;
  const message = language === 'ar' ? `مرحبًا، أنا ${name}، مهتم/ة ببرنامج ${programName}. أريد معرفة السعر وفتح البرنامج لحسابي ${email}.`
    : language === 'he' ? `שלום, אני ${name}, מעוניין/ת בתוכנית ${programName}. אשמח לקבל פרטים על המחיר ולפתוח את התוכנית לחשבון ${email}.`
      : `Hello, I am ${name}, interested in ${programName}. I would like pricing details and access for my account ${email}.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
