import "server-only";

import type { DailyEntry } from "@/lib/database.types";
import type { HabitValues } from "@/lib/habits";
import {
  isTransientReadError,
  retryTransientRead,
  type ReadError,
  ServiceUnavailableError,
} from "@/lib/retry";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class DataReadError extends ServiceUnavailableError {
  constructor(
    public readonly operation: string,
    public readonly details: ReadError,
  ) {
    super(operation, details);
    this.name = "DataReadError";
  }
}

function logRetry(operation: string, error: ReadError) {
  console.warn("Retrying transient Habitz data read", {
    operation,
    code: error.code,
    message: error.message,
  });
}

function throwReadError(operation: string, error: ReadError): never {
  console.error("Habitz data read failed", {
    operation,
    code: error.code,
    message: error.message,
  });
  if (isTransientReadError(error)) {
    throw new DataReadError(operation, error);
  }

  throw new Error(`Unexpected Habitz data error during ${operation}.`);
}

export async function getEntries(
  userId: string,
  start: string,
  end: string,
): Promise<DailyEntry[]> {
  const supabase = await createServerSupabaseClient();
  const operation = "period entries";
  const { data, error } = await retryTransientRead<DailyEntry[]>(
    () =>
      supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("entry_date", start)
        .lte("entry_date", end)
        .order("entry_date"),
    (readError) => logRetry(operation, readError),
  );

  if (error) {
    throwReadError(operation, error);
  }
  if (!data) {
    throwReadError(operation, { message: "The database returned no data." });
  }
  return data;
}

export async function getPreviousHabitValues(
  userId: string,
  beforeDate: string,
  habitKeys: string[],
): Promise<HabitValues> {
  if (habitKeys.length === 0) return {};

  const supabase = await createServerSupabaseClient();
  const operation = "previous measurements";
  const { data, error } = await retryTransientRead<
    Array<{ habit_values: HabitValues }>
  >(
    () =>
      supabase
        .from("daily_entries")
        .select("habit_values")
        .eq("user_id", userId)
        .lt("entry_date", beforeDate)
        .order("entry_date", { ascending: false }),
    (readError) => logRetry(operation, readError),
  );

  if (error) {
    throwReadError(operation, error);
  }
  if (!data) {
    throwReadError(operation, { message: "The database returned no data." });
  }

  const previousValues: HabitValues = {};
  const unresolvedKeys = new Set(habitKeys);
  for (const entry of data) {
    for (const key of unresolvedKeys) {
      const value = entry.habit_values[key];
      if (value != null) {
        previousValues[key] = value;
        unresolvedKeys.delete(key);
      }
    }
    if (unresolvedKeys.size === 0) break;
  }
  return previousValues;
}
