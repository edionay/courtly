# Courtly design system

The approved, project-local specification is [docs/design-system.md](docs/design-system.md). Read it before frontend changes. It contains the complete tokens, typography, surfaces, button variants, responsive rules, local asset paths and implementation boundaries; no Aguinha checkout or earlier chat is required.

Use React and the existing Tailwind CSS web integration. Do not adopt Mantine, NativeWind, gluestack or React Native. Aguinha supplied visual styles, not Courtly components or business features.

The user approved the complete [screen pack](docs/mockups/aguinha/REVIEW.md). Destructive actions use white backgrounds with red text and red outlines; solid red danger buttons are not approved. Non-destructive Cancel/Keep booking actions stay secondary blue outlines.

The accepted visual baseline is pale blue canvas, white rounded cards/navigation, blue actions, dark blue text, Inter and subtle tinted shadows. Earlier gray/teal, Electric and Sport studies were rejected.

For implementation, use [docs/frontend-plan.md](docs/frontend-plan.md), [docs/ui-flows.md](docs/ui-flows.md) and [docs/api-contracts.md](docs/api-contracts.md). Static mockups establish appearance; native controls, focus, keyboard, screen-reader and dialog behavior still require verification in the working frontend.
