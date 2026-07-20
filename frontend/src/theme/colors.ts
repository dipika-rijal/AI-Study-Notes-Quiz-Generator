import { ThemeColors } from './types';

// ── DARK: proper dark theme ──
export const darkColors: ThemeColors = {
  bgPrimary:   '#212121',   // ChatGPT Main
  bgSecondary: '#171717',   // ChatGPT Sidebar
  bgTertiary:  '#2f2f2f',   // ChatGPT Input/Cards
  textPrimary:   '#ececec',
  textSecondary: '#b4b4b4',
  textMuted:     '#999999',
  surface:     'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glowPurple:  '#10a37f',
  glowCyan:    '#10a37f',
  glowPink:    '#10a37f',
  glowOrange:  '#10a37f',
  semantic: {
    success: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399' },
    error:   { bg: 'rgba(239, 68, 68, 0.15)',  text: '#f87171' },
    warning: { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c' },
    info:    { bg: 'rgba(34, 211, 238, 0.15)', text: '#22d3ee' },
  },
};

// ── LIGHT: soft purple-tinted, not butter-yellow ──
export const lightColors: ThemeColors = {
  bgPrimary:   '#f5f3ff',
  bgSecondary: '#ede9fb',
  bgTertiary:  '#e3dcf5',
  textPrimary:   '#1c1540',
  textSecondary: '#55497a',
  textMuted:     '#8a82a8',
  surface:     'rgba(255, 255, 255, 0.80)',
  glassBorder: 'rgba(109, 40, 217, 0.14)',
  glowPurple:  '#6d28d9',
  glowCyan:    '#0891b2',
  glowPink:    '#db2777',
  glowOrange:  '#d97706',
  semantic: {
    success: { bg: 'rgba(52, 211, 153, 0.15)', text: '#059669' },
    error:   { bg: 'rgba(239, 68, 68, 0.15)',  text: '#dc2626' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' },
    info:    { bg: 'rgba(14, 165, 233, 0.15)', text: '#0284c7' },
  },
};
