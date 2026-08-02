import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import { landingTheme } from './landingTheme';
import { appThemes, appAccents } from './appTheme';
import { applyThemeVariables } from './themeUtils';
import { getPreferences, updatePreferences } from '../api/preferenceApi';
import { auth } from '../config/firebase';

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
  const [theme, setThemeState] = useState('light');
  const [accent, setAccentState] = useState('purple');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialTheme = 'light';
    
    // 2. Only fetch from API if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      // No user logged in — use localStorage fallback, skip API call entirely
      const savedAccent = localStorage.getItem('studygen-app-accent');
      setThemeState(initialTheme);
      setAccentState(savedAccent || 'purple');
      setIsLoaded(true);
      return;
    }

    getPreferences()
      .then(prefs => {
        setThemeState(prefs.data.theme || initialTheme);
        setAccentState(prefs.data.accent || 'purple');
      })
      .catch(() => {
        // Fallback to local storage if offline or error
        const savedAccent = localStorage.getItem('studygen-app-accent');
        setThemeState(initialTheme);
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
    if (noStyles) return null;
    return (
      <div className="grid min-h-screen place-items-center" style={{ background: 'var(--theme-bg-primary)' }}>
        <div className="surface-card px-8 py-6 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#05503e] text-white">
            ✦
          </div>
          <p className="font-black text-primary">Loading StudyGen AI...</p>
        </div>
      </div>
    );
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
