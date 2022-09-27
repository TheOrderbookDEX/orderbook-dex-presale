import { useMemo } from 'react';
import { PreSale } from './api/PreSale';

interface ExchangeRateProviderProps {
  time: bigint;
  preSale: PreSale;
  children(exchangeRate: bigint): JSX.Element;
}

export default function ExchangeRateProvider({ time, preSale, children }: ExchangeRateProviderProps) {
  const exchangeRate = useMemo(() => {
    if (time < preSale.earlyEndTime) {
      return preSale.earlyExchangeRate;
    } else {
      return preSale.exchangeRate;
    }
  }, [ time, preSale ]);

  return children(exchangeRate);
}
