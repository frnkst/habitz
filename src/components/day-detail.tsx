import type { DailyEntry } from "@/lib/database.types";
import { formatDate } from "@/lib/dates";
import type { HabitDefinition } from "@/lib/habits";
import { getDayCounts, getHabitStatus } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { DayLogger } from "./day-logger";
import { HabitIcon } from "./habit-icon";

const cardStyles = {
  open: "border-slate-200/80 bg-white/72 text-slate-500",
  missed: "border-[#ffd6d1] bg-[#fff3f1] text-[#9a3f35]",
  done: "border-emerald-200 bg-emerald-100/90 text-emerald-900 shadow-lg shadow-emerald-900/5",
};

function displayValue(
  habit: HabitDefinition,
  value: number | boolean | null | undefined,
) {
  if (value === null || value === undefined) return "Not logged";
  if (habit.type === "boolean") return value ? "Yes" : "No";
  return `${value} ${habit.unit}`;
}

export function DayDetail({
  date,
  entry,
  habits,
  editable,
  quickHabitKey,
}: {
  date: string;
  entry?: DailyEntry;
  habits: HabitDefinition[];
  editable: boolean;
  quickHabitKey?: string;
}) {
  const values = entry?.habit_values ?? {};
  const counts = getDayCounts(habits, values);
  const completed = counts.done;

  return (
    <section className="mt-7 pb-20 sm:pb-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-emerald-700">
            {formatDate(date, { weekday: "long" })}
          </p>
          <h2 className="mt-1 font-sans text-[1.75rem] font-bold tracking-[-0.05em]">
            {formatDate(date, { day: "numeric", month: "long" })}
          </h2>
        </div>
        <Badge variant="secondary" className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
          {completed}/{habits.length} complete
        </Badge>
      </div>
      {editable ? (
        <p className="mb-3 text-[11px] font-semibold text-muted-foreground">
          Tap a habit to prefill its goal, then save.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {habits.map((habit) => {
          const value = values[habit.key];
          const status = getHabitStatus(habit, value);
          const card = (
            <article
              className={cn(
                "relative h-full min-w-0 rounded-[1.35rem] border p-3.5 shadow-[0_8px_25px_rgba(23,59,45,0.04)] transition duration-200",
                editable &&
                  "group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_30px_rgba(23,59,45,0.09)]",
                cardStyles[status],
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white/55 shadow-sm">
                  <HabitIcon habit={habit} className="size-4" />
                </span>
                <span className="text-[9px] font-bold tracking-[0.12em] uppercase opacity-60">
                  {status}
                </span>
              </div>
              {editable ? (
                <ArrowUpRight className="absolute right-3.5 bottom-3.5 size-3.5 opacity-35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70" />
              ) : null}
              <p className="mt-4 truncate text-sm font-bold">{habit.label}</p>
              <p className="mt-0.5 text-xs font-medium opacity-70">
                {displayValue(habit, value)}
              </p>
            </article>
          );

            return editable ? (
              <Link
                key={habit.key}
                href={`/?date=${date}&quick=${habit.key}`}
                className="group min-w-0 rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                aria-label={`Quick log ${habit.label}`}
              >
                {card}
              </Link>
            ) : (
              <div key={habit.key}>{card}</div>
            );
        })}
      </div>
      <DayLogger
        key={`${date}-${entry?.updated_at ?? "new"}-${quickHabitKey ?? "full"}`}
        date={date}
        habits={habits}
        values={values}
        editable={editable}
        quickHabitKey={quickHabitKey}
      />
    </section>
  );
}
