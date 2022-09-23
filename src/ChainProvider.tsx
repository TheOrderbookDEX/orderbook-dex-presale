import { useCallback, useEffect, useState } from 'react';
import { Chain } from './api/chain';
import { getEthereum } from './api/ethereum';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';

interface ChainProviderProps {
  children: (chain: Chain) => JSX.Element;
}

export default function ChainProvider({ children }: ChainProviderProps): JSX.Element {
  const [ abortSignal, setAbortSignal ] = useState<AbortSignal>();

  useEffect(() => {
    const abortController = new AbortController();
    setAbortSignal(abortController.signal);
    return () => abortController.abort();
  }, []);

  const [ error, setError ] = useState<unknown>();
  const [ chain, setChain ] = useState<Chain>();

  const connectChain = useCallback((abortSignal: AbortSignal) => {
    void (async() => {
      try {
        setChain(undefined);
        setError(undefined);
        const chain = await Chain.connect(getEthereum(), abortSignal);
        setChain(chain);

      } catch (error) {
        if (error !== abortSignal.reason) {
          setError(error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!abortSignal) return;
    connectChain(abortSignal);
  }, [ abortSignal, connectChain ]);

  useEffect(() => {
    if (!abortSignal) return;
    if (!chain) return;
    const localAbortController = new AbortController();
    chain.addEventListener('disconnect', () => connectChain(abortSignal), { signal: abortSignal });
    abortSignal.addEventListener('abort', () => chain.disconnect(), { signal: localAbortController.signal });
    return () => localAbortController.abort();
  }, [ abortSignal, chain, connectChain ]);

  if (error) {
    return <ErrorAlert error={error} />;

  } else if (!chain) {
    return <LoadingSpinner />;

  } else {
    return children(chain);
  }
}
