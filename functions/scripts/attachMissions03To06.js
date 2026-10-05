"use strict";

const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {assertImportTarget, prepareCredentials} = require("./catalogCredentials");

async function main() {
  const target = {projectId: "techminds-63e30", databaseId: "default"};
  assertImportTarget(target);
  const files = ["mission-03-secret-message", "mission-04-data-packet-journey", "mission-05-lab-intrusion", "mission-06-save-the-lab"];
  const {validateMission} = await import("../../src/components/mission/missionEngine.js");
  const missions = await Promise.all(files.map(async (file, index) => {
    const mission = (await import(`../../src/data/missions/computer-science-modern-technology/${file}.js`)).default;
    if (mission.id !== `mission-0${index + 3}` || !validateMission(mission.sections)) throw new Error(`Invalid ${file}`);
    return mission;
  }));
  await prepareCredentials();
  const db = getFirestore(initializeApp({credential: applicationDefault(), projectId: target.projectId}), target.databaseId);
  const programId = "computer-science-modern-technology-journey";
  const programRef = db.collection("programs").doc(programId);
  const refs = missions.map((mission) => db.collection("lessons").doc(`${programId}--${mission.id}`));
  await db.runTransaction(async (tx) => {
    const [program, ...lessons] = await Promise.all([tx.get(programRef), ...refs.map((ref) => tx.get(ref))]);
    if (!program.exists || program.get("status") !== "draft") throw new Error("Expected existing draft program");
    for (const lesson of lessons) {
      if (lesson.exists && lesson.get("programId") !== programId) throw new Error("Lesson belongs to another program");
    }
    if (!process.argv.includes("--commit")) return;
    const now = FieldValue.serverTimestamp();
    missions.forEach((mission, index) => {
      const existing = lessons[index].data() || {};
      tx.set(refs[index], {
        ...existing, programId, lessonType: "commercial", sellable: true,
        createdBy: existing.createdBy || program.get("createdBy") || "",
        createdByRole: existing.createdByRole || "owner",
        templateId: mission.id, activityType: "mission", title: mission.title,
        description: mission.summary || mission.title,
        minutes: mission.estimatedMinutes, xp: mission.xpReward, xpReward: mission.xpReward,
        status: "published", lessonNumber: index + 3, order: index + 3,
        sections: mission.sections, slideCount: mission.sections.length,
        createdAt: existing.createdAt || now, updatedAt: now,
      });
    });
    tx.update(programRef, {
      lessonCount: Number(program.get("lessonCount") || 0) + lessons.filter((lesson) => !lesson.exists).length,
      updatedAt: now,
    });
  });
  const [program, ...saved] = await Promise.all([programRef.get(), ...refs.map((ref) => ref.get())]);
  console.log(JSON.stringify({programStatus: program.get("status"), lessons: saved.map((lesson) => ({
    lessonId: lesson.id, exists: lesson.exists,
    ownerVisible: lesson.exists && lesson.get("programId") === programId && lesson.get("lessonType") === "commercial",
    status: lesson.get("status"), activityType: lesson.get("activityType"),
  }))}));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
