import { useEffect, useState } from 'react';
import { PreSale } from './api/PreSale';
import { PreSaleAccount } from './api/PreSaleAccount';
import { UpdateTimer } from './api/UpdateTimer';
import { ConnectedWallet } from './api/Wallet';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface PreSaleAccountProviderProps {
  preSale: PreSale;
  updateTimer: UpdateTimer;
  wallet: ConnectedWallet;
  children: (preSaleAccount: PreSaleAccount) => JSX.Element;
}

export default function PreSaleAccountProvider({ preSale, updateTimer, wallet, children }: PreSaleAccountProviderProps): JSX.Element {
  const [ preSaleAccount, setPreSaleAccount ] = useState<PreSaleAccount>();
  const [ error, setError ] = useState<unknown>();

  useEffect(() => {
    const watcher = preSale.createAccountWatcher(updateTimer, wallet);
    watcher.addEventListener('change', ({ preSaleAccount }) => setPreSaleAccount(preSaleAccount));
    watcher.addEventListener('error', ({ error }) => setError(error));
    return () => watcher.abort();
  }, [ preSale, updateTimer, wallet ]);

  if (!preSaleAccount) {
    return <LoadingSpinner />;

  } else {
    return <>
      <ErrorAlert error={error} onClose={() => setError(undefined)} />
      {children(preSaleAccount)}
    </>;
  }
}
