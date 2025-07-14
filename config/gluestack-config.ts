import { config as defaultConfig } from '@gluestack-ui/config';
import { createComponents } from '@gluestack-ui/themed';

// Enhanced theme config with vibrant Wolt-inspired colors
export const gluestackConfig = {
  ...defaultConfig,
  aliases: {
    ...defaultConfig.aliases,
    // RTL-aware aliases
    ps: 'paddingStart',
    pe: 'paddingEnd',
    ms: 'marginStart',
    me: 'marginEnd',
  },
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      // Vibrant Wolt-inspired brand colors
      primary50: '#eef7ff',
      primary100: '#d9edff',
      primary200: '#bce1ff',
      primary300: '#8ecfff',
      primary400: '#59b4ff',
      primary500: '#3396ff',
      primary600: '#1d78f5',
      primary700: '#1661e1',
      primary800: '#194fb6',
      primary900: '#1a458f',
      
      // Vibrant secondary palette
      secondary50: '#f0fdf4',
      secondary100: '#dcfce7',
      secondary200: '#bbf7d0',
      secondary300: '#86efac',
      secondary400: '#4ade80',
      secondary500: '#22c55e',
      secondary600: '#16a34a',
      secondary700: '#15803d',
      secondary800: '#166534',
      secondary900: '#14532d',
      
      // Enhanced status colors with more vibrancy
      success50: '#ecfdf5',
      success100: '#d1fae5',
      success200: '#a7f3d0',
      success300: '#6ee7b7',
      success400: '#34d399',
      success500: '#10b981',
      success600: '#059669',
      success700: '#047857',
      success800: '#065f46',
      success900: '#064e3b',
      
      warning50: '#fffbeb',
      warning100: '#fef3c7',
      warning200: '#fde68a',
      warning300: '#fcd34d',
      warning400: '#fbbf24',
      warning500: '#f59e0b',
      warning600: '#d97706',
      warning700: '#b45309',
      warning800: '#92400e',
      warning900: '#78350f',
      
      error50: '#fef2f2',
      error100: '#fee2e2',
      error200: '#fecaca',
      error300: '#fca5a5',
      error400: '#f87171',
      error500: '#ef4444',
      error600: '#dc2626',
      error700: '#b91c1c',
      error800: '#991b1b',
      error900: '#7f1d1d',
      
      // Enhanced background colors for better contrast
      backgroundLight0: '#ffffff',
      backgroundLight50: '#f8fafc',
      backgroundLight100: '#f1f5f9',
      backgroundLight200: '#e2e8f0',
      backgroundDark800: '#1e293b',
      backgroundDark900: '#0f172a',
      
      // Modern app backgrounds with subtle tints
      appBackground: '#fafbfc',
      appBackgroundGradient: 'linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%)',
      
      // Enhanced border colors
      borderLight100: '#f1f5f9',
      borderLight200: '#e2e8f0',
      borderLight300: '#cbd5e1',
      borderDark700: '#334155',
      borderDark800: '#1e293b',
    },
    space: {
      ...defaultConfig.tokens.space,
      // Your custom spacing
      'px': 1,
      '0': 0,
      '0.5': 2,
      '1': 4,
      '1.5': 6,
      '2': 8,
      '2.5': 10,
      '3': 12,
      '3.5': 14,
      '4': 16,
      '5': 20,
      '6': 24,
      '7': 28,
      '8': 32,
      '9': 36,
      '10': 40,
      '11': 44,
      '12': 48,
      '16': 64,
      '20': 80,
      '24': 96,
      '32': 128,
      '40': 160,
      '48': 192,
      '56': 224,
      '64': 256,
      '72': 288,
      '80': 320,
      '96': 384,
    },
    fontSizes: {
      ...defaultConfig.tokens.fontSizes,
      '2xs': 10,
      'xs': 12,
      'sm': 14,
      'md': 16,
      'lg': 18,
      'xl': 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    // Enhanced shadows for depth
    shadows: {
      ...defaultConfig.tokens.shadows,
      'card': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      'cardHover': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
      'hero': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
      },
    },
  },
  // Custom component variants
  components: {
    ...defaultConfig.components,
    Button: {
      ...defaultConfig.components?.Button,
      variants: {
        ...defaultConfig.components?.Button?.variants,
        vibrant: {
          bg: '$primary500',
          borderRadius: '$full',
          px: '$6',
          py: '$3',
          _text: {
            color: '$white',
            fontWeight: '$semibold',
          },
          _icon: {
            color: '$white',
          },
          _pressed: {
            bg: '$primary600',
            transform: [{ scale: 0.95 }],
          },
          _hover: {
            bg: '$primary400',
          },
          shadowColor: '$primary500',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        },
        gradient: {
          bg: 'linear-gradient(135deg, $primary500, $secondary500)',
          borderRadius: '$xl',
          px: '$6',
          py: '$4',
          _text: {
            color: '$white',
            fontWeight: '$bold',
          },
          _pressed: {
            transform: [{ scale: 0.98 }],
            opacity: 0.9,
          },
          shadowColor: '$primary500',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        },
      },
    },
    Heading: {
      ...defaultConfig.components?.Heading,
      variants: {
        ...defaultConfig.components?.Heading?.variants,
        hero: {
          fontSize: '$4xl',
          fontWeight: '$black',
          color: '$primary600',
          textAlign: 'left',
          lineHeight: '$4xl',
        },
        section: {
          fontSize: '$xl',
          fontWeight: '$bold',
          color: '$primary600',
          textAlign: 'left',
          mb: '$3',
        },
      },
    },
  },
};

// Helper function to get RTL-aware styles
export const getRTLStyle = (isRTL: boolean) => ({
  flexDirection: isRTL ? 'row-reverse' : 'row',
  textAlign: isRTL ? 'left' : 'left',
});