import { describe, expect, it } from "vitest";

import {
  enumerateDates,
  getPeriodRange,
  shiftPeriod,
  todayInTimeZone,
} from "@/lib/dates";

describe("calendar dates", () => {
  it("uses the configured timezone around midnight", () => {
    const now = new Date("2026-08-17T22:30:00.000Z");
    expect(todayInTimeZone("Europe/Zurich", now)).toBe("2026-08-18");
    expect(todayInTimeZone("America/New_York", now)).toBe("2026-08-17");
  });

  it("creates Monday-start weeks", () => {
    expect(getPeriodRange("2026-08-19", "week", 1)).toEqual({
      start: "2026-08-17",
      end: "2026-08-23",
    });
  });

  it("handles leap-year month ranges and navigation", () => {
    expect(getPeriodRange("2028-02-11", "month", 1)).toEqual({
      start: "2028-02-01",
      end: "2028-02-29",
    });
    expect(shiftPeriod("2028-02-11", "month", 1)).toBe("2028-03-01");
  });

  it("enumerates inclusive periods", () => {
    expect(
      enumerateDates({ start: "2026-08-17", end: "2026-08-19" }),
    ).toEqual(["2026-08-17", "2026-08-18", "2026-08-19"]);
  });
});
