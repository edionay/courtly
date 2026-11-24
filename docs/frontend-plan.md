# Frontend implementation plan

This is the frontend entry point for a fresh chat, agent or coding tool. It is self-contained with the repository documents linked below: no earlier conversation, Aguinha checkout, local gallery server or unavailable screenshot is required. The current request adopts the design system and prepares implementation; it does not start application coding.

## Current state and authority

- D1–D3 are implemented and merged, including PR #10's administrator report. The React frontend remains a bootstrap placeholder with Vite, Tailwind and Storybook tooling.
- The user approved the complete Aguinha-derived mockup pack, with one correction: danger actions have white backgrounds, red text and red borders. The complete local copy is [design-system.md](design-system.md); root [DESIGN.md](../DESIGN.md) points to it.
- Design documentation is delivered in PR #11 on `interface-design`. Inspect its real state before starting D4; if it is not merged, review/update that branch rather than creating a dependent application branch from an older main. This status is a checkpoint, not a permanently hardcoded next task.
- Read [AGENTS.md](../AGENTS.md), [challenge.md](challenge.md), [decisions.md](decisions.md), [architecture.md](architecture.md), [api-contracts.md](api-contracts.md), [ui-flows.md](ui-flows.md), [execution-plan.md](execution-plan.md) and [task-briefs.md](task-briefs.md). These are all committed project context. The challenge owns mandatory scope, approved decisions own choices, API contracts own JSON, UI flows own behavior, and the DS/mockups own appearance. Do not invent features from an illustrative image.
- Only the user merges. Use one PR for each D4, D5 and D6 milestone, each based on the user's merge of its dependency. Do not implement all three at once. Inspect git/PR state to resume existing work without recreating it.

## Implementation choices

Keep strict TypeScript, React/react-dom 19.3.1, Vite 8.3.8, Tailwind CSS/@tailwindcss/vite 4.3.5, Storybook/@storybook/react-vite 10.6.8 and Node 24.22.3. The root lockfile and workspace manifests are authoritative. Preserve approved pins; supporting packages must be latest stable compatible versions, pinned exactly with the root lockfile. Version selection is an implementation check, not an unresolved product decision.

Use Tailwind's CSS-first theme for the project DS and small native React primitives. Mantine is superseded. Do not import NativeWind, gluestack, React Native or Aguinha components. Use React Router in declarative browser mode, native fetch and React context/hooks; a custom routing engine, Redux, a query framework and form/validation framework are unnecessary here. Select and verify the compatible stable router version in D4. Retain the existing Storybook setup rather than replacing the build system.

Use BrowserRouter-style routes and links with URLSearchParams for query state. Keep presentation separate from integration:

- `frontend/src/app/`: application composition, router, protected/admin route boundaries and shell integration.
- `frontend/src/shared/http/`: native-fetch client and normalized errors.
- `frontend/src/shared/ui/`: only actually reused native primitives and display helpers such as the accessible time separator.
- `frontend/src/features/auth/`: auth API/storage boundary, provider/hooks, integration pages and presentational sign-in/error views.
- `frontend/src/features/courts/`: API models/functions, court-grid integration/view, and later admin forms.
- `frontend/src/features/bookings/`: availability/preview/create/own-booking integration, views and dialogs, introduced in D5.
- `frontend/src/features/reports/`: administrator report integration/view, introduced in D6.
- Colocate `*.stories.tsx` and small fixtures with presentational views. `styles.css` owns theme/font/base styling, not business logic.

Names may follow existing conventions, but these responsibilities are fixed. Pages/hooks call feature API functions; API functions call the shared HTTP client. Presentational views receive typed data/state/href/callback props and never fetch, read tokens or use routing hooks. Native links may render supplied href values; integration owns programmatic navigation. Local input state is allowed. Do not import server controllers/services/Prisma models into browser bundles. Keep explicit frontend wire types next to feature APIs, matching [api-contracts.md](api-contracts.md); do not add an OpenAPI client generator or shared fullstack domain framework.

## Asset and visual contract

