import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/_components/LoginForm";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockHandleLogin = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleLogin: (...args: any[]) => mockHandleLogin(...args),
  handleRegister: jest.fn(),
  handleResetPassword: jest.fn(),
}));

const mockSetUser = jest.fn();
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ setUser: mockSetUser, setIsAuthenticated: jest.fn() }),
}));

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

const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

// ── Suppress the react-hook-form + React 18 "not wrapped in act" warning ──────
// This fires from RHF internals after async submission and is not a test bug.
const _originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("not wrapped in act") || msg.includes("Warning:")) return;
    _originalError(...args);
  };
});
afterAll(() => { console.error = _originalError; });

// ── Helper: inject a value into a react-hook-form registered email input ──────
// jsdom sanitises <input type="email"> and silently drops invalid values.
// RHF listens to native `input` events via its own ref — we must:
//   1. Use the React synthetic event system (nativeInputValueSetter) to set the
//      value so React/RHF sees it properly.
//   2. Fire an `input` event (not `change`) because RHF uses `input` internally.
function setRHFEmailValue(input: HTMLElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )!.set!;
  // Temporarily switch to type=text so jsdom accepts any string
  (input as HTMLInputElement).type = "text";
  nativeInputValueSetter.call(input, value);
  // Fire both input and change — RHF needs input, zod resolver runs on change
  fireEvent.input(input, { target: { value } });
  fireEvent.change(input, { target: { value } });
  (input as HTMLInputElement).type = "email";
}

// ─────────────────────────────────────────────────────────────────────────────

describe("LoginForm", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("Rendering", () => {
    it("renders Welcome Back heading", () => {
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

    it("renders Login submit button", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
    });

    it("renders Forgot link to /request-password-reset", () => {
      render(<LoginForm />);
      expect(screen.getByRole("link", { name: /forgot/i })).toHaveAttribute(
        "href", "/request-password-reset"
      );
    });

    it("renders Sign Up link to /register", () => {
      render(<LoginForm />);
      expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
        "href", "/register"
      );
    });

    it("password field is type=password by default", () => {
      render(<LoginForm />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("renders the eye icon toggle button", () => {
      render(<LoginForm />);
      expect(screen.getByTestId("icon-eye")).toBeInTheDocument();
    });
  });

  // ── Password Toggle ────────────────────────────────────────────────────────

  describe("Password visibility toggle", () => {
    it("toggles password to text on click", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "" }));
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    });

    it("toggles back to password on second click", () => {
      render(<LoginForm />);
      const btn = screen.getByRole("button", { name: "" });
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    });

    it("shows HiEyeOff icon when password is visible", () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "" }));
      expect(screen.getByTestId("icon-eye-off")).toBeInTheDocument();
    });

    it("toggle button is type=button not type=submit", () => {
      render(<LoginForm />);
      expect(screen.getByRole("button", { name: "" })).toHaveAttribute("type", "button");
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  // loginSchema messages:
  //   email    → "Enter a valid email"
  //   password → "Minimum 6 characters"

  describe("Form validation", () => {
    it("shows email error when form is submitted empty", async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument()
      );
    });

    it("shows email error when value is not a valid email address", async () => {
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "notanemail");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(screen.getByText("Enter a valid email")).toBeInTheDocument()
      );
    });

    it("shows password error when password is empty", async () => {
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "user@example.com");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(screen.getByText("Minimum 6 characters")).toBeInTheDocument()
      );
    });
  });

  // ── Submission – success ───────────────────────────────────────────────────

  describe("Form submission – success", () => {
    const fillAndSubmit = async (role: string) => {
      mockHandleLogin.mockResolvedValue({ success: true, data: { role } });
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
    };

    it("calls handleLogin with correct values", async () => {
      mockHandleLogin.mockResolvedValue({ success: true, data: { role: "user" } });
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(mockHandleLogin).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "Secret1",
        })
      );
    });

    it("calls setUser with response data", async () => {
      await fillAndSubmit("user");
      await waitFor(() =>
        expect(mockSetUser).toHaveBeenCalledWith({ role: "user" })
      );
    });

    it("redirects admin to /admin", async () => {
      await fillAndSubmit("admin");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    });

    it("redirects user to /user/dashboard", async () => {
      await fillAndSubmit("user");
      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith("/user/dashboard")
      );
    });

    it("redirects unknown role to /", async () => {
      await fillAndSubmit("manager");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    });

    it("handles uppercase role casing (ADMIN → /admin)", async () => {
      await fillAndSubmit("ADMIN");
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    });
  });

  // ── Submission – failure ───────────────────────────────────────────────────

  describe("Form submission – failure", () => {
    it("calls window.alert when login fails", async () => {
      mockHandleLogin.mockResolvedValue({
        success: false,
        message: "Invalid credentials",
      });
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "bad@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Wrong1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() =>
        expect(alertMock).toHaveBeenCalledWith("Invalid credentials")
      );
    });

    it("does not redirect on failure", async () => {
      mockHandleLogin.mockResolvedValue({ success: false, message: "Oops" });
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "bad@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Wrong1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      await waitFor(() => expect(alertMock).toHaveBeenCalled());
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe("Loading state", () => {
    it("shows Logging in... and disables button while pending", async () => {
      mockHandleLogin.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      render(<LoginForm />);
      setRHFEmailValue(screen.getByLabelText("Email"), "user@example.com");
      await userEvent.type(screen.getByLabelText("Password"), "Secret1");
      fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
      expect(
        screen.getByRole("button", { name: /logging in/i })
      ).toBeDisabled();
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
        "autocomplete", "current-password"
      );
    });
  });
});