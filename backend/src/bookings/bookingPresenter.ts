import type { PreparedBooking } from "./bookingPreparation";

export interface BookingPreviewResponse {
  court: { id: string; name: string; sportType: string };
  durationHours: number;
  display: { date: string; startsAt: string; endsAt: string; totalPrice: string };
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

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
