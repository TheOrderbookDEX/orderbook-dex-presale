import { useEffect, useState } from 'react';
import { ChainConnection } from './api/ChainConnection';
import { ConnectedChain } from './api/Chain';
import { Ethereum } from './api/Ethereum';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface ChainProviderProps {
  ethereum: Ethereum;
  children: (chain: ConnectedChain) => JSX.Element;
}

export default function ChainProvider({ ethereum, children }: ChainProviderProps): JSX.Element {
  const [ error, setError ] = useState<unknown>();
  const [ chain, setChain ] = useState<ConnectedChain>();

  useEffect(() => {
    const connection = new ChainConnection(ethereum);
    connection.addEventListener('change', ({ chain }) => setChain(chain));
    connection.addEventListener('error', ({ error }) => setError(error));
    return () => connection.abort();
  }, [ ethereum ]);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (!chain) {
    return <LoadingSpinner />;

  } else {
    return children(chain);
  }
}
