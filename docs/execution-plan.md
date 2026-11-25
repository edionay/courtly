# Courtly execution plan

Status: approved consolidated specification, maintained during incremental implementation through independently reviewed feature PRs. This plan authorizes no automatic merge or challenge submission. The candidate must author the root README. Approved product decisions are closed; delivery acceptance depends on executed checks and review evidence, not on this plan alone.

## Start here in another chat

1. Read root AGENTS.md, PRODUCT.md and DESIGN.md; then this plan, challenge.md, decisions.md, api-contracts.md, ui-flows.md, architecture.md and the relevant ADRs. For frontend work also read frontend-plan.md, design-system.md, frontend-handoff.md and mockups/aguinha/REVIEW.md; the high-fidelity pack supersedes low-fidelity styling. All paths in this document are relative to docs/ unless explicitly root-relative. All are repository files; no chat transcript is required.
2. Treat challenge.md as the mandatory requirement reference, decisions.md as approved project choices, api-contracts.md as normative wire contracts, and ui-flows.md plus canonical SVG/PNG as approved interaction/layout. ADRs explain consequences, not competing contracts. If they conflict, resolve against the latest approved consolidated choice and brief before implementation; do not infer an extra feature from an older image.
3. Establish current repository state with git status, branch, and PR inspection. The historical main bootstrap at c8ce1f8 was a one-time exception. D0–D3 and design/handoff PR #11 are merged. The D4 breakdown is in PR #12; verify that the user has merged it before starting D4.1. Future work uses its own feature branch and PR. Preserve unrelated local drafts, installed skill folders, and candidate work. Never merge on behalf of the user.
4. Start application delivery only after the planning PR is reviewed and merged by the user. Each dependent delivery starts from the merged base. Use the configured programador and revisor roles with Luna; verify availability and give them the applicable brief in task-briefs.md. Do not silently substitute a model.
5. Keep every delivery small and reviewable. Prefer happy-path implementation; discuss additional edge behavior before adding it. Routine pending dependency pins are delegated: latest stable compatible releases, exact versions/lockfile, no prereleases. Already-approved exact pins are in decisions.md.

## Mandatory outcome

The challenge requires a strict-TypeScript React frontend and separate Express backend, seeded login and API-enforced roles, a deliberately modeled PostgreSQL database, and one-command Docker startup. A user browses courts, selects a court/day and available/occupied one-hour slots, books one or two consecutive hours, sees own future/past bookings, and cancels an owned booking until two hours before start. No past or overlapping bookings, including simultaneous requests. Administrators create/edit/deactivate courts without losing booking history and inspect all courts' bookings for a selected day with expected revenue. At least three courts, two users, one administrator, and several bookings must be seeded. Backend tests must meaningfully cover concurrency, cancellation timing, and opening hours. The public GitHub repository and candidate-written README must explain startup/credentials, choices/trade-offs, concurrency protection, and future improvements. Do not submit the challenge.

The personalized challenge URL/token must never enter public repository files. challenge.md is the complete local structured restatement. Optional realtime and waitlist bonuses are excluded; the separately approved performance exercise is specified in performance-plan.md, as are payments, registration, password recovery, facility CRUD, and a generic permissions framework.

## Approved solution

- npm-workspaces monorepo: root package.json (private), package-lock.json, compose.yaml; frontend/ and backend/ each own a package.json and Dockerfile. backend/prisma owns schema/migrations/seed. No extra monorepo framework.
- Backend feature modules: controller → service → repository → Prisma/PostgreSQL; presenters prepare API display values. Repository interfaces belong in <feature>Repository.ts, Prisma implementations in prisma<Feature>Repository.ts, and services consume required interface constructor arguments. Manually assemble repositories/services/authentication in backend/src/dependencies.ts; controllers and the tsoa hook use the composed instances, without default Prisma wiring or a DI container. See architecture.md. Apply this to existing auth/courts and future implemented features without creating unused repositories. No generic CRUD repository or separate BFF service. Frontend feature modules: container page/hook → feature API → shared HTTP client, with presentational views/forms receiving props/callbacks and rendered independently in Storybook.
- Exact approved versions: Node 24.22.3 LTS, TypeScript 5.9.3 strict, Express 4.22.3, tsoa 6.6.0, PostgreSQL 17.12, prisma and @prisma/client 7.10.1, React/react-dom 19.3.1, Vite 8.3.8, tailwindcss/@tailwindcss/vite 4.3.5, storybook/@storybook/react-vite 10.6.8, backend Vitest 5.1.1. Select pending adapter, React plugin/types, router, timezone, auth, Swagger and other actually needed supporting packages under the stable-compatible policy; do not expand the dependency list speculatively.
- Package declarations/documentation are not runtime verification. Verify installed package availability, peer compatibility, TypeScript/tsoa generation, Prisma adapter/custom migration behavior, and actual builds. The noted tsoa 6.x array/buffer validation findings require an applicability review and documented stable-compatible resolution; unresolved findings are not silently waived or fixed with a prerelease. Raise material conflicts to the user before changing approved pins or scope.

