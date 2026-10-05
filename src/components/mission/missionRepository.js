import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase';
import { mergeProgress, missionReady } from './missionEngine.js';

// Free previews and teacher/owner practice never write student progress or award XP.
export function createPracticeRepository() {
  const progress = new Map();
  return {
    practice: true,
    async loadMission(_db, lesson) { return progress.get(lesson.id) || {}; },
    async saveMission(_db, lesson, _student, mission) { progress.set(lesson.id, { mission }); },
    async completeMission(_db, lesson, _student, mission) {
      if (!missionReady(lesson.sections, mission)) throw new Error('mission-incomplete');
      progress.set(lesson.id, { mission, completed: true, xp: 0 });
      return { xp: 0, alreadyCompleted: false, totalXp: 0, level: 1, programCompleted: false, programCompletedNow: false, nextLessonId: null };
    },
  };
}

const references = (db, lesson, student) => {
  const id = `${student.id}_${lesson.id}`;
  return { progress: doc(db, 'lessonProgress', id), completion: doc(db, 'lessonCompletions', id) };
};
const metadata = (lesson, student) => ({
  studentId: student.id, studentName: student.name || '', lessonId: lesson.id,
  lessonTitle: lesson.titleI18n?.ar || lesson.title?.ar || (typeof lesson.title === 'string' ? lesson.title : ''),
  teacherId: lesson.teacherId ?? null, classId: lesson.classId ?? null, className: lesson.className || '',
  programAccessClassId: lesson.programAccessClassId ?? null,
});
const progressData = (lesson, student, mission, completed) => ({
  ...metadata(lesson, student), mission,
  ...(lesson.programId ? { programId: lesson.programId } : {}),
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
    if (completion.exists()) return;
    const merged = mergeProgress(lesson.sections, saved.data()?.mission, mission);
    tx.set(refs.progress, {
      ...progressData(lesson, student, merged, false),
      ...(!saved.exists() ? { createdAt: serverTimestamp() } : {}),
    }, { merge: true });
  });
}

export async function commitMission(complete, lesson, mission) {
  if (!missionReady(lesson.sections, mission)) throw new Error('mission-incomplete');
  const response = await complete({ lessonId: lesson.id, mission });
  const result = response?.data;
  if (
    !result ||
    !Number.isFinite(result.xp) ||
    typeof result.alreadyCompleted !== 'boolean' ||
    (result.totalXp != null && !Number.isFinite(result.totalXp)) ||
    (result.level != null && !Number.isFinite(result.level)) ||
    (result.programCompleted != null && typeof result.programCompleted !== 'boolean')
  ) {
    throw new Error('invalid-completion-response');
  }
  return result;
}

export function completeMission(_db, lesson, _student, mission) {
  return commitMission(
    httpsCallable(functions, 'completeLesson'),
    lesson,
    mission,
  );
}
