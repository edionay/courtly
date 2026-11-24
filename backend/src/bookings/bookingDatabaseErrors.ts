const PRISMA_ADAPTER_ERROR_CODE = "P2039";
const PRISMA_TRANSACTION_CONFLICT_ERROR_CODE = "P2034";
const BOOKING_OVERLAP_SQLSTATE = "23P01";
const BOOKING_OVERLAP_CONSTRAINT = "bookings_no_confirmed_overlap";
const DEADLOCK_SQLSTATE = "40P01";

export function isBookingOverlapConstraintViolation(error: unknown): boolean {
  const postgresError = readPostgresError(error, PRISMA_ADAPTER_ERROR_CODE);
  if (!postgresError) return false;

  return postgresError.code === BOOKING_OVERLAP_SQLSTATE &&
    readConstraintName(postgresError.originalMessage) === BOOKING_OVERLAP_CONSTRAINT;
}

export function isRetryableBookingDeadlock(error: unknown): boolean {
  const postgresError = readPostgresError(error, PRISMA_TRANSACTION_CONFLICT_ERROR_CODE);
  return postgresError?.originalCode === DEADLOCK_SQLSTATE;
}

function readPostgresError(error: unknown, expectedPrismaCode: string): Record<string, unknown> | undefined {
  if (!isRecord(error) || error.name !== "PrismaClientKnownRequestError" || error.code !== expectedPrismaCode) return undefined;

  const meta = readRecord(error.meta);
  const driverError = readRecord(meta?.driverAdapterError);
  return readRecord(driverError?.cause);
}

function readConstraintName(originalMessage: unknown): string | undefined {
  if (typeof originalMessage !== "string") return undefined;

  return originalMessage.match(/constraint "([^"]+)"/)?.[1];
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
