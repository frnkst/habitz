"use client";

import { useActionState, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

import {
  saveDailyEntry,
  type SaveEntryState,
} from "@/app/actions";
import { HabitIcon } from "@/components/habit-icon";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  HabitDefinition,
  HabitValue,
  HabitValues,
} from "@/lib/habits";
import { getQuickLogValues } from "@/lib/habits";
import { cn } from "@/lib/utils";

const initialState: SaveEntryState = { status: "idle" };

export function DayLogger({
  date,
  habits,
  values: initialValues,
  previousValues,
  editable,
  quickHabitKey,
}: {
  date: string;
  habits: HabitDefinition[];
  values: HabitValues;
  previousValues: HabitValues;
  editable: boolean;
  quickHabitKey?: string;
}) {
  const quickHabit = habits.find((habit) => habit.key === quickHabitKey);
  const visibleHabits = quickHabit ? [quickHabit] : habits;
  const [values, setValues] = useState<HabitValues>(() =>
    getQuickLogValues(initialValues, habits, quickHabitKey, previousValues),
  );
  const [state, action, pending] = useActionState(saveDailyEntry, initialState);

  function setValue(key: string, value: HabitValue) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Drawer showSwipeHandle defaultOpen={Boolean(quickHabitKey)}>
      <DrawerTrigger
        disabled={!editable}
        aria-label="Log this day"
        className="group flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7457d9] to-[#9b86f2] text-white shadow-lg shadow-violet-950/20 transition duration-200 hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus
          className="size-4.5 transition group-hover:rotate-90"
          aria-hidden="true"
        />
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-xl rounded-t-[2rem] border-white/85 bg-[#faf6ff]">
        <form action={action} className="flex min-h-0 flex-1 flex-col">
          <DrawerHeader className="px-5 pt-3 text-left">
            <p className="eyebrow mb-1 text-violet-700">
              {quickHabit ? "Quick log" : "Daily check-in"}
            </p>
            <DrawerTitle className="text-2xl font-bold tracking-[-0.045em]">
              {quickHabit ? quickHabit.label : "How did today go?"}
            </DrawerTitle>
            <DrawerDescription className={quickHabit ? "sr-only" : undefined}>
              {quickHabit
                ? "Quick habit update."
                : "Tap what you did. Leave the rest open for later."}
            </DrawerDescription>
          </DrawerHeader>
          <input type="hidden" name="entryDate" value={date} />
          {quickHabit ? (
            <input type="hidden" name="quickHabitKey" value={quickHabit.key} />
          ) : null}
          <div className="space-y-3 overflow-y-auto px-4 py-5 pb-7 sm:px-5">
            {visibleHabits.map((habit) => {
              const value = values[habit.key];
              return (
                <fieldset key={habit.key} className="surface-card space-y-3 rounded-[1.35rem] p-3.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={habit.key}
                      className="flex items-center gap-2.5 text-sm font-bold"
                    >
                      <span className="flex size-8 items-center justify-center rounded-xl bg-[#eee8ff] text-violet-700">
                        <HabitIcon habit={habit} className="size-4" />
                      </span>
                      {habit.label}
                    </Label>
                    {habit.type === "duration" ? (
                      <span className="rounded-full bg-[#f1edf8] px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                        {habit.target} {habit.unit} target
                      </span>
                    ) : habit.type === "measurement" ? (
                      <span className="rounded-full bg-[#f1edf8] px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                        {typeof previousValues[habit.key] === "number"
                          ? `Previous ${previousValues[habit.key]} ${habit.unit}`
                          : habit.unit}
                      </span>
                    ) : null}
                  </div>
                  {habit.type !== "boolean" ? (
                    <div className="flex gap-2">
                      <Input
                        id={habit.key}
                        name={habit.key}
                        type="number"
                        inputMode="numeric"
                        min={habit.type === "duration" ? 0 : habit.min}
                        max={habit.type === "duration" ? 1440 : habit.max}
                        step={habit.type === "duration" ? 1 : habit.step}
                        placeholder="0"
                        value={typeof value === "number" ? value : ""}
                        onChange={(event) =>
                          setValue(
                            habit.key,
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-[#f1edf8] text-center text-base font-bold shadow-none focus-visible:ring-violet-400"
                      />
                      {(habit.type === "duration"
                        ? [
                            { label: "-5", delta: -5 },
                            { label: "+5", delta: 5 },
                          ]
                        : [
                            { label: `-${habit.step}`, delta: -habit.step },
                            { label: `+${habit.step}`, delta: habit.step },
                          ]
                      ).map(({ label, delta }) => (
                        <Button
                          key={delta}
                          type="button"
                          disabled={
                            habit.type === "measurement" &&
                            typeof value !== "number"
                          }
                          variant="outline"
                          className={cn(
                            "h-12 min-w-13 rounded-xl border-0 px-3 font-bold shadow-none",
                            delta > 0
                              ? "bg-[#d9f4e9] text-[#285e4c] hover:bg-[#c9ecde]"
                              : "bg-[#f1edf8] text-[#6f6782] hover:bg-[#e7e1f1]",
                          )}
                          onClick={() =>
                            setValue(
                              habit.key,
                              habit.type === "duration"
                                ? Math.max(
                                    0,
                                    Math.min(
                                      1440,
                                      (typeof value === "number" ? value : 0) +
                                        delta,
                                    ),
                                  )
                                : Number(
                                    Math.max(
                                      habit.min,
                                      Math.min(
                                        habit.max,
                                        (typeof value === "number"
                                          ? value
                                          : habit.min) + delta,
                                      ),
                                    ).toFixed(4),
                                  ),
                            )
                          }
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#f1edf8] p-1">
                      {!quickHabit ? (
                        <input
                          type="hidden"
                          name={habit.key}
                          value={
                            typeof value === "boolean" ? String(value) : ""
                          }
                        />
                      ) : null}
                      <Button
                        type={quickHabit ? "submit" : "button"}
                        name={quickHabit ? habit.key : undefined}
                        value={quickHabit ? "true" : undefined}
                        disabled={pending}
                        variant={value === true ? "default" : "outline"}
                        className={cn("h-11 rounded-lg border-0 shadow-none", value === true && "bg-[#bfead8] text-[#285e4c] hover:bg-[#bfead8]")}
                        onClick={() => setValue(habit.key, true)}
                      >
                        <Check /> Yes
                      </Button>
                      <Button
                        type={quickHabit ? "submit" : "button"}
                        name={quickHabit ? habit.key : undefined}
                        value={quickHabit ? "false" : undefined}
                        disabled={pending}
                        variant={value === false ? "destructive" : "outline"}
                        className={cn("h-11 rounded-lg border-0 shadow-none", value === false && "bg-[#ffd9e3] text-[#8d4058] hover:bg-[#ffd9e3]")}
                        onClick={() => setValue(habit.key, false)}
                      >
                        <Minus /> No
                      </Button>
                      <Button
                        type={quickHabit ? "submit" : "button"}
                        name={quickHabit ? habit.key : undefined}
                        value={quickHabit ? "" : undefined}
                        disabled={pending}
                        variant={value == null ? "secondary" : "ghost"}
                        className="h-11 rounded-lg border-0 shadow-none"
                        onClick={() => setValue(habit.key, null)}
                      >
                        Open
                      </Button>
                    </div>
                  )}
                </fieldset>
              );
            })}
            {state.status === "error" ? (
              <p
                className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {state.message}
              </p>
            ) : null}
          </div>
          {quickHabit?.type !== "boolean" ? (
            <DrawerFooter className="border-t border-violet-100/90 bg-white/90 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
              <Button
                type="submit"
                disabled={pending}
                className="h-14 rounded-2xl bg-gradient-to-br from-[#7457d9] to-[#8e72e7] text-base font-bold text-white shadow-xl shadow-violet-950/20 hover:from-[#684bcf] hover:to-[#8265df]"
              >
                {pending
                  ? "Saving…"
                  : quickHabit
                    ? `Save ${quickHabit.label}`
                    : "Save day"}
              </Button>
            </DrawerFooter>
          ) : null}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
