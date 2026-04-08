import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { api, type ApiError } from "../../lib/api/client";

const schema = z
  .object({
    fullName: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    locale: z.string(),
    currency: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function SignupPage() {
  const navigate = useAppNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      locale: "en-US",
      currency: "USD",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await api.post("/api/auth/signup", {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        locale: data.locale,
        currency: data.currency,
      });
      navigate("auth/otp");
    } catch (err) {
      const e = err as ApiError;
      setError(e.error || STRINGS.en.errors.networkError);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] dot-grid flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--grad-teal)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="font-syne text-2xl font-bold">{STRINGS.en.appName}</h1>
          </div>
          <h2 className="mb-6 font-syne text-lg font-semibold">Create account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm text-[var(--text-secondary)]">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                className="input-base"
                placeholder="Alexandra Reyes"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-[var(--text-secondary)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-base"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm text-[var(--text-secondary)]">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                className="input-base"
                placeholder="+1 234 567 8900"
                {...register("phone")}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-[var(--text-secondary)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-base"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm text-[var(--text-secondary)]">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-base"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-[var(--coral)]">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="locale" className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Locale
                </label>
                <select id="locale" className="input-base" {...register("locale")}>
                  <option value="en-US">English (US)</option>
                  <option value="hi">हिंदी</option>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="currency" className="mb-1 block text-sm text-[var(--text-secondary)]">
                  Currency
                </label>
                <select id="currency" className="input-base" {...register("currency")}>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" {...register("terms")} />
              <span className="text-sm text-[var(--text-secondary)]">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-[var(--coral)]">{errors.terms.message}</p>
            )}
            {error && (
              <div className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/10 px-4 py-3 text-sm text-[var(--coral)]">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <button
              type="button"
              className="text-[var(--teal)] hover:underline"
              onClick={() => navigate("auth/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.disclaimer}
      </p>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.privacyFooter}
      </p>
    </div>
  );
}
