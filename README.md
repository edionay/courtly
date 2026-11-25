# Courtly
Court booking and management system.

# Requirements
- Docker with Docker Compose.
- Ports 3100 and 4174 available.

## Running the application (Docker environment)

Run the following commands in your terminal:

```sh
git clone https://github.com/edionay/courtly.git
```
```sh
cd courtly
```
```sh
docker compose up
```

Wait for the services to finish starting. 
Database migrations and seed data are applied automatically. The application logs display the available access URLs.

### URLs

- **Frontend:** http://localhost:4174
- **API:** http://localhost:3100/api
- **Health check:** http://localhost:3100/api/health
- **Swagger UI:** http://localhost:3100/api/docs
- **OpenAPI specification:** http://localhost:3100/api/openapi.json

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@courtly.test | CourtlyAdmin2026! |
| User | alex@courtly.test | CourtlyUser2026! |
| User | jordan@courtly.test | CourtlyUser2026! |

### Custom ports

Host ports can be overridden when starting the application:

```sh
COURTLY_API_PORT=3110 COURTLY_WEB_PORT=4184 docker compose up
```

### Storybook (optional)

```sh
docker compose --profile storybook up --build
```

Open http://localhost:6006.

Storybook presents components and UI states using fixtures, independently of API requests.
Make sure port `6006` available if using this optional profile.

## Preventing concurrent double bookings

## Preventing concurrent double bookings

The application checks availability before creating a booking, but two requests can pass this check at the same time. To prevent both from being saved, PostgreSQL enforces the `bookings_no_confirmed_overlap` exclusion constraint.

This constraint rejects overlapping confirmed bookings for the same court. One booking can start exactly when another ends, and cancelled bookings no longer block their time slot. When a conflicting insert is rejected, the API returns HTTP `409` with `BOOKING_CONFLICT`.

The implementation was split into two PRs to make the difference clear:

- [PR #6 — Booking creation](https://github.com/edionay/courtly/pull/6), commit [`7adb0a6`](https://github.com/edionay/courtly/commit/7adb0a6): implemented booking creation and demonstrated why the application check alone was insufficient.
- [PR #7 — Concurrency protection](https://github.com/edionay/courtly/pull/7), commit [`db2179a`](https://github.com/edionay/courtly/commit/db2179a): added database protection and verified that two competing requests produce one successful booking and one conflict.
- Commit [`eb00051`](https://github.com/edionay/courtly/commit/eb00051): simplified the database error handling.

The guarantee lives in the [database constraint](backend/prisma/migrations/20261123010000_restore_booking_overlap_constraint/migration.sql). The [booking repository](backend/src/bookings/prismaBookingRepository.ts) handles database errors, and the [integration tests](backend/tests/integration/booking-creation-race.test.ts) exercise concurrent requests against PostgreSQL.


## Technical choices

### React with TypeScript (instead of Next.js)

I chose React because most of the frontend work involves updating the screen as the user selects dates and times, reviews a booking, or handles a conflict. Since the challenge requires a separate backend, I kept these interactions in a client application that consumes the same API, without adding Next.js server rendering or server-side data fetching. This meant handling routing, loading states, and session restoration explicitly, which was manageable for the number of screens in this project.


### Express with tsoa  (instead of Next.js)

I chose Express because the API has a small number of features, and controllers, services, and repositories were enough to organize them without NestJS modules or a dependency injection container. I added tsoa so request and response types also generate route validation and the OpenAPI documentation, reducing the work needed to keep them aligned. The trade-off is that Express leaves more decisions to the project, so I had to define the structure and wire dependencies myself.

### PostgreSQL with Prisma (instead of MongoDB)

I initially considered MongoDB because I am familiar with it, but preventing overlapping bookings was a stronger reason to choose PostgreSQL: the database can reject conflicting reservations even when two users submit at the same time. I used Prisma to keep database access typed and make it easier to work with users, courts, and bookings in TypeScript. This choice means learning and maintaining some PostgreSQL-specific code, but I preferred that to building the concurrency protection entirely in the application.

## What I would improve with more time

- **Frontend behavioral tests:** add tests for consecutive-hour selection, booking conflicts, and cancellation, covering the main interactions currently checked manually.
- **Visual regression tests:** use the existing Storybook stories as reference states to detect unexpected changes in layout, styles, and responsive behavior.
- **Booking selection recovery:** preserve selected hours when returning from the review page, checking whether they are still available before restoring the selection.
- **Price-change confirmation:** ask the user to confirm again if the court's price changes between reviewing and submitting a booking. Currently, the preview does not lock the price.
