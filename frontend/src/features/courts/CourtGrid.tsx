import type { CourtCardData } from "./CourtCard";
import { CourtCard } from "./CourtCard";

type CourtGridProps = {
  courts: CourtCardData[];
  onViewAvailability?: (court: CourtCardData) => void;
};

export function CourtGrid({ courts, onViewAvailability }: CourtGridProps) {
  return (
    <section aria-label="Courts">
      <div className="court-grid">
        {courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            onViewAvailability={onViewAvailability}
          />
        ))}
      </div>
    </section>
  );
}
