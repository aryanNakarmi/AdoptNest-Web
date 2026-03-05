import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PostReportPage from "../page";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => React.createElement("img", { src, alt }),
}));

jest.mock("react-toastify", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

jest.mock("react-icons/hi", () => ({
  HiCamera: () => React.createElement("span", null, "📷"),
  HiX:      () => React.createElement("span", null, "✕"),
}));

// Mock MapLocationPicker — complex Leaflet component, just render a simple div
jest.mock("../_components/MapLocationPicker", () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (loc: any) => void }) =>
    React.createElement(
      "div",
      { "data-testid": "map-picker" },
      React.createElement("button", {
        type: "button",
        onClick: () =>
          onChange({ address: "Kathmandu, Nepal", lat: 27.7172, lng: 85.324 }),
      }, "Select Location")
    ),
}));

const mockUploadReportPhoto = jest.fn();
const mockCreateReport      = jest.fn();

jest.mock("@/lib/api/animal-report/animal-report", () => ({
  uploadReportPhoto: (...args: any[]) => mockUploadReportPhoto(...args),
  createReport:      (...args: any[]) => mockCreateReport(...args),
}));

// jsdom does not implement URL.createObjectURL — mock it globally
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUploadReportPhoto.mockResolvedValue({ success: true, data: "/uploads/photo.jpg" });
  mockCreateReport.mockResolvedValue({ success: true });
});

// helper — simulate selecting a photo file
const selectPhoto = () => {
  const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  return file;
};

// =============================================================================
// RENDERING
// =============================================================================
describe("PostReportPage — rendering", () => {
  it("renders Report an Animal heading", () => {
    render(<PostReportPage />);
    expect(screen.getByText("Report an Animal")).toBeInTheDocument();
  });

  it("renders Photo upload area", () => {
    render(<PostReportPage />);
    expect(screen.getByText("Click to select a photo")).toBeInTheDocument();
  });

  it("renders Animal Species input", () => {
    render(<PostReportPage />);
    expect(screen.getByPlaceholderText("e.g., Dog, Cat, Bird, Cow")).toBeInTheDocument();
  });

  it("renders Location map picker", () => {
    render(<PostReportPage />);
    expect(screen.getByTestId("map-picker")).toBeInTheDocument();
  });

  it("renders Description textarea", () => {
    render(<PostReportPage />);
    expect(
      screen.getByPlaceholderText(/describe the animal/i)
    ).toBeInTheDocument();
  });

  it("renders Submit Report button", () => {
    render(<PostReportPage />);
    expect(screen.getByRole("button", { name: "Submit Report" })).toBeInTheDocument();
  });

  it("renders Clear Form button", () => {
    render(<PostReportPage />);
    expect(screen.getByRole("button", { name: "Clear Form" })).toBeInTheDocument();
  });

  it("Submit button is disabled initially", () => {
    render(<PostReportPage />);
    expect(screen.getByRole("button", { name: "Submit Report" })).toBeDisabled();
  });
});

// =============================================================================
// PHOTO UPLOAD
// =============================================================================
describe("PostReportPage — photo upload", () => {
  it("shows uploading state after selecting photo", async () => {
    mockUploadReportPhoto.mockImplementation(() => new Promise(() => {}));
    render(<PostReportPage />);
    selectPhoto();
    await waitFor(() =>
      expect(screen.getByText("Uploading photo...")).toBeInTheDocument()
    );
  });

  it("shows success message after photo uploads", async () => {
    render(<PostReportPage />);
    selectPhoto();
    await waitFor(() =>
      expect(screen.getByText("✓ Photo uploaded successfully")).toBeInTheDocument()
    );
  });

  it("calls uploadReportPhoto with the selected file", async () => {
    render(<PostReportPage />);
    selectPhoto();
    await waitFor(() => expect(mockUploadReportPhoto).toHaveBeenCalledTimes(1));
    expect(mockUploadReportPhoto.mock.calls[0][0]).toBeInstanceOf(File);
  });

  it("shows remove button after photo selected", async () => {
    render(<PostReportPage />);
    selectPhoto();
    await waitFor(() =>
      expect(screen.getByText("✓ Photo uploaded successfully")).toBeInTheDocument()
    );
    // The HiX remove button appears on the preview
    expect(document.querySelector("button .\\✕") || screen.getByText("✕")).toBeInTheDocument();
  });
});

