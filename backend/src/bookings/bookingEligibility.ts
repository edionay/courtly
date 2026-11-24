import type { BookingRecord } from "./bookingRepository";

const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

export function canCancelBooking(booking: BookingRecord, requestingUserId: string, now: number): boolean {
  return booking.userId === requestingUserId && booking.status === "confirmed" &&
    booking.startsAt.getTime() - now >= CANCELLATION_WINDOW_MS;
}
