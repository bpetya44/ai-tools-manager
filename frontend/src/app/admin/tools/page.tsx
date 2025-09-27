"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequestWithAuth } from "@/lib/api";
import LoadingState from "@/components/LoadingState";
import Alert from "@/components/Alert";
import FormField from "@/components/FormField";

interface Tool {
  id: number;
  name: string;
  description: string;
  url: string;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  approved_by: number | null;
  approver?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
  };
}

interface AdminToolsPageState {
  tools: Tool[];
  loading: boolean;
  error: string;
  filters: {
    status: string;
    search: string;
  };
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}

export default function AdminToolsPage() {
  const { user, token } = useAuth();
  const [state, setState] = useState<AdminToolsPageState>({
    tools: [],
    loading: true,
    error: "",
    filters: {
      status: "",
      search: "",
    },
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role?.slug !== "admin") {
      window.location.href = "/";
    }
  }, [user]);

  const loadTools = async () => {
    if (!token) return;

    setState((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        per_page: state.pagination.perPage.toString(),
      });

      if (state.filters.status) {
        params.append("status", state.filters.status);
      }

      if (state.filters.search) {
        params.append("search", state.filters.search);
      }

      const response = await apiRequestWithAuth(
        `/admin/tools?${params}`,
        token
      );

      setState((prev) => ({
        ...prev,
        tools: response.data || [],
        pagination: {
          ...prev.pagination,
          total: response.meta?.total || 0,
        },
        loading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to load tools",
        loading: false,
      }));
    }
  };

  const handleApprove = async (toolId: number) => {
    if (!token) return;

    try {
      await apiRequestWithAuth(`/tools/${toolId}/approve`, token, {
        method: "POST",
      });

      await loadTools();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to approve tool",
      }));
    }
  };

  const handleReject = async (toolId: number) => {
    if (!token) return;

    try {
      await apiRequestWithAuth(`/tools/${toolId}/reject`, token, {
        method: "POST",
      });

      await loadTools();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to reject tool",
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
    loadTools();
  }, [state.filters, state.pagination.page, state.pagination.perPage]);

  if (!user || user.role?.slug !== "admin") {
    return <LoadingState message="Checking permissions..." />;
  }

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pending":
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="prose-title text-[var(--text)] mb-2">Tool Management</h1>
        <p className="prose-muted">
          Review and manage tool submissions from users
        </p>
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
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Search"
              name="search"
              type="text"
              placeholder="Search by name or description..."
              value={state.filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Status
              </label>
              <select
                value={state.filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    filters: { status: "", search: "" },
                    pagination: { ...prev.pagination, page: 1 },
                  }));
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="card">
        <div className="card-header">
          <h2 className="prose-subtitle text-[var(--text)]">
            Tools ({state.pagination.total})
          </h2>
        </div>

        <div className="card-body p-0">
          {state.loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
              <p className="prose-muted">Loading tools...</p>
            </div>
          ) : (state.tools || []).length === 0 ? (
            <div className="p-6 text-center">
              <p className="prose-muted">
                No tools found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Tool
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Categories
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Submitted
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                      Approved By
                    </th>
                    <th className="text-center py-3 px-6 font-medium text-[var(--text)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {(state.tools || []).map((tool) => (
                    <tr key={tool.id} className="hover:bg-[var(--muted)]/50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-[var(--text)]">
                            {tool.name}
                          </div>
                          <div className="text-sm text-[var(--muted)] mt-1">
                            {tool.description}
                          </div>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--primary)] hover:text-[var(--primary-600)] mt-1 inline-block"
                          >
                            {tool.url}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getStatusBadge(tool.status)}>
                          {tool.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {tool.category ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                              {tool.category.name}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--muted)]">
                              No category
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--muted)]">
                        {formatDate(tool.created_at)}
                      </td>
                      <td className="py-4 px-6 text-sm text-[var(--muted)]">
                        {tool.approver ? (
                          <div>
                            <div className="font-medium text-[var(--text)]">
                              {tool.approver.name}
                            </div>
                            <div className="text-xs">
                              {formatDate(tool.approved_at || "")}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center space-x-2">
                          {tool.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(tool.id)}
                                className="btn-sm btn-success"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(tool.id)}
                                className="btn-sm btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {tool.status === "approved" && (
                            <button
                              onClick={() => handleReject(tool.id)}
                              className="btn-sm btn-danger"
                            >
                              Reject
                            </button>
                          )}
                          {tool.status === "rejected" && (
                            <button
                              onClick={() => handleApprove(tool.id)}
                              className="btn-sm btn-success"
                            >
                              Approve
                            </button>
                          )}
                        </div>
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
