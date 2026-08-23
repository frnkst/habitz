import { describe, expect, it } from "vitest";

import {
  getHabitsForDate,
  habitConfigSchema,
  getQuickLogValues,
  mergeHabitValues,
  parseHabitValues,
  type HabitDefinition,
} from "@/lib/habits";

const habits: HabitDefinition[] = [
  {
    key: "practice",
    label: "Practice",
    type: "duration",
    target: 15,
    unit: "min",
    icon: "activity",
    presets: [5],
  },
  {
    key: "choice",
    label: "Choice",
    type: "boolean",
    icon: "check",
  },
];
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

describe("habit configuration", () => {
  it("rejects duplicate stable keys", () => {
    expect(habitConfigSchema.safeParse([habits[0], habits[0]]).success).toBe(
      false,
    );
  });

  it("keeps Gym active every day despite stale exclusions", () => {
    const gym: HabitDefinition = {
      key: "gym",
      label: "Gym",
      type: "boolean",
      icon: "dumbbell",
      excludedWeekdays: [2],
    };

    expect(getHabitsForDate([gym], "2026-08-17")).toEqual([gym]);
    expect(getHabitsForDate([gym], "2026-08-18")).toEqual([gym]);
    expect(
      habitConfigSchema.safeParse([{ ...gym, excludedWeekdays: [2, 2] }])
        .success,
    ).toBe(false);
  });

  it("parses form values and preserves open states", () => {
    expect(
      parseHabitValues({ practice: "20", choice: "" }, habits),
    ).toEqual({
      practice: 20,
      choice: null,
    });
  });

  it("rejects out-of-range durations", () => {
    expect(() =>
      parseHabitValues({ practice: "1441", choice: "true" }, habits),
    ).toThrow("Practice");
  });

  it("prefills open habits for two-tap logging", () => {
    expect(getQuickLogValues({}, habits, "practice")).toEqual({
      practice: 15,
    });
    expect(getQuickLogValues({}, habits, "choice")).toEqual({
      choice: true,
    });
  });

  it("preserves an existing value when quick logging", () => {
    expect(
      getQuickLogValues({ practice: 5 }, habits, "practice"),
    ).toEqual({ practice: 5 });
  });

  it("prefills measurements from the previous logged value", () => {
    expect(
      getQuickLogValues({}, [weight], "weight", { weight: 72.4 }),
    ).toEqual({
      weight: 72.4,
    });
  });

  it("validates measurement range and increments", () => {
    expect(parseHabitValues({ weight: "72.4" }, [weight])).toEqual({
      weight: 72.4,
    });
    expect(() =>
      parseHabitValues({ weight: "72.45" }, [weight]),
    ).toThrow("0.1 kg increments");
  });

  it("merges a focused update without changing other habits", () => {
    expect(
      mergeHabitValues(
        { practice: 5, choice: false },
        { practice: 15 },
      ),
    ).toEqual({ practice: 15, choice: false });
  });
});
