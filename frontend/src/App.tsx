import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { AppRoutes } from "./app/AppRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
