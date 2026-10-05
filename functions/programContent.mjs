// Shared read-only compatibility layer. A quiz/task section does not make its
// containing lesson a standalone quiz/activity. Never infer parentage from order.
export function programContentType(record = {}) {
  if (['lesson', 'mission', 'quiz', 'activity'].includes(record.contentType)) return record.contentType;
  if (['mission', 'quiz', 'activity'].includes(record.activityType)) return record.activityType;
  // Existing teaching templates (ai, coding, etc.) are lessons with activities.
  return 'lesson';
}

export function countProgramContent(records) {
  const counts = { lesson: 0, mission: 0, quiz: 0, activity: 0 };
  for (const record of records) counts[programContentType(record)]++;
  return counts;
}

export function selectableProgramLessons(records, programId, { includeDrafts = false } = {}) {
  return records.filter(record => record.programId === programId && record.lessonType === 'commercial'
    && (record.status === 'published' || (includeDrafts && record.status === 'draft')) && programContentType(record) === 'lesson');
}

export function validMissionParent(mission, parent) {
  return programContentType(mission) === 'mission' && parent && parent.id === mission.parentLessonId
    && parent.id !== mission.id && parent.programId === mission.programId
    && parent.lessonType === 'commercial' && programContentType(parent) === 'lesson' && !parent.parentLessonId;
}

// Presentation only: preserve stored order within each type and never number missions.
export function contentPresentation(records) {
  const groups = ['lesson', 'mission', 'quiz', 'activity'].map(type => ({ type,
    items: records.filter(record => programContentType(record) === type) }));
  const lessonNumbers = new Map(groups[0].items.map((record, index) => [record.id, index + 1]));
  return { groups: groups.filter(group => group.items.length), lessonNumbers };
}
