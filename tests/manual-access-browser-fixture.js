// Used only by the isolated browser test; no Firebase services are contacted.
import { canAccessProgram, isValidManualAccess, programLessonViews } from '../functions/programAccessPolicy.mjs';
export function createFixture() {
  const stamp = ms => ({ seconds: Math.floor(ms / 1000), toMillis: () => ms, toDate: () => new Date(ms) });
  const records = new Map(Object.entries({
    'users/owner': { role: 'owner', name: 'Owner', email: 'owner@example.test' },
    'users/student': { role: 'student', name: 'Sample Student', email: 'student@example.test', studentCode: 'TM-100', username: 'learner' },
    'users/teacher': { role: 'teacher', name: 'Sample Teacher', email: 'teacher@example.test' },
    'programs/p1': { id: 'p1', status: 'published', accessType: 'paid', previewLessonCount: 1,
      title: { en: 'Computing', ar: 'عالم الحاسوب', he: 'עולם המחשבים' }, description: { en: 'Learn through activities', ar: 'تعلّم من خلال الأنشطة', he: 'למדו דרך פעילויות' }, learningOutcomes: { en: ['Build logical thinking'], ar: ['تنمية التفكير المنطقي'], he: ['פיתוח חשיבה לוגית'] } },
    'platformSettings/public': { whatsapp: '12025550123' },
    'accessRequests/student_p1': { userId: 'student', userEmail: 'student@example.test', programId: 'p1', status: 'pending', createdAt: stamp(Date.now()) },
    'accessRequests/teacher_p1': { userId: 'teacher', userEmail: 'teacher@example.test', programId: 'p1', status: 'pending', createdAt: stamp(Date.now()) },
  }));
  const lessons = [
    { id: 'first', title: { en: 'First lesson', ar: 'الدرس الأول', he: 'השיעור הראשון' }, order: 1, activityType: 'mission', sections: [{ id: 'story', type: 'story', title: { en: 'Welcome', ar: 'مرحبًا', he: 'ברוכים הבאים' }, body: 'Preview mission content' }] },
    { id: 'second', title: { en: 'Second lesson', ar: 'الدرس الثاني', he: 'השיעור השני' }, order: 2, sections: [{ id: 'content', type: 'content', title: 'Paid content', content: 'FULL_ACCESS_ONLY' }] },
  ];
  const listeners = new Set(); const calls = [];
  for (const lesson of lessons) records.set(`lessons/${lesson.id}`, { ...lesson, programId: 'p1', lessonType: 'commercial', status: 'published' });
  const auth = { currentUser: { uid: 'owner' }, authStateReady: async () => {} };
  const snapshot = path => ({ id: path.split('/').at(-1), exists: () => records.has(path), data: () => records.get(path) });
  const read = ref => ref.collection ? { docs: [...records.keys()].filter(path => path.startsWith(ref.path + '/') && path.split('/').length === 2
    && (!ref.filter || records.get(path)[ref.filter.field] === ref.filter.value)).map(snapshot) } : snapshot(ref.path);
  const publish = () => { for (const notify of listeners) notify(); };
  const fixture = { records, auth, calls, stamp, publish, read,
    subscribe(ref, callback) { const notify = () => callback(read(ref)); listeners.add(notify); queueMicrotask(notify); return () => listeners.delete(notify); },
    async call(name, data) {
      calls.push({ name, data });
      if (name === 'assignMissionParent') {
        records.get(`lessons/${data.missionId}`).parentLessonId = data.parentLessonId;
        publish(); return { data: { success: true } };
      }
      if (name === 'getPurchasedProgram' || name === 'checkProgramAccess') {
        const program = records.get('programs/p1'); const user = records.get('users/' + auth.currentUser.uid);
        const grant = records.get(`programAccess/${auth.currentUser.uid}_p1`);
        const manual = isValidManualAccess(grant, auth.currentUser.uid, 'p1') ? grant : false;
        const decision = canAccessProgram({ program, programId: 'p1', user, manualAccess: manual });
        if (name === 'checkProgramAccess') return { data: decision };
        const access = manual ? { ...manual, expiresAt: grant?.expiresAt?.toDate().toISOString() || null } : decision.hasAccess ? { accessType: decision.source } : null;
        const currentLessons = lessons.map(lesson => records.get(`lessons/${lesson.id}`) || lesson).filter(lesson => user.role === 'owner' || lesson.status === 'published');
        return { data: { role: user.role, program, fullAccess: decision.hasAccess, access, serverTime: new Date().toISOString(), lessons: programLessonViews({ program, programId: 'p1', user, access, lessons: currentLessons }) } };
      }
      const userId = data.userId || auth.currentUser.uid; const key = `${userId}_${data.programId}`;
      if (name === 'requestProgramAccess') {
        if (!records.has(`accessRequests/${key}`)) records.set(`accessRequests/${key}`, { userId, userEmail: records.get('users/' + userId).email, programId: data.programId, status: 'pending', createdAt: stamp(Date.now()) });
        publish(); return { data: records.get(`accessRequests/${key}`) };
      }
      if (data.action === 'grant' || data.action === 'approve') records.set(`programAccess/${key}`, { userId, programId: data.programId, accessScope: data.accessScope || 'full', lessonIds: data.lessonIds || [], active: true, accessType: 'manual', grantType: data.grantType, paymentMethod: data.paymentMethod, expiresAt: data.expiresAt ? stamp(Date.parse(data.expiresAt)) : null });
      if (data.action === 'revoke') records.get(`programAccess/${key}`).active = false;
      if (data.action === 'approve' || data.action === 'reject') records.get(`accessRequests/${key}`).status = data.action === 'approve' ? 'approved' : 'rejected';
      publish(); return { data: { success: true } };
    },
  };
  return fixture;
}
