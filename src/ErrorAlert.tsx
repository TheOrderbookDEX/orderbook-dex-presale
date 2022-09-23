import { Ended, NotStarted, BuyLimitReached, NotEnoughFunds, SoldOut } from '@theorderbookdex/orderbook-dex-token/dist/interfaces/IOrderbookDEXPreSale';
import { useMemo, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { NoEthereumProvider } from './api/ethereum';
import { InvalidChain } from './api/presale';

interface ErrorAlertProps {
  error: unknown;
  dismissible?: boolean;
}

export default function ErrorAlert({ error, dismissible }: ErrorAlertProps) {
  const [ show, setShow ] = useState(true);

  const { title, message } = useMemo(() => {
    if (error instanceof NoEthereumProvider) {
      return {
        title: <>No Ethereum Provider Found</>,
        message: <p>It looks like you don't have an Ethereum Provider (e.g. MetaMask) installed.</p>,
      };

    } else if (error instanceof InvalidChain) {
      return {
        title: <>Chain Not Supported</>,
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
        message: <p>The pre-sale has ended. Check our website and our socials for more ways you can get the token.</p>,
      };

    } else if (error instanceof BuyLimitReached) {
      return {
        title: <>Buy Limit Reached</>,
        message: <p>We are sorry, you've already bought the max tokens allowed per address.</p>,
      };

    } else if (error instanceof NotEnoughFunds) {
      return {
        title: <>Not Enough Funds</>,
        message: <p>It seems the ETH you provided wasn't enough to buy any tokens, please try with a different amount.</p>,
      };

    } else if (error instanceof SoldOut) {
      return {
        title: <>Sold Out</>,
        message: <p>There are no more tokens for sale. Check our website and our socials for more ways you can get the token.</p>,
      };

    } else {
      console.error(error);
      return {
        title: <>Unexpected Error</>,
        message: <p>An unexpected error has occurred.</p>,
      };
    }
  }, [ error ])

  return (
    <Alert className="mb-3" variant="danger" show={show} onClose={() => setShow(false)} dismissible={dismissible}>
      <Alert.Heading>{title}</Alert.Heading>
      <hr />
      {message}
    </Alert>
  );
}
