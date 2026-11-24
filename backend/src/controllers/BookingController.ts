import { Body, Controller, Get, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import type { AuthenticatedRequest } from "../auth/authenticatedRequest";
import { bookingService } from "../dependencies";
import type { BookingPreviewResponse, BookingResponse, MyBookingsResponse } from "../bookings/bookingPresenter";
import type { BookingSelection } from "../bookings/bookingPreparation";
import type { ApiErrorResponse } from "../errors/apiError";

@Route("api/bookings")
@Tags("Bookings")
@Security("jwt")
export class BookingController extends Controller {
  @Get("me")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public listMine(@Request() request: AuthenticatedRequest): Promise<MyBookingsResponse> {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return bookingService.listMine(request.user.id);
  }

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

  @Post()
  @SuccessResponse("201", "Created")
  @Response<ApiErrorResponse>(400, "Malformed JSON")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(404, "Court not found")
  @Response<ApiErrorResponse>(409, "Court unavailable or time conflict")
  @Response<ApiErrorResponse>(422, "Invalid booking selection")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public async create(
    @Request() request: AuthenticatedRequest,
    @Body() body: BookingSelection,
  ): Promise<BookingResponse> {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    this.setStatus(201);
    return bookingService.create(request.user.id, body);
  }
}
