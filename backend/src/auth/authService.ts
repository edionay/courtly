import bcrypt from "bcryptjs";
import { createAccessToken } from "./accessToken";
import type { AuthenticatedUser } from "./userIdentity";
import type { AuthRepository } from "./authRepository";
import { ApiError, validationError } from "../errors/apiError";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: AuthenticatedUser;
}

export class AuthService {
  public constructor(private readonly repository: AuthRepository) {}

  public async login(input: LoginInput): Promise<LoginResult> {
    const fields = [];
    if (typeof input.email !== "string" || input.email.trim() === "") {
      fields.push({ field: "email", message: "Enter your email address." });
    }
    if (typeof input.password !== "string" || input.password === "") {
      fields.push({ field: "password", message: "Enter your password." });
    }
    if (fields.length) throw validationError(fields);

    const record = await this.repository.findByEmail(input.email.trim().toLowerCase());
    if (!record || !(await bcrypt.compare(input.password, record.passwordHash))) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    const user: AuthenticatedUser = { id: record.id, name: record.name, role: record.role };
    return { accessToken: createAccessToken(user), user };
  }
}
