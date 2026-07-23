import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { pageMotion } from '../../lib/motion';

export default function AppLayout({ user, logout }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)]">
      <div className="flex min-h-screen">
        <Sidebar user={user} logout={logout} />
        <main className="min-h-screen min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
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
