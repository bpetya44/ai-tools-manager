import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "../Header";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: {
    id: 1,
    name: "Admin",
    slug: "admin",
  },
};

const renderWithAuth = (user: any = null) => {
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  return render(
    <AuthProvider>
      <div>
        <Header />
      </div>
    </AuthProvider>
  );
};

describe("Header", () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("renders the header with title link", () => {
    renderWithAuth();

    const titleLink = screen.getByLabelText("Go to home");
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", "/");
    expect(screen.getByText("AI Tools Manager")).toBeInTheDocument();
  });

  it("shows hamburger menu on mobile", () => {
    renderWithAuth();

    const hamburger = screen.getByTestId("hamburger");
    expect(hamburger).toBeInTheDocument();
    expect(hamburger).toHaveAttribute("aria-label", "Open menu");
  });

  it("toggles mobile menu when hamburger is clicked", () => {
    renderWithAuth();

    const hamburger = screen.getByTestId("hamburger");

    // Menu should be closed initially
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(hamburger);
    expect(screen.getByTestId("mobile-drawer")).toBeInTheDocument();
    expect(hamburger).toHaveAttribute("aria-label", "Close menu");

    // Click to close
    fireEvent.click(hamburger);
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
    expect(hamburger).toHaveAttribute("aria-label", "Open menu");
  });

  it("shows navigation links in mobile menu", () => {
    renderWithAuth();

    const hamburger = screen.getByTestId("hamburger");
    fireEvent.click(hamburger);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("closes mobile menu when ESC is pressed", () => {
    renderWithAuth();

    const hamburger = screen.getByTestId("hamburger");
    fireEvent.click(hamburger);

    expect(screen.getByTestId("mobile-drawer")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
  });
});
