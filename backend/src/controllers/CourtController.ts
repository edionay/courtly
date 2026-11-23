import { Body, Controller, Get, Patch, Path, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
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
  @Get()
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public async list(@Request() request: AuthenticatedRequest): Promise<CourtCollection> {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return new CourtService().list(request.user.role === "admin");
  }

  @Post()
  @Security("jwt", ["admin"])
  @SuccessResponse("201", "Created")
  @Response<ApiErrorResponse>(400, "Malformed JSON")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(403, "Forbidden")
  @Response<ApiErrorResponse>(422, "Invalid court")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public async create(@Body() body: CreateCourtInput): Promise<CourtRepresentation> {
    this.setStatus(201);
    return new CourtService().create(body);
  }

  @Patch("{courtId}")
  @Security("jwt", ["admin"])
  @Response<ApiErrorResponse>(400, "Malformed JSON")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(403, "Forbidden")
  @Response<ApiErrorResponse>(404, "Court not found")
  @Response<ApiErrorResponse>(422, "Invalid court")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public async update(@Path() courtId: string, @Body() body: UpdateCourtInput): Promise<CourtRepresentation> {
    return new CourtService().update(courtId, body);
  }
}
