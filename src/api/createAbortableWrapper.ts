export function createAbortableWrapper(abortSignal: AbortSignal) {
  return async function<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } finally {
      abortSignal.throwIfAborted();
    }
  }
}
