import { useState } from 'react';
import { ChevronRight, Monitor, Palette, UserRound, Key, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { buttonTap, revealItem, staggerContainer } from '../lib/motion';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import DeleteAccountModal from '../components/modals/DeleteAccountModal';

function SettingRow({ icon: Icon, title, description, action, onClick, isDestructive }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 ${onClick ? 'cursor-pointer hover:bg-[var(--theme-bg-tertiary)] transition-colors' : ''}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--theme-bg-tertiary)] ${isDestructive ? 'text-red-500' : 'text-[var(--theme-text-secondary)]'}`}>
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${isDestructive ? 'text-red-500' : 'text-[var(--theme-text-primary)]'}`}>
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-[var(--theme-text-secondary)]">
          {description}
        </span>
      </span>
      {action || <ChevronRight size={17} className="text-[var(--theme-text-muted)]" />}
    </div>
  );
}

export default function Settings({ user, onEditProfile }) {
  const { theme, toggleTheme } = useTheme();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const name = user?.displayName || user?.email?.split('@')[0] || 'Student';
  
  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-3xl pb-12">
        <motion.header variants={revealItem} className="border-b border-[var(--theme-glass-border)] pb-6">
          <p className="text-sm font-medium text-[var(--theme-text-secondary)]">Workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--theme-text-primary)]">Settings</h1>
          <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">Manage the way StudyGenAI works for you.</p>
        </motion.header>
        
        <div className="mt-8 space-y-7">
          <motion.section variants={revealItem}>
            <h2 className="mb-3 text-sm font-semibold text-[var(--theme-text-primary)]">Profile</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)]">
              <SettingRow 
                icon={UserRound} 
                title={name} 
                description={user?.email || 'Personal learning profile'} 
                action={
                  <motion.button 
                    whileTap={buttonTap} 
                    type="button" 
                    onClick={onEditProfile} 
                    className="rounded-lg border border-[var(--theme-glass-border)] px-3 py-2 text-xs font-medium text-[var(--theme-text-primary)] transition hover:bg-[var(--theme-bg-tertiary)]"
                  >
                    Edit profile
                  </motion.button>
                } 
              />
            </div>
          </motion.section>
          
          <motion.section variants={revealItem}>
            <h2 className="mb-3 text-sm font-semibold text-[var(--theme-text-primary)]">Appearance</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)]">
              <SettingRow 
                icon={Palette} 
                title="Theme" 
                description={`Using ${theme} mode`} 
                action={
                  <motion.button 
                    whileTap={buttonTap} 
                    type="button" 
                    onClick={toggleTheme} 
                    className="rounded-lg border border-[var(--theme-glass-border)] px-3 py-2 text-xs font-medium capitalize text-[var(--theme-text-primary)] transition hover:bg-[var(--theme-bg-tertiary)]"
                  >
                    Switch to {theme === 'dark' ? 'light' : 'dark'}
                  </motion.button>
                } 
              />
              <div className="border-t border-[var(--theme-glass-border)]">
                <SettingRow 
                  icon={Monitor} 
                  title="System preference" 
                  description="Theme selection is saved to this device." 
                />
              </div>
            </div>
          </motion.section>
          
          <motion.section variants={revealItem}>
            <h2 className="mb-3 text-sm font-semibold text-[var(--theme-text-primary)]">Account</h2>
            <div className="overflow-hidden rounded-xl border border-[var(--theme-glass-border)] bg-[var(--theme-bg-secondary)]">
              <SettingRow 
                icon={Key} 
                title="Change password" 
                description="Update the password you sign in with"
                onClick={() => setIsPasswordModalOpen(true)}
              />
              <div className="border-t border-[var(--theme-glass-border)]">
                <SettingRow 
                  icon={Trash2} 
                  title="Delete account" 
                  description="Permanently remove your account and all study data"
                  isDestructive={true}
                  onClick={() => setIsDeleteModalOpen(true)}
                />
              </div>
            </div>
            <p className="mt-4 text-[11px] text-[var(--theme-text-muted)] text-center">
              Hover a row to see the highlight. Tap change password or delete account to see the modal open.
            </p>
          </motion.section>
        </div>
      </motion.div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        user={user} 
      />
      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        user={user} 
      />
    </>
  );
}
