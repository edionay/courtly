import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { getPrismaClient } from "../../src/database";
import { ApiError } from "../../src/errors/apiError";
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

describe("confirmed booking exclusion constraint", () => {
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

  it("allows one concurrent creation and maps the losing database conflict", async () => {
    const repository = new PrecheckBarrierRepository(new PrismaBookingRepository(), 2);
    const service = new BookingService(repository);
    const selection = { courtId, startsAt: startsAt.toISOString(), durationHours: 1 };

    const outcomes = await Promise.allSettled(userIds.map((userId) => service.create(userId, selection)));

    const created = outcomes.filter((outcome) => outcome.status === "fulfilled");
    const failed = outcomes.find((outcome) => outcome.status === "rejected");
    expect(created).toHaveLength(1);
    expect(failed).toBeDefined();
    if (!failed || failed.status !== "rejected") throw new Error("A concurrent request should be rejected");
    expect(failed.reason).toBeInstanceOf(ApiError);
    expect(failed.reason).toMatchObject({ status: 409, code: "BOOKING_CONFLICT" });
    expect(repository.observedPrechecks).toEqual([null, null]);

    const persisted = await prisma.booking.findMany({ where: { courtId, startsAt }, select: { userId: true, startsAt: true, endsAt: true } });
    expect(persisted).toHaveLength(1);
    expect(userIds).toContain(persisted[0].userId);
    expect(persisted.every((booking) => booking.startsAt.getTime() === startsAt.getTime())).toBe(true);
    expect(persisted.every((booking) => booking.endsAt.getTime() === startsAt.getTime() + 60 * 60 * 1000)).toBe(true);
  });

  it("rejects partial overlaps, permits adjacency, and ignores cancelled bookings", async () => {
    const repository = new PrismaBookingRepository();
    const intervalStart = new Date("2040-02-21T15:00:00.000Z");
    const intervalEnd = new Date(intervalStart.getTime() + 60 * 60 * 1000);

    await repository.createBooking({
      courtId,
      userId: userIds[1],
      startsAt: intervalStart,
      endsAt: intervalEnd,
      status: "cancelled",
      totalPriceCents: 5000,
    });
    await repository.createBooking({
      courtId,
      userId: userIds[0],
      startsAt: intervalStart,
      endsAt: intervalEnd,
      status: "confirmed",
      totalPriceCents: 5000,
    });
    await expect(repository.createBooking({
      courtId,
      userId: userIds[1],
      startsAt: new Date(intervalStart.getTime() + 30 * 60 * 1000),
      endsAt: new Date(intervalStart.getTime() + 90 * 60 * 1000),
      status: "confirmed",
      totalPriceCents: 5000,
    })).rejects.toMatchObject({ status: 409, code: "BOOKING_CONFLICT" });

    await repository.createBooking({
      courtId,
      userId: userIds[1],
      startsAt: intervalEnd,
      endsAt: new Date(intervalEnd.getTime() + 60 * 60 * 1000),
      status: "confirmed",
      totalPriceCents: 5000,
    });

    const saved = await prisma.booking.findMany({
      where: { courtId, startsAt: { gte: intervalStart, lt: new Date(intervalEnd.getTime() + 60 * 60 * 1000) } },
      select: { status: true },
    });
    expect(saved).toHaveLength(3);
    expect(saved.filter((booking) => booking.status === "confirmed")).toHaveLength(2);
    expect(saved.filter((booking) => booking.status === "cancelled")).toHaveLength(1);
  });

  it("cancels through the service and allows another user to rebook the retained interval", async () => {
    const service = new BookingService(new PrismaBookingRepository());
    const selection = { courtId, startsAt: "2040-02-22T15:00:00.000Z", durationHours: 1 };
    const created = await service.create(userIds[0], selection);

    const cancelled = await service.cancel(userIds[0], created.id);
    expect(cancelled).toMatchObject({
      id: created.id,
      status: "cancelled",
      canCancel: false,
      display: { totalPrice: "$50.00", status: "Cancelled" },
    });

    const rebooked = await service.create(userIds[1], selection);
    expect(rebooked.status).toBe("confirmed");

    const history = await prisma.booking.findMany({
      where: { courtId, startsAt: new Date(selection.startsAt) },
      select: { id: true, userId: true, status: true, startsAt: true, endsAt: true, totalPriceCents: true },
    });
    expect(history).toHaveLength(2);
    expect(history).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: created.id,
        userId: userIds[0],
        status: "cancelled",
        startsAt: new Date(selection.startsAt),
        endsAt: new Date("2040-02-22T16:00:00.000Z"),
        totalPriceCents: 5000,
      }),
      expect.objectContaining({
        id: rebooked.id,
        userId: userIds[1],
        status: "confirmed",
        startsAt: new Date(selection.startsAt),
        endsAt: new Date("2040-02-22T16:00:00.000Z"),
        totalPriceCents: 5000,
      }),
    ]));
  });
});

class PrecheckBarrierRepository implements BookingRepository {
  private arrivals = 0;
  public readonly observedPrechecks: Array<BookingInterval | null> = [];
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
    this.observedPrechecks.push(overlap);
    this.arrivals += 1;
    if (this.arrivals === this.requestCount) this.releasePrechecks();
    await this.prechecksComplete;
    return overlap;
  }

  public createBooking(values: BookingCreate): Promise<BookingRecord> {
    return this.repository.createBooking(values);
  }

  public findBookingsForUser(userId: string) {
    return this.repository.findBookingsForUser(userId);
  }

  public findBookingById(id: string) {
    return this.repository.findBookingById(id);
  }

  public cancelBooking(id: string) {
    return this.repository.cancelBooking(id);
  }
}
