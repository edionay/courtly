import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ApiClientError } from "../../../shared/http/apiError";
import { bookingApi, type BookingResponse } from "../bookingApi";
import { MyBookingsView } from "../MyBookingsView";

export function MyBookingsPage() {
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    logout,
    clearSession,
  } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [cancellingBooking, setCancellingBooking] =
    useState<BookingResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const items = await bookingApi.listMyBookings();
      setBookings(items);
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
  }, [clearSession, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated, loadBookings]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleCancelClick = (booking: BookingResponse) => {
    setCancellingBooking(booking);
    setErrorMessage(null);
    setCancellationNotice(null);
  };

  const handleCloseCancelDialog = () => {
    if (isCancelling) {
      return;
    }
    setCancellingBooking(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setErrorMessage(null);

    try {
      const updatedBooking = await bookingApi.cancelBooking(
        cancellingBooking.id,
      );

      setBookings((previousBookings) =>
        previousBookings.map((item) => {
          const isTargetBooking = item.id === cancellingBooking.id;
          return isTargetBooking ? updatedBooking : item;
        }),
      );

      setCancellationNotice(
        `Booking for ${updatedBooking.court.name} on ${updatedBooking.display.date} has been cancelled.`,
      );
      setCancellingBooking(null);
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      const isWindowClosed =
        isApiClientError && err.code === "CANCELLATION_WINDOW_CLOSED";
      if (isWindowClosed) {
        setCancellingBooking(null);
        setErrorMessage(err.message);
        loadBookings();
        return;
      }

      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "admin";

  return (
    <MyBookingsView
      bookings={bookings}
      isLoading={isLoading || isAuthLoading}
      isCancelling={isCancelling}
      cancellingBooking={cancellingBooking}
      cancellationNotice={cancellationNotice}
      errorMessage={errorMessage}
      onRetry={loadBookings}
      onCancelBooking={handleCancelClick}
      onCloseCancelDialog={handleCloseCancelDialog}
      onConfirmCancel={handleConfirmCancel}
      onSignOut={handleSignOut}
      isAdmin={isAdmin}
    />
  );
}
