import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { newUserProfile, personalProfileFields, normalizeEmail } from '../src/firebase/userProfilePolicy.js';
import { authMessage } from '../src/firebase/authMessages.js';
import { isStrongPassword } from '../src/utils/passwordPolicy.js';
import { normalizeContactPhone } from '../src/firebase/contactPhone.js';

test('optional contact numbers accept local Israeli and international formats', () => {
  for (const value of ['0501234567', '+972501234567', '050-123 4567', '٠٥٠١٢٣٤٥٦٧']) {
    assert.equal(normalizeContactPhone(value), '+972501234567');
  }
  assert.equal(normalizeContactPhone('02-1234567'), '+97221234567');
  assert.equal(normalizeContactPhone('5551234 ext 2'), '5551234 ext 2');
  assert.equal(normalizeContactPhone(''), null);
  assert.equal(normalizeContactPhone(null), null);
  assert.throws(() => normalizeContactPhone('1'.repeat(41)));
});

test('contact saves only write Firestore, preserve identity and reject stale users', async () => {
  const user = { uid: 'contact-user', phoneNumber: '+972509999999' };
  const writes = [];
  const auth = { currentUser: user };
  const { saveContactPhone } = service('userProfile', ['saveContactPhone'], {
    auth, db: {}, normalizeContactPhone, doc: (_db, collection, uid) => `${collection}/${uid}`,
    serverTimestamp: () => 'timestamp', updateDoc: async (path, data) => writes.push({ path, data }),
    updateProfile: () => assert.fail('contact save must not update Firebase Auth'),
  });
  assert.equal(await saveContactPhone(user, '0501234567'), '+972501234567');
  assert.equal(writes[0].path, 'users/contact-user');
  assert.deepEqual(Object.keys(writes[0].data).sort(), ['phoneNumber', 'updatedAt']);
  assert.equal(user.phoneNumber, '+972509999999');
  assert.equal(await saveContactPhone(user, ''), null);
  auth.currentUser = { uid: 'other' };
  await assert.rejects(saveContactPhone(user, '0501234567'), /user-token-expired/);
  assert.equal(writes.length, 2);
});

test('registration stores contact details only on creation and never replaces an existing profile', async () => {
  const existing = { uid: 'u', phoneNumber: 'existing phone', role: 'owner', purchases: ['p'] };
  let exists = true; let saved;
  const { ensureUserProfile } = service('userProfile', ['ensureUserProfile'], {
    db: {}, normalizeContactPhone, newUserProfile, doc: () => 'users/u', serverTimestamp: () => 'timestamp',
    runTransaction: async (_db, work) => work({ get: async () => ({ exists: () => exists, data: () => existing }), set: (_ref, data) => { saved = data; } }),
  });
  const options = { role: 'student', name: 'Student', authProvider: 'password', phoneNumber: '0501234567' };
  assert.equal(await ensureUserProfile({ uid: 'u' }, options), existing);
  assert.equal(saved, undefined);
  exists = false;
  for (const role of ['student', 'teacher']) for (const authProvider of ['password', 'google']) {
    await ensureUserProfile({ uid: 'u', email: 'u@example.com' }, { ...options, role, authProvider });
    assert.equal(saved.phoneNumber, '+972501234567'); assert.equal(saved.uid, 'u'); assert.equal(saved.authProvider, authProvider);
  }
});

