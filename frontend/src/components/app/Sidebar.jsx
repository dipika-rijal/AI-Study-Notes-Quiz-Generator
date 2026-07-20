import { NavLink } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

export default function Sidebar({ user, logout }) {
  const displayName = user.displayName || user.email?.split('@')[0] || 'Student';
  const email = user.email || 'No email';

  const menuItems = [
    { to: '/app', label: 'Home', icon: '✦', end: true },
    { to: '/app/notes', label: 'Create Notes', icon: '📚' },
    { to: '/app/quiz', label: 'Create Quiz', icon: '🎯' },
    { to: '/app/history', label: 'History', icon: '📊' },
  ];

  return (
    <aside
      style={{
        background: 'var(--theme-bg-secondary)',
        borderRight: '1px solid var(--theme-glass-border)',
        color: 'var(--theme-text-primary)',
      }}
      className="sticky top-0 flex h-screen w-[250px] flex-col px-4 py-5"
    >
      {/* Logo */}
      <NavLink to="/app" end className="mb-6 flex items-center gap-3 text-left group">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
          ✦
        </div>
        <div className="text-lg font-black tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
          StudyGen <span className="text-purple-400">AI</span>
        </div>
      </NavLink>

      {/* User Card */}
      <div
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-glass-border)',
        }}
        className="mb-6 rounded-3xl p-4 hover:opacity-90 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 text-sm font-black text-white shadow-md shadow-purple-500/30 shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black" style={{ color: 'var(--theme-text-primary)' }}>
              {displayName}
            </p>
            <p className="truncate text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 ${
                isActive ? 'active-nav-item' : 'inactive-nav-item'
              }`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))'
                : 'transparent',
              color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
            })}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <div
        style={{ borderTop: '1px solid var(--theme-glass-border)' }}
        className="pt-4 pb-2 flex items-center justify-between px-2"
      >
        <span className="text-xs font-bold" style={{ color: 'var(--theme-text-muted)' }}>
          Theme
        </span>
        <ThemeToggle />
      </div>

      {/* Sign Out */}
      <div style={{ borderTop: '1px solid var(--theme-glass-border)' }} className="pt-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300"
          style={{ color: 'var(--theme-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--theme-text-secondary)';
          }}
        >
          ⇱ Sign Out
        </button>
      </div>
    </aside>
  );
}