import 'server-only';

function isRetryableDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('Connection closed') ||
    message.includes('Connection terminated unexpectedly') ||
    message.includes('ECONNRESET') ||
    message.includes('terminating connection')
  );
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isRetryableDatabaseError(error)) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return operation();
  }
}
