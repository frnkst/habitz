export type Period = "week" | "month" | "year";

export type DateRange = {
  start: string;
  end: string;
};

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

function dateFromKey(dateKey: string): Date {
  if (!dateKeyPattern.test(dateKey)) {
    throw new Error(`Invalid date: ${dateKey}`);
  }
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateKey}`);
  }
  return date;
}

function dateToKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function shiftDate(dateKey: string, days: number): string {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToKey(date);
}

export function isDateKey(value: string): boolean {
  try {
    dateFromKey(value);
    return true;
  } catch {
    return false;
  }
}

export function todayInTimeZone(
  timezone: string,
  now: Date = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getPeriodRange(
  anchor: string,
  period: Period,
  weekStart: number,
): DateRange {
  const date = dateFromKey(anchor);

  if (period === "week") {
    const distance = (date.getUTCDay() - weekStart + 7) % 7;
    const start = shiftDate(anchor, -distance);
    return { start, end: shiftDate(start, 6) };
  }

  if (period === "month") {
    const start = dateToKey(
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
    );
    const end = dateToKey(
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
    );
    return { start, end };
  }

  return {
    start: `${date.getUTCFullYear()}-01-01`,
    end: `${date.getUTCFullYear()}-12-31`,
  };
}

export function shiftPeriod(
  anchor: string,
  period: Period,
  direction: -1 | 1,
): string {
  const date = dateFromKey(anchor);
  if (period === "week") {
    return shiftDate(anchor, direction * 7);
  }
  if (period === "month") {
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + direction);
    return dateToKey(date);
  }
  date.setUTCFullYear(date.getUTCFullYear() + direction, 0, 1);
  return dateToKey(date);
}

export function enumerateDates(range: DateRange): string[] {
  const dates: string[] = [];
  for (
    let current = range.start;
    current <= range.end;
    current = shiftDate(current, 1)
  ) {
    dates.push(current);
  }
  return dates;
}

export function formatDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...options,
  }).format(dateFromKey(dateKey));
}

export function formatPeriodLabel(range: DateRange, period: Period): string {
  if (period === "year") {
    return range.start.slice(0, 4);
  }
  if (period === "month") {
    return formatDate(range.start, { month: "long", year: "numeric" });
  }
  const start = formatDate(range.start, { day: "numeric", month: "short" });
  const end = formatDate(range.end, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${start} to ${end}`;
}
