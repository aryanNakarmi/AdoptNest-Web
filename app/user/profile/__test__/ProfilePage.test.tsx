import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "../page";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href }, children),
}));

const mockUser = {
  _id: "u1",
  fullName: "Aryan Nakarmi",
  email: "aryan@test.com",
  phoneNumber: "9800000000",
  role: "user",
  profilePicture: null,
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-06-20T00:00:00.000Z",
};

let mockAuthState = { user: mockUser as any, loading: false };

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthState = { user: mockUser as any, loading: false };
});

// =============================================================================
// LOADING STATE
// =============================================================================
describe("ProfilePage — loading state", () => {
  it("shows loading text while loading", () => {
    mockAuthState = { user: null, loading: true };
    render(<ProfilePage />);
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("does not show profile content while loading", () => {
    mockAuthState = { user: null, loading: true };
    render(<ProfilePage />);
    expect(screen.queryByText("Aryan Nakarmi")).not.toBeInTheDocument();
  });
});

// =============================================================================
// REDIRECT
// =============================================================================
describe("ProfilePage — redirect", () => {
  it("redirects to /login when user is null and not loading", () => {
    mockAuthState = { user: null, loading: false };
    render(<ProfilePage />);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });


});

// =============================================================================
// USER INFO RENDERING
// =============================================================================
describe("ProfilePage — user info", () => {
  it("renders user full name", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Aryan Nakarmi")).toBeInTheDocument();
  });

  it("renders user role in uppercase", () => {
    render(<ProfilePage />);
    expect(screen.getByText("USER")).toBeInTheDocument();
  });

  it("renders user email", () => {
    render(<ProfilePage />);
    expect(screen.getByText("aryan@test.com")).toBeInTheDocument();
  });

  it("renders user phone number", () => {
    render(<ProfilePage />);
    expect(screen.getByText("9800000000")).toBeInTheDocument();
  });

  it("renders dash when phone number is missing", () => {
    mockAuthState = { user: { ...mockUser, phoneNumber: null } as any, loading: false };
    render(<ProfilePage />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders Account Created label", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Account Created")).toBeInTheDocument();
  });

  it("renders Last Updated label", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
  });

  it("renders formatted createdAt date", () => {
    render(<ProfilePage />);
    expect(
      screen.getByText(new Date("2024-01-15T00:00:00.000Z").toLocaleDateString())
    ).toBeInTheDocument();
  });
});

// =============================================================================
// AVATAR
// =============================================================================
describe("ProfilePage — avatar", () => {
  it("shows first letter of name when no profile picture", () => {
    render(<ProfilePage />);
    expect(screen.getByText("A")).toBeInTheDocument(); // 'A' from Aryan
  });

  it("shows profile image when profilePicture is set", () => {
    mockAuthState = {
      user: { ...mockUser, profilePicture: "/uploads/avatar.jpg" } as any,
      loading: false,
    };
    render(<ProfilePage />);
    expect(screen.getByRole("img", { name: "Aryan Nakarmi" })).toBeInTheDocument();
  });

  it("falls back to U when fullName is missing", () => {
    mockAuthState = {
      user: { ...mockUser, fullName: "", profilePicture: null } as any,
      loading: false,
    };
    render(<ProfilePage />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});

// =============================================================================
// EDIT PROFILE LINK
// =============================================================================
describe("ProfilePage — edit profile", () => {
  it("renders Edit Profile button", () => {
    render(<ProfilePage />);
    expect(screen.getByRole("link", { name: "Edit Profile" })).toBeInTheDocument();
  });

  it("Edit Profile link points to /user/profile/edit-profile", () => {
    render(<ProfilePage />);
    expect(screen.getByRole("link", { name: "Edit Profile" })).toHaveAttribute(
      "href",
      "/user/profile/edit-profile"
    );
  });
});