# Courtly design system

Approved project-local design system. The user accepted the complete Aguinha-derived mockup pack, with destructive actions changed to outlined red buttons. This document and the local assets are sufficient without the Aguinha repositories or earlier chats. Paths below are repository-root-relative unless stated otherwise.

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

## Web implementation: Tailwind CSS

Use the existing Tailwind CSS 4.3.5 and @tailwindcss/vite 4.3.5 with React 19.3.1 and Vite 8.3.8. Aguinha uses Tailwind through NativeWind and gluestack; Courtly uses web Tailwind and native HTML. The earlier Mantine proposal is superseded. Do not install Mantine, NativeWind, gluestack or React Native to reproduce this appearance.

Define tokens once in `frontend/src/styles.css`, using Tailwind 4's CSS-first theme. The following is an implementation specification, not code already added to the frontend:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-primary: #005687;
  --color-canvas: #F4F8FB;
  --color-surface: #FFFFFF;
  --color-foreground: #0B2436;
  --color-muted-foreground: #4F6B7A;
  --color-danger: #E7000B;
  --color-input-border: #E5E5E5;
  --radius-card: 18px;
  --shadow-card: 0 1px 2px rgb(11 36 54 / 0.04);
}
```

Register local Inter faces at 400, 600 and 700 using @font-face and font-display: swap. Source files and OFL license are committed at `docs/mockups/assets/fonts/`. D4 copies them to `frontend/src/assets/fonts/` and references those assets from CSS; no local Aguinha path or remote font service is required.

Create only the reusable native primitives the screens need: button/link styling, labeled field/error text, card, page shell, status presentation and native dialog. Use a small button variant API rather than scattered contradictory class sets. Presentational primitives must not fetch, navigate programmatically or read session storage.

## Controls and feedback

Button variants:

- Primary: blue background, white text.
- Secondary: white background, blue text and a blue outline.
- Danger: white background, `#E7000B` text and a one-pixel `#E7000B` outline. Never use a solid red danger background, including hover/active states. Both the personal-booking cancellation trigger and the final cancellation confirmation use this variant.
- A form's Cancel action only navigates away; it uses Secondary. Keep booking also uses Secondary.

All variants use rounded corners and at least 44px targets. Disabled/pending states retain a recognizable label and prevent repeat submission. A default button type is button; form submit actions explicitly use submit. Links remain distinguishable from explanatory text. Use native labeled inputs, day radios, slot checkboxes, date/time fields and semantic tables where approved. Add a visible focus outline with adequate contrast against its surface; the pale input-border token alone is not a keyboard-focus treatment.

Selected slots use blue-tinted surfaces plus explicit checks. Occupied slots show Booked and are disabled. Do not use color alone for selection, status or errors. Keep time values separate in data; compose a spaced visual separator and an accessible “until” separator.

Dialogs use the same white surface, rounded corners, blue actions and a dimmed backdrop. Implement the approved native `<dialog>` with `showModal()`, focus handling, Escape dismissal and focus restoration. Cancellation confirmation uses Keep booking and Cancel booking; success and conflict dialogs retain their explicit navigation actions. Static mockups illustrate these states but do not establish native behavior.

Loading, empty, validation, connection, authentication and permission states keep the same shell and typography. They must preserve the approved recovery behavior and must not add automatic mutation retries or new product features.

## Source and implementation boundaries

The visual reference was extracted from Aguinha's `global.css`, `src/design-system/theme.ts`, `src/components/ListCard.tsx` and selected screen styles. The extracted tokens above are sufficient to continue without those repositories. Do not import Aguinha's React Native components, whale identity, friends or notification features.

Tailwind web is the approved implementation tool for this system. Preserve the existing pinned versions. Any genuinely needed supporting package follows the stable-compatible policy; no second component framework is needed.

The backend prepares display values according to `docs/api-contracts.md`. This system does not add photo fields, filters, metrics, payments, facility management or new API contracts. Keep `docs/ui-flows.md` authoritative for interaction behavior.

## Verification and handoff

The screen pack consists of editable SVG sources and rendered PNG studies. Inspect desktop and mobile compositions, text overflow, photo crops, state labels and modal actions. Browser keyboard, screen-reader, focus and native-dialog checks belong to the later working frontend. The screen pack and state boards are approved visual references, with the outlined-danger correction applied. They are not implemented application pages; static fixtures never override API values or interaction rules.

## Responsive implementation targets

- Verify at 390px mobile width and 1440px desktop width, matching the main mockups; also inspect 320px for overflow.
- Use a compact header below 1024px and the inset sidebar at 1024px and above. The court grid uses one column below 768px, two from 768px, and three from 1280px where content width permits.
- Photo frames use the approved approximately 10:7 crop, object-fit cover, and rounded corners. Preserve the basketball hoop when cropping. Text and actions stay outside photographs.
- Summaries move after slot choices on mobile. Report tables become labeled entries on small screens. Text wraps before reducing useful type sizes; dialogs remain inside the viewport and scroll when necessary.

## Local asset inventory and provenance

- Inter: `docs/mockups/assets/fonts/Inter.ttf`, `InterSemiBold.ttf`, `InterBold.ttf`, with `OFL.txt` and `SOURCES.md` in that folder.
- Sport photography: `docs/mockups/assets/tennis.jpg`, `basketball.jpg`, `padel.jpg`; attribution/provenance is in `docs/mockups/assets/SOURCES.md`.
- D4 copies the needed images into frontend assets. Match a small case-insensitive trimmed sport-name map (Tennis, Basketball, Padel); unknown free-text values, including the current seeded Futsal, use the committed `docs/mockups/assets/sport-neutral.svg` fallback and retain the actual sport text. The fallback is a #E5F0F5 10:7 surface with the blue Courtly court mark and no photograph. Do not relabel Futsal as Padel or hardcode court IDs to a sport photograph.
- Court photo assets are decorative illustrations of the sport, not verified facility photos. Use empty alt when adjacent visible text already conveys the court/sport; do not put essential booking data only in an image.
- The gallery is `docs/mockups/aguinha/index.html`; local PNGs/SVGs and its REVIEW.md work without a running gallery server. Old rejected alternatives are not implementation references.
