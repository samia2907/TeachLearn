const {
  onRequest,
  onCall,
  HttpsError,
} = require(
  "firebase-functions/v2/https"
);

const {
  defineSecret,
} = require(
  "firebase-functions/params"
);

const {
  initializeApp,
} = require(
  "firebase-admin/app"
);

const {
  getFirestore,
  FieldValue,
} = require(
  "firebase-admin/firestore"
);

const {
  createHmac,
  timingSafeEqual,
} = require(
  "crypto"
);


/* =========================================================
   FIREBASE ADMIN
========================================================= */

const app =
  initializeApp();


/*
  IMPORTANT:

  Your Firestore database ID is:
  "default"

  Do NOT change it to:
  "(default)"
*/

const db =
  getFirestore(
    app,
    "default"
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

const IS_SANDBOX =
  true;


/* =========================================================
   VALID PLANS
========================================================= */

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
      region:
        "europe-west1",

      cors:
        true,
    },

    (
      request,
      response
    ) => {
      response
        .status(200)
        .json({
          success:
            true,

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

function safeId(
  value
) {
  return String(
    value || ""
  )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /\s+/g,
      "_"
    );
}


/*
  Convert Firestore timestamps
  to values that Callable Functions
  can safely send to React.
*/

function serializeValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return value ?? null;
  }


  if (
    value &&
    typeof value.toDate ===
      "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return value.map(
      serializeValue
    );
  }


  if (
    typeof value ===
      "object"
  ) {
    const result = {};


    for (
      const [
        key,
        itemValue,
      ] of Object.entries(
        value
      )
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
   GET PURCHASED PROGRAM
========================================================= */

/*
  IMPORTANT:

  React does NOT read paid lesson content
  directly from Firestore.

  This function:

  1. Verifies Firebase Auth.
  2. Reads the user's role.
  3. Checks programAccess.
  4. Only then returns paid lessons.

  Firebase Admin bypasses Firestore Rules,
  but we perform the authorization here.
*/

exports.getPurchasedProgram =
  onCall(
    {
      region:
        "europe-west1",

      timeoutSeconds:
        30,

      memory:
        "256MiB",
    },

    async (
      request
    ) => {
      /* =========================
         AUTH
      ========================= */

      if (
        !request.auth
      ) {
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


      /* =========================
         USER
      ========================= */

      const userSnapshot =
        await db
          .collection(
            "users"
          )
          .doc(
            userId
          )
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
        ].includes(
          role
        )
      ) {
        throw new HttpsError(
          "permission-denied",
          "Invalid TechMinds account role."
        );
      }


      /* =========================
         PROGRAM
      ========================= */

      const programSnapshot =
        await db
          .collection(
            "programs"
          )
          .doc(
            programId
          )
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


      /*
        Teacher / Student should only
        consume published programs.

        Owner can preview drafts too.
      */

      if (
        role !==
          "owner" &&
        programData.status !==
          "published"
      ) {
        throw new HttpsError(
          "permission-denied",
          "This program is not published."
        );
      }


      /* =========================
         ACCESS
      ========================= */

      let accessData =
        null;


      /*
        OWNER

        Platform owner can preview
        commercial programs.
      */

      if (
        role ===
        "owner"
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


      /* =========================
         TEACHER PERSONAL ACCESS
      ========================= */

      if (
        !accessData &&
        role ===
          "teacher"
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
            .doc(
              accessId
            )
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


      /* =========================
         TEACHER CLASS LICENSE
      ========================= */

      /*
        If Teacher bought the program
        for one of their classes,
        Teacher should also be able
        to open the program.
      */

      if (
        !accessData &&
        role ===
          "teacher"
      ) {
        const classesSnapshot =
          await db
            .collection(
              "classes"
            )
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
              .doc(
                accessId
              )
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


      /* =========================
         STUDENT PERSONAL ACCESS
      ========================= */

      if (
        !accessData &&
        role ===
          "student"
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
            .doc(
              accessId
            )
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


      /* =========================
         STUDENT CLASS ACCESS
      ========================= */

      if (
        !accessData &&
        role ===
          "student" &&
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
            .doc(
              accessId
            )
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


      /* =========================
         DENY
      ========================= */

      if (
        !accessData
      ) {
        throw new HttpsError(
          "permission-denied",
          "You do not have access to this program."
        );
      }


      /* =========================
         LESSONS
      ========================= */

      /*
        Query ONLY by programId.

        We intentionally filter commercial
        and published in Node.js.

        This avoids needing a new
        Firestore composite index.
      */

      const lessonsSnapshot =
        await db
          .collection(
            "lessons"
          )
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
            (
              lesson
            ) => {
              if (
                role ===
                "owner"
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


      /* =========================
         SORT
      ========================= */

      lessons.sort(
        (
          first,
          second
        ) => {
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


      /* =========================
         RESPONSE
      ========================= */

      return {
        success:
          true,

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
    signatureHeader.split(
      ";"
    );


  for (
    const part
    of parts
  ) {
    const [
      key,
      value,
    ] =
      part.split("=");


    if (
      key ===
      "ts"
    ) {
      timestamp =
        value;
    }


    if (
      key ===
      "h1"
    ) {
      signatures.push(
        value
      );
    }
  }


  if (
    !timestamp ||
    signatures.length ===
      0
  ) {
    return false;
  }


  const timestampNumber =
    Number(
      timestamp
    );


  if (
    !Number.isFinite(
      timestampNumber
    )
  ) {
    return false;
  }


  const now =
    Math.floor(
      Date.now() /
      1000
    );


  const age =
    Math.abs(
      now -
      timestampNumber
    );


  if (
    age >
    300
  ) {
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
      .digest(
        "hex"
      );


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

    } catch (
      error
    ) {
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
    transaction.items ||
    []
  )
    .map(
      (
        item
      ) =>
        item?.price?.id
    )
    .filter(
      Boolean
    );
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
      amountMinor /
      100,

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
    customData
      .techminds_user_id;


  const programId =
    customData
      .program_id;


  const licenseType =
    customData
      .license_type ||
    "student";


  const classId =
    customData
      .class_id ||
    null;


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
      .collection(
        "users"
      )
      .doc(
        userId
      );


  const programRef =
    db
      .collection(
        "programs"
      )
      .doc(
        programId
      );


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


  /* =========================
     ROLE CHECK
  ========================= */

  if (
    licenseType ===
      "student" &&
    userData.role !==
      "student"
  ) {
    throw new Error(
      "Student license requires a student account."
    );
  }


  if (
    (
      licenseType ===
        "teacher" ||
      licenseType ===
        "class"
    ) &&
    userData.role !==
      "teacher"
  ) {
    throw new Error(
      "Teacher/Class license requires a teacher account."
    );
  }


  /* =========================
     CLASS CHECK
  ========================= */

  let classData =
    null;


  if (
    licenseType ===
    "class"
  ) {
    if (
      !classId
    ) {
      throw new Error(
        "Class ID is required."
      );
    }


    const classSnapshot =
      await db
        .collection(
          "classes"
        )
        .doc(
          classId
        )
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


  /* =========================
     PRICE VALIDATION
  ========================= */

  const transactionPriceIds =
    getTransactionPriceIds(
      transactionData
    );


  const expectedPriceId =
    programData
      ?.paddlePriceIds
      ?.[licenseType] ||
    null;


  if (
    expectedPriceId
  ) {
    if (
      !transactionPriceIds.includes(
        expectedPriceId
      )
    ) {
      throw new Error(
        "Paddle price does not match the selected program."
      );
    }

  } else if (
    !IS_SANDBOX
  ) {
    throw new Error(
      "Program Paddle Price ID is not configured."
    );
  }


  /* =========================
     PAYMENT DATA
  ========================= */

  const transactionId =
    transactionData.id;


  if (
    !transactionId
  ) {
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
      .doc(
        transactionId
      );


  /* =========================
     ACCESS DOCUMENT ID
  ========================= */

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
      .doc(
        accessId
      );


  /* =====================================================
     ATOMIC WRITE
  ===================================================== */

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
            merge:
              true,
          }
        );


        return;
      }


      /* =========================
         PURCHASE
      ========================= */

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

          classId:
            licenseType ===
              "class"
              ? classId
              : null,

          className:
            classData
              ?.name ||
            classData
              ?.className ||
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


      /* =========================
         PROGRAM ACCESS
      ========================= */

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
          merge:
            true,
        }
      );


      /* =========================
         UPDATE USER
      ========================= */

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
          merge:
            true,
        }
      );


      /* =========================
         PROGRAM SALES COUNTER
      ========================= */

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
          merge:
            true,
        }
      );


      /* =========================
         WEBHOOK EVENT
      ========================= */

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
    customData
      .plan_id;


  const billingCycle =
    customData
      .billing_cycle;


  const trackId =
    customData
      .track_id ||
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
      .collection(
        "users"
      )
      .doc(
        userId
      );


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


  /* =========================
     ROLE / PLAN VALIDATION
  ========================= */

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


  /* =====================================================
     LIVE PRICE VALIDATION
  ===================================================== */

  if (
    !IS_SANDBOX
  ) {
    const billingSnapshot =
      await db
        .collection(
          "platformSettings"
        )
        .doc(
          "billing"
        )
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


    if (
      !expectedPriceId
    ) {
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
      .doc(
        userId
      );


  const paymentRef =
    db
      .collection(
        "subscriptionPayments"
      )
      .doc(
        transactionId
      );


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
          merge:
            true,
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


      if (
        trackId
      ) {
        userUpdate.learningTrack =
          trackId;

        userUpdate.pendingTrack =
          FieldValue.delete();
      }


      firestoreTransaction.set(
        userRef,
        userUpdate,
        {
          merge:
            true,
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
      region:
        "europe-west1",

      cors:
        false,

      secrets: [
        paddleWebhookSecret,
      ],

      timeoutSeconds:
        60,

      memory:
        "256MiB",
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
          request
            .rawBody
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
              success:
                true,

              ignored:
                true,

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
              success:
                true,

              ignored:
                true,

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


        if (
          !checkoutType
        ) {
          console.log(
            "Transaction has no TechMinds custom data."
          );


          response
            .status(200)
            .json({
              success:
                true,

              ignored:
                true,

              reason:
                "No TechMinds checkout data",
            });


          return;
        }


        const eventRef =
          db
            .collection(
              "paddleWebhookEvents"
            )
            .doc(
              safeId(
                event.event_id
              )
            );


        const existingEvent =
          await eventRef.get();


        if (
          existingEvent.exists
        ) {
          response
            .status(200)
            .json({
              success:
                true,

              duplicate:
                true,
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
              success:
                true,

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
              success:
                true,

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
            success:
              true,

            ignored:
              true,

            reason:
              "Unknown checkout type",
          });

      } catch (
        error
      ) {
        console.error(
          "Paddle webhook processing error:",
          error
        );


        response
          .status(500)
          .json({
            success:
              false,

            error:
              "Webhook processing failed",
          });
      }
    }
  );