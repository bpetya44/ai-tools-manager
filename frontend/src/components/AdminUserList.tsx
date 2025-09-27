"use client";

import React, { useState, useEffect } from "react";
import { apiRequest, apiRequestWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FormField from "./FormField";
import Alert from "./Alert";
import LoadingState from "./LoadingState";

interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  email_verified_at: string | null;
  created_at: string;
  role: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

export default function AdminUserList() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      loadUsers();
      loadRoles();
    }
  }, [token, search, roleFilter, statusFilter, currentPage]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "15",
      });

      if (search) params.append("search", search);
      if (roleFilter) params.append("role_id", roleFilter);
      if (statusFilter !== "") params.append("is_active", statusFilter);

      const response = await apiRequestWithAuth(
        `/admin/users?${params}`,
        token
      );
      setUsers(response.data);
      setTotalPages(response.meta.last_page);
    } catch (err: any) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    if (!token) return;

    try {
      const response = await apiRequestWithAuth("/admin/roles", token);
      setRoles(response.data);
    } catch (err: any) {
      console.error("Failed to load roles:", err);
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    if (!token) return;

    try {
      setUpdating(userId);
      await apiRequestWithAuth(`/admin/users/${userId}/role`, token, {
        method: "PUT",
        body: JSON.stringify({ role_id: newRoleId }),
      });
      loadUsers(); // Reload to get updated data
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusToggle = async (userId: number, newStatus: boolean) => {
    if (!token) return;

    try {
      setUpdating(userId);
      await apiRequestWithAuth(`/admin/users/${userId}/status`, token, {
        method: "PUT",
        body: JSON.stringify({ is_active: newStatus }),
      });
      loadUsers(); // Reload to get updated data
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-body">
          <h2 className="prose-title text-[var(--text)] mb-4">
            User Management
          </h2>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="label">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="role" className="label">
                  Role
                </label>
                <select
                  id="role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="select"
                >
                  <option value="">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="label">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full">
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Users List */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            <LoadingState
              message="Loading users..."
              showSkeleton={true}
              skeletonCount={5}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="card-body text-center py-12">
            <h3 className="prose-h2 text-[var(--text)] mb-2">No users found</h3>
            <p className="prose-muted">Try adjusting your search criteria</p>
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
                    Role
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                    2FA
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-[var(--text)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--surface)]/60">
                    <td className="py-3 px-6">
                      <div>
                        <div className="font-medium text-[var(--text)]">
                          {user.name}
                        </div>
                        <div className="text-sm prose-muted">{user.email}</div>
                        <div className="text-xs prose-muted">
                          Joined{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <select
                        value={user.role.id}
                        onChange={(e) =>
                          handleRoleChange(user.id, parseInt(e.target.value))
                        }
                        disabled={updating === user.id}
                        className="select text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() =>
                          handleStatusToggle(user.id, !user.is_active)
                        }
                        disabled={updating === user.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } disabled:opacity-50`}
                      >
                        {updating === user.id
                          ? "Updating..."
                          : user.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.two_factor_enabled
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.two_factor_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/users/${user.id}`)
                          }
                          className="btn-outline btn-sm"
                        >
                          View
                        </button>
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
      {totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-outline btn-sm disabled"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm prose-muted">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="btn-outline btn-sm disabled"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
