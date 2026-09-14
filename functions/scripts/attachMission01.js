"use strict";

const {
  applicationDefault,
  initializeApp,
} = require("firebase-admin/app");
const {
  FieldValue,
  getFirestore,
} = require("firebase-admin/firestore");

const {
  assertImportTarget,
  prepareCredentials,
  authenticationError,
} = require("./catalogCredentials");

const PROJECT_ID = "techminds-63e30";
const DATABASE_ID = "default";
const PROGRAM_ID = "computer-science-modern-technology-journey";
const LESSON_ID = "mission-01";
const LESSON_DOCUMENT_ID = `${PROGRAM_ID}--${LESSON_ID}`;

async function main() {
  assertImportTarget({projectId: PROJECT_ID, databaseId: DATABASE_ID});
  await prepareCredentials();

  const app = initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
  const database = getFirestore(app, DATABASE_ID);
  const mission = (await import("../../src/data/missions/mission01.js")).default;
  const programReference = database.collection("programs").doc(PROGRAM_ID);
  const lessonReference = database.collection("lessons").doc(LESSON_DOCUMENT_ID);
  const [programSnapshot, lessonSnapshot] = await database.getAll(
    programReference,
    lessonReference,
  );

  if (!programSnapshot.exists) {
    throw new Error(`Program ${PROGRAM_ID} does not exist.`);
  }

  const existingLesson = lessonSnapshot.exists ? lessonSnapshot.data() : {};
  const existingLessons = await database.collection("lessons")
    .where("programId", "==", PROGRAM_ID)
    .get();

  const lessonNumber = existingLesson.lessonNumber ||
    existingLessons.size + (lessonSnapshot.exists ? 0 : 1);
  const now = FieldValue.serverTimestamp();
  const lessonDocument = {
    ...existingLesson,
    programId: PROGRAM_ID,
    lessonType: "commercial",
    sellable: true,
    createdBy: existingLesson.createdBy || programSnapshot.get("createdBy") || "",
    createdByRole: existingLesson.createdByRole || "owner",
    templateId: "mission-01",
    activityType: "mission",
    title: mission.title,
    description: mission.summary,
    coverImage: "/lesson-covers/mission-01.png",
    imageAlt: mission.title,
    themeColor: "#172554",
    accentColor: "#22D3EE",
    surfaceColor: "#EFF6FF",
    minutes: mission.estimatedMinutes,
    xp: mission.xpReward,
    xpReward: mission.xpReward,
    status: "published",
    lessonNumber,
    order: lessonNumber,
    sections: mission.sections,
    slideCount: mission.sections.length,
    createdAt: existingLesson.createdAt || now,
    updatedAt: now,
  };

  const batch = database.batch();
  batch.set(lessonReference, lessonDocument);
  batch.set(programReference, {
    lessonCount: Math.max(
      Number(programSnapshot.get("lessonCount") || 0),
      existingLessons.size + (lessonSnapshot.exists ? 0 : 1),
    ),
    updatedAt: now,
  }, {merge: true});
  await batch.commit();

  console.log(`Published ${lessonReference.path}`);
}

main().catch((error) => {
  if (error && error.code === "auth/invalid-credential") {
    console.error(authenticationError().message);
  } else {
    console.error(error.message || error);
  }
  process.exitCode = 1;
});
