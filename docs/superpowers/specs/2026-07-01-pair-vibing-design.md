# pair-vibing — Skill Design Spec

**Date:** 2026-07-01
**Status:** Approved (design), pending implementation plan
**Type:** Claude Code skill

> **Historical note (2026-07-02):** this spec predates the plugin repackaging (commit
> `a5bf454`). The skill now ships at `plugin/skills/pair-vibing/` and installs as a plugin
> (invoked as `/pair-vibing:pair-vibing`); the copy-into-`~/.claude/skills` install described
> below still works but is no longer the primary path. See the top-level README.

## Problem

When Claude generates a project quickly ("vibe coding"), it produces a lot of
code fast — but no one ever walks each user flow to confirm the mechanics
actually work and the edges are handled. The result is projects that look
complete but have broken wiring, missing error states, dead-end flows, and
rough UX that only surface when a real user hits them.

`pair-vibing` fixes this by pairing the user with the agent to review a
project's user flows **one at a time**, meticulously, applying agreed fixes as
they go.

## Goals

- Surface every user flow in a project and confirm the set is complete.
- For each flow, meticulously check mechanics, edge/error states, gaps, and UX.
- Keep the user in control: discuss findings, decide per finding, then fix.
- Persist progress so the review is resumable across sessions.
- Work whether the project is already built (read code) or still a spec (read docs).

## Non-goals

- Not a full automated test suite or CI replacement.
- Not a broad code-quality/refactor pass — scope is user-flow correctness and completeness.
- Does not fix anything without the user's per-flow go-ahead.

## Design decisions (locked)

