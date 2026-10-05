import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createRequire } from 'node:module';
import * as policy from '../functions/programAccessPolicy.mjs';
const { createManualAccessHandlers } = createRequire(import.meta.url)('../functions/manualProgramAccess.js');
const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');

function fixture() {
  const records = new Map(Object.entries({
    'users/owner': { role: 'owner', accountStatus: 'active' },
    'users/student': { role: 'student', name: 'Learner', email: 'learner@example.test', accountStatus: 'active' },
    'users/teacher': { role: 'teacher', accountStatus: 'active' },
    'programs/p1': { status: 'published', accessType: 'paid', title: { en: 'Program' } },
    'lessons/first': { programId: 'p1', lessonType: 'commercial', status: 'published', order: 1, sections: [{ answer: 'preview-answer' }] },
    'lessons/second': { programId: 'p1', lessonType: 'commercial', status: 'published', order: 2, sections: [{ answer: 'paid-secret' }], resourceUrl: 'private-url', attachments: ['private'] },
    'lessons/draft': { programId: 'p1', lessonType: 'commercial', status: 'draft', order: 0, sections: [{ answer: 'draft-secret' }] },
  }));
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const snapshot = path => ({ id: path.split('/').at(-1), exists: records.has(path), data: () => records.get(path) });
  const ref = path => ({ path, get: async () => snapshot(path), collection: name => collection(`${path}/${name}`) });
  function collection(name, filters = []) {
    return { doc: id => ref(`${name}/${id}`), where: (key, op, value) => collection(name, [...filters, [key, value]]),
      get: async () => ({ docs: [...records.keys()].filter(path => path.startsWith(`${name}/`) && path.split('/').length === name.split('/').length + 1
        && filters.every(([key, value]) => records.get(path)[key] === value)).map(snapshot) }) };
  }
  let transactions = Promise.resolve();
  const db = { collection, runTransaction(callback) {
    const run = transactions.then(async () => {
      const writes = [];
      const result = await callback({ get: async reference => snapshot(reference.path),
        set: (reference, value) => writes.push(() => records.set(reference.path, value)),
        update: (reference, value) => writes.push(() => records.set(reference.path, { ...records.get(reference.path), ...value })),
        create: (reference, value) => { if (records.has(reference.path)) throw new HttpsError('already-exists', 'duplicate'); writes.push(() => records.set(reference.path, value)); },
      });
      writes.forEach(write => write()); return result;
    });
    transactions = run.catch(() => {}); return run;
  } };
  const requireActiveUser = async request => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in');
    return snapshot(`users/${request.auth.uid}`);
  };
  const requireRole = async (request, role) => {
    const user = (await requireActiveUser(request)).data();
    if (user?.role !== role || user.accountStatus !== 'active') throw new HttpsError('permission-denied', 'Role');
    return user;
  };
  const FieldValue = { serverTimestamp: () => 'server-time' };
  const Timestamp = { fromMillis: millis => ({ toMillis: () => millis }) };
  const handlers = createManualAccessHandlers({ db, HttpsError, FieldValue, Timestamp, requireActiveUser, requireRole });
  const context = { ...policy, db, HttpsError, FieldValue, requireRole, exports: {}, console,
    safeId: value => value, serializeValue: value => value, onCall: (_, callback) => callback };
  runInNewContext(source.slice(source.indexOf('async function resolveProgramAccess('), source.indexOf('function verifyPaddleSignature(')), context);
  const request = (uid, data = {}) => ({ auth: { uid }, data: { programId: 'p1', ...data } });
  return { records, handlers, context, request,
    content: (uid, data) => context.exports.getPurchasedProgram(request(uid, data)),
    grant: (data = {}) => handlers.manageProgramAccess(request('owner', { userId: 'student', action: 'grant', grantType: 'manual_paid', ...data })),
  };
}

