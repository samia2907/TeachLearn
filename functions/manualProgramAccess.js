const {programContentType, validMissionParent} = require("./programContent.mjs");
// Mutations are callable-only. Roles and user identity always come from stored data.
function createManualAccessHandlers({db, HttpsError, FieldValue, Timestamp, requireRole, requireActiveUser}) {
  const fail = (code, message) => { throw new HttpsError(code, message); };
  const id = value => {
    if (typeof value !== "string" || !value || value.length > 128 || /[/\s]/.test(value)) fail("invalid-argument", "Invalid document ID.");
    return value;
  };
  const boundedText = (value, max) => {
    if (typeof value !== "string" || value.length > max) fail("invalid-argument", "Invalid text.");
    return value.trim();
  };
  const grantOptions = data => {
    const accessScope = data.accessScope ?? "full";
    if (!["full", "selected"].includes(accessScope)) fail("invalid-argument", "Invalid access scope.");
    const lessonIds = accessScope === "selected" ? data.lessonIds : [];
    if (!Array.isArray(lessonIds) || lessonIds.length > 1000 || (accessScope === "selected" && lessonIds.length === 0)) fail("invalid-argument", "Choose 1 to 1000 lessons.");
    lessonIds.forEach(id);
    if (!["manual_paid", "free_gift", "class_access", "promotion", "other"].includes(data.grantType)) fail("invalid-argument", "Choose an access reason.");
    let expiresAt = null;
    if (data.expiresAt != null && data.expiresAt !== "") {
      const expires = typeof data.expiresAt === "string" ? Date.parse(data.expiresAt) : NaN;
      if (!Number.isFinite(expires) || expires <= Date.now()) fail("invalid-argument", "Expiration must be in the future.");
      expiresAt = Timestamp.fromMillis(expires);
    }
    return {accessScope, lessonIds: [...new Set(lessonIds)], grantType: data.grantType, paymentMethod: boundedText(data.paymentMethod || "", 80),
      note: boundedText(data.note || "", 2000), expiresAt};
  };
  const refs = (userId, programId) => {
    const key = `${id(userId)}_${id(programId)}`;
    return {access: db.collection("programAccess").doc(key), request: db.collection("accessRequests").doc(key),
      user: db.collection("users").doc(userId), program: db.collection("programs").doc(programId)};
  };
  function writeGrant(tx, target, userId, programId, ownerId, options) {
    const {note, ...publicOptions} = options;
    tx.set(target.access, {userId, programId, grantedBy: ownerId, ...publicOptions,
      accessType: "manual", active: true, status: "active", grantedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()});
    tx.set(target.access.collection("private").doc("metadata"), {note, updatedBy: ownerId, updatedAt: FieldValue.serverTimestamp()});
  }
  function validateTarget(user, program) {
    if (!user.exists || !program.exists) fail("not-found", "User or program not found.");
    if (!["student", "teacher"].includes(user.data().role) || (user.data().accountStatus || "active") !== "active") fail("failed-precondition", "Choose an active student or teacher.");
  }
  async function validateLessons(tx, options, programId) {
    const lessons = await Promise.all(options.lessonIds.map(lessonId => tx.get(db.collection("lessons").doc(lessonId))));
    if (lessons.some(lesson => !lesson.exists || lesson.data().programId !== programId || lesson.data().lessonType !== "commercial" || !["draft", "published"].includes(lesson.data().status))) {
      fail("invalid-argument", "Select draft or published lessons from this program.");
    }
  }
  return {
    async assignMissionParent(request) {
      await requireRole(request, "owner");
      const programId = id(request.data?.programId);
      const missionId = id(request.data?.missionId);
      const parentLessonId = request.data?.parentLessonId === null ? null : id(request.data?.parentLessonId);
      await db.runTransaction(async tx => {
        const missionRef = db.collection("lessons").doc(missionId);
        const programRef = db.collection("programs").doc(programId);
        const [mission, program, parent] = await Promise.all([tx.get(missionRef), tx.get(programRef),
          parentLessonId ? tx.get(db.collection("lessons").doc(parentLessonId)) : null]);
        if (!program.exists || !mission.exists || mission.data().programId !== programId
          || mission.data().lessonType !== "commercial" || programContentType(mission.data()) !== "mission") fail("invalid-argument", "Choose a mission from this program.");
        if (parentLessonId && (!parent?.exists || !["draft", "published"].includes(parent.data().status)
          || !validMissionParent({...mission.data(), id: missionId, parentLessonId}, {...parent.data(), id: parent.id}))) fail("invalid-argument", "Choose a real parent lesson from this program.");
        tx.update(missionRef, {parentLessonId, updatedAt: FieldValue.serverTimestamp()});
        // Existing program listener refreshes learner access when a mapping changes.
        tx.update(programRef, {updatedAt: FieldValue.serverTimestamp()});
      });
      return {success: true};
    },
    async requestProgramAccess(request) {
      const user = (await requireActiveUser(request)).data();
      if (!user || !["student", "teacher"].includes(user.role) || (user.accountStatus || "active") !== "active") fail("permission-denied", "Only active students and teachers can request access.");
      const userId = request.auth.uid;
      const programId = id(request.data?.programId);
      const target = refs(userId, programId);
      return db.runTransaction(async tx => {
        const [program, existing] = await Promise.all([tx.get(target.program), tx.get(target.request)]);
        if (!program.exists || program.data().status !== "published" || ["free", "class"].includes(program.data().accessType)) fail("failed-precondition", "This program does not accept access requests.");
        if (existing.exists) return {status: existing.data().status, duplicate: true};
        tx.create(target.request, {userId, userEmail: user.email || user.authEmail || null,
          programId, status: "pending", createdAt: FieldValue.serverTimestamp()});
        return {status: "pending", duplicate: false};
      });
    },
    async manageProgramAccess(request) {
      await requireRole(request, "owner");
      const data = request.data || {};
      const userId = id(data.userId); const programId = id(data.programId);
      const target = refs(userId, programId);
      if (data.action === "grant") {
        const options = grantOptions(data);
        await db.runTransaction(async tx => {
          const [user, program, accessRequest] = await Promise.all([tx.get(target.user), tx.get(target.program), tx.get(target.request)]);
          validateTarget(user, program);
          await validateLessons(tx, options, programId);
          writeGrant(tx, target, userId, programId, request.auth.uid, options);
          if (accessRequest.exists && accessRequest.data().status === "pending") {
            tx.update(target.request, {status: "approved", reviewedBy: request.auth.uid, reviewedAt: FieldValue.serverTimestamp()});
          }
        });
      } else if (data.action === "revoke") {
        await db.runTransaction(async tx => {
          const access = await tx.get(target.access);
          if (!access.exists || access.data().userId !== userId || access.data().programId !== programId || access.data().accessType !== "manual") fail("not-found", "Manual access not found.");
          tx.update(target.access, {active: false, status: "revoked", revokedBy: request.auth.uid, updatedAt: FieldValue.serverTimestamp()});
        });
      } else fail("invalid-argument", "Unknown access action.");
      return {success: true};
    },
    async reviewAccessRequest(request) {
      await requireRole(request, "owner");
      const data = request.data || {};
      const userId = id(data.userId); const programId = id(data.programId);
      const target = refs(userId, programId);
      if (!["approve", "reject", "note"].includes(data.action)) fail("invalid-argument", "Unknown request action.");
      const note = boundedText(data.note || "", 2000);
      const options = data.action === "approve" ? grantOptions(data) : null;
      return db.runTransaction(async tx => {
        const [existing, user, program] = await Promise.all([tx.get(target.request), tx.get(target.user), tx.get(target.program)]);
        if (!existing.exists || existing.data().userId !== userId || existing.data().programId !== programId) fail("not-found", "Request not found.");
        if (data.action !== "note" && existing.data().status !== "pending") fail("failed-precondition", "This request has already been reviewed.");
        if (data.action === "approve") {
          validateTarget(user, program);
          await validateLessons(tx, options, programId);
          writeGrant(tx, target, userId, programId, request.auth.uid, options);
        }
        if (data.action !== "note") tx.update(target.request, {
          status: data.action === "approve" ? "approved" : "rejected",
          reviewedBy: request.auth.uid, reviewedAt: FieldValue.serverTimestamp(),
        });
        tx.set(target.request.collection("private").doc("metadata"), {note, updatedBy: request.auth.uid, updatedAt: FieldValue.serverTimestamp()});
        return {success: true};
      });
    },
  };
}
module.exports = {createManualAccessHandlers};
