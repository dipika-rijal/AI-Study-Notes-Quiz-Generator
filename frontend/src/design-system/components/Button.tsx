import React from 'react';
import { motion } from 'framer-motion';
import { borderRadiusTokens, shadowTokens, transitions } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const sizeStyles = {
  sm: {
    padding: '8px 16px',
    fontSize: '13px',
    minHeight: '36px',
  },
  md: {
    padding: '12px 24px',
    fontSize: '14px',
    minHeight: '44px',
  },
  lg: {
    padding: '16px 32px',
    fontSize: '16px',
    minHeight: '52px',
  },
};

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#ffffff',
    border: 'none',
    shadow: shadowTokens.primary.md,
  },
  secondary: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#ffffff',
    border: 'none',
    shadow: shadowTokens.md,
  },
  outline: {
    background: 'transparent',
    color: '#8b5cf6',
    border: '1px solid #8b5cf6',
    shadow: 'none',
  },
  ghost: {
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    shadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ffffff',
    border: 'none',
    shadow: shadowTokens.md,
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      disabled,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: '800',
      borderRadius: borderRadiusTokens.md,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: transitions.transform,
      border: 'none',
      outline: 'none',
      width: fullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    const buttonVariants = {
      hover: { y: -2 },
      tap: { scale: 0.95 },
    };

    return (
      <motion.button
        ref={ref}
        className={className}
        style={baseStyle}
        disabled={disabled || loading}
        variants={buttonVariants}
        whileHover={disabled || loading ? {} : 'hover'}
        whileTap={disabled || loading ? {} : 'tap'}
        {...props}
      >
        {loading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block' }}
          >
            ⏳
          </motion.span>
        )}
        {!loading && icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span>{icon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
