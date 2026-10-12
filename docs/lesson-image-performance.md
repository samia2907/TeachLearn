# Lesson image audit and optimization

## Scope and findings

Audited `public`, `src/assets`, source image elements/CSS references, catalog and
mission data, import scripts, `vite.config.js`, and `firebase.json`. No production
Firestore documents, Storage metadata, or deployed HTTP headers were fetched.
Dynamic remote image sizes therefore remain unverified.

Eight local PNG lesson covers each measure 1672 x 941. Their total is 15,554,090
bytes (15.55 decimal MB). SHA-256 hashes differ: no byte-identical duplicates.
The same covers are reused by list, selected-lesson, player, and owner views.
List thumbnails can be only 52 CSS pixels wide. Other raster assets are PWA/brand
icons (464,454 bytes total) and an unreferenced `src/assets/hero.png` (13,057 bytes).
These were left unchanged.

ProgramLessonPlayer renders `section.visualImage` for the selected section;
its sections map renders navigation buttons. MissionPlayer renders `screen.image`
only for the current explain screen. Neither preloads all section images.
Existing list lazy loading was retained. The current mission image stays eager
and now decodes asynchronously; player images already used async decoding.

## Implementation

Original PNGs, catalog fields, Firestore data, and remote URLs are unchanged.
`lessonImages.js` substitutes only exact allowlisted local paths when rendering.
URLs with query strings, absolute URLs, Storage tokens, and unknown local paths
pass through unchanged. Known intrinsic dimensions are supplied without changing
CSS, object-fit, or card sizes. Unknown dimensions are not invented.

Full WebP images preserve 1672 x 941 pixels; thumbnails are 320 x 180 pixels.
Copies were encoded with installed Chrome Canvas WebP quality 0.92, without new
dependencies. No cropping or content editing was performed. All 16 decode in
Chrome; a full-sized cover was also visually inspected.

ProgramLearning list and OwnerProgramLessons use thumbnails. The larger selected
lesson, lesson player, and owner preview use full copies. Background and image
references use the same full URL to avoid fetching the original as a background.
The manifest contains the exact 16 generated filenames under
`public/lesson-covers/optimized/`, with content hashes in filenames. If an original
is intentionally replaced later, regenerate its copies and update the manifest.

| Cover | Original PNG bytes | Full WebP bytes | Thumbnail bytes |
| --- | ---: | ---: | ---: |
| algorithms-smart-solutions | 1,830,495 | 219,496 | 26,320 |
| coding-building-blocks | 1,897,080 | 200,322 | 21,954 |
| cybersecurity-digital-citizenship | 2,005,702 | 257,988 | 27,560 |
| data-ai-responsibility | 2,123,558 | 278,922 | 26,760 |
| data-binary-patterns | 1,798,318 | 223,836 | 24,258 |
| innovation-capstone | 1,860,699 | 229,164 | 26,690 |
| inside-a-computer | 1,965,659 | 245,942 | 23,702 |
| internet-networks-web | 2,072,579 | 274,936 | 26,594 |
| **Total** | **15,554,090** | **1,930,606** | **203,838** |

Loading all eight full covers saves 87.59% of image bytes. Loading all eight list
thumbnails saves 98.69%. These are asset-byte comparisons, not live page timing
measurements; actual transfers depend on visible items, navigation, and cache.
Retaining the originals adds 2,134,444 bytes to deployed assets, but does not make
the browser download those originals alongside their replacements.

## Cache and remaining work

No Hosting or service-worker configuration changes. The existing worker precaches
JS/CSS/HTML/fonts and explicitly included icons, not lesson covers; runtimeCaching
is empty. The WebP images add zero image bytes to offline precaching. The new JS
mapping is part of the shell: the build reports 119 entries / 5020.62 KiB, compared
with the preceding build's 118 entries / 5017.43 KiB. Normal HTTP caching remains
subject to Hosting response headers; no custom lesson-image header exists locally.
A future long-lived immutable HTTP cache policy can target only the public,
content-hashed optimized directory after verifying deployed headers. Do not apply
that policy to token-bearing Storage images or private responses.

Pre-existing catalog cover references missing from `public/lesson-covers`:

- think-like-a-programmer.png
- build-first-game-project.png
- what-is-artificial-intelligence.png
- how-ai-learns.png
- create-image-with-ai.png

`functions/scripts/attachMission01.js` also refers to missing `mission-01.png`.
They were not replaced with unrelated illustrations. Production Storage/Firestore
images need a separate authorized inventory of dimensions, byte size, cacheControl,
and access requirements before adding thumbnails or changing references.

## Verification

- `npm run build`: passed; existing large JavaScript chunk warning remains.
- Image integrity/URL safety, lesson completion, mission validation, purchased
  mission persistence: 13 tests passed.
- Existing owner editor/preview browser checks: 18 viewport/language cases passed
  using isolated Firebase mocks.
- All 16 generated WebP images decode at expected dimensions.
- Direct `node --test tests/mission.test.mjs` cannot start: existing extensionless
  `src/firebase/firebase` import in `missionRepository.js` fails under Node ESM.
  Neither that repository module nor its imports were changed by this pass.

No content import, permission changes, or deployment was performed.
