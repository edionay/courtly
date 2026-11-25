import { type MouseEvent } from "react";
import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import type {
  AvailabilityDay,
  AvailabilitySlot,
} from "./bookingApi";

export type BookingCourtSummary = {
  id: string;
  name: string;
  sportType: string;
  opensAt: string;
  closesAt: string;
  hourlyPrice: string;
};

export type BookingSlotsViewProps = {
  court?: BookingCourtSummary;
  weekStartLabel: string;
  weekEndLabel: string;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
  days: AvailabilityDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedStartsAtList: string[];
  onToggleSlot: (startsAt: string) => void;
  previewDateLabel?: string | null;
  previewPrice?: string | null;
  isPreviewLoading?: boolean;
  previewError?: string | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onContinue?: () => void;
  onBackToCourts?: () => void;
  onSignOut?: () => void;
  isAdmin?: boolean;
};

const ONE_HOUR_IN_MS = 3600000;

function isSlotSelectable(
  slot: AvailabilitySlot,
  selectedStartsAtList: string[],
): boolean {
  const isBooked = slot.status === "booked";
  if (isBooked) {
    return false;
  }

  const hasNoSelection = selectedStartsAtList.length === 0;
  if (hasNoSelection) {
    return true;
  }

  const isAlreadySelected = selectedStartsAtList.includes(slot.startsAt);
  if (isAlreadySelected) {
    return true;
  }

  const hasTwoSelected = selectedStartsAtList.length >= 2;
  if (hasTwoSelected) {
    return false;
  }

  const singleSelectedTimestamp = new Date(selectedStartsAtList[0]).getTime();
  const candidateTimestamp = new Date(slot.startsAt).getTime();
  const timeDifference = Math.abs(candidateTimestamp - singleSelectedTimestamp);
  const isAdjacent = timeDifference === ONE_HOUR_IN_MS;

  return isAdjacent;
}

function resolveSelectedInterval(
  selectedStartsAtList: string[],
  visibleSlots: AvailabilitySlot[],
): { startsAt: string; endsAt: string } | null {
  const hasNoSelection = selectedStartsAtList.length === 0;
  if (hasNoSelection) {
    return null;
  }

  const sortedStarts = [...selectedStartsAtList].sort();
  const firstStartsAt = sortedStarts[0];
  const lastStartsAt = sortedStarts[sortedStarts.length - 1];

  const firstSlot = visibleSlots.find((slot) => slot.startsAt === firstStartsAt);
  const lastSlot = visibleSlots.find((slot) => slot.startsAt === lastStartsAt);

  if (!firstSlot || !lastSlot) {
    return null;
  }

  return {
    startsAt: firstSlot.display.startsAt,
    endsAt: lastSlot.display.endsAt,
  };
}

function resolveDurationLabel(selectedCount: number): string {
  if (selectedCount === 1) {
    return "1 hour";
  }
  if (selectedCount === 2) {
    return "2 hours";
  }
  return "0 hours";
}

function Breadcrumb({
  courtName,
  onBackToCourts,
}: {
  courtName: string;
  onBackToCourts?: () => void;
}) {
  const handleCourtsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onBackToCourts) {
      event.preventDefault();
      onBackToCourts();
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
        <li aria-current="page" className="text-muted-foreground font-semibold">
          {courtName}
        </li>
      </ol>
    </nav>
  );
}

function CourtSummaryCard({ court }: { court: BookingCourtSummary }) {
  return (
    <section
      aria-label="Court details"
      className="p-5 bg-surface rounded-card shadow-card flex flex-wrap items-center justify-between gap-4"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground m-0">{court.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground m-0 flex items-center gap-2">
          <span className="capitalize">{court.sportType}</span>
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">
            <span>{court.opensAt}</span>
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> until </span>
            <span>{court.closesAt}</span>
          </span>
        </p>
      </div>
      <div className="text-right">
        <span className="block text-lg font-bold text-foreground tabular-nums">
          {court.hourlyPrice}
        </span>
        <span className="block text-xs text-muted-foreground">per hour</span>
      </div>
    </section>
  );
}

