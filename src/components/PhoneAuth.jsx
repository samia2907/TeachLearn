import { useAuthNavigation } from '../auth/useAuthNavigation';
import { useEffect, useId, useRef, useState } from 'react';
import { RecaptchaVerifier, PhoneAuthProvider, updatePhoneNumber, signInWithPhoneNumber, signInWithEmailAndPassword, linkWithPhoneNumber, signOut } from 'firebase/auth';

import { auth } from '../firebase/firebase';
import { loadOrCreatePhoneProfile } from '../firebase/phoneProfile';
import { normalizePhoneNumber, phoneDashboard } from '../firebase/phoneAuthPolicy';
import { useLanguage } from '../context/LanguageContext';
import { authMessage } from '../firebase/authMessages';
import './PhoneAuth.css';

const errors = {
  'auth/invalid-phone-number': ['Enter a valid phone number including country code, e.g. +972501234567.', 'أدخل رقم هاتف صحيحًا مع رمز الدولة، مثل +972501234567.', 'הזינו מספר טלפון תקין עם קידומת מדינה, למשל +972501234567.'],
  'auth/invalid-verification-code': ['Incorrect code. Enter the six digits from the SMS.', 'الرمز غير صحيح. أدخل الأرقام الستة من الرسالة.', 'קוד שגוי. הזינו את שש הספרות מההודעה.'],
  'auth/code-expired': ['Code expired. Request a new SMS code.', 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.', 'תוקף הקוד פג. בקשו קוד חדש.'],
  'auth/too-many-requests': ['Too many attempts. Try again later.', 'محاولات كثيرة. حاول لاحقًا.', 'יותר מדי ניסיונות. נסו מאוחר יותר.'],
  'auth/network-request-failed': ['Network error. Check your connection and retry.', 'خطأ في الشبكة. تحقق من الاتصال وحاول مجددًا.', 'שגיאת רשת. בדקו את החיבור ונסו שוב.'],
  'auth/captcha-check-failed': ['reCAPTCHA failed or expired. Please try again.', 'فشل التحقق أو انتهت صلاحيته. حاول مجددًا.', 'אימות reCAPTCHA נכשל או פג. נסו שוב.'],
  'auth/invalid-credential': ['Email or password is incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'האימייל או הסיסמה שגויים.'],
  'auth/credential-already-in-use': ['This phone belongs to another account. Sign in to that account or contact support; accounts were not merged.', 'هذا الرقم مرتبط بحساب آخر. سجّل الدخول إليه أو تواصل مع الدعم؛ لم يتم دمج الحسابات.', 'המספר משויך לחשבון אחר. התחברו אליו או פנו לתמיכה; החשבונות לא מוזגו.'],
  'name-required': ['Enter your full name (up to 120 characters) to create your profile.', 'أدخل اسمك الكامل (حتى 120 حرفًا) لإنشاء ملفك.', 'הזינו שם מלא (עד 120 תווים) ליצירת הפרופיל.'],
  'account-blocked': ['This account is inactive or blocked. Contact support.', 'هذا الحساب غير نشط أو محظور. تواصل مع الدعم.', 'החשבון אינו פעיל או חסום. פנו לתמיכה.'],
  'profile-failed': ['Could not load or create your profile. Retry to finish signing in.', 'تعذر تحميل ملفك أو إنشاؤه. حاول مجددًا لإكمال الدخول.', 'לא ניתן לטעון או ליצור פרופיל. נסו שוב להשלמת הכניסה.'],
  'send-failed': ['SMS could not be sent. Try again later or contact support.', 'تعذر إرسال الرسالة. حاول لاحقًا أو تواصل مع الدعم.', 'שליחת ההודעה נכשלה. נסו מאוחר יותר או פנו לתמיכה.'],
  'auth/operation-not-allowed': ['Phone sign-in is not enabled. Contact support or use Email.', 'الدخول بالهاتف غير مفعّل. تواصل مع الدعم أو استخدم البريد.', 'כניסה בטלפון אינה מופעלת. פנו לתמיכה או השתמשו באימייל.'],
  'auth/unauthorized-domain': ['This domain is not authorized for phone sign-in. Contact support.', 'هذا النطاق غير مصرح للدخول بالهاتف. تواصل مع الدعم.', 'הדומיין אינו מורשה לכניסה בטלפון. פנו לתמיכה.'],
  'auth/quota-exceeded': ['SMS limit reached. Try later or use Email.', 'تم بلوغ حد الرسائل. حاول لاحقًا أو استخدم البريد.', 'מכסת ההודעות מוצתה. נסו מאוחר יותר או השתמשו באימייל.'],
};

export default function PhoneAuth({ role, currentUser = null, onLinked }) {
  const { language } = useLanguage();
  const { finishAuth } = useAuthNavigation();
  const id = useId();
  const recaptchaContainerId = `recaptcha-${id.replace(/[:]/g, '')}`;
  const container = useRef(null);
  const verifier = useRef(null);
  const mounted = useRef(false);
  const inFlight = useRef(false);
  const verifiedUser = useRef(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkExisting, setLinkExisting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retryProfile, setRetryProfile] = useState(false);
  const text = (en, ar, he) => language === 'ar' ? ar : language === 'he' ? he : en;
  const clearVerifier = () => {
    const current = verifier.current;
    verifier.current = null;
    if (current) current.clear();
    container.current?.replaceChildren();
  };
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearVerifier(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) { setError('auth/invalid-phone-number'); return; }
    if (confirmation && !retryProfile && !/^\d{6}$/.test(code.trim())) {
      setError('auth/invalid-verification-code'); return;
    }
    inFlight.current = true;
    setBusy(true);
    let stage = confirmation ? 'verify' : 'send';
    try {
      if (!confirmation) {
        clearVerifier();
        auth.languageCode = language;
        // Explicit development-only switch: only fictional Console numbers work.
        auth.settings.appVerificationDisabledForTesting = import.meta.env.DEV && import.meta.env.VITE_PHONE_AUTH_TESTING === 'true';
        let userToLink = currentUser;
        if (currentUser && auth.currentUser?.uid !== currentUser.uid) throw Object.assign(new Error(), { code: 'auth/user-token-expired' });
        if (!currentUser && linkExisting) {
          userToLink = (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
          setPassword('');
        }
        if (!mounted.current) return;
        verifier.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'normal',
          'expired-callback': () => {
            if (mounted.current) setError('auth/captcha-check-failed');
          },
        });

        await verifier.current.render();
        let result;
        if (currentUser?.phoneNumber) {
          const verificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber(normalized, verifier.current);
          result = { confirm: async otp => {
            if (auth.currentUser?.uid !== currentUser.uid) throw Object.assign(new Error(), { code: 'auth/user-token-expired' });
            await updatePhoneNumber(currentUser, PhoneAuthProvider.credential(verificationId, otp));
            return { user: currentUser };
          } };
        } else {
          result = userToLink
            ? await linkWithPhoneNumber(userToLink, normalized, verifier.current)
            : await signInWithPhoneNumber(auth, normalized, verifier.current);
        }
        if (mounted.current) { setPhone(normalized); setConfirmation(result); }
      } else {
        if (currentUser && auth.currentUser?.uid !== currentUser.uid) throw Object.assign(new Error(), { code: 'auth/user-token-expired' });
        const user = verifiedUser.current || (await confirmation.confirm(code.trim())).user;
        if (!mounted.current) return;
        verifiedUser.current = user;
        stage = 'profile';
        if (currentUser) {
          await onLinked(user);
          return;
        }
        const profile = await loadOrCreatePhoneProfile(user, role, name, language);
        const destination = phoneDashboard(profile);
        if (mounted.current) finishAuth(destination);
      }
    } catch (failure) {
      console.error('[PhoneAuth] Authentication failed', {
        stage,
        code: failure.code,
        message: failure.message,
      });
      if (failure.message === 'account-blocked' || failure.message === 'invalid-role') {
        await signOut(auth);
        verifiedUser.current = null;
        if (mounted.current) { setConfirmation(null); setRetryProfile(false); }
      } else if (stage === 'profile' && mounted.current) setRetryProfile(true);
      const errorCode = failure.code === 'auth/session-expired' ? 'auth/code-expired' : failure.code;
      if (mounted.current) setError(['auth/requires-recent-login', 'auth/user-token-expired', 'auth/provider-already-linked'].includes(errorCode) ? errorCode : errors[errorCode] ? errorCode : errors[failure.message] ? failure.message : stage === 'profile' ? 'profile-failed' : stage === 'send' ? 'send-failed' : 'auth/invalid-verification-code');
    } finally {
      clearVerifier();
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <form className="phone-auth" onSubmit={submit} dir={language === 'en' ? 'ltr' : 'rtl'}>
    {!confirmation && <>
      {!currentUser && <><label htmlFor={`${id}-existing`}><input id={`${id}-existing`} type="checkbox" checked={linkExisting} disabled={busy} onChange={e => setLinkExisting(e.target.checked)} />
        {text('Link my existing email/password account', 'ربط حسابي الحالي بالبريد وكلمة المرور', 'קישור לחשבון האימייל והסיסמה הקיים שלי')}
      </label>
      <p>{text('Already have an account? Link it to keep your classes and purchases. Google and class-code users can sign in as usual, then link a phone from Profile.', 'لديك حساب؟ اربطه للاحتفاظ بصفوفك ومشترياتك. يمكن لمستخدمي Google ورمز الصف الدخول كالمعتاد ثم ربط الهاتف من الملف الشخصي.', 'כבר יש לכם חשבון? קשרו אותו לשמירת הכיתות והרכישות. משתמשי Google וקוד כיתה יכולים להתחבר כרגיל ולקשר טלפון מהפרופיל.')}</p></>}
      {linkExisting && <>
        <label htmlFor={`${id}-email`}>{text('Email', 'البريد الإلكتروني', 'אימייל')}</label>
        <input id={`${id}-email`} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} disabled={busy} required />
        <label htmlFor={`${id}-password`}>{text('Password', 'كلمة المرور', 'סיסמה')}</label>
        <input id={`${id}-password`} type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={busy} required />
      </>}
      <label htmlFor={`${id}-phone`}>{text('Phone number', 'رقم الهاتف', 'מספר טלפון')}</label>
      <input id={`${id}-phone`} type="tel" dir="ltr" autoComplete="tel" placeholder="+972501234567" value={phone} onChange={e => setPhone(e.target.value)} disabled={busy} required />
      <p>{text('We will send an SMS; standard rates may apply. Google processes your phone number for spam and abuse prevention.', 'سنرسل رسالة SMS؛ قد تُطبق رسوم. تعالج Google رقمك لمنع الرسائل المزعجة وإساءة الاستخدام.', 'נשלח SMS; ייתכן חיוב. Google מעבדת את המספר למניעת ספאם ושימוש לרעה.')}</p>
    </>}
    {confirmation && <>
      <p role="status">{text('SMS code sent to', 'تم إرسال الرمز إلى', 'קוד נשלח אל')} <bdi>{phone}</bdi></p>
      {!currentUser && <><label htmlFor={`${id}-name`}>{text('Full name (required for a new account)', 'الاسم الكامل (مطلوب لحساب جديد)', 'שם מלא (נדרש לחשבון חדש)')}</label>
      <input id={`${id}-name`} autoComplete="name" maxLength={120} value={name} disabled={busy} onChange={e => setName(e.target.value)} /></>}
      {!retryProfile && <>
        <label htmlFor={`${id}-code`}>{text('Verification code', 'رمز التحقق', 'קוד אימות')}</label>
        <input id={`${id}-code`} dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value)} disabled={busy} required />
      </>}
    </>}
    <div id={recaptchaContainerId} ref={container} />
    {error && <p role="alert">{errors[error] ? text(...errors[error]) : authMessage(error, language)}</p>}
    <button disabled={busy} type="submit">{busy ? text('Please wait…', 'يرجى الانتظار…', 'נא להמתין…') : retryProfile ? text('Finish signing in', 'إكمال الدخول', 'השלמת הכניסה') : confirmation ? text('Verify code', 'تحقق من الرمز', 'אימות קוד') : text('Send SMS code', 'إرسال رمز SMS', 'שליחת קוד SMS')}</button>
    {confirmation && !retryProfile && <button type="button" disabled={busy} onClick={() => { setConfirmation(null); setCode(''); setError(''); clearVerifier(); }}>{text('Resend / change number', 'إعادة الإرسال / تغيير الرقم', 'שליחה מחדש / שינוי מספר')}</button>}
  </form>;
}

// Retained for compatibility; phone sign-in is not offered in the MVP.
export function AuthMethods({ children }) { return children; }
