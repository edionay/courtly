import { getPrismaClient } from "../database";
import type { DailyBookingsRepository } from "./dailyBookingsRepository";

export class PrismaDailyBookingsRepository implements DailyBookingsRepository {
  public async findFacilityTimezone() {
    const facility = await getPrismaClient().facility.findFirst({ select: { timezone: true } });
    return facility?.timezone ?? null;
  }

  public findBookingsBetween(start: Date, end: Date) {
    return getPrismaClient().booking.findMany({
      where: { startsAt: { gte: start, lt: end } },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        status: true,
        totalPriceCents: true,
        court: { select: { id: true, name: true } },
        user: { select: { name: true } },
      },
    });
  }
}
