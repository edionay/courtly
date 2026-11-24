import { useNavigate } from "react-router-dom";
import { AuthenticationErrorView } from "../AuthenticationErrorView";

export function AuthenticationErrorPage() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return <AuthenticationErrorView onGoToLogin={handleGoToLogin} />;
}
