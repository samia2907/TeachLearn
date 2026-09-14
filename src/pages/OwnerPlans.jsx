import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebase";
import { functions } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";
import { httpsCallable } from "firebase/functions";

import "./OwnerPlans.css";

const DEFAULT_PLANS = [
  {
    id: "free",
    audience: "student",
    icon: "🌱",
    order: 1,
    active: true,
    recommended: false,
    customPrice: false,
    requiresTrack: true,
    monthlyPrice: 0,
    yearlyPrice: 0,

    name: {
      en: "Free",
      ar: "مجاني",
      he: "חינם",
    },

    description: {
      en: "Explore TeachLearn before choosing a complete program.",
      ar: "جرّب TeachLearn قبل الاشتراك ببرنامج كامل.",
      he: "התנסו ב-TeachLearn לפני בחירת תוכנית מלאה.",
    },

    features: {
      en: [
        "Level assessment",
        "Starter activities",
        "Limited challenges",
        "Basic student profile",
      ],
      ar: [
        "تقييم مستوى",
        "أنشطة تجريبية",
        "تحديات محدودة",
        "ملف طالب أساسي",
      ],
      he: [
        "הערכת רמה",
        "פעילויות התחלתיות",
        "אתגרים מוגבלים",
        "פרופיל תלמיד בסיסי",
      ],
    },
  },

  {
    id: "oneProgram",
    audience: "student",
    icon: "⭐",
    order: 2,
    active: true,
    recommended: false,
    customPrice: false,
    requiresTrack: true,
    monthlyPrice: 29,
    yearlyPrice: 290,

    name: {
      en: "One Program",
      ar: "برنامج واحد",
      he: "תוכנית אחת",
    },

    description: {
      en: "Full access to one learning program.",
      ar: "وصول كامل إلى برنامج تعليمي واحد.",
      he: "גישה מלאה לתוכנית לימודים אחת.",
    },

    features: {
      en: [
        "One full learning program",
        "All program challenges",
        "XP & badges",
        "Projects",
        "Progress tracking",
      ],
      ar: [
        "برنامج تعليمي كامل",
        "جميع تحديات البرنامج",
        "XP وشارات",
        "مشاريع",
        "متابعة التقدم",
      ],
      he: [
        "תוכנית לימודים מלאה",
        "כל אתגרי התוכנית",
        "XP ותגים",
        "פרויקטים",
        "מעקב התקדמות",
      ],
    },
  },

  {
    id: "allAccess",
    audience: "student",
    icon: "🚀",
    order: 3,
    active: true,
    recommended: true,
    customPrice: false,
    requiresTrack: false,
    monthlyPrice: 49,
    yearlyPrice: 490,

    name: {
      en: "All Access",
      ar: "الوصول الكامل",
      he: "גישה מלאה",
    },

    description: {
      en: "Unlock all learning programs.",
      ar: "افتح جميع البرامج التعليمية.",
      he: "פתחו את כל תוכניות הלמידה.",
    },

    features: {
      en: [
        "All learning programs",
        "All challenges",
        "AI activities",
        "Advanced projects",
        "XP, levels & badges",
        "Student portfolio",
      ],
      ar: [
        "جميع البرامج التعليمية",
        "جميع التحديات",
        "أنشطة الذكاء الاصطناعي",
        "مشاريع متقدمة",
        "XP ومستويات وشارات",
        "ملف إنجاز للطالب",
      ],
      he: [
        "כל תוכניות הלמידה",
        "כל האתגרים",
        "פעילויות AI",
        "פרויקטים מתקדמים",
        "XP, רמות ותגים",
        "תיק עבודות לתלמיד",
      ],
    },
  },

  {
    id: "family",
    audience: "student",
    icon: "👨‍👩‍👧",
    order: 4,
    active: true,
    recommended: false,
    customPrice: false,
    requiresTrack: false,
    monthlyPrice: 69,
    yearlyPrice: 690,

    name: {
      en: "Family",
      ar: "العائلة",
      he: "משפחה",
    },

    description: {
      en: "Learning accounts for more than one child.",
      ar: "حسابات تعليمية لأكثر من طفل في العائلة.",
      he: "חשבונות לימוד למספר ילדים במשפחה.",
    },

    features: {
      en: [
        "Multiple children",
        "Individual progress",
        "Different programs per child",
        "Parent progress overview",
        "All Access programs",
      ],
      ar: [
        "أكثر من طفل",
        "تقدم منفصل لكل طفل",
        "برنامج مختلف لكل طفل",
        "متابعة للأهل",
        "الوصول لجميع البرامج",
      ],
      he: [
        "מספר ילדים",
        "התקדמות אישית",
        "תוכנית שונה לכל ילד",
        "מעקב התקדמות להורים",
        "גישה לכל התוכניות",
      ],
    },
  },

  {
    id: "teacherBasic",
    audience: "teacher",
    icon: "👩‍🏫",
    order: 1,
    active: true,
    recommended: false,
    customPrice: false,
    requiresTrack: false,
    studentLimit: 15,
    monthlyPrice: 39,
    yearlyPrice: 390,

    name: {
      en: "Teacher Basic",
      ar: "المعلّم الأساسي",
      he: "מורה Basic",
    },

    description: {
      en: "Perfect for small groups and private teaching.",
      ar: "مناسب للمجموعات الصغيرة والتعليم الخاص.",
      he: "מתאים לקבוצות קטנות ולהוראה פרטית.",
    },

    features: {
      en: [
        "Up to 15 students",
        "Create classes",
        "Assign activities",
        "Attendance",
        "Student progress",
      ],
      ar: [
        "حتى 15 طالبًا",
        "إنشاء صفوف",
        "إرسال فعاليات",
        "الحضور",
        "متابعة تقدم الطلاب",
      ],
      he: [
        "עד 15 תלמידים",
        "יצירת כיתות",
        "הקצאת פעילויות",
        "נוכחות",
        "מעקב התקדמות",
      ],
    },
  },

  {
    id: "teacherPro",
    audience: "teacher",
    icon: "⭐",
    order: 2,
    active: true,
    recommended: true,
    customPrice: false,
    requiresTrack: false,
    studentLimit: 50,
    monthlyPrice: 79,
    yearlyPrice: 790,

    name: {
      en: "Teacher Pro",
      ar: "المعلّم الاحترافي",
      he: "מורה Pro",
    },

    description: {
      en: "Everything a teacher needs to manage learning.",
      ar: "كل ما يحتاجه المعلّم لإدارة التعلّم.",
      he: "כל מה שמורה צריך לניהול הלמידה.",
    },

    features: {
      en: [
        "Up to 50 students",
        "Multiple classes",
        "Attendance",
        "Lessons and challenges",
        "Reports",
        "Student projects",
        "Progress analytics",
      ],
      ar: [
        "حتى 50 طالبًا",
        "عدة صفوف",
        "الحضور",
        "الدروس والتحديات",
        "التقارير",
        "مشاريع الطلاب",
        "تحليل التقدم",
      ],
      he: [
        "עד 50 תלמידים",
        "מספר כיתות",
        "נוכחות",
        "שיעורים ואתגרים",
        "דוחות",
        "פרויקטים של תלמידים",
        "ניתוח התקדמות",
      ],
    },
  },

  {
    id: "school",
    audience: "teacher",
    icon: "🏫",
    order: 3,
    active: true,
    recommended: false,
    customPrice: true,
    requiresTrack: false,
    studentLimit: null,
    monthlyPrice: null,
    yearlyPrice: null,

    name: {
      en: "School",
      ar: "المدرسة",
      he: "בית ספר",
    },

    description: {
      en: "For schools, gifted centers and educational organizations.",
      ar: "للمدارس، مراكز الموهوبين والمؤسسات التعليمية.",
      he: "לבתי ספר, מרכזי מחוננים וארגוני חינוך.",
    },

    features: {
      en: [
        "Multiple teachers",
        "Multiple classes",
        "School administration",
        "Central reports",
        "Custom student limits",
        "Organization dashboard",
      ],
      ar: [
        "عدة معلمين",
        "عدة صفوف",
        "إدارة المدرسة",
        "تقارير مركزية",
        "عدد طلاب مخصص",
        "لوحة إدارة للمؤسسة",
      ],
      he: [
        "מספר מורים",
        "מספר כיתות",
        "ניהול בית ספר",
        "דוחות מרכזיים",
        "מגבלת תלמידים מותאמת",
        "לוח ניהול לארגון",
      ],
    },
  },
];

