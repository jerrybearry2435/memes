import type { Meme } from '../types';
import { MemeCard } from './MemeCard';
import styles from './MemeComparison.module.css';

interface MemeComparisonProps {
  currentMeme: Meme;
  comparisonMeme: Meme;
  showComparisonViewCount: boolean;
  isRevealing: boolean;
  revealResult: 'correct' | 'incorrect' | null;
  onGuessHigher: () => void;
  onGuessLower: () => void;
}

export function MemeComparison({
  currentMeme,
  comparisonMeme,
  showComparisonViewCount,
  isRevealing,
  revealResult,
  onGuessHigher,
  onGuessLower,
}: MemeComparisonProps) {
  return (
    <div className={styles.container}>
      <div className={styles.cardWrapper}>
        <MemeCard
          meme={currentMeme}
          showViewCount={true}
          isReference={true}
        />
      </div>

      <div className={styles.vsIndicator}>
        <span className={styles.vsText}>VS</span>
      </div>

      <div className={styles.cardWrapper}>
        <MemeCard
          meme={comparisonMeme}
          showViewCount={showComparisonViewCount}
          isReference={false}
          onGuessHigher={onGuessHigher}
          onGuessLower={onGuessLower}
          isRevealing={isRevealing}
          revealResult={revealResult}
        />
      </div>
    </div>
  );
}
