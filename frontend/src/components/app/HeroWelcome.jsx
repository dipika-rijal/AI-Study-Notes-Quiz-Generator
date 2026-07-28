import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function HeroWelcome({ user, streak = 0 }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 pb-4 min-h-[4.5rem]">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-[var(--theme-text-primary)]">
                {greeting}, <span className="text-[var(--color-primary-600)]">{displayName}</span>
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex text-xs font-medium text-[var(--theme-text-secondary)] ml-auto">
        <span className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-orange-600 dark:text-orange-400 shadow-sm">
          🔥 <strong className="text-[var(--theme-text-primary)]">{streak}</strong> day streak
        </span>
      </div>
    </div>
  );
}