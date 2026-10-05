# Program access

Program documents retain their existing fields and add:

```js
{
  accessType: "free", // "free" | "paid" | "class"
  price: 0,
  currency: "ILS",
  paymentProvider: null,
  paymentProductId: null
}
```

`functions/programAccessPolicy.mjs` defines optional metadata defaults and the provider-independent
`canAccessProgram` policy. Only active accounts can access published programs.
Students can open free programs without an entitlement. Paid programs accept
existing personal purchases or class access. Class-only programs require class
access; personal purchase records are retained, but do not bypass class-only mode.
Existing owner preview and teacher entitlement behavior is preserved.

`accessType` is never defaulted. A published program without an explicitly
stored `accessType` of `free`, `paid`, or `class` is inaccessible until an owner
configures it. An explicitly stored `accessType: "free"` remains free, including
older records whose price was not persisted.

`checkProgramAccess` returns access metadata, never lesson content.
`getPurchasedProgram` uses the same policy before returning lessons, including
when the student opens a program or lesson URL directly. Neither policy function
uses payment provider or product IDs to grant access. Student checkout is disabled;
legacy Paddle integrations and teacher checkout remain available for compatibility.

The server resolves existing `programAccess` documents and active `classMembers`
memberships with class licenses or `classAssignments`. It queries memberships by
student UID, preserving multi-class access. Progress remains keyed by student UID
and lesson ID. A class ID hint on commercial mission progress is validated against
membership and entitlement records by Firestore rules; it never grants access by itself.

## Migration

The migration does not assign an access type. It can fill only optional metadata
(`currency` and nullable payment identifiers) and reports programs that require
an owner to explicitly configure access. Program publication status is unchanged.
Owner saves require a valid `accessType` and price.

Preview missing fields without writes:

```powershell
node functions/scripts/migrateProgramAccess.js
```

Persist optional metadata when ready (this does not configure program access):

```powershell
node functions/scripts/migrateProgramAccess.js --commit
```

The migration rechecks each document in a transaction, fills only optional
metadata, and never changes access type, purchases, memberships, assignments,
status, or existing values. The two programs below have no explicit access
policy and must remain inaccessible until an owner configures one:
`computer-science-modern-technology-journey` and `fftzabqS6NPBaVth03rX`.
No migration writes or deployments were performed.

## Rules and validation

Program writes remain owner-only and validate access mode, nonnegative price,
zero price for Free, ILS currency, and nullable bounded payment metadata.
Commercial lesson content remains protected by the server callable; progress and
completion writes independently validate student access, UID ownership, and XP.
Public catalog queries remain limited to published program metadata. Existing
teacher/class lesson permissions remain unchanged.

Validation includes the production build, frontend/backend lint, access-policy and
purchase compatibility tests, progress tests, and non-deploying Firestore Rules
API tests with mocked documents. Frontend lint and the build have warnings but
no errors. Rules and backend/frontend changes must be released together when ready.
