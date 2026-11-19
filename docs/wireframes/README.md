# Weekly booking wireframes

These static grayscale wireframes show the time-selection step after court selection and before review. The SVG files are editable sources; the PNG files are previews. Both layouts use the same illustrative court, Sunday-first week, slots, and selections.

The desktop layout uses a sidebar with Courts active, My bookings, and Sign out. The desktop selected-time card sits beside the court details; on mobile it follows the slots. The mobile layout uses a compact menu for the same navigation. The breadcrumb links Courts to `/courts`; Court 1 is the current, non-linked context.

The fixture shows Wednesday, November 18, 2026, with 13:00–14:00 and 14:00–15:00 selected. Booked slots and other available slots have distinct labels. Once two slots are selected, other available slot controls are disabled until a selection is cleared.

For the eventual implementation, use native checkbox controls for slots and accessible controls for dates and week navigation, with programmatic selected and disabled states and visible keyboard focus. Mark the breadcrumb as navigation and identify the current page. Render each time interval from separate start and end values: hide the visual dash from assistive technology and provide a visually hidden “until” separator instead. The static images illustrate the layout and are not interactive or a substitute for accessibility testing.
