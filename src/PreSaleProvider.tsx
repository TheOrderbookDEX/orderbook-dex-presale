import { useEffect, useState } from 'react';
import { ConnectedChain } from './api/Chain';
import { PreSaleConnection } from './api/PreSaleConnection';
import { PreSale } from './api/PreSale';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface PreSaleProviderProps {
  chain: ConnectedChain;
  children: (preSale: PreSale) => JSX.Element;
}

export default function PreSaleProvider({ chain, children }: PreSaleProviderProps): JSX.Element {
  const [ error, setError ] = useState<unknown>();
  const [ preSale, setPreSale ] = useState<PreSale>();

  useEffect(() => {
    const connection = new PreSaleConnection(chain);
    connection.addEventListener('ready', ({ preSale }) => setPreSale(preSale));
    connection.addEventListener('error', ({ error }) => setError(error));
    return () => connection.abort();
  }, [ chain ]);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (!preSale) {
    return <LoadingSpinner />;

  } else {
    return children(preSale);
  }
}
