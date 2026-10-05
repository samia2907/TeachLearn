import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { newProgress, updateScreen, mergeProgress, missionReady } from '../src/components/mission/missionEngine.js';

// Exercise the repository without initializing browser Firebase in Node.
const source = readFileSync(new URL('../src/components/mission/missionRepository.js', import.meta.url), 'utf8');
const context = { missionReady };
runInNewContext(source.slice(source.indexOf('export async function commitMission'), source.indexOf('export function completeMission')).replace('export ', '') + '\nthis.commitMission = commitMission;', context);
const commitMission = async (...args) => JSON.parse(JSON.stringify(await context.commitMission(...args)));

const lesson = {
  id: 'program1--mission-01', programId: 'program1', activityType: 'mission',
  lessonType: 'commercial', xpReward: 100,
  sections: [{ id: 'question', type: 'multipleChoice', options: [{ id: 'yes' }], correctAnswer: 'yes', skills: ['logic'] }],
};

test('purchased mission submits source-checkable answers without class metadata', async () => {
  const solved = updateScreen(lesson.sections, newProgress(lesson.sections), {
    answer: 'yes', passed: true, checked: true, attempts: 2,
  });
  const requests = [];
  const complete = async (payload) => {
    requests.push(payload);
    return { data: { xp: 100, alreadyCompleted: false } };
  };

  assert.deepEqual(await commitMission(complete, lesson, solved), { xp: 100, alreadyCompleted: false });
  assert.deepEqual(JSON.parse(JSON.stringify(requests)), [{ lessonId: lesson.id, mission: solved }]);
  assert.deepEqual(mergeProgress(lesson.sections, requests[0].mission, null), solved);
});

test('incomplete purchased mission cannot request an XP award', async () => {
  await assert.rejects(
    commitMission(async () => ({ data: { xp: 100, alreadyCompleted: false } }), lesson, newProgress(lesson.sections)),
    /mission-incomplete/,
  );
});
