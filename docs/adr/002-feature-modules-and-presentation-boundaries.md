# Feature modules, repositories, and presentation boundaries

Status: accepted; consolidated November 21, 2026 from approved decisions.

## Context

The small challenge needs readable code and independently demonstrable page states without large architectural scaffolding.

## Decision

Organize by feature. Backend uses tsoa controller, service, feature repository, and presenter. Repository contracts are interfaces in <feature>Repository.ts; Prisma implementations live in prisma<Feature>Repository.ts and explicitly implement them. Services consume the interface, and framework adapters reuse it or a narrow Pick. A manual composition root in backend/src/dependencies.ts constructs concrete repositories/services/authentication; services require interfaces and do not import Prisma implementations. Controllers and the named tsoa hook use the composed instances with acyclic imports. This supersedes default Prisma constructor/factory wiring and retains manual injection without tsyringe or another DI container. This convention was approved on November 23, 2026; it replaces service-local Store contracts without requiring a DI framework or in-memory implementation. Frontend uses integration page/hooks, feature API/shared HTTP client, and presentational views with props/callbacks. Demonstrate views in Storybook with fixtures.

## Alternatives

Direct service-to-Prisma access would remove a layer, but the candidate prefers repository isolation. Full Clean Architecture, generic CRUD repositories, separate BFF service, and a large component/test framework are unnecessary.

## Consequences

More explicit boundaries/files than direct calls, but queries and UI integration stay out of business rules/presentation. Keep each abstraction small. Storybook does not imply automated frontend coverage; manual flows/accessibility and mandatory backend tests remain required.

## Specification

See [the normative specification](../architecture.md) and [execution plan](../execution-plan.md). This ADR explains the decision; it does not create competing request/response contracts.
