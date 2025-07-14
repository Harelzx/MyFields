import React from 'react';
import { StatusBar, StatusBarStyle } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeStatusBarProps {
  backgroundColor?: string;
  style?: StatusBarStyle;
}

export const ThemeStatusBar: React.FC<ThemeStatusBarProps> = ({ 
  backgroundColor, 
  style 
}) => {
  const { themeMode, theme } = useTheme();

  // Determine status bar style based on theme
  const statusBarStyle: StatusBarStyle = style || (themeMode === 'dark' ? 'light' : 'dark');
  
  // Use provided background color or theme default
  const bgColor = backgroundColor || theme.colors.background.primary;

  return (
    <StatusBar 
      style={statusBarStyle}
      backgroundColor={bgColor}
      translucent={false}
    />
  );
};