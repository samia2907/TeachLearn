const {
  onRequest,
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  defineSecret,
} = require("firebase-functions/params");

const {
  initializeApp,
} = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue,
  Timestamp,
} = require("firebase-admin/firestore");

const {
  getAuth,
} = require("firebase-admin/auth");

const {
  createHash,
  createHmac,
  timingSafeEqual,
} = require("crypto");

const {
  TranslationServiceClient,
} = require("@google-cloud/translate");


/* =========================================================
   FIREBASE ADMIN
========================================================= */

const app = initializeApp();

/*
  Your Firestore database ID is:
  default

  Do NOT change it to:
  (default)
*/

const db = getFirestore(app, "default");

const translationClient =
  new TranslationServiceClient();


/* =========================================================
   TRANSLATE PLAN
========================================================= */

exports.translatePlan =
  onCall(
    {
      region: "europe-west1",
      timeoutSeconds: 30,
      memory: "256MiB",
    },

    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "You must sign in first."
        );
      }

      const ownerSnapshot =
        await db
          .collection("users")
          .doc(request.auth.uid)
          .get();

      if (
        !ownerSnapshot.exists ||
        ownerSnapshot.data().role !== "owner"
      ) {
        throw new HttpsError(
          "permission-denied",
          "Only owners can translate plans."
        );
      }

      const input = request.data || {};

      const contents = [
        String(input.name || ""),
        String(input.description || ""),
        String(input.features || ""),
      ];

      const translate =
        async (targetLanguageCode) => {
          const [response] =
            await translationClient.translateText({
              parent:
                `projects/${process.env.GCLOUD_PROJECT}/locations/global`,

              contents,

              mimeType:
                "text/plain",

              sourceLanguageCode:
                "en",

              targetLanguageCode,
            });

          return response.translations.map(
            (translation) =>
              translation.translatedText || ""
          );
        };

      const [arabic, hebrew] =
        await Promise.all([
          translate("ar"),
          translate("he"),
        ]);

      return {
        arabic: {
          name: arabic[0],
          description: arabic[1],
          features: arabic[2],
        },

        hebrew: {
          name: hebrew[0],
          description: hebrew[1],
          features: hebrew[2],
        },
      };
    }
  );

/* =========================================================
   PHASE 1 CLASS MEMBERSHIPS AND ACCESS
========================================================= */

function requireActiveUser(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must sign in first.");
  }

  return db.collection("users").doc(request.auth.uid).get();
}

async function requireRole(request, role) {
  const snapshot = await requireActiveUser(request);
  const data = snapshot.data();

  if (!snapshot.exists || data?.role !== role || data?.accountStatus === "blocked") {
    throw new HttpsError("permission-denied", "You do not have permission for this action.");
  }

  return data;
}

function membershipId(classId, studentId) {
  return `${safeId(classId)}_${safeId(studentId)}`;
}

function assignmentId(classId, contentType, contentId) {
  return `${safeId(classId)}_${safeId(contentType)}_${safeId(contentId)}`;
}

exports.joinClass = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    await requireRole(request, "student");
    const classCode = String(request.data?.classCode || "").trim().toLowerCase();

    if (!classCode || classCode.length > 60) {
      throw new HttpsError("invalid-argument", "A class code is required.");
    }

    const codeSnapshot = await db.collection("classCodes").doc(classCode).get();
    if (!codeSnapshot.exists) {
      throw new HttpsError("not-found", "Class code was not found.");
    }

    const classId = codeSnapshot.data().classId;
    const classSnapshot = await db.collection("classes").doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().status !== "active") {
      throw new HttpsError("failed-precondition", "This class is not active.");
    }

    const classData = classSnapshot.data();
    const memberRef = db.collection("classMembers").doc(membershipId(classId, request.auth.uid));
    const existing = await memberRef.get();

    if (existing.exists && existing.data().status === "active") {
      return { success: true, alreadyMember: true, membership: serializeValue(existing.data()) };
    }

    const membership = {
      classId,
      studentId: request.auth.uid,
      teacherId: classData.teacherId,
      status: "active",
      joinedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await memberRef.set(membership, { merge: true });
    return { success: true, membership: serializeValue({ ...membership, classId, studentId: request.auth.uid, teacherId: classData.teacherId }) };
  }
);

exports.leaveClass = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    await requireRole(request, "student");
    const classId = String(request.data?.classId || "").trim();
    if (!classId) {
      throw new HttpsError("invalid-argument", "Class ID is required.");
    }

    const memberRef = db.collection("classMembers").doc(membershipId(classId, request.auth.uid));
    const snapshot = await memberRef.get();
    if (!snapshot.exists) {
      return { success: true, alreadyLeft: true };
    }

    await memberRef.update({ status: "left", leftAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return { success: true };
  }
);

exports.removeClassMember = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    await requireRole(request, "teacher");
    const classId = String(request.data?.classId || "").trim();
    const studentId = String(request.data?.studentId || "").trim();
    const classSnapshot = await db.collection("classes").doc(classId).get();

    if (!classSnapshot.exists || classSnapshot.data().teacherId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "You do not own this class.");
    }

    await db.collection("classMembers").doc(membershipId(classId, studentId)).update({
      status: "removed",
      removedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true };
  }
);

exports.assignClassContent = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    await requireRole(request, "teacher");
    const classId = String(request.data?.classId || "").trim();
    const contentType = String(request.data?.contentType || "").trim();
    const contentId = String(request.data?.contentId || "").trim();

    if (!classId || !contentId || !["program", "lesson"].includes(contentType)) {
      throw new HttpsError("invalid-argument", "Class, content type, and content ID are required.");
    }

    const classSnapshot = await db.collection("classes").doc(classId).get();
    if (!classSnapshot.exists || classSnapshot.data().teacherId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "You do not own this class.");
    }

    const contentCollection = contentType === "program" ? "programs" : "lessons";
    const contentSnapshot = await db.collection(contentCollection).doc(contentId).get();
    if (!contentSnapshot.exists || contentSnapshot.data().status !== "published") {
      throw new HttpsError("failed-precondition", "Only published content can be assigned.");
    }

    if (contentType === "lesson" && contentSnapshot.data().teacherId && contentSnapshot.data().teacherId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "You cannot assign another teacher's lesson.");
    }

    const assignment = {
      classId,
      teacherId: request.auth.uid,
      contentType,
      contentId,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection("classAssignments").doc(assignmentId(classId, contentType, contentId)).set(assignment, { merge: true });
    return { success: true, assignment: serializeValue(assignment) };
  }
);

