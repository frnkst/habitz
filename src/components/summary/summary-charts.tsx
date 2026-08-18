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
import { formatTrendLabel } from "@/lib/dates";

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
const pieColors = [
  {
    face: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: "#9a86f4" },
        { offset: 1, color: "#6247c8" },
      ],
    },
    depth: "#49339e",
  },
  {
    face: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: "#ff9a9f" },
        { offset: 1, color: "#d85d69" },
      ],
    },
    depth: "#a93e49",
  },
  {
    face: {
      type: "linear",
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: "#d8dce8" },
        { offset: 1, color: "#aeb6c9" },
      ],
    },
    depth: "#858da2",
  },
] as const;

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
      data: summary.trends.map((point) => formatTrendLabel(point.label)),
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
      {summary.booleans.map((habit) => {
        const values = [
          { name: "Done", value: habit.done },
          { name: "Missed", value: habit.missed },
          { name: "Open", value: habit.open },
        ];
        const option: EChartsCoreOption = {
          aria: { enabled: true },
          tooltip: {
            trigger: "item",
            formatter: "{b}: <strong>{c}</strong> days ({d}%)",
            backgroundColor: "rgba(35, 25, 68, 0.94)",
            borderWidth: 0,
            textStyle: { color: "#fff" },
          },
          legend: {
            bottom: 0,
            itemWidth: 10,
            itemHeight: 10,
            icon: "circle",
            textStyle: { color: "#64748b", fontWeight: 600 },
          },
          series: [
            {
              name: `${habit.label} depth`,
              type: "pie",
              radius: "63%",
              center: ["50%", "48%"],
              startAngle: 25,
              silent: true,
              animation: false,
              tooltip: { show: false },
              label: { show: false },
              labelLine: { show: false },
              itemStyle: {
                borderColor: "#7560bf",
                borderWidth: 1,
                shadowBlur: 22,
                shadowColor: "rgba(45, 29, 93, 0.28)",
                shadowOffsetY: 10,
              },
              data: values.map((item, colorIndex) => ({
                ...item,
                itemStyle: { color: pieColors[colorIndex].depth },
              })),
              z: 1,
            },
            {
              name: habit.label,
              type: "pie",
              radius: "63%",
              center: ["50%", "43%"],
              startAngle: 25,
              avoidLabelOverlap: true,
              minAngle: 3,
              padAngle: 2,
              label: {
                formatter: "{c}",
                color: "#40375a",
                fontSize: 12,
                fontWeight: 800,
              },
              labelLine: {
                length: 8,
                length2: 6,
                lineStyle: { color: "#aaa0c5" },
              },
              itemStyle: {
                borderColor: "rgba(255, 255, 255, 0.9)",
                borderWidth: 2,
                borderRadius: 5,
              },
              emphasis: {
                scale: true,
                scaleSize: 7,
                itemStyle: {
                  shadowBlur: 18,
                  shadowColor: "rgba(74, 52, 143, 0.35)",
                },
              },
              data: values.map((item, colorIndex) => ({
                ...item,
                itemStyle: { color: pieColors[colorIndex].face },
              })),
              z: 2,
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
              label={`3D pie chart for ${habit.label}: ${habit.done} done, ${habit.missed} missed, ${habit.open} open`}
            />
          </article>
        );
      })}
    </div>
  );
}
