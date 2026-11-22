# Courtly implementation and review briefs

Use these briefs with [execution-plan.md](execution-plan.md). They are sufficient with the referenced repository specifications in a fresh chat; do not depend on earlier conversation. No application task is started merely by writing this document.

## Required context for either role

Read root AGENTS.md and PRODUCT.md; docs/challenge.md, docs/decisions.md, docs/execution-plan.md, docs/architecture.md, docs/api-contracts.md, docs/ui-flows.md, docs/wireframes/README.md and the relevant ADR. File ownership, dependencies, and acceptance for each task are D1–D6 in execution-plan.md. The configured roles programador/revisor use Luna; verify availability before dispatch, never silently substitute.

All code/UI/docs are English. Feature-only lowercase kebab-case branches, Google-style type: imperative subject without scope parentheses, no AI/agent attribution/co-author trailers. No direct main commits except the already-completed initial-base exception; no agent merges or challenge submission. The candidate authors the root README. Preserve other workers' and candidate changes; you are not alone in the repository.

## Programmer dispatch template

Implement only delivery <D1–D6 and title> from docs/execution-plan.md on branch <approved feature name>, starting from merged main after <dependency> is merged by the user.

You own <files/modules listed for that delivery>. Other work may exist; do not revert edits or sweep unrelated drafts into your commit. Apply the configured programming-practices guidance in proportion to this small challenge. Read the required context and delivery acceptance before editing. Consult challenge.md before assumptions. Product edge cases outside the approved behavior require discussion; routine compatible stable dependency pins are delegated.

Keep backend controller/service/repository/presenter boundaries and frontend container/hook/API/HTTP/presentation boundaries. Use typed tsoa contracts, never hand-edit generated artifacts. Preserve DB overlap protection in migrations and correct error normalization. Do not introduce optional features, generic CRUD abstractions, full DDD, another BFF, extra authentication flows, or automated frontend tests.

Implement, regenerate, typecheck/build, and run only relevant focused checks. Follow the delivery's Swagger/manual/Storybook/Compose acceptance. Distinguish commands actually executed from planned or unavailable checks, and surface material blockers. Unit tests mock feature repositories; concurrency tests require real migrated PostgreSQL. Test setup must target courtly_test, never application data.

Commit coherent work with the required format, push the feature branch, and open a PR with concrete behavior, specification references, actual validation and remaining limitations. Do not merge. Return PR URL, commit, changed ownership scope, checks/results, seed/URL information where relevant, and actionable handoff notes. If any requirement cannot be met, state it rather than marking the delivery complete.

## Reviewer dispatch template

Review <actual PR URL> for delivery <D1–D6> against its actual diff and the above repository context. Read-only role: do not modify files, create implementation commits, or merge. Follow configured review practices. The developer's summary is evidence to check, not a substitute for diff inspection.

Focus on regressions, correctness, scope and meaningful verification. Check API roles/ownership and error codes, actual contract fields and prohibited fields, timezone/absolute timestamps, persisted cent totals, database exclusion migration and observed error mapping, inclusive cancellation timing, history preservation and non-destructive initialization. Inspect applicable native accessibility, authentication navigation, explicit dialog actions, no mutation auto-retry, and separation allowing Storybook props/fixtures. Do not request a frontend automated suite or optional challenge bonuses.

Check version pins/peer requirements and unresolved tooling findings in D1, real PostgreSQL concurrency evidence in D3, and Swagger/docs changes in any API PR. Check the user-authored README requirement in final delivery without generating its content. Report only concrete actionable findings with severity and file/line evidence, and note missing required validation. Avoid style-only churn or speculative extra edge cases.

Return findings, required rechecks, and whether delivery acceptance is met. Route fixes back through the orchestrator to programador. Re-review changed diff after fixes. Only the user merges; do not post messages to third parties or request external reviewers without authorization.

## Per-delivery ownership reminder

- D1 application-foundation: root tooling/compose/lockfile, backend database/bootstrap, minimal frontend/Storybook bootstrap. No product flow work.
- D2 authentication-and-courts: backend auth/courts/errors/contracts and focused checks.
- D3 booking-api: backend availability/bookings/report and mandatory real-DB/business-rule verification.
- D4 frontend-foundation: frontend shell/auth/HTTP/court browsing/presentation/stories/tokens.
- D5 booking-interface: frontend availability/review/own bookings/cancellation and stories/manual evidence.
- D6 court-administration: frontend admin forms/report, final minimal fixes/evidence, candidate README review/handoff.

See execution-plan.md for full acceptance criteria. A dependency is satisfied by the user's merge, not merely by another agent reporting completion.
