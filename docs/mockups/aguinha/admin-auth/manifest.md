# Administrative and authentication mockups

Static design studies, not functional interfaces. Editable SVG and rendered PNG pairs cover login, invalid credentials, authentication required, access denied, court management, court create and edit, creation and save confirmations, and daily bookings including an empty report. Desktop is 1440 × 900; mobile is 390 pixels wide with a content-dependent height. The state board shows field validation and report loading and error states; the date remains visible during report requests.

The images illustrate intended layout and copy, not interaction or native accessibility. In implementation, use native inputs with email and password autocomplete, whole-hour time controls, and an accessible dialog for success confirmations with dismissal by Close or Escape. Render time separators accessibly and maintain every report field on mobile. The menu icon represents the compact authenticated navigation; navigation behavior is not illustrated here. Court photos are illustrative.

Run `render.cjs` with `RESVG_MODULE` pointing to a compatible Resvg module and optionally `MOCKUP_INTER_FONTS` as a comma-separated list overriding the committed local Inter files in ../../assets/fonts. `contact-sheet.png` is an overview for visual review.

The form studies include a Courts breadcrumb, whole-hour guidance, and the edit availability explanation. The report date field shows a calendar affordance; its empty state uses the approved wording. Navigation, status, dialog and control marks are SVG paths, and validation uses the design-system error color.
