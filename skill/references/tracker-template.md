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

Status values: `pending` → `in-review` → `done` (or `deferred`).

---

## Flow 1: Sign up — done

**Entry point:** `src/routes/signup.tsx:12`
**Goal:** New user creates an account and lands on the dashboard.
**Steps:** open form → validate → submit → create account → redirect.

### Findings

| # | Severity | Dimension | Finding | Evidence | Resolution |
|---|----------|-----------|---------|----------|------------|
| 1 | blocker | mechanics | Submit button calls no handler | `signup.tsx:40` | fixed — wired to `createUser()` |
| 2 | major | edge | No error shown on duplicate email | `signup.tsx:55` | fixed — surfaces API 409 |
| 3 | minor | ux | No loading state on submit | `signup.tsx:44` | deferred |

Resolution values: `fixed` / `accepted` / `deferred` / `not-real`.

### Decisions
- Duplicate-email copy approved by the user: "That email is already registered."
