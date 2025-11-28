import { getLatestGuess } from '../api/guesses';

export interface GuessResult {
  isResolved: boolean;
  score?: number;
}

export async function checkGuessStatus(
  userId: string
): Promise<GuessResult | undefined> {
  try {
    const guess = await getLatestGuess(userId);
    if (!guess) return undefined;

    if (guess.checkTimestamp) {
      return {
        isResolved: true,
        score: guess.totalScore,
      };
    }

    return {
      isResolved: false,
    };
  } catch (error_) {
    console.error('Failed to check guess:', error_);
    return undefined;
  }
}

export function validateGuessResponse(
  checkDelaySeconds: number | undefined
): asserts checkDelaySeconds is number {
  if (!checkDelaySeconds) {
    throw new Error('Missing checkDelaySeconds from backend');
  }
}
