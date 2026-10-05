# Manual-access-first MVP (not deployed)

## Data and security design

The existing `default` Enterprise Native Firestore database is reused. `users/{uid}` supplies roles and account status; callers cannot supply their own authority. Existing `programAccess` purchase/class documents, `programPurchases`, subscriptions, Paddle webhook and checkout code remain intact.

- `programs/{id}`: optional `previewLessonCount` (integer 0–10000, default 1) and `learningOutcomes` (`en`/`ar`/`he` lists). Owner-only program editing remains in OwnerPrograms.
- `programAccess/{uid}_{programId}`: manual grants keyed by Firebase UID, with `userId`, `programId`, `grantedBy`, `grantType`, `paymentMethod`, `grantedAt`, `expiresAt` (Timestamp or null), `active`, `status`, `accessType: manual`, `updatedAt`, optional `revokedBy`. No name-based authorization.
- `programAccess/{id}/private/metadata`: internal note, updatedBy, updatedAt; owner-only read, server-only writes. Notes cannot live on user-readable grant documents.
- `accessRequests/{uid}_{programId}`: userId, trusted userEmail (nullable), programId, pending/approved/rejected status, createdAt; reviewedBy/reviewedAt after review. Deterministic IDs and transactions prevent duplicate pending requests and double approvals. Existing reviewed requests remain visible; contact support for reconsideration.
- `accessRequests/{id}/private/metadata`: owner-only note with audit metadata.
- `platformSettings/public.whatsapp` (fallback supportPhone): existing centralized contact setting, no new hardcoded number.

## Queries and authorization

Owner management uses real-time collection listeners for users, programs, access requests and program access, matching existing OwnerCustomers patterns. Learner pages listen to `programAccess where userId == authenticated UID`, their own profile, the program and their own request. Standard Firestore listeners are intentional because grants/revocations must update open pages immediately. A single-field Enterprise index is included for the userId query. Private note reads are owner-only. All grant/revoke/review writes go through callables that verify the stored owner role; client writes to grants and request review fields remain denied.

`getPurchasedProgram` reuses `resolveProgramAccess` and `canAccessProgram`. It returns only allowlisted title/duration/lock metadata for locked lessons, never sections, answers, URLs or attachments. Preview position is calculated from server-read published commercial lessons in stable order (order, creation time, document ID); client lesson indices are never trusted. Expiry uses server time. The client schedules access refresh at expiry and rechecks on entitlement snapshots and window focus.

Previews and teacher/owner mission practice use session-only progress and award no XP. Full student access retains the existing Firestore progress and server-validated completion behavior. Revoking a manual grant does not remove separate purchases, class licenses, or legacy owner grants.

## Routes

- `/owner/access`: Grant Access, Requests and Active Access tabs; `?userId=...` selects a user.
- `/programs/:programId/access`: localized request and WhatsApp screen.

No Firebase settings, rules, indexes, Functions, Hosting or data were deployed/migrated by this implementation.

## Validation and remaining manual checks

- `npm run build`: passed (bundle-size warning).
- `npm run lint`: passed with warnings; `npm --prefix functions run lint`: passed.
- Access, purchase compatibility, mission persistence and mission validation tests: 38 passed. The additional existing `tests/mission.test.mjs` suite cannot start because its imported `src/data/missions/mission01.js` file is missing; unrelated mission content was not changed.
- Local Firestore emulator: security assertions passed for own requests/access, duplicate prevention, role spoofing, private notes, unauthorized grants/reviews, revoked and expired access.
- Isolated browser checks using actual React screens and mocked Firebase transport: owner search/grant/revoke/approve/reject, locked metadata, preview missions, live unlock/relock/expiration, localized WhatsApp, Arabic/Hebrew RTL and mobile layout passed. These do not verify a deployed Firebase integration.

Before release, use owner and student/teacher accounts against a test Firebase environment to verify grants, permanent and dated access, approval/rejection, revoked access, configurable previews, and existing purchased/class access. Check real WhatsApp contact configuration and all three languages. Preview mission progress is session-only and awards no XP. A separate purchase/class/legacy grant intentionally continues to grant access after a manual grant is revoked.

The prototype Security Rules protect ownership, server-verified roles, private notes and server-only entitlement changes. Review and verify them before broadly sharing the app. A future release needs coordinated Functions, Firestore rules/indexes and frontend deployment; none was performed here.

## Files changed for this MVP

- Backend/security: `functions/programAccessPolicy.mjs`, `functions/manualProgramAccess.js`, `functions/index.js`, `firestore.rules`, `firestore.indexes.json`.
- Shared client: `src/access/accessText.js`, `src/access/programAccessClient.js`.
- Pages/navigation: `src/App.jsx`, `src/pages/OwnerDashboard.jsx`, `src/pages/OwnerPrograms.jsx`, `src/pages/OwnerAccessManagement.jsx`, `src/pages/ProgramAccess.jsx`, `src/pages/ProgramAccess.css`, `src/pages/ProgramLearning.jsx`, `src/pages/ProgramLessonPlayer.jsx`, `src/pages/ProgramsMarketplace.jsx`.
- Mission practice: `src/components/mission/MissionPlayer.jsx`, `src/components/mission/missionRepository.js`.
- Tests: `firebase.access-test.json`, `tests/manual-program-access.test.mjs`, `tests/manual-access-rules.mjs`, `tests/manual-access-browser-fixture.js`, `tests/manual-access.browser.mjs`, `tests/program-access-policy.test.mjs`, `tests/program-access-resolver.test.mjs`, `tests/program-purchases.test.mjs`, `tests/purchased-mission-persistence.test.mjs`.
- Documentation: `docs/manual-access-mvp.md`.

Other preexisting workspace changes are outside this MVP report.
