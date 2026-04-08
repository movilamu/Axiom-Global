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

// In-memory mock store
const mockDB = {
  expenses: [] as any[],
  cards: [
    { id: "card_1", name: "Corporate Card", last4: "4321", active: true, balance: 1200 },
  ] as any[],
  savings: [] as any[],
  cryptoPrices: [
    { id: "btc", symbol: "BTC", name: "Bitcoin", price: 65000, change24h: 2.5 },
    { id: "eth", symbol: "ETH", name: "Ethereum", price: 3400, change24h: -1.2 },
  ] as any[],
  cryptoHoldings: [] as any[],
  riskEvents: [] as any[],
};

async function mockNetwork<T>(path: string, method: string, body?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (path.includes("/auth/login") || path.includes("/auth/signup")) {
          return resolve({ user: { id: "demo-user" } } as unknown as T);
        }
        
        if (path.includes("/business/expenses")) {
          if (method === "GET") return resolve(mockDB.expenses as unknown as T);
          if (method === "POST") {
            const newItem = { id: Math.random().toString(), ...body };
            mockDB.expenses.push(newItem);
            return resolve(newItem as unknown as T);
          }
        }

        if (path.includes("/business/cards")) {
          if (method === "GET") return resolve(mockDB.cards as unknown as T);
          if (method === "POST") {
            const newItem = { id: Math.random().toString(), active: true, balance: 0, ...body };
            mockDB.cards.push(newItem);
            return resolve(newItem as unknown as T);
          }
          if (method === "PATCH") {
             const idPart = path.split("/")[3];
             const card = mockDB.cards.find(c => c.id === idPart);
             if (card && path.includes("toggle")) card.active = !card.active;
             return resolve(card as unknown as T);
          }
        }

        if (path.includes("/savings")) {
          if (method === "GET") return resolve(mockDB.savings as unknown as T);
          if (method === "POST") {
             if (path.includes("/deposit")) {
               const idPart = path.split("/")[2];
               const goal = mockDB.savings.find(s => s.id === idPart);
               if (goal) goal.currentAmount = (goal.currentAmount || 0) + (body.amount || 0);
               return resolve(goal as unknown as T);
             }
             const newItem = { id: Math.random().toString(), currentAmount: 0, ...body };
             mockDB.savings.push(newItem);
             return resolve(newItem as unknown as T);
          }
          if (method === "DELETE") {
             const idPart = path.split("/")[2];
             mockDB.savings = mockDB.savings.filter(s => s.id !== idPart);
             return resolve({ success: true } as unknown as T);
          }
        }

        if (path.includes("/crypto/prices")) return resolve(mockDB.cryptoPrices as unknown as T);
        if (path.includes("/crypto/holdings")) return resolve(mockDB.cryptoHoldings as unknown as T);
        if (path.includes("/crypto/buy") || path.includes("/crypto/sell")) {
          return resolve({ success: true } as unknown as T);
        }

        if (path.includes("/risk-events")) {
          if (method === "GET") return resolve(mockDB.riskEvents as unknown as T);
          if (method === "POST") {
             const newItem = { id: Math.random().toString(), ...body };
             mockDB.riskEvents.push(newItem);
             return resolve(newItem as unknown as T);
          }
        }

        if (path.includes("/transfers")) {
          if (method === "POST") return resolve({ success: true } as unknown as T);
        }

        // Fallback
        if (method === "GET") return resolve([] as unknown as T);
        resolve({ id: Math.random().toString(), ...body, success: true } as unknown as T);
      } catch (err) {
        reject(err);
      }
    }, 300); // Network delay
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
    if (isProd) return mockNetwork<T>(path, "POST", body);
    return fetch(`${API_BASE}${path}`, {
      ...init,
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  patch: <T>(path: string, body?: unknown, init?: RequestInit) => {
    if (isProd) return mockNetwork<T>(path, "PATCH", body);
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
