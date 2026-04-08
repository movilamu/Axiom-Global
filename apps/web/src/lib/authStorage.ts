const AUTH_KEY = "ss_auth";

export function loadAuth(): { userId: string } | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.userId) return { userId: data.userId };
  } catch {
    // ignore
  }
  return null;
}

export function saveAuth(userId: string) {
  try {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ userId }));
  } catch {
    // ignore
  }
}

export function clearAuth() {
  try {
    sessionStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}
