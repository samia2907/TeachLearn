"use strict";

const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {assertImportTarget, prepareCredentials} = require("./catalogCredentials");
const {programAccessDefaults, hasExplicitProgramAccessType} = require("../programAccessPolicy.mjs");

function missingProgramFields(data) {
  return Object.fromEntries(Object.entries(programAccessDefaults).filter(([key]) => data[key] === undefined));
}

function missingAccessPolicyFields(data) {
  return hasExplicitProgramAccessType(data) ? [] : ["accessType"];
}

async function main() {
  const target = {projectId: "techminds-63e30", databaseId: "default"};
  assertImportTarget(target);
  await prepareCredentials();
  const db = getFirestore(initializeApp({credential: applicationDefault(), projectId: target.projectId}), target.databaseId);
  const programs = await db.collection("programs").get();
  const commit = process.argv.includes("--commit");
  for (const program of programs.docs) {
    const patch = missingProgramFields(program.data());
    const accessPolicyFields = missingAccessPolicyFields(program.data());
    if (!Object.keys(patch).length && !accessPolicyFields.length) continue;
    console.log(JSON.stringify({
      id: program.id,
      patch,
      requiresExplicitAccessPolicy: accessPolicyFields,
      commit,
    }));
    if (commit) {
      await db.runTransaction(async (tx) => {
        const current = await tx.get(program.ref);
        if (!current.exists) return;
        const remaining = missingProgramFields(current.data());
        if (Object.keys(remaining).length) tx.update(program.ref, remaining);
      });
    }
  }
}

module.exports = {missingProgramFields, missingAccessPolicyFields};
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
