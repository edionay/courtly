# Frontend start/resume prompt

Copy the following prompt into another agent/tool with the Courtly checkout. Replace only the checkout path if different. It authorizes the next frontend milestone after its dependencies have actually been merged, not all remaining milestones at once.

```text
Work in the Courtly repository (this checkout; locally /Users/edionay/Dev/courtly).

First inspect git status and the actual PR #11 and #12 merge states with gh. Locate
the documentation on merged main or the existing interface-design branch
without overwriting unrelated work. If the docs are absent from an older
main, read the PR branch before planning; do not invent missing context.

Read AGENTS.md, DESIGN.md, docs/frontend-plan.md, docs/design-system.md,
docs/frontend-handoff.md, docs/execution-plan.md, docs/task-briefs.md,
docs/challenge.md, docs/decisions.md, docs/architecture.md,
docs/api-contracts.md and docs/ui-flows.md. Inspect the local approved
mockups through docs/mockups/aguinha/REVIEW.md. These files are the task
context; do not require previous chats, a running gallery server or Aguinha.

First inspect git status, current branch and actual PR/merge state using gh.
Preserve unrelated local files and other workers' edits. PR #11 delivers the
accepted visual system: if not merged, report that dependency and continue
only review/fixes on its branch. Do not start frontend application work from
an older main or merge it yourself.

PR #12 contains the D4.1–D4.3 breakdown. If it is not merged, do not start
frontend implementation; report that planning dependency. Only the user
merges it.

After dependencies are merged, start or resume the first incomplete delivery:
D4.1 frontend-visual-foundation, D4.2 frontend-authentication, D4.3
court-browsing, D5 booking-interface, then D6 court-administration. Each is a
separate PR and the user's merge unlocks the next.
Implement ONLY the current milestone in one feature PR; wait for the user's
merge before the next. Resume an existing branch/PR rather than duplicating
work. Treat this prompt as authorization for that next eligible milestone.

Use React, strict TypeScript and existing Tailwind web tooling with Courtly's
local Aguinha-derived DS. Views are dumb props/callback components with
fixture stories; keep fetch, auth/session, and router hooks in integration
containers. Add a route only with the screen being implemented. No
Mantine/NativeWind/gluestack migration. Danger
actions have white backgrounds with red text and red outlines. Keep native
inputs and dialog.showModal(), exact API contracts, role enforcement,
sessionStorage reload, explicit auth-error navigation, no mutation retries,
and separate container/hooks/API versus props-only presentation.

Follow docs/frontend-plan.md for scope/ownership, same-origin Vite dev AND
preview proxy, local fonts/photos, sport fallback, routes, D4-D6 acceptance,
existing commands and isolated verification. Do not add frontend automated
tests; demonstrate states in Storybook and verify browser accessibility.
Do not implement optional features or modify the user's application DB.

Act as orchestrator and follow the configured programmer/reviewer workflow
in AGENTS.md. Verify Luna profiles; report missing availability instead of
silently substituting. Give workers the necessary specifications, ownership
and acceptance criteria and tell them they are not alone. Independently
review the actual committed diff, route fixes back, then recheck.

Write code/UI/docs in English; use a feature-only kebab-case branch, commits
like feat: add frontend authentication (no parenthesized scope or AI
attribution), and gh CLI for the PR. Only the user merges and writes the
root README. Never submit the challenge. Finish with the PR URL, commit,
actual checks/screenshots, limitations and next dependency.
```

The prompt deliberately verifies live state instead of assuming D4 is always next. It also preserves the current model/workflow constraint across coding tools; report any unavailable runtime capability before dependent implementation.
