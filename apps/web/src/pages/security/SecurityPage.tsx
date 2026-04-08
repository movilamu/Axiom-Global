import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";
import { api } from "../../lib/api/client";

interface RiskEvent {
  id: string;
  sessionId: string;
  action: string;
  riskScore: number;
  riskTier: number;
  riskFactors: string[];
  outcome: string;
  createdAt: string;
  metadata?: { breakdown?: { keystroke: number; mouse: number; device: number } };
}

export function SecurityPage() {
  const { locale, auditLog } = useAppStore();

  const { data: events = [] } = useQuery({
    queryKey: ["risk-events"],
    queryFn: async () => {
      try {
        return await api.get<RiskEvent[]>("/api/risk-events");
      } catch {
        return [];
      }
    },
  });

  type EventItem = {
  id: string;
  sessionId: string;
  action: string;
  riskScore: number;
  riskTier: number;
  riskFactors: string[];
  outcome: string;
  timestamp?: string;
  createdAt?: string;
  breakdown?: { keystroke: number; mouse: number; device: number };
  metadata?: { breakdown?: { keystroke: number; mouse: number; device: number } };
};

const allEvents: EventItem[] = [
    ...auditLog.map((e) => ({
      id: e.id,
      sessionId: e.sessionId,
      action: e.action,
      riskScore: e.riskScore,
      riskTier: e.riskTier,
      riskFactors: e.riskFactors,
      outcome: e.outcome,
      timestamp: e.timestamp,
      breakdown: e.breakdown,
    })),
    ...events.map((e) => ({
      id: e.id,
      sessionId: e.sessionId,
      action: e.action,
      riskScore: e.riskScore,
      riskTier: e.riskTier,
      riskFactors: e.riskFactors ?? [],
      outcome: e.outcome,
      createdAt: e.createdAt,
      metadata: e.metadata,
    })),
  ].sort((a, b) => {
    const ts = (e: EventItem) => e.timestamp ?? e.createdAt ?? "";
    return new Date(ts(b)).getTime() - new Date(ts(a)).getTime();
  });

  const totalScanned = allEvents.length;
  const avgScore =
    totalScanned > 0
      ? Math.round(
          allEvents.reduce((s, e) => s + e.riskScore, 0) / totalScanned
        )
      : 0;
  const flagged = allEvents.filter((e) => e.riskScore > 35).length;

  const formatTime = (ts: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZoneName: "short",
    }).format(new Date(ts));

  const tierColor = (t: number) =>
    t === 1 ? "var(--emerald)" : t === 2 ? "var(--amber)" : "var(--coral)";
  const tierLabel = (t: number) =>
    t === 1 ? "Tier 1 — Auto-Approved" : t === 2 ? "Tier 2 — Identity Check" : "Tier 3 — Biometric";

  return (
    <AppLayout>
      <div className="relative min-h-screen">
        <div
          className="orb absolute -right-20 -top-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--magenta)" }}
        />
        <div
          className="orb absolute -bottom-20 -left-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--coral)" }}
        />

        <div className="mb-8 flex items-center gap-4">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--grad-teal)" }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </motion.div>
          <div>
            <h1 className="font-syne text-4xl font-bold">
              {STRINGS.en.security.title}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {STRINGS.en.security.subtitle}
            </p>
          </div>
        </div>

        <div className="mb-12 grid gap-6 sm:grid-cols-3">
          <motion.div
            className="glass-card flex items-center gap-4 p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--teal)/20" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                {STRINGS.en.security.totalScanned}
              </p>
              <p className="font-dm-mono text-2xl font-bold">{totalScanned}</p>
            </div>
          </motion.div>
          <motion.div
            className="glass-card flex items-center gap-4 p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: `${
                  avgScore <= 35
                    ? "var(--emerald)"
                    : avgScore <= 75
                      ? "var(--amber)"
                      : "var(--coral)"
                }30`,
              }}
            >
              <span
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
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                {STRINGS.en.security.avgRisk}
              </p>
              <p className="font-dm-mono text-2xl font-bold">{avgScore}</p>
            </div>
          </motion.div>
          <motion.div
            className="glass-card flex items-center gap-4 p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--coral)/20" }}
            >
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                {STRINGS.en.security.flagged}
              </p>
              <p className="font-dm-mono text-2xl font-bold">{flagged}</p>
            </div>
          </motion.div>
        </div>

        <div className="glass-card-bright mb-12 p-8">
          <h2 className="mb-6 font-syne text-2xl font-bold">
            {STRINGS.en.security.howItWorks}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--grad-teal)" }}
              >
                ⌨️
              </div>
              <h3 className="mb-2 font-syne font-semibold">
                Keystroke Analysis
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                We analyze typing rhythm, dwell times, and flight times to build
                a unique behavioral signature.
              </p>
            </div>
            <div>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--grad-purple)" }}
              >
                🖱️
              </div>
              <h3 className="mb-2 font-syne font-semibold">Motion Detection</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Mouse movements and pointer behavior help verify it&apos;s really
                you behind the screen.
              </p>
            </div>
            <div>
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--grad-coral)" }}
              >
                📱
              </div>
              <h3 className="mb-2 font-syne font-semibold">
                Biometric Verification
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                For high-risk actions, we use face verification to ensure maximum
                security.
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--teal)]">
            All data processed on-device. Nothing leaves your browser.
          </p>
        </div>

        <h2 className="mb-4 font-syne text-xl font-bold">Risk events</h2>
        {allEvents.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--glass-2)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">
              {STRINGS.en.security.noEvents}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allEvents.map((event, i) => (
              <motion.div
                key={event.id}
                className="glass-card relative overflow-hidden pl-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ background: tierColor(event.riskTier) }}
                />
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-dm-mono text-sm text-[var(--text-muted)]">
                      {event.sessionId}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {formatTime(event.timestamp ?? event.createdAt ?? "")}
                    </p>
                    <span
                      className="badge mt-2"
                      style={{
                        background: `${tierColor(event.riskTier)}30`,
                        color: tierColor(event.riskTier),
                      }}
                    >
                      {tierLabel(event.riskTier)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="rounded-full px-3 py-1 font-dm-mono text-sm font-medium"
                      style={{
                        background: `${tierColor(event.riskTier)}20`,
                        color: tierColor(event.riskTier),
                      }}
                    >
                      Score: {event.riskScore}
                    </span>
                    <span className="badge bg-[var(--glass-2)]">
                      {event.outcome}
                    </span>
                  </div>
                </div>
                {event.riskFactors && event.riskFactors.length > 0 ? (
                  <div className="border-t border-[var(--border)] p-4">
                    <p className="mb-2 text-sm text-[var(--text-secondary)]">
                      {STRINGS.en.security.factors}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.riskFactors.map((f) => (
                        <span
                          key={f}
                          className="badge bg-[var(--glass-2)] text-xs"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {(event.breakdown ?? event.metadata?.breakdown) ? (
                  <div className="border-t border-[var(--border)] p-4">
                    <p className="mb-2 text-sm text-[var(--text-secondary)]">
                      Sub-scores
                    </p>
                    <div className="flex gap-4">
                      {["keystroke", "mouse", "device"].map((k) => {
                        const b = event.breakdown ?? event.metadata?.breakdown;
                        const v = (b as Record<string, number>)?.[k] ?? 0;
                        return (
                          <span
                            key={k}
                            className="font-dm-mono text-sm capitalize"
                          >
                            {k}: {v}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.disclaimer}
      </p>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.privacyFooter}
      </p>
    </AppLayout>
  );
}