## Minimal domain model and invariants

This states conceptual fields, not an implemented Prisma schema. Keep concrete schema choices proportionate; document the chosen opaque ID and local-time storage types in the database PR without changing API semantics.

- User: id, name, unique email, password hash, role user/admin. Never persist plaintext passwords or return hashes. Seeded credentials are for demonstration and must be communicated to the candidate for their README.
- Facility: id, name, IANA timezone America/Sao_Paulo. Exactly one internal seeded facility in the delivered scope.
- Court: id, facilityId relation, name, sportType (required free text), hourlyPriceCents (positive integer), opensAt, closesAt (whole facility-local HH:mm), isActive. Same opening interval every day, opening before closing, no overnight interval.
- Booking: id, courtId/userId relations, startsAt/endsAt absolute instants, confirmed/cancelled status, totalPriceCents (integer contracted amount). Use timestamptz for instants; timezone is derived from Facility rather than a Booking column. Duration is one or two hours; no persisted slot entity.
- camelCase in TypeScript/JSON, snake_case in database artifacts through Prisma mapping. Keep formatted display values outside persisted/domain values.
- Version btree_gist and a confirmed-only GiST exclusion constraint over court_id and tstzrange(starts_at, ends_at, '[)'). Same-court partial overlaps conflict, adjacent intervals do not, and cancelled rows release availability. The database constraint is the concurrency guarantee; querying availability first is insufficient.
- Service validates active court, offset-bearing absolute start, whole-hour local alignment, future scheduling, duration and opening interval. Reject, never round. 2026-11-20T16:00:00Z represents 13:00 in São Paulo for that illustrative date; 13:00Z represents 10:00 locally.
- At creation use current hourlyPriceCents × duration, persist totalPriceCents, and preserve it across later court changes/cancellation. Generic dollar formatting has two decimals and implies no specific real currency.
- Owned confirmed cancellations are allowed when start minus server now is at least two hours, including equality. Recheck on mutation. Ownership precedes idempotent already-cancelled success. No booking edits/reactivation. canCancel is a server hint, never authorization.

## API contract inventory

Read api-contracts.md for complete schemas, examples, all error codes, and display-field placement; do not implement from this inventory alone. Every protected operation authenticates; administrative operations additionally enforce admin role on the backend.

- POST /api/auth/login: email/password → 200 accessToken and user id/name/role. Invalid credentials 401 remain on login. GET /api/auth/me → 200 user for session restoration.
- GET /api/courts → 200 items, name ascending, active for user/all for admin; no pagination. POST /api/courts admin → 201 complete court, server-assigned facility/active status. PATCH /api/courts/{courtId} admin accepts only changed allowlisted name/sport/price/hours/isActive fields → 200 complete court; validate final opening interval. No single-court GET or facility endpoints.
- GET /api/courts/{courtId}/availability: optional weekStart, valid Sunday YYYY-MM-DD only. Default current Facility-local Sunday–Saturday. Response: courtId, inclusive weekStart/weekEnd, separate display week labels, relative previous/next API links, and seven chronological days with date/isSelectable/day labels/slots. Slots expose raw UTC startsAt, available/booked/past status, and separate local start/end labels. Missing/inactive court → COURT_NOT_FOUND/404. Do not add slot IDs, raw end timestamps, owner data, currentDate or minDate.
- POST /api/bookings/preview: courtId, startsAt, durationHours 1|2 → 200 court id/name/sport, durationHours, display date/start/end/total. Validate like creation; persist/hold nothing. The UI updates price and reconstructs review from query parameters. A changed court price before creation may change the final total; this is a documented limitation, not a quote lock.
- POST /api/bookings: same selection → 201 personal booking representation. It has id, court id/name, status, canCancel, display date/start/end/timezone/status/total; no raw booking instants or numeric total. Revalidate and insert under exclusion protection; overlap → BOOKING_CONFLICT/409.
- GET /api/bookings/me → 200 items of that personal representation for all own future/past/cancelled bookings, descending starts. PATCH /api/bookings/{bookingId} with status cancelled → 200 same representation; ownership, timing and approved idempotency apply.
- GET /api/reports/daily-bookings admin: optional exact date; omitted means current Facility-local day. Return effective root date, display date/expectedRevenue, and chronological bookings with id, court id/name, user name, status, display startsAt/endsAt/totalPrice. Include inactive courts and cancellations, sum only stored confirmed totals including performed bookings. No timezone/display.status/raw prices/instants/canCancel. Empty: bookings [] and $0.00.
- Shared errors: code/message and optional fields[{field,message}]. INVALID_JSON/400; INVALID_CREDENTIALS or UNAUTHENTICATED/401; FORBIDDEN/403; COURT_NOT_FOUND or BOOKING_NOT_FOUND/404; BOOKING_CONFLICT, COURT_INACTIVE, CANCELLATION_WINDOW_CLOSED/409; VALIDATION_ERROR/422; INTERNAL_ERROR/500. Frontend UNKNOWN_ERROR is a fallback, not an API code. Do not classify every 409 as occupied or parse messages.
- tsoa is the single HTTP/OpenAPI source with automatic regeneration in dev/build/Docker. Swagger UI /api/docs and OpenAPI /api/openapi.json expose auth, role restrictions, model-inferred input/output schemas, success statuses and concise typed expected errors. Use schema-derived sample values rather than hand-authored examples or descriptive JSDoc. Curated payloads and time/business rules remain in api-contracts.md. See architecture.md for the model-driven policy, which supersedes the previous richer Swagger-metadata requirement. Exercise affected endpoints through direct HTTP (curl or small scripts), inspect served OpenAPI programmatically and check /api/docs availability. Swagger UI/Try it out is not mandatory for backend acceptance; browser automation is reserved for actual UI/rendering/accessibility verification.

