import type { DailyEntry } from "@/lib/database.types";
import { formatDate } from "@/lib/dates";
import type { HabitDefinition } from "@/lib/habits";
import { getDayCounts, getHabitStatus } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { DayLogger } from "./day-logger";
import { HabitIcon } from "./habit-icon";

const cardStyles = {
  open: "border-slate-200/80 bg-white/72 text-slate-500",
  missed: "border-[#ffd6d1] bg-[#fff3f1] text-[#9a3f35]",
  partial: "border-[#e7ed9a] bg-[#f8fad8] text-[#53600d]",
  achieved: "border-[#bde9cd] bg-[#eaf9ef] text-[#17603f]",
  exceeded: "border-[#173b2d] bg-[#173b2d] text-white shadow-lg shadow-emerald-950/10",
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
}: {
  date: string;
  entry?: DailyEntry;
  habits: HabitDefinition[];
  editable: boolean;
}) {
  const values = entry?.habit_values ?? {};
  const counts = getDayCounts(habits, values);
  const achieved = counts.achieved + counts.exceeded;

  return (
    <section className="mt-7 pb-20 sm:pb-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-emerald-700">
            {formatDate(date, { weekday: "long" })}
          </p>
          <h2 className="mt-1 text-[1.75rem] font-bold tracking-[-0.05em]">
            {formatDate(date, { day: "numeric", month: "long" })}
          </h2>
        </div>
        <Badge variant="secondary" className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
          {achieved}/{habits.length} complete
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {habits.map((habit) => {
          const value = values[habit.key];
          const status = getHabitStatus(habit, value);
          return (
            <article
              key={habit.key}
              className={cn(
                "min-w-0 rounded-[1.35rem] border p-3.5 shadow-[0_8px_25px_rgba(23,59,45,0.04)] transition duration-200 hover:-translate-y-0.5",
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
              <p className="mt-4 truncate text-sm font-bold">{habit.label}</p>
              <p className="mt-0.5 text-xs font-medium opacity-70">
                {displayValue(habit, value)}
              </p>
              {habit.type === "duration" && typeof value === "number" ? (
                <Progress
                  value={Math.min(100, (value / habit.target) * 100)}
                  className="mt-3 gap-0 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-black/8 [&_[data-slot=progress-indicator]]:bg-current [&_[data-slot=progress-indicator]]:opacity-70"
                />
              ) : null}
            </article>
          );
        })}
      </div>
      <DayLogger
        key={`${date}-${entry?.updated_at ?? "new"}`}
        date={date}
        habits={habits}
        values={values}
        editable={editable}
      />
    </section>
  );
}
