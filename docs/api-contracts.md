# API contracts in progress

This document records approved contract decisions. It is not a complete endpoint specification. Read it with `challenge.md` and `decisions.md`. Remaining endpoint paths, endpoint-specific error codes, and some response shapes still require finalization.

## Presentation policy

The existing Express backend prepares client-facing representations; do not add a separate BFF service. Keep formatting separate from database models and business calculations.

- Return `display` fields ready for rendering in English, using the facility's `America/Sao_Paulo` timezone and generic `$` amounts with two decimal places.
- Return IDs and machine-readable statuses for client behavior. Add raw values only when a concrete client action requires them.
- Do not make the client reconstruct instants, prices, or status codes from formatted labels.
- Keep UTC instants and contracted monetary values in backend persistence even when presentation responses omit them.
- Facility owns the timezone. A timezone label in `display` is derived presentation context, not a Booking column.
- Never return combined time-interval strings or `display.timeRange`. Court opening-hour presentation reuses existing `opensAt` and `closesAt`, without duplicate display fields. Slots, personal bookings (creation, listing, cancellation), and daily-report items use separate local `display.startsAt` and `display.endsAt` strings. The client composes a spaced visual separator and accessible `until` text, hiding the visual separator from assistive technology and the accessible separator from visual presentation. This is presentation composition, not timezone conversion or parsing combined labels. Do not add raw booking timestamps just for this presentation.

### Rules for placing fields

1. Keep fields outside `display` when they identify resources, provide action inputs, or drive interface behavior. Examples: `id`, resource objects such as `court` and `user`, machine-readable `status`, `canCancel`, and the slot `startsAt` submitted to create a booking.
2. Put derived, formatted, or translated strings inside `display`. Examples: a formatted date, separate local start/end time labels, a dollar amount, a status label, or a readable timezone label where the approved contract requires it.
3. Keep original text fields such as `court.name`, `user.name`, and free-text `sportType` outside `display`; being visible on screen does not by itself make a value a display field.
4. Omit fields without a concrete client use. Include both structured and formatted versions only when each has a distinct current use. For example, `status` can drive badge appearance while `display.status` supplies its label; revenue needs only a formatted value when the client merely renders it.
5. Place shared presentation context at the nearest common response level. The daily report has its formatted date and expected revenue at the root, and separate start/end labels and a price label within each booking. Follow its approved omission of timezone and display-status labels.
6. Never use a display label as input to calculations, authorization, comparisons, or API requests. Formatting is an API presentation concern, not a persistence or domain representation.

These rules are approved development guidance. They do not imply new endpoints or a universal response wrapper.

## Authentication

- Use JWT bearer tokens stored in sessionStorage with a one-hour lifetime. Preserve the token across page reloads and send it in `Authorization: Bearer <token>`. Do not implement refresh tokens or automatic renewal.
- Future improvement, outside the current delivery: use an HttpOnly cookie for the JWT with suitable SameSite/Secure settings and CSRF protection. The brief does not mandate this storage strategy. sessionStorage is the approved current trade-off, not protection against token theft through XSS.
- A protected operation returning HTTP 401 leads to a dedicated authentication-error page with an explicit login navigation option. Do not automatically redirect to login. Invalid login credentials are shown on the login form rather than sending the user through an authentication-error navigation loop.
- Logout removes the token from sessionStorage and clears local user state. Issued JWTs remain valid until expiration; token revocation and a backend logout endpoint are outside the current bearer-token flow.

### Login

`POST /api/auth/login` accepts seeded account credentials:

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

Return HTTP 200 with the token and user:

```json
{
  "accessToken": "...",
  "user": {
    "id": "user-123",
    "name": "Alex Morgan",
    "role": "user"
  }
}
```

The client stores only the token in sessionStorage and keeps the returned user in application state. `role` is `user` or `admin`. Do not add `expiresIn` for a client that neither renews tokens nor displays an expiry countdown. Incorrect credentials return HTTP 401; malformed JSON and invalid fields follow the shared error contract. Example credentials and IDs are illustrative, not final seed values or identifier formats.

### Session restoration

