import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { requestProgramAccess, subscribeProgramContent } from "../access/programAccessClient";
import { useAccessText, whatsappAccessLink } from "../access/accessText";
import "./ProgramAccess.css";
import { countProgramContent, programContentType } from "../../functions/programContent.mjs";

export default function ProgramAccess() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { t, loc, language, dir, setLanguage } = useAccessText();

  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({});
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setData(null);
    setError(false);

    const stops = [
      subscribeProgramContent(
        programId,
        (result) => {
          setData(result);
          if (result.fullAccess) navigate(`/programs/${programId}`, { replace: true });
        },
        () => setError(true)
      ),
    ];

    let active = true;

    auth.authStateReady().then(() => {
      if (!active || !auth.currentUser) return;
      const uid = auth.currentUser.uid;

      stops.push(
        onSnapshot(
          doc(db, "users", uid),
          (snap) => setProfile(snap.data() || null),
          () => setError(true)
        )
      );

      stops.push(
        onSnapshot(
          doc(db, "accessRequests", `${uid}_${programId}`),
          (snap) => setRequest(snap.exists() ? snap.data() : null),
          () => setError(true)
        )
      );

      stops.push(
        onSnapshot(
          doc(db, "platformSettings", "public"),
          (snap) => setSettings(snap.data() || {}),
          () => setSettings({})
        )
      );
    });

    return () => {
      active = false;
      stops.forEach((stop) => stop());
    };
  }, [programId, navigate]);

  async function sendRequest() {
    setBusy(true);
    setError(false);
    try {
      const result = await requestProgramAccess({ programId });
      setRequest(result.data);
    } catch (failure) {
      console.error("Access request failed", failure.code, failure.message);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  const program = data?.program;
  const title = loc(program?.title);

  const whatsappNumber =
    settings.whatsapp ||
    settings.supportPhone ||
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    "";

  const whatsapp = whatsappAccessLink(whatsappNumber, {
    name: profile?.name || profile?.displayName || profile?.username || "",
    email:
      profile?.email ||
      profile?.authEmail ||
      auth.currentUser?.email ||
      t("No email", "بدون بريد إلكتروني", "ללא אימייל"),
    programName: title,
    language,
  });

  const outcomes =
    program?.learningOutcomes?.[language] ||
    program?.learningOutcomes?.en ||
    [];

  const counts = countProgramContent(data?.lessons || []);
  const lockedLessons =
    data?.lessons?.filter(
      (lesson) => lesson.locked && programContentType(lesson) === "lesson"
    ).length || 0;
  const previewCount =
    data?.lessons?.filter((lesson) => lesson.preview).length || 0;

  const pending = request?.status === "pending";
  const approved = request?.status === "approved";

  return (
    <main className="access-page" dir={dir}>
      <header className="access-header">
        <Link to={`/programs/${programId}`}>
          ← {t("Program overview", "نظرة عامة على البرنامج", "סקירת התוכנית")}
        </Link>

        <select
          aria-label={t("Language", "اللغة", "שפה")}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="he">עברית</option>
        </select>
      </header>

      {error && (
        <p className="access-error" role="alert">
          {t(
            "Could not load or submit access details. Please retry.",
            "تعذر تحميل أو إرسال تفاصيل الوصول. حاول مجددًا.",
            "לא ניתן לטעון או לשלוח את פרטי הגישה. נסו שוב."
          )}
        </p>
      )}

      {!data ? (
        <p role="status">{t("Loading…", "جارٍ التحميل…", "טוען…")}</p>
      ) : (
        <section className="access-card access-hero">
          <span className="access-emblem" aria-hidden="true">🔓</span>

          <p className="access-eyebrow">
            {t("TRY IT FREE — CONTINUE WHEN YOU’RE READY", "✨ جرّب مجانًا، وكمل لما تكون جاهز", "✨ נסו בחינם והמשיכו כשתהיו מוכנים")}
          </p>

          <h1>{title}</h1>

          <p className="access-intro">
            {t(
              "Start with the free content and experience the learning style yourself. If you like the program, send an access request or message us on WhatsApp for pricing and registration.",
              "ابدأ بالمحتوى المجاني وشوف أسلوب التعلّم بنفسك. إذا أعجبك البرنامج، أرسل طلب فتح أو تواصل معنا عبر واتساب لمعرفة السعر والتسجيل.",
              "התחילו בתוכן החינמי והכירו את סגנון הלמידה. אם אהבתם את התוכנית, שלחו בקשת גישה או פנו אלינו בוואטסאפ לקבלת מחיר והרשמה."
            )}
          </p>

          {program?.description && <p>{loc(program.description)}</p>}

          <div className="access-stats-grid">
            <div className="access-stat">
              <strong>{counts.lesson}</strong>
              <span>{t("Lessons", "دروس", "שיעורים")}</span>
            </div>
            <div className="access-stat">
              <strong>{counts.mission}</strong>
              <span>{t("Missions", "مهمات", "משימות")}</span>
            </div>
            <div className="access-stat">
              <strong>{previewCount}</strong>
              <span>{t("Free previews", "معاينات مجانية", "תכנים חינמיים")}</span>
            </div>
          </div>

          {lockedLessons > 0 && (
            <p className="access-notice">
              {t(
                `${lockedLessons} lessons will unlock after your registration is approved.`,
                `${lockedLessons} دروس سيتم فتحها بعد تأكيد التسجيل.`,
                `${lockedLessons} שיעורים ייפתחו לאחר אישור ההרשמה.`
              )}
            </p>
          )}

          <h2>{t("What you’ll gain 🚀", "شو رح تستفيد من البرنامج؟ 🚀", "מה תרוויחו מהתוכנית? 🚀")}</h2>
          <p>
            {t(
              "Full access to lessons, missions, and interactive challenges, with clear progress and a flexible learning pace.",
              "وصول كامل للدروس، المهمات والتحديات التفاعلية، مع تقدّم واضح وتجربة تعلّم ممتعة بالوتيرة التي تناسبك.",
              "גישה מלאה לשיעורים, משימות ואתגרים אינטראקטיביים, עם התקדמות ברורה וקצב למידה גמיש."
            )}
          </p>

          <h2>{t("Learning outcomes", "مخرجات التعلم", "תוצאות הלמידה")}</h2>
          <ul>
            {(Array.isArray(outcomes) && outcomes.length
              ? outcomes
              : [loc(program?.finalProject) || loc(program?.description)]
            )
              .filter(Boolean)
              .map((outcome, i) => <li key={i}>{loc(outcome)}</li>)}
          </ul>

          {request && (
            <p role="status" className="access-notice">
              {request.status === "pending"
                ? t(
                    "Your request is pending. We’ll unlock the program here once approved.",
                    "طلبك قيد المراجعة. سيتم فتح البرنامج لحسابك فور الموافقة.",
                    "הבקשה שלכם ממתינה לאישור. התוכנית תיפתח לאחר האישור."
                  )
                : request.status === "approved"
                ? t(
                    "Your request was approved. If access has expired or was revoked, contact us.",
                    "تمت الموافقة على طلبك. إذا انتهى الوصول أو أُلغي، تواصل معنا.",
                    "בקשתכם אושרה. אם הגישה פגה או בוטלה, צרו קשר."
                  )
                : t(
                    "Your request was declined. Contact us to discuss access.",
                    "تم رفض الطلب. تواصل معنا للاستفسار.",
                    "הבקשה נדחתה. צרו קשר לבירור."
                  )}
            </p>
          )}

          <div className="access-actions access-actions-main">
            <button
              className="access-primary"
              onClick={sendRequest}
              disabled={busy || pending || approved}
            >
              {busy
                ? t("Sending…", "جارٍ الإرسال…", "שולח…")
                : pending
                ? t("Request pending", "الطلب قيد المراجعة", "הבקשה ממתינה")
                : approved
                ? t("Access approved", "تمت الموافقة", "הגישה אושרה")
                : t(
                    "🚀 Request program access",
                    "🚀 اطلب فتح البرنامج الآن",
                    "🚀 בקשו לפתוח את התוכנית"
                  )}
            </button>

            {whatsapp ? (
              <a
                className="access-whatsapp"
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                {t(
                  "💬 Ask about pricing on WhatsApp",
                  "💬 اسأل عن السعر عبر واتساب",
                  "💬 שאלו על המחיר בוואטסאפ"
                )}
              </a>
            ) : (
              <span className="access-contact-missing">
                {t(
                  "WhatsApp contact is not configured yet.",
                  "رقم واتساب للتواصل غير مُعدّ بعد.",
                  "מספר הוואטסאפ עדיין לא הוגדר."
                )}
              </span>
            )}

            {previewCount > 0 && (
              <Link className="access-preview-link" to={`/programs/${programId}`}>
                {t(
                  "🎁 Start with the free lesson",
                  "🎁 ابدأ بالدرس المجاني",
                  "🎁 התחילו בשיעור החינמי"
                )}
              </Link>
            )}
          </div>

          <p className="access-footnote">
            {t(
              "Ready to continue? Once registration is confirmed, we’ll unlock the program directly on this account so you can start right away.",
              "جاهز تكمل؟ بعد تأكيد التسجيل، بنفتح البرنامج مباشرة على نفس حسابك وبتقدر تبدأ فورًا.",
              "מוכנים להמשיך? לאחר אישור ההרשמה נפתח את התוכנית ישירות בחשבון הזה ותוכלו להתחיל מיד."
            )}
          </p>
        </section>
      )}
    </main>
  );
}
