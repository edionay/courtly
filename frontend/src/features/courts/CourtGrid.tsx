import type { CourtCardData } from "./CourtCard";
import { CourtCard } from "./CourtCard";

type CourtGridProps = {
  courts: CourtCardData[];
  isAdmin?: boolean;
  onViewAvailability?: (court: CourtCardData) => void;
  onEditCourt?: (court: CourtCardData) => void;
};

export function CourtGrid({
  courts,
  isAdmin = false,
  onViewAvailability,
  onEditCourt,
}: CourtGridProps) {
  return (
    <ul
      role="list"
      aria-label="Courts"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-5 md:mt-7 p-0 list-none"
    >
      {courts.map((court) => (
        <li key={court.id} className="min-w-0">
          <CourtCard
            court={court}
            isAdmin={isAdmin}
            onViewAvailability={onViewAvailability}
            onEditCourt={onEditCourt}
          />
        </li>
      ))}
    </ul>
  );
}
