# Courtly execution plan

Status: consolidated specification for review on November 21, 2026. Application code is not implemented. This plan authorizes no automatic merge or challenge submission. The candidate must author the root README. Approved product decisions are closed; package/runtime checks and final visual tokens are implementation acceptance work, not evidence that implementation has already passed.

## Start here in another chat

1. Read AGENTS.md, this plan, challenge.md, decisions.md, api-contracts.md, ui-flows.md, architecture.md, wireframes/README.md, and the referenced ADRs. All paths in this document are relative to docs/ unless explicitly root-relative. All are repository files; no chat transcript is required.
2. Treat challenge.md as the mandatory requirement reference, decisions.md as approved project choices, api-contracts.md as normative wire contracts, and ui-flows.md plus canonical SVG/PNG as approved interaction/layout. ADRs explain consequences, not competing contracts. If they conflict, resolve against the latest approved consolidated choice and brief before implementation; do not infer an extra feature from an older image.
3. Establish current repository state with git status, branch, and PR inspection. Local main was deliberately established at root commit c8ce1f8 through a one-time user-approved exception. Planning changes belong on planning and enter main only through its PR. Preserve unrelated local drafts, installed skill folders, and candidate work. Never merge on behalf of the user.
4. Start application delivery only after the planning PR is reviewed and merged by the user. Each dependent delivery starts from the merged base. Use the configured programador and revisor roles with Luna; verify availability and give them the applicable brief in task-briefs.md. Do not silently substitute a model.
5. Keep every delivery small and reviewable. Prefer happy-path implementation; discuss additional edge behavior before adding it. Routine pending dependency pins are delegated: latest stable compatible releases, exact versions/lockfile, no prereleases. Already-approved exact pins are in decisions.md.

## Mandatory outcome

The challenge requires a strict-TypeScript React frontend and separate Express backend, seeded login and API-enforced roles, a deliberately modeled PostgreSQL database, and one-command Docker startup. A user browses courts, selects a court/day and available/occupied one-hour slots, books one or two consecutive hours, sees own future/past bookings, and cancels an owned booking until two hours before start. No past or overlapping bookings, including simultaneous requests. Administrators create/edit/deactivate courts without losing booking history and inspect all courts' bookings for a selected day with expected revenue. At least three courts, two users, one administrator, and several bookings must be seeded. Backend tests must meaningfully cover concurrency, cancellation timing, and opening hours. The public GitHub repository and candidate-written README must explain startup/credentials, choices/trade-offs, concurrency protection, and future improvements. Do not submit the challenge.

The personalized challenge URL/token must never enter public repository files. challenge.md is the complete local structured restatement. Optional realtime, waitlist, and large-data performance bonuses are excluded, as are payments, registration, password recovery, facility CRUD, and a generic permissions framework.

## Approved solution

- npm-workspaces monorepo: root package.json (private), package-lock.json, compose.yaml; frontend/ and backend/ each own a package.json and Dockerfile. backend/prisma owns schema/migrations/seed. No extra monorepo framework.
- Backend feature modules: controller → service → repository → Prisma/PostgreSQL; presenters prepare API display values. Repository interfaces belong in <feature>Repository.ts, Prisma implementations in prisma<Feature>Repository.ts, and services consume the interfaces; see architecture.md. Apply this to existing auth/courts and future implemented features without creating unused repositories. No generic CRUD repository or separate BFF service. Frontend feature modules: container page/hook → feature API → shared HTTP client, with presentational views/forms receiving props/callbacks and rendered independently in Storybook.
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
- tsoa is the single HTTP/OpenAPI source with automatic regeneration in dev/build/Docker. Swagger UI /api/docs and OpenAPI /api/openapi.json expose auth, role restrictions, model-inferred input/output schemas, success statuses and concise typed expected errors. Use schema-derived sample values rather than hand-authored examples or descriptive JSDoc. Curated payloads and time/business rules remain in api-contracts.md. See architecture.md for the model-driven policy, which supersedes the previous richer Swagger-metadata requirement. Exercising affected operations through Swagger is part of acceptance for every API PR.

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

- Swagger login yields token; me restores user; wrong credentials produce INVALID_CREDENTIALS, protected token failures UNAUTHENTICATED, user court writes FORBIDDEN.
- List filtering/order and empty collection match contracts. Admin create/update validates changed allowlisted fields and final opening interval; deactivation preserves rows, booking history/instants and contracted totals. Prisma snake_case mapping never leaks into JSON.
- Positive integer cents/free-text sport/local whole-hour validation and errors match contracts. All affected routes documented/exercised through Swagger; simple tests cover meaningful court opening-rule behavior, no elaborate controller suite.

