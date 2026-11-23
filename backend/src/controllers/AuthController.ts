import { Body, Controller, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";
import type { AuthenticatedRequest } from "../auth/authenticatedRequest";
import type { AuthenticatedUser } from "../auth/userIdentity";
import { authService } from "../dependencies";
import type { ApiErrorResponse } from "../errors/apiError";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

@Route("api/auth")
@Tags("Authentication")
export class AuthController extends Controller {
  @Post("login")
  @Response<ApiErrorResponse>(400, "Malformed JSON")
  @Response<ApiErrorResponse>(401, "Invalid credentials")
  @Response<ApiErrorResponse>(422, "Invalid request")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return authService.login(body);
  }

  @Get("me")
  @Security("jwt")
  @Response<ApiErrorResponse>(401, "Unauthenticated")
  @Response<ApiErrorResponse>(500, "Unexpected error")
  public getMe(@Request() request: AuthenticatedRequest): AuthenticatedUser {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return request.user;
  }
}
