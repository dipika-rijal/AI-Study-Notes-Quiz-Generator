import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [displayName, setDisplayName] = useState('');
  const [studyFocus, setStudyFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      setStudyFocus(user.studyFocus || '');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Pass the updated details up to parent/handler.
      // Firebase logic should be injected via onSave prop for clean separation.
      if (onSave) {
        await onSave({ displayName, studyFocus });
      }
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
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
            onClick={onClose}
            className="absolute inset-0 bg-[#0a0a0c]/60"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--theme-glass-border)] px-6 py-5">
              <h2 id="edit-profile-title" className="text-lg font-semibold text-[var(--theme-text-primary)] tracking-tight">Edit profile</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--theme-text-muted)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Avatar Edit */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--color-primary-500)] text-2xl font-bold text-white shadow-inner transition-transform group-hover:scale-105">
                    {displayName.slice(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <p className="text-xs font-medium text-[var(--color-primary-600)]">
                  Avatar upload is ready for profile storage integration
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Study focus</label>
                  <input type="text" value={studyFocus} onChange={(e) => setStudyFocus(e.target.value)} placeholder="e.g. Computer science" className="w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 text-sm text-[var(--theme-text-muted)] cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[var(--theme-text-muted)] ml-1">Email cannot be changed currently.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-500)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
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
