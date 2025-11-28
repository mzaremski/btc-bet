import { useGuessGame } from '../hooks/useGuessGame';
import { useCountdown } from '../hooks/useCountdown';

interface GuessGameProperties {
  userId: string;
  // Parameter name is for documentation only
  // eslint-disable-next-line no-unused-vars
  onScoreChange?: (score: number) => void;
}

export function GuessGame({ userId, onScoreChange }: GuessGameProperties) {
  const { isGuessInProgress, timeRemaining, error, isLoading, handleGuess } =
    useGuessGame({ userId, onScoreChange });

  const countdown = useCountdown(timeRemaining);

  return (
    <div className="card">
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
      )}

      {isGuessInProgress && countdown !== undefined && (
        <div style={{ marginBottom: '1rem', color: '#666' }}>
          Waiting for result... {countdown}s remaining
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => handleGuess(true)}
          disabled={isGuessInProgress || isLoading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: isGuessInProgress || isLoading ? 'not-allowed' : 'pointer',
            opacity: isGuessInProgress || isLoading ? 0.5 : 1,
          }}
        >
          UP
        </button>
        <button
          onClick={() => handleGuess(false)}
          disabled={isGuessInProgress || isLoading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            cursor: isGuessInProgress || isLoading ? 'not-allowed' : 'pointer',
            opacity: isGuessInProgress || isLoading ? 0.5 : 1,
          }}
        >
          DOWN
        </button>
      </div>
    </div>
  );
}
