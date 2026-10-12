
/*
 * TechMinds – Content Progress Backend
 *
 * Supports:
 * - Saving lesson/content progress
 * - Loading individual content progress
 * - Loading all progress for a program
 * - Reading legacy lesson progress
 * - Fast recent-progress lookup for StudentDashboard
 *
 * Progress records do not grant access or XP.
 */

function contentType(lesson) {
  return lesson.contentType || lesson.activityType || "lesson";
}

function sectionCount(lesson) {
  return (
    (Array.isArray(lesson.sections)
      ? lesson.sections.length
      : 0) +
    (["python", "javascript", "web"].includes(
      lesson.codingConfig?.language
    )
      ? 1
      : 0)
  );
}

function normalizeProgress(input, lesson, userId, previous = {}) {
  const count = sectionCount(lesson);

  if (
    !count ||
    !Number.isInteger(input.lastSectionIndex) ||
    input.lastSectionIndex < 0 ||
    input.lastSectionIndex >= count ||
    !["not_started", "in_progress", "completed"].includes(
      input.status
    )
  ) {
    throw new Error("invalid-progress");
  }

  const status =
    previous.status === "completed"
      ? "completed"
      : input.status;

  return {
    userId,
    programId: lesson.programId,
    contentId: lesson.id,
    contentType: contentType(lesson),
    lastSectionIndex: input.lastSectionIndex,
    progressPercent:
      status === "completed"
        ? 100
        : status === "not_started"
          ? 0
          : Math.min(
              99,
              Math.round(
                ((input.lastSectionIndex + 1) / count) * 100
              )
            ),
    status,
  };
}

