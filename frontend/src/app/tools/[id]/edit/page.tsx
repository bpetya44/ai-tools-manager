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
import FormField from "@/components/FormField";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import LoadingState from "@/components/LoadingState";

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading tool..." />
      </div>
    );
  }

  if (error && error === "Tool not found") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="card-body">
            <h2 className="prose-title text-[var(--text)] mb-4">
              Tool Not Found
            </h2>
            <p className="prose-muted mb-6">
              The tool you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/tools")}
              className="btn-primary"
            >
              Back to Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Tool"
        subtitle="You can edit any field individually. Only modified fields will be updated."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tools", href: "/tools" },
          { label: "Edit Tool" },
        ]}
      />

      <div className="card max-w-2xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && error !== "Tool not found" && (
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
              disabled={saving}
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
              disabled={saving}
              hint="Enter a valid URL starting with http:// or https://"
            />

            <FormField
              label="Category"
              name="category_id"
              type="select"
              value={formData.category_id}
              onChange={(e) => handleInputChange("category_id", e.target.value)}
              error={validationErrors.category_id}
              disabled={saving}
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
              disabled={saving}
              hint={`${formData.description.length}/500 characters`}
              rows={4}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => router.push("/tools")}
                className="btn-outline"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
