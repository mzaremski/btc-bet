import { useEffect, useState } from 'react';

export function useCountdown(
  initialSeconds: number | undefined
): number | undefined {
  const [seconds, setSeconds] = useState<number | undefined>(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds === undefined || seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds(previous => {
        if (previous === undefined || previous <= 1) {
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return seconds;
}
