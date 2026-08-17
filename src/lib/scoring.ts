import type { DailyEntry } from "@/lib/database.types";
import type {
  HabitDefinition,
  HabitValue,
  HabitValues,
} from "@/lib/habits";

export type HabitStatus =
  | "open"
  | "missed"
  | "partial"
  | "achieved"
  | "exceeded";

export function getHabitStatus(
  habit: HabitDefinition,
  value: HabitValue | undefined,
): HabitStatus {
  if (value === null || value === undefined) {
    return "open";
  }
  if (habit.type === "boolean") {
    return value === true ? "achieved" : "missed";
  }
  if (typeof value !== "number" || value <= 0) {
    return "missed";
  }
  if (value >= habit.target * 2) {
    return "exceeded";
  }
  if (value >= habit.target) {
    return "achieved";
  }
  return "partial";
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
  return typeof value === "number" ? value / habit.target : 0;
}

export function getDayCounts(
  habits: HabitDefinition[],
  values: HabitValues = {},
): Record<HabitStatus, number> {
  const counts: Record<HabitStatus, number> = {
    open: 0,
    missed: 0,
    partial: 0,
    achieved: 0,
    exceeded: 0,
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
  achieved: number;
  missed: number;
  open: number;
};

export type TrendPoint = {
  label: string;
  values: Record<string, number>;
};

export type PeriodSummary = {
  durations: DurationSummary[];
  booleans: BooleanSummary[];
  trends: TrendPoint[];
};

export function summarizeEntries(
  entries: DailyEntry[],
  habits: HabitDefinition[],
  eligibleDates: string[],
  period: "week" | "month" | "year",
): PeriodSummary {
  const entryByDate = new Map(entries.map((entry) => [entry.entry_date, entry]));
  const durations = habits
    .filter((habit) => habit.type === "duration")
    .map((habit) => {
      const total = eligibleDates.reduce((sum, date) => {
        const value = entryByDate.get(date)?.habit_values[habit.key];
        return sum + (typeof value === "number" ? value : 0);
      }, 0);
      return {
        key: habit.key,
        label: habit.label,
        unit: habit.unit,
        total,
        targetTotal: habit.target * eligibleDates.length,
      };
    });

  const booleans = habits
    .filter((habit) => habit.type === "boolean")
    .map((habit) => {
      let achieved = 0;
      let missed = 0;
      let open = 0;
      for (const date of eligibleDates) {
        const value = entryByDate.get(date)?.habit_values[habit.key];
        if (value === true) achieved += 1;
        else if (value === false) missed += 1;
        else open += 1;
      }
      return { key: habit.key, label: habit.label, achieved, missed, open };
    });

  const grouped = new Map<string, Record<string, number>>();
  for (const date of eligibleDates) {
    const group = period === "year" ? date.slice(0, 7) : date;
    const values = grouped.get(group) ?? {};
    const entry = entryByDate.get(date);
    for (const habit of habits) {
      if (habit.type !== "duration") continue;
      const value = entry?.habit_values[habit.key];
      values[habit.key] =
        (values[habit.key] ?? 0) + (typeof value === "number" ? value : 0);
    }
    grouped.set(group, values);
  }

  return {
    durations,
    booleans,
    trends: Array.from(grouped, ([label, values]) => ({ label, values })),
  };
}
