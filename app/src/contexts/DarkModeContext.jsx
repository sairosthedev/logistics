<<<<<<< Updated upstream
import React, { createContext, useContext, useState, useEffect } from 'react';
=======
import React, { createContext, useContext, useEffect, useState } from 'react';
>>>>>>> Stashed changes

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
<<<<<<< Updated upstream
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a dark mode preference saved
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    // Update HTML class and localStorage when darkMode changes
    if (darkMode) {
=======
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return saved === 'true' || prefersDark;
  });

  useEffect(() => {
    console.log('Dark mode:', isDarkMode);
    if (isDarkMode) {
>>>>>>> Stashed changes
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
<<<<<<< Updated upstream
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
=======
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
>>>>>>> Stashed changes
      {children}
    </DarkModeContext.Provider>
  );
}

<<<<<<< Updated upstream
export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
} 
=======
export const useDarkMode = () => useContext(DarkModeContext); 
>>>>>>> Stashed changes
