/**
 * Design System Color Tokens
 * Consistent color palette for light and dark themes
 */

export const colorTokens = {
  // Primary brand color
  primary: {
    50: '#f5f3ff',
    100: '#ede9fb',
    200: '#ddd4f5',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Secondary accent color (green for success states)
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Semantic colors
  success: {
    bg: 'rgba(52, 211, 153, 0.15)',
    text: '#059669',
    border: '#34d399',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#dc2626',
    border: '#f87171',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#d97706',
    border: '#fb923c',
  },
  info: {
    bg: 'rgba(14, 165, 233, 0.15)',
    text: '#0284c7',
    border: '#22d3ee',
  },

  // Neutral scale
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
};

export const darkColorTokens = {
  // Primary brand color (adjusted for dark mode)
  primary: {
    50: '#1a1a2e',
    100: '#252542',
    200: '#323260',
    300: '#404080',
    400: '#4f4fa0',
    500: '#5f5fc0',
    600: '#7070d0',
    700: '#8080e0',
    800: '#9090f0',
    900: '#a0a0ff',
  },

  // Secondary accent color (green for dark mode)
  secondary: {
    50: '#022c22',
    100: '#064e3b',
    200: '#065f46',
    300: '#047857',
    400: '#059669',
    500: '#10b981',
    600: '#34d399',
    700: '#6ee7b7',
    800: '#a7f3d0',
    900: '#d1fae5',
  },

  // Semantic colors (dark mode)
  success: {
    bg: 'rgba(52, 211, 153, 0.2)',
    text: '#34d399',
    border: '#059669',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.2)',
    text: '#f87171',
    border: '#dc2626',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.2)',
    text: '#fb923c',
    border: '#d97706',
  },
  info: {
    bg: 'rgba(14, 165, 233, 0.2)',
    text: '#22d3ee',
    border: '#0284c7',
  },

  // Neutral scale (dark mode)
  neutral: {
    50: '#fafafa',
    100: '#e5e5e5',
    200: '#d4d4d4',
    300: '#a3a3a3',
    400: '#737373',
    500: '#525252',
    600: '#404040',
    700: '#262626',
    800: '#171717',
    900: '#0a0a0a',
    950: '#050505',
  },
};

// CSS custom properties for light theme
export const lightThemeCSS = {
  '--color-primary-50': colorTokens.primary[50],
  '--color-primary-100': colorTokens.primary[100],
  '--color-primary-500': colorTokens.primary[500],
  '--color-primary-600': colorTokens.primary[600],
  '--color-primary-700': colorTokens.primary[700],
  
  '--color-secondary-500': colorTokens.secondary[500],
  '--color-secondary-600': colorTokens.secondary[600],
  
  '--color-success-bg': colorTokens.success.bg,
  '--color-success-text': colorTokens.success.text,
  '--color-success-border': colorTokens.success.border,
  
  '--color-error-bg': colorTokens.error.bg,
  '--color-error-text': colorTokens.error.text,
  '--color-error-border': colorTokens.error.border,
  
  '--color-warning-bg': colorTokens.warning.bg,
  '--color-warning-text': colorTokens.warning.text,
  '--color-warning-border': colorTokens.warning.border,
  
  '--color-info-bg': colorTokens.info.bg,
  '--color-info-text': colorTokens.info.text,
  '--color-info-border': colorTokens.info.border,
  
  '--color-bg-primary': '#f5f3ff',
  '--color-bg-secondary': '#ede9fb',
  '--color-bg-tertiary': '#e3dcf5',
  '--color-bg-surface': 'rgba(255, 255, 255, 0.80)',
  
  '--color-text-primary': '#1c1540',
  '--color-text-secondary': '#55497a',
  '--color-text-muted': '#8a82a8',
  
  '--color-border': 'rgba(109, 40, 217, 0.14)',
  '--color-border-hover': 'rgba(109, 40, 217, 0.25)',
};

// CSS custom properties for dark theme
export const darkThemeCSS = {
  '--color-primary-50': darkColorTokens.primary[50],
  '--color-primary-100': darkColorTokens.primary[100],
  '--color-primary-500': darkColorTokens.primary[500],
  '--color-primary-600': darkColorTokens.primary[600],
  '--color-primary-700': darkColorTokens.primary[700],
  
  '--color-secondary-500': darkColorTokens.secondary[500],
  '--color-secondary-600': darkColorTokens.secondary[600],
  
  '--color-success-bg': darkColorTokens.success.bg,
  '--color-success-text': darkColorTokens.success.text,
  '--color-success-border': darkColorTokens.success.border,
  
  '--color-error-bg': darkColorTokens.error.bg,
  '--color-error-text': darkColorTokens.error.text,
  '--color-error-border': darkColorTokens.error.border,
  
  '--color-warning-bg': darkColorTokens.warning.bg,
  '--color-warning-text': darkColorTokens.warning.text,
  '--color-warning-border': darkColorTokens.warning.border,
  
  '--color-info-bg': darkColorTokens.info.bg,
  '--color-info-text': darkColorTokens.info.text,
  '--color-info-border': darkColorTokens.info.border,
  
  '--color-bg-primary': '#212121',
  '--color-bg-secondary': '#171717',
  '--color-bg-tertiary': '#2f2f2f',
  '--color-bg-surface': 'rgba(255, 255, 255, 0.04)',
  
  '--color-text-primary': '#ececec',
  '--color-text-secondary': '#b4b4b4',
  '--color-text-muted': '#999999',
  
  '--color-border': 'rgba(255, 255, 255, 0.1)',
  '--color-border-hover': 'rgba(255, 255, 255, 0.2)',
};