exports.resolveStudentAccess = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    await requireRole(request, "student");
    const studentId = request.auth.uid;
    const [memberships, purchases, access] = await Promise.all([
      db.collection("classMembers").where("studentId", "==", studentId).where("status", "==", "active").get(),
      db.collection("programPurchases").where("userId", "==", studentId).get(),
      db.collection("programAccess").where("userId", "==", studentId).where("status", "==", "active").get(),
    ]);

    const activeMemberships = memberships.docs.map((document) => ({ id: document.id, ...serializeValue(document.data()) }));
    const classIds = activeMemberships.map((membership) => membership.classId);
    const assignmentSnapshots = await Promise.all(classIds.map((classId) => db.collection("classAssignments").where("classId", "==", classId).where("status", "==", "active").get()));
    const assignments = assignmentSnapshots.flatMap((snapshot) => snapshot.docs.map((document) => ({ id: document.id, ...serializeValue(document.data()) })));

    return {
      success: true,
      memberships: activeMemberships,
      assignments,
      purchases: purchases.docs.map((document) => ({ id: document.id, ...serializeValue(document.data()) })),
      access: access.docs.map((document) => ({ id: document.id, ...serializeValue(document.data()) })),
    };
  }
);


/* =========================================================
   RESET STUDENT PASSWORD
========================================================= */

const MIN_STUDENT_PASSWORD_LENGTH = 8;
const MAX_STUDENT_PASSWORD_LENGTH = 128;

async function teacherManagesStudent(teacherUid, studentUid, studentData) {
  if (studentData.teacherId && studentData.teacherId === teacherUid) {
    return true;
  }

  // Multi-teacher/multi-class model: check active classMembers relationship.
  const membershipsSnapshot = await db
    .collection("classMembers")
    .where("studentId", "==", studentUid)
    .where("status", "==", "active")
    .get();

  return membershipsSnapshot.docs.some(
    (document) => document.data().teacherId === teacherUid
  );
}

exports.resetStudentPassword = onCall(
  { region: "europe-west1", timeoutSeconds: 30, memory: "256MiB" },
  async (request) => {
    const callerSnapshot = await requireActiveUser(request);
    const callerData = callerSnapshot.data();

    if (
      !callerSnapshot.exists ||
      callerData?.accountStatus === "blocked" ||
      !["teacher", "owner"].includes(callerData?.role)
    ) {
      throw new HttpsError(
        "permission-denied",
        "You do not have permission for this action."
      );
    }

    const studentUid = String(request.data?.studentUid || "").trim();
    const newPassword = String(request.data?.newPassword || "");

    if (!studentUid || studentUid.length > 128) {
      throw new HttpsError("invalid-argument", "A valid student is required.");
    }

    if (
      newPassword.length < MIN_STUDENT_PASSWORD_LENGTH ||
      newPassword.length > MAX_STUDENT_PASSWORD_LENGTH
    ) {
      throw new HttpsError(
        "invalid-argument",
        `Password must be between ${MIN_STUDENT_PASSWORD_LENGTH} and ${MAX_STUDENT_PASSWORD_LENGTH} characters.`
      );
    }

    const studentSnapshot = await db.collection("users").doc(studentUid).get();

    if (!studentSnapshot.exists) {
      throw new HttpsError("not-found", "Student was not found.");
    }

    const studentData = studentSnapshot.data();

    if (studentData.role !== "student") {
      throw new HttpsError("failed-precondition", "This account is not a student.");
    }

    if (callerData.role !== "owner") {
      const authorized = await teacherManagesStudent(
        request.auth.uid,
        studentUid,
        studentData
      );

      if (!authorized) {
        throw new HttpsError(
          "permission-denied",
          "You are not authorized to manage this student."
        );
      }
    }

    try {
      await getAuth(app).updateUser(studentUid, { password: newPassword });
    } catch (updateError) {
      // Never log the password itself, only the error code/message.
      console.error(
        "resetStudentPassword auth update failed:",
        updateError.code || updateError.message
      );

      throw new HttpsError(
        "internal",
        "Could not update the student's password."
      );
    }

    return { success: true };
  }
);


/* =========================================================
   PADDLE SECRET
========================================================= */

const paddleWebhookSecret =
  defineSecret(
    "PADDLE_WEBHOOK_SECRET"
  );


/* =========================================================
   ENVIRONMENT
========================================================= */

const paddleEnvironment =
  process.env.PADDLE_ENVIRONMENT ||
  "sandbox";

if (
  ![
    "sandbox",
    "production",
  ].includes(paddleEnvironment)
) {
  throw new Error(
    "Invalid PADDLE_ENVIRONMENT."
  );
}

const IS_SANDBOX =
  paddleEnvironment === "sandbox";


const STUDENT_LOGIN_WINDOW_MS =
  10 * 60 * 1000;

const STUDENT_LOGIN_MAX_ATTEMPTS =
  12;

const STUDENT_AVAILABILITY_MAX_ATTEMPTS =
  80;


/* =========================================================
   VALID PLANS
========================================================= */

/*
  We keep these for now because your old
  subscription system still exists.

  Program purchases are handled separately.
*/

const STUDENT_PLANS =
  new Set([
    "oneProgram",
    "allAccess",
    "family",
  ]);

const TEACHER_PLANS =
  new Set([
    "teacherBasic",
    "teacherPro",
  ]);


/* =========================================================
   SIMPLE BACKEND TEST
========================================================= */

