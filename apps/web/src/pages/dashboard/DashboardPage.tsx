import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { USER_PROFILE } from "../../lib/constants";
import { AppLayout } from "../../components/layout/AppLayout";

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return STRINGS.en.dashboard.greeting.morning;
  if (h >= 12 && h < 18) return STRINGS.en.dashboard.greeting.afternoon;
  return STRINGS.en.dashboard.greeting.evening;
}

export function DashboardPage() {
  const { locale, currency } = useAppStore();
  const navigate = useAppNavigate();
  const greeting = getGreeting();

  const formattedBalance = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(USER_PROFILE.balance),
    [locale, currency]
  );

  const creditsToday = USER_PROFILE.transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const debitsToday = USER_PROFILE.transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div
          className="orb -top-20 -left-40 h-[600px] w-[600px]"
          style={{ background: "var(--purple)", animationDelay: "0s" }}
        />
        <div
          className="orb -top-20 -right-40 h-[400px] w-[400px]"
          style={{ background: "var(--pink)", animationDelay: "3s" }}
        />
        <div
          className="orb -bottom-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2"
          style={{ background: "var(--teal)", animationDelay: "6s" }}
        />

        <motion.div
          className="glass-card-bright relative mb-8 overflow-hidden p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="card-shine" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">{greeting}</p>
              <span className="badge flex items-center gap-1.5 bg-[var(--emerald)]/20 text-[var(--emerald)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Protected
              </span>
            </div>
            <h1 className="font-syne text-xl font-bold text-[var(--text-primary)]">
              {USER_PROFILE.name}
            </h1>
            <p className="mb-2 text-sm text-[var(--text-secondary)]">
              {STRINGS.en.dashboard.balance}
            </p>
            <p className="font-dm-mono text-4xl font-extrabold tracking-tight lg:text-5xl">
              {formattedBalance}
            </p>
            <p className="mt-2 font-dm-mono text-sm text-[var(--text-secondary)]">
              {STRINGS.en.dashboard.accountNumber}: {USER_PROFILE.accountNumber}
            </p>
            <div className="mt-4 flex gap-4">
              <span className="text-sm text-[var(--emerald)]">
                ↑ +{new Intl.NumberFormat(locale, { style: "currency", currency }).format(creditsToday)} today
              </span>
              <span className="text-sm text-[var(--coral)]">
                ↓ -{new Intl.NumberFormat(locale, { style: "currency", currency }).format(debitsToday)} today
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { label: STRINGS.en.dashboard.sendMoney, page: "transfer" as const, grad: "var(--grad-teal)" },
            { label: STRINGS.en.dashboard.addMoney, page: "dashboard" as const, grad: "var(--grad-purple)" },
            { label: STRINGS.en.nav.savings, page: "savings" as const, grad: "var(--grad-gold)" },
            { label: STRINGS.en.nav.crypto, page: "crypto" as const, grad: "var(--grad-coral)" },
          ].map(({ label, page, grad }) => (
            <motion.button
              key={page}
              type="button"
              onClick={() => navigate(page)}
              className="flex h-14 items-center gap-2 rounded-2xl px-6 font-semibold text-white shadow-lg"
              style={{ background: grad }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-syne text-lg font-bold">
              {STRINGS.en.dashboard.recentTransactions}
            </h2>
            <button
              type="button"
              className="text-sm text-[var(--teal)] hover:underline"
            >
              {STRINGS.en.dashboard.viewAll} →
            </button>
          </div>
          <div className="space-y-4">
            {USER_PROFILE.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{tx.merchant}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{tx.date}</p>
                </div>
                <p
                  className={`font-dm-mono font-medium ${
                    tx.type === "credit" ? "text-[var(--emerald)]" : "text-[var(--coral)]"
                  }`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {new Intl.NumberFormat(useAppStore.getState().locale, {
                    style: "currency",
                    currency: useAppStore.getState().currency,
                  }).format(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
          {STRINGS.en.disclaimer}
        </p>
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          {STRINGS.en.privacyFooter}
        </p>
      </div>
    </AppLayout>
  );
}
