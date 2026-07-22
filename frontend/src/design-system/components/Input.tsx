import React from 'react';
import { borderRadiusTokens, shadowTokens, transitions } from '../tokens';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: {
    padding: '8px 12px',
    fontSize: '13px',
    minHeight: '36px',
  },
  md: {
    padding: '12px 16px',
    fontSize: '14px',
    minHeight: '44px',
  },
  lg: {
    padding: '16px 20px',
    fontSize: '16px',
    minHeight: '52px',
  },
};

const variantStyles = {
  default: {
    background: 'var(--color-bg-tertiary)',
    border: '1px solid var(--color-border)',
  },
  filled: {
    background: 'var(--color-bg-secondary)',
    border: 'none',
  },
  outlined: {
    background: 'transparent',
    border: '2px solid var(--color-border)',
  },
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      variant = 'default',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);

    const inputWrapperStyle = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
      width: fullWidth ? '100%' : 'auto',
    };

    const inputContainerStyle = {
      display: 'flex',
      alignItems: 'center',
      position: 'relative' as const,
      width: '100%',
    };

    const baseVariantStyle = variantStyles[variant];
    const inputStyle = {
      flex: 1,
      borderRadius: borderRadiusTokens.md,
      border: error ? '1px solid var(--color-error-border)' : baseVariantStyle.border,
      outline: 'none',
      transition: transitions.colors,
      color: 'var(--color-text-primary)',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      ...sizeStyles[size],
      background: baseVariantStyle.background,
      paddingLeft: icon && iconPosition === 'left' ? '40px' : sizeStyles[size].padding,
      paddingRight: icon && iconPosition === 'right' ? '40px' : sizeStyles[size].padding,
      boxShadow: focused && !error ? shadowTokens.sm : 'none',
      borderColor: focused && !error ? 'var(--color-primary-500)' : undefined,
      ...style,
    };

    const iconStyle = {
      position: 'absolute' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: 'var(--color-text-muted)',
      pointerEvents: 'none' as const,
      left: iconPosition === 'left' ? '12px' : undefined,
      right: iconPosition === 'right' ? '12px' : undefined,
    };

    const labelStyle = {
      fontSize: '13px',
      fontWeight: '700',
      color: error ? 'var(--color-error-text)' : 'var(--color-text-primary)',
      letterSpacing: '0.025em',
    };

    const helperTextStyle = {
      fontSize: '12px',
      fontWeight: '500',
      color: error ? 'var(--color-error-text)' : 'var(--color-text-muted)',
    };

    return (
      <div className={className} style={inputWrapperStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={inputContainerStyle}>
          {icon && <span style={iconStyle}>{icon}</span>}
          <input
            ref={ref}
            style={inputStyle}
            disabled={disabled}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        {(error || helperText) && <span style={helperTextStyle}>{error || helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
