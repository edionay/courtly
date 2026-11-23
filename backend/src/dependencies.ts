import { AuthService } from "./auth/authService";
import { createExpressAuthentication } from "./auth/authenticationFactory";
import { PrismaAuthRepository } from "./auth/prismaAuthRepository";
import { CourtService } from "./courts/courtService";
import { PrismaCourtRepository } from "./courts/prismaCourtRepository";

const authRepository = new PrismaAuthRepository();
const courtRepository = new PrismaCourtRepository();

export const authService = new AuthService(authRepository);
export const courtService = new CourtService(courtRepository);
export const authenticateRequest = createExpressAuthentication(authRepository);
