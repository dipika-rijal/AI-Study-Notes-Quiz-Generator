import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Flashcard from "./Flashcard";

export default function FlashcardViewer({ data }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);

  const cards = data && Array.isArray(data.flashcards) ? data.flashcards : [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (cards.length === 0 || currentIndex >= cards.length) return;
      if (e.key === 'ArrowRight') {
        handleSwipeRight();
      } else if (e.key === 'ArrowLeft') {
        handleSwipeLeft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  if (cards.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning-text)] text-sm font-medium">
        No flashcards found in this response.
      </div>
    );
  }

  const isComplete = currentIndex >= cards.length;

  const handleSwipeRight = () => {
    setMasteredCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeLeft = () => {
    setPracticeCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setMasteredCount(0);
    setPracticeCount(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-6 md:p-10 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between border-b border-[var(--theme-glass-border)] pb-4 mb-8">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-[var(--theme-text-muted)]">
          Flashcards
        </h2>
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-[var(--color-success-text)]">Mastered: {masteredCount}</span>
          <span className="text-[var(--color-info-text)]">Remaining: {Math.max(0, cards.length - currentIndex)}</span>
        </div>
      </div>

      <div className="relative min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {!isComplete ? (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.3 } }}
              className="w-full"
            >
              <Flashcard 
                frontContent={cards[currentIndex].front}
                backContent={cards[currentIndex].back}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)] flex items-center justify-center text-[var(--color-success-text)] text-3xl">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[var(--theme-text-primary)]">Session Complete</h3>
                <p className="mt-2 text-[var(--theme-text-secondary)]">You've reviewed all flashcards.</p>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <div className="text-center p-4 rounded-xl bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] w-32">
                  <div className="text-2xl font-bold text-[var(--color-success-text)]">{masteredCount}</div>
                  <div className="text-xs text-[var(--theme-text-muted)] mt-1 uppercase tracking-wider">Mastered</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] w-32">
                  <div className="text-2xl font-bold text-[var(--color-warning-text)]">{practiceCount}</div>
                  <div className="text-xs text-[var(--theme-text-muted)] mt-1 uppercase tracking-wider">Need Practice</div>
                </div>
              </div>
              <button 
                onClick={resetSession}
                className="mt-8 px-8 py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] transition-colors shadow-sm"
              >
                Study Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add perspective utility CSS inside a style block since Tailwind perspective isn't standard in v4 without extensions */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
