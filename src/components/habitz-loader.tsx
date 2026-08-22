import { cn } from "@/lib/utils";

export function HabitzLoader({
  compact = false,
  inverted = false,
  label = "Waking up your habits",
}: {
  compact?: boolean;
  inverted?: boolean;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "gap-2.5" : "flex-col gap-5",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "habitz-loader relative isolate",
          compact ? "size-6" : "size-20",
        )}
        aria-hidden="true"
      >
        <span className="habitz-loader-orbit absolute inset-0 rounded-full" />
        <span className="habitz-loader-orbit-reverse absolute inset-[12%] rounded-full" />
        <span className="habitz-loader-core absolute inset-[31%] rounded-[38%]" />
      </div>
      <div className={cn("text-center", compact && "text-left")}>
        <p
          className={cn(
            "font-bold tracking-[-0.025em] text-violet-950",
            compact ? "text-xs" : "text-base",
            inverted && "text-white",
          )}
        >
          {label}
        </p>
        {!compact ? (
          <div className="mt-2 flex justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <span
                key={index}
                className="habitz-loader-dot size-1.5 rounded-full bg-violet-500"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
