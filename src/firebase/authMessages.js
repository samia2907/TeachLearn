const messages = {
  'email-linked-verification-failed': ['Email linked, but the verification email could not be sent. Use Send verification email to retry.', 'تم ربط البريد، لكن تعذر إرسال رسالة التحقق. أعد المحاولة بزر إرسال رسالة التحقق.', 'האימייל קושר, אך הודעת האימות לא נשלחה. לחצו על שליחת הודעת אימות כדי לנסות שוב.'],
  'auth/invalid-email': ['Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.', 'הזינו כתובת אימייל תקינה.'],
  'auth/too-many-requests': ['Too many attempts. Please try again later.', 'محاولات كثيرة. يرجى المحاولة لاحقًا.', 'יותר מדי ניסיונות. נסו שוב מאוחר יותר.'],
  'auth/network-request-failed': ['Network error. Check your connection and try again.', 'خطأ في الشبكة. تحقق من الاتصال وحاول مجددًا.', 'שגיאת רשת. בדקו את החיבור ונסו שוב.'],
  'auth/requires-recent-login': ['Sign out and sign in again, then retry this change.', 'سجّل الخروج ثم الدخول مجددًا، وأعد المحاولة.', 'התנתקו והתחברו מחדש, ואז נסו שוב.'],
  'auth/user-token-expired': ['Your session expired. Please sign in again.', 'انتهت الجلسة. يرجى تسجيل الدخول مجددًا.', 'תוקף ההתחברות פג. התחברו מחדש.'],
  'auth/user-disabled': ['This account is disabled. Contact support.', 'هذا الحساب معطّل. تواصل مع الدعم.', 'החשבון מושבת. פנו לתמיכה.'],
  'auth/email-already-in-use': ['That email belongs to another account. Sign in to that account or contact support. Accounts were not merged.', 'هذا البريد مرتبط بحساب آخر. سجّل الدخول إليه أو تواصل مع الدعم. لم يتم دمج الحسابات.', 'האימייל משויך לחשבון אחר. התחברו אליו או פנו לתמיכה. החשבונות לא מוזגו.'],
  'auth/credential-already-in-use': ['This sign-in method belongs to another account. Accounts were not merged. Contact support.', 'طريقة الدخول مرتبطة بحساب آخر. لم يتم دمج الحسابات. تواصل مع الدعم.', 'שיטת הכניסה משויכת לחשבון אחר. החשבונות לא מוזגו. פנו לתמיכה.'],
  'auth/provider-already-linked': ['This sign-in method is already linked to your account.', 'طريقة الدخول مرتبطة بحسابك بالفعل.', 'שיטת הכניסה כבר מקושרת לחשבון.'],
  'auth/weak-password': ['Use at least 8 characters with uppercase, lowercase, a number and a symbol.', 'استخدم 8 أحرف على الأقل، مع أحرف كبيرة وصغيرة ورقم ورمز.', 'השתמשו ב-8 תווים לפחות, כולל אות גדולה וקטנה, מספר וסימן.'],
  'auth/operation-not-allowed': ['This sign-in method is unavailable. Contact support.', 'طريقة الدخول غير متاحة. تواصل مع الدعم.', 'שיטת הכניסה אינה זמינה. פנו לתמיכה.'],
  'name-required': ['Enter a name between 1 and 120 characters.', 'أدخل اسمًا من حرف واحد إلى 120 حرفًا.', 'הזינו שם באורך 1 עד 120 תווים.'],
  'invalid-language': ['Choose English, Arabic or Hebrew.', 'اختر الإنجليزية أو العربية أو العبرية.', 'בחרו אנגלית, ערבית או עברית.'],
  'profile-not-found': ['Your profile could not be found. Contact support; no replacement profile was created.', 'لم يتم العثور على ملفك. تواصل مع الدعم؛ لم يتم إنشاء ملف بديل.', 'הפרופיל לא נמצא. פנו לתמיכה; לא נוצר פרופיל חלופי.'],
  'auth-name-sync-failed': ['Profile saved, but the sign-in display name could not be synced. Please save again.', 'تم حفظ الملف، لكن تعذرت مزامنة اسم الدخول. احفظ مجددًا.', 'הפרופיל נשמר, אך שם הכניסה לא סונכרן. שמרו שוב.'],
  'reset-sent': ['If an account uses this email, a password reset link has been sent. Check your inbox and spam folder.', 'إذا كان هناك حساب بهذا البريد، فقد أُرسل رابط إعادة تعيين كلمة المرور. افحص البريد الوارد ومجلد الرسائل المزعجة.', 'אם קיים חשבון עם כתובת זו, נשלח קישור לאיפוס סיסמה. בדקו את תיבת הדואר ואת תיקיית הספאם.'],
  'reset-failed': ['Could not send the reset email. Please try again.', 'تعذر إرسال رسالة إعادة التعيين. حاول مجددًا.', 'לא ניתן לשלוח הודעת איפוס. נסו שוב.'],
  'save-failed': ['Could not save your profile. Please try again.', 'تعذر حفظ ملفك. حاول مجددًا.', 'לא ניתן לשמור את הפרופיל. נסו שוב.'],
  'link-failed': ['Could not link this sign-in method. Please try again.', 'تعذر ربط طريقة الدخول. حاول مجددًا.', 'לא ניתן לקשר את שיטת הכניסה. נסו שוב.'],
};

export function authMessage(error, language, fallback = 'save-failed') {
  let key = typeof error === 'string' ? error : error.code || error.message;
  if (['unavailable', 'deadline-exceeded'].includes(key)) key = 'auth/network-request-failed';
  const message = messages[key] || messages[fallback];
  return message[language === 'ar' ? 1 : language === 'he' ? 2 : 0];
}