exports.paymentTest =
  onRequest(
    {
      region: "europe-west1",
      cors: true,
    },

    (request, response) => {
      response
        .status(200)
        .json({
          success: true,

          app:
            "TechMinds",

          paymentProvider:
            "Paddle",

          environment:
            IS_SANDBOX
              ? "sandbox"
              : "production",

          message:
            "TechMinds payment backend is working",
        });
    }
  );


/* =========================================================
   GENERAL HELPERS
========================================================= */

function safeId(value) {
  return String(value || "")
    .replace(/\//g, "_")
    .replace(/\s+/g, "_");
}


function serializeValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return value ?? null;
  }

  if (
    value &&
    typeof value.toDate === "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(
      serializeValue
    );
  }

  if (
    typeof value === "object"
  ) {
    const result = {};

    for (
      const [
        key,
        itemValue,
      ] of Object.entries(value)
    ) {
      result[key] =
        serializeValue(
          itemValue
        );
    }

    return result;
  }

  return value;
}


/* =========================================================
   STUDENT AUTH HELPERS
========================================================= */

function normalizeStudentLoginValue(
  value
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}


function getRequestIp(request) {
  return String(
    request.rawRequest?.ip ||
    request.rawRequest
      ?.socket
      ?.remoteAddress ||
    "unknown"
  );
}


async function enforceStudentAuthRateLimit(
  request,
  scope,
  maximumAttempts,
  subject = ""
) {
  const now =
    Date.now();

  const fingerprint =
    createHash("sha256")
      .update(
        `${process.env.GCLOUD_PROJECT || "techminds"}:${scope}:${subject}:${getRequestIp(request)}`
      )
      .digest("hex");

  const rateLimitRef =
    db
      .collection(
        "studentLoginRateLimits"
      )
      .doc(fingerprint);

  await db.runTransaction(
    async (
      transaction
    ) => {
      const snapshot =
        await transaction.get(
          rateLimitRef
        );

      const data =
        snapshot.exists
          ? snapshot.data()
          : null;

      const windowStartedAtMs =
        Number(
          data?.windowStartedAtMs ||
          0
        );

      const insideWindow =
        now -
          windowStartedAtMs <
        STUDENT_LOGIN_WINDOW_MS;

      const attempts =
        insideWindow
          ? Number(
              data?.attempts ||
              0
            )
          : 0;

      if (
        attempts >=
        maximumAttempts
      ) {
        throw new HttpsError(
          "resource-exhausted",
          "Too many attempts. Please try again later."
        );
      }

      transaction.set(
        rateLimitRef,

        {
          scope,

          attempts:
            attempts + 1,

          windowStartedAtMs:
            insideWindow
              ? windowStartedAtMs
              : now,

          updatedAt:
            FieldValue
              .serverTimestamp(),

          expiresAt:
            Timestamp.fromMillis(
              now +
                STUDENT_LOGIN_WINDOW_MS
            ),
        },

        {
          merge: true,
        }
      );
    }
  );
}


// Identifier (student code/username) does not resolve to any account.
function invalidStudentIdentifier() {
  throw new HttpsError(
    "not-found",
    "student-identifier-not-found"
  );
}


// The resolved account/class is unusable.
function studentAccountUnavailable() {
  throw new HttpsError(
    "failed-precondition",
    "student-account-unavailable"
  );
}


/* =========================================================
   STUDENT ALIAS AVAILABILITY
========================================================= */

exports.studentAliasAvailable =
  onCall(
    {
      region: "europe-west1",

      timeoutSeconds: 15,

      memory: "256MiB",

      maxInstances: 20,
    },

    async (request) => {
      const input =
        request.data || {};

      const kind =
        String(
          input.kind || ""
        );

      const normalizedValue =
        normalizeStudentLoginValue(
          input.value
        );

      const validUsername =
        kind === "username" &&
        /^[\p{L}\p{N}._-]{3,24}$/u
          .test(
            normalizedValue
          );

      const validCode =
        kind === "code" &&
        /^[a-z0-9._-]{3,60}$/
          .test(
            normalizedValue
          );

      if (
        !validUsername &&
        !validCode
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid student alias."
        );
      }

      await enforceStudentAuthRateLimit(
        request,
        "availability",
        STUDENT_AVAILABILITY_MAX_ATTEMPTS
      );

      const prefix =
        kind === "username"
          ? "u_"
          : "c_";

      const snapshot =
        await db
          .collection(
            "studentLoginIndex"
          )
          .doc(
            prefix +
              normalizedValue
          )
          .get();

      return {
        available:
          !snapshot.exists,
      };
    }
  );


/* =========================================================
   STUDENT LOGIN
========================================================= */

exports.studentLogin =
  onCall(
    {
      region: "europe-west1",

      timeoutSeconds: 20,

      memory: "256MiB",

      maxInstances: 20,
    },

    async (request) => {
      const input =
        request.data || {};

      const studentCode =
        normalizeStudentLoginValue(
          input.studentCode
        );

      if (!/^[\p{L}\p{N}._-]{3,60}$/u.test(studentCode)) {
        throw new HttpsError("invalid-argument", "Invalid student alias.");
      }

      await enforceStudentAuthRateLimit(
        request,
        "login",
        STUDENT_LOGIN_MAX_ATTEMPTS,
        studentCode
      );

      // Resolve codes first, then usernames. Passwords go only to client Auth.
      let indexSnapshot = await db.collection("studentLoginIndex")
        .doc(`c_${studentCode}`).get();
      if (!indexSnapshot.exists) {
        indexSnapshot = await db.collection("studentLoginIndex")
          .doc(`u_${studentCode}`).get();
      }
      if (!indexSnapshot.exists) {
        invalidStudentIdentifier();
      }
      const indexData = indexSnapshot.data();
      if (typeof indexData.uid !== "string" || !indexData.uid ||
          typeof indexData.authEmail !== "string" || !indexData.authEmail) {
        studentAccountUnavailable();
      }

      const studentSnapshot =
        await db
          .collection("users")
          .doc(indexData.uid)
          .get();

      if (
        !studentSnapshot.exists
      ) {
        invalidStudentIdentifier();
      }

      const student =
        studentSnapshot.data();

      const studentClassId =
        typeof student.classId ===
        "string"
          ? student.classId
          : "";

      if (
        student.role !==
          "student" ||
        student.studentAccountType ===
          "independent" ||
        student.accountStatus !==
          "active" ||
        !studentClassId ||
        (
          indexData.classId &&
          indexData.classId !==
            studentClassId
        )
      ) {
        studentAccountUnavailable();
      }

      const classSnapshot =
        await db
          .collection("classes")
          .doc(studentClassId)
          .get();

      if (
        !classSnapshot.exists
      ) {
        studentAccountUnavailable();
      }

      const classData =
        classSnapshot.data();

      if (
        classData.status !==
          "active" ||
        (
          student.teacherId &&
          classData.teacherId !==
            student.teacherId
        )
      ) {
        studentAccountUnavailable();
      }

      return {
        authEmail: indexData.authEmail,
        uid: indexData.uid,
      };
    }
  );


