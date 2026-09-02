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
    arabic
  ) =>
    language === "ar"
      ? arabic
      : english;


  return (
    <div className="legal-page">

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
              "الشروط والأحكام"
            )}
          </h1>

          <p>
            {text(
              "The terms governing access to and use of the TechMinds platform.",
              "الشروط التي تنظّم الوصول إلى منصة TechMinds واستخدامها."
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
                "Agreement",
                "الموافقة على الشروط"
              )}
            </h2>

            <p>
              {text(
                "By creating an account, accessing TechMinds or purchasing a subscription, you agree to these Terms and Conditions and the applicable Privacy and Refund Policies.",
                "من خلال إنشاء حساب أو استخدام TechMinds أو شراء اشتراك، فإنك توافق على هذه الشروط والأحكام وسياسة الخصوصية وسياسة الاسترجاع."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "About the Service",
                "حول الخدمة"
              )}
            </h2>

            <p>
              {text(
                "TechMinds provides educational programs and digital learning tools including lessons, activities, classroom management, progress tracking, attendance and student portfolios.",
                "توفر TechMinds برامج تعليمية وأدوات تعلم رقمية تشمل الدروس والأنشطة وإدارة الصفوف وتتبع التقدم والحضور وملفات أعمال الطلاب."
              )}
            </p>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "Accounts",
                "الحسابات"
              )}
            </h2>

            <p>
              {text(
                "Users are responsible for maintaining the confidentiality of their login credentials. Teachers are responsible for appropriately managing student accounts created under their teacher account.",
                "يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات تسجيل الدخول. ويتحمل المعلم مسؤولية الإدارة المناسبة لحسابات الطلاب التي يتم إنشاؤها تحت حسابه."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Student Accounts",
                "حسابات الطلاب"
              )}
            </h2>

            <p>
              {text(
                "Student accounts may be created or managed by teachers. Access may depend on membership in a class, the teacher's subscription and the student's account status.",
                "يمكن إنشاء حسابات الطلاب أو إدارتها من قبل المعلمين. وقد يعتمد الوصول على الانضمام إلى الصف واشتراك المعلم وحالة حساب الطالب."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Subscriptions",
                "الاشتراكات"
              )}
            </h2>

            <p>
              {text(
                "Some TechMinds features require a paid subscription. The price, billing period and features included in each plan will be displayed before purchase.",
                "تتطلب بعض ميزات TechMinds اشتراكًا مدفوعًا. سيتم عرض السعر وفترة الفوترة والميزات المتضمنة في كل خطة قبل الشراء."
              )}
            </p>

            <p>
              {text(
                "If a plan renews automatically, this will be clearly disclosed before the customer completes the purchase.",
                "إذا كانت الخطة تتجدد تلقائيًا، فسيتم توضيح ذلك للعميل قبل إتمام عملية الشراء."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Payment Processing",
                "معالجة الدفع"
              )}
            </h2>

            <p>
              {text(
                "When Paddle is used for payment processing, Paddle acts as the Merchant of Record for the transaction and processes the payment, billing-related customer support and applicable returns.",
                "عند استخدام Paddle لمعالجة الدفع، تعمل Paddle كـMerchant of Record للمعاملة وتتولى معالجة الدفع وخدمة العملاء المتعلقة بالفوترة وعمليات الاسترجاع المطبقة."
              )}
            </p>

            <div className="legal-note">
              ℹ️{" "}
              {text(
                "Before Paddle website approval, add Paddle's current prescribed Merchant of Record wording exactly as shown in the Paddle seller handbook.",
                "قبل تقديم الموقع لموافقة Paddle، أضيفي النص الرسمي الحالي الخاص بـMerchant of Record كما يظهر في دليل بائعي Paddle."
              )}
            </div>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Cancellation and Refunds",
                "الإلغاء والاسترجاع"
              )}
            </h2>

            <p>
              {text(
                "Subscription cancellation and refund eligibility are governed by the Refund Policy, applicable consumer law and, where Paddle processes the order, Paddle's applicable buyer and refund terms.",
                "تخضع أهلية إلغاء الاشتراك واسترداد الأموال لسياسة الاسترجاع وقوانين حماية المستهلك المعمول بها، وعند معالجة الطلب بواسطة Paddle، لشروط Paddle المطبقة."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "Acceptable Use",
                "الاستخدام المقبول"
              )}
            </h2>

            <p>
              {text(
                "Users may not use TechMinds to harm others, compromise platform security, gain unauthorized access, interfere with the service or use accounts belonging to another person without authorization.",
                "لا يجوز استخدام TechMinds لإيذاء الآخرين أو اختراق أمان المنصة أو الحصول على وصول غير مصرح به أو تعطيل الخدمة أو استخدام حساب شخص آخر دون إذن."
              )}
            </p>
          </section>


          <section>
            <h2>
              9.{" "}
              {text(
                "Educational Content",
                "المحتوى التعليمي"
              )}
            </h2>

            <p>
              {text(
                "TechMinds content is provided for educational purposes. Lessons and activities may be updated, improved, replaced or removed as the platform develops.",
                "يتم تقديم محتوى TechMinds لأغراض تعليمية. وقد يتم تحديث الدروس والأنشطة أو تحسينها أو استبدالها أو إزالتها مع تطور المنصة."
              )}
            </p>
          </section>


          <section>
            <h2>
              10.{" "}
              {text(
                "Intellectual Property",
                "الملكية الفكرية"
              )}
            </h2>

            <p>
              {text(
                "Unless otherwise stated, the TechMinds platform, branding, interface and original educational materials are protected intellectual property and may not be copied or commercially redistributed without permission.",
                "ما لم يُذكر خلاف ذلك، فإن منصة TechMinds والعلامة التجارية والواجهة والمواد التعليمية الأصلية هي ملكية فكرية محمية ولا يجوز نسخها أو إعادة توزيعها تجاريًا دون إذن."
              )}
            </p>
          </section>


          <section>
            <h2>
              11.{" "}
              {text(
                "Service Availability",
                "توفر الخدمة"
              )}
            </h2>

            <p>
              {text(
                "We aim to keep TechMinds available and reliable, but temporary interruptions may occur because of maintenance, updates, technical problems or third-party services.",
                "نسعى إلى إبقاء TechMinds متاحة وموثوقة، إلا أن انقطاعات مؤقتة قد تحدث بسبب الصيانة أو التحديثات أو المشكلات التقنية أو خدمات الجهات الخارجية."
              )}
            </p>
          </section>


          <section>
            <h2>
              12.{" "}
              {text(
                "Account Suspension",
                "تعليق الحساب"
              )}
            </h2>

            <p>
              {text(
                "TechMinds may restrict or suspend access when an account is used in violation of these Terms, creates a security risk, or where required by law.",
                "يجوز لـTechMinds تقييد أو تعليق الوصول إذا تم استخدام الحساب بما يخالف هذه الشروط أو يشكل خطرًا أمنيًا أو عندما يقتضي القانون ذلك."
              )}
            </p>
          </section>


          <section>
            <h2>
              13.{" "}
              {text(
                "Changes to These Terms",
                "التغييرات على الشروط"
              )}
            </h2>

            <p>
              {text(
                "We may update these Terms as TechMinds develops. Material changes will be published on this page with an updated revision date.",
                "قد نقوم بتحديث هذه الشروط مع تطور TechMinds. سيتم نشر التغييرات المهمة في هذه الصفحة مع تحديث تاريخ المراجعة."
              )}
            </p>
          </section>


          <section>
            <h2>
              14.{" "}
              {text(
                "Operator and Contact",
                "المشغّل وبيانات التواصل"
              )}
            </h2>

            <p>
              <strong>
                TechMinds
              </strong>
            </p>

            <p>
              {text(
                "Operated by: YOUR_LEGAL_NAME",
                "المشغّل: YOUR_LEGAL_NAME"
              )}
            </p>

            <div className="legal-contact">
              ✉️ YOUR_SUPPORT_EMAIL
              <br />
              📞 YOUR_SUPPORT_PHONE
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


export default TermsConditions;