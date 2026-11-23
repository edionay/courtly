import { DateTime } from "luxon";

export type AvailabilitySlotStatus = "available" | "booked" | "past";

export interface AvailabilityResponse {
  courtId: string;
  weekStart: string;
  weekEnd: string;
  display: { weekStart: string; weekEnd: string };
  navigation: { previous: string | null; next: string };
  days: Array<{
    date: string;
    isSelectable: boolean;
    display: { dayOfMonth: string; weekday: string };
    slots: Array<{
      startsAt: string;
      status: AvailabilitySlotStatus;
      display: { startsAt: string; endsAt: string };
    }>;
  }>;
}

export interface AvailabilityPresentation {
  courtId: string;
  weekStart: DateTime;
  weekEnd: DateTime;
  previousWeekStart: DateTime | null;
  nextWeekStart: DateTime;
  days: Array<{
    date: DateTime;
    isSelectable: boolean;
    slots: Array<{
      startsAt: DateTime;
      endsAt: DateTime;
      status: AvailabilitySlotStatus;
    }>;
  }>;
}

export function presentAvailability(availability: AvailabilityPresentation): AvailabilityResponse {
  const path = `/api/courts/${encodeURIComponent(availability.courtId)}/availability`;
  return {
    courtId: availability.courtId,
    weekStart: formatDate(availability.weekStart),
    weekEnd: formatDate(availability.weekEnd),
    display: {
      weekStart: formatWeekDate(availability.weekStart),
      weekEnd: formatWeekDate(availability.weekEnd),
    },
    navigation: {
      previous: availability.previousWeekStart
        ? `${path}?weekStart=${formatDate(availability.previousWeekStart)}`
        : null,
      next: `${path}?weekStart=${formatDate(availability.nextWeekStart)}`,
    },
    days: availability.days.map((day) => ({
      date: formatDate(day.date),
      isSelectable: day.isSelectable,
      display: {
        dayOfMonth: day.date.toFormat("d"),
        weekday: day.date.setLocale("en-US").toFormat("ccc"),
      },
      slots: day.slots.map((slot) => ({
        startsAt: formatUtcInstant(slot.startsAt),
        status: slot.status,
        display: {
          startsAt: slot.startsAt.toFormat("HH:mm"),
          endsAt: slot.endsAt.toFormat("HH:mm"),
        },
      })),
    })),
  };
}

function formatDate(date: DateTime): string {
  return date.toFormat("yyyy-MM-dd");
}

function formatWeekDate(date: DateTime): string {
  return date.setLocale("en-US").toFormat("MMM d, yyyy");
}

function formatUtcInstant(date: DateTime): string {
  const isoInstant = date.toUTC().toISO({ suppressMilliseconds: true });
  if (!isoInstant) throw new Error("Cannot format an invalid slot instant");
  return isoInstant;
}
