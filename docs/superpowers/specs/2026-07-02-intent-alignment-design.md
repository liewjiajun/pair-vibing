# pair-vibing Intent Alignment — Design Spec

**Date:** 2026-07-02
**Status:** Approved
**Type:** Enhancement to the pair-vibing skill (ships as plugin v1.1.0)
**Applies to:** `plugin/skills/pair-vibing/` (SKILL.md + references), manifests, README, test fixture

## Problem

pair-vibing 1.0 verifies that user flows *work* — mechanics, edge states, dead ends, UX.
It never verifies that a flow does *what the user intended*. A flow that runs flawlessly
but does the wrong thing (wrong ordering, missing confirmation the user asked for, lands
on the wrong page) sails through the current rubric untouched. The plugin's stated purpose
is both halves: the flow works, **and** it works the way the user meant.

## Goals

- Capture the user's intended behavior per flow, cheaply, at the existing sign-off gate.
- Verify each flow's actual behavior against that intent during the per-flow review,
  with visible evidence that the check happened.
- Route intent divergences through the existing finding/decision/fix loop.
- Persist blessed intent so resumed sessions keep the reference frame.
- Prove the upgrade with the repo's TDD-for-skills method: a planted intent-mismatch
  defect the 1.0 skill misses and the 1.1 skill catches.

## Non-goals

- No acceptance-test generation, no spec authoring for the user.
- No new phases, files, or orchestration changes to the skill.
- No change to the adversarial-verification option or resolution vocabulary.

## Design decisions (locked)

| Decision | Choice |
|---|---|
| Intent source | **Blessed at sign-off** — the discovery inventory's per-flow goal + steps are confirmed/corrected by the user as intended behavior at the existing completeness gate. |
| Intent precedence | User statements > spec/PRD/docs > agent-inferred goal. On spec-only projects, the documented flow is the "actual behavior" and the user confirms the doc matches intent. |
| Walkthrough visibility | **Always shown, compact** — every per-flow review opens with a 3–6 step trace of actual behavior (`file:line` refs) and an explicit intent verdict, even when it matches. |
| Divergence handling | Divergences become ordinary findings with new dimension key `intent`, resolved via the existing fix / accept / defer / not-real loop. |
| Living intent | If the user prefers the built behavior, resolution is `accepted` and the tracker's `Intended:` line is updated; the change is logged under Decisions. |
| Opt-out per flow | User may adopt current behavior as intent ("whatever it does is fine") — recorded in Decisions; intent findings for that flow are then vacuous. |
| Persistence | Blessed intent is written to `pair-vibing/flows.md` as an `Intended:` field per flow. |
| Versioning | `plugin.json` bumps 1.0.0 → 1.1.0 (version lives only in plugin.json per the 2026-07-02 packaging fix). |

## Component changes

### 1. Intent capture — `references/flow-discovery.md` + SKILL.md Phase 1

- Discovery subagents already return `name`, `entry_point`, `goal`, `steps`, `locations`;
  no change to the dispatch contract.
- The **Merge & sign-off** step gains intent blessing: when presenting the merged
  inventory, ask the user to confirm or correct each flow's goal + key steps **as their
  intended behavior**, explicitly inviting rules code cannot show (confirmations,
  ordering, defaults, where the user should land). Wording to include: *"This is the
  intent the review will verify each flow against."*
- SKILL.md Phase 1 writes the confirmed inventory to the tracker **including an
  `Intended:` line per flow** (see §3).

### 2. Per-flow review — SKILL.md Phase 2

- The deep-trace subagent's return contract becomes three parts:
  1. **Walkthrough** — what the flow actually does today: 3–6 numbered steps with
     `file:line` evidence (spec sections on spec-only projects).
  2. **Intent verdict** — `matches` or `diverges`, naming each divergence against the
     flow's `Intended:` line.
  3. **Findings** — the rubric findings as today; each divergence from (2) appears as a
     finding with dimension `intent`.
- The review presents walkthrough + verdict **first, every flow**, then findings.
- The flow_loop dot diagram updates two node labels (edges unchanged):
  - `"Deep-trace subagent (rubric findings)"` → `"Deep-trace subagent (walkthrough + intent verdict + findings)"`
  - `"Present findings + recommendations"` → `"Present walkthrough + intent verdict, then findings"`
- Phase 0 (resume) gains one sentence: if an existing tracker has no `Intended:` fields
  (pre-1.1), offer to bless intent for the remaining flows before continuing.

### 3. Tracker — `references/tracker-template.md`

- Per-flow header gains, directly after **Goal:**
  `**Intended:** <blessed behavior — goal + key expectations the user confirmed>`
