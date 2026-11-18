# Courtly planning decisions

This document records approved decisions, not a complete implementation specification. Planning is still in progress. The application has not been implemented.

## Challenge context

Build a small sports court booking application for the Procimo fullstack hiring challenge. The brief permits PostgreSQL, MySQL, or MongoDB and requires TypeScript strict mode, a separate backend, API-enforced roles, database-level double-booking prevention, Docker Compose startup including database initialization and seed, and meaningful backend booking-rule tests.

`docs/challenge.md` contains the local structured restatement of the complete brief and submission constraints. Consult it as the requirements reference and keep project-specific choices separate.

## Approved decisions

- Frontend: React. Backend: Express. Database: PostgreSQL with Prisma. This replaces the earlier MongoDB and Mongoose choice; no application implementation or data migration exists yet.
- Authentication uses JWT bearer tokens. Login uses seeded email/password credentials; authenticated requests send `Authorization: Bearer <token>`. Token expiry, browser storage, and the exact authentication response contract remain to be agreed. Registration, refresh-token flows, and password recovery are not approved scope.
- Use tsoa with Express. Typed controllers and decorators are the source for generated Express routes, input validation, and OpenAPI. This replaces the proposed Zod plus OpenAPI generation approach. Keep business rules in services and persistence in Prisma; do not expose Prisma models directly as API contracts.
- Run tsoa generation automatically before development startup and production compilation, and regenerate after controller or contract changes during development. Include generation in the Docker build and verification workflow. Treat generated routes and specifications as build artifacts and never edit them manually. Explicitly maintain response and error declarations, authentication metadata, examples, and business-rule descriptions; tsoa cannot infer all runtime behavior. Verify critical response contracts through the existing integration tests without introducing a separate elaborate testing system.
- Use snake_case for database tables and columns and camelCase for TypeScript properties and API JSON fields. Configure the mapping in Prisma so database naming does not propagate into application or domain code. Pin the Prisma version and confirm its mapping and migration APIs during implementation planning.
- All code, interface text, and repository documentation will be in English. Planning conversations may be in Portuguese.
- Implement mandatory requirements only. No optional bonus is planned.
- Whenever the user comments on requirements or scope, consult the relevant section of `docs/challenge.md` before responding or modifying the plan. Identify agreement, incorrect interpretations, and scope additions explicitly instead of accepting them automatically.
- Store each booking as a relational row with start and end instants. Prevent overlapping confirmed bookings for the same court using a PostgreSQL GiST exclusion constraint over `court_id` and `tstzrange(starts_at, ends_at, '[)')`, with the `btree_gist` extension. Half-open intervals allow adjacent bookings. Cancelled bookings remain in history and are excluded from the constraint. Version the extension and constraint SQL through a Prisma-managed migration. Use timestamp-with-time-zone columns for booking instants. The occupied-slot array and MongoDB index approach are superseded.
- Verify double-booking prevention against real PostgreSQL, including concurrent requests, partial overlap, adjacent bookings, and rebooking after cancellation. Translate the specific overlap constraint violation into HTTP 409. Application availability checks alone are insufficient.
- Court changes apply to new bookings. Existing bookings retain their scheduled instants and contracted price, including when a court is deactivated. Deactivation preserves booking history.
- A user may cancel their own booking when its start instant is at least two hours after the server's current instant, including exactly two hours. Reject cancellation when the remaining time is less than two hours. This locks the inclusive boundary of the challenge's cancellation window; the endpoint and error response contract are still being finalized.
- API presentation contracts follow the approved BFF-style approach in `docs/api-contracts.md`, within the existing backend rather than a separate service. Backend-generated `display` objects contain ready-to-render English dates, time ranges, timezone context, status labels, and generic-dollar amounts. IDs and machine-readable status support client actions. Return additional raw fields only when a concrete client operation requires them.
- Individual booking representations and the user's booking-list items contain `id`, a court summary, `status`, `canCancel`, and `display`. Omit raw `startsAt`, `endsAt`, and numeric prices from these presentation responses. They remain persisted/calculated on the backend; timezone is obtained from Facility, not duplicated as a Booking column. A single-item representation does not require introducing a booking-detail GET endpoint.
- Availability slots retain machine-readable `startsAt` because booking creation submits `courtId`, `startsAt`, and `durationHours`. A `display` label must never be parsed back into a timestamp or price by the client.
- Calculate `canCancel` on the server for the requesting user: the booking must belong to that user, be confirmed, and start at least two hours in the future. The UI uses this hint for the action's availability; the API independently revalidates ownership, status, and timing on cancellation because the hint may become stale.
- Model a minimal `Facility` with `id`, `name`, and an IANA `timezone`. Seed one facility and reference it from courts through `facilityId`. Facility CRUD and timezone editing are outside the core scope.
- Facility remains an internal seeded configuration entity. Do not expose facility listing, detail, or management endpoints or build facility selection screens. The earlier `GET /api/facilities` proposal is rejected. Court and availability responses supply the needed timezone context.
- Facility management is a possible future improvement, including creating, editing, and managing multiple facilities. It is not part of the current delivery and does not change the single seeded facility or require facility endpoints now.
- Court routes are not nested under Facility and do not accept a client-provided `facilityId`; the backend associates new courts with the single seeded facility. `GET /api/courts` lists active courts for users and both active and inactive courts for administrators. `POST /api/courts` and `PATCH /api/courts/{courtId}` are administrator-only. Deactivation uses the same PATCH operation with `isActive: false`, preserving existing bookings.
- Each court has one fixed daily opening interval, identical every day, with whole-hour opening and closing times and no overnight interval. These are project simplifications, not additional requirements stated by the brief.
- `sportType` is required free text. Do not introduce a Sport entity, enum, catalog endpoint, or predefined client list in the core. A standardized sport catalog exposed to clients is a possible future improvement, not an implementation task for this delivery.
- Court hourly prices use integer cents in the API, named `hourlyPriceCents`; format these amounts with `$` and two decimal places in the interface.
- `GET /api/courts/{courtId}/availability?date=YYYY-MM-DD` returns the selected facility-local day's one-hour slots, with UTC start and end instants and the facility timezone. Exact response shapes and error behavior are the next contract discussion.
- Availability retains past slots in API responses with status `past`; the frontend hides slots with that status. No persisted slot records are required: compute status when assembling availability. The server independently rejects past booking creation, regardless of client filtering. Remaining slots distinguish `available` and `booked`; status precedence for an occupied past slot still needs to be made explicit when finalizing the contract.
- The administrator's selected-day booking list across all courts and its total expected revenue are mandatory (`docs/challenge.md`, Administrator day view). This does not imply exports or a separate reporting subsystem.
- The seeded facility timezone is `America/Sao_Paulo`. Use a generic monetary unit, displayed with the `$` symbol and two decimal places; do not identify it as BRL, USD, or another real currency. Court API prices use integer cents; booking amount contracts and monetary database storage remain to be finalized.
- Store booking start and end instants in UTC. Court opening hours are local times in the facility timezone. The interface displays times in the facility timezone and identifies that timezone explicitly.
- API booking timestamp inputs use ISO 8601 with an explicit offset; raw timestamp outputs where needed use UTC. Availability dates and admin report dates are interpreted in the facility timezone. Booking presentation responses use formatted `display` values instead of raw instants; availability supplies the structured instants needed to create bookings. Cancellation compares instants on the server.
- API documentation must always match the implementation and be available in Swagger UI at `/api/docs`, with the tsoa-generated OpenAPI document at `/api/openapi.json`, when the application starts through Docker Compose. Document every endpoint, authentication and roles, request and response schemas, examples, expected errors, and relevant booking and timezone semantics. API documentation updates belong in the same PR as the behavior change and are part of each delivery's acceptance criteria. Swagger must support exercising the documented operations using the chosen authentication mechanism.
- Preserve incremental, reviewable work through branches and PRs; never commit directly to `main`.
- Branch names describe only the feature or work in lowercase kebab-case, with no AI or agent references or prefixes.
- Commits follow Google-style `<type>: <imperative English summary>` formatting, without a parenthesized scope; for example, `feat: add booking creation`.
- Commit messages and PR titles and bodies contain no AI attribution, generated-by notices, agent signatures, or agent co-author trailers. The challenge's separate AI-usage disclosure requirement for the submission decisions remains applicable.
- The final execution plan and referenced repository specifications must be sufficient to continue in another chat or agent without this conversation.
- Delivery workflow: the parent agent orchestrates and prepares self-contained implementation tasks; the configured `programador` subagent implements, validates, and opens a feature PR; the configured `revisor` subagent reviews the actual PR diff without modifying code. The orchestrator sends actionable findings back to the developer for correction and subsequent review. The user alone merges PRs. Dependent deliveries start from the merged base.
- The `programador` and `revisor` roles are available with `gpt-6-luna` and high reasoning effort. Use these configured roles rather than substituting models. Follow each role's applicable programming-practices skill. Implementation remains pending specification and incremental-plan completion.
- The candidate writes the README, as required by the challenge. AI may help discuss decisions and review candidate-authored text.

