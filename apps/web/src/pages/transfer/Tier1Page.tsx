import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";
import { api } from "../../lib/api/client";

export function Tier1Page() {
  const navigate = useAppNavigate();
  const {
    transferDetails,
    riskScore,
    sessionId,
    locale,
    currency,
  } = useAppStore();

  useEffect(() => {
    api.post("/api/transfers", {
      sessionRef: sessionId,
      recipientName: transferDetails.recipient,
      recipientAccount: transferDetails.accountNumber,
      amount: parseFloat(transferDetails.amount || "0"),
      currency: transferDetails.currency,
      status: "COMPLETED",
      riskScore: riskScore ?? 0,
      riskTier: 1,
    }).catch(() => {});
  }, [sessionId, transferDetails, riskScore, currency]);

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(parseFloat(transferDetails.amount || "0"));

  const formattedTime = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short",
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-6">
        <div
          className="orb absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30"
          style={{ background: "var(--emerald)" }}
        />
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            className="mb-6"
          >
            <motion.path
              d="M20 40 L35 55 L60 25"
              fill="none"
              stroke="var(--emerald)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </motion.svg>
          <h1 className="mb-6 font-syne text-3xl font-bold">
            {STRINGS.en.approved.headline}
          </h1>
          <div className="glass-card mb-6 w-full max-w-md p-6">
            <div className="space-y-3">
              <p>
                <span className="text-[var(--text-secondary)]">To:</span>{" "}
                {transferDetails.recipient}
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">Account:</span>{" "}
                •••• •••• •••• {transferDetails.accountNumber.slice(-4)}
              </p>
              <p className="font-dm-mono text-xl">{formattedAmount}</p>
              <p className="text-sm text-[var(--text-secondary)]">{formattedTime}</p>
              <p className="font-dm-mono text-xs text-[var(--text-muted)]">
                Ref: {sessionId}
              </p>
            </div>
          </div>
          <span className="badge mb-6 bg-[var(--emerald)]/20 text-[var(--emerald)]">
            {STRINGS.en.approved.badge} — Risk Score: {riskScore ?? 0}%
          </span>
          <div className="flex gap-4">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("dashboard")}
            >
              {STRINGS.en.approved.backToDashboard}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={handlePrint}
            >
              {STRINGS.en.approved.downloadReceipt}
            </button>
          </div>
        </motion.div>
        <p className="absolute bottom-6 text-center text-xs text-[var(--text-muted)]">
          {STRINGS.en.privacyFooter}
        </p>
      </div>
      <div id="print-receipt" className="absolute -left-[9999px] top-0">
        <div className="p-8">
          <h1 className="font-syne text-2xl font-bold">Receipt</h1>
          <p>To: {transferDetails.recipient}</p>
          <p>Account: •••• •••• •••• {transferDetails.accountNumber.slice(-4)}</p>
          <p>Amount: {formattedAmount}</p>
          <p>Date: {formattedTime}</p>
          <p>Ref: {sessionId}</p>
        </div>
      </div>
    </AppLayout>
  );
}
