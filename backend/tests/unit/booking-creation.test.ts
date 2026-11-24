import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingService } from "../../src/bookings/bookingService";
import type { BookingRepository, PreviewCourt } from "../../src/bookings/bookingRepository";

const userId = "00000000-0000-4000-8000-000000000011";
const court: PreviewCourt = {
  id: "00000000-0000-4000-8000-000000000020",
  name: "Court 1",
  sportType: "padel",
  hourlyPriceCents: 6000,
  opensAt: time("07:00"),
  closesAt: time("22:00"),
  isActive: true,
  facility: { timezone: "America/Sao_Paulo" },
};

describe("BookingService create", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T12:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("stores the authenticated owner, freshly prepared price, UTC interval and confirmed status", async () => {
    const repository = createRepository();
    const response = await new BookingService(repository).create(userId, {
      courtId: court.id,
      startsAt: "2026-11-20T16:00:00Z",
      durationHours: 2,
    });

    expect(repository.createBooking).toHaveBeenCalledWith({
      courtId: court.id,
      userId,
      startsAt: new Date("2026-11-20T16:00:00.000Z"),
      endsAt: new Date("2026-11-20T18:00:00.000Z"),
      status: "confirmed",
      totalPriceCents: 12000,
    });
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000040",
      court: { id: court.id, name: "Court 1" },
      status: "confirmed",
      canCancel: true,
      display: {
        date: "Nov 20, 2026",
        startsAt: "13:00",
        endsAt: "15:00",
        timezone: "São Paulo time",
        status: "Confirmed",
        totalPrice: "$120.00",
      },
    });
    expect(response).not.toHaveProperty("startsAt");
    expect(response).not.toHaveProperty("endsAt");
    expect(response).not.toHaveProperty("totalPriceCents");
    expect(response).not.toHaveProperty("userId");
  });

  it.each([
    { now: "2026-11-18T12:00:00.000Z", startsAt: "2026-11-18T14:00:00Z", expected: true },
    { now: "2026-11-18T12:01:00.000Z", startsAt: "2026-11-18T14:00:00Z", expected: false },
  ])("computes canCancel at the inclusive two-hour boundary", async ({ now, startsAt, expected }) => {
    vi.setSystemTime(new Date(now));
    const result = await new BookingService(createRepository()).create(userId, {
      courtId: court.id,
      startsAt,
      durationHours: 1,
    });
    expect(result.canCancel).toBe(expected);
  });

  it("keeps the existing sequential overlap precheck and does not write on conflict", async () => {
    const repository = createRepository({ startsAt: new Date("2026-11-20T16:00:00Z"), endsAt: new Date("2026-11-20T17:00:00Z") });
    await expect(new BookingService(repository).create(userId, {
      courtId: court.id,
      startsAt: "2026-11-20T16:00:00Z",
      durationHours: 1,
    })).rejects.toMatchObject({ status: 409, code: "BOOKING_CONFLICT" });
    expect(repository.createBooking).not.toHaveBeenCalled();
  });
});

function createRepository(overlap: { startsAt: Date; endsAt: Date } | null = null): BookingRepository & {
  findCourt: ReturnType<typeof vi.fn>;
  findConfirmedOverlap: ReturnType<typeof vi.fn>;
  createBooking: ReturnType<typeof vi.fn>;
} {
  return {
    findCourt: vi.fn(async () => court),
    findConfirmedOverlap: vi.fn(async () => overlap),
    createBooking: vi.fn(async (values) => ({ id: "00000000-0000-4000-8000-000000000040", ...values })),
    findBookingsForUser: vi.fn(async () => []),
    findBookingById: vi.fn(async () => null),
    cancelBooking: vi.fn(async (id) => ({ id, ...values, court: { id: court.id, name: court.name, facility: court.facility } })),
  };
}

function time(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}
