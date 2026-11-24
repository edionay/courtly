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
    <ul className="shell-nav-list">
      {navigation.map((item) => (
        <li key={item.href}>
          <a
            className="shell-nav-link"
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
    <div className="courtly-shell">
      <div className="shell-layout">
        <aside className="shell-navigation">
          <CourtlyMark />
          <nav aria-label="Main navigation">
            <NavigationLinks navigation={navigation} activeHref={activeHref} />
          </nav>
          {onSignOut && (
            <Button
              className="shell-sign-out"
              variant="secondary"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          )}
        </aside>

        <div>
          <header className="shell-mobile-header">
            <CourtlyMark />
            <button
              className="shell-menu-toggle"
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
            className="shell-mobile-menu"
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
                className="shell-sign-out"
                variant="secondary"
                onClick={onSignOut}
              >
                Sign out
              </Button>
            )}
          </nav>

          <main className="shell-content">{children}</main>
        </div>
      </div>
    </div>
  );
}
