import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function StudySessionCard({ 
  topic, 
  type = 'Notes', 
  progress = '100%', 
  date = 'Today', 
  status = 'Completed', 
  link = '#' 
}) {
  let statusColor = 'var(--theme-text-muted)';
  let statusDot = 'bg-gray-400';

  if (status === 'Completed') {
    statusColor = 'var(--color-success-text)';
    statusDot = 'bg-[var(--color-success-border)]';
  } else if (status === 'In progress') {
    statusColor = 'var(--color-info-text)';
    statusDot = 'bg-[var(--color-info-border)]';
  } else if (status === 'Needs review') {
    statusColor = 'var(--color-warning-text)';
    statusDot = 'bg-[var(--color-warning-border)]';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, backgroundColor: 'var(--theme-bg-tertiary)' }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[var(--theme-bg-secondary)] border border-[var(--theme-glass-border)] rounded-xl transition-all duration-300"
    >
      <div className="flex-1 min-w-0 mb-4 sm:mb-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            {type}
          </span>
          <span className="text-[var(--theme-text-muted)]">•</span>
          <span className="text-xs text-[var(--theme-text-muted)]">{date}</span>
        </div>
        <h4 className="text-lg font-medium text-[var(--theme-text-primary)] truncate">
          {topic}
        </h4>
        <div className="flex items-center gap-2 mt-2">
          <span className={`w-2 h-2 rounded-full ${statusDot}`}></span>
          <span className="text-sm font-medium" style={{ color: statusColor }}>{status} ({progress})</span>
        </div>
      </div>

      <Link
        to={link}
        className="shrink-0 px-5 py-2 rounded-lg bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-sm font-medium text-[var(--theme-text-primary)] hover:bg-[var(--color-primary-500)] hover:text-white hover:border-[var(--color-primary-600)] transition-colors duration-300"
      >
        Continue
      </Link>
    </motion.div>
  );
}
