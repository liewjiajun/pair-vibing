---
name: pair-vibing
description: Use when reviewing or refining a project's user flows one at a time, verifying each flow does what the user intended and asked for, or auditing a fast or vibe-coded app for broken mechanics, missing edge cases, dead-end flows, or rough UX. Trigger when the user asks to "pair vibe", "vibe check" flows, check that flows match what they wanted or meant, or meticulously verify each user flow works end to end. Works on built code or a spec.
---

# Pair Vibing

## Overview

Fast-built ("vibe-coded") projects pile up code that no one ever walked through
flow by flow: buttons that call nothing, error states that don't exist, flows that
start but can't finish — and flows that run flawlessly yet do something the user
never asked for. **Pair vibing** pairs you with the user to review the project's
user flows **one at a time**, meticulously, verifying each flow both works and does
what the user intended, and fixing what's off as you go.

Core principle: **one flow at a time, verified against what the user intended,
evidence over hand-waving, no fix without the user's go-ahead.**

## When to Use

- The user says "pair vibe", "vibe check", "review the flows", or "check each user flow".
- A project was generated quickly and needs a careful walk-through of every flow.
- You need to confirm mechanics work, edges are handled, and nothing dead-ends.
- You want to confirm what was built matches what was asked for — not just that it runs.
- Works whether the project has code (read the code) or is only a spec (read the docs).

When NOT to use: broad refactoring, performance tuning, or writing a test suite —
this is about user-flow correctness and completeness, not general code quality.

## The Process

**Phase 0 — Orient & resume**
1. Detect what the project has: code, spec/docs, or both.
2. Ask the user whether to enable **adversarial verification** of findings (see Verification below).
3. Look for `pair-vibing/flows.md`. If it exists, summarize its status and ask where to
   resume; if it predates intent blessing (no `Intended:` lines), offer to bless intent
   for the remaining flows before continuing. If it does not exist, go to discovery.

**Phase 1 — Discover flows (fan out)**
Dispatch parallel subagents to map the project by area, then merge into one inventory.
REQUIRED: see `references/flow-discovery.md` for how to dispatch and what each returns.
**Present the merged inventory to the user for sign-off** — they add, remove, and
reprioritize, and **bless each flow's intent**: confirm or correct its goal and key
steps as the intended behavior (see `references/flow-discovery.md`). This is the
completeness gate: the user confirms the full set AND per-flow intent BEFORE any
refinement. Then write the inventory to `pair-vibing/flows.md` with every status
`pending` and an `Intended:` line per flow (use `references/tracker-template.md`).

**Phase 2 — Per-flow refinement loop**
For each flow, in the user's chosen order:

```dot
digraph flow_loop {
  "Deep-trace subagent (walkthrough + intent verdict + findings)" [shape=box];
  "Verify enabled?" [shape=diamond];
  "Verifier subagent (kill false positives)" [shape=box];
  "Present walkthrough + intent verdict, then findings" [shape=box];
  "User decides per finding" [shape=box];
  "Apply agreed fixes" [shape=box];
  "Verify the fix" [shape=box];
  "Update tracker" [shape=box];
  "More flows?" [shape=diamond];
  "Done" [shape=doublecircle];

  "Deep-trace subagent (walkthrough + intent verdict + findings)" -> "Verify enabled?";
  "Verify enabled?" -> "Verifier subagent (kill false positives)" [label="yes"];
  "Verify enabled?" -> "Present walkthrough + intent verdict, then findings" [label="no"];
  "Verifier subagent (kill false positives)" -> "Present walkthrough + intent verdict, then findings";
  "Present walkthrough + intent verdict, then findings" -> "User decides per finding";
  "User decides per finding" -> "Apply agreed fixes";
  "Apply agreed fixes" -> "Verify the fix";
  "Verify the fix" -> "Update tracker";
  "Update tracker" -> "More flows?";
  "More flows?" -> "Deep-trace subagent (walkthrough + intent verdict + findings)" [label="yes, next flow"];
  "More flows?" -> "Done" [label="no"];
}
```

The deep-trace subagent returns three parts for the single flow: (1) a **walkthrough**
— what the flow actually does today, 3–6 numbered steps with `file:line` evidence
(spec sections on spec-only projects); (2) an **intent verdict** — matches or diverges
from the flow's `Intended:` line, naming each divergence; (3) **findings** scored
against the rubric in `references/review-rubric.md`, each with severity + evidence +
a recommendation — every intent divergence appears as a finding with dimension
`intent`. Present the walkthrough and intent verdict FIRST, every flow, even when
intent matches; then the findings. The user decides each finding: fix / accept /
defer / not-real. If the user prefers the built behavior over their stated intent,
resolve that finding `accepted`, update the flow's `Intended:` line, and log the
change under Decisions. Apply only the agreed fixes, verify them, then update the
tracker. Do NOT batch flows — one flow, full attention.

**Phase 3 — Wrap**
Summarize flows reviewed / findings fixed / deferred / still pending. The tracker persists,
so a later session resumes from Phase 0.

## Verification option

In Phase 0, ask the user: "Enable adversarial verification of findings? It runs a second
subagent that tries to refute each finding — kills false positives, but is slower."
Respect their choice for the whole session. Only run the verifier subagent (Phase 2) if enabled.

## Subagent orchestration

- Discovery and per-flow deep-trace run as dispatched subagents (Task/Agent tool; or a
  workflow/orchestration tool for many flows, if your environment provides one).
- **Degrade gracefully:** for a tiny project, or when subagents aren't available, do the
  analysis inline. The process (inventory → per-flow rubric → discuss → fix → track) is unchanged.

## Common mistakes

- Skipping the completeness gate — refining flows before the user confirmed the inventory.
- Skipping the intent check — hunting defects in a flow whose behavior the user never confirmed.
- Batching flows — reviewing several at once instead of one at a time loses depth.
- Fixing without the user's go-ahead — every change is agreed per finding first.
- Vague findings — every finding needs concrete evidence (`file:line`) and a recommendation.
- Forgetting to update the tracker — the next session then can't resume.

## Red flags — STOP

- "I'll just review all the flows together." → One at a time.
- "The flow works, moving on." → Works ≠ what the user wanted. Check the intent verdict first.
- "This finding is probably an issue" (no evidence). → Trace it, cite `file:line`, or drop it.
- "I'll fix these obvious ones without asking." → The user decides every fix.
- "The inventory looks complete, I'll start" (no user sign-off). → Get the completeness gate first.
