import type { CourtCardData } from "./CourtCard";
import { CourtCard } from "./CourtCard";

type CourtGridProps = {
  courts: CourtCardData[];
};

export function CourtGrid({ courts }: CourtGridProps) {
  return (
    <section aria-label="Courts">
      <div className="court-grid">
        {courts.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
      </div>
    </section>
  );
}
