import { Controller, Get, Path, Query, Response, Route, Security, Tags } from "tsoa";
import type { ApiErrorResponse } from "../errors/apiError";
import { availabilityService } from "../dependencies";
import type { AvailabilityResponse } from "../availability/availabilityPresenter";

@Route("api/courts")
@Tags("Courts")
@Security("jwt")
export class AvailabilityController extends Controller {
  @Get("{courtId}/availability")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(404, "Court unavailable")
  @Response<ApiErrorResponse>(422, "Invalid week start")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public getWeeklyAvailability(
    @Path() courtId: string,
    @Query() weekStart?: string,
  ): Promise<AvailabilityResponse> {
    return availabilityService.getWeeklyAvailability(courtId, weekStart);
  }
}
