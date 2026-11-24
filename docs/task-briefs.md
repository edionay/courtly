# Courtly implementation and review briefs

Use these briefs with [execution-plan.md](execution-plan.md). They are sufficient with the referenced repository specifications in a fresh chat; do not depend on earlier conversation. No application task is started merely by writing this document.

## Required context for either role

Read root AGENTS.md and PRODUCT.md; docs/challenge.md, docs/decisions.md, docs/execution-plan.md, docs/architecture.md, docs/api-contracts.md, docs/ui-flows.md, docs/wireframes/README.md and the relevant ADR. File ownership, dependencies, and acceptance for each task are D1–D6 in execution-plan.md. The configured roles programador/revisor use Luna; verify availability before dispatch, never silently substitute.

All code/UI/docs are English. Feature-only lowercase kebab-case branches, Google-style type: imperative subject without scope parentheses, no AI/agent attribution/co-author trailers. No direct main commits except the already-completed initial-base exception; no agent merges or challenge submission. The candidate authors the root README. Preserve other workers' and candidate changes; you are not alone in the repository.

## Applicable-rule gate

Before implementation handoff and review completion, derive criteria from the current user request, AGENTS.md, and relevant specifications. A newly emphasized issue does not replace the other applicable rules. Keep this proportional to the delivery; do not audit unrelated legacy or implement optional features to fill a checklist.

Record a concise status and evidence for each applicable group:

- Scope and feature acceptance: mandatory challenge requirements, assigned delivery, and excluded/deferred work.
- Architecture and dependency direction: repositories, services, framework adapters, presenters, and frontend presentation boundaries as applicable.
- API/business/security contracts: public fields, errors, roles/ownership, time/money rules, and authoritative validations affected by the diff.
- Readability and comments: self-explanatory code, minimal comments, no unnecessary layers or repeated narrative. Inspect changed JSDoc independently from API documentation completeness.
- Documentation: generated Swagger schemas match explicit request/response models, auth/status and concise typed errors; no descriptive JSDoc or hand-authored @Example/@example payloads solely for Swagger. Detailed examples and business rules remain current in api-contracts.md. Apply the model-driven policy in architecture.md, not the superseded rich-metadata requirement.
- Verification: required focused checks actually executed, results, and explicit limitations; identify another delivery's checks as not applicable rather than claiming them passed.
- Delivery workflow: feature branch, allowed file ownership, commit/PR conventions, candidate README ownership, and user-only merge.

Use verified, not applicable with reason, or pending with limitation. Cite relevant files/symbols or executed commands. Do not manufacture evidence or declare general conformance from a passing test suite or partial checklist. The programmer self-checks and reviewer independently checks; the orchestrator verifies the review covers material applicable groups before calling the PR ready.

## Programmer dispatch template

Implement only delivery <D1–D6 and title> from docs/execution-plan.md on branch <approved feature name>, starting from merged main after <dependency> is merged by the user.

You own <files/modules listed for that delivery>. Other work may exist; do not revert edits or sweep unrelated drafts into your commit. Apply the configured programming-practices guidance in proportion to this small challenge. Read the required context and delivery acceptance before editing. Consult challenge.md before assumptions. Product edge cases outside the approved behavior require discussion; routine compatible stable dependency pins are delegated.

Keep backend controller/service/repository/presenter boundaries and frontend container/hook/API/HTTP/presentation boundaries. Repository contracts belong in <feature>Repository.ts, implemented by Prisma<Feature>Repository in prisma<Feature>Repository.ts; services/adapters depend on those interfaces, not service-local Store definitions. Use required interface constructor/factory arguments and simple test doubles. Assemble concrete dependencies manually in backend/src/dependencies.ts, with acyclic imports; controllers and the tsoa hook consume composed services/authentication. Do not keep default Prisma wiring in services/adapters. No DI container or unused repositories. Use typed tsoa contracts, never hand-edit generated artifacts. Preserve DB overlap protection in migrations and correct error normalization with the historical D3.3a learning exception preserved in migration history. D3.3a and D3.3b are now merged: preserve the restored named exclusion constraint, narrow database-error mapping and real race proof of one success/one conflict/one stored row. Do not silently clean application data or treat the old two-success demonstration as final concurrency acceptance. D3.3b also permits the explicitly approved one-time INSERT retry after observed P2034/40P01 rollback; see decisions.md. Keep real simultaneous inserts in tests, maximum two attempts, no generic/network/client retries, and classify only the named exclusion violation as BOOKING_CONFLICT. Do not introduce optional features, generic CRUD abstractions, full DDD, another BFF, extra authentication flows, or automated frontend tests.

