import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getPrismaClient } from "../../src/database";
import { BookingService } from "../../src/bookings/bookingService";
import { PrismaBookingRepository } from "../../src/bookings/prismaBookingRepository";
import type { BookingRepository, BookingInterval, BookingCreate, BookingRecord, PreviewCourt } from "../../src/bookings/bookingRepository";

const databaseUrl = process.env.COURTLY_TEST_DATABASE_URL;
if (!databaseUrl || new URL(databaseUrl).pathname !== "/courtly_test") {
  throw new Error("Integration tests require COURTLY_TEST_DATABASE_URL for courtly_test");
}

process.env.DATABASE_URL = databaseUrl;

const prisma = getPrismaClient();
const facilityId = randomUUID();
const userIds = [randomUUID(), randomUUID()];
const courtId = randomUUID();
const startsAt = new Date("2040-02-20T15:00:00.000Z");

describe("D3.3a temporary check-then-insert behavior", () => {
  beforeAll(async () => {
    await prisma.facility.create({ data: { id: facilityId, name: "Test Facility", timezone: "America/Sao_Paulo" } });
    for (const userId of userIds) {
      await prisma.user.create({ data: { id: userId, name: "Test User", email: `${userId}@courtly.test`, passwordHash: "test" } });
    }
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
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.facility.deleteMany({ where: { id: facilityId } });
    await prisma.$disconnect();
  });

  it("can persist two overlapping requests after both real prechecks find no booking", async () => {
    const repository = new PrecheckBarrierRepository(new PrismaBookingRepository(), 2);
    const service = new BookingService(repository);
    const selection = { courtId, startsAt: startsAt.toISOString(), durationHours: 1 };

    const created = await Promise.all(userIds.map((userId) => service.create(userId, selection)));

    expect(created).toHaveLength(2);
    expect(created.every((booking) => booking.status === "confirmed")).toBe(true);
    const persisted = await prisma.booking.findMany({ where: { courtId, startsAt }, select: { userId: true, startsAt: true, endsAt: true } });
    expect(persisted).toHaveLength(2);
    expect(persisted.map((booking) => booking.userId).sort()).toEqual([...userIds].sort());
    expect(persisted.every((booking) => booking.startsAt.getTime() === startsAt.getTime())).toBe(true);
    expect(persisted.every((booking) => booking.endsAt.getTime() === startsAt.getTime() + 60 * 60 * 1000)).toBe(true);
  });
});

class PrecheckBarrierRepository implements BookingRepository {
  private arrivals = 0;
  private releasePrechecks!: () => void;
  private readonly prechecksComplete = new Promise<void>((resolve) => {
    this.releasePrechecks = resolve;
  });

  public constructor(private readonly repository: BookingRepository, private readonly requestCount: number) {}

  public findCourt(id: string): Promise<PreviewCourt | null> {
    return this.repository.findCourt(id);
  }

  public async findConfirmedOverlap(courtId: string, start: Date, end: Date): Promise<BookingInterval | null> {
    const overlap = await this.repository.findConfirmedOverlap(courtId, start, end);
    this.arrivals += 1;
    if (this.arrivals === this.requestCount) this.releasePrechecks();
    await this.prechecksComplete;
    return overlap;
  }

  public createBooking(values: BookingCreate): Promise<BookingRecord> {
    return this.repository.createBooking(values);
  }
}
