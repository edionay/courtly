import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "./authApi";
import { tokenStorage } from "./tokenStorage";
import type { AuthStatus, AuthUser, LoginCredentials } from "./types";
import { ApiClientError } from "../../shared/http/apiError";

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
  clearSession: () => void;
  retryRestoration: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<ApiClientError | null>(null);

  const restoreSession = useCallback(async () => {
    const token = tokenStorage.getToken();
    const hasNoStoredToken = !token;

    if (hasNoStoredToken) {
      setUser(null);
      setStatus("unauthenticated");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const restoredUser = await authApi.getMe();
      setUser(restoredUser);
      setStatus("authenticated");
    } catch (err) {
      const isApiClientError = err instanceof ApiClientError;
      const isConnectionFailure = isApiClientError && err.isNetworkError;

      if (isConnectionFailure) {
        setError(err);
        setStatus("error");
        return;
      }

      const normalizedAuthError = isApiClientError ? err : null;
      tokenStorage.clearToken();
      setUser(null);
      setError(normalizedAuthError);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const response = await authApi.login(credentials);
      tokenStorage.setToken(response.accessToken);
      setUser(response.user);
      setStatus("authenticated");
      setError(null);
      return response.user;
    },
    []
  );

  const logout = useCallback(() => {
    tokenStorage.clearToken();
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const isUserAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading";

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: isUserAuthenticated,
    isLoading: isAuthLoading,
    error,
    login,
    logout,
    clearSession,
    retryRestoration: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  const isContextMissing = !context;
  if (isContextMissing) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
