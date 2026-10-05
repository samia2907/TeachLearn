"use strict";

const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {assertImportTarget, prepareCredentials} = require("./catalogCredentials");

async function main() {
  const target = {projectId: "techminds-63e30", databaseId: "default"};
  assertImportTarget(target);
  const mission = (await import("../../src/data/missions/computer-science-modern-technology/mission-02-dead-computer.js")).default;
  const {validateMission} = await import("../../src/components/mission/missionEngine.js");
  if (!validateMission(mission.sections)) throw new Error("Invalid Mission 02");
  await prepareCredentials();
  const db = getFirestore(initializeApp({credential: applicationDefault(), projectId: target.projectId}), target.databaseId);
  const programId = "computer-science-modern-technology-journey";
  const programRef = db.collection("programs").doc(programId);
  const lessonRef = db.collection("lessons").doc(`${programId}--mission-02`);
  await db.runTransaction(async (tx) => {
    const [program, lesson] = await Promise.all([tx.get(programRef), tx.get(lessonRef)]);
    if (!program.exists) throw new Error("Program not found");
    const existing = lesson.data() || {};
    if (lesson.exists && existing.programId !== programId) throw new Error("Lesson belongs to another program");
    console.log(JSON.stringify({lessonId: lessonRef.id, programStatus: program.get("status"), exists: lesson.exists, sections: mission.sections.length}));
    if (!process.argv.includes("--commit")) return;
    const now = FieldValue.serverTimestamp();
    tx.set(lessonRef, {
      ...existing, programId, lessonType: "commercial", sellable: true,
      createdBy: existing.createdBy || program.get("createdBy") || "",
      createdByRole: existing.createdByRole || "owner",
      templateId: mission.id, activityType: "mission", title: mission.title,
      description: mission.summary || mission.title,
      minutes: mission.estimatedMinutes, xp: mission.xpReward, xpReward: mission.xpReward,
      status: "published", lessonNumber: 2, order: 2,
      sections: mission.sections, slideCount: mission.sections.length,
      createdAt: existing.createdAt || now, updatedAt: now,
    });
    tx.update(programRef, {
      lessonCount: Number(program.get("lessonCount") || 0) + (lesson.exists ? 0 : 1),
      updatedAt: now,
    });
  });
  if (process.argv.includes("--commit")) {
    const saved = await lessonRef.get();
    console.log(JSON.stringify({verified: saved.exists, lessonId: saved.id, status: saved.get("status"), programId: saved.get("programId"), activityType: saved.get("activityType")}));
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
