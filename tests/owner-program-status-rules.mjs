// Local emulator only: fixtures mirror the legacy program schema, never production.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp, terminate } from 'firebase/firestore';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = require('firebase-admin/app');
const { getFirestore: adminFirestore, Timestamp } = require('firebase-admin/firestore');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8188');
const projectId = 'demo-techminds-access';
const app = initializeAdmin({ projectId }, 'program-status');
const admin = adminFirestore(app, 'default'); const clients = [];
function client(uid) {
  const app = initializeApp({ projectId, apiKey: 'emulator-only' }, uid);
  const db = getFirestore(app, 'default');
  connectFirestoreEmulator(db, '127.0.0.1', 8188, { mockUserToken: { sub: uid, user_id: uid } });
  clients.push({ app, db }); return db;
}
const owner = client('status-owner'); const teacher = client('status-teacher'); const student = client('status-student');
const allow = async (label, action) => { await action(); console.log(`PASS ${label}`); };
const deny = async (label, action) => { await assert.rejects(action, e => e.code === 'permission-denied'); console.log(`PASS ${label}`); };
const publish = { status: 'published', publishedAt: serverTimestamp(), updatedAt: serverTimestamp() };
try {
  for (const role of ['owner', 'teacher', 'student']) await admin.doc(`users/status-${role}`).set({ role, accountStatus: 'active' });
  const legacy = { title: { en: 'Legacy program' }, description: { en: 'Existing content' }, createdBy: 'status-owner', createdAt: Timestamp.now(), updatedAt: Timestamp.now(), status: 'draft', pricing: { student: 100 } };
  await admin.doc('programs/legacy-status').set(legacy);
  await admin.doc('programs/modern-status').set({ ...legacy, accessType: 'paid', price: 100 });
  await allow('owner program query and status read already work', async () => {
    assert.equal((await getDocs(query(collection(owner, 'programs'), where('createdBy', '==', 'status-owner')))).size, 2);
    assert.equal((await getDoc(doc(owner, 'programs/legacy-status'))).data().status, 'draft');
  });
  await allow('owner publishes legacy program without migrating content', () => updateDoc(doc(owner, 'programs/legacy-status'), publish));
  await allow('owner unpublishes legacy program', () => updateDoc(doc(owner, 'programs/legacy-status'), { status: 'draft', publishedAt: null, updatedAt: serverTimestamp() }));
  const saved = (await getDoc(doc(owner, 'programs/legacy-status'))).data();
  assert.equal('accessType' in saved, false); assert.equal('price' in saved, false);
  assert.deepEqual(saved.title, legacy.title); assert.deepEqual(saved.pricing, legacy.pricing);
  assert.equal(saved.createdAt.toMillis(), legacy.createdAt.toMillis());
  await allow('modern program status remains supported', () => updateDoc(doc(owner, 'programs/modern-status'), publish));
  for (const db of [teacher, student]) await deny('non-owner cannot change program status', () => updateDoc(doc(db, 'programs/legacy-status'), publish));
  await deny('legacy exception cannot change content', () => updateDoc(doc(owner, 'programs/legacy-status'), { ...publish, title: { en: 'Changed' } }));
  await deny('legacy exception cannot change payment fields', () => updateDoc(doc(owner, 'programs/legacy-status'), { ...publish, price: -1 }));
  await deny('legacy exception cannot change creator', () => updateDoc(doc(owner, 'programs/legacy-status'), { ...publish, createdBy: 'status-teacher' }));
  await deny('invalid status denied', () => updateDoc(doc(owner, 'programs/legacy-status'), { ...publish, status: 'invalid' }));
  await deny('forged publish time denied', () => updateDoc(doc(owner, 'programs/legacy-status'), { ...publish, publishedAt: null }));
  await admin.doc('users/status-owner').update({ accountStatus: 'blocked' });
  await deny('inactive owner denied', () => updateDoc(doc(owner, 'programs/legacy-status'), publish));
} finally {
  await Promise.all(clients.map(async ({ app, db }) => { await terminate(db); await deleteApp(app); }));
  await admin.terminate(); await deleteAdmin(app);
}
