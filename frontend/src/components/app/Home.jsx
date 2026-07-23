import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BrainCircuit, FileText, MessageSquareText, Plus, Upload } from 'lucide-react';
import ContinueCard from './ContinueCard';
import { getRecentActivity } from '../../api/historyApi';
import { buttonTap, cardHover, revealItem, staggerContainer } from '../../lib/motion';

const actions = [
  { label: 'Generate notes', description: 'Turn a topic or source into clear study notes.', icon: FileText, to: '/app/notes?type=topic' },
  { label: 'Ask AI', description: 'Explore an idea, explain a concept, or plan your study.', icon: MessageSquareText, to: '/app/notes' },
  { label: 'Upload material', description: 'Read a PDF, text file, or Markdown document.', icon: Upload, to: '/app/notes?type=upload' },
  { label: 'Create quiz', description: 'Build a focused practice set from any subject.', icon: BrainCircuit, to: '/app/quiz?type=topic' },
];

const fallbackActivity = [
  { type: 'note', title: 'Machine Learning foundations', meta: 'Note · Updated today' },
  { type: 'quiz', title: 'Logistic Regression', meta: 'Quiz · 12 of 20 completed' },
  { type: 'document', title: 'Lecture 04 — Neural Networks.pdf', meta: 'Document · Added yesterday' },
];

function formatActivity(item) {
  const title = item.title || item.name || item.topic || 'Untitled learning item';
  const kind = item.type || item.category || 'Learning item';
  return { type: String(kind).toLowerCase(), title, meta: item.updatedAt ? `${kind} · Recently updated` : kind };
}

export default function Home() {
  const [recent, setRecent] = useState(fallbackActivity);

  useEffect(() => {
    getRecentActivity(3).then((data) => {
      const items = Array.isArray(data) ? data : data?.items || data?.history || [];
      if (items.length) setRecent(items.slice(0, 3).map(formatActivity));
    }).catch(() => {});
  }, []);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-5xl space-y-9 pb-12">
      <motion.header variants={revealItem} className="flex flex-wrap items-end justify-between gap-4 pt-1">
        <div>
          <p className="text-sm font-medium text-[var(--theme-text-secondary)]">Your learning workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--theme-text-primary)] sm:text-4xl">Pick up where you left off.</h1>
        </div>
        <motion.div whileTap={buttonTap}><Link to="/app/notes" className="inline-flex items-center gap-2 rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--theme-text-primary)] transition hover:bg-[var(--theme-bg-tertiary)]"><Plus size={16} />New study session</Link></motion.div>
      </motion.header>

      <motion.section variants={revealItem} aria-labelledby="continue-learning">
        <div className="mb-3 flex items-center justify-between"><h2 id="continue-learning" className="text-sm font-semibold text-[var(--theme-text-primary)]">Continue learning</h2><span className="text-xs text-[var(--theme-text-muted)]">Your active journey</span></div>
        <ContinueCard topic="Machine Learning" subtopic="Logistic Regression" completed={12} total={20} lastStudied="2 hours ago" link="/app/quiz" />
      </motion.section>

      <motion.section variants={revealItem} aria-labelledby="study-assistant">
        <div className="mb-3"><p className="text-sm font-semibold text-[var(--theme-text-primary)]" id="study-assistant">AI study assistant</p><p className="mt-1 text-sm text-[var(--theme-text-secondary)]">Start with the work you need to make progress today.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map(({ label, description, icon: Icon, to }, index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: 0.14 + index * 0.045 }} whileHover={cardHover} whileTap={buttonTap}>
              <Link to={to} className="group flex min-h-32 items-start gap-4 rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-5 shadow-sm transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--theme-bg-tertiary)]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--theme-bg-tertiary)] text-[var(--color-primary-600)]"><Icon size={19} strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2 text-sm font-semibold text-[var(--theme-text-primary)]">{label}<ArrowUpRight size={16} className="text-[var(--theme-text-muted)] transition group-hover:text-[var(--theme-text-primary)]" /></span><span className="mt-1.5 block text-sm leading-5 text-[var(--theme-text-secondary)]">{description}</span></span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={revealItem} aria-labelledby="recent-learning">
        <div className="mb-3 flex items-center justify-between"><h2 id="recent-learning" className="text-sm font-semibold text-[var(--theme-text-primary)]">Recent learning</h2><Link to="/app/history" className="text-sm font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]">View all</Link></div>
        <div className="overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)]">
          {recent.map((item, index) => <motion.div key={`${item.title}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 + index * 0.04 }}><Link to="/app/history" className="group flex items-center gap-3 border-b border-[var(--theme-glass-border)] px-5 py-4 last:border-0 hover:bg-[var(--theme-surface-hover)]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)]">{item.type.includes('quiz') ? <BrainCircuit size={17} /> : item.type.includes('document') ? <Upload size={17} /> : <FileText size={17} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--theme-text-primary)]">{item.title}</span><span className="mt-0.5 block text-xs text-[var(--theme-text-muted)]">{item.meta}</span></span><ArrowUpRight size={16} className="text-[var(--theme-text-muted)] opacity-0 transition group-hover:opacity-100" /></Link></motion.div>)}
        </div>
      </motion.section>
    </motion.div>
  );
}
