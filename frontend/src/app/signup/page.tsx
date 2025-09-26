"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import FormField from "@/components/FormField";
import Alert from "@/components/Alert";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      console.log("✅ Signup successful, redirecting...");
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
              Create your account
            </h2>
            <p className="prose-muted mt-2">
              Join the AI Tools Manager community
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
                label="Full name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />

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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                hint="Must be at least 8 characters long"
              />

              <FormField
                label="Confirm password"
                name="password_confirmation"
                type="password"
                placeholder="Confirm your password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                disabled={loading}
                error={
                  password !== passwordConfirmation && passwordConfirmation
                    ? "Passwords do not match"
                    : undefined
                }
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
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          </div>

          <div className="card-footer text-center">
            <span className="prose-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:text-[var(--primary-600)] font-medium transition-colors"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
