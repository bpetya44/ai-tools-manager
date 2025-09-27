"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { enable2FA, verify2FA } from "@/lib/twoFactorApi";
import FormField from "./FormField";
import Alert from "./Alert";

interface TwoFactorSetupProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorSetup({
  onSuccess,
  onCancel,
}: TwoFactorSetupProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnable = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await enable2FA(token);

      setQrCodeUrl(response.qr_code_url);
      setSecretKey(response.secret_key);
      setRecoveryCodes(response.recovery_codes);
      setStep("verify");
    } catch (err: any) {
      console.error("2FA enable error:", err);
      setError(err.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verify2FA(token, verificationCode);

      onSuccess();
    } catch (err: any) {
      console.error("2FA verify error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (step === "setup") {
    return (
      <div className="card max-w-md mx-auto">
        <div className="card-body">
          <h2 className="prose-title text-[var(--text)] mb-4">
            Enable Two-Factor Authentication
          </h2>
          <p className="prose-muted mb-6">
            Add an extra layer of security to your account by enabling
            two-factor authentication.
          </p>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <div className="space-y-4">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="btn-primary w-full"
              aria-busy={loading}
            >
              {loading ? "Setting up..." : "Enable 2FA"}
            </button>
            <button
              onClick={onCancel}
              className="btn-outline w-full"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-body">
        <h2 className="prose-title text-[var(--text)] mb-4">Verify Setup</h2>
        <p className="prose-muted mb-6">
          Scan the QR code with your authenticator app and enter the
          verification code.
        </p>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <div className="space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm prose-muted mt-2">
              Scan with Google Authenticator, Authy, or similar app
            </p>
          </div>

          {/* Manual Entry */}
          <div className="bg-[var(--surface)] p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Manual Entry Key:</p>
            <code className="text-xs break-all text-[var(--muted)]">
              {secretKey}
            </code>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <FormField
              label="Verification Code"
              name="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              disabled={loading}
              hint="Enter the code from your authenticator app"
            />

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="btn-primary flex-1"
                aria-busy={loading}
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="btn-outline flex-1"
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>

          {/* Recovery Codes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              Save Your Recovery Codes
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              These codes can be used to access your account if you lose your
              device. Store them in a safe place.
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border">
                  {code}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
