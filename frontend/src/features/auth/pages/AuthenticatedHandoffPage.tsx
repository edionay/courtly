import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthenticatedHandoffView } from "../AuthenticatedHandoffView";

export function AuthenticatedHandoffPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-canvas grid place-content-center text-muted-foreground">
        Loading session...
      </main>
    );
  }

  const isUserUnauthenticated = !isAuthenticated || !user;
  if (isUserUnauthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return <AuthenticatedHandoffView user={user} onSignOut={handleSignOut} />;
}
