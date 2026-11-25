import { type MouseEvent } from "react";
import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";

export type BookingReviewData = {
  courtName: string;
  sportType: string;
  dateLabel: string;
  startsAt: string;
  endsAt: string;
  durationLabel: string;
  totalPrice: string;
};

export type BookingReviewViewProps = {
  review?: BookingReviewData | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onChange?: () => void;
  onConfirm?: () => void;
  onBackToCourts?: () => void;
  onBackToCourtSlots?: () => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
};

function Breadcrumb({
  courtName,
  onBackToCourts,
  onBackToCourtSlots,
}: {
  courtName: string;
  onBackToCourts?: () => void;
  onBackToCourtSlots?: () => void;
}) {
  const handleCourtsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onBackToCourts) {
      event.preventDefault();
      onBackToCourts();
    }
  };

  const handleCourtSlotsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onBackToCourtSlots) {
      event.preventDefault();
      onBackToCourtSlots();
    }
  };

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm list-none p-0 m-0">
        <li>
          <a
            href="/courts"
            onClick={handleCourtsClick}
            className="text-primary font-semibold hover:underline"
          >
            Courts
          </a>
        </li>
        <li aria-hidden="true" className="text-muted-foreground">
          /
        </li>
        <li>
          <a
            href="#"
            onClick={handleCourtSlotsClick}
            className="text-primary font-semibold hover:underline"
          >
            {courtName}
          </a>
        </li>
        <li aria-hidden="true" className="text-muted-foreground">
          /
        </li>
        <li aria-current="page" className="text-muted-foreground font-semibold">
          Review
        </li>
      </ol>
    </nav>
  );
}

function ReviewCard({
  review,
  onChange,
}: {
  review: BookingReviewData;
  onChange?: () => void;
}) {
  return (
    <div className="p-6 md:p-8 bg-surface rounded-card shadow-card max-w-[804px]">
      <div>
        <span className="block text-sm font-semibold text-muted-foreground">
          Court
        </span>
        <h2 className="mt-1 text-xl md:text-2xl font-bold text-foreground m-0">
          {review.courtName}
        </h2>
        <p className="mt-1 text-sm md:text-base text-muted-foreground capitalize m-0">
          {review.sportType}
        </p>
      </div>

      <hr className="my-6 border-border" />

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground m-0">
            Date and time
          </h3>
          {onChange && (
            <button
              type="button"
              aria-label="Change date and time"
              onClick={onChange}
              className="text-primary font-bold text-sm md:text-[15px] hover:underline cursor-pointer border-0 bg-transparent p-0"
            >
              Change
            </button>
          )}
        </div>

        <p className="mt-3 text-base font-semibold text-foreground m-0">
          {review.dateLabel}
        </p>
        <p className="mt-1 text-base font-semibold text-foreground m-0 tabular-nums">
          <span>{review.startsAt}</span>
          <span aria-hidden="true"> – </span>
          <span className="sr-only"> until </span>
          <span>{review.endsAt}</span>
        </p>
        <p className="mt-1 text-sm md:text-base text-muted-foreground m-0">
          {review.durationLabel}
        </p>
      </div>

      <hr className="my-6 border-border" />

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {review.totalPrice}
        </span>
      </div>
    </div>
  );
}

export function BookingReviewView({
  review,
  isLoading = false,
  errorMessage,
  onRetry,
  onChange,
  onConfirm,
  onBackToCourts,
  onBackToCourtSlots,
  onSignOut,
  isAdmin = false,
}: BookingReviewViewProps) {
  const navigation = isAdmin
    ? [
        { label: "Courts", href: "/courts" },
        { label: "My bookings", href: "/bookings" },
        { label: "Daily bookings", href: "/reports/daily-bookings" },
      ]
    : [
        { label: "Courts", href: "/courts" },
        { label: "My bookings", href: "/bookings" },
      ];

  const courtName = review?.courtName ?? "Court";
  const isConfirmDisabled = isLoading || Boolean(errorMessage) || !review;

  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/courts"
      onSignOut={onSignOut}
    >
      <div className="max-w-[804px] mx-auto">
        <Breadcrumb
          courtName={courtName}
          onBackToCourts={onBackToCourts}
          onBackToCourtSlots={onBackToCourtSlots ?? onChange}
        />

        <h1 className="mt-4 text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
          Review your booking
        </h1>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 text-muted-foreground text-base"
          >
            Loading booking details...
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-8 p-6 bg-surface rounded-card shadow-card max-w-[500px] space-y-4"
          >
            <div>
              <p className="text-foreground font-semibold text-base m-0">
                Could not load booking details
              </p>
              <p className="text-muted-foreground text-sm mt-1 mb-0">
                {errorMessage}
              </p>
            </div>
            {onRetry && (
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        )}

        {!isLoading && !errorMessage && review && (
          <div className="mt-6">
            <ReviewCard review={review} onChange={onChange} />

            <div className="mt-6 flex justify-end">
              <Button
                className="w-full md:w-auto min-w-[226px] rounded-full"
                variant="primary"
                disabled={isConfirmDisabled}
                onClick={onConfirm}
              >
                Confirm booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </ApplicationShell>
  );
}
