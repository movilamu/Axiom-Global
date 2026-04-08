import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { AppLayout } from "../../components/layout/AppLayout";

export function Tier3Page() {
  const navigate = useAppNavigate();
  const {
    appendAuditLog,
    riskScore,
    transferDetails,
  } = useAppStore();

  const [step, setStep] = useState(0);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [challenge] = useState(
    () =>
      STRINGS.en.biometric.challenges[
        Math.floor(Math.random() * STRINGS.en.biometric.challenges.length)
      ]
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStep(1);
      } catch {
        setCameraBlocked(true);
      }
    };

    run();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (step === 1) {
      timeoutRef.current = setTimeout(() => setStep(2), 1500);
    } else if (step === 2) {
      timeoutRef.current = setTimeout(() => setStep(3), 3000);
    } else if (step === 3) {
      timeoutRef.current = setTimeout(() => {
        appendAuditLog({
          id: `audit-${Date.now()}`,
          sessionId: useAppStore.getState().sessionId,
          action: "TRANSFER",
          riskScore: riskScore ?? 0,
          riskTier: 3,
          riskFactors: [],
          outcome: "BIOMETRIC_PASSED",
          timestamp: new Date().toUTCString(),
          transferDetails,
        });
        navigate("tier1");
      }, 1500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [step, appendAuditLog, riskScore, transferDetails, navigate]);

  if (cameraBlocked) {
    return (
      <AppLayout>
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="glass-card max-w-md p-8 text-center">
            <p className="mb-4 text-lg">{STRINGS.en.biometric.cameraBlocked}</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              {STRINGS.en.biometric.tryAgain}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const steps = [
    STRINGS.en.biometric.steps.camera,
    STRINGS.en.biometric.steps.detecting,
    STRINGS.en.biometric.steps.liveness,
    STRINGS.en.biometric.steps.antispoofing,
  ];

  return (
    <AppLayout>
      <div className="relative flex min-h-screen flex-col items-center bg-[var(--bg-base)] p-6">
        <div
          className="orb absolute -right-20 -top-20 h-[400px] w-[400px] opacity-20"
          style={{ background: "var(--coral)" }}
        />
        <h1 className="mb-2 font-syne text-2xl font-bold">
          {STRINGS.en.biometric.heading}
        </h1>
        <p className="mb-8 text-center text-[var(--text-secondary)]">
          {STRINGS.en.biometric.subtext}
        </p>

        <motion.div
          className="relative overflow-hidden rounded-2xl border-2 border-[var(--glass-border)] bg-black"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-64 w-96 object-cover"
          />
          <div
            className="absolute inset-0 animate-[scan_2s_linear_infinite]"
            style={{
              background:
                "linear-gradient(transparent 0%, rgba(0,201,167,0.3) 50%, transparent 100%)",
              backgroundSize: "100% 20%",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-32 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--teal)]/50" />
        </motion.div>

        {step === 2 && (
          <p className="mt-4 text-[var(--teal)]">{challenge}</p>
        )}

        <div className="mt-8 space-y-3">
          {steps.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 ${
                i <= step ? "text-[var(--emerald)]" : "text-[var(--text-muted)]"
              }`}
            >
              {i < step ? (
                <span>✓</span>
              ) : i === step ? (
                <span className="animate-pulse">…</span>
              ) : (
                <span>○</span>
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </AppLayout>
  );
}
