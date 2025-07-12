// Enhanced Design System Theme
export const designTokens = {
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

    // Wolt Text Colors
    text: {
      primary: '#111827',    // text-main (Headings and primary text)
      secondary: '#374151',
      tertiary: '#6B7280',  // text-muted (Secondary/subtext)
      disabled: '#9CA3AF',  // Navigation inactive
      inverse: '#FFFFFF',
      accent: '#2A66F9',    // Wolt blue
    },

    // Wolt Background Colors
    background: {
      primary: '#FFFFFF',    // App page background
      secondary: '#FFFFFF',  // Same as primary for consistency
      tertiary: '#FFFFFF',   // Header background
      elevated: '#FFFFFF',   // Pure white cards
      card: '#F9FAFB',      // Card background
      overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Wolt Border Colors
    border: {
      light: '#E5E7EB',     // Light gray borders
      medium: '#D1D5DB',
      heavy: '#9CA3AF',
      accent: '#2A66F9',    // Wolt blue
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

// Helper functions for consistent usage
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