import { describe, expect, it } from "vitest";

import {
  habitConfigSchema,
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
});
