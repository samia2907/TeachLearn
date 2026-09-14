# Programs and lessons as code

The coded catalog lives in `functions/content/catalog.js`. Each program uses a
stable ID, and every lesson ID is namespaced under its program when imported:

- `programs/{program.id}`
- `lessons/{program.id}--{lesson.id}`

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