`GET /api/auth/me` requires the bearer token and returns HTTP 200:

```json
{
  "id": "user-123",
  "name": "Alex Morgan",
  "role": "user"
}
```

On page reload with a stored token, show a loading state while requesting `/api/auth/me`. If the token is invalid or expired, use the agreed authentication-error page. When no token exists, present login normally without triggering that error-page flow.

### Role trust boundary

The client uses `role` for navigation and visibility only. The API derives identity and authorization from validated authentication and trusted server-side role information, never from a role or user ID submitted by the client. Enforce administrative permissions and booking ownership on every relevant request. Do not return protected data merely because the interface normally hides it. Validate JWT signatures and expiry rather than only decoding payloads. Keep the two-role model; a generic permission engine or permission-catalog endpoint is outside scope. `canCancel` remains a context-specific presentation hint, not authorization.

## Error contract

All API errors use a machine-readable `code` and an English `message` ready for display. Do not place error messages inside a `display` wrapper. The client must not parse messages to determine behavior.

```json
{
  "code": "BOOKING_CONFLICT",
  "message": "This time slot is no longer available."
}
```

For errors associated with individual input fields, add `fields` containing `field` and `message`. Omit `fields` when there are no field-specific errors.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Check the highlighted fields.",
  "fields": [
    {
      "field": "durationHours",
      "message": "Choose a duration of 1 or 2 hours."
    }
  ]
}
```

Approved HTTP status mapping:

- 400: malformed JSON.
- 401: incorrect login credentials or a missing, invalid, or expired token.
- 403: insufficient role permissions or attempting to cancel another user's booking.
- 404: court or booking not found, or availability requested for an inactive court.
- 409: booking overlap, an inactive court blocking a new booking, or a closed cancellation window.
- 422: invalid input fields, a booking in the past, or a booking outside court opening hours.
- 500: unexpected failure; return a generic message and keep technical details in backend logs.

Display form errors and booking conflicts within the current screen. A 401 from a protected operation opens the authentication-error page with an explicit login navigation option; invalid credentials stay on the login form. This contract does not define page navigation for the remaining error statuses.

Normalize tsoa validation errors and handled database/domain errors into this format through the backend error handler. Document applicable errors in OpenAPI in the same PR as each endpoint. Do not expose stack traces, SQL, or credentials in responses. Specific codes other than the illustrated `BOOKING_CONFLICT` and `VALIDATION_ERROR` will be named when completing endpoint contracts.

## Courts and availability

Court representations contain `id`, `name`, `sportType`, `isActive`, `hourlyPriceCents`, `opensAt`, `closesAt`, and `display` with `hourlyPrice` only. Structured price and opening-hour fields support the administrator's edit form. Reuse `opensAt` and `closesAt` for accessible opening-hour presentation. Do not repeat the facility timezone on each court; show the facility's time reference once in the booking screen's shared context.

```json
{
  "id": "court-1",
  "name": "Court 1",
  "sportType": "padel",
  "isActive": true,
  "hourlyPriceCents": 5000,
  "opensAt": "08:00",
  "closesAt": "23:00",
  "display": {
    "hourlyPrice": "$50.00"
  }
}
```

Approved routes: `GET /api/courts`, `POST /api/courts`, `PATCH /api/courts/{courtId}`, and `GET /api/courts/{courtId}/availability` with optional `weekStart`. Users list active courts; administrators list all courts and exclusively create/edit them. The backend associates each court with the seeded facility; no client-supplied facility ID is needed. Deactivate through PATCH with `isActive: false`.

The `GET /api/courts` collection contract is approved: require authentication, accept no request body, and return HTTP 200 with `{ "items": [...] }`, using the court representation above. Return only active courts to users and both active and inactive courts to administrators. Order by court name ascending on the backend. Do not add pagination for this delivery. Empty results return `{ "items": [] }` with HTTP 200.

### Court creation

The `POST /api/courts` block is closed and approved for authenticated administrators. All of these request fields are required:

```json
{
  "name": "Court 1",
  "sportType": "padel",
  "hourlyPriceCents": 5000,
  "opensAt": "08:00",
  "closesAt": "23:00"
}
```

Require nonempty text for `name` and free-text `sportType`, a positive integer for `hourlyPriceCents`, and facility-local whole-hour opening/closing times with opening strictly before closing. Use the already approved non-overnight fixed daily schedule. Invalid fields return HTTP 422 with the shared error contract and field-specific messages. Enforce administrative permission in the API.

The backend associates the court with the single seeded Facility and sets `isActive: true`; these are not client-selected creation fields. Return HTTP 201 Created with the complete court representation shown above, including the generated ID, structured price/hours, and `display.hourlyPrice` only. Do not include duplicate formatted opening intervals or a timezone label in the court response.

### Court updates

The `PATCH /api/courts/{courtId}` contract is approved for administrators. Accept only changed fields from `name`, `sportType`, `hourlyPriceCents`, `opensAt`, `closesAt`, and `isActive`. An omitted field means unchanged, not deletion or replacement with a default. Reject fields outside the contract, including `facilityId`, through the shared validation error response.

Authenticate and authorize first, then find the court or return HTTP 404. Validate supplied values; for example, `sportType` must be nonempty text. Validate related fields against the proposed final court state: changing only `closesAt` to `07:00` while the existing `opensAt` is `08:00` returns HTTP 422. Apply only supplied fields and return HTTP 200 with the complete updated court representation. Use `{ "isActive": false }` for deactivation. Existing bookings keep their scheduled instants and contracted prices.

Opening and closing times represent recurring facility-local wall-clock times, not UTC instants. Keep values such as `08:00` unchanged in the court's opening-hours rule. On each availability request, combine the selected calendar date, local opening/closing times, and the facility's IANA timezone to calculate that day's absolute slot instants. For example, on November 20, 2026, 08:00 in `America/Sao_Paulo` produces the first slot start `2026-11-20T11:00:00Z`. Do not preconvert recurring opening hours to UTC or persist generated slots. When validating a booking, interpret its absolute interval in the facility timezone and check it against the local opening interval.

## Weekly availability

This request/response block is closed and approved. It replaces the earlier day-at-a-time availability contract; do not retain a competing required `date` query.

The challenge still requires the user to select a court and a date and view that day's slots. Weekly API loading is an implementation strategy: return seven days, but display only the selected day's slots. This does not replace the required daily availability experience with a simultaneous seven-day slot grid.

### Request

`GET /api/courts/{courtId}/availability` requires authentication and no request body. Without `weekStart`, return the current week in the seeded Facility's timezone. Weeks always run Sunday through Saturday, independently of browser locale.

To request another week, use `?weekStart=YYYY-MM-DD`. The supplied date must be a valid calendar Sunday. Invalid dates or other weekdays return HTTP 422 using the shared `VALIDATION_ERROR` contract; for a non-Sunday, use the field message `Choose a Sunday as the start of the week.` Do not silently normalize the input.

A nonexistent or inactive court returns HTTP 404 with `code: "COURT_NOT_FOUND"` and `message: "Court not found or unavailable for booking."` Court management and booking history remain available. A new booking attempt against an inactive court still uses HTTP 409 under its separate contract.

### Response and navigation

Return HTTP 200 with:

- `courtId`, `weekStart`, and `weekEnd`, with date-only boundaries inclusive from Sunday to Saturday.
- `display.weekStart` and `display.weekEnd`: separate formatted date labels for the week heading.
- `navigation.previous` and `navigation.next`: backend-generated relative API links for the adjacent weeks. Use null for `previous` when that adjacent week would be wholly in the past. The client follows links directly and does not calculate Sundays or relative page numbers.
- `days`: exactly seven calendar days in chronological order. Each has `date`, `isSelectable`, `display.dayOfMonth`, `display.weekday`, and `slots`.
- `isSelectable` is false for dates before the facility's current date, true for today and future dates. It does not promise free slots. Do not add `currentDate` or `minDate` to this response; the approved interface uses the day-level states.
- Each day's slots are ordered chronologically and contain a raw UTC `startsAt`, `status`, and separate facility-local `display.startsAt` and `display.endsAt` labels. No raw end instant, slot ID, combined interval label, or booking-owner data is needed.

Read the IANA timezone from Facility. Compute local week/day boundaries and convert them to UTC for the booking query; generate each day's slots from local opening hours and existing bookings. Slots are calculated, not persisted. For slots whose start is before the server's current instant, `past` takes precedence over occupancy. Otherwise a confirmed overlap is `booked`; the remaining slots are `available`. A day with no free slots remains selectable and still shows its occupied slots. Do not automatically find a day with free slots; that is a future improvement.

### Complete illustrative response

This example assumes November 18, 2026 at 09:00 in Sao Paulo and an illustrative court open only from 13:00 to 14:00 daily. Actual courts return every one-hour slot within their opening interval.

```json
{
  "courtId": "court-1",
  "weekStart": "2026-11-15",
  "weekEnd": "2026-11-21",
  "display": {
    "weekStart": "Nov 15, 2026",
    "weekEnd": "Nov 21, 2026"
  },
  "navigation": {
    "previous": null,
    "next": "/api/courts/court-1/availability?weekStart=2026-11-22"
  },
  "days": [
    {
      "date": "2026-11-15",
      "isSelectable": false,
      "display": {
        "dayOfMonth": "15",
        "weekday": "Sun"
      },
      "slots": [
        {
          "startsAt": "2026-11-15T16:00:00Z",
          "status": "past",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-16",
      "isSelectable": false,
      "display": {
        "dayOfMonth": "16",
        "weekday": "Mon"
      },
      "slots": [
        {
          "startsAt": "2026-11-16T16:00:00Z",
          "status": "past",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-17",
      "isSelectable": false,
      "display": {
        "dayOfMonth": "17",
        "weekday": "Tue"
      },
      "slots": [
        {
          "startsAt": "2026-11-17T16:00:00Z",
          "status": "past",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-18",
      "isSelectable": true,
      "display": {
        "dayOfMonth": "18",
        "weekday": "Wed"
      },
      "slots": [
        {
          "startsAt": "2026-11-18T16:00:00Z",
          "status": "available",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-19",
      "isSelectable": true,
      "display": {
        "dayOfMonth": "19",
        "weekday": "Thu"
      },
      "slots": [
        {
          "startsAt": "2026-11-19T16:00:00Z",
          "status": "booked",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-20",
      "isSelectable": true,
      "display": {
        "dayOfMonth": "20",
        "weekday": "Fri"
      },
      "slots": [
        {
          "startsAt": "2026-11-20T16:00:00Z",
          "status": "available",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    },
    {
      "date": "2026-11-21",
      "isSelectable": true,
      "display": {
        "dayOfMonth": "21",
        "weekday": "Sat"
      },
      "slots": [
        {
          "startsAt": "2026-11-21T16:00:00Z",
          "status": "available",
          "display": {
            "startsAt": "13:00",
            "endsAt": "14:00"
          }
        }
      ]
    }
  ]
}
```

On first entry, select the first day with `isSelectable: true` even if its slots are all occupied. Keep occupied slots visible, disabled, and labeled `Booked`; hide past slots. Display only the selected day's chronological slots beneath the seven-day strip. Switching days within the loaded week uses existing data; switching weeks follows the provided link. Clear slot selections when changing day/week. Restore date and selected hours from query parameters when returning from review and revalidate availability. Final booking creation always revalidates rules and relies on the database constraint for concurrency.

## Booking presentation

Use the same booking representation for single-booking responses and items in the user's booking list:

```json
{
  "id": "booking-123",
  "court": {
    "id": "court-1",
    "name": "Court 1"
  },
  "status": "confirmed",
  "canCancel": true,
  "display": {
    "date": "Nov 20, 2026",
    "startsAt": "10:00",
    "endsAt": "12:00",
    "timezone": "São Paulo time",
    "status": "Confirmed",
    "totalPrice": "$100.00"
  }
}
```

The IDs are illustrative, not a choice of identifier format. The example's `canCancel` assumes the owner is requesting it at least two hours before the start.

Do not include raw `startsAt`, `endsAt`, or numeric price fields in this presentation representation merely for potential future use. A single-booking response shape does not imply a separate detail GET endpoint.

Use separate local `display.startsAt` and `display.endsAt` values in all personal booking responses, including creation, listing, and cancellation. They replace the earlier combined `display.timeRange`, allowing the frontend to compose the visual and accessible interval without splitting strings or converting timezones.

The client renders `court.name` and `display` values directly. It uses `id` for actions, `status` for machine-readable state, and `canCancel` to decide whether cancellation is offered. It does not calculate cancellation deadlines.

## My bookings

Approved endpoint: `GET /api/bookings/me`, authenticated with JWT and without a request body. Derive the owner from validated authentication; do not accept another user ID to choose whose bookings are returned.

Return HTTP 200 with `{ "items": [...] }`. Each item uses the approved booking presentation representation, with `canCancel` calculated for the requesting user. Include upcoming, past, and cancelled bookings. Sort by start instant descending on the backend, not by formatted date strings. When no bookings exist, return `{ "items": [] }` with HTTP 200.

## Booking cancellation

Approved request: `PATCH /api/bookings/{bookingId}`, authenticated as the booking owner, with:

```json
{
  "status": "cancelled"
}
```

This replaces the proposed `POST /api/bookings/{bookingId}/cancel`. Use the same partial-resource-update convention as court edits. The request permits only cancellation: do not allow changing court, schedule, owner, contracted price, or restoring status to confirmed.

For a valid cancellation, return HTTP 200 with the shared booking presentation representation, updated to `status: "cancelled"`, `canCancel: false`, and `display.status: "Cancelled"`. Preserve the booking and contracted price in history; release its interval for new bookings through the existing confirmed-only exclusion constraint.

Validate authentication and ownership first. If the booking is already cancelled, return HTTP 200 with its current cancelled representation without changing it, even if its original start is now inside the cancellation window or in the past. This is an approved idempotent retry, not a new cancellation. For a confirmed booking, enforce the inclusive two-hour window regardless of any previous `canCancel` value. The shared HTTP/error contract applies.

### Cancellation eligibility

`canCancel` is true only when the requesting user owns the booking, its status is confirmed, and its start instant is at least two hours after the server's current instant. Exactly two hours is eligible.

This field is a presentation hint evaluated when the response is produced. On cancellation, the server independently checks ownership, booking status, and the time window again. A previously returned true value cannot authorize a later invalid cancellation.

## Booking creation data

Approved request: `POST /api/bookings`, authenticated with the selected JWT bearer flow.

Availability must retain a machine-readable UTC `startsAt` on each slot, alongside its presentation values. The backend calculates the instant using the facility's local opening hours and timezone. The client sends the selected slot's `startsAt` unchanged, rather than generating a timestamp or parsing its display label:

```json
{
  "courtId": "court-1",
  "startsAt": "2026-11-20T13:00:00Z",
  "durationHours": 2
}
```

`durationHours` is 1 or 2. A two-hour booking occupies two consecutive hourly slots as one reservation, not two independent bookings. Slots are calculated availability objects, not persisted entities with IDs.

`startsAt` identifies an absolute instant and must include `Z` or an explicit numeric offset; reject timestamps without an offset. Respect the supplied instant instead of replacing its timezone while preserving the wall-clock numbers. For example, `2026-11-20T16:00:00Z` and `2026-11-20T13:00:00-03:00` represent the same 13:00 start in the facility's timezone. `2026-11-20T13:00:00Z` instead represents 10:00 locally. Explain this distinction with examples in Swagger.

The supplied start must align with a whole-hour slot boundary in the facility timezone: local minutes, seconds, and fractional seconds must be zero. Reject a nonaligned start with HTTP 422; never round or silently change it. Use `code: "VALIDATION_ERROR"`, `message: "Check the highlighted fields."`, and `fields: [{ field: "startsAt", message: "Choose a start time on the hour." }]`. For example, `2026-11-20T13:30:00Z` is invalid for this facility. Enforce this on direct API requests as well as frontend requests. Slot alignment does not replace the other checks for opening hours, duration, past starts, court activity, and overlap.

The server derives the user from authentication and calculates the end instant and contracted price. The client does not supply user ID, end time, price, or status. Endpoint-specific error codes remain to be finalized using the shared error contract above.

### Approved creation response

Return HTTP 201 Created with the booking presentation representation. For a two-hour request beginning at `2026-11-20T16:00:00Z` and a contracted hourly price of 5000 cents:

```json
{
  "id": "booking-123",
  "court": {
    "id": "court-1",
    "name": "Court 1"
  },
  "status": "confirmed",
  "canCancel": true,
  "display": {
    "date": "Nov 20, 2026",
    "startsAt": "13:00",
    "endsAt": "15:00",
    "timezone": "São Paulo time",
    "status": "Confirmed",
    "totalPrice": "$100.00"
  }
}
```

`canCancel` is computed at response time using the agreed ownership, confirmed-status, and inclusive two-hour rule. A valid booking created less than two hours before its start returns `canCancel: false`; do not assume a newly created booking is always cancellable. Creation returns one booking, without a collection wrapper or redundant raw instants/prices.

## Daily bookings report

Approved endpoint: `GET /api/reports/daily-bookings`, with optional `date=YYYY-MM-DD`.

- Require an authenticated administrator. URL structure does not replace role enforcement.
- The approved request has no body. When `date` is omitted, use the current calendar day in the seeded Facility timezone. When supplied, require a valid calendar date in exact `YYYY-MM-DD` format; an empty or invalid supplied value returns HTTP 422. An authenticated non-administrator receives HTTP 403; authentication errors follow the shared 401 contract. This supersedes the earlier required-date decision.
- Always return the effective date in the existing root `date` field, whether supplied or defaulted. With no date query, the client loads the current report and initializes its date input from this value, without calculating today from the browser clock. No additional currentDate field is needed.
- Read the timezone from the single seeded Facility, currently `America/Sao_Paulo`; do not hardcode it in report logic or accept a client-provided timezone. Calculate the selected local day's midnight and the following local day's midnight in that timezone, then convert both boundaries to UTC. Include bookings whose start is at or after the first boundary and before the second. This is consistent with the approved same-day, non-overnight schedule. Derive report display labels using the same facility timezone.
- List that day's confirmed and cancelled bookings across all courts, including deactivated courts, ordered by start instant.
- Include court and user names for presentation.
- Compute expected revenue from contracted totals of confirmed bookings only. Completed time periods remain included; cancelled bookings contribute nothing.
- Prepare date, time, and monetary labels in the backend. Do not require the frontend to sum prices or format instants. Do not expose a timezone field or label in the daily-report response, including its root `display`; the facility timezone remains an internal input to day boundaries and formatting.
- This is the mandatory day view, not an export feature or a separate reporting system.
- Report booking items expose machine-readable `status` only, without `display.status`. The frontend uses `status` for its status presentation. This report-specific decision does not remove the separately approved `display.status` from personal booking representations.

### Approved success response

The daily-report response block is closed. Return HTTP 200:

```json
{
  "date": "2026-11-20",
  "display": {
    "date": "Nov 20, 2026",
    "expectedRevenue": "$100.00"
  },
  "bookings": [
    {
      "id": "booking-123",
      "court": {
        "id": "court-1",
        "name": "Court 1"
      },
      "user": {
        "name": "Alex Morgan"
      },
      "status": "confirmed",
      "display": {
        "startsAt": "10:00",
        "endsAt": "12:00",
        "totalPrice": "$100.00"
      }
    }
  ]
}
```

Return local start and end labels separately so the frontend can compose an accessible interval. Do not include `canCancel`, raw booking timestamps or numeric prices, timezone fields/labels, or `display.status` in this report. The raw root `date` identifies the selected day and is separate from its formatted label.

For a day with no bookings, return HTTP 200 with:

```json
{
  "date": "2026-11-21",
  "display": {
    "date": "Nov 21, 2026",
    "expectedRevenue": "$0.00"
  },
  "bookings": []
}
```