The full [gallery index](mockups/aguinha/REVIEW.md) links 35 local PNG/SVG studies. Its HTML gallery is optional convenience; implementing the app never requires the mockup renderer or a running gallery server.

Use `docs/mockups/assets/fonts/Inter*.ttf` and the accompanying OFL license as the source for local frontend fonts. Copy into `frontend/src/assets/fonts/` during D4. Copy the approved sport photos and their credits into frontend assets. Match Tennis/Basketball/Padel by trimmed, case-insensitive sport text; unknown sports use the committed `docs/mockups/assets/sport-neutral.svg` (light blue 10:7 surface and blue generic court mark, no photograph) without pretending to be another sport. The actual seed includes Futsal, not Padel. Display actual API names, hours and prices; mockup fixture values are not seed requirements. Do not add photo upload, court-image API fields, filters or ratings.

Implement all token values, radii, shadows, outline-danger variants and responsive behavior from [design-system.md](design-system.md). A regular form Cancel is secondary navigation; Cancel booking is a destructive action. Use one small consistent outline icon set, or the existing authored SVG geometry, never Unicode stand-ins. Do not install an icon dependency unless needed and justified.

## API transport and environment

The browser calls relative `/api/...` URLs on the frontend origin. In D4 configure both Vite dev and preview proxy behavior, preserving the `/api` prefix. Read a server-only `API_PROXY_TARGET` in Vite configuration; it is not a browser secret or a `VITE_` client variable.

- Local frontend with the existing Compose API: default proxy target `http://127.0.0.1:3100`, adjusted when COURTLY_API_PORT is overridden.
- Compose frontend: set `API_PROXY_TARGET=http://backend:3000` on the frontend service. Both browser-visible web and API calls then use the web origin, while Docker resolves backend internally.
- Keep the existing Vite-preview challenge startup; configure its proxy too, not only dev. Do not introduce Nginx or broad backend CORS solely for this integration.
- Existing Compose mappings are web `http://localhost:4174`, direct API `http://localhost:3100`, Swagger `http://localhost:3100/api/docs`; overrides are COURTLY_WEB_PORT and COURTLY_API_PORT. Local Vite dev defaults to 5173; check actual output rather than assuming a free port.
- Never put DATABASE_URL or JWT_SECRET into browser code. This is a local HTTP challenge setup, not a TLS deployment task.

D4 owns the minimal `frontend/vite.config.ts` proxy and frontend-service environment changes in `compose.yaml`; backend contracts and application database initialization remain unchanged. Verify the browser login/court requests through the proxy in both dev and Compose preview. A curl-only check cannot establish browser integration or native accessibility.

## Shared authentication and error behavior

One fetch helper attaches the bearer token for protected calls and normalizes errors before application hooks receive them. Use a discriminated failure shape separating known API codes, connection failures and UNKNOWN_ERROR. Preserve code/message/fields for known errors; unknown bodies use `Something went wrong. Please try again.`. Keep enough transport metadata at the auth/page boundary to handle a protected 401 even with an unexpected response body. Do not make business decisions by parsing messages or generic HTTP 409 alone.

Routing stays outside the HTTP helper. INVALID_CREDENTIALS stays inline on sign-in; protected 401 clears the session and opens `/authentication-error` with an explicit Go to login action. FORBIDDEN presents access denied. Read/list connection failures remain in the current view with a manual recovery action. Abort of an obsolete read/preview is cancellation, not a connection error shown to the user.

Store only the token in sessionStorage; keep user/role in auth state. Login returns user and token. On refresh with a stored token, show a pending restoration state and call GET `/api/auth/me` before protected content; invalid authentication clears the token. A transport failure is not proof that credentials expired: show recovery rather than treating every failed request as 401. No token normally shows login. Logout clears local token/user and navigates to login; there is no logout API. Do not add refresh tokens, remember-me, registration or password recovery.

Never automatically retry a mutation. Disable repeat submit while pending. For ambiguous booking-creation connection failure, do not claim success or failure of persistence; offer checking My bookings before another attempt. Use AbortController or an equivalent simple latest-result guard for changing availability/preview reads; the latest selection alone may populate the UI. Do not abort an already-submitted mutation and then assume it was undone.

