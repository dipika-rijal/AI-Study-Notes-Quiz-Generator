import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BrainCircuit, CalendarDays, Clock3, GraduationCap, Home, Layers3, LogOut, Sparkles, X } from 'lucide-react';

const navigation = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/notes', label: 'Notes', icon: BookOpen },
  { to: '/app/quiz', label: 'Quiz', icon: BrainCircuit },
  { to: '/app/tutor', label: 'Tutor', icon: GraduationCap },
  { to: '/app/planner', label: 'AI Planner', icon: CalendarDays },
  { to: '/app/history', label: 'History', icon: Clock3 },
];

function SidebarContent({ user, logout, onNavigate, onClose }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.includes(' ')
    ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : displayName.slice(0, 2).toUpperCase();
  return <>
    <div className="mb-7 flex items-center justify-between">
      <NavLink to="/app" end onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-[var(--color-primary-600)]"><Layers3 size={17} strokeWidth={2.25} /></span>
        <span className="text-[15px] font-semibold tracking-[-0.03em]">StudyGenAI</span>
      </NavLink>
      {onClose && <button onClick={onClose} aria-label="Close sidebar" className="grid h-9 w-9 place-items-center rounded-lg text-[var(--theme-text-secondary)] transition hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]"><X size={19} strokeWidth={2} /></button>}
    </div>

    <nav className="flex-1 space-y-1" aria-label="Primary navigation">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">Workspace</p>
      {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] shadow-sm' : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)]'}`}><Icon size={17} strokeWidth={1.8} />{label}</NavLink>)}
      <p className="px-3 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">Focus</p>
      <NavLink to="/app/focus" onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] shadow-sm' : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)]'}`}><Sparkles size={17} strokeWidth={1.8} />Focus mode</NavLink>
    </nav>

    <div className="space-y-1 border-t border-[var(--theme-glass-border)] pt-3">
      <NavLink to="/app/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--theme-surface-hover)]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-primary-500)] text-xs font-semibold text-white">{initials}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-[var(--theme-text-primary)]">{displayName}</span>
          <span className="block truncate text-xs text-[var(--theme-text-muted)]">Personal workspace</span>
        </span>
      </NavLink>
      <motion.button whileTap={{ scale: 0.98 }} onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--theme-text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-400"><LogOut size={17} strokeWidth={1.8} />Sign out</motion.button>
    </div>
  </>;
}

export default function Sidebar({ user, logout, mobileOpen = false, onMobileClose }) {
  return <>
    <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-4 lg:flex"><SidebarContent user={user} logout={logout} /></motion.aside>
    <AnimatePresence>
      {mobileOpen && <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/45" onClick={onMobileClose} aria-hidden="true" />
        <motion.aside role="dialog" aria-modal="true" aria-label="Sidebar navigation" className="relative flex h-full w-[280px] flex-col border-r border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-4 shadow-2xl" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}><SidebarContent user={user} logout={logout} onNavigate={onMobileClose} onClose={onMobileClose} /></motion.aside>
      </motion.div>}
    </AnimatePresence>
  </>;
}