- Dimension keys line becomes: `intent` / `mechanics` / `edge` / `gaps` / `ux`.
- The example Findings table gains an intent row (e.g. *"Redirects to /home after
  signup; user intended onboarding wizard first — `signup.tsx:61` — redirect to
  /onboarding — fixed"*), with a matching entry under **Changes made**.

### 4. Rubric — `references/review-rubric.md`

- New **first** dimension: **1. Intent match — does the flow do what the user intended?**
  Checks: behavior matches the blessed goal/steps; stated rules honored (ordering,
  confirmations, limits, defaults, copy where specified); no silent extra behavior the
  user didn't ask for; the outcome lands where the user intended.
- Existing four dimensions renumber 2–5; their keys (`mechanics`, `edge`, `gaps`, `ux`)
  are unchanged.
- Intro line updates from "all four dimensions" to "all five dimensions".
- Severity mapping for intent findings: core outcome wrong → **blocker**; a stated rule
  or step violated but core outcome right → **major**; cosmetic divergence from stated
  intent → **minor**.
- Tracker dimension keys section adds `intent` (Intent match).

### 5. Descriptions, README, manifests

- **SKILL.md frontmatter description** (stays < 1024 chars): add "verifying each flow
  does what the user intended and asked for" and trigger phrasing like
  "check the flows match what I wanted/meant".
- **SKILL.md Overview/core principle:** "one flow at a time, verified against what you
  intended, evidence over hand-waving, no fix without your go-ahead."
- **When to Use** gains: confirming what was built matches what was asked for — not just
  that it runs.
- **Common mistakes / Red flags** gain: reviewing defects without confirming intent;
  *"The flow works, moving on" — works ≠ what the user wanted.*
- **README.md:** problem statement and What-it-does reframe around both halves of done;
  rubric described as five dimensions with intent first; How-it-was-built gains the P8
  RED/GREEN result (see §6).
- **plugin.json / marketplace.json descriptions:** "…verifying each flow matches what
  you intended, plus mechanics, edge cases, dead ends, and UX…". plugin.json version
  → 1.1.0.

### 6. Test — intent-mismatch defect P8 (TDD-for-skills)

> **Amended 2026-07-02:** the original design planted the ordering claim in the fixture
> README. The RED run caught it — a doc-stated behavior becomes the flow's *goal* at
> sign-off, and even the 1.0 skill checks flows against their stated goals (it was
> flagged as a mechanics finding). P8 is redesigned as **unwritten user intent**, which
> is the gap this feature actually fills.

- **Define (no file plant):** the fixture stays byte-identical to its v1.0 state; no
  document mentions ordering. P8 lives in the simulated user's head: their intended
  View-notes behavior is *"newest note first"*, which they reveal **only if asked** for
  intended behavior. Ground truth: the code renders insertion order (oldest first) via
  `server.js:15` (push), `server.js:10` (returned as-is), `app.js:6-13` (in-order render).
  Nothing is broken; nothing is written down — a pure divergence from unwritten intent.
- **RED:** dispatch a reviewer subagent with the current 1.0 skill content against the
  fixture. The simulated user approves the inventory as-is and answers intent questions
  only when the run can QUOTE, verbatim with file attribution, a skill line that
  explicitly mandates asking the user to confirm or correct each flow's intended
  behavior (quote-gated — presenting flow goals at sign-off does not qualify; 1.0 has
  no qualifying line, so the preference never enters the run). Pass criterion for RED
  is solely that P8 is **not** surfaced. P1–P7 coverage by the 1.0 skill is already evidenced in
  `with-skill-notes.md` and is not re-graded here.
- **GREEN:** identical protocol with the 1.1 skill content. Expected: the sign-off
  elicits "newest note first"; P8 surfaced as an `intent` finding with evidence (blessed
  intent vs `app.js`/`server.js` behavior), and P1–P7 still surfaced.
- **Record:** both runs in a new `test-fixtures/intent-notes.md` (ground-truth table for
  P8 + run outcomes). Existing `baseline-notes.md` / `with-skill-notes.md` remain
  untouched as historical 1.0 evidence.

### 7. Unchanged invariants

One flow at a time; user decides every finding; subagent orchestration with graceful
inline degradation; resolution vocabulary (`open`/`fixed`/`accepted`/`deferred`/
`not-real`); adversarial-verification option; tracker status vocabulary.

## Success criteria

1. GREEN run surfaces P8 tagged `intent` with concrete evidence, and P1–P7 are still
   surfaced (no regression).
2. RED run (1.0 skill) documented missing P8 before the skill changes land.
3. `SKILL.md` frontmatter parses; description under 1024 chars; all cross-references
   between SKILL.md and references resolve.
4. `intent` dimension key consistent across rubric, tracker template, and SKILL.md.
5. `plugin.json` at 1.1.0; manifests parse; fixture README still reads as an innocent
   app README.
