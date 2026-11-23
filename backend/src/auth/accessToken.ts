import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "./userIdentity";

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  return secret;
}

export function createAccessToken(user: AuthenticatedUser): string {
  return jwt.sign({}, jwtSecret(), { algorithm: "HS256", subject: user.id, expiresIn: "1h" });
}
