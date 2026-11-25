# Performance measurement and no-change decision

Status: accepted; November 25, 2026.

## Context

The user selected the challenge's optional performance exercise as a separate project bonus. P4 measured weekly availability and busy/empty administrator day reports against deterministic 1,000- and 12,000-booking datasets. The evidence and limits are in [measurements.md](../performance/measurements.md).

## Decision

Keep the current availability and daily-report repository queries and database indexes. Do not add a `starts_at` index, rewrite the overlap query, or introduce caching in this exercise. The results show a query-plan concern for further growth, but do not establish that a change is warranted at the tested scale.

The confirmed-booking availability query uses `bookings_no_confirmed_overlap` to find rows for one court, then filters the requested time window. The busy-day report query scans the bookings table at both sizes: 140 of 12,000 rows were returned, with an `EXPLAIN` execution time of 0.552 ms. Its measured HTTP median across the three 12,000-row rounds was 5.31–5.54 ms. No user-facing latency target was approved, and the experiment is local, warm-cache, and single-VU.

The weekly responses had different slot mixes: 30 booked / 75 available at 1,000 rows and 66 booked / 39 available at 12,000. Those results do not support a pure history-size scaling conclusion. The empty-day plan also selected different scan paths at the two sizes.

## Alternatives

- Add a B-tree index on `starts_at` for the administrator day range. This could reduce the busy-day scan as history grows, while adding storage and write-maintenance cost. P4 did not measure an index variant or establish a current need.
- Rewrite availability overlap predicates to use a `tstzrange` overlap expression, potentially using more of the existing GiST index. The existing query's behavior and half-open boundary semantics are correct; P4 does not show an HTTP problem that justifies changing it.
- Add caching or external observability. Neither is justified by this local single-client experiment; caching would also introduce invalidation behavior outside the approved scope.

## Consequences

The application and schema remain unchanged. The busy-day report scans all booking history at the tested 12,000-row size; this is a known scaling consideration, not a demonstrated production bottleneck. The optional challenge bonus is satisfied by the seeded dataset and measured endpoint exercise; it does not require an optimization or a presentation artifact.

Revisit an index or query change if a representative expected workload, an agreed latency target, or production evidence shows the day report is a material bottleneck. Any future experiment should compare the same fixture and request workload before and after, include storage and write costs, use a versioned migration for schema changes, and preserve `bookings_no_confirmed_overlap`.

## Evidence

See [the P4 measurements and query plans](../performance/measurements.md), including the per-round medians/p95, actual SQL, relation reads, table scans, and warm-cache/single-VU limitations. This ADR records the decision; it does not add a competing performance contract.
