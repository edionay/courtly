# UI flows in progress

This document records approved interface behavior. Read it with `challenge.md`, `decisions.md`, and `api-contracts.md`. Other screens and remaining implementation details are still being planned.

## Weekly date and slot selection — approved

1. The user selects a court. Fetch its weekly availability without `weekStart` to load the current week using the Facility timezone.
2. Show the backend-formatted Sunday-through-Saturday week heading, previous/next-week buttons, and seven day choices using the response labels. Follow `navigation.previous` and `navigation.next` directly; null disables that navigation direction. Do not calculate week boundaries in the client.
3. Disable day choices whose `isSelectable` is false. Initially select the first non-past day, not the first day with free slots. A future week initially selects Sunday; an occupied day remains selectable. Automatic discovery of a day with free slots is a future improvement.
4. Show only the selected day's slots in chronological order. Keep occupied slots disabled and labeled `Booked`, hide past slots, and do not use time-of-day groupings or slot-length toggles. Slots always last one hour.
5. Switching days in a loaded week does not call availability again. Switching weeks follows the response link and loads its seven days. Changing date/week clears the previous slot selection.
6. Use custom-styled native forms and inputs with visible focus. Day choices can use radios; slot choices use labeled checkboxes in a fieldset. Permit one slot and optionally an immediately adjacent available slot. After two selections, disable other slots; either checked slot can be unchecked. Enable `Continue` for one or two consecutive selections and show `Select up to 2 consecutive hours.`
7. Restore date and selected slots from query parameters when returning from review, validating against fresh availability. Query values do not authorize a booking. On a day with no bookable slots, show an explanation and allow choosing another day/week rather than automatically searching for availability.

Compose displayed time intervals from separate fields. Courts provide `opensAt` and `closesAt`; slots and bookings provide local `display.startsAt` and `display.endsAt`. Use a spaced separator visually and `until` for assistive technology without announcing both. Do not convert slot timestamps to format display times. Send the first selected slot's original raw UTC `startsAt` and the selected duration when creating a booking. Court selection and final review/confirmation are separate steps; their remaining details and failure handling are still under discussion.
