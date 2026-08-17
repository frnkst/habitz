import { describe, expect, it } from "vitest";

import {
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

describe("habit configuration", () => {
  it("rejects duplicate stable keys", () => {
    expect(habitConfigSchema.safeParse([habits[0], habits[0]]).success).toBe(
      false,
    );
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

  it("merges a focused update without changing other habits", () => {
    expect(
      mergeHabitValues(
        { practice: 5, choice: false },
        { practice: 15 },
      ),
    ).toEqual({ practice: 15, choice: false });
  });
});
