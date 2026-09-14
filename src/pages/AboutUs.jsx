import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import "./AboutUs.css";

const content = {
  en: {
    title: "About Us",
    intro: "Our platform is an interactive learning environment designed to make education more engaging, creative, and meaningful for students.",
    paragraphs: [
      "We provide structured learning programs in areas such as technology, coding, artificial intelligence, mathematics, science, logical thinking, creativity, and future skills.",
      "Instead of relying only on traditional lessons, our approach focuses on challenges, projects, problem-solving, exploration, and hands-on activities. Students can progress through learning paths, complete missions, earn achievements, and build a portfolio of their work.",
      "The platform also gives teachers tools to create classes, manage students, publish learning programs, track attendance and progress, and organize learning activities in one place.",
      "One of our main goals is to provide an accessible learning experience for Arabic-speaking communities while supporting both Arabic and Hebrew, making the platform suitable for schools, learning centers, teachers, and students in our local community.",
    ],
    visionTitle: "Our Vision",
    vision: "To create a learning environment where students are curious, motivated, creative, and excited to learn.",
    missionTitle: "Our Mission",
    mission: "To combine education, technology, creativity, and real-world challenges in a platform that helps students discover their abilities and develop skills for the future.",
    home: "Home", start: "Start your journey", privacy: "Privacy", terms: "Terms",
  },
  ar: {
    title: "من نحن",
    intro: "منصتنا بيئة تعلّم تفاعلية صُمّمت لتجعل التعليم أكثر تشويقًا وإبداعًا ومعنى للطلاب.",
    paragraphs: [
      "نقدّم برامج تعليمية منظّمة في مجالات مثل التكنولوجيا، والبرمجة، والذكاء الاصطناعي، والرياضيات، والعلوم، والتفكير المنطقي، والإبداع، ومهارات المستقبل.",
      "بدلًا من الاعتماد على الدروس التقليدية وحدها، يركّز نهجنا على التحديات، والمشاريع، وحلّ المشكلات، والاستكشاف، والأنشطة العملية. يستطيع الطلاب التقدّم عبر مسارات التعلّم، وإكمال المهمّات، وكسب الإنجازات، وبناء ملف أعمال يضمّ مشاريعهم.",
      "توفّر المنصة أيضًا للمعلّمين أدوات لإنشاء الصفوف، وإدارة الطلاب، ونشر البرامج التعليمية، ومتابعة الحضور والتقدّم، وتنظيم الأنشطة التعليمية في مكان واحد.",
      "من أهدافنا الأساسية توفير تجربة تعلّم يسهل الوصول إليها للمجتمعات الناطقة بالعربية، مع دعم اللغتين العربية والعبرية، لتكون المنصة مناسبة للمدارس، ومراكز التعلّم، والمعلّمين، والطلاب في مجتمعنا المحلي.",
    ],
    visionTitle: "رؤيتنا",
    vision: "أن نخلق بيئة تعلّم يكون فيها الطلاب فضوليين، ومتحفّزين، ومبدعين، ومتحمّسين للتعلّم.",
    missionTitle: "رسالتنا",
    mission: "أن نجمع التعليم، والتكنولوجيا، والإبداع، وتحديات العالم الحقيقي في منصة تساعد الطلاب على اكتشاف قدراتهم وتطوير مهارات المستقبل.",
    home: "الرئيسية", start: "ابدأ رحلتك", privacy: "الخصوصية", terms: "الشروط",
  },
  he: {
    title: "אודותינו",
    intro: "הפלטפורמה שלנו היא סביבת למידה אינטראקטיבית שנועדה להפוך את החינוך למרתק, יצירתי ומשמעותי יותר עבור תלמידים.",
    paragraphs: [
      "אנו מציעים תוכניות לימוד מובנות בתחומים כגון טכנולוגיה, תכנות, בינה מלאכותית, מתמטיקה, מדעים, חשיבה לוגית, יצירתיות ומיומנויות העתיד.",
      "במקום להסתמך רק על שיעורים מסורתיים, הגישה שלנו מתמקדת באתגרים, בפרויקטים, בפתרון בעיות, בחקר ובהתנסות מעשית. תלמידים יכולים להתקדם במסלולי למידה, להשלים משימות, לצבור הישגים ולבנות תיק עבודות.",
      "הפלטפורמה מעניקה למורים כלים ליצירת כיתות, לניהול תלמידים, לפרסום תוכניות לימוד, למעקב אחר נוכחות והתקדמות ולארגון פעילויות למידה במקום אחד.",
      "אחת המטרות המרכזיות שלנו היא לספק חוויית למידה נגישה לקהילות דוברות ערבית, תוך תמיכה בערבית ובעברית, כך שהפלטפורמה תתאים לבתי ספר, למרכזי למידה, למורים ולתלמידים בקהילה המקומית שלנו.",
    ],
    visionTitle: "החזון שלנו",
    vision: "ליצור סביבת למידה שבה תלמידים סקרנים, חדורי מוטיבציה, יצירתיים ונלהבים ללמוד.",
    missionTitle: "המשימה שלנו",
    mission: "לשלב חינוך, טכנולוגיה, יצירתיות ואתגרים מהעולם האמיתי בפלטפורמה שעוזרת לתלמידים לגלות את יכולותיהם ולפתח מיומנויות לעתיד.",
    home: "עמוד הבית", start: "מתחילים את המסע", privacy: "פרטיות", terms: "תנאים",
  },
};

export default function AboutUs() {
  const { language } = useLanguage();
  const c = content[language] || content.en;

  return (
    <div className="about-page" dir={language === "en" ? "ltr" : "rtl"}>
      <div className="about-container">
        <header className="about-header">
          <Link className="about-brand" to="/login"><span aria-hidden="true">✳</span> TeachLearn</Link>
          <LanguageSwitcher />
        </header>
        <main>
          <section className="about-hero" aria-labelledby="about-title">
            <div>
              <span className="about-eyebrow">TEACHLEARN</span>
              <h1 id="about-title">{c.title}</h1>
              <p>{c.intro}</p>
            </div>
            <div className="about-art" aria-hidden="true"><span>✳</span><i>↗</i></div>
          </section>
          <div className="about-story">
            {c.paragraphs.map((paragraph, index) => (
              <div className="about-story-row" key={index}>
                <span className="about-number" aria-hidden="true">0{index + 1}</span>
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
          <div className="about-purpose">
            <section className="about-vision" aria-labelledby="vision-title">
              <span className="about-purpose-icon" aria-hidden="true">◎</span>
              <h2 id="vision-title">{c.visionTitle}</h2><p>{c.vision}</p>
            </section>
            <section className="about-mission" aria-labelledby="mission-title">
              <span className="about-purpose-icon" aria-hidden="true">↗</span>
              <h2 id="mission-title">{c.missionTitle}</h2><p>{c.mission}</p>
            </section>
          </div>
          <div className="about-cta"><Link className="welcome-start" to="/login">{c.start}<span aria-hidden="true">↗</span></Link></div>
        </main>
        <footer className="about-footer">
          <span>TeachLearn</span>
          <nav aria-label={c.title}>
            <Link to="/login">{c.home}</Link><Link to="/privacy">{c.privacy}</Link><Link to="/terms">{c.terms}</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
