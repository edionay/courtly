# Courtly visual system — Aguinha reference

Status: the user accepted the Aguinha-derived Courts direction and requested extending it to the other screens and dialogs. DESIGN.md now records the accepted visual baseline. The earlier gray/teal, Electric and Sport main-area proposals were rejected. They remain archived studies, not implementation references. The additional screen compositions remain subject to review.

## Reference and scope

The user supplied the local projects `/Users/edionay/Dev/aguinha-app` and `/Users/edionay/Dev/aguinha_api`. The relevant visual definitions are in the frontend. Both reference repositories are read-only for this task.

Extract style rather than application components: preserve Courtly's name, court data, photos, navigation and booking flows. Do not copy Aguinha's whale mark, notification composer, friends features or other product-specific elements.

Reference files:

- `aguinha-app/global.css`: light theme tokens and their CSS mappings.
- `aguinha-app/src/design-system/theme.ts`: the same core colors for imperative use.
- `aguinha-app/src/components/ListCard.tsx`: white cards, rounded corners, padding and subtle elevation.
- `aguinha-app/src/screens/HomeScreen.tsx`: brand treatment, blue navigation actions and opacity-based accents.
- `aguinha-app/src/features/notifications/components/NotificationComposer.tsx`: rounded blue action surfaces and pill-shaped actions.

The extracted values below make this document usable without access to the reference repositories.

## Color system

- Primary: `#005687`.
- Primary foreground: `#FFFFFF`.
- Page background: `#F4F8FB`.
- Card surface: `#FFFFFF`.
- Primary text: `#0B2436`.
- Secondary text: `#4F6B7A`.
- Destructive: `#E7000B`.
- Borders, when needed for inputs or separators: `#E5E5E5`.

Derive selected and hover surfaces through primary-color opacity rather than introducing unrelated accent palettes. Use the same light blue background and white surface family across navigation and content. The previous navy wall, lime mark, cobalt canvas and coral panels do not belong to this proposal.

## Cards, depth and spacing

Use the ListCard treatment as the main reference:

- Card radius: 18px.
- Grouped-surface radius: 16px; larger action surfaces may use 20px.
- Card shadow: `0 1px 2px rgba(11, 36, 54, 0.04)`.
- Typical internal padding: 16px horizontally and 14px vertically, expanded proportionately for larger desktop court cards.
- Typical related-content gap: 12px; broader layout gaps: 16px and 24px.
- White cards use elevation and separation from the background rather than a gray outline plus a heavy shadow.

Apply the same surface language to the sidebar. A white navigation panel, blue actions and a selected item with a primary tint form a coherent shell with the court cards. This adapts Aguinha's styling; Aguinha's product structure does not prescribe a desktop sidebar.

## Typography and controls

The supplied repository contains Inter regular, semibold and bold font assets. The new static study uses these files; the inspected UI source uses `font-body` and `font-sans`, so this document does not claim that their runtime mapping has been verified. Use a readable sans-serif scale with strong headings, ordinary sentence-case labels and clear price numerals. Retire the earlier Manrope/Barlow experiment for this study.

Use blue primary actions with white text, comfortable padding and rounded corners. Preserve native semantics for inputs, day radios, slot checkboxes and the approved `<dialog>` behavior. Keep at least 44px action targets in the Courtly web implementation.

## Courts mockup

Reference: `mockups/courts-aguinha.png` and its editable SVG.

- A cohesive light shell with a rounded white sidebar.
- Three white photographic court cards using the same corner and shadow treatment.
- Existing fields only: court name, free-text sport, opening hours, formatted hourly price and View availability.
- Real sport photographs remain illustrative; they do not depict the seeded facility or add a court-image API field. Credits are in `mockups/assets/SOURCES.md`.
- No filters, ratings, location controls, availability claims or extra metrics.

The mockup is static. Rendering inspection checks visual composition; it does not establish keyboard behavior, screen-reader behavior or complete accessibility conformance.

## Implementation boundary

The user selected a visual reference, not a requirement to migrate Courtly to React Native, NativeWind or gluestack. No dependency or application-code change is part of this design study. The previously proposed Mantine foundation remains undecided; the accepted tokens can be implemented through a compatible web component library or existing styling tools after visual review.

Apply the accepted Courts direction to the remaining screens as indexed in mockups/aguinha/index.html and recorded in DESIGN.md. Preserve the existing API contracts, role enforcement, accessibility intent and booking flow throughout.
