import { httpClient } from "../../shared/http/client";

export type AvailabilitySlotStatus = "available" | "booked" | "past";

export type AvailabilitySlot = {
  startsAt: string;
  status: AvailabilitySlotStatus;
  display: {
    startsAt: string;
    endsAt: string;
  };
};

export type AvailabilityDay = {
  date: string;
  isSelectable: boolean;
  display: {
    dayOfMonth: string;
    weekday: string;
  };
  slots: AvailabilitySlot[];
};

export type AvailabilityResponse = {
  courtId: string;
  weekStart: string;
  weekEnd: string;
  display: {
    weekStart: string;
    weekEnd: string;
  };
  navigation: {
    previous: string | null;
    next: string;
  };
  days: AvailabilityDay[];
};

export type BookingPreviewRequest = {
  courtId: string;
  startsAt: string;
  durationHours: number;
};

export type BookingPreviewResponse = {
  court: {
    id: string;
    name: string;
    sportType: string;
  };
  durationHours: number;
  display: {
    date: string;
    startsAt: string;
    endsAt: string;
    totalPrice: string;
  };
};

export type BookingCreationRequest = {
  courtId: string;
  startsAt: string;
  durationHours: number;
};

export type BookingResponse = {
  id: string;
  court: {
    id: string;
    name: string;
  };
  status: "confirmed" | "cancelled";
  canCancel: boolean;
  display: {
    date: string;
    startsAt: string;
    endsAt: string;
    timezone: string;
    status: "Confirmed" | "Cancelled";
    totalPrice: string;
  };
};

export type MyBookingsResponse = {
  items: BookingResponse[];
};

export const bookingApi = {
  async getAvailability(
    courtId: string,
    weekStart?: string,
    signal?: AbortSignal,
  ): Promise<AvailabilityResponse> {
    const encodedCourtId = encodeURIComponent(courtId);
    const basePath = `/api/courts/${encodedCourtId}/availability`;
    const requestPath = weekStart
      ? `${basePath}?weekStart=${encodeURIComponent(weekStart)}`
      : basePath;

    return httpClient.get<AvailabilityResponse>(requestPath, { signal });
  },

  async getPreview(
    selection: BookingPreviewRequest,
    signal?: AbortSignal,
  ): Promise<BookingPreviewResponse> {
    return httpClient.post<BookingPreviewResponse>(
      "/api/bookings/preview",
      selection,
      { signal },
    );
  },

  async createBooking(
    selection: BookingCreationRequest,
    signal?: AbortSignal,
  ): Promise<BookingResponse> {
    return httpClient.post<BookingResponse>("/api/bookings", selection, {
      signal,
    });
  },

  async listMyBookings(signal?: AbortSignal): Promise<BookingResponse[]> {
    const response = await httpClient.get<MyBookingsResponse>(
      "/api/bookings/me",
      { signal },
    );
    return response.items;
  },

  async cancelBooking(
    bookingId: string,
    signal?: AbortSignal,
  ): Promise<BookingResponse> {
    const encodedId = encodeURIComponent(bookingId);
    return httpClient.patch<BookingResponse>(
      `/api/bookings/${encodedId}`,
      { status: "cancelled" },
      { signal },
    );
  },
};
