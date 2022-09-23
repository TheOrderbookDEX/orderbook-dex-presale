import { useCallback, useEffect, useState } from 'react';
import { Chain } from './api/chain';
import { PermissionToWalletRequired, Wallet, WalletConnectionRejected } from './api/wallet';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

export const CONNECTING_WALLET = Symbol();

export type WalletType = Wallet | typeof CONNECTING_WALLET | WalletError | undefined;

interface WalletProviderProps {
  chain: Chain;
  children(wallet: WalletType, requestAccess: () => void): JSX.Element;
}

export default function WalletProvider({ chain, children }: WalletProviderProps): JSX.Element {
  const [ abortSignal, setAbortSignal ] = useState<AbortSignal>();

  useEffect(() => {
    const abortController = new AbortController();
    setAbortSignal(abortController.signal);
    return () => abortController.abort();
  }, [ chain ]);

  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<unknown>();
  const [ wallet, setWallet ] = useState<WalletType>();

  const connectWallet = useCallback((chain: Chain, abortSignal: AbortSignal) => {
    void (async () => {
      try {
        setWallet(undefined);
        setLoading(true);
        setError(undefined);
        setWallet(await Wallet.connect(chain, abortSignal));

      } catch (error) {
        if (error !== abortSignal.reason) {
          if (error instanceof PermissionToWalletRequired) return;
          if (error instanceof WalletConnectionRejected) return;
          setError(error);
        }

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!abortSignal) return;
    connectWallet(chain, abortSignal);
  }, [ chain, connectWallet, abortSignal ]);

  useEffect(() => {
    if (!abortSignal) return;
    if (!(wallet instanceof Wallet)) return;
    const localAbortController = new AbortController();
    wallet.addEventListener('disconnect', () => connectWallet(chain, abortSignal), { signal: abortSignal });
    abortSignal.addEventListener('abort', () => wallet.disconnect(), { signal: localAbortController.signal });
    return () => localAbortController.abort();
  }, [ wallet, chain, connectWallet, abortSignal ]);

  const requestAccess = useCallback(() => {
    if (!abortSignal) return;
    void (async () => {
      try {
        setWallet(CONNECTING_WALLET);
        setWallet(await Wallet.requestAccess(chain, abortSignal));

      } catch (error) {
        if (error !== abortSignal.reason) {
          if (error instanceof WalletConnectionRejected) {
            setWallet(undefined);
          } else {
            setWallet(new WalletError(error));
          }
        }
      }
    })();
  }, [ abortSignal, chain ]);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (loading) {
    return <LoadingSpinner />;

  } else {
    return children(wallet, requestAccess);
  }
}

export class WalletError extends Error {
  constructor(cause: unknown) {
    super('Wallet Error', { cause });
    this.name = 'WalletError';
  }
}
