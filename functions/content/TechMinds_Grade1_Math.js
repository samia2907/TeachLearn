// TechMinds - Grade 1 Mathematics (Israel)
// 30 missions / 3 stages (stages are metadata only; no new stage UI exists).
//
// Every mission uses `activityType: "mission"` and its `sections` follow the
// SAME schema as the existing Computer Science missions in
// src/data/missions/computer-science-modern-technology/*.js, validated by
// src/components/mission/missionEngine.js (client) and
// functions/missionValidation.js (server): section types are limited to
// story | explain | multipleChoice | sequence | robot | debugging.
// All questions here are multipleChoice or sequence - fully closed and
// auto-gradable. No short-answer/free-text/open-ended questions exist.
//
// This program is NOT part of `functions/content/catalog.js`'s `programs`
// array: that importer's schema (pricing, lessonDocument() field whitelist)
// does not carry activityType/estimatedMinutes/xpReward/stageId. Import this
// program with functions/scripts/importMathGrade1.js instead (dry run by
// default; see CONTENT_IMPORT.md).
//
// Stable IDs: do not rename after students begin saving progress.
// First mission is the free preview via previewLessonCount = 1 (existing
// program-access mechanism in functions/programAccessPolicy.mjs).

export const mathGrade1Program = {
  "id": "math-grade-1-il",
  "slug": "math-grade-1-il",
  "category": "mathematics",
  "subject": "mathematics",
  "grade": 1,
  "ageFrom": 6,
  "ageTo": 7,
  "level": "beginner",
  "status": "draft",
  "icon": "🧮",
  "title": {
    "ar": "مسار الحساب - الصف الأول",
    "he": "מסלול חשבון - כיתה א׳",
    "en": "Math Path - Grade 1"
  },
  "description": {
    "ar": "مسار تفاعلي في الحساب للصف الأول يدعم موضوعات المنهاج في إسرائيل، من معنى العدد والعمليات الأساسية حتى الأعداد 100، مع تحديات وتفكير رياضي.",
    "he": "מסלול אינטראקטיבי בחשבון לכיתה א׳ התומך בנושאי הלימוד בישראל, מהבנת המספר והפעולות הבסיסיות ועד 100, עם אתגרים וחשיבה מתמטית.",
    "en": "An interactive Grade 1 math path supporting key curriculum topics in Israel, from number sense and basic operations to numbers up to 100, with challenges and mathematical thinking."
  },
  "curriculum": {
    "country": "IL",
    "framework": "Ministry of Education",
    "grade": 1,
    "subject": "mathematics"
  },
  "accessType": "paid",
  "previewLessonCount": 1,
  "freeLessonIds": [
    "math-g1-m01"
  ],
  "stages": [
    {
      "id": "math-g1-stage-1",
      "order": 1,
      "title": {
        "ar": "أبدأ",
        "he": "מתחילים",
        "en": "Start"
      }
    },
    {
      "id": "math-g1-stage-2",
      "order": 2,
      "title": {
        "ar": "أتقدم",
        "he": "מתקדמים",
        "en": "Progress"
      }
    },
    {
      "id": "math-g1-stage-3",
      "order": 3,
      "title": {
        "ar": "أتقن",
        "he": "שולטים",
        "en": "Master"
      }
    }
  ],
  "lessons": [
    {
      "id": "math-g1-m01",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 1,
      "lessonOrder": 1,
      "position": 1,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 80,
      "status": "draft",
      "title": {
        "ar": "أين اختفت الأعداد؟",
        "he": "היכן נעלמו המספרים?",
        "en": "Where Did the Numbers Go?"
      },
      "description": {
        "ar": "التعرّف إلى الكميات والأعداد 0-10 وربط الرمز العددي بالكمية.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m01-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: التعرّف إلى الكميات والأعداد 0-10 وربط الرمز العددي بالكمية.",
            "he": "מוכנים? המטרה שלנו היום: להכיר כמויות ומספרים 0-10 ולהתאים כל ספרה לכמות שלה.",
            "en": "Ready? Today's goal: recognize quantities and numbers 0-10, and match each number symbol to its quantity."
          }
        },
        {
          "id": "m01-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• عدّ مجموعات من 0 إلى 10\n• مطابقة العدد بالكمية\n• فهم معنى الصفر",
            "he": "• ספירת קבוצות מ-0 עד 10\n• התאמת מספר לכמות\n• הבנת המשמעות של אפס",
            "en": "• Counting groups from 0 to 10\n• Matching a number to its quantity\n• Understanding the meaning of zero"
          }
        },
        {
          "id": "m01-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "🍎🍎🍎 = ؟", "he": "🍎🍎🍎 = ?", "en": "🍎🍎🍎 = ?" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "هناك ثلاث تفاحات، لذلك الجواب 3.", "he": "יש שלושה תפוחים, לכן התשובה היא 3.", "en": "There are three apples, so the answer is 3." },
          "skills": ["counting"]
        },
        {
          "id": "m01-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "أي صورة تمثل العدد 0؟", "he": "איזו תמונה מראה את המספר 0?", "en": "Which picture shows the number 0?" },
          "options": [
            { "id": "one", "text": { "ar": "🍎 (تفاحة واحدة)", "he": "🍎 (תפוח אחד)", "en": "🍎 (One apple)" } },
            { "id": "zero", "text": { "ar": "🍽️ (طبق فارغ - لا تفاح)", "he": "🍽️ (צלחת ריקה - אין תפוחים)", "en": "🍽️ (Empty plate - no apples)" } },
            { "id": "two", "text": { "ar": "🍎🍎 (تفاحتان)", "he": "🍎🍎 (שני תפוחים)", "en": "🍎🍎 (Two apples)" } }
          ],
          "correctAnswer": "zero",
          "explanation": { "ar": "الصفر يعني مجموعة فارغة — لا يوجد فيها أي تفاح.", "he": "אפס פירושו קבוצה ריקה - אין בה אף תפוח.", "en": "Zero means an empty group - no apples at all." },
          "skills": ["numberSense"]
        },
        {
          "id": "m01-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "كم نجمة؟ ⭐⭐⭐⭐⭐⭐⭐", "he": "כמה כוכבים יש? ⭐⭐⭐⭐⭐⭐⭐", "en": "How many stars are there? ⭐⭐⭐⭐⭐⭐⭐" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "عدّ النجوم واحدة تلو الأخرى: يوجد 7.", "he": "ספרו את הכוכבים אחד אחד: יש 7.", "en": "Count the stars one by one: there are 7." },
          "skills": ["counting"]
        },
        {
          "id": "m01-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "عدّ المجموعة: 🍎🍎🍎🍎🍎🍎 — كم العدد؟", "he": "ספרו את הקבוצה: 🍎🍎🍎🍎🍎🍎 - מה המספר?", "en": "Count the group: 🍎🍎🍎🍎🍎🍎 - what is the number?" },
          "options": [
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } }
          ],
          "correctAnswer": "n6",
          "explanation": { "ar": "عد التفاحات واحدة تلو الأخرى يعطينا 6.", "he": "ספירת התפוחים אחד אחד נותנת לנו 6.", "en": "Counting the apples one by one gives us 6." },
          "skills": ["counting"]
        },
        {
          "id": "m01-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m02",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 2,
      "lessonOrder": 2,
      "position": 2,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 80,
      "status": "draft",
      "title": {
        "ar": "عدّاد الروبوت",
        "he": "מונה הרובוט",
        "en": "Robot Counter"
      },
      "description": {
        "ar": "تثبيت العد التصاعدي وربط كل عنصر بعدّ واحد.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m02-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: تثبيت العد التصاعدي وربط كل عنصر بعدّ واحد.",
            "he": "מוכנים? המטרה שלנו היום: לחזק את הספירה הרציפה ולהתאים כל פריט למספר אחד.",
            "en": "Ready? Today's goal: strengthen counting forward and match each item to one count."
          }
        },
        {
          "id": "m02-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• العد من 0 إلى 10\n• العد واحدًا لواحد\n• تكوين كمية مطلوبة",
            "he": "• ספירה מ-0 עד 10\n• ספירה פריט אחר פריט\n• יצירת כמות מבוקשת",
            "en": "• Counting from 0 to 10\n• Counting one object at a time\n• Building a requested quantity"
          }
        },
        {
          "id": "m02-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "عدّ 8 دوائر: ⚪⚪⚪⚪⚪⚪⚪⚪", "he": "ספרו את העיגולים: ⚪⚪⚪⚪⚪⚪⚪⚪", "en": "Count the circles: ⚪⚪⚪⚪⚪⚪⚪⚪" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "عد الدوائر واحدة تلو الأخرى يعطينا 8.", "he": "ספירת העיגולים אחד אחד נותנת לנו 8.", "en": "Counting the circles one by one gives us 8." },
          "skills": ["counting"]
        },
        {
          "id": "m02-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "كوّن مجموعة من 5 مكعبات: أي مجموعة فيها 5؟", "he": "באיזו קבוצה יש בדיוק 5 קוביות?", "en": "Which group has exactly 5 blocks?" },
          "options": [
            { "id": "four", "text": { "ar": "🟦🟦🟦🟦 (أربعة)", "he": "🟦🟦🟦🟦 (ארבע)", "en": "🟦🟦🟦🟦 (Four)" } },
            { "id": "five", "text": { "ar": "🟦🟦🟦🟦🟦 (خمسة)", "he": "🟦🟦🟦🟦🟦 (חמש)", "en": "🟦🟦🟦🟦🟦 (Five)" } },
            { "id": "six", "text": { "ar": "🟦🟦🟦🟦🟦🟦 (ستة)", "he": "🟦🟦🟦🟦🟦🟦 (שש)", "en": "🟦🟦🟦🟦🟦🟦 (Six)" } }
          ],
          "correctAnswer": "five",
          "explanation": { "ar": "المجموعة التي فيها خمسة مكعبات هي الصحيحة.", "he": "הקבוצה עם חמש קוביות היא הנכונה.", "en": "The group with five blocks is the correct one." },
          "skills": ["counting"]
        },
        {
          "id": "m02-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "هل المجموعة فيها 6 أم 7؟ ⭐⭐⭐⭐⭐⭐⭐", "he": "ספרו את הקבוצה: ⭐⭐⭐⭐⭐⭐⭐ - 6 או 7?", "en": "Count this group: ⭐⭐⭐⭐⭐⭐⭐ - is it 6 or 7?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "يوجد 7 نجوم في هذه المجموعة.", "he": "יש 7 כוכבים בקבוצה הזו.", "en": "There are 7 stars in this group." },
          "skills": ["counting"]
        },
        {
          "id": "m02-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "جهّز الروبوت: أي روبوت حصل على عشر بطاريات بالضبط؟", "he": "לאיזה רובוט יש בדיוק עשר סוללות?", "en": "Which robot got exactly ten batteries?" },
          "options": [
            { "id": "four", "text": { "ar": "🔋🔋🔋🔋 (أربع)", "he": "🔋🔋🔋🔋 (ארבע)", "en": "🔋🔋🔋🔋 (Four)" } },
            { "id": "seven", "text": { "ar": "🔋🔋🔋🔋🔋🔋🔋 (سبع)", "he": "🔋🔋🔋🔋🔋🔋🔋 (שבע)", "en": "🔋🔋🔋🔋🔋🔋🔋 (Seven)" } },
            { "id": "ten", "text": { "ar": "🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 (عشر)", "he": "🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 (עשר)", "en": "🔋🔋🔋🔋🔋🔋🔋🔋🔋🔋 (Ten)" } }
          ],
          "correctAnswer": "ten",
          "explanation": { "ar": "الروبوت الذي لديه عشر بطاريات هو المطلوب.", "he": "הרובוט עם עשר הסוללות הוא זה שצריך.", "en": "The robot with ten batteries is the one we need." },
          "skills": ["counting"]
        },
        {
          "id": "m02-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m03",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 3,
      "lessonOrder": 3,
      "position": 3,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 85,
      "status": "draft",
      "title": {
        "ar": "من قبلي ومن بعدي؟",
        "he": "מי לפניי ומי אחריי?",
        "en": "Before and After"
      },
      "description": {
        "ar": "فهم السابق والتالي وتسلسل الأعداد.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m03-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم السابق والتالي وتسلسل الأعداد.",
            "he": "מוכנים? המטרה שלנו היום: להבין מה לפני ומה אחרי, ואת סדר המספרים.",
            "en": "Ready? Today's goal: understand before and after, and the order of numbers."
          }
        },
        {
          "id": "m03-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• السابق واللاحق\n• إكمال تسلسل\n• زيادة أو نقصان 1",
            "he": "• לפני ואחרי\n• השלמת רצף\n• הוספה או הורדה של 1",
            "en": "• Before and after\n• Completing a sequence\n• Adding or removing 1"
          }
        },
        {
          "id": "m03-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "__، 4، 5 — ما العدد الناقص؟", "he": "__, 4, 5 - מה בא לפני 4?", "en": "__, 4, 5 - what comes before 4?" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "العدد الذي يسبق 4 مباشرة هو 3.", "he": "המספר שבא ישר לפני 4 הוא 3.", "en": "The number right before 4 is 3." },
          "skills": ["sequencing"]
        },
        {
          "id": "m03-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "ما العدد بعد 8؟", "he": "מה המספר שבא אחרי 8?", "en": "What number comes after 8?" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } }
          ],
          "correctAnswer": "n9",
          "explanation": { "ar": "العدد الذي يأتي بعد 8 هو 9.", "he": "המספר שבא אחרי 8 הוא 9.", "en": "The number that comes after 8 is 9." },
          "skills": ["sequencing"]
        },
        {
          "id": "m03-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "ما العدد قبل 1؟", "he": "מה המספר שבא לפני 1?", "en": "What number comes before 1?" },
          "options": [
            { "id": "n0", "text": { "ar": "0", "he": "0", "en": "0" } },
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } }
          ],
          "correctAnswer": "n0",
          "explanation": { "ar": "العدد الذي يسبق 1 هو 0.", "he": "המספר שלפני 1 הוא 0.", "en": "The number before 1 is 0." },
          "skills": ["sequencing"]
        },
        {
          "id": "m03-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "أصلح قطار الأعداد الناقص: 5، 6، __، 8، 9 ما العدد الناقص؟", "he": "רכבת המספרים: 5, 6, __, 8, 9 - מה המספר החסר?", "en": "Number train: 5, 6, __, 8, 9 - what is the missing number?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ], 
          "correctAnswer": "n7",
          "explanation": { "ar": "العدد بين 6 و8 هو 7.", "he": "המספר שבין 6 ל-8 הוא 7.", "en": "The number between 6 and 8 is 7." },
          "skills": ["sequencing"]
        },
        {
          "id": "m03-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m04",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 4,
      "lessonOrder": 4,
      "position": 4,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 90,
      "status": "draft",
      "title": {
        "ar": "من الأكبر؟",
        "he": "מי גדול יותר?",
        "en": "Which Is Greater?"
      },
      "description": {
        "ar": "مقارنة الكميات والأعداد باستخدام أكبر وأصغر ويساوي.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m04-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: مقارنة الكميات والأعداد باستخدام أكبر وأصغر ويساوي.",
            "he": "מוכנים? המטרה שלנו היום: להשוות כמויות ומספרים באמצעות גדול מ, קטן מ ושווה ל.",
            "en": "Ready? Today's goal: compare quantities and numbers using greater than, less than, and equal to."
          }
        },
        {
          "id": "m04-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• مقارنة مجموعتين\n• مقارنة عددين\n• فهم المساواة",
            "he": "• השוואת שתי קבוצות\n• השוואת שני מספרים\n• הבנת השוויון",
            "en": "• Comparing two groups\n• Comparing two numbers\n• Understanding equality"
          }
        },
        {
          "id": "m04-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "7 __ 4", "he": "7 __ 4", "en": "7 __ 4" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "gt",
          "explanation": { "ar": "7 أكبر من 4.", "he": "7 גדול מ-4.", "en": "7 is greater than 4." },
          "skills": ["comparing"]
        },
        {
          "id": "m04-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "3 __ 3", "he": "3 __ 3", "en": "3 __ 3" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "eq",
          "explanation": { "ar": "3 يساوي 3.", "he": "3 שווה ל-3.", "en": "3 equals 3." },
          "skills": ["comparing"]
        },
        {
          "id": "m04-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "أي مجموعة أكبر: 5 أم 8؟", "he": "איזו קבוצה גדולה יותר: 5 או 8?", "en": "Which group is greater: 5 or 8?" },
          "options": [
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "8 أكبر من 5.", "he": "8 גדול מ-5.", "en": "8 is greater than 5." },
          "skills": ["comparing"]
        },
        {
          "id": "m04-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "اختر الرمز الصحيح: 10 __ 7", "he": "בחרו את הסימן הנכון: 10 __ 7", "en": "Choose the correct symbol: 10 __ 7" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "gt",
          "explanation": { "ar": "10 أكبر من 7.", "he": "10 גדול מ-7.", "en": "10 is greater than 7." },
          "skills": ["comparing"]
        },
        {
          "id": "m04-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m05",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 5,
      "lessonOrder": 5,
      "position": 5,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 90,
      "status": "draft",
      "title": {
        "ar": "رتّب السباق",
        "he": "סדרו את המרוץ",
        "en": "Order the Race"
      },
      "description": {
        "ar": "ترتيب الأعداد تصاعديًا وتنازليًا.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m05-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: ترتيب الأعداد تصاعديًا وتنازليًا.",
            "he": "מוכנים? המטרה שלנו היום: לסדר מספרים מהקטן לגדול ומהגדול לקטן.",
            "en": "Ready? Today's goal: order numbers from smallest to largest and from largest to smallest."
          }
        },
        {
          "id": "m05-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• الأصغر والأكبر\n• ترتيب 3-5 أعداد\n• التحقق بخط الأعداد",
            "he": "• הקטן ביותר והגדול ביותר\n• סידור 3-5 מספרים\n• בדיקה בעזרת ישר המספרים",
            "en": "• Smallest and largest\n• Ordering 3-5 numbers\n• Checking with a number line"
          }
        },
        {
          "id": "m05-q1",
          "type": "sequence",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "رتب الأعداد 6، 2، 9 من الأصغر إلى الأكبر.", "he": "סדרו את המספרים האלה מהקטן לגדול: 6, 2, 9", "en": "Put these numbers in order from smallest to largest: 6, 2, 9" },
          "items": [
            { "id": "v0-6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "v1-2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "v2-9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctOrder": ["v1-2", "v0-6", "v2-9"],
          "explanation": { "ar": "الترتيب التصاعدي الصحيح هو 2، 6، 9.", "he": "הסדר העולה הנכון הוא 2, 6, 9.", "en": "The correct ascending order is 2, 6, 9." },
          "skills": ["ordering"]
        },
        {
          "id": "m05-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "ما أصغر الأعداد: 4، 7، 1؟", "he": "מה הקטן ביותר מבין 4, 7, 1?", "en": "What is the smallest of 4, 7, 1?" },
          "options": [
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } }
          ],
          "correctAnswer": "n1",
          "explanation": { "ar": "أصغر الأعداد هو 1.", "he": "המספר הקטן ביותר הוא 1.", "en": "The smallest number is 1." },
          "skills": ["comparing"]
        },
        {
          "id": "m05-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "ما أكبر الأعداد: 3، 8، 5؟", "he": "מה הגדול ביותר מבין 3, 8, 5?", "en": "What is the greatest of 3, 8, 5?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "أكبر الأعداد هو 8.", "he": "המספר הגדול ביותר הוא 8.", "en": "The greatest number is 8." },
          "skills": ["comparing"]
        },
        {
          "id": "m05-challenge",
          "type": "sequence",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "رتّب خمس بطاقات من الأصغر إلى الأكبر: 7، 2، 9، 4، 1", "he": "סדרו חמישה כרטיסים מהקטן לגדול: 7, 2, 9, 4, 1", "en": "Order five cards from smallest to largest: 7, 2, 9, 4, 1" },
          "items": [
            { "id": "v0-7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "v1-2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "v2-9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "v3-4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "v4-1", "text": { "ar": "1", "he": "1", "en": "1" } }
          ],
          "correctOrder": ["v4-1", "v1-2", "v3-4", "v0-7", "v2-9"],
          "explanation": { "ar": "الترتيب الصحيح هو 1، 2، 4، 7، 9.", "he": "הסדר הנכון הוא 1, 2, 4, 7, 9.", "en": "The correct order is 1, 2, 4, 7, 9." },
          "skills": ["ordering"]
        },
        {
          "id": "m05-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m06",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 6,
      "lessonOrder": 6,
      "position": 6,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 95,
      "status": "draft",
      "title": {
        "ar": "رحلة على خط الأعداد",
        "he": "מסע על ישר המספרים",
        "en": "Number Line Journey"
      },
      "description": {
        "ar": "استخدام خط الأعداد لفهم الموقع والتقدم والتراجع.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m06-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: استخدام خط الأعداد لفهم الموقع والتقدم والتراجع.",
            "he": "מוכנים? המטרה שלנו היום: להשתמש בישר המספרים כדי להבין מיקום, התקדמות וחזרה.",
            "en": "Ready? Today's goal: use the number line to understand position, moving forward and backward."
          }
        },
        {
          "id": "m06-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• تحديد موقع عدد\n• خطوة للأمام\n• خطوة للخلف",
            "he": "• איתור מיקום של מספר\n• צעד קדימה\n• צעד אחורה",
            "en": "• Finding the position of a number\n• A step forward\n• A step backward"
          }
        },
        {
          "id": "m06-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "على خط الأعداد من 0 إلى 10، أين يقع العدد 9؟", "he": "על ישר מספרים מ-0 עד 10, היכן נמצא המספר 9?", "en": "On a number line from 0 to 10, where is the number 9?" },
          "options": [
            { "id": "start", "text": { "ar": "قرب البداية (قرب 0)", "he": "קרוב להתחלה (קרוב ל-0)", "en": "Near the start (near 0)" } },
            { "id": "middle", "text": { "ar": "في المنتصف (قرب 5)", "he": "באמצע (קרוב ל-5)", "en": "In the middle (near 5)" } },
            { "id": "end", "text": { "ar": "قرب النهاية (قرب 10)", "he": "קרוב לסוף (קרוב ל-10)", "en": "Near the end (near 10)" } }
          ],
          "correctAnswer": "end",
          "explanation": { "ar": "9 قريب جدًا من 10، لذلك يقع قرب نهاية الخط.", "he": "9 קרוב מאוד ל-10, לכן הוא נמצא קרוב לסוף הישר.", "en": "9 is very close to 10, so it sits near the end of the line." },
          "skills": ["numberLine"]
        },
        {
          "id": "m06-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "4 + خطوة للأمام = ؟", "he": "4 + צעד אחד קדימה = ?", "en": "4 + one step forward = ?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "خطوة للأمام تعني +1، لذلك 4+1=5.", "he": "צעד קדימה פירושו +1, לכן 4+1=5.", "en": "A step forward means +1, so 4 + 1 = 5." },
          "skills": ["numberLine"]
        },
        {
          "id": "m06-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "7 - خطوة للخلف = ؟", "he": "7 - צעד אחד אחורה = ?", "en": "7 - one step backward = ?" },
          "options": [
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } }
          ],
          "correctAnswer": "n6",
          "explanation": { "ar": "خطوة للخلف تعني -1، لذلك 7-1=6.", "he": "צעד אחורה פירושו -1, לכן 7-1=6.", "en": "A step backward means -1, so 7 - 1 = 6." },
          "skills": ["numberLine"]
        },
        {
          "id": "m06-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "الشخصية عند 3 وتريد الوصول إلى 6. كم خطوة للأمام تحتاج؟", "he": "הדמות נמצאת ב-3 וצריכה להגיע ל-6. כמה צעדים קדימה נדרשים?", "en": "The character is at 3 and needs to reach 6. How many steps forward are needed?" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "من 3 إلى 6 المسافة 3 خطوات.", "he": "מ-3 ל-6 המרחק הוא 3 צעדים.", "en": "From 3 to 6 is a distance of 3 steps." },
          "skills": ["numberLine"]
        },
        {
          "id": "m06-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m07",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 7,
      "lessonOrder": 7,
      "position": 7,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 100,
      "status": "draft",
      "title": {
        "ar": "فكّك العدد",
        "he": "פרקו את המספר",
        "en": "Break the Number Apart"
      },
      "description": {
        "ar": "فهم أن العدد يمكن تكوينه من جزأين بطرق متعددة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m07-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم أن العدد يمكن تكوينه من جزأين بطرق متعددة.",
            "he": "מוכנים? המטרה שלנו היום: להבין שמספר יכול להיות מורכב משני חלקים בדרכים שונות.",
            "en": "Ready? Today's goal: understand that a number can be composed of two parts in many ways."
          }
        },
        {
          "id": "m07-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• تفكيك حتى 10\n• تكوين من جزأين\n• تراكيب مختلفة",
            "he": "• פירוק מספרים עד 10\n• הרכבה משני חלקים\n• הרכבים שונים",
            "en": "• Decomposing numbers up to 10\n• Composing from two parts\n• Different combinations"
          }
        },
        {
          "id": "m07-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "6 = 2 + ؟", "he": "6 = 2 + ?", "en": "6 = 2 + ?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } }
          ],
          "correctAnswer": "n4",
          "explanation": { "ar": "2+4=6.", "he": "2+4=6.", "en": "2 + 4 = 6." },
          "skills": ["decomposition"]
        },
        {
          "id": "m07-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "5 + ؟ = 8", "he": "5 + ? = 8", "en": "5 + ? = 8" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "5+3=8.", "he": "5+3=8.", "en": "5 + 3 = 8." },
          "skills": ["decomposition"]
        },
        {
          "id": "m07-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "اختر زوجًا يصنع 10", "he": "איזה זוג יוצר 10?", "en": "Which pair makes 10?" },
          "options": [
            { "id": "a", "text": { "ar": "4 و6", "he": "4 ו-6", "en": "4 and 6" } },
            { "id": "b", "text": { "ar": "3 و5", "he": "3 ו-5", "en": "3 and 5" } },
            { "id": "c", "text": { "ar": "7 و2", "he": "7 ו-2", "en": "7 and 2" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "4+6=10.", "he": "4+6=10.", "en": "4 + 6 = 10." },
          "skills": ["decomposition"]
        },
        {
          "id": "m07-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "أي من هذه الأزواج لا يُكوّن العدد 8؟", "he": "איזה מהזוגות האלה אינו יוצר את המספר 8?", "en": "Which of these pairs does NOT make the number 8?" },
          "options": [
            { "id": "a", "text": { "ar": "6 و2", "he": "6 ו-2", "en": "6 and 2" } },
            { "id": "b", "text": { "ar": "4 و4", "he": "4 ו-4", "en": "4 and 4" } },
            { "id": "c", "text": { "ar": "5 و4", "he": "5 ו-4", "en": "5 and 4" } }
          ],
          "correctAnswer": "c",
          "explanation": { "ar": "5+4=9 وليس 8، لذلك هذا الزوج هو الاستثناء.", "he": "5+4=9 ולא 8, לכן זהו הזוג היוצא מהכלל.", "en": "5 + 4 = 9, not 8, so this pair is the exception." },
          "skills": ["decomposition"]
        },
        {
          "id": "m07-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m08",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 8,
      "lessonOrder": 8,
      "position": 8,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 100,
      "status": "draft",
      "title": {
        "ar": "اجمع الكنوز",
        "he": "אוספים אוצרות",
        "en": "Add the Treasures"
      },
      "description": {
        "ar": "بناء معنى الجمع كضم مجموعتين.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m08-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: بناء معنى الجمع كضم مجموعتين.",
            "he": "מוכנים? המטרה שלנו היום: לבנות את המשמעות של חיבור כצירוף של שתי קבוצות.",
            "en": "Ready? Today's goal: build the meaning of addition as joining two groups together."
          }
        },
        {
          "id": "m08-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• معنى الجمع\n• الجزءان والمجموع\n• جملة جمع",
            "he": "• המשמעות של חיבור\n• שני החלקים והסכום\n• משפט חיבור",
            "en": "• The meaning of addition\n• The two parts and the total\n• An addition sentence"
          }
        },
        {
          "id": "m08-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "2+4=؟", "he": "2 + 4 = ?", "en": "2 + 4 = ?" },
          "options": [
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } }
          ],
          "correctAnswer": "n6",
          "explanation": { "ar": "2+4=6.", "he": "2+4=6.", "en": "2 + 4 = 6." },
          "skills": ["addition"]
        },
        {
          "id": "m08-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "3 بالونات + 2 بالونات = ؟", "he": "3 בלונים + 2 בלונים = ?", "en": "3 balloons + 2 balloons = ?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "3 بالونات و2 بالونات تصبح 5 بالونات.", "he": "3 בלונים ועוד 2 בלונים הם 5 בלונים.", "en": "3 balloons and 2 balloons make 5 balloons." },
          "skills": ["addition"]
        },
        {
          "id": "m08-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "🎈🎈🎈🎈 + 🎈 = كم بالونًا؟", "he": "🎈🎈🎈🎈 + 🎈 = כמה בלונים?", "en": "🎈🎈🎈🎈 + 🎈 = how many balloons?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "4 بالونات وبالون واحد يصبح المجموع 5.", "he": "4 בלונים ועוד בלון אחד נותנים סך הכול 5.", "en": "4 balloons plus one more balloon make a total of 5." },
          "skills": ["addition"]
        },
        {
          "id": "m08-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "في السلة 6 كرات، أضفنا 3 كرات أخرى. كم كرة الآن؟", "he": "בסל יש 6 כדורים, הוספנו עוד 3. כמה כדורים יש עכשיו?", "en": "The basket has 6 balls, we added 3 more. How many balls now?" },
          "options": [
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } }
          ],
          "correctAnswer": "n9",
          "explanation": { "ar": "6+3=9.", "he": "6+3=9.", "en": "6 + 3 = 9." },
          "skills": ["addition"]
        },
        {
          "id": "m08-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m09",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 9,
      "lessonOrder": 9,
      "position": 9,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 110,
      "status": "draft",
      "title": {
        "ar": "مهمة الجمع ضمن 10",
        "he": "חיבור עד 10",
        "en": "Addition to 10"
      },
      "description": {
        "ar": "استخدام استراتيجيات متنوعة للجمع ضمن 10.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m09-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: استخدام استراتيجيات متنوعة للجمع ضمن 10.",
            "he": "מוכנים? המטרה שלנו היום: להשתמש באסטרטגיות מגוונות לחיבור עד 10.",
            "en": "Ready? Today's goal: use varied strategies for addition within 10."
          }
        },
        {
          "id": "m09-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• العد للأمام\n• إطار العشرة\n• تراكيب مألوفة",
            "he": "• ספירה קדימה\n• מסגרת העשר\n• הרכבים מוכרים",
            "en": "• Counting on\n• The ten-frame\n• Familiar combinations"
          }
        },
        {
          "id": "m09-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "6+3=؟", "he": "6 + 3 = ?", "en": "6 + 3 = ?" },
          "options": [
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } }
          ],
          "correctAnswer": "n9",
          "explanation": { "ar": "6+3=9.", "he": "6+3=9.", "en": "6 + 3 = 9." },
          "skills": ["addition"]
        },
        {
          "id": "m09-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "5+5=؟", "he": "5 + 5 = ?", "en": "5 + 5 = ?" },
          "options": [
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } },
            { "id": "n11", "text": { "ar": "11", "he": "11", "en": "11" } }
          ],
          "correctAnswer": "n10",
          "explanation": { "ar": "5+5=10.", "he": "5+5=10.", "en": "5 + 5 = 10." },
          "skills": ["addition"]
        },
        {
          "id": "m09-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "2+4 أم 3+4: أيهما أكبر؟", "he": "מה גדול יותר: 2+4 או 3+4?", "en": "Which is greater: 2+4 or 3+4?" },
          "options": [
            { "id": "a", "text": { "ar": "2+4", "he": "2+4", "en": "2+4" } },
            { "id": "b", "text": { "ar": "3+4", "he": "3+4", "en": "3+4" } },
            { "id": "c", "text": { "ar": "متساويان", "he": "הם שווים", "en": "They are equal" } }
          ],
          "correctAnswer": "b",
          "explanation": { "ar": "2+4=6 و3+4=7، لذلك 3+4 أكبر.", "he": "2+4=6 ו-3+4=7, לכן 3+4 גדול יותר.", "en": "2+4=6 and 3+4=7, so 3+4 is greater." },
          "skills": ["addition", "comparing"]
        },
        {
          "id": "m09-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "لفتح البوابة، أجب: 7+2=؟", "he": "כדי לפתוח את השער, ענו: 7+2=?", "en": "To open the gate, answer: 7 + 2 = ?" },
          "options": [
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } }
          ],
          "correctAnswer": "n9",
          "explanation": { "ar": "7+2=9.", "he": "7+2=9.", "en": "7 + 2 = 9." },
          "skills": ["addition"]
        },
        {
          "id": "m09-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m10",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-1",
      "order": 10,
      "lessonOrder": 10,
      "position": 10,
      "activityType": "mission",
      "estimatedMinutes": 35,
      "xpReward": 150,
      "status": "draft",
      "title": {
        "ar": "أنقذ مدينة الأعداد",
        "he": "הצילו את עיר המספרים",
        "en": "Save Number City"
      },
      "description": {
        "ar": "دمج مهارات المرحلة الأولى.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m10-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: دمج مهارات المرحلة الأولى.",
            "he": "מוכנים? המטרה שלנו היום: לשלב את המיומנויות משלב 1.",
            "en": "Ready? Today's goal: combine the skills from Stage 1."
          }
        },
        {
          "id": "m10-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• العد\n• المقارنة والترتيب\n• التفكيك والجمع",
            "he": "• ספירה\n• השוואה וסידור\n• פירוק וחיבור",
            "en": "• Counting\n• Comparing and ordering\n• Decomposing and adding"
          }
        },
        {
          "id": "m10-q1",
          "type": "sequence",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "رتب الأعداد 3، 8، 1 من الأصغر إلى الأكبر.", "he": "סדרו את המספרים האלה מהקטן לגדול: 3, 8, 1", "en": "Put these numbers in order from smallest to largest: 3, 8, 1" },
          "items": [
            { "id": "v0-3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "v1-8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "v2-1", "text": { "ar": "1", "he": "1", "en": "1" } }
          ],
          "correctOrder": ["v2-1", "v0-3", "v1-8"],
          "explanation": { "ar": "الترتيب الصحيح هو 1، 3، 8.", "he": "הסדר הנכון הוא 1, 3, 8.", "en": "The correct order is 1, 3, 8." },
          "skills": ["ordering"]
        },
        {
          "id": "m10-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "7=5+؟", "he": "7 = 5 + ?", "en": "7 = 5 + ?" },
          "options": [
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } }
          ],
          "correctAnswer": "n2",
          "explanation": { "ar": "5+2=7.", "he": "5+2=7.", "en": "5 + 2 = 7." },
          "skills": ["decomposition"]
        },
        {
          "id": "m10-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "4+3=؟", "he": "4 + 3 = ?", "en": "4 + 3 = ?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "4+3=7.", "he": "4+3=7.", "en": "4 + 3 = 7." },
          "skills": ["addition"]
        },
        {
          "id": "m10-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "في المحطة الأخيرة: 9-2=؟", "he": "בתחנה האחרונה: 9-2=?", "en": "At the final station: 9 - 2 = ?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "9-2=7.", "he": "9-2=7.", "en": "9 - 2 = 7." },
          "skills": ["subtraction"]
        },
        {
          "id": "m10-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m11",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 11,
      "lessonOrder": 11,
      "position": 11,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 100,
      "status": "draft",
      "title": {
        "ar": "عملية الاختفاء",
        "he": "מבצע ההיעלמות",
        "en": "The Disappearing Act"
      },
      "description": {
        "ar": "فهم الطرح كإزالة ونقصان.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m11-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم الطرح كإزالة ونقصان.",
            "he": "מוכנים? המטרה שלנו היום: להבין חיסור כהסרה וכמה נשאר.",
            "en": "Ready? Today's goal: understand subtraction as removing and what remains."
          }
        },
        {
          "id": "m11-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• معنى الطرح\n• ما أزيل وما بقي\n• جملة طرح",
            "he": "• המשמעות של חיסור\n• מה הוסר ומה נשאר\n• משפט חיסור",
            "en": "• The meaning of subtraction\n• What was removed and what remains\n• A subtraction sentence"
          }
        },
        {
          "id": "m11-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "7-2=؟", "he": "7 - 2 = ?", "en": "7 - 2 = ?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "7-2=5.", "he": "7-2=5.", "en": "7 - 2 = 5." },
          "skills": ["subtraction"]
        },
        {
          "id": "m11-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "6 تفاحات - تفاحة واحدة = ؟", "he": "6 תפוחים - תפוח אחד = ?", "en": "6 apples - 1 apple = ?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "6 تفاحات ناقص تفاحة واحدة تبقي 5.", "he": "6 תפוחים פחות תפוח אחד משאירים 5.", "en": "6 apples minus 1 apple leaves 5." },
          "skills": ["subtraction"]
        },
        {
          "id": "m11-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "🍎🍎🍎🍎🍎 أزلنا 3 — كم بقي؟", "he": "🍎🍎🍎🍎🍎 - הסרנו 3 - כמה נשארו?", "en": "🍎🍎🍎🍎🍎 - we removed 3 - how many remain?" },
          "options": [
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } }
          ],
          "correctAnswer": "n2",
          "explanation": { "ar": "5-3=2.", "he": "5-3=2.", "en": "5 - 3 = 2." },
          "skills": ["subtraction"]
        },
        {
          "id": "m11-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "كان معه 8 بالونات وطار 3. كم بقي؟", "he": "היו לו 8 בלונים ו-3 עפו. כמה נשארו?", "en": "He had 8 balloons and 3 flew away. How many remain?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "8-3=5.", "he": "8-3=5.", "en": "8 - 3 = 5." },
          "skills": ["subtraction"]
        },
        {
          "id": "m11-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m12",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 12,
      "lessonOrder": 12,
      "position": 12,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 110,
      "status": "draft",
      "title": {
        "ar": "الطرح ضمن 10",
        "he": "חיסור עד 10",
        "en": "Subtraction to 10"
      },
      "description": {
        "ar": "حل الطرح ضمن 10 باستراتيجيات مفهومة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m12-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: حل الطرح ضمن 10 باستراتيجيات مفهومة.",
            "he": "מוכנים? המטרה שלנו היום: לפתור חיסור עד 10 באסטרטגיות ברורות.",
            "en": "Ready? Today's goal: solve subtraction within 10 using clear strategies."
          }
        },
        {
          "id": "m12-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• العد للخلف\n• العلاقة بالجمع\n• خط الأعداد",
            "he": "• ספירה לאחור\n• הקשר לחיבור\n• ישר המספרים",
            "en": "• Counting back\n• The connection to addition\n• The number line"
          }
        },
        {
          "id": "m12-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "9-4=؟", "he": "9 - 4 = ?", "en": "9 - 4 = ?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "9-4=5.", "he": "9-4=5.", "en": "9 - 4 = 5." },
          "skills": ["subtraction"]
        },
        {
          "id": "m12-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "10-6=؟", "he": "10 - 6 = ?", "en": "10 - 6 = ?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } }
          ],
          "correctAnswer": "n4",
          "explanation": { "ar": "10-6=4.", "he": "10-6=4.", "en": "10 - 6 = 4." },
          "skills": ["subtraction"]
        },
        {
          "id": "m12-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "7-7=؟", "he": "7 - 7 = ?", "en": "7 - 7 = ?" },
          "options": [
            { "id": "n0", "text": { "ar": "0", "he": "0", "en": "0" } },
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } }
          ],
          "correctAnswer": "n0",
          "explanation": { "ar": "7-7=0.", "he": "7-7=0.", "en": "7 - 7 = 0." },
          "skills": ["subtraction"]
        },
        {
          "id": "m12-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "حل: 8-5=؟", "he": "פתרו: 8-5=?", "en": "Solve: 8 - 5 = ?" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "8-5=3.", "he": "8-5=3.", "en": "8 - 5 = 3." },
          "skills": ["subtraction"]
        },
        {
          "id": "m12-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m13",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 13,
      "lessonOrder": 13,
      "position": 13,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 120,
      "status": "draft",
      "title": {
        "ar": "عائلة العمليات",
        "he": "משפחת פעולות",
        "en": "Fact Families"
      },
      "description": {
        "ar": "فهم العلاقة العكسية بين الجمع والطرح.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m13-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم العلاقة العكسية بين الجمع والطرح.",
            "he": "מוכנים? המטרה שלנו היום: להבין את הקשר ההפוך בין חיבור לחיסור.",
            "en": "Ready? Today's goal: understand the inverse relationship between addition and subtraction."
          }
        },
        {
          "id": "m13-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• حقائق مترابطة\n• التحقق بالجمع\n• جمل صحيحة",
            "he": "• עובדות קשורות\n• בדיקה בעזרת חיבור\n• משפטים נכונים",
            "en": "• Related facts\n• Checking with addition\n• Correct sentences"
          }
        },
        {
          "id": "m13-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "من 2، 6، 8 كوّن جملة جمع", "he": "בנו משפט חיבור מהמספרים 2, 6, 8", "en": "Build an addition sentence from 2, 6, 8" },
          "options": [
            { "id": "a", "text": { "ar": "2+6=8", "he": "2+6=8", "en": "2+6=8" } },
            { "id": "b", "text": { "ar": "2+8=6", "he": "2+8=6", "en": "2+8=6" } },
            { "id": "c", "text": { "ar": "6+8=2", "he": "6+8=2", "en": "6+8=2" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "2+6=8 هي الجملة الصحيحة.", "he": "2+6=8 הוא המשפט הנכון.", "en": "2+6=8 is the correct sentence." },
          "skills": ["factFamilies"]
        },
        {
          "id": "m13-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "8-6=؟", "he": "8 - 6 = ?", "en": "8 - 6 = ?" },
          "options": [
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } }
          ],
          "correctAnswer": "n2",
          "explanation": { "ar": "8-6=2.", "he": "8-6=2.", "en": "8 - 6 = 2." },
          "skills": ["subtraction"]
        },
        {
          "id": "m13-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "أي جملة تساعدنا في حل 7-3=؟", "he": "איזו עובדה עוזרת לפתור 7-3=?", "en": "Which fact helps solve 7 - 3 = ?" },
          "options": [
            { "id": "a", "text": { "ar": "4+3=7", "he": "4+3=7", "en": "4+3=7" } },
            { "id": "b", "text": { "ar": "7+3=10", "he": "7+3=10", "en": "7+3=10" } },
            { "id": "c", "text": { "ar": "3-3=0", "he": "3-3=0", "en": "3-3=0" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "4+3=7 يساعدنا لنعرف أن 7-3=4.", "he": "4+3=7 עוזר לנו לדעת ש-7-3=4.", "en": "4+3=7 helps us know that 7-3=4." },
          "skills": ["factFamilies"]
        },
        {
          "id": "m13-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "أي جملة تنتمي إلى عائلة عمليات 3، 5، 8؟", "he": "איזה משפט שייך למשפחת העובדות 3, 5, 8?", "en": "Which sentence belongs to the 3, 5, 8 fact family?" },
          "options": [
            { "id": "a", "text": { "ar": "3+5=8", "he": "3+5=8", "en": "3+5=8" } },
            { "id": "b", "text": { "ar": "5+8=3", "he": "5+8=3", "en": "5+8=3" } },
            { "id": "c", "text": { "ar": "8+3=5", "he": "8+3=5", "en": "8+3=5" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "3+5=8 هي جملة صحيحة ضمن هذه العائلة.", "he": "3+5=8 הוא משפט נכון במשפחה הזו.", "en": "3+5=8 is a correct sentence in this fact family." },
          "skills": ["factFamilies"]
        },
        {
          "id": "m13-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m14",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 14,
      "lessonOrder": 14,
      "position": 14,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 120,
      "status": "draft",
      "title": {
        "ar": "كوّن العشرة",
        "he": "משלימים ל-10",
        "en": "Make Ten"
      },
      "description": {
        "ar": "إتقان الإكمال إلى 10 كاستراتيجية للتبصر العددي.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m14-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: إتقان الإكمال إلى 10 كاستراتيجية للتبصر العددي.",
            "he": "מוכנים? המטרה שלנו היום: לשלוט בהשלמה ל-10 כאסטרטגיית חשיבה מספרית.",
            "en": "Ready? Today's goal: master making ten as a number-sense strategy."
          }
        },
        {
          "id": "m14-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• المكمل إلى 10\n• إطار العشرة\n• أزواج تكوين 10",
            "he": "• המשלים ל-10\n• מסגרת העשר\n• זוגות שיוצרים 10",
            "en": "• The complement to 10\n• The ten-frame\n• Pairs that make 10"
          }
        },
        {
          "id": "m14-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "7+؟=10", "he": "7 + ? = 10", "en": "7 + ? = 10" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } }
          ],
          "correctAnswer": "n3",
          "explanation": { "ar": "7+3=10.", "he": "7+3=10.", "en": "7 + 3 = 10." },
          "skills": ["makeTen"]
        },
        {
          "id": "m14-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "10-6=؟", "he": "10 - 6 = ?", "en": "10 - 6 = ?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } }
          ],
          "correctAnswer": "n4",
          "explanation": { "ar": "10-6=4.", "he": "10-6=4.", "en": "10 - 6 = 4." },
          "skills": ["makeTen"]
        },
        {
          "id": "m14-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "أي زوج يصنع 10؟", "he": "איזה זוג יוצר 10?", "en": "Which pair makes 10?" },
          "options": [
            { "id": "a", "text": { "ar": "6 و4", "he": "6 ו-4", "en": "6 and 4" } },
            { "id": "b", "text": { "ar": "5 و4", "he": "5 ו-4", "en": "5 and 4" } },
            { "id": "c", "text": { "ar": "7 و2", "he": "7 ו-2", "en": "7 and 2" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "6+4=10.", "he": "6+4=10.", "en": "6 + 4 = 10." },
          "skills": ["makeTen"]
        },
        {
          "id": "m14-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "9+؟=10", "he": "9 + ? = 10", "en": "9 + ? = 10" },
          "options": [
            { "id": "n0", "text": { "ar": "0", "he": "0", "en": "0" } },
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } }
          ],
          "correctAnswer": "n1",
          "explanation": { "ar": "9+1=10.", "he": "9+1=10.", "en": "9 + 1 = 10." },
          "skills": ["makeTen"]
        },
        {
          "id": "m14-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m15",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 15,
      "lessonOrder": 15,
      "position": 15,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 110,
      "status": "draft",
      "title": {
        "ar": "أسرار الأعداد 11-20",
        "he": "סודות המספרים 11-20",
        "en": "Numbers 11-20"
      },
      "description": {
        "ar": "فهم الأعداد 11-20 كعشرة ووحدات.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m15-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم الأعداد 11-20 كعشرة ووحدات.",
            "he": "מוכנים? המטרה שלנו היום: להבין מספרים 11-20 כעשרה ויחידות.",
            "en": "Ready? Today's goal: understand numbers 11-20 as ten and some ones."
          }
        },
        {
          "id": "m15-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• قراءة وكتابة 11-20\n• عشرة ووحدات\n• عد تصاعدي وتنازلي",
            "he": "• קריאה וכתיבה של 11-20\n• עשרה ויחידות\n• ספירה קדימה ואחורה",
            "en": "• Reading and writing 11-20\n• Ten and ones\n• Counting forward and backward"
          }
        },
        {
          "id": "m15-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "10+6=؟", "he": "10 + 6 = ?", "en": "10 + 6 = ?" },
          "options": [
            { "id": "n15", "text": { "ar": "15", "he": "15", "en": "15" } },
            { "id": "n16", "text": { "ar": "16", "he": "16", "en": "16" } },
            { "id": "n17", "text": { "ar": "17", "he": "17", "en": "17" } }
          ],
          "correctAnswer": "n16",
          "explanation": { "ar": "10+6=16.", "he": "10+6=16.", "en": "10 + 6 = 16." },
          "skills": ["placeValue"]
        },
        {
          "id": "m15-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "18 = عشرة وكم وحدة؟", "he": "18 = עשרה וכמה יחידות?", "en": "18 = ten and how many ones?" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "18=10+8.", "he": "18=10+8.", "en": "18 = 10 + 8." },
          "skills": ["placeValue"]
        },
        {
          "id": "m15-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "ما بعد 19؟", "he": "מה בא אחרי 19?", "en": "What comes after 19?" },
          "options": [
            { "id": "n18", "text": { "ar": "18", "he": "18", "en": "18" } },
            { "id": "n20", "text": { "ar": "20", "he": "20", "en": "20" } },
            { "id": "n21", "text": { "ar": "21", "he": "21", "en": "21" } }
          ],
          "correctAnswer": "n20",
          "explanation": { "ar": "العدد الذي يأتي بعد 19 هو 20.", "he": "המספר שבא אחרי 19 הוא 20.", "en": "The number after 19 is 20." },
          "skills": ["sequencing"]
        },
        {
          "id": "m15-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "القطار الناقص: 11، 12، __، 14، 15 — ما العدد الناقص؟", "he": "רכבת המספרים החסרה: 11, 12, __, 14, 15 - מה חסר?", "en": "Missing number train: 11, 12, __, 14, 15 - what is missing?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } }
          ],
          "correctAnswer": "n13",
          "explanation": { "ar": "العدد بين 12 و14 هو 13.", "he": "המספר שבין 12 ל-14 הוא 13.", "en": "The number between 12 and 14 is 13." },
          "skills": ["sequencing"]
        },
        {
          "id": "m15-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m16",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 16,
      "lessonOrder": 16,
      "position": 16,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 115,
      "status": "draft",
      "title": {
        "ar": "رتّب العشرة الثانية",
        "he": "מסדרים עד 20",
        "en": "Order to 20"
      },
      "description": {
        "ar": "مقارنة وترتيب الأعداد حتى 20.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m16-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: مقارنة وترتيب الأعداد حتى 20.",
            "he": "מוכנים? המטרה שלנו היום: להשוות ולסדר מספרים עד 20.",
            "en": "Ready? Today's goal: compare and order numbers up to 20."
          }
        },
        {
          "id": "m16-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• مقارنة\n• ترتيب\n• السابق والتالي",
            "he": "• השוואה\n• סידור\n• לפני ואחרי",
            "en": "• Comparing\n• Ordering\n• Before and after"
          }
        },
        {
          "id": "m16-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "17 __ 12", "he": "17 __ 12", "en": "17 __ 12" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "gt",
          "explanation": { "ar": "17 أكبر من 12.", "he": "17 גדול מ-12.", "en": "17 is greater than 12." },
          "skills": ["comparing"]
        },
        {
          "id": "m16-q2",
          "type": "sequence",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "رتب الأعداد 19، 11، 15 من الأصغر إلى الأكبر.", "he": "סדרו את המספרים האלה מהקטן לגדול: 19, 11, 15", "en": "Put these numbers in order from smallest to largest: 19, 11, 15" },
          "items": [
            { "id": "v0-19", "text": { "ar": "19", "he": "19", "en": "19" } },
            { "id": "v1-11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "v2-15", "text": { "ar": "15", "he": "15", "en": "15" } }
          ],
          "correctOrder": ["v1-11", "v2-15", "v0-19"],
          "explanation": { "ar": "الترتيب الصحيح هو 11، 15، 19.", "he": "הסדר הנכון הוא 11, 15, 19.", "en": "The correct order is 11, 15, 19." },
          "skills": ["ordering"]
        },
        {
          "id": "m16-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "ما العدد الذي بين 13 و15؟", "he": "איזה מספר נמצא בין 13 ל-15?", "en": "What number is between 13 and 15?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } },
            { "id": "n16", "text": { "ar": "16", "he": "16", "en": "16" } }
          ],
          "correctAnswer": "n14",
          "explanation": { "ar": "العدد بين 13 و15 هو 14.", "he": "המספר שבין 13 ל-15 הוא 14.", "en": "The number between 13 and 15 is 14." },
          "skills": ["sequencing"]
        },
        {
          "id": "m16-challenge",
          "type": "sequence",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "رتّب ستة أعداد حتى 20: 18، 11، 15، 20، 13، 16", "he": "סדרו שישה מספרים עד 20: 18, 11, 15, 20, 13, 16", "en": "Order six numbers up to 20: 18, 11, 15, 20, 13, 16" },
          "items": [
            { "id": "v0-18", "text": { "ar": "18", "he": "18", "en": "18" } },
            { "id": "v1-11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "v2-15", "text": { "ar": "15", "he": "15", "en": "15" } },
            { "id": "v3-20", "text": { "ar": "20", "he": "20", "en": "20" } },
            { "id": "v4-13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "v5-16", "text": { "ar": "16", "he": "16", "en": "16" } }
          ],
          "correctOrder": ["v1-11", "v4-13", "v2-15", "v5-16", "v0-18", "v3-20"],
          "explanation": { "ar": "الترتيب الصحيح هو 11، 13، 15، 16، 18، 20.", "he": "הסדר הנכון הוא 11, 13, 15, 16, 18, 20.", "en": "The correct order is 11, 13, 15, 16, 18, 20." },
          "skills": ["ordering"]
        },
        {
          "id": "m16-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m17",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 17,
      "lessonOrder": 17,
      "position": 17,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 130,
      "status": "draft",
      "title": {
        "ar": "الجسر إلى 20",
        "he": "הגשר ל-20",
        "en": "Bridge to 20"
      },
      "description": {
        "ar": "الجمع ضمن 20 باستخدام تكوين 10.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m17-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: الجمع ضمن 20 باستخدام تكوين 10.",
            "he": "מוכנים? המטרה שלנו היום: לחבר עד 20 על ידי השלמה ל-10 קודם.",
            "en": "Ready? Today's goal: add within 20 by making ten first."
          }
        },
        {
          "id": "m17-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• تفكيك العدد\n• تكوين 10\n• إطارا عشرة",
            "he": "• פירוק מספר\n• השלמה ל-10\n• שתי מסגרות עשר",
            "en": "• Decomposing a number\n• Making 10\n• Two ten-frames"
          }
        },
        {
          "id": "m17-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "9+4=؟", "he": "9 + 4 = ?", "en": "9 + 4 = ?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } }
          ],
          "correctAnswer": "n13",
          "explanation": { "ar": "9+4=13.", "he": "9+4=13.", "en": "9 + 4 = 13." },
          "skills": ["addition"]
        },
        {
          "id": "m17-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "7+6=؟", "he": "7 + 6 = ?", "en": "7 + 6 = ?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } }
          ],
          "correctAnswer": "n13",
          "explanation": { "ar": "7+6=13.", "he": "7+6=13.", "en": "7 + 6 = 13." },
          "skills": ["addition"]
        },
        {
          "id": "m17-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "10+8=؟", "he": "10 + 8 = ?", "en": "10 + 8 = ?" },
          "options": [
            { "id": "n17", "text": { "ar": "17", "he": "17", "en": "17" } },
            { "id": "n18", "text": { "ar": "18", "he": "18", "en": "18" } },
            { "id": "n19", "text": { "ar": "19", "he": "19", "en": "19" } }
          ],
          "correctAnswer": "n18",
          "explanation": { "ar": "10+8=18.", "he": "10+8=18.", "en": "10 + 8 = 18." },
          "skills": ["addition"]
        },
        {
          "id": "m17-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "8+5=؟", "he": "8+5=?", "en": "8 + 5 = ?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } }
          ],
          "correctAnswer": "n13",
          "explanation": { "ar": "8+5=13.", "he": "8+5=13.", "en": "8 + 5 = 13." },
          "skills": ["addition"]
        },
        {
          "id": "m17-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m18",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 18,
      "lessonOrder": 18,
      "position": 18,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 130,
      "status": "draft",
      "title": {
        "ar": "ارجع بأمان",
        "he": "חוזרים בבטחה",
        "en": "Subtract to 20"
      },
      "description": {
        "ar": "الطرح ضمن 20 باستخدام استراتيجيات متنوعة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m18-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: الطرح ضمن 20 باستخدام استراتيجيات متنوعة.",
            "he": "מוכנים? המטרה שלנו היום: לחסר עד 20 באסטרטגיות מגוונות.",
            "en": "Ready? Today's goal: subtract within 20 using varied strategies."
          }
        },
        {
          "id": "m18-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• الرجوع إلى 10\n• خط الأعداد\n• التحقق بالجمع",
            "he": "• חזרה ל-10\n• ישר המספרים\n• בדיקה בעזרת חיבור",
            "en": "• Going back to 10\n• The number line\n• Checking with addition"
          }
        },
        {
          "id": "m18-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "16-4=؟", "he": "16 - 4 = ?", "en": "16 - 4 = ?" },
          "options": [
            { "id": "n11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } }
          ],
          "correctAnswer": "n12",
          "explanation": { "ar": "16-4=12.", "he": "16-4=12.", "en": "16 - 4 = 12." },
          "skills": ["subtraction"]
        },
        {
          "id": "m18-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "12-7=؟", "he": "12 - 7 = ?", "en": "12 - 7 = ?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "12-7=5.", "he": "12-7=5.", "en": "12 - 7 = 5." },
          "skills": ["subtraction"]
        },
        {
          "id": "m18-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "20-9=؟", "he": "20 - 9 = ?", "en": "20 - 9 = ?" },
          "options": [
            { "id": "n10", "text": { "ar": "10", "he": "10", "en": "10" } },
            { "id": "n11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } }
          ],
          "correctAnswer": "n11",
          "explanation": { "ar": "20-9=11.", "he": "20-9=11.", "en": "20 - 9 = 11." },
          "skills": ["subtraction"]
        },
        {
          "id": "m18-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "15-8=؟", "he": "15-8=?", "en": "15 - 8 = ?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "15-8=7.", "he": "15-8=7.", "en": "15 - 8 = 7." },
          "skills": ["subtraction"]
        },
        {
          "id": "m18-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m19",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 19,
      "lessonOrder": 19,
      "position": 19,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 140,
      "status": "draft",
      "title": {
        "ar": "المحقق الرياضي",
        "he": "הבלש המתמטי",
        "en": "Math Detective"
      },
      "description": {
        "ar": "حل مسائل كلامية بسيطة وفهم المطلوب.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m19-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: حل مسائل كلامية بسيطة وفهم المطلوب.",
            "he": "מוכנים? המטרה שלנו היום: לפתור בעיות מילוליות פשוטות ולהבין מה נדרש.",
            "en": "Ready? Today's goal: solve simple word problems and understand what is asked."
          }
        },
        {
          "id": "m19-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• استخراج المعطيات\n• اختيار العملية\n• كتابة جواب",
            "he": "• איתור הנתונים\n• בחירת הפעולה\n• כתיבת תשובה",
            "en": "• Finding the given information\n• Choosing the operation\n• Writing an answer"
          }
        },
        {
          "id": "m19-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "ليان معها 7 أقلام وأخذت 5 أقلام أخرى، كم أصبح معها؟", "he": "ללִיאן יש 7 עטים וקיבלה עוד 5. כמה יש לה עכשיו?", "en": "Lian has 7 pens and got 5 more. How many does she have now?" },
          "options": [
            { "id": "n11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } }
          ],
          "correctAnswer": "n12",
          "explanation": { "ar": "7+5=12.", "he": "7+5=12.", "en": "7 + 5 = 12." },
          "skills": ["wordProblems", "addition"]
        },
        {
          "id": "m19-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "في السلة 14 كرة وأخذنا 6، كم بقي؟", "he": "בסל יש 14 כדורים ולקחנו 6. כמה נשארו?", "en": "The basket has 14 balls and we took 6. How many remain?" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "14-6=8.", "he": "14-6=8.", "en": "14 - 6 = 8." },
          "skills": ["wordProblems", "subtraction"]
        },
        {
          "id": "m19-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "عند أحمد 10 بطاقات، أعطى صديقه 4 بطاقات. كم بطاقة بقيت مع أحمد؟", "he": "לאחמד יש 10 כרטיסים, הוא נתן לחברו 4 כרטיסים. כמה כרטיסים נשארו לאחמד?", "en": "Ahmad has 10 cards and gave his friend 4 cards. How many cards does Ahmad have left?" },
          "options": [
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } }
          ],
          "correctAnswer": "n6",
          "explanation": { "ar": "10-4=6.", "he": "10-4=6.", "en": "10 - 4 = 6." },
          "skills": ["wordProblems", "subtraction"]
        },
        {
          "id": "m19-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m20",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-2",
      "order": 20,
      "lessonOrder": 20,
      "position": 20,
      "activityType": "mission",
      "estimatedMinutes": 35,
      "xpReward": 170,
      "status": "draft",
      "title": {
        "ar": "مختبر العمليات",
        "he": "מעבדת הפעולות",
        "en": "Operations Lab"
      },
      "description": {
        "ar": "دمج مهارات المرحلة الثانية.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m20-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: دمج مهارات المرحلة الثانية.",
            "he": "מוכנים? המטרה שלנו היום: לשלב את המיומנויות משלב 2.",
            "en": "Ready? Today's goal: combine the skills from Stage 2."
          }
        },
        {
          "id": "m20-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• جمع وطرح حتى 20\n• الإكمال إلى 10\n• مسائل كلامية",
            "he": "• חיבור וחיסור עד 20\n• השלמה ל-10\n• בעיות מילוליות",
            "en": "• Adding and subtracting up to 20\n• Making 10\n• Word problems"
          }
        },
        {
          "id": "m20-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "8+؟=10", "he": "8 + ? = 10", "en": "8 + ? = 10" },
          "options": [
            { "id": "n1", "text": { "ar": "1", "he": "1", "en": "1" } },
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } }
          ],
          "correctAnswer": "n2",
          "explanation": { "ar": "8+2=10.", "he": "8+2=10.", "en": "8 + 2 = 10." },
          "skills": ["makeTen"]
        },
        {
          "id": "m20-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "15-7=؟", "he": "15 - 7 = ?", "en": "15 - 7 = ?" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "15-7=8.", "he": "15-7=8.", "en": "15 - 7 = 8." },
          "skills": ["subtraction"]
        },
        {
          "id": "m20-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "9+6=؟", "he": "9 + 6 = ?", "en": "9 + 6 = ?" },
          "options": [
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } },
            { "id": "n15", "text": { "ar": "15", "he": "15", "en": "15" } },
            { "id": "n16", "text": { "ar": "16", "he": "16", "en": "16" } }
          ],
          "correctAnswer": "n15",
          "explanation": { "ar": "9+6=15.", "he": "9+6=15.", "en": "9 + 6 = 15." },
          "skills": ["addition"]
        },
        {
          "id": "m20-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "في المحطة الأخيرة: 12-5=؟", "he": "בתחנה האחרונה: 12-5=?", "en": "At the final station: 12 - 5 = ?" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "12-5=7.", "he": "12-5=7.", "en": "12 - 5 = 7." },
          "skills": ["subtraction"]
        },
        {
          "id": "m20-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m21",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 21,
      "lessonOrder": 21,
      "position": 21,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 130,
      "status": "draft",
      "title": {
        "ar": "العشرات والوحدات",
        "he": "עשרות ויחידות",
        "en": "Tens and Ones"
      },
      "description": {
        "ar": "فهم القيمة المكانية للأعداد ذات الرقمين.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m21-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: فهم القيمة المكانية للأعداد ذات الرقمين.",
            "he": "מוכנים? המטרה שלנו היום: להבין את הערך המקומי של מספרים דו-ספרתיים.",
            "en": "Ready? Today's goal: understand place value for two-digit numbers."
          }
        },
        {
          "id": "m21-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• تجميع عشرة وحدات\n• العشرات والوحدات\n• بناء عدد",
            "he": "• קיבוץ עשר יחידות\n• עשרות ויחידות\n• בניית מספר",
            "en": "• Grouping ten ones\n• Tens and ones\n• Building a number"
          }
        },
        {
          "id": "m21-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "26 = كم عشرة وكم وحدة؟", "he": "26 = כמה עשרות וכמה יחידות?", "en": "26 = how many tens and how many ones?" },
          "options": [
            { "id": "a", "text": { "ar": "2 عشرات و6 وحدات", "he": "2 עשרות ו-6 יחידות", "en": "2 tens and 6 ones" } },
            { "id": "b", "text": { "ar": "6 عشرات و2 وحدات", "he": "6 עשרות ו-2 יחידות", "en": "6 tens and 2 ones" } },
            { "id": "c", "text": { "ar": "2 عشرات و0 وحدات", "he": "2 עשרות ו-0 יחידות", "en": "2 tens and 0 ones" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "26 يتكون من 2 عشرات و6 وحدات.", "he": "26 מורכב מ-2 עשרות ו-6 יחידות.", "en": "26 is made of 2 tens and 6 ones." },
          "skills": ["placeValue"]
        },
        {
          "id": "m21-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "4 عشرات و2 وحدات = ؟", "he": "4 עשרות ו-2 יחידות = ?", "en": "4 tens and 2 ones = ?" },
          "options": [
            { "id": "n24", "text": { "ar": "24", "he": "24", "en": "24" } },
            { "id": "n42", "text": { "ar": "42", "he": "42", "en": "42" } },
            { "id": "n40", "text": { "ar": "40", "he": "40", "en": "40" } }
          ],
          "correctAnswer": "n42",
          "explanation": { "ar": "4 عشرات و2 وحدات يساوي 42.", "he": "4 עשרות ו-2 יחידות שווים ל-42.", "en": "4 tens and 2 ones equal 42." },
          "skills": ["placeValue"]
        },
        {
          "id": "m21-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "31 = كم عشرة وكم وحدة؟", "he": "31 = כמה עשרות וכמה יחידות?", "en": "31 = how many tens and how many ones?" },
          "options": [
            { "id": "a", "text": { "ar": "3 عشرات ووحدة واحدة", "he": "3 עשרות ויחידה אחת", "en": "3 tens and 1 one" } },
            { "id": "b", "text": { "ar": "عشرة واحدة و3 وحدات", "he": "עשרה אחת ו-3 יחידות", "en": "1 ten and 3 ones" } },
            { "id": "c", "text": { "ar": "3 عشرات و0 وحدات", "he": "3 עשרות ו-0 יחידות", "en": "3 tens and 0 ones" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "31 يتكون من 3 عشرات ووحدة واحدة.", "he": "31 מורכב מ-3 עשרות ויחידה אחת.", "en": "31 is made of 3 tens and 1 one." },
          "skills": ["placeValue"]
        },
        {
          "id": "m21-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "5 عشرات و7 وحدات = ؟", "he": "5 עשרות ו-7 יחידות = ?", "en": "5 tens and 7 ones = ?" },
          "options": [
            { "id": "n57", "text": { "ar": "57", "he": "57", "en": "57" } },
            { "id": "n75", "text": { "ar": "75", "he": "75", "en": "75" } },
            { "id": "n50", "text": { "ar": "50", "he": "50", "en": "50" } }
          ],
          "correctAnswer": "n57",
          "explanation": { "ar": "5 عشرات و7 وحدات يساوي 57.", "he": "5 עשרות ו-7 יחידות שווים ל-57.", "en": "5 tens and 7 ones equal 57." },
          "skills": ["placeValue"]
        },
        {
          "id": "m21-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m22",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 22,
      "lessonOrder": 22,
      "position": 22,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 130,
      "status": "draft",
      "title": {
        "ar": "ابنِ العدد",
        "he": "בונים מספר",
        "en": "Build the Number"
      },
      "description": {
        "ar": "قراءة وكتابة وتمثيل أعداد ذات رقمين.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m22-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: قراءة وكتابة وتمثيل أعداد ذات رقمين.",
            "he": "מוכנים? המטרה שלנו היום: לקרוא, לכתוב ולייצג מספרים דו-ספרתיים.",
            "en": "Ready? Today's goal: read, write, and represent two-digit numbers."
          }
        },
        {
          "id": "m22-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• رمز وتمثيل\n• تفكيك عشرات ووحدات\n• إعادة التكوين",
            "he": "• סמל וייצוג\n• פירוק לעשרות ויחידות\n• הרכבה מחדש",
            "en": "• Symbol and representation\n• Decomposing into tens and ones\n• Recomposing"
          }
        },
        {
          "id": "m22-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "50+3=؟", "he": "50 + 3 = ?", "en": "50 + 3 = ?" },
          "options": [
            { "id": "n35", "text": { "ar": "35", "he": "35", "en": "35" } },
            { "id": "n43", "text": { "ar": "43", "he": "43", "en": "43" } },
            { "id": "n53", "text": { "ar": "53", "he": "53", "en": "53" } }
          ],
          "correctAnswer": "n53",
          "explanation": { "ar": "50+3=53.", "he": "50+3=53.", "en": "50 + 3 = 53." },
          "skills": ["placeValue"]
        },
        {
          "id": "m22-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "62=60+؟", "he": "62=60+?", "en": "62 = 60 + ?" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n2",
          "explanation": { "ar": "60+2=62.", "he": "60+2=62.", "en": "60 + 2 = 62." },
          "skills": ["placeValue"]
        },
        {
          "id": "m22-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "اكتب 'سبعة وثلاثين' كعدد", "he": "כתבו את 'שלושים ושבע' כמספר", "en": "Write 'thirty-seven' as a number" },
          "options": [
            { "id": "n17", "text": { "ar": "17", "he": "17", "en": "17" } },
            { "id": "n37", "text": { "ar": "37", "he": "37", "en": "37" } },
            { "id": "n73", "text": { "ar": "73", "he": "73", "en": "73" } }
          ],
          "correctAnswer": "n37",
          "explanation": { "ar": "سبعة وثلاثين تساوي 37.", "he": "שלושים ושבע שווה ל-37.", "en": "Thirty-seven equals 37." },
          "skills": ["placeValue"]
        },
        {
          "id": "m22-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "أي رقم يساوي 'أربعة وثمانين'؟", "he": "איזה מספר שווה ל'שמונים וארבע'?", "en": "Which number equals 'eighty-four'?" },
          "options": [
            { "id": "n48", "text": { "ar": "48", "he": "48", "en": "48" } },
            { "id": "n84", "text": { "ar": "84", "he": "84", "en": "84" } },
            { "id": "n44", "text": { "ar": "44", "he": "44", "en": "44" } }
          ],
          "correctAnswer": "n84",
          "explanation": { "ar": "أربعة وثمانين تساوي 84.", "he": "שמונים וארבע שווה ל-84.", "en": "Eighty-four equals 84." },
          "skills": ["placeValue"]
        },
        {
          "id": "m22-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m23",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 23,
      "lessonOrder": 23,
      "position": 23,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 140,
      "status": "draft",
      "title": {
        "ar": "خريطة المئة",
        "he": "לוח המאה",
        "en": "Hundreds Chart"
      },
      "description": {
        "ar": "التعرّف إلى الأعداد حتى 100 واستخدام لوحة المئة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m23-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: التعرّف إلى الأعداد حتى 100 واستخدام لوحة المئة.",
            "he": "מוכנים? המטרה שלנו היום: להכיר מספרים עד 100 ולהשתמש בלוח המאה.",
            "en": "Ready? Today's goal: get to know numbers up to 100 and use the hundreds chart."
          }
        },
        {
          "id": "m23-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• موقع العدد\n• +1 و-1\n• +10 و-10",
            "he": "• מיקום המספר\n• +1 ו--1\n• +10 ו--10",
            "en": "• The position of a number\n• +1 and -1\n• +10 and -10"
          }
        },
        {
          "id": "m23-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "ما بعد 59؟", "he": "מה בא אחרי 59?", "en": "What comes after 59?" },
          "options": [
            { "id": "n58", "text": { "ar": "58", "he": "58", "en": "58" } },
            { "id": "n60", "text": { "ar": "60", "he": "60", "en": "60" } },
            { "id": "n61", "text": { "ar": "61", "he": "61", "en": "61" } }
          ],
          "correctAnswer": "n60",
          "explanation": { "ar": "العدد الذي يأتي بعد 59 هو 60.", "he": "המספר שבא אחרי 59 הוא 60.", "en": "The number that comes after 59 is 60." },
          "skills": ["sequencing"]
        },
        {
          "id": "m23-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "ما قبل 70؟", "he": "מה בא לפני 70?", "en": "What comes before 70?" },
          "options": [
            { "id": "n68", "text": { "ar": "68", "he": "68", "en": "68" } },
            { "id": "n69", "text": { "ar": "69", "he": "69", "en": "69" } },
            { "id": "n71", "text": { "ar": "71", "he": "71", "en": "71" } }
          ],
          "correctAnswer": "n69",
          "explanation": { "ar": "العدد الذي يسبق 70 هو 69.", "he": "המספר שלפני 70 הוא 69.", "en": "The number before 70 is 69." },
          "skills": ["sequencing"]
        },
        {
          "id": "m23-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "في لوحة المئة، ما العدد الذي تحت 36 مباشرة؟", "he": "בלוח המאה, איזה מספר נמצא ישר מתחת ל-36?", "en": "On the hundreds chart, what number is directly below 36?" },
          "options": [
            { "id": "n26", "text": { "ar": "26", "he": "26", "en": "26" } },
            { "id": "n46", "text": { "ar": "46", "he": "46", "en": "46" } },
            { "id": "n37", "text": { "ar": "37", "he": "37", "en": "37" } }
          ],
          "correctAnswer": "n46",
          "explanation": { "ar": "العدد الذي تحت 36 مباشرة هو 46 (36+10).", "he": "המספר שמתחת ל-36 ישירות הוא 46 (36+10).", "en": "The number directly below 36 is 46 (36 + 10)." },
          "skills": ["placeValue"]
        },
        {
          "id": "m23-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "اعثر على الكنز: ما العدد الذي فوق 47 مباشرة في لوحة المئة؟", "he": "מצאו את האוצר: איזה מספר נמצא ישר מעל ל-47 בלוח המאה?", "en": "Find the treasure: what number is directly above 47 on the hundreds chart?" },
          "options": [
            { "id": "n27", "text": { "ar": "27", "he": "27", "en": "27" } },
            { "id": "n37", "text": { "ar": "37", "he": "37", "en": "37" } },
            { "id": "n57", "text": { "ar": "57", "he": "57", "en": "57" } }
          ],
          "correctAnswer": "n37",
          "explanation": { "ar": "العدد الذي فوق 47 مباشرة هو 37 (47-10).", "he": "המספר שמעל ל-47 ישירות הוא 37 (47-10).", "en": "The number directly above 47 is 37 (47 - 10)." },
          "skills": ["placeValue"]
        },
        {
          "id": "m23-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m24",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 24,
      "lessonOrder": 24,
      "position": 24,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 140,
      "status": "draft",
      "title": {
        "ar": "من الأقرب إلى 100؟",
        "he": "מי קרוב יותר ל-100?",
        "en": "Closer to 100"
      },
      "description": {
        "ar": "مقارنة وترتيب الأعداد حتى 100.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m24-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: مقارنة وترتيب الأعداد حتى 100.",
            "he": "מוכנים? המטרה שלנו היום: להשוות ולסדר מספרים עד 100.",
            "en": "Ready? Today's goal: compare and order numbers up to 100."
          }
        },
        {
          "id": "m24-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• مقارنة العشرات\n• مقارنة الوحدات\n• ترتيب",
            "he": "• השוואת עשרות\n• השוואת יחידות\n• סידור",
            "en": "• Comparing tens\n• Comparing ones\n• Ordering"
          }
        },
        {
          "id": "m24-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "47 __ 52", "he": "47 __ 52", "en": "47 __ 52" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "lt",
          "explanation": { "ar": "47 أصغر من 52.", "he": "47 קטן מ-52.", "en": "47 is less than 52." },
          "skills": ["comparing"]
        },
        {
          "id": "m24-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "68 __ 63", "he": "68 __ 63", "en": "68 __ 63" },
          "options": [
            { "id": "gt", "text": { "ar": "أكبر من (>)", "he": "גדול מ (>)", "en": "Greater than (>)" } },
            { "id": "lt", "text": { "ar": "أصغر من (<)", "he": "קטן מ (<)", "en": "Less than (<)" } },
            { "id": "eq", "text": { "ar": "يساوي (=)", "he": "שווה ל (=)", "en": "Equal to (=)" } }
          ],
          "correctAnswer": "gt",
          "explanation": { "ar": "68 أكبر من 63.", "he": "68 גדול מ-63.", "en": "68 is greater than 63." },
          "skills": ["comparing"]
        },
        {
          "id": "m24-q3",
          "type": "sequence",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "رتب الأعداد 29، 92، 45، 54 من الأصغر إلى الأكبر.", "he": "סדרו את המספרים האלה מהקטן לגדול: 29, 92, 45, 54", "en": "Put these numbers in order from smallest to largest: 29, 92, 45, 54" },
          "items": [
            { "id": "v0-29", "text": { "ar": "29", "he": "29", "en": "29" } },
            { "id": "v1-92", "text": { "ar": "92", "he": "92", "en": "92" } },
            { "id": "v2-45", "text": { "ar": "45", "he": "45", "en": "45" } },
            { "id": "v3-54", "text": { "ar": "54", "he": "54", "en": "54" } }
          ],
          "correctOrder": ["v0-29", "v2-45", "v3-54", "v1-92"],
          "explanation": { "ar": "الترتيب الصحيح هو 29، 45، 54، 92.", "he": "הסדר הנכון הוא 29, 45, 54, 92.", "en": "The correct order is 29, 45, 54, 92." },
          "skills": ["ordering"]
        },
        {
          "id": "m24-challenge",
          "type": "sequence",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "رتّب سبع بطاقات حتى 100: 88، 14، 53، 67، 9، 41، 76", "he": "סדרו שבעה כרטיסים עד 100: 88, 14, 53, 67, 9, 41, 76", "en": "Order seven cards up to 100: 88, 14, 53, 67, 9, 41, 76" },
          "items": [
            { "id": "v0-88", "text": { "ar": "88", "he": "88", "en": "88" } },
            { "id": "v1-14", "text": { "ar": "14", "he": "14", "en": "14" } },
            { "id": "v2-53", "text": { "ar": "53", "he": "53", "en": "53" } },
            { "id": "v3-67", "text": { "ar": "67", "he": "67", "en": "67" } },
            { "id": "v4-9", "text": { "ar": "9", "he": "9", "en": "9" } },
            { "id": "v5-41", "text": { "ar": "41", "he": "41", "en": "41" } },
            { "id": "v6-76", "text": { "ar": "76", "he": "76", "en": "76" } }
          ],
          "correctOrder": ["v4-9", "v1-14", "v5-41", "v2-53", "v3-67", "v6-76", "v0-88"],
          "explanation": { "ar": "الترتيب الصحيح هو 9، 14، 41، 53، 67، 76، 88.", "he": "הסדר הנכון הוא 9, 14, 41, 53, 67, 76, 88.", "en": "The correct order is 9, 14, 41, 53, 67, 76, 88." },
          "skills": ["ordering"]
        },
        {
          "id": "m24-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m25",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 25,
      "lessonOrder": 25,
      "position": 25,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 145,
      "status": "draft",
      "title": {
        "ar": "اكتشف النمط",
        "he": "מגלים את הדפוס",
        "en": "Find the Pattern"
      },
      "description": {
        "ar": "اكتشاف أنماط عددية والعد بالقفز.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m25-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: اكتشاف أنماط عددية والعد بالقفز.",
            "he": "מוכנים? המטרה שלנו היום: לגלות דפוסים מספריים ולספור בקפיצות.",
            "en": "Ready? Today's goal: discover number patterns and skip counting."
          }
        },
        {
          "id": "m25-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• العد بـ2\n• العد بـ5\n• العد بـ10",
            "he": "• ספירה ב-2\n• ספירה ב-5\n• ספירה ב-10",
            "en": "• Counting by 2s\n• Counting by 5s\n• Counting by 10s"
          }
        },
        {
          "id": "m25-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "2، 4، 6، __", "he": "2, 4, 6, __", "en": "2, 4, 6, __" },
          "options": [
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } },
            { "id": "n9", "text": { "ar": "9", "he": "9", "en": "9" } }
          ],
          "correctAnswer": "n8",
          "explanation": { "ar": "العد بالقفز باثنين: 2، 4، 6، 8.", "he": "ספירה בקפיצות של 2: 2, 4, 6, 8.", "en": "Skip counting by 2: 2, 4, 6, 8." },
          "skills": ["patterns"]
        },
        {
          "id": "m25-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "10، 20، 30، __", "he": "10, 20, 30, __", "en": "10, 20, 30, __" },
          "options": [
            { "id": "n35", "text": { "ar": "35", "he": "35", "en": "35" } },
            { "id": "n40", "text": { "ar": "40", "he": "40", "en": "40" } },
            { "id": "n45", "text": { "ar": "45", "he": "45", "en": "45" } }
          ],
          "correctAnswer": "n40",
          "explanation": { "ar": "العد بالقفز بعشرة: 10، 20، 30، 40.", "he": "ספירה בקפיצות של 10: 10, 20, 30, 40.", "en": "Skip counting by 10: 10, 20, 30, 40." },
          "skills": ["patterns"]
        },
        {
          "id": "m25-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "5، 10، 15، __", "he": "5, 10, 15, __", "en": "5, 10, 15, __" },
          "options": [
            { "id": "n18", "text": { "ar": "18", "he": "18", "en": "18" } },
            { "id": "n20", "text": { "ar": "20", "he": "20", "en": "20" } },
            { "id": "n25", "text": { "ar": "25", "he": "25", "en": "25" } }
          ],
          "correctAnswer": "n20",
          "explanation": { "ar": "العد بالقفز بخمسة: 5، 10، 15، 20.", "he": "ספירה בקפיצות של 5: 5, 10, 15, 20.", "en": "Skip counting by 5: 5, 10, 15, 20." },
          "skills": ["patterns"]
        },
        {
          "id": "m25-challenge",
          "type": "sequence",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "رتّب هذه الأعداد لتكوّن نمط العد بالقفز باثنين: 6، 2، 10، 4، 8", "he": "סדרו את המספרים כדי ליצור דפוס של ספירה בקפיצות של 2: 6, 2, 10, 4, 8", "en": "Order these numbers to form a skip-counting-by-2 pattern: 6, 2, 10, 4, 8" },
          "items": [
            { "id": "v0-6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "v1-2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "v2-10", "text": { "ar": "10", "he": "10", "en": "10" } },
            { "id": "v3-4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "v4-8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctOrder": ["v1-2", "v3-4", "v0-6", "v4-8", "v2-10"],
          "explanation": { "ar": "النمط الصحيح هو 2، 4، 6، 8، 10.", "he": "הדפוס הנכון הוא 2, 4, 6, 8, 10.", "en": "The correct pattern is 2, 4, 6, 8, 10." },
          "skills": ["patterns"]
        },
        {
          "id": "m25-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m26",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 26,
      "lessonOrder": 26,
      "position": 26,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 150,
      "status": "draft",
      "title": {
        "ar": "استراتيجيات ذكية",
        "he": "אסטרטגיות חכמות",
        "en": "Smart Strategies"
      },
      "description": {
        "ar": "تعزيز التبصر العددي واختيار استراتيجية مناسبة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m26-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: تعزيز التبصر العددي واختيار استراتيجية مناسبة.",
            "he": "מוכנים? המטרה שלנו היום: לחזק תובנה מספרית ולבחור אסטרטגיה מתאימה.",
            "en": "Ready? Today's goal: strengthen number sense and choose a suitable strategy."
          }
        },
        {
          "id": "m26-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• فحص المعقولية\n• اختيار طريقة\n• أعداد مرساة",
            "he": "• בדיקת סבירות\n• בחירת שיטה\n• מספרי עוגן",
            "en": "• Checking reasonableness\n• Choosing a method\n• Anchor numbers"
          }
        },
        {
          "id": "m26-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "هل يمكن أن يساوي 9+8 ثمانية؟", "he": "האם 9+8 יכול להיות שווה ל-8?", "en": "Can 9 + 8 equal 8?" },
          "options": [
            { "id": "yes", "text": { "ar": "نعم", "he": "כן", "en": "Yes" } },
            { "id": "no", "text": { "ar": "لا", "he": "לא", "en": "No" } }
          ],
          "correctAnswer": "no",
          "explanation": { "ar": "عند الجمع إلى 9 يكون الناتج أكبر من 9 دائمًا.", "he": "כשמוסיפים ל-9 התוצאה תמיד גדולה מ-9.", "en": "Adding to 9 always gives a result greater than 9." },
          "skills": ["numberSense"]
        },
        {
          "id": "m26-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "أي أسهل: 10+6 أم عد 16 نقطة واحدة تلو الأخرى؟", "he": "מה קל יותר: 10+6 או לספור 16 נקודות אחת אחת?", "en": "Which is easier: 10+6 or counting 16 dots one by one?" },
          "options": [
            { "id": "fact", "text": { "ar": "10+6", "he": "10+6", "en": "10+6" } },
            { "id": "count", "text": { "ar": "عد 16 نقطة واحدة تلو الأخرى", "he": "לספור 16 נקודות אחת אחת", "en": "Counting 16 dots one by one" } }
          ],
          "correctAnswer": "fact",
          "explanation": { "ar": "استخدام حقيقة معروفة مثل 10+6 أسرع وأسهل من العد نقطة نقطة.", "he": "שימוש בעובדה מוכרת כמו 10+6 מהיר וקל יותר מספירה נקודה נקודה.", "en": "Using a known fact like 10+6 is faster and easier than counting one dot at a time." },
          "skills": ["numberSense"]
        },
        {
          "id": "m26-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "اختر جوابًا معقولًا لـ 18-7", "he": "בחרו תשובה סבירה ל-18-7", "en": "Choose a reasonable answer for 18 - 7" },
          "options": [
            { "id": "n2", "text": { "ar": "2", "he": "2", "en": "2" } },
            { "id": "n11", "text": { "ar": "11", "he": "11", "en": "11" } },
            { "id": "n30", "text": { "ar": "30", "he": "30", "en": "30" } }
          ],
          "correctAnswer": "n11",
          "explanation": { "ar": "18-7=11، وهو جواب معقول ودقيق.", "he": "18-7=11, זוהי תשובה סבירה ומדויקת.", "en": "18 - 7 = 11, which is a reasonable and exact answer." },
          "skills": ["numberSense"]
        },
        {
          "id": "m26-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "قال الروبوت: 9+6=16. هل هذا صحيح؟", "he": "הרובוט אמר: 9+6=16. האם זה נכון?", "en": "The robot said: 9 + 6 = 16. Is this correct?" },
          "options": [
            { "id": "yes", "text": { "ar": "نعم، صحيح", "he": "כן, נכון", "en": "Yes, correct" } },
            { "id": "no", "text": { "ar": "لا، الصحيح هو 15", "he": "לא, הנכון הוא 15", "en": "No, the correct answer is 15" } }
          ],
          "correctAnswer": "no",
          "explanation": { "ar": "9+6=15 وليس 16، لذلك الروبوت أخطأ.", "he": "9+6=15 ולא 16, לכן הרובוט טעה.", "en": "9 + 6 = 15, not 16, so the robot made a mistake." },
          "skills": ["numberSense"]
        },
        {
          "id": "m26-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m27",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 27,
      "lessonOrder": 27,
      "position": 27,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 140,
      "status": "draft",
      "title": {
        "ar": "مهندسو الأشكال",
        "he": "מהנדסי הצורות",
        "en": "Shape Engineers"
      },
      "description": {
        "ar": "التعرّف إلى الأشكال الهندسية الأساسية وخصائص بسيطة.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m27-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: التعرّف إلى الأشكال الهندسية الأساسية وخصائص بسيطة.",
            "he": "מוכנים? המטרה שלנו היום: להכיר צורות הנדסיות בסיסיות ותכונות פשוטות.",
            "en": "Ready? Today's goal: get to know basic geometric shapes and simple properties."
          }
        },
        {
          "id": "m27-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• دائرة ومثلث ومربع ومستطيل\n• الأضلاع\n• الرؤوس",
            "he": "• עיגול, משולש, ריבוע ומלבן\n• צלעות\n• קודקודים",
            "en": "• Circle, triangle, square, and rectangle\n• Sides\n• Vertices"
          }
        },
        {
          "id": "m27-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "أي شكل له 3 أضلاع؟", "he": "לאיזו צורה יש 3 צלעות?", "en": "Which shape has 3 sides?" },
          "options": [
            { "id": "circle", "text": { "ar": "دائرة", "he": "עיגול", "en": "Circle" } },
            { "id": "triangle", "text": { "ar": "مثلث", "he": "משולש", "en": "Triangle" } },
            { "id": "square", "text": { "ar": "مربع", "he": "ריבוע", "en": "Square" } }
          ],
          "correctAnswer": "triangle",
          "explanation": { "ar": "المثلث له 3 أضلاع.", "he": "למשולש יש 3 צלעות.", "en": "A triangle has 3 sides." },
          "skills": ["geometry"]
        },
        {
          "id": "m27-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "كم رأسًا للمربع؟", "he": "כמה קודקודים יש לריבוע?", "en": "How many vertices does a square have?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } }
          ],
          "correctAnswer": "n4",
          "explanation": { "ar": "للمربع 4 رؤوس.", "he": "לריבוע יש 4 קודקודים.", "en": "A square has 4 vertices." },
          "skills": ["geometry"]
        },
        {
          "id": "m27-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "ما اسم الشكل الذي له 4 أضلاع وكل زواياه قائمة؟", "he": "מה שמה של הצורה עם 4 צלעות וכל הזוויות בה ישרות?", "en": "What is the name of the shape with 4 sides and all right angles?" },
          "options": [
            { "id": "triangle", "text": { "ar": "مثلث", "he": "משולש", "en": "Triangle" } },
            { "id": "rectangle", "text": { "ar": "مستطيل", "he": "מלבן", "en": "Rectangle" } },
            { "id": "circle", "text": { "ar": "دائرة", "he": "עיגול", "en": "Circle" } }
          ],
          "correctAnswer": "rectangle",
          "explanation": { "ar": "المستطيل له 4 أضلاع وكل زواياه قائمة.", "he": "למלבן יש 4 צלעות וכל הזוויות בו ישרות.", "en": "A rectangle has 4 sides and all right angles." },
          "skills": ["geometry"]
        },
        {
          "id": "m27-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "لرسم بيت بسيط (جسم مربع وسطح مثلث)، ما الشكلان المستخدمان؟", "he": "כדי לצייר בית פשוט (גוף ריבוע וגג משולש), אילו שתי צורות משתמשים בהן?", "en": "To draw a simple house (a square body and a triangular roof), which two shapes are used?" },
          "options": [
            { "id": "a", "text": { "ar": "دائرة ومستطيل", "he": "עיגול ומלבן", "en": "Circle and rectangle" } },
            { "id": "b", "text": { "ar": "مربع ومثلث", "he": "ריבוע ומשולש", "en": "Square and triangle" } },
            { "id": "c", "text": { "ar": "مثلث ودائرة", "he": "משולש ועיגול", "en": "Triangle and circle" } }
          ],
          "correctAnswer": "b",
          "explanation": { "ar": "جسم البيت مربع وسقفه مثلث.", "he": "גוף הבית הוא ריבוע והגג משולש.", "en": "The house body is a square and the roof is a triangle." },
          "skills": ["geometry"]
        },
        {
          "id": "m27-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m28",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 28,
      "lessonOrder": 28,
      "position": 28,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 140,
      "status": "draft",
      "title": {
        "ar": "مختبر القياس والمكان",
        "he": "מעבדת מדידה ומרחב",
        "en": "Measurement and Space Lab"
      },
      "description": {
        "ar": "استخدام مفاهيم الطول والموضع والاتجاه.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m28-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: استخدام مفاهيم الطول والموضع والاتجاه.",
            "he": "מוכנים? המטרה שלנו היום: להשתמש במושגי אורך, מיקום וכיוון.",
            "en": "Ready? Today's goal: use concepts of length, position, and direction."
          }
        },
        {
          "id": "m28-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• أطول وأقصر\n• يمين ويسار\n• أعلى وأسفل",
            "he": "• ארוך יותר וקצר יותר\n• ימין ושמאל\n• מעל ומתחת",
            "en": "• Longer and shorter\n• Right and left\n• Above and below"
          }
        },
        {
          "id": "m28-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "الخط الأول طوله 5 سم والخط الثاني طوله 8 سم. أيّهما أطول؟", "he": "אורך הקו הראשון 5 ס\"מ ואורך הקו השני 8 ס\"מ. איזה מהם ארוך יותר?", "en": "The first line is 5 cm long and the second line is 8 cm long. Which one is longer?" },
          "options": [
            { "id": "first", "text": { "ar": "الخط الأول", "he": "הקו הראשון", "en": "The first line" } },
            { "id": "second", "text": { "ar": "الخط الثاني", "he": "הקו השני", "en": "The second line" } },
            { "id": "equal", "text": { "ar": "متساويان", "he": "הם שווים", "en": "They are equal" } }
          ],
          "correctAnswer": "second",
          "explanation": { "ar": "8 سم أطول من 5 سم.", "he": "8 ס\"מ ארוך יותר מ-5 ס\"מ.", "en": "8 cm is longer than 5 cm." },
          "skills": ["measurement"]
        },
        {
          "id": "m28-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "إذا كانت ⭐ فوق 📦، أين تقع النجمة بالنسبة للصندوق؟", "he": "אם ⭐ נמצא מעל 📦, היכן נמצא הכוכב ביחס לקופסה?", "en": "If ⭐ is above 📦, where is the star relative to the box?" },
          "options": [
            { "id": "below", "text": { "ar": "تحت", "he": "מתחת", "en": "Below" } },
            { "id": "above", "text": { "ar": "فوق", "he": "מעל", "en": "Above" } },
            { "id": "beside", "text": { "ar": "بجانب", "he": "ליד", "en": "Beside" } }
          ],
          "correctAnswer": "above",
          "explanation": { "ar": "النجمة فوق الصندوق.", "he": "הכוכב נמצא מעל הקופסה.", "en": "The star is above the box." },
          "skills": ["spatial"]
        },
        {
          "id": "m28-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "الروبوت عند الموقع 3. إذا تحرك مربعين إلى اليمين، أين يصبح؟", "he": "הרובוט נמצא במיקום 3. אם הוא זז שני ריבועים ימינה, היכן הוא יהיה?", "en": "The robot is at position 3. If it moves two squares to the right, where will it be?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "3+2=5.", "he": "3+2=5.", "en": "3 + 2 = 5." },
          "skills": ["spatial"]
        },
        {
          "id": "m28-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "الكنز يبعد 3 خطوات لليمين ثم خطوة واحدة للأعلى عن نقطة البداية. كم خطوة بالمجموع؟", "he": "האוצר נמצא 3 צעדים ימינה ועוד צעד אחד למעלה מנקודת ההתחלה. כמה צעדים בסך הכול?", "en": "The treasure is 3 steps right and then 1 step up from the start. How many steps in total?" },
          "options": [
            { "id": "n3", "text": { "ar": "3", "he": "3", "en": "3" } },
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } }
          ],
          "correctAnswer": "n4",
          "explanation": { "ar": "3 خطوات + خطوة واحدة = 4 خطوات بالمجموع.", "he": "3 צעדים + צעד אחד = 4 צעדים בסך הכול.", "en": "3 steps + 1 step = 4 steps in total." },
          "skills": ["spatial"]
        },
        {
          "id": "m28-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m29",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 29,
      "lessonOrder": 29,
      "position": 29,
      "activityType": "mission",
      "estimatedMinutes": 25,
      "xpReward": 160,
      "status": "draft",
      "title": {
        "ar": "رياضيات في حياتنا",
        "he": "מתמטיקה בחיים",
        "en": "Math in Real Life"
      },
      "description": {
        "ar": "تطبيق الحساب في مواقف يومية.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m29-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: تطبيق الحساب في مواقف يومية.",
            "he": "מוכנים? המטרה שלנו היום: ליישם חשבון במצבים יומיומיים.",
            "en": "Ready? Today's goal: apply math in everyday situations."
          }
        },
        {
          "id": "m29-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• اختيار العملية\n• مقارنة وترتيب\n• تفسير الجواب",
            "he": "• בחירת הפעולה\n• השוואה וסידור\n• פירוש התשובה",
            "en": "• Choosing the operation\n• Comparing and ordering\n• Interpreting the answer"
          }
        },
        {
          "id": "m29-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "12 لعبة + 5 = ؟", "he": "12 צעצועים + 5 = ?", "en": "12 toys + 5 = ?" },
          "options": [
            { "id": "n16", "text": { "ar": "16", "he": "16", "en": "16" } },
            { "id": "n17", "text": { "ar": "17", "he": "17", "en": "17" } },
            { "id": "n18", "text": { "ar": "18", "he": "18", "en": "18" } }
          ],
          "correctAnswer": "n17",
          "explanation": { "ar": "12+5=17.", "he": "12+5=17.", "en": "12 + 5 = 17." },
          "skills": ["wordProblems"]
        },
        {
          "id": "m29-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "20 ملصقًا - 7 = ؟", "he": "20 מדבקות - 7 = ?", "en": "20 stickers - 7 = ?" },
          "options": [
            { "id": "n12", "text": { "ar": "12", "he": "12", "en": "12" } },
            { "id": "n13", "text": { "ar": "13", "he": "13", "en": "13" } },
            { "id": "n14", "text": { "ar": "14", "he": "14", "en": "14" } }
          ],
          "correctAnswer": "n13",
          "explanation": { "ar": "20-7=13.", "he": "20-7=13.", "en": "20 - 7 = 13." },
          "skills": ["wordProblems"]
        },
        {
          "id": "m29-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "46 أم 64: أيهما أكبر؟", "he": "46 או 64: מי גדול יותר?", "en": "46 or 64: which is greater?" },
          "options": [
            { "id": "n46", "text": { "ar": "46", "he": "46", "en": "46" } },
            { "id": "n64", "text": { "ar": "64", "he": "64", "en": "64" } },
            { "id": "equal", "text": { "ar": "متساويان", "he": "הם שווים", "en": "They are equal" } }
          ],
          "correctAnswer": "n64",
          "explanation": { "ar": "64 أكبر من 46.", "he": "64 גדול מ-46.", "en": "64 is greater than 46." },
          "skills": ["comparing"]
        },
        {
          "id": "m29-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي", "he": "האתגר", "en": "Challenge" },
          "text": { "ar": "اشترت سارة 8 تفاحات وأكلت 3. كم تفاحة بقيت معها؟", "he": "שרה קנתה 8 תפוחים ואכלה 3. כמה תפוחים נשארו לה?", "en": "Sarah bought 8 apples and ate 3. How many apples does she have left?" },
          "options": [
            { "id": "n4", "text": { "ar": "4", "he": "4", "en": "4" } },
            { "id": "n5", "text": { "ar": "5", "he": "5", "en": "5" } },
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } }
          ],
          "correctAnswer": "n5",
          "explanation": { "ar": "8-3=5.", "he": "8-3=5.", "en": "8 - 3 = 5." },
          "skills": ["wordProblems"]
        },
        {
          "id": "m29-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    },
    {
      "id": "math-g1-m30",
      "programId": "math-grade-1-il",
      "stageId": "math-g1-stage-3",
      "order": 30,
      "lessonOrder": 30,
      "position": 30,
      "activityType": "mission",
      "estimatedMinutes": 35,
      "xpReward": 250,
      "status": "draft",
      "title": {
        "ar": "المهمة الكبرى: بطل الحساب",
        "he": "המשימה הגדולה: אלופי החשבון",
        "en": "Final Mission: Math Champion"
      },
      "description": {
        "ar": "مراجعة شاملة للمسار.",
        "he": "משימה אינטראקטיבית לתרגול והבנה מתמטית.",
        "en": "An interactive mission for mathematical understanding and practice."
      },
      "curriculum": {
        "country": "IL",
        "grade": 1,
        "subject": "mathematics"
      },
      "sections": [
        {
          "id": "m30-hook",
          "type": "explain",
          "title": { "ar": "ابدأ المهمة", "he": "מתחילים במשימה", "en": "Start the Mission" },
          "text": {
            "ar": "جاهز؟ هدفنا اليوم: مراجعة شاملة للمسار.",
            "he": "מוכנים? המטרה שלנו היום: סיכום ומבחן מקיף על כל המסלול.",
            "en": "Ready? Today's goal: a comprehensive review of the whole path."
          }
        },
        {
          "id": "m30-learn",
          "type": "explain",
          "title": { "ar": "نتعلّم", "he": "לומדים", "en": "Learn" },
          "text": {
            "ar": "• الأعداد حتى 100\n• الجمع والطرح\n• القيمة المكانية والأنماط والهندسة",
            "he": "• מספרים עד 100\n• חיבור וחיסור\n• ערך מקומי, דפוסים והנדסה",
            "en": "• Numbers up to 100\n• Addition and subtraction\n• Place value, patterns, and geometry"
          }
        },
        {
          "id": "m30-q1",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 1", "he": "מתרגלים יחד 1", "en": "Guided Practice 1" },
          "text": { "ar": "43 = كم عشرة وكم وحدة؟", "he": "43 = כמה עשרות וכמה יחידות?", "en": "43 = how many tens and how many ones?" },
          "options": [
            { "id": "a", "text": { "ar": "4 عشرات و3 وحدات", "he": "4 עשרות ו-3 יחידות", "en": "4 tens and 3 ones" } },
            { "id": "b", "text": { "ar": "3 عشرات و4 وحدات", "he": "3 עשרות ו-4 יחידות", "en": "3 tens and 4 ones" } },
            { "id": "c", "text": { "ar": "4 عشرات و0 وحدات", "he": "4 עשרות ו-0 יחידות", "en": "4 tens and 0 ones" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "43 يتكون من 4 عشرات و3 وحدات.", "he": "43 מורכב מ-4 עשרות ו-3 יחידות.", "en": "43 is made of 4 tens and 3 ones." },
          "skills": ["placeValue"]
        },
        {
          "id": "m30-q2",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 2", "he": "מתרגלים יחד 2", "en": "Guided Practice 2" },
          "text": { "ar": "أيّ ناتج أكبر: 8+7 أم 16-9؟", "he": "איזו תוצאה גדולה יותר: 8+7 או 16-9?", "en": "Which result is greater: 8+7 or 16-9?" },
          "options": [
            { "id": "a", "text": { "ar": "8+7", "he": "8+7", "en": "8+7" } },
            { "id": "b", "text": { "ar": "16-9", "he": "16-9", "en": "16-9" } },
            { "id": "c", "text": { "ar": "متساويان", "he": "הם שווים", "en": "They are equal" } }
          ],
          "correctAnswer": "a",
          "explanation": { "ar": "8+7=15 و16-9=7، لذلك 8+7 أكبر.", "he": "8+7=15 ו-16-9=7, לכן 8+7 גדול יותר.", "en": "8+7=15 and 16-9=7, so 8+7 is greater." },
          "skills": ["addition", "subtraction", "comparing"]
        },
        {
          "id": "m30-q3",
          "type": "multipleChoice",
          "title": { "ar": "تدرّب معي 3", "he": "מתרגלים יחד 3", "en": "Guided Practice 3" },
          "text": { "ar": "5، 10، 15، __", "he": "5, 10, 15, __", "en": "5, 10, 15, __" },
          "options": [
            { "id": "n15", "text": { "ar": "15", "he": "15", "en": "15" } },
            { "id": "n20", "text": { "ar": "20", "he": "20", "en": "20" } },
            { "id": "n25", "text": { "ar": "25", "he": "25", "en": "25" } }
          ],
          "correctAnswer": "n20",
          "explanation": { "ar": "العد بالقفز بخمسة: 5، 10، 15، 20.", "he": "ספירה בקפיצות של 5: 5, 10, 15, 20.", "en": "Skip counting by 5: 5, 10, 15, 20." },
          "skills": ["patterns"]
        },
        {
          "id": "m30-challenge",
          "type": "multipleChoice",
          "title": { "ar": "التحدي الأخير", "he": "האתגר האחרון", "en": "Final Challenge" },
          "text": { "ar": "الجولة الأخيرة لبطل الحساب: 9+6-8=؟ (احسب بالترتيب من اليسار إلى اليمين)", "he": "הסיבוב האחרון של אלוף החשבון: 9+6-8=? (חשבו בסדר משמאל לימין)", "en": "The Math Champion's final round: 9+6-8=? (calculate in order from left to right)" },
          "options": [
            { "id": "n6", "text": { "ar": "6", "he": "6", "en": "6" } },
            { "id": "n7", "text": { "ar": "7", "he": "7", "en": "7" } },
            { "id": "n8", "text": { "ar": "8", "he": "8", "en": "8" } }
          ],
          "correctAnswer": "n7",
          "explanation": { "ar": "9+6=15 ثم 15-8=7.", "he": "9+6=15 ולאחר מכן 15-8=7.", "en": "9 + 6 = 15, then 15 - 8 = 7." },
          "skills": ["addition", "subtraction"]
        },
        {
          "id": "m30-summary",
          "type": "explain",
          "title": { "ar": "أحسنت!", "he": "כל הכבוד!", "en": "Well Done!" },
          "text": {
            "ar": "راجع ما تعلمته ثم انتقل إلى المهمة التالية.",
            "he": "חזרו בקצרה על מה שלמדתם ועברו למשימה הבאה.",
            "en": "Review what you learned, then continue to the next mission."
          }
        }
      ]
    }
  ]
};

export const mathGrade1Lessons = mathGrade1Program.lessons;

export default mathGrade1Program;
