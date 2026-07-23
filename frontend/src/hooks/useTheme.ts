import { useContext } from 'react';
import { AppThemeContext } from '../theme/ThemeProviders';

export const useTheme = () => {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  
  // Expose toggleTheme for backward compatibility in components
  return {
    ...context,
    toggleTheme: () => {
      context.setTheme(context.theme === 'dark' ? 'light' : 'dark');
    }
  };
};
