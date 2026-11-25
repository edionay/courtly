import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { courtApi } from "../../courts/courtApi";
import { ApiClientError } from "../../../shared/http/apiError";
import {
  bookingApi,
  type AvailabilityDay,
  type AvailabilityResponse,
} from "../bookingApi";
import {
  BookingSlotsView,
  type BookingCourtSummary,
} from "../BookingSlotsView";

function extractWeekStartFromUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) {
    return null;
  }
  const queryString = url.slice(queryIndex + 1);
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get("weekStart");
}

function resolveInitialDate(
  days: AvailabilityDay[],
  preferredDate?: string,
): string {
  const hasPreferred = Boolean(preferredDate);
  if (hasPreferred) {
    const matchingDay = days.find(
      (day) => day.date === preferredDate && day.isSelectable,
    );
    if (matchingDay) {
      return matchingDay.date;
    }
  }

  const firstSelectableDay = days.find((day) => day.isSelectable);
  if (firstSelectableDay) {
    return firstSelectableDay.date;
  }

  const fallbackDay = days[0];
  return fallbackDay ? fallbackDay.date : "";
}

export function BookingSlotsPage() {
  const { courtId } = useParams<{ courtId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const weekStartParam = searchParams.get("weekStart") || undefined;
  const dateParam = searchParams.get("date") || undefined;

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    logout,
    clearSession,
  } = useAuth();
  const navigate = useNavigate();

  const [court, setCourt] = useState<BookingCourtSummary | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartsAtList, setSelectedStartsAtList] = useState<string[]>([]);
  const [previewPrice, setPreviewPrice] = useState<string | null>(null);
  const [previewDateLabel, setPreviewDateLabel] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!courtId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSelectedStartsAtList([]);
    setPreviewPrice(null);
    setPreviewDateLabel(null);
    setPreviewError(null);

    try {
      const courts = await courtApi.listCourts();
      const currentCourt = courts.find((item) => item.id === courtId);
      const isCourtUnavailable = !currentCourt || currentCourt.isActive === false;

      if (isCourtUnavailable) {
        setErrorMessage("Court not found or unavailable for booking.");
        return;
      }

      setCourt({
        id: currentCourt.id,
        name: currentCourt.name,
        sportType: currentCourt.sportType,
        opensAt: currentCourt.opensAt,
        closesAt: currentCourt.closesAt,
        hourlyPrice: currentCourt.display.hourlyPrice,
      });

      const availabilityData = await bookingApi.getAvailability(
        courtId,
        weekStartParam,
      );
      setAvailability(availabilityData);

      const initialDate = resolveInitialDate(availabilityData.days, dateParam);
      setSelectedDate(initialDate);
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isUnauthorized = isApiClientError && err.isUnauthorized;

      if (isUnauthorized) {
        clearSession();
        navigate("/authentication-error");
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Could not load court availability.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [clearSession, courtId, dateParam, navigate, weekStartParam]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    const hasNoSelection = selectedStartsAtList.length === 0;
    if (hasNoSelection) {
      setPreviewPrice(null);
      setPreviewDateLabel(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    if (!courtId) {
      return;
    }

    const abortController = new AbortController();
    const sortedStarts = [...selectedStartsAtList].sort();
    const earliestStartsAt = sortedStarts[0];
    const durationHours = selectedStartsAtList.length;

    setIsPreviewLoading(true);
    setPreviewError(null);

    bookingApi
      .getPreview(
        {
          courtId,
          startsAt: earliestStartsAt,
          durationHours,
        },
        abortController.signal,
      )
      .then((response) => {
        setPreviewPrice(response.display.totalPrice);
        setPreviewDateLabel(response.display.date);
      })
      .catch((error) => {
        const isAborted =
          error instanceof DOMException && error.name === "AbortError";
        if (isAborted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unable to calculate price.";
        setPreviewError(message);
      })
      .finally(() => {
        const isCurrentRequest = !abortController.signal.aborted;
        if (isCurrentRequest) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [courtId, selectedStartsAtList]);

  const isUserUnauthenticated = !isAuthLoading && !isAuthenticated;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedStartsAtList([]);
    setPreviewPrice(null);
    setPreviewDateLabel(null);
    setPreviewError(null);
  };

  const handleToggleSlot = (startsAt: string) => {
    const isAlreadySelected = selectedStartsAtList.includes(startsAt);

    if (isAlreadySelected) {
      const remainingSlots = selectedStartsAtList.filter(
        (item) => item !== startsAt,
      );
      setSelectedStartsAtList(remainingSlots);
      return;
    }

    const updatedSlots = [...selectedStartsAtList, startsAt];
    setSelectedStartsAtList(updatedSlots);
  };

  const handlePreviousWeek = () => {
    const prevWeekStart = extractWeekStartFromUrl(
      availability?.navigation.previous ?? null,
    );
    if (prevWeekStart) {
      setSearchParams({ weekStart: prevWeekStart });
    }
  };

  const handleNextWeek = () => {
    const nextWeekStart = extractWeekStartFromUrl(
      availability?.navigation.next ?? null,
    );
    if (nextWeekStart) {
      setSearchParams({ weekStart: nextWeekStart });
    }
  };

  const handleContinue = () => {
    if (!courtId || !availability || selectedStartsAtList.length === 0) {
      return;
    }

    const sortedStarts = [...selectedStartsAtList].sort();
    const earliestStartsAt = sortedStarts[0];
    const durationHours = selectedStartsAtList.length;
    const weekStart = availability.weekStart;

    const queryParams = new URLSearchParams({
      date: selectedDate,
      startsAt: earliestStartsAt,
      durationHours: String(durationHours),
      weekStart,
    });

    navigate(`/courts/${courtId}/booking/review?${queryParams.toString()}`);
  };

  const handleBackToCourts = () => {
    navigate("/courts");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "admin";
  const hasPreviousWeek = Boolean(availability?.navigation.previous);
  const hasNextWeek = Boolean(availability?.navigation.next);
  const weekStartLabel = availability?.display.weekStart ?? "";
  const weekEndLabel = availability?.display.weekEnd ?? "";
  const days = availability?.days ?? [];

  return (
    <BookingSlotsView
      court={court ?? undefined}
      weekStartLabel={weekStartLabel}
      weekEndLabel={weekEndLabel}
      hasPreviousWeek={hasPreviousWeek}
      hasNextWeek={hasNextWeek}
      onPreviousWeek={handlePreviousWeek}
      onNextWeek={handleNextWeek}
      days={days}
      selectedDate={selectedDate}
      onSelectDate={handleSelectDate}
      selectedStartsAtList={selectedStartsAtList}
      onToggleSlot={handleToggleSlot}
      previewDateLabel={previewDateLabel}
      previewPrice={previewPrice}
      isPreviewLoading={isPreviewLoading}
      previewError={previewError}
      isLoading={isLoading || isAuthLoading}
      errorMessage={errorMessage}
      onRetry={loadData}
      onContinue={handleContinue}
      onBackToCourts={handleBackToCourts}
      onSignOut={handleSignOut}
      isAdmin={isAdmin}
    />
  );
}