/* =========================================================
   GET PURCHASED PROGRAM
========================================================= */

exports.getPurchasedProgram =
  onCall(
    {
      region: "europe-west1",

      timeoutSeconds: 30,

      memory: "256MiB",
    },

    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "You must sign in first."
        );
      }

      const userId =
        request.auth.uid;

      const programId =
        String(
          request.data
            ?.programId ||
            ""
        ).trim();

      if (!programId) {
        throw new HttpsError(
          "invalid-argument",
          "Program ID is required."
        );
      }

      const userSnapshot =
        await db
          .collection("users")
          .doc(userId)
          .get();

      if (
        !userSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "TechMinds user was not found."
        );
      }

      const userData =
        userSnapshot.data();

      const role =
        userData.role;

      if (
        ![
          "owner",
          "teacher",
          "student",
        ].includes(role)
      ) {
        throw new HttpsError(
          "permission-denied",
          "Invalid TechMinds account role."
        );
      }

      const programSnapshot =
        await db
          .collection("programs")
          .doc(programId)
          .get();

      if (
        !programSnapshot.exists
      ) {
        throw new HttpsError(
          "not-found",
          "Program was not found."
        );
      }

      const programData =
        programSnapshot.data();

      if (
        role !== "owner" &&
        programData.status !==
          "published"
      ) {
        throw new HttpsError(
          "permission-denied",
          "This program is not published."
        );
      }

      let accessData =
        null;


      /* OWNER */

      if (
        role === "owner"
      ) {
        accessData = {
          accessType:
            "owner",

          licenseType:
            "owner",

          ownerType:
            "owner",

          status:
            "active",

          programId,

          userId,
        };
      }


      /* TEACHER PERSONAL PURCHASE */

      if (
        !accessData &&
        role === "teacher"
      ) {
        const accessId =
          `teacher_${safeId(
            userId
          )}_${safeId(
            programId
          )}`;

        const accessSnapshot =
          await db
            .collection(
              "programAccess"
            )
            .doc(accessId)
            .get();

        if (
          accessSnapshot.exists
        ) {
          const data =
            accessSnapshot.data();

          if (
            data.status ===
              "active" &&
            data.programId ===
              programId &&
            (
              data.userId ===
                userId ||
              data.teacherId ===
                userId
            )
          ) {
            accessData = {
              id:
                accessSnapshot.id,

              ...data,
            };
          }
        }
      }


      /* TEACHER CLASS LICENSE */

      if (
        !accessData &&
        role === "teacher"
      ) {
        const classesSnapshot =
          await db
            .collection("classes")
            .where(
              "teacherId",
              "==",
              userId
            )
            .get();

        for (
          const classDocument
          of classesSnapshot.docs
        ) {
          const classId =
            classDocument.id;

          const accessId =
            `class_${safeId(
              classId
            )}_${safeId(
              programId
            )}`;

          const accessSnapshot =
            await db
              .collection(
                "programAccess"
              )
              .doc(accessId)
              .get();

          if (
            accessSnapshot.exists
          ) {
            const data =
              accessSnapshot.data();

            if (
              data.status ===
                "active" &&
              data.programId ===
                programId &&
              data.teacherId ===
                userId &&
              data.classId ===
                classId
            ) {
              accessData = {
                id:
                  accessSnapshot.id,

                ...data,
              };

              break;
            }
          }
        }
      }


      /* STUDENT PERSONAL PURCHASE */

      if (
        !accessData &&
        role === "student"
      ) {
        const accessId =
          `student_${safeId(
            userId
          )}_${safeId(
            programId
          )}`;

        const accessSnapshot =
          await db
            .collection(
              "programAccess"
            )
            .doc(accessId)
            .get();

        if (
          accessSnapshot.exists
        ) {
          const data =
            accessSnapshot.data();

          if (
            data.status ===
              "active" &&
            data.programId ===
              programId &&
            (
              data.userId ===
                userId ||
              data.studentId ===
                userId
            )
          ) {
            accessData = {
              id:
                accessSnapshot.id,

              ...data,
            };
          }
        }
      }


      /* STUDENT CLASS ACCESS */

      if (
        !accessData &&
        role === "student" &&
        userData.classId
      ) {
        const classId =
          String(
            userData.classId
          );

        const accessId =
          `class_${safeId(
            classId
          )}_${safeId(
            programId
          )}`;

        const accessSnapshot =
          await db
            .collection(
              "programAccess"
            )
            .doc(accessId)
            .get();

        if (
          accessSnapshot.exists
        ) {
          const data =
            accessSnapshot.data();

          if (
            data.status ===
              "active" &&
            data.programId ===
              programId &&
            data.classId ===
              classId
          ) {
            accessData = {
              id:
                accessSnapshot.id,

              ...data,
            };
          }
        }
      }

      /* STUDENT MULTI-CLASS ASSIGNMENT ACCESS */

      if (!accessData && role === "student") {
        const membershipsSnapshot = await db
          .collection("classMembers")
          .where("studentId", "==", userId)
          .get();

        for (const membershipDocument of membershipsSnapshot.docs) {
          if (membershipDocument.data().status !== "active") {
            continue;
          }

          const classId = membershipDocument.data().classId;
          const assignmentId = `${classId}_program_${programId}`;
          const assignmentSnapshot = await db
            .collection("classAssignments")
            .doc(assignmentId)
            .get();

          if (assignmentSnapshot.exists && assignmentSnapshot.data().status === "active") {
            accessData = {
              id: assignmentSnapshot.id,
              accessType: "class",
              ...assignmentSnapshot.data(),
            };
            break;
          }
        }
      }


      if (!accessData) {
        throw new HttpsError(
          "permission-denied",
          "You do not have access to this program."
        );
      }

      if (request.data?.accessOnly === true) {
        return { success: true, role, access: serializeValue(accessData) };
      }


      const lessonsSnapshot =
        await db
          .collection("lessons")
          .where(
            "programId",
            "==",
            programId
          )
          .get();

      const lessons =
        lessonsSnapshot.docs
          .map(
            (
              lessonDocument
            ) => ({
              id:
                lessonDocument.id,

              ...lessonDocument.data(),
            })
          )
          .filter(
            (lesson) => {
              if (
                role === "owner"
              ) {
                return (
                  lesson.lessonType ===
                  "commercial"
                );
              }

              return (
                lesson.lessonType ===
                  "commercial" &&
                lesson.status ===
                  "published"
              );
            }
          );

      lessons.sort(
        (first, second) => {
          const firstOrder =
            Number(
              first.order ??
              first.lessonOrder ??
              first.position ??
              999999
            );

          const secondOrder =
            Number(
              second.order ??
              second.lessonOrder ??
              second.position ??
              999999
            );

          if (
            firstOrder !==
            secondOrder
          ) {
            return (
              firstOrder -
              secondOrder
            );
          }

          const firstCreatedAt =
            first.createdAt
              ?.seconds ||
            0;

          const secondCreatedAt =
            second.createdAt
              ?.seconds ||
            0;

          return (
            firstCreatedAt -
            secondCreatedAt
          );
        }
      );

      return {
        success: true,

        role,

        access:
          serializeValue(
            accessData
          ),

        program:
          serializeValue({
            id:
              programSnapshot.id,

            ...programData,
          }),

        lessons:
          serializeValue(
            lessons
          ),
      };
    }
  );


