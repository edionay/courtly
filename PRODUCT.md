# Courtly

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React with Tailwind CSS, a separate Express API with tsoa, and PostgreSQL accessed through Prisma. Application code uses strict TypeScript. The backend has been implemented incrementally; the frontend still contains its foundation placeholder. Approved planning is consolidated in docs/execution-plan.md. The accepted visual baseline is recorded in DESIGN.md; a component-library change has not been approved.

## Users

- Users browse sports courts, select a date and one or two consecutive hourly slots, review the price, create bookings, and manage their own bookings.
- Administrators create, edit, and deactivate courts and inspect a day's bookings and expected revenue.
- Hiring reviewers evaluate correctness, usability, reasoning, tests, and one-command Docker startup. The candidate must understand and defend the implementation.

## Product Purpose

Deliver the mandatory Courtly sports facility booking challenge with a small, understandable implementation. The challenge reference is `docs/challenge.md`; approved project decisions and API contracts live in `docs/decisions.md` and `docs/api-contracts.md`.

## Operating Context

The core has one seeded facility with IANA timezone `America/Sao_Paulo`. Facility management is outside this delivery. Amounts use a generic `$` symbol with two decimal places, without identifying a real currency. All interface copy, code, and repository documentation are English.

The booking flow has separate court selection, a combined date/hour-selection screen, and review. Availability loads Sunday-through-Saturday weeks from the backend while showing only the selected day's slots. The backend supplies navigation links and day-selection states. Past days are disabled, past slots are hidden, and occupied slots remain visible and unavailable. Do not group hours into morning/afternoon/evening or offer a 30/60-minute toggle.

## Capabilities and Constraints

- Select one or two consecutive hourly slots, with server-calculated preview pricing. The preview creates no booking and holds no slot or price.
- On creation success, show a native confirmation dialog with an explicit action to personal bookings. On a time conflict, a similar dialog offers returning to selection only after the corresponding action is chosen.
- Preserve booking history and contracted prices. Enforce ownership, roles, opening hours, past-time restrictions, and the inclusive two-hour cancellation window in the backend.
- Database-level exclusion constraints protect against overlapping confirmed bookings, including concurrent requests.
- JWT authentication uses seeded credentials, sessionStorage, a one-hour lifetime, and no refresh-token flow. Backend authorization does not trust client-side role display.
- Mandatory requirements take priority over optional features. Do not add payments, registration, facility CRUD, waitlists, real-time updates, or a generic permission engine.
- Approved low-fidelity desktop/mobile wireframes cover authentication, court browsing/management, availability, review/results, own bookings/cancellation, and daily reporting. Canonical artifacts are indexed in docs/wireframes/README.md; they are planning artifacts, not production frontend code.

## Evidence on Hand

- `docs/challenge.md`: complete structured restatement of requirements and evaluation constraints.
- `docs/api-contracts.md`: approved response structures and business-facing contracts.
- `docs/ui-flows.md`: consolidated approved interaction behavior.
- The user supplied a weekly-date-strip reference, requesting its structural idea without time-of-day groups or duration toggles. It does not establish the final palette or typography.

## Product Principles

- Prefer the smallest maintainable implementation that meets the brief.
- Keep booking decisions and formatted values in the backend where agreed by the contracts.
- Preserve meaningful URL state between selection and review; returning to selection retains court/date/week but clears selected slots.
- Make the available, occupied, past, and selected states understandable without color alone.

## Accessibility & Inclusion

Prefer native forms and controls with custom styling: radio inputs for choosing a day, checkboxes for one or two consecutive hours, buttons and links for their appropriate actions, and `<dialog>` opened with `showModal()` for modals. Preserve keyboard operation, labels, selected/disabled state, and visible focus. Provide separate start/end values and an accessible `until` separator rather than relying on a visual dash. A static wireframe illustrates these intentions; keyboard and screen-reader behavior must be verified in the later implementation.

## Open Design Decisions

The user accepted the Aguinha-derived Courts visual direction and requested extending it to the remaining screens and dialogs. DESIGN.md records the colors, Inter typography, rounded white surfaces, subtle shadows and coherent light navigation. The extended mockup pack is a review artifact; individual new compositions are not automatically approved. Low-fidelity artifacts retain value as flow evidence. The component-library choice remains separate from the accepted styling.
