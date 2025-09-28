"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTools,
  getToolCategories,
  deleteTool,
  Tool,
  Category,
} from "@/lib/toolsApi";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import LoadingState from "@/components/LoadingState";
import Alert from "@/components/Alert";

export default function ToolsPage() {
  const { user, token } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Check if user has permission to manage tools
  const canCreateEdit =
    user?.role?.slug === "admin" || user?.role?.slug === "manager";
  const canDelete = user?.role?.slug === "admin";

  // --- define memoized loaders FIRST ---
  const loadCategories = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getToolCategories(token);
      setCategories(response.data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }, [token]);

  const loadTools = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getTools(token!, {
        q: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        page: currentPage,
        per_page: 10,
      });
      setTools(response.data);
      setTotalPages(response.meta.last_page);
    } catch (err) {
      setError("Failed to load tools");
      console.error("Error loading tools:", err);
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, selectedCategory, currentPage]);

  useEffect(() => {
    if (token) {
      loadCategories();
      loadTools();
    }
  }, [token, loadCategories, loadTools]); // depend on token and memoized fns

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setDeletingId(id);
      await deleteTool(token!, id);
      setTools((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete tool");
      console.error("Error deleting tool:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // reset to page 1 and let the effect trigger loadTools with new state
    setCurrentPage(1);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="card-body">
            <h2 className="prose-title text-[var(--text)] mb-4">
              Authentication Required
            </h2>
            <p className="prose-muted mb-6">Please log in to view tools.</p>
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tools"
        subtitle="Manage and discover AI tools"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Tools" }]}
        actions={
          canCreateEdit ? (
            <Link href="/tools/new" className="btn-primary">
              Add Tool
            </Link>
          ) : undefined
        }
      />

      {/* Search and Filter Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="label">
                  Search Tools
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                  className="select"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Tools List */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            <LoadingState
              message="Loading tools..."
              showSkeleton={true}
              skeletonCount={5}
            />
          </div>
        ) : tools.length === 0 ? (
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--muted)]"
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
            <h3 className="prose-h2 text-[var(--text)] mb-2">No tools found</h3>
            <p className="prose-muted mb-6">
              {searchTerm || selectedCategory
                ? "Try adjusting your search criteria"
                : "Get started by adding your first tool"}
            </p>
            {canCreateEdit && (
              <Link href="/tools/new" className="btn-primary">
                Add the first tool
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="px-6 py-4 hover:bg-[var(--surface)]/60 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[var(--text)] mb-1">
                          <Link
                            href={`/tools/${tool.id}`}
                            className="hover:text-[var(--primary)] transition-colors"
                          >
                            {tool.name}
                          </Link>
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="status-success text-xs">
                            {tool.category.name}
                          </span>
                          {tool.avg_rating && (
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= Math.round(tool.avg_rating!)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs prose-muted">
                                {tool.avg_rating.toFixed(1)} (
                                {tool.ratings_count || 0})
                              </span>
                            </div>
                          )}
                        </div>
                        {tool.description && (
                          <p className="prose-muted text-sm mb-2 line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-xs prose-muted">
                            Created by {tool.created_by?.name || "Unknown"} on{" "}
                            {new Date(tool.created_at).toLocaleDateString()}
                          </div>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline btn-xs"
                          >
                            Visit Tool
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {canCreateEdit && (
                          <Link
                            href={`/tools/${tool.id}/edit`}
                            className="btn-outline btn-sm"
                          >
                            Edit
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(tool.id, tool.name)}
                            disabled={deletingId === tool.id}
                            className="btn-danger btn-sm disabled"
                            aria-busy={deletingId === tool.id}
                          >
                            {deletingId === tool.id ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