## Open planning items

- Finalize booking endpoint paths, HTTP/error contracts, availability response details, and admin-revenue behavior against the complete brief. The fixed daily whole-hour opening interval, inclusive two-hour cancellation boundary, and backend-formatted booking presentation contract are approved; see `docs/api-contracts.md`.
- Define JWT expiry and browser storage, remaining API contracts, UI flows, and minimal testing infrastructure. Court routes are not facility-scoped. Pin compatible tsoa, Express, and TypeScript versions and confirm generation and development-watch commands.
- Pin compatible PostgreSQL and Prisma versions and validate custom migration and exclusion-constraint error handling before defining implementation tasks.
- Define incremental PR deliverables, acceptance criteria, and repository bootstrap given the absence of an initial commit.
- Prepare self-contained task briefs for the available `programador` and `revisor` roles, including ownership, specification references, acceptance criteria, dependencies, and verification commands.

## Technical references

- tsoa setup and generation: https://tsoa-community.github.io/docs/getting-started.html
- tsoa authentication integration: https://tsoa-community.github.io/docs/authentication.html
- tsoa validation error handling: https://tsoa-community.github.io/docs/error-handling.html
- PostgreSQL range exclusion constraints: https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT
- Prisma database support and version-specific documentation: https://www.prisma.io/docs/orm/supported-databases
- Prisma ORM v7 database mapping: https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/database-mapping
- Prisma ORM v7 extensions through customized migrations: https://www.prisma.io/docs/orm/v7/prisma-schema/postgresql-extensions

Prisma version-specific references illustrate the mechanisms; they do not lock a major version. Confirm the selected version's APIs before implementation.

These references support technical mechanisms; they do not replace the challenge brief or approved product decisions.
