import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { simpleStorage } from '@utils/storage';
import { ThemeMode, createTheme, lightTheme, darkTheme } from '@constants/theme';

interface ThemeContextType {
  theme: typeof lightTheme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isSystemTheme: boolean;
  setSystemTheme: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@myfields_theme_mode';
const SYSTEM_THEME_STORAGE_KEY = '@myfields_system_theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preferences from storage
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedThemeMode = await simpleStorage.getItem(THEME_STORAGE_KEY);
        const savedSystemTheme = await simpleStorage.getItem(SYSTEM_THEME_STORAGE_KEY);
        
        const systemThemeEnabled = savedSystemTheme !== null ? JSON.parse(savedSystemTheme) : true;
        setIsSystemTheme(systemThemeEnabled);
        
        if (systemThemeEnabled) {
          // Use system theme
          setThemeMode(systemColorScheme === 'dark' ? 'dark' : 'light');
        } else {
          // Use saved theme or default to light
          setThemeMode((savedThemeMode as ThemeMode) || 'light');
        }
      } catch (error) {
        console.warn('Failed to load theme preferences:', error);
        setThemeMode('light');
        setIsSystemTheme(true);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreferences();
  }, []);

  // Update theme when system theme changes (if system theme is enabled)
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setThemeMode(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, isSystemTheme]);

  // Save theme mode to storage
  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await simpleStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error);
    }
  };

  // Save system theme preference to storage
  const saveSystemTheme = async (enabled: boolean) => {
    try {
      await simpleStorage.setItem(SYSTEM_THEME_STORAGE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save system theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setIsSystemTheme(false);
    saveThemeMode(newMode);
    saveSystemTheme(false);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsSystemTheme(false);
    saveThemeMode(mode);
    saveSystemTheme(false);
  };

  const handleSetSystemTheme = (enabled: boolean) => {
    setIsSystemTheme(enabled);
    saveSystemTheme(enabled);
    
    if (enabled && systemColorScheme) {
      const systemMode = systemColorScheme === 'dark' ? 'dark' : 'light';
      setThemeMode(systemMode);
      saveThemeMode(systemMode);
    }
  };

  const theme = createTheme(themeMode);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setTheme,
        isSystemTheme,
        setSystemTheme: handleSetSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Convenience hooks for specific theme values
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

export const useShadows = () => {
  const { theme } = useTheme();
  return theme.shadows;
};

export const useBorderRadius = () => {
  const { theme } = useTheme();
  return theme.borderRadius;
};