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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">Please log in to view tools.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
            {canCreateEdit && (
              <Link
                href="/tools/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Tool
              </Link>
            )}
          </div>

          {/* Search and Filter Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Tools
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <button
                  type="submit"
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tools List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading tools...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No tools found.</p>
              {canCreateEdit && (
                <Link
                  href="/tools/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add the first tool
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tools.map((tool) => (
                <li key={tool.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-600"
                            >
                              {tool.name}
                            </a>
                          </h3>
                          <p className="text-sm text-gray-500">
                            {tool.category.name}
                          </p>
                          {tool.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {tool.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {canCreateEdit && (
                            <Link
                              href={`/tools/${tool.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Edit
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(tool.id, tool.name)}
                              disabled={deletingId === tool.id}
                              className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50"
                            >
                              {deletingId === tool.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Created by {tool.created_by?.name || "Unknown"} on{" "}
                        {new Date(tool.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
