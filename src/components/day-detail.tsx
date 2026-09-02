import type { DailyEntry } from "@/lib/database.types";
import { formatDate } from "@/lib/dates";
import {
  getHabitsForDate,
  type HabitDefinition,
  type HabitValues,
} from "@/lib/habits";
import { getDayCounts, getHabitStatus } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { DayLogger } from "./day-logger";

const cardStyles = {
  open: "border-violet-100/90 bg-white/75 text-[#746d85]",
  missed: "border-[#f7c6d4] bg-[#fff0f5] text-[#91445c]",
  done: "border-[#aee2ce] bg-[#d9f4e9] text-[#285e4c] shadow-lg shadow-emerald-900/5",
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
  previousValues,
  editable,
  quickHabitKey,
}: {
  date: string;
  entry?: DailyEntry;
  habits: HabitDefinition[];
  previousValues: HabitValues;
  editable: boolean;
  quickHabitKey?: string;
}) {
  const values = entry?.habit_values ?? {};
  const activeHabits = getHabitsForDate(habits, date);
  const counts = getDayCounts(activeHabits, values);
  const completed = counts.done;
  const orderedHabits = [
    ...activeHabits.filter((habit) => habit.type === "measurement"),
    ...activeHabits.filter((habit) => habit.type === "duration"),
    ...activeHabits.filter((habit) => habit.type === "boolean"),
  ];

  return (
    <section className="mt-7 pb-20 sm:pb-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet-700">
            {formatDate(date, { weekday: "long" })}
          </p>
          <div className="mt-1 flex items-center gap-2.5">
            <h2 className="font-sans text-[1.75rem] font-bold tracking-[-0.05em]">
              {formatDate(date, { day: "numeric", month: "long" })}
            </h2>
            {editable && quickHabitKey ? (
              <DayLogger
                key={`${date}-${entry?.updated_at ?? "new"}-${quickHabitKey}`}
                date={date}
                habits={activeHabits}
                values={values}
                previousValues={previousValues}
                quickHabitKey={quickHabitKey}
              />
            ) : null}
          </div>
        </div>
        <Badge variant="secondary" className="rounded-full border border-violet-100/90 bg-white/72 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm shadow-violet-950/5">
          {completed}/{activeHabits.length} complete
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {orderedHabits.map((habit) => {
          const value = values[habit.key];
          const status = getHabitStatus(habit, value);
          const card = (
            <article
              className={cn(
                "relative min-h-28 min-w-0 rounded-[1.35rem] border p-3.5 shadow-[0_8px_25px_rgba(82,61,136,0.05)] transition duration-200",
                editable &&
                  "group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_30px_rgba(82,61,136,0.12)]",
                cardStyles[status],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg leading-tight font-extrabold tracking-[-0.035em]">
                  {habit.label}
                </p>
                <span className="text-[9px] font-bold tracking-[0.12em] uppercase opacity-60">
                  {status}
                </span>
              </div>
              {editable ? (
                <ArrowUpRight className="absolute right-3.5 bottom-3.5 size-3.5 opacity-35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70" />
              ) : null}
              <p className="mt-3 text-sm font-semibold opacity-70">
                {displayValue(habit, value)}
              </p>
            </article>
          );

            return editable ? (
              <Link
                key={habit.key}
                href={`/?date=${date}&quick=${habit.key}`}
                className={cn(
                  "group min-w-0 rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  habit.type === "measurement" && "col-span-2",
                )}
                aria-label={`Quick log ${habit.label}`}
              >
                {card}
              </Link>
            ) : (
              <div
                key={habit.key}
                className={cn(habit.type === "measurement" && "col-span-2")}
              >
                {card}
              </div>
            );
        })}
      </div>
    </section>
  );
}
