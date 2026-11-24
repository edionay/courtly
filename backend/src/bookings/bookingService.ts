import type { BookingRepository } from "./bookingRepository";
import { canCancelBooking } from "./bookingEligibility";
import { prepareBooking, type BookingSelection } from "./bookingPreparation";
import { ApiError } from "../errors/apiError";
import {
  presentPersonalBooking,
  presentBookingPreview,
  type BookingPreviewResponse,
  type BookingResponse,
  type MyBookingsResponse,
} from "./bookingPresenter";

export class BookingService {
  public constructor(private readonly repository: BookingRepository) {}

  public async preview(selection: BookingSelection): Promise<BookingPreviewResponse> {
    const prepared = await prepareBooking(this.repository, selection);
    return presentBookingPreview(prepared);
  }

  public async create(userId: string, selection: BookingSelection): Promise<BookingResponse> {
    const prepared = await prepareBooking(this.repository, selection);
    const booking = await this.repository.createBooking({
      courtId: prepared.court.id,
      userId,
      startsAt: prepared.startsAt.toUTC().toJSDate(),
      endsAt: prepared.endsAt.toUTC().toJSDate(),
      status: "confirmed",
      totalPriceCents: prepared.totalPriceCents,
    });

    const now = Date.now();
    return presentPersonalBooking({
      ...booking,
      court: { id: prepared.court.id, name: prepared.court.name, facility: { timezone: prepared.timezone } },
    }, canCancelBooking(booking, userId, now));
  }

  public async listMine(userId: string): Promise<MyBookingsResponse> {
    const bookings = await this.repository.findBookingsForUser(userId);
    const now = Date.now();
    return {
      items: bookings.map((booking) =>
        presentPersonalBooking(booking, canCancelBooking(booking, userId, now)),
      ),
    };
  }

  public async cancel(userId: string, bookingId: string): Promise<BookingResponse> {
    const booking = await this.repository.findBookingById(bookingId);
    if (!booking) throw new ApiError(404, "BOOKING_NOT_FOUND", "Booking not found.");
    if (booking.userId !== userId) {
      throw new ApiError(403, "FORBIDDEN", "You do not have permission to cancel this booking.");
    }

    if (booking.status === "cancelled") return presentPersonalBooking(booking, false);

    const now = Date.now();
    if (!canCancelBooking(booking, userId, now)) {
      throw new ApiError(409, "CANCELLATION_WINDOW_CLOSED", "Bookings can only be cancelled at least two hours before they start.");
    }

    const cancelledBooking = await this.repository.cancelBooking(bookingId);
    return presentPersonalBooking(cancelledBooking, false);
  }
}
