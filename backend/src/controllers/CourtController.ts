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
  /** Users see active courts; admins see all. Results are ordered by name. */
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

  /** Adds an active court to the seeded facility. Opening must precede closing; overnight intervals are unsupported.
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

  /** Applies only supplied fields; hours must remain valid in the resulting schedule. Deactivation preserves booking history.
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
