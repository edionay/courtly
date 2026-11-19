# UI flows in progress

This document records approved interface behavior. Read it with `challenge.md`, `decisions.md`, and `api-contracts.md`. Other screens and remaining implementation details are still being planned.

## Weekly date and slot selection — approved

1. The user selects a court. Fetch its weekly availability without `weekStart` to load the current week using the Facility timezone.
2. Show the backend-formatted Sunday-through-Saturday week heading, previous/next-week buttons, and seven day choices using the response labels. Follow `navigation.previous` and `navigation.next` directly; null disables that navigation direction. Do not calculate week boundaries in the client.
3. Disable day choices whose `isSelectable` is false. Initially select the first non-past day, not the first day with free slots. A future week initially selects Sunday; an occupied day remains selectable. Automatic discovery of a day with free slots is a future improvement.
4. Show only the selected day's slots in chronological order. Keep occupied slots disabled and labeled `Booked`, hide past slots, and do not use time-of-day groupings or slot-length toggles. Slots always last one hour.
5. Switching days in a loaded week does not call availability again. Switching weeks follows the response link and loads its seven days. Changing date/week clears the previous slot selection.
6. Use custom-styled native forms and inputs with visible focus. Day choices can use radios; slot choices use labeled checkboxes in a fieldset. Permit one slot and optionally an immediately adjacent available slot. After two selections, disable other slots; either checked slot can be unchecked. Enable `Continue` for one or two consecutive selections and show `Select up to 2 consecutive hours.`
7. Restore date and selected slots from query parameters when returning from review, validating against fresh availability. Query values do not authorize a booking. On a day with no bookable slots, show an explanation and allow choosing another day/week rather than automatically searching for availability.

Compose displayed time intervals from separate fields. Courts provide `opensAt` and `closesAt`; slots and bookings provide local `display.startsAt` and `display.endsAt`. Use a spaced separator visually and `until` for assistive technology without announcing both. Do not convert slot timestamps to format display times. Send the first selected slot's original raw UTC `startsAt` and the selected duration when creating a booking. Court selection and final review/confirmation are separate steps; their remaining details and failure handling are still under discussion.

## Weekly booking wireframe — approved

The low-fidelity weekly time-selection layout is closed and approved. Canonical editable sources and PNG previews are in `docs/wireframes/`, documented by its README:

- Desktop: `wireframes/weekly-booking-desktop.svg` and `.png`.
- Mobile: `wireframes/weekly-booking-mobile.svg` and `.png`.

Desktop uses a left sidebar with Courts, My bookings, and Sign out; mobile uses a compact header/menu. Above `Choose your time`, use `Courts / Court 1`: Courts links directly to `/courts`, while Court 1 is current non-linked context. Do not add the discarded standalone back link, icon-back alternatives, or Change court link alongside this breadcrumb.

Preserve the approved week strip and slot grid. On desktop place the compact Selected time/price/Continue to review block high on the right, alongside court metadata and hourly price. On mobile retain the selection/price area below the slots. Use the same slot fixture and states in both layouts. The previews illustrate two consecutive selected hours, past days, and occupied slots; they are static planning artifacts, not a functional interface or a completed accessibility test.

The grayscale wireframes approve structure and hierarchy only. Final visual tokens, typography, colors, and production Tailwind components remain a later design block. Use a low-consumption agent with narrow visual context for static wireframes and let the orchestrator review them; application implementation still follows the configured programmer/reviewer workflow.

## Booking review wireframe — approved

Use `wireframes/booking-review-desktop.svg` and `.png`, and `wireframes/booking-review-mobile.svg` and `.png` as the canonical review layouts. Show court and sport, a grouped Date and time section with date, separate start/end display values and duration, and the total price. Put Change at the right of the Date and time section header, with the accessible name Change date and time. Return to selection with the existing query state restored and revalidate availability.

Place Confirm booking outside and below the card: align its right edge to the card's outer right edge on desktop, and use the card's full outer width on mobile. The Courts / Court 1 / Review breadcrumb keeps the existing navigation; Review is current. Do not use the discarded footer-edit alternative. The grayscale artifacts approve layout only; modal layouts and final visual styling remain separate review items.

## Booking result dialogs — approved

The success and occupied-slot modal layouts are approved. Canonical editable sources and previews are `wireframes/booking-review-success-desktop.svg` and `.png`, and `wireframes/booking-review-conflict-desktop.svg` and `.png`.

After successful creation, show Booking confirmed with Go to my bookings. Navigate to `/bookings` only when this action is activated. Preserve a completed state so dismissing the dialog cannot enable another submission.

For an occupied-slot conflict, show Time no longer available with the API message and Choose another time. Stay on review until this action is activated; then return to selection for the same court and date, reload weekly availability, and clear the previous slots. Do not retry automatically or classify every HTTP 409 as an occupied slot; use the error code.

Implement both with native `<dialog>`, `showModal()`, and `close()`, an accessible name, appropriate focus handling, and an inert background. Escape closes only: it does not navigate or retry. After dismissing a conflict, keep its explanation and recovery action available. Static wireframe approval does not replace implementation accessibility checks.

## Court listing wireframe — approved

The court-list entry screen is approved. Use `/courts` and the approved authenticated `GET /api/courts` response. For regular users, list active courts in backend-provided name order. Show name, sport, opening and closing times, and `display.hourlyPrice` with a per-hour label. Do not add filters, pagination, dates, ratings, or availability claims.

The desktop layout uses a grid of court cards, with one column on mobile. Each card shows the same fields and a View availability action. A sport illustration can be considered during visual refinement; it does not introduce a court-image field or change the free-text sport contract. The action navigates to the selected court's booking time-selection step without a week query, letting the backend supply the current week. Its accessible name identifies the court. Reuse separate opening/closing fields and the approved accessible time separator. An empty collection shows No courts available.

Canonical SVG/PNG previews are `wireframes/court-list-desktop` and `wireframes/court-list-mobile`. This approval covers structure and navigation; final visual styling remains a later block.
