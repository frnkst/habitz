import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { DataUnavailable } from "@/components/data-unavailable";
import { PeriodNavigation } from "@/components/period-navigation";
import {
  ChartLoader,
  InvestmentChartLoader,
} from "@/components/summary/chart-loader";
import { requireOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { getEntries } from "@/lib/data";
import type { DailyEntry } from "@/lib/database.types";
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
import { getMotivation } from "@/lib/motivation";
import { isServiceUnavailableError } from "@/lib/retry";

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
  let user;
  try {
    user = await requireOwner();
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return <DataUnavailable />;
    }
    throw error;
  }
  const today = todayInTimeZone(config.timezone);
  const period = isPeriod(params.period) ? params.period : "week";
  const anchor = params.date && isDateKey(params.date) ? params.date : today;
  const range = getPeriodRange(anchor, period, config.weekStart);
  const dates = enumerateDates(range);
  const eligibleDates = dates.filter((date) => date <= today);
  let entries: DailyEntry[];
  try {
    entries = await getEntries(user.id, range.start, range.end);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return <DataUnavailable />;
    }
    throw error;
  }
  const summary = summarizeEntries(
    entries,
    config.habits,
    dates,
    eligibleDates,
    period,
  );
  const previous = shiftPeriod(range.start, period, -1);
  const next = shiftPeriod(range.start, period, 1);
  const totalMinutes = summary.durations.reduce(
    (total, habit) => total + habit.total,
    0,
  );
  const doneChoices = summary.booleans.reduce(
    (total, habit) => total + habit.done,
    0,
  );
  const motivation = getMotivation(entries, config.habits, dates, today);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-7 sm:pb-12">
      <AppHeader active="summary" />
      <section className="mb-5 px-1">
          <p className="eyebrow text-violet-700">
            Your momentum
          </p>
          <h1 className="display-title mt-1 text-[2.7rem] leading-[1.04] sm:text-5xl">
            {motivation.summary[0]}
            <br />
            <span className="bg-gradient-to-r from-[#7457d9] to-[#a17ce6] bg-clip-text text-transparent">
              {motivation.summary[1]}
            </span>
          </h1>
      </section>
      <section className="glass-panel rounded-[1.85rem] p-3.5 sm:p-6">
        <nav
          className="mb-6 grid grid-cols-3 rounded-[1rem] bg-[#eee8ff] p-1"
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
                  ? "bg-gradient-to-br from-[#7457d9] to-[#9b86f2] text-white shadow-md shadow-violet-950/15"
                  : "text-muted-foreground hover:bg-white/45 hover:text-violet-950",
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
        <div className="relative isolate overflow-hidden border-y border-violet-200/75 py-7 sm:py-10">
          <div className="absolute top-1/2 left-1/4 -z-10 size-40 -translate-y-1/2 rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 -z-10 size-40 -translate-y-1/2 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="grid grid-cols-2">
            <article className="relative px-2 text-center after:absolute after:top-2 after:right-0 after:h-[calc(100%-1rem)] after:w-px after:bg-gradient-to-b after:from-transparent after:via-violet-300 after:to-transparent sm:px-6">
              <p className="bg-gradient-to-br from-[#5233bd] via-[#795ae2] to-[#b082e9] bg-clip-text text-5xl font-extrabold tracking-[-0.08em] text-transparent sm:text-7xl">
                {totalMinutes}
              </p>
              <p className="mt-2 text-xs font-extrabold tracking-[0.13em] text-violet-900 uppercase">
                Minutes invested
              </p>
              <p className="mt-1 text-[10px] font-semibold text-muted-foreground sm:text-xs">
                Focus, movement, and calm
              </p>
            </article>
            <article className="px-2 text-center sm:px-6">
              <p className="bg-gradient-to-br from-[#187e5a] via-[#28aa79] to-[#79cfb2] bg-clip-text text-5xl font-extrabold tracking-[-0.08em] text-transparent sm:text-7xl">
                {doneChoices}
              </p>
              <p className="mt-2 text-xs font-extrabold tracking-[0.13em] text-emerald-900 uppercase">
                Positive choices
              </p>
              <p className="mt-1 text-[10px] font-semibold text-muted-foreground sm:text-xs">
                Intentions turned into action
              </p>
            </article>
          </div>
        </div>
        <article className="surface-card mt-5 overflow-hidden rounded-[1.65rem] border-violet-100/80 bg-gradient-to-br from-white/90 to-violet-50/65 p-4 sm:p-5">
          <h3 className="font-semibold tracking-[-0.02em]">
            Your investment
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Time invested and positive choices this period
          </p>
          <InvestmentChartLoader
            totalMinutes={totalMinutes}
            positiveChoices={doneChoices}
          />
        </article>
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

      <section className="mt-8" aria-labelledby="habit-totals">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2
            id="habit-totals"
            className="text-xl font-bold tracking-[-0.04em]"
          >
            By habit
          </h2>
          <p className="text-[11px] font-semibold text-muted-foreground">
            Full-period targets
          </p>
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
                {habit.done}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  / {habit.done + habit.missed + habit.open} days
                </span>
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {habit.missed} missed · {habit.open} open
              </p>
            </article>
          ))}
          {summary.measurements.map((habit) => (
            <article
              key={habit.key}
              className="surface-card rounded-[1.35rem] p-4"
            >
              <p className="truncate text-xs font-medium text-muted-foreground">
                {habit.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-[-0.05em]">
                {habit.latest ?? "—"}
                {habit.latest != null ? (
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    {habit.unit}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {habit.change == null
                  ? "No change yet"
                  : `${habit.change > 0 ? "+" : ""}${habit.change} ${habit.unit} this period`}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
