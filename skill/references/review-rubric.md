# Review Rubric

Apply all four dimensions to each flow. For every issue, record: **severity**
(blocker / major / minor), **evidence** (`file:line` or spec section), and a
**concrete recommendation**. No vague notes.

## 1. Mechanics & wiring
Does each step actually work and connect?
- Every button / link / action wired to a real handler (no stub, no-op, or placeholder).
- Navigation targets exist and land on the right screen/state.
- Data actually persists and reloads; forms submit and save.
- State updates propagate to the UI (no stale views).
- API/DB calls hit real endpoints; both success AND failure paths are handled.
- No hardcoded/mock data standing in for the real thing.

## 2. Edge & error states
What happens off the happy path?
- Empty state (no data yet).
- Loading / pending state.
- Invalid input / validation errors surfaced to the user.
- Server error, network failure, timeout.
- Permission-denied / unauthenticated / session-expired.
- Not-found (bad id, deleted resource).
- Concurrent or duplicate actions (double-submit, race).
- Boundary values (0, empty string, max length, very large lists).
- Offline / partial connectivity (if relevant).

## 3. Gaps & dead ends
Can the flow always complete?
- Unhandled branches / conditions.
- TODO / FIXME / commented-out logic in the path.
- Flows that start but have no completion.
- Orphaned screens (reachable but lead nowhere) or unreachable screens.
- Missing back / cancel / undo / retry.
- No exit from an error state.

## 4. UX friction & clarity
Does the flow feel right to a real user?
- Feedback after every action (success/failure is visible).
- Confirmation before destructive/irreversible actions.
- Step count reasonable (no needless friction).
- Labels/copy unambiguous; the user knows what happens next.
- Progress indication for multi-step or long operations.
- Consistent with patterns used elsewhere in the app.

## Severity guide
- **Blocker** — the flow cannot be completed, or it loses/corrupts data.
- **Major** — works on the happy path but breaks on a common edge, or is badly confusing.
- **Minor** — polish, clarity, or rare-edge improvement.
