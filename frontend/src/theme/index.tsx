import React, { createContext, useEffect, useState } from 'react';
import { ThemeMode, ThemeContextType } from './types';
import { darkColors, lightColors } from './colors';
import { generateAnimationCSS } from './animations';
import { generateComponentCSS } from './components';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('studygen-theme') as ThemeMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setThemeState('dark'); // Enforce dark as default on first load if preferred
    if (savedTheme === 'light') setThemeState('light');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('studygen-theme', theme);

    const colors = theme === 'dark' ? darkColors : lightColors;

    // Apply CSS Variables
    root.style.setProperty('--theme-bg-primary', colors.bgPrimary);
    root.style.setProperty('--theme-bg-secondary', colors.bgSecondary);
    root.style.setProperty('--theme-bg-tertiary', colors.bgTertiary);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-glass-border', colors.glassBorder);
    root.style.setProperty('--theme-glow-purple', colors.glowPurple);
    root.style.setProperty('--theme-glow-cyan', colors.glowCyan);
    root.style.setProperty('--theme-glow-pink', colors.glowPink);
    root.style.setProperty('--theme-glow-orange', colors.glowOrange);

    // Global transitions for smooth theme switching
    root.style.setProperty('transition', 'background-color 300ms ease, color 300ms ease, border-color 300ms ease');
  }, [theme, mounted]);

  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeState }}>
      <style dangerouslySetInnerHTML={{ __html: generateAnimationCSS() + generateComponentCSS() }} />
      {children}
    </ThemeContext.Provider>
  );
};

export * from './types';
export * from './colors';
export * from './animations';
export * from './typography';
export * from './spacing';
export * from './components';
