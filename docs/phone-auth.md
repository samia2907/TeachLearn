# Phone authentication

Phone is available on both Login and Register after choosing Student or Teacher. Existing email/password, Google teacher login and student class-code login remain available. Arabic and Hebrew phone forms use RTL; numbers and codes use LTR.

## Firebase Console (manual)

Project: `techminds-63e30`.

1. Authentication → Sign-in method → Phone: enable. Keep Email/Password enabled.
2. Authentication → Settings → Authorized domains: add every actual production/staging hostname (no protocol, port or path).
3. Configure SMS region policy to allow intended destinations, including Israel for +972 numbers.
4. Real SMS requires linked Cloud Billing (Blaze); check SMS quotas and billing status.
5. Under Phone → Phone numbers for testing, add fictional E.164 numbers and six-digit codes. Do not use real users' numbers as test numbers.

Firebase manages reCAPTCHA through `RecaptchaVerifier`; a separate manually supplied site key is not needed for this standard flow.

## Firestore

The `validSelfRegistration` rule now accepts an independent student whose profile phone number matches Firebase's verified `phone_number` claim, with null email/authEmail when the identity has no email. Email registration remains supported. UID ownership, free initial plan, role restrictions and class restrictions remain enforced. Rules must eventually be released with the app for new phone students to register. Nothing was deployed by this task.

Profiles are transactionally read/created at `users/{uid}`. Existing profiles are returned unchanged, including names, roles, class membership and access. New users receive the existing independent student or free teacher schema. Owner is only loaded from an existing profile; it cannot be selected at registration.

## Existing accounts

On Phone, select “Link my existing email/password account,” enter the current email/password, then verify the phone. Firebase links the provider to the same UID so profile, memberships and purchases remain intact. A number already linked to another UID is rejected, not merged. A manually typed phone field in Firestore is not proof of identity and is never used to merge accounts.

Existing Google-only and class-code users should use their existing login and contact support for provider linking rather than create a separate phone identity. The app cannot automatically identify an unrelated account from a phone number alone.

## Local test

1. Configure a fictional Console phone/code pair.
2. Set `VITE_PHONE_AUTH_TESTING=true` in `.env.local`, then restart `npm run dev`.
3. Choose a role → Phone, send to the fictional number, and enter the configured code. No real SMS is sent. The verification bypass is gated by Vite DEV and cannot activate in a production build.
4. Supply a name for a new profile; verify the correct dashboard and free initial access. Log out and sign in again; confirm the same UID and unchanged profile.
5. Test linking a disposable email account; verify email login still works and both methods use the same UID.
6. Repeat in English, Arabic and Hebrew. Try malformed numbers, wrong codes, switching methods/roles, leaving during reCAPTCHA, resending and simulated offline mode.

Firebase's current web phone guide does not allow localhost as the hosted domain for real phone authentication. Use fictional numbers with the development testing switch locally. For real SMS, use an authorized HTTPS host serving the local build or test on the deployed domain after a separately authorized release.

## Deployed-site checklist (after a future authorized release)

Leave the testing switch off. Verify reCAPTCHA and real SMS on an authorized domain, then retry login, test student/teacher/owner routing using existing roles, blocked accounts, email/class logins, class membership, and purchased program access. Test expired codes and too-many-attempts with controlled test fixtures; avoid deliberately flooding real SMS.

References: https://firebase.google.com/docs/auth/web/phone-auth and https://firebase.google.com/docs/auth/faq-and-troubleshooting

## Validation in this workspace

- `npm run build`: passed (existing large-chunk warning).
- Changed-file `oxlint`: passed.
- `node --test tests/phone-auth.test.mjs tests/student-code-login.test.mjs tests/class-membership.test.mjs tests/program-access-policy.test.mjs`: all 20 passed.
- `node tests/phone-auth.browser.mjs` against local Vite on port 5191: student/teacher registration and login, method switching, link-account fields, invalid phone validation, all three languages and RTL passed. No live SMS or Firebase accounts were created.
- Full `npm run lint` remains blocked by a pre-existing invalid unquoted key at `tests/program-access-resolver.test.mjs:51`.
- Broader purchase/persistence checks: 19 passed, 9 failed due to existing chained Firestore mock methods and Node import resolution in the current workspace. Those files were not changed by this auth work.
- `node tests/phone-auth-rules.cjs techminds-63e30` is ready but was not executed: automatic approval review rejected uploading the local rules source to Firebase's non-deploying test endpoint without explicit approval. The local Firestore emulator also requires Java, which is not installed here. Rule execution and real SMS delivery remain unverified.
