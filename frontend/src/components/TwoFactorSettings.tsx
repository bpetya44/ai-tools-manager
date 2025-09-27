"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  get2FAStatus,
  disable2FA,
  regenerateRecoveryCodes,
} from "@/lib/twoFactorApi";
import FormField from "./FormField";
import Alert from "./Alert";

interface TwoFactorSettingsProps {
  onStatusChange: (enabled: boolean) => void;
}

export default function TwoFactorSettings({
  onStatusChange,
}: TwoFactorSettingsProps) {
  const { token } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    if (token) {
      loadStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadStatus = async () => {
    if (!token) {
      setError("No authentication token available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await get2FAStatus(token);
      setEnabled(response.enabled);
      onStatusChange(response.enabled);
    } catch (err: any) {
      console.error("2FA status error:", err);
      setError(err.message || "Failed to load 2FA status");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setDisabling(true);
      setError("");

      await disable2FA(token, disableCode);

      setEnabled(false);
      onStatusChange(false);
      setShowDisableForm(false);
      setDisableCode("");
    } catch (err: any) {
      console.error("2FA disable error:", err);
      setError(err.message || "Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await regenerateRecoveryCodes(token);

      // Show recovery codes to user
      alert(
        `New recovery codes:\n\n${response.recovery_codes.join(
          "\n"
        )}\n\nSave these codes in a safe place!`
      );
    } catch (err: any) {
      console.error("2FA regenerate error:", err);
      setError(err.message || "Failed to regenerate recovery codes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-6 bg-[var(--surface)] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[var(--surface)] rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="prose-h2 text-[var(--text)]">
              Two-Factor Authentication
            </h3>
            <p className="prose-muted">
              {enabled
                ? "2FA is currently enabled"
                : "2FA is currently disabled"}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              enabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {!enabled ? (
          <div className="space-y-4">
            <p className="text-sm prose-muted">
              Two-factor authentication adds an extra layer of security to your
              account. When enabled, you'll need to enter a verification code
              from your authenticator app in addition to your password when
              signing in.
            </p>
            <button
              onClick={() => (window.location.href = "/settings/2fa/setup")}
              className="btn-primary"
            >
              Enable 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm prose-muted">
              Your account is protected with two-factor authentication. You can
              disable it or regenerate recovery codes below.
            </p>

            {!showDisableForm ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDisableForm(true)}
                  className="btn-danger"
                >
                  Disable 2FA
                </button>
                <button
                  onClick={handleRegenerateRecoveryCodes}
                  disabled={loading}
                  className="btn-outline"
                >
                  Regenerate Recovery Codes
                </button>
              </div>
            ) : (
              <form onSubmit={handleDisable} className="space-y-4">
                <FormField
                  label="Verification Code"
                  name="disableCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  required
                  disabled={disabling}
                  hint="Enter the code from your authenticator app to disable 2FA"
                />

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={disabling || disableCode.length !== 6}
                    className="btn-danger flex-1"
                    aria-busy={disabling}
                  >
                    {disabling ? "Disabling..." : "Confirm Disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableForm(false);
                      setDisableCode("");
                    }}
                    className="btn-outline flex-1"
                    disabled={disabling}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
