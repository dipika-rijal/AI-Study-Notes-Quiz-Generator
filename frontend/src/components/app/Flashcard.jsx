import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Flashcard({ 
  frontContent, 
  backContent, 
  onSwipeRight, 
  onSwipeLeft 
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      if (onSwipeRight) onSwipeRight();
    } else if (offset < -100 || velocity < -500) {
      if (onSwipeLeft) onSwipeLeft();
    }
  };

  return (
    <div className="relative w-full max-w-lg h-80 mx-auto perspective-1000">
      <AnimatePresence>
        <motion.div
          className="w-full h-full cursor-grab active:cursor-grabbing relative preserve-3d"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-[var(--theme-bg-secondary)] border border-[var(--theme-glass-border)] rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-medium text-[var(--theme-text-primary)]">
              {frontContent}
            </h3>
            <p className="absolute bottom-4 text-xs text-[var(--theme-text-muted)] font-medium uppercase tracking-widest">
              Tap to flip
            </p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden w-full h-full bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-md"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="overflow-y-auto max-h-full scrollbar-thin">
              <p className="text-lg text-[var(--theme-text-primary)]">
                {backContent}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Keyboard Hint */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-between items-center text-xs font-medium text-[var(--theme-text-muted)] px-4">
        <span>← Need practice</span>
        <span>Swipe or use arrows</span>
        <span>Know it →</span>
      </div>
    </div>
  );
}
