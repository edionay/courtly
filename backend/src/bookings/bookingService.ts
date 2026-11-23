import type { BookingRepository } from "./bookingRepository";
import { prepareBooking, type BookingSelection } from "./bookingPreparation";
import { presentBookingPreview, type BookingPreviewResponse } from "./bookingPresenter";

export class BookingService {
  public constructor(private readonly repository: BookingRepository) {}

  public async preview(selection: BookingSelection): Promise<BookingPreviewResponse> {
    const prepared = await prepareBooking(this.repository, selection);
    return presentBookingPreview(prepared);
  }
}
