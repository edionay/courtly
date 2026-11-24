# PostgreSQL, Prisma, and booking integrity

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

The system must prevent overlapping reservations under simultaneous requests and preserve history. MongoDB is familiar to the candidate but is not required by the brief.

## Decision

Use PostgreSQL 17.12 and Prisma 7.10.1 with mapped snake_case storage/camelCase TypeScript. Store booking intervals and contracted integer-cent totals. Version btree_gist and the confirmed-only GiST exclusion constraint on court and half-open timestamptz range. Repositories isolate queries; services still validate business rules.

## Alternatives

MongoDB/Mongoose with carefully designed atomic writes was considered. Application-only availability checks and an occupied-slot array were rejected as the concurrency guarantee. Exact decimal money storage is possible, but integer cents suffice for two-decimal amounts.

## Temporary learning exception

On November 23, 2026 the user approved D3.3a as an intentionally vulnerable check-then-insert stage, with a forward migration removing only the existing named exclusion constraint. It does not supersede the final decision above or fulfill the challenge concurrency requirement. Both D3.3 stages are now reviewed and merged. The separate D3.3b PR restored the constraint and maps only its actual database error to BOOKING_CONFLICT/409. The same controlled race now leaves one stored booking rather than two. Actual simultaneous inserts also produced P2034/40P01 deadlock rollbacks; the user approved one bounded repository-local retry of that aborted INSERT. It does not provide the uniqueness guarantee or classify deadlock as overlap: the exclusion constraint still decides, and only its named violation is mapped to 409. Unknown/ambiguous outcomes are never retried. See decisions.md. Use isolated fixtures to demonstrate before/after behavior; never silently remove application bookings to reinstall the constraint. See execution-plan.md for the explicit scope and approval gate.

## Consequences

A small custom SQL migration must be maintained and tested against PostgreSQL; Prisma schema alone does not express the guarantee. Adjacent bookings remain valid, cancellation releases the interval, and original totals/history survive price edits. Validate the actual adapter error before mapping overlap to 409.

## Specification

See [the normative specification](../api-contracts.md#booking-creation-data) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
