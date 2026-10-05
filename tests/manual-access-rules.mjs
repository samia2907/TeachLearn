// Local emulator only. Never connects to a real project or uploads rule source.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, updateDoc, getDoc, getDocs,
  collection, query, where, serverTimestamp, terminate } from 'firebase/firestore';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = require('firebase-admin/app');
const { getFirestore: adminFirestore, Timestamp } = require('firebase-admin/firestore');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8188', 'Run only via the local emulator config');
const projectId = 'demo-techminds-access';
const adminApp = initializeAdmin({ projectId }, 'rules-seed');
const admin = adminFirestore(adminApp, 'default');
const clients = [];
function client(uid) {
  const app = initializeApp({ projectId, apiKey: 'emulator-only' }, uid || 'anonymous');
  const db = getFirestore(app, 'default');
  connectFirestoreEmulator(db, '127.0.0.1', 8188, uid ? { mockUserToken: { sub: uid, user_id: uid } } : {});
  clients.push({ app, db }); return db;
}
const owner = client('owner'); const student = client('student'); const other = client('other'); const teacher = client('teacher'); const anon = client();
const allow = async (label, action) => { await action(); console.log(`PASS ${label}`); };
const deny = async (label, action) => { await assert.rejects(action, error => error.code === 'permission-denied', label); console.log(`PASS ${label}`); };
const grant = { userId: 'student', programId: 'p1', accessType: 'manual', active: true, status: 'active', expiresAt: null };
try {
  for (const role of ['owner', 'student', 'teacher']) await admin.doc(`users/${role}`).set({ role, accountStatus: 'active', email: `${role}@example.test` });
  await admin.doc('users/other').set({ role: 'student', accountStatus: 'active', email: 'other@example.test' });
  const time = Timestamp.now();
  await admin.doc('programs/p1').set({ title: { en: 'Program' }, description: { en: 'Description' }, status: 'published', accessType: 'paid', price: 50, createdBy: 'owner', createdAt: time, updatedAt: time });
  await admin.doc('lessons/l1').set({ programId: 'p1', activityType: 'mission', lessonType: 'commercial', status: 'published', sections: [{ id: 'one' }] });
  await admin.doc('programAccess/student_p1').set(grant);
  await admin.doc('programAccess/student_p1/private/metadata').set({ note: 'Private owner note' });
  await allow('student reads own grant', () => getDoc(doc(student, 'programAccess/student_p1')));
  await allow('student subscribable UID query', () => getDocs(query(collection(student, 'programAccess'), where('userId', '==', 'student'))));
  await deny('other user cannot read grant', () => getDoc(doc(other, 'programAccess/student_p1')));
  await deny('user cannot list all grants', () => getDocs(collection(student, 'programAccess')));
  await deny('user cannot read own internal note', () => getDoc(doc(student, 'programAccess/student_p1/private/metadata')));
  await allow('owner reads internal note', () => getDoc(doc(owner, 'programAccess/student_p1/private/metadata')));
  await deny('student cannot grant access', () => setDoc(doc(student, 'programAccess/student_p2'), { ...grant, programId: 'p2' }));
  await deny('student cannot reactivate or extend own grant', () => updateDoc(doc(student, 'programAccess/student_p1'), { active: true, expiresAt: null }));
  await deny('teacher cannot grant another user access', () => setDoc(doc(teacher, 'programAccess/other_p1'), { ...grant, userId: 'other' }));
  await deny('owner grants must use the validated callable', () => updateDoc(doc(owner, 'programAccess/student_p1'), { active: false }));
  await deny('anonymous grant lookup denied', () => getDoc(doc(anon, 'programAccess/student_p1')));
  const request = { userId: 'student', userEmail: 'student@example.test', programId: 'p1', status: 'pending', createdAt: serverTimestamp() };
  await allow('own missing request can be observed', () => getDoc(doc(student, 'accessRequests/student_p1')));
  await deny('request cannot be created for another UID', () => setDoc(doc(other, 'accessRequests/student_p1'), request));
  await deny('request cannot self-approve', () => setDoc(doc(student, 'accessRequests/student_p1'), { ...request, status: 'approved' }));
  await deny('request cannot spoof email', () => setDoc(doc(student, 'accessRequests/student_p1'), { ...request, userEmail: 'spoof@example.test' }));
  await deny('noncanonical request ID denied', () => setDoc(doc(student, 'accessRequests/random'), request));
  await allow('own pending request create allowed', () => setDoc(doc(student, 'accessRequests/student_p1'), request));
  await admin.doc('programs/legacy').set({ status: 'published', title: { en: 'Legacy' } });
  for (const [db, uid] of [[student, 'student'], [teacher, 'teacher']]) {
    const legacyRequest = { userId: uid, userEmail: `${uid}@example.test`, programId: 'legacy', status: 'pending', createdAt: serverTimestamp() };
    await allow(`${uid} can request legacy program access`, () => setDoc(doc(db, `accessRequests/${uid}_legacy`), legacyRequest));
    await deny(`${uid} cannot duplicate pending legacy request`, () => setDoc(doc(db, `accessRequests/${uid}_legacy`), legacyRequest));
  }
  for (const accessType of ['free', 'class']) {
    await admin.doc(`programs/${accessType}`).set({ status: 'published', accessType });
    await deny(`${accessType} program not eligible for manual requests`, () => setDoc(doc(student, `accessRequests/student_${accessType}`), { ...request, programId: accessType }));
  }
  await deny('duplicate pending request denied', () => setDoc(doc(student, 'accessRequests/student_p1'), request));
  await deny('client cannot change request status', () => updateDoc(doc(student, 'accessRequests/student_p1'), { status: 'approved' }));
  await allow('own requests query allowed', () => getDocs(query(collection(student, 'accessRequests'), where('userId', '==', 'student'))));
  await deny('other user request read denied', () => getDoc(doc(other, 'accessRequests/student_p1')));
  await allow('owner requests query allowed', () => getDocs(collection(owner, 'accessRequests')));
  const progress = { studentId: 'student', lessonId: 'l1', teacherId: null, classId: null,
    currentSlide: 0, maxUnlockedSlide: 0, selectedAnswers: {}, answerResults: {}, taskAnswers: {}, status: 'in_progress', createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  await allow('manual access permits mission progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), { ...progress, createdAt: serverTimestamp() }));
  await admin.doc('lessonProgress/student_l1').delete();
  await admin.doc('programAccess/student_p1').update({ accessScope: 'selected', lessonIds: ['l1'] });
  await allow('selected lesson permits progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await deny('student cannot change scope', () => updateDoc(doc(student, 'programAccess/student_p1'), { accessScope: 'full' }));
  await deny('student cannot add lesson IDs', () => updateDoc(doc(student, 'programAccess/student_p1'), { lessonIds: ['l1', 'locked'] }));
  await admin.doc('programAccess/student_p1').update({ lessonIds: ['locked'] });
  await deny('removed lesson cannot update existing progress', () => updateDoc(doc(student, 'lessonProgress/student_l1'), { updatedAt: serverTimestamp() }));
  await admin.doc('lessonProgress/student_l1').delete();
  await deny('unselected lesson cannot create progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await admin.doc('programAccess/student_p1').update({ lessonIds: ['l1'] });
  await admin.doc('lessons/parent').set({ programId: 'p1', lessonType: 'commercial', status: 'published', sections: [] });
  await admin.doc('lessons/l1').update({ parentLessonId: 'parent' });
  await admin.doc('programAccess/student_p1').update({ lessonIds: ['parent'] });
  await allow('parent grant permits mission progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await admin.doc('lessons/parent').update({ status: 'draft' });
  await deny('draft parent cannot authorize mission progress', () => updateDoc(doc(student, 'lessonProgress/student_l1'), { updatedAt: serverTimestamp() }));
  await admin.doc('lessons/parent').update({ status: 'published', programId: 'foreign' });
  await deny('cross-program parent cannot authorize mission progress', () => updateDoc(doc(student, 'lessonProgress/student_l1'), { updatedAt: serverTimestamp() }));
  await deny('student cannot assign parent', () => updateDoc(doc(student, 'lessons/l1'), { parentLessonId: 'l1' }));
  await deny('owner mapping must use validated callable', () => updateDoc(doc(owner, 'lessons/l1'), { parentLessonId: 'l1', updatedAt: serverTimestamp() }));
  await admin.doc('programAccess/student_p1').update({ lessonIds: ['l1'] });
  await allow('existing mission-specific grant still permits progress', () => updateDoc(doc(student, 'lessonProgress/student_l1'), { updatedAt: serverTimestamp() }));
  await admin.doc('lessonProgress/student_l1').delete();
  await admin.doc('programAccess/student_p1').update({ expiresAt: Timestamp.fromMillis(Date.now() - 60000) });
  await deny('expired access cannot save progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await admin.doc('programAccess/student_p1').update({ expiresAt: Timestamp.fromMillis(Date.now() + 60000) });
  await allow('future expiry permits progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await admin.doc('lessonProgress/student_l1').delete();
  await admin.doc('programAccess/student_p1').update({ active: false });
  await deny('revoked access cannot save progress', () => setDoc(doc(student, 'lessonProgress/student_l1'), progress));
  await deny('preview does not expose raw paid lesson documents', () => getDoc(doc(student, 'lessons/l1')));
  await allow('owner edits preview count', () => updateDoc(doc(owner, 'programs/p1'), { previewLessonCount: 2, updatedAt: serverTimestamp() }));
  for (const count of [-1, 0.5, 10001, '2']) await deny(`invalid preview count ${count}`, () => updateDoc(doc(owner, 'programs/p1'), { previewLessonCount: count, updatedAt: serverTimestamp() }));
  await deny('student cannot increase preview count', () => updateDoc(doc(student, 'programs/p1'), { previewLessonCount: 100, updatedAt: serverTimestamp() }));
  console.log('PASS local Firestore rules: all access boundaries validated');
} finally {
  await Promise.all(clients.map(async ({ app, db }) => { await terminate(db); await deleteApp(app); }));
  await admin.terminate(); await deleteAdmin(adminApp);
}
