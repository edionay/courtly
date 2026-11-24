# Courtly UI flows

Consolidated approved interaction specification. Read with [challenge.md](challenge.md), [decisions.md](decisions.md), [api-contracts.md](api-contracts.md), and [execution-plan.md](execution-plan.md). Canonical low-fidelity images are indexed in [wireframes/README.md](wireframes/README.md). No browser clock or formatted-label parsing supplies API action inputs.

## Approved visual authority

Use root DESIGN.md and docs/design-system.md with the approved PNG/SVG pack indexed in mockups/aguinha/REVIEW.md. The complete pack is accepted with outlined danger actions: white background, red text and red border for Cancel booking; Keep booking and non-destructive form Cancel remain blue secondary outlines. The existing web Tailwind integration implements these styles. This visual decision supersedes earlier pending-style language and grayscale styling while preserving the interaction rules below. frontend-plan.md is the fresh-agent implementation entry point.

## Weekly date and slot selection — approved

1. The user selects a court. Fetch its weekly availability without `weekStart` to load the current week using the Facility timezone.
2. Show the backend-formatted Sunday-through-Saturday week heading, previous/next-week buttons, and seven day choices using the response labels. Follow `navigation.previous` and `navigation.next` directly; null disables that navigation direction. Do not calculate week boundaries in the client.
3. Disable day choices whose `isSelectable` is false. Initially select the first non-past day, not the first day with free slots. A future week initially selects Sunday; an occupied day remains selectable. Automatic discovery of a day with free slots is a future improvement.
4. Show only the selected day's slots in chronological order. Keep occupied slots disabled and labeled `Booked`, hide past slots, and do not use time-of-day groupings or slot-length toggles. Slots always last one hour.
5. Switching days in a loaded week does not call availability again. Switching weeks follows the response link and loads its seven days. Changing date/week clears the previous slot selection.
6. Use custom-styled native forms and inputs with visible focus. Day choices can use radios; slot choices use labeled checkboxes in a fieldset. Permit one slot and optionally an immediately adjacent available slot. After two selections, disable other slots; either checked slot can be unchecked. Enable `Continue` for one or two consecutive selections and show `Select up to 2 consecutive hours.`
7. When returning from review, retain the court and date from the URL, reload weekly availability, and start with no selected slots. Query values do not authorize a booking. On a day with no bookable slots, show an explanation and allow choosing another day/week rather than automatically searching for availability.

Compose displayed time intervals from separate fields. Courts provide `opensAt` and `closesAt`; slots and bookings provide local `display.startsAt` and `display.endsAt`. Use a spaced separator visually and `until` for assistive technology without announcing both. Do not convert slot timestamps to format display times. Send the first selected slot's original raw UTC `startsAt` and the selected duration when creating a booking. Court selection and review/confirmation are separate steps, with the routes and result behavior below.

Automatic restoration of selected slots after returning from review, including revalidation and a specific stale-selection message, is a future improvement outside this delivery. This supersedes the earlier promise to restore slots. Backend booking validation and database overlap protection remain mandatory.

## Weekly booking wireframe — approved

The low-fidelity weekly time-selection layout is closed and approved. Canonical editable sources and PNG previews are in `docs/wireframes/`, documented by its README:

- Desktop: `wireframes/weekly-booking-desktop.svg` and `.png`.
- Mobile: `wireframes/weekly-booking-mobile.svg` and `.png`.

Desktop uses a left sidebar with Courts, My bookings, and Sign out; mobile uses a compact header/menu. Above `Choose your time`, use `Courts / Court 1`: Courts links directly to `/courts`, while Court 1 is current non-linked context. Do not add the discarded standalone back link, icon-back alternatives, or Change court link alongside this breadcrumb.

Preserve the approved week strip and slot grid. On desktop place the compact Selected time/price/Continue to review block high on the right, alongside court metadata and hourly price. On mobile retain the selection/price area below the slots. Use the same slot fixture and states in both layouts. The previews illustrate two consecutive selected hours, past days, and occupied slots; they are static planning artifacts, not a functional interface or a completed accessibility test.

The grayscale wireframes record structure and hierarchy; the approved high-fidelity pack and local DS now define colors, typography and component styling. Use a low-consumption agent with narrow visual context for static wireframes and let the orchestrator review them; application implementation still follows the configured programmer/reviewer workflow.

## Booking review wireframe — approved

Use `wireframes/booking-review-desktop.svg` and `.png`, and `wireframes/booking-review-mobile.svg` and `.png` as the canonical review layouts. Show court and sport, a grouped Date and time section with date, separate start/end display values and duration, and the total price. Put Change at the right of the Date and time section header, with the accessible name Change date and time. Return to the same court and date, reload weekly availability, and leave the slots unselected.

