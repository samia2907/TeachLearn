import { useState } from "react";

const content = {
  ar: {
    badge: "للعقول التي تصنع القادم", title: "لا تتعلّم المستقبل.", accent: "اصنعه بنفسك.",
    description: "فكرة صغيرة. تجربة جريئة. مشروع يشبهك. هنا يتحوّل الفضول إلى مهارة، والتعلّم إلى شيء تصنعه بيدك.",
    action: "ابدأ رحلتك", explore: "اكتشف الإمكانيات", label: "من الفكرة إلى الإنجاز",
    heading: "مساحتك. طريقتك. انطلاقتك.", subheading: "اختر دورك، ولنصنع شيئًا يستحق الاكتشاف.",
    stages: [
      { name: "اكتشف", title: "كل فكرة تبدأ بسؤال.", detail: "افتح باب الفضول واستكشف مفاهيم جديدة من خلال الدروس.", tag: "فضول بلا حدود", symbol: "✦" },
      { name: "جرّب", title: "الأفكار تصبح أوضح بالتجربة.", detail: "طبّق ما تعلّمته، حلّ التحديات، وجرّب طرقًا مختلفة للوصول إلى الحل.", tag: "تعلّم بالممارسة", symbol: "</>" },
      { name: "ابتكر", title: "اترك بصمتك في مشروعك.", detail: "اجمع مهاراتك في مشروع وأضف إنجازاتك إلى ملف أعمالك.", tag: "من المعرفة إلى الإبداع", symbol: "↗" },
    ],
    features: ["دروس تفاعلية", "تحديات ومشاريع", "مساحة للمعلّمين والطلاب"],
  },
  en: {
    badge: "FOR MINDS THAT MAKE WHAT’S NEXT", title: "Don’t just learn", accent: "what’s next. Build it.",
    description: "A small idea. A bold experiment. A project that is yours. Turn curiosity into a skill, and learning into something you create.",
    action: "Start your journey", explore: "Explore the possibilities", label: "FROM IDEA TO ACHIEVEMENT",
    heading: "Your space. Your way. Your next move.", subheading: "Choose your role. Let’s make something worth discovering.",
    stages: [
      { name: "Discover", title: "Every idea starts with a question.", detail: "Follow your curiosity and explore new concepts through lessons.", tag: "Curiosity without limits", symbol: "✦" },
      { name: "Experiment", title: "Ideas take shape when you try.", detail: "Put lessons into practice, solve challenges, and try different approaches.", tag: "Learn by doing", symbol: "</>" },
      { name: "Create", title: "Make something that is yours.", detail: "Bring your skills together in a project and add your achievements to your portfolio.", tag: "Knowledge into creativity", symbol: "↗" },
    ],
    features: ["Interactive lessons", "Challenges & projects", "A space for teachers & students"],
  },
  he: {
    badge: "למוחות שיוצרים את המחר", title: "לא רק ללמוד את העתיד.", accent: "ליצור אותו בעצמכם.",
    description: "רעיון קטן. ניסוי נועז. פרויקט שהוא שלכם. כאן הסקרנות הופכת למיומנות, והלמידה למשהו שאתם יוצרים.",
    action: "מתחילים את המסע", explore: "מגלים את האפשרויות", label: "מרעיון להישג",
    heading: "המרחב שלכם. הדרך שלכם. הצעד הבא.", subheading: "בחרו את התפקיד שלכם. בואו ניצור משהו ששווה לגלות.",
    stages: [
      { name: "לגלות", title: "כל רעיון מתחיל בשאלה.", detail: "עקבו אחר הסקרנות וגלו מושגים חדשים באמצעות שיעורים.", tag: "סקרנות ללא גבולות", symbol: "✦" },
      { name: "לנסות", title: "רעיונות מקבלים צורה כשמנסים.", detail: "יישמו את מה שלמדתם, פתרו אתגרים ונסו דרכים שונות לפתרון.", tag: "ללמוד דרך עשייה", symbol: "</>" },
      { name: "ליצור", title: "השאירו את החותם שלכם.", detail: "שלבו את הכישורים בפרויקט והוסיפו את ההישגים לתיק העבודות שלכם.", tag: "מידע ליצירה", symbol: "↗" },
    ],
    features: ["שיעורים אינטראקטיביים", "אתגרים ופרויקטים", "מרחב למורים ולתלמידים"],
  },
};

