export const mission03 = {
  id: 'mission-03',

  title: {
    ar: 'الرسالة السرية',
    en: 'The Secret Message',
    he: 'ההודעה הסודית',
  },

  activityType: 'mission',

  estimatedMinutes: 50,

  xpReward: 100,

  sections: [
    // 1
    {
      id: 'm03-intro',
      type: 'story',

      title: {
        ar: '🔐 ملف غريب في T-LAB',
        en: '🔐 A Strange File in T-LAB',
        he: '🔐 קובץ מוזר ב-T-LAB',
      },

      text: {
        ar: `أثناء إصلاح الحاسوب في المهمة السابقة...

وجد Byte ملفًا غريبًا.

لا صور.
لا كلمات.
فقط:

01001000 01101001

🤖 Byte: "أنا متأكد أن هذه رسالة..."

مهمتك:
اكتشف كيف يستطيع الكمبيوتر تمثيل المعلومات، ثم فك الرسالة السرية.`,

        en: `While repairing the computer in the previous mission...

Byte found a strange file.

No pictures.
No words.
Only:

01001000 01101001

🤖 Byte: "I'm sure this is a message..."

Your mission:
discover how computers represent information, then decode the secret message.`,

        he: `בזמן תיקון המחשב במשימה הקודמת...

Byte מצא קובץ מוזר.

בלי תמונות.
בלי מילים.
רק:

01001000 01101001

🤖 Byte: "אני בטוח שזו הודעה..."

המשימה שלך:
לגלות איך מחשבים מייצגים מידע, ואז לפענח את ההודעה הסודית.`,
      },

      skills: ['dataRepresentation'],
    },

    // 2
    {
      id: 'm03-first-guess',
      type: 'multipleChoice',

      title: {
        ar: '👀 أول دليل',
        en: '👀 First Clue',
        he: '👀 הרמז הראשון',
      },

      text: {
        ar: `الملف يحتوي فقط على:

0 و 1

برأيك، لماذا يستخدم الكمبيوتر هذين الرقمين كثيرًا؟`,

        en: `The file contains only:

0 and 1

Why do you think computers use these two numbers so often?`,

        he: `הקובץ מכיל רק:

0 ו-1

למה לדעתך מחשבים משתמשים כל כך הרבה בשני המספרים האלה?`,
      },

      options: [
        {
          id: 'twoStates',
          text: {
            ar: 'لأن الأجهزة الإلكترونية تستطيع تمثيل حالتين بسهولة',
            en: 'Because electronic devices can easily represent two states',
            he: 'כי התקנים אלקטרוניים יכולים לייצג בקלות שני מצבים',
          },
        },
        {
          id: 'computerLikesMath',
          text: {
            ar: 'لأن الكمبيوتر يحب الرياضيات',
            en: 'Because computers like mathematics',
            he: 'כי מחשבים אוהבים מתמטיקה',
          },
        },
        {
          id: 'random',
          text: {
            ar: 'مجرد اختيار عشوائي',
            en: 'It was just a random choice',
            he: 'זו הייתה בחירה אקראית',
          },
        },
      ],

      correctAnswer: 'twoStates',

      explanation: {
        ar: 'بالضبط! من السهل تمثيل حالتين مثل تشغيل/إيقاف أو نعم/لا.',
        en: 'Exactly! Two states such as on/off or yes/no are easy to represent electronically.',
        he: 'בדיוק! קל לייצג אלקטרונית שני מצבים כמו דולק/כבוי או כן/לא.',
      },

      hints: [
        {
          ar: 'فكر بمفتاح الكهرباء: هل هو مفتوح أم مغلق؟',
          en: 'Think about a light switch: is it on or off?',
          he: 'חשבו על מתג חשמל: דולק או כבוי?',
        },
      ],

      skills: ['binaryThinking'],
    },

    // 3
    {
      id: 'm03-explain-binary',
      type: 'explain',

      icon: '0️⃣1️⃣',

      title: {
        ar: 'ما هو النظام الثنائي؟',
        en: 'What Is Binary?',
        he: 'מהי השיטה הבינארית?',
      },

      body: {
        ar: `النظام الثنائي يستخدم رمزين فقط: 0 و1.

الكمبيوتر يستطيع استخدام تسلسلات طويلة من هذه الأرقام لتمثيل أنواع مختلفة من المعلومات.`,

        en: `Binary uses only two symbols: 0 and 1.

Computers can use long sequences of these digits to represent many kinds of information.`,

        he: `השיטה הבינארית משתמשת בשני סמלים בלבד: 0 ו-1.

מחשבים יכולים להשתמש ברצפים ארוכים של הספרות האלה כדי לייצג סוגים רבים של מידע.`,
      },

      visual: {
        type: 'comparison',

        leftTitle: {
          ar: '0',
          en: '0',
          he: '0',
        },

        left: {
          ar: 'مثلاً: إيقاف',
          en: 'For example: Off',
          he: 'למשל: כבוי',
        },

        rightTitle: {
          ar: '1',
          en: '1',
          he: '1',
        },

        right: {
          ar: 'مثلاً: تشغيل',
          en: 'For example: On',
          he: 'למשל: דולק',
        },
      },

      cta: {
        ar: 'فهمت، أكمل 🔐',
        en: 'Got it, continue 🔐',
        he: 'הבנתי, ממשיכים 🔐',
      },

      skills: ['binaryThinking'],
    },

    // 4
    {
      id: 'm03-binary-pattern',
      type: 'sequence',

      title: {
        ar: '🧩 رتّب النمط',
        en: '🧩 Complete the Pattern',
        he: '🧩 השלימו את התבנית',
      },

      text: {
        ar: `Byte وجد نمطًا:

0 → 1 → 0 → 1

رتب البطاقات لإكمال النمط.`,

        en: `Byte found a pattern:

0 → 1 → 0 → 1

Arrange the cards to continue the pattern.`,

        he: `Byte מצא תבנית:

0 → 1 → 0 → 1

סדרו את הכרטיסים כדי להמשיך את התבנית.`,
      },

      items: [
        {
          id: 'zero1',
          text: { ar: '0', en: '0', he: '0' },
        },
        {
          id: 'one1',
          text: { ar: '1', en: '1', he: '1' },
        },
        {
          id: 'zero2',
          text: { ar: '0', en: '0', he: '0' },
        },
        {
          id: 'one2',
          text: { ar: '1', en: '1', he: '1' },
        },
      ],

      correctOrder: ['zero1', 'one1', 'zero2', 'one2'],

      explanation: {
        ar: 'ممتاز! لاحظت نمطًا متكررًا بين 0 و1.',
        en: 'Great! You recognized a repeating 0–1 pattern.',
        he: 'מצוין! זיהית תבנית חוזרת של 0 ו-1.',
      },

      skills: ['binaryThinking', 'patternRecognition'],
    },

    // 5
    {
      id: 'm03-data-types',
      type: 'multipleChoice',

      title: {
        ar: '💡 هل الكمبيوتر يخزن أرقامًا فقط؟',
        en: '💡 Does a Computer Store Only Numbers?',
        he: '💡 האם מחשב שומר רק מספרים?',
      },

      text: {
        ar: `إذا كان الكمبيوتر يستخدم 0 و1...

كيف يمكنه حفظ صورة أو كلمة؟`,

        en: `If computers use 0 and 1...

how can they store a picture or a word?`,

        he: `אם מחשבים משתמשים ב-0 וב-1...

איך הם יכולים לשמור תמונה או מילה?`,
      },

      options: [
        {
          id: 'encoded',
          text: {
            ar: 'يمثل المعلومات بأنماط من 0 و1',
            en: 'It represents information using patterns of 0s and 1s',
            he: 'הוא מייצג מידע באמצעות תבניות של 0 ו-1',
          },
        },
        {
          id: 'magic',
          text: {
            ar: 'يستخدم طريقة سحرية مختلفة للصور',
            en: 'It uses a completely different magical method for pictures',
            he: 'הוא משתמש בשיטה קסומה אחרת לתמונות',
          },
        },
        {
          id: 'cannot',
          text: {
            ar: 'لا يستطيع حفظ الصور',
            en: 'It cannot store pictures',
            he: 'הוא לא יכול לשמור תמונות',
          },
        },
      ],

      correctAnswer: 'encoded',

      explanation: {
        ar: 'صحيح! النصوص والصور والصوت كلها يمكن تمثيلها بأنماط من البيانات.',
        en: 'Correct! Text, images and sound can all be represented as patterns of data.',
        he: 'נכון! טקסטים, תמונות וקול יכולים להיות מיוצגים כתבניות של נתונים.',
      },

      skills: ['dataRepresentation'],
    },

    // 6
    {
      id: 'm03-explain-encoding',
      type: 'explain',

      icon: '🔤',

      title: {
        ar: 'Encoding = اتفاق على المعنى',
        en: 'Encoding = Agreeing on Meaning',
        he: 'Encoding = הסכמה על משמעות',
      },

      body: {
        ar: `الرقم نفسه لا يعرف أنه يمثل حرفًا أو صورة.

نحن نستخدم قواعد تخبر النظام ماذا تعني البيانات.`,

        en: `A number does not know by itself whether it represents a letter or a picture.

We use rules that tell the system what the data means.`,

        he: `מספר לא יודע בעצמו אם הוא מייצג אות או תמונה.

אנחנו משתמשים בכללים שמגדירים למערכת מה משמעות הנתונים.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: 'بيانات + قاعدة لفهمها = معلومات مفهومة',
          en: 'Data + a rule for interpreting it = meaningful information',
          he: 'נתונים + כלל לפירוש = מידע בעל משמעות',
        },
      },

      skills: ['encoding'],
    },

    // 7
    {
      id: 'm03-codebook',
      type: 'multipleChoice',

      title: {
        ar: '📖 كتاب الشيفرة',
        en: '📖 The Codebook',
        he: '📖 ספר הקוד',
      },

      text: {
        ar: `في T-LAB وجدنا هذه القاعدة:

A = 00
B = 01
C = 10
D = 11

ما الحرف الذي يمثله 10؟`,

        en: `In T-LAB we found this rule:

A = 00
B = 01
C = 10
D = 11

Which letter is represented by 10?`,

        he: `ב-T-LAB מצאנו את הכלל הזה:

A = 00
B = 01
C = 10
D = 11

איזו אות מיוצגת על ידי 10?`,
      },

      options: [
        { id: 'a', text: { ar: 'A', en: 'A', he: 'A' } },
        { id: 'b', text: { ar: 'B', en: 'B', he: 'B' } },
        { id: 'c', text: { ar: 'C', en: 'C', he: 'C' } },
        { id: 'd', text: { ar: 'D', en: 'D', he: 'D' } },
      ],

      correctAnswer: 'c',

      explanation: {
        ar: 'بالضبط! استخدمت قاعدة الترميز لفهم البيانات.',
        en: 'Exactly! You used the encoding rule to interpret the data.',
        he: 'בדיוק! השתמשת בכלל הקידוד כדי לפרש את הנתונים.',
      },

      skills: ['encoding', 'decoding'],
    },

    // 8
    {
      id: 'm03-decode-word',
      type: 'sequence',

      title: {
        ar: '🕵️ فك الكلمة',
        en: '🕵️ Decode the Word',
        he: '🕵️ פענחו את המילה',
      },

      text: {
        ar: `استخدم نفس القاعدة:

A = 00
B = 01
C = 10
D = 11

الرسالة هي:

01 00 11

رتب الحروف الصحيحة.`,

        en: `Use the same rule:

A = 00
B = 01
C = 10
D = 11

The message is:

01 00 11

Arrange the correct letters.`,

        he: `השתמשו באותו כלל:

A = 00
B = 01
C = 10
D = 11

ההודעה היא:

01 00 11

סדרו את האותיות הנכונות.`,
      },

      items: [
        { id: 'b', text: { ar: 'B', en: 'B', he: 'B' } },
        { id: 'a', text: { ar: 'A', en: 'A', he: 'A' } },
        { id: 'd', text: { ar: 'D', en: 'D', he: 'D' } },
      ],

      correctOrder: ['b', 'a', 'd'],

      explanation: {
        ar: 'أحسنت! حولت البيانات إلى رسالة مفهومة.',
        en: 'Well done! You converted the data into a meaningful message.',
        he: 'כל הכבוד! הפכת את הנתונים להודעה בעלת משמעות.',
      },

      hints: [
        {
          ar: 'ابدأ بـ01. أي حرف يقابله في القاعدة؟',
          en: 'Start with 01. Which letter matches it in the rule?',
          he: 'התחילו ב-01. איזו אות מתאימה לו לפי הכלל?',
        },
      ],

      skills: ['decoding'],
    },

    // 9
    {
      id: 'm03-secret-shift',
      type: 'explain',

      icon: '🔁',

      title: {
        ar: 'لكن أحيانًا نريد إخفاء الرسالة',
        en: 'Sometimes We Want to Hide a Message',
        he: 'לפעמים רוצים להסתיר הודעה',
      },

      body: {
        ar: `يمكننا تغيير الحروف وفق قاعدة سرية.

إذا عرف المرسل والمستقبل القاعدة، يستطيعان فك الرسالة.`,

        en: `We can change letters using a secret rule.

If the sender and receiver know the rule, they can decode the message.`,

        he: `אפשר לשנות אותיות לפי כלל סודי.

אם השולח והמקבל מכירים את הכלל, הם יכולים לפענח את ההודעה.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: 'A → B   B → C   C → D',
          en: 'A → B   B → C   C → D',
          he: 'A → B   B → C   C → D',
        },
      },

      skills: ['cipher'],
    },

    // 10
    {
      id: 'm03-caesar',
      type: 'multipleChoice',

      title: {
        ar: '🗝️ تحدي الإزاحة',
        en: '🗝️ Shift Challenge',
        he: '🗝️ אתגר ההזזה',
      },

      text: {
        ar: `القاعدة السرية:

كل حرف يتحرك خطوة واحدة للأمام.

A → B
B → C
C → D

إذا كانت الرسالة الأصلية A، ماذا تصبح؟`,

        en: `Secret rule:

Every letter moves one step forward.

A → B
B → C
C → D

If the original message is A, what does it become?`,

        he: `הכלל הסודי:

כל אות זזה צעד אחד קדימה.

A → B
B → C
C → D

אם ההודעה המקורית היא A, למה היא תהפוך?`,
      },

      options: [
        { id: 'a', text: { ar: 'A', en: 'A', he: 'A' } },
        { id: 'b', text: { ar: 'B', en: 'B', he: 'B' } },
        { id: 'c', text: { ar: 'C', en: 'C', he: 'C' } },
      ],

      correctAnswer: 'b',

      explanation: {
        ar: 'صحيح! هذا مثال بسيط على تشفير الإزاحة.',
        en: 'Correct! This is a simple example of a shift cipher.',
        he: 'נכון! זו דוגמה פשוטה לצופן הזזה.',
      },

      skills: ['cipher'],
    },

    // 11
    {
      id: 'm03-byte-error',
      type: 'multipleChoice',

      title: {
        ar: '🐞 Byte أخطأ في فك الشيفرة',
        en: '🐞 Byte Decoded It Wrong',
        he: '🐞 Byte טעה בפענוח',
      },

      text: {
        ar: `القاعدة كانت:

A → B
B → C
C → D

Byte يرى الحرف D ويقول إن الحرف الأصلي هو B.

هل هو صحيح؟`,

        en: `The rule was:

A → B
B → C
C → D

Byte sees D and says the original letter was B.

Is he correct?`,

        he: `הכלל היה:

A → B
B → C
C → D

Byte רואה D ואומר שהאות המקורית הייתה B.

האם הוא צודק?`,
      },

      options: [
        {
          id: 'yes',
          text: {
            ar: 'نعم',
            en: 'Yes',
            he: 'כן',
          },
        },
        {
          id: 'no',
          text: {
            ar: 'لا، الأصل هو C',
            en: 'No, the original is C',
            he: 'לא, המקור הוא C',
          },
        },
      ],

      correctAnswer: 'no',

      explanation: {
        ar: 'ممتاز! عند فك التشفير نرجع خطوة للخلف.',
        en: 'Excellent! When decoding, we move one step backward.',
        he: 'מצוין! בפענוח חוזרים צעד אחד אחורה.',
      },

      skills: ['cipher', 'debugging'],
    },

    // 12
    {
      id: 'm03-final-message',
      type: 'multipleChoice',

      title: {
        ar: '🔥 الرسالة النهائية',
        en: '🔥 Final Message',
        he: '🔥 ההודעה הסופית',
      },

      text: {
        ar: `Byte أعطاك هذه البيانات:

01 00 11

وباستخدام القاعدة:

A = 00
B = 01
C = 10
D = 11

ماذا تقول الرسالة؟`,

        en: `Byte gives you this data:

01 00 11

Using the rule:

A = 00
B = 01
C = 10
D = 11

What does the message say?`,

        he: `Byte נותן לך את הנתונים:

01 00 11

לפי הכלל:

A = 00
B = 01
C = 10
D = 11

מה כתוב בהודעה?`,
      },

      options: [
        { id: 'BAD', text: { ar: 'BAD', en: 'BAD', he: 'BAD' } },
        { id: 'CAD', text: { ar: 'CAD', en: 'CAD', he: 'CAD' } },
        { id: 'DAB', text: { ar: 'DAB', en: 'DAB', he: 'DAB' } },
      ],

      correctAnswer: 'BAD',

      explanation: {
        ar: '🔓 ACCESS GRANTED! نجحت في فك الرسالة.',
        en: '🔓 ACCESS GRANTED! You successfully decoded the message.',
        he: '🔓 ACCESS GRANTED! הצלחת לפענח את ההודעה.',
      },

      hints: [
        {
          ar: 'حوّل كل زوج من الأرقام إلى حرف واحد.',
          en: 'Convert each pair of digits into one letter.',
          he: 'המירו כל זוג ספרות לאות אחת.',
        },
      ],

      skills: ['binaryThinking', 'encoding', 'decoding'],
    },

    // 13
    {
      id: 'm03-complete',
      type: 'story',

      title: {
        ar: '🏆 MISSION COMPLETE',
        en: '🏆 MISSION COMPLETE',
        he: '🏆 המשימה הושלמה',
      },

      text: {
        ar: `نجحت في فك أول رسالة سرية في T-LAB! 🔐

تعلمت كيف يستطيع الكمبيوتر تمثيل المعلومات،
وكيف تساعد قواعد الترميز على تحويل البيانات إلى معنى.

مهاراتك الجديدة:

0️⃣1️⃣ Binary
📦 Data Representation
🔤 Encoding
🔓 Decoding
🗝️ Cipher

لكن فجأة...

ظهرت رسالة جديدة على الشاشة:

"PACKET LOST"

🌐 Mission 04:
رحلة حزمة البيانات

هناك رسالة ضاعت في الإنترنت...
هل تستطيع إيصالها؟`,

        en: `You decoded your first secret T-LAB message! 🔐

You learned how computers represent information
and how encoding rules turn data into meaning.

Your new skills:

0️⃣1️⃣ Binary
📦 Data Representation
🔤 Encoding
🔓 Decoding
🗝️ Cipher

But suddenly...

a new message appears:

"PACKET LOST"

🌐 Mission 04:
The Data Packet Journey

A message has been lost on the internet...
Can you deliver it?`,

        he: `פענחת את ההודעה הסודית הראשונה שלך ב-T-LAB! 🔐

למדת איך מחשבים מייצגים מידע
ואיך כללי קידוד הופכים נתונים למשמעות.

המיומנויות החדשות שלך:

0️⃣1️⃣ Binary
📦 Data Representation
🔤 Encoding
🔓 Decoding
🗝️ Cipher

אבל לפתע...

מופיעה הודעה חדשה:

"PACKET LOST"

🌐 משימה 04:
מסע חבילת הנתונים

הודעה אבדה באינטרנט...
האם תצליח להעביר אותה?`,
      },

      skills: [
        'binaryThinking',
        'dataRepresentation',
        'encoding',
        'decoding',
        'cipher',
      ],
    },
  ],
};

export default mission03;