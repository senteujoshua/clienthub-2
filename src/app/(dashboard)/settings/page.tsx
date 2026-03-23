"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type MfaStatus = "loading" | "disabled" | "enabled";

interface EnrollState {
  factorId: string;
  qrCode: string;
  secret: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>("loading");
  const [enrollData, setEnrollData] = useState<EnrollState | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    checkMfaStatus();
  }, []);

  async function checkMfaStatus() {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const active = data?.totp?.find((f) => f.status === "verified");
    setMfaStatus(active ? "enabled" : "disabled");
  }

  async function startEnroll() {
    setWorking(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "ClientHub",
      });
      if (error) throw error;
      setEnrollData({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
    } catch (err) {
      toast({
        type: "error",
        title: err instanceof Error ? err.message : "Failed to start 2FA setup",
      });
    } finally {
      setWorking(false);
    }
  }

  async function verifyAndActivate() {
    if (!enrollData) return;
    setWorking(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrollData.factorId,
        code: totpCode.trim(),
      });
      if (error) throw error;
      setEnrollData(null);
      setTotpCode("");
      setMfaStatus("enabled");
      toast({ type: "success", title: "Two-factor authentication enabled" });
    } catch {
      toast({ type: "error", title: "Invalid code — please try again" });
    } finally {
      setWorking(false);
    }
  }

  async function disableMfa() {
    setWorking(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp?.[0];
      if (factor) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setMfaStatus("disabled");
      toast({ type: "success", title: "Two-factor authentication disabled" });
    } catch {
      toast({ type: "error", title: "Failed to disable 2FA" });
    } finally {
      setWorking(false);
    }
  }

  function copySecret() {
    if (!enrollData) return;
    navigator.clipboard.writeText(enrollData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2632]">Security Settings</h1>
        <p className="text-sm text-[#C9C1B1] mt-0.5">
          Manage two-factor authentication and account security.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaStatus === "loading" && (
            <div className="h-8 bg-[#C9C1B1]/20 rounded animate-pulse w-48" />
          )}

          {/* ── Enabled state ── */}
          {mfaStatus === "enabled" && !enrollData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    2FA is enabled
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Your account is protected with an authenticator app.
                  </p>
                </div>
              </div>
              <Button
                variant="danger-outline"
                size="sm"
                loading={working}
                onClick={disableMfa}
              >
                <ShieldOff className="w-4 h-4" />
                Disable 2FA
              </Button>
            </div>
          )}

          {/* ── Disabled state ── */}
          {mfaStatus === "disabled" && !enrollData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#EEE9DF] border border-[#C9C1B1]/40 rounded-xl">
                <ShieldOff className="w-5 h-5 text-[#C9C1B1] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#2C3B4D]">
                    2FA is not enabled
                  </p>
                  <p className="text-xs text-[#C9C1B1] mt-0.5">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <Button size="sm" loading={working} onClick={startEnroll}>
                <ShieldCheck className="w-4 h-4" />
                Enable 2FA
              </Button>
            </div>
          )}

          {/* ── Enrollment flow ── */}
          {enrollData && (
            <div className="space-y-5">
              <p className="text-sm text-[#2C3B4D]">
                Scan the QR code below with your authenticator app (Google
                Authenticator, Authy, etc.), then enter the 6-digit code to
                confirm.
              </p>

              {/* QR Code */}
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollData.qrCode}
                  alt="2FA QR Code"
                  className="w-44 h-44 border-4 border-white rounded-xl shadow"
                />
              </div>

              {/* Manual secret */}
              <div className="flex items-center gap-2 p-3 bg-[#EEE9DF] rounded-xl">
                <code className="flex-1 text-xs text-[#2C3B4D] break-all font-mono">
                  {enrollData.secret}
                </code>
                <button
                  onClick={copySecret}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-[#C9C1B1]/20 transition-colors text-[#2C3B4D]"
                  title="Copy secret"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* TOTP input */}
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

              <div className="flex gap-3">
                <Button
                  loading={working}
                  onClick={verifyAndActivate}
                  disabled={totpCode.length < 6}
                >
                  Activate 2FA
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnrollData(null);
                    setTotpCode("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
