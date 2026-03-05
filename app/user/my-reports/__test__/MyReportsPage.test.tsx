import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyReportsPage from "../page";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.createElement("a", { href }, children),
}));

jest.mock("react-toastify", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

jest.mock("react-icons/hi", () => ({
  HiArrowLeft:  () => React.createElement("span", null, "←"),
  HiTrash:      () => React.createElement("span", null, "🗑"),
  HiX:          () => React.createElement("span", null, "✕"),
  HiCalendar:   () => React.createElement("span", null, "📅"),
}));

jest.mock("react-icons/hi2", () => ({
  HiMapPin: () => React.createElement("span", null, "📍"),
}));

const mockGetMyReports = jest.fn();
const mockDeleteReport  = jest.fn();

jest.mock("@/lib/api/animal-report/animal-report", () => ({
  getMyReports: (...args: any[]) => mockGetMyReports(...args),
  deleteReport:  (...args: any[]) => mockDeleteReport(...args),
}));

// Silence window.confirm
beforeAll(() => {
  window.confirm = jest.fn(() => true);
});

const mockReports = [
  {
    _id: "r1",
    species: "Dog",
    location: { address: "Kathmandu", lat: 27.7, lng: 85.3 },
    description: "Found injured dog near the temple",
    imageUrl: "/uploads/dog.jpg",
    status: "pending",
    createdAt: "2024-03-01T00:00:00.000Z",
  },
  {
    _id: "r2",
    species: "Cat",
    location: { address: "Patan", lat: 27.6, lng: 85.3 },
    description: "Stray cat near market",
    imageUrl: "/uploads/cat.jpg",
    status: "approved",
    createdAt: "2024-03-05T00:00:00.000Z",
  },
  {
    _id: "r3",
    species: "Bird",
    location: { address: "Bhaktapur", lat: 27.6, lng: 85.4 },
    description: "",
    imageUrl: "",
    status: "rejected",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMyReports.mockResolvedValue({
    success: true,
    data: mockReports,
    pages: 1,
    total: 3,
  });
  mockDeleteReport.mockResolvedValue({ success: true });
});

// =============================================================================
// LOADING STATE
// =============================================================================
describe("MyReportsPage — loading state", () => {
  it("shows loading spinner while fetching", () => {
    mockGetMyReports.mockImplementation(() => new Promise(() => {}));
    render(<MyReportsPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

// =============================================================================
// HEADER
// =============================================================================
describe("MyReportsPage — header", () => {
  it("renders My Reports heading", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("My Reports")).toBeInTheDocument());
  });

  it("renders total report count badge", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("3 reports")).toBeInTheDocument());
  });

  it("renders Back to Dashboard link", async () => {
    render(<MyReportsPage />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /back to dashboard/i })).toHaveAttribute(
        "href", "/user/dashboard"
      )
    );
  });

  it("renders subheading text", async () => {
    render(<MyReportsPage />);
    await waitFor(() =>
      expect(screen.getByText("Track and manage your animal reports here")).toBeInTheDocument()
    );
  });
});

// =============================================================================
// REPORT CARDS
// =============================================================================
describe("MyReportsPage — report cards", () => {
  it("renders Dog report card", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Dog")).toBeInTheDocument());
  });

  it("renders Cat report card", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Cat")).toBeInTheDocument());
  });

  it("renders Bird report card", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Bird")).toBeInTheDocument());
  });

  it("renders Pending status badge", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Pending")).toBeInTheDocument());
  });

  it("renders Approved status badge", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Approved")).toBeInTheDocument());
  });

  it("renders Rejected status badge", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Rejected")).toBeInTheDocument());
  });

  it("renders location address on card", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("Kathmandu")).toBeInTheDocument());
  });

  it("renders No image text when imageUrl is empty", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("No image")).toBeInTheDocument());
  });
});

// =============================================================================
// EMPTY STATE
// =============================================================================
describe("MyReportsPage — empty state", () => {
  it("shows No reports yet when list is empty", async () => {
    mockGetMyReports.mockResolvedValue({ success: true, data: [], pages: 1, total: 0 });
    render(<MyReportsPage />);
    await waitFor(() => expect(screen.getByText("No reports yet")).toBeInTheDocument());
  });

  it("shows Create Your First Report link when empty", async () => {
    mockGetMyReports.mockResolvedValue({ success: true, data: [], pages: 1, total: 0 });
    render(<MyReportsPage />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Create Your First Report" })).toHaveAttribute(
        "href", "/user/post"
      )
    );
  });
});

// =============================================================================
// MODAL
// =============================================================================
describe("MyReportsPage — modal", () => {
  it("opens modal when a report card is clicked", async () => {
    render(<MyReportsPage />);
    await waitFor(() => screen.getByText("Dog"));
    fireEvent.click(screen.getByText("Dog").closest("div[class*='rounded']")!);
    await waitFor(() =>
      // modal shows species as a large heading
      expect(screen.getAllByText("Dog").length).toBeGreaterThan(1)
    );
  });

  it("closes modal when X button is clicked", async () => {
    render(<MyReportsPage />);
    await waitFor(() => screen.getByText("Dog"));
    // open modal
    fireEvent.click(screen.getByText("Dog").closest("div[class*='rounded']")!);
    await waitFor(() => expect(screen.getAllByText("Dog").length).toBeGreaterThan(1));
    // close — X button is the first button inside the modal overlay
    const closeButtons = screen.getAllByRole("button");
    // find the X close button (not the delete button)
    const xButton = closeButtons.find((b) => b.querySelector("[data-testid='icon-x']") || b.className.includes("top-4 right-4"));
    fireEvent.click(closeButtons[closeButtons.length - 2]); // second to last is X
    await waitFor(() => expect(screen.getAllByText("Dog").length).toBe(1));
  });
});

// =============================================================================
// DELETE
// =============================================================================
describe("MyReportsPage — delete", () => {
  it("calls deleteReport when trash button is clicked and confirmed", async () => {
    render(<MyReportsPage />);
    await waitFor(() => screen.getByText("Dog"));
    // open modal first
    fireEvent.click(screen.getByText("Dog").closest("div[class*='rounded']")!);
    await waitFor(() => expect(screen.getAllByText("Dog").length).toBeGreaterThan(1));
    // click trash button in modal
    const trashButtons = screen.getAllByRole("button").filter(
      (b) => b.querySelector("span") && b.querySelector("span")!.textContent === "🗑"
    );
    fireEvent.click(trashButtons[0]);
    await waitFor(() => expect(mockDeleteReport).toHaveBeenCalledWith("r1"));
  });

  it("calls getMyReports again after successful delete", async () => {
    render(<MyReportsPage />);
    await waitFor(() => screen.getByText("Dog"));
    fireEvent.click(screen.getByText("Dog").closest("div[class*='rounded']")!);
    await waitFor(() => expect(screen.getAllByText("Dog").length).toBeGreaterThan(1));
    const trashButtons = screen.getAllByRole("button").filter(
      (b) => b.querySelector("span") && b.querySelector("span")!.textContent === "🗑"
    );
    fireEvent.click(trashButtons[0]);
    await waitFor(() => expect(mockGetMyReports).toHaveBeenCalledTimes(2));
  });
});

// =============================================================================
// API CALL
// =============================================================================
describe("MyReportsPage — API", () => {
  it("calls getMyReports with page 1 on mount", async () => {
    render(<MyReportsPage />);
    await waitFor(() => expect(mockGetMyReports).toHaveBeenCalledWith(1, 12));
  });
});