import type { Booking, Court } from "../../generated/prisma/client";

export type PreviewCourt = Pick<Court, "id" | "name" | "sportType" | "hourlyPriceCents" | "opensAt" | "closesAt" | "isActive"> & {
  facility: { timezone: string };
};

export type BookingInterval = Pick<Booking, "startsAt" | "endsAt">;
export type BookingRecord = Pick<Booking, "id" | "courtId" | "userId" | "startsAt" | "endsAt" | "status" | "totalPriceCents">;
export type BookingCreate = Pick<Booking, "courtId" | "userId" | "startsAt" | "endsAt" | "status" | "totalPriceCents">;

export interface BookingRepository {
  findCourt(id: string): Promise<PreviewCourt | null>;
  findConfirmedOverlap(courtId: string, startsAt: Date, endsAt: Date): Promise<BookingInterval | null>;
  createBooking(values: BookingCreate): Promise<BookingRecord>;
}
