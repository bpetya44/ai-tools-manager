"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTool,
  updateTool,
  getToolCategories,
  Category,
} from "@/lib/toolsApi";

export default function EditToolPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toolId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    category_id: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    url: "",
    description: "",
    category_id: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Check if user has permission to edit tools
  const canEdit =
    user?.role?.slug === "admin" || user?.role?.slug === "manager";

  const loadToolAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [toolResponse, categoriesResponse] = await Promise.all([
        getTool(token!, toolId),
        getToolCategories(token!),
      ]);

      const tool = toolResponse.data;
      const toolData = {
        name: tool.name,
        url: tool.url,
        description: tool.description || "",
        category_id: tool.category.id.toString(),
      };

      setFormData(toolData);
      setOriginalData(toolData);
      setCategories(categoriesResponse.data);
    } catch (err: any) {
      console.error("Error loading tool:", err);
      if (err.status === 404) {
        setError("Tool not found");
      } else {
        setError(`Failed to load tool: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [token, toolId]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!canEdit) {
      router.push("/tools");
      return;
    }

    loadToolAndCategories();
  }, [token, canEdit, router, toolId, loadToolAndCategories]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Only validate fields that have been modified and are not empty
    if (formData.name.trim() && formData.name.length > 120) {
      errors.name = "Tool name must be less than 120 characters";
    }

    if (formData.url.trim()) {
      try {
        new URL(formData.url);
      } catch {
        errors.url = "Please enter a valid URL";
      }
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
      setSaving(true);
      setError("");

      // Only send fields that have been modified
      const updateData: any = {};

      if (formData.name.trim() !== originalData.name) {
        updateData.name = formData.name.trim();
      }

      if (formData.url.trim() !== originalData.url) {
        updateData.url = formData.url.trim();
      }

      if (formData.description.trim() !== originalData.description) {
        updateData.description = formData.description.trim() || undefined;
      }

      if (formData.category_id !== originalData.category_id) {
        updateData.category_id = parseInt(formData.category_id);
      }

      // If no fields were changed, show a message and return
      if (Object.keys(updateData).length === 0) {
        setError("No changes detected. Please modify at least one field.");
        return;
      }

      await updateTool(token!, toolId, updateData);

      router.push("/tools");
    } catch (err: any) {
      console.error("Update error:", err);
      if (err.status === 422 && err.data?.details) {
        // Handle validation errors from server
        setValidationErrors(err.data.details);
      } else if (err.status === 404) {
        setError("Tool not found");
      } else {
        setError(err.message || "Failed to update tool");
      }
    } finally {
      setSaving(false);
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

  if (!canEdit) {
    return null; // Will redirect to tools page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (error && error === "Tool not found") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tool Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The tool you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/tools")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Tools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Tool</h1>
            <p className="mt-1 text-sm text-gray-600">
              You can edit any field individually. Only modified fields will be
              updated.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && error !== "Tool not found" && (
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
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
