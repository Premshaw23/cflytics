import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatsCard } from "./StatsCard";
import { LayoutDashboard } from "lucide-react";

describe("StatsCard", () => {
    it("renders the title and value correctly", () => {
        render(
            <StatsCard
                title="Total Problems"
                value={100}
                icon={LayoutDashboard}
            />
        );

        expect(screen.getByText("Total Problems")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("renders the description when provided", () => {
        render(
            <StatsCard
                title="Rating"
                value={1500}
                icon={LayoutDashboard}
                description="Keep going!"
            />
        );

        expect(screen.getByText("Keep going!")).toBeInTheDocument();
    });

    it("renders the trend with correct color class", () => {
        render(
            <StatsCard
                title="Submissions"
                value={50}
                icon={LayoutDashboard}
                trend="+5 today"
                trendColor="text-green-500"
            />
        );

        const trendElement = screen.getByText("+5 today");
        expect(trendElement).toBeInTheDocument();
        expect(trendElement).toHaveClass("text-green-500");
    });
});
