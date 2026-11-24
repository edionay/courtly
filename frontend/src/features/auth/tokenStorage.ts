const TOKEN_STORAGE_KEY = "courtly_auth_token";

function getSessionStorage(): Storage | null {
  const isStorageAvailable =
    typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
  return isStorageAvailable ? window.sessionStorage : null;
}

export const tokenStorage = {
  getToken(): string | null {
    const storage = getSessionStorage();
    return storage ? storage.getItem(TOKEN_STORAGE_KEY) : null;
  },

  setToken(token: string): void {
    const storage = getSessionStorage();
    if (storage) {
      storage.setItem(TOKEN_STORAGE_KEY, token);
    }
  },

  clearToken(): void {
    const storage = getSessionStorage();
    if (storage) {
      storage.removeItem(TOKEN_STORAGE_KEY);
    }
  },
};
