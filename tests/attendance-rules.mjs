// Run only through firebase.access-test.json; never touches production.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp, terminate } from 'firebase/firestore';
const require = createRequire(new URL('../functions/package.json', import.meta.url));
const { initializeApp: initializeAdmin, deleteApp: deleteAdmin } = require('firebase-admin/app');
const { getFirestore: adminFirestore } = require('firebase-admin/firestore');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8188');
const projectId = 'demo-techminds-access';
const adminApp = initializeAdmin({ projectId }, 'attendance-tests');
const admin = adminFirestore(adminApp, 'default');
const clients = [];
function client(uid) {
  const app = initializeApp({ projectId, apiKey: 'emulator-only' }, `attendance-${uid}`);
  const db = getFirestore(app, 'default');
  connectFirestoreEmulator(db, '127.0.0.1', 8188, { mockUserToken: { sub: uid, user_id: uid } });
  clients.push({ app, db }); return db;
}
const teacher = client('attendance-teacher'); const other = client('attendance-other'); const student = client('attendance-student');
const allow = async (label, action) => { await action(); console.log(`PASS ${label}`); };
const deny = async (label, action) => { await assert.rejects(action, e => e.code === 'permission-denied'); console.log(`PASS ${label}`); };
const path = 'attendance/class_with_underscores_2026-09-25';
const data = { attendanceId: path.split('/')[1], teacherId: 'attendance-teacher', classId: 'class_with_underscores', date: '2026-09-25',
  className: 'Test class', classCode: 'TEST', students: { 'attendance-student': { studentId: 'attendance-student', name: 'Test', studentCode: 'TEST', status: 'present' } },
  studentCount: 1, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
try {
  for (const [uid, role] of [['attendance-teacher', 'teacher'], ['attendance-other', 'teacher'], ['attendance-student', 'student']]) await admin.doc(`users/${uid}`).set({ role, accountStatus: 'active' });
  await admin.doc('classes/class_with_underscores').set({ teacherId: 'attendance-teacher' });
  await allow('teacher reads missing daily record before saving', async () => assert.equal((await getDoc(doc(teacher, path))).exists(), false));
  await deny('another teacher cannot read missing daily record', () => getDoc(doc(other, path)));
  await deny('student cannot read missing daily record', () => getDoc(doc(student, path)));
  await deny('missing class lookup denied', () => getDoc(doc(teacher, 'attendance/no_class_2026-09-25')));
  await allow('teacher creates attendance using page merge payload', () => setDoc(doc(teacher, path), data, { merge: true }));
  const createdAt = (await getDoc(doc(teacher, path))).data().createdAt;
  const { createdAt: _created, ...edit } = data;
  edit.students['attendance-student'].status = 'absent';
  await allow('teacher updates attendance without replacing createdAt', () => setDoc(doc(teacher, path), edit, { merge: true }));
  const saved = (await getDoc(doc(teacher, path))).data();
  assert.equal(saved.createdAt.toMillis(), createdAt.toMillis());
  assert.equal(saved.students['attendance-student'].status, 'absent');
  await allow('teacher history query still reads saved records', async () => assert.equal((await getDocs(query(collection(teacher, 'attendance'), where('teacherId', '==', 'attendance-teacher')))).size, 1));
  await deny('another teacher cannot update attendance even with forged teacherId', () => updateDoc(doc(other, path), { teacherId: 'attendance-other', updatedAt: serverTimestamp() }));
  await deny('another teacher cannot create attendance for this class', () => setDoc(doc(other, 'attendance/class_with_underscores_2026-09-26'), { ...data, attendanceId: 'class_with_underscores_2026-09-26', date: '2026-09-26', teacherId: 'attendance-other' }));
  await deny('student cannot update attendance', () => updateDoc(doc(student, path), { students: {}, updatedAt: serverTimestamp() }));
  await deny('student cannot create attendance', () => setDoc(doc(student, 'attendance/class_with_underscores_2026-09-26'), { ...data, attendanceId: 'class_with_underscores_2026-09-26', date: '2026-09-26' }));
  await deny('teacher cannot replace createdAt', () => updateDoc(doc(teacher, path), { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  console.log('PASS all attendance permission regressions');
} finally {
  await Promise.all(clients.map(async ({ db, app }) => { await terminate(db); await deleteApp(app); }));
  await admin.terminate(); await deleteAdmin(adminApp);
}
