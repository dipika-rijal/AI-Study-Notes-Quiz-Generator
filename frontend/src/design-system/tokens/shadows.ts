/**
 * Design System Shadow System
 * Consistent elevation and depth
 */

export const shadowTokens = {
  // Base shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows (for brand elements)
  primary: {
    sm: '0 1px 2px 0 rgba(139, 92, 246, 0.1)',
    md: '0 4px 6px -1px rgba(139, 92, 246, 0.15)',
    lg: '0 10px 15px -3px rgba(139, 92, 246, 0.2)',
    xl: '0 20px 25px -5px rgba(139, 92, 246, 0.25)',
  },
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  innerSm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
};

// Dark mode shadows
export const darkShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
  
  // Colored shadows (dark mode)
  primary: {
    sm: '0 1px 2px 0 rgba(139, 92, 246, 0.2)',
    md: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
    lg: '0 10px 15px -3px rgba(139, 92, 246, 0.4)',
    xl: '0 20px 25px -5px rgba(139, 92, 246, 0.5)',
  },
  
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
  innerSm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
};

// CSS custom properties for shadows (light theme)
export const shadowCSS = {
  '--shadow-none': shadowTokens.none,
  '--shadow-sm': shadowTokens.sm,
  '--shadow-base': shadowTokens.base,
  '--shadow-md': shadowTokens.md,
  '--shadow-lg': shadowTokens.lg,
  '--shadow-xl': shadowTokens.xl,
  '--shadow-2xl': shadowTokens['2xl'],
  '--shadow-inner': shadowTokens.inner,
  '--shadow-inner-sm': shadowTokens.innerSm,
  
  '--shadow-primary-sm': shadowTokens.primary.sm,
  '--shadow-primary-md': shadowTokens.primary.md,
  '--shadow-primary-lg': shadowTokens.primary.lg,
  '--shadow-primary-xl': shadowTokens.primary.xl,
};

// CSS custom properties for shadows (dark theme)
export const darkShadowCSS = {
  '--shadow-none': darkShadowTokens.none,
  '--shadow-sm': darkShadowTokens.sm,
  '--shadow-base': darkShadowTokens.base,
  '--shadow-md': darkShadowTokens.md,
  '--shadow-lg': darkShadowTokens.lg,
  '--shadow-xl': darkShadowTokens.xl,
  '--shadow-2xl': darkShadowTokens['2xl'],
  '--shadow-inner': darkShadowTokens.inner,
  '--shadow-inner-sm': darkShadowTokens.innerSm,
  
  '--shadow-primary-sm': darkShadowTokens.primary.sm,
  '--shadow-primary-md': darkShadowTokens.primary.md,
  '--shadow-primary-lg': darkShadowTokens.primary.lg,
  '--shadow-primary-xl': darkShadowTokens.primary.xl,
};
