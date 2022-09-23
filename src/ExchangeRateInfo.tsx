import { Col, Row } from 'react-bootstrap';
import { formatTokens } from './utils/format';

interface PreSaleFormProps {
  exchangeRate: bigint;
}

export default function ExchangeRateInfo({ exchangeRate }: PreSaleFormProps) {
  return (
    <div className="mb-3">
      <Row>
        <Col>Current Exchange Rate:</Col>
        <Col className="text-end">0.01 ETH = {formatTokens(exchangeRate / 100n)} OBD</Col>
      </Row>
    </div>
  );
}
