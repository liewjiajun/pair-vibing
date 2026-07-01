# RED Baseline — notes-app reviewed WITHOUT the skill

A fresh `general-purpose` subagent (sonnet) was asked only: *"Review the user flows
in test-fixtures/notes-app and report any problems you find."* No skill, no rubric,
no mention of the planted defects. This is the "watch it fail" evidence.

## Planted defects (ground truth)

| # | Flow | Severity | Dimension | Defect |
|---|------|----------|-----------|--------|
| P1 | Add | blocker | mechanics | `index.html:7` calls `addNote()` but `app.js:18` defines `createNote()` |
| P2 | Add | major | edge | No empty-title validation (`app.js` / `server.js` POST) |
| P3 | Add | minor | ux | Input not cleared / no success feedback after add |
| P4 | Delete | blocker | gaps/mechanics | No `DELETE /notes/:id` route (`server.js:19` TODO) |
| P5 | Delete | major | ux | No confirmation before destructive delete |
| P6 | all | major | edge | No error handling on any `fetch` |
| P7 | View | minor | edge/ux | No empty-state message when there are no notes |

## What the baseline caught: 5 / 7

- P1 (wiring) ✅
- P2 (empty title) ✅
- P3 (input not cleared) ✅
- P4 (missing DELETE route) ✅
- P6 (no fetch error handling) ✅ — reported as one combined item

## What the baseline MISSED

- **P5 — no confirmation before delete** ❌ (a destructive-action UX gap)
- **P7 — no empty-state message** ❌

## Structural gaps (the process the skill adds)

The baseline produced an ad-hoc problem list. It did **not**:
- produce a flow **inventory** (entry points, goals, steps) or a completeness gate;
- classify findings by **severity** or **rubric dimension**;
- organize findings **per flow** (one-at-a-time);
- propose any **tracker** or resumable record.

**Conclusion:** a capable model finds the obvious mechanical/edge bugs unaided, but
misses softer UX gaps and provides zero structure, coverage guarantee, or process.
This is the gap the skill must close — see `with-skill-notes.md`.
