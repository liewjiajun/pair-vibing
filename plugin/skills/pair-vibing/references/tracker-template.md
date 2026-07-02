# Tracker Template

Write this to `pair-vibing/flows.md` in the target project and keep it updated as you go.
Copy the block below and fill it in.

---

# Pair Vibing — Flow Tracker

**Project:** <name>
**Last updated:** <YYYY-MM-DD>
**Adversarial verification:** <on | off>

## Inventory

| # | Flow | Priority | Status |
|---|------|----------|--------|
| 1 | Sign up | high | done |
| 2 | Reset password | high | in-review |
| 3 | Create post | medium | pending |

Status values: `pending` → `in-review` → `done` (or `deferred`). A flow is `done` once no
finding is left `open` — every finding has a recorded resolution (fixed, accepted, deferred,
or not-real); mark the flow itself `deferred` if you are skipping it for now.

---

## Flow 1: Sign up — done

**Entry point:** `src/routes/signup.tsx:12`
**Goal:** New user creates an account and lands on the dashboard.
**Intended:** validate inline, create the account, pass through the onboarding wizard
before the dashboard; duplicate emails rejected with a clear message (blessed at sign-off).
**Steps:** open form → validate → submit → create account → redirect.

### Findings

Dimension keys: `intent` / `mechanics` / `edge` / `gaps` / `ux` (defined in the
pair-vibing skill's `references/review-rubric.md`).

| # | Severity | Dimension | Finding | Evidence | Recommendation | Resolution |
|---|----------|-----------|---------|----------|----------------|------------|
| 1 | blocker | mechanics | Submit button calls no handler | `signup.tsx:40` | Wire to `createUser()` | fixed |
| 2 | major | edge | No error shown on duplicate email | `signup.tsx:55` | Surface API 409 inline | fixed |
| 3 | minor | ux | No loading state on submit | `signup.tsx:44` | Disable button + spinner during submit | deferred |
| 4 | major | intent | Redirects to /home after signup; user intended onboarding wizard first | `signup.tsx:61` | Redirect to `/onboarding` | fixed |

Resolution values: `open` / `fixed` / `accepted` / `deferred` / `not-real`. Log each finding
as `open` when it is presented, then record the outcome of the user's decision (fix / accept /
defer / not-real) — `open` rows are what a resumed session picks up first.

### Decisions
- Duplicate-email copy approved by the user: "That email is already registered."

### Changes made
- Finding 1: wired the submit button to `createUser()` — `signup.tsx:40`
- Finding 2: surfaced the API 409 as an inline field error — `signup.tsx:55`, `api/client.ts:88`
- Finding 4: signup now redirects to the onboarding wizard — `signup.tsx:61`
