import { useLanguage } from "../../context/LanguageContext";

const labels = {
  run: ["Run", "تشغيل", "הרצה"], reset: ["Reset", "إعادة تعيين", "איפוס"],
  output: ["Output", "النتيجة", "פלט"], error: ["Error", "خطأ", "שגיאה"],
  running: ["Running…", "جاري التشغيل...", "מריץ..."], initializing: ["Preparing Python…", "جاري تجهيز Python...", "מכין את Python..."],
  correct: ["Great job! Your answer is correct", "أحسنت! الحل صحيح", "כל הכבוד! התשובה נכונה"],
  incorrect: ["Not quite yet. Try again.", "حاول مرة أخرى", "נסו שוב"],
  preview: ["Preview", "معاينة", "תצוגה מקדימה"], code: ["Code", "الكود", "קוד"],
  clear: ["Clear output", "مسح النتيجة", "ניקוי הפלט"], stop: ["Stop", "إيقاف", "עצירה"],
  idle: ["Run your code to see the result.", "شغّل الكود لرؤية النتيجة.", "הריצו את הקוד כדי לראות את התוצאה."],
  timeout: ["Time is up. Check for an endless loop and try again.", "انتهى الوقت. تأكّد من عدم وجود حلقة لا نهائية وحاول مجددًا.", "הזמן נגמר. בדקו אם קיימת לולאה אינסופית ונסו שוב."],
  initialization: ["The runtime could not load. Check your connection and try again.", "تعذر تحميل بيئة التشغيل. تحقّق من الاتصال وحاول مجددًا.", "לא ניתן לטעון את סביבת ההרצה. בדקו את החיבור ונסו שוב."],
  stopped: ["Execution stopped.", "تم إيقاف التشغيل.", "ההרצה נעצרה."],
  editorLoading: ["Loading editor…", "جاري تحميل المحرر...", "טוען את העורך..."],
  completeToEarn: ["XP is awarded once when you complete the lesson.", "تُضاف النقاط مرة واحدة عند إكمال الدرس.", "הנקודות מוענקות פעם אחת בהשלמת השיעור."],
  noOutput: ["Finished with no output.", "اكتمل التشغيل دون مخرجات.", "ההרצה הסתיימה ללא פלט."],
  enable: ["Enable code runner", "تفعيل محرر الكود", "הפעלת עורך קוד"],
  language: ["Language", "اللغة", "שפה"], starter: ["Starter code", "الكود المبدئي", "קוד התחלתי"],
  validate: ["Check expected output", "التحقق من النتيجة المتوقعة", "בדיקת הפלט הצפוי"],
  expected: ["Expected output", "النتيجة المتوقعة", "הפלט הצפוי"],
  authorNote: ["Use the lesson XP reward. Web projects are completed after previewing; output checking applies to Python and JavaScript.", "استخدم نقاط الدرس. تُستكمل مشاريع الويب بعد معاينتها؛ التحقق من المخرجات متاح لـ Python وJavaScript.", "השתמשו בניקוד השיעור. פרויקטי ווב מושלמים לאחר תצוגה מקדימה; בדיקת פלט זמינה ב-Python וב-JavaScript."],
  savingError: ["Progress could not be saved. Run again to retry.", "تعذر حفظ التقدم. شغّل مجددًا للمحاولة.", "לא ניתן לשמור את ההתקדמות. הריצו שוב כדי לנסות מחדש."],
  webNote: ["External resources and network requests are disabled in this preview.", "الموارد الخارجية وطلبات الشبكة معطّلة في هذه المعاينة.", "משאבים חיצוניים ובקשות רשת מושבתים בתצוגה זו."],
};
export function useCodeText() {
  const { language } = useLanguage();
  const index = language === "ar" ? 1 : language === "he" ? 2 : 0;
  return { language, text: key => labels[key]?.[index] || key };
}
