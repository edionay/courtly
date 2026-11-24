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
  display: {
    hourlyPrice: string;
  };
  availabilityHref: string;
};

type CourtCardProps = {
  court: CourtCardData;
  onViewAvailability?: (court: CourtCardData) => void;
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

export function CourtCard({ court, onViewAvailability }: CourtCardProps) {
  const image = getCourtImage(court.sportType);

  return (
    <article className="court-card" aria-labelledby={`court-${court.id}`}>
      <img className="court-card-image" src={image} alt="" />
      <h2 id={`court-${court.id}`} className="court-card-heading">
        {court.name}
      </h2>
      <p className="court-card-sport">{court.sportType}</p>
      <div className="court-card-meta">
        <div>
          <span className="court-card-hours-label">Opening hours</span>
          <span className="court-card-hours">
            <span>{court.opensAt}</span>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> until </span>
            <span>{court.closesAt}</span>
          </span>
        </div>
      </div>
      <p className="court-card-price-line">
        <span className="court-card-price">{court.display.hourlyPrice}</span>
        <span className="court-card-price-unit">/ hour</span>
      </p>
      {onViewAvailability ? (
        <Button
          className="court-card-action"
          onClick={() => onViewAvailability(court)}
        >
          View availability
        </Button>
      ) : (
        <a className="court-card-action" href={court.availabilityHref}>
          View availability
        </a>
      )}
    </article>
  );
}
