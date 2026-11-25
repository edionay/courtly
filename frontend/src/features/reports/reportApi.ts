import { httpClient } from "../../shared/http/client";

export type DailyBookingReportItem = {
  id: string;
  court: {
    id: string;
    name: string;
  };
  user: {
    name: string;
  };
  status: "confirmed" | "cancelled";
  display: {
    startsAt: string;
    endsAt: string;
    totalPrice: string;
  };
};

export type DailyBookingReportResponse = {
  date: string;
  display: {
    date: string;
    expectedRevenue: string;
  };
  bookings: DailyBookingReportItem[];
};

export const reportApi = {
  async getDailyBookingsReport(
    date?: string
  ): Promise<DailyBookingReportResponse> {
    if (date) {
      return httpClient.get<DailyBookingReportResponse>(
        `/api/reports/daily-bookings?date=${encodeURIComponent(date)}`
      );
    }
    return httpClient.get<DailyBookingReportResponse>(
      "/api/reports/daily-bookings"
    );
  },
};
