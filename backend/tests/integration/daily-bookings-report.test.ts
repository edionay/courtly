import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getPrismaClient } from "../../src/database";
import { DailyBookingsService } from "../../src/reports/dailyBookingsService";
import { PrismaDailyBookingsRepository } from "../../src/reports/prismaDailyBookingsRepository";

const databaseUrl = process.env.COURTLY_TEST_DATABASE_URL;
if (!databaseUrl || new URL(databaseUrl).pathname !== "/courtly_test") {
  throw new Error("Integration tests require COURTLY_TEST_DATABASE_URL for courtly_test");
}

process.env.DATABASE_URL = databaseUrl;

const prisma = getPrismaClient();
const facilityId = randomUUID();
const userId = randomUUID();
const courtIds = [randomUUID(), randomUUID()];
const bookingIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];

describe("daily booking report", () => {
  beforeAll(async () => {
    await prisma.facility.create({
      data: { id: facilityId, name: "Report Test Facility", timezone: "America/Sao_Paulo" },
    });
    await prisma.user.create({
      data: { id: userId, name: "Report Test User", email: `${userId}@courtly.test`, passwordHash: "test" },
    });
    for (const [index, id] of courtIds.entries()) {
      await prisma.court.create({
        data: {
          id,
          facilityId,
          name: `Report Court ${index + 1}`,
          sportType: "Tennis",
          hourlyPriceCents: 100,
          opensAt: new Date("1970-01-01T07:00:00.000Z"),
          closesAt: new Date("1970-01-01T22:00:00.000Z"),
          isActive: index === 0,
        },
      });
    }
    await prisma.booking.createMany({
      data: [
        booking(bookingIds[0]!, courtIds[1]!, "2040-02-22T02:59:59.999Z", "confirmed", 1100),
        booking(bookingIds[1]!, courtIds[0]!, "2040-02-22T03:00:00.000Z", "confirmed", 8250),
        booking(bookingIds[2]!, courtIds[1]!, "2040-02-22T15:00:00.000Z", "cancelled", 4000),
        booking(bookingIds[3]!, courtIds[1]!, "2040-02-23T03:00:00.000Z", "confirmed", 2200),
      ],
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.court.deleteMany({ where: { id: { in: courtIds } } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.facility.deleteMany({ where: { id: facilityId } });
    await prisma.$disconnect();
  });

  it("queries local-day boundaries, includes inactive courts and cancelled bookings, and sums stored confirmed prices", async () => {
    const result = await new DailyBookingsService(new PrismaDailyBookingsRepository()).getReport("2040-02-22");

    expect(result).toEqual({
      date: "2040-02-22",
      display: { date: "Feb 22, 2040", expectedRevenue: "$82.50" },
      bookings: [
        {
          id: bookingIds[1],
          court: { id: courtIds[0], name: "Report Court 1" },
          user: { name: "Report Test User" },
          status: "confirmed",
          display: { startsAt: "00:00", endsAt: "01:00", totalPrice: "$82.50" },
        },
        {
          id: bookingIds[2],
          court: { id: courtIds[1], name: "Report Court 2" },
          user: { name: "Report Test User" },
          status: "cancelled",
          display: { startsAt: "12:00", endsAt: "13:00", totalPrice: "$40.00" },
        },
      ],
    });
  });
});

function booking(
  id: string,
  courtId: string,
  startsAt: string,
  status: "confirmed" | "cancelled",
  totalPriceCents: number,
) {
  const start = new Date(startsAt);
  return {
    id,
    courtId,
    userId,
    startsAt: start,
    endsAt: new Date(start.getTime() + 60 * 60 * 1000),
    status,
    totalPriceCents,
  };
}
