"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { isDateKey, todayInTimeZone } from "@/lib/dates";
import { parseHabitValues } from "@/lib/habits";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SaveEntryState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function signInWithGitHub() {
  const config = getAppConfig();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${config.appUrl}/auth/callback`,
    },
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveDailyEntry(
  _previousState: SaveEntryState,
  formData: FormData,
): Promise<SaveEntryState> {
  const config = getAppConfig();
  const user = await requireOwner();
  const entryDate = String(formData.get("entryDate") ?? "");

  if (!isDateKey(entryDate)) {
    return { status: "error", message: "Choose a valid calendar date." };
  }
  if (entryDate > todayInTimeZone(config.timezone)) {
    return { status: "error", message: "Future days cannot be logged." };
  }

  const submitted: Record<string, FormDataEntryValue | null> = {};
  for (const habit of config.habits) {
    submitted[habit.key] = formData.get(habit.key);
  }

  let habitValues;
  try {
    habitValues = parseHabitValues(submitted, config.habits);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Invalid habit values.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("daily_entries").upsert(
    {
      user_id: user.id,
      entry_date: entryDate,
      habit_values: habitValues,
    },
    { onConflict: "user_id,entry_date" },
  );

  if (error) {
    return {
      status: "error",
      message: `Could not save this day: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/summary");
  redirect(`/?date=${entryDate}`);
}
