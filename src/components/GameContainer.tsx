import { useEffect } from 'react';
import type { Meme } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useHighScore } from '../hooks/useHighScore';
import { StartScreen } from './StartScreen';
import { MemeComparison } from './MemeComparison';
import { ScoreDisplay } from './ScoreDisplay';
import { GameOverModal } from './GameOverModal';
import styles from './GameContainer.module.css';

interface GameContainerProps {
  memes: Meme[];
}

export function GameContainer({ memes }: GameContainerProps) {
  const { highScore, updateHighScore } = useHighScore();
  const { state, startGame, guessHigher, guessLower, playAgain } = useGameState(memes, highScore);

  // Update high score when game ends
  useEffect(() => {
    if (state.phase === 'gameover') {
      updateHighScore(state.currentStreak);
    }
  }, [state.phase, state.currentStreak, updateHighScore]);

  const isNewHighScore = state.currentStreak > highScore;
  const showComparisonViewCount = state.phase === 'revealing' || state.lastGuessCorrect !== null;
  const revealResult = state.lastGuessCorrect === true
    ? 'correct'
    : state.lastGuessCorrect === false
    ? 'incorrect'
    : null;

  return (
    <div className={styles.container}>
      {state.phase === 'start' && (
        <StartScreen onStart={startGame} highScore={highScore} />
      )}

      {(state.phase === 'playing' || state.phase === 'revealing') &&
        state.currentMeme &&
        state.comparisonMeme && (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>Meme Higher or Lower</h1>
              <ScoreDisplay currentStreak={state.currentStreak} highScore={highScore} />
            </header>

            <main className={styles.main}>
              <MemeComparison
                currentMeme={state.currentMeme}
                comparisonMeme={state.comparisonMeme}
                showComparisonViewCount={showComparisonViewCount}
                isRevealing={state.phase === 'revealing'}
                revealResult={revealResult}
                onGuessHigher={guessHigher}
                onGuessLower={guessLower}
              />
            </main>

            <footer className={styles.footer}>
              <p className={styles.hint}>
                Does <strong>{state.comparisonMeme.name}</strong> have more or fewer page views than{' '}
                <strong>{state.currentMeme.name}</strong>?
              </p>
            </footer>
          </>
        )}

      {state.phase === 'gameover' && (
        <GameOverModal
          finalScore={state.currentStreak}
          highScore={Math.max(highScore, state.currentStreak)}
          isNewHighScore={isNewHighScore}
          onPlayAgain={playAgain}
        />
      )}
    </div>
  );
}
