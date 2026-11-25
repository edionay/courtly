# Booking performance measurements

## Result scope

This is a local, single-client, warm-cache experiment. k6 called the production-built backend directly at `http://backend:3000`; the frontend proxy, browser rendering, TLS and connection setup are outside the measured request duration. Each round used one VU, 10 warmups and 100 measured requests for each of weekly availability, the busy administrator report and the empty administrator report. It ran three separate rounds per dataset. Each round had 330 passing response checks and 332 HTTP requests, including two setup logins. There were no failed HTTP requests.

The reported values are k6's per-endpoint measured-only `Trend` metrics in milliseconds. They report each round independently; percentiles are not averaged across rounds. The default aggregate `http_req_duration` includes setup and warmup, so these endpoint-specific Trends are used for comparison. The separate response-byte captures below were diagnostic requests after timing and are not latency samples.

| Bookings | Round | Availability med / p95 | Busy report med / p95 | Empty report med / p95 | Checks | HTTP failures |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 | 1 | 5.68 / 8.33 | 5.98 / 10.60 | 1.36 / 1.76 | 330/330 | 0 |
| 1,000 | 2 | 4.99 / 8.53 | 4.90 / 8.19 | 1.34 / 2.49 | 330/330 | 0 |
| 1,000 | 3 | 5.18 / 7.42 | 4.82 / 7.58 | 1.38 / 2.73 | 330/330 | 0 |
| 12,000 | 1 | 5.53 / 8.23 | 5.54 / 8.43 | 1.20 / 1.90 | 330/330 | 0 |
| 12,000 | 2 | 5.54 / 6.48 | 5.31 / 7.30 | 1.32 / 1.72 | 330/330 | 0 |
| 12,000 | 3 | 5.41 / 6.96 | 5.32 / 8.73 | 1.58 / 3.67 | 330/330 | 0 |

Each response was checked for its expected date/court, status, shape and count before a request could pass. The busy report contained 140 bookings at both sizes; the empty report contained none. Both datasets had 20 courts, three seeded accounts, and retained the database overlap constraint.

## Response sizes and workload comparability

These are UTF-8 body byte counts from separate diagnostic requests. They were captured with Node's `Buffer.byteLength` and validated against the selected manifest.

| Dataset | Weekly availability | Busy report | Empty report | Availability week booked / available slots |
| ---: | ---: | ---: | ---: | ---: |
| 1,000 | 11,989 bytes | 35,215 bytes | 94 bytes | 30 / 75 |
| 12,000 | 11,881 bytes | 35,215 bytes | 95 bytes | 66 / 39 |

The busy-day report workload is held at 140 rows. The weekly availability responses are not byte-for-byte comparable: the 12,000-row fixture has 36 more booked slots in the selected week, changing 36 `available` labels to the shorter `booked` label and reducing the body by 108 bytes. Therefore these timings do not establish a pure history-size scaling comparison for weekly availability. The empty report date also differs between manifests, accounting for its one-byte response difference.

## PostgreSQL query evidence

Actual parameterized Prisma SQL was captured from the isolated PostgreSQL logs in a separate diagnostic run, with SQL logging disabled for all timed rounds. See [prisma-statements-1000.txt](sql/prisma-statements-1000.txt) for the observed statements and bind values, including the users/courts relation reads. No login-by-email statement, password/hash, or JWT was retained there. The capture used a 1,000-row fixture; busy-date and availability parameters are identical at 12,000 rows. The 12,000-row plans in `explain-12000.txt` show those same bindings. The empty-report statement shape and relation reads are reused; its bound time windows are `2026-12-09 03:00:00+00`–`2026-12-10 03:00:00+00` at 1,000 rows and `2027-02-25 03:00:00+00`–`2027-02-26 03:00:00+00` at 12,000 rows, the latter also shown in the 12,000-row EXPLAIN output.

Observed database statement counts per protected HTTP request, including the authentication user lookup:

| Endpoint | Statements | Reads |
| --- | ---: | --- |
| Weekly availability | 4 | Authentication user; court; facility timezone for the court; overlapping confirmed bookings for that court |
| Busy daily report | 5 | Authentication user; facility timezone; day bookings; related users; related courts |
| Empty daily report | 5 | Authentication user; facility timezone; day bookings; empty users relation read; empty courts relation read |

The daily-report repository requests the day bookings and Prisma loads court/user relations as separate queries. The empty result still produced the two `IN (NULL)` relation statements. This is one reason HTTP request time and a single booking-query plan are different scopes.

Representative `EXPLAIN (ANALYZE, BUFFERS)` outputs, captured after `VACUUM FULL` and `ANALYZE` in each isolated dataset, are in [explain-1000.txt](sql/explain-1000.txt) and [explain-12000.txt](sql/explain-12000.txt). These direct SQL plan timings are separate from k6 HTTP samples.

