import { useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { formatError } from './utils/error';

interface ErrorAlertProps {
  error: unknown;
  onClose?: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  const { title, message } = useMemo(() => formatError(error), [ error ]);

  return (
    <Alert className="mb-3" variant="danger" show={!!error} onClose={onClose} dismissible={!!onClose}>
      <Alert.Heading>{title}</Alert.Heading>
      <hr />
      {message}
    </Alert>
  );
}
