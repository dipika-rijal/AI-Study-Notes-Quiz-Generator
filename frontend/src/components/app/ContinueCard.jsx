import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ContinueCard({ 
  topic = 'Machine Learning', 
  subtopic = 'Logistic Regression', 
  completed = 12, 
  total = 20, 
  lastStudied = '2 hours ago', 
  link = '/app/quiz' 
}) {
  const progressPercent = Math.round((completed / total) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl bg-[var(--theme-bg-secondary)] border border-[var(--theme-glass-border)] p-8 shadow-[var(--theme-card-shadow)] hover:shadow-[var(--theme-card-hover-shadow)] transition-shadow duration-500"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Continue Studying</p>
            <h2 className="text-2xl font-semibold text-[var(--theme-text-primary)] tracking-tight">{topic}</h2>
            <h3 className="text-lg text-[var(--theme-text-secondary)]">{subtopic}</h3>
          </div>

          <div className="max-w-md space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-[var(--theme-text-secondary)]">Progress: {completed} / {total} flashcards completed</span>
              <span className="text-[var(--color-primary-600)]">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--theme-bg-tertiary)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-[var(--color-primary-500)] rounded-full"
              />
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] mt-1">Last studied: {lastStudied}</p>
          </div>
        </div>

        <Link
          to={link}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary-500)] px-8 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-primary-600)] transition-colors duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-500)]/20"
        >
          Continue Learning
        </Link>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[var(--color-primary-500)] opacity-[0.04] pointer-events-none blur-3xl"></div>
    </motion.div>
  );
}
