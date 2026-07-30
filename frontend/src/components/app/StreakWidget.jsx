import { Flame } from 'lucide-react';
import { useStreak } from '../../hooks/useStreak';

export default function StreakWidget() {
  const { currentStreak, loading } = useStreak();

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-1.5 shadow-sm animate-pulse">
        <div className="h-4 w-4 rounded-full bg-[var(--theme-text-muted)] opacity-20" />
        <div className="h-4 w-6 rounded bg-[var(--theme-text-muted)] opacity-20" />
      </div>
    );
  }

  const hasStreak = currentStreak > 0;

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-1.5 shadow-sm transition hover:bg-[var(--theme-bg-tertiary)]"
      title="Daily Learning Streak"
    >
      <Flame
        size={18}
        className={hasStreak ? 'text-orange-500 animate-pulse' : 'text-[var(--theme-text-muted)]'}
        strokeWidth={hasStreak ? 2.5 : 2}
      />
      <span className="text-sm font-bold text-[var(--theme-text-primary)]">
        {currentStreak}
      </span>
    </div>
  );
}
