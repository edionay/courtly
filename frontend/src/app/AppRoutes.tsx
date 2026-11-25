import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AuthenticationErrorPage } from "../features/auth/pages/AuthenticationErrorPage";
import { CourtsPage } from "../features/courts/pages/CourtsPage";
import { BookingSlotsPage } from "../features/bookings/pages/BookingSlotsPage";
import { BookingReviewPage } from "../features/bookings/pages/BookingReviewPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authentication-error" element={<AuthenticationErrorPage />} />
      <Route path="/courts" element={<CourtsPage />} />
      <Route path="/courts/:courtId/booking/slots" element={<BookingSlotsPage />} />
      <Route path="/courts/:courtId/booking/review" element={<BookingReviewPage />} />
      <Route path="/" element={<Navigate to="/courts" replace />} />
      <Route path="*" element={<Navigate to="/courts" replace />} />
    </Routes>
  );
}
