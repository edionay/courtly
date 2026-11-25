# Isolated performance dataset

This environment is only for the approved performance exercise. It uses a separate Compose project and `performance-data` volume. It never changes ordinary `docker compose up` settings.

Start the isolated services:

```sh
docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml up --build -d
```

Prepare only the performance database and generate the large dataset:

```sh
docker compose -p courtly-performance exec -T backend sh -lc 'npm run performance:prepare --workspace backend && npm run performance:generate --workspace backend'
```

Choose exactly 1,000 or 12,000 rows and an anchor Sunday using environment variables for the generator:

```sh
docker compose -p courtly-performance exec -T -e PERFORMANCE_BOOKING_COUNT=1000 -e PERFORMANCE_ANCHOR_DATE=2026-11-29 backend npm run performance:generate --workspace backend
```

The generator validates that `DATABASE_URL` names `courtly_performance` before connecting. It deterministically replaces bookings for its own facility, with stable IDs and fixed user/court identities. It retains the migrated PostgreSQL overlap constraint. The fixed busy-day requests are to be finalized with the k6 scenarios in P2. Normal seeded application data lives in another database.

Stop the isolated services but preserve data:

```sh
docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down
```

Remove this exercise's containers and volume only after explicitly confirming the project name:

```sh
docker compose -p courtly-performance -f compose.yaml -f compose.performance.yaml down --volumes
```

Do not run these commands with another project name or against the normal project. This P1 creates and validates the dataset; k6 measurements and query-plan evidence belong to P2.
