import React from 'react';
import { motion } from 'framer-motion';
import { borderRadiusTokens, animationTokens } from '../tokens';

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles = {
  sm: { width: '20px', height: '20px' },
  md: { width: '32px', height: '32px' },
  lg: { width: '48px', height: '48px' },
};

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'var(--color-primary-500)',
  className = '',
  style,
}) => {
  const baseStyle = {
    ...sizeStyles[size],
    ...style,
  };

  if (variant === 'spinner') {
    return (
      <motion.div
        className={className}
        style={{
          ...baseStyle,
          border: `3px solid ${color}20`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={className} style={{ display: 'flex', gap: '4px', alignItems: 'center', ...style }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: size === 'sm' ? '6px' : size === 'md' ? '8px' : '12px',
              height: size === 'sm' ? '6px' : size === 'md' ? '8px' : '12px',
              borderRadius: '50%',
              backgroundColor: color,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={className}
        style={{
          ...baseStyle,
          borderRadius: borderRadiusTokens.full,
          backgroundColor: color,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  return null;
};

// Skeleton loader for content placeholders
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  variant = 'rect',
  className = '',
  style,
}) => {
  const baseStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor: 'var(--color-bg-tertiary)',
    borderRadius: variant === 'circle' ? '50%' : borderRadiusTokens.md,
    overflow: 'hidden',
    position: 'relative' as const,
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Full page loading overlay
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  const containerStyle = {
    position: 'fixed' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-bg-primary)',
    zIndex: 9999,
    gap: '24px',
  };

  const messageStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
  };

  return (
    <div style={containerStyle}>
      <Loading variant="spinner" size="lg" />
      <span style={messageStyle}>{message}</span>
    </div>
  );
};

// Inline loading for buttons and small areas
export const InlineLoading: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Loading variant="dots" size={size} />
      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>
        Loading...
      </span>
    </div>
  );
};
