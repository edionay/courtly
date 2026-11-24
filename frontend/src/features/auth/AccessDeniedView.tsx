import { Button } from "../../shared/ui/Button";
import { CourtlyMark } from "../../shared/ui/CourtlyMark";

export type AccessDeniedViewProps = {
  onReturn: () => void;
  message?: string;
  actionLabel?: string;
};

export function AccessDeniedView({
  onReturn,
  message = "You do not have access to this page.",
  actionLabel = "Return to courts",
}: AccessDeniedViewProps) {
  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-6 lg:p-10 flex flex-col justify-between">
      <header>
        <CourtlyMark />
      </header>

      <main className="max-w-[500px] w-full mx-auto my-auto p-6 sm:p-8 bg-surface rounded-card shadow-card">
        <div className="w-12 h-12 rounded-full bg-[#E5F0F5] flex items-center justify-center text-primary mb-6">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
          Access denied
        </h1>
        <p className="text-sm sm:text-[15px] text-muted-foreground mt-2 mb-8 leading-normal">
          {message}
        </p>

        <Button onClick={onReturn} className="w-full rounded-full">
          {actionLabel}
        </Button>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-2">
        Courtly Booking System
      </footer>
    </div>
  );
}
