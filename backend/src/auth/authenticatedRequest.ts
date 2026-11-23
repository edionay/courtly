import type { Request } from "express";
import type { AuthenticatedUser } from "./userIdentity";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
