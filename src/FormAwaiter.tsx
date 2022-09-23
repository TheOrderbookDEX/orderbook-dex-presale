import { useCallback, useEffect, useState } from 'react';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface Sender {
  (abortSignal: AbortSignal): Promise<void>;
}

interface Awaiter {
  (sender: Sender): void;
}

interface FormAwaiterProps {
  children(awaiter: Awaiter): JSX.Element;
}

export default function FormAwaiter({ children }: FormAwaiterProps) {
  const [ abortSignal, setAbortSignal ] = useState<AbortSignal>();

  useEffect(() => {
    const abortController = new AbortController();
    setAbortSignal(abortController.signal);
    return () => abortController.abort();
  }, []);

  const [ sending, setSending ] = useState(false);
  const [ error, setError ] = useState<unknown>();

  const awaiter = useCallback((sender: Sender) => {
    if (!abortSignal) return;

    setSending(true);
    setError(undefined);

    void (async () => {
      try {
        await sender(abortSignal);
        setSending(false);

      } catch (error) {
        if (error !== abortSignal.reason) {
          setError(error);
          setSending(false);
        }
      }
    })();
  }, [ abortSignal ]);

  return <>
    {sending && <LoadingSpinner />}
    <div className={sending ? 'd-none' : ''}><>
      {error && <ErrorAlert error={error} dismissible />}
      {children(awaiter)}
    </></div>
  </>;
}
