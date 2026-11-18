# UI flows in progress

This document records approved interface behavior. Read it with `challenge.md`, `decisions.md`, and `api-contracts.md`. Other screens and remaining implementation details are still being planned.

## Selecting a booking date and slots

1. The user selects a court.
2. Show a date picker initially set to today in the facility timezone, `America/Sao_Paulo`, rather than assuming the browser's local date is the facility date.
3. Request availability for the selected court and date and display that day's one-hour slots. Request the newly selected date whenever the user changes it.
4. Display available and occupied slots, with occupied slots unavailable for selection. Hide slots whose API status is `past`.
5. Allow selection of one or two consecutive available slots. The user reviews a booking summary and confirms the reservation.

Provide a calendar for jumping directly to a date and previous/next-day controls for nearby dates. Disable past dates and prevent the previous-day control from navigating before the facility's current date. The user does not have to inspect intervening days to reach a later date.

Show the facility's time reference once in shared booking-screen context, for example `Times shown in São Paulo time`. Do not repeat a timezone label in each court's `display`; the backend still owns timezone calculations.

When no bookable slots remain, show an explanation and allow choosing another date. Use backend `display` labels for slot presentation; pass the selected first slot's original `startsAt` and the one- or two-hour duration to booking creation.

The current API supplies one date at a time. Do not add automatic next-available searches or availability indicators for every day in the calendar; those are outside the approved delivery. No additional endpoint is implied by this screen design.

The mechanism for supplying the initial facility-local date and the final booking-summary contract still need to be settled while completing the API/UI integration specification.
