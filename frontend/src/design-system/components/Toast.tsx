import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { borderRadiusTokens, shadowTokens, animationPresets } from '../tokens';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: (id: string) => void;
}

const typeStyles = {
  success: {
    background: 'var(--color-success-bg)',
    border: '1px solid var(--color-success-border)',
    color: 'var(--color-success-text)',
    icon: '✓',
  },
  error: {
    background: 'var(--color-error-bg)',
    border: '1px solid var(--color-error-border)',
    color: 'var(--color-error-text)',
    icon: '✕',
  },
  warning: {
    background: 'var(--color-warning-bg)',
    border: '1px solid var(--color-warning-border)',
    color: 'var(--color-warning-text)',
    icon: '⚠',
  },
  info: {
    background: 'var(--color-info-bg)',
    border: '1px solid var(--color-info-border)',
    color: 'var(--color-info-text)',
    icon: 'ℹ',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(id), 300);
  };

  const toastStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: borderRadiusTokens.lg,
    boxShadow: shadowTokens.lg,
    minWidth: '300px',
    maxWidth: '400px',
    ...typeStyles[type],
  };

  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: borderRadiusTokens.full,
    fontSize: '14px',
    fontWeight: '900',
    flexShrink: 0,
  };

  const messageStyle = {
    flex: 1,
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '1.4',
  };

  const closeButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: borderRadiusTokens.sm,
    background: 'transparent',
    border: 'none',
    color: 'currentColor',
    fontSize: '18px',
    fontWeight: '900',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 150ms ease',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={toastStyle}
          initial={{ opacity: 0, x: 400, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.9 }}
          transition={{ duration: 300, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={iconStyle}>{typeStyles[type].icon}</span>
          <span style={messageStyle}>{message}</span>
          <button
            style={closeButtonStyle}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast container for managing multiple toasts
export const ToastContainer: React.FC<{
  toasts: ToastProps[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  const containerStyle = {
    position: 'fixed' as const,
    top: '24px',
    right: '24px',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    pointerEvents: 'none' as const,
  };

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
