"use strict";



/**

 * Programs and lessons managed as code.

 *

 * Add objects to `programs`, run `npm run content:check` from the project root,

 * then use the explicit import command documented in CONTENT_IMPORT.md.

 *

 * The importer creates deterministic document IDs:

 *   programs/{program.id}

 *   lessons/{program.id}--{lesson.id}

 */



const target = Object.freeze({

  projectId: "techminds-63e30",

  databaseId: "default",

});


function trilingual(en, ar, he) {

  return { en, ar, he };

}

function contentSlide(id, title, content, type = "content") {

  return {

    id,

    type,

    title,

    content,

    ...(type === "task" ? {task: content, required: true} : {}),

  };

}



function quizSlide(id, title, question, options, correctAnswer) {

  return {

    id,

    type: "multipleChoice",

    title,

    question,

    options,

    correctAnswer,

    required: true,

  };

}



function lessonVisuals(slug, imageAlt, themeColor, accentColor, surfaceColor) {

  return {

    coverImage: `/lesson-covers/${slug}.png`,

    imageAlt,

    themeColor,

    accentColor,

    surfaceColor,

  };

}



const programs = /* @__PURE__ */ (() => [

  {

    id: "computer-science-modern-technology-journey",



    title: trilingual(
          "Journey into Computer Science & Modern Technology",
          "رحلة في علوم الحاسوب والتكنولوجيا الحديثة",
          "מסע במדעי המחשב ובטכנולוגיה מודרנית",
        ),



    description: trilingual(
          "An inquiry-driven journey through computer systems, data, computational thinking, algorithms, coding, networks, cybersecurity, artificial intelligence, and creative technology projects for curious young innovators.",
          "رحلة استقصائية في أنظمة الحاسوب والبيانات والتفكير الحاسوبي والخوارزميات والبرمجة والشبكات والأمن الرقمي والذكاء الاصطناعي والمشاريع التقنية الإبداعية، صُممت للمبتكرين الصغار محبي الاستكشاف.",
          "מסע חקרני דרך מערכות מחשב, נתונים, חשיבה חישובית, אלגוריתמים, תכנות, רשתות, סייבר, בינה מלאכותית ופרויקטים טכנולוגיים יצירתיים, המיועד לחדשנים צעירים וסקרנים.",
        ),



    icon: "💻",

    category: "computer-science",

    ageFrom: 9,

    ageTo: 12,



    level: "beginner",

    status: "draft",



    pricing: {

      student: 40,

      teacher: 120,

      class: 250,

    },



    finalProject: trilingual(
          "Design a responsible technology solution: define a real problem, model an algorithm, create a prototype, explain its data and safety choices, test it, improve it, and present it to an audience.",
          "تصميم حل تقني مسؤول: تحديد مشكلة حقيقية، وبناء خوارزمية، وإنشاء نموذج أولي، وشرح قرارات البيانات والأمان، واختباره وتحسينه، ثم عرض المشروع أمام جمهور.",
          "תכננו פתרון טכנולוגי אחראי: הגדירו בעיה אמיתית, בנו אלגוריתם, צרו אבטיפוס, הסבירו את בחירות הנתונים והבטיחות, בדקו ושפרו אותו והציגו אותו בפני קהל.",
        ),



    lessons: [

      /* =====================================================

         1. INSIDE A COMPUTER

      ===================================================== */

      {

        id: "inside-a-computer",
        order: 1,



        title: trilingual(
          "Inside a Computer",
          "داخل الحاسوب",
          "בתוך המחשב",
        ),



        description: trilingual(
          "Investigate how hardware, software, input, processing, storage, and output work together.",
          "استكشف كيف تعمل الأجهزة والبرمجيات والإدخال والمعالجة والتخزين والإخراج معًا.",
          "חקרו כיצד חומרה, תוכנה, קלט, עיבוד, אחסון ופלט פועלים יחד.",
        ),



        ...lessonVisuals(

          "inside-a-computer",

          trilingual(
          "Children exploring the connected parts inside a computer",
          "أطفال يستكشفون الأجزاء المترابطة داخل الحاسوب",
          "ילדים חוקרים את החלקים המחוברים בתוך מחשב",
        ),

          "#6D28D9",

          "#22D3EE",

          "#F5F3FF",

        ),



        minutes: 45,

        xp: 120,

        status: "draft",



        sections: [

  contentSlide(

    "computer-hook",

    trilingual(

      "Does a computer think by itself?",

      "هل الحاسوب يفكّر وحده؟",

      "האם המחשב חושב בעצמו?"

    ),

    trilingual(

      "A computer can do amazing things, but every result depends on parts working together and instructions telling those parts what to do. Let’s investigate what is really happening inside.",

      "يستطيع الحاسوب تنفيذ أشياء مذهلة، لكن كل نتيجة تعتمد على أجزاء تعمل معًا وتعليمات تخبر هذه الأجزاء بما يجب فعله. هيا نكتشف ماذا يحدث فعلًا داخل الحاسوب.",

      "מחשב יכול לבצע דברים מדהימים, אבל כל תוצאה תלויה בחלקים שפועלים יחד ובהוראות שאומרות להם מה לעשות. בואו נגלה מה באמת קורה בתוך המחשב."

    )

  ),



  contentSlide(

    "hardware-software",

    trilingual(

      "Hardware + Software",

      "العتاد + البرمجيات",

      "חומרה + תוכנה"

    ),

    trilingual(

      "Hardware is everything physical that you can touch, such as the keyboard, screen, processor, and memory. Software is the programs and instructions that tell the hardware what to do.",

      "العتاد هو الأجزاء المادية التي يمكن لمسها، مثل لوحة المفاتيح والشاشة والمعالج والذاكرة. أما البرمجيات فهي البرامج والتعليمات التي تخبر العتاد بما يجب أن يفعله.",

      "חומרה היא כל החלקים הפיזיים שאפשר לגעת בהם, כמו המקלדת, המסך, המעבד והזיכרון. תוכנה היא התוכניות וההוראות שאומרות לחומרה מה לעשות."

    )

  ),



  quizSlide(

    "hardware-check",

    trilingual(

      "Quick Challenge",

      "تحدٍ سريع",

      "אתגר מהיר"

    ),

    trilingual(

      "Which of these is hardware?",

      "أي واحد من التالي يُعتبر عتادًا (Hardware)؟",

      "איזה מהבאים הוא חומרה?"

    ),

    [

      trilingual("Keyboard", "لوحة المفاتيح", "מקלדת"),

      trilingual("Drawing app", "برنامج للرسم", "תוכנת ציור"),

      trilingual("Computer game", "لعبة حاسوب", "משחק מחשב"),

      trilingual("Operating system", "نظام التشغيل", "מערכת הפעלה")

    ],

    0

  ),



  contentSlide(

    "information-cycle",

    trilingual(

      "Input → Process → Output",

      "إدخال ← معالجة ← إخراج",

      "קלט ← עיבוד ← פלט"

    ),

    trilingual(

      "Many computer actions follow the same cycle. First, the computer receives input. Then it processes the information according to instructions. Finally, it produces output. Data can also be stored for later use.",

      "تتبع عمليات كثيرة في الحاسوب دورة بسيطة: أولًا يستقبل الحاسوب المدخلات، ثم يعالج المعلومات حسب التعليمات، وفي النهاية ينتج المخرجات. ويمكن أيضًا تخزين البيانات لاستخدامها لاحقًا.",

      "פעולות רבות במחשב פועלות לפי מחזור פשוט: תחילה המחשב מקבל קלט, אחר כך הוא מעבד את המידע לפי הוראות, ולבסוף מפיק פלט. אפשר גם לשמור נתונים לשימוש מאוחר יותר."

    )

  ),

{

  id: "computer-parts-classification",

  type: "classification",



  title: trilingual(

    "Sort the Computer Parts",

    "صنّف أجزاء الحاسوب",

    "מיינו את חלקי המחשב"

  ),



  content: trilingual(

    "Choose the correct role for each computer part.",

    "اختَر الوظيفة الصحيحة لكل جزء من أجزاء الحاسوب.",

    "בחרו את התפקיד הנכון לכל חלק במחשב."

  ),



  categories: [

    {

      id: "input",

      emoji: "⌨️",

      label: trilingual("Input", "إدخال", "קלט"),

    },

    {

      id: "processing",

      emoji: "🧠",

      label: trilingual("Processing", "معالجة", "עיבוד"),

    },

    {

      id: "output",

      emoji: "🖥️",

      label: trilingual("Output", "إخراج", "פלט"),

    },

  ],



  items: [

    {

      id: "keyboard",

      label: trilingual(

        "⌨️ Keyboard",

        "⌨️ لوحة المفاتيح",

        "⌨️ מקלדת"

      ),

      correctCategory: "input",

    },

    {

      id: "mouse",

      label: trilingual(

        "🖱️ Mouse",

        "🖱️ الفأرة",

        "🖱️ עכבר"

      ),

      correctCategory: "input",

    },

    {

      id: "cpu",

      label: trilingual(

        "🧠 CPU",

        "🧠 المعالج",

        "🧠 מעבד"

      ),

      correctCategory: "processing",

    },

    {

      id: "monitor",

      label: trilingual(

        "🖥️ Monitor",

        "🖥️ الشاشة",

        "🖥️ מסך"

      ),

      correctCategory: "output",

    },

  ],



  required: true,

},

  quizSlide(

    "input-check",

    trilingual(

      "Computer Detective",

      "محقق الحاسوب",

      "בלש המחשבים"

    ),

    trilingual(

      "You speak into a microphone. What role is the microphone performing?",

      "أنت تتحدث عبر الميكروفون. ما الدور الذي يقوم به الميكروفون؟",

      "אתם מדברים למיקרופון. איזה תפקיד המיקרופון מבצע?"

    ),

    [

      trilingual("Input", "إدخال", "קלט"),

      trilingual("Processing", "معالجة", "עיבוד"),

      trilingual("Storage", "تخزين", "אחסון"),

      trilingual("Output", "إخراج", "פלט")

    ],

    0

  ),



  contentSlide(

    "processor-storage",

    trilingual(

      "Processing and Storage",

      "المعالجة والتخزين",

      "עיבוד ואחסון"

    ),

    trilingual(

      "The processor follows instructions and performs calculations and decisions. Storage keeps data so it can be used again later. They have different jobs, but both are important parts of a computer system.",

      "يتبع المعالج التعليمات وينفذ العمليات الحسابية والقرارات. أما التخزين فيحتفظ بالبيانات حتى يمكن استخدامها لاحقًا. لكل منهما وظيفة مختلفة، لكن كليهما جزء مهم من نظام الحاسوب.",

      "המעבד מבצע הוראות, חישובים והחלטות. האחסון שומר נתונים כדי שיהיה אפשר להשתמש בהם שוב מאוחר יותר. לכל אחד מהם תפקיד שונה, אך שניהם חשובים במערכת המחשב."

    )

  ),



  quizSlide(

    "output-check",

    trilingual(

      "What happens next?",

      "ماذا يحدث بعد ذلك؟",

      "מה קורה עכשיו?"

    ),

    trilingual(

      "You click Play and music comes from the speakers. What role are the speakers performing?",

      "ضغطت على زر التشغيل وخرجت الموسيقى من السماعات. ما الدور الذي تقوم به السماعات؟",

      "לחצתם על Play ומוזיקה יוצאת מהרמקולים. איזה תפקיד הרמקולים מבצעים?"

    ),

    [

      trilingual("Input", "إدخال", "קלט"),

      trilingual("Output", "إخراج", "פלט"),

      trilingual("Storage", "تخزين", "אחסון"),

      trilingual("Software", "برمجيات", "תוכנה")

    ],

    1

  ),



  quizSlide(

    "touchscreen-check",

    trilingual(

      "Think Like a Computer Scientist",

      "فكّر كعالم حاسوب",

      "חשבו כמו מדעני מחשב"

    ),

    trilingual(

      "A touchscreen displays pictures and also detects your finger. Which statement is correct?",

      "تعرض الشاشة اللمسية الصور وتكتشف أيضًا لمس إصبعك. أي عبارة صحيحة؟",

      "מסך מגע מציג תמונות וגם מזהה את מגע האצבע. איזו טענה נכונה?"

    ),

    [

      trilingual(

        "It is only an input device",

        "هي جهاز إدخال فقط",

        "זהו התקן קלט בלבד"

      ),

      trilingual(

        "It is only an output device",

        "هي جهاز إخراج فقط",

        "זהו התקן פלט בלבד"

      ),

      trilingual(

        "It can be both input and output",

        "يمكن أن تكون جهاز إدخال وإخراج",

        "הוא יכול לשמש גם כקלט וגם כפלט"

      ),

      trilingual(

        "It is software",

        "هي برمجيات",

        "זוהי תוכנה"

      )

    ],

    2

  ),



  quizSlide(

    "final-check",

    trilingual(

      "Final Challenge 🏁",

      "التحدي الأخير 🏁",

      "האתגר האחרון 🏁"

    ),

    trilingual(

      "Which description best explains how a computer system works?",

      "أي وصف يشرح بشكل أفضل كيف يعمل نظام الحاسوب؟",

      "איזה תיאור מסביר בצורה הטובה ביותר כיצד מערכת מחשב פועלת?"

    ),

    [

      trilingual(

        "Hardware works without instructions",

        "يعمل العتاد دون تعليمات",

        "חומרה פועלת ללא הוראות"

      ),

      trilingual(

        "Software works without hardware",

        "تعمل البرمجيات دون عتاد",

        "תוכנה פועלת ללא חומרה"

      ),

      trilingual(

        "Hardware and software work together to receive, process, store, and output information",

        "يعمل العتاد والبرمجيات معًا لاستقبال المعلومات ومعالجتها وتخزينها وإخراجها",

        "חומרה ותוכנה פועלות יחד כדי לקבל, לעבד, לאחסן ולהציג מידע"

      ),

      trilingual(

        "A computer only stores information",

        "الحاسوب يخزن المعلومات فقط",

        "מחשב רק מאחסן מידע"

      )

    ],

    2

  ),



  contentSlide(

    "system-summary",

    trilingual(

      "You cracked the system! 🎉",

      "اكتشفت سر النظام! 🎉",

      "פיצחתם את המערכת! 🎉"

    ),

    trilingual(

      "A computer is a system. Hardware and software work together. Information enters as input, can be processed and stored, and finally appears as output. You are ready for the next challenge!",

      "الحاسوب عبارة عن نظام. يعمل العتاد والبرمجيات معًا. تدخل المعلومات كمدخلات، ويمكن معالجتها وتخزينها، وفي النهاية تظهر كمخرجات. أنت جاهز للتحدي القادم!",

      "מחשב הוא מערכת. החומרה והתוכנה פועלות יחד. מידע נכנס כקלט, ניתן לעבד ולאחסן אותו, ולבסוף הוא מופיע כפלט. אתם מוכנים לאתגר הבא!"

    ),

    "summary"

  )

],

      },



      /* =====================================================

         2. DATA, BINARY & PATTERNS

      ===================================================== */

      {

        id: "data-binary-patterns",
        order: 6,



        title: trilingual(
          "Data, Binary & Patterns",
          "البيانات والنظام الثنائي والأنماط",
          "נתונים, בינארי ודפוסים",
        ),



        description: trilingual(
          "Discover how computers represent text, images, and other information using bits.",
          "اكتشف كيف تمثّل الحواسيب النصوص والصور وغيرها من المعلومات باستخدام البِتّات.",
          "גלו כיצד מחשבים מייצגים טקסט, תמונות ומידע נוסף באמצעות ביטים.",
        ),



        ...lessonVisuals(

          "data-binary-patterns",

          trilingual(
          "Children creating pixel art and patterns from binary tiles",
          "أطفال يصنعون فن البكسل والأنماط باستخدام قطع ثنائية",
          "ילדים יוצרים אמנות פיקסלים ודפוסים מאריחים בינאריים",
        ),

          "#7C3AED",

          "#EC4899",

          "#FDF2F8",

        ),



        minutes: 50,

        xp: 140,

        status: "draft",



        sections: [

          contentSlide(

            "data-representation",

            trilingual("Everything becomes data", "كل شيء يتحول إلى بيانات", "הכול הופך לנתונים"),

            trilingual("Computers represent information using agreed codes. Text becomes character numbers, images become grids of colored pixels, and sound becomes many measurements taken over time.", "تمثّل الحواسيب المعلومات باستخدام رموز متفق عليها. يتحول النص إلى أرقام للحروف، والصورة إلى شبكة من البكسلات الملونة، والصوت إلى قياسات كثيرة تؤخذ عبر الزمن.", "מחשבים מייצגים מידע באמצעות קודים מוסכמים. טקסט הופך למספרים שמייצגים תווים, תמונות הופכות לרשתות של פיקסלים צבעוניים, וקול הופך למדידות רבות שנלקחות לאורך זמן."),

          ),



          contentSlide(

            "bits-and-binary",

            trilingual("Two symbols, many possibilities", "رمزان واحتمالات كثيرة", "שני סמלים, אפשרויות רבות"),

            trilingual("A bit has two states, written 0 and 1. Combining bits creates more patterns: three bits make eight patterns. The meaning comes from the code we agree to use, not from the digits alone.", "للبِت حالتان تكتبان 0 و1. وعند جمع البِتّات نحصل على أنماط أكثر؛ فثلاثة بِتّات تصنع ثمانية أنماط. ويأتي المعنى من الترميز الذي نتفق عليه، لا من الأرقام وحدها.", "לביט יש שני מצבים, הנכתבים 0 ו־1. שילוב של ביטים יוצר דפוסים רבים יותר: שלושה ביטים יוצרים שמונה דפוסים. המשמעות מגיעה מהקוד שבו בחרנו להשתמש, ולא מהספרות לבדן."),

          ),



          contentSlide(

            "binary-bracelet",

            trilingual("Create a binary code", "أنشئ رمزًا ثنائيًا", "צרו קוד בינארי"),

            trilingual("Invent a three-bit code for eight colors or actions. Write the codebook, encode a short message, and ask a partner to decode it. Improve any rule that caused confusion.", "ابتكر ترميزًا من ثلاثة بِتّات لثمانية ألوان أو أفعال. اكتب دليل الرموز، ورمّز رسالة قصيرة، واطلب من زميل فكها. حسّن أي قاعدة سببت التباسًا.", "המציאו קוד בן שלושה ביטים לשמונה צבעים או פעולות. כתבו טבלת קודים, קודדו הודעה קצרה ובקשו מחבר לפענח אותה. שפרו כל כלל שגרם לבלבול."),

            "task",

          ),



          quizSlide(

            "binary-quiz",

            trilingual("Pattern check", "اختبار الأنماط", "בדיקת דפוסים"),

            trilingual("How many different patterns can two bits represent?", "كم نمطًا مختلفًا يمكن لبِتّين تمثيله؟", "כמה דפוסים שונים יכולים שני ביטים לייצג?"),

            [

              trilingual("2", "2", "2"),

              trilingual("3", "3", "3"),

              trilingual("4", "4", "4"),

              trilingual("8", "8", "8"),

            ],

            2,

          ),



          contentSlide(

            "data-summary",

            trilingual("Meaning needs a code", "المعنى يحتاج إلى ترميز", "משמעות זקוקה לקוד"),

            trilingual("Bits are small building blocks. Codes organize their patterns so computers can represent many kinds of data. More bits allow more distinct possibilities.", "البِتّات وحدات بناء صغيرة، وتنظّم الرموز أنماطها كي تمثّل الحواسيب أنواعًا كثيرة من البيانات. وكلما زاد عدد البِتّات زادت الاحتمالات المختلفة.", "ביטים הם אבני בניין קטנות. קודים מארגנים את הדפוסים שלהם כך שמחשבים יוכלו לייצג סוגים רבים של נתונים. ככל שיש יותר ביטים, יש יותר אפשרויות שונות."),

            "summary",

          ),



          contentSlide(

            "binary-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Why do you think computers use two basic states instead of ten digits like people usually do?", "لماذا برأيك يستخدم الحاسوب حالتين أساسيتين بدل عشرة أرقام كما نفعل عادة؟", "למה לדעתכם מחשבים משתמשים בשני מצבים בסיסיים במקום בעשר ספרות כמו שבני אדם רגילים להשתמש?"),

          ),

        ],

      },



      /* =====================================================

         3. THINK LIKE A PROGRAMMER

      ===================================================== */

      {

        id: "think-like-a-programmer",
        order: 3,



        title: trilingual(
          "Think Like a Programmer",
          "فكّر مثل المبرمج",
          "חשבו כמו מתכנתים",
        ),



        description: trilingual(
          "Practice decomposition, pattern recognition, abstraction, and step-by-step problem solving.",
          "تدرّب على تفكيك المشكلات واكتشاف الأنماط والتجريد وحل المشكلات خطوة بخطوة.",
          "תרגלו פירוק בעיות, זיהוי דפוסים, הפשטה ופתרון בעיות שלב אחר שלב.",
        ),



        ...lessonVisuals(

          "think-like-a-programmer",

          trilingual(
          "Children solving puzzles with patterns, cards, and logical steps",
          "أطفال يحلون ألغازًا باستخدام الأنماط والبطاقات والخطوات المنطقية",
          "ילדים פותרים חידות בעזרת דפוסים, כרטיסים ושלבים לוגיים",
        ),

          "#4F46E5",

          "#F59E0B",

          "#EEF2FF",

        ),



        minutes: 50,

        xp: 145,

        status: "draft",



        sections: [

          contentSlide(

            "computational-thinking",

            trilingual("Four powerful habits", "أربع عادات قوية", "ארבעה הרגלים חזקים"),

            trilingual("Computational thinking includes decomposition, pattern recognition, abstraction, and algorithmic thinking. These habits help us solve complex problems even before we write any code.", "يشمل التفكير الحاسوبي تفكيك المشكلات واكتشاف الأنماط والتجريد والتفكير الخوارزمي. وتساعدنا هذه العادات على حل المشكلات المعقدة حتى قبل كتابة أي كود.", "חשיבה חישובית כוללת פירוק בעיות, זיהוי דפוסים, הפשטה וחשיבה אלגוריתמית. ההרגלים האלה עוזרים לנו לפתור בעיות מורכבות עוד לפני שכתבנו קוד."),

          ),



          contentSlide(

            "decomposition",

            trilingual("Break it down", "قسّمها", "פרקו את הבעיה"),

            trilingual("A large task becomes easier when we divide it into smaller parts. A programmer asks: What smaller problems must be solved first?", "تصبح المهمة الكبيرة أسهل عندما نقسمها إلى أجزاء أصغر. يسأل المبرمج: ما المشكلات الصغيرة التي يجب حلها أولًا؟", "משימה גדולה נעשית קלה יותר כשמחלקים אותה לחלקים קטנים. מתכנת שואל: אילו בעיות קטנות יותר צריך לפתור קודם?"),

          ),



          contentSlide(

            "school-morning-task",

            trilingual("Plan a school morning", "خطّط لصباح المدرسة", "תכננו בוקר לבית הספר"),

            trilingual("Break the task 'get ready for school' into smaller ordered steps. Then identify repeated patterns and remove details that are not necessary for the plan.", "قسّم مهمة \"الاستعداد للمدرسة\" إلى خطوات صغيرة ومرتبة، ثم حدّد الأنماط المتكررة واحذف التفاصيل غير الضرورية للخطة.", "פרקו את המשימה 'להתכונן לבית הספר' לשלבים קטנים ומסודרים. לאחר מכן זהו דפוסים חוזרים והסירו פרטים שאינם נחוצים לתוכנית."),

            "task",

          ),



          quizSlide(

            "thinking-quiz",

            trilingual("Thinking check", "اختبار التفكير", "בדיקת חשיבה"),

            trilingual("Which skill means breaking a large problem into smaller parts?", "أي مهارة تعني تقسيم المشكلة الكبيرة إلى أجزاء أصغر؟", "איזו מיומנות פירושה חלוקת בעיה גדולה לחלקים קטנים יותר?"),

            [

              trilingual("Decomposition", "التفكيك", "פירוק בעיה"),

              trilingual("Guessing", "التخمين", "ניחוש"),

              trilingual("Copying", "النسخ", "העתקה"),

              trilingual("Printing", "الطباعة", "הדפסה"),

            ],

            0,

          ),



          contentSlide(

            "thinking-summary",

            trilingual("Think before coding", "فكّر قبل البرمجة", "חשבו לפני שמתחילים לתכנת"),

            trilingual("Strong programmers do not rush to code. They understand the problem, divide it into parts, look for patterns, remove unnecessary details, and then design a clear solution.", "لا يندفع المبرمجون المتميزون مباشرة إلى الكود. يفهمون المشكلة، ويقسّمونها، ويبحثون عن الأنماط، ويتجاهلون التفاصيل غير الضرورية، ثم يصممون حلًا واضحًا.", "מתכנתים טובים לא ממהרים לכתוב קוד. הם מבינים את הבעיה, מחלקים אותה לחלקים, מחפשים דפוסים, מסירים פרטים לא נחוצים ואז מתכננים פתרון ברור."),

            "summary",

          ),



          contentSlide(

            "thinking-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Where do you already use computational thinking in your daily life?", "أين تستخدم التفكير الحاسوبي أصلًا في حياتك اليومية؟", "איפה אתם כבר משתמשים בחשיבה חישובית בחיי היומיום?"),

          ),

        ],

      },



      /* =====================================================

         4. ALGORITHMS & SMART SOLUTIONS

      ===================================================== */

      {

        id: "algorithms-smart-solutions",
        order: 4,



        title: trilingual(
          "Algorithms & Smart Solutions",
          "الخوارزميات والحلول الذكية",
          "אלגוריתמים ופתרונות חכמים",
        ),



        description: trilingual(
          "Develop precise algorithms, test edge cases, and improve solutions for efficiency.",
          "طوّر خوارزميات دقيقة، واختبر الحالات غير المتوقعة، وحسّن كفاءة الحلول.",
          "פתחו אלגוריתמים מדויקים, בדקו מקרי קצה ושפרו פתרונות כדי שיהיו יעילים יותר.",
        ),



        ...lessonVisuals(

          "algorithms-smart-solutions",

          trilingual(
          "Children guiding a robot through a maze with algorithm cards",
          "أطفال يوجهون روبوتًا في متاهة باستخدام بطاقات الخوارزمية",
          "ילדים מנחים רובוט במבוך באמצעות כרטיסי אלגוריתם",
        ),

          "#2563EB",

          "#F97316",

          "#EFF6FF",

        ),



        minutes: 50,

        xp: 150,

        status: "draft",



        sections: [

          contentSlide(

            "algorithm-idea",

            trilingual("Instructions with a purpose", "تعليمات لها هدف", "הוראות עם מטרה"),

            trilingual("An algorithm is a finite, ordered set of unambiguous steps that solves a problem. Good algorithms state their inputs, desired output, and decisions clearly enough for another person or computer to follow.", "الخوارزمية مجموعة محدودة ومرتبة من الخطوات الواضحة لحل مشكلة. وتحدد الخوارزمية الجيدة مدخلاتها ومخرجاتها المطلوبة وقراراتها بوضوح يكفي ليتبعها شخص آخر أو حاسوب.", "אלגוריתם הוא רצף סופי ומסודר של צעדים חד־משמעיים שפותר בעיה. אלגוריתם טוב מגדיר את הקלט, את הפלט הרצוי ואת ההחלטות בצורה ברורה מספיק כדי שאדם אחר או מחשב יוכלו לבצע אותו."),

          ),



          contentSlide(

            "decompose-test-improve",

            trilingual("Test and improve", "اختبر وحسّن", "בדקו ושפרו"),

            trilingual("A working algorithm is not always the best algorithm. Test normal cases and edge cases, compare different solutions, and look for unnecessary steps.", "الخوارزمية التي تعمل ليست دائمًا الأفضل. اختبر الحالات العادية والاستثنائية، وقارن بين حلول مختلفة، وابحث عن الخطوات غير الضرورية.", "אלגוריתם שעובד אינו תמיד האלגוריתם הטוב ביותר. בדקו מקרים רגילים ומקרי קצה, השוו בין פתרונות שונים וחפשו צעדים מיותרים."),

          ),



          contentSlide(

            "robot-maze",

            trilingual("Human robot maze", "متاهة الروبوت البشري", "מבוך הרובוט האנושי"),

            trilingual("Write commands that guide a robot through a grid without vague words. Include a decision for a blocked path. Test the algorithm, count its steps, and try to shorten it without changing the result.", "اكتب أوامر تقود روبوتًا عبر شبكة دون كلمات غامضة. أضف قرارًا عند وجود طريق مسدود. اختبر الخوارزمية، وعدّ خطواتها، وحاول تقصيرها دون تغيير النتيجة.", "כתבו הוראות שמובילות רובוט דרך רשת בלי להשתמש במילים עמומות. הוסיפו החלטה למקרה של דרך חסומה. בדקו את האלגוריתם, ספרו את הצעדים ונסו לקצר אותו בלי לשנות את התוצאה."),

            "task",

          ),



          quizSlide(

            "algorithm-quiz",

            trilingual("Algorithm check", "اختبار الخوارزمية", "בדיקת אלגוריתם"),

            trilingual("What should you do when an algorithm fails only on an empty input?", "ماذا تفعل إذا فشلت الخوارزمية فقط عندما يكون المدخل فارغًا؟", "מה צריך לעשות כשאלגוריתם נכשל רק כאשר הקלט ריק?"),

            [

              trilingual("Ignore it because most inputs work", "تتجاهله لأن معظم المدخلات تعمل", "להתעלם מזה כי רוב הקלטים עובדים"),

              trilingual("Add and test a rule for that edge case", "تضيف قاعدة لتلك الحالة الاستثنائية وتختبرها", "להוסיף כלל למקרה הקצה הזה ולבדוק אותו"),

              trilingual("Make every step longer", "تجعل كل خطوة أطول", "להאריך כל שלב"),

              trilingual("Replace the output with the input", "تستبدل المخرج بالمدخل", "להחליף את הפלט בקלט"),

            ],

            1,

          ),



          contentSlide(

            "algorithm-summary",

            trilingual("Precision, testing, improvement", "الدقة والاختبار والتحسين", "דיוק, בדיקה ושיפור"),

            trilingual("An algorithm is valuable when it is clear, correct, finite, and testable. Expert problem solvers search for exceptions and improve a working solution instead of stopping at the first answer.", "تكون الخوارزمية مفيدة عندما تكون واضحة وصحيحة ومحدودة وقابلة للاختبار. ويبحث حلالو المشكلات الخبراء عن الاستثناءات ويحسّنون الحل العامل بدل التوقف عند أول إجابة.", "אלגוריתם הוא בעל ערך כשהוא ברור, נכון, סופי וניתן לבדיקה. פותרי בעיות מנוסים מחפשים חריגים ומשפרים פתרון שעובד במקום לעצור בתשובה הראשונה."),

            "summary",

          ),



          contentSlide(

            "algorithm-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Can two different algorithms solve the same problem? How would you decide which one is better?", "هل يمكن لخوارزميتين مختلفتين حل المشكلة نفسها؟ وكيف تقرر أيهما أفضل؟", "האם שני אלגוריתמים שונים יכולים לפתור את אותה בעיה? איך תחליטו איזה מהם טוב יותר?"),

          ),

        ],

      },



      /* =====================================================

         5. CODING BUILDING BLOCKS

      ===================================================== */

      {

        id: "coding-building-blocks",
        order: 8,



        title: trilingual(
          "Coding Building Blocks",
          "لبنات بناء البرمجة",
          "אבני הבניין של התכנות",
        ),



        description: trilingual(
          "Use sequence, variables, conditions, and loops to model interactive programs.",
          "استخدم التسلسل والمتغيرات والشروط والحلقات لبناء نماذج لبرامج تفاعلية.",
          "השתמשו ברצף, משתנים, תנאים ולולאות כדי לבנות מודלים של תוכניות אינטראקטיביות.",
        ),



        ...lessonVisuals(

          "coding-building-blocks",

          trilingual(
          "Children building a colorful game with visual code blocks",
          "أطفال يبنون لعبة ملونة باستخدام لبنات برمجية مرئية",
          "ילדים בונים משחק צבעוני באמצעות בלוקי קוד חזותיים",
        ),

          "#7C3AED",

          "#EC4899",

          "#FAF5FF",

        ),



        minutes: 55,

        xp: 170,

        status: "draft",



        sections: [

          contentSlide(

            "coding-language",

            trilingual("From algorithm to program", "من الخوارزمية إلى البرنامج", "מאלגוריתם לתוכנית"),

            trilingual("Code expresses an algorithm in a programming language. Sequence controls order, variables remember changing values, conditions choose between paths, and loops repeat useful actions.", "يعبّر الكود عن الخوارزمية بلغة برمجة. يتحكم التسلسل في الترتيب، وتحفظ المتغيرات القيم المتغيرة، وتختار الشروط بين المسارات، وتكرر الحلقات الأفعال المفيدة.", "קוד מבטא אלגוריתם בשפת תכנות. רצף קובע את סדר הפעולות, משתנים שומרים ערכים משתנים, תנאים בוחרים בין מסלולים, ולולאות חוזרות על פעולות שימושיות."),

          ),



          contentSlide(

            "trace-a-program",

            trilingual("Predict before running", "تنبأ قبل التشغيل", "חזו לפני ההרצה"),

            trilingual("Programmers trace code by following it step by step and recording variable values. Prediction reveals misunderstandings early and makes debugging a reasoning process rather than random guessing.", "يتتبّع المبرمجون الكود باتباعه خطوة خطوة وتسجيل قيم المتغيرات. يكشف التنبؤ سوء الفهم مبكرًا ويجعل تصحيح الأخطاء عملية تفكير بدل التخمين العشوائي.", "מתכנתים עוקבים אחרי קוד שלב אחר שלב ורושמים את ערכי המשתנים. חיזוי עוזר לגלות אי־הבנות מוקדם והופך איתור תקלות לתהליך חשיבה במקום לניחוש אקראי."),

          ),



          contentSlide(

            "design-a-program",

            trilingual("Design a small interactive program", "صمّم برنامجًا تفاعليًا صغيرًا", "תכננו תוכנית אינטראקטיבית קטנה"),

            trilingual("Plan a program using pseudocode. Include one variable, one condition, and one loop. Trace two different inputs and revise any unclear step.", "خطط لبرنامج باستخدام شبه الكود. أضف متغيرًا واحدًا وشرطًا واحدًا وحلقة تكرار واحدة. تتبّع مدخلين مختلفين وعدّل أي خطوة غير واضحة.", "תכננו תוכנית בעזרת פסאודו־קוד. כללו משתנה אחד, תנאי אחד ולולאה אחת. עקבו אחר שני קלטים שונים ושפרו כל שלב שאינו ברור."),

            "task",

          ),



          quizSlide(

            "coding-quiz",

            trilingual("Code concepts", "مفاهيم البرمجة", "מושגי תכנות"),

            trilingual("Which tool is best for repeating an action ten times?", "ما الأداة الأنسب لتكرار فعل عشر مرات؟", "איזה כלי מתאים ביותר לחזרה על פעולה עשר פעמים?"),

            [

              trilingual("A variable", "متغير", "משתנה"),

              trilingual("A loop", "حلقة تكرار", "לולאה"),

              trilingual("An output device", "جهاز إخراج", "התקן פלט"),

              trilingual("A file name", "اسم ملف", "שם קובץ"),

            ],

            1,

          ),



          contentSlide(

            "coding-summary",

            trilingual("Small blocks, powerful programs", "لبنات صغيرة وبرامج قوية", "אבני בניין קטנות, תוכניות חזקות"),

            trilingual("Complex programs grow from a few reusable ideas: ordered steps, stored values, choices, and repetition. Tracing and debugging connect the code you wrote to the behavior you observe.", "تنمو البرامج المعقدة من أفكار قليلة قابلة لإعادة الاستخدام: خطوات مرتبة، وقيم مخزنة، واختيارات، وتكرار. ويربط التتبّع وتصحيح الأخطاء بين الكود المكتوب والسلوك الملاحظ.", "תוכניות מורכבות נבנות מכמה רעיונות חוזרים: צעדים מסודרים, ערכים שמורים, בחירות וחזרות. מעקב ואיתור תקלות מחברים בין הקוד שכתבתם לבין ההתנהגות שאתם רואים."),

            "summary",

          ),



          contentSlide(

            "coding-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Which coding idea feels most powerful to you: variables, conditions, or loops? Why?", "أي فكرة برمجية تشعر أنها الأقوى: المتغيرات أم الشروط أم الحلقات؟ ولماذا؟", "איזה רעיון בתכנות מרגיש לכם החזק ביותר: משתנים, תנאים או לולאות? למה?"),

          ),

        ],

      },



      /* =====================================================

         6. BUILD YOUR FIRST GAME OR PROJECT

      ===================================================== */

      {

        id: "build-first-game-project",
        order: 9,



        title: trilingual(
          "Build Your First Game or Project",
          "ابنِ لعبتك أو مشروعك الأول",
          "בנו את המשחק או הפרויקט הראשון שלכם",
        ),



        description: trilingual(
          "Combine coding concepts, events, scoring, interaction, and creativity in a mini-project.",
          "ادمج مفاهيم البرمجة والأحداث والنقاط والتفاعل والإبداع في مشروع صغير.",
          "שלבו מושגי תכנות, אירועים, ניקוד, אינטראקציה ויצירתיות במיני־פרויקט.",
        ),



        ...lessonVisuals(

          "build-first-game-project",

          trilingual(
          "Children designing and testing a colorful coding game",
          "أطفال يصممون ويختبرون لعبة برمجية ملونة",
          "ילדים מתכננים ובודקים משחק תכנות צבעוני",
        ),

          "#9333EA",

          "#22C55E",

          "#FAF5FF",

        ),



        minutes: 75,

        xp: 190,

        status: "draft",



        sections: [

          contentSlide(

            "game-system",

            trilingual("A game is a system", "اللعبة نظام", "משחק הוא מערכת"),

            trilingual("A simple game still needs a goal, rules, interaction, feedback, and a clear ending. Good creators start small, test often, and improve one feature at a time.", "حتى اللعبة البسيطة تحتاج إلى هدف وقواعد وتفاعل وتغذية راجعة ونهاية واضحة. يبدأ المصمم الجيد بشكل بسيط، ويختبر باستمرار، ويحسن ميزة واحدة في كل مرة.", "גם משחק פשוט זקוק למטרה, כללים, אינטראקציה, משוב וסיום ברור. יוצרים טובים מתחילים בקטן, בודקים לעיתים קרובות ומשפרים תכונה אחת בכל פעם."),

          ),



          contentSlide(

            "events-and-score",

            trilingual("Events and score", "الأحداث والنقاط", "אירועים וניקוד"),

            trilingual("Events start actions: clicking, touching an object, pressing a key, or reaching a target. A score variable records progress and can be used in a winning condition.", "تبدأ الأحداث الأفعال: الضغط، أو لمس جسم، أو الضغط على مفتاح، أو الوصول إلى هدف. ويسجل متغير النقاط التقدم ويمكن استخدامه ضمن شرط الفوز.", "אירועים מפעילים פעולות: לחיצה, נגיעה באובייקט, הקשה על מקש או הגעה ליעד. משתנה ניקוד מתעד התקדמות ויכול לשמש בתנאי ניצחון."),

          ),



          contentSlide(

            "mini-game-builder",

            trilingual("Mini-game builder", "صانع اللعبة المصغّرة", "בונה מיני־משחק"),

            trilingual("Build a small game with a player, one goal, one obstacle, and one score rule. Test it with a partner and change one part based on their feedback.", "ابنِ لعبة صغيرة فيها لاعب وهدف واحد وعائق واحد وقاعدة واحدة للنقاط. اختبرها مع زميل وعدّل جزءًا واحدًا بناءً على ملاحظاته.", "בנו משחק קטן עם שחקן, מטרה אחת, מכשול אחד וכלל ניקוד אחד. בדקו אותו עם חבר ושנו חלק אחד לפי המשוב שלו."),

            "task",

          ),



          quizSlide(

            "game-quiz",

            trilingual("Game design check", "اختبار تصميم اللعبة", "בדיקת עיצוב משחק"),

            trilingual("Which element is most useful for keeping track of a player's points?", "أي عنصر هو الأنسب لتتبع نقاط اللاعب؟", "איזה רכיב הוא השימושי ביותר למעקב אחר הנקודות של השחקן?"),

            [

              trilingual("A variable", "متغير", "משתנה"),

              trilingual("A monitor", "شاشة", "מסך"),

              trilingual("A folder", "مجلد", "תיקייה"),

              trilingual("A password", "كلمة مرور", "סיסמה"),

            ],

            0,

          ),



          contentSlide(

            "game-summary",

            trilingual("Build, test, improve", "ابنِ واختبر وحسّن", "בנו, בדקו, שפרו"),

            trilingual("Programming projects become stronger through iteration. A first version does not need to be perfect; it needs to be testable so you can learn what to improve.", "تصبح المشاريع البرمجية أقوى من خلال التكرار والتحسين. لا يجب أن تكون النسخة الأولى مثالية؛ المهم أن تكون قابلة للاختبار حتى تتعلم ما الذي يحتاج إلى تطوير.", "פרויקטי תכנות מתחזקים באמצעות איטרציות. הגרסה הראשונה לא חייבת להיות מושלמת; היא צריכה להיות ניתנת לבדיקה כדי שתוכלו ללמוד מה לשפר."),

            "summary",

          ),



          contentSlide(

            "game-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("If you had twenty more minutes, what feature would you add to your project and why?", "لو كان لديك عشرون دقيقة إضافية، ما الميزة التي ستضيفها إلى مشروعك ولماذا؟", "אילו היו לכם עוד עשרים דקות, איזו תכונה הייתם מוסיפים לפרויקט ולמה?"),

          ),

        ],

      },



      /* =====================================================

         7. INTERNET, NETWORKS & THE WEB

      ===================================================== */

      {

        id: "internet-networks-web",
        order: 10,



        title: trilingual(
          "Internet, Networks & the Web",
          "الإنترنت والشبكات والويب",
          "אינטרנט, רשתות והווב",
        ),



        description: trilingual(
          "Follow data packets across networks and distinguish the internet from the web.",
          "تتبّع حزم البيانات عبر الشبكات، وميّز بين الإنترنت والويب.",
          "עקבו אחר חבילות נתונים ברשתות והבחינו בין האינטרנט לבין הווב.",
        ),



        ...lessonVisuals(

          "internet-networks-web",

          trilingual(
          "Children following glowing data packets across a world network",
          "أطفال يتتبعون حزم بيانات مضيئة عبر شبكة عالمية",
          "ילדים עוקבים אחר חבילות נתונים זוהרות ברשת עולמית",
        ),

          "#0369A1",

          "#F59E0B",

          "#F0F9FF",

        ),



        minutes: 45,

        xp: 140,

        status: "draft",



        sections: [

          contentSlide(

            "network-of-networks",

            trilingual("How devices connect", "كيف تتصل الأجهزة", "כיצד מכשירים מתחברים"),

            trilingual("A network links devices so they can exchange data. The internet connects many networks worldwide. The web is one service that uses the internet, alongside services such as email and online games.", "تربط الشبكة الأجهزة لتبادل البيانات. ويربط الإنترنت شبكات كثيرة حول العالم. أما الويب فهو خدمة تستخدم الإنترنت، إلى جانب خدمات مثل البريد الإلكتروني والألعاب عبر الإنترنت.", "רשת מחברת מכשירים כדי שיוכלו להחליף נתונים. האינטרנט מחבר רשתות רבות ברחבי העולם. הווב הוא שירות אחד שמשתמש באינטרנט, לצד שירותים כמו דואר אלקטרוני ומשחקים מקוונים."),

          ),



          contentSlide(

            "packets-addresses-routes",

            trilingual("A message travels in packets", "تسافر الرسالة في حزم", "הודעה עוברת בחבילות"),

            trilingual("Large messages are divided into packets. Addresses identify source and destination, routers choose paths, and the receiving device reassembles the pieces. Packets may take different routes and still arrive correctly.", "تُقسّم الرسائل الكبيرة إلى حزم. تحدد العناوين المصدر والوجهة، وتختار الموجّهات المسارات، ويعيد جهاز الاستقبال تجميع القطع. وقد تسلك الحزم طرقًا مختلفة وتصل صحيحة.", "הודעות גדולות מחולקות לחבילות. כתובות מזהות את המקור והיעד, נתבים בוחרים מסלולים, והמכשיר המקבל מרכיב מחדש את החלקים. חבילות יכולות לעבור במסלולים שונים ועדיין להגיע נכון."),

          ),



          contentSlide(

            "packet-role-play",

            trilingual("Route a classroom message", "وجّه رسالة صفية", "נתבו הודעה בכיתה"),

            trilingual("Split a sentence into numbered packet cards. Send them through different student routers, deliberately delay one packet, then reconstruct the message. Record which information made recovery possible.", "قسّم جملة إلى بطاقات حزم مرقمة. أرسلها عبر طلاب يمثلون موجّهات مختلفة، وأخّر حزمة عمدًا، ثم أعد بناء الرسالة. سجّل المعلومات التي جعلت الاستعادة ممكنة.", "חלקו משפט לכרטיסי חבילות ממוספרים. העבירו אותם דרך תלמידים שונים שמייצגים נתבים, עכבו בכוונה חבילה אחת ואז הרכיבו מחדש את ההודעה. רשמו איזה מידע אפשר את השחזור."),

            "task",

          ),



          quizSlide(

            "network-quiz",

            trilingual("Network check", "اختبار الشبكات", "בדיקת רשתות"),

            trilingual("What is the relationship between the web and the internet?", "ما العلاقة بين الويب والإنترنت؟", "מה הקשר בין הווב לבין האינטרנט?"),

            [

              trilingual("They are exactly the same thing", "هما الشيء نفسه تمامًا", "הם בדיוק אותו הדבר"),

              trilingual("The internet is a website", "الإنترنت موقع ويب", "האינטרנט הוא אתר אינטרנט"),

              trilingual("The web is a service that uses the internet", "الويب خدمة تستخدم الإنترنت", "הווב הוא שירות שמשתמש באינטרנט"),

              trilingual("The web works only without networks", "يعمل الويب فقط دون شبكات", "הווב פועל רק בלי רשתות"),

            ],

            2,

          ),



          contentSlide(

            "network-summary",

            trilingual("Reliable communication", "اتصال موثوق", "תקשורת אמינה"),

            trilingual("Networks use shared rules called protocols to move addressed packets. The internet is the infrastructure connecting networks; the web organizes linked resources that travel across it.", "تستخدم الشبكات قواعد مشتركة تسمّى البروتوكولات لنقل الحزم المعنونة. الإنترنت هو البنية التي تربط الشبكات، والويب ينظّم الموارد المترابطة التي تنتقل عبرها.", "רשתות משתמשות בכללים משותפים שנקראים פרוטוקולים כדי להעביר חבילות ממוענות. האינטרנט הוא התשתית שמחברת רשתות; הווב מארגן משאבים מקושרים שעוברים עליה."),

            "summary",

          ),



          contentSlide(

            "network-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Why is it useful that packets can take different routes to the same destination?", "لماذا من المفيد أن تستطيع الحزم سلوك مسارات مختلفة للوصول إلى الوجهة نفسها؟", "למה שימושי שחבילות יכולות לעבור במסלולים שונים לאותו יעד?"),

          ),

        ],

      },



      /* =====================================================

         8. CYBERSECURITY & DIGITAL CITIZENSHIP

      ===================================================== */

      {

        id: "cybersecurity-digital-citizenship",
        order: 12,



        title: trilingual(
          "Cybersecurity & Digital Citizenship",
          "الأمن السيبراني والمواطنة الرقمية",
          "אבטחת סייבר ואזרחות דיגיטלית",
        ),



        description: trilingual(
          "Practice threat-aware decisions, account protection, privacy, and respectful online behavior.",
          "تدرّب على إدراك المخاطر وحماية الحسابات والخصوصية والسلوك المسؤول عبر الإنترنت.",
          "תרגלו קבלת החלטות מודעת לסיכונים, הגנת חשבונות, שמירה על פרטיות והתנהגות מכבדת ברשת.",
        ),



        ...lessonVisuals(

          "cybersecurity-digital-citizenship",

          trilingual(
          "Children using a digital shield and privacy controls safely",
          "أطفال يستخدمون درعًا رقميًا وأدوات الخصوصية بأمان",
          "ילדים משתמשים בבטחה במגן דיגיטלי ובבקרות פרטיות",
        ),

          "#047857",

          "#06B6D4",

          "#ECFDF5",

        ),



        minutes: 50,

        xp: 160,

        status: "draft",



        sections: [

          contentSlide(

            "security-goals",

            trilingual("Protect people and information", "احمِ الناس والمعلومات", "הגנו על אנשים ועל מידע"),

            trilingual("Cybersecurity protects confidentiality, integrity, and availability: information should reach the right people, remain accurate, and be accessible when needed. Security is a habit of managing risk, not a promise of zero risk.", "يحمي الأمن السيبراني السرية والسلامة والتوافر: يجب أن تصل المعلومات إلى الأشخاص المناسبين، وأن تبقى صحيحة، وأن تتوفر عند الحاجة. الأمان عادة لإدارة المخاطر، وليس وعدًا بانعدامها.", "אבטחת סייבר מגינה על סודיות, שלמות וזמינות: המידע צריך להגיע לאנשים הנכונים, להישאר מדויק ולהיות נגיש כשצריך. אבטחה היא הרגל של ניהול סיכונים, לא הבטחה לאפס סיכון."),

          ),



          contentSlide(

            "defense-in-depth",

            trilingual("Layers of protection", "طبقات الحماية", "שכבות הגנה"),

            trilingual("Use unique passphrases, multi-factor authentication, updates, careful permissions, and backups. Pause before opening urgent messages: verify the sender through another trusted channel and never share a verification code.", "استخدم عبارات مرور فريدة، والتحقق متعدد العوامل، والتحديثات، والأذونات المدروسة، والنسخ الاحتياطي. توقّف قبل فتح الرسائل العاجلة، وتحقق من المرسل عبر قناة موثوقة أخرى، ولا تشارك رمز التحقق أبدًا.", "השתמשו במשפטי סיסמה ייחודיים, אימות רב־שלבי, עדכונים, הרשאות זהירות וגיבויים. עצרו לפני פתיחת הודעות דחופות: אמתו את השולח דרך ערוץ אמין אחר ואל תשתפו קוד אימות לעולם."),

          ),



          contentSlide(

            "phishing-investigation",

            trilingual("Investigate a suspicious message", "حقق في رسالة مشبوهة", "חקרו הודעה חשודה"),

            trilingual("Create a fictional suspicious message, then mark its warning signs: pressure, strange address, unexpected link, request for secrets, or an offer too good to be true. Rewrite it as a safe verification plan.", "أنشئ رسالة مشبوهة خيالية، ثم حدّد إشارات التحذير فيها: الضغط، أو عنوان غريب، أو رابط غير متوقع، أو طلب أسرار، أو عرض غير واقعي. أعد كتابتها كخطة تحقق آمنة.", "צרו הודעה חשודה דמיונית ואז סמנו את סימני האזהרה שבה: לחץ, כתובת מוזרה, קישור לא צפוי, בקשה לסודות או הצעה טובה מכדי להיות אמיתית. כתבו אותה מחדש כתוכנית אימות בטוחה."),

            "task",

          ),



          quizSlide(

            "security-quiz",

            trilingual("Safety decision", "قرار آمن", "החלטה בטוחה"),

            trilingual("A friend urgently asks for your login verification code. What is safest?", "يطلب صديق بشكل عاجل رمز التحقق لتسجيل دخولك. ما التصرف الأكثر أمانًا؟", "חבר מבקש בדחיפות את קוד האימות שלכם לכניסה לחשבון. מה הכי בטוח לעשות?"),

            [

              trilingual("Send it because the request is urgent", "ترسله لأن الطلب عاجل", "לשלוח אותו כי הבקשה דחופה"),

              trilingual("Post it in the group so others can check", "تنشره في المجموعة ليتحقق الآخرون", "לפרסם אותו בקבוצה כדי שאחרים יבדקו"),

              trilingual("Do not share it; contact the friend another way", "لا تشاركه وتتواصل مع الصديق بطريقة أخرى", "לא לשתף אותו; ליצור קשר עם החבר בדרך אחרת"),

              trilingual("Reuse it as your password", "تعيد استخدامه ككلمة مرور", "להשתמש בו שוב כסיסמה"),

            ],

            2,

          ),



          contentSlide(

            "security-summary",

            trilingual("Stop, check, protect, report", "توقف وتحقق واحمِ وأبلغ", "עצרו, בדקו, הגנו ודווחו"),

            trilingual("Responsible digital citizens protect accounts and privacy, question unexpected requests, communicate respectfully, and ask a trusted adult for help when something feels unsafe.", "يحمي المواطنون الرقميون المسؤولون الحسابات والخصوصية، ويتحققون من الطلبات غير المتوقعة، ويتواصلون باحترام، ويطلبون مساعدة شخص بالغ موثوق عند الشعور بعدم الأمان.", "אזרחים דיגיטליים אחראיים מגינים על חשבונות ועל פרטיות, מטילים ספק בבקשות לא צפויות, מתקשרים בכבוד ומבקשים עזרה ממבוגר אמין כשמשהו מרגיש לא בטוח."),

            "summary",

          ),



          contentSlide(

            "security-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("What is one online habit you would change after this lesson?", "ما العادة الرقمية التي ستغيّرها بعد هذا الدرس؟", "איזה הרגל מקוון אחד הייתם משנים אחרי השיעור הזה?"),

          ),

        ],

      },



      /* =====================================================

         9. WHAT IS ARTIFICIAL INTELLIGENCE?

      ===================================================== */

      {

        id: "what-is-artificial-intelligence",
        order: 14,



        title: trilingual(
          "What Is Artificial Intelligence?",
          "ما هو الذكاء الاصطناعي؟",
          "מהי בינה מלאכותית?",
        ),



        description: trilingual(
          "Distinguish AI systems from regular software and explore where artificial intelligence is used.",
          "ميّز بين أنظمة الذكاء الاصطناعي والبرامج العادية واستكشف أين يُستخدم الذكاء الاصطناعي.",
          "הבחינו בין מערכות בינה מלאכותית לתוכנות רגילות וגלו היכן משתמשים בבינה מלאכותית.",
        ),



        ...lessonVisuals(

          "what-is-artificial-intelligence",

          trilingual(
          "Children exploring examples of artificial intelligence in everyday technology",
          "أطفال يستكشفون أمثلة للذكاء الاصطناعي في التكنولوجيا اليومية",
          "ילדים חוקרים דוגמאות לבינה מלאכותית בטכנולוגיה יומיומית",
        ),

          "#7C3AED",

          "#22C55E",

          "#F5F3FF",

        ),



        minutes: 50,

        xp: 170,

        status: "draft",



        sections: [

          contentSlide(

            "ai-definition",

            trilingual("AI is not magic", "الذكاء الاصطناعي ليس سحرًا", "בינה מלאכותית אינה קסם"),

            trilingual("Artificial intelligence describes computer systems designed to perform tasks that often require human-like abilities such as recognizing patterns, understanding language, making predictions, or generating content.", "يصف الذكاء الاصطناعي أنظمة حاسوبية مصممة لتنفيذ مهام تحتاج غالبًا إلى قدرات شبيهة بالبشر مثل اكتشاف الأنماط وفهم اللغة وإجراء التنبؤات أو إنشاء المحتوى.", "בינה מלאכותית מתארת מערכות מחשב שנועדו לבצע משימות שלרוב דורשות יכולות דמויות־אדם, כמו זיהוי דפוסים, הבנת שפה, חיזוי או יצירת תוכן."),

          ),



          contentSlide(

            "ai-versus-rules",

            trilingual("AI or ordinary program?", "ذكاء اصطناعي أم برنامج عادي؟", "בינה מלאכותית או תוכנית רגילה?"),

            trilingual("Some software follows fixed rules written directly by programmers. Many AI systems instead learn patterns from data or examples. Both are programs, but they may solve problems in different ways.", "تتبع بعض البرامج قواعد ثابتة يكتبها المبرمجون مباشرة. أما أنظمة ذكاء اصطناعي كثيرة فتتعلم الأنماط من البيانات أو الأمثلة. كلاهما برامج، لكنهما قد يحلان المشكلات بطرق مختلفة.", "חלק מהתוכנות פועלות לפי כללים קבועים שנכתבו ישירות בידי מתכנתים. מערכות AI רבות לומדות במקום זאת דפוסים מנתונים או מדוגמאות. שתיהן תוכנות, אך הן עשויות לפתור בעיות בדרכים שונות."),

          ),



          contentSlide(

            "ai-or-not-task",

            trilingual("AI or not AI?", "AI أم ليس AI؟", "AI או לא AI?"),

            trilingual("Classify everyday technologies into likely AI and non-AI examples. For each choice, explain what evidence supports your decision.", "صنّف تقنيات يومية إلى أمثلة يُرجّح أنها تستخدم AI وأخرى لا تستخدمه، واشرح الدليل الذي يدعم كل اختيار.", "סווגו טכנולוגיות יומיומיות לדוגמאות שסביר שמשתמשות ב־AI ולכאלה שאינן משתמשות בו. לכל בחירה הסבירו איזה מידע תומך בהחלטה שלכם."),

            "task",

          ),



          quizSlide(

            "ai-intro-quiz",

            trilingual("AI check", "اختبار AI", "בדיקת AI"),

            trilingual("Which example is most likely to use artificial intelligence?", "أي مثال من المرجّح أكثر أن يستخدم الذكاء الاصطناعي؟", "איזו דוגמה היא הסבירה ביותר להשתמש בבינה מלאכותית?"),

            [

              trilingual("Photo face recognition", "التعرّف على الوجوه في الصور", "זיהוי פנים בתמונות"),

              trilingual("A basic calculator", "آلة حاسبة بسيطة", "מחשבון בסיסי"),

              trilingual("A light switch", "مفتاح ضوء", "מתג תאורה"),

              trilingual("A paper notebook", "دفتر ورقي", "מחברת נייר"),

            ],

            0,

          ),



          contentSlide(

            "ai-intro-summary",

            trilingual("Ask what the system is doing", "اسأل ماذا يفعل النظام", "שאלו מה המערכת עושה"),

            trilingual("AI is a broad field. A useful question is not only 'Is this AI?' but also 'What task is the system doing, what information does it use, and how reliable is the result?'", "الذكاء الاصطناعي مجال واسع. والسؤال المفيد ليس فقط: \"هل هذا AI؟\" بل أيضًا: ما المهمة التي ينفذها النظام؟ وما المعلومات التي يستخدمها؟ وما مدى موثوقية النتيجة؟", "בינה מלאכותית היא תחום רחב. שאלה שימושית אינה רק 'האם זה AI?' אלא גם 'איזו משימה המערכת מבצעת, באיזה מידע היא משתמשת ועד כמה התוצאה אמינה?'"),

            "summary",

          ),



          contentSlide(

            "ai-intro-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("Name one useful AI application and one concern people should think about before using it.", "اذكر استخدامًا مفيدًا واحدًا للذكاء الاصطناعي وقلقًا واحدًا يجب التفكير فيه قبل استخدامه.", "תנו דוגמה אחת לשימוש מועיל ב־AI ודאגה אחת שכדאי לחשוב עליה לפני השימוש בו."),

          ),

        ],

      },



      /* =====================================================

         10. HOW DOES AI LEARN?

      ===================================================== */

      {

        id: "how-ai-learns",
        order: 15,



        title: trilingual(
          "How Does AI Learn?",
          "كيف يتعلّم الذكاء الاصطناعي؟",
          "כיצד בינה מלאכותית לומדת?",
        ),



        description: trilingual(
          "Explore training data, examples, labels, predictions, bias, privacy, and human oversight.",
          "استكشف بيانات التدريب والأمثلة والتصنيفات والتنبؤات والتحيز والخصوصية والإشراف البشري.",
          "חקרו נתוני אימון, דוגמאות, תוויות, תחזיות, הטיה, פרטיות ופיקוח אנושי.",
        ),



        ...lessonVisuals(

          "how-ai-learns",

          trilingual(
          "Children training and testing a simple AI classifier",
          "أطفال يدربون ويختبرون مصنّف ذكاء اصطناعي بسيط",
          "ילדים מאמנים ובודקים מסווג פשוט של בינה מלאכותית",
        ),

          "#7C3AED",

          "#14B8A6",

          "#F5F3FF",

        ),



        minutes: 55,

        xp: 185,

        status: "draft",



        sections: [

          contentSlide(

            "learning-from-examples",

            trilingual("Patterns from examples", "أنماط من الأمثلة", "דפוסים מתוך דוגמאות"),

            trilingual("Many AI systems learn statistical patterns from training examples instead of following every rule written by a person. Their output is a prediction, so it can be useful without always being correct.", "تتعلم أنظمة ذكاء اصطناعي كثيرة أنماطًا إحصائية من أمثلة التدريب بدل اتباع كل قاعدة يكتبها شخص. ومخرجاتها تنبؤات، لذلك قد تكون مفيدة دون أن تكون صحيحة دائمًا.", "מערכות AI רבות לומדות דפוסים סטטיסטיים מדוגמאות אימון במקום לפעול לפי כל כלל שאדם כתב. הפלט שלהן הוא תחזית, ולכן הוא יכול להיות שימושי גם בלי להיות תמיד נכון."),

          ),



          contentSlide(

            "quality-bias-privacy",

            trilingual("Data shapes results", "البيانات تشكّل النتائج", "הנתונים מעצבים את התוצאות"),

            trilingual("Missing, incorrect, or unbalanced data can produce unreliable or unfair results. Personal data also deserves protection. People must test systems, explain limits, obtain appropriate permission, and remain responsible for important decisions.", "قد تنتج البيانات الناقصة أو الخاطئة أو غير المتوازنة نتائج غير موثوقة أو غير عادلة. وتستحق البيانات الشخصية الحماية. يجب أن يختبر الناس الأنظمة، ويشرحوا حدودها، ويحصلوا على الإذن المناسب، ويتحملوا مسؤولية القرارات المهمة.", "נתונים חסרים, שגויים או לא מאוזנים יכולים ליצור תוצאות לא אמינות או לא הוגנות. גם מידע אישי ראוי להגנה. אנשים צריכים לבדוק מערכות, להסביר מגבלות, לקבל רשות מתאימה ולהישאר אחראים להחלטות חשובות."),

          ),



          contentSlide(

            "paper-classifier",

            trilingual("Train a paper classifier", "درّب مصنّفًا ورقيًا", "אמנו מסווג על נייר"),

            trilingual("Invent a rule that classifies drawn creatures using a small training set. Let another team test unusual examples. Record errors, inspect whether the examples were balanced, and improve the rule without collecting personal data.", "ابتكر قاعدة تصنف مخلوقات مرسومة باستخدام مجموعة تدريب صغيرة. دع فريقًا آخر يختبر أمثلة غير معتادة. سجّل الأخطاء، وافحص توازن الأمثلة، وحسّن القاعدة دون جمع بيانات شخصية.", "המציאו כלל שמסווג יצורים מצוירים באמצעות קבוצת אימון קטנה. תנו לקבוצה אחרת לבדוק דוגמאות חריגות. תעדו שגיאות, בדקו אם הדוגמאות היו מאוזנות ושפרו את הכלל בלי לאסוף מידע אישי."),

            "task",

          ),



          quizSlide(

            "ai-learning-quiz",

            trilingual("Responsible AI check", "اختبار الذكاء الاصطناعي المسؤول", "בדיקת AI אחראי"),

            trilingual("Why should people review an AI system's important decisions?", "لماذا يجب أن يراجع الناس قرارات نظام الذكاء الاصطناعي المهمة؟", "למה חשוב שאנשים יבדקו החלטות חשובות של מערכת AI?"),

            [

              trilingual("AI predictions can be wrong or unfair", "قد تكون تنبؤات الذكاء الاصطناعي خاطئة أو غير عادلة", "תחזיות AI יכולות להיות שגויות או לא הוגנות"),

              trilingual("AI never uses data", "الذكاء الاصطناعي لا يستخدم البيانات أبدًا", "AI לעולם אינו משתמש בנתונים"),

              trilingual("Computers cannot display results", "لا تستطيع الحواسيب عرض النتائج", "מחשבים אינם יכולים להציג תוצאות"),

              trilingual("Reviewing always makes data public", "المراجعة تجعل البيانات عامة دائمًا", "בדיקה תמיד הופכת נתונים לציבוריים"),

            ],

            0,

          ),



          contentSlide(

            "ai-learning-summary",

            trilingual("Curious and critical", "فضولي وناقد", "סקרנים וביקורתיים"),

            trilingual("AI finds patterns and makes predictions from data. Evaluate the evidence, test diverse cases, protect privacy, communicate limitations, and keep humans accountable for how a system is used.", "يجد الذكاء الاصطناعي الأنماط ويصنع تنبؤات من البيانات. قيّم الأدلة، واختبر حالات متنوعة، واحمِ الخصوصية، واشرح الحدود، وأبقِ البشر مسؤولين عن طريقة استخدام النظام.", "AI מוצא דפוסים ומבצע תחזיות מנתונים. העריכו את הראיות, בדקו מקרים מגוונים, הגנו על פרטיות, הסבירו מגבלות והשאירו את בני האדם אחראים לאופן השימוש במערכת."),

            "summary",

          ),



          contentSlide(

            "ai-learning-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("What might happen if an AI system is trained using only one kind of example?", "ماذا قد يحدث إذا تم تدريب نظام AI باستخدام نوع واحد فقط من الأمثلة؟", "מה עלול לקרות אם מערכת AI מאומנת רק על סוג אחד של דוגמאות?"),

          ),

        ],

      },



      /* =====================================================

         11. CREATE AN IMAGE WITH AI

      ===================================================== */

      {

        id: "create-image-with-ai",
        order: 16,



        title: trilingual(
          "Create an Image with AI",
          "أنشئ صورة بالذكاء الاصطناعي",
          "צרו תמונה בעזרת בינה מלאכותית",
        ),



        description: trilingual(
          "Learn how prompts guide image generation and practice clear, creative, and responsible AI use.",
          "تعلّم كيف توجه الـPrompts إنشاء الصور وتدرّب على استخدام AI بوضوح وإبداع ومسؤولية.",
          "למדו כיצד פרומפטים מכוונים יצירת תמונות ותרגלו שימוש ברור, יצירתי ואחראי בבינה מלאכותית.",
        ),



        ...lessonVisuals(

          "create-image-with-ai",

          trilingual(
          "Children experimenting with AI image prompts and comparing generated results",
          "أطفال يجربون أوامر إنشاء صور بالذكاء الاصطناعي ويقارنون النتائج",
          "ילדים מתנסים בפרומפטים ליצירת תמונות בעזרת AI ומשווים בין התוצאות",
        ),

          "#DB2777",

          "#8B5CF6",

          "#FDF2F8",

        ),



        minutes: 55,

        xp: 180,

        status: "draft",



        sections: [

          contentSlide(

            "prompt-basics",

            trilingual("A prompt gives direction", "الـPrompt يعطي توجيهًا", "פרומפט נותן כיוון"),

            trilingual("A useful image prompt can describe the subject, setting, style, mood, colors, viewpoint, and purpose. More detail can guide the system, but the result still needs human review.", "يمكن للـPrompt الجيد أن يصف الموضوع والمكان والأسلوب والمزاج والألوان وزاوية النظر والهدف. تساعد التفاصيل على توجيه النظام، لكن النتيجة ما زالت تحتاج إلى مراجعة بشرية.", "פרומפט טוב ליצירת תמונה יכול לתאר את הנושא, הסביבה, הסגנון, האווירה, הצבעים, נקודת המבט והמטרה. פירוט נוסף יכול לכוון את המערכת, אבל התוצאה עדיין דורשת בדיקה אנושית."),

          ),



          contentSlide(

            "prompt-improvement",

            trilingual("Improve, compare, revise", "حسّن وقارن وعدّل", "שפרו, השוו ועדכנו"),

            trilingual("Prompting is an iterative process. Create a first version, compare the result with your intention, change one or two details, and observe how the output changes.", "كتابة الـPrompt عملية تكرارية. أنشئ نسخة أولى، وقارن النتيجة بما كنت تقصده، وعدّل تفصيلًا أو تفصيلين، ولاحظ كيف تتغير النتيجة.", "כתיבת פרומפטים היא תהליך איטרטיבי. צרו גרסה ראשונה, השוו את התוצאה לכוונה שלכם, שנו פרט אחד או שניים ובדקו כיצד הפלט משתנה."),

          ),



          contentSlide(

            "prompt-makeover",

            trilingual("Prompt makeover challenge", "تحدّي تطوير الـPrompt", "אתגר שדרוג הפרומפט"),

            trilingual("Turn a vague prompt such as 'make a robot' into a detailed prompt that includes subject, setting, style, colors, mood, and purpose. Compare the two results and explain which prompt communicated your idea better.", "حوّل Prompt عام مثل \"اصنع روبوتًا\" إلى Prompt مفصّل يحدد الموضوع والمكان والأسلوب والألوان والمزاج والهدف. قارن بين النتيجتين واشرح أي Prompt عبّر عن فكرتك بشكل أفضل.", "הפכו פרומפט מעורפל כמו 'צרו רובוט' לפרומפט מפורט שכולל נושא, סביבה, סגנון, צבעים, אווירה ומטרה. השוו בין שתי התוצאות והסבירו איזה פרומפט העביר את הרעיון שלכם בצורה טובה יותר."),

            "task",

          ),



          quizSlide(

            "prompt-quiz",

            trilingual("Prompt check", "اختبار الـPrompt", "בדיקת פרומפט"),

            trilingual("Which prompt gives the clearest direction?", "أي Prompt يعطي توجيهًا أوضح؟", "איזה פרומפט נותן את ההנחיה הברורה ביותר?"),

            [

              trilingual("Make something nice", "اصنع شيئًا جميلًا", "צרו משהו יפה"),

              trilingual("Create a friendly blue robot helping children in a bright science lab, cartoon style", "أنشئ روبوتًا أزرق ودودًا يساعد الأطفال في مختبر علوم مضيء بأسلوب كرتوني", "צרו רובוט כחול וידידותי שעוזר לילדים במעבדת מדעים מוארת, בסגנון מצויר"),

              trilingual("Picture", "صورة", "תמונה"),

              trilingual("Do AI", "اعمل AI", "עשו AI"),

            ],

            1,

          ),



          contentSlide(

            "responsible-generation",

            trilingual("Create responsibly", "أنشئ بمسؤولية", "צרו באחריות"),

            trilingual("Do not assume generated images are automatically accurate or appropriate. Check details carefully, avoid harmful or misleading uses, respect privacy, and be transparent when AI helped create an image.", "لا تفترض أن الصور المولدة دقيقة أو مناسبة تلقائيًا. افحص التفاصيل بعناية، وتجنب الاستخدامات المؤذية أو المضللة، واحترم الخصوصية، وكن واضحًا عندما يساعد AI في إنشاء الصورة.", "אל תניחו שתמונות שנוצרו אוטומטית הן מדויקות או מתאימות. בדקו פרטים בזהירות, הימנעו משימוש מזיק או מטעה, כבדו פרטיות והיו שקופים כאשר AI סייע ביצירת תמונה."),

            "summary",

          ),



          contentSlide(

            "prompt-reflection",

            trilingual("Reflection", "تأمل", "רפלקציה"),

            trilingual("How can you decide whether an AI-generated image really matches your intention?", "كيف تقرر ما إذا كانت الصورة الناتجة عن AI تطابق فعلًا ما كنت تقصده؟", "איך תוכלו להחליט אם תמונה שנוצרה ב־AI באמת מתאימה למה שהתכוונתם?"),

          ),

        ],

      },



      /* =====================================================

         12. INNOVATION LAB: FINAL PROJECT

      ===================================================== */

      {

        id: "innovation-capstone",
        order: 18,



        title: trilingual(
          "Innovation Lab: Final Project",
          "مختبر الابتكار: المشروع النهائي",
          "מעבדת חדשנות: פרויקט גמר",
        ),



        description: trilingual(
          "Apply the full design cycle to propose, prototype, test, and present a responsible technology solution.",
          "طبّق دورة التصميم الكاملة لاقتراح حل تقني مسؤول وبناء نموذجه واختباره وعرضه.",
          "יישמו את מחזור התכנון המלא כדי להציע, לבנות אבטיפוס, לבדוק ולהציג פתרון טכנולוגי אחראי.",
        ),



        ...lessonVisuals(

          "innovation-capstone",

          trilingual(
          "Young innovators presenting and testing a responsible technology project",
          "مبتكرون صغار يعرضون مشروعًا تقنيًا مسؤولًا ويختبرونه",
          "חדשנים צעירים מציגים ובודקים פרויקט טכנולוגי אחראי",
        ),

          "#0F766E",

          "#F59E0B",

          "#FFFBEB",

        ),



        minutes: 90,

        xp: 250,

        status: "draft",



        sections: [

          contentSlide(

            "problem-first",

            trilingual("Start with a real need", "ابدأ بحاجة حقيقية", "התחילו מצורך אמיתי"),

            trilingual("Observe your school or community and define one specific problem. Interview users with permission. Separate evidence from assumptions, then write: Who needs help, what happens now, and what successful change would look like?", "راقب مدرستك أو مجتمعك وحدد مشكلة واحدة واضحة. قابل المستخدمين بإذن. افصل الأدلة عن الافتراضات، ثم اكتب: من يحتاج المساعدة؟ ماذا يحدث الآن؟ وكيف يبدو التغيير الناجح؟", "התבוננו בבית הספר או בקהילה והגדירו בעיה אחת מסוימת. ראיינו משתמשים באישור. הפרידו בין ראיות להנחות ואז כתבו: מי זקוק לעזרה, מה קורה כיום ואיך ייראה שינוי מוצלח?"),

          ),



          contentSlide(

            "solution-blueprint",

            trilingual("Design the system", "صمّم النظام", "תכננו את המערכת"),

            trilingual("Draw the input–process–output model, write the core algorithm, identify hardware and software, and explain whether a network, data, coding, or AI is needed. Choose the simplest technology that can test your idea.", "ارسم نموذج الإدخال والمعالجة والإخراج، واكتب الخوارزمية الأساسية، وحدد العتاد والبرمجيات، واشرح هل تحتاج إلى شبكة أو بيانات أو برمجة أو AI. اختر أبسط تقنية تستطيع اختبار فكرتك.", "ציירו מודל קלט–עיבוד–פלט, כתבו את האלגוריתם המרכזי, זהו חומרה ותוכנה והסבירו האם נדרשים רשת, נתונים, תכנות או AI. בחרו את הטכנולוגיה הפשוטה ביותר שיכולה לבדוק את הרעיון שלכם."),

          ),



          contentSlide(

            "prototype-test",

            trilingual("Prototype, test, improve", "ابنِ نموذجًا واختبره وحسّنه", "בנו אבטיפוס, בדקו ושפרו"),

            trilingual("Build a paper, slide, block-code, AI-assisted, or physical prototype. Give testers a realistic task without coaching them. Record what worked, what confused them, and one change supported by evidence.", "ابنِ نموذجًا ورقيًا أو عرضًا أو كودًا باللبنات أو نموذجًا بمساعدة AI أو نموذجًا ماديًا. أعطِ المختبرين مهمة واقعية دون توجيه. سجّل ما نجح وما أربكهم وتغييرًا واحدًا تدعمه الأدلة.", "בנו אבטיפוס מנייר, מצגת, קוד בבלוקים, בעזרת AI או אבטיפוס פיזי. תנו לבודקים משימה מציאותית בלי להדריך אותם. רשמו מה עבד, מה בלבל אותם ושינוי אחד שנתמך בראיות."),

            "task",

          ),



          contentSlide(

            "responsibility-review",

            trilingual("Responsibility review", "مراجعة المسؤولية", "בדיקת אחריות"),

            trilingual("List possible safety, privacy, fairness, accessibility, and environmental effects. Reduce unnecessary data collection, add a safe failure plan, and explain which decisions must remain under human control.", "اكتب الآثار المحتملة على الأمان والخصوصية والعدالة وإمكانية الوصول والبيئة. قلّل جمع البيانات غير الضرورية، وأضف خطة فشل آمن، واشرح القرارات التي يجب أن تبقى تحت تحكم البشر.", "רשמו השפעות אפשריות על בטיחות, פרטיות, הוגנות, נגישות והסביבה. צמצמו איסוף נתונים מיותר, הוסיפו תוכנית כשל בטוחה והסבירו אילו החלטות חייבות להישאר בשליטה אנושית."),

            "task",

          ),



          quizSlide(

            "capstone-quiz",

            trilingual("Design cycle check", "اختبار دورة التصميم", "בדיקת מחזור התכנון"),

            trilingual("Which result provides the strongest reason to improve a prototype?", "أي نتيجة تقدم أقوى سبب لتحسين النموذج الأولي؟", "איזו תוצאה מספקת את הסיבה החזקה ביותר לשפר אבטיפוס?"),

            [

              trilingual("The designer likes its color", "يعجب المصمم لونه", "המעצב אוהב את הצבע שלו"),

              trilingual("Several users cannot complete the intended task", "لا يستطيع عدة مستخدمين إكمال المهمة المطلوبة", "כמה משתמשים אינם מצליחים להשלים את המשימה המיועדת"),

              trilingual("The first idea was created quickly", "أُنشئت الفكرة الأولى بسرعة", "הרעיון הראשון נוצר במהירות"),

              trilingual("The title contains a technology word", "يحتوي العنوان على كلمة تقنية", "הכותרת כוללת מילה טכנולוגית"),

            ],

            1,

          ),



          contentSlide(

            "present-reflect",

            trilingual("Present the journey", "اعرض الرحلة", "הציגו את הדרך"),

            trilingual("Present the problem, evidence, algorithm, prototype, test results, improvements, and responsibility choices. End with what you would investigate next. Innovation is not only inventing—it is learning carefully from people and evidence.", "اعرض المشكلة والأدلة والخوارزمية والنموذج ونتائج الاختبار والتحسينات وقرارات المسؤولية. اختم بما ستبحثه لاحقًا. الابتكار ليس اختراعًا فقط، بل تعلّم متأنٍ من الناس والأدلة.", "הציגו את הבעיה, הראיות, האלגוריתם, האבטיפוס, תוצאות הבדיקה, השיפורים ובחירות האחריות. סיימו במה הייתם חוקרים בהמשך. חדשנות אינה רק להמציא — היא גם ללמוד בזהירות מאנשים ומראיות."),

            "summary",

          ),



          contentSlide(

            "capstone-reflection",

            trilingual("Final reflection", "التأمل النهائي", "רפלקציה מסכמת"),

            trilingual("What are you most proud of in your project, what was the hardest part, and what would you improve next?", "ما أكثر شيء تفخر به في مشروعك؟ وما أصعب جزء؟ وما الذي ستطوره لاحقًا؟", "על מה אתם הכי גאים בפרויקט, מה היה החלק הקשה ביותר ומה הייתם משפרים בהמשך?"),

          ),

        ],

      },

    ],

  },

])();



