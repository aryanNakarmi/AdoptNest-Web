import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "../page";

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: any) =>
    React.createElement("a", { href }, children),
}));

jest.mock("react-toastify", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// react-icons are ESM — must be mocked or Jest gets undefined
jest.mock("react-icons/fa", () => ({
  FaPaw: () => React.createElement("span", { "data-testid": "icon-paw" }),
}));

jest.mock("react-icons/hi", () => ({
  HiArrowRight: () => React.createElement("span", { "data-testid": "icon-arrow-right" }),
}));

jest.mock("@headlessui/react", () => {
  const Dialog = ({ children }: any) =>
    require("react").createElement("div", { role: "dialog" }, children);
  Dialog.Panel = ({ children }: any) => require("react").createElement("div", null, children);
  Dialog.Title = ({ children }: any) => require("react").createElement("h2", null, children);
  Dialog.Description = ({ children }: any) => require("react").createElement("p", null, children);

  const Transition = ({ show, children }: any) =>
    show ? require("react").createElement(require("react").Fragment, null, children) : null;
  Transition.Child = ({ children }: any) =>
    require("react").createElement(require("react").Fragment, null, children);

  return { Dialog, Transition };
});

const mockGetMyReports = jest.fn();
jest.mock("@/lib/api/animal-report/animal-report", () => ({
  getMyReports: (...args: any[]) => mockGetMyReports(...args),
}));

const mockReports = [
  {
    _id: "r1",
    species: "Dog",
    location: { address: "Kathmandu", lat: 27.7, lng: 85.3 },
    description: "Found injured dog",
    imageUrl: "/uploads/dog.jpg",
    status: "pending",
    createdAt: "2024-03-01T00:00:00.000Z",
  },
  {
    _id: "r2",
    species: "Cat",
    location: { address: "Patan", lat: 27.6, lng: 85.3 },
    description: "Stray cat",
    imageUrl: "/uploads/cat.jpg",
    status: "approved",
    createdAt: "2024-03-05T00:00:00.000Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockGetMyReports.mockResolvedValue({ success: true, data: mockReports });
});

// =============================================================================
// LOADING STATE
// =============================================================================
describe("DashboardPage — loading state", () => {
  it("shows loading spinner while fetching reports", () => {
    mockGetMyReports.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<DashboardPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

// =============================================================================
// HERO SECTION
// =============================================================================
describe("DashboardPage — hero section", () => {
  it("renders Help a stray today heading", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Help a stray today")).toBeInTheDocument());
  });

  it("renders Learn More button", async () => {
    render(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Learn More" })).toBeInTheDocument()
    );
  });

  it("opens modal when Learn More is clicked", async () => {
    render(<DashboardPage />);
    await waitFor(() => screen.getByRole("button", { name: "Learn More" }));
    fireEvent.click(screen.getByRole("button", { name: "Learn More" }));
    expect(screen.getByText("Help a Stray")).toBeInTheDocument();
  });

  it("closes modal when Close button is clicked", async () => {
    render(<DashboardPage />);
    await waitFor(() => screen.getByRole("button", { name: "Learn More" }));
    fireEvent.click(screen.getByRole("button", { name: "Learn More" }));
    expect(screen.getByText("Help a Stray")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Help a Stray")).not.toBeInTheDocument();
  });
});

// =============================================================================
// ADOPT BAR
// =============================================================================
describe("DashboardPage — adopt bar", () => {
  it("renders Ready to adopt heading", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Ready to adopt")).toBeInTheDocument());
  });

  it("renders Adopt link pointing to /user/adopt", async () => {
    render(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Adopt" })).toHaveAttribute("href", "/user/adopt")
    );
  });
});

// =============================================================================
// MY REPORTS SECTION
// =============================================================================
describe("DashboardPage — my reports", () => {
  it("renders My Reports heading", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("My Reports")).toBeInTheDocument());
  });

  it("renders View All link pointing to /user/my-reports", async () => {
    render(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /view all/i })).toHaveAttribute(
        "href", "/user/my-reports"
      )
    );
  });

  it("renders report cards after loading", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Dog")).toBeInTheDocument());
    expect(screen.getByText("Cat")).toBeInTheDocument();
  });

  it("renders report location address", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Kathmandu")).toBeInTheDocument());
  });

  it("renders Pending status badge", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Pending")).toBeInTheDocument());
  });

  it("renders Approved status badge", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Approved")).toBeInTheDocument());
  });

  it("calls getMyReports with page 1 and limit 4", async () => {
    render(<DashboardPage />);
    await waitFor(() => expect(mockGetMyReports).toHaveBeenCalledWith(1, 4));
  });
});

// =============================================================================
// EMPTY STATE
// =============================================================================
describe("DashboardPage — empty reports", () => {
  it("shows No reports yet when list is empty", async () => {
    mockGetMyReports.mockResolvedValue({ success: true, data: [] });
    render(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("No reports yet")).toBeInTheDocument());
  });

  it("shows Create Report link when no reports", async () => {
    mockGetMyReports.mockResolvedValue({ success: true, data: [] });
    render(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Create Report" })).toHaveAttribute(
        "href", "/user/post"
      )
    );
  });
});