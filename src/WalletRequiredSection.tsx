import { Button } from 'react-bootstrap';
import { Wallet } from './api/wallet';
import ErrorAlert from './ErrorAlert';
import LoadingSpinner from './LoadingSpinner';
import { CONNECTING_WALLET, WalletError, WalletType } from './WalletProvider';

interface WalletRequiredSectionProps {
  wallet: WalletType;
  requestWallet(): void;
  children(wallet: Wallet): JSX.Element;
}

export default function WalletRequiredSection({ wallet, requestWallet, children }: WalletRequiredSectionProps) {
  if (wallet === CONNECTING_WALLET) {
    return <LoadingSpinner />;

  } else if (wallet instanceof WalletError) {
    return <ErrorAlert error={wallet.cause} />;

  } else if (!wallet) {
    return (
      <div className="text-center my-3">
        <Button variant="success" onClick={requestWallet}>Connect Wallet</Button>
      </div>
    );

  } else {
    return children(wallet);
  }
}
