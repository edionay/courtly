import type { Court } from "../../generated/prisma/client";

/** Opening hours are whole-hour wall-clock values in the facility's America/Sao_Paulo timezone. */
export interface CourtRepresentation {
  id: string;
  name: string;
  sportType: string;
  isActive: boolean;
  hourlyPriceCents: number;
  opensAt: string;
  closesAt: string;
  display: { hourlyPrice: string };
}

export function presentCourt(court: Court): CourtRepresentation {
  return {
    id: court.id,
    name: court.name,
    sportType: court.sportType,
    isActive: court.isActive,
    hourlyPriceCents: court.hourlyPriceCents,
    opensAt: formatTime(court.opensAt),
    closesAt: formatTime(court.closesAt),
    display: { hourlyPrice: `$${(court.hourlyPriceCents / 100).toFixed(2)}` },
  };
}

function formatTime(value: Date): string {
  return value.toISOString().slice(11, 16);
}
