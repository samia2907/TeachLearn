# Programs and lessons as code

The coded catalog lives in `functions/content/catalog.js`. Each program uses a
stable ID, and every lesson ID is namespaced under its program when imported:

- `programs/{program.id}`
- `lessons/{program.id}--{lesson.id}`

The same catalog exports `classroomLessons` for the four standalone teacher-library
lessons. `TeacherLessons` combines these with direct imports of the six mission
files under `src/data/missions/computer-science-modern-technology/`. Keep all
existing IDs and section IDs stable: published class lessons retain their
`templateId`, while saved progress continues to reference its existing lesson.
The catalog importer still imports only `programs`; standalone library lessons
are published to classes through the existing teacher workflow.

For the Computer Science & Modern Technology program, each catalog lesson's
numeric `order` is its position in the student sequence. The mission attachment
scripts assign their missions positions in that same sequence, so lessons and
missions remain interleaved without changing their stable IDs or saved progress
references.

`functions/content/package.json` makes the catalog an ES module so the browser
can import classroom content without bundling program content. The existing
CommonJS importer remains compatible with the configured Node 24 runtime.

The commented example in the catalog shows the exact bilingual data shape used
by the current owner and student screens. Keep new content as `draft` until it
has been reviewed.

Each coded lesson can also define its visual identity with `coverImage`,
localized `imageAlt`, `themeColor`, `accentColor`, and `surfaceColor`. Project
cover images are served from `public/lesson-covers/`.

## Validate without writing

From the project root:

```powershell
npm run content:check
```

This is always a local dry run and does not connect to or change Firestore.

## Import intentionally

The importer uses Firebase Admin and Application Default Credentials. It writes
only to project `techminds-63e30`, named Enterprise database `default`.

```powershell
npm run content:import -- YOUR_FIREBASE_OWNER_UID
```

The first import refuses to overwrite any deterministic document that already
exists. After reviewing those documents, an intentional update can be run with:

```powershell
npm run content:import -- YOUR_FIREBASE_OWNER_UID --allow-update
```

The importer does not delete lessons that are removed from the code catalog.
It keeps the program lesson counter consistent with both coded and existing
lessons. Archive old content explicitly instead of silently deleting
student-facing material. Existing sales, student, completion, and Paddle price
metadata is preserved during intentional updates.

Do not commit service-account JSON keys to this repository. Use a local
Application Default Credentials login or a protected deployment environment.

## Grade 1 Mathematics (math-grade-1-il)

`functions/content/TechMinds_Grade1_Math.js` is a separate, standalone program
module (not part of `functions/content/catalog.js`'s `programs` array). It
uses the mission-based access model (`accessType`, `previewLessonCount`,
`stages` as metadata) instead of the older `pricing` model `importCatalog.js`
expects, and every lesson's `sections` follow the MissionPlayer schema (story,
explain, multipleChoice, sequence, robot, debugging - see
`src/components/mission/missionEngine.js`), not the `content`/`multipleChoice`
schema used by `importCatalog.js`'s own `lessonDocument()` mapping.

Import only this program with:

```powershell
node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID
node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID --commit
node functions/scripts/importMathGrade1.js YOUR_FIREBASE_OWNER_UID --commit --allow-update
```

The first form is a dry run: it validates the 30 missions (stable unique IDs,
order 1-30, closed/auto-gradable sections only) without touching Firestore.
`--commit` writes `programs/math-grade-1-il` and its 30
`lessons/math-grade-1-il--math-g1-mNN` documents; `--allow-update` is required
if either already exists. This script never touches any other program.
