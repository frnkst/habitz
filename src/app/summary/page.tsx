import Link from "next/link";
import { ArrowUpRight, CircleCheck, Timer } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PeriodNavigation } from "@/components/period-navigation";
import { ChartLoader } from "@/components/summary/chart-loader";
import { requireOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { getEntries } from "@/lib/data";
import {
  enumerateDates,
  formatPeriodLabel,
  getPeriodRange,
  isDateKey,
  shiftPeriod,
  todayInTimeZone,
  type Period,
} from "@/lib/dates";
import { summarizeEntries } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function isPeriod(value: string | undefined): value is Period {
  return value === "week" || value === "month" || value === "year";
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const params = await searchParams;
  const config = getAppConfig();
  const user = await requireOwner();
  const today = todayInTimeZone(config.timezone);
  const period = isPeriod(params.period) ? params.period : "week";
  const anchor = params.date && isDateKey(params.date) ? params.date : today;
  const range = getPeriodRange(anchor, period, config.weekStart);
  const dates = enumerateDates(range);
  const eligibleDates = dates.filter((date) => date <= today);
  const entries = await getEntries(user.id, range.start, range.end);
  const summary = summarizeEntries(
    entries,
    config.habits,
    eligibleDates,
    period,
  );
  const previous = shiftPeriod(range.start, period, -1);
  const next = shiftPeriod(range.start, period, 1);
  const totalMinutes = summary.durations.reduce(
    (total, habit) => total + habit.total,
    0,
  );
  const achievedChoices = summary.booleans.reduce(
    (total, habit) => total + habit.achieved,
    0,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-7 sm:pb-12">
      <AppHeader active="summary" />
      <section className="mb-5 px-1">
          <p className="eyebrow text-emerald-700">
            Your momentum
          </p>
          <h1 className="display-title mt-1 text-[2.7rem] leading-[0.92] sm:text-5xl">
            Progress,
            <br />
            <span className="text-emerald-600">made visible.</span>
          </h1>
      </section>
      <section className="glass-panel rounded-[1.85rem] p-3.5 sm:p-6">
        <nav
          className="mb-6 grid grid-cols-3 rounded-[1rem] bg-[#eef3ec] p-1"
          aria-label="Summary period"
        >
          {(["week", "month", "year"] as const).map((item) => (
            <Link
              key={item}
              href={`/summary?period=${item}&date=${anchor}`}
              aria-current={period === item ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2.5 text-center text-sm font-bold capitalize transition",
                period === item
                  ? "bg-[#173b2d] text-white shadow-md shadow-emerald-950/10"
                  : "text-muted-foreground hover:text-slate-950",
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
        <PeriodNavigation
          label={formatPeriodLabel(range, period)}
          previousHref={`/summary?period=${period}&date=${previous}`}
          nextHref={`/summary?period=${period}&date=${next}`}
          todayHref={`/summary?period=${period}`}
        />
      </section>

      <section className="mt-6" aria-labelledby="period-totals">
        <h2
          id="period-totals"
          className="mb-3 text-xl font-bold tracking-[-0.04em]"
        >
          At a glance
        </h2>
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#173b2d] p-4 text-white shadow-xl shadow-emerald-950/10">
            <Timer className="size-5 text-[#dfff9b]" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.06em]">{totalMinutes}</p>
            <p className="text-[11px] font-semibold text-white/55">minutes invested</p>
            <ArrowUpRight className="absolute top-4 right-4 size-4 text-white/35" />
          </article>
          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#dfff9b] p-4 text-[#173b2d] shadow-xl shadow-lime-900/5">
            <CircleCheck className="size-5" />
            <p className="mt-5 text-3xl font-bold tracking-[-0.06em]">{achievedChoices}</p>
            <p className="text-[11px] font-semibold opacity-60">positive choices</p>
            <ArrowUpRight className="absolute top-4 right-4 size-4 opacity-35" />
          </article>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {summary.durations.map((habit) => (
            <article
              key={habit.key}
              className="surface-card rounded-[1.35rem] p-4"
            >
              <p className="truncate text-xs font-medium text-muted-foreground">
                {habit.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                {habit.total}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  {habit.unit}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {habit.targetTotal} {habit.unit} target
              </p>
            </article>
          ))}
          {summary.booleans.map((habit) => (
            <article
              key={habit.key}
              className="surface-card rounded-[1.35rem] p-4"
            >
              <p className="truncate text-xs font-medium text-muted-foreground">
                {habit.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                {habit.achieved}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  / {habit.achieved + habit.missed + habit.open} days
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {habit.missed} missed · {habit.open} open
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-7" aria-labelledby="visual-summary">
        <h2
          id="visual-summary"
          className="mb-3 text-xl font-bold tracking-[-0.04em]"
        >
          Visual summary
        </h2>
        <ChartLoader summary={summary} />
      </section>

      <details className="surface-card mt-6 rounded-[1.35rem] p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Accessible data table
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 pr-6">Habit</th>
                <th className="pb-2 pr-6">Logged</th>
                <th className="pb-2">Target / eligible</th>
              </tr>
            </thead>
            <tbody>
              {summary.durations.map((habit) => (
                <tr key={habit.key} className="border-t">
                  <td className="py-2 pr-6">{habit.label}</td>
                  <td className="py-2 pr-6">
                    {habit.total} {habit.unit}
                  </td>
                  <td className="py-2">
                    {habit.targetTotal} {habit.unit}
                  </td>
                </tr>
              ))}
              {summary.booleans.map((habit) => (
                <tr key={habit.key} className="border-t">
                  <td className="py-2 pr-6">{habit.label}</td>
                  <td className="py-2 pr-6">{habit.achieved} achieved</td>
                  <td className="py-2">
                    {habit.achieved + habit.missed + habit.open} eligible
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </main>
  );
}