test('active authentication screens do not import or render PhoneAuth', () => {
  for (const file of ['Login', 'Register', 'Profile']) {
    const source = readFileSync(new URL(`../src/pages/${file}.jsx`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /components\/PhoneAuth|<PhoneAuth|<AuthMethods|signInWithPhoneNumber|RecaptchaVerifier|PhoneAuthProvider/);
  }
});

function service(file, names, dependencies) {
  const source = readFileSync(new URL(`../src/firebase/${file}.js`, import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/export /g, '');
  const context = { ...dependencies };
  runInNewContext(source + `\nthis.service = { ${names.join(', ')} };`, context);
  return context.service;
}

test('personal edits use an exact allowlist with bounded name and language', () => {
  assert.deepEqual(personalProfileFields({ name: ' Student ', preferredLanguage: 'he' }), { name: 'Student', preferredLanguage: 'he' });
  for (const field of ['role', 'isAdmin', 'owner', 'permissions', 'purchases', 'programAccess', 'xp', 'classId', 'teacherId', 'phoneNumber', 'email', 'plan']) {
    assert.throws(() => personalProfileFields({ name: 'Student', preferredLanguage: 'en', [field]: 'forged' }), /protected-field/);
  }
  for (const name of ['', '   ', 'a'.repeat(121), null]) assert.throws(() => personalProfileFields({ name, preferredLanguage: 'en' }), /name-required/);
  assert.throws(() => personalProfileFields({ name: 'Name', preferredLanguage: 'xx' }), /invalid-language/);
});

test('all registration providers use the same identity and free profile schema', () => {
  for (const role of ['student', 'teacher']) for (const authProvider of ['password', 'phone', 'google']) {
    const profile = newUserProfile({ uid: 'uid1', email: 'auth@example.com', phoneNumber: '+972501234567' }, { role, name: 'Name', authProvider, preferredLanguage: 'ar' }, 'timestamp');
    assert.equal(profile.uid, 'uid1'); assert.equal(profile.email, 'auth@example.com');
    assert.equal(profile.preferredLanguage, 'ar'); assert.equal(profile.plan, 'free');
    assert.equal(profile.role, role); assert.equal(profile.subscriptionStatus, 'inactive');
    if (role === 'student') { assert.equal(profile.classId, null); assert.equal(profile.xp, 0); }
  }
});

test('password reset validates, normalizes, localizes and avoids account enumeration', async () => {
  const auth = {}; let calls = 0; let error;
  const { requestPasswordReset } = service('passwordReset', ['requestPasswordReset'], {
    auth, normalizeEmail,
    sendPasswordResetEmail: async (instance, email) => { calls++; assert.equal(instance, auth); assert.equal(email, 'test@example.com'); if (error) throw error; },
  });
  for (const value of ['', 'missing-at', 'a@', 'a @example.com', 'a@@example.com']) await assert.rejects(requestPasswordReset(value, 'en'), { code: 'auth/invalid-email' });
  assert.equal(calls, 0);
  await requestPasswordReset(' Test@Example.com ', 'he'); assert.equal(auth.languageCode, 'he');
  error = { code: 'auth/user-not-found' }; await requestPasswordReset('test@example.com', 'ar');
  assert.equal(auth.languageCode, 'ar');
  for (const code of ['auth/network-request-failed', 'auth/too-many-requests', 'auth/user-disabled']) {
    error = { code }; await assert.rejects(requestPasswordReset('test@example.com', 'en'), { code });
    for (const language of ['en', 'ar', 'he']) assert.ok(!authMessage(error, language, 'reset-failed').includes(code));
  }
});

test('profile writes preserve identity and refuse a stale session or injected fields', async () => {
  const user = { uid: 'uid1' }; const auth = { currentUser: user }; const writes = []; const names = [];
  const { savePersonalProfile, syncVerifiedPhone, loadUserProfile } = service('userProfile', ['savePersonalProfile', 'syncVerifiedPhone', 'loadUserProfile'], {
    auth, db: {}, personalProfileFields, doc: (_db, collection, uid) => `${collection}/${uid}`,
    serverTimestamp: () => 'timestamp', updateDoc: async (path, data) => writes.push({ path, data }),
    updateProfile: async (_user, data) => names.push(data.displayName),
    getDoc: async () => ({ exists: () => false }),
  });
  assert.equal(await loadUserProfile(user), null); assert.equal(writes.length, 0);
  await savePersonalProfile(user, { name: ' Name ', preferredLanguage: 'he' });
  assert.equal(writes[0].path, 'users/uid1');
  assert.deepEqual(Object.keys(writes[0].data).sort(), ['name', 'preferredLanguage', 'updatedAt']);
  assert.deepEqual(names, ['Name']);
  await assert.rejects(savePersonalProfile(user, { name: 'Name', preferredLanguage: 'en', xp: 100 }), /protected-field/);
  user.phoneNumber = '+972501234567'; let refresh = false;
  user.getIdToken = async force => { refresh = force; };
  await syncVerifiedPhone(user); assert.equal(refresh, true); assert.equal(writes[1].data.phoneNumber, user.phoneNumber);
  auth.currentUser = { uid: 'other' };
  await assert.rejects(savePersonalProfile(user, { name: 'Name', preferredLanguage: 'en' }), /user-token-expired/);
  assert.equal(writes.length, 2);
});

test('email linking keeps the same user and refuses collisions without sign-in or profile writes', async () => {
  const user = { uid: 'existing', getIdToken: async () => {} }; let collision = false; let links = 0; let verifications = 0;
  const { linkEmailPassword } = service('accountLinking', ['linkEmailPassword'], {
    auth: { currentUser: user }, normalizeEmail, isStrongPassword,
    EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
    linkWithCredential: async (current, credential) => { assert.equal(current, user); assert.equal(credential.email, 'new@example.com'); links++; if (collision) throw { code: 'auth/email-already-in-use' }; return { user }; },
    sendEmailVerification: async current => { assert.equal(current, user); verifications++; },
  });
  await assert.rejects(linkEmailPassword(user, 'new@example.com', 'weak', 'en'), { code: 'auth/weak-password' });
  assert.equal(links, 0);
  assert.equal(await linkEmailPassword(user, 'new@example.com', 'Strong123!', 'en'), user);
  assert.equal(verifications, 1);
  collision = true;
  await assert.rejects(linkEmailPassword(user, 'new@example.com', 'Strong123!', 'en'), { code: 'auth/email-already-in-use' });
  assert.equal(verifications, 1);
});
