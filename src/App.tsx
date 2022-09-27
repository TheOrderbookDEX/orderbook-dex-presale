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
import TransactionAwaiter from './TransactionAwaiter';
import EthereumProvider from './EthereumProvider';
import UpdateTimerProvider from './UpdateTimerProvider';
import PreSaleAccountProvider from './PreSaleAccountProvider';
import AccountInfo from './AccountInfo';

export default function App() {
  return (
    <ModalContainer>
      <EthereumProvider>{(ethereum) =>
        <ChainProvider ethereum={ethereum}>{(chain) =>
          <PreSaleProvider chain={chain}>{(preSale) =>
            <UpdateTimerProvider>{(updateTimer) =>
              <PreSaleStateProvider preSale={preSale} updateTimer={updateTimer}>{(preSaleState) =>
                <WalletProvider chain={chain}>{(wallet, requestWallet) =>
                  <TimeProvider>{(time) => <>
                    <ExchangeRateProvider time={time} preSale={preSale}>{(exchangeRate) => <>
                      <TimeInfo time={time} preSale={preSale} />
                      <hr />
                      <TokenInfo preSale={preSale} preSaleState={preSaleState} />
                      <hr />
                      <EthInfo preSale={preSale} preSaleState={preSaleState} />
                      <hr />
                      <TransactionAwaiter updateTimer={updateTimer}>{(awaitTransaction) => <>
                        <ExchangeRateInfo exchangeRate={exchangeRate} />
                        <WalletRequiredSection wallet={wallet} requestWallet={requestWallet}>{(wallet) => <>
                          <PreSaleAccountProvider preSale={preSale} updateTimer={updateTimer} wallet={wallet}>{(preSaleAccount) => <>
                            <BuyForm exchangeRate={exchangeRate} preSale={preSale} wallet={wallet} onSend={awaitTransaction} />
                            <hr />
                            <AccountInfo preSale={preSale} preSaleAccount={preSaleAccount} />
                          </>}</PreSaleAccountProvider>
                        </>}</WalletRequiredSection>
                      </>}</TransactionAwaiter>
                    </>}</ExchangeRateProvider>
                  </>}</TimeProvider>
                }</WalletProvider>
              }</PreSaleStateProvider>
            }</UpdateTimerProvider>
          }</PreSaleProvider>
        }</ChainProvider>
      }</EthereumProvider>
    </ModalContainer>
  );
}
