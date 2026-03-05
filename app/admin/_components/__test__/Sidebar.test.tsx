import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../Sidebar";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, onClick }: any) =>
    React.createElement("a", { href, onClick }, children),
}));

const mockPathname = jest.fn(() => "/admin");
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// Icons return empty spans with data-testid only — no visible text to clash with nav labels
jest.mock("react-icons/hi", () => ({
  HiUsers:        () => React.createElement("span", { "data-testid": "icon-users" }),
  HiCog:          () => React.createElement("span", { "data-testid": "icon-cog" }),
  HiLogout:       () => React.createElement("span", { "data-testid": "icon-logout" }),
  HiClipboardList:() => React.createElement("span", { "data-testid": "icon-reports" }),
  HiPencil:       () => React.createElement("span", { "data-testid": "icon-pencil" }),
  HiChat:         () => React.createElement("span", { "data-testid": "icon-chat" }),
  HiX:            () => React.createElement("span", { "data-testid": "icon-x" }),
}));

// Mock axios — sidebar polls /api/v1/chats for unread count
jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({
      data: { success: true, data: [] },
    }),
  },
}));

const mockLogout = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUser = {
  _id: "u1",
  fullName: "Admin User",
  email: "admin@test.com",
  role: "admin",
  profilePicture: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname.mockReturnValue("/admin");
  mockUseAuth.mockReturnValue({ user: mockUser, logout: mockLogout });
});

// =============================================================================
// RENDERING
// =============================================================================
describe("AdminSidebar — rendering", () => {
  it("renders Welcome back text", () => {
    render(<Sidebar />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders user fullName", () => {
    render(<Sidebar />);
    expect(screen.getByText("Admin User")).toBeInTheDocument();
  });

  it("renders Dashboard nav label", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders Users nav label", () => {
    render(<Sidebar />);
    // use getAllByText since the icon mock may also render matching text — pick the <p> element
    const matches = screen.getAllByText("Users");
    expect(matches.some(el => el.tagName === "P")).toBe(true);
  });

  it("renders Reports nav label", () => {
    render(<Sidebar />);
    const matches = screen.getAllByText("Reports");
    expect(matches.some(el => el.tagName === "P")).toBe(true);
  });

  it("renders Post nav label", () => {
    render(<Sidebar />);
    expect(screen.getByText("Post")).toBeInTheDocument();
  });

  it("renders Chat nav label", () => {
    render(<Sidebar />);
    const matches = screen.getAllByText("Chat");
    expect(matches.some(el => el.tagName === "P")).toBe(true);
  });

  it("renders Log Out button", () => {
    render(<Sidebar />);
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});

// =============================================================================
// NAV HREFS
// =============================================================================
describe("AdminSidebar — nav hrefs", () => {
  it("Dashboard link points to /admin", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/admin");
  });

  it("Users link points to /admin/users", () => {
    render(<Sidebar />);
    const link = screen.getAllByRole("link").find(l => l.getAttribute("href") === "/admin/users");
    expect(link).toBeTruthy();
  });

  it("Reports link points to /admin/reports", () => {
    render(<Sidebar />);
    const link = screen.getAllByRole("link").find(l => l.getAttribute("href") === "/admin/reports");
    expect(link).toBeTruthy();
  });

  it("Post link points to /admin/animal-posts", () => {
    render(<Sidebar />);
    const link = screen.getAllByRole("link").find(l => l.getAttribute("href") === "/admin/animal-posts");
    expect(link).toBeTruthy();
  });

  it("Chat link points to /admin/chat", () => {
    render(<Sidebar />);
    const link = screen.getAllByRole("link").find(l => l.getAttribute("href") === "/admin/chat");
    expect(link).toBeTruthy();
  });
});

// =============================================================================
// AVATAR
// =============================================================================
describe("AdminSidebar — avatar", () => {
  it("shows first letter of fullName when no profilePicture", () => {
    render(<Sidebar />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("shows profile image when profilePicture is set", () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, profilePicture: "/uploads/avatar.jpg" },
      logout: mockLogout,
    });
    render(<Sidebar />);
    expect(screen.getByRole("img", { name: "Admin User" })).toBeInTheDocument();
  });

  it("falls back to A when fullName is missing", () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, fullName: undefined },
      logout: mockLogout,
    });
    render(<Sidebar />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});

// =============================================================================
// LOGOUT
// =============================================================================
describe("AdminSidebar — logout", () => {
  it("calls logout when Log Out button is clicked", () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// CLOSE BUTTON
// =============================================================================
describe("AdminSidebar — close button", () => {
  it("does NOT render close button when onClose is not provided", () => {
    render(<Sidebar />);
    expect(screen.queryByRole("button", { name: /close menu/i })).not.toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    render(<Sidebar onClose={jest.fn()} />);
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(<Sidebar onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});