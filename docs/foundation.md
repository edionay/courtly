# Application foundation

This note records the D1 implementation setup. Product endpoints and booking flows are delivered in later increments.

## Workspace versions

The root lockfile pins the following direct dependencies:

- Node runtime and Docker base image: 24.22.3; TypeScript: 5.9.3.
- API: Express 4.22.3, tsoa 6.6.0, Prisma and `@prisma/client` 7.10.1, PostgreSQL 17.12, and Vitest 5.1.1. Supporting direct pins: `@prisma/adapter-pg` 7.10.1, `pg` 8.16.3, `bcryptjs` 3.0.2, and `swagger-ui-express` 5.0.1.
- Web: React and React DOM 19.3.1, Vite 8.3.8, Tailwind CSS and its Vite plugin 4.3.5, and Storybook 10.6.8. Supporting direct pins: `@vitejs/plugin-react` 6.0.1, `@types/react` 19.2.7, and `@types/react-dom` 19.2.3.
- Development support: TypeScript 5.9.3; backend pins `nodemon` 3.1.10, `tsx` 4.20.6, `@types/express` 4.17.25, `@types/node` 24.10.1, `@types/pg` 8.15.5, `@types/bcryptjs` 2.4.6, `@types/jsonwebtoken` 9.0.10, and `@types/swagger-ui-express` 4.1.8. The backend uses `jsonwebtoken` 9.0.3 for HS256 bearer tokens with a one-hour expiry. The package lock records their complete resolved dependency graph.

The frontend plugin's declared peer range includes Vite 8; Storybook's React/Vite peer requirements include React 19, Vite 8, and Storybook 10.6.8. Express 4 uses the matching Express 4 type declarations. The D1 typecheck and builds are the compatibility checks for the installed set.

## Generated API artifacts

`npm run generate:api --workspace backend` runs tsoa routes and OpenAPI generation. Backend dev watches controller source and regenerates before restarting. Backend typecheck and build also regenerate routes/spec and the Prisma client. Docker builds use the same build command. Never edit `backend/generated` by hand; it is ignored build output.

The bootstrap exposes only `GET /api/health`. Swagger UI is available at `/api/docs`, and the generated OpenAPI document at `/api/openapi.json`.

Compose's default host URLs are `http://localhost:4174` for the frontend, `http://localhost:3100` for the API, and `http://localhost:3100/api/docs` for Swagger UI. Override `COURTLY_API_PORT` or `COURTLY_WEB_PORT` if those host ports are occupied.

## tsoa validation assessment

The [upstream tsoa 7 upgrade notes](https://tsoa-community.github.io/docs/upgrading-to-v7.html) describe unbounded work in array and buffer validation fixed after the 6.x line. D1's only tsoa input has no query, path, or body fields, so this finding is not exercised by the bootstrap route. Approved application request bodies use scalar fields and do not accept arrays or buffers. This is an applicability assessment, not a claim that tsoa 6.6.0 contains the fix. Reassess before adding any array or buffer request contract; do not accept those inputs with tsoa 6.6.0 unless a stable compatible resolution is approved.

The registry audit for this exact pin set reports 10 transitive advisories (7 moderate and 3 high). In particular, Prisma 7.10.1's `@prisma/config` pins `effect` 3.20.0, which is in the reported ReDoS range, and tsoa 6.6.0's CLI dependencies are in reported moderate ranges. The audit's suggested Prisma 6 and tsoa 7 release candidate conflict with approved pins and the stable-only rule; neither was substituted. These findings remain for review before broader API implementation.

## PostgreSQL overlap evidence

This records the historical D1 check. The later D3.3a learning stage removed the constraint through a forward migration and was reviewed/merged. D3.3b restores it through another migration; the current-branch verification is recorded below (see execution-plan.md for review/merge acceptance).

The real PostgreSQL integration check confirmed that `btree_gist` and `bookings_no_confirmed_overlap` exist, an overlapping confirmed interval fails, and an adjacent interval is accepted. With Prisma 7.10.1 and `@prisma/adapter-pg` 7.10.1, the observed overlap is a `PrismaClientKnownRequestError` with code `P2039`, `meta.modelName: "Booking"`, and `meta.driverAdapterError.cause` containing PostgreSQL code `23P01` and a message naming `bookings_no_confirmed_overlap`. Map conflicts by the observed driver code and constraint identity; do not classify every `P2039` as a booking conflict. The D3.3b simultaneous-insert experiment additionally observed `P2034` with `cause.originalCode: "40P01"` (deadlock rollback). The approved recovery repeats only that autocommit INSERT once; it does not map deadlock directly to overlap or retry ambiguous outcomes. See decisions.md for the bounded policy.

## Before/after booking concurrency proof

The D3.3a checkpoint (PR #6) let two real repository prechecks both return no conflict, then inserted twice: both operations succeeded and two overlapping confirmed bookings were stored. The D3.3b checkpoint keeps that same test-only precheck barrier and genuine simultaneous INSERTs. With the restored constraint and narrow error handling, one creation succeeds, the other produces BOOKING_CONFLICT/409, and only one booking is persisted. The winner is not predetermined.

The migration chain is preserved: initial constraint creation, the educational removal, then a new restoration migration. PostgreSQL enforces equal-court, confirmed-only half-open interval exclusion during INSERT, independently of which requests passed the earlier application query. Partial overlaps are rejected; adjacent intervals and cancelled history remain valid.

Actual simultaneous INSERTs also exposed a deadlock rollback. The repository permits one retry only for observed Prisma P2034 / driver 40P01, using the same values. A named exclusion violation becomes BOOKING_CONFLICT; deadlock itself does not. The second deadlock or unrelated failure propagates. Network/timeout/ambiguous-commit errors are never retried. Thus the constraint provides integrity, while the bounded retry recovers one known-aborted operation.

At this checkpoint, 49 unit tests and two real-PostgreSQL integration tests passed. A direct HTTP pair from two authenticated users returned 201 and 409, with one stored confirmed booking and the winning user's UTC interval/cent total verified. Docker build used Node 24.22.3; the isolated database used PostgreSQL 17.12. Verification did not apply migrations or modify data in the main application database. If an application database contains overlaps created during D3.3a, restoration must stop for explicit data review rather than delete or cancel records automatically.

## Seeded demonstration data

The seed creates one `America/Sao_Paulo` facility, three courts, three users including one administrator, and three bookings. Upserts use stable facility/user/court identities and stable booking IDs with empty update clauses so normal restarts preserve changed data and do not duplicate the seed rows. Seeded passwords are communicated in the D1 handoff for the candidate's README.

Demo accounts: `admin@courtly.test` / `CourtlyAdmin2026!`; `alex@courtly.test` and `jordan@courtly.test` / `CourtlyUser2026!`.
