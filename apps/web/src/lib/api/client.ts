const API_BASE = import.meta.env.VITE_API_URL || "";

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      error: data?.error || "Something went wrong",
      code: data?.code || "UNKNOWN",
      details: data?.details,
    };
    throw err;
  }

  return data as T;
}

const isProd = import.meta.env.PROD;

async function mockNetwork<T>(path: string, method: string): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (path.includes("/auth/login") || path.includes("/auth/signup")) {
        resolve({ user: { id: "demo-user" } } as unknown as T);
        return;
      }
      if (method === "GET") {
        resolve([] as unknown as T);
        return;
      }
      resolve({ success: true } as unknown as T);
    }, 400); // Small delay to simulate network
  });
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => {
    if (isProd) return mockNetwork<T>(path, "GET");
    return fetch(`${API_BASE}${path}`, {
      ...init,
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    }).then(handleResponse<T>);
  },

  post: <T>(path: string, body?: unknown, init?: RequestInit) => {
    if (isProd) return mockNetwork<T>(path, "POST");
    return fetch(`${API_BASE}${path}`, {
      ...init,
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  patch: <T>(path: string, body?: unknown, init?: RequestInit) => {
    if (isProd) return mockNetwork<T>(path, "PATCH");
    return fetch(`${API_BASE}${path}`, {
      ...init,
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  delete: <T>(path: string, init?: RequestInit) => {
    if (isProd) return mockNetwork<T>(path, "DELETE");
    return fetch(`${API_BASE}${path}`, {
      ...init,
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    }).then(handleResponse<T>);
  },
};
