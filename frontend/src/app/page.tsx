"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import LoadingState from "@/components/LoadingState";

export default function Home() {
  const { user, logout, isLoading } = useAuth();

  // ✅ Avoid hydration mismatch and ensure we react to client auth state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }
  const roleSlug = user?.role?.slug;
  const canManageTools = roleSlug === "admin" || roleSlug === "manager";

  return (
    <div className="space-y-8">
      {/* User Actions Bar */}
      {user && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text)]">
                    Welcome back, {user.name}!
                  </h3>
                  <p className="text-sm prose-muted">
                    Role:{" "}
                    <span className="status-success">
                      {user.role?.name || "User"}
                    </span>
                  </p>
                </div>
              </div>
              <button onClick={logout} className="btn-outline btn-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <Image
            className="dark:invert mx-auto"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

          <h1 className="prose-title text-[var(--text)]">AI Tools Manager</h1>
          <p className="prose-muted text-lg max-w-2xl mx-auto">
            A professional tool management system for AI tools and resources.
            Discover, organize, and manage your favorite AI tools in one place.
          </p>
        </div>

        {user ? (
          <div className="space-y-6">
            <div className="card max-w-2xl mx-auto">
              <div className="card-body text-center">
                <h2 className="prose-h2 text-[var(--text)] mb-4">
                  Dashboard Overview
                </h2>
                <p className="prose-muted mb-6">
                  You are successfully logged in and ready to manage your AI
                  tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/tools" className="btn-primary btn-lg hover-lift">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    View Tools
                  </Link>

                  {canManageTools && (
                    <Link
                      href="/tools/new"
                      className="btn-outline btn-lg hover-lift"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Tool
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="card">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[var(--text)] mb-1">
                    Tools Available
                  </h3>
                  <p className="text-sm prose-muted">
                    Browse and discover AI tools
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--success)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[var(--text)] mb-1">
                    Role: {user.role?.name || "User"}
                  </h3>
                  <p className="text-sm prose-muted">
                    {canManageTools ? "Can manage tools" : "View-only access"}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-[var(--warning)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[var(--text)] mb-1">
                    Fast & Secure
                  </h3>
                  <p className="text-sm prose-muted">
                    Built with Next.js & Laravel
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card max-w-2xl mx-auto">
              <div className="card-body text-center">
                <h2 className="prose-h2 text-[var(--text)] mb-4">
                  Get Started
                </h2>
                <p className="prose-muted mb-6">
                  Sign in to access the AI Tools Manager and start organizing
                  your favorite tools.
                </p>

                <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
                  <Link href="/login" className="btn-primary btn-lg">
                    Sign In
                  </Link>
                  <Link href="/signup" className="btn-outline btn-lg">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card">
                <div className="card-body">
                  <h3 className="prose-h2 text-[var(--text)] mb-3">Features</h3>
                  <ul className="space-y-2 text-sm prose-muted">
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-[var(--success)] mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Role-based access control
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-[var(--success)] mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Search and filter tools
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-4 h-4 text-[var(--success)] mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Secure authentication
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h3 className="prose-h2 text-[var(--text)] mb-3">
                    Demo Accounts
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="prose-muted">Admin:</span>
                      <code className="text-xs bg-[var(--surface)] px-2 py-1 rounded">
                        admin@example.com
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="prose-muted">Manager:</span>
                      <code className="text-xs bg-[var(--surface)] px-2 py-1 rounded">
                        manager@example.com
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="prose-muted">User:</span>
                      <code className="text-xs bg-[var(--surface)] px-2 py-1 rounded">
                        user@example.com
                      </code>
                    </div>
                    <p className="text-xs prose-muted mt-2">
                      Password: Password123!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
