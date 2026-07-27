import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { pageMotion } from '../../lib/motion';

export default function AppLayout({ user, logout }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)]">
      <div className="flex min-h-screen">
        <Sidebar user={user} logout={logout} mobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
        <main className="relative min-h-screen min-w-0 flex-1 overflow-y-auto px-5 pb-5 pt-20 sm:px-8 lg:px-10 lg:py-8">
          <button type="button" onClick={() => setIsSidebarOpen((isOpen) => !isOpen)} aria-label="Toggle sidebar" aria-expanded={isSidebarOpen} className="absolute left-5 top-5 grid h-11 w-11 place-items-center rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] shadow-sm transition hover:bg-[var(--theme-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] sm:left-8 lg:hidden"><Menu size={22} strokeWidth={2} /></button>
          <div className="mx-auto h-full max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                {...pageMotion}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
