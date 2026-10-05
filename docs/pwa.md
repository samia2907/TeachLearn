# TechMinds PWA

`vite-plugin-pwa` generates `dist/manifest.webmanifest`, `dist/sw.js`,
`dist/registerSW.js` and the Workbox runtime during `npm run build`.
The existing React plugin, routes, language provider and Firebase SDK are unchanged.
Theme purple `#6840d8` and canvas `#f5f7fc` match the existing styles.

## App icons

The four supplied TechMinds PNG icons are present in `public/`. Their actual PNG
dimensions, build output, HTTP responses and precache entries have been verified:

| File | Dimensions | Purpose |
| --- | --- | --- |
| `pwa-192x192.png` | 192 × 192 | Android app icon |
| `pwa-512x512.png` | 512 × 512 | Android app icon |
| `pwa-maskable-512x512.png` | 512 × 512 | Opaque full-bleed background; keep the logo inside the central circle of radius 40% of image width |
| `apple-touch-icon.png` | 180 × 180 | Opaque iPhone/iPad home screen icon |

Vite includes only existing icons in the manifest and injects the Apple link only
when its file exists, avoiding missing-file requests and failed precaching.
The generated manifest contains all three Android icons with the correct purposes;
the generated `dist/index.html` contains the Apple touch icon link.

## Updates and caching

The worker updates automatically on subsequent visits using `autoUpdate` and native
script registration. No forced page reload is installed: open forms/editors remain
open, and new application code is loaded on the next full navigation/reload.
Long-lived open tabs are not polled for updates.
Only built HTML, JS, CSS, fonts and explicitly included icons are precached.
The 4 MiB per-file limit accommodates the existing Monaco code editor chunk.
Firebase Auth, Firestore, Functions, payment and other network responses have no
runtime cache rules. These services still require connectivity; shell caching is
not full offline support for lessons or account operations.

Firebase Hosting keeps its existing `**` rewrite to `/index.html`. The worker also
uses `/index.html` for SPA navigations, excluding Firebase `/__/` and `/api` paths.
Hosting revalidates the worker, registration script, manifest and index HTML.

## Verification

1. Run `npm run build`.
2. Run `npm run preview` locally. In browser DevTools > Application, inspect the
   manifest icons and active worker. PWA registration is disabled in `npm run dev`.
3. For Hosting rewrite checks, run `npx firebase emulators:start --only hosting`
   after building. Open `/about` and `/programs` directly and refresh them.
4. On an HTTPS deployment **only after deployment is authorized**, open TechMinds
   in Android Chrome, use Install app / Add to Home screen, and launch the icon.
5. On iPhone/iPad Safari, use Share > Add to Home Screen (enable Open as Web App
   if offered), then launch TechMinds from the home screen.
6. Verify standalone display, correct icons, AR/HE/EN, login/logout, protected
   routes, Firestore reads/writes, lessons, editor and checkout while online.
7. After a second build is served, revisit to trigger the worker update. Confirm
   an open unsaved form is not reloaded, then refresh to receive the new UI.
8. After an online visit, test the shell offline; do not expect live Firebase data
   or remote assets to work offline. Inspect Cache Storage for static assets only.

No Firebase deployment is part of this change.

## Latest local validation

`npm run build` passed with the existing large-chunk warning. Headless Chrome on
the production preview reported no manifest parsing or installability errors.
The worker activated and controlled the page; all four icons were served as PNG
and present in its cache. Offline navigation to `/programs` rendered the React
shell. This does not verify live Firebase operations offline or installation on
physical Android/iOS devices.

Reproduce the browser check with the production preview running on
`http://127.0.0.1:5187`, then run `node artifacts/pwa/check.mjs` (requires Chrome
at the Windows path specified in the script). The report is saved to
`artifacts/pwa/result.json`.