function createContentProgressHandlers({
  db,
  HttpsError,
  FieldValue,
  requireRole,
  resolveAccess,
  serialize,
}) {
  const identifier = (value) =>
    typeof value === "string" &&
    /^[^/]{1,128}$/.test(value) &&
    value !== "." &&
    value !== "..";

  const collection = (uid, programId) =>
    db
      .collection("users")
      .doc(uid)
      .collection("programProgress")
      .doc(programId)
      .collection("content");

  async function context(request) {
    const user = await requireRole(request, "student");

    if ((user.accountStatus || "active") !== "active") {
      throw new HttpsError(
        "permission-denied",
        "Account is inactive."
      );
    }

    const { programId } = request.data || {};

    if (!identifier(programId)) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid program ID."
      );
    }

    return {
      user,
      userId: request.auth.uid,
      programId,
    };
  }

  return {
    /*
     * -----------------------------------------
     * GET RECENT CONTENT PROGRESS (NEW)
     * -----------------------------------------
     *
     * Used by StudentDashboard.
     *
     * Fetches a limited number of recent
     * unfinished bookmarks across programs.
     *
     * This does not return lesson content,
     * grant access, or award XP.
     *
     * Legacy bookmarks are not included here.
     */
    async getRecentContentProgress(request) {
      const user = await requireRole(request, "student");

      if ((user.accountStatus || "active") !== "active") {
        throw new HttpsError(
          "permission-denied",
          "Account is inactive."
        );
      }

      const userId = request.auth.uid;

      const snapshot = await db
        .collectionGroup("content")
        .where("userId", "==", userId)
        .where("status", "==", "in_progress")
        .orderBy("updatedAt", "desc")
        .limit(20)
        .get();

      const records = snapshot.docs
        .filter((item) => {
          const programRef = item.ref.parent.parent;
          const progressCollection = programRef?.parent;
          const ownerRef = progressCollection?.parent;
          const data = item.data();

          return (
            progressCollection?.id === "programProgress" &&
            ownerRef?.id === userId &&
            ownerRef?.parent?.id === "users" &&
            data.userId === userId &&
            data.programId === programRef.id &&
            data.contentId === item.id
          );
        })
        .map((item) => serialize(item.data()));

      return { progress: records };
    },

    /*
     * -----------------------------------------
     * GET CONTENT PROGRESS
     * -----------------------------------------
     *
     * Supports:
     * - One content item
     * - All content progress within a program
     * - Legacy lessonProgress documents
     */
    async getContentProgress(request) {
      const { userId, programId } = await context(request);

      const contentId = request.data?.contentId;

      if (contentId !== undefined) {
        if (!identifier(contentId)) {
          throw new HttpsError(
            "invalid-argument",
            "Invalid content ID."
          );
        }

        const saved = await collection(
          userId,
          programId
        )
          .doc(contentId)
          .get();

        if (saved.exists) {
          return {
            progress: [serialize(saved.data())],
          };
        }

        const [legacy, source] = await Promise.all([
          db
            .collection("lessonProgress")
            .doc(`${userId}_${contentId}`)
            .get(),

          db
            .collection("lessons")
            .doc(contentId)
            .get(),
        ]);

        const lesson = source.exists
          ? {
              ...source.data(),
              id: source.id,
            }
          : null;

        if (
          !legacy.exists ||
          !lesson ||
          lesson.programId !== programId ||
          !sectionCount(lesson)
        ) {
          return { progress: [] };
        }

        const data = legacy.data();

        const normalized = normalizeProgress(
          {
            lastSectionIndex: Math.max(
              0,
              Math.min(
                data.currentSlide || 0,
                sectionCount(lesson) - 1
              )
            ),
            status:
              data.status === "completed"
                ? "completed"
                : "in_progress",
          },
          lesson,
          userId
        );

        return {
          progress: [
            serialize({
              ...normalized,
              updatedAt: data.updatedAt,
              state: {
                mission: data.mission || null,
                answers: data.selectedAnswers || {},
                checkedAnswers: data.answerResults || {},
                codingAnswers: data.taskAnswers || {},
              },
            }),
          ],
        };
      }

      // Existing per-program behavior.
      // Keep this for backward compatibility.
      const [saved, lessons] = await Promise.all([
        collection(userId, programId).get(),

        db
          .collection("lessons")
          .where("programId", "==", programId)
          .get(),
      ]);

      const records = new Map(
        saved.docs.map((item) => [
          item.id,
          item.data(),
        ])
      );

      const missing = lessons.docs.filter(
        (item) => !records.has(item.id)
      );

      const legacy = missing.length
        ? await db.getAll(
            ...missing.map((item) =>
              db
                .collection("lessonProgress")
                .doc(`${userId}_${item.id}`)
            )
          )
        : [];

      legacy.forEach((snapshot, index) => {
        if (!snapshot.exists) return;

        const data = snapshot.data();

        const lesson = {
          ...missing[index].data(),
          id: missing[index].id,
        };

        if (!sectionCount(lesson)) return;

        const lastSectionIndex = Math.max(
          0,
          Math.min(
            data.currentSlide || 0,
            sectionCount(lesson) - 1
          )
        );

        records.set(lesson.id, {
          ...normalizeProgress(
            {
              lastSectionIndex,
              status:
                data.status === "completed"
                  ? "completed"
                  : "in_progress",
            },
            lesson,
            userId
          ),
          updatedAt: data.updatedAt,
          state: {
            mission: data.mission || null,
            answers: data.selectedAnswers || {},
            checkedAnswers:
              data.answerResults || {},
            codingAnswers: data.taskAnswers || {},
          },
        });
      });

      return {
        progress: serialize([...records.values()]),
      };
    },

    /*
     * -----------------------------------------
     * SAVE CONTENT PROGRESS
     * -----------------------------------------
     *
     * Validates real content access before save.
     * Completed records remain completed.
     */
    async saveContentProgress(request) {
      const { user, userId, programId } =
        await context(request);

      const input = request.data || {};

      if (!identifier(input.contentId)) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid content ID."
        );
      }

      const snapshot = await db
        .collection("lessons")
        .doc(input.contentId)
        .get();

      const lesson = snapshot.exists
        ? {
            ...snapshot.data(),
            id: snapshot.id,
          }
        : null;

      if (
        !lesson ||
        lesson.programId !== programId ||
        !(await resolveAccess(userId, user, lesson))
      ) {
        throw new HttpsError(
          "permission-denied",
          "Content access is required to save progress."
        );
      }

      const state = input.state ?? {};

      if (
        !state ||
        typeof state !== "object" ||
        Array.isArray(state) ||
        Buffer.byteLength(JSON.stringify(state)) > 250000
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid resume state."
        );
      }

      const ref = collection(userId, programId).doc(
        lesson.id
      );

      await db.runTransaction(async (tx) => {
        const previous = await tx.get(ref);

        let data;

        try {
          data = normalizeProgress(
            input,
            lesson,
            userId,
            previous.data()
          );
        } catch {
          throw new HttpsError(
            "invalid-argument",
            "Invalid progress."
          );
        }

        tx.set(ref, {
          ...data,
          state,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      return { saved: true };
    },
  };
}

module.exports = {
  createContentProgressHandlers,
  normalizeProgress,
  sectionCount,
};
