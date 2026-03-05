import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/_components/RegisterForm";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockHandleRegister = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: jest.fn(),
  handleRegister: (...args: any[]) => mockHandleRegister(...args),
  handleResetPassword: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// Suppress the react-hook-form + React 18 useTransition act() warning.
// This fires from framework internals after async submission — not from our tests.
const _originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("not wrapped in act") || msg.includes("Warning:")) return;
    _originalError(...args);
  };
});
afterAll(() => { console.error = _originalError; });

// ── Helper: set any value on a type=email input bypassing jsdom's sanitisation ─
// jsdom silently drops values it considers invalid for type=email (same as browsers).
// We temporarily switch the input to type=text, set the value, then restore.
function setEmailValue(input: HTMLElement, value: string) {
  Object.defineProperty(input, "type", { writable: true, configurable: true });
  (input as HTMLInputElement).type = "text";
  fireEvent.change(input, { target: { value } });
  (input as HTMLInputElement).type = "email";
}

// ─────────────────────────────────────────────────────────────────────────────

describe("RegisterForm", () => {
  beforeEach(() => jest.clearAllMocks());

  // Helper: fill all fields using valid defaults
  const fillForm = async ({
    fullName = "John Doe",
    email = "john@example.com",
    phoneNumber = "+9771234567890",
    password = "Secret1",
    confirmPassword = "Secret1",
  } = {}) => {
    if (fullName)
      await userEvent.type(screen.getByLabelText("Full Name"), fullName);
    if (email)
      setEmailValue(screen.getByLabelText("Email Address"), email);
    if (phoneNumber)
      await userEvent.type(screen.getByLabelText("Phone Number"), phoneNumber);
    const pwInputs = screen.getAllByPlaceholderText("••••••••");
    if (password) await userEvent.type(pwInputs[0], password);
    if (confirmPassword) await userEvent.type(pwInputs[1], confirmPassword);
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Rendering", () => {
    it("renders the heading", () => {
      render(<RegisterForm />);
      expect(screen.getByText("Create an Account")).toBeInTheDocument();
    });

    it("renders subtitle", () => {
      render(<RegisterForm />);
      expect(screen.getByText(/join our family/i)).toBeInTheDocument();
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

    it("renders Login link to /login", () => {
      render(<RegisterForm />);
      expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
        "href",
        "/login"
      );
    });

    it("password fields default to type=password", () => {
      render(<RegisterForm />);
      screen
        .getAllByPlaceholderText("••••••••")
        .forEach((input) =>
          expect(input).toHaveAttribute("type", "password")
        );
    });
  });

  // ── Password Visibility Toggles ────────────────────────────────────────────

  describe("Password visibility toggles", () => {
    it("toggles first password field to text", () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getAllByPlaceholderText("••••••••")[0]).toHaveAttribute(
        "type",
        "text"
      );
    });

    it("toggles second password field to text", () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[1]);
      expect(screen.getAllByPlaceholderText("••••••••")[1]).toHaveAttribute(
        "type",
        "text"
      );
    });

    it("toggles first field back to password on second click", () => {
      render(<RegisterForm />);
      const btn = screen.getAllByRole("button", { name: "" })[0];
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(screen.getAllByPlaceholderText("••••••••")[0]).toHaveAttribute(
        "type",
        "password"
      );
    });

    it("shows HiEyeOff icon after toggling visible", () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getAllByTestId("icon-eye-off")[0]).toBeInTheDocument();
    });

    it("toggling one field does not affect the other", () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getAllByRole("button", { name: "" })[0]);
      expect(screen.getAllByPlaceholderText("••••••••")[1]).toHaveAttribute(
        "type",
        "password"
      );
    });

    it("toggle buttons are type=button", () => {
      render(<RegisterForm />);
      screen
        .getAllByRole("button", { name: "" })
        .forEach((btn) => expect(btn).toHaveAttribute("type", "button"));
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  // Exact messages from registerSchema in schema.ts:
  //   fullName        → "Enter you name"
  //   email           → "Enter a valid email"
  //   password min    → "Password must be at least 6 characters long"
  //   confirmPassword → "Passwords do not match"

  describe("Form validation", () => {
    it("shows error when full name is empty", async () => {
      render(<RegisterForm />);
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText("Enter you name")).toBeInTheDocument()
      );
    });

    it("shows error when email is not a valid email address", async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText("Full Name"), "John Doe");
      // setEmailValue bypasses jsdom's type=email sanitisation so Zod sees "bademail"
      setEmailValue(screen.getByLabelText("Email Address"), "bademail");
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument()
      );
    });

    it("shows error when password is too short", async () => {
      render(<RegisterForm />);
      await fillForm({ password: "Sh1", confirmPassword: "Sh1" });
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Password must be at least 6 characters long")
        ).toBeInTheDocument()
      );
    });

    it("shows error when passwords do not match", async () => {
      render(<RegisterForm />);
      await fillForm({ confirmPassword: "Different1" });
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
      );
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
        expect(screen.getByText("Email already registered")).toBeInTheDocument()
      );
    });

    it("shows error when handleRegister throws", async () => {
      mockHandleRegister.mockRejectedValue(new Error("Network error"));
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText("Network error")).toBeInTheDocument()
      );
    });

    it("does not redirect on failure", async () => {
      mockHandleRegister.mockResolvedValue({
        success: false,
        message: "Error occurred",
      });
      render(<RegisterForm />);
      await fillForm();
      fireEvent.click(screen.getByRole("button", { name: /^register$/i }));
      await waitFor(() =>
        expect(screen.getByText("Error occurred")).toBeInTheDocument()
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows Creating account... and disables button while pending", async () => {
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
  });
});