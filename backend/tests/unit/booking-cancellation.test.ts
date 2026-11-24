import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingService } from "../../src/bookings/bookingService";
import type { BookingRepository, PersonalBookingRecord, PreviewCourt } from "../../src/bookings/bookingRepository";

const userId = "00000000-0000-4000-8000-000000000011";
const otherUserId = "00000000-0000-4000-8000-000000000012";
const bookingId = "00000000-0000-4000-8000-000000000040";
const court: PreviewCourt = {
  id: "00000000-0000-4000-8000-000000000020",
  name: "Court 1",
  sportType: "padel",
  hourlyPriceCents: 9000,
  opensAt: time("07:00"),
  closesAt: time("22:00"),
  isActive: false,
  facility: { timezone: "America/Sao_Paulo" },
};

describe("BookingService.cancel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it.each([
    { startsAt: "2026-11-23T13:59:59.999Z", expected: "closed" },
    { startsAt: "2026-11-23T14:00:00.000Z", expected: "cancelled" },
    { startsAt: "2026-11-23T14:00:00.001Z", expected: "cancelled" },
  ])("enforces the inclusive two-hour boundary for $startsAt", async ({ startsAt, expected }) => {
    const repository = createRepository(personalBooking("confirmed", startsAt));
    const service = new BookingService(repository);

    if (expected === "closed") {
      await expect(service.cancel(userId, bookingId)).rejects.toMatchObject({
        status: 409,
        code: "CANCELLATION_WINDOW_CLOSED",
      });
      expect(repository.cancelBooking).not.toHaveBeenCalled();
      return;
    }

    await expect(service.cancel(userId, bookingId)).resolves.toMatchObject({
      id: bookingId,
      status: "cancelled",
      canCancel: false,
      display: { status: "Cancelled", totalPrice: "$42.00" },
    });
    expect(repository.cancelBooking).toHaveBeenCalledWith(bookingId);
  });

  it("returns BOOKING_NOT_FOUND without attempting a write", async () => {
    const repository = createRepository(null);
    await expect(new BookingService(repository).cancel(userId, bookingId)).rejects.toMatchObject({
      status: 404,
      code: "BOOKING_NOT_FOUND",
    });
    expect(repository.cancelBooking).not.toHaveBeenCalled();
  });

  it.each(["confirmed", "cancelled"] as const)("checks ownership before handling a %s booking", async (status) => {
    const repository = createRepository(personalBooking(status, "2020-11-20T16:00:00.000Z", otherUserId));
    await expect(new BookingService(repository).cancel(userId, bookingId)).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
    expect(repository.cancelBooking).not.toHaveBeenCalled();
  });

  it("returns an owned cancelled booking unchanged without writing, even when past", async () => {
    const booking = personalBooking("cancelled", "2020-11-20T16:00:00.000Z");
    const repository = createRepository(booking);

    const result = await new BookingService(repository).cancel(userId, bookingId);

    expect(result).toMatchObject({
      id: bookingId,
      court: { id: court.id, name: court.name },
      status: "cancelled",
      canCancel: false,
      display: {
        date: "Nov 20, 2020",
        startsAt: "13:00",
        endsAt: "14:00",
        timezone: "São Paulo time",
        status: "Cancelled",
        totalPrice: "$42.00",
      },
    });
    expect(repository.cancelBooking).not.toHaveBeenCalled();
  });

  it("updates only status and preserves the stored personal booking details", async () => {
    const original = personalBooking("confirmed", "2026-11-23T16:00:00.000Z");
    const cancelled = { ...original, status: "cancelled" as const };
    const repository = createRepository(original, cancelled);

    const result = await new BookingService(repository).cancel(userId, bookingId);

    expect(repository.cancelBooking).toHaveBeenCalledTimes(1);
    expect(repository.cancelBooking).toHaveBeenCalledWith(bookingId);
    expect(result).toMatchObject({
      court: { id: court.id, name: court.name },
      status: "cancelled",
      canCancel: false,
      display: { totalPrice: "$42.00", status: "Cancelled" },
    });
  });
});

function createRepository(
  foundBooking: PersonalBookingRecord | null,
  updatedBooking: PersonalBookingRecord | null = foundBooking
    ? { ...foundBooking, status: "cancelled" }
    : null,
): BookingRepository & {
  findBookingById: ReturnType<typeof vi.fn>;
  cancelBooking: ReturnType<typeof vi.fn>;
} {
  return {
    findCourt: vi.fn(async () => court),
    findConfirmedOverlap: vi.fn(async () => null),
    createBooking: vi.fn(async (values) => ({ id: bookingId, ...values })),
    findBookingsForUser: vi.fn(async () => []),
    findBookingById: vi.fn(async () => foundBooking),
    cancelBooking: vi.fn(async () => {
      if (!updatedBooking) throw new Error("Updated booking fixture is missing");
      return updatedBooking;
    }),
  };
}

function personalBooking(
  status: "confirmed" | "cancelled",
  startsAt: string,
  ownerId = userId,
): PersonalBookingRecord {
  return {
    id: bookingId,
    courtId: court.id,
    userId: ownerId,
    startsAt: new Date(startsAt),
    endsAt: new Date(new Date(startsAt).getTime() + 60 * 60 * 1000),
    status,
    totalPriceCents: 4200,
    court: { id: court.id, name: court.name, facility: court.facility },
  };
}

function time(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}
