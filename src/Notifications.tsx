import { useCallback, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

export interface Notification {
  type: 'danger' | 'success';
  title: JSX.Element;
  message: JSX.Element;
}

export interface ShowNotificationCallback {
  (notification: Notification): void;
}

interface NotificationsProps {
  children(showNotification: ShowNotificationCallback): JSX.Element;
}

export default function Notifications({ children }: NotificationsProps) {
  const [ notifications, setNotifications ] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Notification) => {
    setNotifications(notifications => [ notification, ...notifications ]);
  }, []);

  const hideNotification = useCallback((index: number) => {
    setNotifications(notifications => [ ...notifications.slice(0, index), ...notifications.slice(index+1) ]);
  }, []);

  return <>
    {children(showNotification)}
    <ToastContainer position="bottom-center" containerPosition="fixed">
      {notifications.map((notification, index) =>
        <Toast key={index} style={{ width: 'var(--bs-modal-width)', marginBottom: 'var(--bs-modal-margin)' }} onClose={() => hideNotification(index)}>
          <Toast.Header className={`bg-${notification.type}`}>
            <strong className="me-auto">{notification.title}</strong>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      )}
    </ToastContainer>
  </>;
}
