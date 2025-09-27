"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import LoadingState from "@/components/LoadingState";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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

  return <AdminDashboard />;
}
