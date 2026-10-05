import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "./AboutUs.css";

const content = {
  en: {
    brandTag: "Interactive learning for the future",
    title: "About Us",
    intro:
      "TechMinds is an interactive learning platform created to make education more engaging, creative, and meaningful for students.",

    paragraphs: [
      "We provide structured learning programs in technology, coding, artificial intelligence, mathematics, science, logical thinking, creativity, and future skills.",
      "Instead of relying only on traditional lessons, our approach focuses on challenges, projects, problem-solving, exploration, and hands-on activities. Students can progress through learning paths, complete missions, earn achievements, and build a portfolio of their work.",
      "The platform also gives teachers tools to create classes, manage students, publish learning programs, track attendance and progress, and organize learning activities in one place.",
      "One of our main goals is to provide an accessible learning experience for Arabic-speaking communities while supporting Arabic, Hebrew, and English.",
    ],

    founderEyebrow: "FOUNDER",
    founderTitle: "Meet the Founder",
    founderName: "Samia Suleiman",
    founderRole:
      "B.Sc. Computer Science · Certified Computer Science Teacher",
    founderBio:
      "Samia Suleiman is a Computer Science graduate from the University of Haifa and holds a teaching certificate in Computer Science for secondary education. She has experience teaching technology, coding, artificial intelligence, and digital skills to students, including gifted learners. TechMinds was created from her vision to build a learning experience that is interactive, accessible, and connected to the needs of students and teachers.",
    founderQuote:
      "I wanted to create a place where students do not only learn — they explore, build, try, make mistakes, and discover what they are capable of.",

    visionTitle: "Our Vision",
    vision:
      "To create a learning environment where students are curious, motivated, creative, and excited to learn.",

    missionTitle: "Our Mission",
    mission:
      "To combine education, technology, creativity, and real-world challenges in a platform that helps students discover their abilities and develop skills for the future.",

    value1Title: "Learning by doing",
    value1Text:
      "Students learn through missions, challenges, projects, and active exploration.",

    value2Title: "Built for our community",
    value2Text:
      "Designed with Arabic-speaking learners in mind, with multilingual support.",

    value3Title: "Future-ready skills",
    value3Text:
      "Technology, problem-solving, creativity, and digital confidence in one place.",

    ctaTitle: "A learning experience built for the minds of tomorrow.",

    home: "Home",
    start: "Start your journey",
    privacy: "Privacy",
    terms: "Terms",
  },

  ar: {
    brandTag: "تعلّم تفاعلي لمهارات المستقبل",
    title: "من نحن",
    intro:
      "TechMinds هي منصة تعلّم تفاعلية صُمّمت لتجعل التعليم أكثر تشويقًا وإبداعًا ومعنى للطلاب.",

    paragraphs: [
      "نقدّم برامج تعليمية منظّمة في مجالات التكنولوجيا، والبرمجة، والذكاء الاصطناعي، والرياضيات، والعلوم، والتفكير المنطقي، والإبداع، ومهارات المستقبل.",
      "بدلًا من الاعتماد على الدروس التقليدية وحدها، يركّز نهجنا على التحديات، والمشاريع، وحلّ المشكلات، والاستكشاف، والتجربة العملية. يستطيع الطلاب التقدّم عبر مسارات تعلّم، وإكمال المهمّات، وكسب الإنجازات، وبناء ملف أعمال يضمّ مشاريعهم.",
      "توفّر المنصة أيضًا للمعلّمين أدوات لإنشاء الصفوف، وإدارة الطلاب، ونشر البرامج التعليمية، ومتابعة الحضور والتقدّم، وتنظيم الأنشطة التعليمية في مكان واحد.",
      "من أهدافنا الأساسية توفير تجربة تعلّم يسهل الوصول إليها للمجتمعات الناطقة بالعربية، مع دعم العربية والعبرية والإنجليزية.",
    ],

    founderEyebrow: "المؤسِّسة",
    founderTitle: "تعرّفوا على المؤسِّسة",
    founderName: "ساميه سليمان",
    founderRole:
      "B.Sc. في علوم الحاسوب · حاصلة على شهادة تدريس في علوم الحاسوب",
    founderBio:
      "ساميه سليمان حاصلة على درجة البكالوريوس في علوم الحاسوب من جامعة حيفا، وعلى شهادة تدريس في علوم الحاسوب للمرحلة فوق الابتدائية. لديها خبرة في تعليم التكنولوجيا، والبرمجة، والذكاء الاصطناعي، والمهارات الرقمية للطلاب، بما في ذلك الطلاب الموهوبين. جاءت فكرة TechMinds من رؤيتها لبناء تجربة تعلّم تفاعلية، قريبة من الطلاب، ومناسبة لاحتياجات المعلّمين والمجتمع.",
    founderQuote:
      "أردت أن أخلق مكانًا لا يتعلّم فيه الطالب فقط، بل يجرّب، ويستكشف، ويبني، ويخطئ، ويكتشف قدراته.",

    visionTitle: "رؤيتنا",
    vision:
      "أن نخلق بيئة تعلّم يكون فيها الطلاب فضوليين، ومتحفّزين، ومبدعين، ومتحمّسين للتعلّم.",

    missionTitle: "رسالتنا",
    mission:
      "أن نجمع التعليم، والتكنولوجيا، والإبداع، وتحديات العالم الحقيقي في منصة تساعد الطلاب على اكتشاف قدراتهم وتطوير مهارات المستقبل.",

    value1Title: "التعلّم بالممارسة",
    value1Text:
      "يتعلّم الطلاب من خلال المهمّات، والتحديات، والمشاريع، والاستكشاف الفعلي.",

    value2Title: "مصمّمة لمجتمعنا",
    value2Text:
      "تجربة تعلّم تراعي احتياجات الطلاب الناطقين بالعربية وتدعم عدّة لغات.",

    value3Title: "مهارات للمستقبل",
    value3Text:
      "تكنولوجيا، حلّ مشكلات، إبداع وثقة رقمية في مكان واحد.",

    ctaTitle: "تجربة تعلّم صُمّمت لعقول المستقبل.",

    home: "الرئيسية",
    start: "ابدأ رحلتك",
    privacy: "الخصوصية",
    terms: "الشروط",
  },

  he: {
    brandTag: "למידה אינטראקטיבית למיומנויות העתיד",
    title: "אודותינו",
    intro:
      "TechMinds היא פלטפורמת למידה אינטראקטיבית שנועדה להפוך את החינוך למרתק, יצירתי ומשמעותי יותר עבור תלמידים.",

    paragraphs: [
      "אנו מציעים תוכניות לימוד מובנות בתחומי טכנולוגיה, תכנות, בינה מלאכותית, מתמטיקה, מדעים, חשיבה לוגית, יצירתיות ומיומנויות העתיד.",
      "במקום להסתמך רק על שיעורים מסורתיים, הגישה שלנו מתמקדת באתגרים, בפרויקטים, בפתרון בעיות, בחקר ובהתנסות מעשית. תלמידים יכולים להתקדם במסלולי למידה, להשלים משימות, לצבור הישגים ולבנות תיק עבודות.",
      "הפלטפורמה מעניקה למורים כלים ליצירת כיתות, לניהול תלמידים, לפרסום תוכניות לימוד, למעקב אחר נוכחות והתקדמות ולארגון פעילויות למידה במקום אחד.",
      "אחת המטרות המרכזיות שלנו היא לספק חוויית למידה נגישה לקהילות דוברות ערבית, תוך תמיכה בערבית, עברית ואנגלית.",
    ],

    founderEyebrow: "המייסדת",
    founderTitle: "הכירו את המייסדת",
    founderName: "סאמיה סולימאן",
    founderRole:
      "B.Sc. במדעי המחשב · בעלת תעודת הוראה במדעי המחשב",
    founderBio:
      "סאמיה סולימאן היא בוגרת תואר ראשון במדעי המחשב מאוניברסיטת חיפה ובעלת תעודת הוראה במדעי המחשב לחינוך העל-יסודי. יש לה ניסיון בהוראת טכנולוגיה, תכנות, בינה מלאכותית ומיומנויות דיגיטליות לתלמידים, כולל תלמידים מחוננים. TechMinds נולדה מתוך החזון שלה ליצור חוויית למידה אינטראקטיבית, נגישה ורלוונטית לצורכי תלמידים, מורים והקהילה.",
    founderQuote:
      "רציתי ליצור מקום שבו תלמידים לא רק לומדים — אלא גם חוקרים, בונים, מנסים, טועים ומגלים למה הם מסוגלים.",

    visionTitle: "החזון שלנו",
    vision:
      "ליצור סביבת למידה שבה תלמידים סקרנים, חדורי מוטיבציה, יצירתיים ונלהבים ללמוד.",

    missionTitle: "המשימה שלנו",
    mission:
      "לשלב חינוך, טכנולוגיה, יצירתיות ואתגרים מהעולם האמיתי בפלטפורמה שעוזרת לתלמידים לגלות את יכולותיהם ולפתח מיומנויות לעתיד.",

    value1Title: "למידה דרך עשייה",
    value1Text:
      "התלמידים לומדים באמצעות משימות, אתגרים, פרויקטים והתנסות פעילה.",

    value2Title: "נבנה עבור הקהילה שלנו",
    value2Text:
      "חוויית למידה המותאמת גם לדוברי ערבית ותומכת במספר שפות.",

    value3Title: "מיומנויות לעתיד",
    value3Text:
      "טכנולוגיה, פתרון בעיות, יצירתיות וביטחון דיגיטלי במקום אחד.",

    ctaTitle: "חוויית למידה שנבנתה עבור המוחות של המחר.",

    home: "עמוד הבית",
    start: "מתחילים את המסע",
    privacy: "פרטיות",
    terms: "תנאים",
  },
};

