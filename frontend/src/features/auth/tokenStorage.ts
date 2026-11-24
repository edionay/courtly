const TOKEN_STORAGE_KEY = "courtly_auth_token";

export const tokenStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Ignored if storage is blocked or quota exceeded
    }
  },

  clearToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignored
    }
  },
};
