# Mission 01 — هل أنت أذكى من الكمبيوتر؟

The existing class lesson template/publishing flow now includes one `activityType: "mission"` template. Teacher pages were not edited. Ordinary lessons still render through the original viewer; only mission lessons use the lazy-loaded `MissionPlayer`. Mission 02 is not included. This implementation targets class lessons (`/student/lessons/:lessonId`), not the separate purchased-program player.

## Files created

- `src/components/mission/MissionPlayer.jsx`: student screens, feedback, hints, retry, navigation, robot animation, local backup and sync status.
- `src/components/mission/MissionPlayer.css`: scoped responsive layout, RTL, focus indicators and touch controls.
- `src/components/mission/missionEngine.js`: reusable screen validation, grading, robot simulation, resume merging and skill derivation.
- `src/components/mission/missionRepository.js`: Firestore progress and atomic, idempotent completion.
- `src/data/missions/mission01.js`: Arabic/English Mission 01 content, six screens, 100 XP.
- `tests/mission.test.mjs`: engine, resume, skills and completion transaction tests.
- `tests/mission-rules.cjs`: non-deploying Rules API checks using mocked records.
- `tests/mission.browser.mjs`: headless Chrome student flow with a fake repository.
- `docs/MISSION_01.md`: this guide.
- `artifacts/mission-firestore-access-scan.txt`: read-only repository access inventory used when reviewing rules.
- `artifacts/mission/*.png`: generated browser verification screenshots.

## Files modified

- `src/data/lessonTemplates.js`: imports/registers Mission 01 in the existing library.
- `src/pages/StudentLessonDetails.jsx`: routes mission lessons to their own player and progress lifecycle.
- `src/pages/StudentLessons.jsx`: labels the new activity type “Mission” / “مهمة”.
- `firestore.rules`: allows and validates optional mission progress and first-visit reads of a student's own absent records.

Other pre-existing workspace edits are not part of this implementation.

## Firestore data

The existing app explicitly targets the Enterprise database **`default`** in `techminds-63e30`. It does not use the separate database **`(default)`**. No live documents were created or migrated by this implementation.

1. Publishing from the existing library creates `lessons/{autoId}` with `templateId: "mission-01"`, `activityType: "mission"`, the existing metadata, `xpReward: 100`, and the mission's `sections`. Each section has a stable ID and a `type` of `story`, `multipleChoice`, `sequence`, `robot`, or `debugging`. Existing template fields are reused; no new collection or index is required.
2. `lessonProgress/{studentUid}_{lessonId}` keeps its existing metadata/status/slide fields and adds:

   ```js
   mission: {
     version: 1,
     currentScreen: 0,
     screens: {
       "computer-thinking": {
         answer: "clear", attempts: 1, hintsUsed: 0,
         passed: true, checked: true
       }
     },
     skills: {
       logicalThinking: { passed: 1, total: 2 }
     }
   }
   ```

   Screen answers are option IDs, ordered item IDs, or ordered direction commands. Skills are derived from solved screens, so retries do not multiply skill counts. They are per-mission practice records, not extra XP or global user counters. Skill names: `logicalThinking`, `sequencing`, `planning`, `debugging`.
3. Completion atomically creates `lessonCompletions/{studentUid}_{lessonId}`, adds the lesson's XP to `users/{uid}.xp`, increments `completedLessons` once, sets `lastCompletedLessonId` and `updatedAt`, and marks progress completed. The deterministic, immutable completion document is checked inside a transaction; repeated clicks, concurrent tabs and retrying a lost response cannot grant the reward again. A stale autosave also checks completion before writing.
4. Browser backup key: `techminds:mission:v1:{studentUid}:{lessonId}`. Each edit/navigation saves synchronously, followed by a debounced Firestore transaction. Refresh revalidates and merges the backup with remote progress. Browser storage is scoped by student and lesson. Network failures show a retry action; reconnect also retries saves. A fresh page load and XP completion require a connection to verify access and the authoritative completion record. If browser storage is unavailable, wait for “Progress saved” before leaving.

