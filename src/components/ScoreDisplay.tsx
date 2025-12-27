import type { ScoreDisplayProps } from '../types';
import styles from './ScoreDisplay.module.css';

export function ScoreDisplay({ currentStreak, highScore }: ScoreDisplayProps) {
  const isNewHighScore = currentStreak > 0 && currentStreak >= highScore;

  return (
    <div className={styles.container}>
      <div className={styles.scoreBox}>
        <span className={styles.label}>Score</span>
        <span className={`${styles.value} ${isNewHighScore ? styles.newHighScore : ''}`}>
          {currentStreak}
        </span>
      </div>

      <div className={styles.scoreBox}>
        <span className={styles.label}>High Score</span>
        <span className={styles.value}>{highScore}</span>
      </div>
    </div>
  );
}
