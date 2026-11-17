# Courtly planning decisions

This document records approved decisions, not a complete implementation specification. Planning is still in progress. The application has not been implemented.

## Challenge context

Build a small sports court booking application for the Procimo fullstack hiring challenge. The brief permits PostgreSQL, MySQL, or MongoDB and requires TypeScript strict mode, a separate backend, API-enforced roles, database-level double-booking prevention, Docker Compose startup including database initialization and seed, and meaningful backend booking-rule tests.

The complete brief still needs to be transcribed into `docs/challenge.md`. It remains the source of truth for requirements.

## Approved decisions

- Frontend: React. Backend: Express. Database: PostgreSQL with Prisma. This replaces the earlier MongoDB and Mongoose choice; no application implementation or data migration exists yet.
- Use tsoa with Express. Typed controllers and decorators are the source for generated Express routes, input validation, and OpenAPI. This replaces the proposed Zod plus OpenAPI generation approach. Keep business rules in services and persistence in Prisma; do not expose Prisma models directly as API contracts.
- Run tsoa generation automatically before development startup and production compilation, and regenerate after controller or contract changes during development. Include generation in the Docker build and verification workflow. Treat generated routes and specifications as build artifacts and never edit them manually. Explicitly maintain response and error declarations, authentication metadata, examples, and business-rule descriptions; tsoa cannot infer all runtime behavior. Verify critical response contracts through the existing integration tests without introducing a separate elaborate testing system.
- Use snake_case for database tables and columns and camelCase for TypeScript properties and API JSON fields. Configure the mapping in Prisma so database naming does not propagate into application or domain code. Pin the Prisma version and confirm its mapping and migration APIs during implementation planning.
- All code, interface text, and repository documentation will be in English. Planning conversations may be in Portuguese.
- Implement mandatory requirements only. No optional bonus is planned.
- Store each booking as a relational row with start and end instants. Prevent overlapping confirmed bookings for the same court using a PostgreSQL GiST exclusion constraint over `court_id` and `tstzrange(starts_at, ends_at, '[)')`, with the `btree_gist` extension. Half-open intervals allow adjacent bookings. Cancelled bookings remain in history and are excluded from the constraint. Version the extension and constraint SQL through a Prisma-managed migration. Use timestamp-with-time-zone columns for booking instants. The occupied-slot array and MongoDB index approach are superseded.
- Verify double-booking prevention against real PostgreSQL, including concurrent requests, partial overlap, adjacent bookings, and rebooking after cancellation. Translate the specific overlap constraint violation into HTTP 409. Application availability checks alone are insufficient.
- Court changes apply to new bookings. Existing bookings retain their scheduled instants and contracted price, including when a court is deactivated. Deactivation preserves booking history.
- Model a minimal `Facility` with `id`, `name`, and an IANA `timezone`. Seed one facility and reference it from courts through `facilityId`. Facility CRUD and timezone editing are outside the core scope.
- Store booking start and end instants in UTC. Court opening hours are local times in the facility timezone. The interface displays times in the facility timezone and identifies that timezone explicitly.
- API booking timestamps use ISO 8601 with an explicit offset. Availability dates and admin report dates are interpreted in the facility timezone. Responses expose UTC instants and the facility timezone. Cancellation compares instants on the server.
- API documentation must always match the implementation and be available in Swagger UI at `/api/docs`, with the tsoa-generated OpenAPI document at `/api/openapi.json`, when the application starts through Docker Compose. Document every endpoint, authentication and roles, request and response schemas, examples, expected errors, and relevant booking and timezone semantics. API documentation updates belong in the same PR as the behavior change and are part of each delivery's acceptance criteria. Swagger must support exercising the documented operations using the chosen authentication mechanism.
- Preserve incremental, reviewable work through branches and PRs; never commit directly to `main`.
- Branch names describe only the feature or work in lowercase kebab-case, with no AI or agent references or prefixes.
- Commits follow Google-style `<type>: <imperative English summary>` formatting, without a parenthesized scope; for example, `feat: add booking creation`.
- Commit messages and PR titles and bodies contain no AI attribution, generated-by notices, agent signatures, or agent co-author trailers. The challenge's separate AI-usage disclosure requirement for the submission decisions remains applicable.
- The final execution plan and referenced repository specifications must be sufficient to continue in another chat or agent without this conversation.
- The candidate writes the README, as required by the challenge. AI may help discuss decisions and review candidate-authored text.

## Open planning items

- Select the seeded facility timezone; `Europe/Lisbon` was suggested but has not been approved.
- Finalize booking, availability, opening-hours, cancellation-boundary, and admin-revenue behavior against the complete brief.
- Define authentication, API contracts, UI flows, and minimal testing infrastructure. Pin compatible tsoa, Express, and TypeScript versions and confirm generation and development-watch commands.
- Pin compatible PostgreSQL and Prisma versions and validate custom migration and exclusion-constraint error handling before defining implementation tasks.
- Define incremental PR deliverables, acceptance criteria, and repository bootstrap given the absence of an initial commit.
- Prepare self-contained subagent task context and confirm availability of the requested Luna model before implementation delegation.

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