### D3 — Availability, booking and daily report API

Branch: booking-api. Depends on D2. Own backend availability/bookings/reports modules, repositories/services/presenters, focused mandatory tests, necessary migrations only if justified, and same-PR contract documentation.

Acceptance:

- Weekly/default/Sunday-validation/navigation/day statuses and slots match full example schema; current Facility-local time drives past behavior. Occupied slots reveal no owner. Nonexistent/inactive availability is 404.
- Preview and creation share independent preparation logic, correct absolute instants, opening/future/duration/overlap rules, formatted labels, current-price total, and no draft/hold. Creation remains protected by exclusion constraint under simultaneous requests, with actual overlap mapped to BOOKING_CONFLICT/409.
- Own list ordering/presentation, owner-only cancellation before/exactly/after two-hour cutoff, idempotent already-cancelled response and released interval match contracts. Preserve history/prices.
- Report optional-date default initializes effective root date from server; explicit day uses correct Facility-local midnight-to-next-midnight bounds, includes inactive courts/cancelled rows and sums confirmed stored totals only. No forbidden presentation fields.
- Vitest service cases cover opening hours and cancellation boundaries with deterministic time. Integration against real migrated PostgreSQL proves concurrent creation: one success, one conflict, one stored booking. Small related checks verify partial overlap, adjacency and rebooking after cancellation. Do not add broad edge-case suites.
- Exercise each operation/auth/error through Swagger and keep generated metadata/build commands current.

### D4 — Frontend foundation, authentication and court grid

Branch: frontend-foundation. Depends on D3 (so real API is available). Own frontend shell/routing/auth/HTTP infrastructure, reusable native-styled components/tokens, auth/court presentation and containers, relevant stories and frontend docs. Complete the bounded final palette/type/token and sport illustration treatment while preserving approved layouts; document decisions without adding product requirements.

Acceptance:

- Presentational pages depend on props/callbacks; Storybook renders meaningful states with fixtures and application styles without live API. Build application and Storybook successfully.
- Shared HTTP client attaches JWT, preserves known typed errors/fields, distinguishes connection failures, and falls back to UNKNOWN_ERROR. Routing remains outside it; no mutation auto-retries.
- Login, inline invalid credentials, sessionStorage reload through me, signout, and explicit authentication-error navigation match UI contracts. Backend authorization is not replaced by client role checks.
- Responsive court grid shows approved data and View availability; user sees active courts; admin controls are introduced in D6. No filters/pagination/image API added.
- Manually verify keyboard labels/autocomplete/focus and loading/error/empty states; no automated frontend tests introduced.

### D5 — User booking flow and own bookings

Branch: booking-interface. Depends on D4. Own frontend selection/review/result dialogs/own-booking/cancellation containers, hooks, views, API functions, stories and associated docs.

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

No scripts exist yet; these are names the implementation must provide and verify, not checks claimed to have passed:

- Root npm ci with the committed lockfile; root npm run build and npm run typecheck cover both workspaces.
- Root npm run test:unit and npm run test:integration delegate to backend. Unit command never requires a DB; integration command prepares only courtly_test and runs Vitest against PostgreSQL.
- Frontend npm run storybook and npm run build-storybook expose/build approved fixtures.
- Backend development/build commands regenerate tsoa routes/spec automatically, including Docker build; controller changes trigger regeneration during development. Exact watch implementation belongs to D1.
- docker compose up starts complete deliverable and applies migrations/seed without extra setup. Fail startup visibly if initialization fails rather than serving against an uninitialized schema. Test setup is isolated from application startup/data.
- Read actual port mappings and seed accounts from D1 delivery notes when documenting URLs/credentials; this plan does not invent tested URLs or final secrets.

## Acceptance evidence and handoff

Each PR body names the concrete delivered behavior, affected contract/spec sections, commands actually run/results, Swagger/manual checks as applicable, and material unresolved limitations. No AI attribution/signatures/co-author trailers in PRs or commits. Review actual changed files and diff, not merely a developer summary. Recheck after fixes. Only the user merges, then start the next dependent branch from merged main.

The root candidate README, package-install/runtime compatibility, noted tsoa applicability review, final visual tokens, and executed test/manual evidence remain visible delivery checkpoints. Existing wireframes are approved structure, not proof of a running accessible app. Deferred feature improvements are in decisions.md and ADRs; do not implement them as acceptance extras.
