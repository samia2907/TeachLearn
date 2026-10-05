// Non-deploying Rules API tests with mocked documents; no student data is written.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const project = process.argv[2];
  assert.ok(project, 'Usage: node tests/mission-rules.cjs <project-id>');
  const cli = process.env.FIREBASE_TOOLS_LIB || path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib');
  const account = require(path.join(cli, 'auth')).getGlobalDefaultAccount();
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...account });
  const { Client } = require(path.join(cli, 'apiv2'));
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const time = '2026-09-14T12:00:00Z';
  const base = '/databases/default/documents/';
  const user = { uid: 'student1', role: 'student', classId: 'class1', accountStatus: 'active', xp: 20, completedLessons: 0, createdAt: 'earlier' };
  const lesson = { activityType: 'mission', status: 'published', teacherId: 'teacher1', classId: 'class1', sections: [{ id: 'one' }], xpReward: 100 };
  const progress = {
    studentId: 'student1', lessonId: 'lesson1', teacherId: 'teacher1', classId: 'class1',
    currentSlide: 0, maxUnlockedSlide: 0, selectedAnswers: {}, answerResults: {}, taskAnswers: {}, status: 'in_progress', createdAt: time, updatedAt: time,
    mission: { version: 1, currentScreen: 0, screens: {}, skills: {} },
  };
  const completion = { studentId: 'student1', lessonId: 'lesson1', teacherId: 'teacher1', classId: 'class1', xpReward: 100, completedAt: time };
  const rewarded = { ...user, xp: 120, completedLessons: 1, lastCompletedLessonId: 'lesson1', updatedAt: time };
  const cases = [];
  function add(label, method, document, data, expectation, options = {}) {
    const uid = options.uid || 'student1';
    const records = {
      'users/student1': user, 'users/other': { ...user, uid: 'other' },
      'lessons/lesson1': { ...lesson, ...options.lesson },
      'classMembers/class1_student1': {
        studentId: 'student1', classId: 'class1', status: 'active',
      },
      ...(options.completionExists ? { 'lessonCompletions/student1_lesson1': completion } : {}),
      ...(options.existing ? { [document]: options.existing } : {}),
      ...options.records,
    };
    const after = { ...records, 'users/student1': options.rewarded || rewarded, 'lessonCompletions/student1_lesson1': completion };
    const keys = new Set([...Object.keys(records), ...Object.keys(after), document]);
    const mocks = [];
    for (const key of keys) {
      for (const [name, values] of [['get', records], ['getAfter', after]]) {
        if (values[key]) mocks.push({ function: name, args: [{ exact_value: base + key }], result: { value: { data: values[key] } } });
      }
      for (const [name, values] of [['exists', records], ['existsAfter', after]]) {
        mocks.push({ function: name, args: [{ exact_value: base + key }], result: { value: Boolean(values[key]) } });
      }
    }
    cases.push([label, {
      expectation, request: { auth: { uid }, path: base + document, method, time,
        ...(['create', 'update'].includes(method) ? { resource: { data } } : {}) },
      ...(options.existing ? { resource: { data: options.existing } } : {}), functionMocks: mocks,
    }]);
  }
  add('first mission progress lookup', 'get', 'lessonProgress/student1_lesson1', null, 'ALLOW');
  add('first mission completion lookup', 'get', 'lessonCompletions/student1_lesson1', null, 'ALLOW');
  add('cannot probe another student missing progress', 'get', 'lessonProgress/student1_lesson1', null, 'DENY', { uid: 'other' });
  add('create mission progress', 'create', 'lessonProgress/student1_lesson1', progress, 'ALLOW');
  add('resume saved mission', 'get', 'lessonProgress/student1_lesson1', null, 'ALLOW', { existing: progress });
  add('save mission update', 'update', 'lessonProgress/student1_lesson1', progress, 'ALLOW', { existing: progress });
  add('cannot read another student progress', 'get', 'lessonProgress/student1_lesson1', null, 'DENY', { uid: 'other', existing: progress });
  add('cannot write another student progress', 'create', 'lessonProgress/student1_lesson1', progress, 'DENY', { uid: 'other' });
  add('unknown mission field denied', 'create', 'lessonProgress/student1_lesson1', { ...progress, mission: { ...progress.mission, bogus: 1 } }, 'DENY');
  add('out of range screen denied', 'create', 'lessonProgress/student1_lesson1', { ...progress, mission: { ...progress.mission, currentScreen: 8 } }, 'DENY');
  add('mission state on ordinary lesson denied', 'create', 'lessonProgress/student1_lesson1', progress, 'DENY', { lesson: { activityType: 'ai' } });
  const { mission: _ignored, ...legacy } = progress;
  add('ordinary lesson progress remains valid', 'create', 'lessonProgress/student1_lesson1', legacy, 'ALLOW', { lesson: { activityType: 'ai' } });
  add('client completion write is denied even with an XP update', 'create', 'lessonCompletions/student1_lesson1', completion, 'DENY');
  add('client completion cannot invent XP', 'create', 'lessonCompletions/student1_lesson1', { ...completion, xpReward: 999 }, 'DENY');
  add('client completion without user update denied', 'create', 'lessonCompletions/student1_lesson1', completion, 'DENY', { rewarded: user });
  add('completion cannot be replaced', 'update', 'lessonCompletions/student1_lesson1', completion, 'DENY', { existing: completion });
  add('completion cannot be removed', 'delete', 'lessonCompletions/student1_lesson1', null, 'DENY', { existing: completion });
  add('client XP update is denied even with a completion receipt', 'update', 'users/student1', rewarded, 'DENY', { existing: user });
  add('duplicate XP denied', 'update', 'users/student1', rewarded, 'DENY', { existing: user, completionExists: true });
  const independent = { ...user, classId: null };
  const paidLesson = { ...lesson, lessonType: 'commercial', programId: 'program1' };
  delete paidLesson.teacherId;
  delete paidLesson.classId;
  const paidProgress = { ...progress, teacherId: null, classId: null };
  const paidCompletion = { ...completion, teacherId: null, classId: null };
  const entitlement = { userId: 'student1', programId: 'program1', status: 'active' };
  const paidRecords = {
    'users/student1': independent,
    'lessons/lesson1': paidLesson,
    'programs/program1': { status: 'published', accessType: 'paid' },
    'programAccess/student_student1_program1': entitlement,
  };
  add('purchased student without class saves', 'create', 'lessonProgress/student1_lesson1', paidProgress, 'ALLOW', { records: paidRecords });
  for (const accessType of ['paid', 'class']) {
    const records = { ...paidRecords,
      'users/student1': { ...independent, ownerGrantedProgramIds: ['program1'] },
      'programs/program1': { status: 'published', accessType },
      'programAccess/student_student1_program1': null,
    };
    add(`owner-granted ${accessType} mission saves`, 'create', 'lessonProgress/student1_lesson1', paidProgress, 'ALLOW', { records });
    add(`owner-granted ${accessType} mission updates`, 'update', 'lessonProgress/student1_lesson1', paidProgress, 'ALLOW', { records, existing: paidProgress });
    for (const [label, replacement] of [
      ['revoked', { ...independent, ownerGrantedProgramIds: [] }],
      ['wrong program', { ...independent, ownerGrantedProgramIds: ['other'] }],
      ['suspended', { ...independent, accountStatus: 'suspended', ownerGrantedProgramIds: ['program1'] }],
    ]) {
      add(`${label} owner grant cannot save ${accessType} mission`, 'create', 'lessonProgress/student1_lesson1', paidProgress, 'DENY', {
        records: { ...records, 'users/student1': replacement },
      });
    }
  }
  for (const [label, program, expectation] of [
    ['explicitly free', { status: 'published', accessType: 'free' }, 'ALLOW'],
    ['missing access type', { status: 'published' }, 'DENY'],
  ]) {
    const records = { ...paidRecords, 'programs/program1': program, 'programAccess/student_student1_program1': null };
    add(`${label} student saves without purchase`, 'create', 'lessonProgress/student1_lesson1', paidProgress, expectation, { records });
    add(`${label} client completion is denied`, 'create', 'lessonCompletions/student1_lesson1', paidCompletion, 'DENY', { records });
  }
  add('personal purchase does not bypass class-only progress', 'create', 'lessonProgress/student1_lesson1', paidProgress, 'DENY', {
    records: { ...paidRecords, 'programs/program1': { status: 'published', accessType: 'class' } },
  });
  const classRecords = {
    ...paidRecords,
    'programs/program1': { status: 'published', accessType: 'class' },
    'programAccess/student_student1_program1': null,
    'classMembers/class2_student1': { studentId: 'student1', classId: 'class2', status: 'active' },
    'classAssignments/class2_program_program1': { status: 'active' },
  };
  add('multi-class student saves via assignment', 'create', 'lessonProgress/student1_lesson1', { ...paidProgress, programAccessClassId: 'class2' }, 'ALLOW', { records: classRecords });
  add('multi-class client completion is denied', 'create', 'lessonCompletions/student1_lesson1', { ...paidCompletion, programAccessClassId: 'class2' }, 'DENY', { records: classRecords });
  add('forged class hint denied', 'create', 'lessonProgress/student1_lesson1', { ...paidProgress, programAccessClassId: 'class2' }, 'DENY', {
    records: { ...classRecords, 'classMembers/class2_student1': { studentId: 'other', classId: 'class2', status: 'active' } },
  });
  add('inactive class membership denied', 'create', 'lessonProgress/student1_lesson1', { ...paidProgress, programAccessClassId: 'class2' }, 'DENY', {
    records: { ...classRecords, 'classMembers/class2_student1': { studentId: 'student1', classId: 'class2', status: 'inactive' } },
  });
  add('purchased student resumes', 'get', 'lessonProgress/student1_lesson1', null, 'ALLOW', { records: paidRecords, existing: paidProgress });
  add('purchased student updates', 'update', 'lessonProgress/student1_lesson1', paidProgress, 'ALLOW', { records: paidRecords, existing: paidProgress });
  add('purchased student client completion is denied', 'create', 'lessonCompletions/student1_lesson1', paidCompletion, 'DENY', { records: paidRecords });
  for (const [label, replacement] of [
    ['missing', null], ['revoked', { ...entitlement, status: 'revoked' }],
    ['another owner', { ...entitlement, userId: 'other' }],
    ['another program', { ...entitlement, programId: 'other' }],
  ]) {
    const records = { ...paidRecords, 'programAccess/student_student1_program1': replacement };
    add(`${label} entitlement cannot save`, 'create', 'lessonProgress/student1_lesson1', paidProgress, 'DENY', { records });
    add(`${label} entitlement cannot complete`, 'create', 'lessonCompletions/student1_lesson1', paidCompletion, 'DENY', { records });
  }
  add('unpublished purchased program denied', 'create', 'lessonProgress/student1_lesson1', paidProgress, 'DENY', { records: { ...paidRecords, 'programs/program1': { status: 'draft' } } });
  add('suspended purchaser denied', 'create', 'lessonProgress/student1_lesson1', paidProgress, 'DENY', { records: { ...paidRecords, 'users/student1': { ...independent, accountStatus: 'suspended' } } });
  add('purchased completion cannot inflate XP', 'create', 'lessonCompletions/student1_lesson1', { ...paidCompletion, xpReward: 999 }, 'DENY', { records: paidRecords });
  const result = await client.post(`/projects/${project}:test`, {
    source: { files: [{ name: 'firestore.rules', content: fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8') }] },
    testSuite: { testCases: cases.map(([, value]) => value) },
  }, { skipLog: { body: true, resBody: true } });
  assert.ok(!result.body.issues?.some(issue => issue.severity === 'ERROR'), JSON.stringify(result.body.issues));
  assert.equal(result.body.testResults?.length, cases.length);
  result.body.testResults.forEach((value, index) => {
    assert.equal(value.state, 'SUCCESS', `${cases[index][0]}: ${JSON.stringify(value)}`);
    console.log(`PASS ${cases[index][0]}`);
  });
}
main().catch(error => { console.error(error); process.exitCode = 1; });
