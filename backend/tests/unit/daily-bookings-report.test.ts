import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyBookingsService } from "../../src/reports/dailyBookingsService";
import type { DailyBookingRecord, DailyBookingsRepository } from "../../src/reports/dailyBookingsRepository";

const timezone = "America/Sao_Paulo";

describe("DailyBookingsService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-21T02:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("defaults to the facility-local date and includes confirmed revenue from stored prices", async () => {
    const bookings = [
      booking("confirmed", "2026-11-20T16:00:00.000Z", 8250, "Inactive Court"),
      booking("cancelled", "2026-11-20T18:00:00.000Z", 4000, "Court 2"),
    ];
    const repository = createRepository(bookings);

    const result = await new DailyBookingsService(repository).getReport();

    expect(repository.findBookingsBetween).toHaveBeenCalledWith(
      new Date("2026-11-20T03:00:00.000Z"),
      new Date("2026-11-21T03:00:00.000Z"),
    );
    expect(result).toEqual({
      date: "2026-11-20",
      display: { date: "Nov 20, 2026", expectedRevenue: "$82.50" },
      bookings: [
        {
          id: "confirmed-booking",
          court: { id: "court-1", name: "Inactive Court" },
          user: { name: "Alex Morgan" },
          status: "confirmed",
          display: { startsAt: "13:00", endsAt: "14:00", totalPrice: "$82.50" },
        },
        {
          id: "cancelled-booking",
          court: { id: "court-1", name: "Court 2" },
          user: { name: "Alex Morgan" },
          status: "cancelled",
          display: { startsAt: "15:00", endsAt: "16:00", totalPrice: "$40.00" },
        },
      ],
    });
    expect(JSON.stringify(result)).not.toMatch(/startsAt":"2026|endsAt":"2026|totalPriceCents|timezone|userId|hourlyPrice/);
  });

  it("uses explicit valid dates and returns an empty report", async () => {
    const repository = createRepository([]);

    await expect(new DailyBookingsService(repository).getReport("2026-11-20")).resolves.toEqual({
      date: "2026-11-20",
      display: { date: "Nov 20, 2026", expectedRevenue: "$0.00" },
      bookings: [],
    });
    expect(repository.findBookingsBetween).toHaveBeenCalledWith(
      new Date("2026-11-20T03:00:00.000Z"),
      new Date("2026-11-21T03:00:00.000Z"),
    );
  });

  it("rejects empty, non-exact, and impossible dates before querying", async () => {
    const repository = createRepository([]);
    const service = new DailyBookingsService(repository);

    for (const date of ["", "2026-11-20T00:00Z", "2026-2-20", "2026-02-30"]) {
      await expect(service.getReport(date)).rejects.toMatchObject({
        status: 422,
        code: "VALIDATION_ERROR",
        fields: [{ field: "date" }],
      });
    }
    expect(repository.findFacilityTimezone).not.toHaveBeenCalled();
    expect(repository.findBookingsBetween).not.toHaveBeenCalled();
  });
});

function createRepository(rows: DailyBookingRecord[]): DailyBookingsRepository & {
  findFacilityTimezone: ReturnType<typeof vi.fn>;
  findBookingsBetween: ReturnType<typeof vi.fn>;
} {
  return {
    findFacilityTimezone: vi.fn(async () => timezone),
    findBookingsBetween: vi.fn(async () => rows),
  };
}

function booking(
  status: "confirmed" | "cancelled",
  startsAt: string,
  totalPriceCents: number,
  courtName: string,
): DailyBookingRecord {
  const start = new Date(startsAt);
  return {
    id: `${status}-booking`,
    startsAt: start,
    endsAt: new Date(start.getTime() + 60 * 60 * 1000),
    status,
    totalPriceCents,
    court: { id: "court-1", name: courtName },
    user: { name: "Alex Morgan" },
  };
}
