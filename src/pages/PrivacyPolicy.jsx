import {
  useLanguage,
} from "../context/LanguageContext";

import "./LegalPages.css";


function PrivacyPolicy() {
  const {
    language,
    setLanguage,
  } = useLanguage();


  const text = (
    english,
    arabic,
    hebrew
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrew
        : english;


  return (
    <div className="legal-page" dir={language === "en" ? "ltr" : "rtl"}>

      <div className="legal-container">

        {/* HEADER */}

        <header className="legal-header">

          <a
            href="/"
            className="legal-logo"
          >
            🚀 TechMinds
          </a>


          <div className="legal-language">

            <button
              type="button"
              className={
                language === "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage("en")
              }
            >
              EN
            </button>


            <button
              type="button"
              className={
                language === "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage("ar")
              }
            >
              عربي
            </button>

            <button
              type="button"
              className={language === "he" ? "active" : ""}
              onClick={() => setLanguage("he")}
            >
              עברית
            </button>

          </div>

        </header>


        {/* HERO */}

        <section className="legal-hero">

          <div className="legal-icon">
            🔐
          </div>

          <span>
            TechMinds
          </span>

          <h1>
            {text(
              "Privacy Policy",
              "سياسة الخصوصية",
              "מדיניות פרטיות"
            )}
          </h1>

          <p>
            {text(
              "Learn how TechMinds collects, uses and protects your information.",
              "تعرّف على كيفية جمع TechMinds لمعلوماتك واستخدامها وحمايتها.",
              "למדו כיצד TechMinds אוספת, משתמשת ומגינה על המידע שלכם."
            )}
          </p>

          <small>
            {text(
              "Last updated: September 1, 2026",
              "آخر تحديث: 1 سبتمبر 2026",
              "עודכן לאחרונה: 1 בספטמבר 2026"
            )}
          </small>

        </section>


        <main className="legal-content">

          <section>
            <h2>
              1.{" "}
              {text(
                "About TechMinds",
                "حول TechMinds",
                "אודות TechMinds"
              )}
            </h2>

            <p>
              {text(
                "TechMinds is an educational platform that provides digital learning programs, lessons, activities and classroom management tools for students and teachers.",
                "TechMinds هي منصة تعليمية تقدم برامج ودروسًا وأنشطة رقمية وأدوات لإدارة الصفوف للطلاب والمعلمين.",
                "TechMinds היא פלטפורמה חינוכית המספקת תוכניות למידה דיגיטליות, שיעורים, פעילויות וכלים לניהול כיתות עבור תלמידים ומורים."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "Information We Collect",
                "المعلومات التي نجمعها",
                "המידע שאנו אוספים"
              )}
            </h2>

            <p>
              {text(
                "Depending on how you use TechMinds, we may collect account and profile information such as name, email address, username, student code, teacher relationship, class information and account status.",
                "بحسب طريقة استخدامك لـTechMinds، قد نجمع معلومات الحساب والملف الشخصي مثل الاسم والبريد الإلكتروني واسم المستخدم ورمز الطالب والمعلم والصف وحالة الحساب.",
                "בהתאם לאופן השימוש ב-TechMinds, אנו עשויים לאסוף פרטי חשבון ופרופיל כגון שם, כתובת דוא״ל, שם משתמש, קוד תלמיד, שיוך למורה, פרטי כיתה וסטטוס החשבון."
              )}
            </p>

            <ul>
              <li>
                {text(
                  "Teacher account information.",
                  "معلومات حساب المعلم.",
                  "מידע על חשבון המורה."
                )}
              </li>

              <li>
                {text(
                  "Student account and class information.",
                  "معلومات حساب الطالب والصف.",
                  "מידע על חשבון התלמיד והכיתה."
                )}
              </li>

              <li>
                {text(
                  "Lesson progress, answers, XP, level and achievements.",
                  "تقدم الدروس والإجابات والنقاط والمستوى والإنجازات.",
                  "התקדמות בשיעורים, תשובות, XP, רמה והישגים."
                )}
              </li>

              <li>
                {text(
                  "Attendance and learning portfolio information.",
                  "معلومات الحضور وملف الأعمال التعليمي.",
                  "מידע על נוכחות ותיק עבודות לימודי."
                )}
              </li>

              <li>
                {text(
                  "Technical information necessary to operate and secure the platform.",
                  "المعلومات التقنية اللازمة لتشغيل المنصة وحمايتها.",
                  "מידע טכני הנדרש להפעלת הפלטפורמה ולאבטחתה."
                )}
              </li>
            </ul>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "How We Use Information",
                "كيف نستخدم المعلومات",
                "כיצד אנו משתמשים במידע"
              )}
            </h2>

            <p>
              {text(
                "We use information to provide and improve TechMinds, authenticate users, manage classes, display learning progress, provide support, maintain security and operate subscriptions.",
                "نستخدم المعلومات لتقديم TechMinds وتحسينها، والتحقق من المستخدمين، وإدارة الصفوف، وعرض التقدم التعليمي، وتقديم الدعم، وحماية المنصة وإدارة الاشتراكات.",
                "אנו משתמשים במידע כדי לספק ולשפר את TechMinds, לאמת משתמשים, לנהל כיתות, להציג התקדמות לימודית, לספק תמיכה, לשמור על אבטחה ולנהל מנויים."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Student Information",
                "معلومات الطلاب",
                "מידע על תלמידים"
              )}
            </h2>

            <p>
              {text(
                "TechMinds is designed to support educational use. Teachers may create and manage student accounts and access information related to students they manage, including learning progress, attendance and portfolio work.",
                "تم تصميم TechMinds للاستخدام التعليمي. يمكن للمعلمين إنشاء حسابات الطلاب وإدارتها والوصول إلى المعلومات المتعلقة بالطلاب الذين يديرونهم، بما في ذلك التقدم والحضور وملف الأعمال.",
                "TechMinds מיועדת לשימוש חינוכי. מורים יכולים ליצור ולנהל חשבונות תלמידים ולגשת למידע הקשור לתלמידים שבאחריותם, כולל התקדמות לימודית, נוכחות ועבודות בתיק העבודות."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Payments",
                "المدفوعات",
                "תשלומים"
              )}
            </h2>

            <p>
              {text(
                "TechMinds does not store full credit card numbers or card security codes. Payments may be processed by an authorized external payment provider such as Paddle. Payment information is handled according to the payment provider's own privacy and security practices.",
                "لا تقوم TechMinds بتخزين أرقام بطاقات الائتمان الكاملة أو رموز الأمان. قد تتم معالجة المدفوعات بواسطة مزود دفع خارجي معتمد مثل Paddle، وتخضع معلومات الدفع لسياسات الخصوصية والأمان الخاصة بمزود الدفع.",
                "TechMinds אינה שומרת מספרי כרטיס אשראי מלאים או קודי אבטחה של הכרטיס. תשלומים עשויים להתבצע באמצעות ספק תשלומים חיצוני מורשה כגון Paddle, ומידע התשלום מטופל בהתאם למדיניות הפרטיות והאבטחה של ספק התשלום."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Service Providers",
                "مزودو الخدمات",
                "ספקי שירות"
              )}
            </h2>

            <p>
              {text(
                "We may use trusted technology providers to operate TechMinds, including services for authentication, database storage, website hosting, analytics, security and payment processing.",
                "قد نستخدم مزودي خدمات تقنية موثوقين لتشغيل TechMinds، بما في ذلك خدمات تسجيل الدخول وقواعد البيانات والاستضافة والتحليلات والأمان ومعالجة الدفع.",
                "אנו עשויים להשתמש בספקי טכנולוגיה מהימנים להפעלת TechMinds, לרבות שירותי אימות, אחסון מסדי נתונים, אחסון אתרים, אנליטיקה, אבטחה ועיבוד תשלומים."
              )}
            </p>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Data Security",
                "أمن البيانات",
                "אבטחת מידע"
              )}
            </h2>

            <p>
              {text(
                "We take reasonable technical and organizational measures to protect account and educational information. However, no online service can guarantee absolute security.",
                "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية معلومات الحساب والبيانات التعليمية، إلا أنه لا يمكن لأي خدمة عبر الإنترنت ضمان الأمان المطلق.",
                "אנו נוקטים אמצעים טכניים וארגוניים סבירים כדי להגן על פרטי החשבון והמידע החינוכי. עם זאת, אף שירות מקוון אינו יכול להבטיח אבטחה מוחלטת."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "Data Retention",
                "الاحتفاظ بالبيانات",
                "שמירת מידע"
              )}
            </h2>

            <p>
              {text(
                "We retain information for as long as reasonably necessary to provide the service, maintain educational records, comply with legal obligations and protect the security of TechMinds.",
                "نحتفظ بالمعلومات طالما كان ذلك ضروريًا بشكل معقول لتقديم الخدمة، والحفاظ على السجلات التعليمية، والامتثال للالتزامات القانونية وحماية TechMinds.",
                "אנו שומרים מידע כל עוד הדבר נחוץ באופן סביר לצורך מתן השירות, שמירת רשומות חינוכיות, עמידה בחובות משפטיות והגנה על אבטחת TechMinds."
              )}
            </p>
          </section>


          <section>
            <h2>
              9.{" "}
              {text(
                "Your Choices",
                "خياراتك",
                "הבחירות שלכם"
              )}
            </h2>

            <p>
              {text(
                "You may contact TechMinds to request information about your account, request correction of inaccurate information or ask about account deletion, subject to applicable legal and educational record requirements.",
                "يمكنك التواصل مع TechMinds لطلب معلومات حول حسابك أو تصحيح معلومات غير دقيقة أو الاستفسار عن حذف الحساب، مع مراعاة المتطلبات القانونية والتعليمية المعمول بها.",
                "באפשרותכם ליצור קשר עם TechMinds כדי לבקש מידע על החשבון שלכם, לבקש תיקון של מידע שגוי או לברר לגבי מחיקת החשבון, בכפוף לדרישות המשפטיות והחינוכיות החלות."
              )}
            </p>
          </section>


          <section>
            <h2>
              10.{" "}
              {text(
                "Changes to This Policy",
                "التغييرات على السياسة",
                "שינויים במדיניות זו"
              )}
            </h2>

            <p>
              {text(
                "We may update this Privacy Policy when our services, technology or legal requirements change. The latest version will always be published on this page.",
                "قد نقوم بتحديث سياسة الخصوصية عند تغير خدماتنا أو تقنياتنا أو المتطلبات القانونية. سيتم نشر أحدث نسخة دائمًا في هذه الصفحة.",
                "אנו עשויים לעדכן מדיניות פרטיות זו כאשר השירותים, הטכנולוגיה או הדרישות המשפטיות משתנים. הגרסה העדכנית ביותר תפורסם תמיד בעמוד זה."
              )}
            </p>
          </section>


          <section>
            <h2>
              11.{" "}
              {text(
                "Contact Us",
                "تواصل معنا",
                "יצירת קשר"
              )}
            </h2>

            <p>
              {text(
                "For privacy questions or requests, contact TechMinds support.",
                "للاستفسارات أو الطلبات المتعلقة بالخصوصية، تواصل مع دعم TechMinds.",
                "לשאלות או בקשות בנושא פרטיות, פנו לתמיכה של TechMinds."
              )}
            </p>

            <div className="legal-contact">
              ✉️ samia.nabil.29.7@gmail.com
              <br />
              📞 0549308793
            </div>
          </section>

        </main>


        <LegalFooter
          text={text}
        />

      </div>

    </div>
  );
}


function LegalFooter({
  text,
}) {
  return (
    <footer className="legal-footer">

      <span>
        © 2026 TechMinds
      </span>

      <div>
        <a href="/privacy">
          {text(
            "Privacy",
            "الخصوصية",
            "פרטיות"
          )}
        </a>

        <a href="/terms">
          {text(
            "Terms",
            "الشروط",
            "תנאים"
          )}
        </a>

        <a href="/refund-policy">
          {text(
            "Refund Policy",
            "سياسة الاسترجاع",
            "מדיניות החזרים"
          )}
        </a>

        <a href="/plans">
          {text(
            "Plans",
            "الخطط",
            "תוכניות"
          )}
        </a>
      </div>

    </footer>
  );
}


export default PrivacyPolicy;