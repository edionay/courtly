import { AuthService } from "./auth/authService";
import { createExpressAuthentication } from "./auth/authenticationFactory";
import { PrismaAuthRepository } from "./auth/prismaAuthRepository";
import { AvailabilityService } from "./availability/availabilityService";
import { PrismaAvailabilityRepository } from "./availability/prismaAvailabilityRepository";
import { CourtService } from "./courts/courtService";
import { PrismaCourtRepository } from "./courts/prismaCourtRepository";

const authRepository = new PrismaAuthRepository();
const courtRepository = new PrismaCourtRepository();
const availabilityRepository = new PrismaAvailabilityRepository();

export const authService = new AuthService(authRepository);
export const courtService = new CourtService(courtRepository);
export const availabilityService = new AvailabilityService(availabilityRepository);
export const authenticateRequest = createExpressAuthentication(authRepository);
