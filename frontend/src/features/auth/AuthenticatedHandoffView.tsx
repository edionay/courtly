import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import type { AuthUser } from "./types";

export type AuthenticatedHandoffViewProps = {
  user: AuthUser;
  onSignOut: () => void;
};

export function AuthenticatedHandoffView({
  user,
  onSignOut,
}: AuthenticatedHandoffViewProps) {
  const isAdmin = user.role === "admin";
  const roleBadgeLabel = isAdmin ? "Administrator" : "Player";

  return (
    <ApplicationShell
      navigation={[{ label: "Overview", href: "/" }]}
      activeHref="/"
      onSignOut={onSignOut}
    >
      <div className="max-w-[700px] space-y-6">
        <div>
          <span className="inline-flex items-center min-h-[28px] px-3.5 text-primary bg-[#e5f0f5] rounded-full text-sm font-semibold">
            {roleBadgeLabel}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-3">
            Welcome, {user.name}
          </h1>
          <p className="mt-2 text-base text-muted-foreground leading-normal">
            You are signed in to Courtly.
          </p>
        </div>

        <div className="p-6 bg-surface rounded-card shadow-card space-y-4">
          <h2 className="text-lg font-bold text-foreground">Session details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">User ID</dt>
              <dd className="font-semibold text-foreground mt-0.5">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="font-semibold text-foreground mt-0.5">{user.role}</dd>
            </div>
          </dl>

          <p className="text-sm text-muted-foreground border-t border-input-border pt-4">
            Full court browsing and live availability are introduced in D4.3.
          </p>
        </div>

        <div className="pt-2">
          <Button variant="secondary" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </ApplicationShell>
  );
}
