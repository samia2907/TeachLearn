# TechMinds Phase 1

Phase 1 adds many-to-many student, teacher, and class relationships without removing the legacy student profile fields or changing Paddle purchase records.

## Data model

- `classes/{classId}` remains teacher-owned.
- `classMembers/{classId_studentId}` stores one membership per student and class. Fields include `classId`, `studentId`, `teacherId`, `status`, `joinedAt`, and `updatedAt`.
- `classAssignments/{classId_contentType_contentId}` stores teacher assignments. `contentType` is `program` or `lesson`; assignments reference existing catalog documents and never copy or mutate content.
- `programPurchases` and `programAccess` remain server-written. Purchased access is independent of class membership.
- `lessonProgress` and `lessonCompletions` keep their existing student/lesson IDs, so progress is retained when a membership changes.

## New routes

- `/student/join-class`: student class-code join flow.
- `/teacher/classes/:classId`: teacher class members and published content assignment view.

## New Functions

- `joinClass`: validates an active student, resolves a class code, and creates/reactivates a deterministic membership.
- `leaveClass`: marks the current student's membership as left.
- `removeClassMember`: lets a teacher remove a student from their own class.
- `assignClassContent`: lets a teacher assign an existing published program or lesson to their own class.
- `resolveStudentAccess`: returns active memberships, assignments, personal purchases, and active personal access records.

`getPurchasedProgram` also recognizes active program assignments through any active class membership.

## Security

Membership and assignment writes are callable-only. Firestore rules allow only the owner, the relevant student, or the owning teacher to read these records. Purchases and access remain non-writable from browser clients. The owner role keeps its existing catalog access.

## Required indexes

- `classMembers`: `studentId ASC`, `status ASC`
- `classMembers`: `teacherId ASC`, `status ASC`
- `classAssignments`: `classId ASC`, `status ASC`

## Manual setup

1. Deploy the updated Functions, Firestore rules, and indexes when ready. This change does not deploy automatically.
2. No catalog re-import is required for Phase 1. Restart the Vite app after pulling the code; deploy Functions/rules/indexes for the production workflows.
3. Teachers assign content by existing document ID from the class detail page. Only published content is accepted.
4. Existing single-class users continue to work through `users.classId`; new joins use `classMembers` and do not overwrite that field.

## Acceptance checks

1. Buy Program A and confirm its `programAccess` record remains after class changes.
2. Join one class, then join a second class with another code. Confirm both memberships exist.
3. As Teacher A, open only one of Teacher A's classes and assign a published program or lesson.
4. Confirm the student dashboard lists all active classes.
5. Mark a lesson in progress, leave a class, and confirm the progress document remains.
6. Try writing `programAccess`, `programPurchases`, `classMembers`, or `classAssignments` from the browser SDK; rules must reject the writes.
7. Try opening another teacher's class detail route; it must redirect and its member query must be denied.

## Remaining Phase 1 follow-up

- Add a polished assignment picker backed by the owner catalog instead of raw document-ID entry.
- Update the legacy lesson list/player to display every assigned lesson directly; program assignments already flow through `getPurchasedProgram`.
- Add automated Emulator Suite tests for cross-teacher isolation and class-removal/personal-purchase combinations.
- Add individual lesson Paddle checkout/access if the current deployment has not already enabled it.
