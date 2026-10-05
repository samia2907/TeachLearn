import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { normalizeEmail } from './userProfilePolicy';

export async function requestPasswordReset(email, language) {
  const normalized = normalizeEmail(email);
  if (!normalized) throw Object.assign(new Error('Invalid email'), { code: 'auth/invalid-email' });
  auth.languageCode = ['en', 'ar', 'he'].includes(language) ? language : 'en';
  try {
    await sendPasswordResetEmail(auth, normalized);
  } catch (error) {
    // Same success response whether or not the account exists.
    if (error.code !== 'auth/user-not-found') throw error;
  }
}
