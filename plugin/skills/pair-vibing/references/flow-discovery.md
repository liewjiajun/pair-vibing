# Flow Discovery

Goal: produce a complete inventory of the project's user flows, then get the user
to sign off on it before any refinement.

## What counts as a user flow
A goal a user accomplishes through a sequence of steps — e.g. "sign up", "reset
password", "create and publish a post", "check out and pay", "invite a teammate".
Not a single function or endpoint; a whole journey with an entry point and a goal.

## Dispatch (subagent-orchestrated)
Fan out one subagent per area (skip areas the project doesn't have) and run them in
parallel. For a small project, or when subagents are unavailable, do this inline instead.

Areas to cover:
- **Entry points & navigation** — routes, pages, screens, menus, deep links, CLI commands.
- **Frontend** — components/views and the actions they expose.
- **Backend** — handlers, API endpoints, controllers, background jobs.
- **Auth & permissions** — sign up / in / out, roles, gated actions.
- **Data layer** — what gets created / read / updated / deleted, and by which flows.
- **Specs / docs** — PRD, README, design docs (especially when the code is thin).

## What each subagent returns
For every candidate flow it finds:
- `name` — short, user-goal phrasing ("Reset password").
- `entry_point` — where the user starts (route/screen/command + `file:line`).
- `goal` — what success looks like.
- `steps` — the sequence, at a high level.
- `locations` — the key `file:line` references the flow touches.

## Merge & sign-off
- Merge all subagent results; dedupe overlapping flows; combine partial traces.
- Present the merged inventory to the user. Ask them to: add missing flows, remove
  anything that is not a real user flow, and set a priority order.
- **Do not start Phase 2 until the user confirms the inventory.** This completeness
  gate guarantees no flow is silently skipped.
