import test from 'node:test';
import assert from 'node:assert/strict';
import mission from '../src/data/missions/mission01.js';
import { checkAnswer, mergeProgress, missionReady, newProgress, runRobot, updateScreen, validateMission } from '../src/components/mission/missionEngine.js';
import { commitMission } from '../src/components/mission/missionRepository.js';

const sections = mission.sections;
const answers = ['', 'clear', ['pick', 'insert', 'turn', 'open'], ['up', 'up', 'up', 'right', 'right', 'right'], ['up', 'up', 'right', 'right'], ''];
function solvedProgress() {
  let progress = newProgress(sections);
  sections.forEach((s, i) => {
    progress.currentScreen = i;
    progress = updateScreen(sections, progress, { answer: answers[i], passed: true, checked: true, attempts: s.type === 'story' ? 0 : 1 });
  });
  return progress;
}
test('Mission 01 is valid and every challenge has a working solution', () => {
  assert.equal(validateMission(sections), true);
  sections.forEach((screen, i) => assert.equal(checkAnswer(screen, answers[i]), true, screen.id));
  assert.equal(missionReady(sections, solvedProgress()), true);
  assert.equal(validateMission([...sections, sections[0]]), false);
});
test('wrong choice, reordered steps, walls, boundaries, empty and unknown robot commands fail', () => {
  assert.equal(checkAnswer(sections[1], 'speed'), false);
  assert.equal(checkAnswer(sections[2], ['turn', 'pick', 'open', 'insert']), false);
  assert.equal(runRobot(sections[3].grid, ['right']).error, 'blocked');
  assert.equal(runRobot(sections[3].grid, ['down']).error, 'blocked');
  assert.equal(runRobot(sections[3].grid, []).correct, false);
  assert.equal(runRobot(sections[3].grid, ['teleport']).correct, false);
  assert.equal(checkAnswer(sections[4], sections[4].commands), false);
});
test('refresh restores answers, screen, attempts, hints, and derived skills', () => {
  const progress = solvedProgress();
  progress.screens['deliver-key'].attempts = 3;
  progress.screens['deliver-key'].hintsUsed = 1;
  const restored = mergeProgress(sections, null, JSON.parse(JSON.stringify(progress)));
  assert.deepEqual(restored, progress);
  assert.deepEqual(restored.skills.sequencing, { passed: 2, total: 2 });
});
test('stale tab cannot lose solved challenges or multiply skills; future screens stay locked', () => {
  const solved = solvedProgress();
  const stale = newProgress(sections);
  stale.currentScreen = 5;
  const merged = mergeProgress(sections, solved, stale);
  assert.equal(missionReady(sections, merged), true);
  assert.deepEqual(merged.skills, solved.skills);
  assert.equal(mergeProgress(sections, null, stale).currentScreen, 0);
  stale.screens['computer-thinking'] = { answer: 'wrong', passed: true };
  assert.equal(mergeProgress(sections, null, stale).screens['computer-thinking'].passed, false);
});
test('corrupt cached answers and counters recover safely', () => {
  const cached = newProgress(sections);
  cached.screens['key-sequence'] = { answer: {}, hintsUsed: 'bad', attempts: -4 };
  const restored = mergeProgress(sections, null, cached);
  assert.deepEqual(restored.screens['key-sequence'].answer, sections[2].items.map(i => i.id));
  assert.equal(restored.screens['key-sequence'].attempts, 0);
});
function fixture() {
  const records = new Map([['user', { xp: 40, completedLessons: 2 }]]);
  let writes = [];
  const tx = {
    get: async ref => ({ exists: () => records.has(ref), data: () => records.get(ref) }),
    set: (ref, value) => writes.push([ref, { ...records.get(ref), ...value }]),
    update: (ref, value) => writes.push([ref, { ...records.get(ref), ...value }]),
  };
  return { records, tx, writes: () => writes, commit: () => { writes.forEach(([key, value]) => records.set(key, value)); writes = []; } };
}
const refs = { progress: 'progress', completion: 'completion', user: 'user' };
const lesson = { ...mission, id: 'lesson1', teacherId: 'teacher1', classId: 'class1' };
const student = { id: 'student1', name: 'Student' };
test('completion atomically awards XP, increments lesson count, and saves skills exactly once', async () => {
  const f = fixture();
  assert.deepEqual(await commitMission(f.tx, refs, lesson, student, solvedProgress()), { xp: 100, alreadyCompleted: false });
  assert.equal(f.writes().length, 3);
  f.commit();
  assert.equal(f.records.get('user').xp, 140);
  assert.equal(f.records.get('user').completedLessons, 3);
  assert.equal(f.records.get('progress').status, 'completed');
  assert.equal(f.records.get('progress').mission.skills.debugging.passed, 1);
  // A second tab or a lost response retries against the same deterministic record.
  assert.deepEqual(await commitMission(f.tx, refs, lesson, student, solvedProgress()), { xp: 100, alreadyCompleted: true });
  assert.equal(f.writes().length, 0);
});
test('incomplete missions cannot commit XP or completion', async () => {
  const f = fixture();
  await assert.rejects(commitMission(f.tx, refs, lesson, student, newProgress(sections)), /mission-incomplete/);
  assert.equal(f.writes().length, 0);
});
