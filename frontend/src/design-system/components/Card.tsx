import React from 'react';
import { motion } from 'framer-motion';
import { borderRadiusTokens, shadowTokens, transitions } from '../tokens';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const paddingStyles = {
  none: { padding: '0' },
  sm: { padding: '16px' },
  md: { padding: '24px' },
  lg: { padding: '32px' },
};

const variantStyles = {
  default: {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    shadow: shadowTokens.base,
  },
  elevated: {
    background: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border)',
    shadow: shadowTokens.lg,
  },
  outlined: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    shadow: 'none',
  },
  flat: {
    background: 'var(--color-bg-tertiary)',
    border: 'none',
    shadow: 'none',
  },
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      style,
      onClick,
    },
    ref
  ) => {
    const baseStyle = {
      borderRadius: borderRadiusTokens.lg,
      transition: transitions.default,
      cursor: onClick ? 'pointer' : 'default',
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...style,
    };

    const cardVariants = {
      hover: hover
        ? {
            y: -4,
            boxShadow: shadowTokens.xl,
            borderColor: 'var(--color-border-hover)',
          }
        : {},
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        style={baseStyle}
        onClick={onClick}
        variants={cardVariants}
        whileHover={hover ? 'hover' : {}}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
