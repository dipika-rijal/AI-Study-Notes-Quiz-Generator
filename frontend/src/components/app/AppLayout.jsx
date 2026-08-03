import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import StreakWidget from './StreakWidget';
import { pageMotion } from '../../lib/motion';

export default function AppLayout({ user, logout }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  async function confirmSignOut() {
    setIsSignOutDialogOpen(false);
    await logout();
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)]">
      <div className="flex min-h-screen">
        <Sidebar user={user} logout={() => setIsSignOutDialogOpen(true)} mobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />
        <main className="relative min-h-screen min-w-0 flex-1 overflow-y-auto px-5 pb-5 pt-20 sm:px-8 lg:px-10 lg:py-8">
          <button type="button" onClick={() => setIsSidebarOpen((isOpen) => !isOpen)} aria-label="Toggle sidebar" aria-expanded={isSidebarOpen} style={{ top: 'max(1.25rem, env(safe-area-inset-top))', left: 'max(1.25rem, env(safe-area-inset-left))' }} className="fixed z-40 grid h-11 w-11 place-items-center rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] shadow-sm transition hover:bg-[var(--theme-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] sm:hidden"><Menu size={22} strokeWidth={2} /></button>
          
          {!/^\/(app\/(notes|quiz|tutor))/.test(location.pathname) && (
            <div className="absolute right-5 top-5 sm:right-8 sm:top-8 z-10 lg:z-50">
              <StreakWidget />
            </div>
          )}

          <div className="mx-auto h-full max-w-6xl mt-4 lg:mt-0">
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

      <AnimatePresence>
        {isSignOutDialogOpen && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSignOutDialogOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sign-out-dialog-title"
              className="w-full max-w-sm rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-500"><LogOut size={20} /></div>
              <h2 id="sign-out-dialog-title" className="mt-4 text-lg font-semibold text-[var(--theme-text-primary)]">Sign out?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--theme-text-secondary)]">Do you want to sign out of your StudyGenAI account?</p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSignOutDialogOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--theme-text-secondary)] transition hover:bg-[var(--theme-bg-tertiary)]">Cancel</button>
                <button type="button" onClick={confirmSignOut} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">Sign out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
