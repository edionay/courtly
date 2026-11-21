# Simple JWT sessions and explicit result navigation

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

The challenge permits simple seeded authentication. Refresh should preserve the session, and the user requires explicit login navigation after protected authentication failure.

## Decision

Use one-hour bearer JWT in sessionStorage, restore via me, clear local state on logout, no refresh/revocation endpoint. Role/canCancel guide UI only. Protected 401 opens authentication-error with Go to login. Result dialogs use native showModal/close and navigate only on explicit actions.

## Alternatives

An HttpOnly cookie with CSRF controls would improve token isolation but is deferred. Automatic login redirection, custom modal overlays, and automatic mutation retries contradict the approved interaction.

## Consequences

sessionStorage is JavaScript-readable and does not protect tokens against XSS; issued tokens remain valid until expiration after logout. Completed state avoids duplicate confirmation. Ambiguous creation failures require checking bookings; no idempotency/quote locking is delivered.

## Specification

See [the normative specification](../ui-flows.md) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
