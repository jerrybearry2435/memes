import type { GameOverModalProps } from '../types';
import styles from './GameOverModal.module.css';

export function GameOverModal({
  finalScore,
  highScore,
  isNewHighScore,
  onPlayAgain,
}: GameOverModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {isNewHighScore && (
          <div className={styles.newHighScoreBanner}>
            New High Score!
          </div>
        )}

        <h2 className={styles.title}>Game Over</h2>

        <div className={styles.scoreContainer}>
          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>Final Score</span>
            <span className={`${styles.scoreValue} ${isNewHighScore ? styles.highlight : ''}`}>
              {finalScore}
            </span>
          </div>

          <div className={styles.scoreBox}>
            <span className={styles.scoreLabel}>High Score</span>
            <span className={styles.scoreValue}>{highScore}</span>
          </div>
        </div>

        <p className={styles.message}>
          {finalScore === 0
            ? "Better luck next time!"
            : finalScore < 5
            ? "Good effort! Keep practicing!"
            : finalScore < 10
            ? "Nice streak! You know your memes!"
            : "Amazing! You're a meme expert!"}
        </p>

        <button className={styles.playAgainButton} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
}
