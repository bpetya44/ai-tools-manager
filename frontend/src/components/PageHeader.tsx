import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 text-[var(--muted)] mx-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-[var(--text)] font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="prose-title text-[var(--text)]">{title}</h1>
          {subtitle && <p className="prose-muted mt-2">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
