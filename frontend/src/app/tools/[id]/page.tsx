"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTool,
  createComment,
  deleteComment,
  createRating,
  deleteRating,
  Tool,
  Comment,
} from "@/lib/toolsApi";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import LoadingState from "@/components/LoadingState";
import Alert from "@/components/Alert";

export default function ToolDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [userRatingId, setUserRatingId] = useState<number | null>(null);

  // Check if user can delete comments
  const canDeleteComment = (comment: Comment) => {
    return (
      comment.user.id === user?.id ||
      user?.role?.slug === "admin" ||
      user?.role?.slug === "manager"
    );
  };

  useEffect(() => {
    if (token && id) {
      loadTool();
    }
  }, [token, id]);

  const loadTool = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getTool(token, Number(id));
      setTool(response.data);
      setUserRating(response.data.user_rating || null);
      setUserRatingId(response.data.user_rating_id || null);
    } catch (err) {
      setError("Failed to load tool");
      console.error("Error loading tool:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !tool || !commentBody.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await createComment(token, tool.id, {
        body: commentBody.trim(),
      });

      // Add the new comment to the tool
      setTool((prev) =>
        prev
          ? {
              ...prev,
              comments: [response.data, ...(prev.comments || [])],
            }
          : null
      );

      setCommentBody("");
    } catch (err) {
      setError("Failed to add comment");
      console.error("Error adding comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await deleteComment(token, commentId);

      // Remove the comment from the tool
      setTool((prev) =>
        prev
          ? {
              ...prev,
              comments: (prev.comments || []).filter((c) => c.id !== commentId),
            }
          : null
      );
    } catch (err) {
      setError("Failed to delete comment");
      console.error("Error deleting comment:", err);
    }
  };

  const handleRatingChange = async (score: number) => {
    if (!token || !tool) return;

    try {
      setSubmittingRating(true);
      const response = await createRating(token, tool.id, { score });

      // Update local state
      setUserRating(score);
      setUserRatingId(response.data.id);

      // Reload tool to get updated ratings
      await loadTool();
    } catch (err) {
      setError("Failed to submit rating");
      console.error("Error submitting rating:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDeleteRating = async () => {
    if (
      !token ||
      !userRatingId ||
      !confirm("Are you sure you want to delete your rating?")
    )
      return;

    try {
      setSubmittingRating(true);
      await deleteRating(token, userRatingId);

      // Update local state
      setUserRating(null);
      setUserRatingId(null);

      // Reload tool to get updated ratings
      await loadTool();
    } catch (err) {
      setError("Failed to delete rating");
      console.error("Error deleting rating:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRatingChange?: (score: number) => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={
              interactive && onRatingChange
                ? () => onRatingChange(star)
                : undefined
            }
            disabled={!interactive || submittingRating}
            className={`w-5 h-5 ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                : "cursor-default"
            }`}
          >
            <svg
              className={`w-full h-full ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full text-center">
          <div className="card-body">
            <h2 className="prose-title text-[var(--text)] mb-4">
              Authentication Required
            </h2>
            <p className="prose-muted mb-6">
              Please log in to view tool details.
            </p>
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading..."
          subtitle=""
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Loading..." },
          ]}
        />
        <div className="card">
          <div className="card-body">
            <LoadingState
              message="Loading tool details..."
              showSkeleton={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tool Not Found"
          subtitle=""
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "Not Found" },
          ]}
        />
        <div className="card">
          <div className="card-body text-center py-12">
            <h3 className="prose-h2 text-[var(--text)] mb-2">Tool not found</h3>
            <p className="prose-muted mb-6">
              The tool you're looking for doesn't exist.
            </p>
            <Link href="/tools" className="btn-primary">
              Back to Tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tool.name}
        subtitle={tool.description || "Tool details"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Tools", href: "/tools" },
          { label: tool.name },
        ]}
        actions={
          <Link href="/tools" className="btn-outline">
            Back to Tools
          </Link>
        }
      />

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Tool Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tool Info */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
                    {tool.name}
                  </h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="status-success text-sm">
                      {tool.category.name}
                    </span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary btn-sm"
                    >
                      Visit Tool
                    </a>
                  </div>
                </div>
              </div>

              {tool.description && (
                <p className="prose-muted mb-4">{tool.description}</p>
              )}

              <div className="text-sm prose-muted">
                Created by {tool.created_by?.name || "Unknown"} on{" "}
                {new Date(tool.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Comments ({tool.comments?.length || 0})
              </h2>

              {/* Add Comment Form */}
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="comment" className="label">
                      Add a comment
                    </label>
                    <textarea
                      id="comment"
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Share your thoughts about this tool..."
                      className="textarea"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="text-xs prose-muted mt-1">
                      {commentBody.length}/1000 characters
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!commentBody.trim() || submittingComment}
                    className="btn-primary disabled"
                  >
                    {submittingComment ? "Adding..." : "Add Comment"}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {tool.comments && tool.comments.length > 0 ? (
                  tool.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border border-[var(--border)] rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-[var(--text)]">
                            {comment.user.name}
                          </span>
                          <span className="text-xs prose-muted">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="prose-muted">{comment.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="prose-muted">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rating Section */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Rate this tool
              </h3>

              {/* User Rating */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="label">Your rating:</label>
                  {userRating && (
                    <button
                      onClick={handleDeleteRating}
                      disabled={submittingRating}
                      className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                    >
                      Delete Rating
                    </button>
                  )}
                </div>
                {renderStars(userRating || 0, true, handleRatingChange)}
                {submittingRating && (
                  <p className="text-sm prose-muted mt-2">
                    {userRating ? "Updating rating..." : "Submitting rating..."}
                  </p>
                )}
              </div>

              {/* Average Rating */}
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[var(--text)]">
                    Average Rating
                  </span>
                  <span className="text-sm prose-muted">
                    {tool.ratings_count || 0} rating
                    {(tool.ratings_count || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(tool.avg_rating || 0)}
                  <span className="text-sm font-medium text-[var(--text)]">
                    {tool.avg_rating
                      ? tool.avg_rating.toFixed(1)
                      : "No ratings"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
