import React from 'react';
import { borderRadiusTokens } from '../tokens';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles = {
  sm: {
    padding: '2px 8px',
    fontSize: '11px',
    lineHeight: '1.2',
  },
  md: {
    padding: '4px 12px',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  lg: {
    padding: '6px 16px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

const variantStyles = {
  default: {
    background: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
  },
  primary: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#8b5cf6',
    border: '1px solid rgba(139, 92, 246, 0.3)',
  },
  secondary: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  success: {
    background: 'var(--color-success-bg)',
    color: 'var(--color-success-text)',
    border: '1px solid var(--color-success-border)',
  },
  error: {
    background: 'var(--color-error-bg)',
    color: 'var(--color-error-text)',
    border: '1px solid var(--color-error-border)',
  },
  warning: {
    background: 'var(--color-warning-bg)',
    color: 'var(--color-warning-text)',
    border: '1px solid var(--color-warning-border)',
  },
  info: {
    background: 'var(--color-info-bg)',
    color: 'var(--color-info-text)',
    border: '1px solid var(--color-info-border)',
  },
};

const dotSizeStyles = {
  sm: { width: '8px', height: '8px' },
  md: { width: '10px', height: '10px' },
  lg: { width: '12px', height: '12px' },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  style,
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadiusTokens.full,
    fontWeight: '700',
    letterSpacing: '0.025em',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  if (dot) {
    const dotStyle = {
      width: dotSizeStyles[size].width,
      height: dotSizeStyles[size].height,
      borderRadius: '50%',
      backgroundColor: variantStyles[variant].color,
      marginRight: '6px',
    };

    return (
      <span className={className} style={baseStyle}>
        <span style={dotStyle} />
        {children}
      </span>
    );
  }

  return (
    <span className={className} style={baseStyle}>
      {children}
    </span>
  );
};
