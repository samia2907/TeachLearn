import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { mergeProgress, missionReady } from './missionEngine.js';

const references = (db, lesson, student) => {
  const id = `${student.id}_${lesson.id}`;
  return { progress: doc(db, 'lessonProgress', id), completion: doc(db, 'lessonCompletions', id), user: doc(db, 'users', student.id) };
};
const metadata = (lesson, student) => ({
  studentId: student.id, studentName: student.name || '', lessonId: lesson.id,
  lessonTitle: lesson.titleI18n?.ar || lesson.title?.ar || (typeof lesson.title === 'string' ? lesson.title : ''),
  teacherId: lesson.teacherId, classId: lesson.classId, className: lesson.className || '',
});
const progressData = (lesson, student, mission, completed) => ({
  ...metadata(lesson, student), mission,
  currentSlide: mission.currentScreen,
  maxUnlockedSlide: Math.min(lesson.sections.findIndex(s => !mission.screens[s.id].passed) < 0
    ? lesson.sections.length - 1 : lesson.sections.findIndex(s => !mission.screens[s.id].passed), lesson.sections.length - 1),
  selectedAnswers: {}, answerResults: Object.fromEntries(lesson.sections.map(s => [s.id, mission.screens[s.id].passed ? 'correct' : 'pending'])),
  taskAnswers: {}, status: completed ? 'completed' : 'in_progress', updatedAt: serverTimestamp(),
});

export async function loadMission(db, lesson, student) {
  const refs = references(db, lesson, student);
  const [progress, completion] = await Promise.all([getDoc(refs.progress), getDoc(refs.completion)]);
  return { mission: progress.data()?.mission, completed: completion.exists(), xp: completion.data()?.xpReward ?? 0 };
}

export async function saveMission(db, lesson, student, mission) {
  const refs = references(db, lesson, student);
  return runTransaction(db, async tx => {
    const [saved, completion] = await Promise.all([tx.get(refs.progress), tx.get(refs.completion)]);
    // A stale tab must never overwrite a completed mission.
    if (completion.exists()) return;
    const merged = mergeProgress(lesson.sections, saved.data()?.mission, mission);
    tx.set(refs.progress, {
      ...progressData(lesson, student, merged, false),
      ...(!saved.exists() ? { createdAt: serverTimestamp() } : {}),
    }, { merge: true });
  });
}

// Exported separately so retry/idempotency behavior can be tested without a live account.
export async function commitMission(tx, refs, lesson, student, mission) {
  const completion = await tx.get(refs.completion);
  if (completion.exists()) return { xp: completion.data().xpReward, alreadyCompleted: true };
  const [saved, user] = await Promise.all([tx.get(refs.progress), tx.get(refs.user)]);
  const merged = mergeProgress(lesson.sections, saved.data()?.mission, mission);
  if (!missionReady(lesson.sections, merged)) throw new Error('mission-incomplete');
  if (!user.exists()) throw new Error('student-not-found');
  const xp = Number(lesson.xpReward ?? lesson.xp ?? 0);
  if (!Number.isFinite(xp) || xp < 0 || xp > 10000) throw new Error('invalid-reward');
  tx.set(refs.completion, { ...metadata(lesson, student), xpReward: xp, completedAt: serverTimestamp() });
  tx.update(refs.user, {
    xp: Number(user.data().xp || 0) + xp,
    completedLessons: Number(user.data().completedLessons || 0) + 1,
    lastCompletedLessonId: lesson.id, updatedAt: serverTimestamp(),
  });
  tx.set(refs.progress, {
    ...progressData(lesson, student, merged, true), completedAt: serverTimestamp(),
    ...(!saved.exists() ? { createdAt: serverTimestamp() } : {}),
  }, { merge: true });
  return { xp, alreadyCompleted: false };
}

export function completeMission(db, lesson, student, mission) {
  return runTransaction(db, tx => commitMission(tx, references(db, lesson, student), lesson, student, mission));
}
