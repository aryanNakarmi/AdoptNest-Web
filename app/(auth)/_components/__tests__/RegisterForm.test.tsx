"use client";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

// ── Mock auth action ──────────────────────────────────────────────────────────
const mockHandleRegister = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: jest.fn(),
  handleRegister: (...args: any[]) => mockHandleRegister(...args),
  handleResetPassword: jest.fn(),
}));

// ── Router helpers ────────────────────────────────────────────────────────────
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // helper: fill all required fields
  const fillForm = async ({
    fullName = "John Doe",
    email = "john@example.com",
    phoneNumber = "+9771234567890",
    password = "Secret1",
    confirmPassword = "Secret1",
  } = {}) => {
    if (fullName) await userEvent.type(screen.getByLabelText("Full Name"), fullName);
    if (email) await userEvent.type(screen.getByLabelText("Email Address"), email);
    if (phoneNumber) await userEvent.type(screen.getByLabelText("Phone Number"), phoneNumber);

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    if (password) await userEvent.type(passwordInputs[0], password);
    if (confirmPassword) await userEvent.type(passwordInputs[1], confirmPassword);
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Rendering", () => {
    it("renders the heading", () => {
      render(<RegisterForm />);
      expect(screen.getByText("Create an Account")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      render(<RegisterForm />);
      expect(
        screen.getByText(/join our family/i)
      ).toBeInTheDocument();
    });

    it("renders Full Name input", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    });

    it("renders Email Address input", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    });

    it("renders Phone Number input", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
    });

    it("renders two password fields", () => {
      render(<RegisterForm />);
      expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
    });

    it("renders Register submit button", () => {
      render(<RegisterForm />);
      expect(
        screen.getByRole("button", { name: /^register$/i })
      ).toBeInTheDocument();
    });

    it("renders Login link pointing to /login", () => {
      render(<RegisterForm />);
      expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
        "href",
        "/login"
      );
    });

    it("password fields are type=password by default", () => {
      render(<RegisterForm />);
      const inputs = screen.getAllByPlaceholderText("••••••••");
      inputs.forEach((input) =>
        expect(input).toHaveAttribute("type", "password")
      );
    });
  });

  // ── Password Visibility Toggle ─────────────────────────────────────────────

  describe("Password visibility toggles", () => {
    it("toggles first password field to text", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      const inputs = screen.getAllByPlaceholderText("••••••••");
      expect(inputs[0]).toHaveAttribute("type", "text");
    });

    it("toggles second (confirm) password field to text", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[1]);
      const inputs = screen.getAllByPlaceholderText("••••••••");
      expect(inputs[1]).toHaveAttribute("type", "text");
    });

    it("toggles first password back to password on second click", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      fireEvent.click(toggleBtns[0]);
      const inputs = screen.getAllByPlaceholderText("••••••••");
      expect(inputs[0]).toHaveAttribute("type", "password");
    });

    it("shows HiEyeOff icon after toggling password visible", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      expect(screen.getAllByTestId("icon-eye-off")[0]).toBeInTheDocument();
    });

    it("toggling one field does not affect the other", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]); // only toggle first
      const inputs = screen.getAllByPlaceholderText("••••••••");
      expect(inputs[1]).toHaveAttribute("type", "password");
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  describe("Form validation", () => {
    it("shows error when full name is empty", async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when email is invalid", async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText("Full Name"), "John Doe");
      await userEvent.type(screen.getByLabelText("Email Address"), "bademail");
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it("shows error when passwords do not match", async () => {
      render(<RegisterForm />);
      await fillForm({ confirmPassword: "Different1" });
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/passwords do not match/i)
        ).toBeInTheDocument();
      });
    });

    it("shows error when password is too short", async () => {
      render(<RegisterForm />);
      await fillForm({ password: "Sh1", confirmPassword: "Sh1" });
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Submission – success ───────────────────────────────────────────────────

  describe("Form submission – success", () => {
    it("calls handleRegister with correct values", async () => {
      mockHandleRegister.mockResolvedValue({ success: true });
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(mockHandleRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: "John Doe",
            email: "john@example.com",
          })
        )
      );
    });

    it("redirects to /login on success", async () => {
      mockHandleRegister.mockResolvedValue({ success: true });
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"));
    });
  });

  // ── Submission – failure ───────────────────────────────────────────────────

  describe("Form submission – failure", () => {
    it("shows error message when registration fails", async () => {
      mockHandleRegister.mockResolvedValue({
        success: false,
        message: "Email already registered",
      });
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/email already registered/i)
        ).toBeInTheDocument()
      );
    });

    it("shows error message when handleRegister throws", async () => {
      mockHandleRegister.mockRejectedValue(new Error("Network error"));
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      );
    });

    it("does not redirect on failure", async () => {
      mockHandleRegister.mockResolvedValue({
        success: false,
        message: "Error",
      });
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows 'Creating account...' while submitting", async () => {
      mockHandleRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      expect(
        screen.getByRole("button", { name: /creating account/i })
      ).toBeDisabled();
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────────

  describe("Accessibility", () => {
    it("email input has autocomplete=email", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("Email Address")).toHaveAttribute(
        "autocomplete",
        "email"
      );
    });

    it("full name has autocomplete=name", () => {
      render(<RegisterForm />);
      expect(screen.getByLabelText("Full Name")).toHaveAttribute(
        "autocomplete",
        "name"
      );
    });

    it("toggle buttons are type=button", () => {
      render(<RegisterForm />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      toggleBtns.forEach((btn) =>
        expect(btn).toHaveAttribute("type", "button")
      );
    });
  });
});