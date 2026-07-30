import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HeroWelcome({ user, onDismiss }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="flex min-h-[4.5rem] flex-wrap items-start gap-3 pb-4 sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs font-semibold text-[var(--theme-text-secondary)]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-[var(--theme-text-primary)]">
          {greeting}, <span className="text-[var(--color-primary-600)]">{displayName}</span>
        </h1>
      </motion.div>
    </div>
  );
}
