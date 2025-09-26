"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createTool, getToolCategories, Category } from "@/lib/toolsApi";
import FormField from "@/components/FormField";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import LoadingState from "@/components/LoadingState";

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
    <div className="space-y-6">
      <PageHeader
        title="Add New Tool"
        subtitle="Create a new AI tool entry"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tools", href: "/tools" },
          { label: "Add New Tool" },
        ]}
      />

      <div className="card max-w-2xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <FormField
              label="Tool Name"
              name="name"
              type="text"
              placeholder="Enter tool name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={validationErrors.name}
              required
              disabled={loading}
              hint="Maximum 120 characters"
            />

            <FormField
              label="Tool URL"
              name="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              error={validationErrors.url}
              required
              disabled={loading}
              hint="Enter a valid URL starting with http:// or https://"
            />

            <FormField
              label="Category"
              name="category_id"
              type="select"
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              error={validationErrors.category_id}
              required
              disabled={loading}
              options={categories.map((cat) => ({
                value: cat.id.toString(),
                label: cat.name,
              }))}
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Enter tool description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={validationErrors.description}
              disabled={loading}
              hint={`${formData.description.length}/500 characters`}
              rows={4}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => router.push("/tools")}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Tool"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
