export type ReadError = {
  code?: string;
  message: string;
};

const transientMessagePattern =
  /connection|fetch failed|gateway|network|socket|timeout|temporarily unavailable/i;

export function isTransientReadError(error: ReadError): boolean {
  return (
    error.code?.startsWith("PGRST0") === true ||
    transientMessagePattern.test(error.message)
  );
}

export async function retryTransientRead<T>(
  operation: () => PromiseLike<{ data: T | null; error: ReadError | null }>,
  onRetry: (error: ReadError) => void,
): Promise<{ data: T | null; error: ReadError | null }> {
  const firstResult = await operation();
  if (!firstResult.error || !isTransientReadError(firstResult.error)) {
    return firstResult;
  }

  onRetry(firstResult.error);
  await new Promise((resolve) => setTimeout(resolve, 150));
  return operation();
}
