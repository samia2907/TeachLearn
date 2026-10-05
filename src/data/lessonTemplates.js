import mission01 from "./missions/computer-science-modern-technology/mission01";
import mission02 from "./missions/computer-science-modern-technology/mission-02-dead-computer";
import mission03 from "./missions/computer-science-modern-technology/mission-03-secret-message";
import mission04 from "./missions/computer-science-modern-technology/mission-04-data-packet-journey";
import mission05 from "./missions/computer-science-modern-technology/mission-05-lab-intrusion";
import mission06 from "./missions/computer-science-modern-technology/mission-06-save-the-lab";
const lessonTemplates = [
  mission01,
  mission02,
  mission03,
  mission04,
  mission05,
  mission06,
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
    },

    summary: {
      en: "Investigate how AI works, test its answers, improve prompts, and design your own AI solution.",
      ar: "حقق في طريقة عمل الذكاء الاصطناعي، اختبر إجاباته، حسّن الأوامر، وصمّم حل AI خاصًا بك.",
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
        },

        text: {
          en: "A mysterious technology can recognize faces, recommend videos, create pictures and answer questions. But is everything it does really intelligent? Your mission is to investigate AI and discover what it can — and cannot — do.",

          ar: "هناك تقنية غامضة تستطيع التعرّف على الوجوه، اقتراح الفيديوهات، إنشاء الصور والإجابة عن الأسئلة. لكن هل كل ما تفعله يُعتبر ذكاءً فعلًا؟ مهمتك اليوم أن تحقق في عالم AI وتكتشف ما يستطيع فعله وما لا يستطيع.",
        },

        note: {
          en: "Do not look for one correct answer. Think like an investigator and justify your ideas.",

          ar: "لا تبحث عن إجابة واحدة صحيحة. فكّر كمحقق وحاول تبرير أفكارك.",
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
        },

        introduction: {
          en: "Not every smart-looking technology uses artificial intelligence. Decide which systems probably use AI and explain your reasoning.",

          ar: "ليس كل جهاز أو برنامج يبدو ذكيًا يستخدم الذكاء الاصطناعي. قرر أي الأنظمة التالية قد تستخدم AI واشرح سبب قرارك.",
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
        },

        answerPrompt: {
          en: "Choose two examples and explain your reasoning:",

          ar: "اختر مثالين واشرح سبب قرارك:",
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
        },

        text: {
          en: "Imagine a computer has never seen a cat. You show it 5,000 pictures labeled 'cat' and 'not cat'. Later you show it a completely new picture. How could it possibly guess whether the new picture contains a cat?",

          ar: "تخيّل أن حاسوبًا لم يرَ قطة من قبل. عرضنا عليه 5000 صورة مكتوب عليها «قطة» أو «ليست قطة». بعد ذلك أعطيناه صورة جديدة تمامًا. كيف يمكن أن يحاول معرفة إن كانت الصورة تحتوي على قطة؟",
        },

        note: {
          en: "Think about patterns the system may discover from many examples.",

          ar: "فكّر بالأنماط التي قد يكتشفها النظام من عدد كبير من الأمثلة.",
        },
      },

      {
        id: "ai-training",

        type: "content",

        icon: "📊",

        title: {
          en: "Training From Examples",
          ar: "التدريب من الأمثلة",
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
        },

        question: {
          en: "You train an AI to recognize dogs, but almost all training pictures show only white dogs. What problem might happen?",

          ar: "درّبت نظام AI للتعرّف على الكلاب، لكن معظم صور التدريب تحتوي فقط على كلاب بيضاء. ما المشكلة التي قد تحدث؟",
        },

        options: [
          {
            id: "a",
            text: {
              en: "It may struggle with dogs that look different from the training examples.",
              ar: "قد يواجه صعوبة مع كلاب تختلف عن أمثلة التدريب.",
            },
          },
          {
            id: "b",
            text: {
              en: "It will automatically become perfect.",
              ar: "سيصبح النظام مثاليًا تلقائيًا.",
            },
          },
          {
            id: "c",
            text: {
              en: "Training data never affects an AI system.",
              ar: "بيانات التدريب لا تؤثر أبدًا على نظام AI.",
            },
          },
        ],

        correctAnswer: "a",

        explanation: {
          en: "Exactly. AI depends heavily on the examples it learns from. Limited training data can lead to weaker results.",

          ar: "بالضبط. تعتمد أنظمة AI كثيرًا على الأمثلة التي تتعلم منها. البيانات المحدودة قد تؤدي إلى نتائج أضعف.",
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
        },

        introduction: {
          en: "Now you will test how the instructions you give an AI can change its result.",

          ar: "الآن ستختبر كيف يمكن لطريقة كتابة التعليمات للذكاء الاصطناعي أن تغيّر النتيجة.",
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
        },

        answerPrompt: {
          en: "What changed between your first and best prompt?",

          ar: "ما الذي تغير بين الـPrompt الأول وأفضل Prompt كتبته؟",
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
        },

        introduction: {
          en: "Your job is no longer to ask AI for an answer. Your job is to evaluate the answer like a scientist.",

          ar: "مهمتك الآن ليست الحصول على إجابة من AI، بل تقييم الإجابة مثل عالم.",
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
        },

        answerPrompt: {
          en: "Which claim did you decide to verify, and how would you check it?",

          ar: "أي معلومة قررت التحقق منها؟ وكيف ستفحصها؟",
        },
      },

      /* =================================
         10 — MAIN DESIGN CHALLENGE
      ================================= */

      {
        id: "design-your-ai",

        type: "task",

        icon: "🚀",

        title: {
          en: "Main Challenge — Design Your Own AI System",
          ar: "التحدي الرئيسي — صمّم نظام AI خاصًا بك",
        },

        introduction: {
          en: "A school has hired you as an AI inventor. Design an AI system that solves a real problem — but you must explain how it works, not only give it a cool name.",

          ar: "اختارتك المدرسة لتكون مخترع AI. صمّم نظام ذكاء اصطناعي يحل مشكلة حقيقية، لكن عليك أن تشرح كيف سيعمل وليس فقط أن تعطيه اسمًا جميلًا.",
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
        },

        answerPrompt: {
          en: "Present your AI invention: problem, data, input, output, possible mistake and human control.",

          ar: "اعرض اختراعك: المشكلة، البيانات، Input، Output، خطأ محتمل وكيف سيتحكم الإنسان بالنظام.",
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
        },

        introduction: {
          en: "A great invention also needs a critic. Try to find a weakness in your own AI idea.",

          ar: "المخترع القوي لا يدافع فقط عن فكرته، بل يبحث أيضًا عن نقاط ضعفها.",
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
        },

        answerPrompt: {
          en: "What is the biggest weakness in your AI system, and how would you improve it?",

          ar: "ما أكبر نقطة ضعف في نظام AI الخاص بك؟ وكيف ستحسنها؟",
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
        },

        question: {
          en: "An AI gives you a very confident answer. What is the smartest response?",

          ar: "أعطاك AI إجابة تبدو واثقة جدًا. ما التصرف الأذكى؟",
        },

        options: [
          {
            id: "a",
            text: {
              en: "Believe it because AI cannot make mistakes.",
              ar: "أصدقها لأن AI لا يخطئ.",
            },
          },
          {
            id: "b",
            text: {
              en: "Check important claims and think about whether the answer makes sense.",
              ar: "أتحقق من المعلومات المهمة وأفكر إن كانت الإجابة منطقية.",
            },
          },
          {
            id: "c",
            text: {
              en: "Copy the answer immediately without reading it.",
              ar: "أنسخ الإجابة مباشرة دون قراءتها.",
            },
          },
        ],

        correctAnswer: "b",

        explanation: {
          en: "Exactly. Good AI users do not only generate answers — they evaluate them.",

          ar: "بالضبط. المستخدم الجيد للذكاء الاصطناعي لا يكتفي بالحصول على إجابة، بل يقوم بتقييمها أيضًا.",
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
        },

        question: {
          en: "After today's investigation, what is one thing you would NEVER assume about artificial intelligence again? Explain your answer.",

          ar: "بعد تحقيق اليوم، ما الشيء الذي لن تفترضه بعد الآن عن الذكاء الاصطناعي؟ اشرح إجابتك.",
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
  },

  summary: {
    en: "Explore the main parts of a computer and discover how they work together to process information.",
    ar: "اكتشف الأجزاء الأساسية للحاسوب وكيف تعمل معًا لمعالجة المعلومات وتنفيذ الأوامر.",
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
      },

      text: {
        en: "When you press a key on the keyboard, how does the letter appear on the screen almost instantly?",

        ar: "عندما تضغط على حرف في لوحة المفاتيح، كيف يظهر هذا الحرف على الشاشة خلال جزء صغير من الثانية؟",
      },

      note: {
        en: "Write your own prediction. You do not need to know the correct answer yet.",

        ar: "اكتب توقعك الخاص، لا تحتاج أن تعرف الإجابة الصحيحة بعد.",
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
      },

      items: [
        {
          icon: "⌨️",

          title: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
          },

          text: {
            en: "Hardware — a physical device that sends information to the computer.",
            ar: "Hardware — جهاز مادي يرسل المعلومات إلى الحاسوب.",
          },
        },

        {
          icon: "🌐",

          title: {
            en: "Web Browser",
            ar: "متصفح الإنترنت",
          },

          text: {
            en: "Software — a program used to visit websites.",
            ar: "Software — برنامج نستخدمه لزيارة مواقع الإنترنت.",
          },
        },

        {
          icon: "🖱️",

          title: {
            en: "Mouse",
            ar: "الفأرة",
          },

          text: {
            en: "Hardware — an input device.",
            ar: "Hardware — جهاز إدخال.",
          },
        },

        {
          icon: "🎮",

          title: {
            en: "Game",
            ar: "لعبة حاسوب",
          },

          text: {
            en: "Software — instructions executed by the computer.",
            ar: "Software — برنامج يحتوي على تعليمات ينفذها الحاسوب.",
          },
        },

        {
          icon: "🖥️",

          title: {
            en: "Monitor",
            ar: "الشاشة",
          },

          text: {
            en: "Hardware — displays information to the user.",
            ar: "Hardware — تعرض المعلومات للمستخدم.",
          },
        },

        {
          icon: "📝",

          title: {
            en: "Text Editor",
            ar: "برنامج كتابة",
          },

          text: {
            en: "Software — used to create and edit text.",
            ar: "Software — برنامج لإنشاء النصوص وتعديلها.",
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
      },

      question: {
        en: "Which one is software?",
        ar: "أي واحد من التالي هو Software؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
          },
        },

        {
          id: "b",

          text: {
            en: "Google Chrome",
            ar: "Google Chrome",
          },
        },

        {
          id: "c",

          text: {
            en: "Monitor",
            ar: "الشاشة",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Google Chrome is a program, so it is software.",

        ar: "صحيح! Google Chrome هو برنامج، ولذلك يعتبر Software.",
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
      },

      items: [
        {
          icon: "⌨️",

          title: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
          },
        },

        {
          icon: "🎤",

          title: {
            en: "Microphone",
            ar: "الميكروفون",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
          },
        },

        {
          icon: "🖥️",

          title: {
            en: "Screen",
            ar: "الشاشة",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
          },
        },

        {
          icon: "🔊",

          title: {
            en: "Speakers",
            ar: "مكبرات الصوت",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
          },
        },

        {
          icon: "📷",

          title: {
            en: "Camera",
            ar: "الكاميرا",
          },

          text: {
            en: "INPUT",
            ar: "إدخال INPUT",
          },
        },

        {
          icon: "🖨️",

          title: {
            en: "Printer",
            ar: "الطابعة",
          },

          text: {
            en: "OUTPUT",
            ar: "إخراج OUTPUT",
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
      },

      question: {
        en: "Which device sends information FROM the computer TO the user?",

        ar: "أي جهاز ينقل المعلومات من الحاسوب إلى المستخدم؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Keyboard",
            ar: "لوحة المفاتيح",
          },
        },

        {
          id: "b",

          text: {
            en: "Microphone",
            ar: "الميكروفون",
          },
        },

        {
          id: "c",

          text: {
            en: "Monitor",
            ar: "الشاشة",
          },
        },
      ],

      correctAnswer: "c",

      explanation: {
        en: "Exactly! A monitor is an output device because the computer sends visual information to it.",

        ar: "بالضبط! الشاشة هي جهاز إخراج لأن الحاسوب يرسل إليها المعلومات ليعرضها للمستخدم.",
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
      },

      introduction: {
        en: "Imagine that YOU are the processor. You must execute instructions exactly in order.",

        ar: "تخيّل أنك أنت المعالج CPU. يجب أن تنفذ التعليمات بالترتيب تمامًا.",
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
      },

      answerPrompt: {
        en: "What result did your CPU produce?",
        ar: "ما هي النتيجة التي حصل عليها الـCPU الخاص بك؟",
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
      },

      question: {
        en: "Where should your homework file be saved if you want it to remain after the computer is turned off?",

        ar: "أين يجب حفظ ملف واجبك إذا أردت أن يبقى موجودًا بعد إطفاء الحاسوب؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "RAM",
            ar: "RAM",
          },
        },

        {
          id: "b",

          text: {
            en: "Storage / SSD",
            ar: "وحدة التخزين / SSD",
          },
        },

        {
          id: "c",

          text: {
            en: "CPU",
            ar: "CPU",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Files that need to remain after shutdown must be stored on permanent storage such as an SSD.",

        ar: "صحيح! الملفات التي نريد الاحتفاظ بها بعد إطفاء الجهاز يجب أن تُحفظ في وحدة تخزين مثل SSD.",
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
      },

      introduction: {
        en: "Choose one action you perform on a computer and explain what parts of the computer are involved.",

        ar: "اختر عملية واحدة تقوم بها على الحاسوب واشرح ما الأجزاء التي تشارك فيها.",
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
      },

      answerPrompt: {
        en: "Describe your chosen action and how the computer processes it:",

        ar: "اشرح العملية التي اخترتها وكيف يعالجها الحاسوب:",
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
      },

      question: {
        en: "Which sequence best describes how a computer handles information?",

        ar: "أي ترتيب يصف بشكل أفضل طريقة تعامل الحاسوب مع المعلومات؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Output → Input → Process",
            ar: "Output ← Input ← Process",
          },
        },

        {
          id: "b",

          text: {
            en: "Input → Process → Output",
            ar: "Input → Process → Output",
          },
        },

        {
          id: "c",

          text: {
            en: "Process → Output → Input",
            ar: "Process → Output → Input",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Excellent! Computers commonly receive input, process the information and then produce output.",

        ar: "ممتاز! يستقبل الحاسوب المعلومات كإدخال، ثم يعالجها، وبعد ذلك يعرض النتيجة كإخراج.",
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
      },

      question: {
        en: "Which computer component was the most interesting to you, and why?",

        ar: "أي جزء من أجزاء الحاسوب كان الأكثر إثارة للاهتمام بالنسبة لك؟ ولماذا؟",
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
  },

  summary: {
    en: "Discover how devices connect, how information travels across networks, and what happens when you open a website.",

    ar: "اكتشف كيف تتصل الأجهزة ببعضها، وكيف تنتقل المعلومات عبر الشبكات، وماذا يحدث عندما تفتح موقعًا على الإنترنت.",
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
      },

      text: {
        en: "Imagine you send a photo to a friend who lives in another country. How do you think the photo reaches their phone?",

        ar: "تخيّل أنك أرسلت صورة لصديق يعيش في دولة أخرى. كيف تعتقد أن الصورة تصل من هاتفك إلى هاتفه؟",
      },

      note: {
        en: "Write your prediction. There is no problem if you do not know the exact answer yet.",

        ar: "اكتب توقعك. لا مشكلة إن لم تعرف الإجابة الدقيقة بعد.",
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
      },

      question: {
        en: "Which statement is correct?",

        ar: "أي جملة من التالية صحيحة؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "The Internet and the Web are always exactly the same thing.",
            ar: "الإنترنت والويب هما الشيء نفسه تمامًا.",
          },
        },

        {
          id: "b",

          text: {
            en: "The Web is one service that uses the Internet.",
            ar: "الويب هو إحدى الخدمات التي تستخدم الإنترنت.",
          },
        },

        {
          id: "c",

          text: {
            en: "The Internet only contains websites.",
            ar: "الإنترنت يحتوي فقط على مواقع.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! The Web uses the Internet, but many other services use the Internet too.",

        ar: "صحيح! الويب يستخدم الإنترنت، لكن توجد خدمات أخرى كثيرة تستخدم الإنترنت أيضًا.",
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
      },

      items: [
        {
          icon: "📱",

          title: {
            en: "Smartphone",
            ar: "هاتف",
          },

          text: {
            en: "Can connect through Wi-Fi.",
            ar: "يمكنه الاتصال عبر Wi-Fi.",
          },
        },

        {
          icon: "💻",

          title: {
            en: "Laptop",
            ar: "حاسوب محمول",
          },

          text: {
            en: "Can use Wi-Fi or a network cable.",
            ar: "يمكنه استخدام Wi-Fi أو كابل شبكة.",
          },
        },

        {
          icon: "📺",

          title: {
            en: "Smart TV",
            ar: "تلفاز ذكي",
          },

          text: {
            en: "Uses the network to stream videos.",
            ar: "يستخدم الشبكة لمشاهدة الفيديو.",
          },
        },

        {
          icon: "🎮",

          title: {
            en: "Game Console",
            ar: "جهاز ألعاب",
          },

          text: {
            en: "Uses the network for online games.",
            ar: "يستخدم الشبكة للألعاب عبر الإنترنت.",
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
      },

      question: {
        en: "What is one important job of a router?",

        ar: "ما إحدى الوظائف المهمة للـRouter؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Printing documents",
            ar: "طباعة المستندات",
          },
        },

        {
          id: "b",

          text: {
            en: "Directing data between networks",
            ar: "توجيه البيانات بين الشبكات",
          },
        },

        {
          id: "c",

          text: {
            en: "Creating keyboard letters",
            ar: "إنشاء حروف لوحة المفاتيح",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Exactly! Routers help direct network traffic toward its destination.",

        ar: "بالضبط! أجهزة Router تساعد في توجيه حركة البيانات نحو وجهتها.",
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
      },

      introduction: {
        en: "Imagine a restaurant. A customer asks for food and the kitchen prepares the request. How is this similar to a client and a server?",

        ar: "تخيّل مطعمًا. الزبون يطلب وجبة، والمطبخ يستقبل الطلب ويجهزه. كيف يشبه هذا مفهوم Client وServer؟",
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
      },

      answerPrompt: {
        en: "Give your own example of a client requesting something from a server.",

        ar: "اكتب مثالًا من عندك على Client يرسل طلبًا إلى Server.",
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
      },

      introduction: {
        en: "Imagine the sentence 'HELLO INTERNET' must travel across a network.",

        ar: "تخيّل أن العبارة 'HELLO INTERNET' يجب أن تنتقل عبر شبكة.",
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
      },

      answerPrompt: {
        en: "How did you divide the message into packets?",

        ar: "كيف قمت بتقسيم الرسالة إلى Packets؟",
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
      },

      question: {
        en: "Why is DNS useful?",

        ar: "لماذا يعتبر DNS مفيدًا؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "It helps connect domain names with network destinations.",
            ar: "يساعد على ربط أسماء النطاقات بالوجهات على الشبكة.",
          },
        },

        {
          id: "b",

          text: {
            en: "It increases the size of the monitor.",
            ar: "يزيد حجم شاشة الحاسوب.",
          },
        },

        {
          id: "c",

          text: {
            en: "It charges the computer battery.",
            ar: "يشحن بطارية الحاسوب.",
          },
        },
      ],

      correctAnswer: "a",

      explanation: {
        en: "Correct! DNS helps computers find destinations when we use easy-to-remember domain names.",

        ar: "صحيح! DNS يساعد الأجهزة على الوصول للوجهة عندما نستخدم أسماء نطاقات سهلة التذكر.",
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
      },

      introduction: {
        en: "Choose one online activity and trace what may happen behind the scenes.",

        ar: "اختر نشاطًا تستخدمه عبر الإنترنت وحاول تتبع ما يحدث خلف الكواليس.",
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
      },

      answerPrompt: {
        en: "Describe your chosen activity and what you think happens behind the scenes.",

        ar: "اشرح النشاط الذي اخترته وما الذي تعتقد أنه يحدث خلف الكواليس.",
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
      },

      question: {
        en: "Which sequence best describes opening a website?",

        ar: "أي ترتيب يصف بشكل أفضل عملية فتح موقع؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Browser request → Network → Server → Data returns → Browser displays page",

            ar: "طلب من المتصفح → الشبكة → Server → عودة البيانات → عرض الصفحة",
          },
        },

        {
          id: "b",

          text: {
            en: "Keyboard → Printer → Camera → Website",
            ar: "لوحة مفاتيح → طابعة → كاميرا → موقع",
          },
        },

        {
          id: "c",

          text: {
            en: "Server → Computer turns off → Router disappears",
            ar: "Server → إطفاء الحاسوب → اختفاء Router",
          },
        },
      ],

      correctAnswer: "a",

      explanation: {
        en: "Excellent! Your browser sends a request, the request travels through networks to a server, and the returned data is displayed by the browser.",

        ar: "ممتاز! يرسل المتصفح الطلب، وينتقل عبر الشبكات إلى Server، ثم تعود البيانات ليعرضها المتصفح.",
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
      },

      question: {
        en: "What surprised you most about how the Internet works? Explain why.",

        ar: "ما أكثر شيء فاجأك في طريقة عمل الإنترنت؟ اشرح لماذا.",
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
  },

  summary: {
    en: "Learn how to protect personal information, recognize online risks, create safer passwords, and make smart decisions online.",

    ar: "تعلّم كيف تحمي معلوماتك الشخصية، وتتعرف على المخاطر الرقمية، وتنشئ كلمات مرور أقوى، وتتخذ قرارات ذكية أثناء استخدام الإنترنت.",
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
      },

      text: {
        en: "Imagine a person you do not know sends you a message in an online game and asks for your full name, school and phone number. What would you do?",

        ar: "تخيّل أن شخصًا لا تعرفه أرسل لك رسالة داخل لعبة عبر الإنترنت وطلب اسمك الكامل، اسم مدرستك ورقم هاتفك. ماذا ستفعل؟",
      },

      note: {
        en: "Explain your decision, not only yes or no.",

        ar: "اشرح سبب قرارك، ولا تكتب فقط نعم أو لا.",
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
      },

      items: [
        {
          icon: "📞",

          title: {
            en: "Phone Number",
            ar: "رقم الهاتف",
          },

          text: {
            en: "Do not give it to strangers online.",
            ar: "لا تشاركه مع أشخاص غرباء على الإنترنت.",
          },
        },

        {
          icon: "🏠",

          title: {
            en: "Home Address",
            ar: "عنوان المنزل",
          },

          text: {
            en: "Private information that should be protected.",
            ar: "معلومة خاصة يجب حمايتها.",
          },
        },

        {
          icon: "🔑",

          title: {
            en: "Password",
            ar: "كلمة المرور",
          },

          text: {
            en: "Never share your password with other students or strangers.",
            ar: "لا تشارك كلمة المرور مع الطلاب الآخرين أو الغرباء.",
          },
        },

        {
          icon: "🏫",

          title: {
            en: "School Details",
            ar: "تفاصيل المدرسة",
          },

          text: {
            en: "Think carefully before sharing exact details publicly.",
            ar: "فكر جيدًا قبل نشر تفاصيل دقيقة عنها بشكل علني.",
          },
        },

        {
          icon: "🎨",

          title: {
            en: "Favorite Color",
            ar: "اللون المفضل",
          },

          text: {
            en: "Usually less sensitive than your address or password.",
            ar: "غالبًا أقل حساسية من عنوان المنزل أو كلمة المرور.",
          },
        },

        {
          icon: "📍",

          title: {
            en: "Live Location",
            ar: "الموقع الحالي",
          },

          text: {
            en: "Avoid sharing your real-time location publicly.",
            ar: "تجنب مشاركة موقعك الحالي بشكل علني.",
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
      },

      question: {
        en: "Which information should NEVER be posted publicly?",

        ar: "أي معلومة من التالية يجب ألا تنشرها بشكل علني؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Your favorite sport",
            ar: "رياضتك المفضلة",
          },
        },

        {
          id: "b",

          text: {
            en: "Your account password",
            ar: "كلمة مرور حسابك",
          },
        },

        {
          id: "c",

          text: {
            en: "Your favorite school subject",
            ar: "مادتك المدرسية المفضلة",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Correct! Passwords should always remain private.",

        ar: "صحيح! يجب أن تبقى كلمات المرور سرية دائمًا.",
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
      },

      items: [
        {
          icon: "❌",

          title: {
            en: "samia123",
            ar: "samia123",
          },

          text: {
            en: "Contains a name and a simple number pattern.",
            ar: "تحتوي على اسم ونمط أرقام بسيط.",
          },
        },

        {
          icon: "❌",

          title: {
            en: "12345678",
            ar: "12345678",
          },

          text: {
            en: "Very predictable.",
            ar: "سهلة التوقع جدًا.",
          },
        },

        {
          icon: "⚠️",

          title: {
            en: "BlueCar22",
            ar: "BlueCar22",
          },

          text: {
            en: "Better, but still relatively simple.",
            ar: "أفضل قليلًا، لكنها ما زالت بسيطة.",
          },
        },

        {
          icon: "✅",

          title: {
            en: "Cloud-Rocket-Tree-47",
            ar: "Cloud-Rocket-Tree-47",
          },

          text: {
            en: "Longer and less predictable.",
            ar: "أطول وأقل قابلية للتوقع.",
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
      },

      question: {
        en: "Which password is the strongest example?",

        ar: "أي كلمة مرور من التالية تعتبر مثالًا أقوى؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "password",
            ar: "password",
          },
        },

        {
          id: "b",

          text: {
            en: "123456",
            ar: "123456",
          },
        },

        {
          id: "c",

          text: {
            en: "Purple-Star-Train-86",
            ar: "Purple-Star-Train-86",
          },
        },
      ],

      correctAnswer: "c",

      explanation: {
        en: "Correct! A longer, less predictable password is much better than common words or simple number sequences.",

        ar: "صحيح! كلمة مرور طويلة وأقل توقعًا أفضل بكثير من الكلمات الشائعة أو تسلسل الأرقام البسيط.",
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
      },

      introduction: {
        en: "Create a FAKE practice password. Do not write any real password that you currently use.",

        ar: "أنشئ كلمة مرور وهمية للتدريب فقط. لا تكتب أي كلمة مرور حقيقية تستخدمها.",
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
      },

      answerPrompt: {
        en: "Write a FAKE example password and explain why it is stronger. Never enter a real password.",

        ar: "اكتب مثالًا وهميًا فقط لكلمة مرور واشرح لماذا تعتبر أقوى. لا تكتب كلمة مرور حقيقية.",
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
      },

      items: [
        {
          icon: "⏰",

          title: {
            en: "Extreme Urgency",
            ar: "استعجال شديد",
          },

          text: {
            en: "Click in 5 minutes or your account will disappear!",
            ar: "اضغط خلال 5 دقائق وإلا سيختفي حسابك!",
          },
        },

        {
          icon: "🎁",

          title: {
            en: "Too Good to Be True",
            ar: "عرض مبالغ فيه",
          },

          text: {
            en: "You won an expensive prize even though you entered no competition.",
            ar: "ربحت جائزة غالية رغم أنك لم تشارك في أي مسابقة.",
          },
        },

        {
          icon: "🔑",

          title: {
            en: "Asking for Passwords",
            ar: "طلب كلمة المرور",
          },

          text: {
            en: "A message asks you to send your password.",
            ar: "رسالة تطلب منك إرسال كلمة المرور.",
          },
        },

        {
          icon: "🔗",

          title: {
            en: "Suspicious Link",
            ar: "رابط مشبوه",
          },

          text: {
            en: "A strange or unexpected link.",
            ar: "رابط غريب أو لم تكن تتوقع استلامه.",
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
      },

      question: {
        en: "You receive: 'Congratulations! You won a new phone. Send your password now to receive your prize.' What should you do?",

        ar: "وصلتك رسالة: «مبروك! ربحت هاتفًا جديدًا. أرسل كلمة مرورك الآن لاستلام الجائزة». ماذا تفعل؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Send the password quickly.",
            ar: "أرسل كلمة المرور بسرعة.",
          },
        },

        {
          id: "b",

          text: {
            en: "Do not send information and tell a trusted adult.",
            ar: "لا ترسل المعلومات وأخبر شخصًا بالغًا موثوقًا.",
          },
        },

        {
          id: "c",

          text: {
            en: "Send your phone number instead.",
            ar: "أرسل رقم الهاتف بدلًا من كلمة المرور.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Exactly. Never send passwords because of an unexpected prize message.",

        ar: "بالضبط. لا ترسل كلمة المرور بسبب رسالة جائزة غير متوقعة.",
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
      },

      introduction: {
        en: "Imagine you want to post a photo online. Use the THINK test before sharing.",

        ar: "تخيّل أنك تريد نشر صورة على الإنترنت. استخدم اختبار THINK قبل المشاركة.",
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
      },

      answerPrompt: {
        en: "Write one example of something you should check before posting online.",

        ar: "اكتب مثالًا على شيء يجب أن تتحقق منه قبل نشر محتوى على الإنترنت.",
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
      },

      text: {
        en: "Someone you met in an online game asks you to keep your conversation secret from your family and wants you to send a private photo. What should you do?",

        ar: "شخص تعرفت عليه داخل لعبة على الإنترنت طلب منك أن تبقي المحادثة سرًا عن عائلتك، ويريد منك إرسال صورة خاصة. ماذا يجب أن تفعل؟",
      },

      note: {
        en: "Write the safest actions you could take.",

        ar: "اكتب الخطوات الأكثر أمانًا التي يمكنك القيام بها.",
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
      },

      introduction: {
        en: "You are now the cyber detective. Analyze this situation.",

        ar: "أنت الآن المحقق الرقمي. حلل الموقف التالي.",
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
      },

      answerPrompt: {
        en: "What warning signs did you find, and what should the user do?",

        ar: "ما إشارات الخطر التي اكتشفتها؟ وماذا يجب أن يفعل المستخدم؟",
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
      },

      question: {
        en: "What is the smartest response when an unexpected message asks for private information?",

        ar: "ما التصرف الأذكى عندما تطلب منك رسالة غير متوقعة معلومات خاصة؟",
      },

      options: [
        {
          id: "a",

          text: {
            en: "Send the information if the message looks exciting.",
            ar: "أرسل المعلومات إذا كانت الرسالة تبدو مثيرة.",
          },
        },

        {
          id: "b",

          text: {
            en: "Stop, do not share the information, and verify with a trusted adult.",
            ar: "توقف، لا ترسل المعلومات، وتحقق بمساعدة شخص بالغ موثوق.",
          },
        },

        {
          id: "c",

          text: {
            en: "Send only part of your password.",
            ar: "أرسل جزءًا فقط من كلمة المرور.",
          },
        },
      ],

      correctAnswer: "b",

      explanation: {
        en: "Excellent! When something feels suspicious, stop and verify instead of reacting quickly.",

        ar: "ممتاز! عندما يبدو شيء مشبوهًا، توقف وتحقق بدلًا من التصرف بسرعة.",
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
      },

      question: {
        en: "What is one Internet safety habit that you think every student should follow, and why?",

        ar: "ما أهم عادة من عادات الأمان على الإنترنت تعتقد أن كل طالب يجب أن يتبعها؟ ولماذا؟",
      },
    },

  ],
}

];


export default lessonTemplates;
