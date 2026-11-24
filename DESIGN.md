# Courtly design system

The user accepted the Aguinha-derived Courts direction on November 24, 2026 and requested its application to the other screens and dialogs. The visual baseline is `docs/mockups/courts-aguinha.png`; the extended screen pack is indexed in `docs/mockups/aguinha/index.html`. Applying the baseline does not mean every new screen has received individual approval.

## Identity

Use a coherent light interface: a pale blue canvas, white rounded surfaces, blue actions and dark blue text. Navigation and content share the same surface treatment. Courtly keeps its own name and court-line mark. Real sport photographs provide character in court cards; they are illustrative rather than photographs of the seeded facility.

The prior gray/teal, Electric and Sport experiments were rejected. Their dark sidebar, lime accent, cobalt canvas, coral panels and condensed display font are not implementation references.

## Tokens

- Primary: `#005687`.
- Primary foreground and card surface: `#FFFFFF`.
- Canvas: `#F4F8FB`.
- Foreground: `#0B2436`.
- Secondary foreground: `#4F6B7A`.
- Destructive: `#E7000B`.
- Input border: `#E5E5E5`.
- Selected navigation surface: primary at approximately 10% opacity over white.
- Card radius: 18px; grouped surfaces: 16px; larger action surfaces: 20px.
- Card shadow: `0 1px 2px rgba(11, 36, 54, 0.04)`.
- Spacing: 4, 8, 12, 16, 24 and 32px. Related content stays closer than separate groups.

White cards normally use the subtle shadow without a gray outline. Input borders and necessary row separators remain distinct from card decoration. Do not add large colored shadows, glow, gradients or unrelated accent palettes.

## Typography

Use Inter with regular, semibold and bold weights and a sans-serif fallback. The approved mockup renders with Inter assets supplied by the reference repository. Typical desktop page headings are 32–34px; mobile headings are 26–28px. Body text is 16px, secondary labels 14px, and prices use a clear 24px emphasis. Use tabular numerals for times, prices and report columns. Small badges must remain legible.

## Shell and surfaces

- Desktop: a rounded white navigation panel inset from the canvas, containing the Courtly mark, Courts, My bookings and Sign out. Administrators also see Daily bookings. The selected destination uses a blue tint and text/icon emphasis.
- Mobile: a compact white header and an accessible menu. Preserve meaningful page titles and breadcrumbs without squeezing the desktop sidebar into the viewport.
- Unauthenticated screens: the Courtly brand and form/message surfaces, without authenticated navigation.
- Court cards: real sport photography, name, free-text sport, opening hours, formatted hourly price and View availability. Administrators additionally see status and the approved management actions.
- Forms and booking summaries: the same white surfaces and rounded controls, with enough spacing to show field relationships. Keep primary actions in the positions approved in `docs/ui-flows.md`.

## Controls and feedback

Blue primary actions use white text and rounded corners, with at least 44px targets. Links remain distinguishable from explanatory text. Use native labeled inputs, day radios, slot checkboxes, date/time fields and semantic tables where approved. Add a visible focus outline with adequate contrast against its surface; the pale input-border token alone is not a keyboard-focus treatment.

Selected slots use blue-tinted surfaces plus explicit checks. Occupied slots show Booked and are disabled. Do not use color alone for selection, status or errors. Keep time values separate in data; compose a spaced visual separator and an accessible “until” separator.

Dialogs use the same white surface, rounded corners, blue actions and a dimmed backdrop. Implement the approved native `<dialog>` with `showModal()`, focus handling, Escape dismissal and focus restoration. Cancellation confirmation uses Keep booking and Cancel booking; success and conflict dialogs retain their explicit navigation actions. Static mockups illustrate these states but do not establish native behavior.

Loading, empty, validation, connection, authentication and permission states keep the same shell and typography. They must preserve the approved recovery behavior and must not add automatic mutation retries or new product features.

## Source and implementation boundaries

The visual reference was extracted from Aguinha's `global.css`, `src/design-system/theme.ts`, `src/components/ListCard.tsx` and selected screen styles. The extracted tokens above are sufficient to continue without those repositories. Do not import Aguinha's React Native components, whale identity, friends or notification features.

No component-library migration is approved by this visual decision. Mantine was proposed, while the existing frontend still has Tailwind tooling. Resolve that implementation choice explicitly before changing dependencies; the accepted appearance is independent of either tool.

The backend prepares display values according to `docs/api-contracts.md`. This system does not add photo fields, filters, metrics, payments, facility management or new API contracts. Keep `docs/ui-flows.md` authoritative for interaction behavior.

## Verification and handoff

The screen pack consists of editable SVG sources and rendered PNG studies. Inspect desktop and mobile compositions, text overflow, photo crops, state labels and modal actions. Browser keyboard, screen-reader, focus and native-dialog checks belong to the later working frontend. Proposed screens and state boards are for review; they are not implemented application pages.
