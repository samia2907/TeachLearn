import test from 'node:test';
import assert from 'node:assert/strict';
import mission from '../src/data/missions/mission01.js';
import { checkAnswer, mergeProgress, missionReady, newProgress, runRobot, updateScreen, validateMission } from '../src/components/mission/missionEngine.js';
import { commitMission } from '../src/components/mission/missionRepository.js';

const sections = mission.sections;
const answers = ['', 'clear', ['pick', 'insert', 'turn', 'open'], ['up', 'up', 'up', 'right', 'right', 'right'], ['up', 'up', 'right', 'right'], ''];

function solvedProgress() {
  let progress = newProgress(sections);
  sections.forEach((section, index) => {
    progress.currentScreen = index;
    progress = updateScreen(sections, progress, {
      answer: answers[index],
      passed: true,
      checked: true,
      attempts: section.type === 'story' ? 0 : 1,
    });
  });
  return progress;
}

test('Mission 01 is valid and every challenge has a working solution', () => {
  assert.equal(validateMission(sections), true);
  sections.forEach((screen, index) => assert.equal(checkAnswer(screen, answers[index]), true, screen.id));
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
  assert.deepEqual(restored.screens['key-sequence'].answer, sections[2].items.map(item => item.id));
  assert.equal(restored.screens['key-sequence'].attempts, 0);
});

test('completion sends validated answers only to the server-authoritative workflow', async () => {
  const calls = [];
  const complete = async (payload) => {
    calls.push(payload);
    return { data: { xp: 100, alreadyCompleted: false } };
  };

  assert.deepEqual(
    await commitMission(complete, { ...mission, id: 'lesson1' }, solvedProgress()),
    { xp: 100, alreadyCompleted: false },
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].lessonId, 'lesson1');
  assert.equal(missionReady(sections, calls[0].mission), true);
});

test('incomplete missions cannot request an XP award', async () => {
  await assert.rejects(
    commitMission(async () => ({ data: { xp: 100, alreadyCompleted: false } }), mission, newProgress(sections)),
    /mission-incomplete/,
  );
});
