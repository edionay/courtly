import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import type { BookingResponse } from "./bookingApi";

export type MyBookingsViewProps = {
  bookings: BookingResponse[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onCancelBooking?: (booking: BookingResponse) => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
};

function BookingStatusBadge({ status }: { status: "confirmed" | "cancelled" }) {
  const isConfirmed = status === "confirmed";
  const badgeStyle = isConfirmed
    ? "bg-[#E8F3F8] text-primary"
    : "bg-[#EFF2F3] text-muted-foreground";
  const label = isConfirmed ? "Confirmed" : "Cancelled";

  return (
    <span
      className={`inline-flex items-center min-h-[26px] px-3 rounded-full text-xs font-semibold ${badgeStyle}`}
    >
      {label}
    </span>
  );
}

function BookingCard({
  booking,
  onCancelBooking,
}: {
  booking: BookingResponse;
  onCancelBooking?: (booking: BookingResponse) => void;
}) {
  return (
    <article className="p-5 md:p-6 bg-surface rounded-card shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold text-foreground m-0">
            {booking.court.name}
          </h2>
          <BookingStatusBadge status={booking.status} />
        </div>

        <p className="mt-2 text-sm md:text-base font-semibold text-foreground m-0">
          {booking.display.date}
        </p>

        <p className="mt-1 text-sm text-muted-foreground m-0 flex flex-wrap items-center gap-1.5">
          <span className="tabular-nums">
            <span>{booking.display.startsAt}</span>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> until </span>
            <span>{booking.display.endsAt}</span>
          </span>
          <span aria-hidden="true"> · </span>
          <span>{booking.display.timezone}</span>
        </p>
      </div>

      <div className="flex flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
        <span className="text-lg md:text-xl font-bold text-foreground tabular-nums">
          {booking.display.totalPrice}
        </span>

        {booking.canCancel && (
          <Button
            variant="danger"
            className="rounded-full w-full md:w-auto"
            onClick={() => onCancelBooking?.(booking)}
          >
            Cancel booking
          </Button>
        )}
      </div>
    </article>
  );
}

export function MyBookingsView({
  bookings,
  isLoading = false,
  errorMessage,
  onRetry,
  onCancelBooking,
  onSignOut,
  isAdmin = false,
}: MyBookingsViewProps) {
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

  const hasNoBookings = bookings.length === 0;

  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/bookings"
      onSignOut={onSignOut}
    >
      <div className="max-w-[840px] mx-auto">
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
          My bookings
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground m-0">
          View and manage your bookings. Cancellations are permitted up to 2 hours before start.
        </p>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 text-muted-foreground text-base"
          >
            Loading bookings...
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-8 p-6 bg-surface rounded-card shadow-card max-w-[500px] space-y-4"
          >
            <div>
              <p className="text-foreground font-semibold text-base m-0">
                Could not load bookings
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

        {!isLoading && !errorMessage && hasNoBookings && (
          <div className="mt-8 p-6 bg-surface rounded-card shadow-card">
            <p className="text-muted-foreground text-base m-0">
              No bookings yet.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && !hasNoBookings && (
          <ul role="list" className="mt-6 space-y-4 p-0 list-none">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <BookingCard
                  booking={booking}
                  onCancelBooking={onCancelBooking}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ApplicationShell>
  );
}
