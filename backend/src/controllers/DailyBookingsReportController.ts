import { Controller, Get, Query, Response, Route, Security, Tags } from "tsoa";
import { dailyBookingsService } from "../dependencies";
import type { ApiErrorResponse } from "../errors/apiError";
import type { DailyBookingReportResponse } from "../reports/dailyBookingsPresenter";

@Route("api/reports/daily-bookings")
@Tags("Reports")
export class DailyBookingsReportController extends Controller {
  @Get()
  @Security("jwt", ["admin"])
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(403, "Forbidden")
  @Response<ApiErrorResponse>(422, "Invalid report date")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public getDailyBookings(@Query() date?: string): Promise<DailyBookingReportResponse> {
    return dailyBookingsService.getReport(date);
  }
}
