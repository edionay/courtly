import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaBookingRepository } from "../../src/bookings/prismaBookingRepository";

const { createBooking, findMany } = vi.hoisted(() => ({ createBooking: vi.fn(), findMany: vi.fn() }));

vi.mock("../../src/database", () => ({
  getPrismaClient: () => ({ booking: { create: createBooking, findMany } }),
}));

const values = {
  courtId: "00000000-0000-4000-8000-000000000020",
  userId: "00000000-0000-4000-8000-000000000011",
  startsAt: new Date("2040-02-20T15:00:00.000Z"),
  endsAt: new Date("2040-02-20T16:00:00.000Z"),
  status: "confirmed" as const,
  totalPriceCents: 5000,
};

describe("PrismaBookingRepository.createBooking", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps only the observed named PostgreSQL exclusion error", async () => {
    createBooking.mockRejectedValueOnce(prismaOverlapError());

    await expect(new PrismaBookingRepository().createBooking(values)).rejects.toMatchObject({
      status: 409,
      code: "BOOKING_CONFLICT",
      message: "This time slot is no longer available.",
    });
  });

  it("rethrows an unrelated persistence error without replacing it", async () => {
    const error = Object.assign(new Error("Unique email constraint"), {
      name: "PrismaClientKnownRequestError",
      code: "P2039",
      meta: { driverAdapterError: { cause: { code: "23505", originalMessage: "duplicate email" } } },
    });
    createBooking.mockRejectedValueOnce(error);

    await expect(new PrismaBookingRepository().createBooking(values)).rejects.toBe(error);
  });

  it("rethrows the observed deadlock error unchanged", async () => {
    const firstDeadlock = prismaDeadlockError();
    const secondDeadlock = prismaDeadlockError();
    createBooking.mockRejectedValueOnce(firstDeadlock).mockRejectedValueOnce(secondDeadlock);

    await expect(new PrismaBookingRepository().createBooking(values)).rejects.toBe(secondDeadlock);
    expect(createBooking).toHaveBeenCalledTimes(2);
    expect(createBooking).toHaveBeenNthCalledWith(1, { data: values });
    expect(createBooking).toHaveBeenNthCalledWith(2, { data: values });
  });

  it("retries one confirmed deadlock and maps a subsequent named overlap", async () => {
    createBooking.mockRejectedValueOnce(prismaDeadlockError()).mockRejectedValueOnce(prismaOverlapError());

    await expect(new PrismaBookingRepository().createBooking(values)).rejects.toMatchObject({
      status: 409,
      code: "BOOKING_CONFLICT",
    });
    expect(createBooking).toHaveBeenCalledTimes(2);
    expect(createBooking).toHaveBeenNthCalledWith(1, { data: values });
    expect(createBooking).toHaveBeenNthCalledWith(2, { data: values });
  });

  it("retries one confirmed deadlock and returns a successful insert", async () => {
    const booking = { id: "00000000-0000-4000-8000-000000000040", ...values };
    createBooking.mockRejectedValueOnce(prismaDeadlockError()).mockResolvedValueOnce(booking);

    await expect(new PrismaBookingRepository().createBooking(values)).resolves.toBe(booking);
    expect(createBooking).toHaveBeenCalledTimes(2);
  });

  it("does not retry unrelated P2034 errors", async () => {
    const error = Object.assign(new Error("connection closed"), {
      name: "PrismaClientKnownRequestError",
      code: "P2034",
      meta: { driverAdapterError: { cause: { originalCode: "08006", originalMessage: "connection failure" } } },
    });
    createBooking.mockRejectedValueOnce(error);

    await expect(new PrismaBookingRepository().createBooking(values)).rejects.toBe(error);
    expect(createBooking).toHaveBeenCalledTimes(1);
  });
});

describe("PrismaBookingRepository.findBookingsForUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries only the requested owner and orders by start descending", async () => {
    const rows = [{ id: "booking-1" }];
    findMany.mockResolvedValueOnce(rows);

    await expect(new PrismaBookingRepository().findBookingsForUser(values.userId)).resolves.toBe(rows);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: values.userId },
      orderBy: { startsAt: "desc" },
      select: expect.objectContaining({
        totalPriceCents: true,
        court: { select: { id: true, name: true, facility: { select: { timezone: true } } } },
      }),
    });
  });
});

function prismaOverlapError(): Record<string, unknown> {
  return {
    name: "PrismaClientKnownRequestError",
    code: "P2039",
    meta: {
      driverAdapterError: {
        cause: {
          code: "23P01",
          originalMessage: 'conflicting key value violates exclusion constraint "bookings_no_confirmed_overlap"',
        },
      },
    },
  };
}

function prismaDeadlockError(): Error & Record<string, unknown> {
  return Object.assign(new Error("deadlock detected"), {
    name: "PrismaClientKnownRequestError",
    code: "P2034",
    meta: { driverAdapterError: { cause: { originalCode: "40P01", originalMessage: "deadlock detected" } } },
  });
}
