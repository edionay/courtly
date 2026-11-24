import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AuthenticationErrorPage } from "../features/auth/pages/AuthenticationErrorPage";
import { AuthenticatedHandoffPage } from "../features/auth/pages/AuthenticatedHandoffPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/authentication-error" element={<AuthenticationErrorPage />} />
      <Route path="/" element={<AuthenticatedHandoffPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
