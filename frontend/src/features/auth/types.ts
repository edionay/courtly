export type UserRole = "user" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