## UI contract summary

Use ui-flows.md and wireframes/README.md for complete route/layout and accessible behavior. Fixtures in images are historical illustrative data, not hardcoded dates.

- Native styled controls, semantic lists/tables, keyboard/focus/associated errors, no color-only states. Separate start/end labels: spaced dash visual, hidden until for assistive technology without duplicate announcements. Native dialog showModal()/close(), inert background, naming/focus and Escape dismissal.
- Login → /courts after success for either role. JWT sessionStorage survives reload; /api/auth/me restores user while loading. No token normally shows login; invalid/expired session or protected 401 opens /authentication-error with explicit Go to login, not automatic login redirection. Logout clears local state, no backend call. One-hour JWT, no refresh/revocation.
- Courts grid → weekly day/slot selection → separate review. Day radios, hour checkboxes allow one/two consecutive available slots. Booked stays disabled/labeled, past hidden, previous past days disabled. Earliest non-past day selected even when fully booked. Follow backend week links; no Sunday arithmetic or free-day scan in browser.
- Store court/date/week reference in selection URL; review also carries encoded raw startsAt and duration to reconstruct preview on reload. Going back/Change retains court/date/week, reloads availability, and leaves hours unselected. Slot restoration/stale-selection recovery is deferred.
- Preview prepares live price and review. Creation success opens Go to my bookings modal; BOOKING_CONFLICT opens Choose another time modal. Navigate only on the action. Dismissal never retries or navigates. Completed state prevents duplicate submission. Ambiguous connection failure offers checking bookings, without automatic retry.
- My bookings uses server order, display values, canCancel; native cancellation confirmation, then inline announced response update. Expired eligibility: show API explanation and refresh list, no retry.
- Admin grid includes textual active/inactive, Create court, Edit court, availability only on active. Native creation/edit forms; free-text sport, decimal-dollar input converted to cents, separate whole-hour inputs. No visible timezone on forms. Edit Available for bookings applies only on Save changes. Actions outside/below card. Native success modal Go to courts, no auto redirect.
- Daily bookings defaults to server's current day, uses returned root date for input, native date form permits past/future dates, report entries and expected revenue; no editing/cancellation/report export controls.
- Container/presentational separation and Storybook fixtures demonstrate initial/loading/error/empty where applicable/success modal states. No automated frontend test suite. Final small visual token system and sport illustration refinement remain within approved layout; do not add features through visual design.

## Incremental deliveries

Deliver serially unless ownership is explicitly independent. Each feature branch starts from merged main, developer opens PR, reviewer audits actual diff, user merges. Proposed delivery decomposition is execution organization, not extra product scope.

### D0 — Planning consolidation

Branch: planning. Owner: orchestrator. Dependencies: approved discussion. Files: root AGENTS.md/PRODUCT.md, docs/, approved SVG/PNG only. Exclude discarded untracked variants and environment-installed skill directories from the planning PR unless separately needed. Acceptance: no stale contradictory drafts; all local links/JSON examples/canonical artifacts valid; complete plan, task context and ADRs; no application source or candidate README written. Open planning → main PR against c8ce1f8 base. Read-only configured reviewer audits it, user alone merges.

### D1 — Application foundation and database

Branch: application-foundation. Depends on merged D0. Owner: programador; review: revisor. Own root workspace/config/lockfile/compose, backend bootstrap/Prisma/database scripts, minimal frontend bootstrap and Storybook config, supporting documentation. Deliver strict TypeScript scaffolds, exact compatible dependencies, automatic tsoa generation, Swagger mounts, Docker services, conceptual schema, mapped names, versioned btree_gist/exclusion migration, and seed. A minimal frontend shell is acceptable; do not implement product flows here.

Acceptance:

- Record installed package versions and pending stable-compatible pins; generation, typecheck, backend/frontend/Storybook builds run. Assess noted tsoa findings; raise an unresolved compatibility/security conflict rather than calling validation complete.
- docker compose up on fresh volumes starts database/API/frontend and automatically applies migrations and seeds required court/user/admin/booking data; restart preserves application records and does not duplicate seed data. No preparatory commands required. Supply usable frontend/API/Swagger URLs and seeded credentials to the candidate in delivery notes.
- Extension/constraint exist from migrations. Verify a direct conflicting interval is rejected and adjacent intervals accepted against real PostgreSQL. Record actual adapter/Prisma error shape for later 409 mapping rather than assuming all constraint errors are booking conflicts.
- test:unit has no database dependency; test:integration prepares isolated courtly_test with application migrations and never resets the app database. Small test skeleton only until relevant business cases arrive.
- API auth/product endpoints may follow in D2/D3; generation/bootstrap must support adding them without manual generated-file edits. Keep unrelated routes/features out.

