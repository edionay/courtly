import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingService } from "../../src/bookings/bookingService";
import type { BookingRepository, PersonalBookingRecord, PreviewCourt } from "../../src/bookings/bookingRepository";

const userId = "00000000-0000-4000-8000-000000000011";
const otherUserId = "00000000-0000-4000-8000-000000000012";
const now = new Date("2026-11-20T14:00:00.000Z");
const court: PreviewCourt = {
  id: "00000000-0000-4000-8000-000000000020",
  name: "Court 1",
  sportType: "padel",
  hourlyPriceCents: 9000,
  opensAt: time("07:00"),
  closesAt: time("22:00"),
  isActive: true,
  facility: { timezone: "America/Sao_Paulo" },
};

describe("BookingService.listMine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => vi.useRealTimers());

  it("uses the authenticated owner and returns saved history presentation and eligibility", async () => {
    const rows = [
      booking("confirmed", "2026-11-20T16:00:00Z", "2026-11-20T17:00:00Z", 5000),
      booking("cancelled", "2026-11-19T16:00:00Z", "2026-11-19T17:00:00Z", 3500),
      booking("confirmed", "2026-11-20T16:00:00Z", "2026-11-20T17:00:00Z", 5000, otherUserId),
    ];
    const repository = createRepository(rows);

    const result = await new BookingService(repository).listMine(userId);

    expect(repository.findBookingsForUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ items: [
      {
        id: "booking-confirmed",
        court: { id: court.id, name: court.name },
        status: "confirmed",
        canCancel: true,
        display: {
          date: "Nov 20, 2026", startsAt: "13:00", endsAt: "14:00", timezone: "São Paulo time",
          status: "Confirmed", totalPrice: "$50.00",
        },
      },
      {
        id: "booking-cancelled",
        court: { id: court.id, name: court.name },
        status: "cancelled",
        canCancel: false,
        display: {
          date: "Nov 19, 2026", startsAt: "13:00", endsAt: "14:00", timezone: "São Paulo time",
          status: "Cancelled", totalPrice: "$35.00",
        },
      },
      {
        id: "booking-confirmed",
        court: { id: court.id, name: court.name },
        status: "confirmed",
        canCancel: false,
        display: {
          date: "Nov 20, 2026", startsAt: "13:00", endsAt: "14:00", timezone: "São Paulo time",
          status: "Confirmed", totalPrice: "$50.00",
        },
      },
    ] });
    expect(JSON.stringify(result)).not.toMatch(/userId|startsAt\":\"2026|totalPriceCents|sportType/);
  });

  it("returns an empty collection when the owner has no bookings", async () => {
    const repository = createRepository([]);
    await expect(new BookingService(repository).listMine(userId)).resolves.toEqual({ items: [] });
    expect(repository.findBookingsForUser).toHaveBeenCalledWith(userId);
  });

  it("allows cancellation at exact equality with the two-hour cutoff", async () => {
    const repository = createRepository([booking("confirmed", "2026-11-20T16:00:00Z", "2026-11-20T17:00:00Z", 5000)]);
    const result = await new BookingService(repository).listMine(userId);
    expect(result.items[0].canCancel).toBe(true);
  });
});

function createRepository(rows: PersonalBookingRecord[]): BookingRepository & { findBookingsForUser: ReturnType<typeof vi.fn> } {
  return {
    findCourt: vi.fn(async () => court),
    findConfirmedOverlap: vi.fn(async () => null),
    createBooking: vi.fn(async (values) => ({ id: "created", ...values })),
    findBookingsForUser: vi.fn(async () => rows),
  };
}

function booking(
  status: "confirmed" | "cancelled",
  startsAt: string,
  endsAt: string,
  totalPriceCents: number,
  ownerId = userId,
): PersonalBookingRecord {
  return {
    id: `booking-${status}`,
    courtId: court.id,
    userId: ownerId,
    startsAt: new Date(startsAt),
    endsAt: new Date(endsAt),
    status,
    totalPriceCents,
    court: { id: court.id, name: court.name, facility: court.facility },
  };
}

function time(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}
