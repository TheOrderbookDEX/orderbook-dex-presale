import { Col, ProgressBar, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { PreSaleAccount } from './api/PreSaleAccount';
import { formatEth, formatTokens } from './utils/format';
import { percentage } from './utils/math';

interface AccountInfoProps {
  preSale: PreSale;
  preSaleAccount: PreSaleAccount;
}

export default function AccountInfo({ preSale, preSaleAccount }: AccountInfoProps) {
  return <>
    <div className="mb-3">
      <Row>
        <Col>Tokens bought:</Col>
        <Col className="text-end">{formatTokens(preSaleAccount.amountBought)} OBD</Col>
      </Row>
      <Row>
        <Col>Buy limit per address:</Col>
        <Col className="text-end">{formatTokens(preSale.buyLimit)} OBD</Col>
      </Row>
      <Row>
        <Col>ETH paid:</Col>
        <Col className="text-end">{formatEth(preSaleAccount.amountPaid)} ETH</Col>
      </Row>
    </div>
    <div className="mb-3">
      <ProgressBar variant="success" className="border border-primary" now={percentage(preSaleAccount.amountBought, preSale.buyLimit)} />
    </div>
  </>;
}
