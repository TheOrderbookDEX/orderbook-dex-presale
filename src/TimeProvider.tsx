import { useEffect, useState } from 'react';

interface TimeProviderProps {
  children: (time: bigint) => JSX.Element;
}

export default function TimeProvider({ children }: TimeProviderProps): JSX.Element {
  const [ time, setTime ] = useState(now());

  useEffect(() => {
    setInterval(() => setTime(now()), 1000);
  }, []);

  return children(time);
}

function now() {
  return BigInt(Date.now()) / 1000n;
}
