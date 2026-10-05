import {
  useLanguage,
} from "../context/LanguageContext";

import "./LegalPages.css";


function RefundPolicy() {
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
    <div
      className="legal-page"
      dir={
        language === "en"
          ? "ltr"
          : "rtl"
      }
    >

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
              className={
                language === "he"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage("he")
              }
            >
              עברית
            </button>

          </div>

        </header>


        <section className="legal-hero">

          <div className="legal-icon">
            💳
          </div>

          <span>
            TechMinds
          </span>

          <h1>
            {text(
              "Refund Policy",
              "سياسة الاسترجاع",
              "מדיניות החזרים"
            )}
          </h1>

          <p>
            {text(
              "Information about paid programs, subscription cancellation and refund requests on TechMinds.",
              "معلومات حول البرامج المدفوعة وإلغاء الاشتراكات وطلبات استرداد الأموال في TechMinds.",
              "מידע על תוכניות בתשלום, ביטול מנויים ובקשות להחזר כספי ב-TechMinds."
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
                "Free and Paid Access",
                "الوصول المجاني والمدفوع",
                "גישה חינמית ובתשלום"
              )}
            </h2>

            <p>
              {text(
                "TechMinds may offer free programs as well as paid programs or paid access options. The price, access type and included features will be shown before any payment is requested.",
                "قد توفّر TechMinds برامج مجانية إلى جانب برامج مدفوعة أو خيارات وصول مدفوعة. يتم عرض السعر ونوع الوصول والميزات المشمولة قبل طلب أي دفعة.",
                "TechMinds עשויה להציע תוכניות חינמיות לצד תוכניות בתשלום או אפשרויות גישה בתשלום. המחיר, סוג הגישה והתכונות הכלולות יוצגו לפני בקשת תשלום."
              )}
            </p>

            <p>
              {text(
                "Some programs may also be available through class access or access granted directly by the platform owner without a separate payment by the student.",
                "قد تكون بعض البرامج متاحة أيضًا من خلال وصول صفّي أو من خلال منح وصول مباشر من مالك المنصة دون حاجة الطالب إلى دفع منفصل.",
                "חלק מהתוכניות עשויות להיות זמינות גם באמצעות גישה כיתתית או באמצעות הרשאה ישירה שניתנת על ידי בעל הפלטפורמה ללא תשלום נפרד מצד התלמיד."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "Payment Processing",
                "معالجة الدفع",
                "עיבוד תשלומים"
              )}
            </h2>

            <p>
              {text(
                "When payment is enabled for a TechMinds product or program, payment may be processed through Paddle. Paddle may act as the Merchant of Record for the transaction and may handle payment processing, billing-related support and applicable refunds according to its terms.",
                "عند تفعيل الدفع لمنتج أو برنامج في TechMinds، قد تتم معالجة الدفع من خلال Paddle. وقد تعمل Paddle كـ Merchant of Record للمعاملة وتتولى معالجة الدفع ودعم الفوترة وعمليات الاسترجاع المطبقة وفقًا لشروطها.",
                "כאשר תשלום מופעל עבור מוצר או תוכנית ב-TechMinds, התשלום עשוי להתבצע באמצעות Paddle. Paddle עשויה לפעול כ-Merchant of Record לעסקה ולטפל בעיבוד התשלום, בתמיכה הקשורה לחיוב ובהחזרים החלים בהתאם לתנאיה."
              )}
            </p>

            <p>
              {text(
                "TechMinds does not store full credit card numbers or card security codes.",
                "لا تقوم TechMinds بتخزين أرقام بطاقات الائتمان الكاملة أو رموز أمان البطاقات.",
                "TechMinds אינה שומרת מספרי כרטיס אשראי מלאים או קודי אבטחה של הכרטיס."
              )}
            </p>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "Before Payment",
                "قبل الدفع",
                "לפני התשלום"
              )}
            </h2>

            <p>
              {text(
                "Before completing a paid purchase, customers should review the displayed price, access period, whether the payment is one-time or recurring, and the content or features included.",
                "قبل إتمام أي عملية شراء مدفوعة، يجب مراجعة السعر الظاهر ومدة الوصول وما إذا كانت الدفعة لمرة واحدة أو متجددة والمحتوى أو الميزات المشمولة.",
                "לפני השלמת רכישה בתשלום, יש לעיין במחיר המוצג, בתקופת הגישה, האם התשלום הוא חד-פעמי או מתחדש, ובתוכן או בתכונות הכלולות."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Statutory Consumer Rights",
                "حقوق المستهلك القانونية",
                "זכויות צרכן על פי חוק"
              )}
            </h2>

            <div className="legal-highlight">

              <strong>
                14{" "}
                {text(
                  "days",
                  "يومًا",
                  "ימים"
                )}
              </strong>

              <p>
                {text(
                  "Eligible consumers may have a statutory right to withdraw from certain digital content or service transactions within 14 days, subject to applicable law and the circumstances of the transaction.",
                  "قد يكون للمستهلكين المؤهلين حق قانوني في الانسحاب من بعض معاملات الخدمات أو المحتوى الرقمي خلال 14 يومًا، وفقًا للقانون المعمول به وظروف المعاملة.",
                  "לצרכנים זכאים עשויה לעמוד זכות חוקית לבטל עסקאות מסוימות של תוכן דיגיטלי או שירותים בתוך 14 ימים, בכפוף לדין החל ולנסיבות העסקה."
                )}
              </p>

            </div>

            <p>
              {text(
                "Nothing in this policy limits consumer rights that cannot legally be waived.",
                "لا تحد هذه السياسة من حقوق المستهلك التي لا يجوز التنازل عنها قانونيًا.",
                "אין במדיניות זו כדי להגביל זכויות צרכניות שלא ניתן לוותר עליהן על פי חוק."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Subscriptions and Renewals",
                "الاشتراكات والتجديد",
                "מנויים וחידושים"
              )}
            </h2>

            <p>
              {text(
                "If TechMinds offers a recurring subscription, the renewal terms will be shown before purchase. Cancelling a recurring subscription normally prevents future renewal charges.",
                "إذا قدّمت TechMinds اشتراكًا متجددًا، فسيتم عرض شروط التجديد قبل الشراء. ويمنع إلغاء الاشتراك المتجدد عادةً رسوم التجديد المستقبلية.",
                "אם TechMinds תציע מנוי מתחדש, תנאי החידוש יוצגו לפני הרכישה. ביטול מנוי מתחדש בדרך כלל ימנע חיובי חידוש עתידיים."
              )}
            </p>

            <p>
              {text(
                "Unless a refund is approved or legally required, access may continue until the end of the already-paid billing period.",
                "ما لم تتم الموافقة على استرجاع أو يكن الاسترجاع مطلوبًا قانونيًا، فقد يستمر الوصول حتى نهاية فترة الفوترة المدفوعة.",
                "אלא אם אושר החזר או שהחזר נדרש על פי חוק, הגישה עשויה להימשך עד סוף תקופת החיוב שכבר שולמה."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Refund Requests",
                "طلبات الاسترجاع",
                "בקשות להחזר"
              )}
            </h2>

            <p>
              {text(
                "Refund requests may be reviewed based on applicable consumer rights, the payment provider's terms, the type of purchase and the circumstances of the transaction.",
                "قد تتم مراجعة طلبات الاسترجاع وفقًا لحقوق المستهلك المطبقة وشروط مزود الدفع ونوع الشراء وظروف المعاملة.",
                "בקשות להחזר עשויות להיבחן בהתאם לזכויות הצרכן החלות, לתנאי ספק התשלום, לסוג הרכישה ולנסיבות העסקה."
              )}
            </p>

            <p>
              {text(
                "Where Paddle processed the payment, the refund request may also be handled through Paddle according to its applicable buyer and refund terms.",
                "عندما تتم معالجة الدفع بواسطة Paddle، قد تتم معالجة طلب الاسترجاع أيضًا من خلال Paddle وفقًا لشروط المشترين وسياسة الاسترجاع المطبقة لديها.",
                "כאשר Paddle עיבדה את התשלום, בקשת ההחזר עשויה להיות מטופלת גם באמצעות Paddle בהתאם לתנאי הקונה ולמדיניות ההחזרים החלים שלה."
              )}
            </p>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Problems With a Paid Service",
                "مشاكل الخدمة المدفوعة",
                "בעיות בשירות בתשלום"
              )}
            </h2>

            <p>
              {text(
                "If a technical problem prevents you from using a paid TechMinds program or service, please contact support so the issue can be reviewed and assistance can be provided.",
                "إذا منعتك مشكلة تقنية من استخدام برنامج أو خدمة مدفوعة في TechMinds، يرجى التواصل مع الدعم حتى يتم فحص المشكلة وتقديم المساعدة.",
                "אם בעיה טכנית מונעת מכם להשתמש בתוכנית או בשירות בתשלום של TechMinds, אנא פנו לתמיכה כדי שניתן יהיה לבדוק את הבעיה ולספק סיוע."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "Access After Refund",
                "الوصول بعد الاسترجاع",
                "גישה לאחר החזר"
              )}
            </h2>

            <p>
              {text(
                "When a payment is fully refunded, access to the paid program, service or features associated with that purchase may be removed.",
                "عند استرداد دفعة بالكامل، قد يتم إلغاء الوصول إلى البرنامج أو الخدمة أو الميزات المدفوعة المرتبطة بعملية الشراء.",
                "כאשר תשלום מוחזר במלואו, ייתכן שהגישה לתוכנית, לשירות או לתכונות בתשלום הקשורות לרכישה תוסר."
              )}
            </p>
          </section>


          <section>
            <h2>
              9.{" "}
              {text(
                "How to Request Help",
                "كيفية طلب المساعدة",
                "כיצד לבקש עזרה"
              )}
            </h2>

            <p>
              {text(
                "Please provide the email address connected to your TechMinds account and enough information for us to identify the program, subscription or payment.",
                "يرجى تزويدنا بالبريد الإلكتروني المرتبط بحساب TechMinds ومعلومات كافية لتحديد البرنامج أو الاشتراك أو عملية الدفع.",
                "אנא ספקו את כתובת הדוא״ל המקושרת לחשבון TechMinds שלכם ומידע מספיק כדי שנוכל לזהות את התוכנית, המנוי או התשלום."
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


export default RefundPolicy;
