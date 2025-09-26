"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createTool, getToolCategories, Category } from "@/lib/toolsApi";

export default function NewToolPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    category_id: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check if user has permission to create tools
  const canCreate =
    user?.role?.slug === "admin" || user?.role?.slug === "manager";

  const loadCategories = useCallback(async () => {
    try {
      const response = await getToolCategories(token!);
      setCategories(response.data);
    } catch (err) {
      setError("Failed to load categories");
      console.error("Error loading categories:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!canCreate) {
      router.push("/tools");
      return;
    }

    loadCategories();
  }, [token, canCreate, router, loadCategories]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Tool name is required";
    } else if (formData.name.length > 120) {
      errors.name = "Tool name must be less than 120 characters";
    }

    if (!formData.url.trim()) {
      errors.url = "Tool URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        errors.url = "Please enter a valid URL";
      }
    }

    if (!formData.category_id) {
      errors.category_id = "Please select a category";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTool(token!, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        description: formData.description.trim() || undefined,
        category_id: parseInt(formData.category_id),
      });

      router.push("/tools");
    } catch (err: any) {
      if (err.status === 422 && err.data?.details) {
        // Handle validation errors from server
        setValidationErrors(err.data.details);
      } else {
        setError(err.message || "Failed to create tool");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!token) {
    return null; // Will redirect to login
  }

  if (!canCreate) {
    return null; // Will redirect to tools page
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Tool</h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tool Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter tool name"
                maxLength={120}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tool URL *
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.url ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="https://example.com"
                maxLength={255}
              />
              {validationErrors.url && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.url}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category *
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) =>
                  handleInputChange("category_id", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.category_id
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.category_id}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  validationErrors.description
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="Enter tool description (optional)"
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push("/tools")}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Tool"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
