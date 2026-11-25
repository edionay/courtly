import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AuthenticationErrorPage } from "../features/auth/pages/AuthenticationErrorPage";
import { CourtsPage } from "../features/courts/pages/CourtsPage";
import { CourtCreatePage } from "../features/courts/pages/CourtCreatePage";
import { CourtEditPage } from "../features/courts/pages/CourtEditPage";
import { BookingSlotsPage } from "../features/bookings/pages/BookingSlotsPage";
import { BookingReviewPage } from "../features/bookings/pages/BookingReviewPage";
import { MyBookingsPage } from "../features/bookings/pages/MyBookingsPage";
import { DailyBookingsReportPage } from "../features/reports/pages/DailyBookingsReportPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authentication-error" element={<AuthenticationErrorPage />} />
      <Route path="/courts" element={<CourtsPage />} />
      <Route path="/courts/new" element={<CourtCreatePage />} />
      <Route path="/courts/:courtId/edit" element={<CourtEditPage />} />
      <Route path="/courts/:courtId/booking/slots" element={<BookingSlotsPage />} />
      <Route path="/courts/:courtId/booking/review" element={<BookingReviewPage />} />
      <Route path="/bookings" element={<MyBookingsPage />} />
      <Route path="/reports/daily-bookings" element={<DailyBookingsReportPage />} />
      <Route path="/" element={<Navigate to="/courts" replace />} />
      <Route path="*" element={<Navigate to="/courts" replace />} />
    </Routes>
  );
}
