import { describe, expect, it } from "vitest";
import type { Court } from "../../generated/prisma/client";
import { CourtService } from "../../src/courts/courtService";
import type { CourtRepository } from "../../src/courts/courtRepository";

const existingCourt: Court = {
  id: "00000000-0000-4000-8000-000000000020",
  facilityId: "00000000-0000-4000-8000-000000000001",
  name: "Court 1",
  sportType: "Tennis",
  hourlyPriceCents: 4500,
  opensAt: new Date("1970-01-01T08:00:00.000Z"),
  closesAt: new Date("1970-01-01T18:00:00.000Z"),
  isActive: true,
};

describe("CourtService", () => {
  it("rejects a partial update whose final opening interval is invalid", async () => {
    let updateCalled = false;
    const store: CourtRepository = {
      list: async () => [existingCourt],
      findById: async () => existingCourt,
      create: async () => existingCourt,
      update: async () => {
        updateCalled = true;
        return existingCourt;
      },
      findFacility: async () => ({ id: existingCourt.facilityId }),
    };

    await expect(new CourtService(store).update(existingCourt.id, { closesAt: "07:00" })).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_ERROR",
      fields: [{ field: "closesAt" }],
    });
    expect(updateCalled).toBe(false);
  });

  it("updates only supplied fields and preserves the rest", async () => {
    let savedChanges: unknown;
    const store: CourtRepository = {
      list: async () => [existingCourt],
      findById: async () => existingCourt,
      create: async () => existingCourt,
      update: async (_id, changes) => {
        savedChanges = changes;
        return { ...existingCourt, ...changes };
      },
      findFacility: async () => ({ id: existingCourt.facilityId }),
    };

    const result = await new CourtService(store).update(existingCourt.id, { isActive: false });

    expect(savedChanges).toEqual({ isActive: false });
    expect(result).toMatchObject({ isActive: false, opensAt: "08:00", closesAt: "18:00" });
  });
});
