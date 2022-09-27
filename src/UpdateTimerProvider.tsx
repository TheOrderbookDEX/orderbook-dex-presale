import { useEffect, useState } from 'react';
import { UpdateTimer } from './api/UpdateTimer';
import LoadingSpinner from './LoadingSpinner';

interface UpdateTimerProviderProps {
  children: (updateTimer: UpdateTimer) => JSX.Element;
}

export default function UpdateTimerProvider({ children }: UpdateTimerProviderProps): JSX.Element {
  const [ updateTimer, setUpdateTimer ] = useState<UpdateTimer>();

  useEffect(() => {
    const updateTimer = new UpdateTimer();
    setUpdateTimer(updateTimer);
    return () => updateTimer.abort();
  }, []);

  if (!updateTimer) {
    return <LoadingSpinner />;

  } else {
    return children(updateTimer);
  }
}
