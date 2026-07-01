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

Status values: `pending` → `in-review` → `done` (or `deferred`). A flow is `done` once
every finding is resolved (fixed, accepted, or explicitly deferred); mark the flow itself
`deferred` if you are skipping it for now.

---

## Flow 1: Sign up — done

**Entry point:** `src/routes/signup.tsx:12`
**Goal:** New user creates an account and lands on the dashboard.
**Steps:** open form → validate → submit → create account → redirect.

### Findings

Dimension keys: `mechanics` / `edge` / `gaps` / `ux` (see `review-rubric.md`).

| # | Severity | Dimension | Finding | Evidence | Recommendation | Resolution |
|---|----------|-----------|---------|----------|----------------|------------|
| 1 | blocker | mechanics | Submit button calls no handler | `signup.tsx:40` | Wire to `createUser()` | fixed |
| 2 | major | edge | No error shown on duplicate email | `signup.tsx:55` | Surface API 409 inline | fixed |
| 3 | minor | ux | No loading state on submit | `signup.tsx:44` | Disable button + spinner during submit | deferred |

Resolution values: `fixed` / `accepted` / `deferred` / `not-real` — the recorded outcome of
each per-finding decision (fix / accept / defer / not-real).

### Decisions
- Duplicate-email copy approved by the user: "That email is already registered."