### D2 — Authentication and court API

Branch: authentication-and-courts. Depends on D1. Own backend auth/courts modules, associated contracts/metadata, focused tests and docs. Deliver seeded-password authentication, one-hour JWT verification/roles, shared error handler, court collection/create/update and presenters, repository queries, and HTTP client-facing contracts. Do not add facility endpoints, registration, single-court GET, or a generic permission system.

Acceptance:

- HTTP login yields token; me restores user; wrong credentials produce INVALID_CREDENTIALS, protected token failures UNAUTHENTICATED, user court writes FORBIDDEN.
- List filtering/order and empty collection match contracts. Admin create/update validates changed allowlisted fields and final opening interval; deactivation preserves rows, booking history/instants and contracted totals. Prisma snake_case mapping never leaks into JSON.
- Positive integer cents/free-text sport/local whole-hour validation and errors match contracts. All affected routes documented and exercised through direct HTTP with OpenAPI checks; simple tests cover meaningful court opening-rule behavior, no elaborate controller suite.

### D3 — Availability, booking and daily report API: separate PRs

D3 is an umbrella milestone, not one PR. The user approved one PR for each feature below on November 23, 2026. Implement only the authorized subdelivery. Each branch starts from main after the user merges its dependency; do not stack unreviewed implementation. API contracts remain in api-contracts.md and architecture/composition rules remain in architecture.md. Do not implement frontend screens in D3.

#### D3.1 — Weekly availability

Branch: weekly-availability. Depends on merged D2. Own the availability controller, explicit API models, service, repository interface/Prisma implementation, presenter, manual dependency composition, focused tests and necessary stable timezone dependency/lockfile. Deliver only authenticated GET /api/courts/{courtId}/availability. Do not add preview, booking writes/list/cancellation, daily report or database migrations.

Acceptance:

- Match the approved Weekly availability request/response in api-contracts.md exactly: optional weekStart defaults to the current Facility-local Sunday; explicit calendar Sundays only, otherwise shared 422. Missing/inactive court returns approved COURT_NOT_FOUND/404.
- Return seven Sunday-to-Saturday days, ordered one-hour slots inside local opening hours, UTC startsAt and separate English/local display labels. Read the IANA timezone from the court's Facility, not the browser or a hardcoded offset. Calculate slots on demand; persist nothing.
- Confirmed overlapping bookings occupy slots; cancelled bookings do not. Query overlaps using half-open intervals across the UTC bounds of the local week. Past-start slots take precedence over occupancy; isSelectable is false only before the current Facility-local date. No booking owner data, extra timezone/currentDate/minDate fields or slot IDs.
- Previous/next are backend-generated relative adjacent-week links; previous is null when that preceding week is wholly past. A full day remains selectable. No free-day scan or frontend implementation.
- Services consume repository interfaces with required constructor arguments; Prisma calls stay in the concrete implementation, formatting in the presenter, instances in dependencies.ts. Keep model-driven Swagger and minimal comments.
- Add a small set of deterministic service tests for week/default/Sunday validation, Facility-local conversion/opening hours and occupancy/past/navigation. Use repository doubles. Do not claim future booking concurrency/cancellation acceptance here; those tests belong to D3.3/D3.5.
- Regenerate/typecheck/build, run relevant existing/new tests, and exercise availability/auth/validation/404 through direct HTTP against seeded or isolated data, and verify served OpenAPI/documentation availability. Keep fixtures isolated in courtly_test; never reset application data. Record actual commands/results and any limitation.

#### D3.2 — Booking preview

Branch: booking-preview. Depends on merged D3.1. Implement only POST /api/bookings/preview, its typed models/presentation and reusable selection preparation. Creation remains a separate PR.

Acceptance:

