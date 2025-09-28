import { render, screen, fireEvent } from "@testing-library/react";
import PasswordField from "../PasswordField";

const defaultProps = {
  label: "Password",
  name: "password",
  value: "testpassword",
  onChange: jest.fn(),
};

describe("PasswordField", () => {
  it("renders password field with correct attributes", () => {
    render(<PasswordField {...defaultProps} />);

    const input = screen.getByLabelText("Password");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveValue("testpassword");
  });

  it("toggles password visibility when button is clicked", () => {
    render(<PasswordField {...defaultProps} />);

    const input = screen.getByLabelText("Password");
    const toggleButton = screen.getByLabelText("Show password");

    // Initially password should be hidden
    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveAttribute("aria-pressed", "true");
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("shows error message when provided", () => {
    render(<PasswordField {...defaultProps} error="Password is required" />);

    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toHaveAttribute(
      "role",
      "alert"
    );
  });

  it("shows hint message when provided", () => {
    render(
      <PasswordField {...defaultProps} hint="Must be at least 8 characters" />
    );

    expect(
      screen.getByText("Must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("applies required indicator when required", () => {
    render(<PasswordField {...defaultProps} required />);

    const input = screen.getByLabelText("Password");
    expect(input).toBeRequired();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("disables input and button when disabled", () => {
    render(<PasswordField {...defaultProps} disabled />);

    const input = screen.getByLabelText("Password");
    const toggleButton = screen.getByLabelText("Show password");

    expect(input).toBeDisabled();
    expect(toggleButton).toBeDisabled();
  });

  it("calls onChange when input value changes", () => {
    const mockOnChange = jest.fn();
    render(<PasswordField {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByLabelText("Password");
    fireEvent.change(input, { target: { value: "newpassword" } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