test('selected grants never become full access and update, expire and revoke independently of previews', async () => {
  const f = fixture();
  f.records.set('lessons/third', { programId: 'p1', lessonType: 'commercial', status: 'published', order: 3, sections: ['secret-third'] });
  await f.grant({ accessScope: 'selected', lessonIds: ['second'] });
  let result = await f.content('student');
  assert.equal(result.fullAccess, false);
  assert.deepEqual(Array.from(result.lessons, l => l.locked), [false, false, true]);
  assert.equal((await f.context.exports.checkProgramAccess(f.request('student'))).hasAccess, false);
  await assert.rejects(() => f.content('student', { accessOnly: true }), { code: 'permission-denied' });
  assert.equal(await f.context.resolveLessonCompletionAccess('student', f.records.get('users/student'), { id: 'third', ...f.records.get('lessons/third') }), null);
  assert.ok(await f.context.resolveLessonCompletionAccess('student', f.records.get('users/student'), { id: 'second', ...f.records.get('lessons/second') }));
  await f.grant({ accessScope: 'selected', lessonIds: ['third'] });
  assert.deepEqual(Array.from((await f.content('student')).lessons, l => l.locked), [false, true, false]);
  await f.grant({ accessScope: 'selected', lessonIds: ['second', 'third'] });
  assert.deepEqual(Array.from((await f.content('student')).lessons, l => l.locked), [false, false, false]);
  assert.equal((await f.content('student')).fullAccess, false);
  f.records.get('programAccess/student_p1').expiresAt = { toMillis: () => 1 };
  assert.deepEqual(Array.from((await f.content('student')).lessons, l => l.locked), [false, true, true]);
  await f.grant({ accessScope: 'selected', lessonIds: ['second'] });
  await f.handlers.manageProgramAccess(f.request('owner', { action: 'revoke', userId: 'student' }));
  assert.deepEqual(Array.from((await f.content('student')).lessons, l => l.locked), [false, true, true]);
});

test('scope validation rejects foreign, archived, missing and malformed lessons; old grants remain full', async () => {
  const f = fixture();
  f.records.set('lessons/foreign', { programId: 'p2', status: 'published', lessonType: 'commercial' });
  f.records.set('lessons/archived', { programId: 'p1', status: 'archived', lessonType: 'commercial' });
  for (const lessonIds of [[], ['foreign'], ['archived'], ['missing'], ['bad/id'], 'second']) {
    await assert.rejects(() => f.grant({ accessScope: 'selected', lessonIds }), { code: 'invalid-argument' });
  }
  await assert.rejects(() => f.grant({ accessScope: 'invalid' }), { code: 'invalid-argument' });
  await f.grant(); delete f.records.get('programAccess/student_p1').accessScope;
  assert.equal((await f.content('student')).fullAccess, true);
  await f.grant({ accessScope: 'selected', lessonIds: ['first'] });
  f.records.set('programAccess/student_student_p1', { userId: 'student', programId: 'p1', status: 'active', accessType: 'personal' });
  assert.equal((await f.content('student')).fullAccess, true);
  assert.ok((await f.content('student')).lessons.every(l => !l.locked));
});

test('draft grants are accepted but never publish or expose draft content to students or teachers', async () => {
  const f = fixture();
  for (const userId of ['student', 'teacher']) {
    await f.grant({ userId, accessScope: 'selected', lessonIds: ['draft'] });
    assert.ok(!(await f.content(userId)).lessons.some(item => item.id === 'draft'));
    assert.equal(await f.context.resolveLessonCompletionAccess(userId, f.records.get(`users/${userId}`), {id: 'draft', ...f.records.get('lessons/draft')}), null);
  }
  assert.equal(f.records.get('lessons/draft').status, 'draft');
});

test('owner explicitly assigns valid mission parent; content and existing mission grants are preserved', async () => {
  const f = fixture();
  const mission = { programId: 'p1', lessonType: 'commercial', activityType: 'mission', status: 'published', order: 9, sections: ['mission secret'] };
  f.records.set('lessons/mission', mission);
  const assign = (parentLessonId, uid = 'owner') => f.handlers.assignMissionParent(f.request(uid, { missionId: 'mission', parentLessonId }));
  await assert.rejects(() => assign('second', 'student'), { code: 'permission-denied' });
  await assert.rejects(() => assign('mission'), { code: 'invalid-argument' });
  f.records.set('lessons/foreign', { programId: 'other', lessonType: 'commercial', status: 'published' });
  await assert.rejects(() => assign('foreign'), { code: 'invalid-argument' });
  await assign('second');
  assert.deepEqual(f.records.get('lessons/mission').sections, mission.sections);
  assert.equal((await f.content('student')).lessons.find(l => l.id === 'mission').locked, true);
  await f.grant({ accessScope: 'selected', lessonIds: ['second'] });
  assert.equal((await f.content('student')).lessons.find(l => l.id === 'mission').locked, false);
  assert.ok(await f.context.resolveLessonCompletionAccess('student', f.records.get('users/student'), {id: 'mission', ...f.records.get('lessons/mission')}));
  await assign('draft');
  assert.equal((await f.content('student')).lessons.find(l => l.id === 'mission').locked, true);
  assert.equal(await f.context.resolveLessonCompletionAccess('student', f.records.get('users/student'), {id: 'mission', ...f.records.get('lessons/mission')}), null);
  await f.grant({ accessScope: 'selected', lessonIds: ['mission'] });
  assert.equal((await f.content('student')).lessons.find(l => l.id === 'mission').locked, false);
  await assign(null);
  assert.equal(f.records.get('lessons/mission').parentLessonId, null);
});