// =============================================================================
// SPECIES INPUT
// =============================================================================
describe("PostReportPage — species input", () => {
  it("accepts text input for species", () => {
    render(<PostReportPage />);
    const input = screen.getByPlaceholderText("e.g., Dog, Cat, Bird, Cow");
    fireEvent.change(input, { target: { value: "Dog" } });
    expect(input).toHaveValue("Dog");
  });
});

// =============================================================================
// DESCRIPTION
// =============================================================================
describe("PostReportPage — description", () => {
  it("accepts text in description textarea", () => {
    render(<PostReportPage />);
    const textarea = screen.getByPlaceholderText(/describe the animal/i);
    fireEvent.change(textarea, { target: { value: "Injured near temple" } });
    expect(textarea).toHaveValue("Injured near temple");
  });

  it("shows character count", () => {
    render(<PostReportPage />);
    const textarea = screen.getByPlaceholderText(/describe the animal/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    expect(screen.getByText("5/500 characters")).toBeInTheDocument();
  });

  it("shows 0/500 characters initially", () => {
    render(<PostReportPage />);
    expect(screen.getByText("0/500 characters")).toBeInTheDocument();
  });
});

// =============================================================================
// CLEAR FORM
// =============================================================================
describe("PostReportPage — clear form", () => {
  it("clears species input when Clear Form is clicked", async () => {
    render(<PostReportPage />);
    const input = screen.getByPlaceholderText("e.g., Dog, Cat, Bird, Cow");
    fireEvent.change(input, { target: { value: "Dog" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear Form" }));
    expect(input).toHaveValue("");
  });

  it("clears description when Clear Form is clicked", async () => {
    render(<PostReportPage />);
    const textarea = screen.getByPlaceholderText(/describe the animal/i);
    fireEvent.change(textarea, { target: { value: "Some description" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear Form" }));
    expect(textarea).toHaveValue("");
  });
});

// =============================================================================
// FORM VALIDATION (toast errors)
// =============================================================================
describe("PostReportPage — validation", () => {
  it("shows error toast when submitting without species", async () => {
    const { toast } = require("react-toastify");
    render(<PostReportPage />);
    // Enable submit by making the button not disabled via direct click attempt
    const btn = screen.getByRole("button", { name: "Submit Report" });
    // button is disabled — fire submit on the form directly
    const form = btn.closest("form")!;
    fireEvent.submit(form);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Please enter animal species")
    );
  });
});

// =============================================================================
// SUCCESSFUL SUBMISSION
// =============================================================================
describe("PostReportPage — successful submit", () => {
  it("calls createReport with correct data and redirects to /user/my-reports", async () => {
    render(<PostReportPage />);

    // 1. Upload photo
    selectPhoto();
    await waitFor(() =>
      expect(screen.getByText("✓ Photo uploaded successfully")).toBeInTheDocument()
    );

    // 2. Fill species
    fireEvent.change(screen.getByPlaceholderText("e.g., Dog, Cat, Bird, Cow"), {
      target: { value: "Dog" },
    });

    // 3. Select location via mock button
    fireEvent.click(screen.getByText("Select Location"));

    // 4. Submit
    fireEvent.submit(screen.getByRole("button", { name: "Submit Report" }).closest("form")!);

    await waitFor(() =>
      expect(mockCreateReport).toHaveBeenCalledWith({
        species: "Dog",
        location: { address: "Kathmandu, Nepal", lat: 27.7172, lng: 85.324 },
        description: "",
        imageUrl: "/uploads/photo.jpg",
      })
    );

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/user/my-reports"));
  });
});