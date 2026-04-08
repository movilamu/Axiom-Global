import { useState } from "react";
import { motion } from "framer-motion";
import { useAppNavigate } from "../../lib/useAppNavigate";

export function OTPPage() {
  const navigate = useAppNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] dot-grid p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="glass-card p-8 text-center">
          <h1 className="mb-4 font-syne text-2xl font-bold">Verify your email</h1>
          <p className="mb-8 text-[var(--text-secondary)]">
            We&apos;ve sent a 6-digit code to your email. Enter it below.
          </p>
          <div className="mb-6 flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-12 rounded-xl border border-[var(--border)] bg-[var(--glass-1)] text-center font-dm-mono text-xl text-[var(--text-primary)] focus:border-[var(--teal)] focus:outline-none"
                value={digit}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                  setCode((prev) => {
                    const next = [...prev];
                    next[i] = v;
                    return next;
                  });
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="text-sm text-[var(--teal)] hover:underline disabled:opacity-50"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
          </button>
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            Prototype: OTP verification is not wired.{" "}
            <button
              type="button"
              className="text-[var(--teal)] hover:underline"
              onClick={() => navigate("auth/login")}
            >
              Back to login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
