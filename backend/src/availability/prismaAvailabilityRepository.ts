import { getPrismaClient } from "../database";
import type { AvailabilityRepository } from "./availabilityRepository";

export class PrismaAvailabilityRepository implements AvailabilityRepository {
  public findCourt(id: string) {
    return getPrismaClient().court.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        opensAt: true,
        closesAt: true,
        facility: { select: { timezone: true } },
      },
    });
  }

  public findConfirmedBookings(courtId: string, startsAt: Date, endsAt: Date) {
    return getPrismaClient().booking.findMany({
      where: {
        courtId,
        status: "confirmed",
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { startsAt: true, endsAt: true },
      orderBy: { startsAt: "asc" },
    });
  }
}
