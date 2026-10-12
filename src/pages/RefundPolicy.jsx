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
      dir={language === "en" ? "ltr" : "rtl"}
    >
      <div className="legal-container">

        {/* Header */}
        <header className="legal-header">
          <a
            href="/"
            className="legal-logo"
          >
            ✨ TechMinds
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


        {/* Hero */}
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
              "Information about purchases, access to digital learning content, and the TechMinds refund policy.",
              "معلومات حول عمليات الشراء والوصول إلى المحتوى التعليمي الرقمي وسياسة الاسترجاع في TechMinds.",
              "מידע על רכישות, גישה לתוכן לימודי דיגיטלי ומדיניות ההחזרים של TechMinds."
            )}
          </p>

          <small>
            {text(
              "Last updated: October 7, 2026",
              "آخر تحديث: 7 أكتوبر 2026",
              "עודכן לאחרונה: 7 באוקטובר 2026"
            )}
          </small>

        </section>


        <main className="legal-content">

          {/* 1 */}
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
                "TechMinds may offer free learning content as well as paid learning paths, programs, lessons, or other digital educational content. Where payment is required, the price and the access provided will be displayed before purchase.",
                "قد توفّر TechMinds محتوى تعليميًا مجانيًا، بالإضافة إلى مسارات تعليمية أو برامج أو دروس أو محتوى تعليمي رقمي مدفوع. عندما يكون الدفع مطلوبًا، يتم عرض السعر ونوع الوصول الذي يحصل عليه المستخدم قبل الشراء.",
                "TechMinds עשויה להציע תוכן לימודי חינמי לצד מסלולי לימוד, תוכניות, שיעורים או תוכן חינוכי דיגיטלי בתשלום. כאשר נדרש תשלום, המחיר וסוג הגישה שיינתנו למשתמש יוצגו לפני הרכישה."
              )}
            </p>

            <p>
              {text(
                "Some programs may also be made available through class access, promotional access, or access granted directly by TechMinds without a separate online payment.",
                "قد تكون بعض البرامج متاحة أيضًا من خلال وصول صفّي، أو وصول ترويجي، أو وصول يتم منحه مباشرة من TechMinds دون الحاجة إلى دفع منفصل عبر الإنترنت.",
                "חלק מהתוכניות עשויות להיות זמינות גם באמצעות גישה כיתתית, גישה במסגרת מבצע או גישה שניתנת ישירות על ידי TechMinds ללא תשלום מקוון נפרד."
              )}
            </p>
          </section>


          {/* 2 */}
          <section>
            <h2>
              2.{" "}
              {text(
                "Before Purchase",
                "قبل الشراء",
                "לפני הרכישה"
              )}
            </h2>

            <p>
              {text(
                "Before purchasing a paid learning path or other digital content, please review the program description, intended audience, included content, price, and access conditions.",
                "قبل شراء مسار تعليمي مدفوع أو أي محتوى رقمي آخر، يرجى مراجعة وصف البرنامج والفئة المستهدفة والمحتوى المشمول والسعر وشروط الوصول.",
                "לפני רכישת מסלול לימוד בתשלום או תוכן דיגיטלי אחר, יש לעיין בתיאור התוכנית, בקהל היעד, בתוכן הכלול, במחיר ובתנאי הגישה."
              )}
            </p>

            <p>
              {text(
                "Where free introductory lessons, previews, or trial content are available, we recommend using them before completing a purchase in order to better understand the learning experience and whether the program is suitable.",
                "عندما تتوفر دروس تمهيدية مجانية أو معاينة أو محتوى تجريبي، نوصي باستخدامها قبل إتمام عملية الشراء للتعرّف بشكل أفضل على تجربة التعلم ومدى ملاءمة البرنامج.",
                "כאשר זמינים שיעורי מבוא חינמיים, תצוגה מקדימה או תוכן לניסיון, מומלץ להשתמש בהם לפני השלמת הרכישה כדי להכיר טוב יותר את חוויית הלמידה ואת התאמת התוכנית."
              )}
            </p>
          </section>


          {/* 3 */}
          <section>
            <h2>
              3.{" "}
              {text(
                "Digital Content and Access",
                "المحتوى الرقمي وتفعيل الوصول",
                "תוכן דיגיטלי והפעלת גישה"
              )}
            </h2>

            <p>
              {text(
                "TechMinds provides digital educational content. After a paid purchase is completed, access to the purchased learning path, program, lessons, or other digital content may be activated for the relevant account.",
                "تقدّم TechMinds محتوى تعليميًا رقميًا. بعد إتمام عملية شراء مدفوعة، قد يتم تفعيل الوصول إلى المسار التعليمي أو البرنامج أو الدروس أو المحتوى الرقمي الذي تم شراؤه للحساب المعني.",
                "TechMinds מספקת תוכן חינוכי דיגיטלי. לאחר השלמת רכישה בתשלום, ניתן להפעיל בחשבון הרלוונטי גישה למסלול הלימוד, לתוכנית, לשיעורים או לתוכן הדיגיטלי שנרכש."
              )}
            </p>
          </section>


          {/* 4 */}
          <section>
            <h2>
              4.{" "}
              {text(
                "Refund Policy",
                "سياسة الاسترجاع",
                "מדיניות החזרים"
              )}
            </h2>

            <div className="legal-highlight">

              <strong>
                {text(
                  "Please review before purchasing",
                  "يرجى المراجعة قبل الشراء",
                  "נא לעיין לפני הרכישה"
                )}
              </strong>

              <p>
                {text(
                  "Once a purchase has been completed and access to the purchased learning path, program, lessons, or other digital content has been activated, TechMinds generally does not offer refunds or exchanges, except where otherwise required by applicable law.",
                  "بعد إتمام عملية الشراء وتفعيل الوصول إلى المسار التعليمي أو البرنامج أو الدروس أو أي محتوى رقمي تم شراؤه، لا تقدم TechMinds بشكل عام استرجاعًا أو استبدالًا للمبلغ المدفوع، إلا في الحالات التي يوجب فيها القانون المعمول به خلاف ذلك.",
                  "לאחר השלמת הרכישה והפעלת הגישה למסלול הלימוד, לתוכנית, לשיעורים או לתוכן דיגיטלי אחר שנרכש, TechMinds בדרך כלל אינה מציעה החזר כספי או החלפה, אלא במקרים שבהם הדין החל מחייב אחרת."
                )}
              </p>

            </div>

            <p>
              {text(
                "For this reason, customers are encouraged to carefully review the program information and use any available free or preview content before making a purchase.",
                "لهذا السبب، نوصي بمراجعة معلومات البرنامج بعناية والاستفادة من أي محتوى مجاني أو تجريبي متاح قبل إتمام عملية الشراء.",
                "מסיבה זו, מומלץ לעיין היטב בפרטי התוכנית ולהשתמש בכל תוכן חינמי או תוכן לניסיון הזמין לפני ביצוע הרכישה."
              )}
            </p>
          </section>


          {/* 5 */}
          <section>
            <h2>
              5.{" "}
              {text(
                "Consumer Rights",
                "حقوق المستهلك",
                "זכויות צרכן"
              )}
            </h2>

            <p>
              {text(
                "Nothing in this policy is intended to limit, exclude, or waive consumer rights that cannot legally be limited, excluded, or waived under applicable law.",
                "لا تهدف هذه السياسة إلى تقييد أو استبعاد أو التنازل عن أي حقوق للمستهلك لا يجوز قانونيًا تقييدها أو استبعادها أو التنازل عنها بموجب القانون المعمول به.",
                "אין במדיניות זו כוונה להגביל, לשלול או לוותר על זכויות צרכניות שלא ניתן על פי דין להגבילן, לשלול אותן או לוותר עליהן."
              )}
            </p>

            <p>
              {text(
                "Where applicable law gives a customer a mandatory right to cancel a transaction or receive a refund, that legal right will apply regardless of this general policy.",
                "إذا منح القانون المعمول به للمستهلك حقًا إلزاميًا في إلغاء المعاملة أو الحصول على استرجاع، فسيتم احترام هذا الحق القانوني بغض النظر عن السياسة العامة المذكورة أعلاه.",
                "כאשר הדין החל מעניק ללקוח זכות מחייבת לבטל עסקה או לקבל החזר, זכות חוקית זו תחול ללא קשר למדיניות הכללית שלעיל."
              )}
            </p>
          </section>


          {/* 6 */}
          <section>
            <h2>
              6.{" "}
              {text(
                "Technical Problems",
                "المشاكل التقنية",
                "בעיות טכניות"
              )}
            </h2>

            <p>
              {text(
                "If a technical problem prevents you from accessing or using paid TechMinds content, please contact us so that we can investigate the issue and provide appropriate assistance.",
                "إذا منعتك مشكلة تقنية من الوصول إلى محتوى TechMinds المدفوع أو استخدامه، يرجى التواصل معنا حتى نتمكن من فحص المشكلة وتقديم المساعدة المناسبة.",
                "אם בעיה טכנית מונעת מכם לגשת לתוכן בתשלום של TechMinds או להשתמש בו, אנא פנו אלינו כדי שנוכל לבדוק את הבעיה ולספק סיוע מתאים."
              )}
            </p>

            <p>
              {text(
                "Where possible, TechMinds may first attempt to restore access or resolve the technical issue.",
                "عندما يكون ذلك ممكنًا، قد تحاول TechMinds أولًا إعادة تفعيل الوصول أو حل المشكلة التقنية.",
                "ככל שניתן, TechMinds עשויה לנסות תחילה לשחזר את הגישה או לפתור את הבעיה הטכנית."
              )}
            </p>
          </section>


          {/* 7 */}
          <section>
            <h2>
              7.{" "}
              {text(
                "Refunds Required by Law",
                "الاسترجاع المطلوب قانونيًا",
                "החזרים הנדרשים על פי חוק"
              )}
            </h2>

            <p>
              {text(
                "If a refund is required under applicable law, the request will be reviewed according to the circumstances of the transaction and the applicable legal requirements.",
                "إذا كان الاسترجاع مطلوبًا بموجب القانون المعمول به، فسيتم فحص الطلب وفقًا لظروف عملية الشراء والمتطلبات القانونية المطبقة.",
                "אם החזר נדרש בהתאם לדין החל, הבקשה תיבחן בהתאם לנסיבות העסקה ולדרישות החוק החלות."
              )}
            </p>

            <p>
              {text(
                "If a full refund is issued, access to the digital content associated with that purchase may be removed.",
                "إذا تم إصدار استرجاع كامل للمبلغ، فقد يتم إلغاء الوصول إلى المحتوى الرقمي المرتبط بعملية الشراء.",
                "אם יינתן החזר כספי מלא, ייתכן שהגישה לתוכן הדיגיטלי הקשור לאותה רכישה תוסר."
              )}
            </p>
          </section>


          {/* 8 */}
          <section>
            <h2>
              8.{" "}
              {text(
                "Contact Us",
                "تواصل معنا",
                "יצירת קשר"
              )}
            </h2>

            <p>
              {text(
                "If you have a question about a purchase, access to a paid program, or this refund policy, please contact TechMinds. Please provide the email address associated with your account and enough information for us to identify the relevant program or purchase.",
                "إذا كان لديك سؤال حول عملية شراء أو الوصول إلى برنامج مدفوع أو حول سياسة الاسترجاع هذه، يرجى التواصل مع TechMinds. يرجى تزويدنا بالبريد الإلكتروني المرتبط بحسابك ومعلومات كافية لتحديد البرنامج أو عملية الشراء ذات الصلة.",
                "אם יש לכם שאלה בנוגע לרכישה, גישה לתוכנית בתשלום או למדיניות החזרים זו, אנא פנו ל-TechMinds. יש לצרף את כתובת הדוא״ל המקושרת לחשבון ומידע מספיק כדי לזהות את התוכנית או הרכישה הרלוונטית."
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