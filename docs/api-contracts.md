# API contracts in progress

This document records approved contract decisions. It is not a complete endpoint specification. Read it with `challenge.md` and `decisions.md`. Endpoint paths, authentication details, complete error responses, and the administrator day-view contract still require finalization.

## Presentation policy

The existing Express backend prepares client-facing representations; do not add a separate BFF service. Keep formatting separate from database models and business calculations.

- Return `display` fields ready for rendering in English, using the facility's `America/Sao_Paulo` timezone and generic `$` amounts with two decimal places.
- Return IDs and machine-readable statuses for client behavior. Add raw values only when a concrete client action requires them.
- Do not make the client reconstruct instants, prices, or status codes from formatted labels.
- Keep UTC instants and contracted monetary values in backend persistence even when presentation responses omit them.
- Facility owns the timezone. A timezone label in `display` is derived presentation context, not a Booking column.

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
