import { Button } from 'react-bootstrap';
import { ConnectedWallet, CONNECTING_WALLET, Wallet } from './api/Wallet';
import LoadingSpinner from './LoadingSpinner';

interface WalletRequiredSectionProps {
  wallet: Wallet;
  requestWallet(): void;
  children(wallet: ConnectedWallet): JSX.Element;
}

export default function WalletRequiredSection({ wallet, requestWallet, children }: WalletRequiredSectionProps) {
  if (wallet === CONNECTING_WALLET) {
    return <LoadingSpinner />;

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
