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
    expect(summary.investments).toEqual([
      { label: "2026-08-17", minutes: 20, choices: 1 },
      { label: "2026-08-18", minutes: 5, choices: 0 },
      { label: "2026-08-19", minutes: 0, choices: 0 },
    ]);
  });

  it("groups monthly investment data by calendar week", () => {
    const dates = [
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-06",
      "2026-09-07",
    ];
    const summary = summarizeEntries(
      [
        entry("2026-08-31", { practice: 15, "daily-choice": true }),
        entry("2026-09-01", { practice: 10, "daily-choice": true }),
        entry("2026-09-07", { practice: 20, "daily-choice": false }),
      ],
      habits,
      dates,
      dates,
      "month",
    );

    expect(summary.investments).toEqual([
      { label: "Week 35", minutes: 0, choices: 0 },
      { label: "Week 36", minutes: 25, choices: 2 },
      { label: "Week 37", minutes: 20, choices: 0 },
    ]);
  });

  it("groups yearly investment data by month", () => {
    const dates = ["2026-01-31", "2026-02-01", "2026-02-02"];
    const summary = summarizeEntries(
      [
        entry("2026-01-31", { practice: 15, "daily-choice": true }),
        entry("2026-02-01", { practice: 5, "daily-choice": true }),
      ],
      habits,
      dates,
      dates,
      "year",
    );

    expect(summary.investments).toEqual([
      { label: "2026-01", minutes: 15, choices: 1 },
      { label: "2026-02", minutes: 5, choices: 1 },
    ]);
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

  it("counts Gym on every weekday despite stale exclusions", () => {
    const gym: HabitDefinition = {
      key: "gym",
      label: "Gym",
      type: "boolean",
      icon: "dumbbell",
      excludedWeekdays: [2],
    };
    const dates = ["2026-08-17", "2026-08-18", "2026-08-19"];
    const summary = summarizeEntries(
      [
        entry("2026-08-17", { gym: true }),
        entry("2026-08-18", { gym: false }),
      ],
      [gym],
      dates,
      dates,
      "week",
    );

    expect(summary.booleans[0]).toEqual({
      key: "gym",
      label: "Gym",
      done: 1,
      missed: 1,
      open: 1,
    });
  });

  it("summarizes measurement changes over time", () => {
    const weight: HabitDefinition = {
      key: "weight",
      label: "Weight",
      type: "measurement",
      unit: "kg",
      min: 20,
      max: 300,
      step: 0.1,
      icon: "scale",
    };
    const dates = ["2026-08-17", "2026-08-18", "2026-08-19"];
    const summary = summarizeEntries(
      [
        entry("2026-08-17", { weight: 72.4 }),
        entry("2026-08-19", { weight: 72.1 }),
      ],
      [weight],
      dates,
      dates,
      "week",
    );

    expect(getHabitStatus(weight, null)).toBe("open");
    expect(getHabitStatus(weight, 72.4)).toBe("done");
    expect(summary.measurements[0]).toEqual({
      key: "weight",
      label: "Weight",
      unit: "kg",
      latest: 72.1,
      change: -0.3,
      points: [
        { label: "2026-08-17", value: 72.4 },
        { label: "2026-08-19", value: 72.1 },
      ],
    });
  });

  it("does not report a weight change from one measurement", () => {
    const weight: HabitDefinition = {
      key: "weight",
      label: "Weight",
      type: "measurement",
      unit: "kg",
      min: 20,
      max: 300,
      step: 0.1,
      icon: "scale",
    };
    const summary = summarizeEntries(
      [entry("2026-08-17", { weight: 72.4 })],
      [weight],
      ["2026-08-17"],
      ["2026-08-17"],
      "week",
    );

    expect(summary.measurements[0]).toMatchObject({
      latest: 72.4,
      change: null,
    });
  });
});
