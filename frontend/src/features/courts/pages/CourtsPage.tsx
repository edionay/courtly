import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { courtApi } from "../courtApi";
import type { CourtCardData } from "../CourtCard";
import { CourtsView } from "../CourtsView";
import { ApiClientError } from "../../../shared/http/apiError";

export function CourtsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout, clearSession } =
    useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState<CourtCardData[]>([]);
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCourts = useCallback(async () => {
    setIsLoadingCourts(true);
    setErrorMessage(null);

    try {
      const items = await courtApi.listCourts();
      setCourts(items);
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      const message =
        err instanceof Error ? err.message : "Could not load courts.";
      setErrorMessage(message);
    } finally {
      setIsLoadingCourts(false);
    }
  }, [clearSession, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCourts();
    }
  }, [isAuthenticated, loadCourts]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "admin";
  const isScreenLoading = isAuthLoading || isLoadingCourts;

  return (
    <CourtsView
      courts={courts}
      isLoading={isScreenLoading}
      errorMessage={errorMessage}
      onRetry={loadCourts}
      isAdmin={isAdmin}
      onSignOut={handleSignOut}
    />
  );
}
