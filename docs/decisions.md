# Courtly approved decisions

Consolidated on November 21, 2026. This is the current decision register; historical proposals are superseded by this document and the referenced specifications. Application implementation proceeds incrementally through feature PRs; follow execution-plan.md for delivery boundaries and acceptance criteria.

## How to continue

Start with [execution-plan.md](execution-plan.md). The challenge source is [challenge.md](challenge.md); exact API contracts are [api-contracts.md](api-contracts.md); approved interaction behavior is [ui-flows.md](ui-flows.md); module boundaries and test strategy are [architecture.md](architecture.md). [ADRs](adr/index.md) explain the choices and trade-offs. The candidate owns the submission README.

## Scope and ownership

- Deliver the mandatory challenge only: seeded authentication, court browsing and management, hourly availability, creation/cancellation, own booking history, and administrator daily bookings with expected revenue. No optional challenge bonuses.
- One seeded internal Facility has id, name, and IANA timezone America/Sao_Paulo. Courts reference it; no facility endpoint, selector, CRUD, or timezone editing.
- sportType is required free text. No sport entity, enum, or catalog API.
- Use English for code, UI copy, and repository documentation. Prefer small self-explanatory functions and minimal comments. Recheck the challenge whenever requirements/scope are questioned. Discuss extra edge-case behavior before implementing it.

## Stable stack and version policy

Approved exact pins (selection approved; installation/runtime verification remains implementation work):

- Node.js 24.22.3 LTS; TypeScript 5.9.3, strict mode.
- Express 4.22.3; tsoa 6.6.0.
- PostgreSQL 17.12; prisma and @prisma/client 7.10.1.
- React and react-dom 19.3.1; Vite 8.3.8.
- tailwindcss and @tailwindcss/vite 4.3.5.
- storybook and @storybook/react-vite 10.6.8.
- Backend vitest 5.1.1, Node environment.

For pending supporting packages, choose the latest stable compatible version using official requirements and package metadata. Pin exact versions and commit the root lockfile during setup. Do not ask for each routine version or silently rewrite approved pins. Discuss material incompatibilities requiring a changed decision. No alpha, beta, or RC packages.

The official tsoa 7 RC notes describe array/buffer validation findings affecting 6.x. Stable tsoa 6.6.0 does not automatically resolve them. The tooling delivery must inspect applicability to these contracts and the actual dependency graph and document a stable-compatible resolution or raise an unresolved blocker. Do not call compatibility/security validated from documentation research alone.

## Architecture

- npm-workspaces monorepo: frontend/, backend/, docs/, root compose.yaml, private root package.json, and one package-lock.json. Each application owns its package.json and Dockerfile; backend owns Prisma schema/migrations/seed. The root coordinates installation/scripts, not a third app.
- Backend is feature-oriented layered architecture: typed tsoa controller, business service, feature-specific repository using Prisma, presenter. Avoid generic CRUD repositories, full DDD scaffolding, and unnecessary layers. API contracts are independent of Prisma records.
- Repository contracts live in `<feature>Repository.ts` as interfaces; Prisma implementations live in `prisma<Feature>Repository.ts` and explicitly implement them. Services and adapters consume those contracts (or narrow Picks), not service-local Store definitions. Assemble dependencies manually in backend/src/dependencies.ts; services require interface arguments and must not import/instantiate concrete repositories. Controllers and the named tsoa authentication hook use composed instances/functions, with acyclic imports. This supersedes default Prisma constructor/factory wiring. Keep feature folders and simple test doubles; no required memory implementation or unused repository per database model. Apply now to auth/courts and to future implemented persistence features. See architecture.md.
- Frontend is feature-oriented Container/Presentational Components: integration pages and hooks coordinate operations and navigation; API modules use one HTTP client; views/components receive props and callbacks and can have local interface state. Presentation does not depend on requests, token storage, or routing.
- Storybook renders those presentation views with fixtures and callbacks and the same styles/tokens as the app. Keep meaningful page/reused-component states rather than an extensive catalog.

## Persistence and business rules

