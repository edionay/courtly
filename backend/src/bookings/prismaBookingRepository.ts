import { getPrismaClient } from "../database";
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

  public createBooking(values: Parameters<BookingRepository["createBooking"]>[0]) {
    return getPrismaClient().booking.create({ data: values });
  }
}
