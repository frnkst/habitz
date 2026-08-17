import "server-only";

import type { DailyEntry } from "@/lib/database.types";
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
