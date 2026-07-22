import { motion } from 'framer-motion';

export default function CircularTimer({ 
  progress = 0, 
  timeLeft = '25:00', 
  label = 'Focus Session' 
}) {
  const radius = 120;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 drop-shadow-xl"
      >
        {/* Background circle */}
        <circle
          stroke="var(--theme-bg-tertiary)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <motion.circle
          stroke="var(--color-primary-500)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'linear' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-light tracking-tight text-[var(--theme-text-primary)]">
          {timeLeft}
        </span>
        <span className="mt-2 text-sm font-medium tracking-wide text-[var(--theme-text-secondary)] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
