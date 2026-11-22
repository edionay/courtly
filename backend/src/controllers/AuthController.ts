import { Body, Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";
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
  /**
   * Authenticates a seeded account and returns a signed HS256 bearer token that expires after one hour.
   * Invalid credentials return 401 INVALID_CREDENTIALS. Invalid fields return 422 VALIDATION_ERROR, malformed JSON returns 400 INVALID_JSON, and unexpected failures return 500 INTERNAL_ERROR.
   * @example body {"email":"user@example.com","password":"..."}
   */
  @Post("login")
  @Example<LoginResponse>({
    accessToken: "signed-one-hour-jwt",
    user: { id: "user-123", name: "Alex Morgan", role: "user" },
  })
  @Response<ApiErrorResponse>(400, "Malformed JSON", { code: "INVALID_JSON", message: "Request body must be valid JSON." })
  @Response<ApiErrorResponse>(401, "Invalid credentials", { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." })
  @Response<ApiErrorResponse>(422, "Invalid request", { code: "VALIDATION_ERROR", message: "Check the highlighted fields.", fields: [{ field: "email", message: "Enter your email address." }] })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return new AuthService().login(body);
  }

  /**
   * Requires a valid, unexpired signed JWT and returns the current server-side identity and role.
   * The role is loaded from the user record, not trusted from client input. Missing, invalid, or expired tokens return 401 UNAUTHENTICATED.
   */
  @Get("me")
  @Security("jwt")
  @Example<AuthenticatedUser>({ id: "user-123", name: "Alex Morgan", role: "user" })
  @Response<ApiErrorResponse>(401, "Unauthenticated", { code: "UNAUTHENTICATED", message: "Sign in to continue." })
  @Response<ApiErrorResponse>(500, "Unexpected error", { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." })
  public getMe(@Request() request: AuthenticatedRequest): AuthenticatedUser {
    if (!request.user) throw new Error("Authenticated user was not attached to the request");
    return request.user;
  }
}
