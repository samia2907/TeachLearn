import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { normalizePhoneNumber, phoneProfile, phoneDashboard } from '../src/firebase/phoneAuthPolicy.js';
import { newUserProfile } from '../src/firebase/userProfilePolicy.js';
import { normalizeContactPhone } from '../src/firebase/contactPhone.js';

test('phone send failures log the original Firebase code and message before UI fallback', async () => {
  const source = readFileSync(new URL('../src/components/PhoneAuth.jsx', import.meta.url), 'utf8');
  const submit = source.slice(source.indexOf('  async function submit('), source.indexOf('\n  return <form'))
    .replaceAll('import.meta.env.DEV', 'false').replaceAll('import.meta.env.VITE_PHONE_AUTH_TESTING', 'undefined');
  const failure = Object.assign(new Error('Firebase: SMS delivery failed (auth/internal-error).'), {
    code: 'auth/internal-error', customData: { phoneNumber: 'private', token: 'private' },
  });
  const logs = []; const uiErrors = [];
  const context = {
    phone: '+12025550123', normalizePhoneNumber, confirmation: null, retryProfile: false,
    inFlight: { current: false }, mounted: { current: true }, verifier: { current: null },
    container: { current: {} }, recaptchaContainerId: 'test-recaptcha', auth: { settings: {} }, language: 'en', currentUser: null,
    linkExisting: false, errors: {}, clearVerifier() {}, setBusy() {},
    setError: error => uiErrors.push(error),
    RecaptchaVerifier: class { async render() {} }, signInWithPhoneNumber: async () => { throw failure; },
    console: { error: (...args) => logs.push(args) },
  };
  runInNewContext(submit + '\nthis.submit = submit;', context);
  await context.submit({ preventDefault() {} });
  assert.equal(logs.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(logs[0][1])), {
    stage: 'send', code: failure.code, message: failure.message,
  });
  assert.equal(uiErrors.at(-1), 'send-failed');
  assert.equal(context.inFlight.current, false);
});

test('normalizes Israeli, international and Arabic digit input without guessing other local numbers', () => {
  for (const number of ['0501234567', '972501234567', '+972 (50) 123-4567', '00972501234567', '٠٥٠١٢٣٤٥٦٧', '۰۵۰۱۲۳۴۵۶۷']) {
    assert.equal(normalizePhoneNumber(number), '+972501234567');
  }
  assert.equal(normalizePhoneNumber('+1 (202) 555-0123'), '+12025550123');
  for (const number of ['', '+0123456789', '+9720501234567', '5551234', '0501234567 ext 2', '+1234567890123456', '+97250123', '++972501234567']) {
    assert.equal(normalizePhoneNumber(number), null, number);
  }
});

test('new profiles start without class membership or paid entitlements', () => {
  const user = { uid: 'phone-user', phoneNumber: '+972501234567' };
  const student = phoneProfile(user, 'student', ' Student ', 'timestamp');
  assert.equal(student.name, 'Student');
  assert.equal(student.email, null);
  assert.equal(student.authEmail, null);
  assert.equal(student.studentAccountType, 'independent');
  assert.equal(student.classId, null);
  assert.equal(student.teacherId, null);
  assert.equal(student.plan, 'free');
  assert.equal(student.subscriptionStatus, 'inactive');
  assert.equal(student.xp, 0);
  assert.deepEqual(student.badges, []);
  assert.equal(phoneProfile(user, 'teacher', 'Teacher', 'timestamp').role, 'teacher');
  assert.throws(() => phoneProfile(user, 'owner', 'Owner', 'timestamp'), /invalid-role/);
  assert.throws(() => phoneProfile(user, 'student', '', 'timestamp'), /name-required/);
});

test('routing uses persisted role and refuses disabled accounts', () => {
  for (const role of ['student', 'teacher', 'owner']) assert.equal(phoneDashboard({ role, accountStatus: 'active' }), `/${role}`);
  for (const accountStatus of ['blocked', 'inactive', 'suspended']) assert.throws(() => phoneDashboard({ role: 'student', accountStatus }), /account-blocked/);
  assert.throws(() => phoneDashboard({ role: 'unknown' }), /invalid-role/);
});

test('transaction reuses an existing UID profile without writing, including membership and purchases', async () => {
  const source = readFileSync(new URL('../src/firebase/userProfile.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
  const existing = { uid: 'same-uid', role: 'owner', classId: 'class-1', plan: 'premium', purchasedPrograms: ['p1'] };
  let writes = 0;
  let exists = true;
  const context = {
    db: {}, newUserProfile, normalizeContactPhone, serverTimestamp: () => 'timestamp',
    doc: (_db, collection, uid) => { assert.equal(collection, 'users'); assert.equal(uid, 'same-uid'); return uid; },
    runTransaction: async (_db, callback) => callback({
      get: async () => ({ exists: () => exists, data: () => existing }),
      set: (_ref, profile) => { writes++; assert.equal(profile.role, 'student'); },
    }),
  };
  runInNewContext(source + '\nthis.loadProfile = ensureUserProfile;', context);
  const user = { uid: 'same-uid', phoneNumber: '+972501234567' };
  assert.equal(await context.loadProfile(user, { role: 'student', name: '' }), existing);
  assert.equal(writes, 0);
  exists = false;
  await context.loadProfile(user, { role: 'student', name: 'New student', authProvider: 'phone' });
  assert.equal(writes, 1);
  exists = true;
  await context.loadProfile(user, { role: 'student', name: 'Different name' });
  assert.equal(writes, 1);
});
