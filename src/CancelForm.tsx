import { useCallback } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { PreSaleAccount } from './api/PreSaleAccount';
import { TransactionSender } from './api/TransactionSender';
import { ConnectedWallet } from './api/Wallet';
import EtherValueInput from './EtherValueInput';

interface CancelFormProps {
  preSale: PreSale;
  preSaleAccount: PreSaleAccount;
  wallet: ConnectedWallet;
  onSend(transaction: TransactionSender): void;
}

export default function CancelForm({ preSale, preSaleAccount, wallet, onSend }: CancelFormProps) {
  const send = useCallback(() => {
    onSend(preSale.cancel(wallet));
  }, [ preSale, wallet, onSend ]);

  return (
    <Row className="g-2 mb-3">
      <Col xs={6}>
        <InputGroup size="sm">
          <InputGroup.Text>Refund:</InputGroup.Text>
          <EtherValueInput className="text-end" value={preSaleAccount.amountPaid} />
          <InputGroup.Text>ETH</InputGroup.Text>
        </InputGroup>
      </Col>
      <Col xs={6}>
        <InputGroup size="sm">
          <InputGroup.Text>Return:</InputGroup.Text>
          <EtherValueInput className="text-end" value={preSaleAccount.amountBought} />
          <InputGroup.Text>OBD</InputGroup.Text>
        </InputGroup>
      </Col>
      <Col xs={8}>
        <Form.Text>You only may cancel your order while the pre-sale is going or if the funding target is not reached.</Form.Text>
      </Col>
      <Col xs={4}>
        <Button className="w-100" size="sm" variant="success" onClick={send}>Cancel</Button>
      </Col>
    </Row>
  );
}
