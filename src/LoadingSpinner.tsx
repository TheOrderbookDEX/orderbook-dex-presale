import { Spinner } from 'react-bootstrap';

export default function LoadingSpinner() {
  return (
    <div className="my-3 text-center">
      <Spinner animation="border" />
    </div>
  );
}
