/**
 * Design System Tokens
 * Central export for all design tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './border-radius';
export * from './shadows';
export * from './animations';

import { lightThemeCSS, darkThemeCSS } from './colors';
import { typographyCSS } from './typography';
import { spacingCSS } from './spacing';
import { borderRadiusCSS } from './border-radius';
import { shadowCSS, darkShadowCSS } from './shadows';
import { animationCSS } from './animations';

// Combined CSS variables for easy application
export const getThemeCSS = (isDark = false) => {
  const colors = isDark ? darkThemeCSS : lightThemeCSS;
  const shadows = isDark ? darkShadowCSS : shadowCSS;
  
  return {
    ...colors,
    ...typographyCSS,
    ...spacingCSS,
    ...borderRadiusCSS,
    ...shadows,
    ...animationCSS,
  };
};
