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

function bilingual(en, ar) {
  return {en, ar};
}
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

const programs = [
  {
    id: "computer-science-modern-technology-journey",

    title: bilingual(
      "Journey into Computer Science & Modern Technology",
      "رحلة في علوم الحاسوب والتكنولوجيا الحديثة",
    ),

    description: bilingual(
      "An inquiry-driven journey through computer systems, data, computational thinking, algorithms, coding, networks, cybersecurity, artificial intelligence, and creative technology projects for curious young innovators.",
      "رحلة استقصائية في أنظمة الحاسوب والبيانات والتفكير الحاسوبي والخوارزميات والبرمجة والشبكات والأمن الرقمي والذكاء الاصطناعي والمشاريع التقنية الإبداعية، صُممت للمبتكرين الصغار محبي الاستكشاف.",
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

    finalProject: bilingual(
      "Design a responsible technology solution: define a real problem, model an algorithm, create a prototype, explain its data and safety choices, test it, improve it, and present it to an audience.",
      "تصميم حل تقني مسؤول: تحديد مشكلة حقيقية، وبناء خوارزمية، وإنشاء نموذج أولي، وشرح قرارات البيانات والأمان، واختباره وتحسينه، ثم عرض المشروع أمام جمهور.",
    ),

    lessons: [
      /* =====================================================
         1. INSIDE A COMPUTER
      ===================================================== */
      {
        id: "inside-a-computer",

        title: bilingual(
          "Inside a Computer",
          "داخل الحاسوب",
        ),

        description: bilingual(
          "Investigate how hardware, software, input, processing, storage, and output work together.",
          "استكشف كيف تعمل الأجهزة والبرمجيات والإدخال والمعالجة والتخزين والإخراج معًا.",
        ),

        ...lessonVisuals(
          "inside-a-computer",
          bilingual(
            "Children exploring the connected parts inside a computer",
            "أطفال يستكشفون الأجزاء المترابطة داخل الحاسوب",
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

        title: bilingual(
          "Data, Binary & Patterns",
          "البيانات والنظام الثنائي والأنماط",
        ),

        description: bilingual(
          "Discover how computers represent text, images, and other information using bits.",
          "اكتشف كيف تمثّل الحواسيب النصوص والصور وغيرها من المعلومات باستخدام البِتّات.",
        ),

        ...lessonVisuals(
          "data-binary-patterns",
          bilingual(
            "Children creating pixel art and patterns from binary tiles",
            "أطفال يصنعون فن البكسل والأنماط باستخدام قطع ثنائية",
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
            bilingual(
              "Everything becomes data",
              "كل شيء يتحول إلى بيانات",
            ),
            bilingual(
              "Computers represent information using agreed codes. Text becomes character numbers, images become grids of colored pixels, and sound becomes many measurements taken over time.",
              "تمثّل الحواسيب المعلومات باستخدام رموز متفق عليها. يتحول النص إلى أرقام للحروف، والصورة إلى شبكة من البكسلات الملونة، والصوت إلى قياسات كثيرة تؤخذ عبر الزمن.",
            ),
          ),

          contentSlide(
            "bits-and-binary",
            bilingual(
              "Two symbols, many possibilities",
              "رمزان واحتمالات كثيرة",
            ),
            bilingual(
              "A bit has two states, written 0 and 1. Combining bits creates more patterns: three bits make eight patterns. The meaning comes from the code we agree to use, not from the digits alone.",
              "للبِت حالتان تكتبان 0 و1. وعند جمع البِتّات نحصل على أنماط أكثر؛ فثلاثة بِتّات تصنع ثمانية أنماط. ويأتي المعنى من الترميز الذي نتفق عليه، لا من الأرقام وحدها.",
            ),
          ),

          contentSlide(
            "binary-bracelet",
            bilingual(
              "Create a binary code",
              "أنشئ رمزًا ثنائيًا",
            ),
            bilingual(
              "Invent a three-bit code for eight colors or actions. Write the codebook, encode a short message, and ask a partner to decode it. Improve any rule that caused confusion.",
              "ابتكر ترميزًا من ثلاثة بِتّات لثمانية ألوان أو أفعال. اكتب دليل الرموز، ورمّز رسالة قصيرة، واطلب من زميل فكها. حسّن أي قاعدة سببت التباسًا.",
            ),
            "task",
          ),

          quizSlide(
            "binary-quiz",
            bilingual(
              "Pattern check",
              "اختبار الأنماط",
            ),
            bilingual(
              "How many different patterns can two bits represent?",
              "كم نمطًا مختلفًا يمكن لبِتّين تمثيله؟",
            ),
            [
              bilingual("2", "2"),
              bilingual("3", "3"),
              bilingual("4", "4"),
              bilingual("8", "8"),
            ],
            2,
          ),

          contentSlide(
            "data-summary",
            bilingual(
              "Meaning needs a code",
              "المعنى يحتاج إلى ترميز",
            ),
            bilingual(
              "Bits are small building blocks. Codes organize their patterns so computers can represent many kinds of data. More bits allow more distinct possibilities.",
              "البِتّات وحدات بناء صغيرة، وتنظّم الرموز أنماطها كي تمثّل الحواسيب أنواعًا كثيرة من البيانات. وكلما زاد عدد البِتّات زادت الاحتمالات المختلفة.",
            ),
            "summary",
          ),

          contentSlide(
            "binary-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Why do you think computers use two basic states instead of ten digits like people usually do?",
              "لماذا برأيك يستخدم الحاسوب حالتين أساسيتين بدل عشرة أرقام كما نفعل عادة؟",
            ),
          ),
        ],
      },

      /* =====================================================
         3. THINK LIKE A PROGRAMMER
      ===================================================== */
      {
        id: "think-like-a-programmer",

        title: bilingual(
          "Think Like a Programmer",
          "فكّر مثل المبرمج",
        ),

        description: bilingual(
          "Practice decomposition, pattern recognition, abstraction, and step-by-step problem solving.",
          "تدرّب على تفكيك المشكلات واكتشاف الأنماط والتجريد وحل المشكلات خطوة بخطوة.",
        ),

        ...lessonVisuals(
          "think-like-a-programmer",
          bilingual(
            "Children solving puzzles with patterns, cards, and logical steps",
            "أطفال يحلون ألغازًا باستخدام الأنماط والبطاقات والخطوات المنطقية",
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
            bilingual(
              "Four powerful habits",
              "أربع عادات قوية",
            ),
            bilingual(
              "Computational thinking includes decomposition, pattern recognition, abstraction, and algorithmic thinking. These habits help us solve complex problems even before we write any code.",
              "يشمل التفكير الحاسوبي تفكيك المشكلات واكتشاف الأنماط والتجريد والتفكير الخوارزمي. وتساعدنا هذه العادات على حل المشكلات المعقدة حتى قبل كتابة أي كود.",
            ),
          ),

          contentSlide(
            "decomposition",
            bilingual(
              "Break it down",
              "قسّمها",
            ),
            bilingual(
              "A large task becomes easier when we divide it into smaller parts. A programmer asks: What smaller problems must be solved first?",
              "تصبح المهمة الكبيرة أسهل عندما نقسمها إلى أجزاء أصغر. يسأل المبرمج: ما المشكلات الصغيرة التي يجب حلها أولًا؟",
            ),
          ),

          contentSlide(
            "school-morning-task",
            bilingual(
              "Plan a school morning",
              "خطّط لصباح المدرسة",
            ),
            bilingual(
              "Break the task 'get ready for school' into smaller ordered steps. Then identify repeated patterns and remove details that are not necessary for the plan.",
              "قسّم مهمة \"الاستعداد للمدرسة\" إلى خطوات صغيرة ومرتبة، ثم حدّد الأنماط المتكررة واحذف التفاصيل غير الضرورية للخطة.",
            ),
            "task",
          ),

          quizSlide(
            "thinking-quiz",
            bilingual(
              "Thinking check",
              "اختبار التفكير",
            ),
            bilingual(
              "Which skill means breaking a large problem into smaller parts?",
              "أي مهارة تعني تقسيم المشكلة الكبيرة إلى أجزاء أصغر؟",
            ),
            [
              bilingual("Decomposition", "التفكيك"),
              bilingual("Guessing", "التخمين"),
              bilingual("Copying", "النسخ"),
              bilingual("Printing", "الطباعة"),
            ],
            0,
          ),

          contentSlide(
            "thinking-summary",
            bilingual(
              "Think before coding",
              "فكّر قبل البرمجة",
            ),
            bilingual(
              "Strong programmers do not rush to code. They understand the problem, divide it into parts, look for patterns, remove unnecessary details, and then design a clear solution.",
              "لا يندفع المبرمجون المتميزون مباشرة إلى الكود. يفهمون المشكلة، ويقسّمونها، ويبحثون عن الأنماط، ويتجاهلون التفاصيل غير الضرورية، ثم يصممون حلًا واضحًا.",
            ),
            "summary",
          ),

          contentSlide(
            "thinking-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Where do you already use computational thinking in your daily life?",
              "أين تستخدم التفكير الحاسوبي أصلًا في حياتك اليومية؟",
            ),
          ),
        ],
      },

      /* =====================================================
         4. ALGORITHMS & SMART SOLUTIONS
      ===================================================== */
      {
        id: "algorithms-smart-solutions",

        title: bilingual(
          "Algorithms & Smart Solutions",
          "الخوارزميات والحلول الذكية",
        ),

        description: bilingual(
          "Develop precise algorithms, test edge cases, and improve solutions for efficiency.",
          "طوّر خوارزميات دقيقة، واختبر الحالات غير المتوقعة، وحسّن كفاءة الحلول.",
        ),

        ...lessonVisuals(
          "algorithms-smart-solutions",
          bilingual(
            "Children guiding a robot through a maze with algorithm cards",
            "أطفال يوجهون روبوتًا في متاهة باستخدام بطاقات الخوارزمية",
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
            bilingual(
              "Instructions with a purpose",
              "تعليمات لها هدف",
            ),
            bilingual(
              "An algorithm is a finite, ordered set of unambiguous steps that solves a problem. Good algorithms state their inputs, desired output, and decisions clearly enough for another person or computer to follow.",
              "الخوارزمية مجموعة محدودة ومرتبة من الخطوات الواضحة لحل مشكلة. وتحدد الخوارزمية الجيدة مدخلاتها ومخرجاتها المطلوبة وقراراتها بوضوح يكفي ليتبعها شخص آخر أو حاسوب.",
            ),
          ),

          contentSlide(
            "decompose-test-improve",
            bilingual(
              "Test and improve",
              "اختبر وحسّن",
            ),
            bilingual(
              "A working algorithm is not always the best algorithm. Test normal cases and edge cases, compare different solutions, and look for unnecessary steps.",
              "الخوارزمية التي تعمل ليست دائمًا الأفضل. اختبر الحالات العادية والاستثنائية، وقارن بين حلول مختلفة، وابحث عن الخطوات غير الضرورية.",
            ),
          ),

          contentSlide(
            "robot-maze",
            bilingual(
              "Human robot maze",
              "متاهة الروبوت البشري",
            ),
            bilingual(
              "Write commands that guide a robot through a grid without vague words. Include a decision for a blocked path. Test the algorithm, count its steps, and try to shorten it without changing the result.",
              "اكتب أوامر تقود روبوتًا عبر شبكة دون كلمات غامضة. أضف قرارًا عند وجود طريق مسدود. اختبر الخوارزمية، وعدّ خطواتها، وحاول تقصيرها دون تغيير النتيجة.",
            ),
            "task",
          ),

          quizSlide(
            "algorithm-quiz",
            bilingual(
              "Algorithm check",
              "اختبار الخوارزمية",
            ),
            bilingual(
              "What should you do when an algorithm fails only on an empty input?",
              "ماذا تفعل إذا فشلت الخوارزمية فقط عندما يكون المدخل فارغًا؟",
            ),
            [
              bilingual(
                "Ignore it because most inputs work",
                "تتجاهله لأن معظم المدخلات تعمل",
              ),
              bilingual(
                "Add and test a rule for that edge case",
                "تضيف قاعدة لتلك الحالة الاستثنائية وتختبرها",
              ),
              bilingual(
                "Make every step longer",
                "تجعل كل خطوة أطول",
              ),
              bilingual(
                "Replace the output with the input",
                "تستبدل المخرج بالمدخل",
              ),
            ],
            1,
          ),

          contentSlide(
            "algorithm-summary",
            bilingual(
              "Precision, testing, improvement",
              "الدقة والاختبار والتحسين",
            ),
            bilingual(
              "An algorithm is valuable when it is clear, correct, finite, and testable. Expert problem solvers search for exceptions and improve a working solution instead of stopping at the first answer.",
              "تكون الخوارزمية مفيدة عندما تكون واضحة وصحيحة ومحدودة وقابلة للاختبار. ويبحث حلالو المشكلات الخبراء عن الاستثناءات ويحسّنون الحل العامل بدل التوقف عند أول إجابة.",
            ),
            "summary",
          ),

          contentSlide(
            "algorithm-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Can two different algorithms solve the same problem? How would you decide which one is better?",
              "هل يمكن لخوارزميتين مختلفتين حل المشكلة نفسها؟ وكيف تقرر أيهما أفضل؟",
            ),
          ),
        ],
      },

      /* =====================================================
         5. CODING BUILDING BLOCKS
      ===================================================== */
      {
        id: "coding-building-blocks",

        title: bilingual(
          "Coding Building Blocks",
          "لبنات بناء البرمجة",
        ),

        description: bilingual(
          "Use sequence, variables, conditions, and loops to model interactive programs.",
          "استخدم التسلسل والمتغيرات والشروط والحلقات لبناء نماذج لبرامج تفاعلية.",
        ),

        ...lessonVisuals(
          "coding-building-blocks",
          bilingual(
            "Children building a colorful game with visual code blocks",
            "أطفال يبنون لعبة ملونة باستخدام لبنات برمجية مرئية",
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
            bilingual(
              "From algorithm to program",
              "من الخوارزمية إلى البرنامج",
            ),
            bilingual(
              "Code expresses an algorithm in a programming language. Sequence controls order, variables remember changing values, conditions choose between paths, and loops repeat useful actions.",
              "يعبّر الكود عن الخوارزمية بلغة برمجة. يتحكم التسلسل في الترتيب، وتحفظ المتغيرات القيم المتغيرة، وتختار الشروط بين المسارات، وتكرر الحلقات الأفعال المفيدة.",
            ),
          ),

          contentSlide(
            "trace-a-program",
            bilingual(
              "Predict before running",
              "تنبأ قبل التشغيل",
            ),
            bilingual(
              "Programmers trace code by following it step by step and recording variable values. Prediction reveals misunderstandings early and makes debugging a reasoning process rather than random guessing.",
              "يتتبّع المبرمجون الكود باتباعه خطوة خطوة وتسجيل قيم المتغيرات. يكشف التنبؤ سوء الفهم مبكرًا ويجعل تصحيح الأخطاء عملية تفكير بدل التخمين العشوائي.",
            ),
          ),

          contentSlide(
            "design-a-program",
            bilingual(
              "Design a small interactive program",
              "صمّم برنامجًا تفاعليًا صغيرًا",
            ),
            bilingual(
              "Plan a program using pseudocode. Include one variable, one condition, and one loop. Trace two different inputs and revise any unclear step.",
              "خطط لبرنامج باستخدام شبه الكود. أضف متغيرًا واحدًا وشرطًا واحدًا وحلقة تكرار واحدة. تتبّع مدخلين مختلفين وعدّل أي خطوة غير واضحة.",
            ),
            "task",
          ),

          quizSlide(
            "coding-quiz",
            bilingual(
              "Code concepts",
              "مفاهيم البرمجة",
            ),
            bilingual(
              "Which tool is best for repeating an action ten times?",
              "ما الأداة الأنسب لتكرار فعل عشر مرات؟",
            ),
            [
              bilingual("A variable", "متغير"),
              bilingual("A loop", "حلقة تكرار"),
              bilingual("An output device", "جهاز إخراج"),
              bilingual("A file name", "اسم ملف"),
            ],
            1,
          ),

          contentSlide(
            "coding-summary",
            bilingual(
              "Small blocks, powerful programs",
              "لبنات صغيرة وبرامج قوية",
            ),
            bilingual(
              "Complex programs grow from a few reusable ideas: ordered steps, stored values, choices, and repetition. Tracing and debugging connect the code you wrote to the behavior you observe.",
              "تنمو البرامج المعقدة من أفكار قليلة قابلة لإعادة الاستخدام: خطوات مرتبة، وقيم مخزنة، واختيارات، وتكرار. ويربط التتبّع وتصحيح الأخطاء بين الكود المكتوب والسلوك الملاحظ.",
            ),
            "summary",
          ),

          contentSlide(
            "coding-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Which coding idea feels most powerful to you: variables, conditions, or loops? Why?",
              "أي فكرة برمجية تشعر أنها الأقوى: المتغيرات أم الشروط أم الحلقات؟ ولماذا؟",
            ),
          ),
        ],
      },

      /* =====================================================
         6. BUILD YOUR FIRST GAME OR PROJECT
      ===================================================== */
      {
        id: "build-first-game-project",

        title: bilingual(
          "Build Your First Game or Project",
          "ابنِ لعبتك أو مشروعك الأول",
        ),

        description: bilingual(
          "Combine coding concepts, events, scoring, interaction, and creativity in a mini-project.",
          "ادمج مفاهيم البرمجة والأحداث والنقاط والتفاعل والإبداع في مشروع صغير.",
        ),

        ...lessonVisuals(
          "build-first-game-project",
          bilingual(
            "Children designing and testing a colorful coding game",
            "أطفال يصممون ويختبرون لعبة برمجية ملونة",
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
            bilingual(
              "A game is a system",
              "اللعبة نظام",
            ),
            bilingual(
              "A simple game still needs a goal, rules, interaction, feedback, and a clear ending. Good creators start small, test often, and improve one feature at a time.",
              "حتى اللعبة البسيطة تحتاج إلى هدف وقواعد وتفاعل وتغذية راجعة ونهاية واضحة. يبدأ المصمم الجيد بشكل بسيط، ويختبر باستمرار، ويحسن ميزة واحدة في كل مرة.",
            ),
          ),

          contentSlide(
            "events-and-score",
            bilingual(
              "Events and score",
              "الأحداث والنقاط",
            ),
            bilingual(
              "Events start actions: clicking, touching an object, pressing a key, or reaching a target. A score variable records progress and can be used in a winning condition.",
              "تبدأ الأحداث الأفعال: الضغط، أو لمس جسم، أو الضغط على مفتاح، أو الوصول إلى هدف. ويسجل متغير النقاط التقدم ويمكن استخدامه ضمن شرط الفوز.",
            ),
          ),

          contentSlide(
            "mini-game-builder",
            bilingual(
              "Mini-game builder",
              "صانع اللعبة المصغّرة",
            ),
            bilingual(
              "Build a small game with a player, one goal, one obstacle, and one score rule. Test it with a partner and change one part based on their feedback.",
              "ابنِ لعبة صغيرة فيها لاعب وهدف واحد وعائق واحد وقاعدة واحدة للنقاط. اختبرها مع زميل وعدّل جزءًا واحدًا بناءً على ملاحظاته.",
            ),
            "task",
          ),

          quizSlide(
            "game-quiz",
            bilingual(
              "Game design check",
              "اختبار تصميم اللعبة",
            ),
            bilingual(
              "Which element is most useful for keeping track of a player's points?",
              "أي عنصر هو الأنسب لتتبع نقاط اللاعب؟",
            ),
            [
              bilingual("A variable", "متغير"),
              bilingual("A monitor", "شاشة"),
              bilingual("A folder", "مجلد"),
              bilingual("A password", "كلمة مرور"),
            ],
            0,
          ),

          contentSlide(
            "game-summary",
            bilingual(
              "Build, test, improve",
              "ابنِ واختبر وحسّن",
            ),
            bilingual(
              "Programming projects become stronger through iteration. A first version does not need to be perfect; it needs to be testable so you can learn what to improve.",
              "تصبح المشاريع البرمجية أقوى من خلال التكرار والتحسين. لا يجب أن تكون النسخة الأولى مثالية؛ المهم أن تكون قابلة للاختبار حتى تتعلم ما الذي يحتاج إلى تطوير.",
            ),
            "summary",
          ),

          contentSlide(
            "game-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "If you had twenty more minutes, what feature would you add to your project and why?",
              "لو كان لديك عشرون دقيقة إضافية، ما الميزة التي ستضيفها إلى مشروعك ولماذا؟",
            ),
          ),
        ],
      },

      /* =====================================================
         7. INTERNET, NETWORKS & THE WEB
      ===================================================== */
      {
        id: "internet-networks-web",

        title: bilingual(
          "Internet, Networks & the Web",
          "الإنترنت والشبكات والويب",
        ),

        description: bilingual(
          "Follow data packets across networks and distinguish the internet from the web.",
          "تتبّع حزم البيانات عبر الشبكات، وميّز بين الإنترنت والويب.",
        ),

        ...lessonVisuals(
          "internet-networks-web",
          bilingual(
            "Children following glowing data packets across a world network",
            "أطفال يتتبعون حزم بيانات مضيئة عبر شبكة عالمية",
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
            bilingual(
              "How devices connect",
              "كيف تتصل الأجهزة",
            ),
            bilingual(
              "A network links devices so they can exchange data. The internet connects many networks worldwide. The web is one service that uses the internet, alongside services such as email and online games.",
              "تربط الشبكة الأجهزة لتبادل البيانات. ويربط الإنترنت شبكات كثيرة حول العالم. أما الويب فهو خدمة تستخدم الإنترنت، إلى جانب خدمات مثل البريد الإلكتروني والألعاب عبر الإنترنت.",
            ),
          ),

          contentSlide(
            "packets-addresses-routes",
            bilingual(
              "A message travels in packets",
              "تسافر الرسالة في حزم",
            ),
            bilingual(
              "Large messages are divided into packets. Addresses identify source and destination, routers choose paths, and the receiving device reassembles the pieces. Packets may take different routes and still arrive correctly.",
              "تُقسّم الرسائل الكبيرة إلى حزم. تحدد العناوين المصدر والوجهة، وتختار الموجّهات المسارات، ويعيد جهاز الاستقبال تجميع القطع. وقد تسلك الحزم طرقًا مختلفة وتصل صحيحة.",
            ),
          ),

          contentSlide(
            "packet-role-play",
            bilingual(
              "Route a classroom message",
              "وجّه رسالة صفية",
            ),
            bilingual(
              "Split a sentence into numbered packet cards. Send them through different student routers, deliberately delay one packet, then reconstruct the message. Record which information made recovery possible.",
              "قسّم جملة إلى بطاقات حزم مرقمة. أرسلها عبر طلاب يمثلون موجّهات مختلفة، وأخّر حزمة عمدًا، ثم أعد بناء الرسالة. سجّل المعلومات التي جعلت الاستعادة ممكنة.",
            ),
            "task",
          ),

          quizSlide(
            "network-quiz",
            bilingual(
              "Network check",
              "اختبار الشبكات",
            ),
            bilingual(
              "What is the relationship between the web and the internet?",
              "ما العلاقة بين الويب والإنترنت؟",
            ),
            [
              bilingual(
                "They are exactly the same thing",
                "هما الشيء نفسه تمامًا",
              ),
              bilingual(
                "The internet is a website",
                "الإنترنت موقع ويب",
              ),
              bilingual(
                "The web is a service that uses the internet",
                "الويب خدمة تستخدم الإنترنت",
              ),
              bilingual(
                "The web works only without networks",
                "يعمل الويب فقط دون شبكات",
              ),
            ],
            2,
          ),

          contentSlide(
            "network-summary",
            bilingual(
              "Reliable communication",
              "اتصال موثوق",
            ),
            bilingual(
              "Networks use shared rules called protocols to move addressed packets. The internet is the infrastructure connecting networks; the web organizes linked resources that travel across it.",
              "تستخدم الشبكات قواعد مشتركة تسمّى البروتوكولات لنقل الحزم المعنونة. الإنترنت هو البنية التي تربط الشبكات، والويب ينظّم الموارد المترابطة التي تنتقل عبرها.",
            ),
            "summary",
          ),

          contentSlide(
            "network-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Why is it useful that packets can take different routes to the same destination?",
              "لماذا من المفيد أن تستطيع الحزم سلوك مسارات مختلفة للوصول إلى الوجهة نفسها؟",
            ),
          ),
        ],
      },

      /* =====================================================
         8. CYBERSECURITY & DIGITAL CITIZENSHIP
      ===================================================== */
      {
        id: "cybersecurity-digital-citizenship",

        title: bilingual(
          "Cybersecurity & Digital Citizenship",
          "الأمن السيبراني والمواطنة الرقمية",
        ),

        description: bilingual(
          "Practice threat-aware decisions, account protection, privacy, and respectful online behavior.",
          "تدرّب على إدراك المخاطر وحماية الحسابات والخصوصية والسلوك المسؤول عبر الإنترنت.",
        ),

        ...lessonVisuals(
          "cybersecurity-digital-citizenship",
          bilingual(
            "Children using a digital shield and privacy controls safely",
            "أطفال يستخدمون درعًا رقميًا وأدوات الخصوصية بأمان",
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
            bilingual(
              "Protect people and information",
              "احمِ الناس والمعلومات",
            ),
            bilingual(
              "Cybersecurity protects confidentiality, integrity, and availability: information should reach the right people, remain accurate, and be accessible when needed. Security is a habit of managing risk, not a promise of zero risk.",
              "يحمي الأمن السيبراني السرية والسلامة والتوافر: يجب أن تصل المعلومات إلى الأشخاص المناسبين، وأن تبقى صحيحة، وأن تتوفر عند الحاجة. الأمان عادة لإدارة المخاطر، وليس وعدًا بانعدامها.",
            ),
          ),

          contentSlide(
            "defense-in-depth",
            bilingual(
              "Layers of protection",
              "طبقات الحماية",
            ),
            bilingual(
              "Use unique passphrases, multi-factor authentication, updates, careful permissions, and backups. Pause before opening urgent messages: verify the sender through another trusted channel and never share a verification code.",
              "استخدم عبارات مرور فريدة، والتحقق متعدد العوامل، والتحديثات، والأذونات المدروسة، والنسخ الاحتياطي. توقّف قبل فتح الرسائل العاجلة، وتحقق من المرسل عبر قناة موثوقة أخرى، ولا تشارك رمز التحقق أبدًا.",
            ),
          ),

          contentSlide(
            "phishing-investigation",
            bilingual(
              "Investigate a suspicious message",
              "حقق في رسالة مشبوهة",
            ),
            bilingual(
              "Create a fictional suspicious message, then mark its warning signs: pressure, strange address, unexpected link, request for secrets, or an offer too good to be true. Rewrite it as a safe verification plan.",
              "أنشئ رسالة مشبوهة خيالية، ثم حدّد إشارات التحذير فيها: الضغط، أو عنوان غريب، أو رابط غير متوقع، أو طلب أسرار، أو عرض غير واقعي. أعد كتابتها كخطة تحقق آمنة.",
            ),
            "task",
          ),

          quizSlide(
            "security-quiz",
            bilingual(
              "Safety decision",
              "قرار آمن",
            ),
            bilingual(
              "A friend urgently asks for your login verification code. What is safest?",
              "يطلب صديق بشكل عاجل رمز التحقق لتسجيل دخولك. ما التصرف الأكثر أمانًا؟",
            ),
            [
              bilingual(
                "Send it because the request is urgent",
                "ترسله لأن الطلب عاجل",
              ),
              bilingual(
                "Post it in the group so others can check",
                "تنشره في المجموعة ليتحقق الآخرون",
              ),
              bilingual(
                "Do not share it; contact the friend another way",
                "لا تشاركه وتتواصل مع الصديق بطريقة أخرى",
              ),
              bilingual(
                "Reuse it as your password",
                "تعيد استخدامه ككلمة مرور",
              ),
            ],
            2,
          ),

          contentSlide(
            "security-summary",
            bilingual(
              "Stop, check, protect, report",
              "توقف وتحقق واحمِ وأبلغ",
            ),
            bilingual(
              "Responsible digital citizens protect accounts and privacy, question unexpected requests, communicate respectfully, and ask a trusted adult for help when something feels unsafe.",
              "يحمي المواطنون الرقميون المسؤولون الحسابات والخصوصية، ويتحققون من الطلبات غير المتوقعة، ويتواصلون باحترام، ويطلبون مساعدة شخص بالغ موثوق عند الشعور بعدم الأمان.",
            ),
            "summary",
          ),

          contentSlide(
            "security-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "What is one online habit you would change after this lesson?",
              "ما العادة الرقمية التي ستغيّرها بعد هذا الدرس؟",
            ),
          ),
        ],
      },

      /* =====================================================
         9. WHAT IS ARTIFICIAL INTELLIGENCE?
      ===================================================== */
      {
        id: "what-is-artificial-intelligence",

        title: bilingual(
          "What Is Artificial Intelligence?",
          "ما هو الذكاء الاصطناعي؟",
        ),

        description: bilingual(
          "Distinguish AI systems from regular software and explore where artificial intelligence is used.",
          "ميّز بين أنظمة الذكاء الاصطناعي والبرامج العادية واستكشف أين يُستخدم الذكاء الاصطناعي.",
        ),

        ...lessonVisuals(
          "what-is-artificial-intelligence",
          bilingual(
            "Children exploring examples of artificial intelligence in everyday technology",
            "أطفال يستكشفون أمثلة للذكاء الاصطناعي في التكنولوجيا اليومية",
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
            bilingual(
              "AI is not magic",
              "الذكاء الاصطناعي ليس سحرًا",
            ),
            bilingual(
              "Artificial intelligence describes computer systems designed to perform tasks that often require human-like abilities such as recognizing patterns, understanding language, making predictions, or generating content.",
              "يصف الذكاء الاصطناعي أنظمة حاسوبية مصممة لتنفيذ مهام تحتاج غالبًا إلى قدرات شبيهة بالبشر مثل اكتشاف الأنماط وفهم اللغة وإجراء التنبؤات أو إنشاء المحتوى.",
            ),
          ),

          contentSlide(
            "ai-versus-rules",
            bilingual(
              "AI or ordinary program?",
              "ذكاء اصطناعي أم برنامج عادي؟",
            ),
            bilingual(
              "Some software follows fixed rules written directly by programmers. Many AI systems instead learn patterns from data or examples. Both are programs, but they may solve problems in different ways.",
              "تتبع بعض البرامج قواعد ثابتة يكتبها المبرمجون مباشرة. أما أنظمة ذكاء اصطناعي كثيرة فتتعلم الأنماط من البيانات أو الأمثلة. كلاهما برامج، لكنهما قد يحلان المشكلات بطرق مختلفة.",
            ),
          ),

          contentSlide(
            "ai-or-not-task",
            bilingual(
              "AI or not AI?",
              "AI أم ليس AI؟",
            ),
            bilingual(
              "Classify everyday technologies into likely AI and non-AI examples. For each choice, explain what evidence supports your decision.",
              "صنّف تقنيات يومية إلى أمثلة يُرجّح أنها تستخدم AI وأخرى لا تستخدمه، واشرح الدليل الذي يدعم كل اختيار.",
            ),
            "task",
          ),

          quizSlide(
            "ai-intro-quiz",
            bilingual(
              "AI check",
              "اختبار AI",
            ),
            bilingual(
              "Which example is most likely to use artificial intelligence?",
              "أي مثال من المرجّح أكثر أن يستخدم الذكاء الاصطناعي؟",
            ),
            [
              bilingual(
                "Photo face recognition",
                "التعرّف على الوجوه في الصور",
              ),
              bilingual(
                "A basic calculator",
                "آلة حاسبة بسيطة",
              ),
              bilingual(
                "A light switch",
                "مفتاح ضوء",
              ),
              bilingual(
                "A paper notebook",
                "دفتر ورقي",
              ),
            ],
            0,
          ),

          contentSlide(
            "ai-intro-summary",
            bilingual(
              "Ask what the system is doing",
              "اسأل ماذا يفعل النظام",
            ),
            bilingual(
              "AI is a broad field. A useful question is not only 'Is this AI?' but also 'What task is the system doing, what information does it use, and how reliable is the result?'",
              "الذكاء الاصطناعي مجال واسع. والسؤال المفيد ليس فقط: \"هل هذا AI؟\" بل أيضًا: ما المهمة التي ينفذها النظام؟ وما المعلومات التي يستخدمها؟ وما مدى موثوقية النتيجة؟",
            ),
            "summary",
          ),

          contentSlide(
            "ai-intro-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "Name one useful AI application and one concern people should think about before using it.",
              "اذكر استخدامًا مفيدًا واحدًا للذكاء الاصطناعي وقلقًا واحدًا يجب التفكير فيه قبل استخدامه.",
            ),
          ),
        ],
      },

      /* =====================================================
         10. HOW DOES AI LEARN?
      ===================================================== */
      {
        id: "how-ai-learns",

        title: bilingual(
          "How Does AI Learn?",
          "كيف يتعلّم الذكاء الاصطناعي؟",
        ),

        description: bilingual(
          "Explore training data, examples, labels, predictions, bias, privacy, and human oversight.",
          "استكشف بيانات التدريب والأمثلة والتصنيفات والتنبؤات والتحيز والخصوصية والإشراف البشري.",
        ),

        ...lessonVisuals(
          "how-ai-learns",
          bilingual(
            "Children training and testing a simple AI classifier",
            "أطفال يدربون ويختبرون مصنّف ذكاء اصطناعي بسيط",
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
            bilingual(
              "Patterns from examples",
              "أنماط من الأمثلة",
            ),
            bilingual(
              "Many AI systems learn statistical patterns from training examples instead of following every rule written by a person. Their output is a prediction, so it can be useful without always being correct.",
              "تتعلم أنظمة ذكاء اصطناعي كثيرة أنماطًا إحصائية من أمثلة التدريب بدل اتباع كل قاعدة يكتبها شخص. ومخرجاتها تنبؤات، لذلك قد تكون مفيدة دون أن تكون صحيحة دائمًا.",
            ),
          ),

          contentSlide(
            "quality-bias-privacy",
            bilingual(
              "Data shapes results",
              "البيانات تشكّل النتائج",
            ),
            bilingual(
              "Missing, incorrect, or unbalanced data can produce unreliable or unfair results. Personal data also deserves protection. People must test systems, explain limits, obtain appropriate permission, and remain responsible for important decisions.",
              "قد تنتج البيانات الناقصة أو الخاطئة أو غير المتوازنة نتائج غير موثوقة أو غير عادلة. وتستحق البيانات الشخصية الحماية. يجب أن يختبر الناس الأنظمة، ويشرحوا حدودها، ويحصلوا على الإذن المناسب، ويتحملوا مسؤولية القرارات المهمة.",
            ),
          ),

          contentSlide(
            "paper-classifier",
            bilingual(
              "Train a paper classifier",
              "درّب مصنّفًا ورقيًا",
            ),
            bilingual(
              "Invent a rule that classifies drawn creatures using a small training set. Let another team test unusual examples. Record errors, inspect whether the examples were balanced, and improve the rule without collecting personal data.",
              "ابتكر قاعدة تصنف مخلوقات مرسومة باستخدام مجموعة تدريب صغيرة. دع فريقًا آخر يختبر أمثلة غير معتادة. سجّل الأخطاء، وافحص توازن الأمثلة، وحسّن القاعدة دون جمع بيانات شخصية.",
            ),
            "task",
          ),

          quizSlide(
            "ai-learning-quiz",
            bilingual(
              "Responsible AI check",
              "اختبار الذكاء الاصطناعي المسؤول",
            ),
            bilingual(
              "Why should people review an AI system's important decisions?",
              "لماذا يجب أن يراجع الناس قرارات نظام الذكاء الاصطناعي المهمة؟",
            ),
            [
              bilingual(
                "AI predictions can be wrong or unfair",
                "قد تكون تنبؤات الذكاء الاصطناعي خاطئة أو غير عادلة",
              ),
              bilingual(
                "AI never uses data",
                "الذكاء الاصطناعي لا يستخدم البيانات أبدًا",
              ),
              bilingual(
                "Computers cannot display results",
                "لا تستطيع الحواسيب عرض النتائج",
              ),
              bilingual(
                "Reviewing always makes data public",
                "المراجعة تجعل البيانات عامة دائمًا",
              ),
            ],
            0,
          ),

          contentSlide(
            "ai-learning-summary",
            bilingual(
              "Curious and critical",
              "فضولي وناقد",
            ),
            bilingual(
              "AI finds patterns and makes predictions from data. Evaluate the evidence, test diverse cases, protect privacy, communicate limitations, and keep humans accountable for how a system is used.",
              "يجد الذكاء الاصطناعي الأنماط ويصنع تنبؤات من البيانات. قيّم الأدلة، واختبر حالات متنوعة، واحمِ الخصوصية، واشرح الحدود، وأبقِ البشر مسؤولين عن طريقة استخدام النظام.",
            ),
            "summary",
          ),

          contentSlide(
            "ai-learning-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "What might happen if an AI system is trained using only one kind of example?",
              "ماذا قد يحدث إذا تم تدريب نظام AI باستخدام نوع واحد فقط من الأمثلة؟",
            ),
          ),
        ],
      },

      /* =====================================================
         11. CREATE AN IMAGE WITH AI
      ===================================================== */
      {
        id: "create-image-with-ai",

        title: bilingual(
          "Create an Image with AI",
          "أنشئ صورة بالذكاء الاصطناعي",
        ),

        description: bilingual(
          "Learn how prompts guide image generation and practice clear, creative, and responsible AI use.",
          "تعلّم كيف توجه الـPrompts إنشاء الصور وتدرّب على استخدام AI بوضوح وإبداع ومسؤولية.",
        ),

        ...lessonVisuals(
          "create-image-with-ai",
          bilingual(
            "Children experimenting with AI image prompts and comparing generated results",
            "أطفال يجربون أوامر إنشاء صور بالذكاء الاصطناعي ويقارنون النتائج",
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
            bilingual(
              "A prompt gives direction",
              "الـPrompt يعطي توجيهًا",
            ),
            bilingual(
              "A useful image prompt can describe the subject, setting, style, mood, colors, viewpoint, and purpose. More detail can guide the system, but the result still needs human review.",
              "يمكن للـPrompt الجيد أن يصف الموضوع والمكان والأسلوب والمزاج والألوان وزاوية النظر والهدف. تساعد التفاصيل على توجيه النظام، لكن النتيجة ما زالت تحتاج إلى مراجعة بشرية.",
            ),
          ),

          contentSlide(
            "prompt-improvement",
            bilingual(
              "Improve, compare, revise",
              "حسّن وقارن وعدّل",
            ),
            bilingual(
              "Prompting is an iterative process. Create a first version, compare the result with your intention, change one or two details, and observe how the output changes.",
              "كتابة الـPrompt عملية تكرارية. أنشئ نسخة أولى، وقارن النتيجة بما كنت تقصده، وعدّل تفصيلًا أو تفصيلين، ولاحظ كيف تتغير النتيجة.",
            ),
          ),

          contentSlide(
            "prompt-makeover",
            bilingual(
              "Prompt makeover challenge",
              "تحدّي تطوير الـPrompt",
            ),
            bilingual(
              "Turn a vague prompt such as 'make a robot' into a detailed prompt that includes subject, setting, style, colors, mood, and purpose. Compare the two results and explain which prompt communicated your idea better.",
              "حوّل Prompt عام مثل \"اصنع روبوتًا\" إلى Prompt مفصّل يحدد الموضوع والمكان والأسلوب والألوان والمزاج والهدف. قارن بين النتيجتين واشرح أي Prompt عبّر عن فكرتك بشكل أفضل.",
            ),
            "task",
          ),

          quizSlide(
            "prompt-quiz",
            bilingual(
              "Prompt check",
              "اختبار الـPrompt",
            ),
            bilingual(
              "Which prompt gives the clearest direction?",
              "أي Prompt يعطي توجيهًا أوضح؟",
            ),
            [
              bilingual(
                "Make something nice",
                "اصنع شيئًا جميلًا",
              ),
              bilingual(
                "Create a friendly blue robot helping children in a bright science lab, cartoon style",
                "أنشئ روبوتًا أزرق ودودًا يساعد الأطفال في مختبر علوم مضيء بأسلوب كرتوني",
              ),
              bilingual(
                "Picture",
                "صورة",
              ),
              bilingual(
                "Do AI",
                "اعمل AI",
              ),
            ],
            1,
          ),

          contentSlide(
            "responsible-generation",
            bilingual(
              "Create responsibly",
              "أنشئ بمسؤولية",
            ),
            bilingual(
              "Do not assume generated images are automatically accurate or appropriate. Check details carefully, avoid harmful or misleading uses, respect privacy, and be transparent when AI helped create an image.",
              "لا تفترض أن الصور المولدة دقيقة أو مناسبة تلقائيًا. افحص التفاصيل بعناية، وتجنب الاستخدامات المؤذية أو المضللة، واحترم الخصوصية، وكن واضحًا عندما يساعد AI في إنشاء الصورة.",
            ),
            "summary",
          ),

          contentSlide(
            "prompt-reflection",
            bilingual(
              "Reflection",
              "تأمل",
            ),
            bilingual(
              "How can you decide whether an AI-generated image really matches your intention?",
              "كيف تقرر ما إذا كانت الصورة الناتجة عن AI تطابق فعلًا ما كنت تقصده؟",
            ),
          ),
        ],
      },

      /* =====================================================
         12. INNOVATION LAB: FINAL PROJECT
      ===================================================== */
      {
        id: "innovation-capstone",

        title: bilingual(
          "Innovation Lab: Final Project",
          "مختبر الابتكار: المشروع النهائي",
        ),

        description: bilingual(
          "Apply the full design cycle to propose, prototype, test, and present a responsible technology solution.",
          "طبّق دورة التصميم الكاملة لاقتراح حل تقني مسؤول وبناء نموذجه واختباره وعرضه.",
        ),

        ...lessonVisuals(
          "innovation-capstone",
          bilingual(
            "Young innovators presenting and testing a responsible technology project",
            "مبتكرون صغار يعرضون مشروعًا تقنيًا مسؤولًا ويختبرونه",
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
            bilingual(
              "Start with a real need",
              "ابدأ بحاجة حقيقية",
            ),
            bilingual(
              "Observe your school or community and define one specific problem. Interview users with permission. Separate evidence from assumptions, then write: Who needs help, what happens now, and what successful change would look like?",
              "راقب مدرستك أو مجتمعك وحدد مشكلة واحدة واضحة. قابل المستخدمين بإذن. افصل الأدلة عن الافتراضات، ثم اكتب: من يحتاج المساعدة؟ ماذا يحدث الآن؟ وكيف يبدو التغيير الناجح؟",
            ),
          ),

          contentSlide(
            "solution-blueprint",
            bilingual(
              "Design the system",
              "صمّم النظام",
            ),
            bilingual(
              "Draw the input–process–output model, write the core algorithm, identify hardware and software, and explain whether a network, data, coding, or AI is needed. Choose the simplest technology that can test your idea.",
              "ارسم نموذج الإدخال والمعالجة والإخراج، واكتب الخوارزمية الأساسية، وحدد العتاد والبرمجيات، واشرح هل تحتاج إلى شبكة أو بيانات أو برمجة أو AI. اختر أبسط تقنية تستطيع اختبار فكرتك.",
            ),
          ),

          contentSlide(
            "prototype-test",
            bilingual(
              "Prototype, test, improve",
              "ابنِ نموذجًا واختبره وحسّنه",
            ),
            bilingual(
              "Build a paper, slide, block-code, AI-assisted, or physical prototype. Give testers a realistic task without coaching them. Record what worked, what confused them, and one change supported by evidence.",
              "ابنِ نموذجًا ورقيًا أو عرضًا أو كودًا باللبنات أو نموذجًا بمساعدة AI أو نموذجًا ماديًا. أعطِ المختبرين مهمة واقعية دون توجيه. سجّل ما نجح وما أربكهم وتغييرًا واحدًا تدعمه الأدلة.",
            ),
            "task",
          ),

          contentSlide(
            "responsibility-review",
            bilingual(
              "Responsibility review",
              "مراجعة المسؤولية",
            ),
            bilingual(
              "List possible safety, privacy, fairness, accessibility, and environmental effects. Reduce unnecessary data collection, add a safe failure plan, and explain which decisions must remain under human control.",
              "اكتب الآثار المحتملة على الأمان والخصوصية والعدالة وإمكانية الوصول والبيئة. قلّل جمع البيانات غير الضرورية، وأضف خطة فشل آمن، واشرح القرارات التي يجب أن تبقى تحت تحكم البشر.",
            ),
            "task",
          ),

          quizSlide(
            "capstone-quiz",
            bilingual(
              "Design cycle check",
              "اختبار دورة التصميم",
            ),
            bilingual(
              "Which result provides the strongest reason to improve a prototype?",
              "أي نتيجة تقدم أقوى سبب لتحسين النموذج الأولي؟",
            ),
            [
              bilingual(
                "The designer likes its color",
                "يعجب المصمم لونه",
              ),
              bilingual(
                "Several users cannot complete the intended task",
                "لا يستطيع عدة مستخدمين إكمال المهمة المطلوبة",
              ),
              bilingual(
                "The first idea was created quickly",
                "أُنشئت الفكرة الأولى بسرعة",
              ),
              bilingual(
                "The title contains a technology word",
                "يحتوي العنوان على كلمة تقنية",
              ),
            ],
            1,
          ),

          contentSlide(
            "present-reflect",
            bilingual(
              "Present the journey",
              "اعرض الرحلة",
            ),
            bilingual(
              "Present the problem, evidence, algorithm, prototype, test results, improvements, and responsibility choices. End with what you would investigate next. Innovation is not only inventing—it is learning carefully from people and evidence.",
              "اعرض المشكلة والأدلة والخوارزمية والنموذج ونتائج الاختبار والتحسينات وقرارات المسؤولية. اختم بما ستبحثه لاحقًا. الابتكار ليس اختراعًا فقط، بل تعلّم متأنٍ من الناس والأدلة.",
            ),
            "summary",
          ),

          contentSlide(
            "capstone-reflection",
            bilingual(
              "Final reflection",
              "التأمل النهائي",
            ),
            bilingual(
              "What are you most proud of in your project, what was the hardest part, and what would you improve next?",
              "ما أكثر شيء تفخر به في مشروعك؟ وما أصعب جزء؟ وما الذي ستطوره لاحقًا؟",
            ),
          ),
        ],
      },
    ],
  },
];

module.exports = {
  programs,
  target,
};