function WeekNavigation({
  weekStartLabel,
  weekEndLabel,
  hasPreviousWeek,
  hasNextWeek,
  onPreviousWeek,
  onNextWeek,
}: {
  weekStartLabel: string;
  weekEndLabel: string;
  hasPreviousWeek: boolean;
  hasNextWeek: boolean;
  onPreviousWeek?: () => void;
  onNextWeek?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-foreground m-0">Select a date</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground m-0">
          <span>{weekStartLabel}</span>
          <span aria-hidden="true"> – </span>
          <span className="sr-only"> until </span>
          <span>{weekEndLabel}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPreviousWeek}
          onClick={onPreviousWeek}
          aria-label="Previous week"
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
            hasPreviousWeek
              ? "bg-surface border-border text-primary hover:bg-gray-50 cursor-pointer"
              : "bg-[#EDF2F4] border-border text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          disabled={!hasNextWeek}
          onClick={onNextWeek}
          aria-label="Next week"
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
            hasNextWeek
              ? "bg-surface border-border text-primary hover:bg-gray-50 cursor-pointer"
              : "bg-[#EDF2F4] border-border text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DaySelector({
  days,
  selectedDate,
  onSelectDate,
}: {
  days: AvailabilityDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  return (
    <fieldset className="mt-4 border-0 p-0 m-0">
      <legend className="sr-only">Choose a day of the week</legend>
      <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isPast = !day.isSelectable;

          let cardStyle =
            "bg-surface border-border text-foreground hover:border-primary/50 cursor-pointer";
          if (isPast) {
            cardStyle =
              "bg-surface border-[#E3E9EC] text-[#879BA5] opacity-50 cursor-not-allowed";
          } else if (isSelected) {
            cardStyle = "bg-[#E8F3F8] border-primary text-foreground ring-1 ring-primary";
          }

          return (
            <label
              key={day.date}
              className={`relative flex flex-col items-center justify-center min-h-[64px] md:min-h-[74px] rounded-xl border text-center transition-all ${cardStyle}`}
            >
              <input
                type="radio"
                name="selectedDate"
                value={day.date}
                checked={isSelected}
                disabled={isPast}
                onChange={() => onSelectDate(day.date)}
                className="sr-only"
              />
              <span className="text-xs md:text-sm font-medium">
                {day.display.weekday}
              </span>
              <span className="mt-1 text-base md:text-lg font-bold">
                {day.display.dayOfMonth}
              </span>
              {isSelected && (
                <svg
                  className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SlotItem({
  slot,
  isSelected,
  isSelectable,
  onToggleSlot,
}: {
  slot: AvailabilitySlot;
  isSelected: boolean;
  isSelectable: boolean;
  onToggleSlot: (startsAt: string) => void;
}) {
  const isBooked = slot.status === "booked";
  const isDisabled = !isSelectable;

  let containerStyle =
    "bg-[#F1F5F7] border-[#E1E9ED] text-[#788F9B] hover:border-primary/40 cursor-pointer";
  if (isBooked) {
    containerStyle =
      "bg-[#F1F5F7] border-[#E1E9ED] text-[#788F9B] cursor-not-allowed opacity-80";
  } else if (isSelected) {
    containerStyle =
      "bg-[#E8F3F8] border-primary text-foreground ring-1 ring-primary cursor-pointer";
  } else if (isDisabled) {
    containerStyle =
      "bg-[#F1F5F7] border-[#E1E9ED] text-[#788F9B] cursor-not-allowed opacity-50";
  }

  let checkboxBoxStyle = "bg-surface border-border text-transparent";
  if (isBooked) {
    checkboxBoxStyle = "bg-gray-200 border-gray-300 text-transparent cursor-not-allowed";
  } else if (isSelected) {
    checkboxBoxStyle = "bg-primary border-primary text-white";
  } else if (isDisabled) {
    checkboxBoxStyle = "bg-gray-100 border-gray-300 text-transparent cursor-not-allowed";
  }

  return (
    <label
      className={`flex items-center justify-between min-h-[52px] px-3.5 rounded-xl border transition-all select-none ${containerStyle}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={isDisabled}
          onChange={() => onToggleSlot(slot.startsAt)}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`w-[18px] h-[18px] rounded flex items-center justify-center border transition-colors ${checkboxBoxStyle}`}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
        <span className="text-sm md:text-[15px] font-semibold tabular-nums">
          <span>{slot.display.startsAt}</span>
          <span aria-hidden="true"> – </span>
          <span className="sr-only"> until </span>
          <span>{slot.display.endsAt}</span>
        </span>
      </div>

      {isBooked && (
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Booked
        </span>
      )}
    </label>
  );
}

function TimeSlotsSection({
  slots,
  selectedStartsAtList,
  onToggleSlot,
}: {
  slots: AvailabilitySlot[];
  selectedStartsAtList: string[];
  onToggleSlot: (startsAt: string) => void;
}) {
  const visibleSlots = slots.filter((slot) => slot.status !== "past");
  const hasNoVisibleSlots = visibleSlots.length === 0;

  return (
    <section aria-label="Available hours" className="mt-8">
      <div>
        <h3 className="text-lg font-bold text-foreground m-0">Select a time</h3>
        <p className="mt-1 text-sm text-muted-foreground m-0">
          Select up to 2 consecutive hours.
        </p>
      </div>

      {hasNoVisibleSlots && (
        <div className="mt-4 p-6 bg-surface rounded-card shadow-card">
          <p className="text-muted-foreground text-sm m-0">
            No slots available for this day. Choose another day or week.
          </p>
        </div>
      )}

      {!hasNoVisibleSlots && (
        <fieldset className="mt-4 border-0 p-0 m-0">
          <legend className="sr-only">Select court hours</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleSlots.map((slot) => {
              const isSelected = selectedStartsAtList.includes(slot.startsAt);
              const isSelectable = isSlotSelectable(slot, selectedStartsAtList);

              return (
                <SlotItem
                  key={slot.startsAt}
                  slot={slot}
                  isSelected={isSelected}
                  isSelectable={isSelectable}
                  onToggleSlot={onToggleSlot}
                />
              );
            })}
          </div>
        </fieldset>
      )}
    </section>
  );
}

function SelectionSummaryCard({
  selectedInterval,
  dateLabel,
  durationLabel,
  previewPrice,
  isPreviewLoading,
  previewError,
  hasSelection,
  onContinue,
}: {
  selectedInterval: { startsAt: string; endsAt: string } | null;
  dateLabel: string;
  durationLabel: string;
  previewPrice?: string | null;
  isPreviewLoading?: boolean;
  previewError?: string | null;
  hasSelection: boolean;
  onContinue?: () => void;
}) {
  const isContinueDisabled =
    !hasSelection || isPreviewLoading || Boolean(previewError) || !onContinue;

  let priceContent = <span className="text-xl font-bold tabular-nums">$0.00</span>;
  if (isPreviewLoading) {
    priceContent = (
      <span
        aria-label="Calculating price"
        className="inline-block w-16 h-6 bg-gray-200 animate-pulse rounded"
      />
    );
  } else if (previewError) {
    priceContent = (
      <span className="text-xs text-red-600 font-normal">{previewError}</span>
    );
  } else if (previewPrice) {
    priceContent = (
      <span className="text-xl font-bold tabular-nums text-foreground">
        {previewPrice}
      </span>
    );
  }

  return (
    <section
      aria-label="Selection summary"
      className="p-5 bg-surface rounded-card shadow-card h-fit space-y-4"
    >
      <div>
        <h3 className="text-lg font-bold text-foreground m-0">Selected time</h3>
        <p className="mt-2 text-sm text-muted-foreground m-0">{dateLabel}</p>
        <p className="mt-1 text-lg font-bold text-foreground m-0 tabular-nums">
          {selectedInterval ? (
            <span>
              <span>{selectedInterval.startsAt}</span>
              <span aria-hidden="true"> – </span>
              <span className="sr-only"> until </span>
              <span>{selectedInterval.endsAt}</span>
            </span>
          ) : (
            "–"
          )}
        </p>
        <p className="mt-1 text-sm text-muted-foreground m-0">{durationLabel}</p>
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between">
        <span className="text-base font-semibold text-muted-foreground">Total</span>
        {priceContent}
      </div>

      <Button
        className="w-full rounded-full"
        variant="primary"
        disabled={isContinueDisabled}
        onClick={onContinue}
      >
        Continue to review
      </Button>
    </section>
  );
}

export function BookingSlotsView({
  court,
  weekStartLabel,
  weekEndLabel,
  hasPreviousWeek,
  hasNextWeek,
  onPreviousWeek,
  onNextWeek,
  days,
  selectedDate,
  onSelectDate,
  selectedStartsAtList,
  onToggleSlot,
  previewDateLabel,
  previewPrice,
  isPreviewLoading = false,
  previewError,
  isLoading = false,
  errorMessage,
  onRetry,
  onContinue,
  onBackToCourts,
  onSignOut,
  isAdmin = false,
}: BookingSlotsViewProps) {
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

  const currentDay = days.find((day) => day.date === selectedDate);
  const currentSlots = currentDay ? currentDay.slots : [];
  const selectedInterval = resolveSelectedInterval(
    selectedStartsAtList,
    currentSlots,
  );
  const durationLabel = resolveDurationLabel(selectedStartsAtList.length);
  const hasSelection = selectedStartsAtList.length > 0;
  const courtName = court ? court.name : "Court";
  const dateLabel = hasSelection
    ? previewDateLabel || selectedDate
    : "No time selected";

  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/courts"
      onSignOut={onSignOut}
    >
      <div className="max-w-[1100px] mx-auto">
        <Breadcrumb courtName={courtName} onBackToCourts={onBackToCourts} />

        <h1 className="mt-4 text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
          Choose your time
        </h1>

        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 text-muted-foreground text-base"
          >
            Loading availability...
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-8 p-6 bg-surface rounded-card shadow-card max-w-[500px] space-y-4"
          >
            <div>
              <p className="text-foreground font-semibold text-base m-0">
                Could not load availability
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

        {!isLoading && !errorMessage && (
          <div className="mt-6 space-y-6">
            {court && <CourtSummaryCard court={court} />}

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
              <div className="space-y-6">
                <WeekNavigation
                  weekStartLabel={weekStartLabel}
                  weekEndLabel={weekEndLabel}
                  hasPreviousWeek={hasPreviousWeek}
                  hasNextWeek={hasNextWeek}
                  onPreviousWeek={onPreviousWeek}
                  onNextWeek={onNextWeek}
                />

                <DaySelector
                  days={days}
                  selectedDate={selectedDate}
                  onSelectDate={onSelectDate}
                />

                <TimeSlotsSection
                  slots={currentSlots}
                  selectedStartsAtList={selectedStartsAtList}
                  onToggleSlot={onToggleSlot}
                />
              </div>

              <SelectionSummaryCard
                selectedInterval={selectedInterval}
                dateLabel={dateLabel}
                durationLabel={durationLabel}
                previewPrice={previewPrice}
                isPreviewLoading={isPreviewLoading}
                previewError={previewError}
                hasSelection={hasSelection}
                onContinue={onContinue}
              />
            </div>
          </div>
        )}
      </div>
    </ApplicationShell>
  );
}
