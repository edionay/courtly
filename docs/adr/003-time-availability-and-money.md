# Facility-local scheduling and computed weekly availability

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

Opening times recur locally, while bookings identify absolute instants. Users must see one-hour available and occupied slots for a chosen date.

## Decision

Seed one internal America/Sao_Paulo Facility. Store booking instants in UTC/timestamptz; combine local date/opening hours/timezone per request. Compute Sunday-first weekly availability without persisted slot IDs; show only the selected day. Backend supplies navigation/day states. Use integer-cent prices and preserve booking total.

## Alternatives

Persisted slots, client-computed week boundaries, browser-clock day defaults, duplicated booking timezone, and a facility management API add unnecessary state/scope. A daily API is viable but weekly data supports the approved date strip.

## Consequences

A weekly response is larger, but changing a day reuses loaded data. startsAt is submitted unchanged as an instant; display labels are never parsed. Fixed whole-hour same-day schedules limit complexity. Multiple facilities, catalog, free-day scanning and restoration of prior slots are future improvements.

## Specification

See [the normative specification](../api-contracts.md#weekly-availability) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
