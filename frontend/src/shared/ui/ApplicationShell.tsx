import { useState, type ReactNode } from "react";
import { Button } from "./Button";
import { CourtlyMark } from "./CourtlyMark";

export type ShellNavigationItem = {
  label: string;
  href: string;
};

type ApplicationShellProps = {
  navigation: ShellNavigationItem[];
  activeHref: string;
  children: ReactNode;
  onSignOut?: () => void;
};

function NavigationLinks({
  navigation,
  activeHref,
  onNavigate,
}: Pick<ApplicationShellProps, "navigation" | "activeHref"> & {
  onNavigate?: () => void;
}) {
  return (
    <ul className="grid gap-2 mt-8 p-0 list-none">
      {navigation.map((item) => (
        <li key={item.href}>
          <a
            className="flex items-center min-h-[48px] px-3.5 text-muted-foreground rounded-xl text-[15px] font-semibold no-underline transition-colors aria-[current=page]:text-primary aria-[current=page]:bg-primary/10 hover:text-primary"
            href={item.href}
            aria-current={item.href === activeHref ? "page" : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ApplicationShell({
  navigation,
  activeHref,
  children,
  onSignOut,
}: ApplicationShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen p-3 md:p-4 lg:p-5 bg-canvas">
      <div className="max-w-[1400px] mx-auto lg:grid lg:grid-cols-[216px_minmax(0,1fr)] lg:gap-9">
        <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-5 lg:self-start lg:min-h-[calc(100vh-40px)] p-[22px_14px] bg-surface rounded-[20px] shadow-card">
          <CourtlyMark />
          <nav aria-label="Main navigation">
            <NavigationLinks navigation={navigation} activeHref={activeHref} />
          </nav>
          {onSignOut && (
            <Button
              className="mt-auto w-full"
              variant="secondary"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          )}
        </aside>

        <div>
          <header className="flex lg:hidden items-center justify-between min-h-[64px] px-4 py-2 bg-surface rounded-2xl shadow-card">
            <CourtlyMark />
            <button
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-primary bg-white border border-input-border rounded-xl cursor-pointer"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
                )}
              </svg>
            </button>
          </header>

          <nav
            id="mobile-navigation"
            className="mt-2 p-3 bg-white rounded-2xl shadow-card space-y-3"
            aria-label="Main navigation"
            hidden={!isMenuOpen}
          >
            <NavigationLinks
              navigation={navigation}
              activeHref={activeHref}
              onNavigate={() => setIsMenuOpen(false)}
            />
            {onSignOut && (
              <Button
                className="w-full mt-2"
                variant="secondary"
                onClick={onSignOut}
              >
                Sign out
              </Button>
            )}
          </nav>

          <main className="min-w-0 pt-6 md:pt-7 lg:py-7 lg:px-2">{children}</main>
        </div>
      </div>
    </div>
  );
}
