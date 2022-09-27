import { Col, ProgressBar, Row } from 'react-bootstrap';
import { formatTokens } from './utils/format';
import { percentage } from './utils/math';
import { PreSale } from './api/PreSale';
import { PreSaleState } from './api/PreSaleState';

interface TokenInfoProps {
  preSale: PreSale;
  preSaleState: PreSaleState;
}

export default function TokenInfo({ preSale, preSaleState }: TokenInfoProps) {
  return <>
    <div className="mb-2">
      <Row>
        <Col>Tokens sold:</Col>
        <Col className="text-end">{formatTokens(preSaleState.totalSold)} OBD</Col>
      </Row>
      <Row>
        <Col>Stage I tokens:</Col>
        <Col className="text-end">{formatTokens(preSale.earlyLimit)} OBD</Col>
      </Row>
      <Row>
        <Col>Pre-sale tokens:</Col>
        <Col className="text-end">{formatTokens(preSale.totalTokens)} OBD</Col>
      </Row>
    </div>
    <div className="position-relative mb-3">
      <ProgressBar variant="success" className="border border-primary" now={percentage(preSaleState.totalSold, preSale.totalTokens)} />
      <div className="position-absolute top-0 start-0 h-100 border-end border-primary" style={{ width: `${percentage(preSale.earlyLimit, preSale.totalTokens)}%` }}></div>
    </div>
  </>;
}
