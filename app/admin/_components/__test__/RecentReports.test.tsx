import React from "react";
import { render, screen } from "@testing-library/react";
import RecentReports from "../RecentReports";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.createElement("a", { href }, children),
}));

jest.mock("react-icons/hi", () => ({
  HiEye:       () => React.createElement("span", { "data-testid": "icon-eye" }),
  HiArrowRight:() => React.createElement("span", { "data-testid": "icon-arrow-right" }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockReports = [
  {
    _id: "r1",
    species: "dog",
    location: { address: "Kathmandu", lat: 27.7, lng: 85.3 },
    status: "pending" as const,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
    reportedBy: { fullName: "Alice Rai" },
    imageUrl: "/uploads/dog.jpg",
  },
  {
    _id: "r2",
    species: "cat",
    location: { address: "Patan", lat: 27.6, lng: 85.3 },
    status: "approved" as const,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3h ago
    reportedBy: { fullName: "Bob Sharma" },
    imageUrl: "",
  },
  {
    _id: "r3",
    species: "bird",
    location: { address: "Bhaktapur", lat: 27.6, lng: 85.4 },
    status: "rejected" as const,
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2d ago
    reportedBy: undefined,
    imageUrl: "",
  },
];

// =============================================================================
// RENDERING
// =============================================================================
describe("RecentReports — rendering", () => {
  it("renders Recent Reports heading", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Recent Reports")).toBeInTheDocument();
  });

  it("renders subheading text", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Latest animal reports submitted")).toBeInTheDocument();
  });

  it("renders View All link pointing to /admin/reports", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
      "href", "/admin/reports"
    );
  });
});

// =============================================================================
// EMPTY STATE
// =============================================================================
describe("RecentReports — empty state", () => {
  it("shows No reports yet when list is empty", () => {
    render(<RecentReports reports={[]} />);
    expect(screen.getByText("No reports yet")).toBeInTheDocument();
  });

  it("does NOT render report rows when list is empty", () => {
    render(<RecentReports reports={[]} />);
    expect(screen.queryByText("dog")).not.toBeInTheDocument();
  });
});

// =============================================================================
// REPORT ROWS
// =============================================================================
describe("RecentReports — report rows", () => {
  it("renders species for each report", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("bird")).toBeInTheDocument();
  });

  it("renders location address for each report", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Kathmandu")).toBeInTheDocument();
    expect(screen.getByText("Patan")).toBeInTheDocument();
    expect(screen.getByText("Bhaktapur")).toBeInTheDocument();
  });

  it("renders reportedBy fullName when present", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("by Alice Rai")).toBeInTheDocument();
    expect(screen.getByText("by Bob Sharma")).toBeInTheDocument();
  });

  it("falls back to Unknown when reportedBy is undefined", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("by Unknown")).toBeInTheDocument();
  });
});

// =============================================================================
// STATUS BADGES
// =============================================================================
describe("RecentReports — status badges", () => {
  it("renders Pending badge", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders Approved badge", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("renders Rejected badge", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });
});

// =============================================================================
// IMAGES
// =============================================================================
describe("RecentReports — images", () => {
  it("renders img tag when imageUrl is present", () => {
    render(<RecentReports reports={mockReports} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThan(0);
  });

  it("renders eye icon fallback when imageUrl is empty", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getAllByTestId("icon-eye").length).toBeGreaterThan(0);
  });
});

// =============================================================================
// TIMESTAMPS
// =============================================================================
describe("RecentReports — timestamps", () => {
  it("renders minutes ago for recent reports", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("30m ago")).toBeInTheDocument();
  });

  it("renders hours ago for older reports", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("3h ago")).toBeInTheDocument();
  });

  it("renders days ago for reports older than a day", () => {
    render(<RecentReports reports={mockReports} />);
    expect(screen.getByText("2d ago")).toBeInTheDocument();
  });
});