- Authenticate with the existing JWT mechanism. Accept only courtId, startsAt and durationHours, with no client user/end/status/price. Return the exact Booking preview representation in api-contracts.md: court id/name/sportType, durationHours and display date/startsAt/endsAt/totalPrice, HTTP 200. No booking ID/status/canCancel or unused raw values.
- Validate existence (COURT_NOT_FOUND/404), activity (COURT_INACTIVE/409), an explicit-offset absolute instant, a strictly future start, Facility-local whole-hour alignment, duration exactly 1 or 2 and the full resulting interval inside the court's daily opening hours. Return shared VALIDATION_ERROR/422 with appropriate fields; preserve the approved startsAt whole-hour message. Respect the supplied instant rather than replacing its zone or rounding it.
- Check confirmed half-open overlaps (existing startsAt < requested end and existing endsAt > requested start); cancelled rows do not block preview and adjacent intervals are valid. Return BOOKING_CONFLICT/409 with the approved message. Keep business validation and queries separate from presentation/HTTP.
- Read timezone from Facility and the current hourly price from Court. Calculate totals using integer cents and format English date, separate local time labels and generic dollar price in the presenter. Use the installed Luxon rather than new dependencies or fixed offsets.
- Keep a small internal preparation function reusable by D3.3: independent of preview HTTP and presentation, returning the validated court, interval and cent total. Do not implement creation or trust/hold a prior preview. Use a feature repository interface/Prisma implementation and manual composition in dependencies.ts; add only read operations needed now.
- Add a small deterministic unit set for the happy path, equivalent offset instants, duration/alignment/future rules, opening interval and confirmed conflict/adjacency. Keep existing tests passing; do not add concurrency/cancellation tests or frontend work in this PR.
- Verify through direct HTTP and served OpenAPI, using isolated courtly_test fixtures. Confirm authentication/errors, the complete response and that repeated previews leave persisted booking counts unchanged. Build with the approved Docker runtime as applicable; preserve the main database, migrations and dependency pins. No browser automation is needed. Record actual results and clean temporary resources.


#### D3.3 — Booking creation and concurrency protection: two review stages

The user explicitly approved a temporary learning exception on November 23, 2026: first review ordinary booking creation without the atomic overlap guarantee, then authorize a separate implementation of that guarantee. This does not remove the challenge's mandatory concurrency requirement or change the final PostgreSQL design. Application-only check-then-insert is intentionally insufficient under concurrency and is not the final solution.

##### D3.3a — Creation before atomic protection (reviewed and merged learning stage)

Branch: booking-creation. Depends on merged D3.2. Implement only POST /api/bookings with the existing selection model and shared preparation. Obtain userId from authentication, freshly revalidate court/interval/current price, persist one confirmed booking with UTC instants and integer-cent contracted total, and return HTTP 201 using the approved personal booking representation. Compute canCancel from ownership/status and the inclusive two-hour boundary; a new booking inside two hours is not cancellable. Keep preview unchanged and read-only. Do not add list/cancellation/report endpoints.

Keep the existing application conflict precheck: an already-persisted overlapping booking still returns BOOKING_CONFLICT/409. However, two concurrent requests can both read no overlap and both persist. Do not add locks, serializable transactions, idempotency infrastructure, an atomic insert guard or database-error conflict mapping in this stage.

The original D1 migration already creates bookings_no_confirmed_overlap. To make this stage genuinely unprotected, add a new forward migration dropping only that named exclusion constraint. Do not edit or delete historical migrations, the btree_gist extension, interval/price checks, foreign keys or indexes. No agent verification may apply migrations or modify data in the main application database; use only an ephemeral courtly_test database.

Acceptance: focused service/presentation tests for identity, fresh preparation, stored price and canCancel; authenticated HTTP 201 and error checks; served OpenAPI/docs; approved Docker build and isolated real-PostgreSQL checks. Adapt the current-state integration check intentionally to demonstrate the vulnerability rather than silently skip the old constraint assertion. A small deterministic test-only barrier may let both real repository prechecks finish before the real inserts, proving two successful creations and two stored overlapping bookings. Do not add production sleeps, race toggles or generic test frameworks. The PR and results must explicitly state that protection is pending, even if this demonstration test passes.

##### D3.3b — Atomic overlap protection (reviewed and merged)

Branch: booking-concurrency-protection. The user merged PR #6 and authorized this follow-up on November 23, 2026. Start from the merged main. Restore the confirmed-only GiST exclusion constraint via a new versioned migration; never rewrite the D1 creation or D3.3a removal migration. The existing btree_gist extension remains in place.

Acceptance:

- Reinstate bookings_no_confirmed_overlap on equal court_id and overlapping tstzrange(starts_at, ends_at, '[)') for confirmed rows only. Preserve adjacent intervals, cancelled-row history, other constraints and indexes. No new API endpoints, request/response fields, dependencies, locks, production race toggles or generic retry/idempotency systems. The sole approved exception is one retry of a booking INSERT after the observed confirmed deadlock rollback, described below.
- Map only the actual named-constraint violation observed with pinned Prisma/@prisma/adapter-pg to ApiError BOOKING_CONFLICT/409 with the approved message. Inspect the structured PostgreSQL SQLSTATE 23P01 and constraint identity in the observed error; do not classify every P2039 or every database failure as a booking conflict. Unknown/unrelated errors must propagate unchanged for normal generic handling. Keep Prisma-specific interpretation at the repository/infrastructure boundary; services must not import Prisma or concrete repositories.
- Recover from the observed Prisma P2034 / driver cause.originalCode 40P01 deadlock with exactly one retry of the same autocommit INSERT, as approved by the user on November 23, 2026. Do not turn deadlock directly into 409: the next actual insert either succeeds or hits the named exclusion violation. Maximum two insert attempts; exhausted deadlock and unrelated errors propagate unchanged. No retry on network/timeout/unknown-commit outcomes, no generic framework/backoff and no frontend mutation retry. Test eligible retry, the attempt limit and negative cases. This supersedes the original blanket no-retry rule only for this confirmed-rollback path.
- Reuse the real-PostgreSQL test-only precheck barrier from D3.3a, changing the observed outcome from two successful overlapping bookings to one success, one BOOKING_CONFLICT and exactly one stored booking. Assert both operations completed and the rejected path is the mapped conflict. A stable test must not depend on which user wins. Add only small real-database partial-overlap/adjacency/confirmed-only checks and focused classifier behavior tests as necessary.
- Keep the application precheck for ordinary sequential feedback; it is advisory, not the concurrency guarantee. Preview remains read-only. Do not change creation/presentation/cancellation eligibility semantics or implement list/cancel/report work.
- Run relevant existing/unit/integration tests, generation/typecheck/build and an approved Docker build. Use isolated PostgreSQL 17.12 courtly_test, direct HTTP (including concurrent creation result/status), and programmatic OpenAPI/docs checks. Record actual named-driver-error evidence without credentials or tokens. No browser automation or main-database migration/data mutation.
- Document the before/after proof and how the database makes INSERT enforce overlap even when both prechecks passed. Do not describe the mandatory concurrency requirement as complete until the migration, mapping and real database test pass and this PR is reviewed/merged.

