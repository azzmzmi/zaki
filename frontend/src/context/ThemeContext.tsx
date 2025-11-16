import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeApi } from '@/lib/api';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_size: string;
  border_radius: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  customTheme: ThemeSettings | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [customTheme, setCustomTheme] = useState<ThemeSettings | null>(null);

  // Load theme from localStorage and fetch custom theme settings
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setThemeState(savedTheme);
    
    // Fetch custom theme settings from backend
    fetchCustomTheme();
    setIsLoaded(true);
  }, []);

  // Fetch custom theme from backend
  const fetchCustomTheme = async () => {
    try {
      const response = await themeApi.get();
      if (response.data) {
        setCustomTheme(response.data);
        applyCustomTheme(response.data);
      }
    } catch (error) {
      // If theme fetch fails, use defaults
      console.log('Using default theme');
    }
  };

  // Apply custom theme colors to CSS variables
  const applyCustomTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Convert hex color to HSL
    const hexToHsl = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '221.2 83.2% 53.3%';
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    
    root.style.setProperty('--primary', hexToHsl(themeSettings.primary_color));
    root.style.setProperty('--secondary', hexToHsl(themeSettings.secondary_color));
    root.style.setProperty('--accent', hexToHsl(themeSettings.accent_color));
    
    // Apply font size
    const fontSizeMap: Record<string, string> = {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem'
    };
    root.style.setProperty('--font-size', fontSizeMap[themeSettings.font_size] || '1rem');
    
    // Apply border radius
    const borderRadiusMap: Record<string, string> = {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem'
    };
    root.style.setProperty('--radius', borderRadiusMap[themeSettings.border_radius] || '0.5rem');
  };

  // Apply theme
  useEffect(() => {
    if (!isLoaded) return;

    let effectiveTheme = theme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const isDarkTheme = effectiveTheme === 'dark';
    setIsDark(isDarkTheme);

    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme, isLoaded]);

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDark(mediaQuery.matches);
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, customTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
