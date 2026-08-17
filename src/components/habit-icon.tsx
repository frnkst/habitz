import {
  Activity,
  Brain,
  Candy,
  Check,
  Dumbbell,
  GlassWater,
  Music2,
  MonitorOff,
} from "lucide-react";

import type { HabitDefinition } from "@/lib/habits";

const icons = {
  activity: Activity,
  brain: Brain,
  candy: Candy,
  check: Check,
  dumbbell: Dumbbell,
  "glass-water": GlassWater,
  piano: Music2,
  "screen-off": MonitorOff,
} as const;

export function HabitIcon({
  habit,
  className,
}: {
  habit: HabitDefinition;
  className?: string;
}) {
  const Icon = icons[habit.icon];
  return <Icon className={className} aria-hidden="true" />;
}
