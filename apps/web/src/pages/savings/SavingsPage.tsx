import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { STRINGS } from "../../lib/i18n";
import { USER_PROFILE } from "../../lib/constants";
import { AppLayout } from "../../components/layout/AppLayout";
import {
  useSavingsGoals,
  useCreateSavingsGoal,
  useDepositToGoal,
  type SavingsGoal as GoalType,
} from "../../lib/hooks/useSavingsGoals";

const EMOJI_GRID = [
  "🏠", "✈️", "🎓", "🚗", "💍", "🎉", "📱", "💻", "🏥", "🎸",
  "📚", "🌴", "🎮", "👶", "🐕", "🏋️", "🎨", "☕", "🍕", "💎",
];

function CountUpNumber({ value }: { value: number }) {
  const { locale, currency } = useAppStore();
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
  return (
    <motion.span
      className="font-dm-mono text-4xl font-extrabold text-[var(--emerald)] lg:text-5xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {formatted}
    </motion.span>
  );
}

export function SavingsPage() {
  const { locale, currency } = useAppStore();
  const { data: goals = [], isLoading } = useSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const deposit = useDepositToGoal();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [newGoal, setNewGoal] = useState({
    name: "",
    emoji: "🎯",
    targetAmount: "",
    currency,
    deadline: "",
    autoSaveFreq: "" as "" | "weekly" | "monthly",
    autoSaveAmount: "",
  });

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const formatAmount = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    createGoal.mutate(
      {
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        currency: newGoal.currency,
        emoji: newGoal.emoji,
        deadline: newGoal.deadline || undefined,
        autoSaveRule:
          newGoal.autoSaveFreq && newGoal.autoSaveAmount
            ? {
                frequency: newGoal.autoSaveFreq,
                amount: parseFloat(newGoal.autoSaveAmount),
              }
            : undefined,
      },
      {
        onSuccess: () => {
          setShowNewGoal(false);
          setNewGoal({
            name: "",
            emoji: "🎯",
            targetAmount: "",
            currency,
            deadline: "",
            autoSaveFreq: "",
            autoSaveAmount: "",
          });
        },
      }
    );
  };

  const handleDeposit = (id: string, amt: number) => {
    if (amt <= 0) return;
    deposit.mutate(
      { id, amount: amt },
      {
        onSuccess: () => {
          setShowDeposit(null);
          setDepositAmount("");
        },
      }
    );
  };

  const gradientStrips = [
    "var(--grad-teal)",
    "var(--grad-purple)",
    "var(--grad-gold)",
    "var(--grad-coral)",
    "var(--grad-pink)",
  ];

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div
          className="orb absolute -right-20 -top-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--emerald)" }}
        />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-syne text-4xl font-bold lg:text-5xl">
            {STRINGS.en.savings.title}
          </h1>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowNewGoal(true)}
          >
            {STRINGS.en.savings.newGoal}
          </button>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm text-[var(--text-secondary)]">
            {STRINGS.en.savings.totalSaved}
          </p>
          <CountUpNumber value={totalSaved} />
        </div>

        {isLoading ? (
          <p className="text-[var(--text-secondary)]">Loading…</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, idx) => (
              <VaultCard
                key={goal.id}
                goal={goal}
                gradientStrip={gradientStrips[idx % gradientStrips.length]}
                formatAmount={formatAmount}
                onAddFunds={() => setShowDeposit(goal.id)}
                onDeposit={(amt) => handleDeposit(goal.id, amt)}
                depositModalOpen={showDeposit === goal.id}
                depositAmount={depositAmount}
                setDepositAmount={setDepositAmount}
                onCloseDeposit={() => {
                  setShowDeposit(null);
                  setDepositAmount("");
                }}
              />
            ))}
          </div>
        )}

        {goals.length === 0 && !isLoading && (
          <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
            <p className="mb-4 text-xl">🏦</p>
            <p className="mb-6 text-[var(--text-secondary)]">
              No savings goals yet. Create one to start building your future.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowNewGoal(true)}
            >
              {STRINGS.en.savings.newGoal}
            </button>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      {showNewGoal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowNewGoal(false)}
        >
          <motion.div
            className="glass-card-bright w-full max-w-lg rounded-t-3xl p-8 sm:rounded-3xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 font-syne text-xl font-bold">
              {STRINGS.en.savings.newGoal}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Goal name
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g. Vacation Fund"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal((g) => ({ ...g, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                  Emoji
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_GRID.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                        newGoal.emoji === emoji
                          ? "bg-[var(--teal)]/30 ring-2 ring-[var(--teal)]"
                          : "bg-[var(--glass-1)] hover:bg-[var(--glass-2)]"
                      }`}
                      onClick={() =>
                        setNewGoal((g) => ({ ...g, emoji }))
                      }
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  {STRINGS.en.savings.target}
                </label>
                <input
                  type="number"
                  className="input-base"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal((g) => ({ ...g, targetAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Currency
                </label>
                <select
                  className="input-base"
                  value={newGoal.currency}
                  onChange={(e) =>
                    setNewGoal((g) => ({ ...g, currency: e.target.value }))
                  }
                >
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  {STRINGS.en.savings.deadline} (optional)
                </label>
                <input
                  type="date"
                  className="input-base"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal((g) => ({ ...g, deadline: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                    {STRINGS.en.savings.autoSave}
                  </label>
                  <select
                    className="input-base"
                    value={newGoal.autoSaveFreq}
                    onChange={(e) =>
                      setNewGoal((g) => ({
                        ...g,
                        autoSaveFreq: e.target.value as "" | "weekly" | "monthly",
                      }))
                    }
                  >
                    <option value="">Off</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {newGoal.autoSaveFreq && (
                  <div className="flex-1">
                    <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                      Amount
                    </label>
                    <input
                      type="number"
                      className="input-base"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      value={newGoal.autoSaveAmount}
                      onChange={(e) =>
                        setNewGoal((g) => ({
                          ...g,
                          autoSaveAmount: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => setShowNewGoal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleCreateGoal}
                disabled={
                  !newGoal.name ||
                  !newGoal.targetAmount ||
                  parseFloat(newGoal.targetAmount) <= 0 ||
                  createGoal.isPending
                }
              >
                {createGoal.isPending ? "Creating…" : "Create Goal"}
              </button>
            </div>
          </motion.div>
        </motion.div>
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

function VaultCard({
  goal,
  gradientStrip,
  formatAmount,
  onAddFunds,
  onDeposit,
  depositModalOpen,
  depositAmount,
  setDepositAmount,
  onCloseDeposit,
}: {
  goal: GoalType;
  gradientStrip: string;
  formatAmount: (n: number) => string;
  onAddFunds: () => void;
  onDeposit: (amt: number) => void;
  depositModalOpen: boolean;
  depositAmount: string;
  setDepositAmount: (v: string) => void;
  onCloseDeposit: () => void;
}) {
  const progress = Math.min(
    100,
    (goal.currentAmount / goal.targetAmount) * 100
  );
  const daysLeft = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <motion.div
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="h-1 w-full"
        style={{ background: gradientStrip }}
      />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">{goal.emoji || "🎯"}</span>
          <div>
            <h3 className="font-syne text-lg font-bold">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-sm text-[var(--text-secondary)]">
                {daysLeft != null && daysLeft > 0
                  ? `${daysLeft} days left`
                  : daysLeft === 0
                    ? "Due today"
                    : "Overdue"}
              </p>
            )}
          </div>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--glass-2)]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: gradientStrip }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-dm-mono text-lg font-medium text-[var(--emerald)]">
            {formatAmount(goal.currentAmount)}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            of {formatAmount(goal.targetAmount)}
          </span>
        </div>
        <span className="badge mb-4 bg-[var(--glass-2)]">
          {progress.toFixed(0)}% complete
        </span>
        {goal.autoSaveRule && (
          <p className="mb-4 text-xs text-[var(--text-muted)]">
            ⏱ Auto-saves {formatAmount(goal.autoSaveRule.amount)}{" "}
            {goal.autoSaveRule.frequency}
          </p>
        )}
        {goal.isCompleted ? (
          <div className="rounded-xl bg-[var(--emerald)]/20 p-4 text-center text-[var(--emerald)]">
            {STRINGS.en.savings.completeMessage}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary flex-1 py-2 text-sm"
              onClick={onAddFunds}
            >
              {STRINGS.en.savings.addFunds}
            </button>
          </div>
        )}
      </div>

      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-card w-full max-w-sm p-6">
            <h3 className="mb-4 font-syne text-lg font-bold">
              {STRINGS.en.savings.addFunds} — {goal.name}
            </h3>
            <input
              type="number"
              className="input-base mb-4"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <p className="mb-4 text-xs text-[var(--text-muted)]">
              Available: {formatAmount(USER_PROFILE.balance)}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={onCloseDeposit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() => onDeposit(parseFloat(depositAmount) || 0)}
                disabled={
                  !depositAmount || parseFloat(depositAmount) <= 0
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
