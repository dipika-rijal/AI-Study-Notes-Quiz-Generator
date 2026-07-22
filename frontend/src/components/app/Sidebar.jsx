import { NavLink } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

export default function Sidebar({ user, logout }) {
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || 'No email';

  const menuItems = [
    { to: '/app', label: 'Home', icon: '⌂', end: true },
    { to: '/app/notes', label: 'Notes', icon: '📝' },
    { to: '/app/quiz', label: 'Quiz', icon: '🎯' },
    { to: '/app/history', label: 'Memory', icon: '📚' },
  ];

  return (
    <aside
      style={{
        background: 'var(--theme-bg-secondary)',
        borderRight: '1px solid var(--theme-glass-border)',
        color: 'var(--theme-text-primary)',
      }}
      className="sticky top-0 flex h-screen w-[260px] flex-col px-4 py-6"
    >
      {/* Logo */}
      <NavLink to="/app" end className="mb-8 flex items-center gap-3 px-2 text-left group">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--theme-bg-tertiary)] border border-[var(--theme-glass-border)] text-[var(--color-primary-500)] shadow-sm group-hover:scale-105 transition-transform duration-300">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div className="text-xl font-bold tracking-tight text-[var(--theme-text-primary)]">
          StudyGen
        </div>
      </NavLink>

      {/* User Card */}
      <div
        style={{
          background: 'var(--theme-bg-tertiary)',
          border: '1px solid var(--theme-glass-border)',
        }}
        className="mb-8 rounded-xl p-3 shadow-sm hover:border-[var(--color-border-hover)] transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-primary-500)] text-sm font-semibold text-white shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--theme-text-primary)]">
              {displayName}
            </p>
            <p className="truncate text-xs text-[var(--theme-text-secondary)] mt-0.5">
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="space-y-1.5 flex-1">
        <div className="px-3 mb-2 text-xs font-medium tracking-wider text-[var(--theme-text-muted)] uppercase">
          Learning
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
                isActive ? 'active-nav-item' : 'inactive-nav-item'
              }`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'var(--theme-surface)'
                : 'transparent',
              color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
              border: isActive ? '1px solid var(--theme-glass-border)' : '1px solid transparent',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            })}
          >
            <span className="text-lg opacity-80">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="px-3 mt-8 mb-2 text-xs font-medium tracking-wider text-[var(--theme-text-muted)] uppercase">
          Deep Work
        </div>
        <NavLink
            to="/app/focus"
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-300`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'var(--color-primary-600)'
                : 'var(--color-primary-500)',
              color: 'white',
              boxShadow: isActive ? 'var(--theme-card-hover-shadow)' : 'var(--theme-card-shadow)',
            })}
          >
            <span className="text-lg opacity-90">🎧</span>
            Focus Mode
          </NavLink>
      </nav>

      {/* Theme Toggle */}
      <div
        style={{ borderTop: '1px solid var(--theme-glass-border)' }}
        className="pt-5 pb-3 flex items-center justify-between px-3 mt-6"
      >
        <span className="text-xs font-medium text-[var(--theme-text-secondary)]">
          Appearance
        </span>
        <ThemeToggle />
      </div>

      {/* Sign Out */}
      <div className="px-1 mb-2">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-300 text-[var(--theme-text-secondary)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error-text)]"
        >
          <span className="opacity-70 text-lg">⇱</span> Sign Out
        </button>
      </div>
    </aside>
  );
}