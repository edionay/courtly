import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingService } from "../../src/bookings/bookingService";
import type { BookingRepository, PreviewCourt } from "../../src/bookings/bookingRepository";

const court: PreviewCourt = {
  id: "00000000-0000-4000-8000-000000000020",
  name: "Court 1",
  sportType: "padel",
  hourlyPriceCents: 5000,
  opensAt: time("07:00"),
  closesAt: time("22:00"),
  isActive: true,
  facility: { timezone: "America/Sao_Paulo" },
};

describe("BookingService preview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it.each([1, 2])("prepares a %i-hour booking with local display values and price", async (durationHours) => {
    const repository = createRepository();
    const result = await new BookingService(repository).preview({
      courtId: court.id,
      startsAt: "2026-11-20T16:00:00Z",
      durationHours,
    });

    expect(result).toEqual({
      court: { id: court.id, name: "Court 1", sportType: "padel" },
      durationHours,
      display: {
        date: "Nov 20, 2026",
        startsAt: "13:00",
        endsAt: durationHours === 1 ? "14:00" : "15:00",
        totalPrice: durationHours === 1 ? "$50.00" : "$100.00",
      },
    });
    expect(repository.findConfirmedOverlap).toHaveBeenCalledWith(
      court.id,
      new Date("2026-11-20T16:00:00.000Z"),
      new Date(`2026-11-20T${durationHours === 1 ? "17" : "18"}:00:00.000Z`),
    );
  });

  it("treats equivalent offset timestamps as the same selection", async () => {
    const service = new BookingService(createRepository());
    const utc = await service.preview({ courtId: court.id, startsAt: "2026-11-20T16:00:00Z", durationHours: 2 });
    const local = await service.preview({ courtId: court.id, startsAt: "2026-11-20T13:00:00-03:00", durationHours: 2 });
    expect(local).toEqual(utc);
  });

  it("checks whole-hour alignment in the facility timezone", async () => {
    const service = new BookingService(createRepository());
    const equivalentLocalHour = await service.preview({
      courtId: court.id,
      startsAt: "2026-11-20T17:30:00+01:30",
      durationHours: 1,
    });
    expect(equivalentLocalHour.display.startsAt).toBe("13:00");

    await expect(service.preview({
      courtId: court.id,
      startsAt: "2026-11-20T13:00:00+01:30",
      durationHours: 1,
    })).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fields: [{ field: "startsAt", message: "Choose a start time on the hour." }],
    });
  });

  it.each([
    { startsAt: "2026-11-20T16:00:00", durationHours: 1, field: "startsAt" },
    { startsAt: "2026-11-20T16:00:00.0001Z", durationHours: 1, field: "startsAt" },
    { startsAt: "2026-11-20T16:00:00,0001Z", durationHours: 1, field: "startsAt" },
    { startsAt: "2026-11-20T16:30:00Z", durationHours: 1, field: "startsAt" },
    { startsAt: "2026-11-20T16:00:00Z", durationHours: 3, field: "durationHours" },
    { startsAt: "2026-10-20T16:00:00Z", durationHours: 1, field: "startsAt" },
  ])("rejects an invalid start or duration", async (selection) => {
    const repository = createRepository();
    await expect(new BookingService(repository).preview({ courtId: court.id, ...selection })).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fields: expect.arrayContaining([expect.objectContaining({ field: selection.field })]),
    });
    expect(repository.findConfirmedOverlap).not.toHaveBeenCalled();
  });

  it.each([
    { startsAt: "2026-11-20T09:00:00Z", durationHours: 2 },
    { startsAt: "2026-11-21T01:00:00Z", durationHours: 1 },
  ])("rejects a selection outside the full opening interval", async (selection) => {
    await expect(new BookingService(createRepository()).preview({ courtId: court.id, ...selection })).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fields: [{ field: "startsAt" }],
    });
  });

  it("rejects an overlap but allows adjacent intervals", async () => {
    const startsAt = new Date("2026-11-20T16:00:00.000Z");
    const endsAt = new Date("2026-11-20T18:00:00.000Z");
    const conflict = createRepository(court, { startsAt: new Date("2026-11-20T17:00:00Z"), endsAt });
    await expect(new BookingService(conflict).preview({ courtId: court.id, startsAt: startsAt.toISOString(), durationHours: 2 }))
      .rejects.toMatchObject({ status: 409, code: "BOOKING_CONFLICT" });

    const adjacent = createRepository(court, null);
    await expect(new BookingService(adjacent).preview({ courtId: court.id, startsAt: startsAt.toISOString(), durationHours: 2 }))
      .resolves.toMatchObject({ display: { startsAt: "13:00", endsAt: "15:00" } });
    expect(adjacent.findConfirmedOverlap).toHaveBeenCalledWith(court.id, startsAt, endsAt);
  });

  it("returns missing and inactive court errors before checking bookings", async () => {
    await expect(new BookingService(createRepository(null)).preview(selection())).rejects.toMatchObject({
      status: 404,
      code: "COURT_NOT_FOUND",
    });
    const inactive = createRepository({ ...court, isActive: false });
    await expect(new BookingService(inactive).preview(selection())).rejects.toMatchObject({
      status: 409,
      code: "COURT_INACTIVE",
    });
    expect(inactive.findConfirmedOverlap).not.toHaveBeenCalled();
  });
});

function createRepository(
  foundCourt: PreviewCourt | null = court,
  overlap: { startsAt: Date; endsAt: Date } | null = null,
): BookingRepository & { findCourt: ReturnType<typeof vi.fn>; findConfirmedOverlap: ReturnType<typeof vi.fn> } {
  return {
    findCourt: vi.fn(async () => foundCourt),
    findConfirmedOverlap: vi.fn(async () => overlap),
    createBooking: vi.fn(async (values) => ({ id: "00000000-0000-4000-8000-000000000040", ...values })),
  };
}

function selection() {
  return { courtId: court.id, startsAt: "2026-11-20T16:00:00Z", durationHours: 2 };
}

function time(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}
