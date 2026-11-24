# Courtly interface review

The user accepted the Aguinha-derived Courts direction and requested its application to the remaining screens and dialogs. This pack applies that visual baseline; individual new compositions remain proposed for review.

Open `index.html` locally to browse full previews and editable SVG sources. No server or application dependencies are required to review the PNGs.

## Screen index

### Courts

- [Courts — desktop](../courts-aguinha.png) · [SVG](../courts-aguinha.svg)
- [Courts — mobile](user/courts-mobile.png) · [SVG](user/courts-mobile.svg)
- [Court management — desktop](admin-auth/court-management-desktop.png) · [SVG](admin-auth/court-management-desktop.svg)
- [Court management — mobile](admin-auth/court-management-mobile.png) · [SVG](admin-auth/court-management-mobile.svg)

### Booking flow

- [Choose your time — desktop](user/availability-desktop.png) · [SVG](user/availability-desktop.svg)
- [Choose your time — mobile](user/availability-mobile.png) · [SVG](user/availability-mobile.svg)
- [Review your booking — desktop](user/review-desktop.png) · [SVG](user/review-desktop.svg)
- [Review your booking — mobile](user/review-mobile.png) · [SVG](user/review-mobile.svg)
- [My bookings — desktop](user/my-bookings-desktop.png) · [SVG](user/my-bookings-desktop.svg)
- [My bookings — mobile](user/my-bookings-mobile.png) · [SVG](user/my-bookings-mobile.svg)

### Booking dialogs

- [Booking confirmed — desktop](user/booking-success-desktop.png) · [SVG](user/booking-success-desktop.svg)
- [Booking confirmed — mobile](user/booking-success-mobile.png) · [SVG](user/booking-success-mobile.svg)
- [Time no longer available — desktop](user/booking-conflict-desktop.png) · [SVG](user/booking-conflict-desktop.svg)
- [Time no longer available — mobile](user/booking-conflict-mobile.png) · [SVG](user/booking-conflict-mobile.svg)
- [Cancel booking — desktop](user/cancel-booking-desktop.png) · [SVG](user/cancel-booking-desktop.svg)
- [Cancel booking — mobile](user/cancel-booking-mobile.png) · [SVG](user/cancel-booking-mobile.svg)

### Authentication and access

- [Sign in — desktop](admin-auth/login-desktop.png) · [SVG](admin-auth/login-desktop.svg)
- [Sign in — mobile](admin-auth/login-mobile.png) · [SVG](admin-auth/login-mobile.svg)
- [Invalid credentials](admin-auth/login-invalid-desktop.png) · [SVG](admin-auth/login-invalid-desktop.svg)
- [Authentication required — desktop](admin-auth/authentication-error-desktop.png) · [SVG](admin-auth/authentication-error-desktop.svg)
- [Authentication required — mobile](admin-auth/authentication-error-mobile.png) · [SVG](admin-auth/authentication-error-mobile.svg)
- [Access denied](admin-auth/access-denied-desktop.png) · [SVG](admin-auth/access-denied-desktop.svg)

### Court forms and results

- [Create court — desktop](admin-auth/court-create-desktop.png) · [SVG](admin-auth/court-create-desktop.svg)
- [Create court — mobile](admin-auth/court-create-mobile.png) · [SVG](admin-auth/court-create-mobile.svg)
- [Edit court — desktop](admin-auth/court-edit-desktop.png) · [SVG](admin-auth/court-edit-desktop.svg)
- [Edit court — mobile](admin-auth/court-edit-mobile.png) · [SVG](admin-auth/court-edit-mobile.svg)
- [Court created — desktop](admin-auth/court-created-desktop.png) · [SVG](admin-auth/court-created-desktop.svg)
- [Court created — mobile](admin-auth/court-created-mobile.png) · [SVG](admin-auth/court-created-mobile.svg)
- [Changes saved — desktop](admin-auth/court-saved-desktop.png) · [SVG](admin-auth/court-saved-desktop.svg)
- [Changes saved — mobile](admin-auth/court-saved-mobile.png) · [SVG](admin-auth/court-saved-mobile.svg)

### Daily report

- [Daily bookings — desktop](admin-auth/daily-bookings-desktop.png) · [SVG](admin-auth/daily-bookings-desktop.svg)
- [Daily bookings — mobile](admin-auth/daily-bookings-mobile.png) · [SVG](admin-auth/daily-bookings-mobile.svg)
- [No bookings for this date](admin-auth/report-empty-desktop.png) · [SVG](admin-auth/report-empty-desktop.svg)

### Additional states

- [User flow: loading, empty and error states](user/state-board.png) · [SVG](user/state-board.svg)
- [Administration: validation, loading and error states](admin-auth/state-board.png) · [SVG](admin-auth/state-board.svg)

## Review and implementation boundary

- Sources and PNGs are visual studies. Layout inspection does not prove keyboard access, screen-reader behavior, native input semantics or dialog focus behavior.
- Dates, people and amounts are illustrative fixtures. Real API data and authorization remain authoritative.
- Native modal behavior and explicit recovery/navigation actions follow [ui-flows.md](../../ui-flows.md).
- The user and admin/auth directories each contain their rendering script, manifest and contact sheet. Fonts and the renderer can be configured through environment variables; see their notes. No production dependency was added.
- The source Aguinha repositories were read only. Courtly does not reuse their product-specific components or branding.
- Earlier non-Aguinha mockups are archived rejected alternatives and are not implementation inputs.

## Verification recorded for this pack

- 35 gallery entries: the accepted Courts desktop reference plus 34 new screen/state-board previews.
- All 34 new editable SVG files parsed successfully as XML; all 140 gallery file references resolve locally.
- Both contact sheets and representative full-size desktop, mobile and modal renders were inspected. Corrections included mobile header consistency, disabled previous-week navigation, form breadcrumbs/helpers, icon paths, authentication-title fit and populated creation-success context.
- No application dependency, backend contract or runtime behavior was changed. No automated application test or browser accessibility pass is claimed for these static studies.
