import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/appStore";
import { useAppNavigate } from "../../lib/useAppNavigate";
import { STRINGS } from "../../lib/i18n";
import { api, type ApiError } from "../../lib/api/client";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useAppNavigate();

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await api.post<{ user: { id: string } }>(
        "/api/auth/login",
        data
      );
      setAuthenticated(res.user.id);
      navigate("dashboard");
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
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="glass-card p-8">
          <div className="mb-8 flex items-center gap-3">
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
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="font-syne text-2xl font-bold">
              {STRINGS.en.appName}
            </h1>
          </div>

          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            {STRINGS.en.tagline}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-base"
                placeholder="you@example.com"
                {...register("email")}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-[var(--coral)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-base"
                placeholder="••••••••"
                {...register("password")}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-[var(--coral)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <a
              href="#"
              className="block text-right text-sm text-[var(--teal)] hover:underline"
            >
              Forgot password?
            </a>

            {error && (
              <div
                className="rounded-lg border border-[var(--coral)]/30 bg-[var(--coral)]/10 px-4 py-3 text-sm text-[var(--coral)]"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                className="btn-ghost flex-1"
                disabled
                aria-label="Sign in with Google (coming soon)"
              >
                Google
              </button>
              <button
                type="button"
                className="btn-ghost flex-1"
                disabled
                aria-label="Sign in with Apple (coming soon)"
              >
                Apple
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-[var(--teal)] hover:underline"
              onClick={() => navigate("auth/signup")}
            >
              Sign up
            </button>
          </p>
        </div>
      </motion.div>

      <p className="mt-6 max-w-md text-center text-xs text-[var(--text-muted)]">
        Prototype: use demo@test.com / any password 8+ chars to sign in
      </p>
      <p className="mt-4 max-w-md text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.disclaimer}
      </p>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        {STRINGS.en.privacyFooter}
      </p>
    </div>
  );
}
