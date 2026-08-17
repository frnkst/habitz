import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PeriodNavigation({
  label,
  previousHref,
  nextHref,
  todayHref,
}: {
  label: string;
  previousHref: string;
  nextHref: string;
  todayHref: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={previousHref}
        aria-label="Previous period"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-10 rounded-full border-white/80 bg-white/75 shadow-sm",
        )}
      >
        <ChevronLeft />
      </Link>
      <div className="min-w-0 text-center">
        <p className="truncate text-base font-bold tracking-[-0.03em] sm:text-lg">
          {label}
        </p>
        <Link
          href={todayHref}
          className="mt-0.5 inline-block text-[11px] font-semibold text-emerald-700 hover:underline"
        >
          Back to today
        </Link>
      </div>
      <Link
        href={nextHref}
        aria-label="Next period"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-10 rounded-full border-white/80 bg-white/75 shadow-sm",
        )}
      >
        <ChevronRight />
      </Link>
    </div>
  );
}