- snake_case belongs to database artifacts; camelCase belongs to TypeScript and API JSON. Use Prisma mapping.
- Bookings store court/user references, confirmed/cancelled status, UTC start/end instants in timestamptz columns, and totalPriceCents. Facility owns timezone; it is not duplicated on Booking. IDs are opaque; examples do not prescribe their format.
- Each court has one identical daily opening interval, whole local hours, opening before closing, no overnight interval. Combine local date, schedule, and Facility timezone when computing availability. Do not preconvert recurring hours to UTC.
- Generate one-hour slots on each query; do not persist slots or assign slot IDs. One booking covers one or two consecutive hours. Reject past, off-hour, out-of-hours, and conflicting requests without rounding. An offset-bearing timestamp is an absolute instant, not a wall-clock time to relabel.
- Prevent overlap in PostgreSQL using btree_gist and a confirmed-only GiST exclusion constraint on court_id and tstzrange(starts_at, ends_at, '[)'). Version extension and constraint in Prisma SQL migrations. Adjacent intervals are allowed; cancelled rows remain in history and do not block new bookings. Verify against real PostgreSQL and map the actual overlap violation to BOOKING_CONFLICT/409.
- The temporary D3.3a learning exception has been reviewed and merged: its controlled test allowed two overlapping creations after both prechecks passed. D3.3b restored bookings_no_confirmed_overlap via a new forward migration and mapped the actual named database violation to BOOKING_CONFLICT/409; PR #7 has been reviewed and merged. Preserve both historical migrations, the advisory precheck and application data. D3.3b acceptance requires one success, one mapped conflict and one stored booking against real PostgreSQL. Verify only against ephemeral courtly_test; never delete/cancel application records to reinstall the constraint. See execution-plan.md.
- Court hourlyPriceCents and Booking totalPriceCents use integer cents. Compute/store the total at creation using the current hourly price; court edits/deactivation and cancellation preserve existing booking instants and contracted totals. This avoids binary floating-point decimal precision errors. Generic $ with two decimal places, no BRL/USD currency claim.
- Cancellation is owner-only for confirmed bookings at least two hours before start, including exactly two hours. Revalidate on submission. After ownership checks, an already-cancelled booking returns its unchanged representation with 200 irrespective of start time. No arbitrary booking edits/reactivation.

## API and presentation

The normative operation shapes, examples, errors, validation, and display-field rules are in [api-contracts.md](api-contracts.md).

- JWT bearer authentication with seeded accounts and one-hour lifetime. Store only the token in sessionStorage, user in application state; restore via GET /api/auth/me. No refresh, revocation, registration, password recovery, or backend logout endpoint. Exposed role controls navigation only; backend authentication/roles/ownership are authoritative.
- Protected-operation 401 clears invalid local authentication and opens /authentication-error, with explicit Go to login. No automatic login redirect; invalid login credentials remain on the form. Sign out clears local state and opens /login.
- The HTTP client normalizes known code/message/fields and distinguishes network failures. Unknown failures or unexpected bodies become frontend UNKNOWN_ERROR with Something went wrong. Please try again. Routing stays outside this helper; known INTERNAL_ERROR is a distinct backend response. Do not automatically retry ambiguous creation.
- GET /api/courts returns active courts for users and all courts for admins, name ascending, no pagination. POST/PATCH are admin-only; PATCH sends changed allowlisted fields. The server assigns the internal facility and active status at creation. No single-court detail endpoint is required: edit reload uses the collection.
- Availability loads Sunday–Saturday weeks. Omitted weekStart means current Facility-local week; supplied weekStart must be a valid Sunday or 422. Seven days, backend-generated previous/next links, day-level isSelectable, and available/booked/past slots. Past takes precedence; UI hides past slots, shows occupied slots disabled as Booked, and does not scan for the next free day. Missing/inactive court in availability returns COURT_NOT_FOUND/404; inactive court at creation returns COURT_INACTIVE/409.
- POST /api/bookings/preview receives the creation selection and returns court summary, durationHours, and date/start/end/total display labels with 200. Validate like creation; no booking, draft, hold, or price lock. Reuse preparation logic independently. Changing selection updates preview price; ignore stale responses.
- POST /api/bookings returns 201; PATCH /api/bookings/{bookingId} accepts only cancelled status; GET /api/bookings/me returns all own future/past/cancelled bookings by descending start instant. Shared personal representation includes server-computed canCancel and separate formatted date/time/timezone/status/price labels, not raw instants/numeric totals.
- GET /api/reports/daily-bookings is admin-only. Omitted date means today in Facility timezone; return effective root date to initialize the UI. Supplied date is exact YYYY-MM-DD or 422. Include confirmed and cancelled bookings across all courts, including inactive, ascending start. Revenue sums stored confirmed totals, including performed bookings, excluding cancelled. No timezone or display.status in report response.
- Backend display holds derived/formatted labels; IDs, state, booleans, resource structure, names, and free-text sport stay outside. Duplicate raw/formatted values only for distinct concrete uses. No combined timeRange: separate start/end values and accessible client composition. Never parse display to recover structured input.
- tsoa controllers generate routes, validation, and OpenAPI; regenerate automatically for development/build/Docker. No parallel Zod/OpenAPI registry. Generated routes/specs are build artifacts, not hand-edited source. Serve Swagger UI at /api/docs and OpenAPI at /api/openapi.json. Infer input and output schemas from explicit TypeScript API models, following the lightweight fiapx-api controller style. These are transport contracts, not Prisma records. Keep route/auth/status decorators and concise typed error-response declarations; omit descriptive JSDoc and hand-authored @Example/@example payloads. Swagger uses schema-derived sample values. Detailed business/timezone semantics and curated examples remain in api-contracts.md and must change with the implementation. Same-PR model/error/auth updates and direct HTTP/OpenAPI verification are acceptance criteria. Prefer curl or small HTTP scripts for backend checks; Swagger UI remains documentation and its Try it out is not required. Reserve browser/manual checks for actual interface/rendering/accessibility behavior. This supersedes the earlier mandatory Swagger UI execution gate. This supersedes the earlier requirement to duplicate all examples and business rules in generated Swagger.

