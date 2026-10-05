import {
  useLanguage,
} from "../context/LanguageContext";

import "./LegalPages.css";


function TermsConditions() {
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


        <section className="legal-hero">

          <div className="legal-icon">
            📄
          </div>

          <span>
            TECHMINDS
          </span>

          <h1>
            {text(
              "Terms & Conditions",
              "الشروط والأحكام",
              "תנאים והגבלות"
            )}
          </h1>

          <p>
            {text(
              "The terms governing access to and use of the TechMinds platform.",
              "الشروط التي تنظّم الوصول إلى منصة TechMinds واستخدامها.",
              "התנאים המסדירים את הגישה לפלטפורמת TechMinds והשימוש בה."
            )}
          </p>

          <small>
            {text(
              "Last updated: September 28, 2026",
              "آخر تحديث: 28 سبتمبر 2026",
              "עודכן לאחרונה: 28 בספטמבר 2026"
            )}
          </small>

        </section>


        <main className="legal-content">

          <section>
            <h2>
              1.{" "}
              {text(
                "Agreement",
                "الموافقة على الشروط",
                "הסכמה לתנאים"
              )}
            </h2>

            <p>
              {text(
                "By creating an account, accessing TechMinds or purchasing a subscription, you agree to these Terms and Conditions and the applicable Privacy and Refund Policies.",
                "من خلال إنشاء حساب أو استخدام TechMinds أو شراء اشتراك، فإنك توافق على هذه الشروط والأحكام وسياسة الخصوصية وسياسة الاسترجاع.",
                "על ידי יצירת חשבון, גישה ל-TechMinds או רכישת מנוי, אתם מסכימים לתנאים והגבלות אלה ולמדיניות הפרטיות וההחזרים החלות."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "About the Service",
                "حول الخدمة",
                "אודות השירות"
              )}
            </h2>

            <p>
              {text(
                "TechMinds provides educational programs and digital learning tools including lessons, activities, classroom management, progress tracking, attendance and student portfolios. Programs may be offered as free, paid or class-based access, and the platform owner may grant access directly where appropriate.",
                "توفر TechMinds برامج تعليمية وأدوات تعلم رقمية تشمل الدروس والأنشطة وإدارة الصفوف وتتبع التقدم والحضور وملفات أعمال الطلاب. وقد تكون البرامج مجانية أو مدفوعة أو متاحة من خلال الصف، كما يمكن لمالك المنصة منح الوصول مباشرة عند الحاجة.",
                "TechMinds מספקת תוכניות חינוכיות וכלי למידה דיגיטליים, כולל שיעורים, פעילויות, ניהול כיתות, מעקב התקדמות, נוכחות ותיקי עבודות של תלמידים. התוכניות עשויות להיות חינמיות, בתשלום או מבוססות גישה דרך כיתה, ובעל הפלטפורמה רשאי להעניק גישה ישירה במקרים מתאימים."
              )}
            </p>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "Accounts",
                "الحسابات",
                "חשבונות"
              )}
            </h2>

            <p>
              {text(
                "Users are responsible for maintaining the confidentiality of their login credentials. Teachers are responsible for appropriately managing student accounts created under their teacher account.",
                "يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات تسجيل الدخول. ويتحمل المعلم مسؤولية الإدارة المناسبة لحسابات الطلاب التي يتم إنشاؤها تحت حسابه.",
                "המשתמשים אחראים לשמור על סודיות פרטי ההתחברות שלהם. מורים אחראים לניהול תקין של חשבונות תלמידים שנוצרו תחת חשבון המורה שלהם."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Student Accounts",
                "حسابات الطلاب",
                "חשבונות תלמידים"
              )}
            </h2>

            <p>
              {text(
                "Student accounts may be created or managed by teachers. Access may depend on membership in a class, the teacher's subscription and the student's account status.",
                "يمكن إنشاء حسابات الطلاب أو إدارتها من قبل المعلمين. وقد يعتمد الوصول على الانضمام إلى الصف واشتراك المعلم وحالة حساب الطالب.",
                "חשבונות תלמידים יכולים להיווצר או להיות מנוהלים על ידי מורים. הגישה עשויה להיות תלויה בחברות בכיתה, במנוי של המורה ובסטטוס החשבון של התלמיד."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Paid Access and Subscriptions",
                "الوصول المدفوع والاشتراكات",
                "גישה בתשלום ומנויים"
              )}
            </h2>

            <p>
              {text(
                "TechMinds may offer free programs, one-time paid access, recurring subscriptions or class-based access. Before any paid purchase, the applicable price, access period, billing model and included features will be displayed.",
                "قد توفّر TechMinds برامج مجانية أو وصولًا مدفوعًا لمرة واحدة أو اشتراكات متجددة أو وصولًا من خلال الصف. قبل أي عملية شراء مدفوعة، سيتم عرض السعر ومدة الوصول وطريقة الفوترة والميزات المشمولة.",
                "TechMinds עשויה להציע תוכניות חינמיות, גישה בתשלום חד-פעמי, מנויים מתחדשים או גישה דרך כיתה. לפני כל רכישה בתשלום יוצגו המחיר, תקופת הגישה, מודל החיוב והתכונות הכלולות."
              )}
            </p>

            <p>
              {text(
                "If a plan renews automatically, this will be clearly disclosed before the customer completes the purchase. Access granted directly by the platform owner or through a class does not necessarily require a separate payment by the student.",
                "إذا كانت الخطة تتجدد تلقائيًا، فسيتم توضيح ذلك للعميل قبل إتمام عملية الشراء. أما الوصول الممنوح مباشرة من مالك المنصة أو من خلال الصف فلا يتطلب بالضرورة دفعة منفصلة من الطالب.",
                "אם תוכנית מתחדשת אוטומטית, הדבר יוצג בבירור לפני השלמת הרכישה. גישה שניתנת ישירות על ידי בעל הפלטפורמה או דרך כיתה אינה מחייבת בהכרח תשלום נפרד מצד התלמיד."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Payment Processing",
                "معالجة الدفع",
                "עיבוד תשלומים"
              )}
            </h2>

            <p>
              {text(
                "When payment is enabled for a TechMinds product or program, payment may be processed through Paddle. Where Paddle processes the transaction, it may act as the Merchant of Record and handle payment processing, billing-related support and applicable refunds according to its terms. TechMinds does not store full credit card numbers or card security codes.",
                "عند تفعيل الدفع لمنتج أو برنامج في TechMinds، قد تتم معالجة الدفع من خلال Paddle. وعندما تعالج Paddle المعاملة، فقد تعمل كـ Merchant of Record وتتولى معالجة الدفع ودعم الفوترة وعمليات الاسترجاع المطبقة وفقًا لشروطها. لا تقوم TechMinds بتخزين أرقام بطاقات الائتمان الكاملة أو رموز أمان البطاقات.",
                "כאשר תשלום מופעל עבור מוצר או תוכנית ב-TechMinds, התשלום עשוי להתבצע באמצעות Paddle. כאשר Paddle מעבדת את העסקה, היא עשויה לפעול כ-Merchant of Record ולטפל בעיבוד התשלום, בתמיכה הקשורה לחיוב ובהחזרים החלים בהתאם לתנאיה. TechMinds אינה שומרת מספרי כרטיס אשראי מלאים או קודי אבטחה של הכרטיס."
              )}
            </p>

            <div className="legal-note">
              ℹ️{" "}
              {text(
                "Payment availability may vary by program. If payment has not yet been enabled for a paid program, the platform may display that payment is coming soon or grant access through another authorized method.",
                "قد تختلف إمكانية الدفع حسب البرنامج. إذا لم يتم تفعيل الدفع بعد لبرنامج مدفوع، فقد تعرض المنصة أن الدفع سيتوفر قريبًا أو تمنح الوصول بطريقة معتمدة أخرى.",
                "זמינות התשלום עשויה להשתנות בין תוכניות. אם התשלום עדיין לא הופעל עבור תוכנית בתשלום, הפלטפורמה עשויה להציג שהתשלום יהיה זמין בקרוב או להעניק גישה בדרך מורשית אחרת."
              )}
            </div>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Cancellation and Refunds",
                "الإلغاء والاسترجاع",
                "ביטולים והחזרים"
              )}
            </h2>

            <p>
              {text(
                "Cancellation and refund eligibility are governed by the Refund Policy, applicable consumer law and, where Paddle processes the payment, Paddle's applicable buyer and refund terms. A full refund may result in removal of access to the related paid program, service or features.",
                "تخضع أهلية الإلغاء والاسترجاع لسياسة الاسترجاع وقوانين حماية المستهلك المعمول بها، وعندما تتم معالجة الدفع بواسطة Paddle، لشروط المشترين وسياسة الاسترجاع المطبقة لديها. وقد يؤدي الاسترجاع الكامل إلى إلغاء الوصول إلى البرنامج أو الخدمة أو الميزات المدفوعة المرتبطة بالدفع.",
                "זכאות לביטול ולהחזר כפופה למדיניות ההחזרים, לדיני הצרכנות החלים, וכאשר Paddle מעבדת את התשלום — גם לתנאי הקונה ולמדיניות ההחזרים החלים שלה. החזר מלא עשוי להביא להסרת הגישה לתוכנית, לשירות או לתכונות בתשלום הקשורות לתשלום."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "Acceptable Use",
                "الاستخدام المقبول",
                "שימוש מקובל"
              )}
            </h2>

            <p>
              {text(
                "Users may not use TechMinds to harm others, compromise platform security, gain unauthorized access, interfere with the service or use accounts belonging to another person without authorization.",
                "لا يجوز استخدام TechMinds لإيذاء الآخرين أو اختراق أمان المنصة أو الحصول على وصول غير مصرح به أو تعطيل الخدمة أو استخدام حساب شخص آخر دون إذن.",
                "אין להשתמש ב-TechMinds כדי לפגוע באחרים, לסכן את אבטחת הפלטפורמה, להשיג גישה בלתי מורשית, להפריע לשירות או להשתמש בחשבון של אדם אחר ללא הרשאה."
              )}
            </p>
          </section>


          <section>
            <h2>
              9.{" "}
              {text(
                "Educational Content",
                "المحتوى التعليمي",
                "תוכן חינוכי"
              )}
            </h2>

            <p>
              {text(
                "TechMinds content is provided for educational purposes. Lessons and activities may be updated, improved, replaced or removed as the platform develops.",
                "يتم تقديم محتوى TechMinds لأغراض تعليمية. وقد يتم تحديث الدروس والأنشطة أو تحسينها أو استبدالها أو إزالتها مع تطور المنصة.",
                "התוכן של TechMinds מסופק למטרות חינוכיות. שיעורים ופעילויות עשויים להתעדכן, להשתפר, להיות מוחלפים או מוסרים ככל שהפלטפורמה מתפתחת."
              )}
            </p>
          </section>


          <section>
            <h2>
              10.{" "}
              {text(
                "Intellectual Property",
                "الملكية الفكرية",
                "קניין רוחני"
              )}
            </h2>

            <p>
              {text(
                "Unless otherwise stated, the TechMinds platform, branding, interface and original educational materials are protected intellectual property and may not be copied or commercially redistributed without permission.",
                "ما لم يُذكر خلاف ذلك، فإن منصة TechMinds والعلامة التجارية والواجهة والمواد التعليمية الأصلية هي ملكية فكرية محمية ولا يجوز نسخها أو إعادة توزيعها تجاريًا دون إذن.",
                "אלא אם צוין אחרת, פלטפורמת TechMinds, המיתוג, הממשק וחומרי הלימוד המקוריים הם קניין רוחני מוגן ואין להעתיקם או להפיץ אותם מחדש באופן מסחרי ללא אישור."
              )}
            </p>
          </section>


          <section>
            <h2>
              11.{" "}
              {text(
                "Service Availability",
                "توفر الخدمة",
                "זמינות השירות"
              )}
            </h2>

            <p>
              {text(
                "We aim to keep TechMinds available and reliable, but temporary interruptions may occur because of maintenance, updates, technical problems or third-party services.",
                "نسعى إلى إبقاء TechMinds متاحة وموثوقة، إلا أن انقطاعات مؤقتة قد تحدث بسبب الصيانة أو التحديثات أو المشكلات التقنية أو خدمات الجهات الخارجية.",
                "אנו שואפים לשמור על TechMinds זמינה ואמינה, אך ייתכנו הפסקות זמניות עקב תחזוקה, עדכונים, תקלות טכניות או שירותי צד שלישי."
              )}
            </p>
          </section>


          <section>
            <h2>
              12.{" "}
              {text(
                "Account Suspension",
                "تعليق الحساب",
                "השעיית חשבון"
              )}
            </h2>

            <p>
              {text(
                "TechMinds may restrict or suspend access when an account is used in violation of these Terms, creates a security risk, or where required by law.",
                "يجوز لـTechMinds تقييد أو تعليق الوصول إذا تم استخدام الحساب بما يخالف هذه الشروط أو يشكل خطرًا أمنيًا أو عندما يقتضي القانون ذلك.",
                "TechMinds רשאית להגביל או להשעות גישה כאשר נעשה שימוש בחשבון בניגוד לתנאים אלה, כאשר קיים סיכון אבטחה או כאשר הדבר נדרש על פי דין."
              )}
            </p>
          </section>


          <section>
            <h2>
              13.{" "}
              {text(
                "Changes to These Terms",
                "التغييرات على الشروط",
                "שינויים בתנאים אלה"
              )}
            </h2>

            <p>
              {text(
                "We may update these Terms as TechMinds develops. Material changes will be published on this page with an updated revision date.",
                "قد نقوم بتحديث هذه الشروط مع تطور TechMinds. سيتم نشر التغييرات المهمة في هذه الصفحة مع تحديث تاريخ المراجعة.",
                "אנו עשויים לעדכן תנאים אלה ככל ש-TechMinds מתפתחת. שינויים מהותיים יפורסמו בעמוד זה יחד עם תאריך עדכון חדש."
              )}
            </p>
          </section>


          <section>
            <h2>
              14.{" "}
              {text(
                "Operator and Contact",
                "المشغّل وبيانات التواصل",
                "מפעיל ופרטי קשר"
              )}
            </h2>

            <p>
              <strong>
                TechMinds
              </strong>
            </p>

            <p>
              {text(
                "Operated by: TechMinds",
                "المشغّل: TechMinds",
                "מופעל על ידי: TechMinds"
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


export default TermsConditions;