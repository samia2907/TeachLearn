import { validMissionParent, programContentType } from './programContent.mjs';

export const programAccessDefaults = Object.freeze({
  currency: 'ILS',
  paymentProvider: null, paymentProductId: null,
});

export function normalizeProgram(program = {}) {
  const result = { previewLessonCount: 1, ...programAccessDefaults, ...program };
  if (result.accessType === 'free') result.price = 0;
  return result;
}

export function hasExplicitProgramAccessType(program = {}) {
  return Object.hasOwn(program, 'accessType')
    && ['free', 'paid', 'class'].includes(program.accessType);
}

// Entitlements passed here must already be verified for this user and program.
// Payment provider configuration never grants or denies access.
export function canAccessProgram({ program, programId, user, purchaseAccess = false, classAccess = false, manualAccess = false, lessonIndex = -1, lessonId }) {
  const model = normalizeProgram(program);
  if (!user || (user.accountStatus || 'active') !== 'active') return { hasAccess: false };
  if (user.role === 'owner') return { hasAccess: true, source: 'owner' };
  if (model.status !== 'published' || !['student', 'teacher'].includes(user.role)) return { hasAccess: false };
  if (model.accessType === 'free') return { hasAccess: true, source: 'free' };
  if (manualAccess === true || (manualAccess && (manualAccess.accessScope == null || manualAccess.accessScope === 'full'
    || (manualAccess.accessScope === 'selected' && typeof lessonId === 'string' && Array.isArray(manualAccess.lessonIds) && manualAccess.lessonIds.includes(lessonId))))) return { hasAccess: true, source: 'manual' };
  if (typeof programId === 'string' && programId
    && Array.isArray(user.ownerGrantedProgramIds) && user.ownerGrantedProgramIds.includes(programId)) {
    return { hasAccess: true, source: 'owner-granted' };
  }
  if (!hasExplicitProgramAccessType(program)) return { hasAccess: false };
  if (user.role === 'teacher') {
    if (purchaseAccess) return { hasAccess: true, source: 'purchase' };
    if (classAccess) return { hasAccess: true, source: 'class' };
  }
  if (!['paid', 'class'].includes(model.accessType)) return { hasAccess: false };
  if (classAccess) return { hasAccess: true, source: 'class' };
  if (model.accessType === 'paid' && purchaseAccess) return { hasAccess: true, source: 'purchase' };
  if (model.accessType === 'paid' && Number.isInteger(lessonIndex) && lessonIndex >= 0
    && lessonIndex < previewLessonCount(program)) return { hasAccess: true, source: 'preview' };
  return { hasAccess: false };
}

export function previewLessonCount(program) {
  const count = program.previewLessonCount ?? 1;
  return Number.isInteger(count) && count >= 0 && count <= 10000 ? count : 0;
}

// A Timestamp is required for expiration; malformed/expired grants fail closed.
export function isValidManualAccess(record, userId, programId, now = Date.now()) {
  if (!record || record.userId !== userId || record.programId !== programId || record.active !== true) return false;
  if (record.expiresAt === null) return true;
  const expires = record.expiresAt?.toMillis?.();
  return Number.isFinite(expires) && expires > now;
}

export function compareProgramLessons(first, second) {
  const order = lesson => Number(lesson.order ?? lesson.lessonOrder ?? lesson.position ?? 999999);
  return order(first) - order(second)
    || (first.createdAt?.seconds || 0) - (second.createdAt?.seconds || 0)
    || first.id.localeCompare(second.id);
}

// lessonIndex comes from the server's ordered published lessons, never request input.
export function canAccessLesson({ lesson, parent, parentIndex = -1, ...options }) {
  if (options.user?.role !== 'owner' && lesson.status && lesson.status !== 'published') return { hasAccess: false };
  const direct = canAccessProgram({ ...options, lessonId: lesson.id,
    lessonIndex: lesson.parentLessonId ? -1 : options.lessonIndex });
  if (direct.hasAccess) return direct; // Existing explicit mission grants remain valid.
  if (validMissionParent(lesson, parent) && parent.status === 'published') {
    return canAccessProgram({ ...options, lessonId: parent.id, lessonIndex: parentIndex });
  }
  return { hasAccess: false };
}

export function programLessonViews({ lessons, program, programId, user, access }) {
  const ordered = lessons.slice().sort(compareProgramLessons);
  return ordered.map((lesson, lessonIndex) => {
    const parentIndex = ordered.findIndex(item => item.id === lesson.parentLessonId);
    const decision = canAccessLesson({ program, programId, user, lessonIndex, lesson, parent: ordered[parentIndex], parentIndex,
      manualAccess: access?.accessType === 'manual' ? access : false,
      purchaseAccess: Boolean(access && !access.classId && !['class', 'manual'].includes(access.accessType)),
      classAccess: Boolean(access && (access.classId || access.accessType === 'class')) });
    const preview = decision.source === 'preview' || (!lesson.parentLessonId && program.accessType === 'paid' && lessonIndex < previewLessonCount(program));
    if (decision.hasAccess) return { ...lesson, locked: false, preview,
      previewOnly: decision.source === 'preview' };
    // Explicit allowlist: sections, answers, attachments and resource URLs stay on the server.
    return { id: lesson.id, contentType: programContentType(lesson), title: lesson.title || '', titleI18n: lesson.titleI18n || null,
      minutes: lesson.minutes || lesson.estimatedMinutes || 0, locked: true, preview: false };
  });
}
