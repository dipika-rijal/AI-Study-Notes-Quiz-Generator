/**
 * Design System Typography Scale
 * Consistent typography hierarchy
 */

export const typographyTokens = {
  // Font families
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },

  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Typography scale (combined)
  display: {
    fontSize: '60px',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-0.05em',
  },
  h1: {
    fontSize: '36px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
  },
  h2: {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  body: {
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '1.6',
    letterSpacing: '0',
  },
  bodyLarge: {
    fontSize: '18px',
    fontWeight: '500',
    lineHeight: '1.6',
    letterSpacing: '0',
  },
  bodySmall: {
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0',
  },
  caption: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0.025em',
  },
  label: {
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '0.025em',
  },
  button: {
    fontSize: '14px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '0.025em',
  },
};

// CSS custom properties for typography
export const typographyCSS = {
  '--font-family-sans': typographyTokens.fontFamily.sans,
  '--font-family-mono': typographyTokens.fontFamily.mono,
  
  '--font-size-xs': typographyTokens.fontSize.xs,
  '--font-size-sm': typographyTokens.fontSize.sm,
  '--font-size-base': typographyTokens.fontSize.base,
  '--font-size-lg': typographyTokens.fontSize.lg,
  '--font-size-xl': typographyTokens.fontSize.xl,
  '--font-size-2xl': typographyTokens.fontSize['2xl'],
  '--font-size-3xl': typographyTokens.fontSize['3xl'],
  '--font-size-4xl': typographyTokens.fontSize['4xl'],
  '--font-size-5xl': typographyTokens.fontSize['5xl'],
  '--font-size-6xl': typographyTokens.fontSize['6xl'],
  
  '--font-weight-normal': typographyTokens.fontWeight.normal,
  '--font-weight-medium': typographyTokens.fontWeight.medium,
  '--font-weight-semibold': typographyTokens.fontWeight.semibold,
  '--font-weight-bold': typographyTokens.fontWeight.bold,
  '--font-weight-extrabold': typographyTokens.fontWeight.extrabold,
  '--font-weight-black': typographyTokens.fontWeight.black,
  
  '--line-height-tight': typographyTokens.lineHeight.tight,
  '--line-height-normal': typographyTokens.lineHeight.normal,
  '--line-height-relaxed': typographyTokens.lineHeight.relaxed,
  '--line-height-loose': typographyTokens.lineHeight.loose,
  
  '--letter-spacing-tighter': typographyTokens.letterSpacing.tighter,
  '--letter-spacing-tight': typographyTokens.letterSpacing.tight,
  '--letter-spacing-normal': typographyTokens.letterSpacing.normal,
  '--letter-spacing-wide': typographyTokens.letterSpacing.wide,
  '--letter-spacing-wider': typographyTokens.letterSpacing.wider,
  '--letter-spacing-widest': typographyTokens.letterSpacing.widest,
};
