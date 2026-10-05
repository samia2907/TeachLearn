// Resume bookmarks are shared by every content type. They never grant access or XP.
function contentType(lesson) {
  return lesson.contentType || lesson.activityType || "lesson";
}

function sectionCount(lesson) {
  return (Array.isArray(lesson.sections) ? lesson.sections.length : 0) +
    (["python", "javascript", "web"].includes(lesson.codingConfig?.language) ? 1 : 0);
}

function normalizeProgress(input, lesson, userId, previous = {}) {
  const count = sectionCount(lesson);
  if (!count || !Number.isInteger(input.lastSectionIndex) ||
      input.lastSectionIndex < 0 || input.lastSectionIndex >= count ||
      !["not_started", "in_progress", "completed"].includes(input.status)) {
    throw new Error("invalid-progress");
  }
  const status = previous.status === "completed" ? "completed" : input.status;
  return {
    userId, programId: lesson.programId, contentId: lesson.id,
    contentType: contentType(lesson), lastSectionIndex: input.lastSectionIndex,
    progressPercent: status === "completed" ? 100 : status === "not_started" ? 0 :
      Math.min(99, Math.round((input.lastSectionIndex + 1) / count * 100)),
    status,
  };
}

function createContentProgressHandlers({db, HttpsError, FieldValue, requireRole, resolveAccess, serialize}) {
  const identifier = value => typeof value === "string" && /^[^/]{1,128}$/.test(value) && value !== "." && value !== "..";
  const collection = (uid, programId) => db.collection("users").doc(uid)
    .collection("programProgress").doc(programId).collection("content");

  async function context(request) {
    const user = await requireRole(request, "student");
    if ((user.accountStatus || "active") !== "active") throw new HttpsError("permission-denied", "Account is inactive.");
    const {programId} = request.data || {};
    if (!identifier(programId)) throw new HttpsError("invalid-argument", "Invalid program ID.");
    return {user, userId: request.auth.uid, programId};
  }

  return {
    async getContentProgress(request) {
      const {userId, programId} = await context(request);
      const contentId = request.data?.contentId;
      if (contentId !== undefined) {
        if (!identifier(contentId)) throw new HttpsError("invalid-argument", "Invalid content ID.");
        const saved = await collection(userId, programId).doc(contentId).get();
        if (saved.exists) return {progress: [serialize(saved.data())]};
        const [legacy, source] = await Promise.all([
          db.collection("lessonProgress").doc(`${userId}_${contentId}`).get(),
          db.collection("lessons").doc(contentId).get(),
        ]);
        const lesson = source.exists ? {...source.data(), id: source.id} : null;
        if (!legacy.exists || !lesson || lesson.programId !== programId || !sectionCount(lesson)) return {progress: []};
        const data = legacy.data();
        return {progress: [serialize({
          ...normalizeProgress({lastSectionIndex: Math.max(0, Math.min(data.currentSlide || 0, sectionCount(lesson) - 1)),
            status: data.status === "completed" ? "completed" : "in_progress"}, lesson, userId),
          updatedAt: data.updatedAt,
          state: {mission: data.mission || null, answers: data.selectedAnswers || {},
            checkedAnswers: data.answerResults || {}, codingAnswers: data.taskAnswers || {}},
        })]};
      }
      // Only this caller's bookmarks. This does not return lesson content or access.
      const [saved, lessons] = await Promise.all([
        collection(userId, programId).get(),
        db.collection("lessons").where("programId", "==", programId).get(),
      ]);
      const records = new Map(saved.docs.map(doc => [doc.id, doc.data()]));
      // Read existing progress without requiring a migration or changing its schema.
      const missing = lessons.docs.filter(doc => !records.has(doc.id));
      const legacy = missing.length ? await db.getAll(...missing.map(doc =>
        db.collection("lessonProgress").doc(`${userId}_${doc.id}`))) : [];
      legacy.forEach((snapshot, index) => {
        if (!snapshot.exists) return;
        const data = snapshot.data();
        const lesson = {...missing[index].data(), id: missing[index].id};
        const lastSectionIndex = Math.max(0, Math.min(data.currentSlide || 0, sectionCount(lesson) - 1));
        if (!sectionCount(lesson)) return;
        records.set(lesson.id, {
          ...normalizeProgress({lastSectionIndex, status: data.status === "completed" ? "completed" : "in_progress"}, lesson, userId),
          updatedAt: data.updatedAt,
          state: {mission: data.mission || null, answers: data.selectedAnswers || {},
            checkedAnswers: data.answerResults || {}, codingAnswers: data.taskAnswers || {}},
        });
      });
      return {progress: serialize([...records.values()])};
    },
    async saveContentProgress(request) {
      const {user, userId, programId} = await context(request);
      const input = request.data || {};
      if (!identifier(input.contentId)) throw new HttpsError("invalid-argument", "Invalid content ID.");
      const snapshot = await db.collection("lessons").doc(input.contentId).get();
      const lesson = snapshot.exists ? {...snapshot.data(), id: snapshot.id} : null;
      if (!lesson || lesson.programId !== programId || !await resolveAccess(userId, user, lesson)) {
        throw new HttpsError("permission-denied", "Content access is required to save progress.");
      }
      const state = input.state ?? {};
      if (!state || typeof state !== "object" || Array.isArray(state) ||
          Buffer.byteLength(JSON.stringify(state)) > 250000) {
        throw new HttpsError("invalid-argument", "Invalid resume state.");
      }
      const ref = collection(userId, programId).doc(lesson.id);
      await db.runTransaction(async tx => {
        const previous = await tx.get(ref);
        let data;
        try { data = normalizeProgress(input, lesson, userId, previous.data()); }
        catch { throw new HttpsError("invalid-argument", "Invalid progress."); }
        tx.set(ref, {...data, state, updatedAt: FieldValue.serverTimestamp()});
      });
      return {saved: true};
    },
  };
}

module.exports = {createContentProgressHandlers, normalizeProgress, sectionCount};
