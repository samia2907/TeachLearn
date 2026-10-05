import { EmailAuthProvider, linkWithCredential, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase';
import { normalizeEmail } from './userProfilePolicy';
import { isStrongPassword } from '../utils/passwordPolicy';

export async function linkEmailPassword(user, email, password, language) {
  if (auth.currentUser?.uid !== user.uid) throw Object.assign(new Error(), { code: 'auth/user-token-expired' });
  const normalized = normalizeEmail(email);
  if (!normalized) throw Object.assign(new Error(), { code: 'auth/invalid-email' });
  if (!isStrongPassword(password)) throw Object.assign(new Error(), { code: 'auth/weak-password' });
  // Firebase rejects credentials already attached to another UID. Never sign
  // in as that other user, unlink providers, merge data, or create a profile.
  const result = await linkWithCredential(user, EmailAuthProvider.credential(normalized, password));
  await result.user.getIdToken(true);
  auth.languageCode = language;
  try { await sendEmailVerification(result.user); }
  catch { throw new Error('email-linked-verification-failed'); }
  return result.user;
}

export async function resendEmailVerification(user, language) {
  if (auth.currentUser?.uid !== user.uid) throw Object.assign(new Error(), { code: 'auth/user-token-expired' });
  auth.languageCode = language;
  await sendEmailVerification(user);
}
