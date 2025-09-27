import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tools Manager",
  description:
    "A professional tool management system for AI tools and resources",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${jetBrainsMono.variable} antialiased min-h-screen`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-[var(--border)] bg-[var(--card)]">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AT</span>
                    </div>
                    <h1 className="prose-title text-[var(--text)]">
                      AI Tools Manager
                    </h1>
                  </div>
                  <nav className="hidden md:flex items-center space-x-6">
                    <a
                      href="/"
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/tools"
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Tools
                    </a>
                    <a
                      href="/settings"
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Settings
                    </a>
                    <a
                      href="/admin"
                      className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      Admin
                    </a>
                  </nav>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--border)] bg-[var(--card)]">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <p className="text-[var(--muted)] text-sm text-center">
                  © 2024 AI Tools Manager. Built with Next.js & Laravel.
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
