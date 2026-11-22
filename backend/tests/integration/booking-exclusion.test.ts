import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { inspect } from "node:util";

const databaseUrl = process.env.COURTLY_TEST_DATABASE_URL;
if (!databaseUrl || new URL(databaseUrl).pathname !== "/courtly_test") {
  throw new Error("Integration tests require COURTLY_TEST_DATABASE_URL for courtly_test");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

describe("confirmed booking overlap constraint", () => {
  const facilityId = randomUUID();
  const userId = randomUUID();
  const courtId = randomUUID();
  const startsAt = new Date("2026-12-20T15:00:00.000Z");

  beforeAll(async () => {
    await prisma.facility.create({ data: { id: facilityId, name: "Test Facility", timezone: "America/Sao_Paulo" } });
    await prisma.user.create({ data: { id: userId, name: "Test User", email: `${userId}@courtly.test`, passwordHash: "test" } });
    await prisma.court.create({
      data: {
        id: courtId,
        facilityId,
        name: `Test Court ${courtId}`,
        sportType: "Tennis",
        hourlyPriceCents: 5000,
        opensAt: new Date("1970-01-01T07:00:00.000Z"),
        closesAt: new Date("1970-01-01T22:00:00.000Z"),
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { courtId } });
    await prisma.court.deleteMany({ where: { id: courtId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.facility.deleteMany({ where: { id: facilityId } });
    await prisma.$disconnect();
  });

  it("rejects overlap and permits adjacent reservations", async () => {
    await prisma.booking.create({
      data: { courtId, userId, startsAt, endsAt: new Date(startsAt.getTime() + 60 * 60 * 1000), totalPriceCents: 5000 },
    });

    let overlapError: unknown;
    try {
      await prisma.booking.create({
        data: {
          courtId,
          userId,
          startsAt: new Date(startsAt.getTime() + 30 * 60 * 1000),
          endsAt: new Date(startsAt.getTime() + 90 * 60 * 1000),
          totalPriceCents: 5000,
        },
      });
    } catch (error: unknown) {
      overlapError = error;
    }

    expect(overlapError).toBeDefined();
    expect(overlapError).toMatchObject({ name: "PrismaClientKnownRequestError", code: "P2039" });
    console.info("Observed Prisma overlap error", inspect(overlapError, { depth: 8, colors: false }));

    await expect(prisma.booking.create({
      data: {
        courtId,
        userId,
        startsAt: new Date(startsAt.getTime() + 60 * 60 * 1000),
        endsAt: new Date(startsAt.getTime() + 120 * 60 * 1000),
        totalPriceCents: 5000,
      },
    })).resolves.toBeDefined();
  });
});