Place Confirm booking outside and below the card: align its right edge to the card's outer right edge on desktop, and use the card's full outer width on mobile. The Courts / Court 1 / Review breadcrumb keeps the existing navigation; Review is current. Do not use the discarded footer-edit alternative. The grayscale artifacts approve layout only; result dialogs are approved below; the approved high-fidelity pack now supplies the final visual styling.

## Booking result dialogs — approved

The success and occupied-slot modal layouts are approved. Canonical editable sources and previews are `wireframes/booking-review-success-desktop.svg` and `.png`, and `wireframes/booking-review-conflict-desktop.svg` and `.png`.

After successful creation, show Booking confirmed with Go to my bookings. Navigate to `/bookings` only when this action is activated. Preserve a completed state so dismissing the dialog cannot enable another submission.

For an occupied-slot conflict, show Time no longer available with the API message and Choose another time. Stay on review until this action is activated; then return to selection for the same court and date, reload weekly availability, and clear the previous slots. Do not retry automatically or classify every HTTP 409 as an occupied slot; use the error code.

Implement both with native `<dialog>`, `showModal()`, and `close()`, an accessible name, appropriate focus handling, and an inert background. Escape closes only: it does not navigate or retry. After dismissing a conflict, keep its explanation and recovery action available. Static wireframe approval does not replace implementation accessibility checks.

## Court listing wireframe — approved

The court-list entry screen is approved. Use `/courts` and the approved authenticated `GET /api/courts` response. For regular users, list active courts in backend-provided name order. Show name, sport, opening and closing times, and `display.hourlyPrice` with a per-hour label. Do not add filters, pagination, dates, ratings, or availability claims.

The desktop layout uses a grid of court cards, with one column on mobile. Each card shows the same fields and a View availability action. Use the approved local sport photographs and neutral fallback from the DS; this does not introduce a court-image field or change the free-text sport contract. The action navigates to the selected court's booking time-selection step without a week query, letting the backend supply the current week. Its accessible name identifies the court. Reuse separate opening/closing fields and the approved accessible time separator. An empty collection shows No courts available.

Canonical SVG/PNG previews are `wireframes/court-list-desktop` and `wireframes/court-list-mobile`. This approval covers structure and navigation; the approved high-fidelity pack supplies its final visual styling.

## My bookings wireframe — approved

At `/bookings`, render the approved `GET /api/bookings/me` collection in backend-provided descending start order. Use a single list containing upcoming, past, and cancelled bookings. Show court name and the response's date, separate start/end time, timezone, status, and total-price display fields. Do not parse formatted dates to sort or group bookings, invent a Completed status, or add fields such as sport that are absent from this response. Offer Cancel booking only when `canCancel` is true; do not infer a specific ineligibility reason from false. A general cancellation-rule note can explain the inclusive two-hour cutoff.

Approved interaction: Cancel booking opens a native confirmation dialog with court, date, and time, plus Keep booking and Cancel booking actions. Dismissal does not call the API. Only explicit confirmation sends `PATCH /api/bookings/{bookingId}` with `status: cancelled`. Disable repeat submission while pending. On success, update the item from the response and announce cancellation on the same page. The backend revalidates ownership and timing independently of the earlier `canCancel` hint.

For a closed-window error, keep the API explanation visible and refresh the collection to update available actions; do not retry automatically. A protected-operation 401 follows the approved authentication-error page. An empty collection can show No bookings yet. These interaction and recovery details are approved.

Canonical SVG/PNG previews: `wireframes/my-bookings-desktop`, `wireframes/my-bookings-mobile`, and `wireframes/my-bookings-cancel-desktop`. Fixture dates are illustrative, not runtime data.

## Administrator court listing — approved

At `/courts`, administrators receive all courts from the approved `GET /api/courts`, ordered by name, including inactive courts. Reuse the approved desktop grid and single-column mobile layout. Add a textual Active or Inactive status and an Edit court action for each item. Offer View availability only for active courts. Place Create court above the grid. Do not add deletion, filters, pagination, or facility controls.

Approved frontend navigation: Create court opens `/courts/new`; Edit court opens `/courts/{courtId}/edit`. These are frontend routes, not new API endpoints. On a direct edit-page load, the existing collection endpoint can supply the selected court without inventing a detail endpoint. Form layout, saving, and deactivation are specified below.

Administrator navigation retains Courts and My bookings and adds Daily bookings for the required selected-day report; its approved layout is specified below. Backend permissions remain authoritative regardless of visible controls. Canonical artifacts: `wireframes/court-management-desktop` and `wireframes/court-management-mobile` (SVG/PNG). This layout and navigation are approved; form behavior is specified below.

