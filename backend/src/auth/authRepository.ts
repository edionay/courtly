import type { AuthenticatedUser } from "./userIdentity";

export interface AuthUserRecord extends AuthenticatedUser {
  passwordHash: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: string): Promise<AuthenticatedUser | null>;
}