/* =========================================================
   VERIFY PADDLE SIGNATURE
========================================================= */

function verifyPaddleSignature(
  rawBody,
  signatureHeader,
  secret
) {
  if (
    !rawBody ||
    !signatureHeader ||
    !secret
  ) {
    return false;
  }

  let timestamp =
    null;

  const signatures =
    [];

  const parts =
    signatureHeader.split(";");

  for (
    const part of parts
  ) {
    const separatorIndex =
      part.indexOf("=");

    if (
      separatorIndex === -1
    ) {
      continue;
    }

    const key =
      part
        .slice(
          0,
          separatorIndex
        )
        .trim();

    const value =
      part
        .slice(
          separatorIndex + 1
        )
        .trim();

    if (
      key === "ts"
    ) {
      timestamp =
        value;
    }

    if (
      key === "h1"
    ) {
      signatures.push(
        value
      );
    }
  }

  if (
    !timestamp ||
    signatures.length === 0
  ) {
    return false;
  }

  const timestampNumber =
    Number(timestamp);

  if (
    !Number.isFinite(
      timestampNumber
    )
  ) {
    return false;
  }

  const now =
    Math.floor(
      Date.now() / 1000
    );

  const age =
    Math.abs(
      now -
      timestampNumber
    );

  /*
    Five minutes is intentionally
    tolerant for Firebase cold starts.
  */

  if (age > 300) {
    console.error(
      "Expired Paddle webhook:",
      {
        timestamp:
          timestampNumber,

        age,
      }
    );

    return false;
  }

  const signedPayload =
    `${timestamp}:${rawBody}`;

  const expectedSignature =
    createHmac(
      "sha256",
      secret
    )
      .update(
        signedPayload
      )
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    );

  for (
    const signature
    of signatures
  ) {
    try {
      const receivedBuffer =
        Buffer.from(
          signature,
          "hex"
        );

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        continue;
      }

      if (
        timingSafeEqual(
          expectedBuffer,
          receivedBuffer
        )
      ) {
        return true;
      }
    } catch (error) {
      console.error(
        "Signature comparison error:",
        error
      );
    }
  }

  return false;
}


/* =========================================================
   PAYMENT HELPERS
========================================================= */

function getTransactionPriceIds(
  transaction
) {
  return (
    transaction.items || []
  )
    .map(
      (item) =>
        item?.price?.id
    )
    .filter(Boolean);
}


function getAmount(
  transaction
) {
  const amountMinor =
    Number(
      transaction
        ?.details
        ?.totals
        ?.total ||
      0
    );

  return {
    amountMinor,

    amount:
      amountMinor / 100,

    currency:
      transaction
        ?.currency_code ||
      "ILS",
  };
}


function getProgramName(
  program
) {
  if (
    typeof program.title ===
    "string"
  ) {
    return program.title;
  }

  return (
    program
      ?.title
      ?.en ||
    program
      ?.title
      ?.ar ||
    program
      ?.title
      ?.he ||
    program.name ||
    "TechMinds Program"
  );
}


/* =========================================================
   PROCESS PROGRAM PURCHASE
========================================================= */

