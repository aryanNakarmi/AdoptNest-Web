import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdateUserForm from "../UpdateProfile";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

const mockHandleUpdateProfile = jest.fn();
jest.mock("@/lib/actions/auth-action", () => ({
  handleUpdateProfile: (...args: any[]) => mockHandleUpdateProfile(...args),
}));

const mockUser = {
  _id: "u1",
  fullName: "Aryan Nakarmi",
  email: "aryan@test.com",
  phoneNumber: "9800000000",
  profilePicture: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockHandleUpdateProfile.mockResolvedValue({ success: true });
});

// =============================================================================
// RENDERING
// =============================================================================
describe("UpdateUserForm — rendering", () => {
//   it("renders Update Profile heading", () => {
//     render(<UpdateUserForm user={mockUser} />);
//     expect(screen.getByText("Update Profile")).toBeInTheDocument();
//   });

  it("renders Full Name input pre-filled with user fullName", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByDisplayValue("Aryan Nakarmi")).toBeInTheDocument();
  });

  it("renders Phone Number input pre-filled with user phoneNumber", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByDisplayValue("9800000000")).toBeInTheDocument();
  });

  it("renders Email field as disabled", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByDisplayValue("aryan@test.com")).toBeDisabled();
  });

  it("renders Email cannot be changed note", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByText("Email cannot be changed.")).toBeInTheDocument();
  });

  it("renders Update Profile submit button", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByRole("button", { name: "Update Profile" })).toBeInTheDocument();
  });

  it("renders Choose File button", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByRole("button", { name: "Choose File" })).toBeInTheDocument();
  });

  it("renders No file chosen when no file selected", () => {
    render(<UpdateUserForm user={mockUser} />);
    expect(screen.getByText("No file chosen")).toBeInTheDocument();
  });
});

// =============================================================================
// EXISTING PROFILE PICTURE
// =============================================================================
describe("UpdateUserForm — profile picture display", () => {
  it("shows placeholder avatar when no profilePicture", () => {
    render(<UpdateUserForm user={mockUser} />);
    // The fallback div with "U" initial
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("shows existing profile image when profilePicture is set", () => {
    render(<UpdateUserForm user={{ ...mockUser, profilePicture: "/uploads/avatar.jpg" }} />);
    expect(screen.getByRole("img", { name: "Profile" })).toBeInTheDocument();
  });
});

// =============================================================================
// FORM INPUTS
// =============================================================================
describe("UpdateUserForm — inputs", () => {
  it("allows editing Full Name", () => {
    render(<UpdateUserForm user={mockUser} />);
    const input = screen.getByDisplayValue("Aryan Nakarmi");
    fireEvent.change(input, { target: { value: "New Name" } });
    expect(input).toHaveValue("New Name");
  });

  it("allows editing Phone Number", () => {
    render(<UpdateUserForm user={mockUser} />);
    const input = screen.getByDisplayValue("9800000000");
    fireEvent.change(input, { target: { value: "9811111111" } });
    expect(input).toHaveValue("9811111111");
  });

  it("does not allow editing Email", () => {
    render(<UpdateUserForm user={mockUser} />);
    const emailInput = screen.getByDisplayValue("aryan@test.com");
    fireEvent.change(emailInput, { target: { value: "new@email.com" } });
    // still shows original value since it's disabled
    expect(emailInput).toHaveValue("aryan@test.com");
  });
});

// =============================================================================
// SUBMISSION
// =============================================================================
describe("UpdateUserForm — submission", () => {
  it("shows Updating... while submitting", async () => {
    mockHandleUpdateProfile.mockImplementation(() => new Promise(() => {}));
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Updating..." })).toBeInTheDocument()
    );
  });

  it("calls handleUpdateProfile on submit", async () => {
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() => expect(mockHandleUpdateProfile).toHaveBeenCalledTimes(1));
  });

  it("calls handleUpdateProfile with FormData containing fullName", async () => {
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.change(screen.getByDisplayValue("Aryan Nakarmi"), {
      target: { value: "New Name" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() => {
      const formData: FormData = mockHandleUpdateProfile.mock.calls[0][0];
      expect(formData.get("fullName")).toBe("New Name");
    });
  });

  it("does NOT include email in FormData", async () => {
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() => {
      const formData: FormData = mockHandleUpdateProfile.mock.calls[0][0];
      expect(formData.get("email")).toBeNull();
    });
  });

  it("shows success toast on successful update", async () => {
    const { toast } = require("react-toastify");
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Profile updated successfully")
    );
  });

  it("shows error toast when update fails", async () => {
    const { toast } = require("react-toastify");
    mockHandleUpdateProfile.mockResolvedValue({ success: false, message: "Server error" });
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Server error")
    );
  });

  it("shows inline error message when update fails", async () => {
    mockHandleUpdateProfile.mockResolvedValue({ success: false, message: "Server error" });
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() =>
      expect(screen.getByText("Server error")).toBeInTheDocument()
    );
  });

  it("submit button is disabled while submitting", async () => {
    mockHandleUpdateProfile.mockImplementation(() => new Promise(() => {}));
    render(<UpdateUserForm user={mockUser} />);
    fireEvent.submit(screen.getByRole("button", { name: "Update Profile" }).closest("form")!);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Updating..." })).toBeDisabled()
    );
  });
});