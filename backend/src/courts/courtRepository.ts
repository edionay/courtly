import { getPrismaClient } from "../database";

export interface CourtChanges {
  name?: string;
  sportType?: string;
  hourlyPriceCents?: number;
  opensAt?: Date;
  closesAt?: Date;
  isActive?: boolean;
}

export class CourtRepository {
  public list(activeOnly: boolean) {
    return getPrismaClient().court.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });
  }

  public findById(id: string) {
    return getPrismaClient().court.findUnique({ where: { id } });
  }

  public async create(facilityId: string, values: Required<Omit<CourtChanges, "isActive">>) {
    return getPrismaClient().court.create({ data: { ...values, facilityId, isActive: true } });
  }

  public update(id: string, changes: CourtChanges) {
    return getPrismaClient().court.update({ where: { id }, data: changes });
  }

  public findFacility() {
    return getPrismaClient().facility.findFirst({ select: { id: true } });
  }
}
