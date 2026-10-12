// Temporary one-off generator. Rebuilds TechMinds_Grade1_Math.js sections into
// the MissionPlayer-compatible schema (story/explain/multipleChoice/sequence).
// Run with: node functions/content/_buildGrade1Math.mjs
// Deleted after use; not part of the shipped content pipeline.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mathGrade1Program } from './TechMinds_Grade1_Math.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sym = {
  gt: { id: 'gt', ar: 'أكبر من (>)', en: 'Greater than (>)', he: 'גדול מ (>)' },
  lt: { id: 'lt', ar: 'أصغر من (<)', en: 'Less than (<)', he: 'קטן מ (<)' },
  eq: { id: 'eq', ar: 'يساوي (=)', en: 'Equal to (=)', he: 'שווה ל (=)' },
};

const num = (n) => ({ id: `n${n}`, ar: String(n), en: String(n), he: String(n) });

const seq = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    items: values.map((v, i) => ({ id: `v${i}-${v}`, text: { ar: String(v), en: String(v), he: String(v) } })),
    correctOrder: sorted.map((v) => {
      const i = values.indexOf(v);
      return `v${i}-${v}`;
    }),
  };
};

// seq() above breaks when duplicate values exist; none of our sequences repeat values.

const extra = {};

extra[1] = {
  hook: {
    en: 'Ready? Today\'s goal: recognize quantities and numbers 0-10, and match each number symbol to its quantity.',
    he: 'מוכנים? המטרה שלנו היום: להכיר כמויות ומספרים 0-10 ולהתאים כל ספרה לכמות שלה.',
  },
  learn: {
    en: ['Counting groups from 0 to 10', 'Matching a number to its quantity', 'Understanding the meaning of zero'],
    he: ['ספירת קבוצות מ-0 עד 10', 'התאמת מספר לכמות', 'הבנת המשמעות של אפס'],
  },
  questions: [
    {
      en: '🍎🍎🍎 = ?', he: '🍎🍎🍎 = ?',
      options: [num(2), num(3), num(4)], correct: 'n3',
      explanation: { ar: 'هناك ثلاث تفاحات، لذلك الجواب 3.', en: 'There are three apples, so the answer is 3.', he: 'יש שלושה תפוחים, לכן התשובה היא 3.' },
      skills: ['counting'],
    },
    {
      en: 'Which picture shows the number 0?', he: 'איזו תמונה מראה את המספר 0?',
      options: [
        { id: 'one', ar: '🍎 ', en: '🍎 ', he: '🍎 ' },
        { id: 'zero', ar: '🍽️', en: '🍽️ (Empty plate)', he: '🍽️ (צלחת ריקה -)' },
        { id: 'two', ar: '🍎🍎 ', en: '🍎🍎 ', he: '🍎🍎 ' },
      ], correct: 'zero',
      explanation: { ar: 'الصفر يعني مجموعة فارغة — لا يوجد فيها أي تفاح.', en: 'Zero means an empty group - no apples at all.', he: 'אפס פירושו קבוצה ריקה - אין בה אף תפוח.' },
      skills: ['numberSense'],
    },
    {
      en: 'How many stars are there? ⭐⭐⭐⭐⭐⭐⭐', he: 'כמה כוכבים יש? ⭐⭐⭐⭐⭐⭐⭐',
      options: [num(6), num(7), num(8)], correct: 'n7',
      explanation: { ar: 'عدّ النجوم واحدة تلو الأخرى: يوجد 7.', en: 'Count the stars one by one: there are 7.', he: 'ספרו את הכוכבים אחד אחד: יש 7.' },
      skills: ['counting'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'عدّ المجموعة: 🍎🍎🍎🍎🍎🍎 — كم العدد؟', en: 'Count the group: 🍎🍎🍎🍎🍎🍎 - what is the number?', he: 'ספרו את הקבוצה: 🍎🍎🍎🍎🍎🍎 - מה המספר?' },
    options: [num(5), num(6), num(7)], correct: 'n6',
    explanation: { ar: 'عد التفاحات واحدة تلو الأخرى يعطينا 6.', en: 'Counting the apples one by one gives us 6.', he: 'ספירת התפוחים אחד אחד נותנת לנו 6.' },
    skills: ['counting'],
  },
};

extra[2] = {
  hook: {
    en: 'Ready? Today\'s goal: strengthen counting forward and match each item to one count.',
    he: 'מוכנים? המטרה שלנו היום: לחזק את הספירה הרציפה ולהתאים כל פריט למספר אחד.',
  },
  learn: {
    en: ['Counting from 0 to 10', 'Counting one object at a time', 'Building a requested quantity'],
    he: ['ספירה מ-0 עד 10', 'ספירה פריט אחר פריט', 'יצירת כמות מבוקשת'],
  },
  questions: [
    {
      en: 'Count the circles: ⚪⚪⚪⚪⚪⚪⚪⚪', he: 'ספרו את העיגולים: ⚪⚪⚪⚪⚪⚪⚪⚪',
      options: [num(7), num(8), num(9)], correct: 'n8',
      explanation: { ar: 'عد الدوائر واحدة تلو الأخرى يعطينا 8.', en: 'Counting the circles one by one gives us 8.', he: 'ספירת העיגולים אחד אחד נותנת לנו 8.' },
      skills: ['counting'],
    },
    {
      en: 'Which group has exactly 5 blocks?', he: 'באיזו קבוצה יש בדיוק 5 קוביות?',
      options: [
        { id: 'four', ar: '🟦🟦🟦🟦 ', en: '🟦🟦🟦🟦 ', he: '🟦🟦🟦🟦 ' },
        { id: 'five', ar: '🟦🟦🟦🟦🟦 ', en: '🟦🟦🟦🟦🟦 ', he: '🟦🟦🟦🟦🟦 ' },
        { id: 'six', ar: '🟦🟦🟦🟦🟦🟦 ', en: '🟦🟦🟦🟦🟦🟦 ', he: '🟦🟦🟦🟦🟦🟦 ' },
      ], correct: 'five',
      explanation: { ar: 'المجموعة التي فيها خمسة مكعبات هي الصحيحة.', en: 'The group with five blocks is the correct one.', he: 'הקבוצה עם חמש קוביות היא הנכונה.' },
      skills: ['counting'],
    },
    {
      en: 'Count this group: ⭐⭐⭐⭐⭐⭐⭐ ?', he: 'ספרו את הקבוצה: ⭐⭐⭐⭐⭐⭐⭐ ?',
      options: [num(6), num(7), num(8)], correct: 'n7',
      explanation: { ar: 'يوجد 7 نجوم في هذه المجموعة.', en: 'There are 7 stars in this group.', he: 'יש 7 כוכבים בקבוצה הזו.' },
      skills: ['counting'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'أي روبوت حصل على عشر بطاريات بالضبط؟', en: 'Which robot got exactly ten batteries?', he: 'לאיזה רובוט יש בדיוק עשר סוללות?' },
    options: [
      { id: 'four', ar: '🔋🔋🔋🔋 ', en: '🔋🔋🔋🔋 ', he: '🔋🔋🔋🔋 ' },
      { id: 'seven', ar: '🔋🔋🔋🔋🔋🔋🔋 ', en: '🔋🔋🔋🔋🔋🔋🔋 ', he: '🔋🔋🔋🔋🔋🔋🔋 ' },
      { id: 'ten', ar: '🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 ', en: '🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 ', he: '🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 ' },
    ], correct: 'ten',
    explanation: { ar: 'الروبوت الذي لديه عشر بطاريات هو الذي يحتاجه الروبوت.', en: 'The robot with ten batteries is the one we need.', he: 'הרובוט עם עשר הסוללות הוא זה שצריך.' },
    skills: ['counting'],
  },
};

extra[4] = {
  hook: {
    en: 'Ready? Today\'s goal: compare quantities and numbers using greater than, less than, and equal to.',
    he: 'מוכנים? המטרה שלנו היום: להשוות כמויות ומספרים באמצעות גדול מ, קטן מ ושווה ל.',
  },
  learn: {
    en: ['Comparing two groups', 'Comparing two numbers', 'Understanding equality'],
    he: ['השוואת שתי קבוצות', 'השוואת שני מספרים', 'הבנת השוויון'],
  },
  questions: [
    {
      en: '7 __ 4', he: '7 __ 4',
      options: [sym.gt, sym.lt, sym.eq], correct: 'gt',
      explanation: { ar: '7 أكبر من 4.', en: '7 is greater than 4.', he: '7 גדול מ-4.' },
      skills: ['comparing'],
    },
    {
      en: '3 __ 3', he: '3 __ 3',
      options: [sym.gt, sym.lt, sym.eq], correct: 'eq',
      explanation: { ar: '3 يساوي 3.', en: '3 equals 3.', he: '3 שווה ל-3.' },
      skills: ['comparing'],
    },
    {
      en: 'Which group is greater: 5 or 8?', he: 'איזו קבוצה גדולה יותר: 5 או 8?',
      options: [num(5), num(8)], correct: 'n8',
      explanation: { ar: '8 أكبر من 5.', en: '8 is greater than 5.', he: '8 גדול מ-5.' },
      skills: ['comparing'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'اختر الرمز الصحيح: 10 __ 7', en: 'Choose the correct symbol: 10 __ 7', he: 'בחרו את הסימן הנכון: 10 __ 7' },
    options: [sym.gt, sym.lt, sym.eq], correct: 'gt',
    explanation: { ar: '10 أكبر من 7.', en: '10 is greater than 7.', he: '10 גדול מ-7.' },
    skills: ['comparing'],
  },
};

extra[5] = {
  hook: {
    en: 'Ready? Today\'s goal: order numbers from smallest to largest and from largest to smallest.',
    he: 'מוכנים? המטרה שלנו היום: לסדר מספרים מהקטן לגדול ומהגדול לקטן.',
  },
  learn: {
    en: ['Smallest and largest', 'Ordering 3-5 numbers', 'Checking with a number line'],
    he: ['הקטן ביותר והגדול ביותר', 'סידור 3-5 מספרים', 'בדיקה בעזרת ישר המספרים'],
  },
  questions: [
    {
      type: 'sequence',
      en: 'Put these numbers in order from smallest to largest: 6, 2, 9', he: 'סדרו את המספרים האלה מהקטן לגדול: 6, 2, 9',
      ...seq([6, 2, 9]),
      explanation: { ar: 'الترتيب التصاعدي الصحيح هو 2، 6، 9.', en: 'The correct ascending order is 2, 6, 9.', he: 'הסדר העולה הנכון הוא 2, 6, 9.' },
      skills: ['ordering'],
    },
    {
      en: 'What is the smallest of 4, 7, 1?', he: 'מה הקטן ביותר מבין 4, 7, 1?',
      options: [num(1), num(4), num(7)], correct: 'n1',
      explanation: { ar: 'أصغر الأعداد هو 1.', en: 'The smallest number is 1.', he: 'המספר הקטן ביותר הוא 1.' },
      skills: ['comparing'],
    },
    {
      en: 'What is the greatest of 3, 8, 5?', he: 'מה הגדול ביותר מבין 3, 8, 5?',
      options: [num(3), num(5), num(8)], correct: 'n8',
      explanation: { ar: 'أكبر الأعداد هو 8.', en: 'The greatest number is 8.', he: 'המספר הגדול ביותר הוא 8.' },
      skills: ['comparing'],
    },
  ],
  challenge: {
    type: 'sequence',
    text: { ar: 'رتّب خمس بطاقات من الأصغر إلى الأكبر: 7، 2، 9، 4، 1', en: 'Order five cards from smallest to largest: 7, 2, 9, 4, 1', he: 'סדרו חמישה כרטיסים מהקטן לגדול: 7, 2, 9, 4, 1' },
    ...seq([7, 2, 9, 4, 1]),
    explanation: { ar: 'الترتيب الصحيح هو 1، 2، 4، 7، 9.', en: 'The correct order is 1, 2, 4, 7, 9.', he: 'הסדר הנכון הוא 1, 2, 4, 7, 9.' },
    skills: ['ordering'],
  },
};

extra[6] = {
  hook: {
    en: 'Ready? Today\'s goal: use the number line to understand position, moving forward and backward.',
    he: 'מוכנים? המטרה שלנו היום: להשתמש בישר המספרים כדי להבין מיקום, התקדמות וחזרה.',
  },
  learn: {
    en: ['Finding the position of a number', 'A step forward', 'A step backward'],
    he: ['איתור מיקום של מספר', 'צעד קדימה', 'צעד אחורה'],
  },
  questions: [
    {
      en: 'On a number line from 0 to 10, where is the number 9?', he: 'על ישר מספרים מ-0 עד 10, היכן נמצא המספר 9?',
      options: [
        { id: 'start', ar: 'قرب البداية (قرب 0)', en: 'Near the start (near 0)', he: 'קרוב להתחלה (קרוב ל-0)' },
        { id: 'middle', ar: 'في المنتصف (قرب 5)', en: 'In the middle (near 5)', he: 'באמצע (קרוב ל-5)' },
        { id: 'end', ar: 'قرب النهاية (قرب 10)', en: 'Near the end (near 10)', he: 'קרוב לסוף (קרוב ל-10)' },
      ], correct: 'end',
      explanation: { ar: '9 قريب جدًا من 10، لذلك يقع قرب نهاية الخط.', en: '9 is very close to 10, so it sits near the end of the line.', he: '9 קרוב מאוד ל-10, לכן הוא נמצא קרוב לסוף הישר.' },
      skills: ['numberLine'],
    },
    {
      en: '4 + one step forward = ?', he: '4 + צעד אחד קדימה = ?',
      options: [num(3), num(5), num(6)], correct: 'n5',
      explanation: { ar: 'خطوة للأمام تعني +1، لذلك 4+1=5.', en: 'A step forward means +1, so 4 + 1 = 5.', he: 'צעד קדימה פירושו +1, לכן 4+1=5.' },
      skills: ['numberLine'],
    },
    {
      en: '7 - one step backward = ?', he: '7 - צעד אחד אחורה = ?',
      options: [num(5), num(6), num(7)], correct: 'n6',
      explanation: { ar: 'خطوة للخلف تعني -1، لذلك 7-1=6.', en: 'A step backward means -1, so 7 - 1 = 6.', he: 'צעד אחורה פירושו -1, לכן 7-1=6.' },
      skills: ['numberLine'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'الشخصية عند 3 وتريد الوصول إلى 6. كم خطوة للأمام تحتاج؟', en: 'The character is at 3 and needs to reach 6. How many steps forward are needed?', he: 'הדמות נמצאת ב-3 וצריכה להגיע ל-6. כמה צעדים קדימה נדרשים?' },
    options: [num(2), num(3), num(4)], correct: 'n3',
    explanation: { ar: 'من 3 إلى 6 المسافة 3 خطوات.', en: 'From 3 to 6 is a distance of 3 steps.', he: 'מ-3 ל-6 המרחק הוא 3 צעדים.' },
    skills: ['numberLine'],
  },
};

extra[7] = {
  hook: {
    en: 'Ready? Today\'s goal: understand that a number can be composed of two parts in many ways.',
    he: 'מוכנים? המטרה שלנו היום: להבין שמספר יכול להיות מורכב משני חלקים בדרכים שונות.',
  },
  learn: {
    en: ['Decomposing numbers up to 10', 'Composing from two parts', 'Different combinations'],
    he: ['פירוק מספרים עד 10', 'הרכבה משני חלקים', 'הרכבים שונים'],
  },
  questions: [
    {
      en: '6 = 2 + ?', he: '6 = 2 + ?',
      options: [num(3), num(4), num(5)], correct: 'n4',
      explanation: { ar: '2+4=6.', en: '2 + 4 = 6.', he: '2+4=6.' },
      skills: ['decomposition'],
    },
    {
      en: '5 + ? = 8', he: '5 + ? = 8',
      options: [num(2), num(3), num(4)], correct: 'n3',
      explanation: { ar: '5+3=8.', en: '5 + 3 = 8.', he: '5+3=8.' },
      skills: ['decomposition'],
    },
    {
      en: 'Which pair makes 10?', he: 'איזה זוג יוצר 10?',
      options: [
        { id: 'a', ar: '4 و6', en: '4 and 6', he: '4 ו-6' },
        { id: 'b', ar: '3 و5', en: '3 and 5', he: '3 ו-5' },
        { id: 'c', ar: '7 و2', en: '7 and 2', he: '7 ו-2' },
      ], correct: 'a',
      explanation: { ar: '4+6=10.', en: '4 + 6 = 10.', he: '4+6=10.' },
      skills: ['decomposition'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'أي من هذه الأزواج لا يُكوّن العدد 8؟', en: 'Which of these pairs does NOT make the number 8?', he: 'איזה מהזוגות האלה אינו יוצר את המספר 8?' },
    options: [
      { id: 'a', ar: '6 و2', en: '6 and 2', he: '6 ו-2' },
      { id: 'b', ar: '4 و4', en: '4 and 4', he: '4 ו-4' },
      { id: 'c', ar: '5 و4', en: '5 and 4', he: '5 ו-4' },
    ], correct: 'c',
    explanation: { ar: '5+4=9 وليس 8، لذلك هذا الزوج هو الاستثناء.', en: '5 + 4 = 9, not 8, so this pair is the exception.', he: '5+4=9 ולא 8, לכן זהו הזוג היוצא מהכלל.' },
    skills: ['decomposition'],
  },
};

extra[8] = {
  hook: {
    en: 'Ready? Today\'s goal: build the meaning of addition as joining two groups together.',
    he: 'מוכנים? המטרה שלנו היום: לבנות את המשמעות של חיבור כצירוף של שתי קבוצות.',
  },
  learn: {
    en: ['The meaning of addition', 'The two parts and the total', 'An addition sentence'],
    he: ['המשמעות של חיבור', 'שני החלקים והסכום', 'משפט חיבור'],
  },
  questions: [
    {
      en: '2 + 4 = ?', he: '2 + 4 = ?',
      options: [num(5), num(6), num(7)], correct: 'n6',
      explanation: { ar: '2+4=6.', en: '2 + 4 = 6.', he: '2+4=6.' },
      skills: ['addition'],
    },
    {
      en: '3 balloons + 2 balloons = ?', he: '3 בלונים + 2 בלונים = ?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '3 بالونات و2 بالونات تصبح 5 بالونات.', en: '3 balloons and 2 balloons make 5 balloons.', he: '3 בלונים ועוד 2 בלונים הם 5 בלונים.' },
      skills: ['addition'],
    },
    {
      en: '🎈🎈🎈🎈 + 🎈 = how many balloons?', he: '🎈🎈🎈🎈 + 🎈 = כמה בלונים?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '4 بالونات وبالون واحد يصبح المجموع 5.', en: '4 balloons plus one more balloon make a total of 5.', he: '4 בלונים ועוד בלון אחד נותנים סך הכול 5.' },
      skills: ['addition'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'في السلة 6 كرات، أضفنا 3 كرات أخرى. كم كرة الآن؟', en: 'The basket has 6 balls, we added 3 more. How many balls now?', he: 'בסל יש 6 כדורים, הוספנו עוד 3. כמה כדורים יש עכשיו?' },
    options: [num(8), num(9), num(10)], correct: 'n9',
    explanation: { ar: '6+3=9.', en: '6 + 3 = 9.', he: '6+3=9.' },
    skills: ['addition'],
  },
};

extra[9] = {
  hook: {
    en: 'Ready? Today\'s goal: use varied strategies for addition within 10.',
    he: 'מוכנים? המטרה שלנו היום: להשתמש באסטרטגיות מגוונות לחיבור עד 10.',
  },
  learn: {
    en: ['Counting on', 'The ten-frame', 'Familiar combinations'],
    he: ['ספירה קדימה', 'מסגרת העשר', 'הרכבים מוכרים'],
  },
  questions: [
    {
      en: '6 + 3 = ?', he: '6 + 3 = ?',
      options: [num(8), num(9), num(10)], correct: 'n9',
      explanation: { ar: '6+3=9.', en: '6 + 3 = 9.', he: '6+3=9.' },
      skills: ['addition'],
    },
    {
      en: '5 + 5 = ?', he: '5 + 5 = ?',
      options: [num(9), num(10), num(11)], correct: 'n10',
      explanation: { ar: '5+5=10.', en: '5 + 5 = 10.', he: '5+5=10.' },
      skills: ['addition'],
    },
    {
      en: 'Which is greater: 2+4 or 3+4?', he: 'מה גדול יותר: 2+4 או 3+4?',
      options: [
        { id: 'a', ar: '2+4', en: '2+4', he: '2+4' },
        { id: 'b', ar: '3+4', en: '3+4', he: '3+4' },
        { id: 'c', ar: 'متساويان', en: 'They are equal', he: 'הם שווים' },
      ], correct: 'b',
      explanation: { ar: '2+4=6 و3+4=7، لذلك 3+4 أكبر.', en: '2+4=6 and 3+4=7, so 3+4 is greater.', he: '2+4=6 ו-3+4=7, לכן 3+4 גדול יותר.' },
      skills: ['addition', 'comparing'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'لفتح البوابة، أجب: 7+2=؟', en: 'To open the gate, answer: 7 + 2 = ?', he: 'כדי לפתוח את השער, ענו: 7+2=?' },
    options: [num(8), num(9), num(10)], correct: 'n9',
    explanation: { ar: '7+2=9.', en: '7 + 2 = 9.', he: '7+2=9.' },
    skills: ['addition'],
  },
};

extra[10] = {
  hook: {
    en: 'Ready? Today\'s goal: combine the skills from Stage 1.',
    he: 'מוכנים? המטרה שלנו היום: לשלב את המיומנויות משלב 1.',
  },
  learn: {
    en: ['Counting', 'Comparing and ordering', 'Decomposing and adding'],
    he: ['ספירה', 'השוואה וסידור', 'פירוק וחיבור'],
  },
  questions: [
    {
      type: 'sequence',
      en: 'Put these numbers in order from smallest to largest: 3, 8, 1', he: 'סדרו את המספרים האלה מהקטן לגדול: 3, 8, 1',
      ...seq([3, 8, 1]),
      explanation: { ar: 'الترتيب الصحيح هو 1، 3، 8.', en: 'The correct order is 1, 3, 8.', he: 'הסדר הנכון הוא 1, 3, 8.' },
      skills: ['ordering'],
    },
    {
      en: '7 = 5 + ?', he: '7 = 5 + ?',
      options: [num(1), num(2), num(3)], correct: 'n2',
      explanation: { ar: '5+2=7.', en: '5 + 2 = 7.', he: '5+2=7.' },
      skills: ['decomposition'],
    },
    {
      en: '4 + 3 = ?', he: '4 + 3 = ?',
      options: [num(6), num(7), num(8)], correct: 'n7',
      explanation: { ar: '4+3=7.', en: '4 + 3 = 7.', he: '4+3=7.' },
      skills: ['addition'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'في المحطة الأخيرة: 9-2=؟', en: 'At the final station: 9 - 2 = ?', he: 'בתחנה האחרונה: 9-2=?' },
    options: [num(6), num(7), num(8)], correct: 'n7',
    explanation: { ar: '9-2=7.', en: '9 - 2 = 7.', he: '9-2=7.' },
    skills: ['subtraction'],
  },
};

extra[3] = {
  hook: {
    en: 'Ready? Today\'s goal: understand before and after, and the order of numbers.',
    he: 'מוכנים? המטרה שלנו היום: להבין מה לפני ומה אחרי, ואת סדר המספרים.',
  },
  learn: {
    en: ['Before and after', 'Completing a sequence', 'Adding or removing 1'],
    he: ['לפני ואחרי', 'השלמת רצף', 'הוספה או הורדה של 1'],
  },
  questions: [
    {
      en: '__, 4, 5 - what comes before 4?', he: '__, 4, 5 - מה בא לפני 4?',
      options: [num(2), num(3), num(4)], correct: 'n3',
      explanation: { ar: 'العدد الذي يسبق 4 مباشرة هو 3.', en: 'The number right before 4 is 3.', he: 'המספר שבא ישר לפני 4 הוא 3.' },
      skills: ['sequencing'],
    },
    {
      en: 'What number comes after 8?', he: 'מה המספר שבא אחרי 8?',
      options: [num(7), num(9), num(10)], correct: 'n9',
      explanation: { ar: 'العدد الذي يأتي بعد 8 هو 9.', en: 'The number that comes after 8 is 9.', he: 'המספר שבא אחרי 8 הוא 9.' },
      skills: ['sequencing'],
    },
    {
      en: 'What number comes before 1?', he: 'מה המספר שבא לפני 1?',
      options: [num(0), num(1), num(2)], correct: 'n0',
      explanation: { ar: 'العدد الذي يسبق 1 هو 0.', en: 'The number before 1 is 0.', he: 'המספר שלפני 1 הוא 0.' },
      skills: ['sequencing'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'قطار الأعداد: 5، 6، __، 8، 9 — ما العدد الناقص؟', en: 'Number train: 5, 6, __, 8, 9 - what is the missing number?', he: 'רכבת המספרים: 5, 6, __, 8, 9 - מה המספר החסר?' },
    options: [num(6), num(7), num(8)], correct: 'n7',
    explanation: { ar: 'العدد بين 6 و8 هو 7.', en: 'The number between 6 and 8 is 7.', he: 'המספר שבין 6 ל-8 הוא 7.' },
    skills: ['sequencing'],
  },
};

extra[11] = {
  hook: {
    en: 'Ready? Today\'s goal: understand subtraction as removing and what remains.',
    he: 'מוכנים? המטרה שלנו היום: להבין חיסור כהסרה וכמה נשאר.',
  },
  learn: {
    en: ['The meaning of subtraction', 'What was removed and what remains', 'A subtraction sentence'],
    he: ['המשמעות של חיסור', 'מה הוסר ומה נשאר', 'משפט חיסור'],
  },
  questions: [
    {
      en: '7 - 2 = ?', he: '7 - 2 = ?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '7-2=5.', en: '7 - 2 = 5.', he: '7-2=5.' },
      skills: ['subtraction'],
    },
    {
      en: '6 apples - 1 apple = ?', he: '6 תפוחים - תפוח אחד = ?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '6 تفاحات ناقص تفاحة واحدة تبقي 5.', en: '6 apples minus 1 apple leaves 5.', he: '6 תפוחים פחות תפוח אחד משאירים 5.' },
      skills: ['subtraction'],
    },
    {
      en: '🍎🍎🍎🍎🍎 - we removed 3 - how many remain?', he: '🍎🍎🍎🍎🍎 - הסרנו 3 - כמה נשארו?',
      options: [num(1), num(2), num(3)], correct: 'n2',
      explanation: { ar: '5-3=2.', en: '5 - 3 = 2.', he: '5-3=2.' },
      skills: ['subtraction'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'كان معه 8 بالونات وطار 3. كم بقي؟', en: 'He had 8 balloons and 3 flew away. How many remain?', he: 'היו לו 8 בלונים ו-3 עפו. כמה נשארו?' },
    options: [num(4), num(5), num(6)], correct: 'n5',
    explanation: { ar: '8-3=5.', en: '8 - 3 = 5.', he: '8-3=5.' },
    skills: ['subtraction'],
  },
};

extra[12] = {
  hook: {
    en: 'Ready? Today\'s goal: solve subtraction within 10 using clear strategies.',
    he: 'מוכנים? המטרה שלנו היום: לפתור חיסור עד 10 באסטרטגיות ברורות.',
  },
  learn: {
    en: ['Counting back', 'The connection to addition', 'The number line'],
    he: ['ספירה לאחור', 'הקשר לחיבור', 'ישר המספרים'],
  },
  questions: [
    {
      en: '9 - 4 = ?', he: '9 - 4 = ?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '9-4=5.', en: '9 - 4 = 5.', he: '9-4=5.' },
      skills: ['subtraction'],
    },
    {
      en: '10 - 6 = ?', he: '10 - 6 = ?',
      options: [num(3), num(4), num(5)], correct: 'n4',
      explanation: { ar: '10-6=4.', en: '10 - 6 = 4.', he: '10-6=4.' },
      skills: ['subtraction'],
    },
    {
      en: '7 - 7 = ?', he: '7 - 7 = ?',
      options: [num(0), num(1), num(2)], correct: 'n0',
      explanation: { ar: '7-7=0.', en: '7 - 7 = 0.', he: '7-7=0.' },
      skills: ['subtraction'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'حل: 8-5=؟', en: 'Solve: 8 - 5 = ?', he: 'פתרו: 8-5=?' },
    options: [num(2), num(3), num(4)], correct: 'n3',
    explanation: { ar: '8-5=3.', en: '8 - 5 = 3.', he: '8-5=3.' },
    skills: ['subtraction'],
  },
};

extra[13] = {
  hook: {
    en: 'Ready? Today\'s goal: understand the inverse relationship between addition and subtraction.',
    he: 'מוכנים? המטרה שלנו היום: להבין את הקשר ההפוך בין חיבור לחיסור.',
  },
  learn: {
    en: ['Related facts', 'Checking with addition', 'Correct sentences'],
    he: ['עובדות קשורות', 'בדיקה בעזרת חיבור', 'משפטים נכונים'],
  },
  questions: [
    {
      en: 'Build an addition sentence from 2, 6, 8', he: 'בנו משפט חיבור מהמספרים 2, 6, 8',
      options: [
        { id: 'a', ar: '2+6=8', en: '2+6=8', he: '2+6=8' },
        { id: 'b', ar: '2+8=6', en: '2+8=6', he: '2+8=6' },
        { id: 'c', ar: '6+8=2', en: '6+8=2', he: '6+8=2' },
      ], correct: 'a',
      explanation: { ar: '2+6=8 هي الجملة الصحيحة.', en: '2+6=8 is the correct sentence.', he: '2+6=8 הוא המשפט הנכון.' },
      skills: ['factFamilies'],
    },
    {
      en: '8 - 6 = ?', he: '8 - 6 = ?',
      options: [num(1), num(2), num(3)], correct: 'n2',
      explanation: { ar: '8-6=2.', en: '8 - 6 = 2.', he: '8-6=2.' },
      skills: ['subtraction'],
    },
    {
      en: 'Which fact helps solve 7 - 3 = ?', he: 'איזו עובדה עוזרת לפתור 7-3=?',
      options: [
        { id: 'a', ar: '4+3=7', en: '4+3=7', he: '4+3=7' },
        { id: 'b', ar: '7+3=10', en: '7+3=10', he: '7+3=10' },
        { id: 'c', ar: '3-3=0', en: '3-3=0', he: '3-3=0' },
      ], correct: 'a',
      explanation: { ar: '4+3=7 يساعدنا لنعرف أن 7-3=4.', en: '4+3=7 helps us know that 7-3=4.', he: '4+3=7 עוזר לנו לדעת ש-7-3=4.' },
      skills: ['factFamilies'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'أي جملة تنتمي إلى عائلة عمليات 3، 5، 8؟', en: 'Which sentence belongs to the 3, 5, 8 fact family?', he: 'איזה משפט שייך למשפחת העובדות 3, 5, 8?' },
    options: [
      { id: 'a', ar: '3+5=8', en: '3+5=8', he: '3+5=8' },
      { id: 'b', ar: '5+8=3', en: '5+8=3', he: '5+8=3' },
      { id: 'c', ar: '8+3=5', en: '8+3=5', he: '8+3=5' },
    ], correct: 'a',
    explanation: { ar: '3+5=8 هي جملة صحيحة ضمن هذه العائلة.', en: '3+5=8 is a correct sentence in this fact family.', he: '3+5=8 הוא משפט נכון במשפחה הזו.' },
    skills: ['factFamilies'],
  },
};

extra[14] = {
  hook: {
    en: 'Ready? Today\'s goal: master making ten as a number-sense strategy.',
    he: 'מוכנים? המטרה שלנו היום: לשלוט בהשלמה ל-10 כאסטרטגיית חשיבה מספרית.',
  },
  learn: {
    en: ['The complement to 10', 'The ten-frame', 'Pairs that make 10'],
    he: ['המשלים ל-10', 'מסגרת העשר', 'זוגות שיוצרים 10'],
  },
  questions: [
    {
      en: '7 + ? = 10', he: '7 + ? = 10',
      options: [num(2), num(3), num(4)], correct: 'n3',
      explanation: { ar: '7+3=10.', en: '7 + 3 = 10.', he: '7+3=10.' },
      skills: ['makeTen'],
    },
    {
      en: '10 - 6 = ?', he: '10 - 6 = ?',
      options: [num(3), num(4), num(5)], correct: 'n4',
      explanation: { ar: '10-6=4.', en: '10 - 6 = 4.', he: '10-6=4.' },
      skills: ['makeTen'],
    },
    {
      en: 'Which pair makes 10?', he: 'איזה זוג יוצר 10?',
      options: [
        { id: 'a', ar: '6 و4', en: '6 and 4', he: '6 ו-4' },
        { id: 'b', ar: '5 و4', en: '5 and 4', he: '5 ו-4' },
        { id: 'c', ar: '7 و2', en: '7 and 2', he: '7 ו-2' },
      ], correct: 'a',
      explanation: { ar: '6+4=10.', en: '6 + 4 = 10.', he: '6+4=10.' },
      skills: ['makeTen'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: '9+?=10', en: '9 + ? = 10', he: '9+?=10' },
    options: [num(0), num(1), num(2)], correct: 'n1',
    explanation: { ar: '9+1=10.', en: '9 + 1 = 10.', he: '9+1=10.' },
    skills: ['makeTen'],
  },
};

extra[15] = {
  hook: {
    en: 'Ready? Today\'s goal: understand numbers 11-20 as ten and some ones.',
    he: 'מוכנים? המטרה שלנו היום: להבין מספרים 11-20 כעשרה ויחידות.',
  },
  learn: {
    en: ['Reading and writing 11-20', 'Ten and ones', 'Counting forward and backward'],
    he: ['קריאה וכתיבה של 11-20', 'עשרה ויחידות', 'ספירה קדימה ואחורה'],
  },
  questions: [
    {
      en: '10 + 6 = ?', he: '10 + 6 = ?',
      options: [num(15), num(16), num(17)], correct: 'n16',
      explanation: { ar: '10+6=16.', en: '10 + 6 = 16.', he: '10+6=16.' },
      skills: ['placeValue'],
    },
    {
      en: '18 = ten and how many ones?', he: '18 = עשרה וכמה יחידות?',
      options: [num(7), num(8), num(9)], correct: 'n8',
      explanation: { ar: '18=10+8.', en: '18 = 10 + 8.', he: '18=10+8.' },
      skills: ['placeValue'],
    },
    {
      en: 'What comes after 19?', he: 'מה בא אחרי 19?',
      options: [num(18), num(20), num(21)], correct: 'n20',
      explanation: { ar: 'العدد الذي يأتي بعد 19 هو 20.', en: 'The number after 19 is 20.', he: 'המספר שבא אחרי 19 הוא 20.' },
      skills: ['sequencing'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'القطار الناقص: 11، 12، __، 14، 15 — ما العدد الناقص؟', en: 'Missing number train: 11, 12, __, 14, 15 - what is missing?', he: 'רכבת המספרים החסרה: 11, 12, __, 14, 15 - מה חסר?' },
    options: [num(12), num(13), num(14)], correct: 'n13',
    explanation: { ar: 'العدد بين 12 و14 هو 13.', en: 'The number between 12 and 14 is 13.', he: 'המספר שבין 12 ל-14 הוא 13.' },
    skills: ['sequencing'],
  },
};

extra[16] = {
  hook: {
    en: 'Ready? Today\'s goal: compare and order numbers up to 20.',
    he: 'מוכנים? המטרה שלנו היום: להשוות ולסדר מספרים עד 20.',
  },
  learn: {
    en: ['Comparing', 'Ordering', 'Before and after'],
    he: ['השוואה', 'סידור', 'לפני ואחרי'],
  },
  questions: [
    {
      en: '17 __ 12', he: '17 __ 12',
      options: [sym.gt, sym.lt, sym.eq], correct: 'gt',
      explanation: { ar: '17 أكبر من 12.', en: '17 is greater than 12.', he: '17 גדול מ-12.' },
      skills: ['comparing'],
    },
    {
      type: 'sequence',
      en: 'Put these numbers in order from smallest to largest: 19, 11, 15', he: 'סדרו את המספרים האלה מהקטן לגדול: 19, 11, 15',
      ...seq([19, 11, 15]),
      explanation: { ar: 'الترتيب الصحيح هو 11، 15، 19.', en: 'The correct order is 11, 15, 19.', he: 'הסדר הנכון הוא 11, 15, 19.' },
      skills: ['ordering'],
    },
    {
      en: 'What number is between 13 and 15?', he: 'איזה מספר נמצא בין 13 ל-15?',
      options: [num(12), num(14), num(16)], correct: 'n14',
      explanation: { ar: 'العدد بين 13 و15 هو 14.', en: 'The number between 13 and 15 is 14.', he: 'המספר שבין 13 ל-15 הוא 14.' },
      skills: ['sequencing'],
    },
  ],
  challenge: {
    type: 'sequence',
    text: { ar: 'رتّب ستة أعداد حتى 20: 18، 11، 15، 20، 13، 16', en: 'Order six numbers up to 20: 18, 11, 15, 20, 13, 16', he: 'סדרו שישה מספרים עד 20: 18, 11, 15, 20, 13, 16' },
    ...seq([18, 11, 15, 20, 13, 16]),
    explanation: { ar: 'الترتيب الصحيح هو 11، 13، 15، 16، 18، 20.', en: 'The correct order is 11, 13, 15, 16, 18, 20.', he: 'הסדר הנכון הוא 11, 13, 15, 16, 18, 20.' },
    skills: ['ordering'],
  },
};

extra[17] = {
  hook: {
    en: 'Ready? Today\'s goal: add within 20 by making ten first.',
    he: 'מוכנים? המטרה שלנו היום: לחבר עד 20 על ידי השלמה ל-10 קודם.',
  },
  learn: {
    en: ['Decomposing a number', 'Making 10', 'Two ten-frames'],
    he: ['פירוק מספר', 'השלמה ל-10', 'שתי מסגרות עשר'],
  },
  questions: [
    {
      en: '9 + 4 = ?', he: '9 + 4 = ?',
      options: [num(12), num(13), num(14)], correct: 'n13',
      explanation: { ar: '9+4=13.', en: '9 + 4 = 13.', he: '9+4=13.' },
      skills: ['addition'],
    },
    {
      en: '7 + 6 = ?', he: '7 + 6 = ?',
      options: [num(12), num(13), num(14)], correct: 'n13',
      explanation: { ar: '7+6=13.', en: '7 + 6 = 13.', he: '7+6=13.' },
      skills: ['addition'],
    },
    {
      en: '10 + 8 = ?', he: '10 + 8 = ?',
      options: [num(17), num(18), num(19)], correct: 'n18',
      explanation: { ar: '10+8=18.', en: '10 + 8 = 18.', he: '10+8=18.' },
      skills: ['addition'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: '8+5=؟', en: '8 + 5 = ?', he: '8+5=?' },
    options: [num(12), num(13), num(14)], correct: 'n13',
    explanation: { ar: '8+5=13.', en: '8 + 5 = 13.', he: '8+5=13.' },
    skills: ['addition'],
  },
};

extra[18] = {
  hook: {
    en: 'Ready? Today\'s goal: subtract within 20 using varied strategies.',
    he: 'מוכנים? המטרה שלנו היום: לחסר עד 20 באסטרטגיות מגוונות.',
  },
  learn: {
    en: ['Going back to 10', 'The number line', 'Checking with addition'],
    he: ['חזרה ל-10', 'ישר המספרים', 'בדיקה בעזרת חיבור'],
  },
  questions: [
    {
      en: '16 - 4 = ?', he: '16 - 4 = ?',
      options: [num(11), num(12), num(13)], correct: 'n12',
      explanation: { ar: '16-4=12.', en: '16 - 4 = 12.', he: '16-4=12.' },
      skills: ['subtraction'],
    },
    {
      en: '12 - 7 = ?', he: '12 - 7 = ?',
      options: [num(4), num(5), num(6)], correct: 'n5',
      explanation: { ar: '12-7=5.', en: '12 - 7 = 5.', he: '12-7=5.' },
      skills: ['subtraction'],
    },
    {
      en: '20 - 9 = ?', he: '20 - 9 = ?',
      options: [num(10), num(11), num(12)], correct: 'n11',
      explanation: { ar: '20-9=11.', en: '20 - 9 = 11.', he: '20-9=11.' },
      skills: ['subtraction'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: '15-8=؟', en: '15 - 8 = ?', he: '15-8=?' },
    options: [num(6), num(7), num(8)], correct: 'n7',
    explanation: { ar: '15-8=7.', en: '15 - 8 = 7.', he: '15-8=7.' },
    skills: ['subtraction'],
  },
};

extra[19] = {
  hook: {
    en: 'Ready? Today\'s goal: solve simple word problems and understand what is asked.',
    he: 'מוכנים? המטרה שלנו היום: לפתור בעיות מילוליות פשוטות ולהבין מה נדרש.',
  },
  learn: {
    en: ['Finding the given information', 'Choosing the operation', 'Writing an answer'],
    he: ['איתור הנתונים', 'בחירת הפעולה', 'כתיבת תשובה'],
  },
  questions: [
    {
      en: 'Lian has 7 pens and got 5 more. How many does she have now?', he: 'ללִיאן יש 7 עטים וקיבלה עוד 5. כמה יש לה עכשיו?',
      options: [num(11), num(12), num(13)], correct: 'n12',
      explanation: { ar: '7+5=12.', en: '7 + 5 = 12.', he: '7+5=12.' },
      skills: ['wordProblems', 'addition'],
    },
    {
      en: 'The basket has 14 balls and we took 6. How many remain?', he: 'בסל יש 14 כדורים ולקחנו 6. כמה נשארו?',
      options: [num(7), num(8), num(9)], correct: 'n8',
      explanation: { ar: '14-6=8.', en: '14 - 6 = 8.', he: '14-6=8.' },
      skills: ['wordProblems', 'subtraction'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'عند أحمد 10 بطاقات، أعطى صديقه 4 بطاقات. كم بطاقة بقيت مع أحمد؟', en: 'Ahmad has 10 cards and gave his friend 4 cards. How many cards does Ahmad have left?', he: 'לאחמד יש 10 כרטיסים, הוא נתן לחברו 4 כרטיסים. כמה כרטיסים נשארו לאחמד?' },
    options: [num(5), num(6), num(7)], correct: 'n6',
    explanation: { ar: '10-4=6.', en: '10 - 4 = 6.', he: '10-4=6.' },
    skills: ['wordProblems', 'subtraction'],
  },
};

extra[20] = {
  hook: {
    en: 'Ready? Today\'s goal: combine the skills from Stage 2.',
    he: 'מוכנים? המטרה שלנו היום: לשלב את המיומנויות משלב 2.',
  },
  learn: {
    en: ['Adding and subtracting up to 20', 'Making 10', 'Word problems'],
    he: ['חיבור וחיסור עד 20', 'השלמה ל-10', 'בעיות מילוליות'],
  },
  questions: [
    {
      en: '8 + ? = 10', he: '8 + ? = 10',
      options: [num(1), num(2), num(3)], correct: 'n2',
      explanation: { ar: '8+2=10.', en: '8 + 2 = 10.', he: '8+2=10.' },
      skills: ['makeTen'],
    },
    {
      en: '15 - 7 = ?', he: '15 - 7 = ?',
      options: [num(7), num(8), num(9)], correct: 'n8',
      explanation: { ar: '15-7=8.', en: '15 - 7 = 8.', he: '15-7=8.' },
      skills: ['subtraction'],
    },
    {
      en: '9 + 6 = ?', he: '9 + 6 = ?',
      options: [num(14), num(15), num(16)], correct: 'n15',
      explanation: { ar: '9+6=15.', en: '9 + 6 = 15.', he: '9+6=15.' },
      skills: ['addition'],
    },
  ],
  challenge: {
    type: 'multipleChoice',
    text: { ar: 'في المحطة الأخيرة: 12-5=؟', en: 'At the final station: 12 - 5 = ?', he: 'בתחנה האחרונה: 12-5=?' },
    options: [num(6), num(7), num(8)], correct: 'n7',
    explanation: { ar: '12-5=7.', en: '12 - 5 = 7.', he: '12-5=7.' },
    skills: ['subtraction'],
  },
};

