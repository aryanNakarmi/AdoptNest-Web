"use client";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/_components/LoginForm";

// ── Mock auth action ──────────────────────────────────────────────────────────
const mockHandleLogin = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: (...args: any[]) => mockHandleLogin(...args),
  handleRegister: jest.fn(),
  handleResetPassword: jest.fn(),
}));

// ── Mock AuthContext ──────────────────────────────────────────────────────────
const mockSetUser = jest.fn();
const mockSetIsAuthenticated = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    setUser: mockSetUser,
    setIsAuthenticated: mockSetIsAuthenticated,
  }),
}));

// ── Router ────────────────────────────────────────────────────────────────────
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// ── alert mock ────────────────────────────────────────────────────────────────
const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

// ─────────────────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Rendering", () => {
    it("renders the heading", () => {
      render(<LoginForm />);
      expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
      expect(screen.getByText("Log in to your account")).toBeInTheDocument();
    });

    it("renders email input", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("renders password input", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders login submit button", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
    });

    it("renders 'Forgot?' link pointing to /request-password-reset", () => {
      render(<LoginForm />);
      expect(screen.getByRole("link", { name: /forgot/i })).toHaveAttribute(
        "href",
        "/request-password-reset"
      );
    });

    it("renders 'Sign Up' link pointing to /register", () => {
      render(<LoginForm />);
      expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
        "href",
        "/register"
      );
    });

    it("renders eye icon button for password toggle", () => {
      render(<LoginForm />);
      expect(screen.getByTestId("icon-eye")).toBeInTheDocument();
    });

    it("password field is type=password by default", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });
  });

  // ── Password Visibility Toggle ─────────────────────────────────────────────

  describe("Password visibility toggle", () => {
    it("toggles password to text when eye icon clicked", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "" }));
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("toggles back to password type on second click", () => {
      render(<LoginForm />);
      const toggleBtn = screen.getByRole("button", { name: "" });
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("shows HiEyeOff icon when password is visible", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "" }));
      expect(screen.getByTestId("icon-eye-off")).toBeInTheDocument();
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  // Exact messages from loginSchema in schema.ts:
  //   email: z.email({ message: "Enter a valid email" })
  //   password: z.string().min(6, { message: "Minimum 6 characters" })

  describe("Form validation", () => {
    it("shows error message for empty email on submit", async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() => {
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      });
    });

    it("shows error message for invalid email format", async () => {
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "notanemail");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() => {
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
      });
    });

    it("shows error message for empty password on submit", async () => {
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() => {
        expect(screen.getByText("Minimum 6 characters")).toBeInTheDocument();
      });
    });
  });

  // ── Submission – success ───────────────────────────────────────────────────

  describe("Form submission – success", () => {
    const fillAndSubmit = async (role: string) => {
      mockHandleLogin.mockResolvedValue({ success: true, data: { role } });
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
    };

    it("calls handleLogin with correct values", async () => {
      mockHandleLogin.mockResolvedValue({ success: true, data: { role: "user" } });
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(mockHandleLogin).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "Secret1",
        })
      );
    });

    it("calls setUser with the response data", async () => {
      await fillAndSubmit("user");
      await waitFor(() =>
        expect(mockSetUser).toHaveBeenCalledWith({ role: "user" })
      );
    });

    it("redirects admin role to /admin", async () => {
      await fillAndSubmit("admin");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    });

    it("redirects user role to /user/dashboard", async () => {
      await fillAndSubmit("user");
      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith("/user/dashboard")
      );
    });

    it("redirects unknown role to /", async () => {
      await fillAndSubmit("manager");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    });

    it("handles role casing (ADMIN → /admin)", async () => {
      await fillAndSubmit("ADMIN");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    });
  });

  // ── Submission – failure ───────────────────────────────────────────────────

  describe("Form submission – failure", () => {
    it("calls alert when login fails", async () => {
      mockHandleLogin.mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "bad@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Wrong1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(alertMock).toHaveBeenCalledWith("Invalid credentials")
      );
    });

    it("does not redirect on failure", async () => {
      mockHandleLogin.mockResolvedValue({ success: false, message: "Oops" });
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "bad@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Wrong1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() => expect(alertMock).toHaveBeenCalled());
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows 'Logging in...' and disables button while submitting", async () => {
      mockHandleLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  describe("Accessibility", () => {
    it("email input has autocomplete=email", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    });

    it("password input has autocomplete=current-password", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "autocomplete",
        "current-password"
      );
    });

    it("toggle button is type=button not type=submit", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: "" })).toHaveAttribute("type", "button");
    });
  });
});