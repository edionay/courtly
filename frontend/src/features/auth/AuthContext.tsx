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
    if (!token) {
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
      if (err instanceof ApiClientError && err.isNetworkError) {
        // Transport failure is not proof that credentials expired: do not clear token
        setError(err);
        setStatus("error");
      } else {
        // Token is invalid, expired, or rejected
        tokenStorage.clearToken();
        setUser(null);
        setError(err instanceof ApiClientError ? err : null);
        setStatus("unauthenticated");
      }
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const response = await authApi.login(credentials);
    tokenStorage.setToken(response.accessToken);
    setUser(response.user);
    setStatus("authenticated");
    setError(null);
    return response.user;
  }, []);

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

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
