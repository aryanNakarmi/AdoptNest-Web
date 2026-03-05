import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminReportsPage from "../page";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("react-icons/hi", () => ({
  HiCheck:        () => React.createElement("span", null, "✓"),
  HiX:            () => React.createElement("span", null, "✕"),
  HiEye:          () => React.createElement("span", { "data-testid": "icon-eye" }),
  HiChevronRight: () => React.createElement("span", null, ">"),
  HiArrowLeft:    () => React.createElement("span", null, "←"),
}));

jest.mock("react-icons/hi2", () => ({
  HiMapPin: () => React.createElement("span", { "data-testid": "icon-map" }),
}));

const mockAxiosGet = jest.fn();
const mockAxiosPut = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
    put: (...args: any[]) => mockAxiosPut(...args),
  },
}));

const makeReport = (overrides = {}) => ({
  _id: "r1",
  species: "Dog",
  location: { address: "Kathmandu", lat: 27.7, lng: 85.3 },
  description: "Injured dog near temple",
  imageUrl: "",
  status: "pending" as const,
  createdAt: "2024-03-01T00:00:00.000Z",
  reportedBy: { _id: "u1", fullName: "Alice Rai", email: "alice@test.com" },
  ...overrides,
});

const pendingReport  = makeReport();
const approvedReport = makeReport({ _id: "r2", species: "Cat",  status: "approved", location: { address: "Patan",     lat: 27.6, lng: 85.3 }, reportedBy: { _id: "u2", fullName: "Bob",   email: "bob@test.com"   } });
const rejectedReport = makeReport({ _id: "r3", species: "Bird", status: "rejected", location: { address: "Bhaktapur", lat: 27.6, lng: 85.4 }, reportedBy: { _id: "u3", fullName: "Carol", email: "carol@test.com" } });
const allReports = [pendingReport, approvedReport, rejectedReport];

beforeEach(() => {
  jest.clearAllMocks();
  mockAxiosGet.mockResolvedValue({
    data: { success: true, data: allReports, pages: 1, total: 3 },
  });
  mockAxiosPut.mockResolvedValue({ data: { success: true } });
});

// =============================================================================
// LOADING
// =============================================================================
describe("AdminReportsPage — loading", () => {
  it("shows loading spinner while fetching", () => {
    mockAxiosGet.mockImplementation(() => new Promise(() => {}));
    render(<AdminReportsPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

// =============================================================================
// HEADER & FILTERS
// =============================================================================
describe("AdminReportsPage — header and filters", () => {
  it("renders Animal Reports heading", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("Animal Reports")[0]).toBeInTheDocument());
  });

  it("renders Pending filter tab", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText(/pending/i)[0]).toBeInTheDocument());
  });

  it("renders Approved filter tab", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText(/approved/i)[0]).toBeInTheDocument());
  });

  it("renders Rejected filter tab", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText(/rejected/i)[0]).toBeInTheDocument());
  });

  it("shows pending report species by default", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("Dog")[0]).toBeInTheDocument());
  });
});

// =============================================================================
// FILTER SWITCHING
// =============================================================================
describe("AdminReportsPage — filter switching", () => {
  it("shows approved species when Approved tab is clicked", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => screen.getAllByText("Dog"));
    const approvedTab = screen.getAllByRole("button").find(
      b => b.textContent?.includes("Approved") && b.textContent?.includes("(")
    )!;
    fireEvent.click(approvedTab);
    await waitFor(() => expect(screen.getAllByText("Cat")[0]).toBeInTheDocument());
  });

  it("shows rejected species when Rejected tab is clicked", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => screen.getAllByText("Dog"));
    const rejectedTab = screen.getAllByRole("button").find(
      b => b.textContent?.includes("Rejected") && b.textContent?.includes("(")
    )!;
    fireEvent.click(rejectedTab);
    await waitFor(() => expect(screen.getAllByText("Bird")[0]).toBeInTheDocument());
  });

  it("shows empty message when no pending reports exist", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { success: true, data: [approvedReport], pages: 1, total: 1 },
    });
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("No pending reports")[0]).toBeInTheDocument());
  });
});

// =============================================================================
// REPORT LIST
// =============================================================================
describe("AdminReportsPage — report list", () => {
  it("renders report species", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("Dog")[0]).toBeInTheDocument());
  });

  it("renders report location address", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("Kathmandu")[0]).toBeInTheDocument());
  });

  it("renders reporter fullName", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => expect(screen.getAllByText("Alice Rai")[0]).toBeInTheDocument());
  });

  it("renders eye icon fallback when imageUrl is empty", async () => {
    render(<AdminReportsPage />);
    await waitFor(() =>
      expect(screen.getAllByTestId("icon-eye").length).toBeGreaterThan(0)
    );
  });
});

