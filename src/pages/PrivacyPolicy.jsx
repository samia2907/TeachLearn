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
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  return (
    <div className="legal-page">

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

          </div>

        </header>


        {/* HERO */}

        <section className="legal-hero">

          <div className="legal-icon">
            🔐
          </div>

          <span>
            TECHMINDS
          </span>

          <h1>
            {text(
              "Privacy Policy",
              "سياسة الخصوصية"
            )}
          </h1>

          <p>
            {text(
              "Learn how TechMinds collects, uses and protects your information.",
              "تعرّف على كيفية جمع TechMinds لمعلوماتك واستخدامها وحمايتها."
            )}
          </p>

          <small>
            {text(
              "Last updated: September 1, 2026",
              "آخر تحديث: 1 سبتمبر 2026"
            )}
          </small>

        </section>


        <main className="legal-content">

          <section>
            <h2>
              1.{" "}
              {text(
                "About TechMinds",
                "حول TechMinds"
              )}
            </h2>

            <p>
              {text(
                "TechMinds is an educational platform that provides digital learning programs, lessons, activities and classroom management tools for students and teachers.",
                "TechMinds هي منصة تعليمية تقدم برامج ودروسًا وأنشطة رقمية وأدوات لإدارة الصفوف للطلاب والمعلمين."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "Information We Collect",
                "المعلومات التي نجمعها"
              )}
            </h2>

            <p>
              {text(
                "Depending on how you use TechMinds, we may collect account and profile information such as name, email address, username, student code, teacher relationship, class information and account status.",
                "بحسب طريقة استخدامك لـTechMinds، قد نجمع معلومات الحساب والملف الشخصي مثل الاسم والبريد الإلكتروني واسم المستخدم ورمز الطالب والمعلم والصف وحالة الحساب."
              )}
            </p>

            <ul>
              <li>
                {text(
                  "Teacher account information.",
                  "معلومات حساب المعلم."
                )}
              </li>

              <li>
                {text(
                  "Student account and class information.",
                  "معلومات حساب الطالب والصف."
                )}
              </li>

              <li>
                {text(
                  "Lesson progress, answers, XP, level and achievements.",
                  "تقدم الدروس والإجابات والنقاط والمستوى والإنجازات."
                )}
              </li>

              <li>
                {text(
                  "Attendance and learning portfolio information.",
                  "معلومات الحضور وملف الأعمال التعليمي."
                )}
              </li>

              <li>
                {text(
                  "Technical information necessary to operate and secure the platform.",
                  "المعلومات التقنية اللازمة لتشغيل المنصة وحمايتها."
                )}
              </li>
            </ul>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "How We Use Information",
                "كيف نستخدم المعلومات"
              )}
            </h2>

            <p>
              {text(
                "We use information to provide and improve TechMinds, authenticate users, manage classes, display learning progress, provide support, maintain security and operate subscriptions.",
                "نستخدم المعلومات لتقديم TechMinds وتحسينها، والتحقق من المستخدمين، وإدارة الصفوف، وعرض التقدم التعليمي، وتقديم الدعم، وحماية المنصة وإدارة الاشتراكات."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Student Information",
                "معلومات الطلاب"
              )}
            </h2>

            <p>
              {text(
                "TechMinds is designed to support educational use. Teachers may create and manage student accounts and access information related to students they manage, including learning progress, attendance and portfolio work.",
                "تم تصميم TechMinds للاستخدام التعليمي. يمكن للمعلمين إنشاء حسابات الطلاب وإدارتها والوصول إلى المعلومات المتعلقة بالطلاب الذين يديرونهم، بما في ذلك التقدم والحضور وملف الأعمال."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Payments",
                "المدفوعات"
              )}
            </h2>

            <p>
              {text(
                "TechMinds does not store full credit card numbers or card security codes. Payments may be processed by an authorized external payment provider such as Paddle. Payment information is handled according to the payment provider's own privacy and security practices.",
                "لا تقوم TechMinds بتخزين أرقام بطاقات الائتمان الكاملة أو رموز الأمان. قد تتم معالجة المدفوعات بواسطة مزود دفع خارجي معتمد مثل Paddle، وتخضع معلومات الدفع لسياسات الخصوصية والأمان الخاصة بمزود الدفع."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Service Providers",
                "مزودو الخدمات"
              )}
            </h2>

            <p>
              {text(
                "We may use trusted technology providers to operate TechMinds, including services for authentication, database storage, website hosting, analytics, security and payment processing.",
                "قد نستخدم مزودي خدمات تقنية موثوقين لتشغيل TechMinds، بما في ذلك خدمات تسجيل الدخول وقواعد البيانات والاستضافة والتحليلات والأمان ومعالجة الدفع."
              )}
            </p>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Data Security",
                "أمن البيانات"
              )}
            </h2>

            <p>
              {text(
                "We take reasonable technical and organizational measures to protect account and educational information. However, no online service can guarantee absolute security.",
                "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية معلومات الحساب والبيانات التعليمية، إلا أنه لا يمكن لأي خدمة عبر الإنترنت ضمان الأمان المطلق."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "Data Retention",
                "الاحتفاظ بالبيانات"
              )}
            </h2>

            <p>
              {text(
                "We retain information for as long as reasonably necessary to provide the service, maintain educational records, comply with legal obligations and protect the security of TechMinds.",
                "نحتفظ بالمعلومات طالما كان ذلك ضروريًا بشكل معقول لتقديم الخدمة، والحفاظ على السجلات التعليمية، والامتثال للالتزامات القانونية وحماية TechMinds."
              )}
            </p>
          </section>


          <section>
            <h2>
              9.{" "}
              {text(
                "Your Choices",
                "خياراتك"
              )}
            </h2>

            <p>
              {text(
                "You may contact TechMinds to request information about your account, request correction of inaccurate information or ask about account deletion, subject to applicable legal and educational record requirements.",
                "يمكنك التواصل مع TechMinds لطلب معلومات حول حسابك أو تصحيح معلومات غير دقيقة أو الاستفسار عن حذف الحساب، مع مراعاة المتطلبات القانونية والتعليمية المعمول بها."
              )}
            </p>
          </section>


          <section>
            <h2>
              10.{" "}
              {text(
                "Changes to This Policy",
                "التغييرات على السياسة"
              )}
            </h2>

            <p>
              {text(
                "We may update this Privacy Policy when our services, technology or legal requirements change. The latest version will always be published on this page.",
                "قد نقوم بتحديث سياسة الخصوصية عند تغير خدماتنا أو تقنياتنا أو المتطلبات القانونية. سيتم نشر أحدث نسخة دائمًا في هذه الصفحة."
              )}
            </p>
          </section>


          <section>
            <h2>
              11.{" "}
              {text(
                "Contact Us",
                "تواصل معنا"
              )}
            </h2>

            <p>
              {text(
                "For privacy questions or requests, contact TechMinds support.",
                "للاستفسارات أو الطلبات المتعلقة بالخصوصية، تواصل مع دعم TechMinds."
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
            "الخصوصية"
          )}
        </a>

        <a href="/terms">
          {text(
            "Terms",
            "الشروط"
          )}
        </a>

        <a href="/refund-policy">
          {text(
            "Refund Policy",
            "سياسة الاسترجاع"
          )}
        </a>

        <a href="/plans">
          {text(
            "Plans",
            "الخطط"
          )}
        </a>
      </div>

    </footer>
  );
}


export default PrivacyPolicy;