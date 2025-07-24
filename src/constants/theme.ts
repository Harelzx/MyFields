// Enhanced Design System Theme with Dark Mode Support
export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  // Spacing System (4px grid)
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
    massive: 48,
  },

  // Border Radius System
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Shadow System (iOS-style layered shadows)
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Wolt-inspired Color Palette
  colors: {
    // Primary Colors - Wolt Blue
    primary: {
      50: '#EFF6FF',
      100: '#E8F0FF', // primary-light
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2A66F9', // Main Wolt blue
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Secondary Colors - Updated for navigation
    secondary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#9CA3AF', // Inactive navigation color
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Success Colors - Updated to Wolt-style green
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981', // Wolt-style green
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },

    // Warning Colors
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },

    // Error Colors
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },

    // Info Colors
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Wolt Text Colors (Light Mode)
    text: {
      primary: '#111827',    // text-main (Headings and primary text)
      secondary: '#374151',
      tertiary: '#6B7280',  // text-muted (Secondary/subtext)
      disabled: '#9CA3AF',  // Navigation inactive
      inverse: '#FFFFFF',
      accent: '#2A66F9',    // Wolt blue
      onSurface: '#111827',
      onBackground: '#111827',
    },

    // Wolt Background Colors (Light Mode)
    background: {
      primary: '#FFFFFF',    // App page background
      secondary: '#F8FAFC',  // Section backgrounds
      tertiary: '#FFFFFF',   // Header background
      elevated: '#FFFFFF',   // Pure white cards
      card: '#F9FAFB',      // Card background
      surface: '#FFFFFF',   // Surface backgrounds
      overlay: 'rgba(0, 0, 0, 0.5)',
      modal: 'rgba(0, 0, 0, 0.6)',
    },

    // Wolt Border Colors (Light Mode)
    border: {
      light: '#E5E7EB',     // Light gray borders
      medium: '#D1D5DB',
      heavy: '#9CA3AF',
      accent: '#2A66F9',    // Wolt blue
      subtle: '#F1F5F9',
    },
  },

  // Wolt Typography Scale
  typography: {
    sizes: {
      xs: 12,           // Status chips, small text
      sm: 14,           // Subtext, secondary info
      md: 16,           // Body text
      lg: 18,           // Headings
      xl: 20,           // Large headings
      xxl: 24,          // Major headings
      xxxl: 32,
      huge: 40,
      massive: 48,
    },
    weights: {
      light: '300' as const,
      regular: '400' as const,   // Subtext
      medium: '500' as const,
      semibold: '600' as const,  // Button text
      bold: '700' as const,      // Headings
      extrabold: '800' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  // Animation Timing
  animations: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      verySlow: 700,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Component Specific Tokens
  components: {
    card: {
      padding: 16,
      borderRadius: 16,
      shadowLevel: 'sm',
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minHeight: 44,
    },
    input: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minHeight: 48,
    },
    modal: {
      borderRadius: 20,
      padding: 24,
      backdropOpacity: 0.6,
    },
  },
};

// Dark Theme Configuration
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    
    // Dark Mode Text Colors
    text: {
      primary: '#F9FAFB',    // Light text on dark background
      secondary: '#E5E7EB',
      tertiary: '#9CA3AF',   // Muted text in dark mode
      disabled: '#6B7280',   // Disabled text
      inverse: '#111827',    // Dark text (for light surfaces)
      accent: '#60A5FA',     // Lighter blue for dark mode
      onSurface: '#F9FAFB',
      onBackground: '#F9FAFB',
    },

    // Dark Mode Background Colors
    background: {
      primary: '#111827',    // Dark primary background
      secondary: '#1F2937',  // Section backgrounds
      tertiary: '#111827',   // Header background
      elevated: '#1F2937',   // Elevated surfaces
      card: '#1F2937',       // Card backgrounds
      surface: '#374151',    // Surface backgrounds
      overlay: 'rgba(0, 0, 0, 0.7)',
      modal: 'rgba(0, 0, 0, 0.8)',
    },

    // Dark Mode Border Colors
    border: {
      light: '#374151',      // Light borders in dark mode
      medium: '#4B5563',
      heavy: '#6B7280',
      accent: '#60A5FA',     // Lighter blue for dark mode
      subtle: '#1F2937',
    },
  },
};

// Theme Management
export const createTheme = (mode: ThemeMode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Default theme
export const designTokens = lightTheme;

// Additional UI-specific tokens for the new design
export const uiTokens = {
  // Navigation
  navigation: {
    height: 80,
    iconSize: 24,
    labelSize: 12,
    activeIndicatorHeight: 3,
  },
  
  // User Profile Dropdown
  dropdown: {
    width: 200,
    itemHeight: 44,
    borderRadius: 12,
    maxHeight: 180,
  },
  
  // Section Cards (Nearby Fields, Join Games)
  sectionCard: {
    height: 180,
    borderRadius: 16,
    itemWidth: 140,
    itemHeight: 120,
    itemSpacing: 12,
  },
  
  // Menu Grid
  menuGrid: {
    columns: 2,
    itemHeight: 100,
    itemSpacing: 16,
    borderRadius: 16,
  },
  
  // Touch Targets (Accessibility)
  touchTarget: {
    minimum: 44,
    recommended: 48,
  },
  
  // Animations
  transitions: {
    quick: 150,
    normal: 250,
    slow: 350,
    spring: {
      damping: 15,
      stiffness: 150,
    },
  },
};

// Hebrew RTL-specific styling helpers
export const rtlHelpers = {
  // Text alignment for RTL
  textAlign: 'right' as const,
  
  // Flex direction for RTL rows
  flexDirection: 'row-reverse' as const,
  
  // Margin helpers for RTL
  marginRight: (value: number) => ({ marginLeft: value }),
  marginLeft: (value: number) => ({ marginRight: value }),
  
  // Padding helpers for RTL
  paddingRight: (value: number) => ({ paddingLeft: value }),
  paddingLeft: (value: number) => ({ paddingRight: value }),
  
  // Positioning helpers for RTL
  right: (value: number) => ({ left: value }),
  left: (value: number) => ({ right: value }),
};

// Color accessibility helpers
export const colorHelpers = {
  // Get appropriate text color for backgrounds
  getTextColor: (mode: ThemeMode, variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    const theme = createTheme(mode);
    return theme.colors.text[variant];
  },
  
  // Get appropriate background color
  getBackgroundColor: (mode: ThemeMode, variant: 'primary' | 'secondary' | 'card' | 'surface' = 'primary') => {
    const theme = createTheme(mode);
    return theme.colors.background[variant];
  },
  
  // Get border color
  getBorderColor: (mode: ThemeMode, variant: 'light' | 'medium' | 'heavy' | 'accent' = 'light') => {
    const theme = createTheme(mode);
    return theme.colors.border[variant];
  },
};

// Export all themes for easy access
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
export const getSpacing = (size: keyof typeof designTokens.spacing) => 
  designTokens.spacing[size];

export const getBorderRadius = (size: keyof typeof designTokens.borderRadius) => 
  designTokens.borderRadius[size];

export const getShadow = (level: keyof typeof designTokens.shadows) => 
  designTokens.shadows[level];

export const getColor = (colorFamily: keyof typeof designTokens.colors, shade?: string) => {
  const family = designTokens.colors[colorFamily];
  if (typeof family === 'string') return family;
  return shade ? (family as any)[shade] : family;
};

export const getTypography = (property: keyof typeof designTokens.typography, value: string) => 
  (designTokens.typography[property] as any)[value];