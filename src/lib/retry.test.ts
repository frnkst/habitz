import { describe, expect, it, vi } from "vitest";

import { isTransientReadError, retryTransientRead } from "@/lib/retry";

describe("transient data read retries", () => {
  it("recognizes connection-class PostgREST errors", () => {
    expect(
      isTransientReadError({
        code: "PGRST002",
        message: "Could not query the database schema cache",
      }),
    ).toBe(true);
    expect(
      isTransientReadError({
        code: "42501",
        message: "permission denied",
      }),
    ).toBe(false);
  });

  it("retries transient failures with bounded backoff", async () => {
    vi.useFakeTimers();
    const operation = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST000", message: "connection failed" },
      })
      .mockResolvedValueOnce({ data: ["ok"], error: null });
    const onRetry = vi.fn();

    const resultPromise = retryTransientRead(operation, onRetry);
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual({
      data: ["ok"],
      error: null,
    });
    expect(operation).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("does not retry authorization or schema errors", async () => {
    const result = {
      data: null,
      error: { code: "42501", message: "permission denied" },
    };
    const operation = vi.fn().mockResolvedValue(result);

    await expect(
      retryTransientRead(operation, vi.fn()),
    ).resolves.toEqual(result);
    expect(operation).toHaveBeenCalledOnce();
  });

  it("returns the final transient failure after retry exhaustion", async () => {
    vi.useFakeTimers();
    const finalResult = {
      data: null,
      error: { code: "PGRST003", message: "pool timeout" },
    };
    const operation = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST000", message: "connection failed" },
      })
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST001", message: "connection failed again" },
      })
      .mockResolvedValueOnce(finalResult);

    const resultPromise = retryTransientRead(operation, vi.fn());
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual(finalResult);
    expect(operation).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("converts thrown network failures into retryable results", async () => {
    vi.useFakeTimers();
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({ data: ["recovered"], error: null });

    const resultPromise = retryTransientRead(operation, vi.fn());
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual({
      data: ["recovered"],
      error: null,
    });
    expect(operation).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
