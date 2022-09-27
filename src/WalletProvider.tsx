import { useEffect, useState } from 'react';
import { ConnectedChain } from './api/Chain';
import { WalletConnection } from './api/WalletConnection';
import { Wallet } from './api/Wallet';
import ErrorAlert from './ErrorAlert';

interface WalletProviderProps {
  chain: ConnectedChain;
  children(wallet: Wallet, requestAccess: () => void): JSX.Element;
}

export default function WalletProvider({ chain, children }: WalletProviderProps): JSX.Element {
  const [ error, setError ] = useState<unknown>();
  const [ wallet, setWallet ] = useState<Wallet>();
  const [ requestAccess, setRequestAccess ] = useState(() => () => {});

  useEffect(() => {
    const connection = new WalletConnection(chain);
    setRequestAccess(() => () => connection.requestAccess());
    connection.addEventListener('change', ({ wallet }) => setWallet(wallet));
    connection.addEventListener('error', ({ error }) => setError(error));
    return () => connection.abort();
  }, [ chain ]);

  return <>
    <ErrorAlert error={error} onClose={() => setError(undefined)} />
    {children(wallet, requestAccess)}
  </>;
}
