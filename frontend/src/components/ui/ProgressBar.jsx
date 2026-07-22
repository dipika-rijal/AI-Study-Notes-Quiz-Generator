import { motion } from 'framer-motion';

export default function ProgressBar({ 
  current = 0, 
  total = 10, 
  label = 'Progress' 
}) {
  const progressPercent = Math.round((current / total) * 100) || 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-[var(--theme-text-secondary)]">{label} {current} / {total}</span>
        <span className="text-[var(--color-primary-600)]">{progressPercent}%</span>
      </div>
      <div className="h-2 w-full bg-[var(--theme-bg-tertiary)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full bg-[var(--color-primary-500)] rounded-full"
        />
      </div>
    </div>
  );
}
