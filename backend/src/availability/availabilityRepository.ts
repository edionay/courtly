import type { Booking, Court } from "../../generated/prisma/client";

export type AvailabilityCourt = Pick<Court, "id" | "isActive" | "opensAt" | "closesAt"> & {
  facility: { timezone: string };
};

export type BookingInterval = Pick<Booking, "startsAt" | "endsAt">;

export interface AvailabilityRepository {
  findCourt(id: string): Promise<AvailabilityCourt | null>;
  findConfirmedBookings(courtId: string, startsAt: Date, endsAt: Date): Promise<BookingInterval[]>;
}
