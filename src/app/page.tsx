import { AppHeader } from "@/components/app-header";
import { DayDetail } from "@/components/day-detail";
import { PeriodNavigation } from "@/components/period-navigation";
import { WeekCalendar } from "@/components/week-calendar";
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
} from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; quick?: string }>;
}) {
  const config = getAppConfig();
  const user = await requireOwner();
  const today = todayInTimeZone(config.timezone);
  const params = await searchParams;
  const requestedDate = params.date;
  const anchor =
    requestedDate && isDateKey(requestedDate) ? requestedDate : today;
  const range = getPeriodRange(anchor, "week", config.weekStart);
  const dates = enumerateDates(range);
  const entries = await getEntries(user.id, range.start, range.end);
  const selectedEntry = entries.find((entry) => entry.entry_date === anchor);
  const previous = shiftPeriod(range.start, "week", -1);
  const next = shiftPeriod(range.start, "week", 1);
  const quickHabitKey = config.habits.some(
    (habit) => habit.key === params.quick,
  )
    ? params.quick
    : undefined;
  const loggedDays = entries.filter((entry) =>
    Object.values(entry.habit_values).some((value) => value !== null),
  ).length;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-7 sm:pb-12">
      <AppHeader active="calendar" />
      <section className="mb-5 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="eyebrow text-emerald-700">Your week</p>
          <h1 className="display-title mt-1 text-[2.7rem] leading-[0.92] sm:text-5xl">
            Small wins,
            <br />
            <span className="text-emerald-600">beautifully kept.</span>
          </h1>
        </div>
        <div className="hidden rounded-3xl bg-[#dfff9b] px-4 py-3 text-right text-[#173b2d] sm:block">
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
        editable={anchor <= today}
        quickHabitKey={quickHabitKey}
      />
    </main>
  );
}
