import { DateTime } from "luxon";
import { ApiError, validationError } from "../errors/apiError";
import type { AvailabilityRepository, BookingInterval } from "./availabilityRepository";
import { presentAvailability, type AvailabilityResponse, type AvailabilitySlotStatus } from "./availabilityPresenter";

export class AvailabilityService {
  public constructor(private readonly repository: AvailabilityRepository) {}

  public async getWeeklyAvailability(courtId: string, requestedWeekStart?: string): Promise<AvailabilityResponse> {
    const court = await this.repository.findCourt(courtId);
    if (!court || !court.isActive) {
      throw new ApiError(404, "COURT_NOT_FOUND", "Court not found or unavailable for booking.");
    }

    const timezone = court.facility.timezone;
    const now = DateTime.now().toUTC();
    const today = now.setZone(timezone).startOf("day");
    const weekStart = resolveWeekStart(requestedWeekStart, timezone, today);
    const weekEnd = weekStart.plus({ days: 6 });
    const weekStartUtc = weekStart.startOf("day").toUTC();
    const weekEndExclusiveUtc = weekStart.plus({ days: 7 }).startOf("day").toUTC();
    const bookings = await this.repository.findConfirmedBookings(
      courtId,
      weekStartUtc.toJSDate(),
      weekEndExclusiveUtc.toJSDate(),
    );
    const previousWeekEnd = weekStart.minus({ days: 1 });
    const previousWeekStart = previousWeekEnd.toMillis() < today.toMillis()
      ? null
      : weekStart.minus({ days: 7 });

    return presentAvailability({
      courtId,
      weekStart,
      weekEnd,
      previousWeekStart,
      nextWeekStart: weekStart.plus({ days: 7 }),
      days: Array.from({ length: 7 }, (_, index) => {
        const date = weekStart.plus({ days: index });
        return {
          date,
          isSelectable: date.toMillis() >= today.toMillis(),
          slots: createSlots(date, court.opensAt, court.closesAt, bookings, now),
        };
      }),
    });
  }
}

function resolveWeekStart(requestedWeekStart: string | undefined, timezone: string, today: DateTime): DateTime {
  if (requestedWeekStart === undefined) {
    return today.minus({ days: today.weekday % 7 });
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(requestedWeekStart);
  const date = isDateOnly ? DateTime.fromISO(requestedWeekStart, { zone: timezone }) : null;
  if (!date?.isValid || date.toFormat("yyyy-MM-dd") !== requestedWeekStart || date.weekday !== 7) {
    throw validationError([{ field: "weekStart", message: "Choose a Sunday as the start of the week." }]);
  }

  return date.startOf("day");
}

function createSlots(
  date: DateTime,
  opensAt: Date,
  closesAt: Date,
  bookings: BookingInterval[],
  now: DateTime,
): Array<{ startsAt: DateTime; endsAt: DateTime; status: AvailabilitySlotStatus }> {
  const slots: Array<{ startsAt: DateTime; endsAt: DateTime; status: AvailabilitySlotStatus }> = [];
  const openingHour = opensAt.getUTCHours();
  const closingHour = closesAt.getUTCHours();

  for (let hour = openingHour; hour < closingHour; hour += 1) {
    const startsAt = date.set({ hour, minute: 0, second: 0, millisecond: 0 });
    const endsAt = startsAt.plus({ hours: 1 });
    const startsAtUtc = startsAt.toUTC();
    const endsAtUtc = endsAt.toUTC();
    const isPast = startsAtUtc.toMillis() < now.toMillis();
    const isBooked = bookings.some((booking) =>
      booking.startsAt.getTime() < endsAtUtc.toMillis() && booking.endsAt.getTime() > startsAtUtc.toMillis(),
    );

    slots.push({
      startsAt,
      endsAt,
      status: getSlotStatus(isPast, isBooked),
    });
  }

  return slots;
}

function getSlotStatus(isPast: boolean, isBooked: boolean): AvailabilitySlotStatus {
  if (isPast) return "past";
  if (isBooked) return "booked";
  return "available";
}
