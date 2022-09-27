import { useEffect, useState } from 'react';
import { PreSale } from './api/PreSale';
import { PreSaleState } from './api/PreSaleState';
import { UpdateTimer } from './api/UpdateTimer';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface PreSaleStateProviderProps {
  preSale: PreSale;
  updateTimer: UpdateTimer;
  children: (preSaleState: PreSaleState) => JSX.Element;
}

export default function PreSaleStateProvider({ preSale, updateTimer, children }: PreSaleStateProviderProps): JSX.Element {
  const [ preSaleState, setPreSaleState ] = useState<PreSaleState>();
  const [ error, setError ] = useState<unknown>();

  useEffect(() => {
    const watcher = preSale.createStateWatcher(updateTimer);
    watcher.addEventListener('change', ({ preSaleState }) => setPreSaleState(preSaleState));
    watcher.addEventListener('error', ({ error }) => setError(error));
    return () => watcher.abort();
  }, [ preSale, updateTimer ]);

  if (!preSaleState) {
    return <LoadingSpinner />;

  } else {
    return <>
      {error && <ErrorAlert error={error} onClose={() => setError(undefined)} />}
      {children(preSaleState)}
    </>;
  }
}
