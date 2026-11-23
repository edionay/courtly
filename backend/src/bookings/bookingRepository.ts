import type { Booking, Court } from "../../generated/prisma/client";

export type PreviewCourt = Pick<Court, "id" | "name" | "sportType" | "hourlyPriceCents" | "opensAt" | "closesAt" | "isActive"> & {
  facility: { timezone: string };
};

export type BookingInterval = Pick<Booking, "startsAt" | "endsAt">;

export interface BookingRepository {
  findCourt(id: string): Promise<PreviewCourt | null>;
  findConfirmedOverlap(courtId: string, startsAt: Date, endsAt: Date): Promise<BookingInterval | null>;
}