## Routes and delivery ownership

### D4 — frontend-foundation

Dependency: merged D3 and merged approved design documentation. Own the app/shared/auth/court-browsing folders, `styles.css`, local assets, related stories, Vite proxy and minimal frontend Compose wiring. No booking or admin functionality in this PR.

Incremental work:

1. Add local DS tokens/fonts and minimal primitives, then the responsive sidebar/header shell and court-grid presentational view with fixtures. Reproduce the approved Courts screen and outlined danger variant in relevant component stories.
2. Add the shared HTTP/auth storage boundary, auth provider, React Router composition and API proxy. Feature functions consume typed JSON models from the existing contract.
3. Connect `/login`, `/authentication-error`, `/courts` and protected/admin access boundaries. Login goes to `/courts` for either role. The initial `/` entry follows the same auth state to login or courts; direct URL reloads must load the SPA correctly.
4. Connect active-court browsing and role-aware shell. The API returns admin courts too; retain inactive history/status when present but do not offer availability for inactive courts. Admin create/edit/report functionality and navigation destinations belong to D6; avoid dead clickable links before they exist.
5. Demonstrate sign-in initial/pending/invalid credentials, court-grid loading/empty/error and representative shell/focus states with isolated Storybook props. Do not require live API, tokens or router globals for views.

Acceptance: successful and failed seeded login, reload restoration, logout, explicit 401 recovery, readable court data/actions and same-origin API in dev/Compose. Verify keyboard labels/autocomplete, focus, mobile menu and 390/1440px layouts. Build the app and Storybook. Capture meaningful screenshots/check evidence; no automated frontend suite is required.

### D5 — booking-interface

Dependency: user's merge of D4. Own booking feature modules/views/hooks/dialogs/stories and only needed shared primitive refinements. Use existing backend endpoints; do not add slot entities or new API fields.

- `/courts/{courtId}/booking/slots`: resolve the court header (name, sport, hours and hourly price) from the existing GET `/api/courts` collection on route entry/reload; availability alone does not contain that metadata. Do not depend on a previously visited grid or add a detail endpoint. Request the default backend week unless URL has weekStart; follow backend navigation links. Select the first non-past day (not the first free day). Changing a loaded day uses existing data. Disable past days, hide past slots and show Booked disabled. One or two adjacent native checkboxes; after two, other choices disable until deselected.
- Keep court/date/week in URL. Send the earliest selected slot's unchanged UTC startsAt and durationHours 1 or 2. Preview price comes from POST `/api/bookings/preview`; discard stale responses and show pending price without submitting incomplete data.
- `/courts/{courtId}/booking/review`: reconstruct selection from URL on direct entry/refresh and call preview again. Change returns to same court/date/week, reloads availability and clears selected hours. Confirm calls POST `/api/bookings` once. Do not add quote locks or expected-price fields.
- Success: native Booking confirmed dialog with Go to my bookings. Conflict only for BOOKING_CONFLICT: Time no longer available and Choose another time. Neither navigates merely by opening or dismissing; preserve completed/conflict state and recovery after Escape. The exact approved query values, dialog labels and accessible behavior are in [ui-flows.md](ui-flows.md).
- `/bookings`: GET `/api/bookings/me`, backend order and formatted values, no invented Completed state or unavailable sport field. Only server canCancel offers cancellation. Both cancellation trigger and confirmation use outlined danger; Keep booking is secondary. PATCH only after confirmation; update from response and announce success inline, without a new success modal. Closed-window conflict explains and refreshes, without automatic retry.

Acceptance: one-/two-hour selection, week/day transitions, deselection, no-hours state, live preview, direct review refresh, explicit result actions, return/reselection, own history and cancellation. Manually verify native dialog focus, Escape/background inertness, keyboard/check states and accessible time separators. Storybook covers the representative ready/loading/conflict/success/empty/error/confirmation states with fixtures. No automatic frontend test suite.

