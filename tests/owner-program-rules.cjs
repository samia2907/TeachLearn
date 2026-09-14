// Non-deploying Firebase Rules API regression tests. All user lookups are mocked.
// Run: node tests/owner-program-rules.cjs <project-id>
// Requires a signed-in Firebase CLI; set FIREBASE_TOOLS_LIB if installed elsewhere.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const project = process.argv[2];
  assert.ok(project, 'Pass the Firebase project ID for the rules test endpoint.');
  const cli = process.env.FIREBASE_TOOLS_LIB || path.join(
    process.env.APPDATA, 'npm/node_modules/firebase-tools/lib',
  );
  const account = require(path.join(cli, 'auth')).getGlobalDefaultAccount();
  await require(path.join(cli, 'requireAuth')).requireAuth({ project, ...account });
  const { Client } = require(path.join(cli, 'apiv2'));
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1' });
  const source = fs.readFileSync(path.join(__dirname, '../firestore.rules'), 'utf8');
  // These rules compare timestamps for equality; matching test values model
  // preserved createdAt and serverTimestamp() == request.time.
  const time = '2026-09-09T12:00:00Z';
  const before = {
    title: { en: 'Coding', ar: 'Coding' }, description: { en: 'Description', ar: '' },
    status: 'published', createdBy: 'owner', createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T12:00:00Z', publishedAt: '2026-09-01T12:00:00Z',
  };
  const after = {
    ...before, title: { en: 'Updated', ar: 'Updated' }, description: { en: 'Updated', ar: '' },
    grades: [3, 4], lessonCount: 10, finalProject: { en: 'Build a game', ar: '' },
    pricing: { student: 210, teacher: 100, class: 100 },
    paddlePriceIds: { student: `pri_${'a'.repeat(26)}`, teacher: `pri_${'b'.repeat(26)}`, class: '' },
    updatedAt: time,
  };
  function testCase(role, method, data = after, expectation = 'DENY', status = 'active', document = 'programs/p1', existing = before) {
    return {
      expectation,
      request: {
        auth: role ? { uid: role } : null,
        path: `/databases/default/documents/${document}`, method, time,
        ...(method !== 'delete' && method !== 'get' ? { resource: { data } } : {}),
      },
      ...(method !== 'create' ? { resource: { data: existing } } : {}),
      functionMocks: role ? [
        { function: 'exists', args: [{ exact_value: `/databases/default/documents/users/${role}` }], result: { value: true } },
        { function: 'get', args: [{ exact_value: `/databases/default/documents/users/${role}` }], result: { value: { data: { role, accountStatus: status } } } },
      ] : [],
    };
  }
  async function run(label, content, cases) {
    const result = await client.post(`/projects/${project}:test`, {
      source: { files: [{ name: 'firestore.rules', content }] },
      testSuite: { testCases: cases.map(([, value]) => value) },
    }, { skipLog: { body: true, resBody: true } });
    assert.ok(!result.body.issues?.some(issue => issue.severity === 'ERROR'), JSON.stringify(result.body.issues));
    assert.equal(result.body.testResults?.length, cases.length);
    result.body.testResults.forEach((value, index) => {
      assert.equal(value.state, 'SUCCESS', `${label}: ${cases[index][0]}: ${JSON.stringify(value)}`);
      console.log(`PASS ${label}: ${cases[index][0]}`);
    });
  }
  assert.ok(source.includes("'createdAt', 'updatedAt', 'publishedAt'"));
  await run('before fix', source.replace("'createdAt', 'updatedAt', 'publishedAt'", "'createdAt', 'updatedAt'"), [
    ['retained publishedAt blocks owner save', testCase('owner', 'update')],
  ]);
  const cases = [
    ['owner saves published program and editable fields', testCase('owner', 'update', after, 'ALLOW')],
    ['owner creates', testCase('owner', 'create', { ...after, createdAt: time }, 'ALLOW')],
    ['owner deletes', testCase('owner', 'delete', after, 'ALLOW')],
    ['owner unpublishes', testCase('owner', 'update', { ...after, status: 'draft', publishedAt: null }, 'ALLOW')],
    ['owner publishes', testCase('owner', 'update', { ...after, publishedAt: time }, 'ALLOW')],
    ['creator cannot change', testCase('owner', 'update', { ...after, createdBy: 'someone-else' })],
    ['creation time cannot change', testCase('owner', 'update', { ...after, createdAt: time })],
    ['unknown field denied', testCase('owner', 'update', { ...after, unauthorizedField: true })],
    ['suspended owner denied', testCase('owner', 'update', after, 'DENY', 'suspended')],
    ['published catalog remains public', testCase(null, 'get', after, 'ALLOW')],
    ['program access remains server-written', testCase('owner', 'create', after, 'DENY', 'active', 'programAccess/p1')],
  ];
  for (const role of ['teacher', 'student', null]) {
    for (const method of ['create', 'update', 'delete']) {
      const data = method === 'create' ? { ...after, createdBy: role, createdAt: time } : after;
      cases.push([`${role || 'anonymous'} ${method} denied`, testCase(role, method, data)]);
    }
  }
  await run('fixed rules', source, cases);

  const lesson = {
    title: { en: 'Lesson', ar: '' }, description: { en: '', ar: '' },
    programId: 'p1', lessonType: 'commercial', sellable: true,
    createdBy: 'owner', createdByRole: 'owner', status: 'draft',
    minutes: 30, lessonNumber: 1, order: 1, xp: 10, slideCount: 0, sections: [],
    createdAt: before.createdAt, updatedAt: before.updatedAt,
  };
  const archived = { ...lesson, status: 'archived', archivedAt: time, updatedAt: time };
  const published = { ...lesson, status: 'published', publishedAt: time, updatedAt: time };
  function lessonCase(role, method, data = archived, expectation = 'DENY', existing = lesson, status = 'active') {
    return testCase(role, method, data, expectation, status, 'lessons/l1', existing);
  }
  const originalLessonRules = source.replace(
    "'completedCount', 'createdAt', 'updatedAt', 'publishedAt', 'archivedAt'",
    "'completedCount', 'createdAt', 'updatedAt'",
  );
  assert.notEqual(originalLessonRules, source);
  await run('before lesson fix', originalLessonRules, [
    ['archivedAt blocks owner archive', lessonCase('owner', 'update')],
    ['publishedAt blocks owner publish', lessonCase('owner', 'update', published)],
  ]);
  const teacherLesson = { ...lesson, lessonType: 'class', createdBy: 'teacher', teacherId: 'teacher', classId: 'class1' };
  const teacherArchive = { ...teacherLesson, status: 'archived', archivedAt: time, updatedAt: time };
  const lessonCases = [
    ['owner creates commercial lesson', lessonCase('owner', 'create', { ...lesson, createdAt: time, updatedAt: time }, 'ALLOW')],
    ['owner edits another creator commercial lesson', lessonCase('owner', 'update', { ...archived, createdBy: 'another-owner' }, 'ALLOW', { ...lesson, createdBy: 'another-owner' })],
    ['owner archives commercial lesson', lessonCase('owner', 'update', archived, 'ALLOW')],
    ['owner publishes commercial lesson', lessonCase('owner', 'update', published, 'ALLOW')],
    ['owner archives previously published lesson', lessonCase('owner', 'update', { ...archived, publishedAt: time }, 'ALLOW', published)],
    ['owner deletes commercial lesson', lessonCase('owner', 'delete', archived, 'ALLOW')],
    ['owner cannot delete class lesson', lessonCase('owner', 'delete', teacherArchive, 'DENY', teacherLesson)],
    ['teacher archives own lesson', lessonCase('teacher', 'update', teacherArchive, 'ALLOW', teacherLesson)],
    ['teacher cannot archive another teacher lesson', lessonCase('teacher', 'update', { ...teacherArchive, teacherId: 'another-teacher' }, 'DENY', { ...teacherLesson, teacherId: 'another-teacher' })],
    ['teacher cannot take ownership', lessonCase('teacher', 'update', teacherArchive, 'DENY', { ...teacherLesson, teacherId: 'another-teacher' })],
    ['teacher deletion remains denied', lessonCase('teacher', 'delete', teacherArchive, 'DENY', teacherLesson)],
    ['immutable creator preserved', lessonCase('owner', 'update', { ...archived, createdBy: 'changed' })],
    ['unknown lesson field denied', lessonCase('owner', 'update', { ...archived, unexpected: true })],
    ['suspended owner denied', lessonCase('owner', 'update', archived, 'DENY', lesson, 'suspended')],
    ['student cannot read commercial lesson directly', lessonCase('student', 'get', published, 'DENY', published)],
    ['anonymous cannot read commercial lesson', lessonCase(null, 'get', published, 'DENY', published)],
    ['owner can preview commercial lesson', lessonCase('owner', 'get', published, 'ALLOW', published)],
  ];
  for (const role of ['teacher', 'student', null]) {
    for (const method of ['create', 'update', 'delete']) {
      lessonCases.push([`${role || 'anonymous'} commercial lesson ${method} denied`, lessonCase(role, method,
        method === 'create' ? { ...lesson, createdBy: role, createdAt: time, updatedAt: time } : archived)]);
    }
  }
  await run('fixed lesson rules', source, lessonCases);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
