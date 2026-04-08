import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { computeRiskScore } from "@silentsentinel/core";
import { api } from "../../lib/api/client";

const MESSAGES = [
  "Analyzing keystroke dynamics…",
  "Evaluating motion patterns…",
  "Computing risk profile…",
];

export function AssessingPage() {
  const navigate = useAppNavigate();
  const {
    sessionId,
    biometrics,
    demoMode,
    transferDetails,
    setRiskScore,
    setRiskTier,
    appendAuditLog,
  } = useAppStore();

  const [messageIndex, setMessageIndex] = useState(0);
  const completed = useRef(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 700);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (completed.current) return;
    const timer = setTimeout(() => {
      completed.current = true;
      const result = computeRiskScore(biometrics, demoMode);
      setRiskScore(result.score, result.factors);
      setRiskTier(result.tier);

      const entry = {
        id: `audit-${Date.now()}`,
        sessionId,
        action: "TRANSFER",
        riskScore: result.score,
        riskTier: result.tier,
        riskFactors: result.factors,
        outcome: "PENDING",
        timestamp: new Date().toUTCString(),
        transferDetails,
        breakdown: result.breakdown,
      };
      appendAuditLog(entry);

      api.post("/api/risk-events", {
        sessionId,
        action: "TRANSFER",
        riskScore: result.score,
        riskTier: result.tier,
        riskFactors: result.factors,
        outcome: "PENDING",
        metadata: { breakdown: result.breakdown },
      }).catch(() => {});

      if (demoMode === "high") {
        navigate("tier3");
      } else if (result.tier === 1) {
        navigate("tier1");
      } else if (result.tier === 2) {
        navigate("tier2");
      } else {
        navigate("tier3");
      }
    }, 2100);
    return () => clearTimeout(timer);
  }, [
    biometrics,
    demoMode,
    sessionId,
    transferDetails,
    setRiskScore,
    setRiskTier,
    appendAuditLog,
    navigate,
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-6">
      <motion.div
        className="relative h-24 w-24"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "var(--teal)",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
      <motion.p
        className="mt-6 text-lg text-[var(--text-secondary)]"
        key={messageIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {MESSAGES[messageIndex]}
      </motion.p>
    </div>
  );
}
