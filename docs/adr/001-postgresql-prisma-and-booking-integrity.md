# PostgreSQL, Prisma, and booking integrity

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

The system must prevent overlapping reservations under simultaneous requests and preserve history. MongoDB is familiar to the candidate but is not required by the brief.

## Decision

Use PostgreSQL 17.12 and Prisma 7.10.1 with mapped snake_case storage/camelCase TypeScript. Store booking intervals and contracted integer-cent totals. Version btree_gist and the confirmed-only GiST exclusion constraint on court and half-open timestamptz range. Repositories isolate queries; services still validate business rules.

## Alternatives

MongoDB/Mongoose with carefully designed atomic writes was considered. Application-only availability checks and an occupied-slot array were rejected as the concurrency guarantee. Exact decimal money storage is possible, but integer cents suffice for two-decimal amounts.

## Consequences

A small custom SQL migration must be maintained and tested against PostgreSQL; Prisma schema alone does not express the guarantee. Adjacent bookings remain valid, cancellation releases the interval, and original totals/history survive price edits. Validate the actual adapter error before mapping overlap to 409.

## Specification

See [the normative specification](../api-contracts.md#booking-creation-data) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
