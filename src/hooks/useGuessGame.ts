import { useState, useEffect, useCallback } from 'react';
import { createGuess, getLatestGuess } from '../api/guesses';
import { validateGuessResponse } from '../utils/guesses';
import { useGuessScheduler } from './useGuessScheduler';

interface UseGuessGameOptions {
  userId: string;
  // Parameter name is for documentation only
  // eslint-disable-next-line no-unused-vars
  onScoreChange?: (score: number) => void;
}

export function useGuessGame({ userId, onScoreChange }: UseGuessGameOptions) {
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isGuessInProgress, setIsGuessInProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const updateScore = useCallback(
    (score: number) => {
      setTotalScore(score);
      onScoreChange?.(score);
    },
    [onScoreChange]
  );

  const { scheduleCheck, cleanup } = useGuessScheduler({
    userId,
    onResolved: updateScore,
    onTimeRemainingChange: setTimeRemaining,
    onGuessInProgressChange: setIsGuessInProgress,
  });

  // Check for existing guess on mount
  useEffect(() => {
    const checkExistingGuess = async () => {
      try {
        const guess = await getLatestGuess(userId);
        if (!guess) return;

        const initialScore = guess.totalScore || 0;
        updateScore(initialScore);

        if (guess.isGuessInProgress && !guess.checkTimestamp) {
          const guessTimestamp = Number(guess.timestamp);
          const checkDelaySeconds = guess.checkDelaySeconds;

          validateGuessResponse(checkDelaySeconds);

          setIsGuessInProgress(true);
          scheduleCheck(guessTimestamp, checkDelaySeconds);
        }
      } catch (error_) {
        console.error('Failed to check existing guess:', error_);
      }
    };

    checkExistingGuess();
  }, [userId, scheduleCheck, updateScore]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleGuess = useCallback(
    async (isVoteUp: boolean) => {
      if (isGuessInProgress || isLoading) return;

      setIsLoading(true);
      setError(undefined);

      try {
        const result = await createGuess(userId, isVoteUp);
        const newScore = result.totalScore || 0;
        updateScore(newScore);
        setIsGuessInProgress(true);

        const guessTimestamp = Number(result.timestamp);
        const checkDelaySeconds = result.checkDelaySeconds;

        validateGuessResponse(checkDelaySeconds);

        scheduleCheck(guessTimestamp, checkDelaySeconds);
      } catch (error_) {
        setError(
          error_ instanceof Error ? error_.message : 'Failed to create guess'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userId, isGuessInProgress, isLoading, scheduleCheck, updateScore]
  );

  return {
    totalScore,
    isGuessInProgress,
    timeRemaining,
    error,
    isLoading,
    handleGuess,
  };
}
