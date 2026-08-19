import "server-only";

import type { DailyEntry } from "@/lib/database.types";
import type { HabitValues } from "@/lib/habits";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getEntries(
  userId: string,
  start: string,
  end: string,
): Promise<DailyEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date");

  if (error) {
    throw new Error(`Could not load habit entries: ${error.message}`);
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
  const { data, error } = await supabase
    .from("daily_entries")
    .select("habit_values")
    .eq("user_id", userId)
    .lt("entry_date", beforeDate)
    .order("entry_date", { ascending: false });

  if (error) {
    throw new Error(`Could not load previous habit values: ${error.message}`);
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
