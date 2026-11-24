import { AuthService } from "./auth/authService";
import { createExpressAuthentication } from "./auth/authenticationFactory";
import { PrismaAuthRepository } from "./auth/prismaAuthRepository";
import { AvailabilityService } from "./availability/availabilityService";
import { PrismaAvailabilityRepository } from "./availability/prismaAvailabilityRepository";
import { BookingService } from "./bookings/bookingService";
import { PrismaBookingRepository } from "./bookings/prismaBookingRepository";
import { CourtService } from "./courts/courtService";
import { PrismaCourtRepository } from "./courts/prismaCourtRepository";
import { DailyBookingsService } from "./reports/dailyBookingsService";
import { PrismaDailyBookingsRepository } from "./reports/prismaDailyBookingsRepository";

const authRepository = new PrismaAuthRepository();
const courtRepository = new PrismaCourtRepository();
const availabilityRepository = new PrismaAvailabilityRepository();
const bookingRepository = new PrismaBookingRepository();
const dailyBookingsRepository = new PrismaDailyBookingsRepository();

export const authService = new AuthService(authRepository);
export const courtService = new CourtService(courtRepository);
export const availabilityService = new AvailabilityService(availabilityRepository);
export const bookingService = new BookingService(bookingRepository);
export const dailyBookingsService = new DailyBookingsService(dailyBookingsRepository);
export const authenticateRequest = createExpressAuthentication(authRepository);
