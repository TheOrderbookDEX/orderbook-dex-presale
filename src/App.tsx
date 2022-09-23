import ModalContainer from './ModalContainer';
import ChainProvider from './ChainProvider';
import PreSaleProvider from './PreSaleProvider';
import TimeProvider from './TimeProvider';
import WalletProvider from './WalletProvider';
import PreSaleStateProvider from './PreSaleStateProvider';
import BuyForm from './BuyForm';
import TimeInfo from './TimeInfo';
import TokenInfo from './TokenInfo';
import EthInfo from './EthInfo';
import ExchangeRateInfo from './ExchangeRateInfo';
import WalletRequiredSection from './WalletRequiredSection';
import ExchangeRateProvider from './ExchangeRateProvider';
import FormAwaiter from './FormAwaiter';

export default function App() {
  return (
    <ModalContainer>
      <ChainProvider>{(chain) =>
        <PreSaleProvider chain={chain}>{(preSale) =>
          <PreSaleStateProvider preSale={preSale}>{(preSaleState) =>
            <WalletProvider chain={chain}>{(wallet, requestWallet) =>
              <TimeProvider>{(time) => <>
                <ExchangeRateProvider time={time} preSale={preSale}>{(exchangeRate) => <>
                  <TimeInfo time={time} preSale={preSale} />
                  <hr />
                  <TokenInfo preSale={preSale} preSaleState={preSaleState} />
                  <hr />
                  <EthInfo preSale={preSale} preSaleState={preSaleState} />
                  <hr />
                  <FormAwaiter>{(awaitSend) => <>
                    <ExchangeRateInfo exchangeRate={exchangeRate} />
                    <WalletRequiredSection wallet={wallet} requestWallet={requestWallet}>{(wallet) => <>
                      <BuyForm exchangeRate={exchangeRate} preSale={preSale} wallet={wallet} onSend={awaitSend} />
                    </>}</WalletRequiredSection>
                  </>}</FormAwaiter>
                </>}</ExchangeRateProvider>
              </>}</TimeProvider>
            }</WalletProvider>
          }</PreSaleStateProvider>
        }</PreSaleProvider>
      }</ChainProvider>
    </ModalContainer>
  );
}
