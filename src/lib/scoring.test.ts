import { describe, expect, it } from "vitest";

import type { DailyEntry } from "@/lib/database.types";
import type { HabitDefinition } from "@/lib/habits";
import {
  getDayCounts,
  getHabitStatus,
  summarizeEntries,
} from "@/lib/scoring";

const habits: HabitDefinition[] = [
  {
    key: "practice",
    label: "Practice",
    type: "duration",
    target: 15,
    unit: "min",
    icon: "activity",
    presets: [5, 15],
  },
  {
    key: "daily-choice",
    label: "Daily choice",
    type: "boolean",
    icon: "check",
  },
];

function entry(date: string, habitValues: DailyEntry["habit_values"]): DailyEntry {
  return {
    id: date,
    user_id: "user",
    entry_date: date,
    habit_values: habitValues,
    created_at: "",
    updated_at: "",
  };
}

describe("habit scoring", () => {
  it("distinguishes open, missed, and done", () => {
    const habit = habits[0];
    expect(getHabitStatus(habit, null)).toBe("open");
    expect(getHabitStatus(habit, 0)).toBe("missed");
    expect(getHabitStatus(habit, 10)).toBe("missed");
    expect(getHabitStatus(habit, 15)).toBe("done");
    expect(getHabitStatus(habit, 30)).toBe("done");
  });

  it("counts a day consistently", () => {
    expect(
      getDayCounts(habits, { practice: 20, "daily-choice": false }),
    ).toEqual({
      open: 0,
      missed: 1,
      done: 1,
    });
  });

  it("aggregates duration and boolean summaries", () => {
    const summary = summarizeEntries(
      [
        entry("2026-08-17", { practice: 20, "daily-choice": true }),
        entry("2026-08-18", { practice: 5, "daily-choice": false }),
      ],
      habits,
      ["2026-08-17", "2026-08-18", "2026-08-19"],
      ["2026-08-17", "2026-08-18", "2026-08-19"],
      "week",
    );
    expect(summary.durations[0]).toMatchObject({
      total: 25,
      targetTotal: 45,
    });
    expect(summary.booleans[0]).toMatchObject({
      done: 1,
      missed: 1,
      open: 1,
    });
  });

  it("does not include entries outside the eligible dates", () => {
    const summary = summarizeEntries(
      [
        entry("2026-08-17", { practice: 15 }),
        entry("2026-08-20", { practice: 90 }),
      ],
      habits,
      ["2026-08-17", "2026-08-18", "2026-08-19"],
      ["2026-08-17"],
      "week",
    );
    expect(summary.durations[0]).toMatchObject({
      total: 15,
      targetTotal: 45,
    });
  });

  it("uses the full week for timed targets on the first day", () => {
    const week = [
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
    ];
    const summary = summarizeEntries(
      [entry("2026-08-17", { practice: 15 })],
      habits,
      week,
      ["2026-08-17"],
      "week",
    );
    expect(summary.durations[0].targetTotal).toBe(105);
    expect(summary.booleans[0]).toMatchObject({
      done: 0,
      missed: 0,
      open: 1,
    });
  });
});
