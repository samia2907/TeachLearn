import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase/firebase';

const read = httpsCallable(functions, 'getContentProgress');
const write = httpsCallable(functions, 'saveContentProgress');
const pending = new Map();
const reads = new Map();

export async function loadContentProgress(programId, contentId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('unauthenticated');
  await pending.get(`${uid}:${programId}`)?.catch(() => {});
  const key = JSON.stringify([uid, programId, contentId || null]);
  if (!reads.has(key)) {
    const task = read({ programId, ...(contentId ? { contentId } : {}) }).then(result => {
      if (auth.currentUser?.uid !== uid) throw new Error('session-changed');
      return result.data.progress || [];
    });
    reads.set(key, task);
    task.finally(() => { if (reads.get(key) === task) reads.delete(key); }).catch(() => {});
  }
  return reads.get(key);
}

export function saveContentProgress(uid, data) {
  const key = `${uid}:${data.programId}`;
  const task = (pending.get(key) || Promise.resolve()).catch(() => {}).then(() => {
    if (auth.currentUser?.uid !== uid) throw new Error('session-changed');
    return write(data);
  });
  pending.set(key, task);
  task.finally(() => { if (pending.get(key) === task) pending.delete(key); }).catch(() => {});
  return task;
}
