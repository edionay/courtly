import { Body, Controller, Example, Get, Patch, Path, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import type { AuthenticatedRequest } from "../auth/authenticatedRequest";
import type { ApiErrorResponse } from "../errors/apiError";
import { CourtService, type CreateCourtInput, type UpdateCourtInput } from "../courts/courtService";
import type { CourtRepresentation } from "../courts/courtPresenter";

interface CourtCollection {
  items: CourtRepresentation[];
}

@Route("api/courts")
@Tags("Courts")
@Security("jwt")
export class CourtController extends Controller {
  /**
   * Requires a valid JWT. Users receive active courts; administrators receive active and inactive courts. Results are ordered by name.
   * Court opening and closing values are whole-hour wall-clock times in the seeded Facility's America/Sao_Paulo timezone. The timezone is internal and is not repeated in the court response. Unauthenticated requests return 401 UNAUTHENTICATED; unexpected failures return 500 INTERNAL_ERROR.
   */
  @Get()
  @Example<CourtCollection>({
    items: [{
      id: "court-1",
      name: "Court 1",
      sportType: "padel",
      isActive: true,
      hourlyPriceCents: 5000,
      opensAt: "08:00",
      closesAt: "23:00",
      display: { hourlyPrice: "$50.00" },
    }],
  })
  @Response<ApiErrorResponse>(401, "Unauthenticated", { code: "UNAUTHENTICATED", message: "Sign in to continue." })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public async list(@Request() request: AuthenticatedRequest): Promise<CourtCollection> {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return new CourtService().list(request.user.role === "admin");
  }

  /**
   * Requires an administrator JWT. Creates an active court associated with the single seeded Facility; facilityId and isActive are server-assigned.
   * name and free-text sportType must be nonempty, hourlyPriceCents a positive integer, and opensAt/closesAt facility-local HH:00 times with opening earlier than closing. Overnight schedules are not supported. Invalid fields return 422 VALIDATION_ERROR with field messages; malformed JSON returns 400 INVALID_JSON, unauthenticated requests 401 UNAUTHENTICATED, other roles 403 FORBIDDEN, and unexpected failures 500 INTERNAL_ERROR.
   * @example body {"name":"Court 4","sportType":"padel","hourlyPriceCents":5000,"opensAt":"08:00","closesAt":"23:00"}
   */
  @Post()
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Created")
  @Example<CourtRepresentation>({
    id: "court-4",
    name: "Court 4",
    sportType: "padel",
    isActive: true,
    hourlyPriceCents: 5000,
    opensAt: "08:00",
    closesAt: "23:00",
    display: { hourlyPrice: "$50.00" },
  })
  @Response<ApiErrorResponse>(400, "Malformed JSON", { code: "INVALID_JSON", message: "Request body must be valid JSON." })
  @Response<ApiErrorResponse>(401, "Unauthenticated", { code: "UNAUTHENTICATED", message: "Sign in to continue." })
  @Response<ApiErrorResponse>(403, "Forbidden", { code: "FORBIDDEN", message: "You do not have permission to perform this action." })
  @Response<ApiErrorResponse>(422, "Invalid court", { code: "VALIDATION_ERROR", message: "Check the highlighted fields.", fields: [{ field: "opensAt", message: "Choose a local whole-hour time in HH:00 format." }] })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public async create(@Body() body: CreateCourtInput): Promise<CourtRepresentation> {
    this.setStatus(201);
    return new CourtService().create(body);
  }

  /**
   * Requires an administrator JWT. Accepts only changed name, sportType, hourlyPriceCents, opensAt, closesAt, and isActive fields; omitted fields stay unchanged and unknown fields including facilityId are rejected.
   * Opening hours are facility-local HH:00 values and must remain earlier-opening-than-closing in the resulting court state. Set isActive to false to preserve bookings and deactivate the court. Returns 404 COURT_NOT_FOUND when missing; invalid fields return 422 VALIDATION_ERROR, malformed JSON 400 INVALID_JSON, unauthenticated requests 401 UNAUTHENTICATED, other roles 403 FORBIDDEN, and unexpected failures 500 INTERNAL_ERROR.
   * @example body {"opensAt":"09:00"}
   */
  @Patch("{courtId}")
  @Security("jwt", ["admin"])
  @Example<CourtRepresentation>({
    id: "court-4",
    name: "Court 4",
    sportType: "padel",
    isActive: true,
    hourlyPriceCents: 5000,
    opensAt: "09:00",
    closesAt: "23:00",
    display: { hourlyPrice: "$50.00" },
  })
  @Response<ApiErrorResponse>(400, "Malformed JSON", { code: "INVALID_JSON", message: "Request body must be valid JSON." })
  @Response<ApiErrorResponse>(401, "Unauthenticated", { code: "UNAUTHENTICATED", message: "Sign in to continue." })
  @Response<ApiErrorResponse>(403, "Forbidden", { code: "FORBIDDEN", message: "You do not have permission to perform this action." })
  @Response<ApiErrorResponse>(404, "Court not found", { code: "COURT_NOT_FOUND", message: "Court not found." })
  @Response<ApiErrorResponse>(422, "Invalid court", { code: "VALIDATION_ERROR", message: "Check the highlighted fields.", fields: [{ field: "closesAt", message: "Closing time must be later than opening time." }] })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public async update(@Path() courtId: string, @Body() body: UpdateCourtInput): Promise<CourtRepresentation> {
    return new CourtService().update(courtId, body);
  }
}
