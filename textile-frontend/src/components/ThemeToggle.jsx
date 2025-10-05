import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? 'scale-0' : 'scale-100'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${isDark ? 'scale-100' : 'scale-0'}`} />
    </Button>
  );
};

export default ThemeToggle;