import { ThemeColors } from './types';

// ── DARK: proper dark theme ──
export const darkColors: ThemeColors = {
  bgPrimary:   '#0a0a0c',
  bgSecondary: '#151515',
  bgTertiary:  '#202020',
  textPrimary:   '#f4f4f2',
  textSecondary: '#a7a7a3',
  textMuted:     '#737370',
  surface:     'rgba(255, 255, 255, 0.045)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
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
  bgPrimary:   '#fafafa',
  bgSecondary: '#ffffff',
  bgTertiary:  '#f3f3f1',
  textPrimary:   '#191919',
  textSecondary: '#62625f',
  textMuted:     '#8b8b87',
  surface:     'rgba(0, 0, 0, 0.025)',
  glassBorder: 'rgba(0, 0, 0, 0.075)',
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
