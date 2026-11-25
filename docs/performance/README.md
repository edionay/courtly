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

The generator validates that `DATABASE_URL` names `courtly_performance` before connecting. It deterministically replaces bookings in the isolated database, deactivates unrelated seeded courts, and creates 20 active performance courts. It uses the seeded Alex, Jordan and administrator accounts so the API remains testable; their existing seed credentials are documented in the main development handoff. Records span dates before and after the anchor Sunday. The JSON manifest records counts by court/status, anchor-day population and an empty day. It retains the migrated PostgreSQL overlap constraint. Normal seeded application data lives in another database. Full measurements and SQL evidence are in [measurements.md](measurements.md).

Stop the isolated services but preserve data:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down
```

Remove this exercise's containers and volume only after explicitly confirming the project name:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down --volumes
```

Do not run these commands with another project name or against the normal project. P1 creates and validates the dataset; P3 defines endpoint scenarios, and the full measurements and query-plan evidence are in P4 below.

## k6 runtime smoke

The optional Compose `performance` profile pins the official `grafana/k6:2.4.0` image ([official k6 v2.4.0 release](https://github.com/grafana/k6/releases/tag/v2.4.0), verified November 25, 2026). It does not start during ordinary Compose startup. Script files are mounted read-only and `docs/performance/results` is a host-visible output directory. This configuration slice verifies only the k6 runtime; it does not yet define endpoint requests or measure application performance.

Run the no-network smoke check after starting the isolated services:

```sh
COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml --profile performance run --rm k6 run --summary-export=/results/k6-smoke.json /scripts/smoke.js
```

Check that the command exits successfully and that `docs/performance/results/k6-smoke.json` is created. The smoke script fails its k6 threshold if its runtime check fails. This remains a runtime-only smoke; endpoint scenarios and performance results are described below.

## Endpoint scenario validation

The P3 scenario uses the selected manifest and queries three endpoints sequentially: weekly availability for the busy court, the administrator report for the busy day, and the empty-day report. The manifest targets a court with confirmed bookings on the anchor Sunday; the deterministic first court has only cancelled bookings on that day. Setup validates that login returns the expected user and administrator roles before using either token. Each endpoint runs warmup requests tagged `phase=warmup` and measured requests tagged `phase=measured`; login calls run in k6 setup with `phase=setup`. The one-VU scenario preserves a sequential request path. All response checks must pass or the `checks` threshold exits non-zero. The endpoint-specific `*_duration` Trend metrics record only measured requests, excluding setup and warmup; k6 reports median and p95 for these metrics. The default aggregate `http_req_duration` also includes setup and warmup, so use the endpoint-specific Trends for scenario comparisons. The setup token is returned to the virtual user in memory only; k6 exports do not include authorization headers or token values.

Set credentials through the shell environment; do not paste secrets into an exported result or repository file. For a short contract check against the isolated 12,000-row database:

```sh
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml --profile performance run --rm -e USER_EMAIL -e USER_PASSWORD -e ADMIN_EMAIL -e ADMIN_PASSWORD k6 run -e BASE_URL=http://backend:3000 -e DATASET_COUNT=12000 -e K6_SUMMARY_PATH=/results/p3-validation.json -e WARMUP_REQUESTS=1 -e MEASURED_REQUESTS=2 /scripts/scenarios.js
```

The default scenario protocol is 10 warmups and 100 measured requests per endpoint. The short P3 validation command is not benchmark evidence. A custom k6 summary handler removes setup tokens before writing the summary file. For the 1,000-row dataset, generate that size first and set `DATASET_COUNT=1000`.

To verify that an unexpected but successful HTTP response fails the checks threshold, set an intentionally incorrect expected busy count. This command is expected to return a non-zero exit status (k6 exit code 99):

```sh
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml --profile performance run --rm -e USER_EMAIL -e USER_PASSWORD -e ADMIN_EMAIL -e ADMIN_PASSWORD k6 run -e BASE_URL=http://backend:3000 -e DATASET_COUNT=12000 -e K6_SUMMARY_PATH=/results/p3-negative-validation.json -e WARMUP_REQUESTS=0 -e MEASURED_REQUESTS=1 -e EXPECTED_BUSY_BOOKINGS=141 /scripts/scenarios.js
```

## Full measurement protocol (P4)

Generate the requested dataset after the isolated backend has completed startup. Set seeded demo credentials in the shell, then run the isolated three-round measurement runner:

```sh
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" sh docs/performance/run-measurements.sh 1000
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" sh docs/performance/run-measurements.sh 12000
```

The runner verifies the fixed Compose project, database name and exact row count, compacts only the isolated bookings table, runs `ANALYZE` before each round, and fails on unsuccessful response checks. It saves compressed raw k6 metrics; the custom k6 summary handler removes setup tokens before writing summary files. Capture diagnostic response body sizes separately after generating each dataset:

```sh
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" DATASET_COUNT=12000 BASE_URL=http://127.0.0.1:3121 node docs/performance/capture-response-bytes.mjs
```

Review the full result table, limitations, actual Prisma SQL and parameters, query counts, and `EXPLAIN (ANALYZE, BUFFERS)` evidence in [measurements.md](measurements.md). The HTTP measurements call the backend directly and do not measure SQL alone. No optimization was made in P4.