## UI and accessibility

[ui-flows.md](ui-flows.md) and the canonical [wireframes](wireframes/README.md) describe all approved screens.

- Court grid: three columns desktop, one mobile. Desktop sidebar and compact mobile menu. Native forms, labeled inputs, day radios, slot checkboxes, and real buttons/links, with keyboard operation and visible focus.
- Flow: courts → selected court's weekly day/slot screen → separate review. Date changes use loaded week; week changes fetch through backend links. One/two adjacent slots; preview price updates and review provides explicit confirmation.
- Review's contextual Change action retains court/date, reloads availability, and leaves slots unselected. This supersedes slot restoration. Review keeps selection parameters only to reconstruct its own preview; they never authorize creation.
- Native dialog via showModal()/close(): booking success with Go to my bookings; occupied conflict with Choose another time; court save with Go to courts. Navigate only on the explicit action, never on dismissal. Preserve completed state after success to prevent duplicate submission.
- My bookings shows the returned descending list, not client-parsed date groups. Offer cancellation only when canCancel is true, confirm with Keep booking/Cancel booking, update the response and announce success inline. For stale eligibility show API explanation and refresh, no automatic retry.
- Court edit uses Available for bookings checkbox applied only on Save changes. No timezone label in court forms. Submit buttons sit outside/below cards, right-aligned desktop/full width mobile. Review uses the same button alignment.
- Visually compose time labels with a spaced dash, hidden from assistive technology; provide a visually hidden until separator so it is not announced twice. Verify native dialog naming/focus restoration and state announcements manually.
- Low-fidelity layouts are approved, not a final production identity. Palette, typography, tokens, and sport illustration refinement remain a bounded design task within the frontend delivery; do not infer a finished brand from grayscale previews.

## Confirmed deadlock recovery for booking creation

Real simultaneous GiST inserts with the pinned stack produced Prisma P2034 with meta.driverAdapterError.cause.originalCode 40P01 (deadlock), distinct from the named P2039/23P01 exclusion violation. PostgreSQL aborts one operation, preserving the no-overlap invariant. On November 23, 2026 the user approved exactly one retry of the autocommit booking INSERT after this confirmed rollback.

