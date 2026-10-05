import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
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

import "./OwnerCustomers.css";

import { hebrewText } from "../data/hebrewText";


function OwnerCustomers() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const navigate =
    useNavigate();

  const {
    language,
    setLanguage,
  } = useLanguage();


  const [
    users,
    setUsers,
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
    roleFilter,
    setRoleFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    processingId,
    setProcessingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
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
     LOAD USERS
  ===================================================== */

  useEffect(() => {
    const currentUser =
      auth.currentUser;


    if (!currentUser) {
      navigate(
        "/login"
      );

      return undefined;
    }


    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "users"
        ),

        (snapshot) => {
          const list =
            snapshot.docs
              .map(
                (userDoc) => ({
                  id:
                    userDoc.id,

                  ...userDoc.data(),
                })
              )

              /*
                Do not show Owner inside
                the normal customer list.
              */
              .filter(
                (user) =>
                  user.role !==
                  "owner"
              );


          list.sort(
            (
              first,
              second
            ) => {
              const firstName =
                String(
                  first.name ||
                  first.fullName ||
                  first.username ||
                  ""
                ).toLowerCase();

              const secondName =
                String(
                  second.name ||
                  second.fullName ||
                  second.username ||
                  ""
                ).toLowerCase();


              return firstName.localeCompare(
                secondName
              );
            }
          );


          setUsers(
            list
          );

          setLoading(
            false
          );
        },

        (usersError) => {
          console.error(
            "Owner customers error:",
            usersError
          );


          setError(
            text(
              "Could not load customers.",
              "تعذر تحميل العملاء."
            )
          );


          setLoading(
            false
          );
        }
      );


    const unsubscribePrograms = onSnapshot(collection(db, "programs"),
      (snapshot) => setPrograms(snapshot.docs.map((program) => ({...program.data(), id: program.id}))),
      () => setError(text("Could not load programs.", "تعذر تحميل البرامج.")));

    return () => {
      unsubscribe();
      unsubscribePrograms();
    };

  }, [navigate]);

  useEffect(() => {
    setSelectedProgramId("");
  }, [selectedUser?.id]);

  const selectedUserGrants = users.find((user) => user.id === selectedUser?.id)?.ownerGrantedProgramIds;
  const hasSelectedGrant = Array.isArray(selectedUserGrants) && selectedUserGrants.includes(selectedProgramId);

  const changeProgramGrant = async (grant) => {
    if (!selectedProgramId || !["student", "teacher"].includes(selectedUser?.role) || processingId) return;
    setProcessingId(selectedUser.id);
    setError("");
    setSuccess("");
    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        ownerGrantedProgramIds: grant ? arrayUnion(selectedProgramId) : arrayRemove(selectedProgramId),
      });
      setSuccess(grant
        ? text("Program access granted.", "تم منح الوصول إلى البرنامج.")
        : text("Owner grant revoked. Other access is unchanged.", "تم إلغاء منحة المالك. طرق الوصول الأخرى لم تتغير."));
    } catch {
      setError(text("Could not update program access.", "تعذر تحديث الوصول إلى البرنامج."));
    } finally {
      setProcessingId("");
    }
  };


  /* =====================================================
     HELPERS
  ===================================================== */

  const getName =
    (user) =>
      user.name ||
      user.fullName ||
      user.username ||
      text(
        "Unnamed user",
        "مستخدم بدون اسم"
      );


  const getStatus =
    (user) => {
      if (
        user.accountStatus ===
        "blocked"
      ) {
        return "blocked";
      }


      if (
        user.accountStatus ===
        "inactive"
      ) {
        return "inactive";
      }


      return "active";
    };


  const getStatusLabel =
    (status) => {
      if (
        status ===
        "blocked"
      ) {
        return text(
          "Blocked",
          "محظور"
        );
      }


      if (
        status ===
        "inactive"
      ) {
        return text(
          "Inactive",
          "غير فعّال"
        );
      }


      return text(
        "Active",
        "فعّال"
      );
    };


  const getRoleLabel =
    (role) =>
      role === "teacher"
        ? text(
            "Teacher",
            "معلّم"
          )
        : text(
            "Student",
            "طالب"
          );


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredUsers =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return users.filter(
          (user) => {
            const haystack =
              [
                user.name,
                user.fullName,
                user.username,
                user.email,
                user.studentCode,
                user.className,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !normalizedSearch ||
              haystack.includes(
                normalizedSearch
              );


            const matchesRole =
              roleFilter ===
              "all"
                ? true
                : user.role ===
                  roleFilter;


            const status =
              getStatus(
                user
              );


            const matchesStatus =
              statusFilter ===
              "all"
                ? true
                : status ===
                  statusFilter;


            return (
              matchesSearch &&
              matchesRole &&
              matchesStatus
            );
          }
        );
      },

      [
        users,
        search,
        roleFilter,
        statusFilter,
      ]
    );


  /* =====================================================
     STATS
  ===================================================== */

  const studentCount =
    users.filter(
      (user) =>
        user.role ===
        "student"
    ).length;


  const teacherCount =
    users.filter(
      (user) =>
        user.role ===
        "teacher"
    ).length;


  const activeCount =
    users.filter(
      (user) =>
        getStatus(
          user
        ) === "active"
    ).length;


  const inactiveCount =
    users.filter(
      (user) =>
        getStatus(
          user
        ) !== "active"
    ).length;


  /* =====================================================
     CHANGE ACCOUNT STATUS
  ===================================================== */

  const changeAccountStatus =
    async (
      user,
      nextStatus
    ) => {
      try {
        setProcessingId(
          user.id
        );

        setError("");
        setSuccess("");


        await updateDoc(
          doc(
            db,
            "users",
            user.id
          ),

          {
            accountStatus:
              nextStatus,

            accountStatusUpdatedAt:
              serverTimestamp(),

            accountStatusUpdatedBy:
              auth.currentUser?.uid ||
              null,
          }
        );


        setSelectedUser(
          (current) =>
            current &&
            current.id ===
              user.id
              ? {
                  ...current,

                  accountStatus:
                    nextStatus,
                }
              : current
        );


        setSuccess(
          nextStatus ===
          "active"
            ? text(
                "Account activated successfully.",
                "تم تفعيل الحساب بنجاح."
              )
            : text(
                "Account deactivated successfully.",
                "تم تعطيل الحساب بنجاح."
              )
        );

      } catch (
        updateError
      ) {
        console.error(
          "Customer status error:",
          updateError
        );


        setError(
          text(
            "Could not update the account.",
            "تعذر تحديث الحساب."
          )
        );

      } finally {
        setProcessingId(
          ""
        );
      }
    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="owner-customers-loading">

        <div>
          👥
        </div>


        <p>
          {text(
            "Loading customers...",
            "جارٍ تحميل العملاء..."
          )}
        </p>

      </div>
    );
  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="owner-customers-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="owner-customers-header">

        <div>

          <button
            type="button"
            className="owner-customers-back"
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
            TechMinds ADMINISTRATION
          </small>


          <h1>
            👥{" "}
            {text(
              "Customers",
              "العملاء"
            )}
          </h1>


          <p>
            {text(
              "Manage students and teachers registered on TechMinds.",
              "أديري الطلاب والمعلمين المسجلين في TechMinds."
            )}
          </p>

        </div>


        <div className="owner-customers-header-actions">

          <div className="owner-customers-language">

            <button
              type="button"
              className={
                language === "en"
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
                language === "ar"
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


          <div className="owner-customers-total">

            <span>
              👥
            </span>

            <div>

              <small>
                {text(
                  "TOTAL USERS",
                  "إجمالي المستخدمين"
                )}
              </small>

              <strong>
                {users.length}
              </strong>

            </div>

          </div>

        </div>

      </header>


      {/* =================================================
          STATS
      ================================================= */}

      <section className="owner-customers-stats">

        <div>

          <span>
            🎓
          </span>


          <div>

            <small>
              {text(
                "Students",
                "الطلاب"
              )}
            </small>

            <strong>
              {studentCount}
            </strong>

          </div>

        </div>


        <div>

          <span>
            👩‍🏫
          </span>


          <div>

            <small>
              {text(
                "Teachers",
                "المعلمين"
              )}
            </small>

            <strong>
              {teacherCount}
            </strong>

          </div>

        </div>


        <div>

          <span>
            ✅
          </span>


          <div>

            <small>
              {text(
                "Active",
                "فعّال"
              )}
            </small>

            <strong>
              {activeCount}
            </strong>

          </div>

        </div>


        <div>

          <span>
            ⛔
          </span>


          <div>

            <small>
              {text(
                "Inactive / Blocked",
                "غير فعّال / محظور"
              )}
            </small>

            <strong>
              {inactiveCount}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {success && (
        <div className="owner-customers-success">
          ✅ {success}
        </div>
      )}


      {error && (
        <div className="owner-customers-error">
          ⚠️ {error}
        </div>
      )}


      {/* =================================================
          MAIN PANEL
      ================================================= */}

      <section className="owner-customers-panel">

        <div className="owner-customers-panel-heading">

          <div>

            <small>
              COMMUNITY
            </small>


            <h2>
              {text(
                "TechMinds Users",
                "مستخدمو TechMinds"
              )}
            </h2>


            <p>
              {text(
                "Search, review and manage customer accounts.",
                "ابحثي عن الحسابات وراجعيها وأديريها."
              )}
            </p>

          </div>


          <span>
            {filteredUsers.length}{" "}
            {text(
              "results",
              "نتيجة"
            )}
          </span>

        </div>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="owner-customers-toolbar">

          <div className="owner-customers-search">

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
                  "Search by name, email, username or student code...",
                  "ابحثي بالاسم أو البريد أو اسم المستخدم أو رمز الطالب..."
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
              roleFilter
            }
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
          >

            <option value="all">
              {text(
                "All Users",
                "كل المستخدمين"
              )}
            </option>

            <option value="student">
              {text(
                "Students",
                "الطلاب"
              )}
            </option>

            <option value="teacher">
              {text(
                "Teachers",
                "المعلمين"
              )}
            </option>

          </select>


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

            <option value="active">
              {text(
                "Active",
                "فعّال"
              )}
            </option>

            <option value="inactive">
              {text(
                "Inactive",
                "غير فعّال"
              )}
            </option>

            <option value="blocked">
              {text(
                "Blocked",
                "محظور"
              )}
            </option>

          </select>

        </div>


        {/* =================================================
            USER TABLE
        ================================================= */}

        {filteredUsers.length ===
        0 ? (

          <div className="owner-customers-empty">

            <div>
              🔎
            </div>


            <h3>
              {text(
                "No users found",
                "لم يتم العثور على مستخدمين"
              )}
            </h3>


            <p>
              {text(
                "Try changing the search or filters.",
                "جرّبي تغيير البحث أو الفلاتر."
              )}
            </p>

          </div>

        ) : (

          <div className="owner-customers-table-wrapper">

            <table className="owner-customers-table">

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
                      "Role",
                      "النوع"
                    )}
                  </th>

                  <th>
                    {text(
                      "Account",
                      "الحساب"
                    )}
                  </th>

                  <th>
                    {text(
                      "Plan",
                      "الباقة"
                    )}
                  </th>

                  <th>
                    {text(
                      "Status",
                      "الحالة"
                    )}
                  </th>

                  <th>
                    {text(
                      "Actions",
                      "الإجراءات"
                    )}
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => {
                    const status =
                      getStatus(
                        user
                      );


                    return (
                      <tr
                        key={
                          user.id
                        }
                      >

                        {/* CUSTOMER */}

                        <td>

                          <div className="owner-customer-profile">

                            <div className={`owner-customer-avatar ${user.role}`}>

                              {user.role ===
                              "teacher"
                                ? "👩‍🏫"
                                : "🎓"}

                            </div>


                            <div>

                              <strong>
                                {getName(
                                  user
                                )}
                              </strong>


                              <small>
                                {user.email ||
                                  user.username ||
                                  user.studentCode ||
                                  "—"}
                              </small>

                            </div>

                          </div>

                        </td>


                        {/* ROLE */}

                        <td>

                          <span className={`owner-customer-role ${user.role}`}>

                            {user.role ===
                            "teacher"
                              ? "👩‍🏫"
                              : "🎓"}

                            {" "}

                            {getRoleLabel(
                              user.role
                            )}

                          </span>

                        </td>


                        {/* ACCOUNT */}

                        <td>

                          {user.role ===
                          "student" ? (

                            <div className="owner-customer-account-info">

                              <strong>
                                {user.studentCode ||
                                  "—"}
                              </strong>

                              <small>
                                {user.username ||
                                  "—"}
                              </small>

                            </div>

                          ) : (

                            <div className="owner-customer-account-info">

                              <strong>
                                {user.email ||
                                  "—"}
                              </strong>

                            </div>

                          )}

                        </td>


                        {/* PLAN */}

                        <td>

                          <span className="owner-customer-plan">

                            💎{" "}

                            {user.plan ||
                              "free"}

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span className={`owner-customer-status ${status}`}>

                            <i>
                            </i>

                            {getStatusLabel(
                              status
                            )}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <button
                            type="button"
                            className="owner-customer-view"
                            onClick={() =>
                              setSelectedUser(
                                user
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
          CUSTOMER DETAILS MODAL
      ================================================= */}

      {selectedUser && (

        <div
          className="owner-customer-modal-overlay"
          onClick={() =>
            setSelectedUser(
              null
            )
          }
        >

          <div
            className="owner-customer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <header>

              <div className={`owner-customer-modal-avatar ${selectedUser.role}`}>

                {selectedUser.role ===
                "teacher"
                  ? "👩‍🏫"
                  : "🎓"}

              </div>


              <div>

                <small>
                  TechMinds CUSTOMER
                </small>


                <h2>
                  {getName(
                    selectedUser
                  )}
                </h2>


                <p>
                  {getRoleLabel(
                    selectedUser.role
                  )}
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
              >
                ×
              </button>

            </header>


            <div className="owner-customer-detail-grid">

              <div>

                <small>
                  {text(
                    "Role",
                    "نوع الحساب"
                  )}
                </small>

                <strong>
                  {getRoleLabel(
                    selectedUser.role
                  )}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Status",
                    "الحالة"
                  )}
                </small>

                <strong>
                  {getStatusLabel(
                    getStatus(
                      selectedUser
                    )
                  )}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Plan",
                    "الباقة"
                  )}
                </small>

                <strong>
                  {selectedUser.plan ||
                    "free"}
                </strong>

              </div>


              <div>

                <small>
                  {text(
                    "Subscription",
                    "الاشتراك"
                  )}
                </small>

                <strong>
                  {selectedUser
                    .subscriptionStatus ||
                    "—"}
                </strong>

              </div>

            </div>


            <div className="owner-customer-details-list">

              {selectedUser.email && (

                <div>

                  <span>
                    ✉️
                  </span>

                  <div>

                    <small>
                      Email
                    </small>

                    <strong>
                      {selectedUser.email}
                    </strong>

                  </div>

                </div>

              )}


              {selectedUser.username && (

                <div>

                  <span>
                    👤
                  </span>

                  <div>

                    <small>
                      {text(
                        "Username",
                        "اسم المستخدم"
                      )}
                    </small>

                    <strong>
                      {selectedUser.username}
                    </strong>

                  </div>

                </div>

              )}


              {selectedUser.studentCode && (

                <div>

                  <span>
                    🔑
                  </span>

                  <div>

                    <small>
                      {text(
                        "Student Code",
                        "رمز الطالب"
                      )}
                    </small>

                    <strong>
                      {selectedUser.studentCode}
                    </strong>

                  </div>

                </div>

              )}


              {selectedUser.grade && (

                <div>

                  <span>
                    🎒
                  </span>

                  <div>

                    <small>
                      {text(
                        "Grade",
                        "الصف"
                      )}
                    </small>

                    <strong>
                      {selectedUser.grade}
                    </strong>

                  </div>

                </div>

              )}

            </div>


            {["student", "teacher"].includes(selectedUser.role) && (
              <div className="owner-customer-admin-section">
                <h3>{text("Program Access", "الوصول إلى البرامج")}</h3>
                <div className="owner-customers-toolbar">
                  <select
                    aria-label={text("Select a program", "اختر برنامجًا")}
                    value={selectedProgramId}
                    disabled={Boolean(processingId)}
                    onChange={(event) => {
                      setSelectedProgramId(event.target.value);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <option value="">{text("Select a program", "اختر برنامجًا")}</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {typeof program.title === "string" ? program.title : program.title?.[language] || program.title?.en || program.id}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" className="owner-customer-activate"
                  disabled={!selectedProgramId || hasSelectedGrant || Boolean(processingId)}
                  onClick={() => changeProgramGrant(true)}>
                  {text("Grant Access", "منح الوصول")}
                </button>
                <button type="button" className="owner-customer-deactivate"
                  disabled={!selectedProgramId || !hasSelectedGrant || Boolean(processingId)}
                  onClick={() => changeProgramGrant(false)}>
                  {text("Revoke Access", "إلغاء الوصول")}
                </button>
                {(error || success) && <p role="status">{error || success}</p>}
              </div>
            )}

            <div className="owner-customer-admin-section">

              <small>
                {text(
                  "ACCOUNT CONTROL",
                  "إدارة الحساب"
                )}
              </small>


              <h3>
                {text(
                  "Account Access",
                  "صلاحية الدخول"
                )}
              </h3>


              <p>
                {text(
                  "You can temporarily disable this account or reactivate it.",
                  "يمكنك تعطيل هذا الحساب مؤقتًا أو إعادة تفعيله."
                )}
              </p>


              {getStatus(
                selectedUser
              ) === "active" ? (

                <button
                  type="button"
                  className="owner-customer-deactivate"
                  disabled={
                    processingId ===
                    selectedUser.id
                  }
                  onClick={() =>
                    changeAccountStatus(
                      selectedUser,
                      "inactive"
                    )
                  }
                >
                  ⛔{" "}

                  {processingId ===
                  selectedUser.id
                    ? text(
                        "Updating...",
                        "جارٍ التحديث..."
                      )
                    : text(
                        "Deactivate Account",
                        "تعطيل الحساب"
                      )}
                </button>

              ) : (

                <button
                  type="button"
                  className="owner-customer-activate"
                  disabled={
                    processingId ===
                    selectedUser.id
                  }
                  onClick={() =>
                    changeAccountStatus(
                      selectedUser,
                      "active"
                    )
                  }
                >
                  ✅{" "}

                  {processingId ===
                  selectedUser.id
                    ? text(
                        "Updating...",
                        "جارٍ التحديث..."
                      )
                    : text(
                        "Activate Account",
                        "تفعيل الحساب"
                      )}
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default OwnerCustomers;
