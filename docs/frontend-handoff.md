# Frontend context handoff

Use this self-contained context prompt only with a separately assigned, explicit frontend task. It supplies repository guidance; it does not authorize a milestone, select a next task or permit replaying a completed delivery. D4.1–D4.3, D5 and D6 are implemented and merged. The candidate writes the root `README.md`; agents may review candidate text but must not author it or submit the challenge.

```text
Work in the Courtly repository at the checkout supplied for this task.

First inspect git status, current branch, current code and relevant PR state with
the GitHub CLI. Preserve unrelated local work. Do not assume historical PRs are
pending. The D4.1–D4.3, D5 and D6 frontend deliveries are already complete; do
not repeat them. Implement only the exact, separately authorized task. If no
task with explicit scope and acceptance criteria was supplied, stop before
editing and report that missing task.

Read AGENTS.md, PRODUCT.md, DESIGN.md, docs/execution-plan.md,
docs/challenge.md, docs/decisions.md, docs/architecture.md,
docs/api-contracts.md, docs/ui-flows.md, docs/frontend-plan.md,
docs/design-system.md, docs/task-briefs.md, and the relevant ADRs. For design
references inspect docs/mockups/aguinha/REVIEW.md. These repository files are
the context; do not depend on prior chats, the Aguinha checkout, a gallery
server or unavailable files.

Current frontend implementation: React with strict TypeScript, existing web
Tailwind, React Router, native fetch and Storybook. `frontend/src/app/AppRoutes.tsx`
contains the delivered routes; feature pages/hooks own integration and
navigation, while presentation views receive props and callbacks and have
fixture stories. Inspect the implementation before changing it. Keep API,
authentication storage and routing out of presentational views. Keep native
controls and `<dialog>.showModal()` behavior. Danger actions use white
backgrounds with red text and red borders. Use local Inter fonts and court
photos/fallback from `frontend/src/assets`; never require the Aguinha checkout.

Honor the existing HTTP/business contracts, role enforcement, sessionStorage
behavior, timezone and money rules, database overlap constraint and error
handling. Do not add a new feature, API field, automated frontend test suite or
mutation retry unless the explicit task authorizes that change. Do not migrate,
reset or modify the application database for verification. Use `courtly_test`
for authorized backend integration checks; use the isolated performance stack
only for a task specifically about that completed exercise.

Follow the configured programmer/reviewer workflow in AGENTS.md for an
authorized implementation. Use a feature-only kebab-case branch, Google-style
commit subject without scope parentheses, and `gh` CLI to open a review PR.
Preserve candidate and other workers' files. Agents do not merge; only the
user merges. Do not write the root README or submit the challenge. Report the
PR URL, commit, actual verification, limitations and any dependency for the
assigned task.
```

The current local Compose defaults are the frontend at `http://localhost:4174`,
the direct API at `http://localhost:3100`, Swagger UI at
`http://localhost:3100/api/docs`, OpenAPI JSON at
`http://localhost:3100/api/openapi.json`, and API health at
`http://localhost:3100/api/health`. The normal Compose frontend proxies `/api`
to `http://backend:3000`; the Vite development proxy defaults to the direct
API's host port and can be adjusted through `COURTLY_API_PORT`. Run Storybook
with `npm run storybook --workspace frontend`; its configured host port is
`6006`. It can also run as the opt-in Compose service with
`docker compose --profile storybook up --build storybook`; set
`COURTLY_STORYBOOK_PORT` if host port 6006 is busy. The default Compose startup
does not start Storybook. Performance Compose uses the separate host ports
3121 and 4191 and is documented in `docs/performance/README.md`.

Compose service logs print the mapped localhost URLs when each service's HTTP
server is listening. The backend lists API, health, Swagger and OpenAPI; the
frontend lists the web app; Storybook's own ready output lists its URL when the
optional profile is active. Host port overrides are reflected in these URLs.

Seeded demo accounts: admin `admin@courtly.test` / `CourtlyAdmin2026!`;
users `alex@courtly.test` and `jordan@courtly.test` / `CourtlyUser2026!`.
These credentials are local demonstration data, not production credentials.
