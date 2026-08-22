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

export function ChartLoader({ summary }: { summary: PeriodSummary }) {
  return <SummaryCharts summary={summary} />;
}