Grading is client-side learning feedback, like the existing lesson viewer. These rules protect ownership and duplicate rewards; they do not make the mission a tamper-proof exam. Answers are part of the published lesson data.

## Rules and deployment

The optional `mission` map is restricted to mission lessons, schema version 1, valid screen bounds, and bounded screens/skills maps. Existing lesson progress remains valid without the field. Additional `get` permissions allow an active student to check for their own missing progress/completion record; they do not permit reading another student's records. Existing immutable completion and atomic XP rules remain in force.

Rules have been validated through Firebase's non-deploying Rules API. **They have not been deployed.** Review the full local rules file (which already had workspace changes) before deploying it:

```powershell
npx firebase-tools deploy --only firestore:rules --project techminds-63e30
```

The repository's `firebase.json` selects database `default`. No Cloud Functions changes or deployment are needed for the mission engine.

## Exact student-account test steps

1. Deploy the reviewed rules above. Build and open a local production preview:

   ```powershell
   npm run build
   npm run preview
   ```

   Use the URL Vite prints. Production preview avoids the existing development-only Functions emulator setting used by student-code login.
2. One-time content preparation: sign in with the existing teacher account for the test student's class. Open Lessons → Ready-Made Lesson Library, preview **هل أنت أذكى من الكمبيوتر؟ / Are You Smarter Than a Computer?**, select that class, and use the existing publish action. No teacher UI changes are needed. Use a test student assigned to that class (`role: student`, active account, matching `classId`).
3. Sign out and sign in as that student using their existing login method. Note the dashboard XP and completed-lesson count. Open **Lessons** and the new **Mission / مهمة** lesson. Select **العربية** to test Arabic.
4. On the story screen press Continue / متابعة. On the choice screen pick the faster-processor answer and check it. Confirm feedback appears and Continue stays disabled. Open the hint; retry and choose **The object and destination are not specified / لم نحدد الشيء ولا المكان المقصود**. Check and continue.
5. Order the instructions as **pick up key → insert key → turn key → open door**. Test dragging on desktop and the up/down buttons on touch or keyboard. Check a wrong order first, then fix it and continue.
6. On the robot screen add **Up, Up**, then immediately refresh. Confirm the same screen and both commands return. Add **Up, Right, Right, Right** (full solution: three Up, three Right) and run. Byte should reach the key one square at a time. Also test a wall collision using Right from the start before solving; Undo/Clear/hints/retry should work.
7. On debugging, run the original program; it fails at the second command. Change the second instruction from **Right to Up**, making **Up, Up, Right, Right**. Run again, then continue.
8. On the final story, press Finish mission / إنهاء المهمة. Expect completion, **100 XP**, and all four skill counters fully practiced. Return to the dashboard; XP should be exactly 100 higher and completed lessons exactly one higher.
9. Refresh, reopen the same mission, and open it in another tab. It must still show completed with the same reward; XP and lesson count must not increase. To exercise a simultaneous first completion, use a fresh test student and leave the final screen open in two tabs before finishing both.
10. With an unfinished mission already open, disconnect the network and edit commands or order. Confirm a save error/retry appears and XP is not claimed as awarded. Reconnect and retry saving/completion. Refresh after “Progress saved”; the state must be restored. If refreshing while offline, reconnect and use the load retry button.
11. Open an existing AI/quiz/coding/custom lesson and confirm its original viewer and behavior. On a phone-sized viewport check Arabic RTL, no horizontal overflow, and ordering through up/down buttons.

For Firestore inspection, look in database `default` for the test student's progress and completion IDs. There should be exactly one completion per student/lesson. Do not delete completion records to replay a reward test; use a fresh test student instead.

## Automated verification

```powershell
node --test tests/mission.test.mjs tests/codingConfig.test.mjs
npm run lint -- src/components/mission src/data/missions tests/mission.test.mjs
node tests/mission-rules.cjs techminds-63e30
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5185
# In another terminal:
node tests/mission.browser.mjs
```

The Rules API test requires a signed-in Firebase CLI. Browser tests use local fake persistence and do not constitute a live student-account test.
