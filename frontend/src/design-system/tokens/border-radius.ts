/**
 * Design System Border Radius
 * 4-tier system for consistent rounded corners
 */

export const borderRadiusTokens = {
  // 4-tier system
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
};

// Semantic border radius
export const semanticBorderRadius = {
  button: borderRadiusTokens.md,
  input: borderRadiusTokens.md,
  card: borderRadiusTokens.lg,
  modal: borderRadiusTokens.xl,
  badge: borderRadiusTokens.full,
  pill: borderRadiusTokens.full,
 avatar: borderRadiusTokens.full,
};

// CSS custom properties for border radius
export const borderRadiusCSS = {
  '--radius-none': borderRadiusTokens.none,
  '--radius-sm': borderRadiusTokens.sm,
  '--radius-md': borderRadiusTokens.md,
  '--radius-lg': borderRadiusTokens.lg,
  '--radius-xl': borderRadiusTokens.xl,
  '--radius-2xl': borderRadiusTokens['2xl'],
  '--radius-full': borderRadiusTokens.full,
  
  '--radius-button': semanticBorderRadius.button,
  '--radius-input': semanticBorderRadius.input,
  '--radius-card': semanticBorderRadius.card,
  '--radius-modal': semanticBorderRadius.modal,
  '--radius-badge': semanticBorderRadius.badge,
  '--radius-pill': semanticBorderRadius.pill,
  '--radius-avatar': semanticBorderRadius.avatar,
};
