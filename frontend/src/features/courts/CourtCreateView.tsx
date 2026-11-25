import type { FormEvent } from "react";
import { ApplicationShell } from "../../shared/ui/ApplicationShell";
import { Button } from "../../shared/ui/Button";
import { CourtCreatedDialog } from "./CourtCreatedDialog";

export type CourtCreateFormData = {
  name: string;
  sportType: string;
  hourlyPrice: string;
  opensAt: string;
  closesAt: string;
};

export type CourtCreateViewProps = {
  formData: CourtCreateFormData;
  fieldErrors?: Record<string, string>;
  generalError?: string | null;
  isSubmitting?: boolean;
  isSuccessDialogOpen?: boolean;
  onFieldChange: (field: keyof CourtCreateFormData, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  onCloseSuccessDialog: () => void;
  onGoToCourts: () => void;
  onSignOut?: () => void;
};

const navigation = [
  { label: "Courts", href: "/courts" },
  { label: "My bookings", href: "/bookings" },
  { label: "Daily bookings", href: "/reports/daily-bookings" },
];

export function CourtCreateView({
  formData,
  fieldErrors = {},
  generalError,
  isSubmitting = false,
  isSuccessDialogOpen = false,
  onFieldChange,
  onSubmit,
  onCancel,
  onCloseSuccessDialog,
  onGoToCourts,
  onSignOut,
}: CourtCreateViewProps) {
  const submitButtonLabel = isSubmitting ? "Creating court..." : "Create court";

  return (
    <ApplicationShell
      navigation={navigation}
      activeHref="/courts"
      onSignOut={onSignOut}
    >
      <div>
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 list-none p-0 m-0 text-sm">
            <li>
              <a
                href="/courts"
                onClick={(event) => {
                  event.preventDefault();
                  onCancel();
                }}
                className="text-primary font-semibold hover:underline"
              >
                Courts
              </a>
            </li>
            <li className="text-muted-foreground" aria-hidden="true">
              /
            </li>
            <li aria-current="page" className="text-muted-foreground">
              Create court
            </li>
          </ol>
        </nav>

        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-foreground m-0 leading-tight">
          Create court
        </h1>
        <p className="mt-2 text-base text-muted-foreground leading-normal">
          Add a court for bookings.
        </p>

        {generalError && (
          <div
            role="alert"
            className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger max-w-[800px]"
          >
            {generalError}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-8 max-w-[800px]">
          <div className="p-6 md:p-8 bg-surface rounded-card shadow-card space-y-6">
            <div>
              <label
                htmlFor="court-name"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Court name
              </label>
              <input
                id="court-name"
                name="name"
                type="text"
                disabled={isSubmitting}
                value={formData.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "court-name-error" : undefined}
                className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              {fieldErrors.name && (
                <p
                  id="court-name-error"
                  role="alert"
                  className="text-sm text-danger mt-1.5"
                >
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="court-sport"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Sport
              </label>
              <input
                id="court-sport"
                name="sportType"
                type="text"
                disabled={isSubmitting}
                value={formData.sportType}
                onChange={(event) => onFieldChange("sportType", event.target.value)}
                aria-invalid={Boolean(fieldErrors.sportType)}
                aria-describedby={
                  fieldErrors.sportType ? "court-sport-error" : undefined
                }
                className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              {fieldErrors.sportType && (
                <p
                  id="court-sport-error"
                  role="alert"
                  className="text-sm text-danger mt-1.5"
                >
                  {fieldErrors.sportType}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="court-price"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Hourly price ($)
              </label>
              <input
                id="court-price"
                name="hourlyPrice"
                type="text"
                inputMode="decimal"
                placeholder="50.00"
                disabled={isSubmitting}
                value={formData.hourlyPrice}
                onChange={(event) => onFieldChange("hourlyPrice", event.target.value)}
                aria-invalid={Boolean(fieldErrors.hourlyPrice)}
                aria-describedby={
                  fieldErrors.hourlyPrice ? "court-price-error" : undefined
                }
                className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              {fieldErrors.hourlyPrice && (
                <p
                  id="court-price-error"
                  role="alert"
                  className="text-sm text-danger mt-1.5"
                >
                  {fieldErrors.hourlyPrice}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="court-opens-at"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Opens at
                </label>
                <input
                  id="court-opens-at"
                  name="opensAt"
                  type="time"
                  step="3600"
                  disabled={isSubmitting}
                  value={formData.opensAt}
                  onChange={(event) => onFieldChange("opensAt", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.opensAt)}
                  aria-describedby={
                    fieldErrors.opensAt ? "court-opens-at-error" : undefined
                  }
                  className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                />
                {fieldErrors.opensAt && (
                  <p
                    id="court-opens-at-error"
                    role="alert"
                    className="text-sm text-danger mt-1.5"
                  >
                    {fieldErrors.opensAt}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="court-closes-at"
                  className="block text-sm font-semibold text-foreground mb-1.5"
                >
                  Closes at
                </label>
                <input
                  id="court-closes-at"
                  name="closesAt"
                  type="time"
                  step="3600"
                  disabled={isSubmitting}
                  value={formData.closesAt}
                  onChange={(event) => onFieldChange("closesAt", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.closesAt)}
                  aria-describedby={
                    fieldErrors.closesAt ? "court-closes-at-error" : undefined
                  }
                  className="w-full h-12 px-3.5 bg-white border border-input-border rounded-xl text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                />
                {fieldErrors.closesAt && (
                  <p
                    id="court-closes-at-error"
                    role="alert"
                    className="text-sm text-danger mt-1.5"
                  >
                    {fieldErrors.closesAt}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-muted-foreground m-0">
              Choose times on the hour.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-full px-6 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="rounded-full px-6 h-12"
            >
              {submitButtonLabel}
            </Button>
          </div>
        </form>

        <CourtCreatedDialog
          isOpen={isSuccessDialogOpen}
          onClose={onCloseSuccessDialog}
          onGoToCourts={onGoToCourts}
        />
      </div>
    </ApplicationShell>
  );
}
