import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import { landingTheme } from './landingTheme';
import { appThemes, appAccents } from './appTheme';
import { applyThemeVariables } from './themeUtils';
import { getPreferences, updatePreferences } from '../api/preferenceApi';

// ==========================================
// LANDING THEME PROVIDER
// ==========================================
export const LandingThemeProvider = ({ children, noStyles = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      applyThemeVariables(containerRef.current, landingTheme);
      if (!noStyles) {
        containerRef.current.style.transition = 'background-color 300ms ease, color 300ms ease';
      }
    }
  }, [noStyles]);

  return (
    <div 
      ref={containerRef} 
      className="landing-theme-wrapper" 
      style={noStyles ? {} : { minHeight: '100vh', background: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }} 
      data-theme="light"
    >
      {children}
    </div>
  );
};

// ==========================================
// APP THEME PROVIDER
// ==========================================
export const AppThemeContext = createContext();

export const useAppTheme = () => useContext(AppThemeContext);

export const AppThemeProvider = ({ children, noStyles = false }) => {
  const containerRef = useRef(null);
  const [theme, setThemeState] = useState('dark');
  const [accent, setAccentState] = useState('purple');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = systemPrefersDark ? 'dark' : 'light';
    
    // 2. Load from API
    getPreferences()
      .then(prefs => {
        setThemeState(prefs.data.theme || initialTheme);
        setAccentState(prefs.data.accent || 'purple');
      })
      .catch(() => {
        // Fallback to local storage if offline or error
        const savedTheme = localStorage.getItem('studygen-app-theme');
        const savedAccent = localStorage.getItem('studygen-app-accent');
        setThemeState(savedTheme || initialTheme);
        setAccentState(savedAccent || 'purple');
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    // Apply combined tokens
    const modeTokens = appThemes[theme] || appThemes.dark;
    const accentTokens = appAccents[accent] || appAccents.purple;
    const combinedTokens = { ...modeTokens, ...accentTokens };

    applyThemeVariables(containerRef.current, combinedTokens);
    
    // Add transition AFTER initial load to prevent flashing
    requestAnimationFrame(() => {
      if (containerRef.current && !noStyles) {
         containerRef.current.style.transition = 'background-color 300ms ease, color 300ms ease, border-color 300ms ease';
      }
    });

  }, [theme, accent, isLoaded, noStyles]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('studygen-app-theme', newTheme);
    updatePreferences({ theme: newTheme, accent }).catch(console.error);
  };

  const setAccent = (newAccent) => {
    setAccentState(newAccent);
    localStorage.setItem('studygen-app-accent', newAccent);
    updatePreferences({ theme, accent: newAccent }).catch(console.error);
  };

  // Prevent flash: show nothing until preferences loaded
  if (!isLoaded) {
    return <div style={noStyles ? {} : { minHeight: '100vh', background: '#0a0a0c' }} />;
  }

  return (
    <AppThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      <div 
        ref={containerRef} 
        className="app-theme-wrapper" 
        data-theme={theme}
        style={noStyles ? {} : { minHeight: '100vh', background: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}
      >
        {children}
      </div>
    </AppThemeContext.Provider>
  );
};
