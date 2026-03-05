"use client";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import ResetPasswordForm from "@/app/(auth)/_components/ResetPasswordForm";

// ── Mock auth action ──────────────────────────────────────────────────────────
const mockHandleResetPassword = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: jest.fn(),
  handleRegister: jest.fn(),
  handleResetPassword: (...args: any[]) => mockHandleResetPassword(...args),
}));

// ── Router ────────────────────────────────────────────────────────────────────
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// ── Timer helpers ─────────────────────────────────────────────────────────────
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// ─────────────────────────────────────────────────────────────────────────────

const VALID_TOKEN = "valid-reset-token-123";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // helper
  const fillAndSubmit = async (
    password = "NewPass1",
    confirm = "NewPass1",
    token = VALID_TOKEN
  ) => {
    render(<ResetPasswordForm token={token} />);
    await userEvent.type(
      screen.getByLabelText("New Password"),
      password
    );
    await userEvent.type(
      screen.getByLabelText("Confirm Password"),
      confirm
    );
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  };

  // ── No-token guard ─────────────────────────────────────────────────────────

  describe("When token is empty/missing", () => {
    it("renders invalid reset link heading", () => {
      render(<ResetPasswordForm token="" />);
      expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
    });

    it("renders 'Request New Reset Link' button", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.getByRole("link", { name: /request new reset link/i })
      ).toBeInTheDocument();
    });

    it("renders 'Back to Login' link", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.getByRole("link", { name: /back to login/i })
      ).toBeInTheDocument();
    });

    it("does NOT render the form", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.queryByRole("button", { name: /reset password/i })
      ).not.toBeInTheDocument();
    });
  });

  // ── Rendering (with valid token) ───────────────────────────────────────────

  describe("Rendering with valid token", () => {
    it("renders Create New Password heading", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByText("Create New Password")).toBeInTheDocument();
    });

    it("renders New Password label", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    });

    it("renders Confirm Password label", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    });

    it("renders Reset Password submit button", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(
        screen.getByRole("button", { name: /reset password/i })
      ).toBeInTheDocument();
    });

    it("renders password requirements list", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
    });

    it("renders Back to Login link", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const links = screen.getAllByRole("link", { name: /back to login/i });
      expect(links.length).toBeGreaterThan(0);
    });

    it("renders 'Request another reset email' link", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(
        screen.getByRole("link", { name: /request another reset email/i })
      ).toBeInTheDocument();
    });

    it("password fields default to type=password", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      passwordInputs.forEach((inp) =>
        expect(inp).toHaveAttribute("type", "password")
      );
    });
  });

  // ── Password Visibility Toggle ─────────────────────────────────────────────

  describe("Password visibility toggles", () => {
    it("toggles New Password to text", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      expect(screen.getByLabelText("New Password")).toHaveAttribute(
        "type",
        "text"
      );
    });

    it("toggles Confirm Password to text", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[1]);
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute(
        "type",
        "text"
      );
    });

    it("shows HiEyeOff after toggling New Password visible", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      expect(screen.getAllByTestId("icon-eye-off")[0]).toBeInTheDocument();
    });

    it("toggling New Password does not affect Confirm Password", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      const toggleBtns = screen.getAllByRole("button", { name: "" });
      fireEvent.click(toggleBtns[0]);
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute(
        "type",
        "password"
      );
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────

  describe("Form validation", () => {
    it("shows error when password is too short", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "Ab1");
      await userEvent.type(
        screen.getByLabelText("Confirm Password"),
        "Ab1"
      );
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument()
      );
    });

    it("shows error when password missing uppercase", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "nouppercase1");
      await userEvent.type(
        screen.getByLabelText("Confirm Password"),
        "nouppercase1"
      );
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/uppercase letter/i)
        ).toBeInTheDocument()
      );
    });

    it("shows error when password missing number", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "NoNumbers");
      await userEvent.type(
        screen.getByLabelText("Confirm Password"),
        "NoNumbers"
      );
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(screen.getByText(/one number/i)).toBeInTheDocument()
      );
    });

    it("shows error when passwords do not match", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "NewPass1");
      await userEvent.type(
        screen.getByLabelText("Confirm Password"),
        "Different1"
      );
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/passwords do not match/i)
        ).toBeInTheDocument()
      );
    });
  });

  // ── Submission – success ───────────────────────────────────────────────────

  describe("Form submission – success", () => {
    it("calls handleResetPassword with token and password", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(mockHandleResetPassword).toHaveBeenCalledWith(
          VALID_TOKEN,
          "NewPass1"
        )
      );
    });

    it("shows success message", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(
          screen.getByText("Password Reset Successful!")
        ).toBeInTheDocument()
      );
    });

    it("calls toast.success on success", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          "Password reset successfully"
        )
      );
    });

    it("redirects to /login after 2 seconds", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText("Password Reset Successful!")).toBeInTheDocument()
      );
      jest.advanceTimersByTime(2000);
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // ── Submission – expired/invalid token ────────────────────────────────────

  describe("Form submission – invalid/expired token", () => {
    it("shows expired token UI when server returns 'Invalid or expired'", async () => {
      mockHandleResetPassword.mockResolvedValue({
        success: false,
        message: "Invalid or expired token",
      });
      await fillAndSubmit();
      await waitFor(() =>
        expect(
          screen.getByText("Reset Link Expired")
        ).toBeInTheDocument()
      );
    });

    it("shows 'Request New Reset Link' button when token expired", async () => {
      mockHandleResetPassword.mockResolvedValue({
        success: false,
        message: "Invalid or expired token",
      });
      await fillAndSubmit();
      await waitFor(() =>
        expect(
          screen.getByRole("link", { name: /request new reset link/i })
        ).toBeInTheDocument()
      );
    });

    it("calls toast.error on failure", async () => {
      mockHandleResetPassword.mockResolvedValue({
        success: false,
        message: "Invalid or expired token",
      });
      await fillAndSubmit();
      await waitFor(() => expect(toast.error).toHaveBeenCalled());
    });

    it("shows expired token UI when thrown error contains 'Invalid or expired'", async () => {
      mockHandleResetPassword.mockRejectedValue(
        new Error("Invalid or expired token")
      );
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText("Reset Link Expired")).toBeInTheDocument()
      );
    });

    it("calls toast.error on unexpected error", async () => {
      mockHandleResetPassword.mockRejectedValue(new Error("Network failure"));
      await fillAndSubmit();
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          "An unexpected error occurred"
        )
      );
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows 'Resetting...' and disables button while submitting", async () => {
      mockHandleResetPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "NewPass1");
      await userEvent.type(screen.getByLabelText("Confirm Password"), "NewPass1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      expect(
        screen.getByRole("button", { name: /resetting/i })
      ).toBeDisabled();
    });
  });
});