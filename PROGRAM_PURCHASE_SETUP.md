# One-time program payments

Implemented locally; nothing deployed during this task. Existing subscription processing remains separate.

## Owner workflow

Open `/owner/programs`, edit/create a program, and fill in Student Paddle Price ID, Teacher Paddle Price ID, and optionally Class Paddle Price ID. Save writes `programs/{programId}.paddlePriceIds`. Blank fields prevent checkout for that license.

The supplied `pri_01m20xr8wmnygx1154wetddgmf` has **not** been assigned to a role or program. Choose its program and license after checking its details in Paddle Live.

## Required manual configuration

1. Complete Paddle Live account/domain approval and configure its default payment link for the actual checkout domain.
2. Create **one-time** prices (no recurring billing cycle) for each program's student and teacher licenses. Class prices are optional. The UI currently displays ILS; use ILS and match the display amounts in the owner editor. Confirm tax treatment; Paddle checkout shows the final charge.
3. Use Live price IDs with the Live token; sandbox and Live catalogs are separate. The client token cannot reveal or validate the catalog.
4. Create a Live notification destination for `transaction.completed` at `https://europe-west1-techminds-63e30.cloudfunctions.net/paddleWebhook`.
5. Store the destination's signing secret via `firebase functions:secrets:set PADDLE_WEBHOOK_SECRET --project techminds-63e30`. Enter it at the CLI prompt, never in chat/frontend/source control. Coordinate switching the existing endpoint from sandbox; its old signing secret cannot verify Live notifications.
6. Set backend `PADDLE_ENVIRONMENT=production` in the Functions deployment environment, e.g. securely managed `functions/.env.techminds-63e30`.
7. Supplied public Live token is saved in ignored `.env.paddle-live.local` alongside `VITE_PADDLE_ENVIRONMENT=production`. Build Live assets with `node node_modules/vite/bin/vite.js build --mode paddle-live`. Default development remains sandbox.
8. Save program IDs through the owner interface. No `VITE_PADDLE_PLAN_PRICE_IDS` or `platformSettings/billing` mapping is required for programs; those belong only to subscriptions.
9. Review existing sandbox purchase/access records before launch: historical test entitlements are preserved by this change. Do not advertise Live subscriptions until their separate configuration/lifecycle handling is ready.
10. Once checks and configuration are complete, deploy the existing `paddleWebhook` and `getPurchasedProgram` functions and matching frontend. No deployment has been performed.

No Paddle API key is needed for this client-token + signed-webhook flow. If one is added later, keep it server-side. Database remains named `default`, Enterprise Native. Existing rules support owner edits to `paddlePriceIds` and deny client writes to purchases/access; no rule changes were needed. Verify deployed rules match that policy.

## Verification

The existing webhook validates signatures, Firebase roles, and the program's configured price. It requires exactly one matching one-time item with quantity one and writes purchase/access atomically. Event and transaction IDs prevent duplicate grants. Personal IDs are `student_{uid}_{programId}` and `teacher_{uid}_{programId}`. Owner preview and class access remain; no subscription is required.

Checkout polls the existing access callable for up to one minute after completion. Marketplace access refreshes on focus and every ten seconds. Delayed webhook delivery does not grant premature access; users can return to My Programs without paying again.

```text
npm run lint
npm --prefix functions run lint
node --test tests/paddle-config.test.mjs tests/program-purchases.test.mjs
npm run build
node node_modules/vite/bin/vite.js build --mode paddle-live
```

Tests use mocked Firebase/Paddle records. Actual Live checkout and signature-secret/delivery verification remain required after configuration and deployment. No payment was submitted during this task.

Reference: https://developer.paddle.com/build/go-live-checklist/
