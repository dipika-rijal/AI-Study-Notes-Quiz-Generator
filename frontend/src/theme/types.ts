export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  surface: string;
  glassBorder: string;
  glowPurple: string;
  glowCyan: string;
  glowPink: string;
  glowOrange: string;
  semantic: {
    success: { bg: string; text: string };
    error: { bg: string; text: string };
    warning: { bg: string; text: string };
    info: { bg: string; text: string };
  };
}

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}
