"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Focus first link when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  const isAdmin = user?.role?.slug === "admin";

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              aria-label="Go to home"
            >
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AT</span>
              </div>
              <h1 className="text-xl font-semibold text-[var(--text)]">
                AI Tools Manager
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/tools"
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Tools
              </Link>
              <Link
                href="/settings"
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Settings
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Admin
                </Link>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Logout
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              data-testid="hamburger"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6 text-[var(--text)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Slide-over Drawer */}
          <aside
            ref={mobileMenuRef}
            data-testid="mobile-drawer"
            id="mobile-menu"
            className="fixed right-0 top-0 h-full w-80 max-w-sm bg-[var(--card)] border-l border-[var(--border)] transform transition-transform duration-200 ease-out"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  Menu
                </h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5 text-[var(--text)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 space-y-2">
                <Link
                  ref={firstLinkRef}
                  href="/"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tools"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                >
                  Tools
                </Link>
                <Link
                  href="/settings"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                >
                  Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                )}
              </nav>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
