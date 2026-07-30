import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, BrainCircuit, FileText, MessageSquareText, Plus, Upload, Calendar } from 'lucide-react';
import ContinueCard from './ContinueCard';
import HeroWelcome from './HeroWelcome';
import { getHistory } from '../../api/historyApi';
import { buttonTap, cardHover, revealItem, staggerContainer } from '../../lib/motion';

const actions = [
  { label: 'Generate notes', description: 'Turn a topic or source into clear study notes.', icon: FileText, to: '/app/notes?type=topic' },
  { label: 'Ask Tutor', description: 'Get personalized help, explanations, and guidance.', icon: MessageSquareText, to: '/app/tutor' },
  { label: 'AI Planner', description: 'Plan your study schedule and stay on track.', icon: Calendar, to: '/app/planner' },
  { label: 'Create quiz', description: 'Build a focused practice set from any subject.', icon: BrainCircuit, to: '/app/quiz?type=topic' },
];

function formatRelativeTime(date) {
  const value = new Date(date).getTime();
  if (!Number.isFinite(value)) return 'recently';
  const seconds = Math.max(0, Math.floor((Date.now() - value) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function getItemLink(item) {
  if (item.type === 'note') return `/app/notes?savedNoteId=${item.id}`;
  if (item.historyKind === 'saved-quiz') return `/app/quiz?savedQuizId=${item.id}`;
  if (item.historyKind === 'quiz-attempt' && item.quizId) {
    return item.status === 'in_progress'
      ? `/app/quiz?savedQuizId=${item.quizId}&resumeAttemptId=${item.id}`
      : `/app/quiz?savedQuizId=${item.quizId}`;
  }
  return '/app/notes';
}

function formatActivity(item) {
  const type = String(item.type || 'learning item').toLowerCase();
  const kind = item.historyKind === 'quiz-attempt' ? 'Quiz attempt' : item.subtitle || type;
  return {
    ...item,
    type,
    title: item.title || 'Untitled learning item',
    meta: `${kind} · ${formatRelativeTime(item.updatedAt || item.createdAt)}`,
    link: getItemLink(item),
  };
}

export default function Home({ user }) {
  const [recent, setRecent] = useState([]);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getHistory().then((data) => {
      if (!isMounted) return;
      const items = Array.isArray(data?.items) ? data.items : [];
      const active = items.find((item) => item.historyKind === 'quiz-attempt' && item.status === 'in_progress' && item.quizId);
      setActiveAttempt(active || null);
      setRecent(items.slice(0, 3).map(formatActivity));
    }).catch(() => {
      if (isMounted) {
        setRecent([]);
        setActiveAttempt(null);
      }
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const completed = activeAttempt?.results?.filter((item) => item.selectedOptionIndex !== null && item.selectedOptionIndex !== undefined).length || 0;
  const total = activeAttempt?.questionCount || 0;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-5xl space-y-9 pb-12">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1, height: 'auto', marginBottom: 36 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <HeroWelcome user={user} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header variants={revealItem} className="flex flex-wrap items-end justify-between gap-4 pt-1">
        <div>
          <p className="text-sm font-medium text-[var(--theme-text-secondary)]">Your learning workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[var(--theme-text-primary)] sm:text-4xl">Pick up where you left off.</h1>
        </div>
        <motion.div whileTap={buttonTap}><Link to="/app/notes" className="inline-flex items-center gap-2 rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3.5 py-2.5 text-sm font-medium text-[var(--theme-text-primary)] transition hover:bg-[var(--theme-bg-tertiary)]"><Plus size={16} />New study session</Link></motion.div>
      </motion.header>

      <motion.section variants={revealItem} aria-labelledby="continue-learning">
        <div className="mb-3 flex items-center justify-between"><h2 id="continue-learning" className="text-sm font-semibold text-[var(--theme-text-primary)]">Continue learning</h2><span className="text-xs text-[var(--theme-text-muted)]">Your active journey</span></div>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)]" />
        ) : activeAttempt ? (
          <ContinueCard topic={activeAttempt.title || 'Untitled quiz'} subtopic="Saved quiz attempt" completed={completed} total={total} lastStudied={formatRelativeTime(activeAttempt.updatedAt || activeAttempt.createdAt)} link={getItemLink(activeAttempt)} actionLabel="Resume quiz" />
        ) : (
          <div className="flex flex-col gap-5 rounded-xl border border-dashed border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div><p className="text-base font-semibold text-[var(--theme-text-primary)]">No quiz in progress</p><p className="mt-1 text-sm text-[var(--theme-text-secondary)]">Create a quiz whenever you are ready to practise.</p></div>
            <Link to="/app/quiz" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-500)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"><Plus size={16} />Create quiz</Link>
          </div>
        )}
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
          {!isLoading && recent.length === 0 ? <div className="px-5 py-10 text-center"><p className="text-sm font-medium text-[var(--theme-text-primary)]">No learning activity yet</p><p className="mt-1 text-sm text-[var(--theme-text-secondary)]">Your notes, quizzes, and study sessions will appear here.</p></div> : recent.map((item, index) => <motion.div key={item.id || `${item.title}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 + index * 0.04 }}><Link to={item.link} className="group flex items-center gap-3 border-b border-[var(--theme-glass-border)] px-5 py-4 last:border-0 hover:bg-[var(--theme-surface-hover)]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)]">{item.type.includes('quiz') ? <BrainCircuit size={17} /> : item.type.includes('document') ? <Upload size={17} /> : <FileText size={17} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--theme-text-primary)]">{item.title}</span><span className="mt-0.5 block text-xs text-[var(--theme-text-muted)]">{item.meta}</span></span><ArrowUpRight size={16} className="text-[var(--theme-text-muted)] opacity-0 transition group-hover:opacity-100" /></Link></motion.div>)}
        </div>
      </motion.section>
    </motion.div>
  );
}
