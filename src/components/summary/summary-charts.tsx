"use client";

import { useEffect, useRef } from "react";
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  init,
  use as registerECharts,
  type ECharts,
  type EChartsCoreOption,
} from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import type { PeriodSummary } from "@/lib/scoring";

registerECharts([
  AriaComponent,
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  TooltipComponent,
]);

const palette = ["#1fac72", "#a9c83d", "#173b2d", "#4fc3a1", "#d1e85b"];

function Chart({
  option,
  label,
  className = "h-72",
}: {
  option: EChartsCoreOption;
  label: string;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const chart = init(elementRef.current, undefined, { renderer: "canvas" });
    chartRef.current = chart;
    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [option]);

  return <div ref={elementRef} className={className} role="img" aria-label={label} />;
}

export function SummaryCharts({ summary }: { summary: PeriodSummary }) {
  const barOption: EChartsCoreOption = {
    aria: { enabled: true },
    color: ["#1fac72", "#dfe8df"],
    grid: { left: 44, right: 16, top: 38, bottom: 42 },
    legend: { top: 0, textStyle: { color: "#64748b" } },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: summary.durations.map((item) => item.label),
      axisLabel: { color: "#64748b", interval: 0 },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { color: "#eef2f1" } },
    },
    series: [
      {
        name: "Logged",
        type: "bar",
        data: summary.durations.map((item) => item.total),
        barMaxWidth: 34,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
      {
        name: "Target",
        type: "bar",
        data: summary.durations.map((item) => item.targetTotal),
        barMaxWidth: 34,
        itemStyle: { borderRadius: [8, 8, 0, 0] },
      },
    ],
  };

  const lineOption: EChartsCoreOption = {
    aria: { enabled: true },
    color: palette,
    grid: { left: 44, right: 18, top: 42, bottom: 42 },
    legend: { top: 0, type: "scroll", textStyle: { color: "#64748b" } },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: summary.trends.map((point) => point.label),
      axisLabel: { color: "#64748b", hideOverlap: true },
      axisLine: { lineStyle: { color: "#e2e8f0" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64748b" },
      splitLine: { lineStyle: { color: "#eef2f1" } },
    },
    series: summary.durations.map((habit, index) => ({
      name: habit.label,
      type: "line",
      smooth: true,
      showSymbol: summary.trends.length < 40,
      symbolSize: 7,
      lineStyle: { width: 3 },
      areaStyle: { opacity: index === 0 ? 0.08 : 0 },
      data: summary.trends.map((point) => point.values[habit.key] ?? 0),
    })),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {summary.durations.length ? (
        <>
          <article className="surface-card rounded-[1.65rem] p-4 sm:p-5">
            <h3 className="font-semibold tracking-[-0.02em]">Minutes vs target</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Total progress for the selected period
            </p>
            <Chart
              option={barOption}
              label="Bar chart comparing logged minutes with target minutes"
            />
          </article>
          <article className="surface-card rounded-[1.65rem] p-4 sm:p-5">
            <h3 className="font-semibold tracking-[-0.02em]">Progress over time</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Daily or monthly movement by habit
            </p>
            <Chart option={lineOption} label="Line chart of habit progress over time" />
          </article>
        </>
      ) : null}
      {summary.booleans.map((habit, index) => {
        const option: EChartsCoreOption = {
          aria: { enabled: true },
          color: [palette[index % palette.length], "#fda4af", "#e2e8f0"],
          tooltip: { trigger: "item" },
          legend: { bottom: 0, textStyle: { color: "#64748b" } },
          series: [
            {
              name: habit.label,
              type: "pie",
              radius: ["48%", "72%"],
              center: ["50%", "44%"],
              avoidLabelOverlap: true,
              label: { formatter: "{c}", fontWeight: 700 },
              data: [
                { name: "Done", value: habit.done },
                { name: "Missed", value: habit.missed },
                { name: "Open", value: habit.open },
              ],
            },
          ],
        };
        return (
          <article
            key={habit.key}
            className="surface-card rounded-[1.65rem] p-4 sm:p-5"
          >
            <h3 className="font-semibold tracking-[-0.02em]">{habit.label}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Done, missed, and open days
            </p>
            <Chart
              option={option}
              label={`Donut chart for ${habit.label}: ${habit.done} done, ${habit.missed} missed, ${habit.open} open`}
            />
          </article>
        );
      })}
    </div>
  );
}
