import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AccessDeniedView } from "../../auth/AccessDeniedView";
import { reportApi, type DailyBookingReportResponse } from "../reportApi";
import { DailyBookingsReportView } from "../DailyBookingsReportView";
import { ApiClientError } from "../../../shared/http/apiError";

export function DailyBookingsReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date") ?? undefined;

  const { user, isAuthenticated, isLoading: isAuthLoading, logout, clearSession } =
    useAuth();
  const navigate = useNavigate();

  const [dateInput, setDateInput] = useState<string>(dateParam ?? "");
  const [report, setReport] = useState<DailyBookingReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReport = useCallback(
    async (date?: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await reportApi.getDailyBookingsReport(date);
        setReport(data);
        setDateInput(data.date);
      } catch (err) {
        const isApiClientError = err instanceof ApiClientError;
        const isUnauthorized = isApiClientError && err.isUnauthorized;

        if (isUnauthorized) {
          clearSession();
          navigate("/authentication-error");
          return;
        }

        const message =
          err instanceof Error ? err.message : "Could not load report.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession, navigate]
  );

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      if (dateParam) {
        setDateInput(dateParam);
      }
      loadReport(dateParam);
    }
  }, [dateParam, isAuthenticated, user?.role, loadReport]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAccessDenied = !isAuthLoading && user?.role !== "admin";
  if (isAccessDenied) {
    return <AccessDeniedView onReturn={() => navigate("/courts")} />;
  }

  const handleSubmitDate = (event: FormEvent) => {
    event.preventDefault();
    if (!dateInput) {
      return;
    }
    setSearchParams({ date: dateInput });
  };

  const handleRetry = () => {
    loadReport(dateParam);
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <DailyBookingsReportView
      dateInput={dateInput}
      onDateInputChange={setDateInput}
      onSubmitDate={handleSubmitDate}
      report={report}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRetry={handleRetry}
      onSignOut={handleSignOut}
    />
  );
}
