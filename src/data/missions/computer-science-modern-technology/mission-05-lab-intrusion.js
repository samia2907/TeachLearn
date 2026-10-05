export const mission05 = {
  id: 'mission-05',

  title: {
    ar: 'اختراق في المختبر',
    en: 'Lab Intrusion',
    he: 'פריצה למעבדה',
  },

  activityType: 'mission',
  estimatedMinutes: 50,
  xpReward: 100,

  sections: [
    {
      id: 'm05-intro',
      type: 'story',

      title: {
        ar: '⚠️ LOGIN ATTEMPT DETECTED',
        en: '⚠️ LOGIN ATTEMPT DETECTED',
        he: '⚠️ זוהה ניסיון התחברות',
      },

      text: {
        ar: `قبل أن ينتهي Byte من الاحتفال...

ظهر إنذار جديد على شاشة T-LAB.

⚠️ محاولة دخول غير معتادة
⚠️ كلمة مرور ضعيفة
⚠️ رسالة مشبوهة وصلت للحساب

🤖 Byte:
"يبدو أن أحدهم يحاول الدخول إلى النظام!"

مهمتك:
احمِ حساب T-LAB قبل أن يتمكن المهاجم من الوصول إليه.`,

        en: `Before Byte can finish celebrating...

a new alert appears on the T-LAB screen.

⚠️ Unusual login attempt
⚠️ Weak password
⚠️ Suspicious message received

🤖 Byte:
"It looks like someone is trying to get into the system!"

Your mission:
protect the T-LAB account before the attacker gets access.`,

        he: `לפני ש-Byte מספיק לסיים לחגוג...

מופיעה התראה חדשה על מסך T-LAB.

⚠️ ניסיון התחברות חריג
⚠️ סיסמה חלשה
⚠️ הודעה חשודה התקבלה

🤖 Byte:
"נראה שמישהו מנסה להיכנס למערכת!"

המשימה שלך:
להגן על חשבון T-LAB לפני שהתוקף יקבל גישה.`,
      },

      skills: ['cyberAwareness'],
    },

    {
      id: 'm05-password-check',
      type: 'multipleChoice',

      title: {
        ar: '🔑 أول مشكلة',
        en: '🔑 First Problem',
        he: '🔑 הבעיה הראשונה',
      },

      text: {
        ar: `هذه هي كلمة مرور حساب Byte:

byte123

هل تعتبر كلمة مرور قوية؟`,

        en: `This is Byte's account password:

byte123

Would you consider it a strong password?`,

        he: `זו הסיסמה של חשבון Byte:

byte123

האם זו סיסמה חזקה?`,
      },

      options: [
        {
          id: 'strong',
          text: {
            ar: 'نعم، قوية جدًا',
            en: 'Yes, very strong',
            he: 'כן, חזקה מאוד',
          },
        },
        {
          id: 'weak',
          text: {
            ar: 'لا، قصيرة وسهلة التخمين',
            en: 'No, it is short and easy to guess',
            he: 'לא, היא קצרה וקלה לניחוש',
          },
        },
      ],

      correctAnswer: 'weak',

      explanation: {
        ar: 'صحيح! الكلمات القصيرة والمتوقعة أسهل في التخمين.',
        en: 'Correct! Short and predictable passwords are easier to guess.',
        he: 'נכון! סיסמאות קצרות וצפויות קלות יותר לניחוש.',
      },

      skills: ['passwordSafety'],
    },

    {
      id: 'm05-explain-password',
      type: 'explain',

      icon: '🔐',

      title: {
        ar: 'كلمة المرور القوية',
        en: 'A Strong Password',
        he: 'סיסמה חזקה',
      },

      body: {
        ar: `كلمة المرور الأفضل تكون طويلة وصعبة التخمين.

تجنب استخدام اسمك أو كلمات شائعة أو أرقام بسيطة مثل 123456.`,

        en: `A better password is long and difficult to guess.

Avoid using your name, common words, or simple number patterns such as 123456.`,

        he: `סיסמה טובה יותר היא ארוכה וקשה לניחוש.

כדאי להימנע משם פרטי, מילים נפוצות או רצפים פשוטים כמו 123456.`,
      },

      visual: {
        type: 'comparison',

        leftTitle: {
          ar: '❌ ضعيفة',
          en: '❌ Weak',
          he: '❌ חלשה',
        },

        left: {
          ar: 'samia123',
          en: 'samia123',
          he: 'samia123',
        },

        rightTitle: {
          ar: '✅ أقوى',
          en: '✅ Stronger',
          he: '✅ חזקה יותר',
        },

        right: {
          ar: 'Cloud!River7Lamp',
          en: 'Cloud!River7Lamp',
          he: 'Cloud!River7Lamp',
        },
      },

      skills: ['passwordSafety'],
    },

    {
      id: 'm05-password-choice',
      type: 'multipleChoice',

      title: {
        ar: '🛡️ اختر الأقوى',
        en: '🛡️ Choose the Stronger Password',
        he: '🛡️ בחרו את הסיסמה החזקה יותר',
      },

      text: {
        ar: 'أي كلمة مرور من التالية أصعب في التخمين؟',
        en: 'Which password below would be harder to guess?',
        he: 'איזו סיסמה תהיה קשה יותר לניחוש?',
      },

      options: [
        {
          id: 'a',
          text: {
            ar: 'password123',
            en: 'password123',
            he: 'password123',
          },
        },
        {
          id: 'b',
          text: {
            ar: 'Blue!Tree8Moon',
            en: 'Blue!Tree8Moon',
            he: 'Blue!Tree8Moon',
          },
        },
        {
          id: 'c',
          text: {
            ar: '12345678',
            en: '12345678',
            he: '12345678',
          },
        },
      ],

      correctAnswer: 'b',

      explanation: {
        ar: 'ممتاز! الطول والتنوع يجعلان كلمة المرور أصعب في التخمين.',
        en: 'Great! Length and variety make the password harder to guess.',
        he: 'מצוין! אורך וגיוון הופכים את הסיסמה לקשה יותר לניחוש.',
      },

      skills: ['passwordSafety'],
    },

    {
      id: 'm05-suspicious-message',
      type: 'story',

      title: {
        ar: '📨 رسالة غريبة',
        en: '📨 A Strange Message',
        he: '📨 הודעה מוזרה',
      },

      text: {
        ar: `وصلت رسالة إلى Byte:

"تهانينا! ربحت جهازًا جديدًا 🎁

اضغط فورًا على الرابط التالي
وسجل دخولك لتستلم الجائزة.

لديك 5 دقائق فقط!"

🤖 Byte:
"واو! يمكن أن تكون جائزتي!"

لكن شيئًا ما يبدو غريبًا...`,

        en: `Byte receives a message:

"Congratulations! You won a new device 🎁

Click the link immediately
and sign in to claim your prize.

You only have 5 minutes!"

🤖 Byte:
"Wow! Maybe I really won!"

But something feels suspicious...`,

        he: `Byte מקבל הודעה:

"מזל טוב! זכית במכשיר חדש 🎁

לחץ מיד על הקישור
והתחבר כדי לקבל את הפרס.

יש לך רק 5 דקות!"

🤖 Byte:
"וואו! אולי באמת זכיתי!"

אבל משהו מרגיש חשוד...`,
      },

      skills: ['phishingAwareness'],
    },

    {
      id: 'm05-phishing-question',
      type: 'multipleChoice',

      title: {
        ar: '🎣 هل هذه رسالة آمنة؟',
        en: '🎣 Is This Message Safe?',
        he: '🎣 האם ההודעה בטוחה?',
      },

      text: {
        ar: 'ما أفضل تصرف قبل الضغط على الرابط؟',
        en: 'What is the best thing to do before clicking the link?',
        he: 'מה הדבר הטוב ביותר לעשות לפני שלוחצים על הקישור?',
      },

      options: [
        {
          id: 'click',
          text: {
            ar: 'أضغط بسرعة قبل انتهاء الوقت',
            en: 'Click quickly before time runs out',
            he: 'ללחוץ מהר לפני שהזמן נגמר',
          },
        },
        {
          id: 'verify',
          text: {
            ar: 'أتوقف وأتحقق من المرسل والرابط',
            en: 'Stop and verify the sender and link',
            he: 'לעצור ולבדוק את השולח ואת הקישור',
          },
        },
        {
          id: 'password',
          text: {
            ar: 'أرسل لهم كلمة المرور للتأكد',
            en: 'Send them the password to confirm',
            he: 'לשלוח להם את הסיסמה כדי לאמת',
          },
        },
      ],

      correctAnswer: 'verify',

      explanation: {
        ar: 'بالضبط! الضغط والاستعجال من العلامات الشائعة للرسائل المشبوهة.',
        en: 'Exactly! Pressure and urgency are common warning signs in suspicious messages.',
        he: 'בדיוק! לחץ ודחיפות הם סימני אזהרה נפוצים בהודעות חשודות.',
      },

      hints: [
        {
          ar: 'هل الرسالة تحاول أن تجعلك تتصرف بسرعة قبل التفكير؟',
          en: 'Is the message trying to make you act before you have time to think?',
          he: 'האם ההודעה מנסה לגרום לך לפעול לפני שתספיק לחשוב?',
        },
      ],

      skills: ['phishingAwareness'],
    },

    {
      id: 'm05-explain-phishing',
      type: 'explain',

      icon: '🎣',

      title: {
        ar: 'ما هو Phishing؟',
        en: 'What Is Phishing?',
        he: 'מהו Phishing?',
      },

      body: {
        ar: `Phishing هو محاولة لخداعك حتى تعطي معلومات أو تضغط على رابط غير آمن.

غالبًا تستخدم الرسالة الخوف أو الاستعجال أو جائزة مغرية.`,

        en: `Phishing is an attempt to trick you into giving information or clicking an unsafe link.

These messages often use fear, urgency, or an exciting reward.`,

        he: `Phishing הוא ניסיון להטעות אותך כדי שתמסור מידע או תלחץ על קישור לא בטוח.

הודעות כאלה משתמשות לעיתים בפחד, דחיפות או פרס מפתה.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: '🚨 استعجل! + 🎁 جائزة + 🔗 رابط غريب = توقف وتحقق',
          en: '🚨 Urgency + 🎁 Reward + 🔗 Strange link = Stop and verify',
          he: '🚨 דחיפות + 🎁 פרס + 🔗 קישור חשוד = לעצור ולבדוק',
        },
      },

      skills: ['phishingAwareness'],
    },

    {
      id: 'm05-link-check',
      type: 'multipleChoice',

      title: {
        ar: '🔗 أي رابط يبدو أكثر أمانًا؟',
        en: '🔗 Which Link Looks Safer?',
        he: '🔗 איזה קישור נראה בטוח יותר?',
      },

      text: {
        ar: `Byte يريد الدخول إلى موقع المدرسة.

أي رابط يبدو أقل إثارة للشك؟`,

        en: `Byte wants to sign in to the school website.

Which link looks less suspicious?`,

        he: `Byte רוצה להיכנס לאתר בית הספר.

איזה קישור נראה פחות חשוד?`,
      },

      options: [
        {
          id: 'fake',
          text: {
            ar: 'school-login-free-prize.example',
            en: 'school-login-free-prize.example',
            he: 'school-login-free-prize.example',
          },
        },
        {
          id: 'official',
          text: {
            ar: 'school.example',
            en: 'school.example',
            he: 'school.example',
          },
        },
        {
          id: 'strange',
          text: {
            ar: 'sch00l-security-win.example',
            en: 'sch00l-security-win.example',
            he: 'sch00l-security-win.example',
          },
        },
      ],

      correctAnswer: 'official',

      explanation: {
        ar: 'ممتاز! يجب الانتباه لاسم الموقع نفسه، وليس فقط شكل الصفحة.',
        en: 'Great! Pay attention to the website name itself, not only how the page looks.',
        he: 'מצוין! חשוב לבדוק את שם האתר עצמו, לא רק איך הדף נראה.',
      },

      skills: ['safeBrowsing'],
    },

    {
      id: 'm05-privacy',
      type: 'multipleChoice',

      title: {
        ar: '👤 معلومة خاصة',
        en: '👤 Private Information',
        he: '👤 מידע פרטי',
      },

      text: {
        ar: `موقع ألعاب غير معروف يطلب:

الاسم الكامل
العنوان
كلمة المرور
ورقم الهاتف

حتى يعطيك "1000 نقطة مجانية".

ما التصرف الأفضل؟`,

        en: `An unknown gaming site asks for:

your full name
home address
password
and phone number

to give you "1000 free points."

What should you do?`,

        he: `אתר משחקים לא מוכר מבקש:

שם מלא
כתובת בית
סיסמה
ומספר טלפון

כדי לתת לך "1000 נקודות בחינם."

מה כדאי לעשות?`,
      },

      options: [
        {
          id: 'share',
          text: {
            ar: 'أرسل كل المعلومات',
            en: 'Share all the information',
            he: 'למסור את כל המידע',
          },
        },
        {
          id: 'avoid',
          text: {
            ar: 'لا أشارك المعلومات وأتوقف',
            en: 'Do not share the information and stop',
            he: 'לא למסור את המידע ולעצור',
          },
        },
        {
          id: 'passwordOnly',
          text: {
            ar: 'أعطيهم كلمة المرور فقط',
            en: 'Give them only the password',
            he: 'לתת רק את הסיסמה',
          },
        },
      ],

      correctAnswer: 'avoid',

      explanation: {
        ar: 'صحيح! لا نعطي معلومات شخصية أو كلمات مرور لمواقع غير موثوقة.',
        en: 'Correct! Personal information and passwords should not be shared with untrusted sites.',
        he: 'נכון! לא מוסרים מידע אישי או סיסמאות לאתרים לא מוכרים.',
      },

      skills: ['privacy'],
    },

    {
      id: 'm05-byte-mistake',
      type: 'multipleChoice',

      title: {
        ar: '🐞 قرار Byte الخاطئ',
        en: '🐞 Byte Makes a Bad Decision',
        he: '🐞 ההחלטה השגויה של Byte',
      },

      text: {
        ar: `Byte استلم رسالة تقول:

"هناك مشكلة في حسابك.
أرسل كلمة المرور هنا وسنصلحها."

Byte يريد الرد بكلمة المرور.

ماذا تقول له؟`,

        en: `Byte receives a message:

"There is a problem with your account.
Send us your password and we will fix it."

Byte wants to reply with the password.

What should you tell him?`,

        he: `Byte מקבל הודעה:

"יש בעיה בחשבון שלך.
שלח לנו את הסיסמה ונפתור אותה."

Byte רוצה לענות עם הסיסמה.

מה תגיד לו?`,
      },

      options: [
        {
          id: 'send',
          text: {
            ar: 'أرسلها، هم يريدون المساعدة',
            en: 'Send it, they are trying to help',
            he: 'לשלוח, הם רוצים לעזור',
          },
        },
        {
          id: 'never',
          text: {
            ar: 'لا ترسل كلمة المرور لأي شخص',
            en: 'Never send your password to someone',
            he: 'לא שולחים סיסמה לאף אחד',
          },
        },
      ],

      correctAnswer: 'never',

      explanation: {
        ar: 'بالضبط! كلمة المرور سر، ولا يجب إرسالها في رسالة.',
        en: 'Exactly! A password is secret and should not be sent in a message.',
        he: 'בדיוק! סיסמה היא סוד ולא שולחים אותה בהודעה.',
      },

      skills: ['passwordSafety', 'cyberAwareness'],
    },

    {
      id: 'm05-security-order',
      type: 'sequence',

      title: {
        ar: '🧠 قبل أن تضغط',
        en: '🧠 Before You Click',
        he: '🧠 לפני שלוחצים',
      },

      text: {
        ar: 'رتّب خطوات التصرف مع رسالة مشبوهة.',
        en: 'Put the safe steps for handling a suspicious message in order.',
        he: 'סדרו את השלבים להתמודדות בטוחה עם הודעה חשודה.',
      },

      items: [
        {
          id: 'stop',
          text: {
            ar: '✋ أتوقف ولا أضغط فورًا',
            en: '✋ Stop and do not click immediately',
            he: '✋ לעצור ולא ללחוץ מיד',
          },
        },
        {
          id: 'check',
          text: {
            ar: '🔍 أتحقق من المرسل والرابط',
            en: '🔍 Check the sender and link',
            he: '🔍 לבדוק את השולח והקישור',
          },
        },
        {
          id: 'decide',
          text: {
            ar: '🧠 أقرر بعد التحقق',
            en: '🧠 Decide only after checking',
            he: '🧠 להחליט רק אחרי הבדיקה',
          },
        },
      ],

      correctOrder: ['stop', 'check', 'decide'],

      explanation: {
        ar: 'ممتاز! الأمن الرقمي يبدأ بالتوقف والتفكير قبل الضغط.',
        en: 'Great! Digital safety starts by pausing and thinking before clicking.',
        he: 'מצוין! בטיחות דיגיטלית מתחילה בעצירה ובחשיבה לפני לחיצה.',
      },

      skills: ['cyberAwareness', 'sequencing'],
    },

    {
      id: 'm05-final',
      type: 'multipleChoice',

      title: {
        ar: '🔥 قرار Cyber Defender',
        en: '🔥 Cyber Defender Decision',
        he: '🔥 החלטת Cyber Defender',
      },

      text: {
        ar: `وصلت رسالة عاجلة:

"تم إغلاق حسابك!
اضغط هنا الآن وأدخل كلمة المرور لإعادته."

ما أفضل تصرف؟`,

        en: `You receive an urgent message:

"Your account has been locked!
Click here now and enter your password to restore it."

What is the best response?`,

        he: `קיבלת הודעה דחופה:

"החשבון שלך ננעל!
לחץ כאן עכשיו והזן סיסמה כדי לשחזר אותו."

מה הפעולה הטובה ביותר?`,
      },

      options: [
        {
          id: 'click',
          text: {
            ar: 'أضغط الرابط وأدخل كلمة المرور',
            en: 'Click the link and enter the password',
            he: 'ללחוץ על הקישור ולהזין סיסמה',
          },
        },
        {
          id: 'official',
          text: {
            ar: 'أفتح الموقع الرسمي بنفسي وأتحقق من الحساب',
            en: 'Open the official site myself and check the account',
            he: 'לפתוח בעצמי את האתר הרשמי ולבדוק את החשבון',
          },
        },
        {
          id: 'forward',
          text: {
            ar: 'أرسل الرسالة لكل أصدقائي',
            en: 'Forward the message to everyone',
            he: 'להעביר את ההודעה לכל החברים',
          },
        },
      ],

      correctAnswer: 'official',

      explanation: {
        ar: '🛡️ ممتاز! تحققت من المصدر بدل الوثوق بالرابط داخل الرسالة.',
        en: '🛡️ Excellent! You verified through the official source instead of trusting the link in the message.',
        he: '🛡️ מצוין! בדקת דרך המקור הרשמי במקום לסמוך על הקישור שבהודעה.',
      },

      hints: [
        {
          ar: 'يمكنك التحقق من الحساب بدون استخدام الرابط الموجود في الرسالة.',
          en: 'You can check the account without using the link inside the message.',
          he: 'אפשר לבדוק את החשבון בלי להשתמש בקישור שבהודעה.',
        },
      ],

      skills: [
        'cyberAwareness',
        'phishingAwareness',
        'safeBrowsing',
      ],
    },

    {
      id: 'm05-complete',
      type: 'story',

      title: {
        ar: '🏆 MISSION COMPLETE',
        en: '🏆 MISSION COMPLETE',
        he: '🏆 המשימה הושלמה',
      },

      text: {
        ar: `🛡️ T-LAB SECURED!

نجحت في حماية الحساب.

تعلمت:

🔐 كيف تختار كلمة مرور أقوى
🎣 كيف تكتشف Phishing
🔗 لماذا نفحص الروابط
👤 كيف نحمي الخصوصية
🧠 لماذا نفكر قبل أن نضغط

🏅 الرتبة الجديدة:
Cyber Defender

لكن النظام لم ينتهِ بعد...

🚨 جميع أنظمة T-LAB بدأت ترسل أخطاء في نفس الوقت.

🤖 Byte:
"نحتاج كل ما تعلمته حتى الآن!"

🚀 Mission 06:
إنقاذ المختبر

هذه المرة...
كل شيء يعتمد عليك.`,

        en: `🛡️ T-LAB SECURED!

You successfully protected the account.

You learned:

🔐 How to choose a stronger password
🎣 How to recognize phishing
🔗 Why links should be checked
👤 How to protect privacy
🧠 Why we think before clicking

🏅 New rank:
Cyber Defender

But the system is not safe yet...

🚨 Every T-LAB system begins reporting errors at once.

🤖 Byte:
"We need everything you have learned so far!"

🚀 Mission 06:
Save the Lab

This time...
everything depends on you.`,

        he: `🛡️ T-LAB מאובטח!

הצלחת להגן על החשבון.

למדת:

🔐 איך לבחור סיסמה חזקה יותר
🎣 איך לזהות Phishing
🔗 למה צריך לבדוק קישורים
👤 איך להגן על פרטיות
🧠 למה חושבים לפני שלוחצים

🏅 דרגה חדשה:
Cyber Defender

אבל הסכנה עדיין לא נגמרה...

🚨 כל מערכות T-LAB מתחילות לדווח על תקלות בו-זמנית.

🤖 Byte:
"אנחנו צריכים את כל מה שלמדת עד עכשיו!"

🚀 משימה 06:
הצלת המעבדה

הפעם...
הכול תלוי בך.`,
      },

      skills: [
        'cyberAwareness',
        'passwordSafety',
        'phishingAwareness',
        'privacy',
        'safeBrowsing',
      ],
    },
  ],
};

export default mission05;