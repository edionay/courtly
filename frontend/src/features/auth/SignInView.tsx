import { useState, type FormEvent } from "react";
import { Button } from "../../shared/ui/Button";
import { CourtlyMark } from "../../shared/ui/CourtlyMark";
import type { LoginCredentials } from "./types";

export type SignInViewProps = {
  onSubmit: (credentials: LoginCredentials) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  fieldErrors?: Record<string, string>;
  defaultEmail?: string;
};

export function SignInView({
  onSubmit,
  isSubmitting = false,
  errorMessage,
  fieldErrors = {},
  defaultEmail = "",
}: SignInViewProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ email: email.trim(), password });
  };

  const emailErrorMessage = fieldErrors.email;
  const passwordErrorMessage = fieldErrors.password;
  const hasGlobalError = Boolean(errorMessage);
  const submitButtonLabel = isSubmitting ? "Signing in..." : "Sign in";

  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-6 lg:p-10 flex flex-col justify-between">
      <header>
        <CourtlyMark />
      </header>

      <main className="max-w-[1240px] w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 lg:gap-16 items-center py-6">
        <section className="hidden lg:flex flex-col justify-center min-h-[520px] p-10 lg:p-14 bg-[#E5F0F5] rounded-[22px]">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Welcome to Courtly
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-3">
            Manage your bookings in one place.
          </p>
        </section>

        <section className="w-full max-w-[460px] mx-auto p-6 sm:p-8 bg-surface rounded-card shadow-card">
          <h2 className="text-2xl sm:text-[28px] font-bold text-foreground tracking-tight">
            Sign in
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 mb-6">
            Enter your account details to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate={false} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-3.5 bg-white border border-input-border rounded-xl text-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-55"
              />
              {emailErrorMessage && (
                <p className="mt-1 text-sm text-danger">{emailErrorMessage}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full min-h-[48px] px-3.5 bg-white border border-input-border rounded-xl text-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-55"
              />
              {passwordErrorMessage && (
                <p className="mt-1 text-sm text-danger">{passwordErrorMessage}</p>
              )}
            </div>

            {hasGlobalError && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-danger/20 rounded-xl text-danger text-sm font-medium"
              >
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 rounded-full"
            >
              {submitButtonLabel}
            </Button>
          </form>
        </section>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-2">
        Courtly Booking System
      </footer>
    </div>
  );
}
