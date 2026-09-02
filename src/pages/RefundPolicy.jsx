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
            💳
          </div>

          <span>
            TECHMINDS
          </span>

          <h1>
            {text(
              "Refund Policy",
              "سياسة الاسترجاع"
            )}
          </h1>

          <p>
            {text(
              "Information about subscription cancellation and refund requests.",
              "معلومات حول إلغاء الاشتراكات وطلبات استرداد الأموال."
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
                "Overview",
                "نظرة عامة"
              )}
            </h2>

            <p>
              {text(
                "We want customers to understand exactly what they are purchasing before subscribing to TechMinds. Plan features, prices and billing periods are displayed before payment.",
                "نريد أن يعرف العملاء بوضوح ما يقومون بشرائه قبل الاشتراك في TechMinds. يتم عرض ميزات الخطة والسعر وفترة الفوترة قبل الدفع."
              )}
            </p>
          </section>


          <section>
            <h2>
              2.{" "}
              {text(
                "Statutory Consumer Rights",
                "حقوق المستهلك القانونية"
              )}
            </h2>

            <div className="legal-highlight">

              <strong>
                14{" "}
                {text(
                  "days",
                  "يومًا"
                )}
              </strong>

              <p>
                {text(
                  "Eligible consumers may have a statutory right to withdraw from certain digital content or service transactions within 14 days, subject to applicable law and the circumstances of the transaction.",
                  "قد يكون للمستهلكين المؤهلين حق قانوني في الانسحاب من بعض معاملات الخدمات أو المحتوى الرقمي خلال 14 يومًا، وفقًا للقانون المعمول به وظروف المعاملة."
                )}
              </p>

            </div>

            <p>
              {text(
                "Nothing in this policy limits consumer rights that cannot legally be waived.",
                "لا تحد هذه السياسة من حقوق المستهلك التي لا يجوز التنازل عنها قانونيًا."
              )}
            </p>
          </section>


          <section>
            <h2>
              3.{" "}
              {text(
                "Subscriptions",
                "الاشتراكات"
              )}
            </h2>

            <p>
              {text(
                "If you cancel a recurring subscription, cancellation normally prevents future renewal charges. Unless a refund is approved or legally required, access may continue until the end of the already-paid billing period.",
                "إذا قمت بإلغاء اشتراك متجدد، فإن الإلغاء يمنع عادةً رسوم التجديد المستقبلية. وما لم تتم الموافقة على استرجاع أو يكن الاسترجاع مطلوبًا قانونيًا، فقد يستمر الوصول حتى نهاية فترة الفوترة المدفوعة."
              )}
            </p>
          </section>


          <section>
            <h2>
              4.{" "}
              {text(
                "Refund Requests",
                "طلبات الاسترجاع"
              )}
            </h2>

            <p>
              {text(
                "Refund requests may be reviewed based on applicable consumer rights, the payment provider's terms and the circumstances of the purchase.",
                "قد تتم مراجعة طلبات الاسترجاع وفقًا لحقوق المستهلك المطبقة وشروط مزود الدفع وظروف عملية الشراء."
              )}
            </p>
          </section>


          <section>
            <h2>
              5.{" "}
              {text(
                "Problems With the Service",
                "مشاكل الخدمة"
              )}
            </h2>

            <p>
              {text(
                "If you experience a technical problem that prevents you from using a paid TechMinds service, please contact support so we can investigate and assist you.",
                "إذا واجهت مشكلة تقنية تمنعك من استخدام خدمة مدفوعة في TechMinds، يرجى التواصل مع الدعم حتى نتمكن من فحص المشكلة ومساعدتك."
              )}
            </p>
          </section>


          <section>
            <h2>
              6.{" "}
              {text(
                "Payments Through Paddle",
                "المدفوعات عبر Paddle"
              )}
            </h2>

            <p>
              {text(
                "When your order is processed through Paddle, refund and withdrawal requests may also be handled by Paddle according to its applicable Buyer Terms and Refund Policy.",
                "عندما تتم معالجة طلبك من خلال Paddle، قد تتم معالجة طلبات الاسترجاع والانسحاب أيضًا بواسطة Paddle وفقًا لشروط المشترين وسياسة الاسترجاع المطبقة لديها."
              )}
            </p>
          </section>


          <section>
            <h2>
              7.{" "}
              {text(
                "Access After Refund",
                "الوصول بعد الاسترجاع"
              )}
            </h2>

            <p>
              {text(
                "When a subscription payment is fully refunded, access to paid features associated with that purchase may be removed.",
                "عند استرداد دفعة الاشتراك بالكامل، قد يتم إلغاء الوصول إلى الميزات المدفوعة المرتبطة بتلك العملية."
              )}
            </p>
          </section>


          <section>
            <h2>
              8.{" "}
              {text(
                "How to Request Help",
                "كيفية طلب المساعدة"
              )}
            </h2>

            <p>
              {text(
                "Please provide the email address connected to your TechMinds account and enough information for us to identify the subscription or payment.",
                "يرجى تزويدنا بالبريد الإلكتروني المرتبط بحساب TechMinds ومعلومات كافية لتحديد الاشتراك أو عملية الدفع."
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


export default RefundPolicy;