import { z } from "zod";

import { getWeekday } from "@/lib/dates";

export const habitIconNames = [
  "activity",
  "brain",
  "candy",
  "check",
  "dumbbell",
  "glass-water",
  "piano",
  "scale",
  "screen-off",
] as const;

const baseHabitSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a kebab-case habit key"),
  label: z.string().trim().min(1).max(40),
  icon: z.enum(habitIconNames).default("activity"),
  excludedWeekdays: z
    .array(z.number().int().min(0).max(6))
    .max(7)
    .refine((weekdays) => new Set(weekdays).size === weekdays.length, {
      message: "Excluded weekdays must be unique",
    })
    .optional(),
});

const durationHabitSchema = baseHabitSchema.extend({
  type: z.literal("duration"),
  target: z.number().positive().max(1440),
  unit: z.string().trim().min(1).max(12).default("min"),
  presets: z.array(z.number().positive().max(1440)).max(4).default([5, 15]),
});

const booleanHabitSchema = baseHabitSchema.extend({
  type: z.literal("boolean"),
});

const measurementHabitSchema = baseHabitSchema
  .extend({
    type: z.literal("measurement"),
    unit: z.string().trim().min(1).max(12),
    min: z.number().nonnegative(),
    max: z.number().positive(),
    step: z.number().positive().max(100),
  })
  .refine((habit) => habit.min < habit.max, {
    message: "Measurement minimum must be below its maximum",
    path: ["max"],
  });

export const habitSchema = z.discriminatedUnion("type", [
  durationHabitSchema,
  booleanHabitSchema,
  measurementHabitSchema,
]);

export const habitConfigSchema = z
  .array(habitSchema)
  .min(1)
  .max(12)
  .superRefine((habits, context) => {
    const keys = new Set<string>();
    for (const [index, habit] of habits.entries()) {
      if (keys.has(habit.key)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate habit key: ${habit.key}`,
          path: [index, "key"],
        });
      }
      keys.add(habit.key);
    }
  });

export type HabitDefinition = z.infer<typeof habitSchema>;
export type HabitValue = number | boolean | null;
export type HabitValues = Record<string, HabitValue>;

export function isHabitActiveOnDate(
  habit: HabitDefinition,
  dateKey: string,
): boolean {
  if (habit.key === "gym") return true;
  return !habit.excludedWeekdays?.includes(getWeekday(dateKey));
}

export function getHabitsForDate(
  habits: HabitDefinition[],
  dateKey: string,
): HabitDefinition[] {
  return habits.filter((habit) => isHabitActiveOnDate(habit, dateKey));
}

export function getQuickLogValues(
  values: HabitValues,
  habits: HabitDefinition[],
  habitKey?: string,
  previousValues: HabitValues = {},
): HabitValues {
  const initialValues = { ...values };
  for (const habit of habits) {
    if (
      habit.type === "measurement" &&
      initialValues[habit.key] == null &&
      typeof previousValues[habit.key] === "number"
    ) {
      initialValues[habit.key] = previousValues[habit.key];
    }
  }

  if (!habitKey || initialValues[habitKey] != null) {
    return initialValues;
  }
  const habit = habits.find((candidate) => candidate.key === habitKey);
  if (!habit) {
    return initialValues;
  }
  if (habit.type === "measurement") {
    return initialValues;
  }
  return {
    ...initialValues,
    [habitKey]: habit.type === "duration" ? habit.target : true,
  };
}

export function mergeHabitValues(
  existing: HabitValues,
  updates: HabitValues,
): HabitValues {
  return { ...existing, ...updates };
}

export function parseHabitValues(
  input: unknown,
  habits: HabitDefinition[],
): HabitValues {
  const source =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const values: HabitValues = {};

  for (const habit of habits) {
    const value = source[habit.key];
    if (value === null || value === undefined || value === "") {
      values[habit.key] = null;
      continue;
    }

    if (habit.type === "duration") {
      const parsed = z.coerce.number().int().min(0).max(1440).safeParse(value);
      if (!parsed.success) {
        throw new Error(`${habit.label} must be between 0 and 1440 minutes.`);
      }
      values[habit.key] = parsed.data;
      continue;
    }

    if (habit.type === "measurement") {
      const parsed = z.coerce.number().min(habit.min).max(habit.max).safeParse(value);
      if (!parsed.success) {
        throw new Error(
          `${habit.label} must be between ${habit.min} and ${habit.max} ${habit.unit}.`,
        );
      }
      const steps = (parsed.data - habit.min) / habit.step;
      if (Math.abs(steps - Math.round(steps)) > 1e-8) {
        throw new Error(
          `${habit.label} must use ${habit.step} ${habit.unit} increments.`,
        );
      }
      values[habit.key] = parsed.data;
      continue;
    }

    if (value === true || value === "true") {
      values[habit.key] = true;
    } else if (value === false || value === "false") {
      values[habit.key] = false;
    } else {
      throw new Error(`${habit.label} must be Yes or No.`);
    }
  }

  return values;
}