Real migrated PostgreSQL is authoritative. Restore migration validation must stop on existing conflicting records; never silently delete or cancel application bookings to make it pass. Review any such data explicitly with the user before applying to their application database.

Do not pre-implement this follow-up migration or conflict mapper in D3.3a. Use fresh isolated fixtures for the demonstration. If an application database acquired overlapping rows during D3.3a, restoration requires review of those rows before adding the constraint; never silently delete, cancel or reset application bookings to make the migration pass.

D3.3b has been verified, reviewed and merged as PR #7, completing the creation/concurrency milestone. D3.4 and D3.5 have also been reviewed and merged as PRs #8 and #9. D3.6 daily-booking-report has been reviewed and merged as PR #10, completing D3. The high-fidelity visual screen pack is now authorized; D4 application implementation remains a later delivery.

#### D3.4 — Own bookings

Branch: own-bookings. Depends on merged D3.3b (PR #7). Implement only GET /api/bookings/me. The user approved this delivery on November 23, 2026; cancellation and reporting remain separate PRs.

Acceptance:

- Authenticate through the existing JWT flow and derive the owner from request.user. No client-supplied owner selector or request body. Query the repository with that userId, including for administrators; this endpoint is not the administrator report.
- Return HTTP 200 with { items: [...] } in descending persisted startsAt order, including upcoming, past and cancelled bookings and history of inactive courts. No active-only, confirmed-only or future-only filter. Empty collection is { items: [] }, not 404. No pagination or new filters.
- Each item uses the approved personal booking representation: id, court id/name, machine status, canCancel and display date/separate startsAt/endsAt/timezone/status/totalPrice. Omit raw instants, numeric totals, owner IDs and unused court fields. Use stored totalPriceCents rather than the current court rate, and read timezone from the related Facility.
- Reuse a small shared presenter/response contract and cancellation-eligibility calculation for creation and listing. Preserve the creation 201 payload and preview behavior. For each result, canCancel requires requesting ownership, confirmed status and startsAt at least two hours after the response's server time, with exact equality allowed. Past/cancelled rows remain visible with canCancel false.
- Keep controller/service/repository/presenter boundaries and manual dependency composition. Add only the read method and internal relation types needed for this feature; no concrete repository defaults, generic CRUD abstractions, migrations, new dependencies or cancellation/report endpoints.
- Add a small focused unit set for the owner argument, presentation/stored price, eligibility and empty collection. Verify actual PostgreSQL filtering/descending order through direct HTTP with two authenticated users and isolated courtly_test fixtures, including past/cancelled/inactive-court history. Fetch OpenAPI/docs programmatically; no browser automation.
- Run relevant existing/new unit tests, typecheck/build and the existing concurrency integration tests if shared repository/presenter changes affect their contracts. Verify creation remains compatible. Preserve the main database and stack; clean only owned temporary resources and record actual commands/results and runtime versions.


#### D3.5 — Booking cancellation

Branch: booking-cancellation. Depends on merged D3.4 (PR #8). The user approved this delivery on November 23, 2026. Implement only PATCH /api/bookings/{bookingId}; reporting and frontend work remain separate PRs.

Acceptance:

- Require the existing JWT flow and accept only { status: "cancelled" }. Derive the requesting user from request.user; do not accept owner, court, dates, price or restoration to confirmed. Use typed tsoa input and the existing error envelope, without a parallel validation layer.
- Load the booking through the repository, return BOOKING_NOT_FOUND/404 when absent, and enforce ownership before cancellation-window or idempotency decisions. Another owner, including an administrator, receives FORBIDDEN/403. This endpoint is not an administrative cancellation feature.
- If already cancelled, return its current personal representation with HTTP 200 and canCancel false, without another write, even if the original start is now in the past or less than two hours away. Never let the client-supplied or previously returned canCancel authorize a mutation.
- For a confirmed booking, freshly enforce the inclusive two-hour boundary with the shared eligibility rule: before and exactly at the cutoff succeed; after the cutoff returns CANCELLATION_WINDOW_CLOSED/409 with an understandable explanation. Preserve ordinary inactive-court history; court activity is not an additional cancellation condition.
- Change only status to cancelled, keep the row and its owner/court/UTC interval/contracted total, and return HTTP 200 using the existing shared personal presenter/BookingResponse. Return status cancelled, display.status Cancelled and canCancel false; no raw timestamps/numeric prices or new fields. Preview, creation and own-list contracts remain compatible.
- Keep controller/service/repository boundaries, required interface injection and manual composition. Add only needed booking lookup/status-update methods, no generic CRUD layer, dependencies or migrations. Preserve the restored confirmed-only exclusion constraint and the narrowly approved INSERT deadlock retry; do not extend that retry to cancellation.
- Add a small deterministic unit set around before/exactly/after the cutoff, missing/foreign ownership and already-cancelled idempotency. A small real-PostgreSQL integration check must show the cancelled row remains and the same interval can be booked again by another user, with price/history preserved. Keep existing concurrency coverage intact.
- Verify actual auth, 200/403/404/409/422 cases, response, idempotent repeat and OpenAPI/docs through direct HTTP against ephemeral PostgreSQL 17.12 courtly_test. Use gh CLI for the PR; no browser/Swagger automation. Run focused existing/new tests, typecheck/build, preserve the main database/stack and clean only owned temporary resources. Record actual commands/results and runtime versions.


#### D3.6 — Daily booking report

Branch: daily-booking-report. Depends on merged D3.5 (PR #9). This delivery is authorized; D3 remains incomplete until its review and user merge. Implement only admin GET /api/reports/daily-bookings. Omitted date defaults to the current Facility-local day; supplied exact YYYY-MM-DD uses local midnight-to-next-midnight UTC bounds. Include all courts/inactive courts and confirmed/cancelled rows, ordered by start. Sum stored confirmed totals only and use approved presentation without timezone/display.status. Focused date/revenue/role checks and direct HTTP and OpenAPI verification.

D3 is complete only after all six feature deliveries, including both D3.3 review stages, have been reviewed and merged by the user. Each PR reports its own acceptance and does not claim future subdelivery tests passed. Preserve model-driven Swagger, manual composition and simple focused validation throughout. D4 continues to depend on completion of the full D3 milestone.

### D4 — Frontend foundation, authentication and court grid

The user approved the complete high-fidelity pack with outlined-danger buttons. Use root DESIGN.md, design-system.md, frontend-plan.md and the local mockups/aguinha/REVIEW.md. The implementation tool is existing web Tailwind, not Mantine. The complete frontend dispatch/transport/assets/ownership/manual-check contract is in frontend-plan.md. PR #11 is merged; deliver D4 as three dependent PRs below. Add routes with the screen/integration being developed, not all future screens up front.

#### D4.1 — Frontend visual foundation

Branch: `frontend-visual-foundation`. Depends on merged D3 and design PR #11. Implement the local DS/Tailwind tokens, assets, small native presentation primitives, responsive shell view, court card/grid views and isolated Storybook fixtures. Do not add product routes, auth, proxy or live API behavior. Presentation accepts props/callbacks and contains no fetch, session access or router hooks.

Acceptance: local fonts/photos/fallback and outlined danger match the approved DS; shell and court views render in Storybook from fixtures; application and Storybook builds pass; inspect keyboard semantics and 390/1440px layouts. No automated frontend tests.

#### D4.2 — Authentication screens and routes

Branch: `frontend-authentication`. Depends on user's merge of D4.1. Implement login/authentication-error/access-denied views and stories, shared HTTP/error handling, token-only sessionStorage and auth state/provider. Add React Router composition and only `/`, `/login` and `/authentication-error` behavior needed by these screens. Configure same-origin Vite dev and preview proxy plus Compose `API_PROXY_TARGET`. Keep route/page integration out of the props-only views. Until D4.3 supplies the courts route, successful login renders a minimal authenticated handoff at `/` with a sign-out action; D4.3 replaces that temporary state with the approved courts redirect. Do not add a nonfunctional courts route or show fixture courts as live data.

Acceptance: valid/invalid seeded login, reload via `/api/auth/me`, logout, explicit protected-401 login action and 403 view match contracts; before D4.3, login success reaches only the temporary authenticated handoff, not a fake courts page. Proxy works in dev and Compose preview; Storybook views work with fixture props and no router/API context; builds pass and native labels/autocomplete/focus/mobile layout are inspected. No automated frontend tests.

#### D4.3 — Courts screen and protected navigation

Branch: `court-browsing`. Depends on user's merge of D4.2. Add the courts collection API/container and `/courts` route, route guards, root redirect and finished role-aware shell. The presentation view remains isolated; integration owns API, loading/error/empty state and navigation. Login lands both roles on courts. Users see active courts; admins can see inactive status/history but cannot open availability for inactive courts. Do not add D6 routes or dead admin destinations.

Acceptance: direct `/courts` load and refresh restore auth and fetch the correct role-aware data; API failures are recoverable; inactive courts are not bookable. Do not show an active-court booking link until its D5 destination exists. Shell and grid states have Storybook fixture stories; builds, keyboard/focus and 390/1440px layouts are verified manually. No automated frontend tests.

D4 completes only after the user has reviewed and merged all three PRs. D5 depends on merged D4.3. Do not combine the dependent deliveries or implement booking/admin screens early.

### D5 — User booking flow and own bookings

Branch: booking-interface. Depends on D4.3. Own frontend selection/review/result dialogs/own-booking/cancellation containers, hooks, views, API functions, stories and associated docs.

Acceptance:

- Week links drive API requests and URL state; changing day uses loaded slots. Show Sunday-first strip, earliest non-past day, disabled booked and hidden past slots. One/two adjacent checkboxes, request raw startsAt unchanged, preview price/result ignores stale responses.
- Direct review reload reconstructs preview; return to selection retains court/date/week but clears hours. Confirm once; success/conflict dialogs and ambiguous network behavior match ui-flows.md. Buttons and breadcrumb positions match canonical layout.
- Own bookings render server order/labels and use canCancel, native confirmation and inline cancellation success. Closed-window conflict explains/refreshes without retry.
- Storybook demonstrates relevant states. Manually walk book one/two hours, occupied conflict, refresh session, return/reselect, cancellation and history; inspect focus/keyboard/dialog dismissal. No need to automate frontend tests.

### D6 — Administrator interface and final acceptance

Branch: court-administration. Depends on D5. Own frontend admin court forms/actions and daily report, related stories, minimal integration fixes and delivery evidence. Backend changes only if needed to resolve a demonstrated contract mismatch and reviewed in the same PR; avoid unplanned refactors.

Acceptance:

- Admin grid shows all courts, active/inactive text and correct availability/edit/create actions; frontend role visibility never grants API access.
- Create/edit forms use native inputs and free sport, preserve values on errors, convert price correctly, send changed PATCH fields, and apply checkbox status only on save. No visible timezone. Success opens native Go to courts modal, explicit navigation only; deactivation preserves history.
- Daily bookings initially calls API without date, fills input using returned date, supports explicit date URL and past/future choices, shows chronological rows/mobile entries and server expected revenue excluding cancelled. Empty day and access errors are understandable; no extra report subsystem.
- Re-run clean-volume Compose startup, restart preservation, relevant backend tests/builds, Swagger and Storybook build, and manual user/admin flows. Record commands/results honestly; fix observed failures, not hypothetical scope.
- Candidate authors README explaining how to clone and start with docker compose up, actual application URLs and seeded credentials, approximately two or three sentences for each choice of React, Express, and PostgreSQL with concrete trade-offs beyond familiarity, the exact concurrency protection mechanism and implementation location, and specific improvements with more time. Orchestrator/reviewer may discuss/review but do not write it for them. Final delivery cannot be called challenge-ready without this candidate-owned step.
- Public repository and incremental history available for candidate review. Candidate prepares AI-use disclosure separately if submitting. Do not submit or merge automatically.

## Command and startup contract

These scripts and startup files already exist. Read their current manifests/Compose values and record actual verification for each delivery; documentation alone is not a passing check:

- Root npm ci with the committed lockfile; root npm run build and npm run typecheck cover both workspaces.
- Root npm run test:unit and npm run test:integration delegate to backend. Unit command never requires a DB; integration command prepares only courtly_test and runs Vitest against PostgreSQL.
- Frontend npm run storybook and npm run build-storybook expose/build approved fixtures.
- Backend development/build commands regenerate tsoa routes/spec automatically, including Docker build; controller changes trigger regeneration during development. Exact watch implementation belongs to D1.
- docker compose up starts complete deliverable and applies migrations/seed without extra setup. Fail startup visibly if initialization fails rather than serving against an uninitialized schema. Test setup is isolated from application startup/data.
- Current Compose mappings and demo seed accounts are recorded in frontend-plan.md and sourced from compose.yaml/backend/prisma/seed.ts. Verify actual overrides and login; mockup fixtures are not runtime values.

## Acceptance evidence and handoff

Each PR body names the concrete delivered behavior, affected contract/spec sections, commands actually run/results, HTTP/OpenAPI and applicable UI/manual checks, and material unresolved limitations. No AI attribution/signatures/co-author trailers in PRs or commits. Review actual changed files and diff, not merely a developer summary. Recheck after fixes. Only the user merges, then start the next dependent branch from merged main.

The root candidate README, package-install/runtime compatibility, noted tsoa applicability review and executed test/manual evidence remain visible delivery checkpoints. Visual tokens and web Tailwind are now approved in design-system.md. Existing wireframes are approved structure, not proof of a running accessible app. Deferred feature improvements are in decisions.md and ADRs; do not implement them as acceptance extras.
