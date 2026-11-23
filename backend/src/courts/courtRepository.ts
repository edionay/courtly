import type { Court } from "../../generated/prisma/client";

export interface CourtChanges {
  name?: string;
  sportType?: string;
  hourlyPriceCents?: number;
  opensAt?: Date;
  closesAt?: Date;
  isActive?: boolean;
}

export interface CourtRepository {
  list(activeOnly: boolean): Promise<Court[]>;
  findById(id: string): Promise<Court | null>;
  create(facilityId: string, values: Required<Omit<CourtChanges, "isActive">>): Promise<Court>;
  update(id: string, changes: CourtChanges): Promise<Court>;
  findFacility(): Promise<{ id: string } | null>;
}
