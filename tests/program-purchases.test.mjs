import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createHmac, timingSafeEqual } from 'node:crypto';

const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const studentPrice = `pri_${'a'.repeat(26)}`;
const teacherPrice = `pri_${'b'.repeat(26)}`;
import { studentHasProgramAccess } from '../src/firebase/studentProgramAccess.js';
import { canAccessProgram, normalizeProgram, isValidManualAccess, programLessonViews } from '../functions/programAccessPolicy.mjs';

function fixture(role = 'student', overrides = {}) {
  const records = new Map([
    ['users/u1', { role, accountStatus: 'active', plan: 'free', pendingPurchase: { programId: 'p1' }, ...overrides.user }],
    ['programs/p1', { title: { en: 'Coding' }, status: 'published', accessType: 'paid', paddlePriceIds: { student: studentPrice, teacher: teacherPrice }, ...overrides.program }],
  ]);
  const snapshot = path => ({ id: path.split('/').at(-1), exists: records.has(path), data: () => records.get(path) });
  const ref = path => ({ path, get: async () => snapshot(path) });
  const query = (name, filters = []) => ({
    where: (field, _op, value) => query(name, [...filters, [field, value]]),
    get: async () => ({ docs: [...records.keys()].filter(path => path.startsWith(`${name}/`)
      && filters.every(([field, value]) => records.get(path)[field] === value)).map(snapshot) }),
  });
  const db = {
    collection: name => ({
      doc: id => ref(`${name}/${id}`),
      where: (field, op, value) => query(name).where(field, op, value),
    }),
    runTransaction: async callback => {
      const writes = [];
      await callback({ get: async reference => snapshot(reference.path), set: (reference, data, options) => writes.push([reference.path, data, options]) });
      for (const [path, data, options] of writes) records.set(path, options?.merge ? { ...records.get(path), ...data } : data);
    },
  };
  const context = {
    db, Buffer, createHmac, timingSafeEqual, canAccessProgram, normalizeProgram, isValidManualAccess, programLessonViews, IS_SANDBOX: false,
    console: { log() {}, error() {} },
    safeId: value => String(value).replace(/\//g, '_').replace(/\s+/g, '_'),
    FieldValue: { serverTimestamp: () => 'timestamp', delete: () => null, increment: value => value },
    exports: {}, onCall: (_options, handler) => handler,
    HttpsError: class extends Error { constructor(code, message) { super(message); this.code = code; } },
    serializeValue: value => value,
  };
  runInNewContext(source.slice(source.indexOf('function verifyPaddleSignature('), source.indexOf('async function processPlanPurchase(')), context);
  const accessStart = source.indexOf('async function resolveProgramAccess(');
  runInNewContext(source.slice(accessStart, source.indexOf('function verifyPaddleSignature(')), context);
  const transaction = { id: 'txn_example', items: [{ price: { id: role === 'teacher' ? teacherPrice : studentPrice, billing_cycle: null }, quantity: 1 }], details: { totals: { total: '9900' } }, currency_code: 'ILS' };
  const purchase = (data = transaction, license = role, eventId = 'evt_one') => context.processProgramPurchase({ event_id: eventId, event_type: 'transaction.completed' }, data, { techminds_user_id: 'u1', program_id: 'p1', license_type: license }, ref(`paddleWebhookEvents/${eventId}`));
  const access = () => context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1', accessOnly: true } });
  const checkAccess = (request = { auth: { uid: 'u1' }, data: { programId: 'p1' } }) => context.exports.checkProgramAccess(request);
  return { records, context, transaction, purchase, access, checkAccess };
}

for (const role of ['student', 'teacher']) {
  test(`${role} one-time purchase grants access without a subscription`, async () => {
    const f = fixture(role);
    await f.purchase();
    const purchase = f.records.get('programPurchases/txn_example');
    assert.equal(purchase.paymentStatus, 'paid');
    assert.equal(purchase.accessStatus, 'active');
    assert.equal(purchase.amount, 99);
    assert.equal(purchase.currency, 'ILS');
    assert.equal(purchase.priceId, role === 'student' ? studentPrice : teacherPrice);
    assert.equal(f.records.get(`programAccess/${role}_u1_p1`).status, 'active');
    assert.equal((await f.access()).access.licenseType, role);
    assert.equal(f.records.has('subscriptions/u1'), false);
  });
}

test('rejects price mismatch without creating access', async () => {
  const f = fixture('teacher');
  f.transaction.items[0].price.id = studentPrice;
  await assert.rejects(f.purchase(), /price does not match/);
  assert.equal(f.records.has('programAccess/teacher_u1_p1'), false);
});
test('class members can buy unrelated programs personally under the same UID', async () => {
  const f = fixture('student', { user: { classId: 'legacy' } });
  for (const classId of ['first', 'second']) {
    f.records.set(`classMembers/${classId}_u1`, { studentId: 'u1', classId, status: 'active' });
  }
  await f.purchase();
  assert.equal((await f.access()).access.studentId, 'u1');
  assert.equal(f.records.get('programAccess/student_u1_p1').status, 'active');
});

test('access resolves a license from the second active class membership', async () => {
  const f = fixture();
  for (const classId of ['first', 'second']) {
    f.records.set(`classMembers/${classId}_u1`, { studentId: 'u1', classId, status: 'active' });
  }
  f.records.set('programAccess/class_second_p1', { classId: 'second', programId: 'p1', status: 'active' });
  assert.equal((await f.access()).access.classId, 'second');
  f.records.get('classMembers/second_u1').status = 'inactive';
  await assert.rejects(f.access(), /do not have access/);
});

test('legacy class licenses and multi-class assignments remain accessible', async () => {
  const legacy = fixture('student', { user: { classId: 'legacy' } });
  legacy.records.set('classMembers/legacy_u1', { studentId: 'u1', classId: 'legacy', status: 'active' });
  legacy.records.set('programAccess/class_legacy_p1', { classId: 'legacy', programId: 'p1', status: 'active' });
  assert.equal((await legacy.access()).access.classId, 'legacy');
  const f = fixture();
  f.records.set('classMembers/second_u1', { studentId: 'u1', classId: 'second', status: 'active' });
  f.records.set('classAssignments/second_program_p1', { classId: 'second', status: 'active' });
  assert.equal((await f.access()).access.accessType, 'class');
});

test('checkout access check blocks existing access and fails closed on errors', async () => {
  assert.equal(await studentHasProgramAccess(async () => ({ data: { hasAccess: true, source: 'purchase' } }), 'p1'), true);
  const denied = Object.assign(new Error('You do not have access to this program.'), { code: 'functions/permission-denied' });
  assert.equal(await studentHasProgramAccess(async () => ({ data: { hasAccess: false } }), 'p1'), false);
  await assert.rejects(studentHasProgramAccess(async () => { throw denied; }, 'p1'), denied);
  for (const error of [new Error('Network unavailable'), Object.assign(new Error('This account is not active.'), { code: 'functions/permission-denied' })]) {
    await assert.rejects(studentHasProgramAccess(async () => { throw error; }, 'p1'), error);
  }
});

test('access check returns false without full access while paid programs expose only their catalog/previews', async () => {
  const f = fixture();
  assert.equal(JSON.stringify(await f.checkAccess()), JSON.stringify({ hasAccess: false }));
  const preview = await f.context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1' } });
  assert.equal(preview.fullAccess, false);
  assert.equal(preview.lessons.length, 0);
  await assert.rejects(f.access(), { code: 'permission-denied' });
  await f.purchase();
  assert.equal(JSON.stringify(await f.checkAccess()), JSON.stringify({ hasAccess: true, source: 'purchase' }));
});

test('single-lesson responses preserve catalog preview positions and locked content', async () => {
  const f = fixture();
  for (const [id, order] of [['first', 1], ['second', 2]]) {
    f.records.set(`lessons/${id}`, { lessonType: 'commercial', programId: 'p1',
      status: 'published', order, sections: [{ type: 'content', content: `private-${id}` }] });
  }
  const load = lessonId => f.context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1', lessonId } });
  const locked = await load('second');
  assert.equal(locked.lessons.length, 1);
  assert.equal(locked.lessons[0].locked, true);
  assert.equal(locked.lessons[0].sections, undefined);
  assert.equal((await load('first')).lessons[0].previewOnly, true);
  assert.equal((await load('missing')).lessons.length, 0);
  await f.purchase();
  const full = await load('second');
  assert.equal(full.lessons.length, 1);
  assert.equal(full.lessons[0].sections[0].content, 'private-second');
  assert.equal((await load(undefined)).lessons.length, 2);
});

test('explicitly free programs open directly; unconfigured legacy programs and drafts stay protected', async () => {
  for (const accessType of ['free', undefined]) {
    const f = fixture('student', { program: { accessType } });
    if (accessType === undefined) delete f.records.get('programs/p1').accessType;
    if (accessType === undefined) {
      assert.equal((await f.checkAccess()).hasAccess, false);
      await assert.rejects(f.access(), { code: 'permission-denied' });
      const catalog = await f.context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1' } });
      assert.equal(catalog.fullAccess, false);
      assert.ok(catalog.lessons.every(lesson => lesson.locked && !lesson.sections));
      continue;
    }
    assert.equal((await f.checkAccess()).source, 'free');
    const loaded = await f.context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1' } });
    assert.equal(loaded.program.accessType, 'free');
    assert.equal(f.records.has('programAccess/student_u1_p1'), false);
    f.records.get('programs/p1').status = 'draft';
    await assert.rejects(f.access(), { code: 'permission-denied' });
  }
});

test('class-only programs require class access even with a personal purchase', async () => {
  const f = fixture('student', { program: { accessType: 'class' } });
  await f.purchase();
  assert.equal((await f.checkAccess()).hasAccess, false);
  await assert.rejects(f.access(), { code: 'permission-denied' });
  f.records.set('classMembers/c1_u1', { studentId: 'u1', classId: 'c1', status: 'active' });
  f.records.set('classAssignments/c1_program_p1', { classId: 'c1', status: 'active' });
  assert.equal((await f.checkAccess()).source, 'class');
  assert.equal((await f.access()).access.classId, 'c1');
  assert.equal(f.records.get('programAccess/student_u1_p1').status, 'active');
});

test('access check supports multi-class licenses, assignments and legacy class access', async () => {
  for (const kind of ['license', 'assignment', 'legacy']) {
    const f = fixture('student', { user: kind === 'legacy' ? { classId: 'second' } : {} });
    f.records.set('classMembers/first_u1', { studentId: 'u1', classId: 'first', status: 'active' });
    f.records.set('classMembers/second_u1', { studentId: 'u1', classId: 'second', status: 'active' });
    if (kind === 'assignment') {
      f.records.set('classAssignments/second_program_p1', { status: 'active', classId: 'second' });
    } else {
      f.records.set('programAccess/class_second_p1', { status: 'active', programId: 'p1', classId: 'second' });
    }
    assert.equal(JSON.stringify(await f.checkAccess()), JSON.stringify({ hasAccess: true, source: 'class' }));
    if (kind !== 'legacy') {
      f.records.get('classMembers/second_u1').status = 'inactive';
      assert.equal((await f.checkAccess()).hasAccess, false);
    }
  }
});

test('access check preserves authentication, account and program failures', async () => {
  const f = fixture();
  await assert.rejects(f.checkAccess({ data: { programId: 'p1' } }), { code: 'unauthenticated' });
  await assert.rejects(f.checkAccess({ auth: { uid: 'u1' }, data: { programId: 'a/b' } }), { code: 'invalid-argument' });
  f.records.get('users/u1').accountStatus = 'inactive';
  await assert.rejects(f.checkAccess(), { code: 'permission-denied' });
  f.records.get('users/u1').accountStatus = 'active';
  f.records.get('programs/p1').status = 'draft';
  await assert.rejects(f.checkAccess(), { code: 'permission-denied' });
});

test('catalog and checkout do not use the protected content callable for access checks', () => {
  for (const file of ['ProgramsMarketplace.jsx', 'Checkout.jsx']) {
    const page = readFileSync(new URL(`../src/pages/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(page, /getPurchasedProgram/);
    assert.match(page, /checkProgramAccess/);
  }
});

test('rejects role tampering', async () => {
  const f = fixture('student');
  await assert.rejects(f.purchase(f.transaction, 'teacher'), /teacher account/);
});
test('rejects unconfigured prices in sandbox too', async () => {
  const f = fixture('student', { program: { paddlePriceIds: {} } });
  f.context.IS_SANDBOX = true;
  await assert.rejects(f.purchase(), /not configured/);
});
test('rejects recurring prices and extra items', async () => {
  const f = fixture();
  await assert.rejects(f.purchase({ ...f.transaction, subscription_id: 'sub_example' }), /one-time/);
  await assert.rejects(f.purchase({ ...f.transaction, items: [...f.transaction.items, ...f.transaction.items] }), /price does not match/);
});
test('duplicate event and transaction do not grant twice', async () => {
  const f = fixture();
  await f.purchase();
  const firstAccess = f.records.get('programAccess/student_u1_p1');
  await f.purchase();
  await f.purchase(f.transaction, 'student', 'evt_two');
  assert.equal(f.records.get('programAccess/student_u1_p1'), firstAccess);
  assert.equal(f.records.get('paddleWebhookEvents/evt_two').status, 'duplicate');
});
test('owner can preview without buying; unpaid or inactive student is denied', async () => {
  assert.equal((await fixture('owner').access()).access.accessType, 'owner');
  const f = fixture();
  await assert.rejects(f.access(), /do not have access/);
  await f.purchase();
  f.records.get('programAccess/student_u1_p1').status = 'inactive';
  await assert.rejects(f.access(), /do not have access/);
});
test('signature verifies raw body and rejects tampering', () => {
  const f = fixture();
  const body = '{"event_type":"transaction.completed"}';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', 'test-secret').update(`${timestamp}:${body}`).digest('hex');
  assert.equal(f.context.verifyPaddleSignature(body, `ts=${timestamp};h1=${signature}`, 'test-secret'), true);
  assert.equal(f.context.verifyPaddleSignature(body + ' ', `ts=${timestamp};h1=${signature}`, 'test-secret'), false);
});
test('existing class access remains available to its student and teacher', async () => {
  for (const role of ['student', 'teacher']) {
    const f = fixture(role, { user: { classId: 'c1' } });
    f.records.set('classMembers/c1_u1', { studentId: 'u1', classId: 'c1', status: 'active' });
    f.records.set('classes/c1', { teacherId: 'u1', status: 'active' });
    f.records.set('programAccess/class_c1_p1', { programId: 'p1', classId: 'c1', teacherId: 'u1', licenseType: 'class', status: 'active' });
    assert.equal((await f.access()).access.licenseType, 'class');
  }
});
