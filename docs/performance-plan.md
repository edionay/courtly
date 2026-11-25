# Booking performance exercise

## Scope and authority

The user approved the optional performance bonus on November 25, 2026, on the separate `booking-performance` branch. This supersedes the earlier exclusion of all bonuses for this exercise only. The challenge permits at most one bonus and asks for more than 10,000 seeded bookings plus measured availability and administrator day-view query performance. Realtime updates and waitlists remain excluded.

This document is the self-contained specification and execution plan. Read `challenge.md`, `api-contracts.md`, `architecture.md`, and `AGENTS.md` for existing rules. Preserve all API contracts, authorization, facility timezone semantics, cancellation rules, and the `bookings_no_confirmed_overlap` database constraint. The candidate remains the README author. This planning delivery does not implement the benchmark or claim results.

## Questions and hypotheses

- Does weekly availability read only the relevant court's overlapping confirmed bookings as total history grows?
- Does the daily report retrieve the selected day's bookings without scanning unrelated history?
- What portion of endpoint latency comes from SQL versus authentication, application processing, serialization, and transport?
- Do measured results justify a query or index change? Keeping the existing implementation is a valid outcome.

Current entry points are `backend/src/availability/prismaAvailabilityRepository.ts` (`findCourt`, `findConfirmedBookings`) and `backend/src/reports/prismaDailyBookingsRepository.ts` (`findFacilityTimezone`, `findBookingsBetween`). Inspect actual generated SQL, including Prisma relation queries; do not assume a single SQL statement or infer index use from schema definitions.

## Dataset specification

Create deterministic fixtures with stable identifiers and a recorded seed, anchored to an explicit calendar date supplied to the generator. Use the existing schema and migrations, America/Sao_Paulo local schedules converted to UTC, integer cents, and valid one/two-hour bookings. Retain database overlap enforcement during generation.

Use 20 active courts, two normal users and one administrator. Distribute records over enough days to avoid overlapping confirmed intervals. Include historical and future dates, confirmed and cancelled records, one/two-hour durations, and a documented busy day. Generate two sizes: 1,000 bookings for scale comparison and 12,000 bookings for the required exercise. Produce a manifest with exact counts by status, court and scenario date. The busy-day scenario should use comparable target-day occupancy at both sizes so added history is the principal variable; document any difference.

Required scenarios at each size:

1. Weekly availability for one busy court/week.
2. Daily administrator report for a busy day across courts.
3. Daily administrator report for an empty day.

For every scenario record the request URL, role, expected result count or slot distribution, and response bytes. Validate returned content before timing so a fast error or empty response cannot count as success.

## Isolation and tooling

Use a dedicated Compose project and volume, with application services pointing only to a benchmark database named `courtly_performance`. Do not reset, migrate, seed, or benchmark the user's application database or the integration database `courtly_test`. Create a separate benchmark migration command rather than relaxing the existing integration-test guard. Generator and cleanup commands must reject any other database name. Cleanup must target only the dedicated project/volume and require an explicit action.

Provide an additive Compose override or equivalent documented wrapper, leaving ordinary `docker compose up` unchanged. Use the pinned project runtime/dependencies, production builds, and a small Node/TypeScript runner rather than introducing a load-testing platform. Scripts may access Prisma as infrastructure tooling, like seeds and integration setup; production request flows retain repository boundaries. Expose one documented command for setup, generation, measurement, and cleanup once implementation establishes exact names. No runnable commands are claimed in this planning document.

## Measurement protocol