test('linked mission inherits parent preview as practice, never persistent completion access', async () => {
  const f = fixture();
  f.records.set('lessons/mission', { programId: 'p1', lessonType: 'commercial', activityType: 'mission', status: 'published', order: 9, parentLessonId: 'first', sections: ['mission'] });
  const view = (await f.content('student')).lessons.find(l => l.id === 'mission');
  assert.equal(view.locked, false); assert.equal(view.previewOnly, true);
  assert.equal(await f.context.resolveLessonCompletionAccess('student', f.records.get('users/student'), {id: 'mission', ...f.records.get('lessons/mission')}), null);
});

test('legacy and unsupported programs offer request metadata without unlocking content; free/class requests stay excluded', async () => {
  for (const role of ['student', 'teacher']) {
    const f = fixture();
    delete f.records.get('programs/p1').accessType;
    const result = await f.content(role);
    assert.equal(result.fullAccess, false);
    assert.ok(result.lessons.every(lesson => lesson.locked && !lesson.sections));
    assert.equal((await f.handlers.requestProgramAccess(f.request(role))).status, 'pending');
    assert.equal((await f.handlers.requestProgramAccess(f.request(role))).duplicate, true);
    await assert.rejects(() => f.content(role, { accessOnly: true }), { code: 'permission-denied' });
    f.records.get('programs/p1').accessType = 'unsupported';
    assert.ok((await f.content(role)).lessons.every(lesson => lesson.locked));
    for (const accessType of ['free', 'class']) {
      f.records.get('programs/p1').accessType = accessType;
      await assert.rejects(() => f.handlers.requestProgramAccess(f.request(role)), { code: 'failed-precondition' });
    }
  }
});

test('paid preview defaults to the first published lesson; locked content never leaves the server', async () => {
  const f = fixture();
  for (const role of ['student', 'teacher']) {
    const result = await f.content(role, { role: 'owner', lessonIndex: 0, previewLessonCount: 100, manualAccess: true });
    assert.equal(result.fullAccess, false);
    assert.equal(result.lessons.length, 2);
    assert.equal(result.lessons[0].previewOnly, true);
    assert.equal(result.lessons[1].locked, true);
    assert.equal(result.lessons[1].sections, undefined);
    assert.equal(result.lessons[1].resourceUrl, undefined);
    assert.ok(!JSON.stringify(result).includes('paid-secret'));
    assert.ok(!JSON.stringify(result).includes('draft-secret'));
    await assert.rejects(() => f.content(role, { accessOnly: true }), { code: 'permission-denied' });
  }
});

test('owner has full content; preview count zero, two, and stable ties are enforced', async () => {
  const f = fixture();
  assert.equal((await f.content('owner')).lessons.length, 3);
  assert.equal((await f.content('owner')).fullAccess, true);
  f.records.get('programs/p1').previewLessonCount = 0;
  assert.ok((await f.content('student')).lessons.every(lesson => lesson.locked));
  f.records.get('programs/p1').previewLessonCount = 2;
  assert.ok((await f.content('student')).lessons.every(lesson => !lesson.locked));
  assert.deepEqual([{ id: 'b' }, { id: 'a' }].sort(policy.compareProgramLessons).map(l => l.id), ['a', 'b']);
});

test('manual grants use UID, keep notes private, and revoke back to preview', async () => {
  const f = fixture();
  await f.grant({ note: 'private owner note', paymentMethod: 'cash' });
  assert.equal(f.records.get('programAccess/student_p1').userId, 'student');
  assert.equal(f.records.get('programAccess/student_p1').note, undefined);
  assert.equal(f.records.get('programAccess/student_p1/private/metadata').note, 'private owner note');
  const full = await f.content('student');
  assert.equal(full.fullAccess, true); assert.ok(full.lessons.every(l => !l.locked));
  assert.ok(!JSON.stringify(full).includes('private owner note'));
  assert.equal((await f.context.exports.checkProgramAccess(f.request('student'))).source, 'manual');
  await f.handlers.manageProgramAccess(f.request('owner', { action: 'revoke', userId: 'student' }));
  assert.equal((await f.content('student')).lessons[1].locked, true);
});

test('expiration uses server time, requires a valid Timestamp, and supports permanent access', async () => {
  const f = fixture();
  await assert.rejects(() => f.grant({ expiresAt: '2000-01-01' }), { code: 'invalid-argument' });
  await f.grant({ expiresAt: new Date(Date.now() + 60000).toISOString() });
  assert.equal((await f.content('student')).fullAccess, true);
  const grant = f.records.get('programAccess/student_p1');
  grant.expiresAt = { toMillis: () => 1 };
  assert.equal((await f.content('student')).fullAccess, false);
  grant.expiresAt = '2099-01-01';
  assert.equal((await f.content('student')).fullAccess, false);
  grant.expiresAt = null;
  assert.equal((await f.content('student')).fullAccess, true);
  grant.userId = 'other';
  assert.equal((await f.content('student')).fullAccess, false);
});

