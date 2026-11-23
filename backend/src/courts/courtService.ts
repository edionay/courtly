import { ApiError, validationError, type FieldError } from "../errors/apiError";
import type { CourtRepository, CourtChanges } from "./courtRepository";
import { presentCourt, type CourtRepresentation } from "./courtPresenter";

export interface CreateCourtInput {
  name: string;
  sportType: string;
  hourlyPriceCents: number;
  opensAt: string;
  closesAt: string;
}

export interface UpdateCourtInput {
  name?: string;
  sportType?: string;
  hourlyPriceCents?: number;
  opensAt?: string;
  closesAt?: string;
  isActive?: boolean;
}

export class CourtService {
  public constructor(private readonly repository: CourtRepository) {}

  public async list(isAdmin: boolean): Promise<{ items: CourtRepresentation[] }> {
    const courts = await this.repository.list(!isAdmin);
    return { items: courts.map(presentCourt) };
  }

  public async create(input: CreateCourtInput): Promise<CourtRepresentation> {
    const fields = validateValues(input);
    fields.push(...openingHoursErrors(input.opensAt, input.closesAt));
    if (fields.length) throw validationError(fields);

    const facility = await this.repository.findFacility();
    if (!facility) throw new Error("Seeded facility is missing");

    const created = await this.repository.create(facility.id, {
      name: input.name.trim(),
      sportType: input.sportType.trim(),
      hourlyPriceCents: input.hourlyPriceCents,
      opensAt: toStoredTime(input.opensAt),
      closesAt: toStoredTime(input.closesAt),
    });
    return presentCourt(created);
  }

  public async update(id: string, input: UpdateCourtInput): Promise<CourtRepresentation> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new ApiError(404, "COURT_NOT_FOUND", "Court not found.");

    const fields = validateValues(input);
    const opensAt = input.opensAt ?? formatStoredTime(existing.opensAt);
    const closesAt = input.closesAt ?? formatStoredTime(existing.closesAt);
    fields.push(...openingHoursErrors(opensAt, closesAt));
    if (fields.length) throw validationError(fields);

    const changes: CourtChanges = {};
    if (input.name !== undefined) changes.name = input.name.trim();
    if (input.sportType !== undefined) changes.sportType = input.sportType.trim();
    if (input.hourlyPriceCents !== undefined) changes.hourlyPriceCents = input.hourlyPriceCents;
    if (input.opensAt !== undefined) changes.opensAt = toStoredTime(input.opensAt);
    if (input.closesAt !== undefined) changes.closesAt = toStoredTime(input.closesAt);
    if (input.isActive !== undefined) changes.isActive = input.isActive;

    const updated = await this.repository.update(id, changes);
    return presentCourt(updated);
  }
}

function validateValues(input: CreateCourtInput | UpdateCourtInput): FieldError[] {
  const fields: FieldError[] = [];
  if ("name" in input && input.name !== undefined && (typeof input.name !== "string" || input.name.trim() === "")) {
    fields.push({ field: "name", message: "Enter a court name." });
  }
  if ("sportType" in input && input.sportType !== undefined && (typeof input.sportType !== "string" || input.sportType.trim() === "")) {
    fields.push({ field: "sportType", message: "Enter a sport type." });
  }
  if ("hourlyPriceCents" in input && input.hourlyPriceCents !== undefined &&
      (!Number.isInteger(input.hourlyPriceCents) || input.hourlyPriceCents < 1)) {
    fields.push({ field: "hourlyPriceCents", message: "Enter a positive whole number of cents." });
  }
  if ("opensAt" in input && input.opensAt !== undefined && !isWholeHour(input.opensAt)) {
    fields.push({ field: "opensAt", message: "Choose a local whole-hour time in HH:00 format." });
  }
  if ("closesAt" in input && input.closesAt !== undefined && !isWholeHour(input.closesAt)) {
    fields.push({ field: "closesAt", message: "Choose a local whole-hour time in HH:00 format." });
  }
  if ("isActive" in input && input.isActive !== undefined && typeof input.isActive !== "boolean") {
    fields.push({ field: "isActive", message: "Choose whether the court is active." });
  }
  return fields;
}

export function openingHoursErrors(opensAt: string, closesAt: string): FieldError[] {
  if (!isWholeHour(opensAt) || !isWholeHour(closesAt) || opensAt < closesAt) return [];
  return [{ field: "closesAt", message: "Closing time must be later than opening time." }];
}

function isWholeHour(value: string): boolean {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):00$/.test(value);
}

function toStoredTime(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function formatStoredTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}
