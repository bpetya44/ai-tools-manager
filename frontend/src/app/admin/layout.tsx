"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import LoadingState from "@/components/LoadingState";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role?.slug !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading admin panel..." />
      </div>
    );
  }

  if (!user || user.role?.slug !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="card-body">
            <h2 className="prose-title text-[var(--text)] mb-4">
              Access Denied
            </h2>
            <p className="prose-muted mb-6">
              You need admin privileges to access this page.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: "📊",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: "👥",
    },
    {
      name: "Tools",
      href: "/admin/tools",
      icon: "🔧",
    },
    {
      name: "Audit Logs",
      href: "/admin/audit-logs",
      icon: "📝",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Admin Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚙️</span>
              </div>
              <h1 className="prose-title text-[var(--text)]">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--muted)]">
                Welcome, {user.name}
              </span>
              <Link
                href="/"
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Admin Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-[var(--muted)]/20 p-1 rounded-lg">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--background)] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/30"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
