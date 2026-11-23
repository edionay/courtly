import { Body, Controller, Post, Response, Route, Security, Tags } from "tsoa";
import { bookingService } from "../dependencies";
import type { BookingPreviewResponse } from "../bookings/bookingPresenter";
import type { BookingSelection } from "../bookings/bookingPreparation";
import type { ApiErrorResponse } from "../errors/apiError";

@Route("api/bookings")
@Tags("Bookings")
@Security("jwt")
export class BookingController extends Controller {
  @Post("preview")
  @Response<ApiErrorResponse>(400, "Malformed JSON")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(404, "Court not found")
  @Response<ApiErrorResponse>(409, "Court unavailable or time conflict")
  @Response<ApiErrorResponse>(422, "Invalid booking selection")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public preview(@Body() body: BookingSelection): Promise<BookingPreviewResponse> {
    return bookingService.preview(body);
  }
}