async function processProgramPurchase(
  event,
  transactionData,
  customData,
  eventRef
) {
  const userId =
    String(
      customData
        .techminds_user_id ||
      ""
    ).trim();

  const programId =
    String(
      customData
        .program_id ||
      ""
    ).trim();

  const licenseType =
    String(
      customData
        .license_type ||
      ""
    ).trim();

  const classId =
    customData.class_id
      ? String(
          customData.class_id
        ).trim()
      : null;


  if (
    !userId ||
    !programId
  ) {
    throw new Error(
      "Missing TechMinds user or program ID."
    );
  }


  if (
    ![
      "student",
      "teacher",
      "class",
    ].includes(
      licenseType
    )
  ) {
    throw new Error(
      "Invalid program license type."
    );
  }


  const userRef =
    db
      .collection("users")
      .doc(userId);

  const programRef =
    db
      .collection("programs")
      .doc(programId);


  const [
    userSnapshot,
    programSnapshot,
  ] =
    await Promise.all([
      userRef.get(),
      programRef.get(),
    ]);


  if (
    !userSnapshot.exists
  ) {
    throw new Error(
      "TechMinds user does not exist."
    );
  }


  if (
    !programSnapshot.exists
  ) {
    throw new Error(
      "TechMinds program does not exist."
    );
  }


  const userData =
    userSnapshot.data();

  const programData =
    programSnapshot.data();


  /* ROLE VALIDATION */
  if (userData.accountStatus && userData.accountStatus !== "active") {
    throw new Error("This account is not active.");
  }
  if (transactionData.subscription_id ||
      transactionData.items?.some((item) => item.price?.billing_cycle)) {
    throw new Error("Program purchases require a one-time Paddle price.");
  }

  if (
    licenseType ===
      "student" &&
    userData.role !==
      "student"
  ) {
    throw new Error(
      "Student price can only be purchased by a student account."
    );
  }


  if (
    licenseType ===
      "teacher" &&
    userData.role !==
      "teacher"
  ) {
    throw new Error(
      "Teacher price can only be purchased by a teacher account."
    );
  }


  if (
    licenseType ===
      "class" &&
    userData.role !==
      "teacher"
  ) {
    throw new Error(
      "Class price can only be purchased by a teacher account."
    );
  }


  /* CLASS VALIDATION */

  let classData =
    null;

  if (
    licenseType ===
    "class"
  ) {
    if (!classId) {
      throw new Error(
        "Class ID is required."
      );
    }

    const classSnapshot =
      await db
        .collection("classes")
        .doc(classId)
        .get();

    if (
      !classSnapshot.exists
    ) {
      throw new Error(
        "Selected class does not exist."
      );
    }

    classData =
      classSnapshot.data();

    if (
      classData.teacherId !==
      userId
    ) {
      throw new Error(
        "Teacher does not own this class."
      );
    }
  }


  /* PRICE VALIDATION */

  const transactionPriceIds =
    getTransactionPriceIds(
      transactionData
    );

  if (
    transactionPriceIds.length ===
    0
  ) {
    throw new Error(
      "No Paddle price was found on the transaction."
    );
  }


  /*
    Expected Firestore structure:

    programs/{programId}

    paddlePriceIds: {
      student: "pri_...",
      teacher: "pri_...",
      class: "pri_..."
    }
  */

  const expectedPriceId =
    programData
      ?.paddlePriceIds
      ?.[licenseType] ||
    null;


  /*
    IMPORTANT:
    We validate the price in Sandbox too.

    This prevents somebody changing
    customData from student -> teacher
    while paying the cheaper student price.
  */

  if (!expectedPriceId || !/^pri_[a-z0-9]{26}$/.test(expectedPriceId)) {
    throw new Error(
      `Paddle ${licenseType} Price ID is not configured for this program.`
    );
  }


  if (
    transactionPriceIds.length !== 1 ||
    transactionPriceIds[0] !== expectedPriceId ||
    transactionData.items.length !== 1 ||
    transactionData.items[0].quantity !== 1
  ) {
    throw new Error(
      "Paddle price does not match the requested program license."
    );
  }


  const transactionId =
    transactionData.id;

  if (!transactionId) {
    throw new Error(
      "Missing Paddle transaction ID."
    );
  }


  const {
    amount,
    amountMinor,
    currency,
  } =
    getAmount(
      transactionData
    );


  const purchaseRef =
    db
      .collection(
        "programPurchases"
      )
      .doc(transactionId);


  let accessId;

  if (
    licenseType ===
    "class"
  ) {
    accessId =
      `class_${safeId(
        classId
      )}_${safeId(
        programId
      )}`;
  } else {
    accessId =
      `${safeId(
        licenseType
      )}_${safeId(
        userId
      )}_${safeId(
        programId
      )}`;
  }


  const accessRef =
    db
      .collection(
        "programAccess"
      )
      .doc(accessId);


  await db.runTransaction(
    async (
      firestoreTransaction
    ) => {
      const [
        eventSnapshot,
        purchaseSnapshot,
      ] =
        await Promise.all([
          firestoreTransaction.get(
            eventRef
          ),

          firestoreTransaction.get(
            purchaseRef
          ),
        ]);


      if (
        eventSnapshot.exists
      ) {
        return;
      }


      if (
        purchaseSnapshot.exists
      ) {
        firestoreTransaction.set(
          eventRef,

          {
            eventId:
              event.event_id,

            eventType:
              event.event_type,

            transactionId,

            status:
              "duplicate",

            processedAt:
              FieldValue
                .serverTimestamp(),
          },

          {
            merge: true,
          }
        );

        return;
      }


      /* PURCHASE */

      firestoreTransaction.set(
        purchaseRef,

        {
          userId,

          customerName:
            userData.name ||
            userData.fullName ||
            userData.username ||
            "TechMinds User",

          customerEmail:
            userData.email ||
            null,

          customerRole:
            userData.role,

          programId,

          programName:
            getProgramName(
              programData
            ),

          programIcon:
            programData.icon ||
            "🚀",

          licenseType,

          accessType:
            licenseType,

          priceId:
            expectedPriceId,

          classId:
            licenseType ===
              "class"
              ? classId
              : null,

          className:
            classData?.name ||
            classData?.className ||
            null,

          amount,

          amountMinor,

          currency,

          paymentStatus:
            "paid",

          accessStatus:
            "active",

          paymentProvider:
            "paddle",

          environment:
            IS_SANDBOX
              ? "sandbox"
              : "production",

          transactionId,

          paddleCustomerId:
            transactionData
              .customer_id ||
            null,

          paddleSubscriptionId:
            transactionData
              .subscription_id ||
            null,

          paddlePriceIds:
            transactionPriceIds,

          createdAt:
            FieldValue
              .serverTimestamp(),

          paidAt:
            FieldValue
              .serverTimestamp(),
        }
      );


      /* ACCESS */

      const accessData = {
        programId,

        userId,

        accessType:
          licenseType,

        licenseType,

        status:
          "active",

        transactionId,

        purchaseId:
          transactionId,

        priceId:
          expectedPriceId,

        paymentProvider:
          "paddle",

        environment:
          IS_SANDBOX
            ? "sandbox"
            : "production",

        grantedAt:
          FieldValue
            .serverTimestamp(),

        updatedAt:
          FieldValue
            .serverTimestamp(),
      };


      if (
        licenseType ===
        "student"
      ) {
        accessData.ownerType =
          "student";

        accessData.studentId =
          userId;
      }


      if (
        licenseType ===
        "teacher"
      ) {
        accessData.ownerType =
          "teacher";

        accessData.teacherId =
          userId;
      }


      if (
        licenseType ===
        "class"
      ) {
        accessData.ownerType =
          "teacher";

        accessData.teacherId =
          userId;

        accessData.classId =
          classId;
      }


      firestoreTransaction.set(
        accessRef,
        accessData,
        {
          merge: true,
        }
      );


      /* USER UPDATE */

      firestoreTransaction.set(
        userRef,

        {
          pendingPurchase:
            FieldValue.delete(),

          paymentStatus:
            "paid",

          lastPurchaseId:
            transactionId,

          lastPaymentAt:
            FieldValue
              .serverTimestamp(),
        },

        {
          merge: true,
        }
      );


      /* SALES COUNT */

      firestoreTransaction.set(
        programRef,

        {
          salesCount:
            FieldValue
              .increment(1),

          updatedAt:
            FieldValue
              .serverTimestamp(),
        },

        {
          merge: true,
        }
      );


      /* WEBHOOK EVENT */

      firestoreTransaction.set(
        eventRef,

        {
          eventId:
            event.event_id,

          eventType:
            event.event_type,

          transactionId,

          checkoutType:
            "program",

          userId,

          programId,

          licenseType,

          priceId:
            expectedPriceId,

          status:
            "processed",

          processedAt:
            FieldValue
              .serverTimestamp(),
        }
      );
    }
  );


  console.log(
    "Program purchase processed:",
    {
      transactionId,
      userId,
      programId,
      licenseType,
      priceId:
        expectedPriceId,
    }
  );
}


