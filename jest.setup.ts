import "@testing-library/jest-dom";
import React from "react";

// ── Next.js router ────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

// ── Next.js Image ─────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) =>
    React.createElement("img", { src, alt, ...props }),
}));

// ── Next.js Link ──────────────────────────────────────────────────────────────
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
}));

// ── Next.js cache ─────────────────────────────────────────────────────────────
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// ── Cookie helpers
// @/ maps to project root per tsconfig, so @/lib/cookie = <root>/lib/cookie
jest.mock("@/lib/cookie", () => ({
  setAuthToken: jest.fn(),
  getAuthToken: jest.fn().mockResolvedValue(null),
  setUserData: jest.fn(),
  getUserData: jest.fn().mockResolvedValue(null),
  clearAuthCookies: jest.fn(),
}));

// ── react-toastify ────────────────────────────────────────────────────────────
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// ── react-icons — use React.createElement to avoid JSX transform issues ───────
jest.mock("react-icons/hi", () => ({
  HiEye: () => React.createElement("span", { "data-testid": "icon-eye" }),
  HiEyeOff: () => React.createElement("span", { "data-testid": "icon-eye-off" }),
  HiArrowLeft: () => React.createElement("span", { "data-testid": "icon-arrow-left" }),
  HiCheckCircle: () => React.createElement("span", { "data-testid": "icon-check" }),
}));

// ── Suppress React act() warnings ────────────────────────────────────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});