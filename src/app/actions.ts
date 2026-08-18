"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { isDateKey, todayInTimeZone } from "@/lib/dates";
import { mergeHabitValues, parseHabitValues } from "@/lib/habits";
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
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error && error.name !== "AuthSessionMissingError") {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
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
  const quickHabitKey = String(formData.get("quickHabitKey") ?? "");
  const quickHabit = quickHabitKey
    ? config.habits.find((habit) => habit.key === quickHabitKey)
    : undefined;
  if (quickHabitKey && !quickHabit) {
    return { status: "error", message: "Choose a valid habit." };
  }
  const submittedHabits = quickHabit ? [quickHabit] : config.habits;
  for (const habit of submittedHabits) {
    submitted[habit.key] = formData.get(habit.key);
  }

  let habitValues;
  try {
    habitValues = parseHabitValues(submitted, submittedHabits);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Invalid habit values.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (quickHabit) {
    const { data: existingEntry, error: readError } = await supabase
      .from("daily_entries")
      .select("habit_values")
      .eq("user_id", user.id)
      .eq("entry_date", entryDate)
      .maybeSingle();
    if (readError) {
      return {
        status: "error",
        message: `Could not load this day: ${readError.message}`,
      };
    }
    habitValues = mergeHabitValues(
      existingEntry?.habit_values ?? {},
      habitValues,
    );
  }
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
