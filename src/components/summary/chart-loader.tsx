"use client";

import dynamic from "next/dynamic";

import { HabitzLoader } from "@/components/habitz-loader";
import type { PeriodSummary } from "@/lib/scoring";

const SummaryCharts = dynamic(
  () => import("./summary-charts").then((module) => module.SummaryCharts),
  {
    ssr: false,
    loading: () => (
      <div className="glass-panel flex min-h-72 items-center justify-center rounded-[1.65rem]">
        <HabitzLoader label="Drawing your progress" />
      </div>
    ),
  },
);

const InvestmentChart = dynamic(
  () => import("./summary-charts").then((module) => module.InvestmentChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-64 items-center justify-center">
        <HabitzLoader label="Drawing your overview" />
      </div>
    ),
  },
);

export function ChartLoader({ summary }: { summary: PeriodSummary }) {
  return <SummaryCharts summary={summary} />;
}

export function InvestmentChartLoader({
  summary,
  period,
}: {
  summary: PeriodSummary;
  period: "week" | "month" | "year";
}) {
  return <InvestmentChart points={summary.investments} period={period} />;
}
