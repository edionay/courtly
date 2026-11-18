# API contracts in progress

This document records approved contract decisions. It is not a complete endpoint specification. Read it with `challenge.md` and `decisions.md`. Remaining endpoint paths, authentication details, complete error responses, and some response shapes still require finalization.

## Presentation policy

The existing Express backend prepares client-facing representations; do not add a separate BFF service. Keep formatting separate from database models and business calculations.

- Return `display` fields ready for rendering in English, using the facility's `America/Sao_Paulo` timezone and generic `$` amounts with two decimal places.
- Return IDs and machine-readable statuses for client behavior. Add raw values only when a concrete client action requires them.
- Do not make the client reconstruct instants, prices, or status codes from formatted labels.
- Keep UTC instants and contracted monetary values in backend persistence even when presentation responses omit them.
- Facility owns the timezone. A timezone label in `display` is derived presentation context, not a Booking column.

### Rules for placing fields

1. Keep fields outside `display` when they identify resources, provide action inputs, or drive interface behavior. Examples: `id`, resource objects such as `court` and `user`, machine-readable `status`, `canCancel`, and the slot `startsAt` submitted to create a booking.
2. Put derived, formatted, or translated strings inside `display`. Examples: a formatted date, a time-range label, a dollar amount, a status label, or a readable timezone label.
3. Keep original text fields such as `court.name`, `user.name`, and free-text `sportType` outside `display`; being visible on screen does not by itself make a value a display field.
4. Omit fields without a concrete client use. Include both structured and formatted versions only when each has a distinct current use. For example, `status` can drive badge appearance while `display.status` supplies its label; revenue needs only a formatted value when the client merely renders it.
5. Place shared presentation context at the nearest common response level. A daily report can have date/timezone labels once at the root and time-range/status/price labels within each booking.
6. Never use a display label as input to calculations, authorization, comparisons, or API requests. Formatting is an API presentation concern, not a persistence or domain representation.

These rules are approved development guidance. They do not imply new endpoints or a universal response wrapper.

## Authentication behavior in progress

- Use JWT bearer tokens stored in sessionStorage with a one-hour lifetime. Preserve the token across page reloads and send it in `Authorization: Bearer <token>`. Do not implement refresh tokens or automatic renewal. Login and session-restoration response details remain to be finalized.
- Future improvement, outside the current delivery: use an HttpOnly cookie for the JWT with suitable SameSite/Secure settings and CSRF protection. The brief does not mandate this storage strategy. sessionStorage is the approved current trade-off, not protection against token theft through XSS.
- A protected operation returning HTTP 401 leads to a dedicated authentication-error page with an explicit login navigation option. Do not automatically redirect to login. Invalid login credentials are shown on the login form rather than sending the user through an authentication-error navigation loop.
- Logout removes the token from sessionStorage and clears local user state. Issued JWTs remain valid until expiration; token revocation and a backend logout endpoint are outside the current bearer-token flow.

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
    "timeRange": "10:00–12:00",
    "timezone": "São Paulo time",
    "status": "Confirmed",
    "totalPrice": "$100.00"
  }
}
```

The IDs are illustrative, not a choice of identifier format. The example's `canCancel` assumes the owner is requesting it at least two hours before the start.

Do not include raw `startsAt`, `endsAt`, or numeric price fields in this presentation representation merely for potential future use. A single-booking response shape does not imply a separate detail GET endpoint.

The client renders `court.name` and `display` values directly. It uses `id` for actions, `status` for machine-readable state, and `canCancel` to decide whether cancellation is offered. It does not calculate cancellation deadlines.

## Cancellation eligibility

`canCancel` is true only when the requesting user owns the booking, its status is confirmed, and its start instant is at least two hours after the server's current instant. Exactly two hours is eligible.

This field is a presentation hint evaluated when the response is produced. On cancellation, the server independently checks ownership, booking status, and the time window again. A previously returned true value cannot authorize a later invalid cancellation.

## Booking creation data

Availability must retain a machine-readable UTC `startsAt` on each slot, alongside its presentation values. Creating a booking uses the selected instant, rather than parsing its label:

```json
{
  "courtId": "court-1",
  "startsAt": "2026-11-20T13:00:00Z",
  "durationHours": 2
}
```

The server derives the user from authentication and calculates the end instant and contracted price. The client does not supply those values. Complete endpoint and error contracts remain to be finalized.

## Daily bookings report

Approved endpoint: `GET /api/reports/daily-bookings?date=YYYY-MM-DD`.

- Require an authenticated administrator. URL structure does not replace role enforcement.
- Interpret the requested calendar day in `America/Sao_Paulo`.
- List that day's confirmed and cancelled bookings across all courts, including deactivated courts, ordered by start instant.
- Include court and user names for presentation.
- Compute expected revenue from contracted totals of confirmed bookings only. Completed time periods remain included; cancelled bookings contribute nothing.
- Prepare date, time, timezone, status, and monetary labels in the backend. Do not require the frontend to sum prices or format instants.
- This is the mandatory day view, not an export feature or a separate reporting system.

Response field names and the empty-day representation are currently proposals being discussed, not yet approved contracts.
