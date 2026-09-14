# Paddle production configuration

For the current one-time program purchase flow, follow [PROGRAM_PURCHASE_SETUP.md](PROGRAM_PURCHASE_SETUP.md). The subscription checklist below is retained for the separate subscription system.

Status: preparation only. Live credentials and prices have not been supplied or deployed.

1. Verify the live Paddle account and approve the checkout domain in Paddle.
2. Create the live product catalog and recurring monthly/yearly prices. Confirm currency, amount, tax treatment, and billing interval for each price.
3. Create a live client-side token in Developer tools → Authentication.
4. Set `VITE_PADDLE_ENVIRONMENT=production`, `VITE_PADDLE_CLIENT_TOKEN=live_...`, and `VITE_PADDLE_PLAN_PRICE_IDS` (JSON mapping plan IDs to monthly/yearly price IDs) in the frontend production environment. Never place API keys or webhook secrets in VITE variables.
5. Store the same plan price mapping under `paddlePlanPriceIds` in Firestore `platformSettings/billing`; program documents need live `paddlePriceIds` for each offered license. The webhook validates against these records.
6. Create a live notification destination for the production webhook. Store its signing secret securely in Firebase Secret Manager as `PADDLE_WEBHOOK_SECRET`. Do not paste this secret into chat or commit it. The currently deployed destination is sandbox; coordinate the switch so the live and sandbox signing secrets are never mixed.
7. Set backend `PADDLE_ENVIRONMENT=production` in the Functions deployment environment. Default remains sandbox until explicitly changed.
8. Before launch, implement and verify subscription lifecycle handling (cancellation, pause, past due, renewal, and adjustments/refunds) and ensure sandbox entitlements cannot be treated as paid production access. Current webhook processing handles completed transactions only.
9. Validate the live catalog and matching frontend/backend configuration, then deploy the function and frontend together. Verify notification delivery and the resulting entitlement before declaring live payments operational.

Reference: https://developer.paddle.com/build/go-live-checklist/
