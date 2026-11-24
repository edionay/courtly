import { httpClient } from "../../shared/http/client";
import type { AuthUser, LoginCredentials, LoginResponse } from "./types";

export const authApi = {
  login(credentials: LoginCredentials): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>("/api/auth/login", credentials);
  },

  getMe(): Promise<AuthUser> {
    return httpClient.get<AuthUser>("/api/auth/me");
  },
};
