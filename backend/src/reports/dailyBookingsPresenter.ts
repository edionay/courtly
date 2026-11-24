import { DateTime } from "luxon";
import type { DailyBookingRecord } from "./dailyBookingsRepository";

export interface DailyBookingReportResponse {
  date: string;
  display: { date: string; expectedRevenue: string };
  bookings: Array<{
    id: string;
    court: { id: string; name: string };
    user: { name: string };
    status: "confirmed" | "cancelled";
    display: { startsAt: string; endsAt: string; totalPrice: string };
  }>;
}

export function presentDailyBookingReport(
  date: string,
  timezone: string,
  bookings: DailyBookingRecord[],
  expectedRevenueCents: number,
): DailyBookingReportResponse {
  const localDate = DateTime.fromISO(date, { zone: timezone });
  return {
    date,
    display: {
      date: localDate.setLocale("en-US").toFormat("MMM d, yyyy"),
      expectedRevenue: formatPrice(expectedRevenueCents),
    },
    bookings: bookings.map((booking) => presentDailyBooking(booking, timezone)),
  };
}

function presentDailyBooking(booking: DailyBookingRecord, timezone: string): DailyBookingReportResponse["bookings"][number] {
  const startsAt = DateTime.fromJSDate(booking.startsAt, { zone: "utc" }).setZone(timezone);
  const endsAt = DateTime.fromJSDate(booking.endsAt, { zone: "utc" }).setZone(timezone);
  return {
    id: booking.id,
    court: booking.court,
    user: booking.user,
    status: booking.status,
    display: {
      startsAt: startsAt.toFormat("HH:mm"),
      endsAt: endsAt.toFormat("HH:mm"),
      totalPrice: formatPrice(booking.totalPriceCents),
    },
  };
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
