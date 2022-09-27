import { Col, ProgressBar, Row } from 'react-bootstrap';
import { PreSale } from './api/PreSale';
import { formatTime, timePercentage } from './utils/time';

interface TimeInfoProps {
  time: bigint;
  preSale: PreSale;
}

export default function TimeInfo({ time, preSale }: TimeInfoProps) {
  if (time < preSale.startTime) {
    return <>
      <p>The pre-sale hasn't started yet.</p>
      <Row className="mb-3">
        <Col xs={8}>Time left until the pre-sale starts:</Col>
        <Col xs={4} className="text-end">{formatTime(preSale.startTime - time)}</Col>
      </Row>
    </>;

  } else if (time < preSale.earlyEndTime) {
    return <>
      <p>The pre-sale is on stage I.</p>
      <Row className="mb-2">
        <Col xs={8}>Time left until the end of stage I:</Col>
        <Col xs={4} className="text-end">{formatTime(preSale.earlyEndTime - time)}</Col>
      </Row>
      <ProgressBar className="mb-3 border border-primary" variant="success" now={timePercentage(time, preSale.startTime, preSale.earlyEndTime)} />
    </>;

  } else if (time < preSale.endTime) {
    return <>
      <p>The pre-sale is on stage II.</p>
      <Row className="mb-2">
        <Col xs={8}>Time left until the end of the pre-sale:</Col>
        <Col xs={4} className="text-end">{formatTime(preSale.endTime - time)}</Col>
      </Row>
      <ProgressBar className="mb-3 border border-primary" variant="success" now={timePercentage(time, preSale.earlyEndTime, preSale.endTime)} />
    </>;

  } else {
    return <>
      <p>The pre-sale has ended.</p>
    </>;
  }
}
