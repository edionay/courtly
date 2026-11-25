import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import type { CourtCardData } from "./CourtCard";
import { CourtGrid } from "./CourtGrid";

export type CourtsViewProps = {
  courts: CourtCardData[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  isAdmin?: boolean;
  onSignOut?: () => void;
  onViewAvailability?: (court: CourtCardData) => void;
  onCreateCourt?: () => void;
  onEditCourt?: (court: CourtCardData) => void;
};

function CourtsContent({
  courts,
  isLoading,
  errorMessage,
  onRetry,
  isAdmin,
  onViewAvailability,
  onEditCourt,
}: Omit<CourtsViewProps, "onSignOut" | "onCreateCourt">) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-8 text-muted-foreground text-base"
      >
        Loading courts...
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
          <p className="text-foreground font-semibold text-base">
            Could not load courts
          </p>
          <p className="text-muted-foreground text-sm mt-1">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  const hasNoCourts = courts.length === 0;
  if (hasNoCourts) {
    return (
      <div className="mt-8 p-6 bg-surface rounded-card shadow-card max-w-[500px]">
        <p className="text-muted-foreground text-base m-0">No courts available.</p>
      </div>
    );
  }

  return (
    <CourtGrid
      courts={courts}
      isAdmin={isAdmin}
      onViewAvailability={onViewAvailability}
      onEditCourt={onEditCourt}
    />
  );
}

export function CourtsView({
  courts,
  isLoading = false,
  errorMessage,
  onRetry,
  isAdmin = false,
  onSignOut,
  onViewAvailability,
  onCreateCourt,
  onEditCourt,
}: CourtsViewProps) {
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

  const subtitle = isAdmin
    ? "Manage courts and availability."
    : "Choose a court to see its availability.";

  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/courts"
      onSignOut={onSignOut}
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
              Courts
            </h1>
            <p className="mt-2 text-base text-muted-foreground leading-normal">
              {subtitle}
            </p>
          </div>
          {isAdmin && onCreateCourt && (
            <Button
              variant="primary"
              onClick={onCreateCourt}
              className="rounded-full px-6 h-12 w-full sm:w-auto"
            >
              Create court
            </Button>
          )}
        </div>

        <CourtsContent
          courts={courts}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
          isAdmin={isAdmin}
          onViewAvailability={onViewAvailability}
          onEditCourt={onEditCourt}
        />
      </div>
    </ApplicationShell>
  );
}
