import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

export function ThemeSelector() {
  const { theme, isDarkMode, toggleDarkMode, setSystemTheme } = useDarkMode();

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg bg-gray-100 dark:bg-dark-bg-secondary">
      <button
        onClick={() => theme !== 'light' && toggleDarkMode()}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white text-primary-600 shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-dark-hover'
        }`}
        title="Light Mode"
      >
        <Sun className="w-5 h-5" />
      </button>

      <button
        onClick={() => theme !== 'dark' && toggleDarkMode()}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-dark-bg-primary text-primary-400 shadow-dark'
            : 'text-gray-600 dark:text-gray-400 hover:bg-dark-hover'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-5 h-5" />
      </button>

      <button
        onClick={setSystemTheme}
        className={`p-2 rounded-md transition-all duration-200 ${
          !localStorage.getItem('theme')
            ? isDarkMode
              ? 'bg-dark-bg-primary text-primary-400 shadow-dark'
              : 'bg-white text-primary-600 shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-dark-hover'
        }`}
        title="System Theme"
      >
        <Monitor className="w-5 h-5" />
      </button>
    </div>
  );
}
