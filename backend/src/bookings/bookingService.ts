import type { BookingRepository } from "./bookingRepository";
import { canCancelBooking } from "./bookingEligibility";
import { prepareBooking, type BookingSelection } from "./bookingPreparation";
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
}
