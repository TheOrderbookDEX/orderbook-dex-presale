import { PropsWithChildren, useCallback } from 'react';
import { Modal } from 'react-bootstrap';

export default function ModalContainer({ children }: PropsWithChildren<{}>) {
  const close = useCallback(() => {
    window.parent.postMessage('close');
  }, []);

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton={window.parent !== window}>
        <Modal.Title>Pre-sale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
    </Modal>
  );
}
