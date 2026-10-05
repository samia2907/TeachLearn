// Emulator only: contact fields must never confer identity or access rights.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, serverTimestamp, terminate } from 'firebase/firestore';
import { newUserProfile } from '../src/firebase/userProfilePolicy.js';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = require('firebase-admin/app');
const { getFirestore: adminFirestore } = require('firebase-admin/firestore');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8188');
const projectId = 'demo-techminds-access';
const adminApp = initializeAdmin({ projectId }, 'contact-phone');
const admin = adminFirestore(adminApp, 'default'); const clients = [];
function client(uid) {
  const app = initializeApp({ projectId, apiKey: 'emulator-only' }, uid);
  const db = getFirestore(app, 'default');
  connectFirestoreEmulator(db, '127.0.0.1', 8188, { mockUserToken: { sub: uid, user_id: uid, email: `${uid}@example.com` } });
  clients.push({ app, db }); return db;
}
const deny = async (label, work) => { await assert.rejects(work, error => error.code === 'permission-denied'); console.log(`PASS ${label}`); };
try {
  await admin.doc('users/victim-contact').set({ uid: 'victim-contact', role: 'student', name: 'Victim', accountStatus: 'active', phoneNumber: 'original' });
  for (const role of ['student', 'teacher', 'owner']) {
    const uid = `contact-${role}`; const db = client(uid); const ref = doc(db, 'users', uid);
    if (role === 'owner') await admin.doc(`users/${uid}`).set({ uid, role, name: 'Owner', accountStatus: 'active', phoneNumber: 'existing' });
    else await setDoc(ref, newUserProfile({ uid, email: `${uid}@example.com` }, { role, name: 'Contact', authProvider: 'password', phoneNumber: '0501234567' }, serverTimestamp()));
    await updateDoc(ref, { phoneNumber: '+972501234567', updatedAt: serverTimestamp() });
    assert.equal((await getDoc(ref)).data().phoneNumber, '+972501234567');
    await updateDoc(ref, { phoneNumber: null, updatedAt: serverTimestamp() });
    assert.equal((await getDoc(ref)).data().phoneNumber, null);
    console.log(`PASS ${role} contact creation/edit/removal without phone claim`);
    if (role !== 'owner') {
      await deny(`${role} cannot edit another user's contact`, () => updateDoc(doc(db, 'users/victim-contact'), { phoneNumber: '0501234567', updatedAt: serverTimestamp() }));
      for (const [field, value] of Object.entries({ role: 'owner', plan: 'premium', classId: 'forged', authProvider: 'phone', uid: 'forged' })) {
        await deny(`${role} cannot change ${field} with a contact edit`, () => updateDoc(ref, { phoneNumber: '0501234567', [field]: value, updatedAt: serverTimestamp() }));
      }
      for (const value of [123, {}, '1'.repeat(41)]) await deny(`${role} invalid contact shape denied`, () => updateDoc(ref, { phoneNumber: value, updatedAt: serverTimestamp() }));
    }
  }
} finally {
  await Promise.all(clients.map(async ({ app, db }) => { await terminate(db); await deleteApp(app); }));
  await admin.terminate(); await deleteAdmin(adminApp);
}
