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
          <Button variant="ghost" size="icon-sm" aria-label="Sign out">
            <LogOut />
          </Button>
        </form>
      </div>
      <form action={signOut} className="sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-white/80 bg-white/60"
          aria-label="Sign out"
        >
          <LogOut />
        </Button>
      </form>
    </header>
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[12rem] items-center justify-center gap-1 rounded-t-[1.4rem] border border-b-0 border-white/90 bg-white/90 p-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-12px_35px_rgba(23,59,45,0.10)] backdrop-blur-xl sm:hidden">
      <Link
        href="/"
        aria-label="Calendar"
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-xl transition",
          active === "calendar"
            ? "bg-[#173b2d] text-[#c9ff65]"
            : "text-slate-500",
        )}
      >
        <CalendarDays className="size-5" />
      </Link>
      <Link
        href="/summary"
        aria-label="Summary"
        className={cn(
          "flex h-11 flex-1 items-center justify-center rounded-xl transition",
          active === "summary"
            ? "bg-[#173b2d] text-[#c9ff65]"
            : "text-slate-500",
        )}
      >
        <BarChart3 className="size-5" />
      </Link>
    </nav>
    </>
  );
}