export default function WelcomeHero({ language }) {
  const [stage, setStage] = useState(0);
  const c = content[language] || content.en;
  const selected = c.stages[stage];
  return (
    <section className="welcome-section" dir={language === "en" ? "ltr" : "rtl"}>
      <div className="welcome-hero">
        <div className="welcome-copy">
          <span className="welcome-eyebrow"><i aria-hidden="true" />{c.badge}</span>
          <h2>{c.title}<br /><span>{c.accent}</span></h2>
          <p>{c.description}</p>
          <div className="welcome-actions">
            <a className="welcome-start" href="#choose-role">{c.action}<span aria-hidden="true">↗</span></a>
            <a className="welcome-explore" href="#idea-lab">{c.explore}<span aria-hidden="true">↓</span></a>
          </div>
          <div className="welcome-signature"><span aria-hidden="true">✳</span> LEARN. MAKE. REPEAT.</div>
        </div>
        <div className={`innovation-art innovation-stage-${stage}`} aria-hidden="true">
          <div className="innovation-grid" />
          <div className="studio-window">
            <div className="studio-window-bar"><span><i /><i /><i /></span><span>hello_future.js</span><b>JS</b></div>
            <div className="studio-code"><div><em>01</em><span className="code-purple">const</span> dream = <span className="code-green">"Build something great"</span>;</div><div><em>02</em><span className="code-purple">function</span> <span className="code-blue">create</span>() {'{'}</div><div><em>03</em>&nbsp; learn();</div><div><em>04</em>&nbsp; experiment();</div><div><em>05</em>&nbsp; <span className="code-purple">return</span> yourNextIdea;</div><div><em>06</em>{'}'}</div></div>
            <div className="studio-output"><span className="studio-output-dot" /><span>{selected.tag}</span><b>↗</b></div>
          </div>
          <svg className="innovation-orbits" viewBox="0 0 440 400" fill="none">
            <ellipse cx="220" cy="200" rx="182" ry="72" stroke="currentColor" transform="rotate(-35 220 200)" />
            <ellipse cx="220" cy="200" rx="182" ry="72" stroke="currentColor" transform="rotate(35 220 200)" />
            <circle cx="220" cy="200" r="135" stroke="currentColor" strokeDasharray="3 10" />
            <circle cx="67" cy="287" r="6" fill="#d5fa5b" /><circle cx="372" cy="108" r="5" fill="#b9a5ff" />
          </svg>
          <div className="innovation-core"><span>{selected.symbol}</span></div>
          <div className="innovation-chip chip-top"><span>✦</span> {c.stages[0].name}</div>
          <div className="innovation-chip chip-bottom"><span>↗</span> {c.stages[2].name}</div>
          <div className="innovation-coordinate">IDEA → EXPERIMENT → IMPACT</div>
          <div className="innovation-index">0{stage + 1}<span>/ 03</span></div>
        </div>
      </div>
      <div className="innovation-features">{c.features.map((feature, i) => <span key={feature}><b aria-hidden="true">{["◈", "⌘", "◎"][i]}</b>{feature}</span>)}</div>
      <section className="idea-lab" id="idea-lab" aria-labelledby="idea-lab-title">
        <div className="idea-lab-nav"><span id="idea-lab-title">{c.label}</span><div className="idea-lab-controls" aria-label={c.label}>
          {c.stages.map((item, i) => <button key={item.name} type="button" aria-pressed={stage === i} aria-controls="idea-lab-content" onClick={() => setStage(i)}><span>0{i + 1}</span>{item.name}</button>)}
        </div></div>
        <div className="idea-lab-content" id="idea-lab-content" aria-live="polite" aria-atomic="true">
          <div><span className="idea-lab-tag">{selected.tag}</span><h3>{selected.title}</h3><p>{selected.detail}</p></div>
          <span className="idea-lab-symbol" aria-hidden="true">{selected.symbol}</span>
        </div>
      </section>
      <div className="welcome-section-heading" id="choose-role"><h2>{c.heading}</h2><p>{c.subheading}</p></div>
    </section>
  );
}
