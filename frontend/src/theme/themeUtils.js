export const applyThemeVariables = (ref, themeTokens) => {
  if (!ref || !themeTokens) return;
  
  const root = ref;
  
  if (themeTokens.bgPrimary) root.style.setProperty('--theme-bg-primary', themeTokens.bgPrimary);
  if (themeTokens.bgSecondary) root.style.setProperty('--theme-bg-secondary', themeTokens.bgSecondary);
  if (themeTokens.bgTertiary) root.style.setProperty('--theme-bg-tertiary', themeTokens.bgTertiary);
  if (themeTokens.surface) root.style.setProperty('--theme-surface', themeTokens.surface);
  if (themeTokens.glassBorder) root.style.setProperty('--theme-glass-border', themeTokens.glassBorder);
  if (themeTokens.textPrimary) root.style.setProperty('--theme-text-primary', themeTokens.textPrimary);
  if (themeTokens.textSecondary) root.style.setProperty('--theme-text-secondary', themeTokens.textSecondary);
  if (themeTokens.textMuted) root.style.setProperty('--theme-text-muted', themeTokens.textMuted);
  if (themeTokens.glowPurple) root.style.setProperty('--theme-glow-purple', themeTokens.glowPurple);
  if (themeTokens.glowCyan) root.style.setProperty('--theme-glow-cyan', themeTokens.glowCyan);
  if (themeTokens.glowPink) root.style.setProperty('--theme-glow-pink', themeTokens.glowPink);
  if (themeTokens.glowOrange) root.style.setProperty('--theme-glow-orange', themeTokens.glowOrange);
};