const EMPTY_FORM = {
  audience: "teacher",
  icon: "⭐",
  order: 1,
  active: true,
  recommended: false,
  customPrice: false,
  requiresTrack: false,
  programIds: [],

  monthlyPrice: "",
  yearlyPrice: "",
  studentLimit: "",

  nameEn: "",
  nameAr: "",
  nameHe: "",

  descriptionEn: "",
  descriptionAr: "",
  descriptionHe: "",

  featuresEn: "",
  featuresAr: "",
  featuresHe: "",
};

function OwnerPlans() {
  const navigate = useNavigate();

  const {
    language,
    changeLanguage,
  } = useLanguage();

  const [owner, setOwner] =
    useState(null);

  const [plans, setPlans] =
    useState([]);

  const [programs, setPrograms] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [translating, setTranslating] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showEditor, setShowEditor] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const text = (
    en,
    ar,
    he
  ) => {
    if (language === "ar") return ar;
    if (language === "he") return he;

    return en;
  };

  const translatePlan = async () => {
    if (!form.nameEn.trim() && !form.descriptionEn.trim() && !form.featuresEn.trim()) {
      setError(text("Enter English plan content first.", "أدخل محتوى الخطة بالإنجليزية أولًا.", "יש להזין תחילה תוכן באנגלית."));
      return;
    }

    setTranslating(true);
    setError("");
    try {
      const callable = httpsCallable(functions, "translatePlan");
      const result = await callable({
        name: form.nameEn,
        description: form.descriptionEn,
        features: form.featuresEn,
      });
      const { arabic, hebrew } = result.data;
      setForm((current) => ({
        ...current,
        nameAr: arabic.name,
        descriptionAr: arabic.description,
        featuresAr: arabic.features,
        nameHe: hebrew.name,
        descriptionHe: hebrew.description,
        featuresHe: hebrew.features,
      }));
      setSuccess(text("Arabic and Hebrew translations generated.", "تم إنشاء الترجمة العربية والعبرية.", "נוצרו תרגומים לערבית ולעברית."));
    } catch (translationError) {
      console.error("Plan translation error:", translationError);
      setError(text("Could not translate the plan.", "تعذر ترجمة الخطة.", "לא ניתן לתרגם את התוכנית."));
    } finally {
      setTranslating(false);
    }
  };

  const isRTL =
    language === "ar" ||
    language === "he";

  /* =========================
     CHECK OWNER
  ========================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            navigate("/login");
            return;
          }

          try {
            const snapshot =
              await getDoc(
                doc(
                  db,
                  "users",
                  user.uid
                )
              );

            if (
              !snapshot.exists() ||
              snapshot.data().role !==
                "owner"
            ) {
              navigate("/");
              return;
            }

            setOwner({
              uid: user.uid,
              ...snapshot.data(),
            });
          } catch (err) {
            console.error(
              "Owner load error:",
              err
            );

            setError(
              "Could not load owner account."
            );
          }
        }
      );

    return unsubscribe;
  }, [navigate]);

  /* =========================
     LOAD PLANS
  ========================= */

  useEffect(() => {
    if (!owner) return undefined;

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "plans"
        ),
        (snapshot) => {
          const list =
            snapshot.docs
              .map((item) => ({
                id: item.id,
                ...item.data(),
              }))
              .sort(
                (a, b) =>
                  (a.audience || "")
                    .localeCompare(
                      b.audience || ""
                    ) ||
                  Number(a.order || 0) -
                    Number(b.order || 0)
              );

          setPlans(list);
          setLoading(false);
        },
        (err) => {
          console.error(
            "Plans load error:",
            err
          );

          // Keep the management screen usable if the catalog read is unavailable.
          setPlans(DEFAULT_PLANS);
          setError("");

          setLoading(false);
        }
      );

    return unsubscribe;
  }, [owner]);

  useEffect(() => {
    if (!owner) return undefined;

    const unsubscribe = onSnapshot(
      collection(db, "programs"),
      (snapshot) => {
        setPrograms(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (err) => {
        console.error("Programs load error:", err);
        setPrograms([]);
      }
    );

    return unsubscribe;
  }, [owner]);

  /* =========================
     INITIALIZE DEFAULT PLANS
  ========================= */

  const createDefaultPlans =
    async () => {
      try {
        setSaving(true);
        setError("");
        setSuccess("");

        const batch =
          writeBatch(db);

        DEFAULT_PLANS.forEach(
          (plan) => {
            batch.set(
              doc(
                db,
                "plans",
                plan.id
              ),
              {
                ...plan,
                createdAt:
                  serverTimestamp(),
                updatedAt:
                  serverTimestamp(),
              }
            );
          }
        );

        await batch.commit();

        setSuccess(
          text(
            "Default plans created successfully.",
            "تم إنشاء الخطط الأساسية بنجاح.",
            "תוכניות ברירת המחדל נוצרו בהצלחה."
          )
        );
      } catch (err) {
        console.error(
          "Create defaults error:",
          err
        );

        setError(
          text(
            "Could not create plans.",
            "تعذر إنشاء الخطط.",
            "לא ניתן ליצור את התוכניות."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================
     FORM HELPERS
  ========================= */

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const featuresToText = (
    features
  ) => {
    return Array.isArray(features)
      ? features.join("\n")
      : "";
  };

  const textToFeatures = (
    value
  ) => {
    return value
      .split("\n")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  };

  const startNewPlan = (
    audience
  ) => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      audience,
    });

    setShowEditor(true);
    setError("");
    setSuccess("");
  };

  const startEditPlan = (
    plan
  ) => {
    setEditingId(plan.id);

    setForm({
      audience:
        plan.audience ||
        "teacher",

      icon:
        plan.icon || "⭐",

      order:
        plan.order || 1,

      active:
        plan.active !== false,

      recommended:
        Boolean(
          plan.recommended
        ),

      customPrice:
        Boolean(
          plan.customPrice
        ),

      requiresTrack:
        Boolean(
          plan.requiresTrack
        ),

      programIds:
        Array.isArray(plan.programIds)
          ? plan.programIds
          : [],

      monthlyPrice:
        plan.monthlyPrice ??
        "",

      yearlyPrice:
        plan.yearlyPrice ??
        "",

      studentLimit:
        plan.studentLimit ??
        "",

      nameEn:
        plan.name?.en ||
        "",

      nameAr:
        plan.name?.ar ||
        "",

      nameHe:
        plan.name?.he ||
        "",

      descriptionEn:
        plan.description?.en ||
        "",

      descriptionAr:
        plan.description?.ar ||
        "",

      descriptionHe:
        plan.description?.he ||
        "",

      featuresEn:
        featuresToText(
          plan.features?.en
        ),

      featuresAr:
        featuresToText(
          plan.features?.ar
        ),

      featuresHe:
        featuresToText(
          plan.features?.he
        ),
    });

    setShowEditor(true);
    setError("");
    setSuccess("");
  };

  /* =========================
     SAVE PLAN
  ========================= */

  const savePlan =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.nameEn.trim() ||
        !form.nameAr.trim() ||
        !form.nameHe.trim()
      ) {
        setError(
          text(
            "Enter the plan name in all three languages.",
            "أدخل اسم الخطة باللغات الثلاث.",
            "יש להזין את שם התוכנית בכל שלוש השפות."
          )
        );

        return;
      }

      if (
        !form.customPrice &&
        (form.monthlyPrice === "" ||
          form.yearlyPrice === "")
      ) {
        setError(
          text(
            "Enter monthly and yearly prices.",
            "أدخل السعر الشهري والسنوي.",
            "יש להזין מחיר חודשי ושנתי."
          )
        );

        return;
      }

      try {
        setSaving(true);

        const planRef =
          editingId
            ? doc(
                db,
                "plans",
                editingId
              )
            : doc(
                collection(
                  db,
                  "plans"
                )
              );

        const planData = {
          audience:
            form.audience,

          icon:
            form.icon.trim() ||
            "⭐",

          order:
            Number(
              form.order || 1
            ),

          active:
            form.active,

          recommended:
            form.recommended,

          customPrice:
            form.customPrice,

          requiresTrack:
            form.requiresTrack,

          programIds:
            Array.isArray(form.programIds)
              ? form.programIds
              : [],

          monthlyPrice:
            form.customPrice
              ? null
              : Number(
                  form.monthlyPrice
                ),

          yearlyPrice:
            form.customPrice
              ? null
              : Number(
                  form.yearlyPrice
                ),

          studentLimit:
            form.studentLimit === ""
              ? null
              : Number(
                  form.studentLimit
                ),

          name: {
            en:
              form.nameEn.trim(),

            ar:
              form.nameAr.trim(),

            he:
              form.nameHe.trim(),
          },

          description: {
            en:
              form.descriptionEn.trim(),

            ar:
              form.descriptionAr.trim(),

            he:
              form.descriptionHe.trim(),
          },

          features: {
            en:
              textToFeatures(
                form.featuresEn
              ),

            ar:
              textToFeatures(
                form.featuresAr
              ),

            he:
              textToFeatures(
                form.featuresHe
              ),
          },

          updatedAt:
            serverTimestamp(),
        };

        if (!editingId) {
          planData.createdAt =
            serverTimestamp();
        }

        await setDoc(
          planRef,
          planData,
          {
            merge: true,
          }
        );

        setSuccess(
          text(
            "Plan saved successfully.",
            "تم حفظ الخطة بنجاح.",
            "התוכנית נשמרה בהצלחה."
          )
        );

        setShowEditor(false);
        setEditingId(null);
      } catch (err) {
        console.error(
          "Save plan error:",
          err
        );

        setError(
          text(
            "Could not save the plan.",
            "تعذر حفظ الخطة.",
            "לא ניתן לשמור את התוכנית."
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* =========================
     ACTIVATE / DEACTIVATE
  ========================= */

  const toggleActive =
    async (plan) => {
      try {
        await updateDoc(
          doc(
            db,
            "plans",
            plan.id
          ),
          {
            active:
              plan.active === false,

            updatedAt:
              serverTimestamp(),
          }
        );
      } catch (err) {
        console.error(
          "Toggle plan error:",
          err
        );

        setError(
          text(
            "Could not update plan status.",
            "تعذر تغيير حالة الخطة.",
            "לא ניתן לעדכן את מצב התוכנית."
          )
        );
      }
    };

  if (loading && !owner) {
    return (
      <div className="owner-plans-loading">
        🚀 Loading...
      </div>
    );
  }

  return (
    <div
      className="owner-plans-page"
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
    >
      <header className="owner-plans-header">
        <div>
          <button
            type="button"
            className="owner-back-button"
            onClick={() =>
              navigate("/owner")
            }
          >
            {text(
              "← Owner Dashboard",
              "↩ لوحة المالك",
              "↩ לוח מנהל"
            )}
          </button>

          <h1>
            💳{" "}
            {text(
              "Plans Management",
              "إدارة الخطط والأسعار",
              "ניהול תוכניות ומחירים"
            )}
          </h1>

          <p>
            {text(
              "Edit prices and plan features without changing your code.",
              "غيّري الأسعار ومميزات الخطط بدون تعديل الكود.",
              "ערכו מחירים ותכונות ללא שינוי בקוד."
            )}
          </p>
        </div>

        <div className="owner-plan-languages">
          <button
            className={
              language === "en"
                ? "active"
                : ""
            }
            onClick={() =>
              changeLanguage("en")
            }
          >
            EN
          </button>

          <button
            className={
              language === "ar"
                ? "active"
                : ""
            }
            onClick={() =>
              changeLanguage("ar")
            }
          >
            عربي
          </button>

          <button
            className={
              language === "he"
                ? "active"
                : ""
            }
            onClick={() =>
              changeLanguage("he")
            }
          >
            עברית
          </button>
        </div>
      </header>

      {error && (
        <div className="owner-plan-error">
          {error}
        </div>
      )}

      {success && (
        <div className="owner-plan-success">
          {success}
        </div>
      )}

      {plans.length === 0 && (
        <div className="initialize-plans">
          <h2>
            {text(
              "No plans exist yet",
              "لا توجد خطط بعد",
              "עדיין אין תוכניות"
            )}
          </h2>

          <p>
            {text(
              "Create the current TeachLearn plans in Firestore.",
              "أنشئي خطط TeachLearn الحالية داخل Firestore.",
              "צרו את תוכניות TeachLearn ב-Firestore."
            )}
          </p>

          <button
            type="button"
            disabled={saving}
            onClick={
              createDefaultPlans
            }
          >
            {saving
              ? text(
                  "Creating...",
                  "جارٍ الإنشاء...",
                  "יוצר..."
                )
              : text(
                  "Create Default Plans",
                  "إنشاء الخطط الأساسية",
                  "יצירת תוכניות ברירת מחדל"
                )}
          </button>
        </div>
      )}

      {plans.length > 0 && (
        <>
          <section className="owner-plans-toolbar">
            <button
              type="button"
              onClick={() =>
                startNewPlan(
                  "teacher"
                )
              }
            >
              +{" "}
              {text(
                "Teacher Plan",
                "خطة معلّم",
                "תוכנית מורה"
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                startNewPlan(
                  "student"
                )
              }
            >
              +{" "}
              {text(
                "Student Plan",
                "خطة طالب",
                "תוכנית תלמיד"
              )}
            </button>
          </section>

          <h2 className="owner-section-title">
            👩‍🏫{" "}
            {text(
              "Teacher Plans",
              "خطط المعلمين",
              "תוכניות מורים"
            )}
          </h2>

          <div className="owner-plans-grid">
            {plans
              .filter(
                (plan) =>
                  plan.audience ===
                  "teacher"
              )
              .map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  text={text}
                  onEdit={
                    startEditPlan
                  }
                  onToggle={
                    toggleActive
                  }
                />
              ))}
          </div>

          <h2 className="owner-section-title">
            🎓{" "}
            {text(
              "Student Plans",
              "خطط الطلاب",
              "תוכניות תלמידים"
            )}
          </h2>

          <div className="owner-plans-grid">
            {plans
              .filter(
                (plan) =>
                  plan.audience ===
                  "student"
              )
              .map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  language={language}
                  text={text}
                  onEdit={
                    startEditPlan
                  }
                  onToggle={
                    toggleActive
                  }
                />
              ))}
          </div>
        </>
      )}

      {showEditor && (
        <div className="plan-editor-overlay">
          <div className="plan-editor">
            <div className="plan-editor-header">
              <h2>
                {editingId
                  ? text(
                      "Edit Plan",
                      "تعديل الخطة",
                      "עריכת תוכנית"
                    )
                  : text(
                      "Add Plan",
                      "إضافة خطة",
                      "הוספת תוכנית"
                    )}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowEditor(false)
                }
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                savePlan
              }
            >
              <div className="owner-form-grid">
                <label>
                  {text(
                    "Type",
                    "النوع",
                    "סוג"
                  )}

                  <select
                    value={
                      form.audience
                    }
                    onChange={(e) =>
                      updateField(
                        "audience",
                        e.target.value
                      )
                    }
                  >
                    <option value="teacher">
                      Teacher
                    </option>

                    <option value="student">
                      Student
                    </option>
                  </select>
                </label>

                <label>
                  Icon

                  <input
                    value={
                      form.icon
                    }
                    onChange={(e) =>
                      updateField(
                        "icon",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  {text(
                    "Display Order",
                    "ترتيب الظهور",
                    "סדר תצוגה"
                  )}

                  <input
                    type="number"
                    min="1"
                    value={
                      form.order
                    }
                    onChange={(e) =>
                      updateField(
                        "order",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  {text(
                    "Student Limit",
                    "حد الطلاب",
                    "מגבלת תלמידים"
                  )}

                  <input
                    type="number"
                    min="0"
                    value={
                      form.studentLimit
                    }
                    onChange={(e) =>
                      updateField(
                        "studentLimit",
                        e.target.value
                      )
                    }
                    placeholder="50"
                  />
                </label>
              </div>

              <h3>English</h3>

              <input
                placeholder="Plan name"
                value={
                  form.nameEn
                }
                onChange={(e) =>
                  updateField(
                    "nameEn",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="Description"
                value={
                  form.descriptionEn
                }
                onChange={(e) =>
                  updateField(
                    "descriptionEn",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="One feature per line"
                value={
                  form.featuresEn
                }
                onChange={(e) =>
                  updateField(
                    "featuresEn",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="translate-plan-button"
                onClick={translatePlan}
                disabled={translating}
              >
                {translating
                  ? "Translating..."
                  : "Translate to Arabic and Hebrew"}
              </button>

              <h3>العربية</h3>

              <input
                placeholder="اسم الخطة"
                value={
                  form.nameAr
                }
                onChange={(e) =>
                  updateField(
                    "nameAr",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="الوصف"
                value={
                  form.descriptionAr
                }
                onChange={(e) =>
                  updateField(
                    "descriptionAr",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="ميزة واحدة في كل سطر"
                value={
                  form.featuresAr
                }
                onChange={(e) =>
                  updateField(
                    "featuresAr",
                    e.target.value
                  )
                }
              />

              <h3>עברית</h3>

              <input
                placeholder="שם התוכנית"
                value={
                  form.nameHe
                }
                onChange={(e) =>
                  updateField(
                    "nameHe",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="תיאור"
                value={
                  form.descriptionHe
                }
                onChange={(e) =>
                  updateField(
                    "descriptionHe",
                    e.target.value
                  )
                }
              />

              <textarea
                placeholder="תכונה אחת בכל שורה"
                value={
                  form.featuresHe
                }
                onChange={(e) =>
                  updateField(
                    "featuresHe",
                    e.target.value
                  )
                }
              />

              <div className="owner-form-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.customPrice
                    }
                    onChange={(e) =>
                      updateField(
                        "customPrice",
                        e.target.checked
                      )
                    }
                  />

                  {text(
                    "Custom price",
                    "سعر حسب الطلب",
                    "מחיר מותאם"
                  )}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.recommended
                    }
                    onChange={(e) =>
                      updateField(
                        "recommended",
                        e.target.checked
                      )
                    }
                  />

                  {text(
                    "Most Popular",
                    "الأكثر اختيارًا",
                    "הפופולרית ביותר"
                  )}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.requiresTrack
                    }
                    onChange={(e) =>
                      updateField(
                        "requiresTrack",
                        e.target.checked
                      )
                    }
                  />

                  {text(
                    "Requires program selection",
                    "يتطلب اختيار برنامج",
                    "דורש בחירת תוכנית לימודים"
                  )}
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      form.active
                    }
                    onChange={(e) =>
                      updateField(
                        "active",
                        e.target.checked
                      )
                    }
                  />

                  {text(
                    "Visible",
                    "ظاهرة",
                    "מוצגת"
                  )}
                </label>
              </div>

              <fieldset className="plan-program-access">
                <legend>
                  {text(
                    "Programs included in this plan",
                    "البرامج المشمولة في هذه الخطة",
                    "התוכניות הכלולות בתוכנית זו"
                  )}
                </legend>

                {programs.length === 0 ? (
                  <p>
                    {text(
                      "No programs available yet.",
                      "لا توجد برامج متاحة بعد.",
                      "עדיין אין תוכניות זמינות."
                    )}
                  </p>
                ) : (
                  programs.map((program) => {
                    const programTitle =
                      typeof program.title === "object"
                        ? program.title[language] || program.title.en || program.id
                        : program.title || program.id;

                    return (
                      <label key={program.id}>
                        <input
                          type="checkbox"
                          checked={form.programIds.includes(program.id)}
                          onChange={(event) => {
                            const nextIds = event.target.checked
                              ? [...form.programIds, program.id]
                              : form.programIds.filter((id) => id !== program.id);
                            updateField("programIds", nextIds);
                          }}
                        />
                        {program.icon || "🚀"} {programTitle}
                      </label>
                    );
                  })
                )}
              </fieldset>

              {!form.customPrice && (
                <div className="owner-form-grid">
                  <label>
                    {text(
                      "Monthly Price ₪",
                      "السعر الشهري ₪",
                      "מחיר חודשי ₪"
                    )}

                    <input
                      type="number"
                      min="0"
                      value={
                        form.monthlyPrice
                      }
                      onChange={(e) =>
                        updateField(
                          "monthlyPrice",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    {text(
                      "Yearly Price ₪",
                      "السعر السنوي ₪",
                      "מחיר שנתי ₪"
                    )}

                    <input
                      type="number"
                      min="0"
                      value={
                        form.yearlyPrice
                      }
                      onChange={(e) =>
                        updateField(
                          "yearlyPrice",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="save-owner-plan"
                disabled={saving}
              >
                {saving
                  ? text(
                      "Saving...",
                      "جارٍ الحفظ...",
                      "שומר..."
                    )
                  : text(
                      "Save Plan",
                      "حفظ الخطة",
                      "שמירת תוכנית"
                    )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  language,
  text,
  onEdit,
  onToggle,
}) {
  const name =
    plan.name?.[language] ||
    plan.name?.en ||
    plan.id;

  return (
    <div
      className={`owner-plan-card ${
        plan.active === false
          ? "inactive"
          : ""
      }`}
    >
      <div className="owner-plan-card-top">
        <span className="owner-plan-icon">
          {plan.icon || "⭐"}
        </span>

        <span
          className={`owner-plan-status ${
            plan.active === false
              ? "off"
              : ""
          }`}
        >
          {plan.active === false
            ? text(
                "Hidden",
                "مخفي",
                "מוסתר"
              )
            : text(
                "Active",
                "فعّال",
                "פעיל"
              )}
        </span>
      </div>

      <h3>
        {name}
      </h3>

      {plan.customPrice ? (
        <strong className="owner-plan-price">
          {text(
            "Custom Price",
            "سعر حسب المؤسسة",
            "מחיר מותאם"
          )}
        </strong>
      ) : (
        <strong className="owner-plan-price">
          ₪{plan.monthlyPrice || 0}
          <small>
            {text(
              " / month",
              " / شهريًا",
              " / לחודש"
            )}
          </small>
        </strong>
      )}

      {plan.studentLimit != null && (
        <p>
          👥{" "}
          {text(
            `Up to ${plan.studentLimit} students`,
            `حتى ${plan.studentLimit} طالبًا`,
            `עד ${plan.studentLimit} תלמידים`
          )}
        </p>
      )}

      {plan.recommended && (
        <div className="owner-recommended">
          ⭐{" "}
          {text(
            "Most Popular",
            "الأكثر اختيارًا",
            "הפופולרית ביותר"
          )}
        </div>
      )}

      <div className="owner-plan-actions">
        <button
          type="button"
          onClick={() =>
            onEdit(plan)
          }
        >
          ✏️{" "}
          {text(
            "Edit",
            "تعديل",
            "עריכה"
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            onToggle(plan)
          }
        >
          {plan.active === false
            ? "👁️"
            : "🙈"}{" "}

          {plan.active === false
            ? text(
                "Show",
                "إظهار",
                "הצגה"
              )
            : text(
                "Hide",
                "إخفاء",
                "הסתרה"
              )}
        </button>
      </div>
    </div>
  );
}

export default OwnerPlans;