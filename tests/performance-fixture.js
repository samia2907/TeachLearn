// Isolated SDK boundary for the production-build browser test; never contacts Firebase.
import { createFixture } from './manual-access-browser-fixture';
export const fixture = window.fixture = createFixture();
fixture.auth.currentUser = null;
fixture.records.get('programs/p1').accessType = 'free';
fixture.records.get('users/student').accountStatus = 'active';
fixture.records.get('users/student').xp = 0;
fixture.records.get('lessons/first').activityType = 'lesson';
fixture.records.get('lessons/first').sections = [
  { id: 'one', type: 'content', title: 'First screen', content: 'Read and continue' },
  { id: 'two', type: 'content', title: 'Resume screen', content: 'Progress is saved here' },
  { id: 'code', type: 'task', title: 'Coding screen', codingConfig: { language: 'javascript' } },
];
fixture.progress = [];
const originalCall = fixture.call.bind(fixture);
fixture.call = async (name, data) => {
  if (name === 'getContentProgress') return { data: { progress: fixture.progress.filter(item => !data.contentId || item.contentId === data.contentId) } };
  if (name === 'saveContentProgress') {
    fixture.progress = [{ ...data, updatedAt: new Date().toISOString(), progressPercent: Math.round((data.lastSectionIndex + 1) / 3 * 100) }];
    return { data: { success: true } };
  }
  const result = await originalCall(name, data);
  if (name === 'getPurchasedProgram' && data.lessonId) result.data.lessons = result.data.lessons.filter(item => item.id === data.lessonId);
  return result;
};
const authObservers = new Set();
const login = async () => {
  fixture.auth.currentUser = { uid: 'student', email: 'student@example.test' };
  authObservers.forEach(callback => callback(fixture.auth.currentUser));
  return { user: fixture.auth.currentUser };
};
export const api = {
  onAuthStateChanged: (_auth, callback) => { authObservers.add(callback); queueMicrotask(() => callback(fixture.auth.currentUser)); return () => authObservers.delete(callback); },
  signInWithEmailAndPassword: login,
  signOut: async () => { fixture.auth.currentUser = null; authObservers.forEach(callback => callback(null)); },
  GoogleAuthProvider: class {},
  httpsCallable: (_functions, name) => data => fixture.call(name, data),
  doc: (_db, ...parts) => ({ path: parts.join('/') }),
  collection: (_db, path) => ({ path, collection: true }),
  where: (field, _op, value) => ({ field, value }),
  query: (ref, ...filters) => ({ ...ref, filters }),
  getDoc: async ref => fixture.read(ref),
  getDocs: async ref => read(ref),
  onSnapshot: (ref, callback) => fixture.subscribe(ref, () => callback(read(ref))),
  serverTimestamp: () => null,
};
function read(ref) {
  const snap = fixture.read(ref);
  if (!ref.collection) return snap;
  const docs = snap.docs.filter(doc => (ref.filters || []).every(filter => doc.data()[filter.field] === filter.value));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: callback => docs.forEach(callback) };
}
