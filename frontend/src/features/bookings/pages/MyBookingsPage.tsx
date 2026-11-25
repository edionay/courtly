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

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "admin";

  return (
    <MyBookingsView
      bookings={bookings}
      isLoading={isLoading || isAuthLoading}
      errorMessage={errorMessage}
      onRetry={loadBookings}
      onSignOut={handleSignOut}
      isAdmin={isAdmin}
    />
  );
}
