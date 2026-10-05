export const mission04 = {
  id: 'mission-04',

  title: {
    ar: 'رحلة حزمة البيانات',
    en: 'The Data Packet Journey',
    he: 'מסע חבילת הנתונים',
  },

  activityType: 'mission',
  estimatedMinutes: 50,
  xpReward: 100,

  sections: [
    // 1
    {
      id: 'm04-intro',
      type: 'story',

      title: {
        ar: '🚨 PACKET LOST',
        en: '🚨 PACKET LOST',
        he: '🚨 PACKET LOST',
      },

      text: {
        ar: `بعد فك الرسالة السرية...

حاول Byte إرسالها إلى جهاز آخر في T-LAB.

لكن فجأة ظهر:

❌ PACKET LOST

🤖 Byte:
"الرسالة خرجت من الجهاز... لكنها لم تصل!"

مهمتك:
تتبّع رحلة الرسالة عبر الشبكة
وأوصلها إلى وجهتها.`,

        en: `After decoding the secret message...

Byte tried to send it to another computer in T-LAB.

Suddenly:

❌ PACKET LOST

🤖 Byte:
"The message left the computer... but never arrived!"

Your mission:
follow the message through the network
and deliver it to its destination.`,

        he: `לאחר פענוח ההודעה הסודית...

Byte ניסה לשלוח אותה למחשב אחר ב-T-LAB.

אבל פתאום:

❌ PACKET LOST

🤖 Byte:
"ההודעה יצאה מהמחשב... אבל לא הגיעה!"

המשימה שלך:
לעקוב אחרי מסלול ההודעה ברשת
ולהביא אותה ליעד.`,
      },

      skills: ['networkThinking'],
    },

    // 2
    {
      id: 'm04-first-question',
      type: 'multipleChoice',

      title: {
        ar: '📡 كيف تصل الرسالة؟',
        en: '📡 How Does the Message Travel?',
        he: '📡 איך ההודעה עוברת?',
      },

      text: {
        ar: `أرسلت رسالة من جهازك إلى جهاز موجود في مكان آخر.

برأيك، هل تقفز الرسالة مباشرة من جهازك إلى الجهاز الآخر؟`,

        en: `You send a message from your computer to another computer far away.

Does the message simply jump directly from one device to the other?`,

        he: `שלחת הודעה מהמחשב שלך למחשב שנמצא במקום אחר.

האם ההודעה פשוט קופצת ישירות ממחשב למחשב?`,
      },

      options: [
        {
          id: 'direct',
          text: {
            ar: 'نعم، مباشرة',
            en: 'Yes, directly',
            he: 'כן, ישירות',
          },
        },
        {
          id: 'network',
          text: {
            ar: 'لا، تمر عبر أجهزة وشبكات في الطريق',
            en: 'No, it travels through devices and networks along the way',
            he: 'לא, היא עוברת דרך מכשירים ורשתות בדרך',
          },
        },
        {
          id: 'unknown',
          text: {
            ar: 'الرسالة تختفي ثم تظهر',
            en: 'The message disappears and reappears',
            he: 'ההודעה נעלמת ואז מופיעה',
          },
        },
      ],

      correctAnswer: 'network',

      explanation: {
        ar: 'بالضبط! البيانات تنتقل عبر شبكة من الأجهزة والمسارات.',
        en: 'Exactly! Data travels through a network of devices and routes.',
        he: 'בדיוק! נתונים עוברים דרך רשת של מכשירים ומסלולים.',
      },

      hints: [
        {
          ar: 'فكر بالطريق بين مدينتين: هل يوجد دائمًا طريق واحد مباشر؟',
          en: 'Think about traveling between two cities. Is there always one direct road?',
          he: 'חשבו על נסיעה בין שתי ערים. האם תמיד יש כביש ישיר אחד?',
        },
      ],

      skills: ['networkThinking'],
    },

    // 3
    {
      id: 'm04-explain-network',
      type: 'explain',

      icon: '🌐',

      title: {
        ar: 'الإنترنت = شبكة من الشبكات',
        en: 'The Internet = A Network of Networks',
        he: 'האינטרנט = רשת של רשתות',
      },

      body: {
        ar: `الإنترنت يربط عددًا هائلًا من الأجهزة والشبكات معًا.

عندما ترسل بيانات، فهي تنتقل عبر هذا النظام حتى تصل إلى المكان الصحيح.`,

        en: `The internet connects huge numbers of devices and networks.

When you send data, it travels through this system until it reaches the correct destination.`,

        he: `האינטרנט מחבר כמויות עצומות של מכשירים ורשתות.

כששולחים נתונים, הם עוברים דרך המערכת עד שהם מגיעים ליעד הנכון.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: '💻 جهازك → 📡 شبكة → 🌐 الإنترنت → 📡 شبكة أخرى → 💻 الجهاز الآخر',
          en: '💻 Your device → 📡 Network → 🌐 Internet → 📡 Another network → 💻 Destination',
          he: '💻 המכשיר שלך → 📡 רשת → 🌐 אינטרנט → 📡 רשת אחרת → 💻 יעד',
        },
      },

      skills: ['networkThinking'],
    },

    // 4
    {
      id: 'm04-route-order',
      type: 'sequence',

      title: {
        ar: '🧭 رتّب رحلة الرسالة',
        en: '🧭 Arrange the Message Journey',
        he: '🧭 סדרו את מסע ההודעה',
      },

      text: {
        ar: 'رتّب المراحل من بداية إرسال الرسالة حتى وصولها.',
        en: 'Arrange the stages from sending the message until it arrives.',
        he: 'סדרו את השלבים מרגע שליחת ההודעה ועד הגעתה.',
      },

      items: [
        {
          id: 'destination',
          text: {
            ar: '💻 الجهاز المستقبِل',
            en: '💻 Destination device',
            he: '💻 מחשב היעד',
          },
        },
        {
          id: 'source',
          text: {
            ar: '📱 الجهاز المرسِل',
            en: '📱 Sending device',
            he: '📱 המכשיר השולח',
          },
        },
        {
          id: 'router',
          text: {
            ar: '📡 الراوتر',
            en: '📡 Router',
            he: '📡 נתב',
          },
        },
        {
          id: 'network',
          text: {
            ar: '🌐 الشبكة',
            en: '🌐 Network',
            he: '🌐 רשת',
          },
        },
      ],

      correctOrder: [
        'source',
        'router',
        'network',
        'destination',
      ],

      explanation: {
        ar: 'ممتاز! الرسالة تمر عبر أجزاء من الشبكة حتى تصل إلى وجهتها.',
        en: 'Great! The message travels through parts of the network until it reaches its destination.',
        he: 'מצוין! ההודעה עוברת דרך חלקים ברשת עד שהיא מגיעה ליעד.',
      },

      skills: ['sequencing', 'networkThinking'],
    },

    // 5
    {
      id: 'm04-explain-packet',
      type: 'explain',

      icon: '📦',

      title: {
        ar: 'ما هي Packet؟',
        en: 'What Is a Packet?',
        he: 'מהי Packet?',
      },

      body: {
        ar: `البيانات الكبيرة لا تحتاج دائمًا أن تسافر كقطعة واحدة.

يمكن تقسيمها إلى أجزاء أصغر تسمى Packets — حزم بيانات.`,

        en: `Large amounts of data do not always travel as one giant piece.

They can be divided into smaller pieces called packets.`,

        he: `מידע גדול לא חייב לעבור כיחידה אחת גדולה.

אפשר לחלק אותו לחלקים קטנים יותר שנקראים Packets.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: '💬 رسالة كبيرة → 📦 📦 📦 حزم صغيرة → 🎯 الوجهة',
          en: '💬 Large message → 📦 📦 📦 Small packets → 🎯 Destination',
          he: '💬 הודעה גדולה → 📦 📦 📦 חבילות קטנות → 🎯 יעד',
        },
      },

      skills: ['packets'],
    },

    // 6
    {
      id: 'm04-packet-question',
      type: 'multipleChoice',

      title: {
        ar: '📦 لماذا الحزم؟',
        en: '📦 Why Packets?',
        he: '📦 למה חבילות?',
      },

      text: {
        ar: `لماذا قد يكون من المفيد تقسيم البيانات إلى أجزاء أصغر؟`,

        en: `Why might it be useful to divide data into smaller pieces?`,

        he: `למה יכול להיות שימושי לחלק מידע לחלקים קטנים יותר?`,
      },

      options: [
        {
          id: 'manageable',
          text: {
            ar: 'لأن الأجزاء الصغيرة أسهل في الإرسال والتعامل معها عبر الشبكة',
            en: 'Because smaller pieces can be easier to send and manage across a network',
            he: 'כי חלקים קטנים יכולים להיות קלים יותר לשליחה ולניהול ברשת',
          },
        },
        {
          id: 'pretty',
          text: {
            ar: 'لأن شكلها أجمل',
            en: 'Because they look nicer',
            he: 'כי הם נראים יפה יותר',
          },
        },
        {
          id: 'random',
          text: {
            ar: 'لا يوجد أي سبب',
            en: 'There is no reason',
            he: 'אין שום סיבה',
          },
        },
      ],

      correctAnswer: 'manageable',

      explanation: {
        ar: 'صحيح! تقسيم البيانات يساعد الشبكات على التعامل معها بكفاءة أكبر.',
        en: 'Correct! Dividing data helps networks handle it more efficiently.',
        he: 'נכון! חלוקת המידע עוזרת לרשתות לטפל בו בצורה יעילה יותר.',
      },

      skills: ['packets'],
    },

    // 7
    {
      id: 'm04-router-explain',
      type: 'explain',

      icon: '📡',

      title: {
        ar: 'Router = موجّه الطريق',
        en: 'Router = Traffic Guide',
        he: 'Router = מכוון הדרך',
      },

      body: {
        ar: `الراوتر يساعد في توجيه البيانات نحو الشبكة أو الطريق التالي.

فكر فيه كأنه شرطي مرور للبيانات.`,

        en: `A router helps direct data toward the next network or route.

Think of it like a traffic guide for data.`,

        he: `נתב עוזר לכוון נתונים לרשת או למסלול הבא.

אפשר לחשוב עליו כמו שוטר תנועה של נתונים.`,
      },

      visual: {
        type: 'comparison',

        leftTitle: {
          ar: '🚗 طريق',
          en: '🚗 Road',
          he: '🚗 כביש',
        },

        left: {
          ar: 'اختيار الاتجاه المناسب للسيارة',
          en: 'Choose the correct direction for a car',
          he: 'בחירת הכיוון המתאים לרכב',
        },

        rightTitle: {
          ar: '📦 Packet',
          en: '📦 Packet',
          he: '📦 Packet',
        },

        right: {
          ar: 'اختيار الاتجاه المناسب للبيانات',
          en: 'Choose the correct direction for data',
          he: 'בחירת הכיוון המתאים לנתונים',
        },
      },

      skills: ['routers'],
    },

    // 8 - Robot routing challenge
    {
      id: 'm04-route-challenge',
      type: 'robot',

      title: {
        ar: '🛰️ وجّه الحزمة',
        en: '🛰️ Route the Packet',
        he: '🛰️ כוונו את החבילה',
      },

      text: {
        ar: `الحزمة موجودة في بداية الشبكة.

بعض المسارات معطلة.

اكتب الأوامر التي توصلها إلى الوجهة 🔑.`,

        en: `The packet is at the start of the network.

Some routes are blocked.

Create commands that deliver it to the destination 🔑.`,

        he: `החבילה נמצאת בתחילת הרשת.

חלק מהמסלולים חסומים.

צרו הוראות שיביאו אותה ליעד 🔑.`,
      },

      grid: {
        size: 4,
        start: [0, 0],
        goal: [3, 3],

        obstacles: [
          [1, 1],
          [1, 2],
          [2, 2],
        ],
      },

      hints: [
        {
          ar: 'لا تحاول المرور عبر المربعات المغلقة.',
          en: 'Do not try to move through blocked squares.',
          he: 'אל תנסו לעבור דרך המשבצות החסומות.',
        },
        {
          ar: 'فكر أولًا بالتحرك نحو اليمين ثم ابحث عن طريق إلى الأسفل.',
          en: 'Try moving right first, then look for a path downward.',
          he: 'נסו קודם לנוע ימינה ואז חפשו דרך למטה.',
        },
      ],

      explanation: {
        ar: '📦 Packet delivered! اخترت مسارًا صالحًا عبر الشبكة.',
        en: '📦 Packet delivered! You found a valid route through the network.',
        he: '📦 החבילה הגיעה! מצאת מסלול תקין דרך הרשת.',
      },

      skills: ['routing', 'planning'],
    },

    // 9
    {
      id: 'm04-internet-web',
      type: 'multipleChoice',

      title: {
        ar: '🌐 الإنترنت أم الويب؟',
        en: '🌐 Internet or Web?',
        he: '🌐 אינטרנט או Web?',
      },

      text: {
        ar: `Byte يقول:

"الإنترنت والويب هما نفس الشيء تمامًا."

هل كلامه صحيح؟`,

        en: `Byte says:

"The internet and the web are exactly the same thing."

Is he correct?`,

        he: `Byte אומר:

"האינטרנט וה-Web הם בדיוק אותו דבר."

האם הוא צודק?`,
      },

      options: [
        {
          id: 'same',
          text: {
            ar: 'نعم، نفس الشيء',
            en: 'Yes, exactly the same',
            he: 'כן, בדיוק אותו דבר',
          },
        },
        {
          id: 'different',
          text: {
            ar: 'لا، الويب خدمة تستخدم الإنترنت',
            en: 'No, the web is a service that uses the internet',
            he: 'לא, ה-Web הוא שירות שמשתמש באינטרנט',
          },
        },
      ],

      correctAnswer: 'different',

      explanation: {
        ar: 'ممتاز! الإنترنت هو البنية والشبكات، والويب أحد الأشياء التي نستخدمها عبره.',
        en: 'Great! The internet is the network infrastructure, while the web is one service that uses it.',
        he: 'מצוין! האינטרנט הוא תשתית הרשתות, וה-Web הוא אחד השירותים שמשתמשים בה.',
      },

      skills: ['internetWeb'],
    },

    // 10
    {
      id: 'm04-web-explain',
      type: 'explain',

      icon: '🌍',

      title: {
        ar: 'الإنترنت ≠ الويب',
        en: 'Internet ≠ Web',
        he: 'Internet ≠ Web',
      },

      body: {
        ar: `الإنترنت هو الشبكات والأجهزة التي تتصل ببعضها.

الويب هو صفحات ومواقع نستخدمها عبر الإنترنت.`,

        en: `The internet is the connected network infrastructure.

The web is made of pages and websites that use the internet.`,

        he: `האינטרנט הוא תשתית של רשתות ומכשירים מחוברים.

ה-Web הוא אוסף של דפים ואתרים שמשתמשים באינטרנט.`,
      },

      visual: {
        type: 'comparison',

        leftTitle: {
          ar: '🌐 Internet',
          en: '🌐 Internet',
          he: '🌐 Internet',
        },

        left: {
          ar: 'الشبكات والاتصالات',
          en: 'Networks and connections',
          he: 'רשתות וחיבורים',
        },

        rightTitle: {
          ar: '🌍 Web',
          en: '🌍 Web',
          he: '🌍 Web',
        },

        right: {
          ar: 'مواقع وصفحات تعمل فوق الإنترنت',
          en: 'Websites and pages that use the internet',
          he: 'אתרים ודפים שמשתמשים באינטרנט',
        },
      },

      skills: ['internetWeb'],
    },

    // 11
    {
      id: 'm04-debug-route',
      type: 'debugging',

      title: {
        ar: '🐞 خطأ في المسار',
        en: '🐞 Routing Bug',
        he: '🐞 שגיאה במסלול',
      },

      text: {
        ar: `Byte كتب برنامجًا لتوصيل الحزمة...

لكن الحزمة تصطدم بجدار.

غيّر التعليمة الخاطئة ثم شغّل البرنامج من جديد.`,

        en: `Byte created a route for the packet...

but the packet crashes into a blocked path.

Fix the incorrect instruction and run it again.`,

        he: `Byte יצר מסלול לחבילה...

אבל החבילה נתקעת במסלול חסום.

תקנו את ההוראה השגויה והריצו שוב.`,
      },

      grid: {
        size: 3,
        start: [0, 0],
        goal: [2, 1],
        obstacles: [[1, 0]],
      },

      commands: [
        'right',
        'right',
        'down',
      ],

      hints: [
        {
          ar: 'أول خطوة نحو اليمين تصطدم بالجدار.',
          en: 'The first move to the right hits a blocked square.',
          he: 'הצעד הראשון ימינה פוגע במשבצת חסומה.',
        },
      ],

      explanation: {
        ar: '🐞 أصلحت المسار! حتى الشبكات تحتاج إلى اكتشاف الأخطاء وتصحيحها.',
        en: '🐞 Route fixed! Networks also need problems to be detected and corrected.',
        he: '🐞 תיקנת את המסלול! גם ברשתות צריך לזהות ולתקן בעיות.',
      },

      skills: ['routing', 'debugging'],
    },

    // 12
    {
      id: 'm04-final-question',
      type: 'multipleChoice',

      title: {
        ar: '🔥 اختبار مسؤول الشبكة',
        en: '🔥 Network Operator Challenge',
        he: '🔥 אתגר מנהל הרשת',
      },

      text: {
        ar: `أرسلت صورة إلى صديق.

أي وصف هو الأقرب لما يحدث؟`,

        en: `You send a photo to a friend.

Which description is closest to what happens?`,

        he: `שלחת תמונה לחבר.

איזה תיאור הכי קרוב למה שקורה?`,
      },

      options: [
        {
          id: 'network',
          text: {
            ar: 'تتحول البيانات إلى حزم وتسافر عبر الشبكات حتى تصل إلى الجهاز الآخر',
            en: 'The data can travel as packets through networks until it reaches the other device',
            he: 'הנתונים יכולים לעבור כחבילות דרך רשתות עד שהם מגיעים למכשיר השני',
          },
        },
        {
          id: 'teleport',
          text: {
            ar: 'تنتقل الصورة فورًا من الشاشة إلى شاشة صديقك',
            en: 'The photo instantly teleports from your screen to your friend’s screen',
            he: 'התמונה משתגֶרת מיד מהמסך שלך למסך של החבר',
          },
        },
        {
          id: 'website',
          text: {
            ar: 'كل البيانات يجب أن تمر بموقع ويب',
            en: 'All data must pass through a website',
            he: 'כל הנתונים חייבים לעבור דרך אתר אינטרנט',
          },
        },
      ],

      correctAnswer: 'network',

      explanation: {
        ar: '🎯 ممتاز! أصبحت تفكر كمسؤول شبكة.',
        en: '🎯 Excellent! You are thinking like a network operator.',
        he: '🎯 מצוין! אתה חושב כמו מנהל רשת.',
      },

      skills: [
        'packets',
        'routers',
        'routing',
        'networkThinking',
      ],
    },

    // 13
    {
      id: 'm04-complete',
      type: 'story',

      title: {
        ar: '🏆 MISSION COMPLETE',
        en: '🏆 MISSION COMPLETE',
        he: '🏆 המשימה הושלמה',
      },

      text: {
        ar: `📦 PACKET DELIVERED!

نجحت في إعادة الرسالة إلى مسارها.

أصبحت تعرف:

🌐 كيف تنتقل البيانات عبر الشبكات
📦 ما هي حزمة البيانات
📡 دور الراوتر
🧭 معنى المسار
🌍 الفرق بين الإنترنت والويب

🏅 الرتبة الجديدة:
Network Navigator

لكن قبل أن يحتفل Byte...

ظهر إنذار جديد:

⚠️ LOGIN ATTEMPT DETECTED

🛡️ Mission 05:
اختراق في المختبر

شخص ما يحاول الدخول إلى حساب T-LAB...

هل تستطيع إيقافه؟`,

        en: `📦 PACKET DELIVERED!

You successfully returned the message to its route.

You now understand:

🌐 How data travels through networks
📦 What a packet is
📡 What routers do
🧭 What a route means
🌍 The difference between the internet and the web

🏅 New rank:
Network Navigator

But before Byte can celebrate...

a new alert appears:

⚠️ LOGIN ATTEMPT DETECTED

🛡️ Mission 05:
Lab Intrusion

Someone is trying to access a T-LAB account...

Can you stop them?`,

        he: `📦 PACKET DELIVERED!

הצלחת להחזיר את ההודעה למסלול שלה.

עכשיו אתה מבין:

🌐 איך נתונים עוברים ברשתות
📦 מהי חבילת נתונים
📡 מה תפקיד הנתב
🧭 מהו מסלול
🌍 מה ההבדל בין האינטרנט ל-Web

🏅 דרגה חדשה:
Network Navigator

אבל לפני ש-Byte מספיק לחגוג...

מופיעה התראה חדשה:

⚠️ LOGIN ATTEMPT DETECTED

🛡️ משימה 05:
פריצה למעבדה

מישהו מנסה להיכנס לחשבון T-LAB...

האם תצליח לעצור אותו?`,
      },

      skills: [
        'networkThinking',
        'packets',
        'routers',
        'routing',
        'internetWeb',
      ],
    },
  ],
};

export default mission04;