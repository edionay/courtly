import { describe, expect, it } from "vitest";
import { isBookingOverlapConstraintViolation, isRetryableBookingDeadlock } from "../../src/bookings/bookingDatabaseErrors";

describe("isBookingOverlapConstraintViolation", () => {
  it("matches the observed Prisma adapter exclusion error and named constraint", () => {
    expect(isBookingOverlapConstraintViolation(prismaError("23P01", "bookings_no_confirmed_overlap"))).toBe(true);
  });

  it("does not classify unrelated P2039 adapter errors", () => {
    expect(isBookingOverlapConstraintViolation(prismaError("23505", "bookings_no_confirmed_overlap"))).toBe(false);
  });

  it("does not classify a concurrent deadlock as a booking overlap", () => {
    expect(isBookingOverlapConstraintViolation({
      name: "PrismaClientKnownRequestError",
      code: "P2034",
      meta: { driverAdapterError: { cause: { originalCode: "40P01", originalMessage: "deadlock detected" } } },
    })).toBe(false);
  });

  it("does not classify a different exclusion constraint", () => {
    expect(isBookingOverlapConstraintViolation(prismaError("23P01", "other_constraint"))).toBe(false);
  });

  it("does not classify an error from message text alone", () => {
    expect(isBookingOverlapConstraintViolation({
      name: "PrismaClientKnownRequestError",
      code: "P2039",
      message: 'constraint "bookings_no_confirmed_overlap"',
    })).toBe(false);
  });

  it.each([null, undefined, "database error", { code: "P2039" }])("rejects malformed or unrelated values", (error) => {
    expect(isBookingOverlapConstraintViolation(error)).toBe(false);
  });
});

describe("isRetryableBookingDeadlock", () => {
  it("matches the observed Prisma P2034/40P01 rollback", () => {
    expect(isRetryableBookingDeadlock(deadlockError("P2034", "40P01"))).toBe(true);
  });

  it("does not retry other P2034 causes", () => {
    expect(isRetryableBookingDeadlock(deadlockError("P2034", "08006"))).toBe(false);
  });

  it("does not retry 40P01 under another Prisma error code", () => {
    expect(isRetryableBookingDeadlock(deadlockError("P2039", "40P01"))).toBe(false);
  });
});

function prismaError(sqlstate: string, constraint: string): Record<string, unknown> {
  return {
    name: "PrismaClientKnownRequestError",
    code: "P2039",
    meta: {
      driverAdapterError: {
        cause: {
          code: sqlstate,
          originalMessage: `conflicting key value violates exclusion constraint "${constraint}"`,
        },
      },
    },
  };
}

function deadlockError(prismaCode: string, sqlstate: string): Record<string, unknown> {
  return {
    name: "PrismaClientKnownRequestError",
    code: prismaCode,
    meta: { driverAdapterError: { cause: { originalCode: sqlstate } } },
  };
}
