import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        <FiSun
          className={`absolute inset-0 w-5 h-5 text-warning-500 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
          }`}
        />
        <FiMoon
          className={`absolute inset-0 w-5 h-5 text-primary-600 dark:text-primary-400 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
