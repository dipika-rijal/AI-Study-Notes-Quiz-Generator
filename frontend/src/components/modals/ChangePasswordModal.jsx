import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../config/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ChangePasswordModal({ isOpen, onClose, user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Reset form when modal opens/closes
  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (!user || !user.email) {
      setError('User information is missing.');
      return;
    }

    setIsLoading(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate user before updating password
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect current password.');
      } else {
        setError(err.message || 'Failed to change password. Please try again.');
      }
    } finally {
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

  const inputClass = "w-full rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-primary)] px-4 py-3 pr-12 text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all";

  const toggleBtnClass = "absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors p-1";

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
            className="absolute inset-0 bg-[#0a0a0c]/60"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--theme-glass-border)] px-6 py-5">
              <h2 id="change-password-title" className="text-lg font-semibold text-[var(--theme-text-primary)] tracking-tight">Change Password</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-[var(--theme-text-muted)] hover:bg-[var(--theme-surface-hover)] hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              {success && <p role="alert" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">{success}</p>}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className={inputClass}
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className={toggleBtnClass}>
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className={inputClass}
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className={toggleBtnClass}>
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      className={inputClass}
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className={toggleBtnClass}>
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-500)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Key size={16} />
                      Update Password
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
