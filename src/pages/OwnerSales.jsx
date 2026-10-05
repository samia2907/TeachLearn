import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  useLanguage,
} from "../context/LanguageContext";

import "./OwnerSales.css";

import { hebrewText } from "../data/hebrewText";


function OwnerSales() {
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    sales,
    setSales,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    licenseFilter,
    setLicenseFilter,
  ] = useState("all");

  const [
    selectedSale,
    setSelectedSale,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");


  const text = (
    english,
    arabic
  ) =>
    language === "ar"
      ? arabic
      : language === "he"
        ? hebrewText(english)
      : english;


  /* =====================================================
     LOAD SALES
  ===================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;


    if (!user) {
      navigate(
        "/login"
      );

      return undefined;
    }


    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "programPurchases"
        ),

        (snapshot) => {
          const list =
            snapshot.docs.map(
              (saleDoc) => ({
                id:
                  saleDoc.id,

                ...saleDoc.data(),
              })
            );


          list.sort(
            (
              first,
              second
            ) => {
              const firstTime =
                first.createdAt?.seconds ||
                first.paidAt?.seconds ||
                0;

              const secondTime =
                second.createdAt?.seconds ||
                second.paidAt?.seconds ||
                0;


              return (
                secondTime -
                firstTime
              );
            }
          );


          setSales(
            list
          );

          setLoading(
            false
          );
        },

        (salesError) => {
          console.error(
            "Owner sales error:",
            salesError
          );


          setError(
            text(
              "Could not load sales.",
              "تعذر تحميل المبيعات."
            )
          );


          setLoading(
            false
          );
        }
      );


    return () =>
      unsubscribe();

  }, [navigate]);


  /* =====================================================
     HELPERS
  ===================================================== */

  const getStatus =
    (sale) =>
      sale.paymentStatus ||
      sale.status ||
      "pending";


  const getStatusLabel =
    (status) => {
      if (
        status === "paid"
      ) {
        return text(
          "Paid",
          "مدفوع"
        );
      }


      if (
        status === "failed"
      ) {
        return text(
          "Failed",
          "فشل"
        );
      }


      if (
        status === "refunded"
      ) {
        return text(
          "Refunded",
          "مُسترد"
        );
      }


      if (
        status === "cancelled"
      ) {
        return text(
          "Cancelled",
          "ملغي"
        );
      }


      return text(
        "Pending",
        "قيد الانتظار"
      );
    };


  const getLicenseLabel =
    (licenseType) => {
      if (
        licenseType ===
        "teacher"
      ) {
        return text(
          "Teacher Access",
          "وصول معلّم"
        );
      }


      if (
        licenseType ===
        "class"
      ) {
        return text(
          "Class License",
          "ترخيص صف"
        );
      }


      return text(
        "Student Access",
        "وصول طالب"
      );
    };


  const formatDate =
    (timestamp) => {
      if (!timestamp) {
        return "—";
      }


      try {
        const date =
          timestamp.toDate
            ? timestamp.toDate()
            : new Date(
                timestamp
              );


        return new Intl.DateTimeFormat(
          language === "ar"
            ? "ar"
            : "en",
          {
            year:
              "numeric",

            month:
              "short",

            day:
              "numeric",

            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        ).format(
          date
        );

      } catch {
        return "—";
      }
    };


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredSales =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return sales.filter(
          (sale) => {
            const haystack =
              [
                sale.customerName,
                sale.customerEmail,
                sale.programName,
                sale.programTitle,
                sale.transactionId,
                sale.paymentId,
                sale.id,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !normalizedSearch ||
              haystack.includes(
                normalizedSearch
              );


            const saleStatus =
              getStatus(
                sale
              );


            const matchesStatus =
              statusFilter ===
              "all"
                ? true
                : saleStatus ===
                  statusFilter;


            const licenseType =
              sale.licenseType ||
              sale.accessType ||
              "student";


            const matchesLicense =
              licenseFilter ===
              "all"
                ? true
                : licenseType ===
                  licenseFilter;


            return (
              matchesSearch &&
              matchesStatus &&
              matchesLicense
            );
          }
        );
      },

      [
        sales,
        search,
        statusFilter,
        licenseFilter,
      ]
    );


  /* =====================================================
     STATS
  ===================================================== */

  const paidSales =
    sales.filter(
      (sale) =>
        getStatus(
          sale
        ) === "paid"
    );


  const totalRevenue =
    paidSales.reduce(
      (
        total,
        sale
      ) =>
        total +
        Number(
          sale.amount ||
          sale.totalAmount ||
          0
        ),

      0
    );


  const pendingSales =
    sales.filter(
      (sale) =>
        getStatus(
          sale
        ) === "pending"
    ).length;


  const refundedSales =
    sales.filter(
      (sale) =>
        getStatus(
          sale
        ) === "refunded"
    ).length;


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="owner-sales-loading">

        <div>
          💳
        </div>


        <p>
          {text(
            "Loading sales...",
            "جارٍ تحميل المبيعات..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-sales-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="owner-sales-header">

        <div>

          <button
            type="button"
            className="owner-sales-back"
            onClick={() =>
              navigate(
                "/owner"
              )
            }
          >
            {language === "ar"
              ? "↩ العودة للرئيسية"
              : language === "he"
                ? "→ חזרה ללוח הבקרה"
                : "← Back to Dashboard"}
          </button>


          <small>
            TechMinds COMMERCE
          </small>


          <h1>
            💳{" "}
            {text(
              "Sales",
              "المبيعات"
            )}
          </h1>


          <p>
            {text(
              "Track confirmed program purchases and payment activity.",
              "تابعي عمليات شراء البرامج والمدفوعات المؤكدة."
            )}
          </p>

        </div>


        <div className="owner-sales-header-actions">

          <div className="owner-sales-language">

            <button
              type="button"
              className={
                language ===
                "en"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "en"
                )
              }
            >
              EN
            </button>


            <button
              type="button"
              className={
                language ===
                "ar"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setLanguage(
                  "ar"
                )
              }
            >
              عربي
            </button>

            <button type="button" className={language === "he" ? "active" : ""} onClick={() => setLanguage("he")}>
              עברית
            </button>

          </div>


          <div className="owner-sales-live-badge">

            <span>
              ●
            </span>

            {text(
              "Real-time",
              "مباشر"
            )}

          </div>

        </div>

      </header>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="owner-sales-stats">

        <div className="owner-sale-stat revenue">

          <span>
            💰
          </span>


          <div>

            <small>
              {text(
                "Total Revenue",
                "إجمالي الإيرادات"
              )}
            </small>

            <strong>
              ₪
              {totalRevenue.toLocaleString()}
            </strong>

            <p>
              {text(
                "Paid transactions only",
                "المدفوعات المؤكدة فقط"
              )}
            </p>

          </div>

        </div>


        <div>

          <span>
            ✅
          </span>


          <div>

            <small>
              {text(
                "Paid Sales",
                "مبيعات مدفوعة"
              )}
            </small>

            <strong>
              {paidSales.length}
            </strong>

          </div>

        </div>


        <div>

          <span>
            ⏳
          </span>


          <div>

            <small>
              {text(
                "Pending",
                "قيد الانتظار"
              )}
            </small>

            <strong>
              {pendingSales}
            </strong>

          </div>

        </div>


        <div>

          <span>
            ↩️
          </span>


          <div>

            <small>
              {text(
                "Refunded",
                "مُسترد"
              )}
            </small>

            <strong>
              {refundedSales}
            </strong>

          </div>

        </div>

      </section>


      {error && (
        <div className="owner-sales-error">
          ⚠️ {error}
        </div>
      )}


      {/* =================================================
          PAYMENT NOTE
      ================================================= */}

      <section className="owner-sales-payment-note">

        <div>
          🔒
        </div>


        <div>

          <small>
            PAYMENT SECURITY
          </small>


          <h3>
            {text(
              "Revenue is calculated only from verified paid transactions.",
              "يتم احتساب الإيرادات فقط من عمليات الدفع المؤكدة."
            )}
          </h3>


          <p>
            {text(
              "When live payment integration is completed, successful payments will automatically appear here.",
              "بعد إكمال ربط الدفع الحقيقي، ستظهر المدفوعات الناجحة هنا تلقائيًا."
            )}
          </p>

        </div>

      </section>


      {/* =================================================
          SALES PANEL
      ================================================= */}

      <section className="owner-sales-panel">

        <div className="owner-sales-panel-heading">

          <div>

            <small>
              TRANSACTIONS
            </small>


            <h2>
              {text(
                "Program Purchases",
                "عمليات شراء البرامج"
              )}
            </h2>


            <p>
              {text(
                "Student, teacher and class-license purchases.",
                "مشتريات الطلاب والمعلمين وتراخيص الصفوف."
              )}
            </p>

          </div>


          <span>
            {filteredSales.length}{" "}
            {text(
              "results",
              "نتيجة"
            )}
          </span>

        </div>


        {/* TOOLBAR */}

        <div className="owner-sales-toolbar">

          <div className="owner-sales-search">

            <span>
              🔎
            </span>


            <input
              type="text"
              value={
                search
              }
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                text(
                  "Search customer, program or transaction ID...",
                  "ابحثي عن العميل أو البرنامج أو رقم العملية..."
                )
              }
            />


            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


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
                "All Statuses",
                "كل الحالات"
              )}
            </option>

            <option value="paid">
              {text(
                "Paid",
                "مدفوع"
              )}
            </option>

            <option value="pending">
              {text(
                "Pending",
                "قيد الانتظار"
              )}
            </option>

            <option value="failed">
              {text(
                "Failed",
                "فشل"
              )}
            </option>

            <option value="refunded">
              {text(
                "Refunded",
                "مُسترد"
              )}
            </option>

          </select>


          <select
            value={
              licenseFilter
            }
            onChange={(event) =>
              setLicenseFilter(
                event.target.value
              )
            }
          >

            <option value="all">
              {text(
                "All Licenses",
                "كل أنواع الوصول"
              )}
            </option>

            <option value="student">
              {text(
                "Student",
                "طالب"
              )}
            </option>

            <option value="teacher">
              {text(
                "Teacher",
                "معلّم"
              )}
            </option>

            <option value="class">
              {text(
                "Class",
                "صف"
              )}
            </option>

          </select>

        </div>


        {/* EMPTY */}

        {filteredSales.length ===
        0 ? (

          <div className="owner-sales-empty">

            <div>
              💳
            </div>


            <h3>
              {sales.length ===
              0
                ? text(
                    "No sales yet",
                    "لا توجد مبيعات بعد"
                  )
                : text(
                    "No transactions found",
                    "لم يتم العثور على عمليات"
                  )}
            </h3>


            <p>
              {sales.length ===
              0
                ? text(
                    "Your first verified payment will appear here after the live payment system is connected.",
                    "ستظهر أول عملية دفع مؤكدة هنا بعد ربط نظام الدفع الحقيقي."
                  )
                : text(
                    "Try changing the search or filters.",
                    "جرّبي تغيير البحث أو الفلاتر."
                  )}
            </p>

          </div>

        ) : (

          <div className="owner-sales-table-wrapper">

            <table className="owner-sales-table">

              <thead>

                <tr>

                  <th>
                    {text(
                      "Customer",
                      "العميل"
                    )}
                  </th>

                  <th>
                    {text(
                      "Program",
                      "البرنامج"
                    )}
                  </th>

                  <th>
                    {text(
                      "License",
                      "نوع الوصول"
                    )}
                  </th>

                  <th>
                    {text(
                      "Amount",
                      "المبلغ"
                    )}
                  </th>

                  <th>
                    {text(
                      "Payment",
                      "الدفع"
                    )}
                  </th>

                  <th>
                    {text(
                      "Date",
                      "التاريخ"
                    )}
                  </th>

                  <th>
                    {text(
                      "Details",
                      "التفاصيل"
                    )}
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredSales.map(
                  (sale) => {
                    const status =
                      getStatus(
                        sale
                      );

                    const licenseType =
                      sale.licenseType ||
                      sale.accessType ||
                      "student";


                    return (
                      <tr
                        key={
                          sale.id
                        }
                      >

                        <td>

                          <div className="owner-sale-customer">

                            <div>

                              {licenseType ===
                              "teacher"
                                ? "👩‍🏫"
                                : licenseType ===
                                  "class"
                                ? "👥"
                                : "🎓"}

                            </div>


                            <span>

                              <strong>
                                {sale.customerName ||
                                  text(
                                    "Customer",
                                    "عميل"
                                  )}
                              </strong>


                              <small>
                                {sale.customerEmail ||
                                  sale.userId ||
                                  "—"}
                              </small>

                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="owner-sale-program">

                            <span>
                              {sale.programIcon ||
                                "📦"}
                            </span>


                            <strong>
                              {sale.programName ||
                                sale.programTitle ||
                                sale.programId ||
                                "—"}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span className={`owner-sale-license ${licenseType}`}>

                            {licenseType ===
                            "teacher"
                              ? "👩‍🏫"
                              : licenseType ===
                                "class"
                              ? "👥"
                              : "🎓"}

                            {" "}

                            {getLicenseLabel(
                              licenseType
                            )}

                          </span>

                        </td>


                        <td>

                          <strong className="owner-sale-amount">

                            ₪
                            {Number(
                              sale.amount ||
                              sale.totalAmount ||
                              0
                            ).toLocaleString()}

                          </strong>

                        </td>


                        <td>

                          <span className={`owner-sale-status ${status}`}>

                            <i>
                            </i>

                            {getStatusLabel(
                              status
                            )}

                          </span>

                        </td>


                        <td>

                          <span className="owner-sale-date">

                            {formatDate(
                              sale.paidAt ||
                              sale.createdAt
                            )}

                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="owner-sale-view"
                            onClick={() =>
                              setSelectedSale(
                                sale
                              )
                            }
                          >
                            {text(
                              "View",
                              "عرض"
                            )}
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =================================================
          SALE DETAILS
      ================================================= */}

      {selectedSale && (

        <div
          className="owner-sale-modal-overlay"
          onClick={() =>
            setSelectedSale(
              null
            )
          }
        >

          <div
            className="owner-sale-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <header>

              <div className="owner-sale-modal-icon">
                💳
              </div>


              <div>

                <small>
                  TRANSACTION
                </small>


                <h2>
                  {text(
                    "Sale Details",
                    "تفاصيل عملية البيع"
                  )}
                </h2>


                <p>
                  {selectedSale.id}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedSale(
                    null
                  )
                }
              >
                ×
              </button>

            </header>


            <div className="owner-sale-modal-status">

              <span className={`owner-sale-status ${getStatus(
                selectedSale
              )}`}>

                <i>
                </i>

                {getStatusLabel(
                  getStatus(
                    selectedSale
                  )
                )}

              </span>


              <strong>
                ₪
                {Number(
                  selectedSale.amount ||
                  selectedSale.totalAmount ||
                  0
                ).toLocaleString()}
              </strong>

            </div>


            <div className="owner-sale-detail-grid">

              <div>

                <small>
                  {text(
                    "Customer",
                    "العميل"
                  )}
                </small>

                <strong>
                  {selectedSale.customerName ||
                    "—"}
                </strong>

              </div>


              <div>

                <small>
                  Email
                </small>

                <strong>
                  {selectedSale.customerEmail ||
                    "—"}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Program",
                    "البرنامج"
                  )}
                </small>

                <strong>
                  {selectedSale.programName ||
                    selectedSale.programTitle ||
                    selectedSale.programId ||
                    "—"}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "License",
                    "نوع الوصول"
                  )}
                </small>

                <strong>
                  {getLicenseLabel(
                    selectedSale.licenseType ||
                    selectedSale.accessType ||
                    "student"
                  )}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Transaction ID",
                    "رقم العملية"
                  )}
                </small>

                <strong>
                  {selectedSale.transactionId ||
                    selectedSale.paymentId ||
                    "—"}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Date",
                    "التاريخ"
                  )}
                </small>

                <strong>
                  {formatDate(
                    selectedSale.paidAt ||
                    selectedSale.createdAt
                  )}
                </strong>

              </div>

            </div>


            {selectedSale.classId && (

              <div className="owner-sale-class-info">

                👥{" "}

                <div>

                  <small>
                    {text(
                      "CLASS LICENSE",
                      "ترخيص صف"
                    )}
                  </small>


                  <strong>
                    {selectedSale.className ||
                      selectedSale.classId}
                  </strong>

                </div>

              </div>

            )}


            <div className="owner-sale-security">

              🔒{" "}

              {text(
                "Payment card numbers and CVV are never stored in TechMinds.",
                "لا يتم حفظ رقم البطاقة أو CVV داخل TechMinds."
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default OwnerSales;