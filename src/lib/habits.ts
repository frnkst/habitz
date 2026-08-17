import { z } from "zod";

export const habitIconNames = [
  "activity",
  "brain",
  "candy",
  "check",
  "dumbbell",
  "glass-water",
  "piano",
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

export const habitSchema = z.discriminatedUnion("type", [
  durationHabitSchema,
  booleanHabitSchema,
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
