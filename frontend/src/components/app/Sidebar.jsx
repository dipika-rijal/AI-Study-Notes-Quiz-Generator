import { NavLink } from 'react-router-dom';
import { BookOpen, BrainCircuit, Clock3, Home, Layers3, LogOut, Sparkles } from 'lucide-react';

const navigation = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/notes', label: 'Notes', icon: BookOpen },
  { to: '/app/quiz', label: 'Quiz', icon: BrainCircuit },
  { to: '/app/history', label: 'History', icon: Clock3 },
];

export default function Sidebar({ user, logout }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col border-r border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] px-3 py-4 lg:flex">
      <NavLink to="/app" end className="mb-7 flex items-center gap-3 rounded-xl px-3 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--theme-glass-border)] bg-[var(--theme-bg-tertiary)] text-[var(--color-primary-600)]">
          <Layers3 size={17} strokeWidth={2.25} />
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.03em]">StudyGenAI</span>
      </NavLink>

      <nav className="flex-1 space-y-1" aria-label="Primary navigation">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">Workspace</p>
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] shadow-sm'
                : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)]'
            }`}
          >
            <Icon size={17} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}

        <p className="px-3 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-text-muted)]">Focus</p>
        <NavLink to="/app/focus" className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-primary-500)] text-white' : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)]'}`}>
          <Sparkles size={17} strokeWidth={1.8} />
          Focus mode
        </NavLink>
      </nav>

      <div className="space-y-1 border-t border-[var(--theme-glass-border)] pt-3">
        <NavLink to="/app/settings" className="flex items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--theme-surface-hover)]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-primary-500)] text-xs font-semibold text-white">{initials}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-[var(--theme-text-primary)]">{displayName}</span><span className="block truncate text-xs text-[var(--theme-text-muted)]">Personal workspace</span></span>
        </NavLink>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--theme-text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-400">
          <LogOut size={17} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
