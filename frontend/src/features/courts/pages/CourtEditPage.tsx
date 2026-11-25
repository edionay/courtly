import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AccessDeniedView } from "../../auth/AccessDeniedView";
import { courtApi, type UpdateCourtRequest } from "../courtApi";
import type { CourtCardData } from "../CourtCard";
import { parseDollarPriceToCents } from "../courtPricing";
import { CourtEditView, type CourtEditFormData } from "../CourtEditView";
import { ApiClientError } from "../../../shared/http/apiError";

const defaultFormData: CourtEditFormData = {
  name: "",
  sportType: "",
  hourlyPrice: "",
  opensAt: "08:00",
  closesAt: "22:00",
  isActive: true,
};

export function CourtEditPage() {
  const { courtId } = useParams();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, clearSession } =
    useAuth();
  const navigate = useNavigate();

  const [initialCourt, setInitialCourt] = useState<CourtCardData | null>(null);
  const [formData, setFormData] = useState<CourtEditFormData>(defaultFormData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCourt = async () => {
      if (!courtId) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const items = await courtApi.listCourts();
        if (!isMounted) {
          return;
        }

        const found = items.find((c) => c.id === courtId);
        if (!found) {
          setIsNotFound(true);
          return;
        }

        const initialCents = found.hourlyPriceCents ?? 0;
        setInitialCourt(found);
        setFormData({
          name: found.name,
          sportType: found.sportType,
          hourlyPrice: (initialCents / 100).toFixed(2),
          opensAt: found.opensAt,
          closesAt: found.closesAt,
          isActive: found.isActive !== false,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const isApiClientError = err instanceof ApiClientError;
        const isUnauthorized = isApiClientError && err.isUnauthorized;

        if (isUnauthorized) {
          clearSession();
          navigate("/authentication-error");
          return;
        }

        const message =
          err instanceof Error ? err.message : "Could not load court.";
        setGeneralError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      loadCourt();
    }

    return () => {
      isMounted = false;
    };
  }, [courtId, isAuthenticated, user?.role, clearSession, navigate]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAccessDenied = !isAuthLoading && user?.role !== "admin";
  if (isAccessDenied) {
    return <AccessDeniedView onReturn={() => navigate("/courts")} />;
  }

  const handleFieldChange = (
    field: keyof CourtEditFormData,
    value: string | boolean
  ) => {
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

    if (isSubmitting || !courtId || !initialCourt) {
      return;
    }

    setGeneralError(null);
    setFieldErrors({});

    const changes: UpdateCourtRequest = {};

    const isNameChanged = formData.name.trim() !== initialCourt.name;
    if (isNameChanged) {
      changes.name = formData.name.trim();
    }

    const isSportChanged = formData.sportType.trim() !== initialCourt.sportType;
    if (isSportChanged) {
      changes.sportType = formData.sportType.trim();
    }

    const priceCents = parseDollarPriceToCents(formData.hourlyPrice);
    const initialPriceCents = initialCourt.hourlyPriceCents ?? 0;
    const isPriceChanged = priceCents !== initialPriceCents;
    if (isPriceChanged) {
      changes.hourlyPriceCents = priceCents;
    }

    const isOpensAtChanged = formData.opensAt !== initialCourt.opensAt;
    if (isOpensAtChanged) {
      changes.opensAt = formData.opensAt;
    }

    const isClosesAtChanged = formData.closesAt !== initialCourt.closesAt;
    if (isClosesAtChanged) {
      changes.closesAt = formData.closesAt;
    }

    const initialIsActive = initialCourt.isActive !== false;
    const isStatusChanged = formData.isActive !== initialIsActive;
    if (isStatusChanged) {
      changes.isActive = formData.isActive;
    }

    const hasChanges = Object.keys(changes).length > 0;
    if (!hasChanges) {
      setIsSuccessDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await courtApi.updateCourt(courtId, changes);
      setInitialCourt(updated);
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
        err instanceof Error ? err.message : "Could not update court.";
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
    <CourtEditView
      formData={formData}
      fieldErrors={fieldErrors}
      generalError={generalError}
      isLoading={isLoading}
      isNotFound={isNotFound}
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
