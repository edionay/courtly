import { DateTime } from "luxon";
import { validationError } from "../errors/apiError";
import type { DailyBookingsRepository } from "./dailyBookingsRepository";
import { presentDailyBookingReport, type DailyBookingReportResponse } from "./dailyBookingsPresenter";

export class DailyBookingsService {
  public constructor(private readonly repository: DailyBookingsRepository) {}

  public async getReport(requestedDate?: string): Promise<DailyBookingReportResponse> {
    validateRequestedDate(requestedDate);

    const timezone = await this.repository.findFacilityTimezone();
    if (!timezone) throw new Error("Seeded facility is missing");

    const localStart = requestedDate
      ? DateTime.fromISO(requestedDate, { zone: timezone, setZone: true }).startOf("day")
      : DateTime.now().setZone(timezone).startOf("day");
    const localEnd = localStart.plus({ days: 1 }).startOf("day");
    const bookings = await this.repository.findBookingsBetween(
      localStart.toUTC().toJSDate(),
      localEnd.toUTC().toJSDate(),
    );
    const expectedRevenueCents = bookings.reduce((total, booking) => {
      if (booking.status !== "confirmed") return total;
      return total + booking.totalPriceCents;
    }, 0);

    return presentDailyBookingReport(
      localStart.toFormat("yyyy-MM-dd"),
      timezone,
      bookings,
      expectedRevenueCents,
    );
  }
}

function validateRequestedDate(value: string | undefined): void {
  if (value === undefined) return;

  const hasExactDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!hasExactDateFormat) throw invalidDateError();

  const parsedDate = DateTime.fromISO(value, { zone: "UTC" });
  if (!parsedDate.isValid || parsedDate.toFormat("yyyy-MM-dd") !== value) throw invalidDateError();
}

function invalidDateError() {
  return validationError([{ field: "date", message: "Enter a valid calendar date in YYYY-MM-DD format." }]);
}
