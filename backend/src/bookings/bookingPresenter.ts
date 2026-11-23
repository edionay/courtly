import type { PreparedBooking } from "./bookingPreparation";
import type { BookingRecord } from "./bookingRepository";

export interface BookingPreviewResponse {
  court: { id: string; name: string; sportType: string };
  durationHours: number;
  display: { date: string; startsAt: string; endsAt: string; totalPrice: string };
}

export interface BookingCreationResponse {
  id: string;
  court: { id: string; name: string };
  status: "confirmed";
  canCancel: boolean;
  display: {
    date: string;
    startsAt: string;
    endsAt: string;
    timezone: string;
    status: "Confirmed";
    totalPrice: string;
  };
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

export function presentBookingCreation(
  booking: BookingRecord,
  prepared: PreparedBooking,
  canCancel: boolean,
): BookingCreationResponse {
  return {
    id: booking.id,
    court: { id: prepared.court.id, name: prepared.court.name },
    status: "confirmed",
    canCancel,
    display: {
      date: prepared.startsAt.setLocale("en-US").toFormat("MMM d, yyyy"),
      startsAt: prepared.startsAt.toFormat("HH:mm"),
      endsAt: prepared.endsAt.toFormat("HH:mm"),
      timezone: presentTimezone(prepared.timezone),
      status: "Confirmed",
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
