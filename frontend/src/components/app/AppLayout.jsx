import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout({ user, logout }) {
  return (
    <div style={{ background: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)', minHeight: '100vh' }}>
      <div className="flex min-h-screen">
        <Sidebar user={user} logout={logout} />
        <main className="min-h-screen flex-1 overflow-y-auto px-6 py-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
