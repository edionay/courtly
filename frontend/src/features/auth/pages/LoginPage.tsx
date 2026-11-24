import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { SignInView } from "../SignInView";
import type { LoginCredentials } from "../types";
import { ApiClientError } from "../../../shared/http/apiError";

function mapFieldErrors(
  fields: Array<{ field: string; message: string }> | undefined
): Record<string, string> {
  if (!fields) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const item of fields) {
    result[item.field] = item.message;
  }
  return result;
}

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (credentials: LoginCredentials) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      await login(credentials);
      navigate("/", { replace: true });
    } catch (err) {
      const isApiError = err instanceof ApiClientError;
      if (isApiError) {
        setErrorMessage(err.message);
        setFieldErrors(mapFieldErrors(err.fields));
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SignInView
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      fieldErrors={fieldErrors}
    />
  );
}
