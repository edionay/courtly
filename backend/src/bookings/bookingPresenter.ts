import { DateTime } from "luxon";
import type { PreparedBooking } from "./bookingPreparation";
import type { PersonalBookingRecord } from "./bookingRepository";

export interface BookingPreviewResponse {
  court: { id: string; name: string; sportType: string };
  durationHours: number;
  display: { date: string; startsAt: string; endsAt: string; totalPrice: string };
}

export interface BookingResponse {
  id: string;
  court: { id: string; name: string };
  status: "confirmed" | "cancelled";
  canCancel: boolean;
  display: {
    date: string;
    startsAt: string;
    endsAt: string;
    timezone: string;
    status: "Confirmed" | "Cancelled";
    totalPrice: string;
  };
}

export interface MyBookingsResponse {
  items: BookingResponse[];
}

export function presentBookingPreview(preview: PreparedBooking): BookingPreviewResponse {
  return {
    court: preview.court,
    durationHours: preview.durationHours,
    display: {
      date: preview.startsAt.setLocale("en-US").toFormat("MMM d, yyyy"),
      startsAt: preview.startsAt.toFormat("HH:mm"),
      endsAt: preview.endsAt.toFormat("HH:mm"),
      totalPrice: formatPrice(preview.totalPriceCents),
    },
  };
}

export function presentPersonalBooking(
  booking: PersonalBookingRecord,
  canCancel: boolean,
): BookingResponse {
  const timezone = booking.court.facility.timezone;
  const startsAt = DateTime.fromJSDate(booking.startsAt, { zone: "utc" }).setZone(timezone);
  const endsAt = DateTime.fromJSDate(booking.endsAt, { zone: "utc" }).setZone(timezone);
  const statusLabel = booking.status === "confirmed" ? "Confirmed" : "Cancelled";
  return {
    id: booking.id,
    court: { id: booking.court.id, name: booking.court.name },
    status: booking.status,
    canCancel,
    display: {
      date: startsAt.setLocale("en-US").toFormat("MMM d, yyyy"),
      startsAt: startsAt.toFormat("HH:mm"),
      endsAt: endsAt.toFormat("HH:mm"),
      timezone: presentTimezone(timezone),
      status: statusLabel,
      totalPrice: formatPrice(booking.totalPriceCents),
    },
  };
}

function presentTimezone(timezone: string): string {
  if (timezone === "America/Sao_Paulo") return "São Paulo time";
  const regionName = timezone.split("/").at(-1)?.replaceAll("_", " ");
  return regionName ? `${regionName} time` : `${timezone} time`;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
