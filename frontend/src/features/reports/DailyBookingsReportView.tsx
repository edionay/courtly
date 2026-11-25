import type { FormEvent } from "react";
import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import type { DailyBookingReportItem, DailyBookingReportResponse } from "./reportApi";

export type DailyBookingsReportViewProps = {
  dateInput: string;
  onDateInputChange: (value: string) => void;
  onSubmitDate: (event: FormEvent) => void;
  report?: DailyBookingReportResponse | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onSignOut?: () => void;
};

const navigation = [
  { label: "Courts", href: "/courts" },
  { label: "My bookings", href: "/bookings" },
  { label: "Daily bookings", href: "/reports/daily-bookings" },
];

function BookingStatusBadge({ status }: { status: "confirmed" | "cancelled" }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center min-h-[26px] px-3 rounded-full text-xs font-semibold text-primary bg-[#e5f0f5]">
        Confirmed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center min-h-[26px] px-3 rounded-full text-xs font-semibold text-muted-foreground bg-gray-100">
      Cancelled
    </span>
  );
}

function BookingTimeRange({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt: string;
}) {
  return (
    <span className="tabular-nums whitespace-nowrap">
      <span>{startsAt}</span>
      <span aria-hidden="true"> – </span>
      <span className="sr-only"> until </span>
      <span>{endsAt}</span>
    </span>
  );
}

function ReportTable({ bookings }: { bookings: DailyBookingReportItem[] }) {
  return (
    <div className="hidden md:block mt-6 bg-surface rounded-card shadow-card overflow-hidden max-w-[1104px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-input-border/50 text-[13px] font-semibold text-muted-foreground">
            <th className="py-4 px-6">User</th>
            <th className="py-4 px-6">Court</th>
            <th className="py-4 px-6">Status</th>
            <th className="py-4 px-6">Time</th>
            <th className="py-4 px-6 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-input-border/30 text-[15px]">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-canvas/50 transition-colors">
              <td className="py-4 px-6 font-medium text-foreground">
                {booking.user.name}
              </td>
              <td className="py-4 px-6 text-foreground">{booking.court.name}</td>
              <td className="py-4 px-6">
                <BookingStatusBadge status={booking.status} />
              </td>
              <td className="py-4 px-6 text-foreground">
                <BookingTimeRange
                  startsAt={booking.display.startsAt}
                  endsAt={booking.display.endsAt}
                />
              </td>
              <td className="py-4 px-6 text-right font-semibold text-foreground tabular-nums">
                {booking.display.totalPrice}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportMobileCards({ bookings }: { bookings: DailyBookingReportItem[] }) {
  return (
    <div className="md:hidden mt-6 space-y-3">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="p-5 bg-surface rounded-card shadow-card space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground text-base m-0">
                {booking.user.name}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5 m-0">
                {booking.court.name}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-input-border/30">
            <span className="text-muted-foreground">
              <BookingTimeRange
                startsAt={booking.display.startsAt}
                endsAt={booking.display.endsAt}
              />
            </span>
            <span className="font-bold text-foreground text-base tabular-nums">
              {booking.display.totalPrice}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportBody({
  report,
  isLoading,
  errorMessage,
  onRetry,
}: {
  report?: DailyBookingReportResponse | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-8 text-muted-foreground text-base"
      >
        Loading daily bookings...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        role="alert"
        className="mt-8 p-6 bg-surface rounded-card shadow-card max-w-[500px] space-y-4"
      >
        <div>
          <p className="text-foreground font-semibold text-base m-0">
            Could not load report
          </p>
          <p className="text-muted-foreground text-sm mt-1 m-0">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const hasNoBookings = report.bookings.length === 0;

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold text-foreground mt-8 mb-4">
        {report.display.date}
      </h2>

      <div className="p-6 bg-surface rounded-card shadow-card max-w-[1104px]">
        <p className="text-sm text-muted-foreground m-0">Expected revenue</p>
        <p className="text-2xl md:text-[28px] font-bold text-foreground mt-1 mb-0 tabular-nums">
          {report.display.expectedRevenue}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 m-0">
          Cancelled bookings contribute nothing to expected revenue.
        </p>
      </div>

      {hasNoBookings ? (
        <div className="mt-6 p-6 md:p-8 bg-surface rounded-card shadow-card max-w-[1104px]">
          <h3 className="text-lg font-bold text-foreground m-0">
            No bookings for this date.
          </h3>
          <p className="text-sm text-muted-foreground mt-1 m-0">
            Choose another date to view bookings.
          </p>
        </div>
      ) : (
        <>
          <ReportTable bookings={report.bookings} />
          <ReportMobileCards bookings={report.bookings} />
        </>
      )}
    </>
  );
}

export function DailyBookingsReportView({
  dateInput,
  onDateInputChange,
  onSubmitDate,
  report,
  isLoading = false,
  errorMessage,
  onRetry,
  onSignOut,
}: DailyBookingsReportViewProps) {
  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/reports/daily-bookings"
      onSignOut={onSignOut}
    >
      <div>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
          Daily bookings
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-normal">
          View bookings and expected revenue by day.
        </p>

        <div className="p-6 bg-surface rounded-card shadow-card mt-8 max-w-[1104px]">
          <form
            onSubmit={onSubmitDate}
            className="flex flex-col sm:flex-row sm:items-end gap-4"
          >
            <div className="w-full sm:w-[260px]">
              <label
                htmlFor="report-date"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Date
              </label>
              <input
                id="report-date"
                name="date"
                type="date"
                disabled={isLoading}
                value={dateInput}
                onChange={(event) => onDateInputChange(event.target.value)}
                className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !dateInput}
              className="rounded-full px-6 h-12"
            >
              View bookings
            </Button>
          </form>
        </div>

        <ReportBody
          report={report}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
        />
      </div>
    </ApplicationShell>
  );
}