## Court creation and editing forms — approved

Use the approved frontend routes `/courts/new` and `/courts/{courtId}/edit`, with Courts linked in a breadcrumb. Reuse one small form structure: Name and Sport text inputs, Hourly price ($) input, and separate Opens at and Closes at native time inputs restricted to whole hours. Sport remains free text. Do not display a timezone label in these forms. Keep the whole-hour helper; the backend still interprets opening hours using the seeded Facility timezone. No facility selector, upload, description, or currency selector is needed.

Creation submits the five approved fields to `POST /api/courts`; the backend makes the court active. Editing preloads structured values from the existing collection response and sends only changed fields through `PATCH /api/courts/{courtId}`. Convert the decimal price entered in dollar units to integer cents without parsing `display.hourlyPrice` or depending on floating-point rounding. Do not silently round off-hour time inputs. Validate the resulting opening interval on the backend, including unchanged counterparts.

Approved status control on edit only: a native Available for bookings checkbox, initialized from `isActive`. A helper explains that disabling prevents new bookings while preserving existing bookings and history. Checkbox changes remain local until Save changes; do not immediately send a request or add a separate confirmation modal. This status-control design is approved.

Place Cancel and the primary Create court or Save changes action outside and below the form card, with the primary right-aligned on desktop. Cancel returns to `/courts`. After successful creation or editing, show a native success dialog with Go to courts. Navigate to `/courts` only when this action is activated, without automatic redirection. Escape only dismisses the dialog; preserve a completed state so dismissal cannot repeat the successful submission. Failed validation remains in the form, retaining values and showing applicable API field messages. Disable repeat submission while pending. Protected-operation 401 uses the approved authentication-error page. The forms, status control, success-dialog layouts, and navigation behavior are approved.

Form artifacts: `wireframes/court-create-desktop`, `court-create-mobile`, `court-edit-desktop`, and `court-edit-mobile` (SVG/PNG). Canonical result previews are `wireframes/court-create-success-desktop` and `court-edit-success-desktop` (SVG/PNG). Native inputs remain required in implementation; images illustrate their layout only.

## Daily bookings wireframe — approved

Approved frontend route: `/reports/daily-bookings`, with optional `date=YYYY-MM-DD`, reached from administrator navigation. Use a native date input and View bookings submit button. On entry without a date, request `GET /api/reports/daily-bookings` immediately: the backend defaults to the current calendar day in the Facility timezone. Initialize the date input from the existing root `date` in the response and show that day's report automatically. Do not calculate today using the browser clock. With an explicit date in the URL, load that date instead. Allow past and future calendar dates. Submitting a date updates the URL and loads that day's report. The API date parameter is now optional, superseding its earlier required-date decision; malformed supplied dates still return 422.

Display the server's formatted date and expectedRevenue, plus all report items in backend-provided chronological order. Use a semantic table on desktop and stacked entries on mobile. Each entry shows separate start/end time labels, court name, user name, status text mapped from the machine-readable status, and totalPrice. Do not add timezone, sport, duration, cancellation actions, or display.status to this contract. Cancelled items remain visible but contribute nothing to the backend-calculated expected revenue. State this plainly near the total; the client does not sum amounts.

Keep the selected date visible during loading and errors, and do not present a previous date's result as the newly selected one. Follow the approved protected-operation authentication-error flow for 401 and show access denied for 403. Empty results retain the date controls, show the returned $0.00 expected revenue, and say No bookings for this date. No exports, charts, pagination, or additional filters are proposed.

Canonical artifacts: `wireframes/daily-bookings-desktop` and `daily-bookings-mobile` (SVG/PNG). Layout, frontend route, current-day default, and interaction details are approved. The preview date is an illustrative current-day fixture, not a hardcoded default.

## Authentication wireframes — approved

Approved frontend routes are `/login` and `/authentication-error`. These unauthenticated screens show the Courtly brand without the authenticated sidebar/menu. Sign in uses native email and password inputs with persistent labels, appropriate autocomplete, and a submit button. Do not add registration, password recovery, role selection, remember-me controls, or new authentication providers.

Submit `POST /api/auth/login` with email and password. Invalid credentials stay on the login form with an announced, understandable error. Field validation appears by its input; pending submission prevents duplicates. Successful login stores only the token in sessionStorage, retains the returned user in application state, and navigates to `/courts` for either role. Authentication does not use a success modal.