Before opening the PR, inspect changed imports and external access against the approved architecture, including framework/authentication adapters. Trace login or another affected request end-to-end and report file/symbol evidence that services do not import transport adapters and persistence goes through feature repositories. Connection lifecycle, migrations/seed and database-test setup are justified infrastructure exceptions. Do not add source-text tests or generic abstractions just for this review.

Implement, regenerate, typecheck/build, and run only relevant focused checks. Prefer direct HTTP requests (curl or small scripts) for backend scenarios, checking statuses/payloads and the served OpenAPI. Confirm /api/docs availability without browser automation; Swagger UI/Try it out is not required. Use browser/manual/Storybook checks for actual frontend interaction/rendering/accessibility, and follow the delivery's Compose acceptance. Distinguish commands actually executed from planned or unavailable checks, and surface material blockers. Unit tests mock feature repositories; concurrency tests require real migrated PostgreSQL. Test setup must target courtly_test, never application data.

Use the GitHub CLI (gh) for PR operations; do not use the browser interface as an authentication/tool fallback. Report CLI blockers to the orchestrator for resolution in the available execution context.

Commit coherent work with the required format, push the feature branch, and open a PR with concrete behavior, specification references, actual validation and remaining limitations. Do not merge. Return PR URL, commit, changed ownership scope, checks/results, seed/URL information where relevant, and actionable handoff notes. If any requirement cannot be met, state it rather than marking the delivery complete.

## Reviewer dispatch template

Review <actual PR URL> for delivery <D1–D6> against its actual diff and the above repository context. Read-only role: do not modify files, create implementation commits, or merge. Follow configured review practices. The developer's summary is evidence to check, not a substitute for diff inspection.

Focus on regressions, correctness, scope and meaningful verification. Check API roles/ownership and error codes, actual contract fields and prohibited fields, timezone/absolute timestamps, persisted cent totals, database exclusion migration and observed error mapping, inclusive cancellation timing, history preservation and non-destructive initialization. Inspect applicable native accessibility, authentication navigation, explicit dialog actions, no mutation auto-retry, and separation allowing Storybook props/fixtures. Do not request a frontend automated suite or optional challenge bonuses.

Check version pins/peer requirements and unresolved tooling findings in D1, real PostgreSQL concurrency evidence in D3, and Swagger/docs changes in any API PR. Check the user-authored README requirement in final delivery without generating its content. Report only concrete actionable findings with severity and file/line evidence, and note missing required validation. Avoid style-only churn or speculative extra edge cases.

Explicitly check architecture as well as runtime behavior. Inspect imports/direct database calls in all changed paths, including framework adapters, and trace an affected request flow. In the report, identify the committed head and give file/symbol or command evidence for applicable contract, architecture and validation criteria; distinguish verified, not verified and not applicable. An objective boundary violation is a required project-convention finding even if endpoints work. Do not declare complete review while an explicit architecture criterion remains uninspected.

Return findings, required rechecks, and whether delivery acceptance is met. Route fixes back through the orchestrator to programador. Re-review changed diff after fixes. Only the user merges; do not post messages to third parties or request external reviewers without authorization.

## Per-delivery ownership reminder

- D1 application-foundation: root tooling/compose/lockfile, backend database/bootstrap, minimal frontend/Storybook bootstrap. No product flow work.
- D2 authentication-and-courts: backend auth/courts/errors/contracts and focused checks.
- D3.1–D3.6: separate PRs for weekly availability, preview, creation, own list, cancellation and daily report, in the execution-plan.md order. Scope ownership and mandatory tests to the authorized subdelivery; wait for user merge before the next. Creation is split into D3.3a (intentional race demonstration) and D3.3b (final concurrency guarantee after approval). Cancellation boundary tests belong to cancellation; future-delivery tests are not acceptance for an earlier PR.
- D4 frontend-foundation: frontend shell/auth/HTTP/court browsing/presentation/stories/tokens.
- D5 booking-interface: frontend availability/review/own bookings/cancellation and stories/manual evidence.
- D6 court-administration: frontend admin forms/report, final minimal fixes/evidence, candidate README review/handoff.

See execution-plan.md for full acceptance criteria. A dependency is satisfied by the user's merge, not merely by another agent reporting completion.