Keep the recovery in the Prisma repository. Only the observed P2034/40P01 combination qualifies; retry the same values once, then return the actual result or translate a named exclusion violation to BOOKING_CONFLICT/409. A deadlock alone is not an overlap verdict. A second deadlock or any unrelated error propagates unchanged; never retry network errors, timeouts, ambiguous commits or every P2034. Do not add a generic retry framework, backoff, locks, production/test insert serialization, or client mutation retries.

The genuine concurrent integration test must retain simultaneous inserts and prove one success, one mapped conflict and one stored booking. Add small focused tests proving eligible retry, the two-attempt maximum and unknown-error propagation. The constraint is the integrity guarantee; the retry only recovers from a known-aborted insert to produce the appropriate outcome. This approved exception supersedes the earlier blanket no-retry policy for this operation only.

PostgreSQL documents aborting a deadlock victim and retrying aborted transactions: [PostgreSQL 17 deadlocks](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-DEADLOCKS). See the [SQLSTATE reference](https://www.postgresql.org/docs/17/errcodes-appendix.html) for 40P01.

## Verification and delivery

- D3 is split into six separately reviewed PRs: weekly-availability, booking-preview, booking-creation, own-bookings, booking-cancellation and daily-booking-report. Each starts from main after the user merges its dependency. D3.1 and D3.2 have been merged. Both D3.3 learning stages have been reviewed and merged, including the database guarantee and conflict mapping in PR #7. D3.4 own-bookings has been reviewed and merged as PR #8. The user now authorizes D3.5 booking-cancellation in its own PR; the daily report remains a later delivery. See execution-plan.md for per-PR acceptance.

- Full applicable-rule checks are required at handoff, independent review, and orchestration. Scope, architecture, contracts/security, readability/comments, documentation, validation and workflow must be checked or explicitly marked not applicable/pending with evidence. A focus on one issue never waives another rule. Apply the model-driven Swagger policy above; descriptive JSDoc and hand-authored examples are not required to complete the documentation gate. See task-briefs.md.
- Architecture verification is an explicit delivery gate for programmer, reviewer and orchestrator, including framework/authentication adapters. Inspect actual imports/ORM calls, trace an affected flow, and record file/symbol evidence against the approved boundary at the committed head. A runtime-success report does not establish architectural conformance. Resolve objective project-convention violations before readiness; mark unverified checks honestly. See architecture.md and task-briefs.md.
- Programmer reasoning preference: Luna medium by default, or low for a simple task when a compatible configured profile is available. Verify the actual loaded profile before delegation rather than assuming a file edit changes an existing agent. Do not silently use high; reviewer settings are unchanged.
- Vitest service unit tests use simulated repositories and controlled time for opening hours and the inclusive cancellation boundary. Real-PostgreSQL integration proves concurrent prevention; also verify partial overlap, adjacency, and rebooking after cancellation with small focused cases.
- Use isolated courtly_test database on Docker PostgreSQL and the application migrations. test:unit needs no database; test:integration prepares its isolated database. Never reset application data for a test.
- No automated frontend tests in this delivery. Demonstrate visual states in Storybook and manually verify main user/admin flows, keyboard/focus/native dialog behavior. Storybook alone is not automated coverage.
- docker compose up must initialize migrations/seed and start frontend/API/database without preparatory commands. Seed at least three courts, two users, one administrator, and several bookings. Preserve existing application data on repeated startup; seed must not become a destructive reset. Verify a clean-volume startup and a subsequent restart.
- The orchestrator prepares self-contained briefs; configured programador (Luna) implements/validates/opens PR; revisor (Luna) reviews actual diff read-only; developer fixes findings; only the user merges. Verify role/model availability before delegation and do not silently substitute. Documentation consolidation is orchestrator work; application code is not authorized by consolidating this plan.
- Use feature-only lowercase kebab-case branches and Google-style type: imperative English summary, without a parenthesized scope. No AI/agent attribution in branches, commits, or PR text; the challenge's separate submission disclosure still applies. Commit coherent closed topic blocks, report hash and exact subject, and do not backdate new work.
- One initial-base exception was approved: local main points at c8ce1f8, containing initial guidance/preliminary decisions. Later commits remain on planning. No history rewrite or agent merge. Publish the base/planning when opening the planning PR.
- The candidate writes the root README. Do not submit the challenge.

## Known limitations and future improvements

- HttpOnly-cookie session transport with SameSite/Secure and CSRF protection; sessionStorage is not protection from token theft through XSS. Token revocation/renewal are outside delivery.
- Multiple facility management and editable timezone.
- Standardized sport catalog exposed to the client.
- Automatically find/select a day with available slots.
- Restore selected slots when returning from review, including stale-selection recovery. Current flow intentionally requires selecting hours again.
- Detect price changes between preview and creation and require reconfirmation. Current preview locks nothing; creation contracts its freshly read price and returns that total. Do not add quote records or expected-price inputs now.
- Automated frontend/interaction tests. Storybook plus manual checking is the current scope.
- Idempotency support for ambiguous creation responses is not part of this delivery; do not automatically resubmit.

## Remaining implementation checkpoints

These are tasks to verify during implementation, not undecided product requirements:

- Verify package installation, exact pending stable supporting pins/lockfile, tsoa generation/watch/build, Swagger, adapter error mapping, and Docker migrations/seed against the approved stack. Raise real incompatibilities rather than silently changing pins or introducing prereleases.
- Finalize visual tokens and sport illustrations within approved layouts; keep native semantics and document the small design system.
- Verify mandatory tests, manual acceptance, and candidate-authored README before final handoff.

## Technical references

- npm workspaces: https://docs.npmjs.com/cli/v11/using-npm/workspaces/
- Vitest 5.1.1 release: https://github.com/vitest-dev/vitest/releases/tag/v5.1.1
- Vitest setup and requirements: https://vitest.dev/guide/
- Storybook 10.6.8 release: https://github.com/storybookjs/storybook/releases/tag/v10.6.8
- Tailwind CSS with Vite: https://tailwindcss.com/docs/installation/using-vite
- Tailwind CSS 4.3.5 release: https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.5
- Tailwind Vite plugin 4.3.5 compatibility: https://github.com/tailwindlabs/tailwindcss/blob/v4.3.5/packages/%40tailwindcss-vite/package.json
- React 19.3.1 release: https://github.com/react/react/releases/tag/v19.3.1
- Vite 8.3.8 release: https://github.com/vitejs/vite/releases/tag/v8.3.8
- Vite setup and Node.js requirements: https://vite.dev/guide/
- Storybook React/Vite framework integration: https://storybook.js.org/docs/get-started/frameworks/react-vite
- Node.js release history: https://nodejs.org/en/blog
- TypeScript 5.9.3 release: https://github.com/microsoft/TypeScript/releases/tag/v5.9.3
- tsoa 6.6.0 runtime dependencies: https://github.com/lukeautry/tsoa/blob/v6.6.0/packages/runtime/package.json
- Express 4.22.3 package metadata: https://github.com/expressjs/express/blob/v4.22.3/package.json
- tsoa 7 release-candidate notes, including findings affecting 6.x: https://github.com/lukeautry/tsoa/releases/tag/v7.0.0-rc.0
- PostgreSQL supported versions and patch releases: https://www.postgresql.org/support/versioning/
- Prisma release status and supported version-7 line: https://www.prisma.io/docs/orm/release-status
- tsoa setup and generation: https://tsoa-community.github.io/docs/getting-started.html
- tsoa authentication integration: https://tsoa-community.github.io/docs/authentication.html
- tsoa validation error handling: https://tsoa-community.github.io/docs/error-handling.html
- PostgreSQL range exclusion constraints: https://www.postgresql.org/docs/current/rangetypes.html#RANGETYPES-CONSTRAINT
- Prisma database support and version-specific documentation: https://www.prisma.io/docs/orm/supported-databases
- Prisma ORM v7 database mapping: https://www.prisma.io/docs/orm/v7/prisma-schema/data-model/database-mapping
- Prisma ORM v7 extensions through customized migrations: https://www.prisma.io/docs/orm/v7/prisma-schema/postgresql-extensions

Prisma `7.10.1` is the approved version. Use the version-7 documentation for mapping, configuration, adapters, and migrations; verify behavior against the installed packages during implementation.

These references support technical mechanisms; they do not replace the challenge brief or approved product decisions.
