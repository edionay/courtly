import type { Booking, Court, User } from "../../generated/prisma/client";

export type DailyBookingRecord = Pick<Booking, "id" | "startsAt" | "endsAt" | "status" | "totalPriceCents"> & {
  court: Pick<Court, "id" | "name">;
  user: Pick<User, "name">;
};

export interface DailyBookingsRepository {
  findFacilityTimezone(): Promise<string | null>;
  findBookingsBetween(start: Date, end: Date): Promise<DailyBookingRecord[]>;
}
