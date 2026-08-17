import "server-only";

import { z } from "zod";

import { habitConfigSchema, type HabitDefinition } from "@/lib/habits";

const environmentSchema = z.object({
  APP_URL: z.url(),
  APP_TIMEZONE: z.string().min(1),
  WEEK_START: z.coerce.number().int().min(0).max(6),
  ALLOWED_GITHUB_USER_ID: z.string().regex(/^\d+$/),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  HABIT_CONFIG_JSON: z.string().min(2),
});

export type AppConfig = {
  appUrl: string;
  timezone: string;
  weekStart: number;
  allowedGitHubUserId: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  habits: HabitDefinition[];
};

let cachedConfig: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const parsedEnvironment = environmentSchema.safeParse(process.env);
  if (!parsedEnvironment.success) {
    const details = parsedEnvironment.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid application environment: ${details}`);
  }

  let rawHabits: unknown;
  try {
    rawHabits = JSON.parse(parsedEnvironment.data.HABIT_CONFIG_JSON);
  } catch {
    throw new Error("HABIT_CONFIG_JSON must contain valid JSON.");
  }

  const parsedHabits = habitConfigSchema.safeParse(rawHabits);
  if (!parsedHabits.success) {
    const details = parsedHabits.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid HABIT_CONFIG_JSON: ${details}`);
  }

  try {
    new Intl.DateTimeFormat("en", {
      timeZone: parsedEnvironment.data.APP_TIMEZONE,
    }).format();
  } catch {
    throw new Error(
      `APP_TIMEZONE is not a valid IANA timezone: ${parsedEnvironment.data.APP_TIMEZONE}`,
    );
  }

  cachedConfig = {
    appUrl: parsedEnvironment.data.APP_URL.replace(/\/$/, ""),
    timezone: parsedEnvironment.data.APP_TIMEZONE,
    weekStart: parsedEnvironment.data.WEEK_START,
    allowedGitHubUserId: parsedEnvironment.data.ALLOWED_GITHUB_USER_ID,
    supabaseUrl: parsedEnvironment.data.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      parsedEnvironment.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    habits: parsedHabits.data,
  };

  return cachedConfig;
}