// Standalone classroom lessons. Stable IDs are also stored on published class lessons.
const classroomLessons = [
  {
    id: "tech-ai-intro-01",

    track: "techExplorer",

    grades: ["4", "5", "6"],

    icon: "🤖",

    activityType: "ai",

    estimatedMinutes: 90,

    xpReward: 180,

    title: {
      en: "AI Detective — Can You Outsmart Artificial Intelligence?",
      ar: "محقق الذكاء الاصطناعي — هل تستطيع التفوق على AI؟",
      he: "בלש הבינה המלאכותית — האם תוכלו להערים על בינה מלאכותית?",
    },

    summary: {
      en: "Investigate how AI works, test its answers, improve prompts, and design your own AI solution.",
      ar: "حقق في طريقة عمل الذكاء الاصطناعي، اختبر إجاباته، حسّن الأوامر، وصمّم حل AI خاصًا بك.",
      he: "חקרו כיצד בינה מלאכותית פועלת, בדקו את תשובותיה, שפרו פרומפטים ותכננו פתרון AI משלכם.",
    },

    sections: [

      /* =================================
         1 — MISSION
      ================================= */

      {
        id: "ai-mission",

        type: "question",

        icon: "🕵️",

        title: {
          en: "Your Mission",
          ar: "مهمتك",
          he: "המשימה שלכם",
        },

        text: {
          en: "A mysterious technology can recognize faces, recommend videos, create pictures and answer questions. But is everything it does really intelligent? Your mission is to investigate AI and discover what it can — and cannot — do.",

          ar: "هناك تقنية غامضة تستطيع التعرّف على الوجوه، اقتراح الفيديوهات، إنشاء الصور والإجابة عن الأسئلة. لكن هل كل ما تفعله يُعتبر ذكاءً فعلًا؟ مهمتك اليوم أن تحقق في عالم AI وتكتشف ما يستطيع فعله وما لا يستطيع.",
          he: "טכנולוגיה מסתורית מסוגלת לזהות פנים, להמליץ על סרטונים, ליצור תמונות ולענות על שאלות. אבל האם כל מה שהיא עושה באמת חכם? המשימה שלכם היא לחקור בינה מלאכותית ולגלות מה היא יכולה — ומה אינה יכולה — לעשות.",
        },

        note: {
          en: "Do not look for one correct answer. Think like an investigator and justify your ideas.",

          ar: "لا تبحث عن إجابة واحدة صحيحة. فكّر كمحقق وحاول تبرير أفكارك.",
          he: "אל תחפשו תשובה נכונה אחת. חשבו כמו חוקרים והסבירו את הרעיונות שלכם.",
        },
      },

      /* =================================
         2 — OBJECTIVES
      ================================= */

      {
        id: "ai-objectives",

        type: "objectives",

        icon: "🎯",

        title: {
          en: "Mission Goals",
          ar: "أهداف المهمة",
          he: "מטרות המשימה",
        },

        items: {
          en: [
            "Recognize situations where AI may be used.",
            "Distinguish between fixed programs and AI systems.",
            "Understand the basic idea of learning from examples and data.",
            "Discover that AI can make mistakes.",
            "Experiment with prompts and improve AI results.",
            "Design an AI solution for a real problem.",
          ],

          ar: [
            "أتعرف على مواقف يمكن أن يُستخدم فيها الذكاء الاصطناعي.",
            "أميز بين برنامج يعمل بقواعد ثابتة ونظام AI.",
            "أفهم الفكرة الأساسية للتعلم من البيانات والأمثلة.",
            "أكتشف أن الذكاء الاصطناعي قد يخطئ.",
            "أجرب كتابة Prompts وأحسن نتائج الذكاء الاصطناعي.",
            "أصمم حل AI لمشكلة حقيقية.",
          ],

          he: [
            "לזהות מצבים שבהם עשויים להשתמש בבינה מלאכותית.",
            "להבחין בין תוכניות עם כללים קבועים לבין מערכות בינה מלאכותית.",
            "להבין את הרעיון הבסיסי של למידה מדוגמאות ומנתונים.",
            "לגלות שבינה מלאכותית יכולה לטעות.",
            "להתנסות בפרומפטים ולשפר את תוצאות הבינה המלאכותית.",
            "לתכנן פתרון בינה מלאכותית לבעיה אמיתית.",
          ],
        },
      },

      /* =================================
         3 — AI OR NOT?
      ================================= */

      {
        id: "ai-or-not",

        type: "task",

        icon: "🔍",

        title: {
          en: "Investigation 1 — AI or Not?",
          ar: "التحقيق الأول — AI أم لا؟",
          he: "חקירה 1 — בינה מלאכותית או לא?",
        },

        introduction: {
          en: "Not every smart-looking technology uses artificial intelligence. Decide which systems probably use AI and explain your reasoning.",

          ar: "ليس كل جهاز أو برنامج يبدو ذكيًا يستخدم الذكاء الاصطناعي. قرر أي الأنظمة التالية قد تستخدم AI واشرح سبب قرارك.",
          he: "לא כל טכנולוגיה שנראית חכמה משתמשת בבינה מלאכותית. החליטו אילו מערכות כנראה משתמשות ב-AI והסבירו את ההיגיון שלכם.",
        },

        steps: {
          en: [
            "A calculator adds 27 + 48.",
            "YouTube recommends a new video.",
            "A phone unlocks after recognizing a face.",
            "A traffic light changes every 30 seconds.",
            "An email system detects spam.",
            "A timer rings after exactly 10 minutes.",
            "For each example, decide: AI, probably not AI, or not enough information.",
            "Explain WHY. The explanation is more important than the label.",
          ],

          ar: [
            "آلة حاسبة تحسب 27 + 48.",
            "YouTube يقترح فيديو جديدًا.",
            "هاتف يفتح بعد التعرّف على الوجه.",
            "إشارة مرور تتغير كل 30 ثانية.",
            "نظام بريد إلكتروني يكتشف الرسائل المزعجة.",
            "مؤقت يرن بعد 10 دقائق بالضبط.",
            "لكل مثال قرر: AI، على الأغلب ليس AI، أو لا توجد معلومات كافية.",
            "اشرح لماذا. التبرير أهم من الاختيار نفسه.",
          ],

          he: [
            "מחשבון מחבר 27 + 48.",
            "YouTube ממליץ על סרטון חדש.",
            "טלפון נפתח לאחר זיהוי פנים.",
            "רמזור מתחלף כל 30 שניות.",
            "מערכת דואר אלקטרוני מזהה ספאם.",
            "טיימר מצלצל בדיוק לאחר 10 דקות.",
            "לכל דוגמה החליטו: AI, כנראה לא AI, או שאין מספיק מידע.",
            "הסבירו למה. ההסבר חשוב יותר מהתווית.",
          ],
        },

        answerPrompt: {
          en: "Choose two examples and explain your reasoning:",

          ar: "اختر مثالين واشرح سبب قرارك:",
          he: "בחרו שתי דוגמאות והסבירו את reasoning שלכם:",
        },
      },

      /* =================================
         4 — MINI DISCOVERY
      ================================= */

      {
        id: "what-ai-is",

        type: "content",

        icon: "🧠",

        title: {
          en: "What Did We Discover?",
          ar: "ماذا اكتشفنا؟",
          he: "מה גילינו?",
        },

        paragraphs: {
          en: [
            "Artificial Intelligence is a broad term for computer systems that perform tasks such as recognizing patterns, understanding language, making predictions or generating content.",
            "A normal program can follow fixed instructions written by a programmer. Many AI systems behave differently: they use models that were trained using examples or data.",
            "This does not mean AI thinks exactly like a human. It can produce impressive results while still making mistakes.",
          ],

          ar: [
            "الذكاء الاصطناعي هو اسم واسع لأنظمة حاسوبية تستطيع تنفيذ مهام مثل اكتشاف الأنماط، فهم اللغة، التنبؤ أو إنشاء محتوى.",
            "البرنامج العادي يمكن أن يتبع تعليمات ثابتة كتبها المبرمج. أما الكثير من أنظمة AI فتعتمد على نماذج تم تدريبها باستخدام أمثلة أو بيانات.",
            "هذا لا يعني أن AI يفكر تمامًا كالإنسان. قد يعطي نتائج مدهشة، لكنه يستطيع أيضًا ارتكاب أخطاء.",
          ],

          he: [
            "בינה מלאכותית היא מונח רחב למערכות מחשב שמבצעות משימות כמו זיהוי דפוסים, הבנת שפה, חיזוי או יצירת תוכן.",
            "תוכנית רגילה יכולה לפעול לפי הוראות קבועות שכתב מתכנת. מערכות AI רבות פועלות אחרת: הן משתמשות במודלים שאומנו באמצעות דוגמאות או נתונים.",
            "זה לא אומר שבינה מלאכותית חושבת בדיוק כמו אדם. היא יכולה להפיק תוצאות מרשימות ועדיין לטעות.",
          ],
        },
      },

      /* =================================
         5 — HOW AI LEARNS
      ================================= */

      {
        id: "ai-learning-mystery",

        type: "question",

        icon: "🐱",

        title: {
          en: "The Cat Mystery",
          ar: "لغز القطة",
          he: "תעלומת החתול",
        },

        text: {
          en: "Imagine a computer has never seen a cat. You show it 5,000 pictures labeled 'cat' and 'not cat'. Later you show it a completely new picture. How could it possibly guess whether the new picture contains a cat?",

          ar: "تخيّل أن حاسوبًا لم يرَ قطة من قبل. عرضنا عليه 5000 صورة مكتوب عليها «قطة» أو «ليست قطة». بعد ذلك أعطيناه صورة جديدة تمامًا. كيف يمكن أن يحاول معرفة إن كانت الصورة تحتوي على قطة؟",
          he: "דמיינו שמחשב מעולם לא ראה חתול. אתם מראים לו 5,000 תמונות המסומנות 'חתול' ו'לא חתול'. אחר כך אתם מראים לו תמונה חדשה לגמרי. איך הוא יכול לנחש אם יש בה חתול?",
        },

        note: {
          en: "Think about patterns the system may discover from many examples.",

          ar: "فكّر بالأنماط التي قد يكتشفها النظام من عدد كبير من الأمثلة.",
          he: "חשבו על דפוסים שהמערכת עשויה לגלות מתוך דוגמאות רבות.",
        },
      },

      {
        id: "ai-training",

        type: "content",

        icon: "📊",

        title: {
          en: "Training From Examples",
          ar: "التدريب من الأمثلة",
          he: "אימון באמצעות דוגמאות",
        },

        paragraphs: {
          en: [
            "Many AI systems are trained using large collections of examples.",
            "During training, a model adjusts itself to find useful patterns in the data.",
            "After training, it can try to make a prediction about something it has not seen before.",
            "The quality and variety of the training data matter. Poor or unbalanced examples can lead to poor results.",
          ],

          ar: [
            "يتم تدريب الكثير من أنظمة AI باستخدام مجموعات كبيرة من الأمثلة.",
            "خلال التدريب يحاول النموذج اكتشاف أنماط مفيدة في البيانات.",
            "بعد التدريب يستطيع محاولة التنبؤ بشيء جديد لم يره سابقًا.",
            "جودة البيانات وتنوعها مهمان جدًا. إذا كانت الأمثلة ضعيفة أو غير متوازنة فقد تكون النتائج ضعيفة أيضًا.",
          ],

          he: [
            "מערכות AI רבות מאומנות באמצעות אוספים גדולים של דוגמאות.",
            "במהלך האימון, המודל מתאים את עצמו כדי למצוא דפוסים שימושיים בנתונים.",
            "לאחר האימון, הוא יכול לנסות לחזות משהו שלא ראה קודם.",
            "לאיכות ולמגוון של נתוני האימון יש חשיבות. דוגמאות חלשות או לא מאוזנות עלולות להוביל לתוצאות חלשות.",
          ],
        },
      },

      /* =================================
         6 — DATA CHALLENGE
      ================================= */

      {
        id: "biased-data-challenge",

        type: "multipleChoice",

        icon: "🧩",

        title: {
          en: "Data Detective",
          ar: "محقق البيانات",
          he: "בלש הנתונים",
        },

        question: {
          en: "You train an AI to recognize dogs, but almost all training pictures show only white dogs. What problem might happen?",

          ar: "درّبت نظام AI للتعرّف على الكلاب، لكن معظم صور التدريب تحتوي فقط على كلاب بيضاء. ما المشكلة التي قد تحدث؟",
          he: "אתם מאמנים AI לזהות כלבים, אבל כמעט כל תמונות האימון מציגות רק כלבים לבנים. איזו בעיה עלולה להיווצר?",
        },

        options: [
          {
            id: "a",
            text: {
              en: "It may struggle with dogs that look different from the training examples.",
              ar: "قد يواجه صعوبة مع كلاب تختلف عن أمثلة التدريب.",
              he: "המערכת עלולה להתקשות לזהות כלבים שנראים שונה מדוגמאות האימון.",
            },
          },
          {
            id: "b",
            text: {
              en: "It will automatically become perfect.",
              ar: "سيصبح النظام مثاليًا تلقائيًا.",
              he: "היא תהפוך אוטומטית למושלמת.",
            },
          },
          {
            id: "c",
            text: {
              en: "Training data never affects an AI system.",
              ar: "بيانات التدريب لا تؤثر أبدًا على نظام AI.",
              he: "נתוני האימון לעולם אינם משפיעים על מערכת AI.",
            },
          },
        ],

        correctAnswer: "a",

        explanation: {
          en: "Exactly. AI depends heavily on the examples it learns from. Limited training data can lead to weaker results.",

          ar: "بالضبط. تعتمد أنظمة AI كثيرًا على الأمثلة التي تتعلم منها. البيانات المحدودة قد تؤدي إلى نتائج أضعف.",
          he: "בדיוק. AI תלויה מאוד בדוגמאות שמהן היא לומדת. נתוני אימון מוגבלים עלולים להוביל לתוצאות חלשות יותר.",
        },
      },

      /* =================================
         7 — PROMPT EXPERIMENT
      ================================= */

      {
        id: "prompt-lab",

        type: "task",

        icon: "🧪",

        title: {
          en: "AI Lab — Can You Improve the Answer?",
          ar: "مختبر AI — هل تستطيع تحسين الإجابة؟",
          he: "מעבדת AI — האם תוכלו לשפר את התשובה?",
        },

        introduction: {
          en: "Now you will test how the instructions you give an AI can change its result.",

          ar: "الآن ستختبر كيف يمكن لطريقة كتابة التعليمات للذكاء الاصطناعي أن تغيّر النتيجة.",
          he: "כעת תבדקו כיצד ההוראות שאתם נותנים ל-AI יכולות לשנות את התוצאה.",
        },

        steps: {
          en: [
            "Open an AI assistant approved by your teacher.",
            "First write a very simple prompt: 'Give me an idea for a school robot.'",
            "Read the answer and give it a score from 1–5.",
            "Now improve the prompt by adding who the robot is for, what problem it should solve, and an important limitation.",
            "Example limitation: the robot may cost no more than 100 dollars.",
            "Compare the first and second answers.",
            "Improve your prompt one more time.",
            "Decide which version produced the best result and explain why.",
          ],

          ar: [
            "افتح أداة ذكاء اصطناعي وافق عليها المعلم.",
            "اكتب أولًا Prompt بسيطًا جدًا: «اقترح فكرة لروبوت يساعد المدرسة».",
            "اقرأ النتيجة وأعطها علامة من 1 إلى 5.",
            "الآن حسّن الـPrompt: حدد لمن الروبوت، ما المشكلة التي يحلها، وأضف قيدًا مهمًا.",
            "مثال على القيد: يجب ألا تزيد تكلفة الروبوت عن 100 دولار.",
            "قارن بين الإجابة الأولى والثانية.",
            "حسّن الـPrompt مرة ثالثة.",
            "حدد أي نسخة أعطت أفضل نتيجة واشرح لماذا.",
          ],

          he: [
            "פתחו עוזר AI שאושר על ידי המורה.",
            "כתבו תחילה פרומפט פשוט מאוד: 'תן לי רעיון לרובוט לבית הספר.'",
            "קראו את התשובה ותנו לה ציון מ-1 עד 5.",
            "כעת שפרו את הפרומפט על ידי הוספת מי ישתמש ברובוט, איזו בעיה עליו לפתור ומגבלה חשובה.",
            "דוגמה למגבלה: עלות הרובוט לא תעלה על 100 דולר.",
            "השוו בין התשובה הראשונה לשנייה.",
            "שפרו את הפרומפט פעם נוספת.",
            "החליטו איזו גרסה הפיקה את התוצאה הטובה ביותר והסבירו מדוע.",
          ],
        },

        answerPrompt: {
          en: "What changed between your first and best prompt?",

          ar: "ما الذي تغير بين الـPrompt الأول وأفضل Prompt كتبته؟",
          he: "מה השתנה בין הפרומפט הראשון שלכם לפרומפט הטוב ביותר?",
        },
      },

      /* =================================
         8 — AI CAN BE WRONG
      ================================= */

      {
        id: "ai-can-be-wrong",

        type: "content",

        icon: "⚠️",

        title: {
          en: "Do Not Trust AI Automatically",
          ar: "لا تثق بـAI تلقائيًا",
          he: "אל תסמכו על AI באופן אוטומטי",
        },

        paragraphs: {
          en: [
            "An AI answer can sound confident even when it is incomplete or wrong.",
            "That means an important AI skill is not only knowing how to ask questions. It is also knowing how to evaluate the answer.",
            "For important information, we should check reliable sources instead of assuming the AI is always correct.",
          ],

          ar: [
            "قد تبدو إجابة AI واثقة جدًا حتى عندما تكون ناقصة أو خاطئة.",
            "لذلك إحدى أهم مهارات استخدام الذكاء الاصطناعي ليست فقط معرفة كيف نسأله، بل كيف نفحص إجابته.",
            "عندما تكون المعلومة مهمة يجب التحقق منها من مصادر موثوقة بدل افتراض أن AI صحيح دائمًا.",
          ],

          he: [
            "תשובת AI יכולה להישמע בטוחה גם כשהיא חלקית או שגויה.",
            "כלומר, מיומנות חשובה ב-AI היא לא רק לדעת איך לשאול שאלות, אלא גם לדעת איך להעריך את התשובה.",
            "במידע חשוב יש לבדוק מקורות אמינים במקום להניח שה-AI תמיד צודק.",
          ],
        },
      },

      /* =================================
         9 — ERROR HUNTER
      ================================= */

      {
        id: "error-hunter",

        type: "task",

        icon: "🧐",

        title: {
          en: "Error Hunter",
          ar: "صياد الأخطاء",
          he: "צייד השגיאות",
        },

        introduction: {
          en: "Your job is no longer to ask AI for an answer. Your job is to evaluate the answer like a scientist.",

          ar: "مهمتك الآن ليست الحصول على إجابة من AI، بل تقييم الإجابة مثل عالم.",
          he: "המשימה שלכם כבר אינה רק לבקש תשובה מ-AI. כעת עליכם להעריך את התשובה כמו מדענים.",
        },

        steps: {
          en: [
            "Ask the AI a factual question about a topic you already know.",
            "Read its answer carefully.",
            "Identify one claim that could be checked.",
            "Think of another source you could use to verify it.",
            "Decide: trustworthy, uncertain, or probably wrong.",
            "Explain what evidence you would need before trusting it.",
          ],

          ar: [
            "اسأل AI سؤالًا معلوماتيًا عن موضوع تعرف عنه مسبقًا.",
            "اقرأ الإجابة بدقة.",
            "اختر معلومة واحدة يمكن التحقق منها.",
            "فكر بمصدر آخر تستطيع استخدامه للتحقق.",
            "قرر: موثوقة، غير مؤكدة، أم على الأغلب خاطئة.",
            "اشرح ما الدليل الذي تحتاجه قبل أن تثق بالإجابة.",
          ],

          he: [
            "שאלו את ה-AI שאלה עובדתית בנושא שאתם כבר מכירים.",
            "קראו את התשובה בעיון.",
            "זהו טענה אחת שאפשר לבדוק.",
            "חשבו על מקור נוסף שבו תוכלו להשתמש כדי לאמת אותה.",
            "החליטו: אמין, לא ודאי או כנראה שגוי.",
            "הסבירו איזה ראיות תצטרכו לפני שתסמכו עליה.",
          ],
        },

        answerPrompt: {
          en: "Which claim did you decide to verify, and how would you check it?",

          ar: "أي معلومة قررت التحقق منها؟ وكيف ستفحصها؟",
          he: "איזו טענה החלטתם לבדוק, וכיצד תבדקו אותה?",
        },
      },

      /* =================================
         10 — MAIN DESIGN CHALLENGE
      ================================= */

      {
        id: "design-your-ai",

        type: "task",

        icon: "✨",

        title: {
          en: "Main Challenge — Design Your Own AI System",
          ar: "التحدي الرئيسي — صمّم نظام AI خاصًا بك",
          he: "האתגר המרכזי — תכננו מערכת AI משלכם",
        },

        introduction: {
          en: "A school has hired you as an AI inventor. Design an AI system that solves a real problem — but you must explain how it works, not only give it a cool name.",

          ar: "اختارتك المدرسة لتكون مخترع AI. صمّم نظام ذكاء اصطناعي يحل مشكلة حقيقية، لكن عليك أن تشرح كيف سيعمل وليس فقط أن تعطيه اسمًا جميلًا.",
          he: "בית ספר שכר אתכם כממציאי AI. תכננו מערכת בינה מלאכותית שפותרת בעיה אמיתית — אבל עליכם להסביר כיצד היא פועלת, לא רק לתת לה שם מגניב.",
        },

        steps: {
          en: [
            "Choose one real problem in school or everyday life.",
            "Give your AI system a name.",
            "Explain who will use it.",
            "What information or data would the system need?",
            "What should the AI predict, recognize, recommend or create?",
            "Give one example of input.",
            "Give one example of output.",
            "Describe one mistake the AI could make.",
            "Explain how a human should check or control the system.",
          ],

          ar: [
            "اختر مشكلة حقيقية في المدرسة أو الحياة اليومية.",
            "أعطِ نظام AI اسمًا.",
            "حدد من سيستخدمه.",
            "ما المعلومات أو البيانات التي سيحتاجها النظام؟",
            "ماذا يجب على AI أن يتنبأ أو يتعرف أو يقترح أو ينشئ؟",
            "أعطِ مثالًا على Input.",
            "أعطِ مثالًا على Output.",
            "صف خطأ واحدًا يمكن أن يرتكبه النظام.",
            "اشرح كيف يجب أن يراقب الإنسان عمل النظام.",
          ],

          he: [
            "בחרו בעיה אמיתית אחת בבית הספר או בחיי היומיום.",
            "תנו למערכת ה-AI שלכם שם.",
            "הסבירו מי ישתמש בה.",
            "איזה מידע או נתונים המערכת תצטרך?",
            "מה ה-AI צריך לחזות, לזהות, להמליץ או ליצור?",
            "תנו דוגמה אחת לקלט.",
            "תנו דוגמה אחת לפלט.",
            "תארו טעות אחת שה-AI עלול לעשות.",
            "הסבירו כיצד אדם צריך לבדוק או לפקח על המערכת.",
          ],
        },

        answerPrompt: {
          en: "Present your AI invention: problem, data, input, output, possible mistake and human control.",

          ar: "اعرض اختراعك: المشكلة، البيانات، Input، Output، خطأ محتمل وكيف سيتحكم الإنسان بالنظام.",
          he: "הציגו את המצאת ה-AI שלכם: הבעיה, הנתונים, הקלט, הפלט, טעות אפשרית ופיקוח אנושי.",
        },
      },

      /* =================================
         11 — CHALLENGE+
      ================================= */

      {
        id: "ai-challenge-plus",

        type: "task",

        icon: "🔥",

        title: {
          en: "Challenge+ — For Expert Investigators",
          ar: "Challenge+ — للمحققين المتقدمين",
          he: "Challenge+ — לחוקרים מומחים",
        },

        introduction: {
          en: "A great invention also needs a critic. Try to find a weakness in your own AI idea.",

          ar: "المخترع القوي لا يدافع فقط عن فكرته، بل يبحث أيضًا عن نقاط ضعفها.",
          he: "המצאה טובה זקוקה גם למבקר. נסו למצוא חולשה ברעיון ה-AI שלכם.",
        },

        steps: {
          en: [
            "Imagine your AI system gives a wrong result.",
            "What might have caused the mistake?",
            "Could the training data be incomplete?",
            "Could the user give unclear information?",
            "Could the system treat some users unfairly?",
            "Suggest one improvement that would make your system safer or more accurate.",
          ],

          ar: [
            "تخيل أن نظام AI الخاص بك أعطى نتيجة خاطئة.",
            "ما السبب المحتمل للخطأ؟",
            "هل يمكن أن تكون بيانات التدريب ناقصة؟",
            "هل يمكن أن يعطي المستخدم معلومات غير واضحة؟",
            "هل يمكن أن يعامل النظام بعض المستخدمين بشكل غير عادل؟",
            "اقترح تحسينًا واحدًا يجعل النظام أكثر أمانًا أو دقة.",
          ],

          he: [
            "דמיינו שמערכת ה-AI שלכם נותנת תוצאה שגויה.",
            "מה יכול היה לגרום לטעות?",
            "האם ייתכן שנתוני האימון אינם שלמים?",
            "האם ייתכן שהמשתמש מסר מידע לא ברור?",
            "האם המערכת עלולה להתייחס באופן לא הוגן לחלק מהמשתמשים?",
            "הציעו שיפור אחד שיהפוך את המערכת שלכם לבטוחה או מדויקת יותר.",
          ],
        },

        answerPrompt: {
          en: "What is the biggest weakness in your AI system, and how would you improve it?",

          ar: "ما أكبر نقطة ضعف في نظام AI الخاص بك؟ وكيف ستحسنها؟",
          he: "מהי החולשה הגדולה ביותר במערכת ה-AI שלכם, וכיצד הייתם משפרים אותה?",
        },
      },

      /* =================================
         12 — FINAL CHECK
      ================================= */

      {
        id: "ai-final-challenge",

        type: "multipleChoice",

        icon: "🏆",

        title: {
          en: "Final Detective Test",
          ar: "اختبار المحقق النهائي",
          he: "מבחן הבלש הסופי",
        },

        question: {
          en: "An AI gives you a very confident answer. What is the smartest response?",

          ar: "أعطاك AI إجابة تبدو واثقة جدًا. ما التصرف الأذكى؟",
          he: "AI נותנת לכם תשובה בביטחון רב. מהי התגובה החכמה ביותר?",
        },

        options: [
          {
            id: "a",
            text: {
              en: "Believe it because AI cannot make mistakes.",
              ar: "أصدقها لأن AI لا يخطئ.",
              he: "להאמין לה כי AI אינה יכולה לטעות.",
            },
          },
          {
            id: "b",
            text: {
              en: "Check important claims and think about whether the answer makes sense.",
              ar: "أتحقق من المعلومات المهمة وأفكر إن كانت الإجابة منطقية.",
              he: "לבדוק טענות חשובות ולחשוב אם התשובה הגיונית.",
            },
          },
          {
            id: "c",
            text: {
              en: "Copy the answer immediately without reading it.",
              ar: "أنسخ الإجابة مباشرة دون قراءتها.",
              he: "להעתיק את התשובה מיד בלי לקרוא אותה.",
            },
          },
        ],

        correctAnswer: "b",

        explanation: {
          en: "Exactly. Good AI users do not only generate answers — they evaluate them.",

          ar: "بالضبط. المستخدم الجيد للذكاء الاصطناعي لا يكتفي بالحصول على إجابة، بل يقوم بتقييمها أيضًا.",
          he: "בדיוק. משתמשי AI טובים לא רק מייצרים תשובות — הם גם מעריכים אותן.",
        },
      },

      /* =================================
         13 — FINAL PRODUCT
      ================================= */

      {
        id: "ai-final-product",

        type: "summary",

        icon: "🎨",

        title: {
          en: "Your Mission Product",
          ar: "ناتج مهمتك",
          he: "תוצר המשימה שלכם",
        },

        items: {
          en: [
            "You investigated what AI is.",
            "You distinguished AI from fixed-rule programs.",
            "You explored training data.",
            "You improved a prompt through experimentation.",
            "You evaluated an AI answer instead of trusting it automatically.",
            "You designed an AI solution with input, output, data and possible risks.",
            "Keep your AI invention — it can become part of your final course project.",
          ],

          ar: [
            "حققت في معنى الذكاء الاصطناعي.",
            "ميّزت بين AI والبرامج التي تعمل بقواعد ثابتة.",
            "اكتشفت أهمية بيانات التدريب.",
            "حسّنت Prompt من خلال التجربة.",
            "فحصت إجابة AI بدل أن تثق بها تلقائيًا.",
            "صممت حل AI يشمل Input وOutput والبيانات والمخاطر المحتملة.",
            "احتفظ بتصميمك، فقد يصبح جزءًا من مشروعك النهائي في البرنامج.",
          ],

          he: [
            "חקרתם מהי בינה מלאכותית.",
            "הבחנתם בין AI לבין תוכניות עם כללים קבועים.",
            "חקרתם נתוני אימון.",
            "שיפרתם פרומפט באמצעות ניסוי.",
            "הערכתם תשובת AI במקום לסמוך עליה באופן אוטומטי.",
            "תכננתם פתרון AI הכולל קלט, פלט, נתונים וסיכונים אפשריים.",
            "שמרו את המצאת ה-AI שלכם — היא יכולה להפוך לחלק מפרויקט הסיום של הקורס.",
          ],
        },
      },

      /* =================================
         14 — REFLECTION
      ================================= */

      {
        id: "ai-reflection",

        type: "reflection",

        icon: "💬",

        title: {
          en: "Investigator's Final Note",
          ar: "الملاحظة الأخيرة للمحقق",
          he: "הערת הסיום של החוקר",
        },

        question: {
          en: "After today's investigation, what is one thing you would NEVER assume about artificial intelligence again? Explain your answer.",

          ar: "بعد تحقيق اليوم، ما الشيء الذي لن تفترضه بعد الآن عن الذكاء الاصطناعي؟ اشرح إجابتك.",
          he: "לאחר החקירה של היום, מהו דבר אחד שלעולם לא תניחו שוב לגבי בינה מלאכותית? הסבירו את תשובתכם.",
        },
      },

    ],
  },


{
  id: "tech-computer-how-it-works-02",

  track: "techExplorer",

  grades: ["4", "5", "6"],

  icon: "💻",

  activityType: "lesson",

  estimatedMinutes: 120,

  xpReward: 200,

  title: {
    en: "How Does a Computer Work?",
    ar: "كيف يعمل الحاسوب؟",
    he: "איך מחשב עובד?",
  },

  summary: {
    en: "Explore the main parts of a computer and discover how they work together to process information.",
    ar: "اكتشف الأجزاء الأساسية للحاسوب وكيف تعمل معًا لمعالجة المعلومات وتنفيذ الأوامر.",
    he: "חקרו את החלקים המרכזיים של המחשב וגלו כיצד הם פועלים יחד כדי לעבד מידע.",
  },

  sections: [

    /* =========================================
       1 — OBJECTIVES
    ========================================= */

    {
      id: "computer-objectives",

      type: "objectives",

      icon: "🎯",

      title: {
        en: "What will I learn?",
        ar: "ماذا سأتعلم؟",
        he: "מה אלמד?",
      },

      items: {
        en: [
          "Identify the main parts of a computer.",
          "Understand the difference between hardware and software.",
          "Understand the role of the CPU.",
          "Understand what RAM does.",
          "Distinguish between memory and storage.",
          "Recognize input and output devices.",
        ],

        ar: [
          "أتعرف على الأجزاء الأساسية للحاسوب.",
          "أفهم الفرق بين العتاد Hardware والبرمجيات Software.",
          "أفهم وظيفة المعالج CPU.",
          "أتعرف على وظيفة ذاكرة RAM.",
          "أميز بين الذاكرة والتخزين.",
          "أتعرف على أجهزة الإدخال والإخراج.",
        ],

        he: [
          "לזהות את החלקים המרכזיים של מחשב.",
          "להבין את ההבדל בין חומרה לתוכנה.",
          "להבין את תפקיד המעבד (CPU).",
          "להבין מה עושה זיכרון RAM.",
          "להבחין בין זיכרון לאחסון.",
          "לזהות התקני קלט ופלט.",
        ],
      },
    },


    /* =========================================
       2 — OPENING
    ========================================= */

    {
      id: "computer-opening",

      type: "question",

      icon: "💭",

      title: {
        en: "Think like a computer scientist",
        ar: "فكّر كعالم حاسوب",
        he: "חשבו כמו מדעני מחשב",
      },

      text: {
        en: "When you press a key on the keyboard, how does the letter appear on the screen almost instantly?",

        ar: "عندما تضغط على حرف في لوحة المفاتيح، كيف يظهر هذا الحرف على الشاشة خلال جزء صغير من الثانية؟",
        he: "כשאתם לוחצים על מקש במקלדת, איך האות מופיעה על המסך כמעט מיד?",
      },

      note: {
        en: "Write your own prediction. You do not need to know the correct answer yet.",

        ar: "اكتب توقعك الخاص، لا تحتاج أن تعرف الإجابة الصحيحة بعد.",
        he: "כתבו את ההשערה שלכם. עדיין אינכם צריכים לדעת את התשובה הנכונה.",
      },
    },


    /* =========================================
       3 — HARDWARE / SOFTWARE
    ========================================= */

    {
      id: "hardware-software",

      type: "content",

      icon: "🖥️",

      title: {
        en: "Hardware and Software",
        ar: "العتاد والبرمجيات",
        he: "חומרה ותוכנה",
      },

      paragraphs: {
        en: [
          "A computer system has two important parts: hardware and software.",

          "Hardware means the physical parts of the computer that we can touch, such as the keyboard, screen, processor and mouse.",

          "Software means the programs and instructions that tell the computer what to do.",

          "A computer needs both hardware and software. Hardware without software does not know what task to perform, while software needs hardware in order to run.",
        ],

        ar: [
          "يتكوّن نظام الحاسوب من قسمين أساسيين: العتاد Hardware والبرمجيات Software.",

          "العتاد هو الأجزاء المادية التي يمكننا لمسها، مثل لوحة المفاتيح والشاشة والمعالج والفأرة.",

          "البرمجيات هي البرامج والتعليمات التي تخبر الحاسوب ماذا يجب أن يفعل.",

          "الحاسوب يحتاج إلى الاثنين معًا. فالعتاد بدون برامج لا يعرف المهمة التي يجب تنفيذها، والبرامج تحتاج إلى العتاد حتى تعمل.",
        ],

        he: [
          "למערכת מחשב יש שני חלקים חשובים: חומרה ותוכנה.",
          "חומרה היא החלקים הפיזיים של המחשב שאפשר לגעת בהם, כמו מקלדת, מסך, מעבד ועכבר.",
          "תוכנה היא התוכניות וההוראות שאומרות למחשב מה לעשות.",
          "מחשב זקוק גם לחומרה וגם לתוכנה. חומרה בלי תוכנה אינה יודעת איזו משימה לבצע, ותוכנה זקוקה לחומרה כדי לפעול.",
        ],
      },
    },


    /* =========================================
       4 — EXAMPLES
    ========================================= */

    {
      id: "hardware-software-examples",

      type: "examples",

      icon: "🔍",

      title: {
        en: "Can you tell the difference?",
        ar: "هل تستطيع التمييز بينهما؟",
        he: "האם תוכלו להבדיל ביניהן?",
      },

      items: [
        {
          icon: "⌨️",

          title: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
            he: "מקלדת",
          },

          text: {
            en: "Hardware — a physical device that sends information to the computer.",
            ar: "Hardware — جهاز مادي يرسل المعلومات إلى الحاسوب.",
            he: "חומרה — התקן פיזי ששולח מידע למחשב.",
          },
        },

        {
          icon: "🌐",

          title: {
            en: "Web Browser",
            ar: "متصفح الإنترنت",
            he: "דפדפן אינטרנט",
          },

          text: {
            en: "Software — a program used to visit websites.",
            ar: "Software — برنامج نستخدمه لزيارة مواقع الإنترنت.",
            he: "תוכנה — תוכנית המשמשת לגלישה באתרים.",
          },
        },

        {
          icon: "🖱️",

          title: {
            en: "Mouse",
            ar: "الفأرة",
            he: "עכבר",
          },

          text: {
            en: "Hardware — an input device.",
            ar: "Hardware — جهاز إدخال.",
            he: "חומרה — התקן קלט.",
          },
        },

        {
          icon: "🎮",

          title: {
            en: "Game",
            ar: "لعبة حاسوب",
            he: "משחק",
          },

          text: {
            en: "Software — instructions executed by the computer.",
            ar: "Software — برنامج يحتوي على تعليمات ينفذها الحاسوب.",
            he: "תוכנה — הוראות שהמחשב מבצע.",
          },
        },

        {
          icon: "🖥️",

          title: {
            en: "Monitor",
            ar: "الشاشة",
            he: "מסך",
          },

          text: {
            en: "Hardware — displays information to the user.",
            ar: "Hardware — تعرض المعلومات للمستخدم.",
            he: "חומרה — מציגה מידע למשתמש.",
          },
        },

        {
          icon: "📝",

          title: {
            en: "Text Editor",
            ar: "برنامج كتابة",
            he: "עורך טקסט",
          },

          text: {
            en: "Software — used to create and edit text.",
            ar: "Software — برنامج لإنشاء النصوص وتعديلها.",
            he: "תוכנה — משמשת ליצירה ולעריכה של טקסט.",
          },
        },
      ],
    },


    /* =========================================
       5 — QUIZ
    ========================================= */

    {
      id: "hardware-quiz",

      type: "multipleChoice",

      icon: "🧩",

      title: {
        en: "Quick Challenge",
        ar: "تحدٍ سريع",
        he: "אתגר מהיר",
      },

      question: {
        en: "Which one is software?",
        ar: "أي واحد من التالي هو Software؟",
        he: "איזה מהבאים הוא תוכנה?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
            he: "מקלדת",
          },
        },

        {
          id: "b",

          text: {
            en: "Google Chrome",
            ar: "Google Chrome",
            he: "Google Chrome",
          },
        },

        {
          id: "c",

          text: {
            en: "Monitor",
            ar: "الشاشة",
            he: "מסך",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Google Chrome is a program, so it is software.",

        ar: "صحيح! Google Chrome هو برنامج، ولذلك يعتبر Software.",
        he: "נכון! Google Chrome הוא תוכנית ולכן הוא תוכנה.",
      },
    },


    /* =========================================
       6 — INPUT
    ========================================= */

    {
      id: "input-devices",

      type: "content",

      icon: "⌨️",

      title: {
        en: "Input Devices",
        ar: "أجهزة الإدخال",
        he: "התקני קלט",
      },

      paragraphs: {
        en: [
          "Input devices allow us to send information to a computer.",

          "When you type using a keyboard, move a mouse, speak into a microphone or take a picture with a camera, information is entering the computer.",

          "We call this INPUT.",
        ],

        ar: [
          "أجهزة الإدخال تسمح لنا بإرسال المعلومات إلى الحاسوب.",

          "عندما تكتب بلوحة المفاتيح، تحرّك الفأرة، تتحدث عبر الميكروفون أو تلتقط صورة بالكاميرا، فإن المعلومات تدخل إلى الحاسوب.",

          "هذه العملية تسمى INPUT أو إدخال.",
        ],

        he: [
          "התקני קלט מאפשרים לנו לשלוח מידע למחשב.",
          "כשאתם מקלידים במקלדת, מזיזים עכבר, מדברים למיקרופון או מצלמים במצלמה, מידע נכנס למחשב.",
          "לזה אנו קוראים קלט (INPUT).",
        ],
      },
    },


    /* =========================================
       7 — INPUT/OUTPUT EXAMPLES
    ========================================= */

    {
      id: "io-examples",

      type: "examples",

      icon: "🔄",

      title: {
        en: "Input and Output",
        ar: "الإدخال والإخراج",
        he: "קלט ופלט",
      },

      items: [
        {
          icon: "⌨️",

          title: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
            he: "מקלדת",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
            he: "קלט",
          },
        },

        {
          icon: "🎤",

          title: {
            en: "Microphone",
            ar: "الميكروفون",
            he: "מיקרופון",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
            he: "קלט",
          },
        },

        {
          icon: "🖥️",

          title: {
            en: "Screen",
            ar: "الشاشة",
            he: "מסך",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
            he: "פלט",
          },
        },

        {
          icon: "🔊",

          title: {
            en: "Speakers",
            ar: "مكبرات الصوت",
            he: "רמקולים",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
            he: "פלט",
          },
        },

        {
          icon: "📷",

          title: {
            en: "Camera",
            ar: "الكاميرا",
            he: "מצלמה",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
            he: "קלט",
          },
        },

        {
          icon: "🖨️",

          title: {
            en: "Printer",
            ar: "الطابعة",
            he: "מדפסת",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
            he: "פלט",
          },
        },
      ],
    },


    /* =========================================
       8 — I/O QUIZ
    ========================================= */

    {
      id: "io-quiz",

      type: "multipleChoice",

      icon: "🎯",

      title: {
        en: "Input or Output?",
        ar: "إدخال أم إخراج؟",
        he: "קלט או פלט?",
      },

      question: {
        en: "Which device sends information FROM the computer TO the user?",

        ar: "أي جهاز ينقل المعلومات من الحاسوب إلى المستخدم؟",
        he: "איזה התקן שולח מידע מהמחשב אל המשתמש?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
            he: "מקלדת",
          },
        },

        {
          id: "b",

          text: {
            en: "Microphone",
            ar: "الميكروفون",
            he: "מיקרופון",
          },
        },

        {
          id: "c",

          text: {
            en: "Monitor",
            ar: "الشاشة",
            he: "מסך",
          },
        },
      ],

      correctAnswer: "c",

      explanation: {
        en: "Exactly! A monitor is an output device because the computer sends visual information to it.",

        ar: "بالضبط! الشاشة هي جهاز إخراج لأن الحاسوب يرسل إليها المعلومات ليعرضها للمستخدم.",
        he: "בדיוק! מסך הוא התקן פלט משום שהמחשב שולח אליו מידע חזותי.",
      },
    },


    /* =========================================
       9 — CPU
    ========================================= */

    {
      id: "cpu",

      type: "content",

      icon: "🧠",

      title: {
        en: "The CPU — The Computer's Processor",
        ar: "CPU — معالج الحاسوب",
        he: "ה-CPU — המעבד של המחשב",
      },

      paragraphs: {
        en: [
          "The CPU stands for Central Processing Unit.",

          "It is responsible for executing instructions and performing calculations.",

          "When a program gives the computer instructions, the CPU processes those instructions step by step.",

          "The CPU can perform millions or even billions of operations every second.",
        ],

        ar: [
          "CPU هو اختصار لـ Central Processing Unit أي وحدة المعالجة المركزية.",

          "المعالج مسؤول عن تنفيذ التعليمات وإجراء العمليات الحسابية.",

          "عندما يعطي البرنامج تعليمات للحاسوب، يقوم CPU بمعالجة هذه التعليمات خطوة بعد خطوة.",

          "يمكن للمعالج تنفيذ ملايين أو حتى مليارات العمليات في الثانية الواحدة.",
        ],

        he: [
          "CPU הוא קיצור של Central Processing Unit — יחידת העיבוד המרכזית.",
          "הוא אחראי לביצוע הוראות ולביצוע חישובים.",
          "כאשר תוכנה נותנת למחשב הוראות, ה-CPU מעבד אותן שלב אחר שלב.",
          "ה-CPU יכול לבצע מיליוני ואף מיליארדי פעולות בכל שנייה.",
        ],
      },
    },


    /* =========================================
       10 — CPU ACTIVITY
    ========================================= */

    {
      id: "cpu-human-activity",

      type: "task",

      icon: "🤖",

      title: {
        en: "Become the CPU!",
        ar: "كن أنت الـCPU!",
        he: "הפכו ל-CPU!",
      },

      introduction: {
        en: "Imagine that YOU are the processor. You must execute instructions exactly in order.",

        ar: "تخيّل أنك أنت المعالج CPU. يجب أن تنفذ التعليمات بالترتيب تمامًا.",
        he: "דמיינו שאתם המעבד. עליכם לבצע את ההוראות בדיוק לפי הסדר.",
      },

      steps: {
        en: [
          "Start with the number 5.",
          "Add 3.",
          "Multiply the result by 2.",
          "Subtract 4.",
          "Write the final result.",
        ],

        ar: [
          "ابدأ بالرقم 5.",
          "أضف إليه 3.",
          "اضرب الناتج في 2.",
          "اطرح 4.",
          "اكتب النتيجة النهائية.",
        ],

        he: [
          "התחילו במספר 5.",
          "הוסיפו 3.",
          "כפלו את התוצאה ב-2.",
          "החסירו 4.",
          "כתבו את התוצאה הסופית.",
        ],
      },

      answerPrompt: {
        en: "What result did your CPU produce?",
        ar: "ما هي النتيجة التي حصل عليها الـCPU الخاص بك؟",
        he: "איזו תוצאה הפיק ה-CPU שלכם?",
      },
    },


    /* =========================================
       11 — RAM
    ========================================= */

    {
      id: "ram",

      type: "content",

      icon: "⚡",

      title: {
        en: "RAM — Temporary Working Memory",
        ar: "RAM — ذاكرة العمل المؤقتة",
        he: "RAM — זיכרון עבודה זמני",
      },

      paragraphs: {
        en: [
          "RAM is the computer's short-term working memory.",

          "When you open a program, part of that program is loaded into RAM so the computer can access it quickly.",

          "More RAM allows the computer to work with more programs and information at the same time.",

          "RAM is temporary. When the computer is turned off, the information stored in RAM disappears.",
        ],

        ar: [
          "RAM هي ذاكرة العمل قصيرة المدى في الحاسوب.",

          "عندما تفتح برنامجًا، يتم تحميل جزء من البرنامج إلى RAM حتى يستطيع الحاسوب الوصول إليه بسرعة.",

          "كلما كانت كمية RAM أكبر، يستطيع الحاسوب التعامل مع برامج ومعلومات أكثر في الوقت نفسه.",

          "RAM ذاكرة مؤقتة، وعندما يتم إطفاء الحاسوب تختفي المعلومات المخزنة فيها.",
        ],

        he: [
          "RAM הוא זיכרון העבודה קצר הטווח של המחשב.",
          "כאשר פותחים תוכנה, חלק ממנה נטען ל-RAM כדי שהמחשב יוכל לגשת אליו במהירות.",
          "יותר RAM מאפשר למחשב לעבוד עם יותר תוכנות ומידע בו-זמנית.",
          "RAM הוא זמני. כאשר מכבים את המחשב, המידע המאוחסן ב-RAM נעלם.",
        ],
      },
    },


    /* =========================================
       12 — STORAGE
    ========================================= */

    {
      id: "storage",

      type: "content",

      icon: "💾",

      title: {
        en: "Storage — Where Files Stay",
        ar: "التخزين — أين تبقى الملفات؟",
        he: "אחסון — המקום שבו הקבצים נשמרים",
      },

      paragraphs: {
        en: [
          "Storage is used to keep information for a long time.",

          "Your pictures, documents, games and programs are saved on storage devices.",

          "Common storage technologies include SSD and hard drives.",

          "Unlike RAM, information in storage normally remains even after the computer is turned off.",
        ],

        ar: [
          "يُستخدم التخزين للاحتفاظ بالمعلومات لفترة طويلة.",

          "الصور والملفات والألعاب والبرامج يتم حفظها في وحدات التخزين.",

          "من أشهر أنواع التخزين SSD والقرص الصلب Hard Drive.",

          "على عكس RAM، تبقى المعلومات في وحدة التخزين حتى بعد إطفاء الحاسوب.",
        ],

        he: [
          "אחסון משמש לשמירת מידע לאורך זמן.",
          "התמונות, המסמכים, המשחקים והתוכנות שלכם נשמרים בהתקני אחסון.",
          "טכנולוגיות אחסון נפוצות כוללות SSD וכוננים קשיחים.",
          "בניגוד ל-RAM, מידע באחסון בדרך כלל נשאר גם לאחר כיבוי המחשב.",
        ],
      },
    },


    /* =========================================
       13 — RAM VS STORAGE
    ========================================= */

    {
      id: "ram-storage-quiz",

      type: "multipleChoice",

      icon: "🧩",

      title: {
        en: "RAM or Storage?",
        ar: "RAM أم التخزين؟",
        he: "RAM או אחסון?",
      },

      question: {
        en: "Where should your homework file be saved if you want it to remain after the computer is turned off?",

        ar: "أين يجب حفظ ملف واجبك إذا أردت أن يبقى موجودًا بعد إطفاء الحاسوب؟",
        he: "היכן כדאי לשמור את קובץ שיעורי הבית כדי שיישאר גם לאחר כיבוי המחשב?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "RAM",
            ar: "RAM",
            he: "RAM",
          },
        },

        {
          id: "b",

          text: {
            en: "Storage / SSD",
            ar: "وحدة التخزين / SSD",
            he: "אחסון / SSD",
          },
        },

        {
          id: "c",

          text: {
            en: "CPU",
            ar: "CPU",
            he: "CPU",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Files that need to remain after shutdown must be stored on permanent storage such as an SSD.",

        ar: "صحيح! الملفات التي نريد الاحتفاظ بها بعد إطفاء الجهاز يجب أن تُحفظ في وحدة تخزين مثل SSD.",
        he: "נכון! קבצים שצריכים להישאר לאחר כיבוי המחשב חייבים להישמר באחסון קבוע כמו SSD.",
      },
    },


    /* =========================================
       14 — COMPLETE PROCESS
    ========================================= */

    {
      id: "computer-process",

      type: "content",

      icon: "🔄",

      title: {
        en: "How Everything Works Together",
        ar: "كيف تعمل جميع الأجزاء معًا؟",
        he: "איך הכול עובד יחד",
      },

      paragraphs: {
        en: [
          "Let's return to our first question: What happens when you press a key?",

          "1. The keyboard sends the key as INPUT.",

          "2. The computer receives the information.",

          "3. The CPU processes the instruction.",

          "4. RAM temporarily holds the information needed by the program.",

          "5. The result is sent to the screen as OUTPUT.",

          "This entire process happens extremely quickly.",
        ],

        ar: [
          "لنعد الآن إلى سؤالنا في بداية الدرس: ماذا يحدث عندما تضغط على حرف في لوحة المفاتيح؟",

          "1. لوحة المفاتيح ترسل الحرف كـ INPUT.",

          "2. يستقبل الحاسوب المعلومة.",

          "3. يقوم CPU بمعالجة الأمر.",

          "4. تحتفظ RAM بالمعلومات التي يحتاجها البرنامج بشكل مؤقت.",

          "5. يتم إرسال النتيجة إلى الشاشة كـ OUTPUT.",

          "كل هذه العملية تحدث بسرعة هائلة.",
        ],

        he: [
          "נחזור לשאלה הראשונה שלנו: מה קורה כשלוחצים על מקש?",
          "1. המקלדת שולחת את המקש כקלט.",
          "2. המחשב מקבל את המידע.",
          "3. ה-CPU מעבד את ההוראה.",
          "4. ה-RAM מחזיק זמנית את המידע שהתוכנה צריכה.",
          "5. התוצאה נשלחת למסך כפלט.",
          "כל התהליך הזה מתרחש במהירות עצומה.",
        ],
      },
    },


    /* =========================================
       15 — COMPUTER DETECTIVE TASK
    ========================================= */

    {
      id: "computer-detective",

      type: "task",

      icon: "🕵️",

      title: {
        en: "Computer Detective Challenge",
        ar: "تحدي محقق الحاسوب",
        he: "אתגר בלש המחשב",
      },

      introduction: {
        en: "Choose one action you perform on a computer and explain what parts of the computer are involved.",

        ar: "اختر عملية واحدة تقوم بها على الحاسوب واشرح ما الأجزاء التي تشارك فيها.",
        he: "בחרו פעולה אחת שאתם מבצעים במחשב והסבירו אילו חלקים במחשב משתתפים בה.",
      },

      steps: {
        en: [
          "Choose an action: typing, playing a game, watching a video, recording your voice or drawing.",
          "Identify the input device.",
          "Explain what the CPU might process.",
          "Think about what could be stored in RAM.",
          "Identify the output device.",
        ],

        ar: [
          "اختر عملية: كتابة، لعب لعبة، مشاهدة فيديو، تسجيل صوت أو رسم.",
          "حدد جهاز الإدخال المستخدم.",
          "اشرح ماذا قد يعالج CPU.",
          "فكّر بما يمكن أن يكون موجودًا في RAM.",
          "حدد جهاز الإخراج المستخدم.",
        ],

        he: [
          "בחרו פעולה: הקלדה, משחק, צפייה בסרטון, הקלטת קול או ציור.",
          "זהו את התקן הקלט.",
          "הסבירו מה ה-CPU עשוי לעבד.",
          "חשבו מה יכול להישמר זמנית ב-RAM.",
          "זהו את התקן הפלט.",
        ],
      },

      answerPrompt: {
        en: "Describe your chosen action and how the computer processes it:",

        ar: "اشرح العملية التي اخترتها وكيف يعالجها الحاسوب:",
        he: "תארו את הפעולה שבחרתם וכיצד המחשב מעבד אותה:",
      },
    },


    /* =========================================
       16 — FINAL QUIZ
    ========================================= */

    {
      id: "computer-final-quiz",

      type: "multipleChoice",

      icon: "🏆",

      title: {
        en: "Final Challenge",
        ar: "التحدي النهائي",
        he: "האתגר הסופי",
      },

      question: {
        en: "Which sequence best describes how a computer handles information?",

        ar: "أي ترتيب يصف بشكل أفضل طريقة تعامل الحاسوب مع المعلومات؟",
        he: "איזה רצף מתאר בצורה הטובה ביותר כיצד מחשב מטפל במידע?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Output → Input → Process",
            ar: "Output ← Input ← Process",
            he: "פלט → קלט → עיבוד",
          },
        },

        {
          id: "b",

          text: {
            en: "Input → Process → Output",
            ar: "Input → Process → Output",
            he: "קלט → עיבוד → פלט",
          },
        },

        {
          id: "c",

          text: {
            en: "Process → Output → Input",
            ar: "Process → Output → Input",
            he: "עיבוד → פלט → קלט",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Excellent! Computers commonly receive input, process the information and then produce output.",

        ar: "ممتاز! يستقبل الحاسوب المعلومات كإدخال، ثم يعالجها، وبعد ذلك يعرض النتيجة كإخراج.",
        he: "מצוין! מחשבים בדרך כלל מקבלים קלט, מעבדים את המידע ואז מפיקים פלט.",
      },
    },


    /* =========================================
       17 — SUMMARY
    ========================================= */

    {
      id: "computer-summary",

      type: "summary",

      icon: "🌟",

      title: {
        en: "What did we learn?",
        ar: "ماذا تعلمنا؟",
        he: "מה למדנו?",
      },

      items: {
        en: [
          "Hardware is the physical part of a computer.",
          "Software contains programs and instructions.",
          "Input devices send information to the computer.",
          "The CPU processes instructions.",
          "RAM is temporary working memory.",
          "Storage keeps files for a longer time.",
          "Output devices present the result to the user.",
        ],

        ar: [
          "Hardware هو الأجزاء المادية للحاسوب.",
          "Software هو البرامج والتعليمات.",
          "أجهزة الإدخال ترسل المعلومات إلى الحاسوب.",
          "CPU يقوم بمعالجة التعليمات.",
          "RAM هي ذاكرة عمل مؤقتة.",
          "التخزين يحتفظ بالملفات لفترة طويلة.",
          "أجهزة الإخراج تعرض النتيجة للمستخدم.",
        ],

        he: [
          "חומרה היא החלק הפיזי של המחשב.",
          "תוכנה כוללת תוכניות והוראות.",
          "התקני קלט שולחים מידע למחשב.",
          "ה-CPU מעבד הוראות.",
          "RAM הוא זיכרון עבודה זמני.",
          "אחסון שומר קבצים לאורך זמן.",
          "התקני פלט מציגים את התוצאה למשתמש.",
        ],
      },
    },


    /* =========================================
       18 — REFLECTION
    ========================================= */

    {
      id: "computer-reflection",

      type: "reflection",

      icon: "💬",

      title: {
        en: "Before you finish...",
        ar: "قبل أن تنهي الدرس...",
        he: "לפני שמסיימים...",
      },

      question: {
        en: "Which computer component was the most interesting to you, and why?",

        ar: "أي جزء من أجزاء الحاسوب كان الأكثر إثارة للاهتمام بالنسبة لك؟ ولماذا؟",
        he: "איזה רכיב במחשב היה הכי מעניין עבורכם, ולמה?",
      },
    },


    
  ],
},
{
  id: "tech-how-internet-works-03",

  track: "techExplorer",

  grades: ["4", "5", "6"],

  icon: "🌐",

  activityType: "lesson",

  estimatedMinutes: 120,

  xpReward: 200,

  title: {
    en: "How Does the Internet Work?",
    ar: "كيف يعمل الإنترنت؟",
    he: "איך האינטרנט עובד?",
  },

  summary: {
    en: "Discover how devices connect, how information travels across networks, and what happens when you open a website.",

    ar: "اكتشف كيف تتصل الأجهزة ببعضها، وكيف تنتقل المعلومات عبر الشبكات، وماذا يحدث عندما تفتح موقعًا على الإنترنت.",
    he: "גלו כיצד מכשירים מתחברים, איך מידע עובר ברשתות ומה קורה כשפותחים אתר אינטרנט.",
  },

  sections: [

    /* =========================================
       1 — OBJECTIVES
    ========================================= */

    {
      id: "internet-objectives",

      type: "objectives",

      icon: "🎯",

      title: {
        en: "What will I learn?",
        ar: "ماذا سأتعلم؟",
        he: "מה אלמד?",
      },

      items: {
        en: [
          "Understand what the Internet is.",
          "Understand the difference between the Internet and the Web.",
          "Learn how devices connect to a network.",
          "Understand the role of routers.",
          "Discover what servers do.",
          "Understand how data travels in packets.",
          "Learn the basic idea of IP addresses and DNS.",
        ],

        ar: [
          "أفهم ما هو الإنترنت.",
          "أميز بين الإنترنت والويب.",
          "أتعرف على كيفية اتصال الأجهزة بالشبكة.",
          "أفهم وظيفة جهاز Router.",
          "أتعرف على وظيفة الخوادم Servers.",
          "أفهم كيف تنتقل البيانات على شكل حزم Packets.",
          "أتعرف على فكرة عناوين IP وDNS.",
        ],

        he: [
          "להבין מהו האינטרנט.",
          "להבין את ההבדל בין האינטרנט לבין ה-Web.",
          "ללמוד כיצד מכשירים מתחברים לרשת.",
          "להבין את תפקיד הנתבים.",
          "לגלות מה עושים שרתים.",
          "להבין כיצד נתונים עוברים בחבילות.",
          "ללמוד את הרעיון הבסיסי של כתובות IP ו-DNS.",
        ],
      },
    },


    /* =========================================
       2 — OPENING QUESTION
    ========================================= */

    {
      id: "internet-opening-question",

      type: "question",

      icon: "💭",

      title: {
        en: "A message around the world",
        ar: "رسالة تسافر حول العالم",
        he: "הודעה מסביב לעולם",
      },

      text: {
        en: "Imagine you send a photo to a friend who lives in another country. How do you think the photo reaches their phone?",

        ar: "تخيّل أنك أرسلت صورة لصديق يعيش في دولة أخرى. كيف تعتقد أن الصورة تصل من هاتفك إلى هاتفه؟",
        he: "דמיינו שאתם שולחים תמונה לחבר שגר במדינה אחרת. איך לדעתכם התמונה מגיעה לטלפון שלו?",
      },

      note: {
        en: "Write your prediction. There is no problem if you do not know the exact answer yet.",

        ar: "اكتب توقعك. لا مشكلة إن لم تعرف الإجابة الدقيقة بعد.",
        he: "כתבו את ההשערה שלכם. אין בעיה אם עדיין אינכם יודעים את התשובה המדויקת.",
      },
    },


    /* =========================================
       3 — WHAT IS INTERNET
    ========================================= */

    {
      id: "what-is-internet",

      type: "content",

      icon: "🌍",

      title: {
        en: "What Is the Internet?",
        ar: "ما هو الإنترنت؟",
        he: "מהו האינטרנט?",
      },

      paragraphs: {
        en: [
          "The Internet is a huge network of connected networks.",

          "Computers, phones, servers and many other devices can communicate through these networks.",

          "The Internet is not one computer and it is not located in one building.",

          "It is a worldwide system connecting millions of networks and billions of devices.",
        ],

        ar: [
          "الإنترنت هو شبكة ضخمة تتكوّن من شبكات كثيرة متصلة ببعضها.",

          "يمكن للحواسيب والهواتف والخوادم والعديد من الأجهزة الأخرى التواصل من خلال هذه الشبكات.",

          "الإنترنت ليس حاسوبًا واحدًا، وليس موجودًا داخل مبنى واحد.",

          "بل هو نظام عالمي يربط ملايين الشبكات ومليارات الأجهزة.",
        ],

        he: [
          "האינטרנט הוא רשת ענקית של רשתות מחוברות.",
          "מחשבים, טלפונים, שרתים ומכשירים רבים אחרים יכולים לתקשר דרך הרשתות האלה.",
          "האינטרנט אינו מחשב אחד ואינו נמצא בבניין אחד.",
          "זהו מערך עולמי המחבר מיליוני רשתות ומיליארדי מכשירים.",
        ],
      },
    },


    /* =========================================
       4 — INTERNET VS WEB
    ========================================= */

    {
      id: "internet-vs-web",

      type: "content",

      icon: "🕸️",

      title: {
        en: "Internet or Web?",
        ar: "الإنترنت أم الويب؟",
        he: "אינטרנט או Web?",
      },

      paragraphs: {
        en: [
          "The Internet and the World Wide Web are related, but they are not exactly the same thing.",

          "The Internet is the network infrastructure that allows devices to communicate.",

          "The Web is one service that uses the Internet. Websites and web pages are part of the Web.",

          "Other services such as online games, video calls and email also use the Internet.",
        ],

        ar: [
          "الإنترنت والـWorld Wide Web مرتبطان ببعضهما، لكنهما ليسا الشيء نفسه تمامًا.",

          "الإنترنت هو البنية والشبكات التي تسمح للأجهزة بالتواصل.",

          "أما الويب فهو إحدى الخدمات التي تعمل باستخدام الإنترنت، وتشمل مواقع وصفحات الإنترنت.",

          "خدمات أخرى مثل الألعاب عبر الإنترنت ومكالمات الفيديو والبريد الإلكتروني تستخدم الإنترنت أيضًا.",
        ],

        he: [
          "האינטרנט וה-World Wide Web קשורים זה לזה, אבל הם אינם בדיוק אותו הדבר.",
          "האינטרנט הוא תשתית הרשת שמאפשרת למכשירים לתקשר.",
          "ה-Web הוא שירות אחד שמשתמש באינטרנט. אתרים ודפי אינטרנט הם חלק מה-Web.",
          "שירותים אחרים כמו משחקים מקוונים, שיחות וידאו ודואר אלקטרוני משתמשים גם הם באינטרנט.",
        ],
      },
    },


    /* =========================================
       5 — QUIZ
    ========================================= */

    {
      id: "internet-web-quiz",

      type: "multipleChoice",

      icon: "🧩",

      title: {
        en: "Quick Challenge",
        ar: "تحدٍ سريع",
        he: "אתגר מהיר",
      },

      question: {
        en: "Which statement is correct?",

        ar: "أي جملة من التالية صحيحة؟",
        he: "איזה משפט נכון?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "The Internet and the Web are always exactly the same thing.",
            ar: "الإنترنت والويب هما الشيء نفسه تمامًا.",
            he: "האינטרנט וה-Web הם תמיד בדיוק אותו הדבר.",
          },
        },

        {
          id: "b",

          text: {
            en: "The Web is one service that uses the Internet.",
            ar: "الويب هو إحدى الخدمات التي تستخدم الإنترنت.",
            he: "ה-Web הוא שירות אחד שמשתמש באינטרנט.",
          },
        },

        {
          id: "c",

          text: {
            en: "The Internet only contains websites.",
            ar: "الإنترنت يحتوي فقط على مواقع.",
            he: "האינטרנט כולל רק אתרי אינטרנט.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! The Web uses the Internet, but many other services use the Internet too.",

        ar: "صحيح! الويب يستخدم الإنترنت، لكن توجد خدمات أخرى كثيرة تستخدم الإنترنت أيضًا.",
        he: "נכון! ה-Web משתמש באינטרנט, אבל גם שירותים רבים אחרים משתמשים בו.",
      },
    },


    /* =========================================
       6 — NETWORK
    ========================================= */

    {
      id: "computer-network",

      type: "content",

      icon: "🔗",

      title: {
        en: "What Is a Network?",
        ar: "ما هي الشبكة؟",
        he: "מהי רשת?",
      },

      paragraphs: {
        en: [
          "A network is a group of devices that can communicate with each other.",

          "For example, computers and phones inside a school or home can be connected to the same network.",

          "Devices may connect using cables or wireless technologies such as Wi-Fi.",

          "Your home network can then connect to the larger Internet.",
        ],

        ar: [
          "الشبكة هي مجموعة أجهزة تستطيع التواصل مع بعضها.",

          "مثلًا، يمكن للحواسيب والهواتف داخل المدرسة أو المنزل أن تكون متصلة بالشبكة نفسها.",

          "قد تتصل الأجهزة باستخدام كابلات أو باستخدام تقنيات لاسلكية مثل Wi-Fi.",

          "بعد ذلك تستطيع شبكة المنزل الاتصال بالإنترنت الأكبر.",
        ],

        he: [
          "רשת היא קבוצה של מכשירים שיכולים לתקשר זה עם זה.",
          "לדוגמה, מחשבים וטלפונים בבית ספר או בבית יכולים להיות מחוברים לאותה רשת.",
          "מכשירים יכולים להתחבר באמצעות כבלים או טכנולוגיות אלחוטיות כמו Wi-Fi.",
          "הרשת הביתית שלכם יכולה להתחבר לאחר מכן לאינטרנט הגדול יותר.",
        ],
      },
    },


    /* =========================================
       7 — HOME NETWORK EXAMPLES
    ========================================= */

    {
      id: "home-network-examples",

      type: "examples",

      icon: "🏠",

      title: {
        en: "Devices on a Home Network",
        ar: "أجهزة في شبكة منزلية",
        he: "מכשירים ברשת ביתית",
      },

      items: [
        {
          icon: "📱",

          title: {
            en: "Smartphone",
            ar: "هاتف",
            he: "טלפון חכם",
          },

          text: {
            en: "Can connect through Wi-Fi.",
            ar: "يمكنه الاتصال عبر Wi-Fi.",
            he: "יכול להתחבר באמצעות Wi-Fi.",
          },
        },

        {
          icon: "💻",

          title: {
            en: "Laptop",
            ar: "حاسوب محمول",
            he: "מחשב נייד",
          },

          text: {
            en: "Can use Wi-Fi or a network cable.",
            ar: "يمكنه استخدام Wi-Fi أو كابل شبكة.",
            he: "יכול להשתמש ב-Wi-Fi או בכבל רשת.",
          },
        },

        {
          icon: "📺",

          title: {
            en: "Smart TV",
            ar: "تلفاز ذكي",
            he: "טלוויזיה חכמה",
          },

          text: {
            en: "Uses the network to stream videos.",
            ar: "يستخدم الشبكة لمشاهدة الفيديو.",
            he: "משתמשת ברשת לצפייה בסרטונים.",
          },
        },

        {
          icon: "🎮",

          title: {
            en: "Game Console",
            ar: "جهاز ألعاب",
            he: "קונסולת משחקים",
          },

          text: {
            en: "Uses the network for online games.",
            ar: "يستخدم الشبكة للألعاب عبر الإنترنت.",
            he: "משתמשת ברשת למשחקים מקוונים.",
          },
        },
      ],
    },


    /* =========================================
       8 — ROUTER
    ========================================= */

    {
      id: "router",

      type: "content",

      icon: "📡",

      title: {
        en: "Meet the Router",
        ar: "تعرّف على الـRouter",
        he: "הכירו את הנתב",
      },

      paragraphs: {
        en: [
          "A router is an important network device.",

          "It helps send data from one network toward another network.",

          "In a home, the router usually connects your devices to your Internet connection.",

          "You can think of a router like a traffic director that helps information travel toward the correct destination.",
        ],

        ar: [
          "الـRouter هو جهاز مهم جدًا في الشبكات.",

          "يساعد في إرسال البيانات من شبكة إلى شبكة أخرى.",

          "في المنزل، يربط الـRouter عادةً أجهزتك باتصال الإنترنت.",

          "يمكن تشبيه الـRouter بمنظم حركة يساعد المعلومات على التوجه نحو الوجهة الصحيحة.",
        ],

        he: [
          "נתב הוא התקן רשת חשוב.",
          "הוא מסייע לשלוח נתונים מרשת אחת לעבר רשת אחרת.",
          "בבית, הנתב בדרך כלל מחבר את המכשירים שלכם לחיבור האינטרנט.",
          "אפשר לחשוב על נתב כמו על מנהל תנועה שעוזר למידע לנוע לעבר היעד הנכון.",
        ],
      },
    },


    /* =========================================
       9 — ROUTER CHALLENGE
    ========================================= */

    {
      id: "router-challenge",

      type: "multipleChoice",

      icon: "📡",

      title: {
        en: "Router Challenge",
        ar: "تحدي الـRouter",
        he: "אתגר הנתב",
      },

      question: {
        en: "What is one important job of a router?",

        ar: "ما إحدى الوظائف المهمة للـRouter؟",
        he: "מהו תפקיד חשוב אחד של נתב?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Printing documents",
            ar: "طباعة المستندات",
            he: "הדפסת מסמכים",
          },
        },

        {
          id: "b",

          text: {
            en: "Directing data between networks",
            ar: "توجيه البيانات بين الشبكات",
            he: "ניתוב נתונים בין רשתות",
          },
        },

        {
          id: "c",

          text: {
            en: "Creating keyboard letters",
            ar: "إنشاء حروف لوحة المفاتيح",
            he: "יצירת אותיות במקלדת",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Exactly! Routers help direct network traffic toward its destination.",

        ar: "بالضبط! أجهزة Router تساعد في توجيه حركة البيانات نحو وجهتها.",
        he: "בדיוק! נתבים מסייעים לנתב תעבורת רשת אל היעד שלה.",
      },
    },


    /* =========================================
       10 — CLIENT AND SERVER
    ========================================= */

    {
      id: "client-server",

      type: "content",

      icon: "🖥️",

      title: {
        en: "Client and Server",
        ar: "Client وServer",
        he: "לקוח ושרת",
      },

      paragraphs: {
        en: [
          "When you open a website, your device often acts as a client.",

          "A client requests information or a service.",

          "A server is a computer or system that provides information or services to other devices.",

          "For example, your browser can request a web page from a web server, and the server sends the page data back.",
        ],

        ar: [
          "عندما تفتح موقعًا، يعمل جهازك غالبًا كـClient.",

          "الـClient يطلب معلومة أو خدمة.",

          "الـServer هو حاسوب أو نظام يوفر معلومات أو خدمات للأجهزة الأخرى.",

          "مثلًا، يطلب المتصفح صفحة من Web Server، ثم يرسل الخادم بيانات الصفحة إلى جهازك.",
        ],

        he: [
          "כשאתם פותחים אתר, המכשיר שלכם פועל לעיתים קרובות כלקוח.",
          "לקוח מבקש מידע או שירות.",
          "שרת הוא מחשב או מערכת שמספקים מידע או שירותים למכשירים אחרים.",
          "לדוגמה, הדפדפן שלכם יכול לבקש דף משרת Web, והשרת שולח בחזרה את נתוני הדף.",
        ],
      },
    },


    /* =========================================
       11 — CLIENT SERVER TASK
    ========================================= */

    {
      id: "restaurant-server-task",

      type: "task",

      icon: "🍽️",

      title: {
        en: "Client and Server Role Play",
        ar: "تمثيل Client وServer",
        he: "משחק תפקידים: לקוח ושרת",
      },

      introduction: {
        en: "Imagine a restaurant. A customer asks for food and the kitchen prepares the request. How is this similar to a client and a server?",

        ar: "تخيّل مطعمًا. الزبون يطلب وجبة، والمطبخ يستقبل الطلب ويجهزه. كيف يشبه هذا مفهوم Client وServer؟",
        he: "דמיינו מסעדה. לקוח מבקש אוכל והמטבח מכין את ההזמנה. איך זה דומה ללקוח ולשרת?",
      },

      steps: {
        en: [
          "Think of the customer as the client.",
          "Think of the kitchen as the server.",
          "The client sends a request.",
          "The server processes the request.",
          "The result returns to the client.",
        ],

        ar: [
          "اعتبر الزبون هو Client.",
          "اعتبر المطبخ هو Server.",
          "يرسل الـClient طلبًا.",
          "يعالج الـServer الطلب.",
          "تعود النتيجة إلى الـClient.",
        ],

        he: [
          "חשבו על הלקוח במסעדה כלקוח (Client).",
          "חשבו על המטבח כשרת (Server).",
          "הלקוח שולח בקשה.",
          "השרת מעבד את הבקשה.",
          "התוצאה חוזרת ללקוח.",
        ],
      },

      answerPrompt: {
        en: "Give your own example of a client requesting something from a server.",

        ar: "اكتب مثالًا من عندك على Client يرسل طلبًا إلى Server.",
        he: "תנו דוגמה משלכם ללקוח שמבקש משהו משרת.",
      },
    },


    /* =========================================
       12 — DATA PACKETS
    ========================================= */

    {
      id: "data-packets",

      type: "content",

      icon: "📦",

      title: {
        en: "Data Travels in Packets",
        ar: "البيانات تسافر في Packets",
        he: "נתונים עוברים בחבילות",
      },

      paragraphs: {
        en: [
          "Large pieces of information are usually not sent across networks as one giant block.",

          "Data can be divided into smaller pieces called packets.",

          "Packets travel through the network toward the destination.",

          "At the destination, the information can be put back together.",

          "This helps networks move information efficiently.",
        ],

        ar: [
          "المعلومات الكبيرة لا تنتقل عادةً عبر الشبكة كقطعة واحدة ضخمة.",

          "يمكن تقسيم البيانات إلى أجزاء صغيرة تسمى Packets أو حزم بيانات.",

          "تسافر الحزم عبر الشبكات نحو الوجهة.",

          "عندما تصل إلى وجهتها يمكن إعادة تجميع المعلومات.",

          "هذه الطريقة تساعد الشبكات على نقل البيانات بكفاءة.",
        ],

        he: [
          "מידע גדול בדרך כלל אינו נשלח ברשת כגוש אחד ענק.",
          "אפשר לחלק נתונים לחלקים קטנים יותר הנקראים חבילות.",
          "חבילות עוברות דרך הרשת לעבר היעד.",
          "ביעד אפשר להרכיב מחדש את המידע.",
          "הדבר עוזר לרשתות להעביר מידע ביעילות.",
        ],
      },
    },


    /* =========================================
       13 — PACKET ACTIVITY
    ========================================= */

    {
      id: "packet-activity",

      type: "task",

      icon: "📦",

      title: {
        en: "Become a Data Packet",
        ar: "كن حزمة بيانات",
        he: "הפכו לחבילת נתונים",
      },

      introduction: {
        en: "Imagine the sentence 'HELLO INTERNET' must travel across a network.",

        ar: "تخيّل أن العبارة 'HELLO INTERNET' يجب أن تنتقل عبر شبكة.",
        he: "דמיינו שהמשפט 'HELLO INTERNET' צריך לעבור דרך רשת.",
      },

      steps: {
        en: [
          "Split the message into three or four small pieces.",
          "Imagine each piece is a packet.",
          "Give each packet a number.",
          "Send the packets separately.",
          "Put them back in the correct order at the destination.",
        ],

        ar: [
          "قسّم الرسالة إلى ثلاثة أو أربعة أجزاء صغيرة.",
          "اعتبر كل جزء Packet.",
          "أعطِ كل حزمة رقمًا.",
          "تخيّل أن الحزم تنتقل بشكل منفصل.",
          "أعد ترتيبها بالشكل الصحيح عند وصولها.",
        ],

        he: [
          "חלקו את ההודעה לשלושה או ארבעה חלקים קטנים.",
          "דמיינו שכל חלק הוא חבילה.",
          "תנו לכל חבילה מספר.",
          "שלחו את החבילות בנפרד.",
          "הרכיבו אותן מחדש בסדר הנכון ביעד.",
        ],
      },

      answerPrompt: {
        en: "How did you divide the message into packets?",

        ar: "كيف قمت بتقسيم الرسالة إلى Packets؟",
        he: "כיצד חילקתם את ההודעה לחבילות?",
      },
    },


    /* =========================================
       14 — IP ADDRESS
    ========================================= */

    {
      id: "ip-address",

      type: "content",

      icon: "🏷️",

      title: {
        en: "What Is an IP Address?",
        ar: "ما هو عنوان IP؟",
        he: "מהי כתובת IP?",
      },

      paragraphs: {
        en: [
          "Devices communicating on networks use addresses.",

          "An IP address helps identify a device or network interface so information can be sent to the correct place.",

          "You can think of it a little like an address used to help deliver a package.",

          "There are different versions of IP addresses, including IPv4 and IPv6.",
        ],

        ar: [
          "الأجهزة التي تتواصل عبر الشبكات تستخدم عناوين.",

          "يساعد عنوان IP في تحديد جهاز أو واجهة شبكة حتى يمكن إرسال البيانات إلى المكان الصحيح.",

          "يمكن تشبيه الفكرة بعنوان يساعد على إيصال طرد إلى المكان الصحيح.",

          "يوجد أكثر من إصدار لعناوين IP، ومنها IPv4 وIPv6.",
        ],

        he: [
          "מכשירים שמתקשרים ברשתות משתמשים בכתובות.",
          "כתובת IP עוזרת לזהות מכשיר או ממשק רשת כדי שאפשר יהיה לשלוח מידע למקום הנכון.",
          "אפשר לחשוב עליה קצת כמו על כתובת שעוזרת למסור חבילה.",
          "יש גרסאות שונות של כתובות IP, כולל IPv4 ו-IPv6.",
        ],
      },
    },


    /* =========================================
       15 — DNS
    ========================================= */

    {
      id: "dns",

      type: "content",

      icon: "📖",

      title: {
        en: "DNS — The Internet's Name Helper",
        ar: "DNS — دليل الأسماء على الإنترنت",
        he: "DNS — עוזר השמות של האינטרנט",
      },

      paragraphs: {
        en: [
          "People prefer to remember names such as example.com instead of long numeric network addresses.",

          "DNS stands for Domain Name System.",

          "DNS helps translate domain names into information computers can use to find the correct destination.",

          "A useful analogy is a contacts list: you remember a person's name, while the phone stores the number.",
        ],

        ar: [
          "من الأسهل على الإنسان تذكر أسماء مثل example.com بدل حفظ عناوين رقمية طويلة.",

          "DNS هو اختصار لـDomain Name System.",

          "يساعد DNS في ربط أسماء النطاقات بالمعلومات التي تحتاجها الأجهزة للوصول إلى الوجهة الصحيحة.",

          "يمكن تشبيهه بقائمة جهات الاتصال: أنت تتذكر اسم الشخص، بينما الهاتف يعرف الرقم.",
        ],

        he: [
          "אנשים מעדיפים לזכור שמות כמו example.com במקום כתובות רשת מספריות ארוכות.",
          "DNS הוא קיצור של Domain Name System.",
          "DNS עוזר לתרגם שמות מתחם למידע שמחשבים יכולים להשתמש בו כדי למצוא את היעד הנכון.",
          "דימוי שימושי הוא רשימת אנשי קשר: אתם זוכרים את שם האדם, בעוד הטלפון שומר את המספר.",
        ],
      },
    },


    /* =========================================
       16 — DNS QUIZ
    ========================================= */

    {
      id: "dns-quiz",

      type: "multipleChoice",

      icon: "🧩",

      title: {
        en: "DNS Challenge",
        ar: "تحدي DNS",
        he: "אתגר DNS",
      },

      question: {
        en: "Why is DNS useful?",

        ar: "لماذا يعتبر DNS مفيدًا؟",
        he: "למה DNS שימושי?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "It helps connect domain names with network destinations.",
            ar: "يساعد على ربط أسماء النطاقات بالوجهات على الشبكة.",
            he: "הוא עוזר לקשר שמות מתחם ליעדים ברשת.",
          },
        },

        {
          id: "b",

          text: {
            en: "It increases the size of the monitor.",
            ar: "يزيد حجم شاشة الحاسوب.",
            he: "הוא מגדיל את גודל המסך.",
          },
        },

        {
          id: "c",

          text: {
            en: "It charges the computer battery.",
            ar: "يشحن بطارية الحاسوب.",
            he: "הוא טוען את סוללת המחשב.",
          },
        },
      ],

      correctAnswer: "a",

      explanation: {
        en: "Correct! DNS helps computers find destinations when we use easy-to-remember domain names.",

        ar: "صحيح! DNS يساعد الأجهزة على الوصول للوجهة عندما نستخدم أسماء نطاقات سهلة التذكر.",
        he: "נכון! DNS עוזר למחשבים למצוא יעדים כאשר אנו משתמשים בשמות מתחם שקל לזכור.",
      },
    },


    /* =========================================
       17 — OPENING A WEBSITE
    ========================================= */

    {
      id: "opening-website-process",

      type: "content",

      icon: "🌐",

      title: {
        en: "What Happens When You Open a Website?",
        ar: "ماذا يحدث عندما تفتح موقعًا؟",
        he: "מה קורה כשפותחים אתר אינטרנט?",
      },

      paragraphs: {
        en: [
          "Let's imagine you type a website address into your browser.",

          "1. Your browser needs to find where the website is located.",

          "2. DNS can help resolve the domain name.",

          "3. Your request travels across networks.",

          "4. Routers help direct the traffic.",

          "5. The request reaches a server.",

          "6. The server sends information back.",

          "7. Your browser receives the data and displays the page.",

          "All of this may happen in less than a second.",
        ],

        ar: [
          "تخيّل أنك كتبت عنوان موقع داخل المتصفح.",

          "1. يحتاج المتصفح إلى معرفة أين يوجد الموقع.",

          "2. يمكن لـDNS المساعدة في معرفة وجهة اسم النطاق.",

          "3. ينتقل طلبك عبر الشبكات.",

          "4. تساعد أجهزة Router في توجيه حركة البيانات.",

          "5. يصل الطلب إلى Server.",

          "6. يرسل Server المعلومات المطلوبة.",

          "7. يستقبل المتصفح البيانات ويعرض الصفحة.",

          "قد تحدث كل هذه المراحل خلال أقل من ثانية.",
        ],

        he: [
          "דמיינו שאתם מקלידים כתובת אתר בדפדפן.",
          "1. הדפדפן צריך למצוא היכן האתר נמצא.",
          "2. DNS יכול לעזור לפתור את שם המתחם.",
          "3. הבקשה שלכם עוברת דרך רשתות.",
          "4. נתבים עוזרים לנתב את התעבורה.",
          "5. הבקשה מגיעה לשרת.",
          "6. השרת שולח מידע בחזרה.",
          "7. הדפדפן מקבל את הנתונים ומציג את הדף.",
          "כל זה יכול לקרות בפחות משנייה.",
        ],
      },
    },


    /* =========================================
       18 — INTERNET DETECTIVE
    ========================================= */

    {
      id: "internet-detective",

      type: "task",

      icon: "🕵️",

      title: {
        en: "Internet Detective",
        ar: "محقق الإنترنت",
        he: "בלש האינטרנט",
      },

      introduction: {
        en: "Choose one online activity and trace what may happen behind the scenes.",

        ar: "اختر نشاطًا تستخدمه عبر الإنترنت وحاول تتبع ما يحدث خلف الكواليس.",
        he: "בחרו פעילות מקוונת אחת ועקבו אחרי מה שעשוי לקרות מאחורי הקלעים.",
      },

      steps: {
        en: [
          "Choose an activity: open a website, watch a video, send a message or play an online game.",
          "Identify the client.",
          "Think about where a server could be involved.",
          "Explain why the network is needed.",
          "Explain how data might travel between the devices.",
        ],

        ar: [
          "اختر نشاطًا: فتح موقع، مشاهدة فيديو، إرسال رسالة أو لعب لعبة عبر الإنترنت.",
          "حدد الـClient.",
          "فكر أين يمكن أن يكون الـServer.",
          "اشرح لماذا نحتاج إلى الشبكة.",
          "اشرح كيف يمكن أن تنتقل البيانات بين الأجهزة.",
        ],

        he: [
          "בחרו פעילות: פתיחת אתר, צפייה בסרטון, שליחת הודעה או משחק מקוון.",
          "זהו את הלקוח.",
          "חשבו היכן שרת יכול להיות מעורב.",
          "הסבירו מדוע הרשת נחוצה.",
          "הסבירו כיצד הנתונים עשויים לעבור בין המכשירים.",
        ],
      },

      answerPrompt: {
        en: "Describe your chosen activity and what you think happens behind the scenes.",

        ar: "اشرح النشاط الذي اخترته وما الذي تعتقد أنه يحدث خلف الكواليس.",
        he: "תארו את הפעילות שבחרתם ומה לדעתכם קורה מאחורי הקלעים.",
      },
    },


    /* =========================================
       19 — FINAL CHALLENGE
    ========================================= */

    {
      id: "internet-final-quiz",

      type: "multipleChoice",

      icon: "🏆",

      title: {
        en: "Final Internet Challenge",
        ar: "تحدي الإنترنت النهائي",
        he: "אתגר האינטרנט הסופי",
      },

      question: {
        en: "Which sequence best describes opening a website?",

        ar: "أي ترتيب يصف بشكل أفضل عملية فتح موقع؟",
        he: "איזה רצף מתאר בצורה הטובה ביותר פתיחת אתר?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Browser request → Network → Server → Data returns → Browser displays page",

            ar: "طلب من المتصفح → الشبكة → Server → عودة البيانات → عرض الصفحة",
            he: "בקשת דפדפן → רשת → שרת → הנתונים חוזרים → הדפדפן מציג את הדף",
          },
        },

        {
          id: "b",

          text: {
            en: "Keyboard → Printer → Camera → Website",
            ar: "لوحة مفاتيح → طابعة → كاميرا → موقع",
            he: "מקלדת → מדפסת → מצלמה → אתר",
          },
        },

        {
          id: "c",

          text: {
            en: "Server → Computer turns off → Router disappears",
            ar: "Server → إطفاء الحاسوب → اختفاء Router",
            he: "שרת → המחשב נכבה → הנתב נעלם",
          },
        },
      ],

      correctAnswer: "a",

      explanation: {
        en: "Excellent! Your browser sends a request, the request travels through networks to a server, and the returned data is displayed by the browser.",

        ar: "ممتاز! يرسل المتصفح الطلب، وينتقل عبر الشبكات إلى Server، ثم تعود البيانات ليعرضها المتصفح.",
        he: "מצוין! הדפדפן שולח בקשה, הבקשה עוברת דרך רשתות אל שרת, והנתונים שחוזרים מוצגים בדפדפן.",
      },
    },


    /* =========================================
       20 — SUMMARY
    ========================================= */

    {
      id: "internet-summary",

      type: "summary",

      icon: "🌟",

      title: {
        en: "What Did We Discover?",
        ar: "ماذا اكتشفنا؟",
        he: "מה גילינו?",
      },

      items: {
        en: [
          "The Internet connects many networks around the world.",
          "The Web is one service that uses the Internet.",
          "A network allows devices to communicate.",
          "Routers help direct traffic between networks.",
          "Clients request information and servers provide services.",
          "Data can travel in smaller packets.",
          "IP addresses help identify network destinations.",
          "DNS helps us use easy-to-remember domain names.",
        ],

        ar: [
          "الإنترنت يربط عددًا هائلًا من الشبكات حول العالم.",
          "الويب هو إحدى الخدمات التي تستخدم الإنترنت.",
          "الشبكة تسمح للأجهزة بالتواصل.",
          "Router يساعد في توجيه حركة البيانات بين الشبكات.",
          "Client يرسل الطلبات وServer يوفر المعلومات أو الخدمات.",
          "يمكن للبيانات أن تنتقل على شكل Packets صغيرة.",
          "عناوين IP تساعد في تحديد الوجهات على الشبكة.",
          "DNS يساعدنا على استخدام أسماء نطاقات سهلة التذكر.",
        ],

        he: [
          "האינטרנט מחבר רשתות רבות ברחבי העולם.",
          "ה-Web הוא שירות אחד שמשתמש באינטרנט.",
          "רשת מאפשרת למכשירים לתקשר.",
          "נתבים עוזרים לנתב תעבורה בין רשתות.",
          "לקוחות מבקשים מידע ושרתים מספקים שירותים.",
          "נתונים יכולים לעבור בחבילות קטנות יותר.",
          "כתובות IP עוזרות לזהות יעדים ברשת.",
          "DNS עוזר לנו להשתמש בשמות מתחם שקל לזכור.",
        ],
      },
    },


    /* =========================================
       21 — REFLECTION
    ========================================= */

    {
      id: "internet-reflection",

      type: "reflection",

      icon: "💬",

      title: {
        en: "Before You Finish...",
        ar: "قبل أن تنهي الدرس...",
        he: "לפני שמסיימים...",
      },

      question: {
        en: "What surprised you most about how the Internet works? Explain why.",

        ar: "ما أكثر شيء فاجأك في طريقة عمل الإنترنت؟ اشرح لماذا.",
        he: "מה הכי הפתיע אתכם בדרך שבה האינטרנט עובד? הסבירו מדוע.",
      },
    },

  ],
},
{
  id: "tech-internet-safety-04",

  track: "techExplorer",

  grades: ["4", "5", "6"],

  icon: "🔐",

  activityType: "cyber",

  estimatedMinutes: 120,

  xpReward: 200,

  title: {
    en: "Internet Safety",
    ar: "الأمان على الإنترنت",
    he: "בטיחות באינטרנט",
  },

  summary: {
    en: "Learn how to protect personal information, recognize online risks, create safer passwords, and make smart decisions online.",

    ar: "تعلّم كيف تحمي معلوماتك الشخصية، وتتعرف على المخاطر الرقمية، وتنشئ كلمات مرور أقوى، وتتخذ قرارات ذكية أثناء استخدام الإنترنت.",
    he: "למדו כיצד להגן על מידע אישי, לזהות סיכונים ברשת, ליצור סיסמאות בטוחות יותר ולקבל החלטות חכמות באינטרנט.",
  },

  sections: [

    /* =========================================
       1 — OBJECTIVES
    ========================================= */

    {
      id: "safety-objectives",

      type: "objectives",

      icon: "🎯",

      title: {
        en: "What will I learn?",
        ar: "ماذا سأتعلم؟",
        he: "מה אלמד?",
      },

      items: {
        en: [
          "Understand what personal information is.",
          "Recognize information that should stay private.",
          "Understand why passwords are important.",
          "Recognize suspicious messages and links.",
          "Learn what phishing means.",
          "Know what to do when something online feels unsafe.",
          "Think before sharing information or pictures online.",
        ],

        ar: [
          "أفهم ما المقصود بالمعلومات الشخصية.",
          "أتعرف على المعلومات التي يجب أن تبقى خاصة.",
          "أفهم أهمية كلمات المرور.",
          "أتعرف على الرسائل والروابط المشبوهة.",
          "أفهم معنى Phishing أو التصيد الإلكتروني.",
          "أعرف ماذا أفعل عندما أشعر أن شيئًا على الإنترنت غير آمن.",
          "أفكر قبل مشاركة المعلومات أو الصور على الإنترنت.",
        ],

        he: [
          "להבין מהו מידע אישי.",
          "לזהות מידע שצריך להישאר פרטי.",
          "להבין מדוע סיסמאות חשובות.",
          "לזהות הודעות וקישורים חשודים.",
          "ללמוד מהו פישינג.",
          "לדעת מה לעשות כשמשהו באינטרנט מרגיש לא בטוח.",
          "לחשוב לפני שמשתפים מידע או תמונות באינטרנט.",
        ],
      },
    },


    /* =========================================
       2 — OPENING QUESTION
    ========================================= */

    {
      id: "safety-opening",

      type: "question",

      icon: "💭",

      title: {
        en: "Would You Share It?",
        ar: "هل ستشارك هذه المعلومة؟",
        he: "האם הייתם משתפים את זה?",
      },

      text: {
        en: "Imagine a person you do not know sends you a message in an online game and asks for your full name, school and phone number. What would you do?",

        ar: "تخيّل أن شخصًا لا تعرفه أرسل لك رسالة داخل لعبة عبر الإنترنت وطلب اسمك الكامل، اسم مدرستك ورقم هاتفك. ماذا ستفعل؟",
        he: "דמיינו שאדם שאינכם מכירים שולח לכם הודעה במשחק מקוון ומבקש את שמכם המלא, שם בית הספר ומספר הטלפון. מה הייתם עושים?",
      },

      note: {
        en: "Explain your decision, not only yes or no.",

        ar: "اشرح سبب قرارك، ولا تكتب فقط نعم أو لا.",
        he: "הסבירו את ההחלטה שלכם, לא רק כן או לא.",
      },
    },


    /* =========================================
       3 — PERSONAL INFORMATION
    ========================================= */

    {
      id: "personal-information",

      type: "content",

      icon: "👤",

      title: {
        en: "What Is Personal Information?",
        ar: "ما هي المعلومات الشخصية؟",
        he: "מהו מידע אישי?",
      },

      paragraphs: {
        en: [
          "Personal information is information that can tell other people something important about you.",

          "Some information may help identify you, contact you or find where you live or study.",

          "Not every piece of information must be secret, but some information should only be shared with trusted people when there is a good reason.",

          "Before sharing something online, stop and ask: Who will see this? Why do they need it?",
        ],

        ar: [
          "المعلومات الشخصية هي معلومات يمكن أن تكشف للآخرين تفاصيل مهمة عنك.",

          "بعض المعلومات قد تساعد شخصًا آخر على التعرف عليك، التواصل معك أو معرفة مكان سكنك أو دراستك.",

          "ليست كل معلومة سرية، لكن هناك معلومات يجب مشاركتها فقط مع أشخاص موثوقين وعندما يكون هناك سبب واضح.",

          "قبل مشاركة أي معلومة على الإنترنت توقف واسأل: من سيرى هذه المعلومة؟ ولماذا يحتاج إليها؟",
        ],

        he: [
          "מידע אישי הוא מידע שיכול לספר לאנשים אחרים משהו חשוב עליכם.",
          "חלק מהמידע עשוי לעזור לזהות אתכם, ליצור איתכם קשר או לגלות היכן אתם גרים או לומדים.",
          "לא כל מידע חייב להיות סודי, אבל חלק מהמידע צריך להיות משותף רק עם אנשים אמינים וכשיש סיבה טובה.",
          "לפני שאתם משתפים משהו באינטרנט, עצרו ושאלו: מי יראה את זה? למה הם צריכים את זה?",
        ],
      },
    },


    /* =========================================
       4 — PRIVATE INFORMATION EXAMPLES
    ========================================= */

    {
      id: "private-info-examples",

      type: "examples",

      icon: "🔎",

      title: {
        en: "Think Before You Share",
        ar: "فكّر قبل أن تشارك",
        he: "חשבו לפני שאתם משתפים",
      },

      items: [
        {
          icon: "📞",

          title: {
            en: "Phone Number",
            ar: "رقم الهاتف",
            he: "מספר טלפון",
          },

          text: {
            en: "Do not give it to strangers online.",
            ar: "لا تشاركه مع أشخاص غرباء على الإنترنت.",
            he: "אל תמסרו אותו לזרים באינטרנט.",
          },
        },

        {
          icon: "🏠",

          title: {
            en: "Home Address",
            ar: "عنوان المنزل",
            he: "כתובת הבית",
          },

          text: {
            en: "Private information that should be protected.",
            ar: "معلومة خاصة يجب حمايتها.",
            he: "מידע פרטי שצריך להגן עליו.",
          },
        },

        {
          icon: "🔑",

          title: {
            en: "Password",
            ar: "كلمة المرور",
            he: "סיסמה",
          },

          text: {
            en: "Never share your password with other students or strangers.",
            ar: "لا تشارك كلمة المرور مع الطلاب الآخرين أو الغرباء.",
            he: "לעולם אל תשתפו את הסיסמה שלכם עם תלמידים אחרים או זרים.",
          },
        },

        {
          icon: "🏫",

          title: {
            en: "School Details",
            ar: "تفاصيل المدرسة",
            he: "פרטי בית הספר",
          },

          text: {
            en: "Think carefully before sharing exact details publicly.",
            ar: "فكر جيدًا قبل نشر تفاصيل دقيقة عنها بشكل علني.",
            he: "חשבו היטב לפני שאתם מפרסמים פרטים מדויקים בפומבי.",
          },
        },

        {
          icon: "🎨",

          title: {
            en: "Favorite Color",
            ar: "اللون المفضل",
            he: "צבע אהוב",
          },

          text: {
            en: "Usually less sensitive than your address or password.",
            ar: "غالبًا أقل حساسية من عنوان المنزل أو كلمة المرور.",
            he: "בדרך כלל פחות רגיש מכתובת הבית או מהסיסמה.",
          },
        },

        {
          icon: "📍",

          title: {
            en: "Live Location",
            ar: "الموقع الحالي",
            he: "מיקום בזמן אמת",
          },

          text: {
            en: "Avoid sharing your real-time location publicly.",
            ar: "تجنب مشاركة موقعك الحالي بشكل علني.",
            he: "הימנעו משיתוף המיקום הנוכחי שלכם בפומבי.",
          },
        },
      ],
    },


    /* =========================================
       5 — PERSONAL INFO QUIZ
    ========================================= */

    {
      id: "personal-info-quiz",

      type: "multipleChoice",

      icon: "🧩",

      title: {
        en: "Private or Safe to Share?",
        ar: "معلومة خاصة أم يمكن مشاركتها؟",
        he: "פרטי או בטוח לשיתוף?",
      },

      question: {
        en: "Which information should NEVER be posted publicly?",

        ar: "أي معلومة من التالية يجب ألا تنشرها بشكل علني؟",
        he: "איזה מידע לעולם אסור לפרסם בפומבי?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Your favorite sport",
            ar: "رياضتك المفضلة",
            he: "הספורט האהוב עליכם",
          },
        },

        {
          id: "b",

          text: {
            en: "Your account password",
            ar: "كلمة مرور حسابك",
            he: "סיסמת החשבון שלכם",
          },
        },

        {
          id: "c",

          text: {
            en: "Your favorite school subject",
            ar: "مادتك المدرسية المفضلة",
            he: "המקצוע האהוב עליכם בבית הספר",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Passwords should always remain private.",

        ar: "صحيح! يجب أن تبقى كلمات المرور سرية دائمًا.",
        he: "נכון! סיסמאות צריכות תמיד להישאר פרטיות.",
      },
    },


    /* =========================================
       6 — PASSWORDS
    ========================================= */

    {
      id: "password-intro",

      type: "content",

      icon: "🔑",

      title: {
        en: "Passwords Are Digital Keys",
        ar: "كلمات المرور هي مفاتيح رقمية",
        he: "סיסמאות הן מפתחות דיגיטליים",
      },

      paragraphs: {
        en: [
          "A password helps protect an account from people who should not access it.",

          "A weak password may be easier to guess.",

          "Good passwords should not be obvious information such as your first name, birthday or the word password.",

          "Longer and less predictable passwords are generally stronger.",
        ],

        ar: [
          "تساعد كلمة المرور في حماية الحساب من الأشخاص الذين لا يجب أن يدخلوا إليه.",

          "كلمة المرور الضعيفة قد تكون أسهل في التخمين.",

          "لا يُفضل استخدام معلومات واضحة مثل الاسم الأول، تاريخ الميلاد أو كلمة password.",

          "بشكل عام، كلمات المرور الأطول والأقل توقعًا تكون أقوى.",
        ],

        he: [
          "סיסמה עוזרת להגן על חשבון מפני אנשים שלא אמורים להיכנס אליו.",
          "סיסמה חלשה יכולה להיות קלה יותר לניחוש.",
          "סיסמאות טובות לא צריכות להתבסס על מידע ברור כמו השם הפרטי, תאריך הלידה או המילה password.",
          "סיסמאות ארוכות ופחות צפויות הן בדרך כלל חזקות יותר.",
        ],
      },
    },


    /* =========================================
       7 — PASSWORD EXAMPLES
    ========================================= */

    {
      id: "password-examples",

      type: "examples",

      icon: "🛡️",

      title: {
        en: "Which Password Looks Stronger?",
        ar: "أي كلمة مرور تبدو أقوى؟",
        he: "איזו סיסמה נראית חזקה יותר?",
      },

      items: [
        {
          icon: "❌",

          title: {
            en: "samia123",
            ar: "samia123",
            he: "samia123",
          },

          text: {
            en: "Contains a name and a simple number pattern.",
            ar: "تحتوي على اسم ونمط أرقام بسيط.",
            he: "מכילה שם ותבנית מספרים פשוטה.",
          },
        },

        {
          icon: "❌",

          title: {
            en: "12345678",
            ar: "12345678",
            he: "12345678",
          },

          text: {
            en: "Very predictable.",
            ar: "سهلة التوقع جدًا.",
            he: "צפויה מאוד.",
          },
        },

        {
          icon: "⚠️",

          title: {
            en: "BlueCar22",
            ar: "BlueCar22",
            he: "BlueCar22",
          },

          text: {
            en: "Better, but still relatively simple.",
            ar: "أفضل قليلًا، لكنها ما زالت بسيطة.",
            he: "טובה יותר, אבל עדיין פשוטה יחסית.",
          },
        },

        {
          icon: "✅",

          title: {
            en: "Cloud-Rocket-Tree-47",
            ar: "Cloud-Rocket-Tree-47",
            he: "Cloud-Rocket-Tree-47",
          },

          text: {
            en: "Longer and less predictable.",
            ar: "أطول وأقل قابلية للتوقع.",
            he: "ארוכה ופחות צפויה.",
          },
        },
      ],
    },


    /* =========================================
       8 — PASSWORD QUIZ
    ========================================= */

    {
      id: "password-quiz",

      type: "multipleChoice",

      icon: "🔐",

      title: {
        en: "Password Challenge",
        ar: "تحدي كلمة المرور",
        he: "אתגר הסיסמה",
      },

      question: {
        en: "Which password is the strongest example?",

        ar: "أي كلمة مرور من التالية تعتبر مثالًا أقوى؟",
        he: "איזו סיסמה היא הדוגמה החזקה ביותר?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "password",
            ar: "password",
            he: "password",
          },
        },

        {
          id: "b",

          text: {
            en: "123456",
            ar: "123456",
            he: "123456",
          },
        },

        {
          id: "c",

          text: {
            en: "Purple-Star-Train-86",
            ar: "Purple-Star-Train-86",
            he: "Purple-Star-Train-86",
          },
        },
      ],

      correctAnswer: "c",

      explanation: {
        en: "Correct! A longer, less predictable password is much better than common words or simple number sequences.",

        ar: "صحيح! كلمة مرور طويلة وأقل توقعًا أفضل بكثير من الكلمات الشائعة أو تسلسل الأرقام البسيط.",
        he: "נכון! סיסמה ארוכה ופחות צפויה עדיפה בהרבה על מילים נפוצות או רצפים פשוטים של מספרים.",
      },
    },


    /* =========================================
       9 — PASSWORD TASK
    ========================================= */

    {
      id: "password-builder",

      type: "task",

      icon: "🛠️",

      title: {
        en: "Build a Practice Password",
        ar: "صمّم كلمة مرور تدريبية",
        he: "בנו סיסמת תרגול",
      },

      introduction: {
        en: "Create a FAKE practice password. Do not write any real password that you currently use.",

        ar: "أنشئ كلمة مرور وهمية للتدريب فقط. لا تكتب أي كلمة مرور حقيقية تستخدمها.",
        he: "צרו סיסמת תרגול מזויפת. אל תכתבו סיסמה אמיתית שבה אתם משתמשים.",
      },

      steps: {
        en: [
          "Make it at least 12 characters long.",
          "Avoid your real name.",
          "Avoid your birthday.",
          "Combine several unrelated words or characters.",
          "Make sure you can remember the idea without making it obvious.",
        ],

        ar: [
          "اجعلها مكونة من 12 رمزًا على الأقل.",
          "لا تستخدم اسمك الحقيقي.",
          "لا تستخدم تاريخ ميلادك.",
          "ادمج كلمات أو رموزًا غير مرتبطة ببعضها.",
          "اجعلها قابلة للتذكر بالنسبة لك دون أن تكون واضحة للآخرين.",
        ],

        he: [
          "ודאו שהיא באורך של לפחות 12 תווים.",
          "הימנעו מהשם האמיתי שלכם.",
          "הימנעו מתאריך הלידה שלכם.",
          "שלבו כמה מילים או תווים שאינם קשורים זה לזה.",
          "ודאו שתוכלו לזכור את הרעיון בלי להפוך אותו לברור לאחרים.",
        ],
      },

      answerPrompt: {
        en: "Write a FAKE example password and explain why it is stronger. Never enter a real password.",

        ar: "اكتب مثالًا وهميًا فقط لكلمة مرور واشرح لماذا تعتبر أقوى. لا تكتب كلمة مرور حقيقية.",
        he: "כתבו דוגמה מזויפת לסיסמה והסבירו מדוע היא חזקה יותר. לעולם אל תזינו סיסמה אמיתית.",
      },
    },


    /* =========================================
       10 — SUSPICIOUS MESSAGES
    ========================================= */

    {
      id: "suspicious-messages",

      type: "content",

      icon: "📩",

      title: {
        en: "Suspicious Messages",
        ar: "الرسائل المشبوهة",
        he: "הודעות חשודות",
      },

      paragraphs: {
        en: [
          "Not every message you receive online is trustworthy.",

          "Some messages try to make you act quickly by creating fear, excitement or curiosity.",

          "A suspicious message may ask you to click a link, provide a password, send personal information or download a file.",

          "When you are unsure, do not rush. Stop and verify.",
        ],

        ar: [
          "ليست كل رسالة تصلك على الإنترنت موثوقة.",

          "بعض الرسائل تحاول دفعك للتصرف بسرعة من خلال الخوف أو الحماس أو الفضول.",

          "قد تطلب منك الرسالة المشبوهة الضغط على رابط، إدخال كلمة مرور، إرسال معلومات شخصية أو تنزيل ملف.",

          "عندما تكون غير متأكد، لا تتسرع. توقف وتحقق.",
        ],

        he: [
          "לא כל הודעה שאתם מקבלים באינטרנט היא אמינה.",
          "חלק מההודעות מנסות לגרום לכם לפעול במהירות באמצעות פחד, התלהבות או סקרנות.",
          "הודעה חשודה עשויה לבקש מכם ללחוץ על קישור, למסור סיסמה, לשלוח מידע אישי או להוריד קובץ.",
          "כשאינכם בטוחים, אל תמהרו. עצרו ובדקו.",
        ],
      },
    },


    /* =========================================
       11 — PHISHING
    ========================================= */

    {
      id: "phishing",

      type: "content",

      icon: "🎣",

      title: {
        en: "What Is Phishing?",
        ar: "ما هو Phishing؟",
        he: "מהו פישינג?",
      },

      paragraphs: {
        en: [
          "Phishing is a type of trick used to make people reveal sensitive information or visit a fake website.",

          "A phishing message may pretend to come from a game, company, school or other trusted service.",

          "It might say something urgent such as: Your account will be deleted! Click now!",

          "The goal is often to make you react before thinking.",
        ],

        ar: [
          "التصيد الإلكتروني Phishing هو نوع من الخداع الذي يحاول دفع المستخدم إلى كشف معلومات حساسة أو زيارة موقع مزيف.",

          "قد تبدو الرسالة وكأنها مرسلة من لعبة، شركة، مدرسة أو خدمة موثوقة.",

          "وقد تحتوي على عبارة عاجلة مثل: سيتم حذف حسابك! اضغط الآن!",

          "الهدف غالبًا هو جعلك تتصرف بسرعة قبل التفكير.",
        ],

        he: [
          "פישינג הוא סוג של הונאה שמנסה לגרום לאנשים לחשוף מידע רגיש או לבקר באתר מזויף.",
          "הודעת פישינג עשויה להעמיד פנים שהיא מגיעה ממשחק, חברה, בית ספר או שירות אמין אחר.",
          "היא עשויה לומר משהו דחוף כמו: החשבון שלך יימחק! לחץ עכשיו!",
          "המטרה היא לעיתים קרובות לגרום לכם להגיב לפני שאתם חושבים.",
        ],
      },
    },


    /* =========================================
       12 — PHISHING EXAMPLES
    ========================================= */

    {
      id: "phishing-signs",

      type: "examples",

      icon: "🚨",

      title: {
        en: "Warning Signs",
        ar: "إشارات تحذيرية",
        he: "סימני אזהרה",
      },

      items: [
        {
          icon: "⏰",

          title: {
            en: "Extreme Urgency",
            ar: "استعجال شديد",
            he: "דחיפות קיצונית",
          },

          text: {
            en: "Click in 5 minutes or your account will disappear!",
            ar: "اضغط خلال 5 دقائق وإلا سيختفي حسابك!",
            he: "לחצו בתוך 5 דקות או שהחשבון שלכם ייעלם!",
          },
        },

        {
          icon: "🎁",

          title: {
            en: "Too Good to Be True",
            ar: "عرض مبالغ فيه",
            he: "טוב מכדי להיות אמיתי",
          },

          text: {
            en: "You won an expensive prize even though you entered no competition.",
            ar: "ربحت جائزة غالية رغم أنك لم تشارك في أي مسابقة.",
            he: "זכיתם בפרס יקר למרות שלא השתתפתם בשום תחרות.",
          },
        },

        {
          icon: "🔑",

          title: {
            en: "Asking for Passwords",
            ar: "طلب كلمة المرور",
            he: "בקשת סיסמאות",
          },

          text: {
            en: "A message asks you to send your password.",
            ar: "رسالة تطلب منك إرسال كلمة المرور.",
            he: "הודעה מבקשת מכם לשלוח את הסיסמה שלכם.",
          },
        },

        {
          icon: "🔗",

          title: {
            en: "Suspicious Link",
            ar: "رابط مشبوه",
            he: "קישור חשוד",
          },

          text: {
            en: "A strange or unexpected link.",
            ar: "رابط غريب أو لم تكن تتوقع استلامه.",
            he: "קישור מוזר או בלתי צפוי.",
          },
        },
      ],
    },


    /* =========================================
       13 — PHISHING QUIZ
    ========================================= */

    {
      id: "phishing-quiz",

      type: "multipleChoice",

      icon: "🎣",

      title: {
        en: "Spot the Scam",
        ar: "اكتشف الخدعة",
        he: "זהו את ההונאה",
      },

      question: {
        en: "You receive: 'Congratulations! You won a new phone. Send your password now to receive your prize.' What should you do?",

        ar: "وصلتك رسالة: «مبروك! ربحت هاتفًا جديدًا. أرسل كلمة مرورك الآن لاستلام الجائزة». ماذا تفعل؟",
        he: "קיבלתם הודעה: 'מזל טוב! זכיתם בטלפון חדש. שלחו עכשיו את הסיסמה כדי לקבל את הפרס.' מה עליכם לעשות?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Send the password quickly.",
            ar: "أرسل كلمة المرور بسرعة.",
            he: "לשלוח את הסיסמה במהירות.",
          },
        },

        {
          id: "b",

          text: {
            en: "Do not send information and tell a trusted adult.",
            ar: "لا ترسل المعلومات وأخبر شخصًا بالغًا موثوقًا.",
            he: "לא לשלוח מידע ולספר למבוגר אמין.",
          },
        },

        {
          id: "c",

          text: {
            en: "Send your phone number instead.",
            ar: "أرسل رقم الهاتف بدلًا من كلمة المرور.",
            he: "לשלוח במקום זאת את מספר הטלפון.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Exactly. Never send passwords because of an unexpected prize message.",

        ar: "بالضبط. لا ترسل كلمة المرور بسبب رسالة جائزة غير متوقعة.",
        he: "בדיוק. לעולם אל תשלחו סיסמאות בגלל הודעת פרס בלתי צפויה.",
      },
    },


    /* =========================================
       14 — LINKS
    ========================================= */

    {
      id: "safe-links",

      type: "content",

      icon: "🔗",

      title: {
        en: "Think Before You Click",
        ar: "فكّر قبل الضغط على الرابط",
        he: "חשבו לפני שאתם לוחצים",
      },

      paragraphs: {
        en: [
          "Links can take you to useful websites, but they can also take you somewhere unexpected.",

          "Do not automatically click every link you receive.",

          "Ask yourself who sent it, whether you expected it and whether the message makes sense.",

          "If you are unsure, ask a trusted adult or teacher before opening it.",
        ],

        ar: [
          "يمكن للروابط أن تقودك إلى مواقع مفيدة، لكنها قد تقودك أيضًا إلى أماكن غير متوقعة.",

          "لا تضغط تلقائيًا على كل رابط يصلك.",

          "اسأل نفسك: من أرسل الرابط؟ هل كنت أتوقعه؟ وهل الرسالة منطقية؟",

          "إذا لم تكن متأكدًا، اسأل شخصًا بالغًا موثوقًا أو معلمًا قبل فتحه.",
        ],

        he: [
          "קישורים יכולים להוביל לאתרים שימושיים, אבל גם למקומות בלתי צפויים.",
          "אל תלחצו אוטומטית על כל קישור שמגיע אליכם.",
          "שאלו את עצמכם מי שלח אותו, האם ציפיתם לו והאם ההודעה הגיונית.",
          "אם אינכם בטוחים, שאלו מבוגר אמין או מורה לפני שפותחים אותו.",
        ],
      },
    },


    /* =========================================
       15 — DIGITAL FOOTPRINT
    ========================================= */

    {
      id: "digital-footprint",

      type: "content",

      icon: "👣",

      title: {
        en: "Your Digital Footprint",
        ar: "بصمتك الرقمية",
        he: "טביעת הרגל הדיגיטלית שלכם",
      },

      paragraphs: {
        en: [
          "The things you do online can leave a digital footprint.",

          "Photos, comments, usernames and posts may be copied, saved or shared by other people.",

          "Deleting something does not always guarantee that every copy disappears.",

          "Before posting, ask: Would I be comfortable if my family, teacher or future self saw this?",
        ],

        ar: [
          "الأشياء التي تقوم بها على الإنترنت قد تترك بصمة رقمية.",

          "الصور والتعليقات وأسماء المستخدم والمنشورات قد يتم نسخها أو حفظها أو مشاركتها من قبل الآخرين.",

          "حذف شيء لا يعني دائمًا أن جميع النسخ قد اختفت.",

          "قبل النشر اسأل نفسك: هل سأكون مرتاحًا إذا شاهدت عائلتي أو معلمي أو أنا في المستقبل هذا المحتوى؟",
        ],

        he: [
          "הדברים שאתם עושים באינטרנט יכולים להשאיר טביעת רגל דיגיטלית.",
          "תמונות, תגובות, שמות משתמש ופוסטים עשויים להיות מועתקים, נשמרים או משותפים על ידי אנשים אחרים.",
          "מחיקה של משהו לא תמיד מבטיחה שכל העותקים נעלמו.",
          "לפני פרסום, שאלו: האם יהיה לי נוח אם המשפחה, המורה או אני בעתיד יראו את זה?",
        ],
      },
    },


    /* =========================================
       16 — POST OR DON'T POST
    ========================================= */

    {
      id: "post-challenge",

      type: "task",

      icon: "📱",

      title: {
        en: "Post or Don't Post?",
        ar: "أنشر أم لا أنشر؟",
        he: "לפרסם או לא לפרסם?",
      },

      introduction: {
        en: "Imagine you want to post a photo online. Use the THINK test before sharing.",

        ar: "تخيّل أنك تريد نشر صورة على الإنترنت. استخدم اختبار THINK قبل المشاركة.",
        he: "דמיינו שאתם רוצים לפרסם תמונה באינטרנט. השתמשו במבחן THINK לפני השיתוף.",
      },

      steps: {
        en: [
          "Does the picture reveal private information?",
          "Does it show your current location?",
          "Are other people in the photo comfortable with it being shared?",
          "Could the post hurt or embarrass someone?",
          "Would you still be comfortable seeing this post one year from now?",
        ],

        ar: [
          "هل تكشف الصورة معلومات شخصية؟",
          "هل تكشف موقعك الحالي؟",
          "هل الأشخاص الموجودون في الصورة موافقون على نشرها؟",
          "هل يمكن أن يسبب المنشور أذى أو إحراجًا لشخص؟",
          "هل ستكون مرتاحًا إذا رأيت هذا المنشور بعد سنة؟",
        ],

        he: [
          "האם התמונה חושפת מידע פרטי?",
          "האם היא מציגה את המיקום הנוכחי שלכם?",
          "האם לאנשים אחרים בתמונה נוח שהיא תשותף?",
          "האם הפוסט עלול לפגוע או להביך מישהו?",
          "האם עדיין יהיה לכם נוח לראות את הפוסט הזה בעוד שנה?",
        ],
      },

      answerPrompt: {
        en: "Write one example of something you should check before posting online.",

        ar: "اكتب مثالًا على شيء يجب أن تتحقق منه قبل نشر محتوى على الإنترنت.",
        he: "כתבו דוגמה אחת לדבר שכדאי לבדוק לפני שמפרסמים באינטרנט.",
      },
    },


    /* =========================================
       17 — STRANGER ONLINE
    ========================================= */

    {
      id: "online-strangers",

      type: "content",

      icon: "👥",

      title: {
        en: "People Online Are Not Always Who They Say They Are",
        ar: "ليس كل شخص على الإنترنت هو من يدعي أنه",
        he: "אנשים באינטרנט לא תמיד מי שהם אומרים שהם",
      },

      paragraphs: {
        en: [
          "It can be difficult to know who is really behind an online account.",

          "A profile picture, name or age written on an account does not prove a person's real identity.",

          "Be careful when strangers ask personal questions, request private pictures or ask to meet in person.",

          "If an online conversation makes you uncomfortable, stop the conversation and tell a trusted adult.",
        ],

        ar: [
          "قد يكون من الصعب معرفة الشخص الحقيقي الموجود خلف حساب على الإنترنت.",

          "الصورة والاسم والعمر المكتوب في الحساب لا تثبت هوية الشخص الحقيقية.",

          "كن حذرًا عندما يطلب شخص غريب معلومات شخصية، صورًا خاصة أو لقاءً وجهًا لوجه.",

          "إذا جعلك حديث على الإنترنت تشعر بعدم الارتياح، أوقف المحادثة وأخبر شخصًا بالغًا موثوقًا.",
        ],

        he: [
          "יכול להיות קשה לדעת מי באמת עומד מאחורי חשבון מקוון.",
          "תמונת פרופיל, שם או גיל שמופיעים בחשבון אינם מוכיחים את זהותו האמיתית של האדם.",
          "היזהרו כאשר זרים שואלים שאלות אישיות, מבקשים תמונות פרטיות או מציעים להיפגש פנים אל פנים.",
          "אם שיחה באינטרנט גורמת לכם אי-נוחות, הפסיקו אותה וספרו למבוגר אמין.",
        ],
      },
    },


    /* =========================================
       18 — WHAT WOULD YOU DO
    ========================================= */

    {
      id: "unsafe-situation",

      type: "question",

      icon: "🚨",

      title: {
        en: "What Would You Do?",
        ar: "ماذا ستفعل؟",
        he: "מה הייתם עושים?",
      },

      text: {
        en: "Someone you met in an online game asks you to keep your conversation secret from your family and wants you to send a private photo. What should you do?",

        ar: "شخص تعرفت عليه داخل لعبة على الإنترنت طلب منك أن تبقي المحادثة سرًا عن عائلتك، ويريد منك إرسال صورة خاصة. ماذا يجب أن تفعل؟",
        he: "מישהו שפגשתם במשחק מקוון מבקש מכם לשמור את השיחה בסוד מהמשפחה ורוצה שתשלחו תמונה פרטית. מה עליכם לעשות?",
      },

      note: {
        en: "Write the safest actions you could take.",

        ar: "اكتب الخطوات الأكثر أمانًا التي يمكنك القيام بها.",
        he: "כתבו את הפעולות הבטוחות ביותר שאתם יכולים לבצע.",
      },
    },


    /* =========================================
       19 — SAFE RESPONSE
    ========================================= */

    {
      id: "stop-block-report",

      type: "content",

      icon: "🛑",

      title: {
        en: "Stop, Block, Report, Tell",
        ar: "توقف، احظر، بلّغ، وأخبر",
        he: "עצרו, חסמו, דווחו וספרו",
      },

      paragraphs: {
        en: [
          "If something online makes you feel unsafe, you do not have to continue the conversation.",

          "STOP interacting with the person or content.",

          "BLOCK the account when appropriate.",

          "REPORT harmful behavior using the platform's tools.",

          "TELL a trusted adult, parent, teacher or another responsible person.",
        ],

        ar: [
          "إذا جعلك شيء على الإنترنت تشعر بعدم الأمان، فأنت لست مضطرًا لمتابعة المحادثة.",

          "توقف STOP عن التفاعل.",

          "احظر BLOCK الحساب عندما يكون ذلك مناسبًا.",

          "بلّغ REPORT عن السلوك المؤذي باستخدام أدوات المنصة.",

          "أخبر TELL شخصًا بالغًا موثوقًا، أحد الوالدين أو المعلم.",
        ],

        he: [
          "אם משהו באינטרנט גורם לכם להרגיש לא בטוחים, אינכם חייבים להמשיך את השיחה.",
          "הפסיקו (STOP) את האינטראקציה עם האדם או התוכן.",
          "חסמו (BLOCK) את החשבון כשמתאים.",
          "דווחו (REPORT) על התנהגות פוגענית באמצעות כלי הפלטפורמה.",
          "ספרו (TELL) למבוגר אמין, הורה, מורה או אדם אחראי אחר.",
        ],
      },
    },


    /* =========================================
       20 — CYBER DETECTIVE
    ========================================= */

    {
      id: "cyber-detective",

      type: "task",

      icon: "🕵️",

      title: {
        en: "Cyber Detective Challenge",
        ar: "تحدي المحقق الرقمي",
        he: "אתגר בלש הסייבר",
      },

      introduction: {
        en: "You are now the cyber detective. Analyze this situation.",

        ar: "أنت الآن المحقق الرقمي. حلل الموقف التالي.",
        he: "עכשיו אתם בלשי הסייבר. נתחו את המצב הבא.",
      },

      steps: {
        en: [
          "You receive a message from an unknown account.",
          "It says you won a gaming prize.",
          "It asks you to click a link immediately.",
          "The website asks for your username and password.",
          "Identify at least three warning signs.",
        ],

        ar: [
          "وصلتك رسالة من حساب غير معروف.",
          "تقول إنك ربحت جائزة في لعبة.",
          "تطلب منك الضغط فورًا على رابط.",
          "الموقع يطلب اسم المستخدم وكلمة المرور.",
          "حدد ثلاث إشارات تحذيرية على الأقل.",
        ],

        he: [
          "אתם מקבלים הודעה מחשבון לא מוכר.",
          "כתוב בה שזכיתם בפרס במשחק.",
          "היא מבקשת מכם ללחוץ מיד על קישור.",
          "האתר מבקש את שם המשתמש והסיסמה שלכם.",
          "זהו לפחות שלושה סימני אזהרה.",
        ],
      },

      answerPrompt: {
        en: "What warning signs did you find, and what should the user do?",

        ar: "ما إشارات الخطر التي اكتشفتها؟ وماذا يجب أن يفعل المستخدم؟",
        he: "אילו סימני אזהרה מצאתם, ומה המשתמש צריך לעשות?",
      },
    },


    /* =========================================
       21 — FINAL QUIZ
    ========================================= */

    {
      id: "safety-final-quiz",

      type: "multipleChoice",

      icon: "🏆",

      title: {
        en: "Final Safety Challenge",
        ar: "تحدي الأمان النهائي",
        he: "אתגר הבטיחות הסופי",
      },

      question: {
        en: "What is the smartest response when an unexpected message asks for private information?",

        ar: "ما التصرف الأذكى عندما تطلب منك رسالة غير متوقعة معلومات خاصة؟",
        he: "מהי התגובה החכמה ביותר כאשר הודעה בלתי צפויה מבקשת מידע פרטי?",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Send the information if the message looks exciting.",
            ar: "أرسل المعلومات إذا كانت الرسالة تبدو مثيرة.",
            he: "לשלוח את המידע אם ההודעה נראית מרגשת.",
          },
        },

        {
          id: "b",

          text: {
            en: "Stop, do not share the information, and verify with a trusted adult.",
            ar: "توقف، لا ترسل المعلومات، وتحقق بمساعدة شخص بالغ موثوق.",
            he: "לעצור, לא לשתף את המידע ולבדוק עם מבוגר אמין.",
          },
        },

        {
          id: "c",

          text: {
            en: "Send only part of your password.",
            ar: "أرسل جزءًا فقط من كلمة المرور.",
            he: "לשלוח רק חלק מהסיסמה.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Excellent! When something feels suspicious, stop and verify instead of reacting quickly.",

        ar: "ممتاز! عندما يبدو شيء مشبوهًا، توقف وتحقق بدلًا من التصرف بسرعة.",
        he: "מצוין! כשמשהו נראה חשוד, עצרו ובדקו במקום להגיב במהירות.",
      },
    },


    /* =========================================
       22 — SUMMARY
    ========================================= */

    {
      id: "safety-summary",

      type: "summary",

      icon: "🌟",

      title: {
        en: "Your Internet Safety Toolkit",
        ar: "صندوق أدوات الأمان الرقمي",
        he: "ערכת הכלים שלכם לבטיחות באינטרנט",
      },

      items: {
        en: [
          "Protect personal information.",
          "Never share real passwords.",
          "Use strong and less predictable passwords.",
          "Think before clicking links.",
          "Be careful with unexpected messages and prizes.",
          "Remember that online identities may be fake.",
          "Think before posting pictures or information.",
          "Stop, block, report and tell when something feels unsafe.",
        ],

        ar: [
          "احمِ معلوماتك الشخصية.",
          "لا تشارك كلمات المرور الحقيقية.",
          "استخدم كلمات مرور قوية وأقل توقعًا.",
          "فكر قبل الضغط على الروابط.",
          "احذر من الرسائل والجوائز غير المتوقعة.",
          "تذكر أن هوية الأشخاص على الإنترنت قد تكون مزيفة.",
          "فكر قبل نشر الصور أو المعلومات.",
          "توقف، احظر، بلّغ وأخبر شخصًا موثوقًا عندما تشعر بعدم الأمان.",
        ],

        he: [
          "הגנו על מידע אישי.",
          "לעולם אל תשתפו סיסמאות אמיתיות.",
          "השתמשו בסיסמאות חזקות ופחות צפויות.",
          "חשבו לפני שאתם לוחצים על קישורים.",
          "היזהרו מהודעות ומפרסים בלתי צפויים.",
          "זכרו שזהויות באינטרנט עשויות להיות מזויפות.",
          "חשבו לפני שאתם מפרסמים תמונות או מידע.",
          "עצרו, חסמו, דווחו וספרו כשמשהו מרגיש לא בטוח.",
        ],
      },
    },


    /* =========================================
       23 — REFLECTION
    ========================================= */

    {
      id: "safety-reflection",

      type: "reflection",

      icon: "💬",

      title: {
        en: "Before You Finish...",
        ar: "قبل أن تنهي الدرس...",
        he: "לפני שמסיימים...",
      },

      question: {
        en: "What is one Internet safety habit that you think every student should follow, and why?",

        ar: "ما أهم عادة من عادات الأمان على الإنترنت تعتقد أن كل طالب يجب أن يتبعها؟ ولماذا؟",
        he: "מהו הרגל אחד של בטיחות באינטרנט שלדעתכם כל תלמיד צריך לאמץ, ולמה?",
      },
    },

  ],
}

];

export { programs, target, classroomLessons };
