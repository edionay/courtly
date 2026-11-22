# tsoa and client-ready response contracts

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

Swagger must stay aligned with implementation and the client should render familiar dates/times/prices without reconstructing domain values.

## Decision

Use typed tsoa controllers as route/input/OpenAPI source and presenters for approved display objects. Generate in development/build/Docker. Keep IDs/action inputs/states/names outside display, return separate time endpoints, and render accessible intervals in the client. Shared errors use stable codes, not message parsing.

## Alternatives

A separate Zod/OpenAPI registry duplicates contracts. A separate BFF service is unnecessary. Combined timeRange strings impede accessible composition and would require parsing.

## Consequences

Decorators/metadata and generated artifacts need build tooling; business-rule and authorization checks still require implementation/tests. Presenters add small mapping functions; Swagger verification remains part of every affected API PR. Stable tsoa 6.6.0 findings must be assessed during tooling validation.

## Specification

See [the normative specification](../api-contracts.md) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
