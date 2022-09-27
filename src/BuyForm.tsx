import { parseValue } from '@theorderbookdex/abi2ts-lib';
import { FormEvent, useCallback, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { TransactionSender } from './api/TransactionSender';
import { ConnectedWallet } from './api/Wallet';
import EtherValueInput from './EtherValueInput';

const ETHER = parseValue(1);

interface BuyFormProps {
  exchangeRate: bigint;
  preSale: PreSale;
  wallet: ConnectedWallet;
  onSend(transaction: TransactionSender): void;
}

export default function BuyForm({ exchangeRate, preSale, wallet, onSend }: BuyFormProps) {
  const [ validated, setValidated ] = useState(false);
  const [ eth, setEth ] = useState(parseValue('0.01'));
  const [ tokens, setTokens ] = useState(parseValue('0.01') * exchangeRate / ETHER);

  const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity()) {
      setValidated(false);
      onSend(preSale.buy(wallet, eth));

    } else {
      setValidated(true);
    }
  }, [ eth, preSale, wallet, onSend ]);

  const onEthChange = useCallback((eth: bigint) => {
    setEth(eth);
    setTokens(eth * exchangeRate / ETHER);
  }, [ exchangeRate ]);

  const onTokensChange = useCallback((tokens: bigint) => {
    setTokens(tokens);
    setEth(tokens * ETHER / exchangeRate + (tokens * ETHER % exchangeRate ? 1n : 0n));
  }, [ exchangeRate ]);

  const onTokensBlur = useCallback(() => {
    setTokens(exchangeRate * eth / ETHER);
  }, [ eth, exchangeRate ]);

  return (
    <Form className="mb-3" noValidate validated={validated} onSubmit={submit}>
      <Row className="g-2">
        <Col xs={6}>
          <InputGroup size="sm">
            <InputGroup.Text>With:</InputGroup.Text>
            <EtherValueInput className="text-end" value={eth} min={1n} step={1n} onChange={onEthChange} />
            <InputGroup.Text>ETH</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col xs={6}>
          <InputGroup size="sm">
            <InputGroup.Text>Buy:</InputGroup.Text>
            <EtherValueInput className="text-end" value={tokens} min={1n} step={1n} onChange={onTokensChange} onBlur={onTokensBlur} />
            <InputGroup.Text>OBD</InputGroup.Text>
          </InputGroup>
        </Col>
        <Col xs={8}>
          <Form.Text>Exchange rate might change during transaction execution when close to stage end.</Form.Text>
        </Col>
        <Col xs={4}>
          <Button className="w-100" size="sm" type="submit" variant="success">Buy</Button>
        </Col>
      </Row>
    </Form>
  );
}
