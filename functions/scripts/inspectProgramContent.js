"use strict";
// Read-only schema inventory. No content, users, credentials or answers are exported.
const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {prepareCredentials} = require("./catalogCredentials");
async function main() {
  await prepareCredentials();
  const db = getFirestore(initializeApp({credential: applicationDefault(), projectId: "techminds-63e30"}), "default");
  const [programs, lessons] = await Promise.all([db.collection("programs").get(), db.collection("lessons").get()]);
  console.log(JSON.stringify(programs.docs.map(program => ({id: program.id, cachedCount: program.get("lessonCount"),
    records: lessons.docs.filter(item => item.get("programId") === program.id).map(item => {
      const data = item.data();
      return {id: item.id, contentType: data.contentType || null, activityType: data.activityType || null,
        lessonType: data.lessonType || null, status: data.status, parentLessonId: data.parentLessonId || null,
        lessonId: data.lessonId || null, sectionTypes: [...new Set((data.sections || []).map(section => section.type))]};
    })})), null, 2));
  await db.terminate();
}
main().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
