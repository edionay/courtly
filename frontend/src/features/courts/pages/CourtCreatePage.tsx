import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AccessDeniedView } from "../../auth/AccessDeniedView";
import { courtApi } from "../courtApi";
import { parseDollarPriceToCents } from "../courtPricing";
import { CourtCreateView, type CourtCreateFormData } from "../CourtCreateView";
import { ApiClientError } from "../../../shared/http/apiError";

const initialFormValues: CourtCreateFormData = {
  name: "",
  sportType: "",
  hourlyPrice: "",
  opensAt: "08:00",
  closesAt: "22:00",
};

export function CourtCreatePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, clearSession } =
    useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CourtCreateFormData>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAccessDenied = !isAuthLoading && user?.role !== "admin";
  if (isAccessDenied) {
    return <AccessDeniedView onReturn={() => navigate("/courts")} />;
  }

  const handleFieldChange = (field: keyof CourtCreateFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isSubmitting || isCreated) {
      if (isCreated) {
        setIsSuccessDialogOpen(true);
      }
      return;
    }

    setGeneralError(null);
    setFieldErrors({});

    const hourlyPriceCents = parseDollarPriceToCents(formData.hourlyPrice);

    setIsSubmitting(true);
    try {
      await courtApi.createCourt({
        name: formData.name,
        sportType: formData.sportType,
        hourlyPriceCents,
        opensAt: formData.opensAt,
        closesAt: formData.closesAt,
      });
      setIsCreated(true);
      setIsSuccessDialogOpen(true);
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      const hasFieldErrors = isApiClientError && err.fields && err.fields.length > 0;
      if (hasFieldErrors && err.fields) {
        const errors: Record<string, string> = {};
        for (const item of err.fields) {
          const key =
            item.field === "hourlyPriceCents" ? "hourlyPrice" : item.field;
          errors[key] = item.message;
        }
        setFieldErrors(errors);
        return;
      }

      const message =
        err instanceof Error ? err.message : "Could not create court.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/courts");
  };

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false);
  };

  const handleGoToCourts = () => {
    navigate("/courts");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <CourtCreateView
      formData={formData}
      fieldErrors={fieldErrors}
      generalError={generalError}
      isSubmitting={isSubmitting}
      isSuccessDialogOpen={isSuccessDialogOpen}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onCloseSuccessDialog={handleCloseSuccessDialog}
      onGoToCourts={handleGoToCourts}
      onSignOut={handleSignOut}
    />
  );
}
