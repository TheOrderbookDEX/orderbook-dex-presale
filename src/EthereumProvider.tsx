import { useEffect, useState } from 'react';
import { Ethereum, getEthereum } from './api/Ethereum';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface EthereumProviderProps {
  children: (ethereum: Ethereum) => JSX.Element;
}

export default function EthereumProvider({ children }: EthereumProviderProps): JSX.Element {
  const [ error, setError ] = useState<unknown>();
  const [ ethereum, setEthereum ] = useState<Ethereum>();

  useEffect(() => {
    try {
      setEthereum(getEthereum());
    } catch (error) {
      setError(error);
    }
  }, []);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (!ethereum) {
    return <LoadingSpinner />;

  } else {
    return children(ethereum);
  }
}
