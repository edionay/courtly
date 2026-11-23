import type { Request } from "express";
import jwt from "jsonwebtoken";
import type { AuthRepository } from "./authRepository";
import { PrismaAuthRepository } from "./prismaAuthRepository";
import type { AuthenticatedUser } from "./userIdentity";
import { jwtSecret } from "./accessToken";
import { ApiError } from "../errors/apiError";

export function createExpressAuthentication(
  repository: Pick<AuthRepository, "findById"> = new PrismaAuthRepository(),
): typeof expressAuthentication {
  return async function authenticateRequest(
    request: Request,
    securityName: string,
    scopes: string[] = [],
  ): Promise<AuthenticatedUser> {
    if (securityName !== "jwt") throw unauthenticatedError();

    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) throw unauthenticatedError();

    let tokenPayload: string | jwt.JwtPayload;
    try {
      tokenPayload = jwt.verify(authorization.slice(7), jwtSecret(), { algorithms: ["HS256"] });
    } catch {
      throw unauthenticatedError();
    }

    if (typeof tokenPayload === "string" || typeof tokenPayload.sub !== "string" || tokenPayload.sub.length === 0) {
      throw unauthenticatedError();
    }

    const user = await repository.findById(tokenPayload.sub);
    if (!user) throw unauthenticatedError();
    if (scopes.includes("admin") && user.role !== "admin") {
      throw new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action.");
    }

    return user;
  };
}

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = [],
): Promise<AuthenticatedUser> {
  return authenticateRequest(request, securityName, scopes);
}

const authenticateRequest = createExpressAuthentication();

function unauthenticatedError(): ApiError {
  return new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
}
