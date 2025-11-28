import { useState, useEffect } from 'react';
import './App.css';
import { getUserId } from './utils/user';
import { useBtcPrice } from './hooks/useBtcPrice';
import { GuessGame } from './components/GuessGame';
import { getLatestGuess } from './api/guesses';

function App() {
  const [userId] = useState(() => getUserId());
  const [totalScore, setTotalScore] = useState<number>(0);
  const btcPrice = useBtcPrice();

  // Load initial score
  useEffect(() => {
    const loadScore = async () => {
      try {
        const guess = await getLatestGuess(userId);
        if (guess) {
          setTotalScore(guess.totalScore || 0);
        }
      } catch (error_) {
        console.error('Failed to load score:', error_);
      }
    };
    loadScore();
  }, [userId]);

  return (
    <>
      <h1>BTC Bet</h1>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          <strong>Score: {totalScore}</strong>
        </div>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>
          BTC Price: {btcPrice ? `$${btcPrice.toLocaleString()}` : 'Loading...'}
        </div>
      </div>

      <GuessGame userId={userId} onScoreChange={setTotalScore} />
    </>
  );
}

export default App;
