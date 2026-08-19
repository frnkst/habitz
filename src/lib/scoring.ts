import type { DailyEntry } from "@/lib/database.types";
import type {
  HabitDefinition,
  HabitValue,
  HabitValues,
} from "@/lib/habits";
import { isHabitActiveOnDate } from "@/lib/habits";

export type HabitStatus = "open" | "missed" | "done";

export function getHabitStatus(
  habit: HabitDefinition,
  value: HabitValue | undefined,
): HabitStatus {
  if (value === null || value === undefined) {
    return "open";
  }
  if (habit.type === "boolean") {
    return value === true ? "done" : "missed";
  }
  if (habit.type === "measurement") {
    return typeof value === "number" ? "done" : "missed";
  }
  if (typeof value !== "number" || value < habit.target) {
    return "missed";
  }
  return "done";
}

export function getProgress(
  habit: HabitDefinition,
  value: HabitValue | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (habit.type === "boolean") {
    return value === true ? 1 : 0;
  }
  if (habit.type === "measurement") {
    return typeof value === "number" ? 1 : 0;
  }
  return typeof value === "number" ? value / habit.target : 0;
}

export function getDayCounts(
  habits: HabitDefinition[],
  values: HabitValues = {},
): Record<HabitStatus, number> {
  const counts: Record<HabitStatus, number> = {
    open: 0,
    missed: 0,
    done: 0,
  };
  for (const habit of habits) {
    counts[getHabitStatus(habit, values[habit.key])] += 1;
  }
  return counts;
}

export type DurationSummary = {
  key: string;
  label: string;
  unit: string;
  total: number;
  targetTotal: number;
};

export type BooleanSummary = {
  key: string;
  label: string;
  done: number;
  missed: number;
  open: number;
};

export type MeasurementSummary = {
  key: string;
  label: string;
  unit: string;
  latest: number | null;
  change: number | null;
  points: Array<{ label: string; value: number }>;
};

export type TrendPoint = {
  label: string;
  values: Record<string, number>;
};

export type PeriodSummary = {
  durations: DurationSummary[];
  booleans: BooleanSummary[];
  measurements: MeasurementSummary[];
  trends: TrendPoint[];
};

export function summarizeEntries(
  entries: DailyEntry[],
  habits: HabitDefinition[],
  periodDates: string[],
  eligibleDates: string[],
  period: "week" | "month" | "year",
): PeriodSummary {
  const entryByDate = new Map(entries.map((entry) => [entry.entry_date, entry]));
  const durations = habits
    .filter((habit) => habit.type === "duration")
    .map((habit) => {
      const scheduledEligibleDates = eligibleDates.filter((date) =>
        isHabitActiveOnDate(habit, date),
      );
      const scheduledPeriodDates = periodDates.filter((date) =>
        isHabitActiveOnDate(habit, date),
      );
      const total = scheduledEligibleDates.reduce((sum, date) => {
        const value = entryByDate.get(date)?.habit_values[habit.key];
        return sum + (typeof value === "number" ? value : 0);
      }, 0);
      return {
        key: habit.key,
        label: habit.label,
        unit: habit.unit,
        total,
        targetTotal: habit.target * scheduledPeriodDates.length,
      };
    });

  const booleans = habits
    .filter((habit) => habit.type === "boolean")
    .map((habit) => {
      let done = 0;
      let missed = 0;
      let open = 0;
      for (const date of eligibleDates) {
        if (!isHabitActiveOnDate(habit, date)) continue;
        const value = entryByDate.get(date)?.habit_values[habit.key];
        if (value === true) done += 1;
        else if (value === false) missed += 1;
        else open += 1;
      }
      return { key: habit.key, label: habit.label, done, missed, open };
    });

  const measurements = habits
    .filter((habit) => habit.type === "measurement")
    .map((habit) => {
      const points = eligibleDates.flatMap((date) => {
        if (!isHabitActiveOnDate(habit, date)) return [];
        const value = entryByDate.get(date)?.habit_values[habit.key];
        return typeof value === "number" ? [{ label: date, value }] : [];
      });
      const first = points[0]?.value;
      const latest = points.at(-1)?.value;
      return {
        key: habit.key,
        label: habit.label,
        unit: habit.unit,
        latest: latest ?? null,
        change:
          points.length >= 2 && first !== undefined && latest !== undefined
            ? Number((latest - first).toFixed(4))
            : null,
        points,
      };
    });

  const grouped = new Map<string, Record<string, number>>();
  for (const date of eligibleDates) {
    const group = period === "year" ? date.slice(0, 7) : date;
    const values = grouped.get(group) ?? {};
    const entry = entryByDate.get(date);
    for (const habit of habits) {
      if (
        habit.type !== "duration" ||
        !isHabitActiveOnDate(habit, date)
      ) {
        continue;
      }
      const value = entry?.habit_values[habit.key];
      values[habit.key] =
        (values[habit.key] ?? 0) + (typeof value === "number" ? value : 0);
    }
    grouped.set(group, values);
  }

  return {
    durations,
    booleans,
    measurements,
    trends: Array.from(grouped, ([label, values]) => ({ label, values })),
  };
}
