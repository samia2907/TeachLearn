import { doc, getDoc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { newUserProfile, personalProfileFields } from './userProfilePolicy';
import { normalizeContactPhone } from './contactPhone';

export async function saveContactPhone(user, value) {
  if (auth.currentUser?.uid !== user.uid) throw new Error('auth/user-token-expired');
  const phoneNumber = normalizeContactPhone(value);
  await updateDoc(doc(db, 'users', user.uid), { phoneNumber, updatedAt: serverTimestamp() });
  return phoneNumber;
}

export async function loadUserProfile(user) {
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  return snapshot.exists() ? snapshot.data() : null;
}

// UID is the only identity key. Concurrent registrations cannot overwrite a
// profile. Existing roles, XP, memberships and purchases are never replaced.
export function ensureUserProfile(user, options) {
  const reference = doc(db, 'users', user.uid);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    if (snapshot.exists()) return snapshot.data();
    const profile = newUserProfile(user, { ...options, phoneNumber: normalizeContactPhone(options.phoneNumber) }, serverTimestamp());
    transaction.set(reference, profile);
    return profile;
  });
}

export async function savePersonalProfile(user, fields) {
  if (auth.currentUser?.uid !== user.uid) throw new Error('auth/user-token-expired');
  const personal = personalProfileFields(fields);
  await updateDoc(doc(db, 'users', user.uid), { ...personal, updatedAt: serverTimestamp() });
  try {
    await updateProfile(user, { displayName: personal.name });
  } catch {
    // Firestore is saved; retry is safe and never replaces the profile.
    throw new Error('auth-name-sync-failed');
  }
  return personal;
}

export async function syncVerifiedPhone(user) {
  if (auth.currentUser?.uid !== user.uid || !user.phoneNumber) throw new Error('auth/user-token-expired');
  // Refresh the claim before writing the phone mirror checked by Firestore rules.
  await user.getIdToken(true);
  await updateDoc(doc(db, 'users', user.uid), { phoneNumber: user.phoneNumber, updatedAt: serverTimestamp() });
}