A protected-operation 401 clears invalid local authentication and opens `/authentication-error`, with Authentication required, a short explanation, and Go to login. Only that explicit action navigates to `/login`; do not automatically redirect there or retry the failed operation. Login credential errors do not use this route. Reload with a stored token shows loading while `/api/auth/me` restores the user; invalid/expired authentication follows this error page. With no token, present login normally. Sign out clears local authentication and returns to `/login`, without a backend logout call.

Use appropriate focus and announcement for page transitions, form errors, and loading. Do not expose technical tokens or raw HTTP codes as product explanations. Canonical SVG/PNG previews: `wireframes/login-desktop`, `login-mobile`, `login-invalid-desktop`, `authentication-error-desktop`, and `authentication-error-mobile`. Layout, route names, and navigation details are approved along with the underlying authentication contracts.

## Route and data lifecycle

Frontend routes are independent of API endpoints:

- /login and /authentication-error: unauthenticated screens.
- /courts: user/admin court collection; role changes controls, never API authorization.
- /courts/new and /courts/{courtId}/edit: admin forms, with direct edit reload supplied by GET /api/courts.
- /courts/{courtId}/booking/slots: selected court's weekly availability. Preserve selected date and, when navigating away from the default week, the weekStart provided by the backend links as URL state. On reload request that week rather than calculating its Sunday in the browser. Changing day in the loaded week does not fetch another period; changing week follows navigation links.
- /courts/{courtId}/booking/review: preserve date, selected slot's offset-bearing startsAt, durationHours, and the current week reference in query parameters. URL encoding is required for timestamps. These are untrusted selection inputs, not an authorized quote or booking.
- /bookings: own bookings.
- /reports/daily-bookings with optional date: administrator report.

On selection, request POST /api/bookings/preview for the live price. Ignore outdated responses after selection changes and indicate price loading. On direct review entry or reload, reconstruct the request from query state and request preview rather than relying on in-memory navigation state. Submit only the explicit Confirm booking action to POST /api/bookings. Derive its start from the first chronological selected slot, even if the user selected the second slot first. A two-hour request creates one booking.

The Change action and review breadcrumb return to the same court/date/week but do not preserve selected hours. Reload availability and start unselected. No special stale-selection restoration or comparison workflow belongs in this delivery. Handle invalid API inputs with the existing validation contract; do not invent extra recovery features while implementing.

## Creation results and failures

- While courts, availability, or preview load, prevent stale/incomplete submission and show/announce loading. Only the latest selection may populate the interface.
- After HTTP 201, show Booking confirmed with Go to my bookings. Only this action navigates to /bookings. Dismissal retains a completed state and cannot re-enable creation.
- BOOKING_CONFLICT opens Time no longer available with the API message and Choose another time. Stay on review until this action is used. It returns to the same court/date/week, reloads availability, and clears hours. Dismissal only closes the modal; keep the explanation and recovery action accessible. Do not treat every 409 as occupied.
- Show field errors by inputs and request errors near their action. Protected-operation 401 uses the authentication-error page; login credential errors stay on the form. Administrative access failures show access denied; the backend remains authoritative.
- On an ambiguous connection failure during creation, do not automatically resubmit, assert success, or assert that nothing was saved. Offer checking My bookings before another attempt. No idempotency system is added.
- When no courts or bookable hours exist, explain the empty state and keep appropriate navigation/date controls available. Existing report and booking empty messages are specified above.

## Native dialog contract

Use HTML dialog opened with showModal() and closed with close() or native mechanisms. Do not emulate modality with a div, only toggle the open attribute, or use non-modal show(). Supply a named title, associated explanation, appropriate initial focus, visible focus, and sensible restoration after closing. The rest of the document is inert while modal. Escape dismisses without navigation or submission. Do not force navigation through an inescapable dialog.

Court creation/editing success dialogs use Court created/Changes saved and Go to courts. Cancellation confirmation uses Keep booking/Cancel booking, submits only on explicit confirmation, then announces success in the list without another modal.

## Presentation and manual verification

Dumb/presentational views receive props/callbacks and can be demonstrated independently in Storybook. Keep the small set of meaningful page states: initial, loading/submitting, relevant empty/error, and success dialogs. No automated frontend suite is planned.

Use semantic list/table markup, labeled native inputs and autocomplete, radios for days, checkboxes in a fieldset for slots, and appropriate links/buttons. Native inputs may be styled but must retain keyboard operation, focus, selected/disabled semantics, and associated errors. Availability and booking status must not rely on color alone. Compose a spaced visual dash from separate start/end fields, hide it from assistive technology, and supply a visually hidden until separator instead. Verify labels, keyboard behavior, focus, state announcements, and modal dismissal during implementation; static images do not constitute completed accessibility testing.
