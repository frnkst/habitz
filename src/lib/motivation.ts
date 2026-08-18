import type { DailyEntry } from "@/lib/database.types";
import type { HabitDefinition } from "@/lib/habits";
import { getDayCounts } from "@/lib/scoring";

export type Motivation = {
  calendar: [lead: string, accent: string];
  summary: [lead: string, accent: string];
};

const messages: Motivation[] = [
  {
    calendar: ["Fresh week,", "start anywhere."],
    summary: ["A blank page,", "ready for progress."],
  },
  {
    calendar: ["A gentle start,", "keep moving."],
    summary: ["The first signs,", "are taking shape."],
  },
  {
    calendar: ["Great start,", "build on it."],
    summary: ["Early momentum,", "already visible."],
  },
  {
    calendar: ["Strong opening,", "keep the rhythm."],
    summary: ["A clear pattern,", "is emerging."],
  },
  {
    calendar: ["Perfect start,", "stay with it."],
    summary: ["An excellent start,", "worth noticing."],
  },
  {
    calendar: ["Today can be,", "the reset."],
    summary: ["Room to grow,", "is useful data."],
  },
  {
    calendar: ["One good choice,", "changes the week."],
    summary: ["Small steps,", "are adding up."],
  },
  {
    calendar: ["Keep going,", "you are building."],
    summary: ["Steady effort,", "is becoming visible."],
  },
  {
    calendar: ["Good rhythm,", "protect it."],
    summary: ["Consistency,", "is showing through."],
  },
  {
    calendar: ["On a roll,", "stay steady."],
    summary: ["Strong momentum,", "clearly visible."],
  },
  {
    calendar: ["Make today,", "count."],
    summary: ["A clearer picture,", "starts here."],
  },
  {
    calendar: ["Keep showing up,", "it still matters."],
    summary: ["Every logged choice,", "adds context."],
  },
  {
    calendar: ["Almost there,", "finish with intent."],
    summary: ["Progress is real,", "and measurable."],
  },
  {
    calendar: ["Great progress,", "keep showing up."],
    summary: ["A strong pattern,", "is now visible."],
  },
  {
    calendar: ["Strong week,", "close it well."],
    summary: ["Excellent balance,", "across the week."],
  },
  {
    calendar: ["A new week soon,", "reset gently."],
    summary: ["This week offers,", "a useful baseline."],
  },
  {
    calendar: ["Every effort,", "still counts."],
    summary: ["The honest picture,", "helps you adjust."],
  },
  {
    calendar: ["Week complete,", "notice the pattern."],
    summary: ["A solid week,", "worth building on."],
  },
  {
    calendar: ["Consistent work,", "well earned."],
    summary: ["Reliable habits,", "clearly reflected."],
  },
  {
    calendar: ["Beautiful week,", "keep the habit."],
    summary: ["Outstanding rhythm,", "made visible."],
  },
];

export function getMotivation(
  entries: DailyEntry[],
  habits: HabitDefinition[],
  periodDates: string[],
  today: string,
): Motivation {
  const eligibleDates = periodDates.filter((date) => date <= today);
  const entryByDate = new Map(entries.map((entry) => [entry.entry_date, entry]));
  let done = 0;
  let logged = 0;

  for (const date of eligibleDates) {
    const counts = getDayCounts(
      habits,
      entryByDate.get(date)?.habit_values ?? {},
    );
    done += counts.done;
    logged += counts.done + counts.missed;
  }

  const possible = eligibleDates.length * habits.length;
  const completion = possible > 0 ? done / possible : 0;
  const scoreBand =
    logged === 0
      ? 0
      : completion >= 0.75
        ? 4
        : completion >= 0.5
          ? 3
          : completion >= 0.25
            ? 2
            : 1;
  const elapsedRatio =
    periodDates.length > 0 ? eligibleDates.length / periodDates.length : 0;
  const phase = Math.min(3, Math.floor(elapsedRatio * 4));

  return messages[phase * 5 + scoreBand];
}
