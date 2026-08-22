export type ReadError = {
  code?: string;
  message: string;
  name?: string;
  status?: number;
};

const transientMessagePattern =
  /connection|fetch failed|failed to fetch|gateway|network|socket|timeout|timed out|temporarily unavailable|load failed/i;

export class ServiceUnavailableError extends Error {
  constructor(
    public readonly operation: string,
    public readonly details: ReadError,
  ) {
    super(`The ${operation} service is temporarily unavailable.`);
    this.name = "ServiceUnavailableError";
  }
}

export function isServiceUnavailableError(
  error: unknown,
): error is ServiceUnavailableError {
  return error instanceof ServiceUnavailableError;
}

export function normalizeReadError(error: unknown): ReadError {
  if (error instanceof Error) {
    return {
      code:
        "code" in error && typeof error.code === "string"
          ? error.code
          : undefined,
      message: error.message,
      name: error.name,
      status:
        "status" in error && typeof error.status === "number"
          ? error.status
          : undefined,
    };
  }
  return { message: String(error) };
}

export function isTransientReadError(error: ReadError): boolean {
  return (
    error.code?.startsWith("PGRST0") === true ||
    (error.status !== undefined && error.status >= 500) ||
    transientMessagePattern.test(error.message)
  );
}

export async function retryTransientRead<T>(
  operation: () => PromiseLike<{ data: T | null; error: ReadError | null }>,
  onRetry: (error: ReadError) => void,
): Promise<{ data: T | null; error: ReadError | null }> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let result: { data: T | null; error: ReadError | null };
    try {
      result = await operation();
    } catch (error) {
      const readError = normalizeReadError(error);
      if (!isTransientReadError(readError)) {
        throw error;
      }
      result = { data: null, error: readError };
    }

    if (
      !result.error ||
      !isTransientReadError(result.error) ||
      attempt === 2
    ) {
      return result;
    }

    onRetry(result.error);
    await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
  }

  throw new Error("Transient read retry loop exited unexpectedly.");
}
