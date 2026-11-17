# Courtly planning decisions

This document records approved decisions, not a complete implementation specification. Planning is still in progress. The application has not been implemented.

## Challenge context

Build a small sports court booking application for the Procimo fullstack hiring challenge. The brief permits MongoDB and requires TypeScript strict mode, a separate backend, API-enforced roles, database-level double-booking prevention, Docker Compose startup including database initialization and seed, and meaningful backend booking-rule tests.

The complete brief still needs to be transcribed into `docs/challenge.md`. It remains the source of truth for requirements.

## Approved decisions

- Frontend: React. Backend: Express. Database: MongoDB with Mongoose.
- All code, interface text, and repository documentation will be in English. Planning conversations may be in Portuguese.
- Implement mandatory requirements only. No optional bonus is planned.
- Store each booking in a single document with an array of occupied hourly slot start instants. Use a compound unique multikey index on court and slot starts, restricted to confirmed bookings. Verify the guarantee with a real MongoDB integration test, including concurrent requests and partial overlap. Application availability checks alone are insufficient.
- Court changes apply to new bookings. Existing bookings retain their scheduled instants and contracted price, including when a court is deactivated. Deactivation preserves booking history.
- Model a minimal `Facility` with `id`, `name`, and an IANA `timezone`. Seed one facility and reference it from courts through `facilityId`. Facility CRUD and timezone editing are outside the core scope.
- Store booking start and end instants in UTC. Court opening hours are local times in the facility timezone. The interface displays times in the facility timezone and identifies that timezone explicitly.
- API booking timestamps use ISO 8601 with an explicit offset. Availability dates and admin report dates are interpreted in the facility timezone. Responses expose UTC instants and the facility timezone. Cancellation compares instants on the server.
- Preserve incremental, reviewable work through branches and PRs; never commit directly to `main`.
- The final execution plan and referenced repository specifications must be sufficient to continue in another chat or agent without this conversation.
- The candidate writes the README, as required by the challenge. AI may help discuss decisions and review candidate-authored text.

## Open planning items

- Select the seeded facility timezone; `Europe/Lisbon` was suggested but has not been approved.
- Finalize booking, availability, opening-hours, cancellation-boundary, and admin-revenue behavior against the complete brief.
- Define authentication, API contracts and Swagger documentation, UI flows, and minimal testing infrastructure.
- Define incremental PR deliverables, acceptance criteria, and repository bootstrap given the absence of an initial commit.
- Prepare self-contained subagent task context and confirm availability of the requested Luna model before implementation delegation.

## Technical references

- MongoDB unique compound and multikey indexes, including unique partial indexes: https://www.mongodb.com/docs/manual/core/index-unique/
- Mongoose validation behavior: https://mongoosejs.com/docs/validation.html
- Mongoose TypeScript support: https://mongoosejs.com/docs/typescript.html

These references support technical mechanisms; they do not replace the challenge brief or approved product decisions.
