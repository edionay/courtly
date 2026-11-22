import { Body, Controller, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";
import type { AuthenticatedRequest, AuthenticatedUser } from "../auth/authentication";
import { AuthService } from "../auth/authService";
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
  /** Authenticates a seeded account and returns a signed one-hour JWT bearer token. */
  @Post("login")
  @Response<ApiErrorResponse>(400, "Malformed JSON", { code: "INVALID_JSON", message: "Request body must be valid JSON." })
  @Response<ApiErrorResponse>(401, "Invalid credentials", { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." })
  @Response<ApiErrorResponse>(422, "Invalid request", { code: "VALIDATION_ERROR", message: "Check the highlighted fields.", fields: [{ field: "email", message: "Enter your email address." }] })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return new AuthService().login(body);
  }

  /** Returns the authenticated user's current server-side identity and role. */
  @Get("me")
  @Security("jwt")
  @Response<ApiErrorResponse>(401, "Unauthenticated", { code: "UNAUTHENTICATED", message: "Sign in to continue." })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public getMe(@Request() request: AuthenticatedRequest): AuthenticatedUser {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return request.user;
  }
}
