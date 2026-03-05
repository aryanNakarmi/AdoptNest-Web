import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import ResetPasswordForm from "@/app/(auth)/_components/ResetPasswordForm";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockHandleResetPassword = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: jest.fn(),
  handleRegister: jest.fn(),
  handleResetPassword: (...args: any[]) => mockHandleResetPassword(...args),
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Suppress the act() warning that comes from react-hook-form's internal
// useForm state updates after async submission. This is a known react-hook-form
// + React 18 testing quirk — the tests themselves are correct.
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("Warning:") || msg.includes("not wrapped in act")) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Do NOT use jest.useFakeTimers() globally — it freezes userEvent's
// internal async scheduler, causing all userEvent.type() calls to hang/timeout.
// Fake timers are only enabled in the specific test that needs them.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_TOKEN = "valid-reset-token-123";

describe("ResetPasswordForm", () => {
  beforeEach(() => jest.clearAllMocks());

  // Helper: render with a valid token, fill both fields, and click submit
  const fillAndSubmit = async (
    password = "NewPass1",
    confirm = "NewPass1",
    token = VALID_TOKEN
  ) => {
    render(<ResetPasswordForm token={token} />);
    await userEvent.type(screen.getByLabelText("New Password"), password);
    await userEvent.type(screen.getByLabelText("Confirm Password"), confirm);
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  };

  // ── No-token guard ─────────────────────────────────────────────────────────

  describe("When token is empty", () => {
    it("renders Invalid Reset Link heading", () => {
      render(<ResetPasswordForm token="" />);
      expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
    });

    it("renders Request New Reset Link link", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.getByRole("link", { name: /request new reset link/i })
      ).toBeInTheDocument();
    });

    it("renders Back to Login link", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.getByRole("link", { name: /back to login/i })
      ).toBeInTheDocument();
    });

    it("does NOT render the reset form", () => {
      render(<ResetPasswordForm token="" />);
      expect(
        screen.queryByRole("button", { name: /reset password/i })
      ).not.toBeInTheDocument();
    });
  });

  // ── Rendering with valid token ─────────────────────────────────────────────

  describe("Rendering with valid token", () => {
    it("renders Create New Password heading", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByText("Create New Password")).toBeInTheDocument();
    });

    it("renders New Password input", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    });

    it("renders Confirm Password input", () => {
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
      expect(
        screen.getAllByRole("link", { name: /back to login/i }).length
      ).toBeGreaterThan(0);
    });

    it("renders Request another reset email link", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(
        screen.getByRole("link", { name: /request another reset email/i })
      ).toBeInTheDocument();
    });

    it("password fields default to type=password", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      expect(screen.getByLabelText("New Password")).toHaveAttribute("type", "password");
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute("type", "password");
    });
  });

  // ── Password Visibility Toggles ────────────────────────────────────────────

  describe("Password visibility toggles", () => {
    it("toggles New Password to text", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getByLabelText("New Password")).toHaveAttribute("type", "text");
    });

    it("toggles Confirm Password to text", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[1]);
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute("type", "text");
    });

    it("shows HiEyeOff after toggling New Password visible", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getAllByTestId("icon-eye-off")[0]).toBeInTheDocument();
    });

    it("toggling New Password does not affect Confirm Password", () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute("type", "password");
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  // Exact messages from ResetPasswordSchema defined in ResetPasswordForm.tsx:
  //   min(6) → "Password must be at least 6 characters long"
  //   regex uppercase → "Password must contain at least one uppercase letter"
  //   regex number → "Password must contain at least one number"
  //   refine → "Passwords do not match"

  describe("Form validation", () => {
    it("shows error when password is too short", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "Ab1");
      await userEvent.type(screen.getByLabelText("Confirm Password"), "Ab1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Password must be at least 6 characters long")
        ).toBeInTheDocument()
      );
    });

    it("shows error when password is missing uppercase letter", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "nouppercase1");
      await userEvent.type(screen.getByLabelText("Confirm Password"), "nouppercase1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Password must contain at least one uppercase letter")
        ).toBeInTheDocument()
      );
    });

    it("shows error when password is missing a number", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "NoNumbers");
      await userEvent.type(screen.getByLabelText("Confirm Password"), "NoNumbers");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Password must contain at least one number")
        ).toBeInTheDocument()
      );
    });

    it("shows error when passwords do not match", async () => {
      render(<ResetPasswordForm token={VALID_TOKEN} />);
      await userEvent.type(screen.getByLabelText("New Password"), "NewPass1");
      await userEvent.type(screen.getByLabelText("Confirm Password"), "Different1");
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
      await waitFor(() =>
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
      );
    });
  });

  // ── Submission – success ───────────────────────────────────────────────────

  describe("Form submission – success", () => {
    it("calls handleResetPassword with token and password", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(mockHandleResetPassword).toHaveBeenCalledWith(VALID_TOKEN, "NewPass1")
      );
    });

    it("shows Password Reset Successful! message", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText("Password Reset Successful!")).toBeInTheDocument()
      );
    });

    it("calls toast.success on success", async () => {
      mockHandleResetPassword.mockResolvedValue({ success: true });
      await fillAndSubmit();
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith("Password reset successfully")
      );
    });

    it("redirects to /login after 2-second delay", async () => {
      // Fake timers scoped only to this test to avoid breaking userEvent elsewhere
      jest.useFakeTimers();
      mockHandleResetPassword.mockResolvedValue({ success: true });

      render(<ResetPasswordForm token={VALID_TOKEN} />);
      // Use fireEvent.change here — userEvent.type hangs with fake timers active
      fireEvent.change(screen.getByLabelText("New Password"), {
        target: { value: "NewPass1" },
      });
      fireEvent.change(screen.getByLabelText("Confirm Password"), {
        target: { value: "NewPass1" },
      });
      fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

      await waitFor(() =>
        expect(screen.getByText("Password Reset Successful!")).toBeInTheDocument()
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(mockReplace).toHaveBeenCalledWith("/login");

      jest.useRealTimers();
    });
  });

  // ── Submission – expired/invalid token ────────────────────────────────────

  describe("Form submission – expired/invalid token", () => {
    it("shows Reset Link Expired UI when server returns invalid token message", async () => {
      mockHandleResetPassword.mockResolvedValue({
        success: false,
        message: "Invalid or expired token",
      });
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText("Reset Link Expired")).toBeInTheDocument()
      );
    });

    it("shows Request New Reset Link button when token expired", async () => {
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

    it("calls toast.error on non-expired failure", async () => {
      mockHandleResetPassword.mockResolvedValue({
        success: false,
        message: "Something went wrong",
      });
      await fillAndSubmit();
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("Something went wrong")
      );
    });

    it("shows Reset Link Expired when thrown error says Invalid or expired", async () => {
      mockHandleResetPassword.mockRejectedValue(
        new Error("Invalid or expired token")
      );
      await fillAndSubmit();
      await waitFor(() =>
        expect(screen.getByText("Reset Link Expired")).toBeInTheDocument()
      );
    });

    it("calls toast.error with generic message on unexpected thrown error", async () => {
      mockHandleResetPassword.mockRejectedValue(new Error("Network failure"));
      await fillAndSubmit();
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred")
      );
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows Resetting... and disables button while pending", async () => {
      mockHandleResetPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
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