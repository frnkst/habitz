"use client";

import dynamic from "next/dynamic";

import type { PeriodSummary } from "@/lib/scoring";

const SummaryCharts = dynamic(
  () => import("./summary-charts").then((module) => module.SummaryCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading charts">
        <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    ),
  },
);

export function ChartLoader({ summary }: { summary: PeriodSummary }) {
  return <SummaryCharts summary={summary} />;
}