test('stored owner role is required for grants, revokes, notes and reviews', async () => {
  const f = fixture();
  for (const role of ['student', 'teacher']) {
    for (const action of ['grant', 'revoke']) await assert.rejects(() => f.handlers.manageProgramAccess(f.request(role, { role: 'owner', action, userId: 'student', grantType: 'manual_paid' })), { code: 'permission-denied' });
    for (const action of ['approve', 'reject', 'note']) await assert.rejects(() => f.handlers.reviewAccessRequest(f.request(role, { role: 'owner', action, userId: 'student' })), { code: 'permission-denied' });
  }
  f.records.get('users/owner').accountStatus = 'suspended';
  await assert.rejects(() => f.grant(), { code: 'permission-denied' });
});

test('concurrent requests deduplicate and use trusted identity and email', async () => {
  const f = fixture();
  const results = await Promise.all(Array.from({ length: 8 }, () => f.handlers.requestProgramAccess(f.request('student', { userId: 'owner', userEmail: 'forged', status: 'approved' }))));
  assert.equal(results.filter(r => !r.duplicate).length, 1);
  const request = f.records.get('accessRequests/student_p1');
  assert.equal(request.userId, 'student'); assert.equal(request.userEmail, 'learner@example.test'); assert.equal(request.status, 'pending');
  assert.equal((await f.content('student')).fullAccess, false);
});

test('approval and grant are atomic, a second review cannot override them, rejection grants nothing', async () => {
  const f = fixture();
  await f.handlers.requestProgramAccess(f.request('student'));
  const data = { action: 'approve', userId: 'student', grantType: 'free_gift', note: 'internal', expiresAt: null };
  await f.handlers.reviewAccessRequest(f.request('owner', data));
  assert.equal(f.records.get('accessRequests/student_p1').status, 'approved');
  assert.equal((await f.content('student')).fullAccess, true);
  await assert.rejects(() => f.handlers.reviewAccessRequest(f.request('owner', data)), { code: 'failed-precondition' });
  await f.handlers.requestProgramAccess(f.request('teacher'));
  await f.handlers.reviewAccessRequest(f.request('owner', { userId: 'teacher', action: 'reject', note: 'private rejection' }));
  assert.equal(f.records.get('accessRequests/teacher_p1').status, 'rejected');
  assert.equal(f.records.has('programAccess/teacher_p1'), false);
  const invalid = fixture();
  await invalid.handlers.requestProgramAccess(invalid.request('student'));
  invalid.records.delete('programs/p1');
  await assert.rejects(() => invalid.handlers.reviewAccessRequest(invalid.request('owner', data)), { code: 'not-found' });
  assert.equal(invalid.records.get('accessRequests/student_p1').status, 'pending');
  assert.equal(invalid.records.has('programAccess/student_p1'), false);
});

test('free programs, existing purchases, legacy owner grants and classroom access remain available', async () => {
  for (const role of ['student', 'teacher']) {
    const f = fixture(); f.records.get('programs/p1').accessType = 'free';
    assert.equal((await f.content(role)).fullAccess, true);
    f.records.get('programs/p1').accessType = 'paid';
    f.records.set(`programAccess/${role}_${role}_p1`, { userId: role, programId: 'p1', status: 'active' });
    assert.equal((await f.content(role)).fullAccess, true);
  }
  const f = fixture(); f.records.get('users/student').ownerGrantedProgramIds = ['p1'];
  assert.equal((await f.content('student')).fullAccess, true);
  delete f.records.get('users/student').ownerGrantedProgramIds;
  f.records.set('classMembers/c_student', { studentId: 'student', classId: 'c', status: 'active' });
  f.records.set('classAssignments/c_program_p1', { programId: 'p1', classId: 'c', status: 'active' });
  await f.grant({ accessScope: 'selected', lessonIds: ['first'] });
  assert.equal((await f.content('student')).fullAccess, true);
  await f.grant(); await f.handlers.manageProgramAccess(f.request('owner', { userId: 'student', action: 'revoke' }));
  assert.equal((await f.content('student')).fullAccess, true);
});

test('disabled accounts and unpublished programs cannot use preview or manual access', async () => {
  const f = fixture(); await f.grant();
  f.records.get('programs/p1').status = 'draft';
  await assert.rejects(() => f.content('student'), { code: 'permission-denied' });
  f.records.get('programs/p1').status = 'published'; f.records.get('users/student').accountStatus = 'suspended';
  await assert.rejects(() => f.content('student'), { code: 'permission-denied' });
  await assert.rejects(() => f.handlers.requestProgramAccess(f.request('student')), { code: 'permission-denied' });
});
