/** Maps app pages to URL paths for React Router + browser history */
export const PAGE_TO_PATH: Record<string, string> = {
  "auth/login": "/login",
  "auth/signup": "/signup",
  "auth/otp": "/otp",
  dashboard: "/dashboard",
  transfer: "/transfer",
  assessing: "/transfer/assessing",
  tier1: "/transfer/approved",
  tier2: "/transfer/identity-check",
  tier3: "/transfer/verify",
  denied: "/transfer/denied",
  savings: "/savings",
  crypto: "/crypto",
  business: "/business",
  security: "/security",
};

export const PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k])
);

export function pathToPage(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (PATH_TO_PAGE[normalized]) return PATH_TO_PAGE[normalized];
  if (normalized === "/") return "dashboard";
  return null;
}

export function pageToPath(page: string): string {
  return PAGE_TO_PATH[page] ?? "/dashboard";
}
