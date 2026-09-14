export const mission02 = {
  id: 'mission-02',

  title: {
    ar: 'الحاسوب الميت',
    en: 'The Dead Computer',
    he: 'המחשב המת',
  },

  activityType: 'mission',

  estimatedMinutes: 50,

  xpReward: 100,

  sections: [
    // 1
    {
      id: 'm02-intro',
      type: 'story',

      title: {
        ar: '🚨 إنذار في T-LAB',
        en: '🚨 T-LAB Alert',
        he: '🚨 התראה ב-T-LAB',
      },

      text: {
        ar: `أحد أجهزة المختبر توقف عن العمل.

الشاشة سوداء...
والجهاز يتصرف بشكل غريب.

مهمتك اليوم ليست حفظ أسماء القطع.

🕵️ مهمتك: اكتشاف العطل وإعادة الجهاز للعمل.`,

        en: `One of the lab computers has stopped working.

The screen is dark...
and the computer is behaving strangely.

Your mission is not to memorize computer parts.

🕵️ Your mission: find the problem and bring the computer back to life.`,

        he: `אחד ממחשבי המעבדה הפסיק לעבוד.

המסך חשוך...
והמחשב מתנהג בצורה מוזרה.

המשימה שלך אינה לשנן שמות של חלקים.

🕵️ המשימה: למצוא את התקלה ולהחזיר את המחשב לחיים.`,
      },

      skills: ['diagnosis'],
    },

    // 2
    {
      id: 'm02-first-clue',
      type: 'multipleChoice',

      title: {
        ar: '🔎 الدليل الأول',
        en: '🔎 First Clue',
        he: '🔎 הרמז הראשון',
      },

      text: {
        ar: `الجهاز يفتح بشكل طبيعي.

لكن عندما نفتح عدة برامج معًا،
يبدأ بالتعليق ويصبح بطيئًا جدًا.

أي جزء تشك فيه أولًا؟`,

        en: `The computer starts normally.

But when several programs are opened together,
it becomes very slow and begins to freeze.

Which part would you investigate first?`,

        he: `המחשב נדלק כרגיל.

אבל כשפותחים כמה תוכנות יחד,
הוא נהיה איטי מאוד ונתקע.

איזה רכיב היית בודק קודם?`,
      },

      options: [
        {
          id: 'cpu',
          text: {
            ar: '⚙️ CPU',
            en: '⚙️ CPU',
            he: '⚙️ CPU',
          },
        },
        {
          id: 'ram',
          text: {
            ar: '🧠 RAM',
            en: '🧠 RAM',
            he: '🧠 RAM',
          },
        },
        {
          id: 'storage',
          text: {
            ar: '💾 Storage',
            en: '💾 Storage',
            he: '💾 Storage',
          },
        },
      ],

      correctAnswer: 'ram',

      explanation: {
        ar: 'دليل ممتاز! المشكلة تظهر عندما يحتاج الجهاز مساحة عمل أكبر للبرامج المفتوحة.',
        en: 'Great clue! The problem appears when the computer needs more working space for open programs.',
        he: 'רמז מצוין! הבעיה מופיעה כשהמחשב זקוק ליותר מרחב עבודה עבור תוכנות פתוחות.',
      },

      hints: [
        {
          ar: 'فكر بالأشياء التي يحتاجها الجهاز أثناء تشغيل البرامج الآن، وليس بحفظ الملفات.',
          en: 'Think about what the computer needs while programs are running now, not where files are stored.',
          he: 'חשוב על מה שהמחשב צריך בזמן שהתוכנות פועלות עכשיו, לא על שמירת קבצים.',
        },
      ],

      skills: ['ram', 'diagnosis'],
    },

    // 3
    {
      id: 'm02-explain-ram',
      type: 'explain',

      icon: '🧠',

      title: {
        ar: 'RAM = طاولة العمل',
        en: 'RAM = Your Work Desk',
        he: 'RAM = שולחן העבודה',
      },

      body: {
        ar: `RAM هي مساحة العمل المؤقتة في الكمبيوتر.

كلما فتحت برامج أكثر، يحتاج الجهاز مساحة عمل أكبر.`,

        en: `RAM is the computer's temporary working space.

The more programs you open, the more working space the computer needs.`,

        he: `RAM הוא מרחב העבודה הזמני של המחשב.

ככל שפותחים יותר תוכנות, המחשב זקוק ליותר מרחב עבודה.`,
      },

      visual: {
        type: 'comparison',

        leftTitle: {
          ar: '🧠 RAM',
          en: '🧠 RAM',
          he: '🧠 RAM',
        },

        left: {
          ar: 'مثل طاولة الدراسة: الأشياء التي تستخدمها الآن.',
          en: 'Like a desk: the things you are using right now.',
          he: 'כמו שולחן עבודה: הדברים שבהם משתמשים עכשיו.',
        },

        rightTitle: {
          ar: '💾 Storage',
          en: '💾 Storage',
          he: '💾 Storage',
        },

        right: {
          ar: 'مثل الخزانة: الأشياء التي تريد الاحتفاظ بها.',
          en: 'Like a cabinet: things you want to keep.',
          he: 'כמו ארון: דברים שרוצים לשמור.',
        },
      },

      cta: {
        ar: 'فهمت، أكمل 🔎',
        en: 'Got it, continue 🔎',
        he: 'הבנתי, ממשיכים 🔎',
      },

      skills: ['ram'],
    },

    // 4
    {
      id: 'm02-storage-question',
      type: 'multipleChoice',

      title: {
        ar: '💾 أين تعيش الملفات؟',
        en: '💾 Where Do Files Live?',
        he: '💾 איפה הקבצים נשמרים?',
      },

      text: {
        ar: `أغلقت الكمبيوتر تمامًا.

في اليوم التالي شغلته من جديد...
والصور والفيديوهات ما زالت موجودة.

أين كانت محفوظة؟`,

        en: `You completely shut down the computer.

The next day you turn it on again...
and your photos and videos are still there.

Where were they stored?`,

        he: `כיבית את המחשב לגמרי.

למחרת הדלקת אותו שוב...
והתמונות והסרטונים עדיין שם.

איפה הם נשמרו?`,
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
            ar: 'لوحة المفاتيح',
            en: 'Keyboard',
            he: 'מקלדת',
          },
        },
      ],

      correctAnswer: 'storage',

      explanation: {
        ar: 'صحيح! Storage يحتفظ بالملفات حتى بعد إطفاء الجهاز.',
        en: 'Correct! Storage keeps files even after the computer is turned off.',
        he: 'נכון! האחסון שומר את הקבצים גם לאחר כיבוי המחשב.',
      },

      hints: [
        {
          ar: 'ابحث عن الجزء الذي يحفظ المعلومات لمدة طويلة.',
          en: 'Look for the part that keeps information for a long time.',
          he: 'חפש את הרכיב ששומר מידע לאורך זמן.',
        },
      ],

      skills: ['storage'],
    },

    // 5
    {
      id: 'm02-explain-storage',
      type: 'explain',

      icon: '💾',

      title: {
        ar: 'Storage = ذاكرة طويلة المدى',
        en: 'Storage = Long-Term Memory',
        he: 'Storage = זיכרון לטווח ארוך',
      },

      body: {
        ar: `الصور، الألعاب، البرامج والملفات تحتاج مكانًا يبقى محفوظًا حتى بعد إطفاء الكمبيوتر.

هذا هو دور Storage.`,

        en: `Photos, games, apps and files need a place that keeps them even after the computer is turned off.

That is the job of Storage.`,

        he: `תמונות, משחקים, תוכנות וקבצים צריכים מקום ששומר אותם גם אחרי כיבוי המחשב.

זה התפקיד של Storage.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: '📷 صورة اليوم → 💾 Storage → 🔌 إطفاء الجهاز → 📷 الصورة ما زالت موجودة',
          en: '📷 Photo → 💾 Storage → 🔌 Shut down → 📷 The photo is still there',
          he: '📷 תמונה → 💾 Storage → 🔌 כיבוי → 📷 התמונה עדיין קיימת',
        },
      },

      skills: ['storage'],
    },

    // 6
    {
      id: 'm02-cpu-discovery',
      type: 'multipleChoice',

      title: {
        ar: '⚙️ من ينفذ التعليمات؟',
        en: '⚙️ Who Executes Instructions?',
        he: '⚙️ מי מבצע את ההוראות?',
      },

      text: {
        ar: `ضغطت على زر داخل لعبة.

يجب على الكمبيوتر أن يفهم الأمر،
ويحسب ماذا سيحدث،
ثم ينفذه.

أي جزء يقوم بمعظم هذه المعالجة؟`,

        en: `You press a button in a game.

The computer must understand the instruction,
work out what should happen,
and execute it.

Which part performs most of this processing?`,

        he: `לחצת על כפתור במשחק.

המחשב צריך להבין את ההוראה,
לחשב מה צריך לקרות,
ולבצע אותה.

איזה רכיב מבצע את רוב העיבוד?`,
      },

      options: [
        {
          id: 'cpu',
          text: {
            ar: '⚙️ CPU',
            en: '⚙️ CPU',
            he: '⚙️ CPU',
          },
        },
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
      ],

      correctAnswer: 'cpu',

      explanation: {
        ar: 'بالضبط! CPU ينفذ التعليمات ويعالج البيانات.',
        en: 'Exactly! The CPU executes instructions and processes data.',
        he: 'בדיוק! ה-CPU מבצע הוראות ומעבד נתונים.',
      },

      skills: ['cpu'],
    },

    // 7
    {
      id: 'm02-explain-cpu',
      type: 'explain',

      icon: '⚙️',

      title: {
        ar: 'CPU = منفّذ التعليمات',
        en: 'CPU = Instruction Executor',
        he: 'CPU = מבצע ההוראות',
      },

      body: {
        ar: `الـCPU يستقبل التعليمات ويعالج البيانات.

هو جزء أساسي من عملية التفكير الحسابي داخل الجهاز.`,

        en: `The CPU receives instructions and processes data.

It is a central part of the computer's processing work.`,

        he: `ה-CPU מקבל הוראות ומעבד נתונים.

זהו חלק מרכזי בתהליך העיבוד של המחשב.`,
      },

      visual: {
        type: 'example',

        text: {
          ar: '⌨️ Input → ⚙️ Processing → 🖥️ Output',
          en: '⌨️ Input → ⚙️ Processing → 🖥️ Output',
          he: '⌨️ קלט → ⚙️ עיבוד → 🖥️ פלט',
        },
      },

      skills: ['cpu', 'inputOutput'],
    },

    // 8
    {
      id: 'm02-input-question',
      type: 'multipleChoice',

      title: {
        ar: '⌨️ Input أم Output؟',
        en: '⌨️ Input or Output?',
        he: '⌨️ קלט או פלט?',
      },

      text: {
        ar: 'أي جهاز من التالي يرسل معلومات إلى الكمبيوتر؟',
        en: 'Which device sends information into the computer?',
        he: 'איזה מכשיר שולח מידע אל המחשב?',
      },

      options: [
        {
          id: 'keyboard',
          text: {
            ar: '⌨️ لوحة المفاتيح',
            en: '⌨️ Keyboard',
            he: '⌨️ מקלדת',
          },
        },
        {
          id: 'screen',
          text: {
            ar: '🖥️ الشاشة',
            en: '🖥️ Screen',
            he: '🖥️ מסך',
          },
        },
        {
          id: 'speaker',
          text: {
            ar: '🔊 السماعات',
            en: '🔊 Speakers',
            he: '🔊 רמקולים',
          },
        },
      ],

      correctAnswer: 'keyboard',

      explanation: {
        ar: 'صحيح! لوحة المفاتيح ترسل إدخالًا إلى الكمبيوتر.',
        en: 'Correct! The keyboard sends input to the computer.',
        he: 'נכון! המקלדת שולחת קלט אל המחשב.',
      },

      skills: ['inputOutput'],
    },

    // 9
    {
      id: 'm02-output-question',
      type: 'multipleChoice',

      title: {
        ar: '📺 دورك الآن',
        en: '📺 Your Turn',
        he: '📺 עכשיו תורך',
      },

      text: {
        ar: 'أي جهاز يعرض نتيجة عمل الكمبيوتر للمستخدم؟',
        en: 'Which device shows the computer’s result to the user?',
        he: 'איזה מכשיר מציג למשתמש את התוצאה של עבודת המחשב?',
      },

      options: [
        {
          id: 'mouse',
          text: {
            ar: '🖱️ Mouse',
            en: '🖱️ Mouse',
            he: '🖱️ עכבר',
          },
        },
        {
          id: 'screen',
          text: {
            ar: '🖥️ Screen',
            en: '🖥️ Screen',
            he: '🖥️ מסך',
          },
        },
        {
          id: 'keyboard',
          text: {
            ar: '⌨️ Keyboard',
            en: '⌨️ Keyboard',
            he: '⌨️ מקלדת',
          },
        },
      ],

      correctAnswer: 'screen',

      explanation: {
        ar: 'ممتاز! الشاشة جهاز Output لأنها تعرض النتائج.',
        en: 'Great! The screen is an output device because it displays results.',
        he: 'מצוין! המסך הוא התקן פלט כי הוא מציג תוצאות.',
      },

      skills: ['inputOutput'],
    },

    // 10
    {
      id: 'm02-repair-1',
      type: 'multipleChoice',

      title: {
        ar: '🛠️ Repair Mode — الجهاز A',
        en: '🛠️ Repair Mode — Device A',
        he: '🛠️ מצב תיקון — מחשב A',
      },

      text: {
        ar: `الجهاز يعمل بسرعة جيدة.

لكن المستخدم لا يستطيع حفظ صور أو ألعاب جديدة لأن المساحة ممتلئة.

أي جزء يحتاج إلى ترقية؟`,

        en: `The computer runs at a good speed.

But the user cannot save new photos or games because the space is full.

Which part should be upgraded?`,

        he: `המחשב עובד במהירות טובה.

אבל המשתמש לא מצליח לשמור תמונות או משחקים חדשים כי המקום מלא.

איזה רכיב כדאי לשדרג?`,
      },

      options: [
        { id: 'ram', text: { ar: 'RAM', en: 'RAM', he: 'RAM' } },
        { id: 'storage', text: { ar: 'Storage', en: 'Storage', he: 'Storage' } },
        { id: 'cpu', text: { ar: 'CPU', en: 'CPU', he: 'CPU' } },
      ],

      correctAnswer: 'storage',

      explanation: {
        ar: 'صحيح! المشكلة هنا هي مساحة التخزين.',
        en: 'Correct! The issue here is storage capacity.',
        he: 'נכון! הבעיה כאן היא נפח האחסון.',
      },

      skills: ['storage', 'diagnosis'],
    },

    // 11
    {
      id: 'm02-repair-2',
      type: 'multipleChoice',

      title: {
        ar: '🛠️ Repair Mode — الجهاز B',
        en: '🛠️ Repair Mode — Device B',
        he: '🛠️ מצב תיקון — מחשב B',
      },

      text: {
        ar: `الجهاز لديه مساحة تخزين كبيرة وفارغة.

لكنه يصبح بطيئًا جدًا عند فتح 12 برنامجًا معًا.

شو بتفحص أولًا؟`,

        en: `The computer has plenty of free storage.

But it becomes very slow when 12 programs are opened together.

What would you investigate first?`,

        he: `למחשב יש הרבה מקום אחסון פנוי.

אבל הוא נהיה איטי מאוד כשפותחים 12 תוכנות יחד.

מה היית בודק קודם?`,
      },

      options: [
        { id: 'ram', text: { ar: 'RAM', en: 'RAM', he: 'RAM' } },
        { id: 'storage', text: { ar: 'Storage', en: 'Storage', he: 'Storage' } },
        { id: 'screen', text: { ar: 'Screen', en: 'Screen', he: 'מסך' } },
      ],

      correctAnswer: 'ram',

      explanation: {
        ar: 'ممتاز! المساحة الدائمة ليست المشكلة. الجهاز يحتاج مساحة عمل أكبر.',
        en: 'Excellent! Permanent storage is not the problem. The computer needs more working memory.',
        he: 'מצוין! האחסון הקבוע אינו הבעיה. המחשב זקוק ליותר זיכרון עבודה.',
      },

      skills: ['ram', 'diagnosis'],
    },

    // 12
    {
      id: 'm02-byte-wrong',
      type: 'multipleChoice',

      title: {
        ar: '🤖 Byte متأكد... بس هل هو صح؟',
        en: '🤖 Byte Is Sure... But Is He Right?',
        he: '🤖 Byte בטוח... אבל האם הוא צודק?',
      },

      text: {
        ar: `Byte يقول:

"الجهاز يعلق عند فتح برامج كثيرة،
إذن لازم نزيد Storage!"

هل تشخيص Byte صحيح؟`,

        en: `Byte says:

"The computer freezes when many programs are open,
so we need more Storage!"

Is Byte's diagnosis correct?`,

        he: `Byte אומר:

"המחשב נתקע כשפותחים הרבה תוכנות,
אז צריך יותר Storage!"

האם האבחון של Byte נכון?`,
      },

      options: [
        {
          id: 'yes',
          text: {
            ar: '✅ نعم، صحيح',
            en: '✅ Yes, correct',
            he: '✅ כן, נכון',
          },
        },
        {
          id: 'no',
          text: {
            ar: '❌ لا، خلط بين RAM وStorage',
            en: '❌ No, he confused RAM with Storage',
            he: '❌ לא, הוא התבלבל בין RAM ל-Storage',
          },
        },
      ],

      correctAnswer: 'no',

      explanation: {
        ar: 'ممتاز! هذا بالضبط تفكير المحقق: لا نغير قطعة قبل أن نفهم العطل.',
        en: 'Excellent! That is exactly how a system detective thinks: understand the problem before replacing a part.',
        he: 'מצוין! כך בדיוק חושב חוקר מערכות: מבינים את הבעיה לפני שמחליפים רכיב.',
      },

      skills: ['ram', 'storage', 'diagnosis'],
    },

    // 13
    {
      id: 'm02-data-flow',
      type: 'sequence',

      title: {
        ar: '🔄 تتبع رحلة المعلومة',
        en: '🔄 Follow the Information',
        he: '🔄 עקבו אחרי המידע',
      },

      text: {
        ar: `كتبت حرف A على لوحة المفاتيح.

رتب ما يحدث بالترتيب الصحيح.`,

        en: `You typed the letter A on the keyboard.

Put the events in the correct order.`,

        he: `הקלדת את האות A במקלדת.

סדר את מה שקורה לפי הסדר הנכון.`,
      },

      items: [
        {
          id: 'input',
          text: {
            ar: '⌨️ لوحة المفاتيح ترسل Input',
            en: '⌨️ The keyboard sends Input',
            he: '⌨️ המקלדת שולחת קלט',
          },
        },
        {
          id: 'process',
          text: {
            ar: '⚙️ الكمبيوتر يعالج الأمر',
            en: '⚙️ The computer processes the instruction',
            he: '⚙️ המחשב מעבד את ההוראה',
          },
        },
        {
          id: 'output',
          text: {
            ar: '🖥️ يظهر الحرف على الشاشة',
            en: '🖥️ The letter appears on the screen',
            he: '🖥️ האות מופיעה על המסך',
          },
        },
      ],

      correctOrder: ['input', 'process', 'output'],

      explanation: {
        ar: 'بالضبط: Input → Processing → Output.',
        en: 'Exactly: Input → Processing → Output.',
        he: 'בדיוק: קלט → עיבוד → פלט.',
      },

      hints: [
        {
          ar: 'ابدأ من الشيء الذي فعله المستخدم.',
          en: 'Start with what the user did first.',
          he: 'התחל במה שהמשתמש עשה קודם.',
        },
      ],

      skills: ['inputOutput', 'sequencing'],
    },

    // 14
    {
      id: 'm02-final-diagnosis',
      type: 'multipleChoice',

      title: {
        ar: '🔥 التشخيص النهائي',
        en: '🔥 Final Diagnosis',
        he: '🔥 האבחון הסופי',
      },

      text: {
        ar: `تقرير الجهاز:

✅ الشاشة تعمل
✅ لوحة المفاتيح تعمل
✅ يوجد الكثير من Storage الفارغ
❌ الجهاز يتجمد عند فتح برامج كثيرة

أي قطعة تختار لإصلاح الجهاز؟`,

        en: `Computer report:

✅ Screen works
✅ Keyboard works
✅ Plenty of free Storage
❌ Computer freezes when many programs are open

Which part would you choose to fix the computer?`,

        he: `דוח המחשב:

✅ המסך עובד
✅ המקלדת עובדת
✅ יש הרבה מקום אחסון פנוי
❌ המחשב נתקע כשפותחים הרבה תוכנות

איזה רכיב היית בוחר כדי לתקן את המחשב?`,
      },

      options: [
        { id: 'cpu', text: { ar: 'CPU', en: 'CPU', he: 'CPU' } },
        { id: 'ram', text: { ar: 'RAM', en: 'RAM', he: 'RAM' } },
        { id: 'storage', text: { ar: 'Storage', en: 'Storage', he: 'Storage' } },
      ],

      correctAnswer: 'ram',

      explanation: {
        ar: '🛠️ SYSTEM RESTORED! استخدمت الأدلة بدل التخمين ووجدت العطل.',
        en: '🛠️ SYSTEM RESTORED! You used evidence instead of guessing and found the problem.',
        he: '🛠️ המערכת חזרה לפעול! השתמשת ברמזים במקום לנחש ומצאת את התקלה.',
      },

      hints: [
        {
          ar: 'Storage فاضي، إذن المشكلة ليست في مساحة حفظ الملفات.',
          en: 'Storage has plenty of free space, so file storage is not the problem.',
          he: 'יש הרבה מקום אחסון פנוי, לכן הבעיה אינה בשמירת קבצים.',
        },
      ],

      skills: ['ram', 'diagnosis'],
    },

    // 15
    {
      id: 'm02-complete',
      type: 'story',

      title: {
        ar: '🏆 MISSION COMPLETE',
        en: '🏆 MISSION COMPLETE',
        he: '🏆 המשימה הושלמה',
      },

      text: {
        ar: `نجحت في إعادة الجهاز للعمل! 🎉

أصبحت تعرف الفرق بين:

🧠 RAM
💾 Storage
⚙️ CPU
⌨️ Input
🖥️ Output

🏅 الرتبة الجديدة:
System Detective

لكن أثناء فحص الجهاز...

وجد Byte ملفًا غريبًا.

01001000 01101001

🔐 Mission 03:
الرسالة السرية

هل تستطيع معرفة ماذا تقول؟`,

        en: `You brought the computer back to life! 🎉

You now understand the difference between:

🧠 RAM
💾 Storage
⚙️ CPU
⌨️ Input
🖥️ Output

🏅 New rank:
System Detective

But while inspecting the computer...

Byte found a strange file.

01001000 01101001

🔐 Mission 03:
The Secret Message

Can you discover what it says?`,

        he: `הצלחת להחזיר את המחשב לחיים! 🎉

עכשיו אתה יודע להבדיל בין:

🧠 RAM
💾 Storage
⚙️ CPU
⌨️ קלט
🖥️ פלט

🏅 דרגה חדשה:
System Detective

אבל בזמן בדיקת המחשב...

Byte מצא קובץ מוזר.

01001000 01101001

🔐 משימה 03:
ההודעה הסודית

האם תצליח לגלות מה כתוב בה?`,
      },

      skills: [
        'cpu',
        'ram',
        'storage',
        'inputOutput',
        'diagnosis',
      ],
    },
  ],
};

export default mission_02_dead_computer;