import { DateTime } from "luxon";
import { ApiError, validationError } from "../errors/apiError";
import type { BookingRepository } from "./bookingRepository";

export interface BookingSelection {
  courtId: string;
  startsAt: string;
  durationHours: number;
}

export interface PreparedBooking {
  court: { id: string; name: string; sportType: string };
  timezone: string;
  durationHours: number;
  startsAt: DateTime;
  endsAt: DateTime;
  totalPriceCents: number;
}

export async function prepareBooking(
  repository: BookingRepository,
  selection: BookingSelection,
): Promise<PreparedBooking> {
  const fields = validateSelection(selection);
  if (fields.length > 0) throw validationError(fields);

  const court = await repository.findCourt(selection.courtId);
  if (!court) throw new ApiError(404, "COURT_NOT_FOUND", "Court not found.");
  if (!court.isActive) throw new ApiError(409, "COURT_INACTIVE", "This court is not available for booking.");

  const startsAt = DateTime.fromISO(selection.startsAt, { setZone: true });
  const localStart = startsAt.setZone(court.facility.timezone);
  if (localStart.minute !== 0 || localStart.second !== 0 || hasNonzeroFraction(selection.startsAt)) {
    throw validationError([{ field: "startsAt", message: "Choose a start time on the hour." }]);
  }

  const endsAt = startsAt.plus({ hours: selection.durationHours });
  const localEnd = endsAt.setZone(court.facility.timezone);
  const openingHour = court.opensAt.getUTCHours();
  const closingHour = court.closesAt.getUTCHours();
  const startsBeforeOpening = localStart.hour < openingHour;
  const endsAfterClosing = localEnd.hour > closingHour ||
    (localEnd.hour === closingHour && (localEnd.minute > 0 || localEnd.second > 0 || localEnd.millisecond > 0));
  if (startsBeforeOpening || endsAfterClosing || localStart.toISODate() !== localEnd.toISODate()) {
    throw validationError([{ field: "startsAt", message: "Choose a time within the court's opening hours." }]);
  }

  const start = startsAt.toJSDate();
  const end = endsAt.toJSDate();
  const overlap = await repository.findConfirmedOverlap(court.id, start, end);
  if (overlap) throw new ApiError(409, "BOOKING_CONFLICT", "This time slot is no longer available.");

  return {
    court: { id: court.id, name: court.name, sportType: court.sportType },
    timezone: court.facility.timezone,
    durationHours: selection.durationHours,
    startsAt: localStart,
    endsAt: localEnd,
    totalPriceCents: court.hourlyPriceCents * selection.durationHours,
  };
}

function validateSelection(selection: BookingSelection): Array<{ field: string; message: string }> {
  const fields: Array<{ field: string; message: string }> = [];
  if (!Number.isInteger(selection.durationHours) || ![1, 2].includes(selection.durationHours)) {
    fields.push({ field: "durationHours", message: "Choose a duration of 1 or 2 hours." });
  }

  if (!hasExplicitOffset(selection.startsAt)) {
    fields.push({ field: "startsAt", message: "Enter a valid date and time with an explicit UTC offset." });
    return fields;
  }

  const startsAt = DateTime.fromISO(selection.startsAt, { setZone: true });
  if (!startsAt.isValid) {
    fields.push({ field: "startsAt", message: "Enter a valid date and time with an explicit UTC offset." });
    return fields;
  }
  if (startsAt.toMillis() <= Date.now()) {
    fields.push({ field: "startsAt", message: "Choose a future start time." });
  }
  return fields;
}

function hasExplicitOffset(value: string): boolean {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

function hasNonzeroFraction(value: string): boolean {
  const fraction = value.match(/[.,](\d+)(?:Z|[+-]\d{2}:?\d{2})$/i)?.[1];
  return fraction !== undefined && /[1-9]/.test(fraction);
}
