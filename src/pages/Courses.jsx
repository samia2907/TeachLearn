import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";
import "./Courses.css";

const content = {
  ar: {
    courses: [
      {
        id: "private-math",
        badge: "دروس خاصة",
        title: "دروس رياضيات وتقوية",
        description:
          "دروس فردية أو مجموعات صغيرة مع شرح مبسّط، تدريب ومتابعة حسب مستوى الطالب.",
        meta: ["ابتدائي – ثانوي", "60 دقيقة", "Zoom أو حضوري"],
        cta: "سجّل للدرس",
      },
      {
        id: "little-programmer",
        badge: "دورة",
        title: "المبرمج الصغير",
        description:
          "تجربة ممتعة لتعلّم التفكير البرمجي وبناء مشاريع بسيطة بطريقة تناسب جيل الطالب.",
        meta: ["طلاب ابتدائي", "8 لقاءات", "Zoom أو حضوري"],
        cta: "سجّل للدورة",
      },
      {
        id: "cs-lessons",
        badge: "دروس خاصة",
        title: "علوم الحاسوب والبرمجة",
        description:
          "دعم وتعلّم في البرمجة، التفكير الخوارزمي، مشاريع الحاسوب ومواضيع التكنولوجيا.",
        meta: ["حسب المستوى", "60–90 دقيقة", "Zoom"],
        cta: "اطلب درسًا",
      },
    ],
    eyebrow: "تعلم مباشر مع متابعة شخصية",
    title: "دورات ودروس خاصة تناسب احتياجات كل طالب",
    intro:
      "تعلّم عبر Zoom أو حضوريًا، ضمن لقاءات منظمة ومتابعة مباشرة، في الرياضيات، البرمجة، علوم الحاسوب والتكنولوجيا.",
    explore: "استكشف الدورات",
    register: "سجّل الآن",
    whatsapp: "تواصل عبر واتساب",
    whatsappMessage: "مرحبًا، أريد الاستفسار عن الدورات والدروس في TechMinds.",
    heroCardTitle: "تعلم من أي مكان",
    heroCardText: "لقاءات مباشرة عبر Zoom مع شرح، تطبيق ومتابعة.",
    chooseLabel: "اختر ما يناسبك",
    availableTitle: "الدورات والدروس المتاحة",
    availableText:
      "يمكنك الاطلاع على التفاصيل بدون إنشاء حساب، ثم إرسال طلب تسجيل بسهولة.",
    zoomTitle: "الدروس متاحة عبر Zoom",
    zoomText:
      "بعد تأكيد التسجيل، يحصل الطالب على تفاصيل اللقاءات. رابط Zoom الخاص لا يظهر للعامة، وسيتم عرضه لاحقًا داخل حساب الطالب المسجّل.",
    nextStep: "التسجيل",
    readyTitle: "سجّل للدورة أو الدرس",
    readyText:
      "عبّي التفاصيل التالية، وسيتم حفظ طلبك وإرساله للإدارة للمتابعة.",
    studentName: "اسم الطالب",
    parentName: "اسم ولي الأمر",
    grade: "الصف",
    phone: "رقم الهاتف",
    course: "الدورة / الدرس",
    preferredTime: "الموعد المفضل",
    notes: "ملاحظات إضافية",
    chooseCourse: "اختر الدورة",
    submit: "إرسال طلب التسجيل",
    sending: "جارٍ إرسال الطلب...",
    success:
      "تم إرسال طلب التسجيل بنجاح ✅ سنتواصل معك لتأكيد التفاصيل.",
    error:
      "حدث خطأ أثناء إرسال الطلب. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.",
    required: "يرجى تعبئة جميع الحقول المطلوبة.",
    phoneInvalid: "يرجى إدخال رقم هاتف صحيح.",
    footer: "تعليم ممتع، دعم شخصي ومهارات للمستقبل.",
  },

  en: {
    courses: [
      {
        id: "private-math",
        badge: "Private Lessons",
        title: "Math Support Lessons",
        description:
          "One-to-one or small-group lessons with clear explanations, practice and follow-up based on the student's level.",
        meta: ["Primary – High School", "60 minutes", "Zoom or in person"],
        cta: "Register for a lesson",
      },
      {
        id: "little-programmer",
        badge: "Course",
        title: "Little Programmer",
        description:
          "A fun introduction to computational thinking and simple projects, adapted to the student's age.",
        meta: ["Primary students", "8 sessions", "Zoom or in person"],
        cta: "Register for the course",
      },
      {
        id: "cs-lessons",
        badge: "Private Lessons",
        title: "Computer Science & Programming",
        description:
          "Support and learning in programming, algorithmic thinking, computer projects and technology topics.",
        meta: ["Based on level", "60–90 minutes", "Zoom"],
        cta: "Request a lesson",
      },
    ],
    eyebrow: "Live learning with personal guidance",
    title: "Courses and private lessons tailored to every student",
    intro:
      "Learn through Zoom or in person with structured sessions and direct support in mathematics, programming, computer science and technology.",
    explore: "Explore courses",
    register: "Register now",
    whatsapp: "Contact on WhatsApp",
    whatsappMessage: "Hello, I would like to ask about TechMinds courses and private lessons.",
    heroCardTitle: "Learn from anywhere",
    heroCardText: "Live Zoom sessions with explanation, practice and follow-up.",
    chooseLabel: "Choose what fits you",
    availableTitle: "Available courses and lessons",
    availableText:
      "You can view the details without creating an account, then send a registration request easily.",
    zoomTitle: "Lessons are available on Zoom",
    zoomText:
      "After registration is confirmed, the student receives the session details. The private Zoom link is not shown publicly and will later appear inside the registered student's account.",
    nextStep: "Registration",
    readyTitle: "Register for a course or lesson",
    readyText:
      "Fill in the details below. Your request will be saved and sent to the administration for follow-up.",
    studentName: "Student name",
    parentName: "Parent / guardian name",
    grade: "Grade",
    phone: "Phone number",
    course: "Course / lesson",
    preferredTime: "Preferred time",
    notes: "Additional notes",
    chooseCourse: "Choose a course",
    submit: "Send registration request",
    sending: "Sending request...",
    success:
      "Your registration request was sent successfully ✅ We will contact you to confirm the details.",
    error:
      "Something went wrong while sending the request. Check your internet connection and try again.",
    required: "Please fill in all required fields.",
    phoneInvalid: "Please enter a valid phone number.",
    footer: "Engaging learning, personal support and skills for the future.",
  },

  he: {
    courses: [
      {
        id: "private-math",
        badge: "שיעורים פרטיים",
        title: "שיעורי מתמטיקה ותגבור",
        description:
          "שיעורים אישיים או בקבוצות קטנות עם הסבר ברור, תרגול ומעקב בהתאם לרמת התלמיד.",
        meta: ["יסודי – תיכון", "60 דקות", "Zoom או פרונטלי"],
        cta: "הרשמה לשיעור",
      },
      {
        id: "little-programmer",
        badge: "קורס",
        title: "המתכנת הצעיר",
        description:
          "חוויה מהנה ללימוד חשיבה תכנותית ובניית פרויקטים פשוטים בהתאמה לגיל התלמיד.",
        meta: ["תלמידי יסודי", "8 מפגשים", "Zoom או פרונטלי"],
        cta: "הרשמה לקורס",
      },
      {
        id: "cs-lessons",
        badge: "שיעורים פרטיים",
        title: "מדעי המחשב ותכנות",
        description:
          "תמיכה ולמידה בתכנות, חשיבה אלגוריתמית, פרויקטים במחשב ונושאי טכנולוגיה.",
        meta: ["לפי הרמה", "60–90 דקות", "Zoom"],
        cta: "בקשת שיעור",
      },
    ],
    eyebrow: "למידה ישירה עם ליווי אישי",
    title: "קורסים ושיעורים פרטיים המותאמים לצרכים של כל תלמיד",
    intro:
      "לימוד דרך Zoom או באופן פרונטלי, במפגשים מסודרים ועם ליווי ישיר במתמטיקה, תכנות, מדעי המחשב וטכנולוגיה.",
    explore: "לצפייה בקורסים",
    register: "להרשמה עכשיו",
    whatsapp: "יצירת קשר ב-WhatsApp",
    whatsappMessage: "שלום, אשמח לקבל פרטים על הקורסים והשיעורים הפרטיים של TechMinds.",
    heroCardTitle: "ללמוד מכל מקום",
    heroCardText: "מפגשי Zoom חיים עם הסבר, תרגול ומעקב.",
    chooseLabel: "בחרו מה מתאים לכם",
    availableTitle: "הקורסים והשיעורים הזמינים",
    availableText:
      "אפשר לצפות בפרטים ללא יצירת חשבון, ולאחר מכן לשלוח בקשת הרשמה בקלות.",
    zoomTitle: "השיעורים זמינים דרך Zoom",
    zoomText:
      "לאחר אישור ההרשמה, התלמיד יקבל את פרטי המפגשים. קישור ה-Zoom הפרטי אינו מוצג לציבור ובהמשך יוצג בתוך החשבון של התלמיד הרשום.",
    nextStep: "הרשמה",
    readyTitle: "הרשמה לקורס או לשיעור",
    readyText:
      "מלאו את הפרטים הבאים. הבקשה תישמר ותישלח להנהלה לצורך המשך טיפול.",
    studentName: "שם התלמיד",
    parentName: "שם ההורה / האפוטרופוס",
    grade: "כיתה",
    phone: "מספר טלפון",
    course: "קורס / שיעור",
    preferredTime: "מועד מועדף",
    notes: "הערות נוספות",
    chooseCourse: "בחרו קורס",
    submit: "שליחת בקשת הרשמה",
    sending: "שולח את הבקשה...",
    success:
      "בקשת ההרשמה נשלחה בהצלחה ✅ ניצור איתכם קשר לאישור הפרטים.",
    error:
      "אירעה שגיאה בשליחת הבקשה. בדקו את החיבור לאינטרנט ונסו שוב.",
    required: "יש למלא את כל שדות החובה.",
    phoneInvalid: "יש להזין מספר טלפון תקין.",
    footer: "למידה מהנה, תמיכה אישית ומיומנויות לעתיד.",
  },
};

