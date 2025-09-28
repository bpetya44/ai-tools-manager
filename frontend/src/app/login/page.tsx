"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import FormField from "@/components/FormField";
import PasswordField from "@/components/PasswordField";
import Alert from "@/components/Alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const requestBody = { email, password };

      // If we have a temp token, include it and the 2FA code
      if (tempToken) {
        requestBody.temp_token = tempToken;
        requestBody.two_factor_code = twoFactorCode;
      } else if (requires2FA) {
        requestBody.two_factor_code = twoFactorCode;
      }

      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      // Login successful, redirecting
      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data;

        // Handle 2FA requirement
        if (
          errorData?.code === "two_factor_required" &&
          errorData?.temp_token
        ) {
          setRequires2FA(true);
          setTempToken(errorData.temp_token);
          setError("Please enter your 2FA code to continue.");
          return;
        }

        setError(err.message);
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-header text-center">
            <h2 className="prose-title text-[var(--text)]">
              Sign in to your account
            </h2>
            <p className="prose-muted mt-2">
              Enter your credentials to access the AI Tools Manager
            </p>
          </div>

          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError("")}
                />
              )}

              <FormField
                label="Email address"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                hint="We'll never share your email with anyone else"
              />

              <PasswordField
                label="Password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || requires2FA}
              />

              {requires2FA && (
                <FormField
                  label="Two-Factor Authentication Code"
                  name="two_factor_code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                  hint="Enter the 6-digit code from your authenticator app or recovery code"
                />
              )}

              <div className="flex space-x-3">
                {requires2FA && (
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setTempToken("");
                      setTwoFactorCode("");
                      setError("");
                    }}
                    disabled={loading}
                    className="btn-secondary flex-1 btn-lg"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${
                    requires2FA ? "flex-1" : "w-full"
                  } btn-primary btn-lg`}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {requires2FA ? "Verifying..." : "Signing in..."}
                    </>
                  ) : requires2FA ? (
                    "Verify Code"
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer text-center">
            <span className="prose-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[var(--primary)] hover:text-[var(--primary-600)] font-medium transition-colors"
              >
                Sign up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
