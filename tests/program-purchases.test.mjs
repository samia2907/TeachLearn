import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createHmac, timingSafeEqual } from 'node:crypto';

const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const studentPrice = `pri_${'a'.repeat(26)}`;
const teacherPrice = `pri_${'b'.repeat(26)}`;

function fixture(role = 'student', overrides = {}) {
  const records = new Map([
    ['users/u1', { role, accountStatus: 'active', plan: 'free', pendingPurchase: { programId: 'p1' }, ...overrides.user }],
    ['programs/p1', { title: { en: 'Coding' }, status: 'published', paddlePriceIds: { student: studentPrice, teacher: teacherPrice }, ...overrides.program }],
  ]);
  const snapshot = path => ({ id: path.split('/').at(-1), exists: records.has(path), data: () => records.get(path) });
  const ref = path => ({ path, get: async () => snapshot(path) });
  const db = {
    collection: name => ({
      doc: id => ref(`${name}/${id}`),
      where: (field, _op, value) => ({ get: async () => ({ docs: [...records.keys()].filter(path => path.startsWith(`${name}/`) && records.get(path)[field] === value).map(snapshot) }) }),
    }),
    runTransaction: async callback => {
      const writes = [];
      await callback({ get: async reference => snapshot(reference.path), set: (reference, data, options) => writes.push([reference.path, data, options]) });
      for (const [path, data, options] of writes) records.set(path, options?.merge ? { ...records.get(path), ...data } : data);
    },
  };
  const context = {
    db, Buffer, createHmac, timingSafeEqual, IS_SANDBOX: false,
    console: { log() {}, error() {} },
    safeId: value => String(value).replace(/\//g, '_').replace(/\s+/g, '_'),
    FieldValue: { serverTimestamp: () => 'timestamp', delete: () => null, increment: value => value },
    exports: {}, onCall: (_options, handler) => handler,
    HttpsError: class extends Error { constructor(code, message) { super(message); this.code = code; } },
    serializeValue: value => value,
  };
  runInNewContext(source.slice(source.indexOf('function verifyPaddleSignature('), source.indexOf('async function processPlanPurchase(')), context);
  const accessStart = source.indexOf('exports.getPurchasedProgram =');
  runInNewContext(source.slice(accessStart, source.indexOf('function verifyPaddleSignature(')), context);
  const transaction = { id: 'txn_example', items: [{ price: { id: role === 'teacher' ? teacherPrice : studentPrice, billing_cycle: null }, quantity: 1 }], details: { totals: { total: '9900' } }, currency_code: 'ILS' };
  const purchase = (data = transaction, license = role, eventId = 'evt_one') => context.processProgramPurchase({ event_id: eventId, event_type: 'transaction.completed' }, data, { techminds_user_id: 'u1', program_id: 'p1', license_type: license }, ref(`paddleWebhookEvents/${eventId}`));
  const access = () => context.exports.getPurchasedProgram({ auth: { uid: 'u1' }, data: { programId: 'p1', accessOnly: true } });
  return { records, context, transaction, purchase, access };
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
    f.records.set('classes/c1', { teacherId: 'u1', status: 'active' });
    f.records.set('programAccess/class_c1_p1', { programId: 'p1', classId: 'c1', teacherId: 'u1', licenseType: 'class', status: 'active' });
    assert.equal((await f.access()).access.licenseType, 'class');
  }
});
