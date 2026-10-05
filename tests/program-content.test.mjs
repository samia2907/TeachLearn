import test from 'node:test';
import assert from 'node:assert/strict';
import { programContentType, countProgramContent, selectableProgramLessons } from '../functions/programContent.mjs';
import { programLessonViews } from '../functions/programAccessPolicy.mjs';

test('legacy mission marker and explicit types take precedence; embedded tasks/quizzes stay lessons', () => {
  assert.equal(programContentType({ activityType: 'mission' }), 'mission');
  assert.equal(programContentType({ contentType: 'lesson', activityType: 'mission' }), 'lesson');
  assert.equal(programContentType({ activityType: 'ai', sections: [{ type: 'multipleChoice' }, { type: 'task' }] }), 'lesson');
  assert.equal(programContentType({}), 'lesson');
  const records = [...Array.from({ length: 12 }, () => ({ sections: [{ type: 'multipleChoice' }] })),
    ...Array.from({ length: 6 }, () => ({ activityType: 'mission' }))];
  assert.deepEqual(countProgramContent(records), { lesson: 12, mission: 6, quiz: 0, activity: 0 });
  assert.deepEqual(countProgramContent([{ contentType: 'quiz' }, { activityType: 'activity' }]), { lesson: 0, mission: 0, quiz: 1, activity: 1 });
});

test('selection lists only published real lessons without reordering or mutating content', () => {
  const base = { programId: 'p', lessonType: 'commercial', status: 'published' };
  const records = [{ ...base, id: 'lesson' }, { ...base, id: 'mission', activityType: 'mission' },
    { ...base, id: 'quiz', contentType: 'quiz' }, { ...base, id: 'draft', status: 'draft' }];
  const before = JSON.stringify(records);
  assert.deepEqual(selectableProgramLessons(records, 'p').map(item => item.id), ['lesson']);
  assert.deepEqual(selectableProgramLessons(records, 'p', { includeDrafts: true }).map(item => item.id), ['lesson', 'draft']);
  assert.equal(JSON.stringify(records), before);
});

test('embedded missions remain available with their lesson; selected access and previews are unchanged', () => {
  const sections = [{ type: 'mission', body: 'embedded mission' }, { type: 'task' }];
  const lessons = [{ id: 'preview', order: 1 }, { id: 'selected', order: 2, sections },
    { id: 'locked', order: 3, sections: [{ body: 'secret' }] }, { id: 'legacy-mission', order: 4, activityType: 'mission', sections }];
  const result = programLessonViews({ lessons, program: { accessType: 'paid', status: 'published' }, programId: 'p',
    user: { role: 'student' }, access: { accessType: 'manual', accessScope: 'selected', lessonIds: ['selected', 'legacy-mission'] } });
  assert.equal(result[0].previewOnly, true);
  assert.deepEqual(result[1].sections, sections);
  assert.equal(result[2].locked, true); assert.equal(result[2].sections, undefined);
  assert.equal(result[3].locked, false);
});
