import { Check, Circle, Minus } from "lucide-react";
import Link from "next/link";

import type { DailyEntry } from "@/lib/database.types";
import { formatDate } from "@/lib/dates";
import type { HabitDefinition } from "@/lib/habits";
import { getDayCounts, getHabitStatus } from "@/lib/scoring";
import { cn } from "@/lib/utils";

const stateStyles = {
  open: "bg-slate-200",
  missed: "bg-[#ff7f73]",
  done: "bg-[#18a56c]",
};

export function WeekCalendar({
  dates,
  entries,
  habits,
  selectedDate,
  today,
}: {
  dates: string[];
  entries: DailyEntry[];
  habits: HabitDefinition[];
  selectedDate: string;
  today: string;
}) {
  const entryByDate = new Map(entries.map((entry) => [entry.entry_date, entry]));

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5" aria-label="Week calendar">
      {dates.map((date) => {
        const entry = entryByDate.get(date);
        const values = entry?.habit_values ?? {};
        const counts = getDayCounts(habits, values);
        const complete = counts.done;
        const isSelected = date === selectedDate;
        const isToday = date === today;

        return (
          <Link
            key={date}
            href={`/?date=${date}`}
            aria-current={isSelected ? "date" : undefined}
            className={cn(
              "group min-w-0 rounded-[1.15rem] border border-white/80 bg-white/65 px-1 py-2 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:rounded-2xl sm:p-3",
              isSelected &&
                "border-[#173b2d] bg-[#173b2d] text-white shadow-lg shadow-emerald-950/15 ring-0 hover:bg-[#173b2d]",
              date > today && "opacity-55",
            )}
          >
            <p className={cn(
              "text-[9px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs",
              isSelected && "text-white/55",
            )}>
              {formatDate(date, { weekday: "short" }).slice(0, 2)}
            </p>
            <p
              className={cn(
                "mx-auto mt-1.5 flex size-7 items-center justify-center rounded-full text-sm font-bold sm:size-9 sm:text-base",
                isToday && !isSelected && "bg-[#dfff9b] text-[#173b2d]",
                isSelected && "text-[#dfff9b]",
              )}
            >
              {formatDate(date, { day: "numeric" })}
            </p>
            <div className="mx-auto mt-2 grid w-fit grid-cols-3 gap-1">
              {habits.map((habit) => {
                const status = getHabitStatus(habit, values[habit.key]);
                return (
                  <span
                    key={habit.key}
                    className={cn(
                      "size-1.5 rounded-full ring-1 ring-black/5 sm:size-2",
                      stateStyles[status],
                    )}
                    title={`${habit.label}: ${status}`}
                  />
                );
              })}
            </div>
            <div className={cn(
              "mt-2 hidden items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground sm:flex",
              isSelected && "text-white/60",
            )}>
              {complete === habits.length ? (
                <Check className="size-3 text-emerald-600" />
              ) : counts.open === habits.length ? (
                <Circle className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {complete}/{habits.length}
            </div>
          </Link>
        );
      })}
      <div className="col-span-7 mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground sm:gap-x-4 sm:text-[11px]">
        {Object.entries({
          open: "Open",
          missed: "Missed",
          done: "Done",
        }).map(([state, label]) => (
          <span key={state} className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full ring-1 ring-black/5",
                stateStyles[state as keyof typeof stateStyles],
              )}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
