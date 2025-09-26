"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("✅ Login successful, redirecting...");
      login(data.token, data.user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
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

              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full btn-lg"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
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
