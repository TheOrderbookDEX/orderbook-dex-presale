import { Col, ProgressBar, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { PreSaleAccount } from './api/PreSaleAccount';
import { formatTokens } from './utils/format';
import { percentage } from './utils/math';

interface TokensClaimInfoProps {
  preSale: PreSale;
  preSaleAccount: PreSaleAccount;
}

export default function TokensClaimInfo({ preSale, preSaleAccount }: TokensClaimInfoProps) {
  return <>
    <div className="mb-2">
      <Row>
        <Col>Tokens claimed:</Col>
        <Col className="text-end">{formatTokens(preSaleAccount.amountClaimed)} OBD</Col>
      </Row>
    </div>
    <div className="mb-3">
      <ProgressBar variant="success" className="border border-primary" now={percentage(preSaleAccount.amountClaimed, preSaleAccount.amountBought)} />
    </div>
  </>;
}
