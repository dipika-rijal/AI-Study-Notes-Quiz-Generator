import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { auth } from '../../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';

export default function DeleteAccountModal({ isOpen, onClose, user }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Reset form when modal opens/closes
  const handleClose = () => {
    setPassword('');
    setConfirmText('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }

    if (!user || !user.email) {
      setError('User information is missing.');
      return;
    }

    setIsLoading(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      
      // Re-authenticate user before deletion
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete account
      await deleteUser(auth.currentUser);
      
      // No need to close modal or set success state, 
      // the App.jsx auth listener will detect sign out and redirect to home.
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message || 'Failed to delete account. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.3 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-[#0a0a0c]/80"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-[var(--theme-bg-secondary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--theme-glass-border)] px-6 py-5 bg-red-500/5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                <h2 id="delete-account-title" className="text-lg font-semibold text-red-500 tracking-tight">Delete Account</h2>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-[var(--theme-text-muted)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                <p className="text-sm font-medium text-red-500">
                  Warning: This action is permanent and cannot be undone.
                </p>
                <p className="mt-2 text-xs text-red-400">
                  All your study plans, notes, quiz histories, and personal data will be permanently erased.
                </p>
              </div>

              {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Confirm by typing "DELETE MY ACCOUNT"</label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                    autoComplete="off"
                    data-1p-ignore
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Current Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password to verify"
                    className="w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-[var(--theme-glass-border)] bg-transparent px-4 py-3 text-sm font-semibold text-[var(--theme-text-primary)] hover:bg-[var(--theme-surface-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password || confirmText !== 'DELETE MY ACCOUNT'}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#dc2626] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#b91c1c] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
