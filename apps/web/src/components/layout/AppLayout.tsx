import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { USER_PROFILE } from "../../lib/constants";
import { AuditLogDrawer } from "../features/AuditLogDrawer";

const PAGE_TITLES: Record<string, string> = {
  dashboard: STRINGS.en.nav.dashboard,
  transfer: STRINGS.en.nav.transfer,
  savings: STRINGS.en.nav.savings,
  crypto: STRINGS.en.nav.crypto,
  business: STRINGS.en.nav.business,
  security: STRINGS.en.nav.security,
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const routerNavigate = useNavigate();
  const appNavigate = useAppNavigate();
  const page = useAppStore((s) => s.page);
  const demoMode = useAppStore((s) => s.demoMode);
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const logout = useAppStore((s) => s.logout);

  const pageTitle = PAGE_TITLES[page] || STRINGS.en.nav.dashboard;

  const initials = USER_PROFILE.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] dot-grid lg:flex">
        <div className="flex items-center gap-3 p-6">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--grad-teal)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="font-syne text-lg font-bold">
            {STRINGS.en.appName}
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {[
            { page: "dashboard" as const, label: STRINGS.en.nav.dashboard },
            { page: "transfer" as const, label: STRINGS.en.nav.transfer },
            { page: "savings" as const, label: STRINGS.en.nav.savings },
            { page: "crypto" as const, label: STRINGS.en.nav.crypto },
            { page: "business" as const, label: STRINGS.en.nav.business },
            { page: "security" as const, label: STRINGS.en.nav.security },
          ].map(({ page, label }) => (
            <button
              key={page}
              onClick={() => appNavigate(page)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-1)] hover:text-[var(--text-primary)]"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <button
            onClick={() => {
              logout();
              routerNavigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--glass-1)] hover:text-[var(--coral)]"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[var(--border)] bg-[var(--bg-base)]/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => routerNavigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--glass-1)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-2)] hover:text-[var(--text-primary)]"
              aria-label="Go back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-syne text-xl font-bold">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={demoMode}
              onChange={(e) => setDemoMode(e.target.value as "off" | "low" | "medium" | "high")}
              className="rounded-lg border border-[var(--border)] bg-[var(--glass-1)] px-3 py-2 text-sm text-[var(--text-primary)]"
              aria-label="Demo mode"
            >
              <option value="off">Demo: Off</option>
              <option value="low">Demo: Low Risk</option>
              <option value="medium">Demo: Medium Risk</option>
              <option value="high">Demo: High Risk</option>
            </select>
            {demoMode !== "off" && (
              <span className="badge bg-[var(--amber)]/20 text-[var(--amber)]">
                {STRINGS.en.demoModeActive}
              </span>
            )}
            <AuditLogDrawer />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="Notifications"
            >
              <span className="text-lg">🔔</span>
            </button>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full font-dm-mono text-sm font-medium"
              style={{ background: "var(--grad-teal)" }}
            >
              {initials}
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
