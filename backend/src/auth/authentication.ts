import type { Request } from "express";
import jwt from "jsonwebtoken";
import { getPrismaClient } from "../database";
import { ApiError } from "../errors/apiError";

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: "user" | "admin";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  return secret;
}

export function createAccessToken(user: AuthenticatedUser): string {
  return jwt.sign({}, jwtSecret(), { algorithm: "HS256", subject: user.id, expiresIn: "1h" });
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = [],
): Promise<AuthenticatedUser> {
  if (securityName !== "jwt") throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");

  const authorization = request.header("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");

  let tokenPayload: string | jwt.JwtPayload;
  try {
    tokenPayload = jwt.verify(authorization.slice(7), jwtSecret(), { algorithms: ["HS256"] });
  } catch {
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }

  if (typeof tokenPayload === "string" || !tokenPayload.sub) {
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  }

  const user = await getPrismaClient().user.findUnique({
    where: { id: tokenPayload.sub },
    select: { id: true, name: true, role: true },
  });
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  if (scopes.includes("admin") && user.role !== "admin") {
    throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
  }

  return user;
}
