# pair-vibing

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-orange)

**You vibe-coded an app. It looks done. Is it?**

pair-vibing is a [Claude Code](https://claude.com/claude-code) skill that sits you down
with the agent and walks your app's user flows **one at a time** — checking that each flow
actually works, *and* that it does what you meant. You approve every fix before it happens.

## The problem

AI-built projects fail in two ways.

The first is the obvious one: **the code doesn't work.** A Save button wired to nothing.
An error screen that doesn't exist. A signup flow that starts but can't finish. The demo
looked great because the demo only walked the happy path.

The second is sneakier: **the code works — it's just not what you asked for.** Checkout
completes, but skips the confirmation step you wanted. The list loads, but sorted the wrong
way. Nothing crashes, so nothing gets flagged, and it quietly ships wrong.

Nobody catches either kind, because nobody ever sits down and walks every flow, end to end,
like a real user. That's the whole job of this skill.

## What a session looks like

Say Claude built you a little recipe app last week. You open Claude Code and type
`pair vibe this`. Here's the shape of what happens (condensed):

```text
Claude:  I mapped your project. Here's every user flow I found:

         | # | Flow            | Priority |
         |---|-----------------|----------|
         | 1 | Add a recipe    | high     |
         | 2 | Search recipes  | medium   |
         | 3 | Delete a recipe | medium   |

         Anything missing, or anything that shouldn't be here?
         And for each one — what should it do? I'll hold you to it.

You:     That's all of them. Delete should ask for confirmation first —
         I don't want one misclick nuking a recipe.

Claude:  Noted as intended behavior. Starting with Flow 3: Delete a recipe.

         What it ACTUALLY does today (traced from the code):
         1. Click the trash icon on a recipe card   (app.js:38)
         2. Sends DELETE /recipes/:id immediately   (app.js:41)
         3. Card disappears from the list           (app.js:43)

         Intent check: DIVERGES — no confirmation step. You asked for one.

         Findings for this flow:

         | # | Severity | Dimension | Finding                                   | Evidence  |
         |---|----------|-----------|-------------------------------------------|-----------|
         | 1 | major    | intent    | Deletes on first click; you wanted        | app.js:41 |
         |   |          |           | a confirmation first                      |           |
         | 2 | major    | edge      | If the server call fails, the card        | app.js:43 |
         |   |          |           | vanishes anyway — recipe looks deleted    |           |
         |   |          |           | but isn't                                 |           |
         | 3 | minor    | ux        | No feedback after deleting (no toast,     | app.js:43 |
         |   |          |           | no undo)                                  |           |

         Your call on each: fix / accept / defer?

You:     Fix 1 and 2. Defer 3.

Claude:  Done. Added a confirm dialog before the DELETE, and the card now only
         disappears after the server says 200 — errors show a retry message.
         Verified both. Tracker updated. Flow 3 is done: 2 fixed, 1 deferred.

         Next up, Flow 1: Add a recipe...
```

That's the loop: **show you what the flow really does → check it against what you wanted →
list what's wrong with proof → you decide → it fixes → next flow.** No flow gets skipped,
no fix happens without your OK.

## What it checks on every flow

Each flow is scored against five things, in plain terms:

| Dimension | The question it answers | Real examples it catches |
|-----------|------------------------|--------------------------|
| **Intent match** | Does it do what you *meant*? | Works perfectly, but sorts oldest-first when you wanted newest-first. Redirects home when you wanted an onboarding step. |
| **Mechanics & wiring** | Does each step actually work? | A button that calls a function that doesn't exist. A form that submits to a route the server never defined. |
| **Edge & error states** | What happens off the happy path? | Empty list shows a blank void. Failed request fails silently. Double-click creates two records. |
| **Gaps & dead ends** | Can the flow always finish? | A `TODO` sitting in the middle of checkout. An error screen with no way back. |
| **UX friction & clarity** | Does it feel right to a real person? | Deleting with no confirmation. Saving with no feedback. Labels nobody understands. |

Every finding comes with a severity (blocker / major / minor), a `file:line` you can click,
and a concrete recommendation — never "this feels off."

## Install

### Option 1 — as a plugin (recommended)

In Claude Code:

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

Just ask, in your own words:

```
pair vibe this
vibe check the flows
did this app end up doing what I asked for?
walk every user flow and make sure nothing's broken
```

Or invoke it explicitly: `/pair-vibing:pair-vibing` if you installed the plugin,
`/pair-vibing` if you copied the files.

## How the review works, step by step

1. **It maps every flow first.** Claude fans out and reads your whole project — routes,
   screens, handlers, docs — and comes back with a complete list of user flows. Not
   functions, *journeys*: "sign up", "add a recipe", "check out".
2. **You approve the list and say what each flow should do.** Add flows it missed, kill
   ones you never wanted, and state the rules code can't show — "confirm before delete",
   "newest first", "land on the dashboard after signup". This is the step that catches
   *works-but-wrong*: your stated intent becomes the yardstick every flow is measured
   against. Nothing gets reviewed until you've confirmed the list is complete.
3. **It reviews one flow at a time.** Full attention per flow — never a batch skim. Each
   review opens with the walkthrough ("here's what this flow actually does today") and an
   intent verdict, then the findings with evidence.
4. **You decide every finding.** Fix it, accept it as-is, defer it for later, or call it
   not-real. Only the fixes you approve get applied — and then verified.
5. **Everything lands in a tracker file.** Progress survives the session (next section).

## The tracker: close your laptop whenever

Reviews of real apps don't finish in one sitting. pair-vibing writes `pair-vibing/flows.md`
into your project and keeps it updated — which flows are done, what each one was supposed
to do, every finding and every decision:

```markdown
# Pair Vibing — Flow Tracker

| # | Flow            | Priority | Status    |
|---|-----------------|----------|-----------|
| 1 | Add a recipe    | high     | done      |
| 2 | Search recipes  | medium   | pending   |
| 3 | Delete a recipe | medium   | done      |

## Flow 3: Delete a recipe — done
**Intended:** confirm before deleting; card removed only after the server confirms.
| # | Severity | Dimension | Finding                        | Resolution |
|---|----------|-----------|--------------------------------|------------|
| 1 | major    | intent    | Deleted on first click         | fixed      |
| 2 | major    | edge      | Vanished even when call failed | fixed      |
| 3 | minor    | ux        | No feedback / undo             | deferred   |
```

Come back tomorrow — or next month — say "pair vibe", and it picks up exactly where you
left off, with your intent for each flow still on record. No re-explaining, no re-deciding.

## No code yet? It works on specs too

If all you have is a PRD, a README, or a pile of design notes, pair-vibing reviews *that*:
it maps the flows your spec describes, has you confirm they're the flows you actually want,
and hunts for the same problems on paper — steps that can't connect, missing error states,
journeys with no ending — before you've paid to build them.

## You stay in control

- **Nothing changes without your go-ahead.** Every single finding waits for your decision.
- **The list is yours.** Reviewing starts only after you've confirmed the flow inventory —
  so nothing gets silently skipped, and nothing you didn't want gets polished.
- **Paranoid mode, if you want it.** Optionally, a second reviewer independently tries to
  *disprove* each finding before you ever see it — fewer false alarms, slightly slower.
- **Sized to the job.** On a big project it fans out multiple agents for discovery and
  per-flow deep dives; on a tiny one it just does the work inline. Same process either way.

## FAQ

**Is this only for AI-generated code?**
No. It's for any project built faster than it was verified — hackathon output, inherited
prototypes, that thing you wrote at 2am. AI code is just where it happens most.

**How is this different from asking Claude to "review my code"?**
A generic review skims everything and comments on style. pair-vibing walks *user flows*,
one at a time, against *your stated intent*, with a completeness list you sign off — so
"the delete flow silently does the wrong thing" can't hide behind "the code looks clean."

**Will it refactor my whole app?**
No. It's deliberately not a refactoring or performance tool. Scope is user-flow
correctness and completeness — does each flow work, and is it what you wanted.

**What does it cost to run?**
It's a free skill on top of your existing Claude Code session — no separate service,
no account, nothing to sign up for.

**Big project — won't this take forever?**
That's what one-flow-at-a-time plus the tracker is for. Do two flows today, five next
week; priority order is yours, and progress never resets.

## How it was built (and proven)

Test-first, on a deliberately broken notes app with defects planted on purpose:

- **v1.0:** a review *without* the skill caught 5 of 7 planted defects, as an unstructured
  wall of text. The same review *with* the skill caught **all 7**, organized per flow with
  severity and `file:line` evidence. Records: `test-fixtures/baseline-notes.md` and
  `test-fixtures/with-skill-notes.md`.
- **v1.1 (intent alignment):** an 8th defect was defined that no code review can see — the
  app works perfectly, but the user privately wanted notes newest-first and only says so
  *when asked*. The v1.0 skill, which never asks, missed it. The v1.1 skill asks for your
  intent at sign-off, so it caught the mismatch as an `intent` finding — with the original
  7 still caught. Records: `test-fixtures/intent-notes.md`.

That 8th defect is the reason this skill exists: **"it runs" and "it's right" are
different claims, and only one of them shows up in a stack trace.**

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
        review-rubric.md    the five-dimension rubric (intent first)
        flow-discovery.md   how flows are discovered
        tracker-template.md the flows.md tracker format
docs/superpowers/           design spec + implementation plan
test-fixtures/notes-app/    a deliberately-broken app used to test the skill
test-fixtures/*-notes.md    RED vs GREEN test evidence for each skill version
```

## License

MIT — see [LICENSE](LICENSE).
