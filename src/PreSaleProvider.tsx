import { useEffect, useState } from 'react';
import { Chain } from './api/chain';
import { PreSale } from './api/presale';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface PreSaleProviderProps {
  chain: Chain;
  children: (preSale: PreSale) => JSX.Element;
}

export default function PreSaleProvider({ chain, children }: PreSaleProviderProps): JSX.Element {
  const [ abortSignal, setAbortSignal ] = useState<AbortSignal>();

  useEffect(() => {
    const abortController = new AbortController();
    setAbortSignal(abortController.signal);
    return () => abortController.abort();
  }, [ chain ]);

  const [ error, setError ] = useState<unknown>();
  const [ preSale, setPreSale ] = useState<PreSale>();

  useEffect(() => {
    if (!abortSignal) return;

    void (async () => {
      try {
        setPreSale(undefined);
        setError(undefined);
        setPreSale(await PreSale.connect(chain, abortSignal));

      } catch (error) {
        if (error !== abortSignal.reason) {
          setError(error);
        }
      }
    })();
  }, [ abortSignal, chain ]);

  useEffect(() => {
    if (!abortSignal) return;
    if (!preSale) return;
    const localAbortController = new AbortController();
    abortSignal.addEventListener('abort', () => preSale.disconnect(), { signal: localAbortController.signal });
    return () => localAbortController.abort();
  }, [ abortSignal, preSale ]);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (!preSale) {
    return <LoadingSpinner />;

  } else {
    return children(preSale);
  }
}
