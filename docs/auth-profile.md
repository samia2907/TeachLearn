# Authentication and profile improvements

Nothing has been deployed. Existing class-code authentication and server-managed student provisioning remain unchanged.

## Behavior

- **Forgot password:** teachers and independent students enter an email in the Email login form and select Forgot password. Validation runs before `sendPasswordResetEmail`; Firebase sends a localized reset link. The confirmation deliberately does not reveal whether an account exists. Network, rate-limit, invalid-email and disabled-account errors have English/Arabic/Hebrew messages. Phone mode does not show password reset. Class-code students retain their teacher-managed password process.
- **One profile per UID:** `userProfile.js` is the shared loader/transactional initializer for email/password, Google and phone client registrations. `users/{uid}` is the sole key. An existing profile is returned unchanged, preserving role, XP, membership and entitlements. A missing profile on the Profile page is reported, never replaced. Teacher-managed class accounts continue through the existing trusted backend logic.
- **Linking:** Profile links a phone to the current authenticated user with `linkWithPhoneNumber`. Replacing an existing number uses SMS verification plus `updatePhoneNumber`. Phone changes refresh the ID token before mirroring the verified number in Firestore. Profile can also add email/password via `linkWithCredential(EmailAuthProvider.credential(...))` and sends an email-verification message. Existing password accounts retain their current provider. Firebase rejects credentials owned by another UID; no automatic merging, profile deletion or entitlement transfer occurs. Recent-login errors ask the user to sign in again. A name or editable contact field is never used to match accounts.
- **Profile:** `/profile` is protected and linked from student, teacher and owner dashboards. Email and phone display come from Firebase Auth; role comes from the stored profile. Users edit only display name and preferred language directly. Phone changes require verification. English, Arabic and Hebrew are supported with responsive RTL/LTR layouts. The stored language preference is restored after authentication.
- **Partial operations:** Auth and Firestore cannot share one transaction. If verified phone synchronization fails, the phone component retries the profile write without re-confirming the SMS. If the Auth display-name mirror fails after saving the Firestore name, the UI explains the partial success and allows a safe retry. Email linking can succeed even if delivery of the verification message fails; the page then offers Send verification email.

## Rules and security

The existing `users/{uid}` rules now accept `preferredLanguage` only as `en`, `ar` or `he`. The self-profile update branch allows only the existing personal fields plus this language field; changing a phone number additionally requires equality with the authenticated `phone_number` claim. UID, role and account-type identity protections remain. The Profile page never writes permissions, roles, owner/admin status, XP, classes, plans, purchases or program access.

See `profile-security-review.json` for the scoped static audit. The Rules API regression suite includes positive name/language/verified-phone cases and negative protected-field/cross-account cases for students and teachers. It has not been run remotely: the earlier automatic approval rejection still applies. Local rules execution needs Java and a Firestore emulator.

These local rules changes must accompany a future authorized release. The current deployed rules may reject preferred-language saves and registrations until then. Do not treat the local build as verification of production rules.

## Firebase Console

1. Keep Email/Password enabled; enable Phone if not already enabled.
2. Review Authentication → Templates → Password reset and Email verification (sender, branding, hosted action handler). This implementation uses Firebase's default hosted handlers; no custom reset route is required.
3. Keep the intended production/staging hosts in Authorized domains. For phone, configure SMS region policy, Cloud Billing and fictional test phone/code pairs as described in `phone-auth.md`.
4. Do not turn off email enumeration protection. Unknown-email reset requests intentionally have the same success message.
5. No automatic account merging or Console user deletion is needed.

## Testing

- `npm run build`
- `npm run lint`
- `node --test tests/auth-profile.test.mjs tests/phone-auth.test.mjs tests/student-code-login.test.mjs tests/class-membership.test.mjs tests/program-access-policy.test.mjs`
- Start Vite on 127.0.0.1:5191, then run `node tests/phone-auth.browser.mjs` and `node tests/profile.browser.mjs`. These browser checks do not mutate Firebase; Profile uses fake services.
- For real integration testing use dedicated test users: request a reset and complete the Firebase email link; link a fictional test phone; verify that both login methods resolve to the same UID; check class membership, XP and purchased access; update name/language; sign out/in to confirm persistence; attempt credential collisions with two disposable accounts. Test actual SMS on an authorized HTTPS domain when Console setup is complete. Do not deploy as part of these instructions without separate authorization.

The build and 25 focused tests passed. Full lint remains blocked by the pre-existing unquoted key at `tests/program-access-resolver.test.mjs:51`; other existing hook/dependency and unused-variable warnings remain. Production build reports large chunks; the access-policy test emits Node's existing CommonJS/ESM experimental warning. Live reset-email/SMS delivery and rules-engine execution still need integration validation.

## Files in this change (including the preceding phone-auth work)

- Routing/language: `src/App.jsx`, `src/context/LanguageContext.jsx`.
- Pages: `src/pages/Login.jsx`, `src/pages/Register.jsx`, `src/pages/Profile.jsx`, `src/pages/Profile.css`, `src/pages/StudentDashboard.jsx`, `src/pages/TeacherDashboard.jsx`, `src/pages/OwnerDashboard.jsx`.
- Components: `src/components/PhoneAuth.jsx`, `src/components/PhoneAuth.css`, `src/components/ProfileLink.jsx`, `src/components/ProfileLink.css`.
- Services/policies: `src/firebase/userProfile.js`, `src/firebase/userProfilePolicy.js`, `src/firebase/authMessages.js`, `src/firebase/passwordReset.js`, `src/firebase/accountLinking.js`, `src/firebase/phoneProfile.js`, `src/firebase/phoneAuthPolicy.js`.
- Rules: `firestore.rules` (only the auth/profile additions; pre-existing edits retained).
- Tests: `tests/auth-profile.test.mjs`, `tests/profile.browser.mjs`, `tests/phone-auth.test.mjs`, `tests/phone-auth.browser.mjs`, `tests/phone-auth-rules.cjs`.
- Documentation: `docs/auth-profile.md`, `docs/profile-security-review.json`, `docs/phone-auth.md`.

References: https://firebase.google.com/docs/auth/web/manage-users and https://firebase.google.com/docs/auth/web/account-linking
