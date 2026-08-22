import { AppHeader } from "@/components/app-header";
import { DataUnavailable } from "@/components/data-unavailable";
import { DayDetail } from "@/components/day-detail";
import { PeriodNavigation } from "@/components/period-navigation";
import { WeekCalendar } from "@/components/week-calendar";
import { requireOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import {
  getEntries,
  getPreviousHabitValues,
} from "@/lib/data";
import type { DailyEntry } from "@/lib/database.types";
import {
  enumerateDates,
  formatPeriodLabel,
  getPeriodRange,
  isDateKey,
  shiftPeriod,
  todayInTimeZone,
} from "@/lib/dates";
import { getMotivation } from "@/lib/motivation";
import { getHabitsForDate, type HabitValues } from "@/lib/habits";
import { isServiceUnavailableError } from "@/lib/retry";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; quick?: string }>;
}) {
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
  const params = await searchParams;
  const requestedDate = params.date;
  const anchor =
    requestedDate && isDateKey(requestedDate) ? requestedDate : today;
  const range = getPeriodRange(anchor, "week", config.weekStart);
  const dates = enumerateDates(range);
  const measurementKeys = config.habits
    .filter((habit) => habit.type === "measurement")
    .map((habit) => habit.key);
  let entries: DailyEntry[];
  let previousValues: HabitValues;
  try {
    [entries, previousValues] = await Promise.all([
      getEntries(user.id, range.start, range.end),
      getPreviousHabitValues(user.id, anchor, measurementKeys),
    ]);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return <DataUnavailable />;
    }
    throw error;
  }
  const selectedEntry = entries.find((entry) => entry.entry_date === anchor);
  const previous = shiftPeriod(range.start, "week", -1);
  const next = shiftPeriod(range.start, "week", 1);
  const activeHabits = getHabitsForDate(config.habits, anchor);
  const quickHabitKey = activeHabits.some(
    (habit) => habit.key === params.quick,
  )
    ? params.quick
    : undefined;
  const loggedDays = entries.filter((entry) =>
    getHabitsForDate(config.habits, entry.entry_date).some(
      (habit) => entry.habit_values[habit.key] != null,
    ),
  ).length;
  const motivation = getMotivation(entries, config.habits, dates, today);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-7 sm:pb-12">
      <AppHeader active="calendar" />
      <section className="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="eyebrow text-violet-700">Your week</p>
          <h1 className="display-title mt-1 text-[2.7rem] leading-[1.04] sm:text-5xl">
            {motivation.calendar[0]}
            <br />
            <span className="bg-gradient-to-r from-[#7457d9] to-[#a17ce6] bg-clip-text text-transparent">
              {motivation.calendar[1]}
            </span>
          </h1>
        </div>
        <div className="hidden rounded-3xl bg-[#d9f4e9] px-4 py-3 text-right text-[#285e4c] shadow-sm shadow-emerald-950/5 sm:block">
          <p className="text-2xl font-bold tracking-[-0.05em]">{loggedDays}/7</p>
          <p className="text-[10px] font-bold tracking-wider uppercase opacity-65">days logged</p>
        </div>
      </section>
      <section className="glass-panel rounded-[1.85rem] p-3.5 sm:p-6">
        <PeriodNavigation
          label={formatPeriodLabel(range, "week")}
          previousHref={`/?date=${previous}`}
          nextHref={`/?date=${next}`}
          todayHref="/"
        />
        <div className="mt-6">
          <WeekCalendar
            dates={dates}
            entries={entries}
            habits={config.habits}
            selectedDate={anchor}
            today={today}
          />
        </div>
      </section>
      <DayDetail
        date={anchor}
        entry={selectedEntry}
        habits={config.habits}
        previousValues={previousValues}
        editable={anchor <= today}
        quickHabitKey={quickHabitKey}
      />
    </main>
  );
}