/* =========================================================
   PROCESS PLAN PURCHASE
========================================================= */

async function processPlanPurchase(
  event,
  transactionData,
  customData,
  eventRef
) {
  const userId =
    customData
      .techminds_user_id;

  const planId =
    customData.plan_id;

  const billingCycle =
    customData
      .billing_cycle;

  const trackId =
    customData.track_id ||
    null;


  if (
    !userId ||
    !planId
  ) {
    throw new Error(
      "Missing TechMinds user or plan ID."
    );
  }


  if (
    billingCycle !==
      "monthly" &&
    billingCycle !==
      "yearly"
  ) {
    throw new Error(
      "Invalid billing cycle."
    );
  }


  const userRef =
    db
      .collection("users")
      .doc(userId);

  const userSnapshot =
    await userRef.get();


  if (
    !userSnapshot.exists
  ) {
    throw new Error(
      "TechMinds user does not exist."
    );
  }


  const userData =
    userSnapshot.data();


  if (
    userData.role ===
      "student" &&
    !STUDENT_PLANS.has(
      planId
    )
  ) {
    throw new Error(
      "Invalid student plan."
    );
  }


  if (
    userData.role ===
      "teacher" &&
    !TEACHER_PLANS.has(
      planId
    )
  ) {
    throw new Error(
      "Invalid teacher plan."
    );
  }


  if (
    userData.role !==
      "student" &&
    userData.role !==
      "teacher"
  ) {
    throw new Error(
      "Invalid subscription account role."
    );
  }


  const transactionPriceIds =
    getTransactionPriceIds(
      transactionData
    );


  if (!IS_SANDBOX) {
    const billingSnapshot =
      await db
        .collection(
          "platformSettings"
        )
        .doc("billing")
        .get();

    if (
      !billingSnapshot.exists
    ) {
      throw new Error(
        "Billing settings are missing."
      );
    }

    const billingData =
      billingSnapshot.data();

    const expectedPriceId =
      billingData
        ?.paddlePlanPriceIds
        ?.[planId]
        ?.[billingCycle];

    if (!expectedPriceId) {
      throw new Error(
        "Plan Paddle Price ID is missing."
      );
    }

    if (
      !transactionPriceIds.includes(
        expectedPriceId
      )
    ) {
      throw new Error(
        "Paddle price does not match the selected plan."
      );
    }

    if (
      !transactionData
        .subscription_id
    ) {
      throw new Error(
        "Recurring Paddle subscription was not created."
      );
    }
  }


  const transactionId =
    transactionData.id;


  const {
    amount,
    amountMinor,
    currency,
  } =
    getAmount(
      transactionData
    );


  const subscriptionRef =
    db
      .collection(
        "subscriptions"
      )
      .doc(userId);


  const paymentRef =
    db
      .collection(
        "subscriptionPayments"
      )
      .doc(transactionId);


  await db.runTransaction(
    async (
      firestoreTransaction
    ) => {
      const [
        eventSnapshot,
        paymentSnapshot,
      ] =
        await Promise.all([
          firestoreTransaction.get(
            eventRef
          ),

          firestoreTransaction.get(
            paymentRef
          ),
        ]);


      if (
        eventSnapshot.exists
      ) {
        return;
      }


      if (
        paymentSnapshot.exists
      ) {
        firestoreTransaction.set(
          eventRef,

          {
            eventId:
              event.event_id,

            transactionId,

            status:
              "duplicate",

            processedAt:
              FieldValue
                .serverTimestamp(),
          }
        );

        return;
      }


      firestoreTransaction.set(
        paymentRef,

        {
          userId,

          planId,

          billingCycle,

          trackId,

          amount,

          amountMinor,

          currency,

          paymentStatus:
            "paid",

          paymentProvider:
            "paddle",

          environment:
            IS_SANDBOX
              ? "sandbox"
              : "production",

          transactionId,

          paddleCustomerId:
            transactionData
              .customer_id ||
            null,

          paddleSubscriptionId:
            transactionData
              .subscription_id ||
            null,

          paddlePriceIds:
            transactionPriceIds,

          paidAt:
            FieldValue
              .serverTimestamp(),

          createdAt:
            FieldValue
              .serverTimestamp(),
        }
      );


      firestoreTransaction.set(
        subscriptionRef,

        {
          userId,

          planId,

          billingCycle,

          trackId,

          status:
            "active",

          paymentStatus:
            "paid",

          paymentProvider:
            "paddle",

          environment:
            IS_SANDBOX
              ? "sandbox"
              : "production",

          paddleCustomerId:
            transactionData
              .customer_id ||
            null,

          paddleSubscriptionId:
            transactionData
              .subscription_id ||
            null,

          lastTransactionId:
            transactionId,

          startedAt:
            FieldValue
              .serverTimestamp(),

          updatedAt:
            FieldValue
              .serverTimestamp(),
        },

        {
          merge: true,
        }
      );


      const userUpdate = {
        plan:
          planId,

        billingCycle,

        subscriptionStatus:
          "active",

        paymentStatus:
          "paid",

        paddleCustomerId:
          transactionData
            .customer_id ||
          null,

        paddleSubscriptionId:
          transactionData
            .subscription_id ||
          null,

        pendingPlan:
          FieldValue.delete(),

        pendingBillingCycle:
          FieldValue.delete(),

        lastPaymentAt:
          FieldValue
            .serverTimestamp(),
      };


      if (trackId) {
        userUpdate.learningTrack =
          trackId;

        userUpdate.pendingTrack =
          FieldValue.delete();
      }


      firestoreTransaction.set(
        userRef,
        userUpdate,
        {
          merge: true,
        }
      );


      firestoreTransaction.set(
        eventRef,

        {
          eventId:
            event.event_id,

          eventType:
            event.event_type,

          transactionId,

          checkoutType:
            "plan",

          userId,

          planId,

          status:
            "processed",

          processedAt:
            FieldValue
              .serverTimestamp(),
        }
      );
    }
  );


  console.log(
    "Subscription payment processed:",
    {
      transactionId,
      userId,
      planId,
      billingCycle,
    }
  );
}


