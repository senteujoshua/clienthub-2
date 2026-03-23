"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Lock, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Step = "login" | "mfa";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("login");
  const [factorId, setFactorId] = useState<string>("");
  const [totpCode, setTotpCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // ── Email / password ──────────────────────────────────────────────────────

  async function onSubmit(data: LoginInput) {
    setError(null);
    const supabase = createClient();

    // 1. Try Supabase email/password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    // MFA required
    if (authError?.code === "mfa_required") {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totp = factorsData?.totp?.[0];
      if (totp) {
        setFactorId(totp.id);
        setStep("mfa");
        return;
      }
    }

    if (authData?.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // 2. Fall back to legacy JWT login (for accounts not yet migrated to Supabase)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  // ── MFA verification ──────────────────────────────────────────────────────

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const supabase = createClient();
      const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: totpCode.trim(),
      });
      if (mfaError) {
        setError(mfaError.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEE9DF] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1B2632] mb-4">
            <Building2 className="w-7 h-7 text-[#FFB162]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2632]">ClientHub</h1>
          <p className="text-sm text-[#C9C1B1] mt-1">
            {step === "mfa"
              ? "Two-factor authentication"
              : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#C9C1B1]/30 p-8">
          {/* ── MFA Step ── */}
          {step === "mfa" ? (
            <form onSubmit={handleMfa} className="space-y-5">
              <div className="flex flex-col items-center gap-3 pb-2">
                <div className="w-12 h-12 rounded-full bg-[#FFB162]/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#FFB162]" />
                </div>
                <p className="text-sm text-[#2C3B4D] text-center">
                  Enter the 6-digit code from your authenticator app.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#2C3B4D]">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full h-12 text-center text-2xl tracking-widest rounded-lg border border-[#C9C1B1] bg-white px-3 focus:outline-none focus:ring-2 focus:ring-[#FFB162] focus:border-transparent"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#A35139]">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={verifying}
                className="w-full"
              >
                Verify
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError(null);
                  setTotpCode("");
                }}
                className="w-full text-sm text-[#C9C1B1] hover:text-[#2C3B4D] transition-colors"
              >
                ← Back to login
              </button>
            </form>
          ) : (
            /* ── Login Step ── */
            <div className="space-y-5">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border-2 border-[#C9C1B1] bg-white text-sm font-medium text-[#1B2632] hover:border-[#2C3B4D] hover:bg-[#EEE9DF]/50 transition-colors disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="w-4 h-4 border-2 border-[#C9C1B1] border-t-[#2C3B4D] rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#C9C1B1]/40" />
                <span className="text-xs text-[#C9C1B1]">
                  or sign in with email
                </span>
                <div className="flex-1 h-px bg-[#C9C1B1]/40" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  required
                  {...register("email")}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  required
                  {...register("password")}
                />
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[#A35139]">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  loading={isSubmitting}
                  className="w-full"
                >
                  Sign in
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
