"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import LoadingState from "@/components/LoadingState";
import PageHeader from "@/components/PageHeader";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your account security and preferences"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TwoFactorSettings onStatusChange={setTwoFactorEnabled} />

        <div className="card">
          <div className="card-body">
            <h3 className="prose-h2 text-[var(--text)] mb-4">
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Name</label>
                <p className="text-[var(--text)]">{user.name}</p>
              </div>
              <div>
                <label className="label">Email</label>
                <p className="text-[var(--text)]">{user.email}</p>
              </div>
              <div>
                <label className="label">Role</label>
                <p className="text-[var(--text)]">
                  {user.role?.name || "User"}
                </p>
              </div>
              <div>
                <label className="label">Account Status</label>
                <span className="status-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
