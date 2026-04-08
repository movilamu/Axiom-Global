import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useAppStore } from "../../store/appStore";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";
import { api } from "../../lib/api/client";

const CATEGORIES = ["Travel", "Food", "Software", "Office", "Other"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  Travel: "var(--grad-blue)",
  Food: "var(--grad-coral)",
  Software: "var(--grad-teal)",
  Office: "var(--grad-purple)",
  Other: "var(--glass-2)",
};

interface Expense {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  note?: string;
}

interface Card {
  id: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isActive: boolean;
  spendLimit?: number;
}

export function BusinessPage() {
  const { locale, currency } = useAppStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"expenses" | "cards" | "analytics">("expenses");

  const { data: expenses = [] } = useQuery({
    queryKey: ["business-expenses"],
    queryFn: () => api.get<Expense[]>("/api/business/expenses"),
  });

  const { data: cards = [] } = useQuery({
    queryKey: ["business-cards"],
    queryFn: () => api.get<Card[]>("/api/business/cards"),
  });

  const addExpense = useMutation({
    mutationFn: (data: Partial<Expense>) =>
      api.post<Expense>("/api/business/expenses", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-expenses"] }),
  });

  const createCard = useMutation({
    mutationFn: () => api.post<Card>("/api/business/cards", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-cards"] }),
  });

  const toggleCard = useMutation({
    mutationFn: (id: string) =>
      api.patch<Card>(`/api/business/cards/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-cards"] }),
  });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    merchant: "",
    category: "Other",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const formatAmount = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);

  const monthlyTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((c) => ({
    name: c,
    value: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((x) => x.value > 0);

  const handleAddExpense = () => {
    if (!newExpense.merchant || !newExpense.amount) return;
    addExpense.mutate(
      {
        merchant: newExpense.merchant,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        currency,
        date: newExpense.date,
        note: newExpense.note || undefined,
      },
      {
        onSuccess: () => {
          setShowAddExpense(false);
          setNewExpense({
            merchant: "",
            category: "Other",
            amount: "",
            date: new Date().toISOString().slice(0, 10),
            note: "",
          });
        },
      }
    );
  };

  const handleExportCSV = async () => {
    try {
      const base = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${base}/api/business/expenses/export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: generate CSV client-side
      const headers = "Date,Merchant,Category,Amount,Currency,Note\n";
      const rows = expenses
        .map(
          (e) =>
            `${e.date},${e.merchant},${e.category},${e.amount},${e.currency},${e.note ?? ""}`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div
          className="orb absolute -right-20 -top-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--indigo)" }}
        />

        <h1 className="mb-8 font-syne text-4xl font-bold">
          {STRINGS.en.business.title}
        </h1>

        <div className="mb-8 flex gap-2">
          {(["expenses", "cards", "analytics"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`relative rounded-xl px-6 py-3 font-medium capitalize ${
                tab === t ? "text-[var(--teal)]" : "text-[var(--text-secondary)]"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "expenses" && STRINGS.en.business.expenses}
              {t === "cards" && STRINGS.en.business.cards}
              {t === "analytics" && "Analytics"}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-xl bg-[var(--teal)]/10"
                  transition={{ type: "spring", bounce: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>

        {tab === "expenses" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <p className="font-dm-mono text-3xl font-bold text-[var(--indigo)]">
                {formatAmount(monthlyTotal)}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleExportCSV}
                >
                  {STRINGS.en.business.exportCSV}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowAddExpense(true)}
                >
                  {STRINGS.en.business.addExpense}
                </button>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-card p-6">
                <h3 className="mb-4 font-syne font-semibold">
                  Spending by category
                </h3>
                {byCategory.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          label={({ name, value }) =>
                            `${name} ${formatAmount(value)}`
                          }
                        >
                          {byCategory.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CATEGORY_COLORS[byCategory[i].name] ?? "var(--glass-2)"}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)]">No expenses yet</p>
                )}
              </div>
              <div className="glass-card overflow-hidden p-6">
                <h3 className="mb-4 font-syne font-semibold">Recent expenses</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {expenses.slice(0, 10).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between rounded-lg bg-[var(--glass-1)] p-3"
                    >
                      <div>
                        <p className="font-medium">{e.merchant}</p>
                        <span
                          className="badge text-xs"
                          style={{
                            background: `${CATEGORY_COLORS[e.category] ?? "var(--glass-2)"}40`,
                          }}
                        >
                          {e.category}
                        </span>
                      </div>
                      <p className="font-dm-mono font-medium">
                        {formatAmount(e.amount)}
                      </p>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <p className="text-[var(--text-muted)]">No expenses yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="glass-card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="p-4 text-left text-sm text-[var(--text-secondary)]">Date</th>
                    <th className="p-4 text-left text-sm text-[var(--text-secondary)]">Merchant</th>
                    <th className="p-4 text-left text-sm text-[var(--text-secondary)]">Category</th>
                    <th className="p-4 text-right text-sm text-[var(--text-secondary)]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-[var(--border)]">
                      <td className="p-4 font-dm-mono text-sm">{e.date}</td>
                      <td className="p-4 font-medium">{e.merchant}</td>
                      <td className="p-4">
                        <span
                          className="badge"
                          style={{
                            background: `${CATEGORY_COLORS[e.category] ?? "var(--glass-2)"}40`,
                          }}
                        >
                          {e.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-dm-mono font-medium">
                        {formatAmount(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === "cards" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  className="relative h-48 w-80 overflow-hidden rounded-2xl p-6"
                  style={{
                    background:
                      ["var(--grad-purple)", "var(--grad-coral)", "var(--grad-teal)"][
                        i % 3
                      ],
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="card-shine" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex justify-between">
                      <span className="font-syne text-sm font-bold text-white/90">
                        SilentSentinel
                      </span>
                      <span
                        className={`badge ${
                          card.isActive
                            ? "bg-[var(--emerald)]/30 text-white"
                            : "bg-[var(--coral)]/30 text-white"
                        }`}
                      >
                        {card.isActive ? "Active" : "Frozen"}
                      </span>
                    </div>
                    <p className="font-dm-mono text-lg tracking-widest text-white">
                      ●●●● ●●●● ●●●● {card.last4}
                    </p>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>
                        {String(card.expiryMonth).padStart(2, "0")}/
                        {card.expiryYear}
                      </span>
                      {card.spendLimit && (
                        <span>Limit: {formatAmount(card.spendLimit)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => createCard.mutate(undefined)}
            >
              {STRINGS.en.business.newCard}
            </button>
            {cards.length > 0 && (
              <div className="space-y-2">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="glass-card flex items-center justify-between p-4"
                  >
                    <span className="font-dm-mono">●●●● {card.last4}</span>
                    <button
                      type="button"
                      className="btn-ghost py-2 text-sm"
                      onClick={() => toggleCard.mutate(card.id)}
                    >
                      {card.isActive ? "Freeze" : "Unfreeze"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "analytics" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="glass-card p-6">
                <h3 className="mb-4 font-syne font-semibold">Monthly total</h3>
                <p className="font-dm-mono text-3xl font-bold">
                  {formatAmount(monthlyTotal)}
                </p>
              </div>
              <div className="glass-card p-6">
                <h3 className="mb-4 font-syne font-semibold">Top category</h3>
                <p className="font-dm-mono text-xl">
                  {byCategory[0]?.name ?? "—"}
                </p>
              </div>
            </div>
            {byCategory.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="mb-4 font-syne font-semibold">Category breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCategory}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill="var(--indigo)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div
            className="glass-card-bright w-full max-w-md rounded-t-3xl p-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 font-syne text-xl font-bold">
              {STRINGS.en.business.addExpense}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Merchant
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={newExpense.merchant}
                  onChange={(e) =>
                    setNewExpense((x) => ({ ...x, merchant: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  {STRINGS.en.business.category}
                </label>
                <select
                  className="input-base"
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense((x) => ({ ...x, category: e.target.value }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Amount
                </label>
                <input
                  type="number"
                  className="input-base"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense((x) => ({ ...x, amount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Date
                </label>
                <input
                  type="date"
                  className="input-base"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense((x) => ({ ...x, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Note
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={newExpense.note}
                  onChange={(e) =>
                    setNewExpense((x) => ({ ...x, note: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleAddExpense}
                disabled={
                  !newExpense.merchant ||
                  !newExpense.amount ||
                  parseFloat(newExpense.amount) <= 0
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.disclaimer}
      </p>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.privacyFooter}
      </p>
    </AppLayout>
  );
}
