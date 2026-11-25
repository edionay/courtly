import { Button } from "../../shared/ui/Button";
import basketballImage from "../../assets/courts/basketball.jpg";
import padelImage from "../../assets/courts/padel.jpg";
import neutralImage from "../../assets/courts/sport-neutral.svg";
import tennisImage from "../../assets/courts/tennis.jpg";

export type CourtCardData = {
  id: string;
  name: string;
  sportType: string;
  opensAt: string;
  closesAt: string;
  isActive?: boolean;
  hourlyPriceCents?: number;
  display: {
    hourlyPrice: string;
  };
};

type CourtCardProps = {
  court: CourtCardData;
  isAdmin?: boolean;
  onViewAvailability?: (court: CourtCardData) => void;
  onEditCourt?: (court: CourtCardData) => void;
};

const courtImages: Record<string, string> = {
  tennis: tennisImage,
  basketball: basketballImage,
  padel: padelImage,
};

export function getCourtImage(sport: string) {
  const normalizedSport = sport.trim().toLocaleLowerCase("en");
  return courtImages[normalizedSport] ?? neutralImage;
}

function CourtStatusBadge({
  isAdmin,
  isCourtActive,
}: {
  isAdmin: boolean;
  isCourtActive: boolean;
}) {
  if (!isAdmin) {
    return null;
  }

  const badgeStyle = isCourtActive
    ? "text-primary bg-[#e5f0f5]"
    : "text-muted-foreground bg-gray-100";
  const badgeLabel = isCourtActive ? "Active" : "Inactive";

  return (
    <span
      className={`inline-flex items-center min-h-[28px] px-3.5 rounded-full text-sm font-semibold ${badgeStyle}`}
    >
      {badgeLabel}
    </span>
  );
}

function CourtCardAction({
  court,
  isAdmin,
  isCourtActive,
  onViewAvailability,
  onEditCourt,
}: {
  court: CourtCardData;
  isAdmin: boolean;
  isCourtActive: boolean;
  onViewAvailability?: (court: CourtCardData) => void;
  onEditCourt?: (court: CourtCardData) => void;
}) {
  if (isAdmin) {
    return (
      <div className="w-full mt-6 space-y-2">
        {isCourtActive && (
          <Button
            className="w-full rounded-full"
            aria-label={`View availability for ${court.name}`}
            disabled={!onViewAvailability}
            onClick={() => onViewAvailability?.(court)}
          >
            View availability
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-full rounded-full"
          aria-label={`Edit ${court.name}`}
          disabled={!onEditCourt}
          onClick={() => onEditCourt?.(court)}
        >
          Edit court
        </Button>
      </div>
    );
  }

  if (!isCourtActive) {
    return (
      <div className="w-full mt-6 min-h-[44px] flex items-center justify-center rounded-full bg-gray-100 text-muted-foreground text-sm font-semibold">
        Unavailable for bookings
      </div>
    );
  }

  return (
    <Button
      className="w-full mt-6 rounded-full"
      aria-label={`View availability for ${court.name}`}
      disabled={!onViewAvailability}
      onClick={() => onViewAvailability?.(court)}
    >
      View availability
    </Button>
  );
}

export function CourtCard({
  court,
  isAdmin = false,
  onViewAvailability,
  onEditCourt,
}: CourtCardProps) {
  const image = getCourtImage(court.sportType);
  const isCourtActive = court.isActive !== false;

  return (
    <article className="min-w-0 p-3 bg-surface rounded-card shadow-card flex flex-col justify-between h-full">
      <div>
        <img
          className="block w-full aspect-[10/7] object-cover rounded-xl"
          src={image}
          alt=""
        />
        <h2 className="mt-3.5 text-foreground text-xl font-bold leading-snug">
          {court.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center min-h-[28px] px-3.5 text-primary bg-[#e5f0f5] rounded-full text-sm font-semibold">
            {court.sportType}
          </span>
          <CourtStatusBadge isAdmin={isAdmin} isCourtActive={isCourtActive} />
        </div>
        <div className="mt-4.5">
          <span className="block text-muted-foreground text-sm">Opening hours</span>
          <span className="block mt-1 text-foreground text-base font-semibold tabular-nums whitespace-nowrap">
            <span>{court.opensAt}</span>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> until </span>
            <span>{court.closesAt}</span>
          </span>
        </div>
      </div>
      <div>
        <p className="flex items-baseline gap-2.5 mt-4 mb-0">
          <span className="text-primary text-2xl font-bold tabular-nums whitespace-nowrap">
            {court.display.hourlyPrice}
          </span>
          <span className="text-muted-foreground text-sm">/ hour</span>
        </p>
        <CourtCardAction
          court={court}
          isAdmin={isAdmin}
          isCourtActive={isCourtActive}
          onViewAvailability={onViewAvailability}
          onEditCourt={onEditCourt}
        />
      </div>
    </article>
  );
}
