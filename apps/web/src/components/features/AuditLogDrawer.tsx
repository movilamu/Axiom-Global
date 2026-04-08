import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { STRINGS } from "../../lib/i18n";

export function AuditLogDrawer() {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { auditLog, locale } = useAppStore();

  const totalScanned = auditLog.length;
  const avgScore =
    totalScanned > 0
      ? Math.round(
          auditLog.reduce((s, e) => s + e.riskScore, 0) / totalScanned
        )
      : 0;
  const flagged = auditLog.filter((e) => e.riskScore > 35).length;

  const formatTime = (ts: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZoneName: "short",
    }).format(new Date(ts));

  const tierColor = (t: number) =>
    t === 1 ? "var(--emerald)" : t === 2 ? "var(--amber)" : "var(--coral)";

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-[var(--glass-1)]"
        onClick={() => setOpen(true)}
        aria-label="Open audit log"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--bg-surface)] shadow-xl sm:max-w-md"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
                <h2 className="font-syne text-xl font-bold">Audit Log</h2>
                <button
                  type="button"
                  className="rounded-lg p-2 hover:bg-[var(--glass-1)]"
                  onClick={() => setOpen(false)}
                  aria-label="Close audit log"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-4 border-b border-[var(--border)] p-4">
                <div className="flex-1 rounded-xl bg-[var(--glass-1)] p-4">
                  <p className="text-xs text-[var(--text-secondary)]">Scanned</p>
                  <p className="font-dm-mono text-lg font-bold">{totalScanned}</p>
                </div>
                <div className="flex-1 rounded-xl bg-[var(--glass-1)] p-4">
                  <p className="text-xs text-[var(--text-secondary)]">Avg Score</p>
                  <p
                    className="font-dm-mono text-lg font-bold"
                    style={{
                      color:
                        avgScore <= 35
                          ? "var(--emerald)"
                          : avgScore <= 75
                            ? "var(--amber)"
                            : "var(--coral)",
                    }}
                  >
                    {avgScore}
                  </p>
                </div>
                <div className="flex-1 rounded-xl bg-[var(--glass-1)] p-4">
                  <p className="text-xs text-[var(--text-secondary)]">Flagged</p>
                  <p className="font-dm-mono text-lg font-bold">{flagged}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {auditLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--glass-2)]">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="1.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {STRINGS.en.noTransactionsRecorded}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLog.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        className="glass-card relative overflow-hidden"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div
                          className="absolute left-0 top-0 h-full w-1"
                          style={{ background: tierColor(entry.riskTier) }}
                        />
                        <div
                          className="cursor-pointer p-4 pl-5"
                          onClick={() =>
                            setExpandedId(expandedId === entry.id ? null : entry.id)
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedId(expandedId === entry.id ? null : entry.id);
                            }
                          }}
                        >
                          <p className="font-dm-mono text-xs text-[var(--text-muted)]">
                            {entry.sessionId}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {formatTime(entry.timestamp)}
                          </p>
                          <span
                            className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              background: `${tierColor(entry.riskTier)}20`,
                              color: tierColor(entry.riskTier),
                            }}
                          >
                            Score: {entry.riskScore}
                          </span>
                        </div>
                        <AnimatePresence>
                          {expandedId === entry.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[var(--border)]"
                            >
                              <div className="p-4 pl-5">
                                {entry.breakdown && (
                                  <div className="mb-3">
                                    <p className="mb-1 text-xs text-[var(--text-secondary)]">
                                      Sub-scores
                                    </p>
                                    <div className="flex gap-4 text-sm">
                                      <span>Keystroke: {entry.breakdown.keystroke}</span>
                                      <span>Mouse: {entry.breakdown.mouse}</span>
                                      <span>Device: {entry.breakdown.device}</span>
                                    </div>
                                  </div>
                                )}
                                {entry.riskFactors.length > 0 && (
                                  <div className="mb-3">
                                    <p className="mb-1 text-xs text-[var(--text-secondary)]">
                                      Factors
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {entry.riskFactors.map((f) => (
                                        <span
                                          key={f}
                                          className="rounded bg-[var(--glass-2)] px-2 py-0.5 text-xs"
                                        >
                                          {f}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <span className="badge bg-[var(--glass-2)] text-xs">
                                  {entry.outcome}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
