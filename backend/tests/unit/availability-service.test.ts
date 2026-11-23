import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AvailabilityService } from "../../src/availability/availabilityService";
import type { AvailabilityCourt, AvailabilityRepository, BookingInterval } from "../../src/availability/availabilityRepository";

const court: AvailabilityCourt = {
  id: "00000000-0000-4000-8000-000000000020",
  isActive: true,
  opensAt: time("07:00"),
  closesAt: time("12:00"),
  facility: { timezone: "America/Sao_Paulo" },
};

describe("AvailabilityService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T12:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("defaults to the facility-local Sunday week and builds local-hour slots", async () => {
    const repository = createRepository();
    const result = await new AvailabilityService(repository).getWeeklyAvailability(court.id);

    expect(result).toMatchObject({
      courtId: court.id,
      weekStart: "2026-11-15",
      weekEnd: "2026-11-21",
      display: { weekStart: "Nov 15, 2026", weekEnd: "Nov 21, 2026" },
      navigation: {
        previous: null,
        next: `/api/courts/${court.id}/availability?weekStart=2026-11-22`,
      },
    });
    expect(result.days).toHaveLength(7);
    expect(result.days[0]).toMatchObject({
      date: "2026-11-15",
      isSelectable: false,
      display: { dayOfMonth: "15", weekday: "Sun" },
    });
    expect(result.days[3]).toMatchObject({
      date: "2026-11-18",
      isSelectable: true,
      display: { dayOfMonth: "18", weekday: "Wed" },
      slots: [
        { startsAt: "2026-11-18T10:00:00Z", status: "past", display: { startsAt: "07:00", endsAt: "08:00" } },
        { startsAt: "2026-11-18T11:00:00Z", status: "past", display: { startsAt: "08:00", endsAt: "09:00" } },
        { startsAt: "2026-11-18T12:00:00Z", status: "available", display: { startsAt: "09:00", endsAt: "10:00" } },
        { startsAt: "2026-11-18T13:00:00Z", status: "available", display: { startsAt: "10:00", endsAt: "11:00" } },
        { startsAt: "2026-11-18T14:00:00Z", status: "available", display: { startsAt: "11:00", endsAt: "12:00" } },
      ],
    });
    expect(repository.findConfirmedBookings).toHaveBeenCalledWith(
      court.id,
      new Date("2026-11-15T03:00:00.000Z"),
      new Date("2026-11-22T03:00:00.000Z"),
    );
    expect(result).not.toHaveProperty("timezone");
    expect(result.days[3].slots[0]).not.toHaveProperty("endsAt");
  });

  it("validates explicit calendar Sundays and leaves invalid requests unqueried", async () => {
    const repository = createRepository();
    const service = new AvailabilityService(repository);

    for (const weekStart of ["", "2026-11-17", "2026-02-30"]) {
      await expect(service.getWeeklyAvailability(court.id, weekStart)).rejects.toMatchObject({
        status: 422,
        code: "VALIDATION_ERROR",
        fields: [{ field: "weekStart", message: "Choose a Sunday as the start of the week." }],
      });
    }
    expect(repository.findConfirmedBookings).not.toHaveBeenCalled();
  });

  it("marks confirmed overlapping slots booked after past slots take precedence", async () => {
    vi.setSystemTime(new Date("2026-11-18T12:30:00.000Z"));
    const bookings = [
      { startsAt: new Date("2026-11-18T10:30:00.000Z"), endsAt: new Date("2026-11-18T11:30:00.000Z") },
      { startsAt: new Date("2026-11-18T13:30:00.000Z"), endsAt: new Date("2026-11-18T14:30:00.000Z") },
    ];
    const result = await new AvailabilityService(createRepository(court, bookings))
      .getWeeklyAvailability(court.id, "2026-11-15");

    expect(result.days[3].slots.map((slot) => slot.status)).toEqual([
      "past", "past", "past", "booked", "booked",
    ]);
  });

  it("includes previous navigation when the adjacent week is not wholly past", async () => {
    const result = await new AvailabilityService(createRepository())
      .getWeeklyAvailability(court.id, "2026-11-22");

    expect(result.navigation).toEqual({
      previous: `/api/courts/${court.id}/availability?weekStart=2026-11-15`,
      next: `/api/courts/${court.id}/availability?weekStart=2026-11-29`,
    });
  });

  it("returns the approved not-found response for missing or inactive courts", async () => {
    const missing = createRepository(null);
    const inactive = createRepository({ ...court, isActive: false });

    for (const repository of [missing, inactive]) {
      await expect(new AvailabilityService(repository).getWeeklyAvailability(court.id)).rejects.toMatchObject({
        status: 404,
        code: "COURT_NOT_FOUND",
        message: "Court not found or unavailable for booking.",
      });
      expect(repository.findConfirmedBookings).not.toHaveBeenCalled();
    }
  });
});

function createRepository(
  foundCourt: AvailabilityCourt | null = court,
  bookings: BookingInterval[] = [],
): AvailabilityRepository & { findConfirmedBookings: ReturnType<typeof vi.fn> } {
  return {
    findCourt: vi.fn(async () => foundCourt),
    findConfirmedBookings: vi.fn(async () => bookings),
  };
}

function time(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}
