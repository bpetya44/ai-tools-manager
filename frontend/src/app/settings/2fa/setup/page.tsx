"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { enable2FA, verify2FA } from "@/lib/twoFactorApi";
import FormField from "@/components/FormField";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import LoadingState from "@/components/LoadingState";
import QRCode from "qrcode";

export default function TwoFactorSetupPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [verifying, setVerifying] = useState(false);

  const handleEnable2FA = useCallback(async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await enable2FA(token);
      console.log("2FA Enable Response:", response);

      setSecretKey(response.secret_key);
      setRecoveryCodes(response.recovery_codes);

      // Generate QR code on client side
      try {
        // Extract the otpauth URL from the response (it should be in qr_code_url)
        const otpAuthUrl = response.qr_code_url;
        console.log("OTP Auth URL:", otpAuthUrl);

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(otpAuthUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        setQrCodeDataUrl(qrDataUrl);
        console.log("QR code generated successfully");
      } catch (qrError) {
        console.error("Failed to generate QR code:", qrError);
        setError(
          "Failed to generate QR code. Please use the secret key manually."
        );
      }
    } catch (err: unknown) {
      console.error("2FA enable error:", err);
      setError(err instanceof Error ? err.message : "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token && step === "setup") {
      handleEnable2FA();
    }
  }, [token, step, handleEnable2FA]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No authentication token available");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    try {
      setVerifying(true);
      setError("");

      await verify2FA(token, verificationCode);

      // Success - redirect back to settings
      router.push("/settings?2fa=enabled");
    } catch (err: unknown) {
      console.error("2FA verify error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid verification code. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading 2FA setup..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enable Two-Factor Authentication"
        subtitle="Add an extra layer of security to your account"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Settings", href: "/settings" },
          { label: "2FA Setup" },
        ]}
      />

      <div className="max-w-2xl">
        <div className="card">
          <div className="card-body">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {step === "setup" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-8">
                    <LoadingState message="Setting up 2FA..." />
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <h3 className="prose-h2 text-[var(--text)] mb-4">
                        Step 1: Scan QR Code
                      </h3>
                      <p className="prose-muted mb-6">
                        Use your authenticator app to scan this QR code:
                      </p>

                      {qrCodeDataUrl ? (
                        <div className="flex justify-center mb-6">
                          <img
                            src={qrCodeDataUrl}
                            alt="2FA QR Code"
                            className="border border-[var(--border)] rounded-lg p-4 bg-white"
                            onLoad={() => {
                              console.log("QR code image loaded successfully");
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center mb-6">
                          <div className="border border-[var(--border)] rounded-lg p-8 bg-white text-center">
                            <p className="text-sm prose-muted">
                              QR code will appear here
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
                        <p className="text-sm prose-muted mb-2">
                          Or enter this secret key manually:
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono break-all flex-1 bg-white p-3 rounded border border-gray-300 text-gray-900 font-semibold">
                            {secretKey}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(secretKey);
                              alert("Secret key copied to clipboard!");
                            }}
                            className="btn-outline btn-sm"
                            title="Copy secret key"
                          >
                            📋
                          </button>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Save Your Recovery Codes
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          These codes can be used to access your account if you
                          lose your authenticator device:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                          {recoveryCodes.map((code, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded border border-gray-300 text-gray-900 font-semibold text-center"
                            >
                              {code}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-yellow-600">
                            Store these codes in a safe place!
                          </p>
                          <button
                            onClick={() => {
                              const codesText = recoveryCodes.join("\n");
                              navigator.clipboard.writeText(codesText);
                              alert("Recovery codes copied to clipboard!");
                            }}
                            className="btn-outline btn-xs"
                            title="Copy all recovery codes"
                          >
                            📋 Copy All
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => setStep("verify")}
                        className="btn-primary"
                        disabled={loading}
                      >
                        I&apos;ve Added the Account to My Authenticator App
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="prose-h2 text-[var(--text)] mb-4">
                    Step 2: Verify Setup
                  </h3>
                  <p className="prose-muted mb-6">
                    Enter the 6-digit code from your authenticator app to
                    complete the setup:
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  <FormField
                    label="Verification Code"
                    name="verificationCode"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setVerificationCode(value);
                    }}
                    required
                    disabled={verifying}
                    hint="Enter the 6-digit code from your authenticator app"
                  />

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={verifying || verificationCode.length !== 6}
                      className="btn-primary flex-1"
                      aria-busy={verifying}
                    >
                      {verifying ? "Verifying..." : "Complete Setup"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("setup")}
                      className="btn-outline flex-1"
                      disabled={verifying}
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
