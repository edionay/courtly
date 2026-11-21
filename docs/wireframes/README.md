# Weekly booking wireframes

These static grayscale wireframes show the time-selection step after court selection and before review. The SVG files are editable sources; the PNG files are previews. Both layouts use the same illustrative court, Sunday-first week, slots, and selections.

The desktop layout uses a sidebar with Courts active, My bookings, and Sign out. The desktop selected-time card sits beside the court details; on mobile it follows the slots. The mobile layout uses a compact menu for the same navigation. The breadcrumb links Courts to `/courts`; Court 1 is the current, non-linked context.

The fixture shows Wednesday, November 18, 2026, with 13:00–14:00 and 14:00–15:00 selected. Booked slots and other available slots have distinct labels. Once two slots are selected, other available slot controls are disabled until a selection is cleared.

For the eventual implementation, use native checkbox controls for slots and accessible controls for dates and week navigation, with programmatic selected and disabled states and visible keyboard focus. Mark the breadcrumb as navigation and identify the current page. Render each time interval from separate start and end values: hide the visual dash from assistive technology and provide a visually hidden “until” separator instead. The static images illustrate the layout and are not interactive or a substitute for accessibility testing.

## Booking review wireframe — approved

Use `wireframes/booking-review-desktop.svg` and `.png`, and `wireframes/booking-review-mobile.svg` and `.png` as the canonical review layouts. Show court and sport, a grouped Date and time section with date, separate start/end display values and duration, and the total price. Put Change at the right of the Date and time section header, with the accessible name Change date and time. Return to selection with the existing query state restored and revalidate availability.

Place Confirm booking outside and below the card: align its right edge to the card's outer right edge on desktop, and use the card's full outer width on mobile. The Courts / Court 1 / Review breadcrumb keeps the existing navigation; Review is current. Do not use the discarded footer-edit alternative. The grayscale artifacts approve layout only; modal layouts and final visual styling remain separate review items.

## Booking result dialogs — approved

The success and occupied-slot modal layouts are approved. Canonical editable sources and previews are `wireframes/booking-review-success-desktop.svg` and `.png`, and `wireframes/booking-review-conflict-desktop.svg` and `.png`.

After successful creation, show Booking confirmed with Go to my bookings. Navigate to `/bookings` only when this action is activated. Preserve a completed state so dismissing the dialog cannot enable another submission.

For an occupied-slot conflict, show Time no longer available with the API message and Choose another time. Stay on review until this action is activated; then return to selection for the same court and date, reload weekly availability, and clear the previous slots. Do not retry automatically or classify every HTTP 409 as an occupied slot; use the error code.

Implement both with native `<dialog>`, `showModal()`, and `close()`, an accessible name, appropriate focus handling, and an inert background. Escape closes only: it does not navigate or retry. After dismissing a conflict, keep its explanation and recovery action available. Static wireframe approval does not replace implementation accessibility checks.

## Court list — approved

The court-list layouts are approved. The authenticated `/courts` view displays active courts by name from `GET /api/courts` without filters or pagination. The three illustrative cards show the court, sport, opening hours, hourly price, and a View availability action in a three-column desktop grid and one-column mobile layout. A sport illustration is planned for later visual refinement; this does not require a court-specific image API or a sport catalog. That action opens the selected court's weekly booking step without a week query, allowing the current facility-local week to be shown. An empty list may show “No courts available.”

Use a semantic HTML list and links, with each availability link's accessible name including its court and a touch target of at least 44 pixels. Show the existing `opensAt` and `closesAt` values separately with a visual dash hidden from assistive technology and a visually hidden “until” separator. Use the formatted `display.hourlyPrice` value for the price.

## My bookings and cancellation — approved

These layouts and cancellation recovery behaviors are approved. The single list uses the descending order supplied by `GET /api/bookings/me`, with confirmed and cancelled bookings from the past and future. The fixture is illustrative as of November 19, 2026, at 09:00 in São Paulo. Cancellation is allowed exactly two hours before the start as well as earlier; the server-provided `canCancel` controls whether the action appears, without inferring a reason for its absence. The server rechecks eligibility when cancellation is submitted. Time labels use separate start and end values with the accessible “until” separator described above.

The approved confirmation uses a native modal dialog: Escape or Keep booking dismisses it without an API call; only the explicit Cancel booking action submits `PATCH /api/bookings/{id}` with `{ "status": "cancelled" }`. A successful response updates the row on the same page and announces success inline. For a stale eligibility conflict, show the API message and refresh the relevant list, without automatic retry; a 401 opens the dedicated authentication-error page. These recovery behaviors are approved.
