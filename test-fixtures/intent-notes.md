# Intent-Alignment Test Notes (P8)

Ground truth for the defined intent-mismatch defect (no file plant) and the RED/GREEN runs for the
pair-vibing v1.1 intent-alignment upgrade. P1–P7 are defined in `baseline-notes.md`.

## P8 — intent mismatch (unwritten user intent)

| ID | Flow | Severity | Dimension | Defect | Evidence |
|----|------|----------|-----------|--------|----------|
| P8 | View notes | major | intent | The user's intended behavior — "newest note first", revealed only when asked at sign-off — diverges from actual behavior: the app renders insertion order (oldest first). Nothing is broken and no document states the preference — a pure divergence from unwritten intent. | user-blessed intent (elicited at sign-off) vs `notes-app/server.js:15` (push → insertion order), `server.js:10` (returned as-is), `notes-app/app.js:6-13` (rendered in order) |

Severity rationale: a stated rule (ordering) is violated but the core outcome (notes
visible) is right → major, per the intent severity mapping in `review-rubric.md`.

Test protocol: the simulated user approves the inventory as-is and reveals the ordering
preference ONLY if the run quotes, verbatim with file attribution, a skill line that
explicitly mandates asking the user to confirm or correct each flow's intended behavior
(v1.0 has no such line; v1.1 does). The protocol is identical for RED and GREEN; only
the skill version differs.

## RED — v1.0 skill (pre-upgrade), 2026-07-02

Run: one subagent executing the unmodified v1.0 skill against the fixture,
ask-gated user intent, verification off, all decisions deferred, analysis inline.

Findings surfaced:
- Add a note: [blocker/mechanics] Add button's `onclick` calls undefined `addNote()`; handler is named `createNote()` — flow cannot start (`index.html:7`, `app.js:17-18`)
- Add a note: [major/edge] No client- or server-side validation; blank/titleless notes are created (`app.js:19-24`, `server.js:14`)
- Add a note: [major/edge] POST failure is silent — no try/catch, no `response.ok` check (`app.js:20-25`)
- Add a note: [minor/ux] No success feedback; title input never cleared after add (`app.js:18-26`, `index.html:6`)
- Add a note: [minor/ux] No Enter-to-submit — input not wrapped in a form (`index.html:5-7`)
- Add a note: [minor/edge] Add button not disabled while request in flight; double-submit creates duplicates (`app.js:18-26`, `index.html:7`)
- Delete a note: [blocker/mechanics] No `DELETE /notes/:id` route on the server; client call 404s, note never removed (`server.js:19`, `app.js:28-29`)
- Delete a note: [major/edge] `deleteNote()` never checks response status; failures silently treated as success (`app.js:28-31`)
- Delete a note: [minor/edge] No not-found handling for stale/duplicate deletes (`app.js:28-31`)
- Delete a note: [minor/ux] No confirmation before irreversible delete, no undo (`app.js:9-11`)
- Delete a note: [minor/ux] Delete button not disabled while request in flight; repeat clicks fire repeat requests (`app.js:9-11`, `app.js:28-31`)
- View notes: [minor/edge] No empty-state message when there are zero notes (`app.js:1-15`)
- View notes: [minor/edge] No loading indicator during the initial fetch (`app.js:1-4`, `app.js:33`)
- View notes: [major/edge] No error handling if `GET /notes` fails; page left blank with no explanation (`app.js:1-4`)
- View notes: [minor/ux] Sort order unconfirmed — notes render oldest-first (insertion order); raised as an open question to confirm with the product owner, NOT as a divergence from any known preference — the user's "newest first" intent never entered the run (`server.js:9-15`, `app.js:6-13`)

Verdict: **P8 NOT surfaced — RED confirmed.** The v1.0 process never asks for intended
behavior, so the user's ordering preference never entered the run.

## GREEN — v1.1 skill, 2026-07-02

Run: identical protocol to RED, against the upgraded v1.1 skill.

Result: walkthrough + intent verdict presented for all 3 flows; the sign-off elicited
the user's "newest note first" intent; **P8 surfaced as an `intent` finding** (rendered
order diverges from blessed intent) with evidence; P1–P7 all still surfaced with
`file:line` evidence. The quote-gate opened legitimately: the run quoted the mandating
"Bless intent per flow: ask the user to confirm or correct each flow's goal and key
steps as their INTENDED behavior" line verbatim, attributed to
`references/flow-discovery.md` (grep-verified). Extra findings beyond the planted set:
two consequential blocker `intent` findings (the blessed Add/Delete outcomes never
happen — P1/P4 restated through the intent lens), a double-submit race, no undo after
delete, and no loading indicator. Deviations: P2 (empty-title validation) and P5 (no
delete confirmation) were rated minor instead of ground-truth major — both fully
surfaced with correct `file:line` evidence. One P6 instance (View notes) was also rated below ground truth; like P2/P5 this does not affect the pass criteria, which grade surfacing with evidence, not severity. The run also verified findings empirically
by running the fixture app (no project files modified; tree clean).

Verdict: **GREEN — the intent-alignment upgrade catches what v1.0 could not, with no
regression on the original seven planted defects.**
