import React from "react";

interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  skeletonCount?: number;
}

export default function LoadingState({
  message = "Loading...",
  showSkeleton = false,
  skeletonCount = 3,
}: LoadingStateProps) {
  if (showSkeleton) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center space-x-4">
                <div className="skeleton w-12 h-12 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text w-2/3"></div>
                </div>
                <div className="skeleton w-20 h-8 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
        <p className="prose-muted">{message}</p>
      </div>
    </div>
  );
}
