import { getPrismaClient } from "../database";
import { ApiError } from "../errors/apiError";
import { isBookingOverlapConstraintViolation, isRetryableBookingDeadlock } from "./bookingDatabaseErrors";
import type { BookingCreate, BookingRepository } from "./bookingRepository";

const personalBookingSelect = {
  id: true,
  courtId: true,
  userId: true,
  startsAt: true,
  endsAt: true,
  status: true,
  totalPriceCents: true,
  court: {
    select: {
      id: true,
      name: true,
      facility: { select: { timezone: true } },
    },
  },
} as const;

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

  public findBookingsForUser(userId: string) {
    return getPrismaClient().booking.findMany({
      where: { userId },
      orderBy: { startsAt: "desc" },
      select: personalBookingSelect,
    });
  }

  public findBookingById(id: string) {
    return getPrismaClient().booking.findUnique({
      where: { id },
      select: personalBookingSelect,
    });
  }

  public cancelBooking(id: string) {
    return getPrismaClient().booking.update({
      where: { id },
      data: { status: "cancelled" },
      select: personalBookingSelect,
    });
  }

  public async createBooking(values: BookingCreate) {
    try {
      return await insertBookingWithDeadlockRetry(values);
    } catch (error: unknown) {
      if (isBookingOverlapConstraintViolation(error)) throw bookingConflictError();
      throw error;
    }
  }
}

async function insertBookingWithDeadlockRetry(values: BookingCreate) {
  try {
    return await insertBooking(values);
  } catch (error: unknown) {
    if (!isRetryableBookingDeadlock(error)) throw error;
  }

  return insertBooking(values);
}

function insertBooking(values: BookingCreate) {
  return getPrismaClient().booking.create({ data: values });
}

function bookingConflictError(): ApiError {
  return new ApiError(409, "BOOKING_CONFLICT", "This time slot is no longer available.");
}
