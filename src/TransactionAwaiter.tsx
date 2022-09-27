import { useCallback, useEffect, useState } from 'react';
import { TransactionSender } from './api/TransactionSender';
import { UpdateTimer } from './api/UpdateTimer';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface TransactionAwaiterProps {
  updateTimer: UpdateTimer;
  children(awaitTransaction: (transaction: TransactionSender) => void): JSX.Element;
}

export default function TransactionAwaiter({ updateTimer, children }: TransactionAwaiterProps) {
  const [ transaction, setTransaction ] = useState<TransactionSender>();
  const [ error, setError ] = useState<unknown>();

  const awaitTransaction = useCallback((transaction: TransactionSender) => {
    setTransaction(transaction);
    transaction.addEventListener('success', () => {
      setTransaction(undefined);
      updateTimer.update();
    });
    transaction.addEventListener('reject', () => setTransaction(undefined));
    transaction.addEventListener('error', ({ error }) => {
      setTransaction(undefined);
      setError(error);
    });
  }, [ updateTimer ]);

  useEffect(() => {
    if (!transaction) return;
    return () => transaction.abort();
  }, [ transaction ]);

  return <>
    {transaction && <LoadingSpinner />}
    <ErrorAlert error={error} onClose={() => setError(undefined)} />
    <div className={transaction ? 'd-none' : ''}><>
      {children(awaitTransaction)}
    </></div>
  </>;
}
