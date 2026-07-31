import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { borderRadiusTokens, shadowTokens, animationPresets } from '../tokens';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  tone?: 'default' | 'dark';
}

const sizeStyles = {
  sm: {
    maxWidth: '400px',
    width: '90%',
  },
  md: {
    maxWidth: '500px',
    width: '90%',
  },
  lg: {
    maxWidth: '700px',
    width: '90%',
  },
  xl: {
    maxWidth: '900px',
    width: '90%',
  },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  tone = 'default',
}) => {
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const overlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const modalStyle = {
    position: 'relative' as const,
    backgroundColor: tone === 'dark' ? '#121417' : 'var(--color-bg-secondary)',
    borderRadius: borderRadiusTokens.xl,
    boxShadow: shadowTokens['2xl'],
    border: tone === 'dark' ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid var(--color-border)',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column' as const,
    ...sizeStyles[size],
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.02em',
    margin: 0,
  };

  const closeButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: borderRadiusTokens.md,
    backgroundColor: tone === 'dark' ? '#20242a' : 'var(--color-bg-tertiary)',
    border: tone === 'dark' ? '1px solid rgba(255,255,255,0.10)' : '1px solid var(--color-border)',
    color: tone === 'dark' ? '#f4f4f5' : 'var(--color-text-secondary)',
    fontSize: '20px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    flexShrink: 0,
  };

  const contentStyle = {
    padding: tone === 'dark' ? '20px' : '24px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    flex: 1,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            style={overlayStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
          >
            <motion.div
              style={modalStyle}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showCloseButton) && (
                <div style={headerStyle}>
                  {title && <h2 style={titleStyle}>{title}</h2>}
                  {showCloseButton && (
                    <button
                      style={closeButtonStyle}
                      onClick={onClose}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
              <div style={contentStyle}>{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
