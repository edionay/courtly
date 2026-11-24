import { Button } from "../../shared/ui/Button";
import { CourtlyMark } from "../../shared/ui/CourtlyMark";

export type AuthenticationErrorViewProps = {
  onGoToLogin: () => void;
  message?: string;
};

export function AuthenticationErrorView({
  onGoToLogin,
  message = "Please sign in to continue.",
}: AuthenticationErrorViewProps) {
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
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-[26px] font-bold text-foreground tracking-tight">
          Authentication required
        </h1>
        <p className="text-sm sm:text-[15px] text-muted-foreground mt-2 mb-8 leading-normal">
          {message}
        </p>

        <Button onClick={onGoToLogin} className="w-full rounded-full">
          Go to login
        </Button>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-2">
        Courtly Booking System
      </footer>
    </div>
  );
}
