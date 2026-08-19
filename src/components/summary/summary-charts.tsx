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

const lineColors = ["#7055d6", "#e66f8a", "#569fd8"];
const tooltipStyle = {
  backgroundColor: "rgba(35, 25, 68, 0.94)",
  borderWidth: 0,
  padding: [10, 12],
  textStyle: { color: "#fff", fontWeight: 600 },
  extraCssText:
    "border-radius: 12px; box-shadow: 0 12px 28px rgba(45, 29, 93, 0.22);",
};
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
    animationDuration: 900,
    animationEasing: "cubicOut",
    grid: { left: 42, right: 14, top: 52, bottom: 40 },
    legend: {
      top: 0,
      data: ["Logged", "Target"],
      icon: "circle",
      itemWidth: 9,
      itemHeight: 9,
      textStyle: { color: "#6b647d", fontWeight: 600 },
    },
    tooltip: {
      ...tooltipStyle,
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        shadowStyle: { color: "rgba(112, 85, 214, 0.07)" },
      },
    },
    xAxis: {
      type: "category",
      data: summary.durations.map((item) => item.label),
      axisLabel: { color: "#6b647d", fontWeight: 600, interval: 0 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9a93aa" },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: "#ebe7f4", type: "dashed", width: 1 },
      },
    },
    series: [
      {
        name: "Target",
        type: "bar",
        data: summary.durations.map((item) => item.targetTotal),
        barMaxWidth: 42,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#e3dcf7" },
              { offset: 1, color: "#f1edf8" },
            ],
          },
          borderRadius: [12, 12, 4, 4],
        },
        z: 1,
      },
      {
        name: "Logged",
        type: "bar",
        data: summary.durations.map((item) => item.total),
        barMaxWidth: 25,
        barGap: "-100%",
        label: {
          show: true,
          position: "top",
          color: "#55418f",
          fontWeight: 800,
          fontSize: 11,
        },
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#9b86f2" },
              { offset: 0.55, color: "#7558d8" },
              { offset: 1, color: "#5840b5" },
            ],
          },
          borderRadius: [12, 12, 4, 4],
          shadowBlur: 12,
          shadowColor: "rgba(88, 64, 181, 0.24)",
          shadowOffsetY: 5,
        },
        z: 2,
      },
    ],
  };

  const lineOption: EChartsCoreOption = {
    aria: { enabled: true },
    animationDuration: 1000,
    animationEasing: "cubicOut",
    color: lineColors,
    grid: { left: 42, right: 18, top: 52, bottom: 40 },
    legend: {
      top: 0,
      type: "scroll",
      icon: "circle",
      itemWidth: 9,
      itemHeight: 9,
      textStyle: { color: "#6b647d", fontWeight: 600 },
    },
    tooltip: {
      ...tooltipStyle,
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: "#b5a7dd", type: "dashed" },
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: summary.trends.map((point) => formatTrendLabel(point.label)),
      axisLabel: { color: "#6b647d", fontWeight: 600, hideOverlap: true },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9a93aa" },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: "#ebe7f4", type: "dashed", width: 1 },
      },
    },
    series: summary.durations.map((habit, index) => {
      const color = lineColors[index % lineColors.length];
      return {
        name: habit.label,
        type: "line",
        smooth: 0.42,
        connectNulls: true,
        showSymbol: summary.trends.length < 40,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color,
          borderColor: "#fff",
          borderWidth: 3,
          shadowBlur: 8,
          shadowColor: `${color}55`,
        },
        lineStyle: {
          width: 3.5,
          color,
          cap: "round",
          shadowBlur: 10,
          shadowColor: `${color}38`,
          shadowOffsetY: 4,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}35` },
              { offset: 1, color: `${color}02` },
            ],
          },
        },
        emphasis: {
          focus: "series",
          lineStyle: { width: 4.5 },
        },
        data: summary.trends.map((point) => point.values[habit.key] ?? 0),
      };
    }),
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {summary.durations.length ? (
        <>
          <article className="surface-card overflow-hidden rounded-[1.65rem] border-violet-100/80 bg-gradient-to-br from-white/90 to-violet-50/65 p-4 sm:p-5">
            <h3 className="font-semibold tracking-[-0.02em]">Minutes vs target</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Total progress for the selected period
            </p>
            <Chart
              option={barOption}
              label="Bar chart comparing logged minutes with target minutes"
            />
          </article>
          <article className="surface-card overflow-hidden rounded-[1.65rem] border-violet-100/80 bg-gradient-to-br from-white/90 to-violet-50/65 p-4 sm:p-5">
            <h3 className="font-semibold tracking-[-0.02em]">Progress over time</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Daily or monthly movement by habit
            </p>
            <Chart option={lineOption} label="Line chart of habit progress over time" />
          </article>
        </>
      ) : null}
      {summary.measurements.map((measurement) => {
        const option: EChartsCoreOption = {
          aria: { enabled: true },
          animationDuration: 1000,
          animationEasing: "cubicOut",
          grid: { left: 48, right: 20, top: 28, bottom: 40 },
          tooltip: {
            ...tooltipStyle,
            trigger: "axis",
            valueFormatter: (value: number) =>
              `${value} ${measurement.unit}`,
            axisPointer: {
              type: "line",
              lineStyle: { color: "#b5a7dd", type: "dashed" },
            },
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: measurement.points.map((point) =>
              formatTrendLabel(point.label),
            ),
            axisLabel: {
              color: "#6b647d",
              fontWeight: 600,
              hideOverlap: true,
            },
            axisLine: { show: false },
            axisTick: { show: false },
          },
          yAxis: {
            type: "value",
            scale: true,
            axisLabel: {
              color: "#9a93aa",
              formatter: `{value} ${measurement.unit}`,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: {
              lineStyle: { color: "#ebe7f4", type: "dashed", width: 1 },
            },
          },
          series: [
            {
              name: measurement.label,
              type: "line",
              smooth: 0.45,
              data: measurement.points.map((point) => point.value),
              showSymbol: true,
              symbol: "circle",
              symbolSize: 9,
              itemStyle: {
                color: "#7457d9",
                borderColor: "#fff",
                borderWidth: 3,
                shadowBlur: 9,
                shadowColor: "rgba(116, 87, 217, 0.35)",
              },
              lineStyle: {
                width: 4,
                color: "#7457d9",
                cap: "round",
                shadowBlur: 12,
                shadowColor: "rgba(116, 87, 217, 0.25)",
                shadowOffsetY: 4,
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(155, 134, 242, 0.38)" },
                    { offset: 1, color: "rgba(217, 244, 233, 0.08)" },
                  ],
                },
              },
            },
          ],
        };

        return (
          <article
            key={measurement.key}
            className="surface-card overflow-hidden rounded-[1.65rem] border-violet-100/80 bg-gradient-to-br from-white/90 to-violet-50/65 p-4 sm:p-5 lg:col-span-2"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-semibold tracking-[-0.02em]">
                  {measurement.label} over time
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daily logged measurements
                </p>
              </div>
              {measurement.latest != null ? (
                <p className="text-right text-xl font-bold tracking-[-0.04em] text-violet-700">
                  {measurement.latest}
                  <span className="ml-1 text-xs font-semibold text-muted-foreground">
                    {measurement.unit}
                  </span>
                </p>
              ) : null}
            </div>
            <Chart
              option={option}
              label={`Line chart for ${measurement.label} over time`}
            />
          </article>
        );
      })}
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
