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

## Administrator court list — approved

These administrator layouts are approved. The same `/courts` frontend route presents role-based controls; authenticated administrators receive all courts in name order from `GET /api/courts`, with authorization enforced by the backend. Status is shown as text, and availability is offered only for active courts. The approved frontend routes are `/courts/new` for creation and `/courts/{id}/edit` for editing. Since no single-court GET API is approved, an edit page refreshed directly would retrieve the collection and find the court by ID. The form itself remains a later design block. Daily bookings is shown in administrator navigation; its destination is left for that later block.

## Court forms and success dialogs — approved

The create and edit forms and their success-dialog layouts are approved. Create sends the five fields through POST; the server sets the court active. Edit preloads structured values from the court collection and sends only changed fields through PATCH, including `isActive` when changed. The availability checkbox reflects either current state and changes it only when saved; turning it off prevents new bookings while preserving existing bookings and history. No new API is required.

Sport is free text. The dollar input represents a decimal amount converted to integer cents, without parsing a formatted display value. Opening times use native time inputs with a one-hour step; off-hour values must not be silently rounded. Show validation and 422 field errors inline. After success, a native confirmation dialog offers Go to courts; only that action navigates to `/courts`. Escape closes the dialog without navigation, while the completed state prevents repeat submission. Failures preserve values on the form, a 401 opens the dedicated authentication-error page, and submission is disabled while pending. Opening hours are interpreted in the facility timezone without displaying a timezone reference on the form.

## Daily bookings — approved

These administrator views and their frontend flow are approved. The route is `/reports/daily-bookings`, with optional `date=YYYY-MM-DD`. Without a date query, immediately load `GET /api/reports/daily-bookings`; the backend defaults to the current Facility-local day and returns the effective date in the existing root `date` field. Initialize the native date input from that value and show the report automatically. With an explicit query, load that date. Past and future dates are permitted. Submitting the form updates the URL and fetches the selected report. Use the structured date rather than parsing a display label or calculating today from the browser clock. The preview's November 20, 2026 is an illustrative current-day fixture.

Display the backend date and expected-revenue labels and each booking's court, user, start, end, and total. Map the raw confirmed/cancelled status to text in the frontend. Time values use separate start and end labels with the accessible “until” separator described above. Expected revenue excludes cancelled bookings: the fixture totals $100.00 plus $80.00, excluding $60.00. A date with no bookings retains the form and shows expected revenue of $0.00 with “No bookings for this date.” Loading and errors preserve the selected date; a 401 opens the authentication-error page and a 403 the access-denied page.

## Authentication — approved

These authentication screens and frontend flows are approved. Routes are `/login` and `/authentication-error`. The sign-in form uses persistent labels, native email and password inputs, `autocomplete="username"` and `autocomplete="current-password"`, visible keyboard focus, and an announced general error for invalid credentials; invalid credentials remain on the form. The example address is illustrative.

On successful sign-in, store the token in sessionStorage, establish user state, and navigate either role to `/courts`. On reload, `/api/auth/me` verifies the session while loading; an invalid or expired session clears local state and opens the authentication-error page. With no token normally, show login. Logout clears local session state and goes to `/login` without an API call. The authentication-error page navigates to login only through Go to login; it does not retry an earlier action or automatically redirect.
