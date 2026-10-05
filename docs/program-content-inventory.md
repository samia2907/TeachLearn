# Read-only content inventory, 2026-09-24

Firebase project: techminds-63e30. Existing Enterprise database: default. No content writes, migrations, ordering changes or deployments were performed.

The owner card rendered the cached `program.lessonCount`. Mission attachment scripts increment this field for mission documents stored in the same `lessons` collection. The affected program therefore showed 18 lessons instead of **12 lessons and 6 missions**. All 12 lessons are drafts; 5 missions are published and 1 is a draft. The other program (`fftzabqS6NPBaVth03rX`) has 2 lessons: 1 draft and 1 archived. Owner inventory counts include every status.

The compatibility helper honors recognized `contentType`, then existing `activityType` mission/quiz/activity markers, then defaults to legacy lesson. Embedded multiple-choice/task sections do not make a lesson a standalone quiz/activity. Existing `activityType` is reused; no schema migration is required. Owner counts use realtime snapshots intentionally so edits update the counts immediately.

Access Management lists only published real lessons in the existing order. Existing grants outside the filtered list are preserved on selected/range updates. Embedded mission/activity sections inherit the lesson access as before. No current standalone mission has a parentLessonId or lessonId link: no parentage is guessed from names or order. Assigning standalone missions to lessons would require an explicit, separately reviewed content mapping. Current published-only selection is empty for the affected program because its real lessons remain drafts.

## Optional explicit contentType backfill

All 20 records lack contentType and work through compatibility inference. No backfill is necessary for this change. If explicitly approved later, review these records before setting the inferred field; preserve activityType, sections, order and status.

For `computer-science-modern-technology-journey`, document IDs have that program ID followed by `--` and these suffixes:

- `mission-01` through `mission-06`: mission.
- `how-ai-learns`, `internet-networks-web`, `algorithms-smart-solutions`, `data-binary-patterns`, `think-like-a-programmer`, `create-image-with-ai`, `innovation-capstone`, `build-first-game-project`, `cybersecurity-digital-citizenship`, `inside-a-computer`, `coding-building-blocks`, `what-is-artificial-intelligence`: lesson.

For `fftzabqS6NPBaVth03rX`: `OjQF4JZKjd7KK1r2acCw` (draft) and `K9rWz4j1FinwzTfrAsB2` (archived) infer lesson.

Validation: 42 content/access/purchase/persistence tests passed. Build and frontend/backend lint passed with existing warnings. Isolated browser checks cover real lesson-only selection, ranges, owner counts, previews, grant/revoke/expiry and Arabic/Hebrew RTL. No Firebase authorization policy or content delivery behavior was changed.
