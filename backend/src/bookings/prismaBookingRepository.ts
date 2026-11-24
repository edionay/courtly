import { getPrismaClient } from "../database";
import { ApiError } from "../errors/apiError";
import { isBookingOverlapConstraintViolation, isRetryableBookingDeadlock } from "./bookingDatabaseErrors";
import type { BookingRepository } from "./bookingRepository";

export class PrismaBookingRepository implements BookingRepository {
  public findCourt(id: string) {
    return getPrismaClient().court.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sportType: true,
        hourlyPriceCents: true,
        opensAt: true,
        closesAt: true,
        isActive: true,
        facility: { select: { timezone: true } },
      },
    });
  }

  public findConfirmedOverlap(courtId: string, startsAt: Date, endsAt: Date) {
    return getPrismaClient().booking.findFirst({
      where: {
        courtId,
        status: "confirmed",
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { startsAt: true, endsAt: true },
    });
  }

  public async createBooking(values: Parameters<BookingRepository["createBooking"]>[0]) {
    try {
      return await insertBooking(values);
    } catch (error: unknown) {
      if (isBookingOverlapConstraintViolation(error)) throw bookingConflictError();
      if (!isRetryableBookingDeadlock(error)) throw error;
    }

    try {
      return await insertBooking(values);
    } catch (error: unknown) {
      if (isBookingOverlapConstraintViolation(error)) throw bookingConflictError();
      throw error;
    }
  }
}

function insertBooking(values: Parameters<BookingRepository["createBooking"]>[0]) {
  return getPrismaClient().booking.create({ data: values });
}

function bookingConflictError(): ApiError {
  return new ApiError(409, "BOOKING_CONFLICT", "This time slot is no longer available.");
}
