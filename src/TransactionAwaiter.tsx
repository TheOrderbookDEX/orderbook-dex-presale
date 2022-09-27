import { useCallback, useEffect, useState } from 'react';
import { TransactionSender } from './api/TransactionSender';
import { UpdateTimer } from './api/UpdateTimer';
import LoadingSpinner from './LoadingSpinner';
import { ShowNotificationCallback } from './Notifications';
import { formatError } from './utils/error';

interface TransactionAwaiterProps {
  updateTimer: UpdateTimer;
  showNotification: ShowNotificationCallback;
  children(awaitTransaction: (transaction: TransactionSender) => void): JSX.Element;
}

export default function TransactionAwaiter({ updateTimer, showNotification, children }: TransactionAwaiterProps) {
  const [ transaction, setTransaction ] = useState<TransactionSender>();

  const awaitTransaction = useCallback((transaction: TransactionSender) => {
    setTransaction(transaction);
    transaction.addEventListener('success', () => {
      setTransaction(undefined);
      // TODO showNotification({ type: 'success' });
      updateTimer.update();
    });
    transaction.addEventListener('reject', () => setTransaction(undefined));
    transaction.addEventListener('error', ({ error }) => {
      setTransaction(undefined);
      showNotification({ type: 'danger', ...formatError(error) });
    });
  }, [ updateTimer, showNotification ]);

  useEffect(() => {
    if (!transaction) return;
    return () => transaction.abort();
  }, [ transaction ]);

  return <>
    {transaction && <LoadingSpinner />}
    <div className={transaction ? 'd-none' : ''}>
      {children(awaitTransaction)}
    </div>
  </>;
}
