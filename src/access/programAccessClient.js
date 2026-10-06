import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase/firebase';

export const requestProgramAccess = httpsCallable(functions, 'requestProgramAccess');
export const manageProgramAccess = httpsCallable(functions, 'manageProgramAccess');
export const reviewAccessRequest = httpsCallable(functions, 'reviewAccessRequest');
export const assignMissionParent = httpsCallable(functions, 'assignMissionParent');
const getProgram = httpsCallable(functions, 'getPurchasedProgram');

// Real-time listeners are intentional: owner grants/revocations must update open pages.
// The server alone decides full/preview/locked access; listeners only invalidate results.
export function subscribeProgramContent(programId, onData, onError, { lessonId } = {}) {
  let stopped = false; let version = 0; let expiryTimer; let debounce;
  let running = false; let queued = false;
  const subscriptions = [];
  const refresh = async () => {
    if (stopped) return;
    if (running) { queued = true; return; }
    running = true;
    const current = ++version;
    clearTimeout(expiryTimer);
    try {
      await auth.authStateReady();
      if (stopped) return;
      if (!auth.currentUser) throw new Error('unauthenticated');
      const uid = auth.currentUser.uid;
      const { data } = await getProgram({ programId, ...(lessonId ? { lessonId } : {}) });
      if (auth.currentUser?.uid !== uid) throw new Error('session-changed');
      if (stopped || version !== current) return;
      onData(data);
      const expiry = Date.parse(data.access?.expiresAt);
      const serverTime = Date.parse(data.serverTime);
      if (Number.isFinite(expiry)) expiryTimer = setTimeout(refresh, Math.min(Math.max(expiry - (Number.isFinite(serverTime) ? serverTime : Date.now()) + 100, 100), 2147483647));
    } catch (error) { if (!stopped && current === version) onError(error); }
    finally {
      running = false;
      if (queued && !stopped) { queued = false; void refresh(); }
    }
  };
  const changed = () => { version++; clearTimeout(expiryTimer); clearTimeout(debounce); debounce = setTimeout(refresh, 40); };
  const failed = error => { if (!stopped) { version++; clearTimeout(expiryTimer); onError(error); } };
  auth.authStateReady().then(() => {
    if (stopped) return;
    const uid = auth.currentUser?.uid;
    if (!uid) { onError(new Error('unauthenticated')); return; }
    // The first snapshots describe initial state, already checked by getProgram.
    // Start that check immediately; do not restart it for each listener's first event.
    const watch = ref => {
      let initial = true;
      subscriptions.push(onSnapshot(ref, () => {
        if (initial) { initial = false; return; }
        changed();
      }, failed));
    };
    watch(query(collection(db, 'programAccess'), where('userId', '==', uid)));
    watch(doc(db, 'users', uid));
    watch(doc(db, 'programs', programId));
    refresh();
  }).catch(failed);
  window.addEventListener('focus', changed);
  return () => { stopped = true; version++; clearTimeout(expiryTimer); clearTimeout(debounce); subscriptions.forEach(stop => stop()); window.removeEventListener('focus', changed); };
}