// =============================================================================
// DETAIL PANEL
// =============================================================================
describe("AdminReportsPage — detail panel", () => {
  it("shows placeholder text before a report is selected", async () => {
    render(<AdminReportsPage />);
    await waitFor(() =>
      expect(screen.getAllByText("Select a report to view details")[0]).toBeInTheDocument()
    );
  });

  it("shows report description when a row is clicked", async () => {
    render(<AdminReportsPage />);
    await waitFor(() => screen.getAllByText("Dog"));
    fireEvent.click(screen.getAllByText("Dog")[0].closest("button")!);
    await waitFor(() =>
      expect(screen.getAllByText("Injured dog near temple")[0]).toBeInTheDocument()
    );
  });
});

// =============================================================================
// APPROVE / REJECT
// =============================================================================
describe("AdminReportsPage — approve and reject", () => {
  const clickFirstReport = async () => {
    await waitFor(() => screen.getAllByText("Dog"));
    fireEvent.click(screen.getAllByText("Dog")[0].closest("button")!);
  };

  // Target action buttons by their bg colour class — distinct from filter tabs
  const getApproveBtn = () =>
    screen.getAllByRole("button").find(b =>
      b.classList.contains("bg-green-600") && b.textContent?.includes("Approve")
    )!;

  const getRejectBtn = () =>
    screen.getAllByRole("button").find(b =>
      b.classList.contains("bg-red-600") && b.textContent?.includes("Reject")
    )!;

  it("calls PUT with approved status when Approve is clicked", async () => {
    render(<AdminReportsPage />);
    await clickFirstReport();
    await waitFor(() => expect(getApproveBtn()).toBeTruthy());
    fireEvent.click(getApproveBtn());
    await waitFor(() =>
      expect(mockAxiosPut).toHaveBeenCalledWith(
        expect.stringContaining("/reports/r1/status"),
        { status: "approved" },
        expect.any(Object)
      )
    );
  });

  it("calls PUT with rejected status when Reject is clicked", async () => {
    render(<AdminReportsPage />);
    await clickFirstReport();
    await waitFor(() => expect(getRejectBtn()).toBeTruthy());
    fireEvent.click(getRejectBtn());
    await waitFor(() =>
      expect(mockAxiosPut).toHaveBeenCalledWith(
        expect.stringContaining("/reports/r1/status"),
        { status: "rejected" },
        expect.any(Object)
      )
    );
  });

  it("shows success toast after approving", async () => {
    const { toast } = require("react-toastify");
    render(<AdminReportsPage />);
    await clickFirstReport();
    await waitFor(() => expect(getApproveBtn()).toBeTruthy());
    fireEvent.click(getApproveBtn());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Report approved"));
  });

  it("shows success toast after rejecting", async () => {
    const { toast } = require("react-toastify");
    render(<AdminReportsPage />);
    await clickFirstReport();
    await waitFor(() => expect(getRejectBtn()).toBeTruthy());
    fireEvent.click(getRejectBtn());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Report rejected"));
  });

  it("refetches after approving", async () => {
    render(<AdminReportsPage />);
    await clickFirstReport();
    await waitFor(() => expect(getApproveBtn()).toBeTruthy());
    fireEvent.click(getApproveBtn());
    await waitFor(() => expect(mockAxiosGet).toHaveBeenCalledTimes(2));
  });
});

// =============================================================================
// PAGINATION
// =============================================================================
describe("AdminReportsPage — pagination", () => {
  it("renders Previous and Next buttons when reports exist", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { success: true, data: allReports, pages: 2, total: 15 },
    });
    render(<AdminReportsPage />);
    await waitFor(() => screen.getAllByText("Dog"));
    expect(screen.getAllByRole("button", { name: /previous/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /next/i }).length).toBeGreaterThan(0);
  });

  it("Previous button is disabled on page 1", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { success: true, data: allReports, pages: 2, total: 15 },
    });
    render(<AdminReportsPage />);
    await waitFor(() => screen.getAllByText("Dog"));
    expect(screen.getAllByRole("button", { name: /previous/i })[0]).toBeDisabled();
  });

  it("shows total count in pagination", async () => {
    mockAxiosGet.mockResolvedValue({
      data: { success: true, data: allReports, pages: 2, total: 15 },
    });
    render(<AdminReportsPage />);
    await waitFor(() => {
      const spans = document.querySelectorAll("span.text-sm.text-gray-500");
      const found = Array.from(spans).some(s => s.textContent?.includes("15"));
      expect(found).toBe(true);
    });
  });
});