import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { db } from "../firebase/firebase";
import { useLanguage } from "../context/LanguageContext";

import "./OwnerCourseRegistrations.css";


function OwnerCourseRegistrations() {
  const navigate = useNavigate();

  const {
    language,
  } = useLanguage();

  const text = (
    en,
    ar,
    he
  ) =>
    language === "ar"
      ? ar
      : language === "he"
        ? he
        : en;

  const isRTL =
    language === "ar" ||
    language === "he";

  const [registrations, setRegistrations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [busyId, setBusyId] =
    useState("");


  useEffect(() => {
    const registrationsQuery =
      query(
        collection(
          db,
          "courseRegistrations"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

    const unsubscribe =
      onSnapshot(
        registrationsQuery,

        (snapshot) => {
          setRegistrations(
            snapshot.docs.map(
              (registrationDoc) => ({
                id:
                  registrationDoc.id,

                ...registrationDoc.data(),
              })
            )
          );

          setError("");
          setLoading(false);
        },

        (snapshotError) => {
          console.error(
            "Course registrations load error:",
            snapshotError
          );

          setError(
            text(
              "Could not load course registrations.",
              "تعذّر تحميل طلبات التسجيل.",
              "לא ניתן לטעון את בקשות ההרשמה."
            )
          );

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);


  const statusText = (
    status
  ) => {
    switch (status) {
      case "contacted":
        return text(
          "Contacted",
          "تم التواصل",
          "נוצר קשר"
        );

      case "confirmed":
        return text(
          "Confirmed",
          "تم التأكيد",
          "אושר"
        );

      case "closed":
        return text(
          "Closed",
          "مغلق",
          "נסגר"
        );

      default:
        return text(
          "New",
          "جديد",
          "חדש"
        );
    }
  };


  const courseText = (
    item
  ) => {
    switch (item.courseId) {
      case "private-math":
        return text(
          "Math Support Lessons",
          "دروس رياضيات وتقوية",
          "שיעורי מתמטיקה ותגבור"
        );

      case "little-programmer":
        return text(
          "Little Programmer",
          "المبرمج الصغير",
          "המתכנת הצעיר"
        );

      case "cs-lessons":
        return text(
          "Computer Science & Programming",
          "علوم الحاسوب والبرمجة",
          "מדעי המחשב ותכנות"
        );

      default:
        return (
          item.courseTitle ||
          item.courseId ||
          "-"
        );
    }
  };


  const filteredRegistrations =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase();

      return registrations.filter(
        (item) => {
          if (
            statusFilter !== "all" &&
            (item.status || "new") !==
              statusFilter
          ) {
            return false;
          }

          if (!cleanSearch) {
            return true;
          }

          const searchable = `
            ${item.studentName || ""}
            ${item.parentName || ""}
            ${item.phone || ""}
            ${item.grade || ""}
            ${item.courseTitle || ""}
            ${item.courseId || ""}
            ${item.preferredTime || ""}
          `.toLowerCase();

          return searchable.includes(
            cleanSearch
          );
        }
      );
    }, [
      registrations,
      search,
      statusFilter,
    ]);


  const statistics =
    useMemo(
      () => ({
        all:
          registrations.length,

        new:
          registrations.filter(
            (item) =>
              (item.status || "new") ===
              "new"
          ).length,

        contacted:
          registrations.filter(
            (item) =>
              item.status ===
              "contacted"
          ).length,

        confirmed:
          registrations.filter(
            (item) =>
              item.status ===
              "confirmed"
          ).length,
      }),
      [registrations]
    );


  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      typeof value.toDate ===
      "function"
        ? value.toDate()
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      language === "ar"
        ? "ar"
        : language === "he"
          ? "he"
          : "en",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };


  const whatsappUrl = (
    item
  ) => {
    const digits =
      String(
        item.phone || ""
      ).replace(
        /\D/g,
        ""
      );

    let international =
      digits;

    if (
      digits.startsWith("0")
    ) {
      international =
        `972${digits.slice(1)}`;
    }

    const message =
      text(
        `Hello, this is TechMinds regarding the registration request for ${courseText(item)}.`,
        `مرحبًا، معك TechMinds بخصوص طلب التسجيل في ${courseText(item)}.`,
        `שלום, כאן TechMinds בנוגע לבקשת ההרשמה ל-${courseText(item)}.`
      );

    return `https://wa.me/${international}?text=${encodeURIComponent(
      message
    )}`;
  };


  const updateStatus =
    async (
      registrationId,
      status
    ) => {
      try {
        setBusyId(
          registrationId
        );

        await updateDoc(
          doc(
            db,
            "courseRegistrations",
            registrationId
          ),
          {
            status,
            updatedAt:
              serverTimestamp(),
          }
        );
      } catch (updateError) {
        console.error(
          "Registration status update error:",
          updateError
        );

        setError(
          text(
            "Could not update the registration status.",
            "تعذّر تحديث حالة طلب التسجيل.",
            "לא ניתן לעדכן את סטטוס ההרשמה."
          )
        );
      } finally {
        setBusyId("");
      }
    };


  if (loading) {
    return (
      <main
        className="owner-course-registrations-page"
        dir={
          isRTL
            ? "rtl"
            : "ltr"
        }
      >
        <div className="ocr-loading">
          🎓
          <p>
            {text(
              "Loading registrations...",
              "جارٍ تحميل طلبات التسجيل...",
              "טוען בקשות הרשמה..."
            )}
          </p>
        </div>
      </main>
    );
  }


  return (
    <main
      className="owner-course-registrations-page"
      dir={
        isRTL
          ? "rtl"
          : "ltr"
      }
    >
      <header className="ocr-header">
        <div>
          <button
            type="button"
            className="ocr-back"
            onClick={() =>
              navigate(
                "/owner"
              )
            }
          >
            {text(
              "← Owner Dashboard",
              "↩ لوحة الإدارة",
              "↩ לוח הניהול"
            )}
          </button>

          <span className="ocr-eyebrow">
            TechMinds
          </span>

          <h1>
            {text(
              "Course Registrations",
              "طلبات التسجيل للدورات",
              "בקשות הרשמה לקורסים"
            )}
          </h1>

          <p>
            {text(
              "Review new requests, contact families and update each registration status.",
              "تابعي الطلبات الجديدة، تواصلي مع الأهالي وحدّثي حالة كل تسجيل.",
              "בדקו בקשות חדשות, צרו קשר עם המשפחות ועדכנו את סטטוס ההרשמה."
            )}
          </p>
        </div>

        <button
          type="button"
          className="ocr-view-courses"
          onClick={() =>
            navigate(
              "/courses"
            )
          }
        >
          🎓{" "}
          {text(
            "View Courses",
            "عرض الدورات",
            "צפייה בקורסים"
          )}
        </button>
      </header>


      {error && (
        <div className="ocr-error">
          {error}
        </div>
      )}


      <section className="ocr-stats">
        <button
          type="button"
          className={
            statusFilter ===
            "all"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "all"
            )
          }
        >
          <span>📋</span>
          <strong>
            {statistics.all}
          </strong>
          <small>
            {text(
              "All requests",
              "كل الطلبات",
              "כל הבקשות"
            )}
          </small>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "new"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "new"
            )
          }
        >
          <span>✨</span>
          <strong>
            {statistics.new}
          </strong>
          <small>
            {text(
              "New",
              "جديدة",
              "חדשות"
            )}
          </small>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "contacted"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "contacted"
            )
          }
        >
          <span>💬</span>
          <strong>
            {
              statistics.contacted
            }
          </strong>
          <small>
            {text(
              "Contacted",
              "تم التواصل",
              "נוצר קשר"
            )}
          </small>
        </button>

        <button
          type="button"
          className={
            statusFilter ===
            "confirmed"
              ? "active"
              : ""
          }
          onClick={() =>
            setStatusFilter(
              "confirmed"
            )
          }
        >
          <span>✅</span>
          <strong>
            {
              statistics.confirmed
            }
          </strong>
          <small>
            {text(
              "Confirmed",
              "مؤكدة",
              "אושרו"
            )}
          </small>
        </button>
      </section>


      <section className="ocr-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder={text(
            "Search by student, parent, phone or course...",
            "ابحثي باسم الطالب، ولي الأمر، الهاتف أو الدورة...",
            "חיפוש לפי תלמיד, הורה, טלפון או קורס..."
          )}
        />

        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            {text(
              "All statuses",
              "كل الحالات",
              "כל הסטטוסים"
            )}
          </option>

          <option value="new">
            {statusText(
              "new"
            )}
          </option>

          <option value="contacted">
            {statusText(
              "contacted"
            )}
          </option>

          <option value="confirmed">
            {statusText(
              "confirmed"
            )}
          </option>

          <option value="closed">
            {statusText(
              "closed"
            )}
          </option>
        </select>
      </section>


      {filteredRegistrations.length ===
      0 ? (
        <section className="ocr-empty">
          <span>📭</span>

          <h2>
            {text(
              "No registrations found",
              "لا توجد طلبات تسجيل",
              "לא נמצאו בקשות הרשמה"
            )}
          </h2>

          <p>
            {text(
              "New requests submitted from the Courses page will appear here automatically.",
              "أي طلب جديد يتم إرساله من صفحة الدورات سيظهر هنا تلقائيًا.",
              "בקשות חדשות שיישלחו מעמוד הקורסים יופיעו כאן אוטומטית."
            )}
          </p>
        </section>
      ) : (
        <section className="ocr-list">
          {filteredRegistrations.map(
            (item) => (
              <article
                className="ocr-card"
                key={item.id}
              >
                <div className="ocr-card-top">
                  <div>
                    <span
                      className={`ocr-status ocr-status-${
                        item.status ||
                        "new"
                      }`}
                    >
                      {statusText(
                        item.status ||
                          "new"
                      )}
                    </span>

                    <h2>
                      {
                        item.studentName
                      }
                    </h2>

                    <p>
                      {courseText(
                        item
                      )}
                    </p>
                  </div>

                  <time>
                    {formatDate(
                      item.createdAt
                    )}
                  </time>
                </div>


                <div className="ocr-details">
                  <div>
                    <span>
                      👤{" "}
                      {text(
                        "Parent",
                        "ولي الأمر",
                        "הורה"
                      )}
                    </span>
                    <strong>
                      {
                        item.parentName ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      🎓{" "}
                      {text(
                        "Grade",
                        "الصف",
                        "כיתה"
                      )}
                    </span>
                    <strong>
                      {
                        item.grade ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      📞{" "}
                      {text(
                        "Phone",
                        "الهاتف",
                        "טלפון"
                      )}
                    </span>
                    <strong>
                      {
                        item.phone ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      🕒{" "}
                      {text(
                        "Preferred time",
                        "الموعد المفضل",
                        "מועד מועדף"
                      )}
                    </span>
                    <strong>
                      {
                        item.preferredTime ||
                        "-"
                      }
                    </strong>
                  </div>
                </div>


                {item.notes && (
                  <div className="ocr-notes">
                    <span>
                      {text(
                        "Notes",
                        "ملاحظات",
                        "הערות"
                      )}
                    </span>

                    <p>
                      {item.notes}
                    </p>
                  </div>
                )}


                <div className="ocr-actions">
                  <a
                    href={whatsappUrl(
                      item
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="ocr-whatsapp"
                  >
                    💬{" "}
                    {text(
                      "WhatsApp",
                      "واتساب",
                      "WhatsApp"
                    )}
                  </a>

                  <a
                    href={`tel:${
                      item.phone ||
                      ""
                    }`}
                    className="ocr-call"
                  >
                    📞{" "}
                    {text(
                      "Call",
                      "اتصال",
                      "שיחה"
                    )}
                  </a>

                  <select
                    value={
                      item.status ||
                      "new"
                    }
                    disabled={
                      busyId ===
                      item.id
                    }
                    onChange={(
                      event
                    ) =>
                      updateStatus(
                        item.id,
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="new">
                      {statusText(
                        "new"
                      )}
                    </option>

                    <option value="contacted">
                      {statusText(
                        "contacted"
                      )}
                    </option>

                    <option value="confirmed">
                      {statusText(
                        "confirmed"
                      )}
                    </option>

                    <option value="closed">
                      {statusText(
                        "closed"
                      )}
                    </option>
                  </select>
                </div>
              </article>
            )
          )}
        </section>
      )}
    </main>
  );
}


export default OwnerCourseRegistrations;
