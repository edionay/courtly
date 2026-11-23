import type { Request } from "express";
import { authenticateRequest } from "../dependencies";
import type { AuthenticatedUser } from "./userIdentity";

export function expressAuthentication(
  request: Request,
  securityName: string,
  scopes: string[] = [],
): Promise<AuthenticatedUser> {
  return authenticateRequest(request, securityName, scopes);
}
