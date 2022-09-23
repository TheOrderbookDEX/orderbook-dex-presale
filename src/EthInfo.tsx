import { Col, ProgressBar, Row } from 'react-bootstrap';
import { formatEth } from './utils/format';
import { percentage } from './utils/math';
import { PreSale, PreSaleState } from './api/presale';

interface EthInfoProps {
  preSale: PreSale;
  preSaleState: PreSaleState;
}

export default function EthInfo({ preSale, preSaleState }: EthInfoProps) {
  return <>
    <div className="mb-3">
      <Row>
        <Col>ETH collected:</Col>
        <Col className="text-end">{formatEth(preSaleState.totalPaid)} ETH</Col>
      </Row>
      <Row>
        <Col>Funding target:</Col>
        <Col className="text-end">{formatEth(preSale.successThreshold)} ETH</Col>
      </Row>
    </div>
    <div className="mb-3">
      <ProgressBar variant="success" className="border border-primary" now={percentage(preSaleState.totalPaid, preSale.successThreshold)} />
    </div>
  </>;
}