- Authenticate seeded accounts before timing; use a normal account for availability and admin for reports. Never write JWTs or passwords into evidence files.
- Run over the same local transport for every comparison. Record whether the frontend proxy is included; prefer direct API measurements to isolate backend work.
- For each scenario, perform 10 unmeasured warmups followed by 100 sequential requests, repeated in three rounds. Record raw timings, HTTP status, response bytes and failures. Fail the run on unexpected status/content.
- Report median and p95 per round using a documented nearest-rank percentile calculation. Do not average percentiles or present one run as a universal latency guarantee.
- Measure elapsed HTTP time with a monotonic clock. Do not call it database query duration or browser rendering time.
- Record commit SHA, dirty tracked-file state, UTC timestamp, dataset manifest, Node/PostgreSQL versions, build mode, Docker resource limits, machine/OS, concurrency, warmups and sample counts. Keep resource settings and background activity comparable.
- The baseline is a warmed-cache, single-client latency experiment, not a throughput or production-capacity test. Avoid OS cache flushing. State these limits explicitly.
- Run `ANALYZE` after generation and before each baseline/comparison. Capture actual SQL and parameters for affected reads, then `EXPLAIN (ANALYZE, BUFFERS)` for representative queries. Record actual/estimated rows, scan type, filtering, buffer activity, planning/execution time and query count. EXPLAIN timings are separate from HTTP samples.
- No arbitrary latency SLO is required by the challenge. Describe observed scaling and bottlenecks. A small dataset may legitimately favor a sequential scan.

## Incremental deliveries

### P1 — Reproducible dataset and isolated environment

Own benchmark setup/override, infrastructure scripts, fixture manifest and usage documentation. Verify the guard rejects other database names before connecting; exact 1,000/12,000 counts; stable generation; valid schedules and constraint retained. Inspect representative records and normal startup behavior. Do not introduce application optimization.

### P2 — Baseline runner and SQL evidence

Own runner, raw sample format and baseline report. Execute all scenarios at both sizes and capture query plans. Evidence must include commands actually executed, environment and provenance. Preserve raw samples and readable summaries under `docs/performance/`; use a small CSV/JSON format and text plans. Exclude credentials and bulky database dumps. Identify a concrete bottleneck, or record that no change is justified.

### P3 — Evidence-based change and demonstration

Only if P2 identifies a justified change, modify the smallest affected repository query or add an index through a versioned migration. Explain read benefit, storage/write overhead and rollback. Preserve the constraint and historical migrations. Compare unchanged 12,000-row data and identical scenarios before/after, including the migration/schema revision. If there is no justified change, this delivery documents the no-change decision and final evidence instead.

Run affected correctness tests, existing concurrency/cancellation/opening-hours coverage, typecheck and builds when application/schema code changes. Explain plans supplement correctness tests. Reviewer inspects actual diff and evidence; user merges each PR before the next dependent delivery. Use programador (Luna medium) and revisor according to AGENTS.md; confirm model availability, never silently substitute. Planning is complete before code execution begins.

## Acceptance and demonstration

The exercise is complete when another agent can reproduce setup from a clean isolated volume, generate more than 10,000 valid bookings, run both endpoint measurements, inspect SQL plans and understand the outcome without this chat. A result is acceptable without an optimization when supported by evidence. No benchmark infrastructure runs during normal application startup.

Prepare a five-to-seven-minute candidate demonstration:

1. State the workload and question: growing booking history while users browse availability and admins inspect a day.
2. Show the architecture path: HTTP controller → service → repository → Prisma → PostgreSQL; identify which costs HTTP and SQL measurements include.
3. Show the deterministic dataset manifest and prove the count exceeds 10,000.
4. Execute the documented runner and open the saved median/p95 results. Demonstrate correctness with one busy and one empty response.
5. Compare representative query plans and explain what the chosen scan/index actually does. Show before/after measurements if a change was warranted.
6. Explain the trade-off: indexes cost storage and writes; cache/distributed infrastructure require evidence and are outside this experiment. State single-client/warm-cache/local-machine limits.
7. Close with the conclusion supported by observations, not a claim that 12,000 rows proves production scalability.

Use static exported charts only if they clarify measured results: median/p95 by scenario and dataset size, plus before/after where applicable. Do not create fictional sample results. Record the final architectural rationale in a short ADR after measurement, including context, options, evidence, decision and consequences. This demonstrates an architectural process: define a quality concern, measure, choose a proportional intervention, and verify its consequences. It does not by itself claim proficiency or production readiness.
