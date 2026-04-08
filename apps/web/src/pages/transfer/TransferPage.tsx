import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { USER_PROFILE, EXCHANGE_RATES, SESSION_TIMEOUT_WARN_MS, SESSION_TIMEOUT_HARD_MS, PIN_MAX_ATTEMPTS } from "../../lib/constants";
import { AppLayout } from "../../components/layout/AppLayout";
import { computeRiskScore } from "@silentsentinel/core";

const schema = z.object({
  recipientName: z.string().min(2, "Enter recipient name"),
  accountNumber: z.string().transform((v) => v.replace(/\s/g, "")).refine((v) => v.length === 12, STRINGS.en.errors.accountTooShort),
  amount: z.string().refine((v) => parseFloat(v || "0") > 0, STRINGS.en.errors.amountZero),
  pin: z.string().length(4, "Enter 4-digit PIN"),
});

type FormData = z.infer<typeof schema>;

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };
}

export function TransferPage() {
  const navigate = useAppNavigate();
  const {
    sessionId,
    locale,
    currency,
    transferDetails,
    updateTransferDetails,
    updateBiometrics,
    biometrics,
    setRiskScore,
    setRiskTier,
    demoMode,
    pinAttempts,
    incrementPinAttempts,
    resetPinAttempts,
  } = useAppStore();

  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [pinLocked, setPinLocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [riskScore, setLocalRiskScore] = useState(0);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mousePos = useRef<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });
  const mouseVelocities = useRef<number[]>([]);
  const mouseClicks = useRef<number[]>([]);
  const keyTimestamps = useRef<{ down: number; up?: number }[]>([]);
  const warnTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rand = useCallback(() => seededRandom(sessionId)(), [sessionId]);

  useEffect(() => {
    updateBiometrics({
      device: {
        tiltAngle: 10 + rand() * 20,
        shakeIntensity: rand(),
      },
    });
  }, [sessionId, rand, updateBiometrics]);

  const updateProgress = useCallback(() => {
    let p = 0;
    if (transferDetails.recipient.length >= 2) p += 25;
    if (transferDetails.accountNumber.replace(/\s/g, "").length === 12) p += 25;
    if (parseFloat(transferDetails.amount || "0") > 0) p += 25;
    if (pinDigits.every((d) => d !== "")) p += 25;
    setProgress(p);
  }, [transferDetails, pinDigits]);

  useEffect(updateProgress, [transferDetails, pinDigits, updateProgress]);

  const recomputeRisk = useCallback(() => {
    const result = computeRiskScore(biometrics, demoMode);
    setLocalRiskScore(result.score);
    setRiskScore(result.score, result.factors);
    setRiskTier(result.tier);
  }, [biometrics, demoMode, setRiskScore, setRiskTier]);

  useEffect(() => {
    const interval = setInterval(recomputeRisk, 500);
    return () => clearInterval(interval);
  }, [recomputeRisk]);

  const resetIdleTimers = useCallback(() => {
    if (warnTimeout.current) clearTimeout(warnTimeout.current);
    if (hardTimeout.current) clearTimeout(hardTimeout.current);
    warnTimeout.current = setTimeout(() => {
      alert(STRINGS.en.transfer.idleWarning);
    }, SESSION_TIMEOUT_WARN_MS);
    hardTimeout.current = setTimeout(() => {
      navigate("dashboard");
    }, SESSION_TIMEOUT_HARD_MS);
  }, [navigate]);

  useEffect(() => {
    resetIdleTimers();
    const onActivity = () => {
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
      if (hardTimeout.current) clearTimeout(hardTimeout.current);
      resetIdleTimers();
    };
    window.addEventListener("mousedown", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("mousedown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (warnTimeout.current) clearTimeout(warnTimeout.current);
      if (hardTimeout.current) clearTimeout(hardTimeout.current);
    };
  }, [resetIdleTimers]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipientName: transferDetails.recipient,
      accountNumber: transferDetails.accountNumber.replace(/\s/g, ""),
      amount: transferDetails.amount,
      pin: "",
    },
  });

  const recipientName = watch("recipientName");
  const accountNumber = watch("accountNumber");
  const amount = watch("amount");

  useEffect(() => {
    updateTransferDetails({
      recipient: recipientName,
      accountNumber: (accountNumber || "").replace(/\s/g, ""),
      amount: amount || "",
    });
  }, [recipientName, accountNumber, amount, updateTransferDetails]);

  const formatAccountNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleKeyDown = (_i: number, _e?: React.KeyboardEvent<HTMLInputElement>) => {
    const t = Date.now();
    if (keyTimestamps.current.length > 0) {
      const last = keyTimestamps.current[keyTimestamps.current.length - 1];
      const flight = last.up ? t - last.up : 0;
      if (flight > 1000) {
        updateBiometrics({
          keystroke: {
            ...biometrics.keystroke,
            longPauses: biometrics.keystroke.longPauses + 1,
          },
        });
      } else if (last.up) {
        updateBiometrics({
          keystroke: {
            ...biometrics.keystroke,
            flightTimes: [...biometrics.keystroke.flightTimes, flight].slice(-50),
            averageFlight:
              [...biometrics.keystroke.flightTimes, flight].reduce((a, b) => a + b, 0) /
              (biometrics.keystroke.flightTimes.length + 1),
          },
        });
      }
    }
    keyTimestamps.current.push({ down: t });
  };

  const handleKeyUp = (_i: number) => {
    const t = Date.now();
    const last = keyTimestamps.current[keyTimestamps.current.length - 1];
    if (last && !last.up) {
      const dwell = t - last.down;
      last.up = t;
      updateBiometrics({
        keystroke: {
          ...biometrics.keystroke,
          dwellTimes: [...biometrics.keystroke.dwellTimes, dwell].slice(-50),
          averageDwell:
            [...biometrics.keystroke.dwellTimes, dwell].reduce((a, b) => a + b, 0) /
            (biometrics.keystroke.dwellTimes.length + 1),
        },
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const t = Date.now();
    const dx = e.clientX - mousePos.current.x;
    const dy = e.clientY - mousePos.current.y;
    const dt = (t - mousePos.current.t) / 1000 || 0.001;
    const v = Math.sqrt(dx * dx + dy * dy) / dt;
    if (dt < 0.2) mouseVelocities.current.push(v);
    if (mouseVelocities.current.length > 50) mouseVelocities.current.shift();
    const avg =
      mouseVelocities.current.length > 0
        ? mouseVelocities.current.reduce((a, b) => a + b, 0) / mouseVelocities.current.length
        : 0;
    updateBiometrics({
      mouse: {
        ...biometrics.mouse,
        velocities: [...mouseVelocities.current],
        averageVelocity: avg,
      },
    });
    mousePos.current = { x: e.clientX, y: e.clientY, t };
  };

  const handleClick = () => {
    const t = Date.now();
    mouseClicks.current.push(t);
    if (mouseClicks.current.length > 20) mouseClicks.current.shift();
    const intervals =
      mouseClicks.current.length >= 2
        ? mouseClicks.current
            .slice(1)
            .map((c, i) => c - mouseClicks.current[i])
        : [];
    updateBiometrics({
      mouse: {
        ...biometrics.mouse,
        clickCount: biometrics.mouse.clickCount + 1,
        clickIntervals: intervals,
      },
    });
  };

  const allValid =
    transferDetails.recipient.length >= 2 &&
    transferDetails.accountNumber.replace(/\s/g, "").length === 12 &&
    parseFloat(transferDetails.amount || "0") > 0 &&
    pinDigits.every((d) => d !== "") &&
    !pinLocked;

  const onSubmit = (data: FormData) => {
    const pin = data.pin || pinDigits.join("");
    if (pin !== USER_PROFILE.pin) {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
      incrementPinAttempts();
      if (pinAttempts + 1 >= PIN_MAX_ATTEMPTS) {
        setPinLocked(true);
      }
      return;
    }
    setPinError(false);
    resetPinAttempts();
    navigate("assessing");
  };

  const secondaryAmount = (() => {
    const amt = parseFloat(transferDetails.amount || "0");
    if (amt <= 0) return null;
    const rates: Record<string, number> = EXCHANGE_RATES;
    const keys = Object.keys(rates).filter((k) => k !== currency);
    if (keys.length === 0) return null;
    const [code] = keys;
    const rate = rates[code] ?? 1;
    const converted = amt * rate;
    return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(converted);
  })();

  const initials = transferDetails.recipient
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppLayout>
      <div className="relative mx-auto max-w-2xl" onMouseMove={handleMouseMove} onClick={handleClick}>
        <div className="orb -top-20 -right-20 h-[400px] w-[400px]" style={{ background: "var(--teal)", animationDelay: "0s" }} />
        <div className="orb -bottom-20 -left-20 h-[400px] w-[400px]" style={{ background: "var(--purple)", animationDelay: "3s" }} />

        <motion.div
          className="glass-card-bright relative overflow-hidden p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="card-shine" />
          <div className="absolute right-6 top-6 flex flex-col items-center">
            <div
              className="h-24 w-24 rounded-full border-4 border-transparent"
              style={{
                borderTopColor:
                  riskScore <= 35 ? "var(--emerald)" : riskScore <= 75 ? "var(--amber)" : "var(--coral)",
                borderRightColor:
                  riskScore <= 35 ? "var(--emerald)" : riskScore <= 75 ? "var(--amber)" : "var(--coral)",
                transform: `rotate(${-90 + (riskScore / 100) * 270}deg)`,
                transition: "transform 300ms ease, border-color 300ms ease",
              }}
            />
            <p className="mt-2 text-xs text-[var(--text-secondary)]">{STRINGS.en.transfer.riskMonitor}</p>
            <p className="text-sm font-medium">
              {riskScore <= 35 ? "Low Risk" : riskScore <= 75 ? "Elevated" : "High Alert"}
            </p>
          </div>

          <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-[var(--glass-2)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--teal)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 300 }}
            />
          </div>

          <h1 className="mb-6 font-syne text-2xl font-bold">{STRINGS.en.transfer.title}</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative flex items-center gap-3">
              {transferDetails.recipient.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--grad-teal)] font-dm-mono text-sm font-medium text-white"
                >
                  {initials}
                </motion.div>
              )}
              <div className="flex-1">
                <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                  {STRINGS.en.transfer.recipientName}
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="John Doe"
                  {...register("recipientName")}
                  onKeyDown={() => handleKeyDown(-1)}
                  onKeyUp={() => handleKeyUp(-1)}
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-[var(--coral)]">{errors.recipientName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                {STRINGS.en.transfer.accountNumber}
              </label>
              <div className="relative">
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="input-base pr-12"
                      placeholder="0000 0000 0000"
                      maxLength={14}
                      value={formatAccountNumber(field.value || "")}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 12);
                        field.onChange(v);
                      }}
                    />
                  )}
                />
                {transferDetails.accountNumber.replace(/\s/g, "").length === 12 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">🏦</span>
                )}
              </div>
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.accountNumber.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-[var(--text-secondary)]">
                {STRINGS.en.transfer.amount}
              </label>
              <div className="flex items-baseline gap-2">
                <span className="font-dm-mono text-2xl text-[var(--text-secondary)]">
                  {new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(0).replace(/[\d.,\s]/g, "")}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-base flex-1 text-center font-dm-mono text-2xl"
                  placeholder="0.00"
                  {...register("amount")}
                />
              </div>
              {secondaryAmount && (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  ≈ {secondaryAmount}
                </p>
              )}
              {errors.amount && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                {STRINGS.en.transfer.pin}
              </label>
              {pinLocked ? (
                <div className="rounded-xl border border-[var(--coral)]/50 bg-[var(--coral)]/10 p-4 text-[var(--coral)]">
                  {STRINGS.en.transfer.pinLocked}
                </div>
              ) : (
                <motion.div
                  className={`flex gap-2 rounded-xl p-1 ${pinError ? "ring-2 ring-[var(--coral)]" : ""}`}
                  animate={pinError ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      ref={(el) => { pinRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="h-14 w-14 rounded-xl border border-[var(--border)] bg-[var(--glass-1)] text-center font-dm-mono text-xl text-[var(--text-primary)] focus:border-[var(--teal)] focus:outline-none"
                      value={pinDigits[i]}
                      onKeyDown={(e) => {
                        handleKeyDown(i, e);
                        if (e.key === "Backspace" && !pinDigits[i] && i > 0) {
                          pinRefs.current[i - 1]?.focus();
                        }
                      }}
                      onKeyUp={() => handleKeyUp(i)}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                        const next = [...pinDigits];
                        next[i] = v;
                        setPinDigits(next);
                        setValue("pin", next.join(""), { shouldValidate: true });
                        if (v && i < 3) pinRefs.current[i + 1]?.focus();
                      }}
                    />
                  ))}
                </motion.div>
              )}
              {pinAttempts > 0 && !pinLocked && (
                <p className="mt-2 text-sm text-[var(--amber)]">
                  {STRINGS.en.transfer.pinAttemptsRemaining.replace("{count}", String(PIN_MAX_ATTEMPTS - pinAttempts))}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={!allValid}
            >
              {STRINGS.en.transfer.confirmBtn}
            </button>
            <p className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
              <span>🔒</span>
              {STRINGS.en.transfer.trustBadge}
            </p>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          {STRINGS.en.disclaimer}
        </p>
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          {STRINGS.en.privacyFooter}
        </p>
      </div>
    </AppLayout>
  );
}
