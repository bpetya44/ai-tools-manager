"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { verify2FA } from "@/lib/twoFactorApi";
import FormField from "./FormField";
import Alert from "./Alert";

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerification({
  onSuccess,
  onCancel,
}: TwoFactorVerificationProps) {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verify2FA(token, code);

      onSuccess();
    } catch (err: any) {
      console.error("2FA verify error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="card-body">
        <h2 className="prose-title text-[var(--text)] mb-4">
          Two-Factor Authentication
        </h2>
        <p className="prose-muted mb-6">
          Enter the verification code from your authenticator app.
        </p>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Verification Code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            disabled={loading}
            hint="Enter the code from your authenticator app"
          />

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-primary flex-1"
              aria-busy={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm prose-muted">
            Lost your device?{" "}
            <button
              type="button"
              className="text-[var(--primary)] hover:text-[var(--primary-600)] underline"
              onClick={() => {
                // TODO: Implement recovery code flow
                alert("Recovery code flow not implemented yet");
              }}
            >
              Use recovery code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
