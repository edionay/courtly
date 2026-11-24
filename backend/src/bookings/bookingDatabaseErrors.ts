const BOOKING_OVERLAP_SQLSTATE = "23P01";
const BOOKING_OVERLAP_CONSTRAINT = "bookings_no_confirmed_overlap";
const DEADLOCK_SQLSTATE = "40P01";

export function isBookingOverlapConstraintViolation(error: unknown): boolean {
  if (!isRecord(error) || error.name !== "PrismaClientKnownRequestError" || error.code !== "P2039") return false;

  const meta = readRecord(error.meta);
  const driverError = readRecord(meta?.driverAdapterError);
  const cause = readRecord(driverError?.cause);
  if (cause?.code !== BOOKING_OVERLAP_SQLSTATE || typeof cause.originalMessage !== "string") return false;

  const constraintName = cause.originalMessage.match(/constraint "([^"]+)"/)?.[1];
  return constraintName === BOOKING_OVERLAP_CONSTRAINT;
}

export function isRetryableBookingDeadlock(error: unknown): boolean {
  if (!isRecord(error) || error.name !== "PrismaClientKnownRequestError" || error.code !== "P2034") return false;

  const meta = readRecord(error.meta);
  const driverError = readRecord(meta?.driverAdapterError);
  const cause = readRecord(driverError?.cause);
  return cause?.originalCode === DEADLOCK_SQLSTATE;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