const initialForm = {
  studentName: "",
  parentName: "",
  grade: "",
  phone: "",
  courseId: "",
  preferredTime: "",
  notes: "",
};

function Courses() {
  const { language } = useLanguage();

  const lang =
    language === "ar" || language === "he"
      ? language
      : "en";

  const c = content[lang];

  const whatsappUrl =
    `https://wa.me/972549308793?text=${encodeURIComponent(c.whatsappMessage)}`;

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setMessage("");
    }
  };

  const selectCourse = (courseId) => {
    setForm((current) => ({
      ...current,
      courseId,
    }));

    setStatus("idle");
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("registration")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredValues = [
      form.studentName,
      form.parentName,
      form.grade,
      form.phone,
      form.courseId,
      form.preferredTime,
    ];

    if (
      requiredValues.some(
        (value) => !String(value).trim()
      )
    ) {
      setStatus("error");
      setMessage(c.required);
      return;
    }

    const cleanPhone = form.phone.replace(/\s+/g, "");

    if (!/^[0-9+\-()]{8,20}$/.test(cleanPhone)) {
      setStatus("error");
      setMessage(c.phoneInvalid);
      return;
    }

    const selectedCourse = c.courses.find(
      (course) => course.id === form.courseId
    );

    try {
      setStatus("loading");
      setMessage("");

      await addDoc(
        collection(db, "courseRegistrations"),
        {
          studentName: form.studentName.trim(),
          parentName: form.parentName.trim(),
          grade: form.grade.trim(),
          phone: cleanPhone,
          courseId: form.courseId,
          courseTitle:
            selectedCourse?.title || form.courseId,
          preferredTime:
            form.preferredTime.trim(),
          notes: form.notes.trim(),
          language: lang,
          status: "new",
          source: "public-courses-page",
          createdAt: serverTimestamp(),
        }
      );

      setForm(initialForm);
      setStatus("success");
      setMessage(c.success);
    } catch (error) {
      console.error(
        "Course registration error:",
        error
      );

      setStatus("error");
      setMessage(c.error);
    }
  };

  return (
    <main
      className="courses-page"
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <section className="courses-hero">
        <div className="courses-hero-content">
          <span className="courses-eyebrow">
            {c.eyebrow}
          </span>

          <h1>{c.title}</h1>

          <p>{c.intro}</p>

          <div className="courses-hero-actions">
            <a
              href="#available-courses"
              className="courses-primary-btn"
            >
              {c.explore}
            </a>

            <a
              href="#registration"
              className="courses-secondary-btn"
            >
              {c.register}
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="courses-whatsapp-btn"
            >
              <span aria-hidden="true">💬</span>
              {c.whatsapp}
            </a>
          </div>
        </div>

        <div className="courses-hero-card">
          <span className="hero-card-icon">
            💻
          </span>

          <strong>
            {c.heroCardTitle}
          </strong>

          <p>{c.heroCardText}</p>
        </div>
      </section>

      <section
        id="available-courses"
        className="courses-section"
      >
        <div className="courses-section-heading">
          <span>{c.chooseLabel}</span>
          <h2>{c.availableTitle}</h2>
          <p>{c.availableText}</p>
        </div>

        <div className="courses-grid">
          {c.courses.map((course) => (
            <article
              className="course-card"
              key={course.id}
            >
              <span className="course-badge">
                {course.badge}
              </span>

              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <ul className="course-meta">
                {course.meta.map((item) => (
                  <li key={item}>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="course-card-btn"
                onClick={() =>
                  selectCourse(course.id)
                }
              >
                {course.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="zoom-section">
        <div>
          <span className="zoom-icon">
            🎥
          </span>
        </div>

        <div>
          <h2>{c.zoomTitle}</h2>
          <p>{c.zoomText}</p>
        </div>
      </section>

      <section
        id="registration"
        className="registration-preview"
      >
        <div className="registration-copy">
          <span>{c.nextStep}</span>
          <h2>{c.readyTitle}</h2>
          <p>{c.readyText}</p>
        </div>

        <form
          className="course-registration-form"
          onSubmit={handleSubmit}
        >
          <div className="course-form-grid">
            <label>
              <span>{c.studentName} *</span>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) =>
                  updateField(
                    "studentName",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>{c.parentName} *</span>
              <input
                type="text"
                value={form.parentName}
                onChange={(e) =>
                  updateField(
                    "parentName",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>{c.grade} *</span>
              <input
                type="text"
                value={form.grade}
                onChange={(e) =>
                  updateField(
                    "grade",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>{c.phone} *</span>
              <input
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
                required
              />
            </label>

            <label>
              <span>{c.course} *</span>
              <select
                value={form.courseId}
                onChange={(e) =>
                  updateField(
                    "courseId",
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  {c.chooseCourse}
                </option>

                {c.courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{c.preferredTime} *</span>
              <input
                type="text"
                value={form.preferredTime}
                onChange={(e) =>
                  updateField(
                    "preferredTime",
                    e.target.value
                  )
                }
                required
              />
            </label>
          </div>

          <label className="course-form-notes">
            <span>{c.notes}</span>
            <textarea
              rows="4"
              value={form.notes}
              onChange={(e) =>
                updateField(
                  "notes",
                  e.target.value
                )
              }
            />
          </label>

          {message && (
            <div
              className={`course-form-message ${
                status === "success"
                  ? "success"
                  : "error"
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="course-submit-btn"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? c.sending
              : c.submit}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="course-whatsapp-contact"
          >
            <span aria-hidden="true">💬</span>
            {c.whatsapp}
          </a>
        </form>
      </section>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="courses-whatsapp-floating"
        aria-label={c.whatsapp}
        title={c.whatsapp}
      >
        <span aria-hidden="true">💬</span>
      </a>

      <footer className="courses-footer">
        <strong>TechMinds</strong>
        <span>{c.footer}</span>
      </footer>
    </main>
  );
}

export default Courses;
