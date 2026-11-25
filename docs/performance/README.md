# Isolated performance dataset

This environment is only for the approved performance exercise. It uses a separate Compose project and `performance-data` volume. It never changes ordinary `docker compose up` settings.

Start the isolated services:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml up --build -d
```

Prepare only the performance database and generate the large dataset (the root-level variables are repeated for each Compose command):

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml exec -T backend sh -lc 'npm run performance:prepare --workspace backend && npm run performance:generate --workspace backend'
```

Choose exactly 1,000 or 12,000 rows and an anchor Sunday using environment variables for the generator:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml exec -T -e PERFORMANCE_BOOKING_COUNT=1000 -e PERFORMANCE_ANCHOR_DATE=2026-11-29 backend npm run performance:generate --workspace backend
```

The generator validates that `DATABASE_URL` names `courtly_performance` before connecting. It deterministically replaces bookings in the isolated database, deactivates unrelated seeded courts, and creates 20 active performance courts. It uses the seeded Alex, Jordan and administrator accounts so the API remains testable; their existing seed credentials are documented in the main development handoff. Records span dates before and after the anchor Sunday. The JSON manifest records counts by court/status, anchor-day population and an empty day. It retains the migrated PostgreSQL overlap constraint. The fixed busy-day requests are to be finalized with the k6 scenarios in P2. Normal seeded application data lives in another database.

Stop the isolated services but preserve data:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down
```

Remove this exercise's containers and volume only after explicitly confirming the project name:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down --volumes
```

Do not run these commands with another project name or against the normal project. This P1 creates and validates the dataset; k6 measurements and query-plan evidence belong to P2.

## k6 runtime smoke

The optional Compose `performance` profile pins the official `grafana/k6:2.4.0` image ([official k6 v2.4.0 release](https://github.com/grafana/k6/releases/tag/v2.4.0), verified November 25, 2026). It does not start during ordinary Compose startup. Script files are mounted read-only and `docs/performance/results` is a host-visible output directory. This configuration slice verifies only the k6 runtime; it does not yet define endpoint requests or measure application performance.

Run the no-network smoke check after starting the isolated services:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml --profile performance run --rm k6 run --summary-export=/results/k6-smoke.json /scripts/smoke.js
```

Check that the command exits successfully and that `docs/performance/results/k6-smoke.json` is created. The smoke script fails its k6 threshold if its runtime check fails. Endpoint scenarios and measurements are delivered in later PRs.
