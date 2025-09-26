"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, logout, isLoading } = useAuth();

  // ✅ Avoid hydration mismatch and ensure we react to client auth state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  const roleSlug = user?.role?.slug;
  const canManageTools = roleSlug === "admin" || roleSlug === "manager";

  return (
    <div className="font-sans min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Full Stack App</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Show Tools for any authenticated user */}
                  <Link
                    href="/tools"
                    className="text-indigo-600 hover:text-indigo-500 px-3 py-2 text-sm font-medium"
                  >
                    Tools
                  </Link>

                  <span className="text-gray-700">Welcome, {user.name}!</span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-indigo-600 hover:text-indigo-500 px-4 py-2 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="grid grid-rows-[1fr_20px] items-center justify-items-center min-h-[calc(100vh-4rem)] p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-1 items-center sm:items-start">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

          {user ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                You are successfully logged in as <strong>{user.name}</strong>
              </p>
              <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
                <Link
                  href="/tools"
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                  View Tools
                </Link>

                {canManageTools && (
                  <Link
                    href="/tools/new"
                    className="rounded-full border border-solid border-indigo-600 text-indigo-600 transition-colors flex items-center justify-center hover:bg-indigo-50 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                  >
                    Add Tool
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
                <li className="mb-2 tracking-[-.01em]">
                  Get started by{" "}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    logging in
                  </Link>{" "}
                  or{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    creating an account
                  </Link>
                  .
                </li>
                <li className="tracking-[-.01em]">
                  Your authentication system is ready to use.
                </li>
              </ol>

              <div className="flex gap-4 items-center flex-col sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-indigo-600 text-white gap-2 hover:bg-indigo-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-solid border-indigo-600 text-indigo-600 transition-colors flex items-center justify-center hover:bg-indigo-50 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </main>

        <footer className="row-start-2 flex gap-[24px] flex-wrap items-center justify-center">
          <span className="text-sm text-gray-500">
            Full Stack Starter Kit - Authentication Ready
          </span>
        </footer>
      </div>
    </div>
  );
}
