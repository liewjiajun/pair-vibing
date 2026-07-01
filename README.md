# pair-vibing

A [Claude Code](https://claude.com/claude-code) skill that pairs you with the agent to
review a project's **user flows one at a time** — catching the broken mechanics, missing
edge cases, dead-end flows, and rough UX that slip through when a project is built fast.

## The problem

When you get an AI to build a project quickly ("vibe coding"), it generates a lot of code —
but nobody ever walks each user flow to confirm the mechanics actually work and the edges are
handled. Buttons that call nothing, error states that don't exist, flows that start but can't
finish. It looks done; it isn't.

## What it does

pair-vibing runs a structured, meticulous, flow-by-flow review:

1. **Discover** every user flow (reads the code if present, otherwise the spec/PRD/docs) and
   presents the inventory for your sign-off — the *completeness gate*, so nothing is silently
   skipped.
2. **Review** each flow, one at a time, against a four-dimension rubric:
   - **Mechanics & wiring** — does each step actually work and connect?
   - **Edge & error states** — empty, loading, invalid, failure, permission, offline…
   - **Gaps & dead ends** — unhandled branches, TODOs, flows that can't complete.
   - **UX friction & clarity** — feedback, confirmations, step count, unclear labels.
3. **Discuss & fix** — you decide each finding (fix / accept / defer), then the agent applies
   the agreed changes.
4. **Track** progress in a resumable `pair-vibing/flows.md`, so you can pick up across sessions.

It's subagent-orchestrated (fans out for discovery and deep per-flow analysis), degrades
gracefully on small projects, and can optionally run adversarial verification to kill false
positives. You stay in control — nothing is changed without your per-flow go-ahead.

## Install

### Option 1 — as a plugin (recommended)

In Claude Code, add this repo as a plugin marketplace, then install:

```
/plugin marketplace add liewjiajun/pair-vibing
/plugin install pair-vibing@liewjiajun
```

No file copying, and `/plugin marketplace update liewjiajun` pulls future updates.

### Option 2 — copy into your skills folder (no plugin system)

```bash
git clone https://github.com/liewjiajun/pair-vibing.git
cd pair-vibing
```

**Windows (PowerShell):**
```powershell
$src  = "plugin\skills\pair-vibing"
$dest = "$env:USERPROFILE\.claude\skills\pair-vibing"
New-Item -ItemType Directory -Force -Path $dest, "$dest\references" | Out-Null
Copy-Item "$src\SKILL.md" $dest -Force
Copy-Item "$src\references\*" "$dest\references" -Force
```

**macOS / Linux:**
```bash
mkdir -p ~/.claude/skills/pair-vibing/references
cp plugin/skills/pair-vibing/SKILL.md ~/.claude/skills/pair-vibing/
cp plugin/skills/pair-vibing/references/* ~/.claude/skills/pair-vibing/references/
```

The skill loads at session start.

## Use

If you installed the **plugin**, invoke it explicitly with:

```
/pair-vibing:pair-vibing
```

If you **copied it into your skills folder**, use `/pair-vibing`. Either way, you can just
ask Claude to **"pair vibe"** or **"vibe check the flows"** — the skill triggers on intent.

## Repo layout

```
.claude-plugin/
  marketplace.json          makes this repo an installable plugin marketplace
plugin/                     the installable plugin
  .claude-plugin/
    plugin.json             plugin manifest
  skills/
    pair-vibing/            the skill itself
      SKILL.md
      references/
        review-rubric.md    the four-dimension rubric
        flow-discovery.md   how flows are discovered
        tracker-template.md the flows.md tracker format
docs/superpowers/           design spec + implementation plan
test-fixtures/notes-app/    a deliberately-broken app used to test the skill
test-fixtures/*-notes.md    RED (no skill) vs GREEN (with skill) test evidence
```

## How it was built

Test-first. A deliberately-broken sample app is the test bed: a baseline review **without** the
skill caught 5 of 7 planted defects with no structure, while the same review **with** the skill
caught all 7 — organized into a per-flow inventory with severity and `file:line` evidence. See
`test-fixtures/baseline-notes.md` (RED) and `test-fixtures/with-skill-notes.md` (GREEN).
