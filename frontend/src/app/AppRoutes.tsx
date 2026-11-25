import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AuthenticationErrorPage } from "../features/auth/pages/AuthenticationErrorPage";
import { CourtsPage } from "../features/courts/pages/CourtsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authentication-error" element={<AuthenticationErrorPage />} />
      <Route path="/courts" element={<CourtsPage />} />
      <Route path="/" element={<Navigate to="/courts" replace />} />
      <Route path="*" element={<Navigate to="/courts" replace />} />
    </Routes>
  );
}
