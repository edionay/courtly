import type { BookingRepository } from "./bookingRepository";
import { prepareBooking, type BookingSelection } from "./bookingPreparation";
import {
  presentBookingCreation,
  presentBookingPreview,
  type BookingCreationResponse,
  type BookingPreviewResponse,
} from "./bookingPresenter";

const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

export class BookingService {
  public constructor(private readonly repository: BookingRepository) {}

  public async preview(selection: BookingSelection): Promise<BookingPreviewResponse> {
    const prepared = await prepareBooking(this.repository, selection);
    return presentBookingPreview(prepared);
  }

  public async create(userId: string, selection: BookingSelection): Promise<BookingCreationResponse> {
    const prepared = await prepareBooking(this.repository, selection);
    const booking = await this.repository.createBooking({
      courtId: prepared.court.id,
      userId,
      startsAt: prepared.startsAt.toUTC().toJSDate(),
      endsAt: prepared.endsAt.toUTC().toJSDate(),
      status: "confirmed",
      totalPriceCents: prepared.totalPriceCents,
    });

    const canCancel = booking.userId === userId && booking.status === "confirmed" &&
      booking.startsAt.getTime() - Date.now() >= CANCELLATION_WINDOW_MS;
    return presentBookingCreation(booking, prepared, canCancel);
  }
}