| Query | 1,000 rows | 12,000 rows |
| --- | --- | --- |
| Availability overlap | Bitmap Heap Scan using `bookings_no_confirmed_overlap`; 50 index candidates, 22 rows returned, 28 filtered; 19 shared buffers; 0.449 ms execution | Bitmap Heap Scan using `bookings_no_confirmed_overlap`; 600 candidates, 49 returned, 551 filtered; 165 shared buffers; 0.664 ms execution |
| Busy report day | Sequential scan; 1,000 examined, 140 returned, 860 filtered; 15 shared buffers; 0.131 ms execution | Sequential scan; 12,000 examined, 140 returned, 11,860 filtered; 151 shared buffers; 0.552 ms execution |
| Empty report day | Sequential scan; 1,000 examined, 0 returned; 13 shared buffers; 0.065 ms execution | Index Scan using `bookings_user_id_starts_at_idx`; 0 rows returned; 18 shared buffers; 0.157 ms execution |

For availability, the exclusion GiST index narrows the read to confirmed rows for one court, while the scalar start/end overlap predicates remain filters in these plans. The day report returns the same 140 rows but its busy-date query scans the complete booking table at both sizes. Its plan cost and execution time increase with the table size, while HTTP medians remain around 5–6 ms in these runs. The empty-date plan is not identical across sizes.

The report query is the clearest candidate for a follow-up index/query experiment because it scans all history to select a date. At this dataset size its observed SQL time remains below one millisecond on a warm local cache, and the three HTTP rounds do not show a large latency increase. P4 makes no application or schema change and does not claim a production bottleneck or arbitrary SLO. P5 should decide whether a narrow index experiment is justified, then compare identical fixtures and scenarios before and after.

## Environment and limits

- Measurement window: 2026-11-25 17:05:08–17:06:17 UTC. The three 1,000-row rounds ran 17:05:08–17:05:16 UTC; the three 12,000-row rounds ran 17:06:09–17:06:17 UTC.
- Application source/build: commit `f195c3967eeca73fa4bb766df0f2f17e3abafc05`; backend Docker image built from the repository Dockerfile and runs compiled `dist/src/server.js`. `NODE_ENV` was unset. Per-round `git status` was not captured, so this report does not claim that the worktree was clean. The generator rewrote only the 1,000-row manifest key order; that generated change was restored after measurement. No backend or migration source changed, and the timed request definitions/validators remained at the measured commit. P4 report files were authored after the rounds. A later `handleSummary` change removes setup tokens before summary output without changing requests.
- Host: Apple Silicon ARM64 MacBook Air, macOS 26.6.2, 16 GiB physical memory. Docker Desktop server 25.0.3 allocated 8 CPUs and 8,326,987,776 bytes of memory.
- Runtime: Node.js 24.22.3; PostgreSQL 17.12 (`postgres:17.12-alpine`); Grafana k6 2.4.0 (`linux/arm64`). The backend and database containers had no explicit CPU or memory limits. Timed requests used the internal Compose network and HTTP.
- Isolation and database state: Compose project `courtly-performance`, database `courtly_performance`, dedicated `performance-data` volume. The generator's exact row count was checked before each dataset. `VACUUM FULL` compacted the bookings table after switching sizes (104 kB at 1,000 rows; 1,192 kB at 12,000 rows), and `ANALYZE` ran before each round. No application database or `courtly_test` was migrated, reset or measured.
- The local Docker daemon also had other application projects running. No cause is assigned to the round-to-round variance. These results are a local warm-cache, sequential, single-VU experiment; they do not establish throughput, capacity, browser performance or production latency.

## Reproduction and artifacts

Start and prepare the isolated stack as described in [README.md](README.md), generate the chosen dataset, then set the seeded demo credentials in the shell. The runner rejects any database other than `courtly_performance` and verifies the exact booking count before it starts. It compacts/analyzes the isolated table, runs three rounds, writes raw k6 JSON, removes k6 `setup_data` tokens from summary JSON, and gzip-compresses the raw metrics:

```sh
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" sh docs/performance/run-measurements.sh 1000
USER_EMAIL=alex@courtly.test USER_PASSWORD="$COURTLY_USER_PASSWORD" ADMIN_EMAIL=admin@courtly.test ADMIN_PASSWORD="$COURTLY_ADMIN_PASSWORD" sh docs/performance/run-measurements.sh 12000
```

The custom k6 summary handler removes `setup_data` before any summary is written. The compressed raw metrics contain no JWTs or authorization headers. Response-body bytes are separately reproducible with `capture-response-bytes.mjs`; run it once for each dataset after generating that size, using the same environment variables and `BASE_URL=http://127.0.0.1:3121`.

Final results are in [`results/`](results/): six compressed raw k6 exports, six sanitized summaries, and two response-byte JSON files. The two plan captures and actual SQL/parameters are in [`sql/`](sql/). Early diagnostic runs made with SQL logging enabled and 1,000-row storage not yet compacted were excluded and are not included in these result files.
