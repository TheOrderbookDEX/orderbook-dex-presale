import { useEffect, useState } from 'react';
import { PreSale, PreSaleState } from './api/presale';

interface PreSaleStateProviderProps {
  preSale: PreSale;
  children: (preSale: PreSaleState) => JSX.Element;
}

export default function PreSaleStateProvider({ preSale, children }: PreSaleStateProviderProps): JSX.Element {
  const [ preSaleState, setPreSaleState ] = useState<PreSaleState>(preSale.getState());

  useEffect(() => {
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    preSale.addEventListener('update', () => {
      setPreSaleState(preSale.getState());
    }, { signal: abortSignal });

    return () => abortController.abort();
  }, [ preSale ]);

  return children(preSaleState);
}
