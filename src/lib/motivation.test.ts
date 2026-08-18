import { describe, expect, it } from "vitest";

import type { DailyEntry } from "@/lib/database.types";
import type { HabitDefinition } from "@/lib/habits";
import { getMotivation } from "@/lib/motivation";

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
];

function entry(date: string, value: number): DailyEntry {
  return {
    id: date,
    user_id: "user",
    entry_date: date,
    habit_values: { practice: value },
    created_at: "",
    updated_at: "",
  };
}

describe("motivation", () => {
  const week = [
    "2026-08-17",
    "2026-08-18",
    "2026-08-19",
    "2026-08-20",
    "2026-08-21",
    "2026-08-22",
    "2026-08-23",
  ];

  it("encourages a fresh unlogged week", () => {
    expect(getMotivation([], habits, week, "2026-08-17").calendar).toEqual([
      "Fresh week,",
      "start anywhere.",
    ]);
  });

  it("recognizes a perfect early start", () => {
    expect(
      getMotivation([entry("2026-08-17", 15)], habits, week, "2026-08-17")
        .calendar,
    ).toEqual(["Perfect start,", "stay with it."]);
  });

  it("uses end-of-period messages for past weeks", () => {
    expect(
      getMotivation([entry("2026-08-17", 15)], habits, week, "2026-08-30")
        .calendar,
    ).toEqual(["Every effort,", "still counts."]);
  });
});
