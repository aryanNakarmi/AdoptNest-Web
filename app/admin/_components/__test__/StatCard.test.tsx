import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "../StatCard";

// react-icons/hi2 is ESM — mock it
jest.mock("react-icons/hi2", () => ({
  HiArrowTrendingUp: () => React.createElement("span", { "data-testid": "trend-icon" }),
}));

const baseProps = {
  title: "Total Reports",
  value: 42,
  icon: React.createElement("span", { "data-testid": "stat-icon" }, "🐾"),
  color: "blue" as const,
};

// =============================================================================
// RENDERING
// =============================================================================
describe("StatCard — rendering", () => {
  it("renders the title", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText("Total Reports")).toBeInTheDocument();
  });

  it("renders a numeric value", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a string value", () => {
    render(<StatCard {...baseProps} value="99%" />);
    expect(screen.getByText("99%")).toBeInTheDocument();
  });

  it("renders the icon slot", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByTestId("stat-icon")).toBeInTheDocument();
  });
});

// =============================================================================
// TREND
// =============================================================================
describe("StatCard — trend", () => {
  it("renders trend icon and label when both trend and trendLabel are provided", () => {
    render(<StatCard {...baseProps} trend={5} trendLabel="this week" />);
    expect(screen.getByTestId("trend-icon")).toBeInTheDocument();
    expect(screen.getByText("+5 this week")).toBeInTheDocument();
  });

  it("does NOT render trend section when trend is undefined", () => {
    render(<StatCard {...baseProps} trendLabel="this week" />);
    expect(screen.queryByTestId("trend-icon")).not.toBeInTheDocument();
  });

  it("does NOT render trend section when trendLabel is missing", () => {
    render(<StatCard {...baseProps} trend={5} />);
    expect(screen.queryByTestId("trend-icon")).not.toBeInTheDocument();
  });

  it("renders trend value of 0 correctly", () => {
    render(<StatCard {...baseProps} trend={0} trendLabel="new" />);
    expect(screen.getByText("+0 new")).toBeInTheDocument();
  });
});

// =============================================================================
// SUBTEXT
// =============================================================================
describe("StatCard — subtext", () => {
  it("renders subtext when provided", () => {
    render(<StatCard {...baseProps} subtext="Compared to last month" />);
    expect(screen.getByText("Compared to last month")).toBeInTheDocument();
  });

  it("does NOT render subtext when not provided", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.queryByText("Compared to last month")).not.toBeInTheDocument();
  });
});

// =============================================================================
// COLORS
// =============================================================================
describe("StatCard — color variants", () => {
  const colors = ["blue", "orange", "green", "red", "purple", "indigo"] as const;

  colors.forEach((color) => {
    it(`renders without crashing with color="${color}"`, () => {
      render(<StatCard {...baseProps} color={color} />);
      expect(screen.getByText("Total Reports")).toBeInTheDocument();
    });
  });
});

// =============================================================================
// COMBINED PROPS
// =============================================================================
describe("StatCard — combined props", () => {
  it("renders title, value, trend and subtext together", () => {
    render(
      <StatCard
        {...baseProps}
        trend={10}
        trendLabel="reports"
        subtext="Since last week"
      />
    );
    expect(screen.getByText("Total Reports")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("+10 reports")).toBeInTheDocument();
    expect(screen.getByText("Since last week")).toBeInTheDocument();
  });
});