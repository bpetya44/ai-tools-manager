"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequestWithAuth } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";

interface AuditLog {
  id: number;
  action: string;
  model_type: string;
  model_id: number;
  payload: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface AuditLogsState {
  logs: AuditLog[];
  loading: boolean;
  error: string;
  filters: {
    action: string;
    model_type: string;
    user_id: string;
    date_from: string;
    date_to: string;
  };
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export default function AuditLogsPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<AuditLogsState>({
    logs: [],
    loading: true,
    error: "",
    filters: {
      action: "",
      model_type: "",
      user_id: "",
      date_from: "",
      date_to: "",
    },
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role?.slug !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  const loadAuditLogs = async () => {
    if (!token) return;

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        per_page: state.pagination.perPage.toString(),
      });

      Object.entries(state.filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await apiRequestWithAuth(
        `/admin/audit-logs?${params}`,
        token
      );

      setState((prev) => ({
        ...prev,
        logs: response.data || [],
        pagination: {
          ...prev.pagination,
          total: response.meta?.total || 0,
        },
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load audit logs",
        loading: false,
      }));
    }
  };

  const handleFilterChange = (
    key: keyof typeof state.filters,
    value: string
  ) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
      pagination: {
        ...prev.pagination,
        page: 1, // Reset to first page
      },
    }));
  };

  const handlePageChange = (page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page,
      },
    }));
  };

  useEffect(() => {
    loadAuditLogs();
  }, [state.filters, state.pagination.page, state.pagination.perPage]);

  if (!user || user.role?.slug !== "admin") {
    return <LoadingState message="Checking permissions..." />;
  }

  const getActionBadge = (action: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    if (
      action.includes("created") ||
      action.includes("approved") ||
      action.includes("successful")
    ) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (
      action.includes("deleted") ||
      action.includes("rejected") ||
      action.includes("failed")
    ) {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else if (action.includes("updated") || action.includes("changed")) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPayload = (payload: Record<string, any>) => {
    if (!payload || Object.keys(payload).length === 0) {
      return "No additional data";
    }

    return Object.entries(payload)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`
      )
      .join(", ");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="prose-title text-[var(--text)] mb-2">Audit Logs</h1>
        <p className="prose-muted">Track all system activities and changes</p>
      </div>

      {state.error && (
        <Alert
          type="error"
          message={state.error}
          onClose={() => setState((prev) => ({ ...prev, error: "" }))}
        />
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="prose-subtitle text-[var(--text)]">Filters</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <FormField
              label="Action"
              name="action"
              type="text"
              placeholder="e.g., tool_created"
              value={state.filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
            />

            <FormField
              label="Model Type"
              name="model_type"
              type="text"
              placeholder="e.g., App\Models\ToolsTool"
              value={state.filters.model_type}
              onChange={(e) => handleFilterChange("model_type", e.target.value)}
            />

            <FormField
              label="User ID"
              name="user_id"
              type="text"
              placeholder="User ID"
              value={state.filters.user_id}
              onChange={(e) => handleFilterChange("user_id", e.target.value)}
            />

            <FormField
              label="Date From"
              name="date_from"
              type="date"
              value={state.filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />

            <FormField
              label="Date To"
              name="date_to"
              type="date"
              value={state.filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  filters: {
                    action: "",
                    model_type: "",
                    user_id: "",
                    date_from: "",
                    date_to: "",
                  },
                  pagination: { ...prev.pagination, page: 1 },
                }));
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="card">
        <div className="card-header">
          <h2 className="prose-subtitle text-[var(--text)]">
            Audit Logs ({state.pagination.total})
          </h2>
        </div>

        <div className="card-body p-0">
          {state.loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
              <p className="prose-muted">Loading audit logs...</p>
            </div>
          ) : (state.logs || []).length === 0 ? (
            <div className="p-6 text-center">
              <p className="prose-muted">
                No audit logs found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      User
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Action
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Model
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Details
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      IP Address
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {(state.logs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--muted)]/50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-[var(--text)]">
                            {log.user?.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            {log.user?.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getActionBadge(log.action)}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-[var(--text)]">
                            {log.model_type?.split("\\").pop() || "Unknown"}
                          </div>
                          <div className="text-sm text-[var(--muted)]">
                            ID: {log.model_id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <p className="text-sm text-[var(--text)] truncate">
                            {formatPayload(log.payload)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--muted)]">
                        {log.ip_address}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--muted)]">
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {state.pagination.total > state.pagination.perPage && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--muted)]">
                Showing{" "}
                {(state.pagination.page - 1) * state.pagination.perPage + 1} to{" "}
                {Math.min(
                  state.pagination.page * state.pagination.perPage,
                  state.pagination.total
                )}{" "}
                of {state.pagination.total} results
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(state.pagination.page - 1)}
                  disabled={state.pagination.page <= 1}
                  className="btn-sm btn-secondary"
                >
                  Previous
                </button>

                <span className="px-3 py-1 text-sm text-[var(--text)]">
                  Page {state.pagination.page} of{" "}
                  {Math.ceil(state.pagination.total / state.pagination.perPage)}
                </span>

                <button
                  onClick={() => handlePageChange(state.pagination.page + 1)}
                  disabled={
                    state.pagination.page >=
                    Math.ceil(state.pagination.total / state.pagination.perPage)
                  }
                  className="btn-sm btn-secondary"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