### D6 — court-administration

Dependency: user's merge of D5. Own admin court form/actions, report modules/views/stories, only minimal shared refinements, and final acceptance evidence. No backend refactor unless a demonstrated contract mismatch is explicitly reviewed.

- `/courts`: admin sees all courts/status, Create court, Edit court and View availability only when active. Add Daily bookings navigation now.
- `/courts/new` and `/courts/{courtId}/edit`: use the existing court collection to resolve direct edit loads; there is no court detail GET. Native inputs: name, free-text sport, hourly price ($), whole-hour opens/closes. No timezone/facility/upload/currency field. Send only changed allowlisted PATCH fields. Parse decimal input into integer cents using string parts, not floating multiplication/rounding or display-label parsing. Availability checkbox changes only on Save and explains preserving history/preventing new bookings.
- Court created / Changes saved use native result dialogs with Go to courts and no automatic navigation. Keep failed form values and field errors. Regular form Cancel is blue secondary, not danger.
- `/reports/daily-bookings?date=YYYY-MM-DD`: omitted date calls the API without date and initializes the native date field from response.date. Explicit date accepts past/future days. Use the response's chronological rows and expected revenue; do not sum client prices or add timezone/sport/duration/export/charts. Cancelled rows remain visible and contribute nothing to returned revenue. Loading/error preserve the selected date without showing old results as the new day; empty retains controls and $0.00.

Acceptance: non-admin access denied and API permissions intact; create/edit/deactivate preserve bookings, accurate cents and changed fields; default/explicit/empty report on desktop/mobile; field errors and native result dialogs. Build app/Storybook and verify full seeded user/admin flows. Re-run final Compose startup/restart preservation and relevant backend checks using isolated resources. Candidate authors the root README; agents may review it but must not write or submit it.

## Existing commands and demo data

These commands exist today; successful execution must still be recorded for each changed delivery:

```sh
npm ci
npm run typecheck --workspace frontend
npm run build --workspace frontend
npm run build-storybook --workspace frontend
npm run dev --workspace frontend
npm run storybook --workspace frontend
```

Root `npm run build` includes backend/frontend/Storybook; root `npm run typecheck` covers both workspaces. Backend `test:unit` and `test:integration` scripts are separate. Integrations use only isolated courtly_test. Do not add frontend test scripts or treat stories as automated coverage.

For integrated runtime validation, use `docker compose up --build` with a separate temporary Compose project, ports and volume. Use that project's matching `down` after verification; remove only its owned temporary volume if appropriate. Never reset the user's main application database or stack. Record actual Node version; host 24.13.1 used previously is not proof of execution on pinned 24.22.3.

The current seed defines demo-only accounts in `backend/prisma/seed.ts`: admin@courtly.test / CourtlyAdmin2026!, alex@courtly.test / CourtlyUser2026!, and jordan@courtly.test / CourtlyUser2026!. Read the actual seed and verify login when testing; do not embed these credentials in application code or infer seed hours/prices from mockups. Existing initialization preserves data rather than overwriting application rows.

## Completion and portable handoff

For each milestone: record its actual branch/head and PR, concrete behavior, inspected architecture boundaries, commands/results, manual screenshots/accessibility evidence and limitations. Re-review actual diff after fixes. User merge unlocks the next delivery. No automatic merge, root README authorship or challenge submission.

The specifications are tool-independent. This project's orchestration uses configured programador gpt-6-luna medium and revisor gpt-6-luna high. Verify their availability; another environment must report unavailable profiles rather than silently substitute models or bypass the user's review workflow. Product implementation does not depend on a hidden chat, gallery server, original Aguinha repository or these mockup-rendering tools.

Use [frontend-handoff.md](frontend-handoff.md) for a copyable start/resume prompt. Official implementation references: [React Router declarative mode](https://reactrouter.com/start/declarative/installation), [Vite dev proxy](https://vite.dev/config/server-options#server-proxy) and [Vite preview proxy](https://vite.dev/config/preview-options#preview-proxy). The local specifications above remain authoritative for this project.
