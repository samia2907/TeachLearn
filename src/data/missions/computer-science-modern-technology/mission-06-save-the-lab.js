export const mission06 = {
  id: 'mission-06',

  title: {
    ar: 'إنقاذ المختبر',
    en: 'Save the Lab',
    he: 'הצלת המעבדה',
  },

  activityType: 'mission',
  estimatedMinutes: 60,
  xpReward: 150,

  sections: [
    {
      id: 'm06-intro',
      type: 'story',

      title: {
        ar: '🚨 حالة طوارئ في T-LAB',
        en: '🚨 T-LAB Emergency',
        he: '🚨 מצב חירום ב-T-LAB',
      },

      text: {
        ar: `🚨 ALERT LEVEL: CRITICAL

كل أنظمة T-LAB تعطلت تقريبًا في نفس الوقت.

🧠 النظام لا ينفذ التعليمات بشكل صحيح.
💻 أحد الحواسيب توقف.
🔐 ملف مهم أصبح مشفّرًا.
🌐 حزمة بيانات ضاعت.
🛡️ محاولة دخول مشبوهة بدأت من جديد.

🤖 Byte:
"هذه ليست مشكلة واحدة...

إنها خمس مشاكل في نفس الوقت!

هذه هي مهمتك الأخيرة.
استخدم كل ما تعلمته لإنقاذ المختبر."`,

        en: `🚨 ALERT LEVEL: CRITICAL

Almost every T-LAB system has failed at the same time.

🧠 The system is not following instructions correctly.
💻 One computer has stopped working.
🔐 An important file is encoded.
🌐 A data packet is lost.
🛡️ A suspicious login attempt has started again.

🤖 Byte:
"This is not one problem...

It is five problems at once!

This is your final mission.
Use everything you have learned to save the lab."`,

        he: `🚨 ALERT LEVEL: CRITICAL

כמעט כל מערכות T-LAB נכשלו באותו זמן.

🧠 המערכת לא מבצעת הוראות נכון.
💻 אחד המחשבים הפסיק לעבוד.
🔐 קובץ חשוב מקודד.
🌐 חבילת נתונים אבדה.
🛡️ ניסיון התחברות חשוד התחיל שוב.

🤖 Byte:
"זו לא בעיה אחת...

אלה חמש בעיות בו-זמנית!

זו המשימה האחרונה שלך.
השתמש בכל מה שלמדת כדי להציל את המעבדה."`,
      },

      skills: ['problemSolving'],
    },

    {
      id: 'm06-stage1',
      type: 'story',

      title: {
        ar: '🔧 المرحلة 1: النظام المربك',
        en: '🔧 Stage 1: The Confused System',
        he: '🔧 שלב 1: המערכת המבולבלת',
      },

      text: {
        ar: `أول باب أمان لا يفتح.

النظام يقول:

"نفذت التعليمات كما وصلتني."

لكن التعليمات مرتبة بشكل خاطئ.

أعد ترتيبها لفتح الباب.`,

        en: `The first security door will not open.

The system says:

"I followed the instructions exactly as I received them."

But the instructions are in the wrong order.

Rearrange them to open the door.`,

        he: `דלת האבטחה הראשונה לא נפתחת.

המערכת אומרת:

"ביצעתי את ההוראות בדיוק כפי שקיבלתי אותן."

אבל ההוראות בסדר שגוי.

סדרו אותן מחדש כדי לפתוח את הדלת.`,
      },

      skills: ['algorithmicThinking'],
    },

    {
      id: 'm06-algorithm',
      type: 'sequence',

      title: {
        ar: '🧠 أصلح الخوارزمية',
        en: '🧠 Fix the Algorithm',
        he: '🧠 תקנו את האלגוריתם',
      },

      text: {
        ar: 'رتّب خطوات فتح باب المختبر.',
        en: 'Arrange the steps for opening the lab door.',
        he: 'סדרו את השלבים לפתיחת דלת המעבדה.',
      },

      items: [
        {
          id: 'scan',
          text: {
            ar: '1️⃣ افحص بطاقة الدخول',
            en: '1️⃣ Scan the access card',
            he: '1️⃣ לסרוק את כרטיס הגישה',
          },
        },
        {
          id: 'verify',
          text: {
            ar: '2️⃣ تحقق من صلاحية البطاقة',
            en: '2️⃣ Verify the card',
            he: '2️⃣ לאמת את הכרטיס',
          },
        },
        {
          id: 'open',
          text: {
            ar: '3️⃣ افتح الباب',
            en: '3️⃣ Open the door',
            he: '3️⃣ לפתוח את הדלת',
          },
        },
      ],

      correctOrder: ['scan', 'verify', 'open'],

      explanation: {
        ar: '✅ الباب فتح! ترتيب التعليمات مهم لأن الكمبيوتر ينفذها حرفيًا.',
        en: '✅ Door opened! Order matters because computers follow instructions literally.',
        he: '✅ הדלת נפתחה! הסדר חשוב כי מחשבים מבצעים הוראות באופן מדויק.',
      },

      skills: ['algorithmicThinking', 'sequencing'],
    },

    {
      id: 'm06-stage2',
      type: 'story',

      title: {
        ar: '💻 المرحلة 2: الحاسوب المتوقف',
        en: '💻 Stage 2: The Dead Computer',
        he: '💻 שלב 2: המחשב התקוע',
      },

      text: {
        ar: `دخلت الغرفة الثانية.

الحاسوب يعمل...
لكن كل البرامج أصبحت بطيئة جدًا.

🤖 Byte:
"التخزين فيه مساحة، والمعالج يعمل."

أي جزء يجب أن نفحص أولًا؟`,

        en: `You enter the second room.

The computer is running...
but every program has become extremely slow.

🤖 Byte:
"Storage has space, and the CPU is working."

Which component should we check first?`,

        he: `נכנסת לחדר השני.

המחשב עובד...
אבל כל התוכנות הפכו לאיטיות מאוד.

🤖 Byte:
"יש מקום באחסון והמעבד עובד."

איזה רכיב כדאי לבדוק קודם?`,
      },

      skills: ['diagnosis'],
    },

    {
      id: 'm06-ram',
      type: 'multipleChoice',

      title: {
        ar: '🔍 شخّص المشكلة',
        en: '🔍 Diagnose the Problem',
        he: '🔍 אבחנו את הבעיה',
      },

      text: {
        ar: 'أي جزء يساعد الكمبيوتر أثناء تشغيل البرامج والمهام الحالية؟',
        en: 'Which component helps the computer while running current programs and tasks?',
        he: 'איזה רכיב עוזר למחשב בזמן הרצת תוכנות ומשימות נוכחיות?',
      },

      options: [
        {
          id: 'ram',
          text: {
            ar: 'RAM',
            en: 'RAM',
            he: 'RAM',
          },
        },
        {
          id: 'storage',
          text: {
            ar: 'Storage',
            en: 'Storage',
            he: 'Storage',
          },
        },
        {
          id: 'keyboard',
          text: {
            ar: 'Keyboard',
            en: 'Keyboard',
            he: 'Keyboard',
          },
        },
      ],

      correctAnswer: 'ram',

      explanation: {
        ar: '✅ صحيح! RAM مهمة للبيانات والبرامج التي يعمل عليها الجهاز الآن.',
        en: '✅ Correct! RAM is important for data and programs currently in use.',
        he: '✅ נכון! RAM חשובה לנתונים ולתוכנות שבהם המחשב משתמש עכשיו.',
      },

      skills: ['ram', 'diagnosis'],
    },

    {
      id: 'm06-stage3',
      type: 'story',

      title: {
        ar: '🔐 المرحلة 3: الملف المشفّر',
        en: '🔐 Stage 3: The Encoded File',
        he: '🔐 שלב 3: הקובץ המקודד',
      },

      text: {
        ar: `وجدت ملف الطوارئ.

لكنه لا يحتوي على كلمات.

فقط:

01 00 11

يوجد بجانبه مفتاح:

A = 00
B = 01
C = 10
D = 11

افتح الملف.`,

        en: `You find the emergency file.

But it contains no words.

Only:

01 00 11

Next to it is a key:

A = 00
B = 01
C = 10
D = 11

Unlock the file.`,

        he: `מצאת את קובץ החירום.

אבל אין בו מילים.

רק:

01 00 11

לידו מופיע מפתח:

A = 00
B = 01
C = 10
D = 11

פענחו את הקובץ.`,
      },

      skills: ['decoding'],
    },

    {
      id: 'm06-decode',
      type: 'multipleChoice',

      title: {
        ar: '🕵️ فك الرسالة',
        en: '🕵️ Decode the Message',
        he: '🕵️ פענחו את ההודעה',
      },

      text: {
        ar: 'ما الكلمة التي تمثلها 01 00 11؟',
        en: 'Which word is represented by 01 00 11?',
        he: 'איזו מילה מיוצגת על ידי 01 00 11?',
      },

      options: [
        {
          id: 'BAD',
          text: { ar: 'BAD', en: 'BAD', he: 'BAD' },
        },
        {
          id: 'CAD',
          text: { ar: 'CAD', en: 'CAD', he: 'CAD' },
        },
        {
          id: 'DAB',
          text: { ar: 'DAB', en: 'DAB', he: 'DAB' },
        },
      ],

      correctAnswer: 'BAD',

      explanation: {
        ar: '🔓 الملف فتح! استخدمت قاعدة الترميز لفهم البيانات.',
        en: '🔓 File unlocked! You used an encoding rule to interpret the data.',
        he: '🔓 הקובץ נפתח! השתמשת בכלל קידוד כדי לפרש את הנתונים.',
      },

      skills: ['binaryThinking', 'encoding', 'decoding'],
    },

    {
      id: 'm06-stage4',
      type: 'story',

      title: {
        ar: '🌐 المرحلة 4: الحزمة الضائعة',
        en: '🌐 Stage 4: The Lost Packet',
        he: '🌐 שלב 4: החבילה האבודה',
      },

      text: {
        ar: `ملف الطوارئ يجب أن يصل إلى الخادم الرئيسي.

لكن الحزمة ضاعت داخل الشبكة.

يجب أن تختار مسارًا صالحًا لتوصيلها.`,

        en: `The emergency file must reach the main server.

But its packet is lost inside the network.

Choose a valid route to deliver it.`,

        he: `קובץ החירום חייב להגיע לשרת הראשי.

אבל החבילה שלו אבדה בתוך הרשת.

בחרו מסלול תקין כדי להעביר אותה.`,
      },

      skills: ['routing'],
    },

    {
      id: 'm06-route',
      type: 'robot',

      title: {
        ar: '📦 أوصل الحزمة',
        en: '📦 Deliver the Packet',
        he: '📦 העבירו את החבילה',
      },

      text: {
        ar: 'ابحث عن طريق من البداية إلى الخادم وتجنب المسارات المغلقة.',
        en: 'Find a route from the start to the server and avoid blocked paths.',
        he: 'מצאו דרך מההתחלה לשרת והימנעו ממסלולים חסומים.',
      },

      grid: {
        size: 5,
        start: [0, 0],
        goal: [4, 4],
        obstacles: [
          [1, 1],
          [2, 1],
          [2, 2],
          [3, 3],
        ],
      },

      hints: [
        {
          ar: 'ابحث عن طريق حول العوائق بدل محاولة المرور خلالها.',
          en: 'Look for a route around obstacles instead of through them.',
          he: 'חפשו דרך מסביב למכשולים במקום לעבור דרכם.',
        },
      ],

      explanation: {
        ar: '📦 وصلت الحزمة إلى الخادم!',
        en: '📦 The packet reached the server!',
        he: '📦 החבילה הגיעה לשרת!',
      },

      skills: ['routing', 'planning', 'networkThinking'],
    },

    {
      id: 'm06-stage5',
      type: 'story',

      title: {
        ar: '🛡️ المرحلة 5: الهجوم الأخير',
        en: '🛡️ Stage 5: The Final Attack',
        he: '🛡️ שלב 5: ההתקפה האחרונה',
      },

      text: {
        ar: `قبل إعادة تشغيل النظام...

وصلت رسالة:

"أنا مدير T-LAB.

أرسل كلمة المرور الآن وإلا سيتم حذف النظام!"

🤖 Byte:
"إنه المدير! لازم نرسلها بسرعة!"

ماذا ستفعل؟`,

        en: `Before restarting the system...

a message arrives:

"I am the T-LAB administrator.

Send your password now or the system will be deleted!"

🤖 Byte:
"It's the administrator! We should send it quickly!"

What will you do?`,

        he: `לפני הפעלה מחדש של המערכת...

מגיעה הודעה:

"אני מנהל T-LAB.

שלח את הסיסמה עכשיו או שהמערכת תימחק!"

🤖 Byte:
"זה המנהל! צריך לשלוח מהר!"

מה תעשה?`,
      },

      skills: ['cyberAwareness'],
    },

    {
      id: 'm06-security',
      type: 'multipleChoice',

      title: {
        ar: '🔥 القرار الأخير',
        en: '🔥 Final Security Decision',
        he: '🔥 החלטת האבטחה האחרונה',
      },

      text: {
        ar: 'ما التصرف الأكثر أمانًا؟',
        en: 'What is the safest response?',
        he: 'מהי הפעולה הבטוחה ביותר?',
      },

      options: [
        {
          id: 'send',
          text: {
            ar: 'أرسل كلمة المرور',
            en: 'Send the password',
            he: 'לשלוח את הסיסמה',
          },
        },
        {
          id: 'verify',
          text: {
            ar: 'لا أرسل شيئًا وأتحقق من المصدر الرسمي',
            en: 'Send nothing and verify through the official source',
            he: 'לא לשלוח דבר ולבדוק דרך המקור הרשמי',
          },
        },
        {
          id: 'forward',
          text: {
            ar: 'أرسل الرسالة لأصدقائي',
            en: 'Forward the message to friends',
            he: 'להעביר את ההודעה לחברים',
          },
        },
      ],

      correctAnswer: 'verify',

      explanation: {
        ar: '🛡️ ممتاز! لم تسمح للاستعجال أن يخدعك.',
        en: '🛡️ Excellent! You did not let urgency trick you.',
        he: '🛡️ מצוין! לא נתת ללחץ להטעות אותך.',
      },

      skills: ['phishingAwareness', 'passwordSafety', 'cyberAwareness'],
    },

    {
      id: 'm06-final-system',
      type: 'multipleChoice',

      title: {
        ar: '🚀 إعادة تشغيل T-LAB',
        en: '🚀 Restart T-LAB',
        he: '🚀 הפעלה מחדש של T-LAB',
      },

      text: {
        ar: `تم إصلاح الأنظمة الخمسة.

قبل الضغط على RESTART، Byte يسألك:

"ما أهم شيء تعلمته خلال المهمات؟"`,

        en: `All five systems have been repaired.

Before pressing RESTART, Byte asks:

"What is the most important thing you learned during these missions?"`,

        he: `כל חמש המערכות תוקנו.

לפני שלוחצים על RESTART, Byte שואל:

"מה הדבר החשוב ביותר שלמדת במשימות?"`,
      },

      options: [
        {
          id: 'thinking',
          text: {
            ar: 'أن نفهم المشكلة ونفكر قبل اتخاذ القرار',
            en: 'Understand the problem and think before making a decision',
            he: 'להבין את הבעיה ולחשוב לפני שמחליטים',
          },
        },
        {
          id: 'guess',
          text: {
            ar: 'أن نضغط أزرارًا حتى يعمل شيء',
            en: 'Press buttons until something works',
            he: 'ללחוץ על כפתורים עד שמשהו יעבוד',
          },
        },
        {
          id: 'computer',
          text: {
            ar: 'أن الكمبيوتر دائمًا أذكى من الإنسان',
            en: 'Computers are always smarter than humans',
            he: 'מחשבים תמיד חכמים יותר מבני אדם',
          },
        },
      ],

      correctAnswer: 'thinking',

      explanation: {
        ar: '🎯 بالضبط. المهارة الأساسية ليست حفظ الإجابات، بل التفكير وحل المشكلات.',
        en: '🎯 Exactly. The key skill is not memorizing answers, but thinking and solving problems.',
        he: '🎯 בדיוק. המיומנות המרכזית היא לא לזכור תשובות, אלא לחשוב ולפתור בעיות.',
      },

      skills: ['problemSolving'],
    },

    {
      id: 'm06-complete',
      type: 'story',

      title: {
        ar: '🏆 T-LAB RESTORED',
        en: '🏆 T-LAB RESTORED',
        he: '🏆 T-LAB שוחזרה',
      },

      text: {
        ar: `✅ SYSTEM ONLINE
✅ NETWORK ONLINE
✅ SECURITY ONLINE
✅ DATA RECOVERED
✅ T-LAB RESTORED

🤖 Byte:
"نجحت!

في البداية كنت متدربًا جديدًا...
والآن أصبحت قادرًا على حل مشكلات حقيقية."

خلال رحلتك تعلمت:

🧠 الخوارزميات والتعليمات
💻 مكونات الحاسوب وتشخيص الأعطال
0️⃣1️⃣ البيانات والترميز
🌐 الشبكات وحزم البيانات
🛡️ الأمان الرقمي

🏅 رتبتك النهائية:

🚀 T-LAB DIGITAL EXPLORER

🎉 أنهيت برنامج رحلة علوم الحاسوب والتكنولوجيا الحديثة.`,

        en: `✅ SYSTEM ONLINE
✅ NETWORK ONLINE
✅ SECURITY ONLINE
✅ DATA RECOVERED
✅ T-LAB RESTORED

🤖 Byte:
"You did it!

You started as a new trainee...
and now you can solve real digital problems."

During your journey you learned:

🧠 Algorithms and instructions
💻 Computer components and diagnosis
0️⃣1️⃣ Data and encoding
🌐 Networks and packets
🛡️ Digital safety

🏅 Your final rank:

🚀 T-LAB DIGITAL EXPLORER

🎉 You completed the Computer Science & Modern Technology Journey.`,

        he: `✅ SYSTEM ONLINE
✅ NETWORK ONLINE
✅ SECURITY ONLINE
✅ DATA RECOVERED
✅ T-LAB RESTORED

🤖 Byte:
"הצלחת!

התחלת כחניך חדש...
ועכשיו אתה מסוגל לפתור בעיות דיגיטליות אמיתיות."

במהלך המסע למדת:

🧠 אלגוריתמים והוראות
💻 רכיבי מחשב ואבחון תקלות
0️⃣1️⃣ נתונים וקידוד
🌐 רשתות וחבילות מידע
🛡️ בטיחות דיגיטלית

🏅 הדרגה הסופית שלך:

🚀 T-LAB DIGITAL EXPLORER

🎉 השלמת את מסע מדעי המחשב והטכנולוגיה המודרנית.`,
      },

      skills: [
        'algorithmicThinking',
        'diagnosis',
        'binaryThinking',
        'decoding',
        'routing',
        'cyberAwareness',
        'problemSolving',
      ],
    },
  ],
};

export default mission06;