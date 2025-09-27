"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequestWithAuth } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import Alert from "@/components/Alert";

interface DashboardStats {
  total_users: number;
  active_users: number;
  pending_tools: number;
  approved_tools: number;
  rejected_tools: number;
  total_tools: number;
  recent_activity: Array<{
    id: number;
    action: string;
    user_name: string;
    model_type: string;
    model_id: number;
    created_at: string;
  }>;
}

interface AdminDashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string;
}

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<AdminDashboardState>({
    stats: null,
    loading: true,
    error: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role?.slug !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!token) return;

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await apiRequestWithAuth("/admin/dashboard", token);

      setState((prev) => ({
        ...prev,
        stats: response.data,
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load dashboard data",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  if (!user || user.role?.slug !== "admin") {
    return <LoadingState message="Checking permissions..." />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "tool_created":
      case "tool_approved":
        return "text-green-600";
      case "tool_rejected":
        return "text-red-600";
      case "user_registered":
        return "text-blue-600";
      case "login_successful":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "tool_created":
        return "🔧";
      case "tool_approved":
        return "✅";
      case "tool_rejected":
        return "❌";
      case "user_registered":
        return "👤";
      case "login_successful":
        return "🔐";
      default:
        return "📝";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="prose-title text-[var(--text)] mb-2">Dashboard</h1>
        <p className="prose-muted">
          Overview of system activity and statistics
        </p>
      </div>

      {state.error && (
        <Alert
          type="error"
          message={state.error}
          onClose={() => setState((prev) => ({ ...prev, error: "" }))}
        />
      )}

      {state.loading ? (
        <LoadingState message="Loading dashboard data..." />
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-[var(--text)]">
                      {state.stats?.total_users || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-[var(--text)]">
                      {state.stats?.active_users || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Pending Tools
                    </p>
                    <p className="text-2xl font-bold text-[var(--text)]">
                      {state.stats?.pending_tools || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">🔧</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Total Tools
                    </p>
                    <p className="text-2xl font-bold text-[var(--text)]">
                      {state.stats?.total_tools || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tool Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h2 className="prose-subtitle text-[var(--text)]">
                  Tool Status Overview
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-[var(--text)]">Approved</span>
                    </div>
                    <span className="font-semibold text-[var(--text)]">
                      {state.stats?.approved_tools || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-[var(--text)]">Pending</span>
                    </div>
                    <span className="font-semibold text-[var(--text)]">
                      {state.stats?.pending_tools || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-[var(--text)]">Rejected</span>
                    </div>
                    <span className="font-semibold text-[var(--text)]">
                      {state.stats?.rejected_tools || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="prose-subtitle text-[var(--text)]">
                  Quick Actions
                </h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <a
                    href="/admin/tools"
                    className="block w-full btn-primary text-center"
                  >
                    Manage Tools
                  </a>
                  <a
                    href="/admin/users"
                    className="block w-full btn-secondary text-center"
                  >
                    Manage Users
                  </a>
                  <a
                    href="/admin/audit-logs"
                    className="block w-full btn-secondary text-center"
                  >
                    View Audit Logs
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h2 className="prose-subtitle text-[var(--text)]">
                Recent Activity
              </h2>
            </div>
            <div className="card-body p-0">
              {state.stats?.recent_activity &&
              state.stats.recent_activity.length > 0 ? (
                <div className="divide-y divide-[var(--border)]">
                  {(state.stats?.recent_activity || []).map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-[var(--muted)]/50"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <span className="text-lg">
                            {getActionIcon(activity.action)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text)]">
                            <span className="font-medium">
                              {activity.user_name}
                            </span>{" "}
                            <span className={getActionColor(activity.action)}>
                              {activity.action.replace(/_/g, " ")}
                            </span>
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {activity.model_type} #{activity.model_id} •{" "}
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="prose-muted">No recent activity to display.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
