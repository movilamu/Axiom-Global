import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";

export function DeniedPage() {
  const navigate = useAppNavigate();
  const resetTransferFlow = useAppStore((s) => s.resetTransferFlow);

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <motion.div
          className="glass-card w-full max-w-md p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            boxShadow: "0 0 40px rgba(239, 68, 68, 0.2)",
            borderColor: "var(--coral)",
          }}
        >
          <h1 className="mb-4 font-syne text-2xl font-bold text-[var(--coral)]">
            {STRINGS.en.denied.headline}
          </h1>
          <p className="mb-8 text-[var(--text-secondary)]">
            {STRINGS.en.denied.message}
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={() => {
                resetTransferFlow();
                navigate("transfer");
              }}
            >
              {STRINGS.en.denied.tryAgain}
            </button>
            <a
              href="mailto:support@silentsentinel.example"
              className="btn-ghost flex-1 text-center"
            >
              {STRINGS.en.denied.contactSupport}
            </a>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
