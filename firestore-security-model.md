# TechMinds Firestore security model

This document records the assumptions enforced by `firestore.rules` for the
named Firestore Enterprise database `default` in project `techminds-63e30`.

## Trust boundaries

- Firebase Authentication proves identity; `users/{uid}` supplies role and
  account status.
- An active owner can manage catalog documents and customer account status.
- An active teacher can manage only classes, students, lessons, attendance,
  progress feedback, and portfolio records whose `teacherId` is their UID.
- An active student can write only their own in-progress learning records and
  portfolio records for a published lesson with an active class membership.
- `classMembers/{classId}_{studentId}` is the sole class-entitlement source;
  legacy `users/{uid}.classId` is profile metadata only.
- The `completeLesson` callable validates completion state against trusted
  lesson content, then atomically writes the completion receipt and XP.
- Payment, subscription, purchase, and program-access writes are denied to all
  web clients. The Admin SDK in Cloud Functions is the only trusted writer.
- Student codes are resolved by a rate-limited Callable Function. It verifies
  the password through Firebase Authentication and returns a short-lived custom
  sign-in token without exposing the internal authentication email.
- Unknown collections are denied by the final catch-all rule.

## Collection policy

| Collection | Reads | Browser writes |
| --- | --- | --- |
| `users` | self, owner, assigned teacher | constrained registration/profile/plan/status workflows; XP is server-only |
| `studentLoginIndex` | denied; Cloud Functions only | validated create-only records during student registration |
| `studentLoginRateLimits` | denied; Cloud Functions only | denied; Cloud Functions only |
| `classes`, `classCodes` | owner/assigned teacher; students can resolve an active class | owning teacher; immutable IDs and ownership |
| `programs`, `plans` | public catalog; drafts restricted to owner where applicable | owner only |
| `lessons` | owner, owning teacher, assigned student | owner or owning teacher |
| `attendance` | owner or owning teacher | owning teacher |
| `lessonProgress` | owner, student self, assigned teacher | student-owned progress or teacher feedback-only |
| `lessonCompletions` | owner, student self, assigned teacher | denied; `completeLesson` Cloud Function only |
| `portfolio` | owner, student self, assigned teacher | student self for an assigned lesson |
| `platformSettings/public` | public | owner only |
| billing/access collections | owner or record owner where needed | denied; Cloud Functions only |
| `paddleWebhookEvents` | denied | denied; Cloud Functions only |

## Sensitive invariants

- A web client cannot create an `owner` profile or change any user's role.
- A user cannot self-activate a paid subscription or grant program access.
- Teacher access is always tied to the existing record's `teacherId`.
- `completeLesson` validates mission answers against the trusted lesson before
  atomically creating the immutable completion receipt and incrementing XP.
  The completion ID is `{studentUid}_{lessonId}`, preventing a second reward.
- Active `classMembers` records, not student profile `classId`, authorize all
  class lesson, assignment, and class-license access. A revoked membership
  cannot fall back to profile metadata.
- Student profile `classId` cannot be changed by browser clients. Teachers
  provision an active membership atomically with a new managed student; join,
  assignment, and revocation flows use trusted callables.
- Document IDs, field allowlists, timestamps, collection sizes, and common text
  lengths are validated before client writes are accepted.

## Adversarial review cases

| Attempt | Expected result |
| --- | --- |
| public list exploit against private collections | deny; only explicit catalog/settings reads remain public |
| unauthenticated read of a user profile | deny |
| unauthenticated direct read/query of `studentLoginIndex` | deny |
| student login with a guessed code, wrong class, or wrong password | deny with one generic response |
| repeated password attempts for the same student and IP | throttle |
| update an index record after valid creation | deny; index records are immutable |
| use request data to claim an owner/teacher authority | deny; authority comes from the existing authenticated profile |
| send oversized login strings or passwords | deny before database/authentication lookup |
| send the wrong type for login inputs | normalize or deny before lookup |
| create an index record with missing/extra fields | deny via `hasAll` and `hasOnly` |
| create an index for a missing or non-student profile | deny via `getAfter(users/{uid})` |
| existing student creates extra aliases or squats codes | deny; index creation requires a newly-created profile in the same batch and an exact alias match |
| change index ownership after creation | deny because updates are disabled |
| alter an immutable creation timestamp | deny because updates are disabled |
| inject an arbitrary field into an index record | deny via `hasOnly` |
| write a client-controlled rate-limit record | deny; Admin SDK only |
| sign in with an incorrect password | deny by Firebase client Auth; authenticated UID must equal index UID |
| resolve an inconsistent class index | deny after profile and class verification |
| log in through an inactive student or class | deny |
| resolve an internal email from a valid alias | allowed; rate-limited callable returns authEmail and uid for client Auth |
| bypass password verification through the resolver | deny; resolver does not create an authenticated session |
| access an orphaned nested login document | not applicable; login records use top-level collections and profile existence checks |
| query mismatch after direct reads are disabled | pass; all availability and resolution reads use Admin SDK callables |
| student changes `role` to `owner` | deny |
| student changes `subscriptionStatus` to `active` | deny |
| teacher queries or updates another teacher's students | deny |
| teacher moves a student they do not manage | deny |
| student submits progress for another student or unassigned lesson | deny |
| student directly writes XP or a completion receipt | deny; `completeLesson` validates and writes atomically |
| client writes a purchase, subscription, access, or webhook event | deny |
| owner reads sales and manages catalog/account status | allow |
| legitimate student completion transaction | allow |

## Known residual risks and follow-up

1. The login callable relies on IP-plus-student rate limiting and Firebase
   Authentication throttling. Enable Firebase App Check before broad public
   launch for stronger automated-abuse resistance. Rate-limit documents carry
   an `expiresAt` TTL policy so they are automatically removed.
2. Student login resolves an alias through `studentLogin`, then authenticates
   with Firebase client email/password Auth. No token-signing IAM role is needed.
3. Firestore Rules can cap dynamic answer/attendance maps but cannot deeply
   validate every arbitrary nested key as cleanly as server code. Treat their
   contents as untrusted when rendering and add Cloud Function validation if
   these objects gain privileged meaning.
4. Existing production documents must match the required field shapes and
   timestamps. Test representative owner, teacher, and student flows against
   the Emulator Suite before deployment.
5. Rules can verify a one-time completion transaction; they cannot prove that a
   human genuinely completed the educational activity. Move XP awarding to a
   callable server function if stronger anti-cheat guarantees become necessary.
