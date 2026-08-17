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
import { cn } from "@/lib/utils";

const initialState: SaveEntryState = { status: "idle" };

export function DayLogger({
  date,
  habits,
  values: initialValues,
  editable,
}: {
  date: string;
  habits: HabitDefinition[];
  values: HabitValues;
  editable: boolean;
}) {
  const [values, setValues] = useState<HabitValues>(initialValues);
  const [state, action, pending] = useActionState(saveDailyEntry, initialState);

  function setValue(key: string, value: HabitValue) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        disabled={!editable}
        className={cn(
          "mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[1.15rem] bg-[#173b2d] px-4 text-sm font-bold text-white shadow-xl shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#24543f] disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-[#dfff9b] text-[#173b2d]">
          <Plus className="size-4" aria-hidden="true" />
        </span>
        {editable ? "Log this day" : "Future day"}
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-xl rounded-t-[2rem] border-white/80 bg-[#f8faf4]">
        <form action={action} className="flex min-h-0 flex-1 flex-col">
          <DrawerHeader className="px-5 pt-3 text-left">
            <p className="eyebrow mb-1 text-emerald-700">Daily check-in</p>
            <DrawerTitle className="text-2xl font-bold tracking-[-0.045em]">How did today go?</DrawerTitle>
            <DrawerDescription>
              Tap what you did. Leave the rest open for later.
            </DrawerDescription>
          </DrawerHeader>
          <input type="hidden" name="entryDate" value={date} />
          <div className="space-y-3 overflow-y-auto px-4 py-5 pb-7 sm:px-5">
            {habits.map((habit) => {
              const value = values[habit.key];
              return (
                <fieldset key={habit.key} className="surface-card space-y-3 rounded-[1.35rem] p-3.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={habit.key}
                      className="flex items-center gap-2.5 text-sm font-bold"
                    >
                      <span className="flex size-8 items-center justify-center rounded-xl bg-[#eaf9ef] text-emerald-700">
                        <HabitIcon habit={habit} className="size-4" />
                      </span>
                      {habit.label}
                    </Label>
                    {habit.type === "duration" ? (
                      <span className="rounded-full bg-[#f2f5ed] px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                        {habit.target} {habit.unit} target
                      </span>
                    ) : null}
                  </div>
                  {habit.type === "duration" ? (
                    <div className="flex gap-2">
                      <Input
                        id={habit.key}
                        name={habit.key}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={1440}
                        step={1}
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
                        className="h-12 min-w-0 flex-1 rounded-xl border-0 bg-[#f2f5ed] text-center text-base font-bold shadow-none"
                      />
                      {habit.presets.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          className="h-12 rounded-xl border-0 bg-[#e7f5e7] px-3 font-bold text-emerald-800 shadow-none hover:bg-[#d8efd9]"
                          onClick={() =>
                            setValue(
                              habit.key,
                              Math.min(
                                1440,
                                (typeof value === "number" ? value : 0) + preset,
                              ),
                            )
                          }
                        >
                          +{preset}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#f2f5ed] p-1">
                      <input
                        type="hidden"
                        name={habit.key}
                        value={
                          typeof value === "boolean" ? String(value) : ""
                        }
                      />
                      <Button
                        type="button"
                        variant={value === true ? "default" : "outline"}
                        className={cn("h-11 rounded-lg border-0 shadow-none", value === true && "bg-[#173b2d] text-white hover:bg-[#173b2d]")}
                        onClick={() => setValue(habit.key, true)}
                      >
                        <Check /> Yes
                      </Button>
                      <Button
                        type="button"
                        variant={value === false ? "destructive" : "outline"}
                        className={cn("h-11 rounded-lg border-0 shadow-none", value === false && "bg-[#ffdfdb] text-[#8d342b] hover:bg-[#ffdfdb]")}
                        onClick={() => setValue(habit.key, false)}
                      >
                        <Minus /> No
                      </Button>
                      <Button
                        type="button"
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
          <DrawerFooter className="border-t border-white/90 bg-white/90 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
            <Button
              type="submit"
              disabled={pending}
              className="h-14 rounded-2xl bg-[#173b2d] text-base font-bold shadow-xl shadow-emerald-950/15 hover:bg-[#24543f]"
            >
              {pending ? "Saving…" : "Save day"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