/* =========================================================
   PADDLE WEBHOOK
========================================================= */

exports.paddleWebhook =
  onRequest(
    {
      region: "europe-west1",

      cors: false,

      secrets: [
        paddleWebhookSecret,
      ],

      timeoutSeconds: 60,

      memory: "256MiB",
    },

    async (
      request,
      response
    ) => {
      try {
        if (
          request.method !==
          "POST"
        ) {
          response
            .status(405)
            .send(
              "Method not allowed"
            );

          return;
        }


        if (
          !request.rawBody
        ) {
          console.error(
            "Paddle raw body missing."
          );

          response
            .status(400)
            .send(
              "Raw body missing"
            );

          return;
        }


        const rawBody =
          request.rawBody
            .toString(
              "utf8"
            );


        const signature =
          request.get(
            "Paddle-Signature"
          );


        const secret =
          paddleWebhookSecret
            .value();


        const validSignature =
          verifyPaddleSignature(
            rawBody,
            signature,
            secret
          );


        if (
          !validSignature
        ) {
          console.error(
            "Invalid Paddle signature."
          );

          response
            .status(401)
            .send(
              "Invalid signature"
            );

          return;
        }


        let event;

        try {
          event =
            JSON.parse(
              rawBody
            );
        } catch (
          parseError
        ) {
          console.error(
            "Invalid Paddle JSON:",
            parseError
          );

          response
            .status(400)
            .send(
              "Invalid JSON"
            );

          return;
        }


        console.log(
          "Paddle webhook received:",
          {
            eventId:
              event.event_id,

            eventType:
              event.event_type,

            transactionId:
              event.data?.id,
          }
        );


        if (
          event.event_type !==
          "transaction.completed"
        ) {
          response
            .status(200)
            .json({
              success: true,

              ignored: true,

              eventType:
                event.event_type,
            });

          return;
        }


        const transactionData =
          event.data;


        if (
          !transactionData ||
          transactionData.status !==
            "completed"
        ) {
          response
            .status(200)
            .json({
              success: true,

              ignored: true,

              reason:
                "Transaction not completed",
            });

          return;
        }


        const customData =
          transactionData
            .custom_data ||
          {};


        const checkoutType =
          customData
            .checkout_type;


        if (!checkoutType) {
          console.log(
            "Transaction has no TechMinds custom data."
          );

          response
            .status(200)
            .json({
              success: true,

              ignored: true,

              reason:
                "No TechMinds checkout data",
            });

          return;
        }


        const eventId =
          event.event_id;

        if (!eventId) {
          throw new Error(
            "Missing Paddle event ID."
          );
        }


        const eventRef =
          db
            .collection(
              "paddleWebhookEvents"
            )
            .doc(
              safeId(eventId)
            );


        const existingEvent =
          await eventRef.get();


        if (
          existingEvent.exists
        ) {
          response
            .status(200)
            .json({
              success: true,

              duplicate: true,
            });

          return;
        }


        if (
          checkoutType ===
          "program"
        ) {
          await processProgramPurchase(
            event,
            transactionData,
            customData,
            eventRef
          );

          response
            .status(200)
            .json({
              success: true,

              type:
                "program",

              transactionId:
                transactionData.id,
            });

          return;
        }


        if (
          checkoutType ===
          "plan"
        ) {
          await processPlanPurchase(
            event,
            transactionData,
            customData,
            eventRef
          );

          response
            .status(200)
            .json({
              success: true,

              type:
                "plan",

              transactionId:
                transactionData.id,
            });

          return;
        }


        response
          .status(200)
          .json({
            success: true,

            ignored: true,

            reason:
              "Unknown checkout type",
          });

      } catch (error) {
        console.error(
          "Paddle webhook processing error:",
          error
        );

        response
          .status(500)
          .json({
            success: false,

            error:
              "Webhook processing failed",
          });
      }
    }
  );
