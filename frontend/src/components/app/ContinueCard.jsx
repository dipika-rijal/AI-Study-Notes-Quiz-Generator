import { motion } from 'framer-motion';
import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContinueCard({ topic, subtopic, completed, total, lastStudied, link }) {
  const progress = Math.round((completed / total) * 100) || 0;
  return <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-6 shadow-sm sm:p-7">
    <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-primary-600)]">In progress</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--theme-text-primary)]">{topic}</h3><p className="mt-1 text-sm text-[var(--theme-text-secondary)]">{subtopic}</p><div className="mt-6"><div className="mb-2 flex justify-between gap-4 text-xs font-medium text-[var(--theme-text-secondary)]"><span>{completed} of {total} concepts completed</span><span className="text-[var(--theme-text-primary)]">{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[var(--theme-bg-tertiary)]"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className="h-full rounded-full bg-[var(--color-primary-500)]" /></div><p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)]"><Clock3 size={13} />Last active {lastStudied}</p></div></div>
      <Link to={link} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-500)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]">Continue <ArrowRight size={16} /></Link>
    </div>
  </motion.article>;
}