export default function AboutUs() {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const isRtl = language === "ar" || language === "he";

  return (
    <div className="about-page" dir={isRtl ? "rtl" : "ltr"}>
      <div className="about-glow about-glow-one" aria-hidden="true" />
      <div className="about-glow about-glow-two" aria-hidden="true" />

      <div className="about-container">
        <header className="about-header">
          <Link className="about-brand" to="/" aria-label="TechMinds">
            <span className="about-brand-mark" aria-hidden="true">
              ✦
            </span>
            <span>TechMinds</span>
          </Link>

          <LanguageSwitcher />
        </header>

        <main>
          <section className="about-hero" aria-labelledby="about-title">
            <div className="about-hero-copy">
              <span className="about-eyebrow">{c.brandTag}</span>

              <h1 id="about-title">{c.title}</h1>

              <p className="about-intro">{c.intro}</p>

              <Link className="about-hero-button" to="/login">
                <span>{c.start}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="about-hero-decoration" aria-hidden="true">
              <span className="about-deco-ring about-deco-ring-one" />
              <span className="about-deco-ring about-deco-ring-two" />
              <span className="about-deco-star">✦</span>
            </div>
          </section>

          <section className="about-story" aria-label={c.title}>
            {c.paragraphs.map((paragraph, index) => (
              <article className="about-story-row" key={index}>
                <span className="about-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p>{paragraph}</p>
              </article>
            ))}
          </section>

          <section className="about-values">
            <article>
              <span className="about-value-icon" aria-hidden="true">
                ✦
              </span>
              <h3>{c.value1Title}</h3>
              <p>{c.value1Text}</p>
            </article>

            <article>
              <span className="about-value-icon" aria-hidden="true">
                ◎
              </span>
              <h3>{c.value2Title}</h3>
              <p>{c.value2Text}</p>
            </article>

            <article>
              <span className="about-value-icon" aria-hidden="true">
                ↗
              </span>
              <h3>{c.value3Title}</h3>
              <p>{c.value3Text}</p>
            </article>
          </section>

          <section
            className="about-founder"
            aria-labelledby="founder-title"
          >
            <div className="about-founder-visual" aria-hidden="true">
              <div className="about-founder-avatar">SS</div>

              <div className="about-founder-mini-card">
                <span>TechMinds</span>
                <strong>Founder</strong>
              </div>
            </div>

            <div className="about-founder-content">
              <span className="about-eyebrow">
                {c.founderEyebrow}
              </span>

              <h2 id="founder-title">
                {c.founderTitle}
              </h2>

              <h3>{c.founderName}</h3>

              <p className="about-founder-role">
                {c.founderRole}
              </p>

              <p className="about-founder-bio">
                {c.founderBio}
              </p>

              <blockquote>
                {c.founderQuote}
              </blockquote>
            </div>
          </section>

          <section className="about-purpose">
            <article
              className="about-purpose-card about-vision"
              aria-labelledby="vision-title"
            >
              <span
                className="about-purpose-icon"
                aria-hidden="true"
              >
                ◎
              </span>

              <h2 id="vision-title">
                {c.visionTitle}
              </h2>

              <p>{c.vision}</p>
            </article>

            <article
              className="about-purpose-card about-mission"
              aria-labelledby="mission-title"
            >
              <span
                className="about-purpose-icon"
                aria-hidden="true"
              >
                ↗
              </span>

              <h2 id="mission-title">
                {c.missionTitle}
              </h2>

              <p>{c.mission}</p>
            </article>
          </section>

          <section className="about-cta">
            <div>
              <span className="about-eyebrow">
                TECHMINDS
              </span>

              <h2>{c.ctaTitle}</h2>
            </div>

            <Link className="about-cta-button" to="/login">
              <span>{c.start}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </section>
        </main>

        <footer className="about-footer">
          <Link
            className="about-footer-brand"
            to="/login"
          >
            TechMinds
          </Link>

          <nav aria-label={c.title}>
            <Link to="/">{c.home}</Link>
            <Link to="/privacy">{c.privacy}</Link>
            <Link to="/terms">{c.terms}</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}