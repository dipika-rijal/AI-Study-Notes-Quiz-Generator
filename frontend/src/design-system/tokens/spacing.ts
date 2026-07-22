/**
 * Design System Spacing Scale
 * 4px base scale for consistent spacing
 */

export const spacingTokens = {
  // Base scale (4px increments)
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// Semantic spacing
export const semanticSpacing = {
  xs: spacingTokens[1],
  sm: spacingTokens[2],
  md: spacingTokens[3],
  lg: spacingTokens[4],
  xl: spacingTokens[6],
  '2xl': spacingTokens[8],
  '3xl': spacingTokens[12],
  '4xl': spacingTokens[16],
  '5xl': spacingTokens[20],
};

// CSS custom properties for spacing
export const spacingCSS = {
  '--spacing-0': spacingTokens[0],
  '--spacing-1': spacingTokens[1],
  '--spacing-2': spacingTokens[2],
  '--spacing-3': spacingTokens[3],
  '--spacing-4': spacingTokens[4],
  '--spacing-5': spacingTokens[5],
  '--spacing-6': spacingTokens[6],
  '--spacing-7': spacingTokens[7],
  '--spacing-8': spacingTokens[8],
  '--spacing-10': spacingTokens[10],
  '--spacing-12': spacingTokens[12],
  '--spacing-16': spacingTokens[16],
  '--spacing-20': spacingTokens[20],
  '--spacing-24': spacingTokens[24],
  '--spacing-32': spacingTokens[32],
  '--spacing-40': spacingTokens[40],
  '--spacing-48': spacingTokens[48],
  '--spacing-56': spacingTokens[56],
  '--spacing-64': spacingTokens[64],
  '--spacing-72': spacingTokens[72],
  '--spacing-80': spacingTokens[80],
  '--spacing-96': spacingTokens[96],
};
