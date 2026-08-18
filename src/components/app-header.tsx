import { BarChart3, CalendarDays, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppHeader({ active }: { active: "calendar" | "summary" }) {
  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.04em]"
        >
          <span className="flex size-9 items-center justify-center rounded-[0.9rem] bg-[#173b2d] text-[#c9ff65] shadow-lg shadow-emerald-950/15">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          Habitz
        </Link>
        <div className="hidden items-center gap-1 rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-sm backdrop-blur sm:flex">
          <Link
            href="/"
            aria-label="Calendar"
            className={cn(
              buttonVariants({
                variant: active === "calendar" ? "secondary" : "ghost",
                size: "icon-sm",
              }),
            )}
          >
            <CalendarDays />
          </Link>
          <Link
            href="/summary"
            aria-label="Summary"
            className={cn(
              buttonVariants({
                variant: active === "summary" ? "secondary" : "ghost",
                size: "icon-sm",
              }),
            )}
          >
            <BarChart3 />
          </Link>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </form>
        </div>
        <form action={signOut} className="sm:hidden">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="rounded-full border border-white/80 bg-white/60"
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
        </form>
      </header>
      <nav className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[15.5rem] items-center gap-1.5 rounded-[1.55rem] border border-violet-100/90 bg-white/82 p-1.5 shadow-[0_18px_55px_rgba(74,55,120,0.20),0_2px_8px_rgba(23,59,45,0.08)] backdrop-blur-2xl sm:hidden">
        <Link
          href="/"
          aria-label="Calendar"
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-[1.15rem] px-3 text-xs font-bold transition duration-200 active:scale-[0.97]",
            active === "calendar"
              ? "bg-gradient-to-br from-[#5840c7] to-[#7c5ce7] text-white shadow-lg shadow-violet-950/20"
              : "text-slate-500 hover:bg-violet-50",
          )}
        >
          <CalendarDays
            className={cn(
              "size-4.5",
              active === "calendar" && "text-[#eee9ff]",
            )}
          />
          Today
        </Link>
        <Link
          href="/summary"
          aria-label="Summary"
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-[1.15rem] px-3 text-xs font-bold transition duration-200 active:scale-[0.97]",
            active === "summary"
              ? "bg-gradient-to-br from-[#5840c7] to-[#7c5ce7] text-white shadow-lg shadow-violet-950/20"
              : "text-slate-500 hover:bg-violet-50",
          )}
        >
          <BarChart3
            className={cn(
              "size-4.5",
              active === "summary" && "text-[#eee9ff]",
            )}
          />
          Insights
        </Link>
      </nav>
    </>
  );
}