| Decision | Choice |
|---|---|
| Lifecycle timing | **Continuous** — reads code if present, otherwise spec/PRD/docs. |
| Per-flow output | **Discuss, then apply fixes** — surface findings + recommendations, decide together, apply agreed changes before moving on. |
| Review rubric | All four dimensions: mechanics & wiring · edge & error states · gaps & dead ends · UX friction & clarity. |
| Progress tracking | **Living tracker file** `pair-vibing/flows.md` in the target project — full inventory + per-flow detail. |
| Skill architecture | **Subagent-orchestrated** — fan out for discovery and per-flow deep analysis; degrade gracefully to inline. |
| Adversarial verification of findings | **Optional** — the skill asks the person running it whether to enable it. |
| Install location | Authored in `C:\Users\liewj\Projects\pair-vibing`, then installed globally to `C:\Users\liewj\.claude\skills\pair-vibing\`. |

## Runtime flow

### Phase 0 — Orient & resume
- Detect what the project has: code, spec/PRD/docs, or both. Determine what "reading the project" means for this repo.
- Ask the person running it whether to enable **adversarial verification** of findings (default suggestion: on for thoroughness, off for lighter/faster runs).
- Look for an existing `pair-vibing/flows.md`:
  - **Found** → show status summary (done / pending / deferred), ask where to resume.
  - **Not found** → proceed to discovery.

### Phase 1 — Discover flows (fan-out)
- Dispatch parallel subagents to map the project by area, e.g.:
  - Frontend routes / pages / navigation
  - Backend handlers / API endpoints / jobs
  - Auth & permissions
  - Data layer / persistence
  - Specs / PRD / docs (when present)
- Each subagent returns candidate flows: `name`, `entry point`, `goal`, `steps`, `location(s)` (file:line).
- Merge + dedupe into a single candidate inventory.
- **Present the inventory to the user for sign-off** — add missing flows, remove non-flows, set priority order. This is the **completeness gate**: the user confirms the full set before refinement begins.
- Write the confirmed inventory to `pair-vibing/flows.md` with all statuses = `pending`.
- Degrade gracefully: for tiny projects or when subagents are unavailable, do discovery inline.

### Phase 2 — Per-flow refinement loop
For each flow, in the user's chosen order (user may also point at a specific flow):

1. **Deep-trace subagent** walks the single flow end-to-end through code/spec and scores it against the rubric. Returns findings, each with: `severity`, `evidence` (file:line), `recommendation`.
2. **(Optional) Verifier subagent** adversarially checks each finding — is it real? reproducible? — to cut false positives. Only runs if the user enabled verification in Phase 0.
3. **Present** the flow + verified findings ranked by severity + recommendations. Discuss.
4. **Decide together**, per finding: `fix now` / `accept` / `defer` / `not-real`.
5. **Apply the agreed fixes** — edit code or update the spec, following existing patterns.
6. **Verify** where feasible (run tests / run the app / re-read the changed path).
7. **Update the tracker**: flow status, findings with resolution, decisions, changes made.
8. Move to the next flow.

### Phase 3 — Wrap
- Summarize: flows reviewed, findings found / fixed / deferred, flows still pending.
- Tracker persists so a future session resumes cleanly from Phase 0.

## The review rubric (`references/review-rubric.md`)

Each dimension expands into concrete checks the deep-trace subagent applies:

- **Mechanics & wiring** — every button/link/action wired to a real handler; navigation
  targets exist; data actually persists and loads; forms submit; state updates
  propagate; no placeholder/stub handlers; API calls hit real endpoints; both success
  and failure paths handled.
- **Edge & error states** — empty, loading, invalid input, server/network error,
  permission-denied, not-found, timeout, concurrent/duplicate actions, boundary values,
  offline.
- **Gaps & dead ends** — unhandled branches, TODO/FIXME in the path, flows that start
  but can't complete, orphaned screens, missing back/cancel/undo, unreachable states.
- **UX friction & clarity** — unclear feedback, missing confirmation for destructive
  actions, too many steps, ambiguous labels, no progress indication, inconsistent
  patterns.

## The tracker (`pair-vibing/flows.md`, `references/tracker-template.md`)

A living Markdown file in the target project:

- **Header** — project name, last updated, verification mode (on/off).
- **Inventory table** — each flow → status (`pending` / `in-review` / `done` / `deferred`), priority.
- **Per-flow sections** — steps; findings (each with severity + status `open`/`fixed`/`accepted`/`deferred`); decisions; changes made (file references).

This gives resumability and a clear "have we covered every flow?" completeness view.

## Subagent orchestration (`references/flow-discovery.md` + SKILL.md)

- **Discovery**: parallel agents by area; merge/dedupe results.
- **Per-flow**: one deep-trace agent + (optional) one verifier agent.
- Uses the Task/Agent tool; may use the Workflow tool when available for many flows.
- **Graceful degradation**: inline analysis when subagents aren't available or the
  project is small enough that fan-out is overkill.

## Skill file structure

```
pair-vibing/
  SKILL.md                      # the process above
  references/
    review-rubric.md            # expanded 4-dimension checklist
    flow-discovery.md           # how to find flows + subagent dispatch guidance
    tracker-template.md         # flows.md template
```

Frontmatter `description` must trigger on intent like: reviewing/refining user
flows, auditing a vibe-coded project, checking that each flow's mechanics and edge
cases actually work, "pair vibing", "vibe check my app".

## Install

After the files are written and reviewed, install globally by copying the
`pair-vibing/` directory to `C:\Users\liewj\.claude\skills\pair-vibing\` so it is
invocable as `/pair-vibing`.

## Success criteria

- Invoking the skill on a project produces a complete, user-confirmed flow inventory.
- Each reviewed flow gets rubric-based findings with concrete evidence, not vague notes.
- Fixes are applied only after per-flow user agreement, then verified where feasible.
- Re-invoking the skill later resumes cleanly from the tracker.
- Runs on both code-complete and spec-only projects.

## Design principles

- User stays in control — nothing fixed without a per-flow go-ahead.
- Completeness gate + tracker prevent silently skipped flows.
- Rubric + optional adversarial verification enforce depth over hand-waving.
- Resumable across sessions.
- "User flow" generalizes across web / CLI / mobile / backend projects.
