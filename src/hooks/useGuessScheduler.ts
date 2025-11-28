import { useCallback, useRef } from 'react';
import { calculateCheckTime, calculateRemainingSeconds } from '../utils/time';
import { checkGuessStatus } from '../utils/guesses';

interface UseGuessSchedulerOptions {
  userId: string;
  onResolved: (score: number) => void;
  onTimeRemainingChange: (seconds: number | undefined) => void;
  onGuessInProgressChange: (inProgress: boolean) => void;
}

export function useGuessScheduler({
  userId,
  onResolved,
  onTimeRemainingChange,
  onGuessInProgressChange,
}: UseGuessSchedulerOptions) {
  const timeoutReference = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const scheduleCheck = useCallback(
    (guessTimestamp: number, checkDelaySeconds: number) => {
      // Clear any existing timeout
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }

      const checkTime = calculateCheckTime(guessTimestamp, checkDelaySeconds);
      const now = Date.now();
      const remainingSeconds = calculateRemainingSeconds(checkTime, now);

      // Update countdown timer
      onTimeRemainingChange(remainingSeconds);

      // Schedule the check for the exact time
      timeoutReference.current = setTimeout(
        async () => {
          const result = await checkGuessStatus(userId);
          if (result?.isResolved) {
            onResolved(result.score ?? 0);
            onGuessInProgressChange(false);
            onTimeRemainingChange();
          } else {
            // Still not resolved, check again after 1 second
            onTimeRemainingChange(0);
            const retryCheck = async () => {
              const retryResult = await checkGuessStatus(userId);
              if (retryResult?.isResolved) {
                onResolved(retryResult.score ?? 0);
                onGuessInProgressChange(false);
                onTimeRemainingChange();
              } else {
                timeoutReference.current = setTimeout(retryCheck, 1000);
              }
            };
            timeoutReference.current = setTimeout(retryCheck, 1000);
          }
        },
        Math.max(0, checkTime - now)
      );
    },
    [userId, onResolved, onTimeRemainingChange, onGuessInProgressChange]
  );

  const cleanup = useCallback(() => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }
  }, []);

  return { scheduleCheck, cleanup };
}
