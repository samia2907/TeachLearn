"use strict";

// Imports ONLY the Grade 1 Mathematics program (math-grade-1-il) and its 30
// mission lessons. Does not touch any other program or lesson in the catalog.
//
// Dry run by default (no Firestore writes). Add --commit to write.
// Usage:
//   node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID
//   node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID --commit
//   node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID --commit --allow-update

const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {assertImportTarget, prepareCredentials, authenticationError} = require("./catalogCredentials");

const PROJECT_ID = "techminds-63e30";
const DATABASE_ID = "default";

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readOwnerUid() {
  return process.argv.slice(2).find((argument) => !argument.startsWith("-")) || "";
}

async function main() {
  assertImportTarget({projectId: PROJECT_ID, databaseId: DATABASE_ID});

  const {mathGrade1Program} = await import("../content/TechMinds_Grade1_Math.js");
  const {validateMission} = await import("../../src/components/mission/missionEngine.js");

  const program = mathGrade1Program;
  const lessons = program.lessons;

  // ---- Local content validation (no Firestore access) ----
  const errors = [];

  if (lessons.length !== 30) {
    errors.push(`Expected exactly 30 lessons, found ${lessons.length}.`);
  }

  const seenIds = new Set();
  lessons.forEach((lesson, index) => {
    if (seenIds.has(lesson.id)) {
      errors.push(`Duplicate lesson id: ${lesson.id}`);
    }
    seenIds.add(lesson.id);

    const expectedOrder = index + 1;
    if (lesson.order !== expectedOrder) {
      errors.push(`Lesson ${lesson.id} has order ${lesson.order}, expected ${expectedOrder}.`);
    }

    if (!validateMission(lesson.sections)) {
      errors.push(`Lesson ${lesson.id} has invalid/unsupported sections for MissionPlayer.`);
    }
  });

  if (program.accessType !== "paid" && program.accessType !== "free" && program.accessType !== "class") {
    errors.push(`Program accessType must be one of free/paid/class, got ${program.accessType}.`);
  }

  if (errors.length > 0) {
    console.error("Validation failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validated program ${program.id}: 30 missions, stable unique IDs, ` +
    "order 1-30, and MissionPlayer-compatible sections (no open-ended questions)."
  );

  if (!hasFlag("commit")) {
    console.log("Dry run only. No Firestore data was changed. Re-run with --commit to write.");
    return;
  }

  const ownerUid = readOwnerUid();
  if (!ownerUid) {
    throw new Error("An owner UID is required. Usage: node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID --commit");
  }

  await prepareCredentials();
  const credential = applicationDefault();
  try {
    await credential.getAccessToken();
  } catch {
    throw authenticationError();
  }

  const app = initializeApp({credential, projectId: PROJECT_ID});
  const db = getFirestore(app, DATABASE_ID);

  const programRef = db.collection("programs").doc(program.id);
  const lessonRefs = lessons.map((lesson) => db.collection("lessons").doc(lesson.id));

  const snapshots = await db.getAll(programRef, ...lessonRefs);
  const [programSnapshot, ...lessonSnapshots] = snapshots;

  const existingOwnerUid = programSnapshot.exists ? programSnapshot.get("createdBy") : null;
  if (existingOwnerUid && existingOwnerUid !== ownerUid) {
    throw new Error(`programs/${program.id} belongs to a different owner UID. Import stopped.`);
  }

  lessonSnapshots.forEach((snapshot, index) => {
    if (snapshot.exists && snapshot.get("programId") !== program.id) {
      throw new Error(`${snapshot.ref.path} belongs to a different program. Import stopped.`);
    }
    if (snapshot.exists && !hasFlag("allow-update")) {
      throw new Error(
        `${snapshot.ref.path} already exists. Re-run with --allow-update after reviewing it, ` +
        `or this import will not overwrite lesson ${lessons[index].id}.`
      );
    }
  });

  if (programSnapshot.exists && !hasFlag("allow-update")) {
    throw new Error(`programs/${program.id} already exists. Re-run with --allow-update after reviewing it.`);
  }

  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (tx) => {
    const existingProgramData = programSnapshot.exists ? programSnapshot.data() : {};
    tx.set(programRef, {
      ...existingProgramData,
      id: program.id,
      slug: program.slug,
      category: program.category,
      subject: program.subject,
      grade: program.grade,
      ageFrom: program.ageFrom,
      ageTo: program.ageTo,
      level: program.level,
      status: program.status,
      icon: program.icon,
      title: program.title,
      description: program.description,
      curriculum: program.curriculum,
      accessType: program.accessType,
      previewLessonCount: program.previewLessonCount,
      freeLessonIds: program.freeLessonIds,
      stages: program.stages,
      lessonCount: lessons.length,
      createdBy: existingOwnerUid || ownerUid,
      createdByRole: existingProgramData.createdByRole || "owner",
      createdAt: existingProgramData.createdAt || now,
      updatedAt: now,
    });

    lessons.forEach((lesson, index) => {
      const snapshot = lessonSnapshots[index];
      const existingLessonData = snapshot.exists ? snapshot.data() : {};
      tx.set(lessonRefs[index], {
        ...existingLessonData,
        programId: program.id,
        lessonType: "commercial",
        sellable: true,
        createdBy: existingLessonData.createdBy || ownerUid,
        createdByRole: existingLessonData.createdByRole || "owner",
        templateId: lesson.id,
        stageId: lesson.stageId,
        curriculum: lesson.curriculum,
        activityType: lesson.activityType,
        title: lesson.title,
        description: lesson.description,
        minutes: lesson.estimatedMinutes,
        estimatedMinutes: lesson.estimatedMinutes,
        xp: lesson.xpReward,
        xpReward: lesson.xpReward,
        status: lesson.status,
        lessonNumber: lesson.order,
        order: lesson.order,
        lessonOrder: lesson.lessonOrder,
        position: lesson.position,
        sections: lesson.sections,
        slideCount: lesson.sections.length,
        createdAt: existingLessonData.createdAt || now,
        updatedAt: now,
      });
    });
  });

  console.log(`Imported programs/${program.id} and ${lessons.length} lesson(s).`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
