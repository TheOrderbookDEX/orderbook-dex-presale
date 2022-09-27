import { Ended, NotStarted, BuyLimitReached, NotEnoughFunds, SoldOut, NotReleased, NotSuccessful, NothingToCancel } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { NoEthereumProvider } from '../api/Ethereum';
import { InvalidChain } from '../api/PreSaleConnection';

export interface FormattedError {
  title: JSX.Element;
  message: JSX.Element;
}

export function formatError(error: unknown): FormattedError {
  if (error instanceof NoEthereumProvider) {
    return {
      title: <>No Ethereum provider found</>,
      message: <p>It looks like you don't have an Ethereum Provider (e.g. MetaMask) installed.</p>,
    };

  } else if (error instanceof InvalidChain) {
    return {
      title: <>Chain not supported</>,
      message: <p>Please switch to the Goerli testnet to access the pre-sale.</p>,
    };

  } else if (error instanceof NotStarted) {
    return {
      title: <>Pre-sale has not started</>,
      message: <p>The pre-sale has not started yet, please try again later.</p>,
    };

  } else if (error instanceof Ended) {
    return {
      title: <>Pre-sale has ended</>,
      message: <>
        <p>The pre-sale has ended, you cannot buy any more tokens nor cancel your order at this point.</p>
      </>,
    };

  } else if (error instanceof BuyLimitReached) {
    return {
      title: <>Buy limit reached</>,
      message: <p>We are sorry, you've already bought the max tokens allowed per address.</p>,
    };

  } else if (error instanceof NotEnoughFunds) {
    return {
      title: <>Not enough funds</>,
      message: <p>It seems the ETH you provided wasn't enough to buy any tokens, please try a different amount.</p>,
    };

  } else if (error instanceof SoldOut) {
    return {
      title: <>Sold out</>,
      message: <>
        <p>There are no more tokens for sale.</p>
        <p>Check our website and our socials for more ways you can get the token.</p>
      </>,
    };

  } else if (error instanceof NotReleased) {
    return {
      title: <>Tokens not available yet</>,
      message: <p>Sorry, the tokens are not available at this time, please try again later.</p>,
    };

  } else if (error instanceof NotSuccessful) {
    return {
      title: <>Funding target not reached</>,
      message: <>
        <p>The funding target for the pre-sale wasn't reach, so the tokens will not be distributed.</p>
        <p>Please cancel your order to get your ETH refunded.</p>
      </>,
    };

  } else if (error instanceof NothingToCancel) {
    return {
      title: <>Nothing to cancel</>,
      message: <>
        <p>You haven't bought any tokens or have already canceled your order.</p>
      </>,
    };

  } else {
    console.error(error);
    return {
      title: <>Unexpected error</>,
      message: <p>An unexpected error has occurred.</p>,
    };
  }
}
