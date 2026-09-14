import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const start = source.indexOf('exports.studentLogin =');
const end = source.indexOf('/* =========================================================', start);
function fixture({ alias = 'c_tl-abc123', student = {}, classroom = {}, index = {} } = {}) {
  const records = {
    studentLoginIndex: { uid: 'student-1', authEmail: 'student@example.test', classId: 'class-1', ...index },
    users: { role: 'student', studentAccountType: 'class', accountStatus: 'active', classId: 'class-1', teacherId: 'teacher-1', ...student },
    classes: { status: 'active', teacherId: 'teacher-1', ...classroom },
  };
  const context = {
    exports: {}, onCall: (_options, handler) => handler,
    normalizeStudentLoginValue: value => String(value || '').trim().toLowerCase().replace(/\s+/g, ''),
    enforceStudentAuthRateLimit: async () => {}, STUDENT_LOGIN_MAX_ATTEMPTS: 12,
    invalidStudentIdentifier: () => { throw Error('not-found'); },
    studentAccountUnavailable: () => { throw Error('unavailable'); }, HttpsError: Error,
    db: { collection: name => ({ doc: id => ({ get: async () => ({ exists: name !== 'studentLoginIndex' || id === alias, data: () => records[name] }) }) }) },
  };
  runInNewContext(source.slice(start, end), context);
  return context.exports.studentLogin;
}
for (const [alias, input] of [['c_tl-abc123', ' TL-ABC123 '], ['u_student.name', 'Student.Name'], ['u_طالب', 'طالب']]) {
  test(`resolves ${alias} without passwords or token signing`, async () => {
    const result = await fixture({ alias })({ data: { studentCode: input } });
    assert.deepEqual(JSON.parse(JSON.stringify(result)), { uid: 'student-1', authEmail: 'student@example.test' });
  });
}
for (const [name, options] of [
  ['suspended account', { student: { accountStatus: 'suspended' } }],
  ['inactive class', { classroom: { status: 'inactive' } }],
  ['wrong teacher', { classroom: { teacherId: 'another-teacher' } }],
  ['inconsistent index', { index: { classId: 'another-class' } }],
  ['non-student', { student: { role: 'teacher' } }],
  ['missing email', { index: { authEmail: '' } }],
]) {
  test(`rejects ${name}`, async () => {
    await assert.rejects(fixture(options)({ data: { studentCode: 'TL-ABC123' } }), /unavailable/);
  });
}
test('rejects unknown aliases', async () => {
  await assert.rejects(fixture()({ data: { studentCode: 'unknown' } }), /not-found/);
});
const clientSource = readFileSync(new URL('../src/firebase/studentLoginApi.js', import.meta.url), 'utf8');
function clientFixture({ error, uid = 'student-1' } = {}) {
  const calls = [];
  const context = {
    auth: {},
    studentLoginCallable: async input => { calls.push(input); return { data: { authEmail: 'student@example.test', uid: 'student-1' } }; },
    signInWithEmailAndPassword: async (_auth, email, password) => { calls.push({ email, password }); if (error) throw error; return { user: { uid } }; },
    signOut: async () => { calls.push('signOut'); },
  };
  const a = clientSource.indexOf('async function signInStudentWithCode(');
  const b = clientSource.indexOf('async function isStudentAliasAvailable', a);
  runInNewContext(clientSource.slice(a, b), context);
  return { login: context.signInStudentWithCode, calls };
}
test('sends the password only to Firebase client Auth', async () => {
  const { login, calls } = clientFixture();
  await login({ studentCode: 'student.name', password: 'secret-password' });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ studentCode: 'student.name' }, { email: 'student@example.test', password: 'secret-password' }]);
});
test('propagates wrong password errors for the contact-teacher message', async () => {
  const error = Object.assign(Error('incorrect'), { code: 'auth/invalid-credential' });
  await assert.rejects(clientFixture({ error }).login({ studentCode: 'test', password: 'wrong' }), actual => actual === error);
});
test('signs out on identity mismatch', async () => {
  const { login, calls } = clientFixture({ uid: 'another-student' });
  await assert.rejects(login({ studentCode: 'test', password: 'secret-password' }), /identity-mismatch/);
  assert.equal(calls.at(-1), 'signOut');
});
