/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('bloodconnect-theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bloodconnect-theme', theme);

    // Update CSS variables for dark mode
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--color-primary', '#ff6b6b');
      document.documentElement.style.setProperty('--color-primary-dark', '#dc2626');
      document.documentElement.style.setProperty('--color-dark', '#ffffff');
      document.documentElement.style.setProperty('--color-gray-900', '#f8fafc');
      document.documentElement.style.setProperty('--color-gray-800', '#f1f5f9');
      document.documentElement.style.setProperty('--color-gray-700', '#e2e8f0');
      document.documentElement.style.setProperty('--color-gray-600', '#cbd5e1');
      document.documentElement.style.setProperty('--color-gray-500', '#94a3b8');
      document.documentElement.style.setProperty('--color-gray-400', '#64748b');
      document.documentElement.style.setProperty('--color-gray-300', '#475569');
      document.documentElement.style.setProperty('--color-gray-200', '#334155');
      document.documentElement.style.setProperty('--color-gray-100', '#1e293b');
      document.documentElement.style.setProperty('--color-gray-50', '#0f172a');
    } else {
      // Reset to light theme
      document.documentElement.style.setProperty('--color-primary', '#e53935');
      document.documentElement.style.setProperty('--color-primary-dark', '#b71c1c');
      document.documentElement.style.setProperty('--color-dark', '#111111');
      document.documentElement.style.setProperty('--color-gray-50', '#f9fafb');
      document.documentElement.style.setProperty('--color-gray-100', '#f3f4f6');
      document.documentElement.style.setProperty('--color-gray-200', '#e5e7eb');
      document.documentElement.style.setProperty('--color-gray-300', '#d1d5db');
      document.documentElement.style.setProperty('--color-gray-400', '#9ca3af');
      document.documentElement.style.setProperty('--color-gray-500', '#6b7280');
      document.documentElement.style.setProperty('--color-gray-600', '#4b5563');
      document.documentElement.style.setProperty('--color-gray-700', '#374151');
      document.documentElement.style.setProperty('--color-gray-800', '#1f2937');
      document.documentElement.style.setProperty('--color-gray-900', '#111827');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
