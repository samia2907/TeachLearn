export function newUserProfile(user, { role, name, authProvider, preferredLanguage = 'en', phoneNumber }, createdAt) {
  if (!['student', 'teacher'].includes(role)) throw new Error('invalid-role');
  const personal = personalProfileFields({ name, preferredLanguage });
  const profile = {
    uid: user.uid, ...personal, email: user.email || null,
    phoneNumber: user.phoneNumber || phoneNumber || null, role, authProvider,
    plan: 'free', subscriptionStatus: 'inactive', billingCycle: null,
    subscriptionId: null, accountStatus: 'active', createdAt,
  };
  if (role === 'student') Object.assign(profile, {
    studentAccountType: 'independent', authEmail: user.email || null,
    classId: null, classCode: null, teacherId: null, xp: 0, level: 1, badges: [],
  });
  return profile;
}

export function personalProfileFields(fields) {
  if (Object.keys(fields).some(key => !['name', 'preferredLanguage'].includes(key))) throw new Error('protected-field');
  if (typeof fields.name !== 'string' || !fields.name.trim() || fields.name.trim().length > 120) throw new Error('name-required');
  if (!['en', 'ar', 'he'].includes(fields.preferredLanguage)) throw new Error('invalid-language');
  return { name: fields.name.trim(), preferredLanguage: fields.preferredLanguage };
}

export function normalizeEmail(value) {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
