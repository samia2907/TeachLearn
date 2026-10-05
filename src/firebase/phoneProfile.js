import { ensureUserProfile } from './userProfile';

// The Firebase UID is the identity key. Never merge accounts by an editable
// profile phone field or overwrite membership, roles, or purchased access.
export function loadOrCreatePhoneProfile(user, role, name, preferredLanguage = 'en') {
  return ensureUserProfile(user, { role, name, authProvider: 'phone', preferredLanguage });
}
