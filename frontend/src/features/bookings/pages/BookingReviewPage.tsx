import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ApiClientError } from "../../../shared/http/apiError";
import { bookingApi } from "../bookingApi";
import {
  BookingReviewView,
  type BookingReviewData,
} from "../BookingReviewView";

function resolveDurationLabel(durationHours: number): string {
  if (durationHours === 1) {
    return "1 hour";
  }
  return `${durationHours} hours`;
}

export function BookingReviewPage() {
  const { courtId } = useParams<{ courtId: string }>();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") || "";
  const startsAt = searchParams.get("startsAt") || "";
  const durationHoursParam = searchParams.get("durationHours") || "";
  const weekStart = searchParams.get("weekStart") || "";

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    logout,
    clearSession,
  } = useAuth();
  const navigate = useNavigate();

  const [review, setReview] = useState<BookingReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    const durationHours = Number(durationHoursParam);
    const hasValidParameters =
      Boolean(courtId) && Boolean(startsAt) && durationHours > 0;

    if (!hasValidParameters) {
      setErrorMessage("Incomplete booking selection. Please select your time again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const previewResponse = await bookingApi.getPreview({
        courtId: courtId as string,
        startsAt,
        durationHours,
      });

      setReview({
        courtName: previewResponse.court.name,
        sportType: previewResponse.court.sportType,
        dateLabel: previewResponse.display.date,
        startsAt: previewResponse.display.startsAt,
        endsAt: previewResponse.display.endsAt,
        durationLabel: resolveDurationLabel(previewResponse.durationHours),
        totalPrice: previewResponse.display.totalPrice,
      });
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearSession, courtId, durationHoursParam, navigate, startsAt]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPreview();
    }
  }, [isAuthenticated, loadPreview]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = () => {
    if (!courtId) {
      navigate("/courts");
      return;
    }

    const queryParams = new URLSearchParams();
    if (weekStart) {
      queryParams.set("weekStart", weekStart);
    }
    if (date) {
      queryParams.set("date", date);
    }

    const query = queryParams.toString();
    const destination = query
      ? `/courts/${courtId}/booking/slots?${query}`
      : `/courts/${courtId}/booking/slots`;

    navigate(destination);
  };

  const handleConfirm = async () => {
    const durationHours = Number(durationHoursParam);
    const isReadyToSubmit =
      Boolean(courtId) &&
      Boolean(startsAt) &&
      durationHours > 0 &&
      !isSubmitting &&
      !isConfirmed;

    if (!isReadyToSubmit) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setConflictMessage(null);

    try {
      await bookingApi.createBooking({
        courtId: courtId as string,
        startsAt,
        durationHours,
      });

      setIsConfirmed(true);
      setIsSuccessDialogOpen(true);
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      const isConflict = isApiClientError && err.code === "BOOKING_CONFLICT";
      if (isConflict) {
        setConflictMessage(err.message);
        setIsConflictDialogOpen(true);
        return;
      }

      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToBookings = () => {
    setIsSuccessDialogOpen(false);
    navigate("/bookings");
  };

  const handleCloseConflictDialog = () => {
    setIsConflictDialogOpen(false);
  };

  const handleBackToCourts = () => {
    navigate("/courts");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "admin";

  return (
    <BookingReviewView
      review={review}
      isLoading={isLoading || isAuthLoading}
      isSubmitting={isSubmitting}
      isConfirmed={isConfirmed}
      errorMessage={errorMessage}
      conflictMessage={conflictMessage}
      isSuccessDialogOpen={isSuccessDialogOpen}
      isConflictDialogOpen={isConflictDialogOpen}
      onGoToBookings={handleGoToBookings}
      onCloseConflictDialog={handleCloseConflictDialog}
      onChooseAnotherTime={handleChange}
      onRetry={loadPreview}
      onChange={handleChange}
      onConfirm={handleConfirm}
      onBackToCourts={handleBackToCourts}
      onBackToCourtSlots={handleChange}
      onSignOut={handleSignOut}
      isAdmin={isAdmin}
    />
  );
}
