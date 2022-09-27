import { useCallback } from 'react';
import { Button, Col, InputGroup, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { PreSaleAccount } from './api/PreSaleAccount';
import { TransactionSender } from './api/TransactionSender';
import { ConnectedWallet } from './api/Wallet';
import EtherValueInput from './EtherValueInput';

interface ClaimFormProps {
  preSale: PreSale;
  preSaleAccount: PreSaleAccount;
  wallet: ConnectedWallet;
  onSend(transaction: TransactionSender): void;
}

export default function ClaimForm({ preSale, preSaleAccount, wallet, onSend }: ClaimFormProps) {
  const send = useCallback(() => {
    onSend(preSale.claim(wallet));
  }, [ preSale, wallet, onSend ]);

  return (
    <Row className="g-2 mb-3">
      <Col xs={8}>
        <InputGroup size="sm">
          <InputGroup.Text>Claim:</InputGroup.Text>
          <EtherValueInput className="text-end" value={preSaleAccount.amountBought} />
          <InputGroup.Text>OBD</InputGroup.Text>
        </InputGroup>
      </Col>
      <Col xs={4}>
        <Button className="w-100" size="sm" variant="success" onClick={send}>Claim</Button>
      </Col>
    </Row>
  );
}
